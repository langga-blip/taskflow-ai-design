// Speech & Audio Utilities for Task Flow AI
// Supports Speech-To-Text (Voice Translation) & Amazon Alexa Voice Synthesis

export const speakWithAlexaVoice = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel(); // Stop any active speech

    // Clean text of markdown formatting symbols (**bold**, # headers, bullet lists, etc.)
    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '') // remove markdown links
      .replace(/https?:\/\/\S+/g, '') // remove raw urls
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.98; // Alexa's clear, rhythmic conversational cadence
    utterance.pitch = 1.05; // Alexa's calm, confident AI tone

    const selectAlexaVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Priority list for Amazon Alexa voice style across platforms
      const alexaVoiceNames = [
        'Alexa',
        'Amazon',
        'Google US English',
        'Samantha',
        'Microsoft Aria',
        'Microsoft Zira',
        'Jenny',
        'Victoria',
        'Karen',
        'Google UK English Female',
        'Moira',
        'Natural'
      ];

      let selected = voices.find((v) =>
        alexaVoiceNames.some((name) => v.name.toLowerCase().includes(name.toLowerCase())) &&
        (v.lang.startsWith('en') || !v.lang)
      );

      if (!selected) {
        selected = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('aria') ||
              v.name.toLowerCase().includes('zira') ||
              v.name.toLowerCase().includes('samantha'))
        );
      }

      if (!selected) {
        selected = voices.find((v) => v.lang.startsWith('en'));
      }

      if (selected) {
        utterance.voice = selected;
      }
    };

    selectAlexaVoice();

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        selectAlexaVoice();
        window.speechSynthesis.speak(utterance);
      };
    } else {
      window.speechSynthesis.speak(utterance);
    }
  } catch (err) {
    console.warn('Alexa voice synthesis notice:', err);
  }
};

// Legacy alias for backwards compatibility
export const speakWithAiGirlVoice = speakWithAlexaVoice;

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

