import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowRight } from 'lucide-react';
import { NeonButton } from '../components/NeonButton';

export const SplashScreen: React.FC = () => {
  const { setCurrentScreen, userProfile } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (userProfile.isOnboarded) {
        setCurrentScreen('dashboard');
      } else {
        setCurrentScreen('landing');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0C14] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Neon Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7C3AED]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#06B6D4]/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 space-y-6 max-w-md animate-fade-in">
        {/* Animated Icon */}
        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#06B6D4] p-1 shadow-[0_0_50px_rgba(124,58,237,0.6)] animate-pulse">
          <div className="w-full h-full bg-[#0A0C14] rounded-[22px] flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-[#06B6D4] animate-bounce" />
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-[#A78BFA] bg-clip-text text-transparent">
            TaskFlow AI
          </h1>
          <p className="text-sm font-semibold text-[#06B6D4] mt-1 tracking-widest uppercase">
            Spectrey Business OS
          </p>
        </div>

        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
          AI-Powered Daily Strategy, Revenue Engine & 50+ Automated Workflow Playbooks.
        </p>

        <div className="pt-8">
          <NeonButton
            onClick={() => setCurrentScreen(userProfile.isOnboarded ? 'dashboard' : 'landing')}
            size="lg"
            fullWidth
          >
            Launch Workspace <ArrowRight className="w-5 h-5" />
          </NeonButton>
        </div>
      </div>
    </div>
  );
};
