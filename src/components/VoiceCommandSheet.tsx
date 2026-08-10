import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Mic, Sparkles, Send, Check } from 'lucide-react';
import { NeonButton } from './NeonButton';

export const VoiceCommandSheet: React.FC = () => {
  const { isVoiceSheetOpen, setIsVoiceSheetOpen, saveTask, setCurrentScreen, triggerNotification } = useApp();
  const [commandText, setCommandText] = useState('');
  const [isListening, setIsListening] = useState(false);

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

  const toggleListen = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your command.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCommandText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#0A0C14] border border-[#2E3552] rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#06B6D4]/20 rounded-xl border border-[#06B6D4]/40 text-[#06B6D4]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Voice & Quick Commands</h2>
              <p className="text-xs text-slate-400">Speak or type your intent for instant action</p>
            </div>
          </div>
          <button
            onClick={() => setIsVoiceSheetOpen(false)}
            className="p-2 rounded-xl bg-[#131726] border border-[#2E3552] text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Microphone Pulse */}
        <div className="text-center py-6 bg-[#131726]/50 rounded-2xl border border-[#2E3552]">
          <button
            onClick={toggleListen}
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? 'bg-red-600 text-white animate-ping shadow-[0_0_30px_rgba(239,68,68,0.8)]'
                : 'bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] text-white shadow-[0_0_25px_rgba(124,58,237,0.5)] hover:scale-105'
            }`}
          >
            <Mic className="w-8 h-8" />
          </button>
          <p className="text-xs text-slate-400 mt-3 font-medium">
            {isListening ? 'Listening... Speak your command now' : 'Tap microphone to speak command'}
          </p>
        </div>

        {/* Input box */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={commandText}
            onChange={(e) => setCommandText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecuteCommand()}
            placeholder="e.g. Add task: Pitch $5k retainer proposal"
            className="flex-1 bg-[#131726] border border-[#2E3552] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#06B6D4]"
          />
          <NeonButton onClick={() => handleExecuteCommand()} size="md">
            <Send className="w-4 h-4" /> Run
          </NeonButton>
        </div>

        {/* Quick Sample Prompts */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400">Quick Prompt Shortcuts:</p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleExecuteCommand(p)}
                className="w-full text-left text-xs bg-[#131726] hover:bg-[#1E2338] border border-[#2E3552] text-slate-300 p-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-between"
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
