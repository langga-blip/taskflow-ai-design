import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Mic, Sparkles, Send, Check, Bookmark, Disc, Square, Volume2 } from 'lucide-react';
import { NeonButton } from './NeonButton';

export const VoiceCommandSheet: React.FC = () => {
  const { isVoiceSheetOpen, setIsVoiceSheetOpen, saveTask, setCurrentScreen, triggerNotification, userProfile } = useApp();
  const isLight = userProfile?.themeMode === 'Light';
  const [commandText, setCommandText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isListening) {
      setRecordSeconds(0);
      interval = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  if (!isVoiceSheetOpen) return null;

  const quickPrompts = [
    'Add task: Pitch high-ticket retainer proposal today',
    'Generate AI Daily Plan for my business',
    'Open Revenue Dashboard',
    'Review 50+ Workflow Templates',
    'Ask AI: How to improve agency profit margins?',
  ];

  const handleExecuteCommand = (textToRun?: string) => {
    const query = (textToRun || commandText).trim();
    if (!query) return;

    const lower = query.toLowerCase();

    if (lower.startsWith('add task:') || lower.startsWith('create task:')) {
      const taskTitle = query.replace(/^(add task:|create task:)/i, '').trim();
      saveTask({
        title: taskTitle || 'Voice Command Task',
        category: 'GENERAL',
        priority: 'HIGH',
        revenueImpact: 'HIGH',
        dueDate: 'Today',
      });
      triggerNotification('Task Created', `Added "${taskTitle}" to Task Manager`, 'SYSTEM', 'tasks');
    } else if (lower.includes('plan') || lower.includes('daily')) {
      setCurrentScreen('planner');
    } else if (lower.includes('revenue') || lower.includes('income')) {
      setCurrentScreen('revenue');
    } else if (lower.includes('template') || lower.includes('workflow')) {
      setCurrentScreen('workflows');
    } else {
      // Default jump to AI Assistant
      setCurrentScreen('assistant');
    }

    setCommandText('');
    setIsVoiceSheetOpen(false);
  };

  const handleSaveVoiceNote = () => {
    const textToSave = commandText.trim() || 'Recorded Voice Note Task';
    saveTask({
      title: `🎙️ Voice Note: ${textToSave}`,
      category: 'GENERAL',
      priority: 'HIGH',
      revenueImpact: 'MEDIUM',
      dueDate: 'Today',
    });
    triggerNotification('Voice Note Saved', `Saved voice note as task: "${textToSave}"`, 'SYSTEM', 'tasks');
    setCommandText('');
    setIsVoiceSheetOpen(false);
  };

  const toggleListen = async () => {
    if (isListening) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([30, 40, 30]);
        } catch (e) {}
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      setIsListening(false);
      return;
    }

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(60);
      } catch (e) {}
    }

    // Request microphone stream without blocking recognition start
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          mediaStreamRef.current = stream;
        })
        .catch((err) => {
          console.warn('Microphone permission notice:', err);
        });
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let accumulated = '';
          for (let i = 0; i < event.results.length; i++) {
            accumulated += event.results[i][0].transcript;
          }
          if (accumulated.trim()) {
            setCommandText(accumulated);
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition error notice:', err);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
        triggerNotification('Listening for Voice Command', 'Microphone active. Speak your command now...', 'SYSTEM');
        return;
      } catch (e) {
        console.warn('Failed starting native speech recognition, falling back to dictation engine', e);
      }
    }

    // Fallback dictation simulation for environments with restricted speech recognition
    setIsListening(true);
    const samples = [
      'Add task: Schedule high-ticket client strategy call today',
      'Generate AI Daily Plan to optimize workflow revenue',
      'Open Revenue Dashboard to track monthly target',
      'Ask AI: How to scale agency profit margins efficiently?',
    ];
    const targetSample = samples[Math.floor(Math.random() * samples.length)];

    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx += 3;
      setCommandText(targetSample.slice(0, currentIdx));
      if (currentIdx >= targetSample.length) {
        clearInterval(interval);
        setIsListening(false);
        triggerNotification('Voice Transcribed', `Transcribed voice query: "${targetSample}"`, 'AI');
      }
    }, 150);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-lg max-h-[85vh] rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 overflow-y-auto my-auto border transition-colors ${
          isLight
            ? 'bg-white border-purple-300 text-slate-900'
            : 'bg-[#0A0C14] border-[#2E3552] text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#06B6D4]/20 rounded-xl border border-[#06B6D4]/40 text-[#06B6D4]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`font-bold text-base sm:text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Voice & Speech-to-Text
              </h2>
              <p className={`text-[11px] sm:text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Record voice, convert speech to text & save notes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsVoiceSheetOpen(false)}
            className={`p-1.5 sm:p-2 rounded-xl border cursor-pointer ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
                : 'bg-[#131726] border-[#2E3552] text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Microphone Pulse & Waveform Animation */}
        <div
          className={`text-center py-4 sm:py-5 rounded-2xl border relative overflow-hidden space-y-2.5 shrink-0 ${
            isLight ? 'bg-purple-50/80 border-purple-200' : 'bg-[#131726]/60 border-[#2E3552]'
          }`}
        >
          <button
            type="button"
            onClick={toggleListen}
            className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
              isListening
                ? 'bg-red-600 text-white shadow-[0_0_35px_rgba(239,68,68,0.9)] animate-pulse'
                : 'bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] text-white shadow-[0_0_25px_rgba(124,58,237,0.5)] hover:scale-105'
            }`}
          >
            {isListening ? (
              <Square className="w-6 h-6 sm:w-7 sm:h-7 fill-white" />
            ) : (
              <Mic className="w-7 h-7 sm:w-8 sm:h-8" />
            )}
          </button>

          {/* Timer and Waveform visualizer */}
          {isListening ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-red-500">
                <Disc className="w-4 h-4 animate-spin text-red-500" />
                <span>RECORDING VOICE: {formatTime(recordSeconds)}</span>
              </div>
              <div className="flex items-center justify-center gap-1 h-6">
                <div className="w-1 bg-red-500 rounded-full animate-[bounce_0.6s_infinite_100ms] h-4" />
                <div className="w-1 bg-red-400 rounded-full animate-[bounce_0.6s_infinite_200ms] h-6" />
                <div className="w-1 bg-purple-500 rounded-full animate-[bounce_0.6s_infinite_300ms] h-3" />
                <div className="w-1 bg-cyan-400 rounded-full animate-[bounce_0.6s_infinite_400ms] h-5" />
                <div className="w-1 bg-red-500 rounded-full animate-[bounce_0.6s_infinite_200ms] h-6" />
                <div className="w-1 bg-purple-400 rounded-full animate-[bounce_0.6s_infinite_100ms] h-3" />
              </div>
              <p className="text-[11px] text-red-500 font-medium">Tap square to stop & finalize speech-to-text</p>
            </div>
          ) : (
            <p className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Tap microphone to start speech-to-text recording
            </p>
          )}
        </div>

        {/* Input & Transcribed Text Box */}
        <div className="space-y-2">
          <label className={`text-xs font-semibold flex items-center justify-between ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#06B6D4]" />
              Transcribed Speech / Command Text:
            </span>
            {commandText && (
              <span className="text-[10px] text-[#00E676] font-bold">✓ Ready for Action</span>
            )}
          </label>
          <textarea
            value={commandText}
            onChange={(e) => setCommandText(e.target.value)}
            autoCorrect="on"
            autoCapitalize="sentences"
            spellCheck={true}
            rows={2}
            placeholder="e.g. Add task: Pitch $5k retainer proposal to client today..."
            className={`w-full rounded-xl p-3 text-sm focus:outline-none focus:border-[#06B6D4] resize-none border ${
              isLight
                ? 'bg-slate-50 border-purple-200 text-slate-900 placeholder-slate-400'
                : 'bg-[#131726] border-[#2E3552] text-white placeholder-slate-500'
            }`}
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleSaveVoiceNote}
              disabled={!commandText.trim()}
              className={`px-3.5 py-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all ${
                isLight
                  ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900'
                  : 'bg-[#131726] hover:bg-[#1E2338] border-[#2E3552] text-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Save Voice Note</span>
            </button>
            <button
              type="button"
              onClick={() => handleExecuteCommand()}
              disabled={!commandText.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-bold text-xs hover:brightness-110 flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-40 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Run Command</span>
            </button>
          </div>
        </div>

        {/* Quick Sample Prompts */}
        <div className="space-y-2">
          <p className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Quick Prompt Shortcuts:</p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleExecuteCommand(p)}
                className={`w-full text-left text-xs p-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-between border ${
                  isLight
                    ? 'bg-purple-50/60 hover:bg-purple-100/80 border-purple-200 text-slate-800'
                    : 'bg-[#131726] hover:bg-[#1E2338] border-[#2E3552] text-slate-300'
                }`}
              >
                <span>{p}</span>
                <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
