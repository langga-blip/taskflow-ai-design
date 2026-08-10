import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { Sparkles, Mail, Lock, User, ArrowRight, Check } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { setCurrentScreen, updateUserProfile, triggerNotification } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('alex@apexscale.com');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Alex Rivera');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      userName: name || 'Alex Rivera',
      userEmail: email,
      isOnboarded: true,
    });
    triggerNotification('Welcome Back! 👋', `Signed in as ${email}`, 'SYSTEM', 'dashboard');
    setCurrentScreen('dashboard');
  };

  const handleGoogleAuth = () => {
    updateUserProfile({
      userName: 'Alex Rivera',
      userEmail: 'alex.rivera@gmail.com',
      isOnboarded: true,
    });
    triggerNotification('Google Authentication Successful', 'Synced with Spectrey Workspace', 'SYSTEM', 'dashboard');
    setCurrentScreen('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0A0C14] text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="max-w-md w-full space-y-6 z-10">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] p-0.5 shadow-[0_0_30px_rgba(124,58,237,0.5)]">
            <div className="w-full h-full bg-[#0A0C14] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-[#06B6D4]" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {isRegister ? 'Create Your Workspace' : 'Sign In to TaskFlow AI'}
          </h2>
          <p className="text-xs text-slate-400">
            Access your executive AI dashboard, tasks & revenue engines
          </p>
        </div>

        <GlassCard className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full bg-[#0A0C14] border border-[#2E3552] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@apexscale.com"
                  className="w-full bg-[#0A0C14] border border-[#2E3552] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0A0C14] border border-[#2E3552] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>

            <NeonButton type="submit" size="md" fullWidth>
              {isRegister ? 'Register Workspace' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </NeonButton>
          </form>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2E3552]" />
            </div>
            <span className="relative bg-[#131726] px-3 text-[11px] text-slate-500">
              OR CONTINUE WITH
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full bg-[#0A0C14] hover:bg-[#1E2338] border border-[#2E3552] rounded-xl py-2.5 px-4 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
            Sign in with Google Account
          </button>
        </GlassCard>

        <p className="text-center text-xs text-slate-400">
          {isRegister ? 'Already have a workspace?' : "Don't have a workspace?"}{' '}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-[#06B6D4] font-bold hover:underline cursor-pointer"
          >
            {isRegister ? 'Sign In' : 'Create One Free'}
          </button>
        </p>
      </div>
    </div>
  );
};
