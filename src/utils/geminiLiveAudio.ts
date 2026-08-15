// Gemini Live API Audio & WebSocket Client
// Real-time two-way voice streaming with 16kHz input & 24kHz natural female voice output ('Aoede')

export type GeminiLiveState =
  | 'idle'
  | 'connecting'
  | 'ready'
  | 'listening'
  | 'speaking'
  | 'interrupted'
  | 'error'
  | 'closed';

export interface GeminiLiveCallbacks {
  onStateChange?: (state: GeminiLiveState) => void;
  onUserTranscript?: (accumulatedUserText: string, latestChunk: string) => void;
  onModelTranscript?: (accumulatedModelText: string, latestChunk: string) => void;
  onTurnComplete?: (userText: string, modelText: string) => void;
  onInputVolume?: (level: number) => void; // 0 to 100
  onOutputVolume?: (level: number) => void; // 0 to 100
  onError?: (errorMessage: string) => void;
}

/**
 * Resample Float32 audio to 16,000 Hz 16-bit linear PCM (Little-Endian)
 */
function resampleAndConvertToPcm16(audioBuffer: Float32Array, inputSampleRate: number): ArrayBuffer {
  const targetSampleRate = 16000;
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
 * Convert Base64 16-bit PCM (24kHz, 1 channel) into AudioBuffer
 */
function base64ToPcm24AudioBuffer(ctx: AudioContext, base64: string): AudioBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const audioBuffer = ctx.createBuffer(1, int16Array.length, 24000);
  const channelData = audioBuffer.getChannelData(0);
  for (let i = 0; i < int16Array.length; i++) {
    channelData[i] = int16Array[i] / 32768.0;
  }
  return audioBuffer;
}

export class GeminiLiveSessionController {
  private ws: WebSocket | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  
  private activeAudioSources: AudioBufferSourceNode[] = [];
  private nextStartTime = 0;
  
  private state: GeminiLiveState = 'idle';
  private callbacks: GeminiLiveCallbacks = {};
  
  private accumulatedUserText = '';
  private accumulatedModelText = '';
  private isUserSpeaking = false;
  private isModelSpeaking = false;

  constructor(callbacks: GeminiLiveCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public getState(): GeminiLiveState {
    return this.state;
  }

  private setState(newState: GeminiLiveState) {
    this.state = newState;
    this.callbacks.onStateChange?.(newState);
  }

  /**
   * Start two-way Gemini Live voice session
   */
  public async start(): Promise<boolean> {
    if (this.state === 'connecting' || this.state === 'listening' || this.state === 'speaking') {
      return true;
    }

    this.setState('connecting');
    this.accumulatedUserText = '';
    this.accumulatedModelText = '';

    try {
      // 1. Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.mediaStream = stream;

      // 2. Initialize Output AudioContext for 24kHz Gemini speech output
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.outputAudioContext = new AudioCtx({ sampleRate: 24000 });
      if (this.outputAudioContext.state === 'suspended') {
        await this.outputAudioContext.resume();
      }

      // 3. Initialize Input AudioContext for mic capture
      this.inputAudioContext = new AudioCtx();
      if (this.inputAudioContext.state === 'suspended') {
        await this.inputAudioContext.resume();
      }

      // 4. Establish WebSocket connection to backend live bridge
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live-chat`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[Gemini Live Client] Connected to Live WebSocket bridge');
        this.setupMicProcessing();
      };

      this.ws.onmessage = (event) => {
        this.handleServerMessage(event.data);
      };

      this.ws.onerror = (err) => {
        console.error('[Gemini Live Client] WebSocket error:', err);
        this.setState('error');
        this.callbacks.onError?.('Failed to connect to Gemini Live voice server.');
      };

      this.ws.onclose = () => {
        console.log('[Gemini Live Client] WebSocket closed');
        if (this.state !== 'closed') {
          this.setState('closed');
        }
      };

      return true;
    } catch (err: any) {
      console.error('[Gemini Live Client] Failed to start Live session:', err);
      this.setState('error');
      const errMessage =
        err?.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow microphone access to talk with Gemini Live.'
          : err?.message || 'Could not start Gemini Live session.';
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
      // Process chunks of 4096 samples (approx. 90-100ms)
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

        // Interruption detection: if user speaks with sufficient volume while Gemini is talking, interrupt playback
        if (volumeLevel > 18) {
          if (!this.isUserSpeaking) {
            this.isUserSpeaking = true;
          }
          if (this.isModelSpeaking) {
            // User interrupted Gemini!
            this.interrupt();
          }
        } else {
          this.isUserSpeaking = false;
        }

        // Resample and convert to 16kHz PCM 16-bit
        const pcm16Buffer = resampleAndConvertToPcm16(
          inputChannelData,
          this.inputAudioContext!.sampleRate
        );
        const base64Audio = arrayBufferToBase64(pcm16Buffer);

        // Send to backend Gemini Live session
        this.ws.send(
          JSON.stringify({
            type: 'realtime_audio',
            data: base64Audio,
          })
        );
      };

      this.mediaStreamSource.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.inputAudioContext.destination);

      this.setState('listening');
    } catch (err) {
      console.error('[Gemini Live Client] Error setting up mic processing:', err);
    }
  }

  /**
   * Handle incoming messages from Gemini Live server
   */
  private handleServerMessage(rawData: string) {
    try {
      const msg = JSON.parse(rawData);

      switch (msg.type) {
        case 'session_ready':
          this.setState('listening');
          break;

        case 'audio':
          if (msg.data) {
            this.playAudioChunk(msg.data);
          }
          break;

        case 'text':
          if (msg.role === 'model' && msg.text) {
            this.accumulatedModelText += (this.accumulatedModelText ? ' ' : '') + msg.text;
            this.callbacks.onModelTranscript?.(this.accumulatedModelText, msg.text);
          } else if (msg.role === 'user' && msg.text) {
            this.accumulatedUserText += (this.accumulatedUserText ? ' ' : '') + msg.text;
            this.callbacks.onUserTranscript?.(this.accumulatedUserText, msg.text);
          }
          break;

        case 'interrupted':
          console.log('[Gemini Live] Interruption received from server');
          this.stopAudioPlayback();
          this.setState('interrupted');
          setTimeout(() => {
            if (this.state === 'interrupted') {
              this.setState('listening');
            }
          }, 300);
          break;

        case 'turn_complete':
          if (this.accumulatedUserText || this.accumulatedModelText) {
            this.callbacks.onTurnComplete?.(
              this.accumulatedUserText.trim(),
              this.accumulatedModelText.trim()
            );
            this.accumulatedUserText = '';
            this.accumulatedModelText = '';
          }
          break;

        case 'error':
          console.error('[Gemini Live] Server error:', msg.message);
          this.callbacks.onError?.(msg.message || 'Gemini Live encountered an error.');
          break;

        case 'session_closed':
          this.setState('closed');
          break;
      }
    } catch (err) {
      console.error('[Gemini Live Client] Error processing message:', err);
    }
  }

  /**
   * Schedule gapless 24kHz audio playback
   */
  private playAudioChunk(base64Audio: string) {
    if (!this.outputAudioContext) return;

    try {
      if (this.outputAudioContext.state === 'suspended') {
        this.outputAudioContext.resume();
      }

      const audioBuffer = base64ToPcm24AudioBuffer(this.outputAudioContext, base64Audio);
      const now = this.outputAudioContext.currentTime;

      if (this.nextStartTime < now) {
        this.nextStartTime = now + 0.03; // small jitter buffer
      }

      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;

      // Connect to destination and analyzer for output volume
      source.connect(this.outputAudioContext.destination);
      source.start(this.nextStartTime);

      this.activeAudioSources.push(source);
      this.nextStartTime += audioBuffer.duration;

      this.isModelSpeaking = true;
      this.setState('speaking');

      // Estimate output speaking level for visualizer
      this.callbacks.onOutputVolume?.(75);

      source.onended = () => {
        const idx = this.activeAudioSources.indexOf(source);
        if (idx !== -1) {
          this.activeAudioSources.splice(idx, 1);
        }

        if (
          this.activeAudioSources.length === 0 &&
          this.outputAudioContext &&
          this.nextStartTime <= this.outputAudioContext.currentTime + 0.06
        ) {
          this.isModelSpeaking = false;
          this.callbacks.onOutputVolume?.(0);
          if (this.state === 'speaking') {
            this.setState('listening');
          }
        }
      };
    } catch (err) {
      console.error('[Gemini Live Client] Error playing audio chunk:', err);
    }
  }

  /**
   * Stop active audio playback immediately (interruption)
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
      this.ws.send(
        JSON.stringify({
          type: 'text_input',
          text,
        })
      );
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
