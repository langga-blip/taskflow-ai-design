// OpenAI Realtime Voice WebSocket Client & Audio Engine
// Real-time bidirectional streaming with 24kHz audio input/output, interruption handling, and Juniper-inspired warm upbeat female voice

import { createOpenAiRealtimeSessionApi } from '../services/api';

export type OpenAiVoiceState =
  | 'idle'
  | 'connecting'
  | 'ready'
  | 'listening'
  | 'speaking'
  | 'interrupted'
  | 'error'
  | 'closed';

export interface OpenAiVoiceCallbacks {
  onStateChange?: (state: OpenAiVoiceState) => void;
  onUserTranscript?: (accumulatedUserText: string, latestChunk: string) => void;
  onModelTranscript?: (accumulatedModelText: string, latestChunk: string) => void;
  onTurnComplete?: (userText: string, modelText: string) => void;
  onInputVolume?: (level: number) => void; // 0 to 100
  onOutputVolume?: (level: number) => void; // 0 to 100
  onError?: (errorMessage: string) => void;
}

/**
 * Resample Float32 audio to 24,000 Hz 16-bit linear PCM (Little-Endian) for OpenAI Realtime
 */
function resampleAndConvertToPcm24(audioBuffer: Float32Array, inputSampleRate: number): ArrayBuffer {
  const targetSampleRate = 24000;
  if (inputSampleRate === targetSampleRate) {
    const result = new Int16Array(audioBuffer.length);
    for (let i = 0; i < audioBuffer.length; i++) {
      const s = Math.max(-1, Math.min(1, audioBuffer[i]));
      result[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return result.buffer;
  }

  const sampleRateRatio = inputSampleRate / targetSampleRate;
  const newLength = Math.round(audioBuffer.length / sampleRateRatio);
  const result = new Int16Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < audioBuffer.length; i++) {
      accum += audioBuffer[i];
      count++;
    }
    const val = count > 0 ? accum / count : 0;
    const clamped = Math.max(-1, Math.min(1, val));
    result[offsetResult] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }

  return result.buffer;
}

/**
 * Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Convert Base64 16-bit PCM (24kHz, 1 channel, little-endian) into AudioBuffer safely
 * Handles odd byte lengths and byte offsets properly for all browser engines (including Android WebView / Chrome).
 */
function base64ToPcm24AudioBuffer(ctx: AudioContext, base64: string): AudioBuffer {
  const binary = window.atob(base64);
  const len = binary.length;
  // Ensure even byte length for 16-bit samples
  const sampleCount = Math.floor(len / 2);
  const audioBuffer = ctx.createBuffer(1, sampleCount, 24000);
  const channelData = audioBuffer.getChannelData(0);

  for (let i = 0; i < sampleCount; i++) {
    const byteIndex = i * 2;
    const low = binary.charCodeAt(byteIndex);
    const high = binary.charCodeAt(byteIndex + 1);
    // Signed 16-bit little endian integer
    let int16 = (high << 8) | low;
    if (int16 >= 0x8000) {
      int16 -= 0x10000;
    }
    channelData[i] = int16 / 32768.0;
  }
  return audioBuffer;
}

export class OpenAiVoiceSessionController {
  private ws: WebSocket | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;

  private activeAudioSources: AudioBufferSourceNode[] = [];
  private nextStartTime = 0;

  private state: OpenAiVoiceState = 'idle';
  private callbacks: OpenAiVoiceCallbacks = {};

  private accumulatedUserText = '';
  private accumulatedModelText = '';
  private isUserSpeaking = false;
  private isModelSpeaking = false;

  constructor(callbacks: OpenAiVoiceCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public getState(): OpenAiVoiceState {
    return this.state;
  }

  private setState(newState: OpenAiVoiceState) {
    this.state = newState;
    this.callbacks.onStateChange?.(newState);
  }

  /**
   * Start two-way OpenAI Realtime Voice session
   */
  public async start(): Promise<boolean> {
    if (this.state === 'connecting' || this.state === 'listening' || this.state === 'speaking') {
      return true;
    }

    this.setState('connecting');
    this.accumulatedUserText = '';
    this.accumulatedModelText = '';

    try {
      // 1. Securely request ephemeral session authentication from backend before opening audio/socket
      const sessionResult = await createOpenAiRealtimeSessionApi();
      if (!sessionResult.success) {
        const errorMsg = sessionResult.error || 'Failed to authenticate OpenAI Realtime voice session. Please ensure OPENAI_API_KEY is configured or use Gemini Live Voice.';
        console.warn('[OpenAI Voice Client] Session authentication failed:', errorMsg);
        this.setState('error');
        this.callbacks.onError?.(errorMsg);
        return false;
      }

      // 2. Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.mediaStream = stream;

      // 3. Initialize Output AudioContext for OpenAI speech output (with cross-browser fallback & resume)
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      try {
        this.outputAudioContext = new AudioCtx({ sampleRate: 24000 });
      } catch (e) {
        this.outputAudioContext = new AudioCtx();
      }
      if (this.outputAudioContext.state === 'suspended') {
        try {
          await this.outputAudioContext.resume();
        } catch (e) {}
      }

      // 4. Initialize Input AudioContext for mic capture
      this.inputAudioContext = new AudioCtx();
      if (this.inputAudioContext.state === 'suspended') {
        await this.inputAudioContext.resume();
      }

      // 5. Establish WebSocket connection to backend OpenAI voice bridge with sessionId parameter
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const sessionParam = sessionResult.sessionId ? `?sessionId=${encodeURIComponent(sessionResult.sessionId)}` : '';
      const wsUrl = `${protocol}//${window.location.host}/api/openai-voice-chat${sessionParam}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[OpenAI Voice Client] Connected to OpenAI Voice WebSocket bridge');
        this.setupMicProcessing();
      };

      this.ws.onmessage = (event) => {
        this.handleServerMessage(event.data);
      };

      this.ws.onerror = (err) => {
        if (this.state === 'closed' || this.state === 'idle') return;
        console.warn('[OpenAI Voice Client] WebSocket event notice:', err);
        if (this.state === 'connecting') {
          this.setState('error');
          this.callbacks.onError?.('Could not establish connection to OpenAI Voice server. Please check your network and API key.');
        }
      };

      this.ws.onclose = (event) => {
        console.log('[OpenAI Voice Client] WebSocket closed', event.code, event.reason);
        if (this.state !== 'closed' && this.state !== 'idle') {
          this.setState('closed');
        }
      };

      return true;
    } catch (err: any) {
      console.error('[OpenAI Voice Client] Failed to start Voice session:', err);
      this.setState('error');
      const errMessage =
        err?.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow microphone access to talk with OpenAI Voice.'
          : err?.message || 'Could not start OpenAI Voice session.';
      this.callbacks.onError?.(errMessage);
      this.stop();
      return false;
    }
  }

  /**
   * Capture and stream microphone audio
   */
  private setupMicProcessing() {
    if (!this.inputAudioContext || !this.mediaStream) return;

    try {
      this.mediaStreamSource = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
      // Process chunks of 4096 samples
      this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

      this.scriptProcessor.onaudioprocess = (e) => {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const inputChannelData = e.inputBuffer.getChannelData(0);

        // Compute volume level for real-time visualizer
        let sum = 0;
        for (let i = 0; i < inputChannelData.length; i++) {
          sum += inputChannelData[i] * inputChannelData[i];
        }
        const rms = Math.sqrt(sum / inputChannelData.length);
        const volumeLevel = Math.min(100, Math.round(rms * 400));
        this.callbacks.onInputVolume?.(volumeLevel);

        // Interruption detection: if user speaks with sufficient volume while AI is talking, interrupt playback
        if (volumeLevel > 18) {
          if (!this.isUserSpeaking) {
            this.isUserSpeaking = true;
          }
          if (this.isModelSpeaking) {
            this.stopAudioPlayback();
            this.setState('interrupted');
            try {
              this.ws.send(JSON.stringify({ type: 'interrupt' }));
            } catch (err) {}
          }
          if (this.state !== 'listening') {
            this.setState('listening');
          }
        } else {
          this.isUserSpeaking = false;
          if (this.state === 'listening' && !this.isModelSpeaking) {
            // Keep listening state active
          }
        }

        // Convert audio to 24kHz PCM16 for OpenAI Realtime
        const sampleRate = this.inputAudioContext?.sampleRate || 48000;
        const pcm16Buffer = resampleAndConvertToPcm24(inputChannelData, sampleRate);
        const base64Audio = arrayBufferToBase64(pcm16Buffer);

        try {
          this.ws.send(
            JSON.stringify({
              type: 'realtime_audio',
              data: base64Audio,
            })
          );
        } catch (sendErr) {
          // Socket closed during send
        }
      };

      this.mediaStreamSource.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.inputAudioContext.destination);
    } catch (err) {
      console.error('[OpenAI Voice Client] Error setting up mic processing:', err);
    }
  }

  /**
   * Handle incoming messages from backend OpenAI voice bridge
   */
  private handleServerMessage(rawData: any) {
    try {
      const msg = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

      switch (msg.type) {
        case 'session_ready':
          console.log('[OpenAI Voice Client] Session is active and ready');
          this.setState('ready');
          setTimeout(() => {
            if (this.state === 'ready') {
              this.setState('listening');
            }
          }, 300);
          break;

        case 'audio':
          if (msg.data) {
            this.isModelSpeaking = true;
            this.setState('speaking');
            this.playAudioChunk(msg.data);
          }
          break;

        case 'text':
          if (msg.role === 'user' && msg.text) {
            this.accumulatedUserText = (this.accumulatedUserText + ' ' + msg.text).trim();
            this.callbacks.onUserTranscript?.(this.accumulatedUserText, msg.text);
          } else if (msg.role === 'model' && msg.text) {
            this.accumulatedModelText = (this.accumulatedModelText + ' ' + msg.text).trim();
            this.callbacks.onModelTranscript?.(this.accumulatedModelText, msg.text);
          }
          break;

        case 'interrupted':
          this.stopAudioPlayback();
          this.setState('interrupted');
          break;

        case 'turn_complete':
          this.callbacks.onTurnComplete?.(this.accumulatedUserText, this.accumulatedModelText);
          this.accumulatedUserText = '';
          this.accumulatedModelText = '';
          this.isModelSpeaking = false;
          setTimeout(() => {
            if (this.state !== 'closed' && this.state !== 'error') {
              this.setState('listening');
            }
          }, 400);
          break;

        case 'error':
          // Graceful handling for missing key / engine redirection
          if (msg.message && (msg.message.includes('OpenAI API key') || msg.message.includes('OPENAI_API_KEY') || msg.message.includes('not configured'))) {
            console.info('[OpenAI Voice Client Notice]:', msg.message);
          } else {
            console.error('[OpenAI Voice Server Error]:', msg.message);
          }
          this.setState('error');
          this.callbacks.onError?.(msg.message || 'OpenAI Voice service error');
          break;

        case 'session_closed':
          this.setState('closed');
          break;
      }
    } catch (e) {
      console.error('[OpenAI Voice Client] Error parsing server message:', e);
    }
  }

  /**
   * Play queued 24kHz PCM audio chunk smoothly
   */
  private async playAudioChunk(base64Data: string) {
    if (!this.outputAudioContext) return;

    // Ensure AudioContext is running (crucial for Android/mobile WebAudio autoplay policy)
    if (this.outputAudioContext.state === 'suspended') {
      try {
        await this.outputAudioContext.resume();
      } catch (e) {}
    }

    try {
      const audioBuffer = base64ToPcm24AudioBuffer(this.outputAudioContext, base64Data);

      // Measure volume of outgoing speech for visualizer
      const channel = audioBuffer.getChannelData(0);
      let sum = 0;
      for (let i = 0; i < channel.length; i++) {
        sum += channel[i] * channel[i];
      }
      const rms = Math.sqrt(sum / channel.length);
      const outVol = Math.min(100, Math.round(rms * 350));
      this.callbacks.onOutputVolume?.(outVol);

      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAudioContext.destination);

      const now = this.outputAudioContext.currentTime;
      // If time drifted behind, resynchronize to current time
      if (this.nextStartTime < now) {
        this.nextStartTime = now;
      }
      const startTime = this.nextStartTime;
      source.start(startTime);
      this.nextStartTime = startTime + audioBuffer.duration;

      this.activeAudioSources.push(source);

      source.onended = () => {
        const idx = this.activeAudioSources.indexOf(source);
        if (idx > -1) {
          this.activeAudioSources.splice(idx, 1);
        }
        if (this.activeAudioSources.length === 0) {
          this.isModelSpeaking = false;
          this.callbacks.onOutputVolume?.(0);
          if (this.state === 'speaking') {
            this.setState('listening');
          }
        }
      };
    } catch (err) {
      console.error('[OpenAI Voice Client] Error playing audio chunk:', err);
    }
  }

  /**
   * Stop all active audio playback immediately upon interruption
   */
  private stopAudioPlayback() {
    for (const src of this.activeAudioSources) {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {}
    }
    this.activeAudioSources = [];
    if (this.outputAudioContext) {
      this.nextStartTime = this.outputAudioContext.currentTime;
    }
    this.isModelSpeaking = false;
    this.callbacks.onOutputVolume?.(0);
  }

  /**
   * Trigger user interruption
   */
  public interrupt() {
    this.stopAudioPlayback();
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: 'interrupt' }));
      } catch (e) {}
    }
    this.setState('listening');
  }

  /**
   * Send text prompt directly into the live conversation
   */
  public sendTextMessage(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.accumulatedUserText += (this.accumulatedUserText ? ' ' : '') + text;
      this.callbacks.onUserTranscript?.(this.accumulatedUserText, text);
    }
  }

  /**
   * Stop the session and clean up all audio nodes and sockets
   */
  public stop() {
    this.stopAudioPlayback();

    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.disconnect();
        this.scriptProcessor.onaudioprocess = null;
      } catch (e) {}
      this.scriptProcessor = null;
    }

    if (this.mediaStreamSource) {
      try {
        this.mediaStreamSource.disconnect();
      } catch (e) {}
      this.mediaStreamSource = null;
    }

    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach((t) => t.stop());
      } catch (e) {}
      this.mediaStream = null;
    }

    if (this.inputAudioContext) {
      try {
        this.inputAudioContext.close();
      } catch (e) {}
      this.inputAudioContext = null;
    }

    if (this.outputAudioContext) {
      try {
        this.outputAudioContext.close();
      } catch (e) {}
      this.outputAudioContext = null;
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }

    this.isUserSpeaking = false;
    this.isModelSpeaking = false;
    this.callbacks.onInputVolume?.(0);
    this.callbacks.onOutputVolume?.(0);
    this.setState('idle');
  }
}
