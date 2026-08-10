import React from 'react';
import { useApp } from '../context/AppContext';
import { Bot, Sparkles } from 'lucide-react';

export const FloatingAssistantOverlay: React.FC = () => {
  const { currentScreen, setCurrentScreen } = useApp();

  // Hide floating button when already on AI Assistant screen or auth screens
  if (['assistant', 'splash', 'landing', 'auth', 'onboarding'].includes(currentScreen)) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-5 z-30">
      <button
        onClick={() => setCurrentScreen('assistant')}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#06B6D4] text-white shadow-[0_0_25px_rgba(124,58,237,0.6)] hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
        title="Open 24/7 AI Business Assistant"
      >
        <Bot className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00E676] rounded-full border-2 border-[#0A0C14] animate-pulse" />
        <div className="absolute right-16 hidden group-hover:flex items-center gap-1 bg-[#131726] border border-[#7C3AED] px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xl whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" /> Ask AI Assistant
        </div>
      </button>
    </div>
  );
};
