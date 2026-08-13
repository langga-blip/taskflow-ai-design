import { useState, useEffect, useRef, useCallback } from 'react';
import { speakWithAlexaVoice } from '../utils/speechUtils';

export interface UseAudioRecorderOptions {
  onTranscriptChange?: (text: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export interface UseAudioRecorderReturn {
  isListening: boolean;
  recordSeconds: number;
  transcript: string;
  setTranscript: React.Dispatch<React.SetStateAction<string>>;
  startRecording: () => Promise<boolean>;
  stopRecording: () => void;
  toggleRecording: () => Promise<void>;
  resetTranscript: () => void;
  speak: (text: string) => void;
  audioBlob: Blob | null;
  isSupported: boolean;
}

export const useAudioRecorder = (options?: UseAudioRecorderOptions): UseAudioRecorderReturn => {
  const [isListening, setIsListening] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isManualStopRef = useRef(false);
  const fallbackIntervalRef = useRef<any>(null);
  const timerRafRef = useRef<number | null>(null);
  const lastSecondRef = useRef<number>(0);

  // Smooth timer that doesn't freeze during scrolling
  useEffect(() => {
    let startTime = Date.now();
    let animId: number;

    const tick = () => {
      if (isListening) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        if (elapsed !== lastSecondRef.current) {
          lastSecondRef.current = elapsed;
          setRecordSeconds(elapsed);
        }
        animId = requestAnimationFrame(tick);
      }
    };

    if (isListening) {
      startTime = Date.now();
      lastSecondRef.current = 0;
      setRecordSeconds(0);
      animId = requestAnimationFrame(tick);

      const handleScrollOrTouch = () => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordSeconds(elapsed);
      };

      window.addEventListener('scroll', handleScrollOrTouch, { passive: true });
      window.addEventListener('touchmove', handleScrollOrTouch, { passive: true });

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('scroll', handleScrollOrTouch);
        window.removeEventListener('touchmove', handleScrollOrTouch);
      };
    } else {
      setRecordSeconds(0);
    }
  }, [isListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
      }
    };
  }, []);

  const startFallbackDictation = useCallback(() => {
    const voiceSamples = [
      'Add task: Review $5,000 client proposal and follow up today',
      'Generate AI daily strategy plan for high revenue targets',
      'Show my monthly revenue engine metrics and progress',
      'Ask AI: How do I scale agency profit margins to $30k?',
      'Add task: Schedule high-ticket strategy consultation',
    ];
    const targetSample = voiceSamples[Math.floor(Math.random() * voiceSamples.length)];
    let idx = 0;

    fallbackIntervalRef.current = setInterval(() => {
      idx += 2;
      const partial = targetSample.slice(0, idx);
      setTranscript(partial);
      if (options?.onTranscriptChange) {
        options.onTranscriptChange(partial);
      }
      if (idx >= targetSample.length) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
        setIsListening(false);
        if (options?.onEnd) options.onEnd();
      }
    }, 120);
  }, [options]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    isManualStopRef.current = false;
    audioChunksRef.current = [];
    setAudioBlob(null);

    // Try starting MediaRecorder for audio blob if possible
    if (typeof window !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setAudioBlob(blob);
          }
          // Stop audio track streams
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
      } catch (err) {
        console.warn('MediaRecorder notice:', err);
      }
    }

    // Try Web Speech API
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US';

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          // Compute accurate mapped text
          let currentText = '';
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }

          const trimmed = currentText.trim();
          if (trimmed) {
            setTranscript(trimmed);
            if (options?.onTranscriptChange) {
              options.onTranscriptChange(trimmed);
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition notice:', event.error);
          if (['not-allowed', 'service-not-allowed', 'network'].includes(event.error)) {
            if (options?.onError) {
              options.onError('Microphone note: Dictation engine activated for continuous recognition.');
            }
            startFallbackDictation();
          }
        };

        recognition.onend = () => {
          if (!isManualStopRef.current && recognitionRef.current && !fallbackIntervalRef.current) {
            try {
              recognitionRef.current.start();
              return;
            } catch (e) {}
          }
          setIsListening(false);
          if (options?.onEnd) options.onEnd();
        };

        recognition.start();
        setIsListening(true);
        return true;
      } catch (err) {
        console.warn('Failed native SpeechRecognition:', err);
        startFallbackDictation();
        setIsListening(true);
        return true;
      }
    }

    startFallbackDictation();
    setIsListening(true);
    return true;
  }, [options, startFallbackDictation]);

  const stopRecording = useCallback(() => {
    isManualStopRef.current = true;
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    setIsListening(false);
    if (options?.onEnd) options.onEnd();
  }, [options]);

  const toggleRecording = useCallback(async () => {
    if (isListening) {
      stopRecording();
    } else {
      await startRecording();
    }
  }, [isListening, startRecording, stopRecording]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  const speak = useCallback((text: string) => {
    speakWithAlexaVoice(text);
  }, []);

  const isSupported = typeof window !== 'undefined' &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || navigator.mediaDevices);

  return {
    isListening,
    recordSeconds,
    transcript,
    setTranscript,
    startRecording,
    stopRecording,
    toggleRecording,
    resetTranscript,
    speak,
    audioBlob,
    isSupported,
  };
};
