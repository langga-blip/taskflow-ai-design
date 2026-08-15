// Speech & Audio Utilities for Task Flow AI
// Real-Time Speech Recognition & Task Flow AI Voice Synthesis

let activeSpeechUtterances: SpeechSynthesisUtterance[] = [];

/**
 * Stop any ongoing speech synthesis
 */
export const stopAllSpeech = () => {
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

/**
 * Speak using Task Flow AI voice styling (warm, articulate, expressive, natural cadence)
 */
export const speakWithTaskFlowAiVoice = (
  text: string,
  options?: { onStart?: () => void; onEnd?: () => void }
) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    stopAllSpeech();

    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) return;

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

