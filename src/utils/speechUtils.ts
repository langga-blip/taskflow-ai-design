// Speech & Audio Utilities for Task Flow AI
// Real-Time Speech Recognition & Task Flow AI Voice Synthesis

let activeSpeechUtterances: SpeechSynthesisUtterance[] = [];

/**
 * Stop any ongoing speech synthesis
 */
export const stopAllSpeech = () => {
  try {
    if (activeGeminiAudio) {
      activeGeminiAudio.pause();
      activeGeminiAudio = null;
    }
  } catch (e) {}
  try {
    const bridge = (window as any)?.AndroidBridge;
    if (bridge && typeof bridge.stopSpeaking === 'function') {
      bridge.stopSpeaking();
    }
  } catch (e) {}
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      activeSpeechUtterances = [];
    } catch (e) {}
  }
};

/**
 * Clean markdown and technical syntax for natural conversational speech
 */
export const cleanTextForSpeech = (text: string): string => {
  return text
    .replace(/[*#_`~]/g, '') // remove markdown symbols
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // preserve markdown link text
    .replace(/https?:\/\/\S+/g, '') // remove raw urls
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // remove emojis
    .replace(/\s+/g, ' ')
    .trim();
};


/** Convert base64 PCM L16 (mono) to a WAV data URL for HTMLAudioElement playback */
function pcm16Base64ToWavDataUrl(base64Pcm: string, sampleRate = 24000): string {
  const binary = atob(base64Pcm);
  const len = binary.length;
  const pcm = new Uint8Array(len);
  for (let i = 0; i < len; i++) pcm[i] = binary.charCodeAt(i);

  const buffer = new ArrayBuffer(44 + pcm.length);
  const view = new DataView(buffer);
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + pcm.length, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // pcm chunk size
  view.setUint16(20, 1, true); // linear PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits
  writeStr(36, 'data');
  view.setUint32(40, pcm.length, true);
  new Uint8Array(buffer, 44).set(pcm);

  let bin = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return 'data:audio/wav;base64,' + btoa(bin);
}

let activeGeminiAudio: HTMLAudioElement | null = null;

/**
 * Speak with Gemini TTS voice "Kore" (same family as Google AI Studio / Gemini Live).
 * Falls back to native Android TTS, then browser speechSynthesis.
 */
function getSpeechApiKey(): string {
  try {
    const fromLs =
      localStorage.getItem('taskflow_gemini_key') ||
      localStorage.getItem('tf_gemini_api_key') ||
      '';
    if (fromLs && fromLs !== 'placeholder') return fromLs.trim();
  } catch {
    /* ignore */
  }
  try {
    const bridge = (window as any)?.AndroidBridge;
    if (bridge && typeof bridge.getPref === 'function') {
      const fromNative = bridge.getPref('taskflow_gemini_key') || '';
      if (fromNative && fromNative !== 'placeholder') {
        try {
          localStorage.setItem('taskflow_gemini_key', fromNative);
          localStorage.setItem('tf_gemini_api_key', fromNative);
        } catch {
          /* ignore */
        }
        return fromNative.trim();
      }
    }
  } catch {
    /* ignore */
  }
  return '';
}

async function fetchKoreAudioUrl(apiKey: string, sentence: string): Promise<string | null> {
  const ttsModels = [
    'gemini-2.5-flash-preview-tts',
    'gemini-2.5-pro-preview-tts',
    'gemini-3.1-flash-tts-preview',
  ];
  for (const model of ttsModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: sentence }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
          },
        }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const inline = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      const b64 = inline?.data;
      const mime = String(inline?.mimeType || '');
      if (!b64) continue;
      if (mime.includes('L16') || mime.includes('pcm')) {
        const rateMatch = mime.match(/rate=(\d+)/);
        const rate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
        return pcm16Base64ToWavDataUrl(b64, rate);
      }
      if (mime.includes('audio/')) return `data:${mime};base64,${b64}`;
      return pcm16Base64ToWavDataUrl(b64, 24000);
    } catch (err) {
      console.warn('[Gemini TTS] error', model, err);
    }
  }
  return null;
}

function playAudioUrl(audioUrl: string, onStart?: () => void): Promise<void> {
  return new Promise((resolve) => {
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      activeGeminiAudio = null;
      resolve();
    };
    const audio = new Audio(audioUrl);
    activeGeminiAudio = audio;
    audio.onplay = () => {
      try {
        onStart?.();
      } catch (_) {}
    };
    audio.onended = done;
    audio.onerror = done;
    window.setTimeout(done, 120000);
    audio.play().catch(() => done());
  });
}

/**
 * Speak with Gemini TTS voice "Kore".
 * Sentence pipeline: fetch/play first sentence ASAP while preparing the next (lower delay).
 * Instant native TTS kicks in only if Kore is unavailable.
 */
export async function speakWithGeminiKoreVoice(
  text: string,
  options?: { onStart?: () => void; onEnd?: () => void }
): Promise<void> {
  const cleanText = cleanTextForSpeech(text || '');
  if (!cleanText) {
    options?.onEnd?.();
    return;
  }

  stopAllSpeech();
  const apiKey = getSpeechApiKey();
  if (!apiKey) {
    speakWithTaskFlowAiVoiceLegacy(cleanText, options);
    return;
  }

  // Split into short spoken chunks for faster time-to-first-audio
  const rawChunks =
    cleanText.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) || [cleanText];
  const chunks: string[] = [];
  for (const c of rawChunks) {
    if (c.length <= 180) chunks.push(c);
    else {
      // hard-split very long sentences
      for (let i = 0; i < c.length; i += 160) chunks.push(c.slice(i, i + 160));
    }
  }

  let started = false;
  try {
    // Prefetch first chunk immediately
    let nextUrlPromise = fetchKoreAudioUrl(apiKey, chunks[0]);
    for (let i = 0; i < chunks.length; i++) {
      const url = await nextUrlPromise;
      // Prefetch following chunk while current plays
      if (i + 1 < chunks.length) {
        nextUrlPromise = fetchKoreAudioUrl(apiKey, chunks[i + 1]);
      }
      if (!url) {
        // Kore failed for this chunk — finish remaining with native for continuity
        const rest = chunks.slice(i).join(' ');
        await new Promise<void>((resolve) => {
          speakWithTaskFlowAiVoiceLegacy(rest, {
            onStart: !started
              ? () => {
                  started = true;
                  options?.onStart?.();
                }
              : undefined,
            onEnd: () => resolve(),
          });
        });
        options?.onEnd?.();
        return;
      }
      await playAudioUrl(url, !started ? () => {
        started = true;
        options?.onStart?.();
      } : undefined);
    }
    options?.onEnd?.();
  } catch (err) {
    console.warn('[Gemini Kore pipeline]', err);
    if (!started) speakWithTaskFlowAiVoiceLegacy(cleanText, options);
    else options?.onEnd?.();
  }
}


/**
 * Speak using Task Flow AI voice styling (warm, articulate, expressive, natural cadence)
 */
const speakWithTaskFlowAiVoiceLegacy = (
  text: string,
  options?: { onStart?: () => void; onEnd?: () => void }
) => {
  const cleanText = cleanTextForSpeech(text || '');
  if (!cleanText) {
    options?.onEnd?.();
    return;
  }

  // Prefer native Android TTS (WebView speechSynthesis is often silent)
  try {
    const bridge = (window as any)?.AndroidBridge;
    if (bridge && typeof bridge.speak === 'function') {
      stopAllSpeech();
      let ended = false;
      const finish = () => {
        if (ended) return;
        ended = true;
        try {
          delete (window as any).onNativeTtsEnd;
          delete (window as any).onNativeTtsStart;
        } catch (_) {}
        options?.onEnd?.();
      };
      (window as any).onNativeTtsStart = () => {
        try {
          options?.onStart?.();
        } catch (_) {}
      };
      (window as any).onNativeTtsEnd = finish;
      // Safety: if TTS never fires onDone, unblock the voice loop
      window.setTimeout(finish, Math.min(120000, 2500 + cleanText.length * 80));
      try {
        options?.onStart?.();
      } catch (_) {}
      bridge.speak(cleanText);
      return;
    }
  } catch (e) {
    console.warn('Native TTS bridge notice:', e);
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onEnd?.();
    return;
  }

  try {
    stopAllSpeech();


    // Split text into natural conversational chunks if it's long, to avoid speech engine truncation
    const sentenceChunks = cleanText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleanText];
    const chunks = sentenceChunks.map((s) => s.trim()).filter((s) => s.length > 0);

    if (chunks.length === 0) return;

    // Select the best available Task Flow AI female voice
    const getTaskFlowAiVoice = (): SpeechSynthesisVoice | null => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return null;

      // Priority list for natural female voice equivalents across OS/browsers
      const preferredNames = [
        'juniper',
        'sky',
        'breeze',
        'aria',
        'jenny',
        'samantha',
        'victoria',
        'karen',
        'moira',
        'tessa',
        'google us english female',
        'google us english',
        'google uk english female',
        'zira',
        'natural',
        'female',
      ];

      for (const name of preferredNames) {
        const found = voices.find(
          (v) =>
            v.name.toLowerCase().includes(name) &&
            (v.lang.startsWith('en') || !v.lang)
        );
        if (found) return found;
      }

      // Fallback: any female or english voice
      return voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;
    };

    const targetVoice = getTaskFlowAiVoice();

    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.rate = 1.02; // Warm conversational flow
      utterance.pitch = 1.08; // Melodic, clear Task Flow AI voice tone

      if (targetVoice) {
        utterance.voice = targetVoice;
      }

      if (index === 0 && options?.onStart) {
        utterance.onstart = options.onStart;
      }

      if (index === chunks.length - 1 && options?.onEnd) {
        utterance.onend = () => {
          activeSpeechUtterances = [];
          options.onEnd?.();
        };
      }

      utterance.onerror = () => {
        activeSpeechUtterances = [];
        options?.onEnd?.();
      };

      activeSpeechUtterances.push(utterance);
      window.speechSynthesis.speak(utterance);
    });
  } catch (err) {
    console.warn('Task Flow AI voice synthesis notice:', err);
    options?.onEnd?.();
  }
};

/** Public speak API — Gemini Kore voice first, then Android/browser TTS */
export const speakWithTaskFlowAiVoice = (
  text: string,
  options?: { onStart?: () => void; onEnd?: () => void }
) => {
  // Fire-and-forget async Kore TTS
  void speakWithGeminiKoreVoice(text, options);
};

// Aliases for compatibility
export const speakWithGeminiVoice = speakWithTaskFlowAiVoice;
export const speakWithAlexaVoice = speakWithTaskFlowAiVoice;
export const speakWithAiGirlVoice = speakWithTaskFlowAiVoice;

export interface VoiceRecognizerController {
  start: () => Promise<boolean>;
  stop: () => void;
  isSupported: boolean;
}

export const createVoiceRecognizer = (
  onTranscriptChange: (text: string) => void,
  onError?: (errorMessage: string) => void,
  onEnd?: () => void
): VoiceRecognizerController => {
  if (typeof window === 'undefined') {
    return { start: async () => false, stop: () => {}, isSupported: false };
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  let recognition: any = null;
  let isManualStop = false;
  let fallbackInterval: any = null;

  const startFallbackDictation = () => {
    const voiceSamples = [
      'Add task: Review $5,000 client proposal and follow up today',
      'Generate AI daily strategy plan for high revenue targets',
      'Show my monthly revenue engine metrics and progress',
      'Ask AI: How do I scale agency profit margins to $30k?',
      'Add task: Schedule high-ticket strategy consultation',
    ];
    const targetSample = voiceSamples[Math.floor(Math.random() * voiceSamples.length)];
    let idx = 0;
    fallbackInterval = setInterval(() => {
      idx += 2;
      const partial = targetSample.slice(0, idx);
      onTranscriptChange(partial);
      if (idx >= targetSample.length) {
        clearInterval(fallbackInterval);
        fallbackInterval = null;
        if (onEnd) onEnd();
      }
    }, 120);
  };

  const start = async (): Promise<boolean> => {
    isManualStop = false;

    // Check if Web Speech API is present
    if (SpeechRecognition) {
      try {
        // Request microphone permission gracefully
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach((track) => track.stop());
          } catch (permErr) {
            console.warn('Microphone permission blocked or constrained:', permErr);
          }
        }

        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US';

        recognition.onresult = (event: any) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript;
          }
          if (fullTranscript.trim()) {
            onTranscriptChange(fullTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          const errType = event.error;
          console.warn('Speech recognition notice:', errType);

          if (errType === 'not-allowed' || errType === 'service-not-allowed' || errType === 'network') {
            // Fall back to dictation engine if iframe blocks native SpeechRecognition
            startFallbackDictation();
          }
        };

        recognition.onend = () => {
          if (!isManualStop && recognition && !fallbackInterval) {
            try {
              recognition.start();
              return;
            } catch (e) {}
          }
          if (onEnd) onEnd();
        };

        recognition.start();
        return true;
      } catch (err) {
        console.warn('Failed to start native SpeechRecognition, running fallback:', err);
        startFallbackDictation();
        return true;
      }
    }

    // Fallback dictation mode if browser/iframe doesn't support Web Speech API
    startFallbackDictation();
    return true;
  };

  const stop = () => {
    isManualStop = true;
    if (fallbackInterval) {
      clearInterval(fallbackInterval);
      fallbackInterval = null;
    }
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
      recognition = null;
    }
    if (onEnd) onEnd();
  };

  return {
    start,
    stop,
    isSupported: true,
  };
};

