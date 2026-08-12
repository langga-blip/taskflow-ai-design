import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, TrendingUp, Layers, Bot, ArrowRight, Sun, Moon } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';

export const LandingScreen: React.FC = () => {
  const { userProfile, updateUserProfile, setCurrentScreen } = useApp();
  const isLight = userProfile.themeMode === 'Light';

  const toggleTheme = () => {
    updateUserProfile({ themeMode: isLight ? 'Dark' : 'Light' });
  };

  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-[#06B6D4]" />,
      title: 'AI Daily Strategy Planner',
      desc: 'Generates top revenue-impacting priorities every morning tailored to your business goals.',
      glowClass: 'animate-glow-cyan',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-[#00E676]" />,
      title: 'Global Revenue Engine',
      desc: 'Track monthly revenue, target milestones, and auto-convert across 20+ fiat currencies.',
      glowClass: 'animate-glow-green',
    },
    {
      icon: <Layers className="w-6 h-6 text-[#F59E0B]" />,
      title: '50+ Workflow Templates',
      desc: 'Pre-built playbooks for Marketing, Sales, Finance, Client Ops, Content & Operations.',
      glowClass: 'animate-glow-amber',
    },
    {
      icon: <Bot className="w-6 h-6 text-[#7C3AED]" />,
      title: '24/7 AI Business Advisor',
      desc: 'Instant answers, proposal reviews, outreach drafts, and executive coaching.',
      glowClass: 'animate-glow-purple',
    },
  ];

  return (
    <div
      className={`min-h-screen p-6 pb-12 flex flex-col items-center justify-between relative overflow-hidden transition-colors ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0A0C14] text-white'
      }`}
    >
      {/* Background Glows */}
      <div
        className={`absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-2xl h-80 rounded-full blur-[140px] pointer-events-none ${
          isLight ? 'bg-purple-300/30' : 'bg-[#7C3AED]/15'
        }`}
      />

      <div className="max-w-xl w-full mx-auto space-y-8 z-10 my-auto">
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
              isLight
                ? 'bg-purple-100 border-purple-300 text-purple-900 shadow-sm'
                : 'bg-[#7C3AED]/20 border-[#7C3AED]/40 text-[#A78BFA]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#06B6D4]" /> Autonomous Business Operating System
          </div>
          <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Automate Growth with{' '}
            <span className="bg-gradient-to-r from-[#06B6D4] via-[#8B5CF6] to-[#7C3AED] bg-clip-text text-transparent">
              TaskFlow AI
            </span>
          </h1>
          <p className={`text-sm max-w-md mx-auto leading-relaxed ${isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
            The all-in-one AI platform for founders, agency owners, and consultants to scale revenue, eliminate friction, and execute daily strategy.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, idx) => (
            <GlassCard key={idx} className={`space-y-2.5 transition-all ${f.glowClass}`}>
              <div
                className={`p-2.5 rounded-xl border w-fit ${
                  isLight ? 'bg-purple-50/80 border-purple-200' : 'bg-[#0A0C14] border-[#2E3552]'
                }`}
              >
                {f.icon}
              </div>
              <h3 className={`font-extrabold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{f.title}</h3>
              <p className={`text-xs leading-normal ${isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{f.desc}</p>
            </GlassCard>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-lg mx-auto w-full">
          <NeonButton onClick={() => setCurrentScreen('onboarding')} size="md" className="w-full sm:w-auto px-6 py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-md">
            Get Started Now <ArrowRight className="w-4 h-4" />
          </NeonButton>
          <NeonButton
            onClick={() => setCurrentScreen('auth')}
            variant="secondary"
            size="md"
            className="w-full sm:w-auto px-6 py-3 text-sm font-bold flex items-center justify-center gap-2"
          >
            I Already Have an Account &rarr;
          </NeonButton>
        </div>
        <div className="text-center pt-1">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className={`text-center text-xs py-1 cursor-pointer font-bold transition-colors ${
              isLight ? 'text-purple-700 hover:text-purple-900 underline' : 'text-slate-400 hover:text-white'
            }`}
          >
            Explore Interactive Demo Mode
          </button>
        </div>
      </div>
    </div>
  );
};
