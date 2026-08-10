import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, TrendingUp, Layers, Bot, CheckCircle2, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';

export const LandingScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();

  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-[#06B6D4]" />,
      title: 'AI Daily Strategy Planner',
      desc: 'Generates top revenue-impacting priorities every morning tailored to your business goals.',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-[#00E676]" />,
      title: 'Global Revenue Engine',
      desc: 'Track monthly revenue, target milestones, and auto-convert across 20+ fiat currencies.',
    },
    {
      icon: <Layers className="w-6 h-6 text-[#A78BFA]" />,
      title: '50+ Workflow Templates',
      desc: 'Pre-built playbooks for Marketing, Sales, Finance, Client Ops, Content & Operations.',
    },
    {
      icon: <Bot className="w-6 h-6 text-[#F59E0B]" />,
      title: '24/7 AI Business Advisor',
      desc: 'Instant answers, proposal reviews, outreach drafts, and executive coaching.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0C14] text-white p-6 pb-12 flex flex-col items-center justify-between relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-2xl h-80 bg-[#7C3AED]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-xl w-full mx-auto space-y-8 z-10 my-auto">
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#A78BFA] text-xs font-bold">
            <Sparkles className="w-4 h-4 text-[#06B6D4]" /> Autonomous Business Operating System
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Automate Growth with{' '}
            <span className="bg-gradient-to-r from-[#06B6D4] via-[#8B5CF6] to-[#7C3AED] bg-clip-text text-transparent">
              TaskFlow AI
            </span>
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            The all-in-one AI platform for founders, agency owners, and consultants to scale revenue, eliminate friction, and execute daily strategy.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, idx) => (
            <GlassCard key={idx} className="space-y-2 hover:border-[#06B6D4]/50">
              <div className="p-2.5 rounded-xl bg-[#0A0C14] border border-[#2E3552] w-fit">
                {f.icon}
              </div>
              <h3 className="font-bold text-sm text-white">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-normal">{f.desc}</p>
            </GlassCard>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <NeonButton onClick={() => setCurrentScreen('onboarding')} size="lg" fullWidth>
            Get Started Now <ArrowRight className="w-5 h-5" />
          </NeonButton>
          <NeonButton
            onClick={() => setCurrentScreen('auth')}
            variant="secondary"
            size="lg"
            fullWidth
          >
            I Already Have an Account &rarr;
          </NeonButton>
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="w-full text-center text-xs text-slate-400 hover:text-white py-2 cursor-pointer font-medium"
          >
            Explore Interactive Demo Mode
          </button>
        </div>
      </div>
    </div>
  );
};
