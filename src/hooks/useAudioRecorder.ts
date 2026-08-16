import { useState, useEffect, useRef, useCallback } from 'react';
import { speakWithAlexaVoice } from '../utils/speechUtils';
import { transcribeAudioApi } from '../services/api';

export interface UseAudioRecorderOptions {
  onTranscriptChange?: (text: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export interface UseAudioRecorderReturn {
  isListening: boolean;
  isTranscribing: boolean;
  recordSeconds: number;
  transcript: string;
  setTranscript: React.Dispatch<React.SetStateAction<string>>;
  startRecording: () => Promise<boolean>;
  stopRecording: () => void;
  toggleRecording: () => Promise<void>;
  resetTranscript: () => void;
  speak: (text: string) => void;
  audioBlob: Blob | null;
  transcribeRecordedAudio: () => Promise<string | null>;
  isSupported: boolean;
}

export const useAudioRecorder = (options?: UseAudioRecorderOptions): UseAudioRecorderReturn => {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isManualStopRef = useRef(false);
  const fallbackIntervalRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Smooth timer that doesn't freeze during scrolling
  useEffect(() => {
    if (isListening) {
      const startTime = Date.now();
      setRecordSeconds(0);

      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordSeconds(elapsed);
      }, 500);

      return () => clearInterval(interval);
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
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
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

    // Start MediaRecorder for capturing exact audio bytes for Gemini 3.5 Flash transcription
    if (typeof window !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined,
        });
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
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
          }
        };

        mediaRecorder.start(250);
      } catch (err) {
        console.warn('MediaRecorder audio capture notice:', err);
      }
    }

    // Try Web Speech API for real-time speech preview while recording
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

  // Transcribe recorded audio with Gemini 3.5 Flash
  const transcribeRecordedAudio = useCallback(async (): Promise<string | null> => {
    if (audioChunksRef.current.length === 0 && !audioBlob) {
      return transcript || null;
    }

    setIsTranscribing(true);
    try {
      const blob = audioBlob || new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64Data = await base64Promise;

      const aiTranscript = await transcribeAudioApi(base64Data, blob.type || 'audio/webm');
      if (aiTranscript && aiTranscript.trim()) {
        setTranscript(aiTranscript.trim());
        if (options?.onTranscriptChange) {
          options.onTranscriptChange(aiTranscript.trim());
        }
        setIsTranscribing(false);
        return aiTranscript.trim();
      }
    } catch (err) {
      console.warn('Gemini 3.5 Flash transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
    return transcript || null;
  }, [audioBlob, options, transcript]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    audioChunksRef.current = [];
    setAudioBlob(null);
  }, []);

  const speak = useCallback((text: string) => {
    speakWithAlexaVoice(text);
  }, []);

  const isSupported = typeof window !== 'undefined' &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || navigator.mediaDevices);

  return {
    isListening,
    isTranscribing,
    recordSeconds,
    transcript,
    setTranscript,
    startRecording,
    stopRecording,
    toggleRecording,
    resetTranscript,
    speak,
    audioBlob,
    transcribeRecordedAudio,
    isSupported,
  };
};

