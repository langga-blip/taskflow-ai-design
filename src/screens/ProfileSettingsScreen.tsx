import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { SearchableCountrySelector } from '../components/SearchableCountrySelector';
import {
  CountryData,
  GENDER_OPTIONS,
  getCountryByName,
} from '../data/countriesData';
import { getGeminiApiKey, setGeminiApiKey } from '../services/api';
import {
  Building2,
  Crown,
  Cpu,
  LogOut,
  Save,
  RotateCcw,
  Check,
  Shield,
  Sparkles,
  Sun,
  Moon,
  Phone,
  Mail,
  User,
  KeyRound,
  Wifi,
  Eye,
  EyeOff,
} from 'lucide-react';

export const ProfileSettingsScreen: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    aiProvider,
    setAiProvider,
    setCurrentScreen,
    triggerNotification,
  } = useApp();

  const isLight = userProfile.themeMode === 'Light';

  const [userName, setUserName] = useState(userProfile.userName);
  const [userEmail, setUserEmail] = useState(userProfile.userEmail || '');
  const [businessName, setBusinessName] = useState(userProfile.businessName);
  const [industry, setIndustry] = useState(userProfile.industry);
  const [gender, setGender] = useState(userProfile.gender || 'Prefer not to say');

  const [selectedCountry, setSelectedCountry] = useState<CountryData>(() => {
    return getCountryByName(userProfile.country || 'United States');
  });

  const [phoneNumber, setPhoneNumber] = useState(userProfile.phoneNumber || '+1 801 234 5678');
  const [currentMonthlyRevenue, setCurrentMonthlyRevenue] = useState<string | number>(
    userProfile.currentMonthlyRevenue !== undefined ? userProfile.currentMonthlyRevenue : 0
  );
  const [monthlyRevenueGoal, setMonthlyRevenueGoal] = useState<string | number>(
    userProfile.monthlyRevenueGoal !== undefined ? userProfile.monthlyRevenueGoal : 0
  );

  const [geminiKey, setGeminiKeyLocal] = useState(() => getGeminiApiKey());
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [geminiKeySaved, setGeminiKeySaved] = useState(!!getGeminiApiKey());

  const handleSaveGeminiKey = () => {
    const trimmed = (geminiKey || '').trim();
    setGeminiApiKey(trimmed);
    setGeminiKeySaved(!!trimmed);
    triggerNotification(
      trimmed ? 'Online AI Connected 🟢' : 'Gemini Key Cleared',
      trimmed
        ? 'Gemini API key saved on device. AI Assistant will use real online Gemini replies.'
        : 'Key removed. Paste a key from aistudio.google.com/apikey to enable online AI.',
      'AI'
    );
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedRev = typeof currentMonthlyRevenue === 'string' ? parseFloat(currentMonthlyRevenue) : currentMonthlyRevenue;
    const finalRev = isNaN(parsedRev) || parsedRev < 0 ? 0 : parsedRev;

    const parsedGoal = typeof monthlyRevenueGoal === 'string' ? parseFloat(monthlyRevenueGoal) : monthlyRevenueGoal;
    const finalGoal = isNaN(parsedGoal) || parsedGoal < 0 ? 0 : parsedGoal;

    updateUserProfile({
      userName,
      userEmail,
      businessName,
      industry,
      gender,
      country: selectedCountry.name,
      currencyCode: selectedCountry.currencyCode,
      currencySymbol: selectedCountry.currencySymbol,
      timezoneId: selectedCountry.timezone,
      phoneNumber,
      currentMonthlyRevenue: finalRev,
      monthlyRevenueGoal: finalGoal,
    });

    triggerNotification('Profile Updated 🎉', `Saved changes for ${selectedCountry.name}.`, 'SYSTEM');
  };

  const toggleThemeMode = (mode: 'Dark' | 'Light') => {
    updateUserProfile({ themeMode: mode });
    triggerNotification('Theme Switched', `Switched to ${mode} mode`, 'SYSTEM');
  };

  const handleResetOnboarding = () => {
    if (confirm('Re-run onboarding wizard? Your goals and business settings will be reconfigured.')) {
      setCurrentScreen('onboarding');
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto animate-fade-in overflow-x-hidden max-w-full">
      {/* Header Banner */}
      <GlassCard className="border-[#7C3AED]/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#2563EB] p-0.5 shadow-[0_0_20px_rgba(124,58,237,0.4)]">
              <div
                className={`w-full h-full rounded-[14px] flex items-center justify-center font-extrabold text-base ${
                  isLight ? 'bg-white text-[#7C3AED]' : 'bg-[#0A0C14] text-white'
                }`}
              >
                {userProfile.userName ? userProfile.userName.substring(0, 2).toUpperCase() : 'AR'}
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold">{userProfile.userName}</h1>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {userProfile.userEmail} • {userProfile.businessName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userProfile.isSubscribed ? (
              <button
                type="button"
                onClick={() => setCurrentScreen('subscription')}
                className="px-3 py-1.5 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-[#F59E0B]/30 transition-all"
                title="View Subscription & Days Countdown"
              >
                <Crown className="w-4 h-4" /> Pro {userProfile.subscriptionDuration ? {
                  '1_MONTH': '1 Month',
                  '3_MONTHS': '3 Months',
                  '6_MONTHS': '6 Months',
                  '1_YEAR': 'Annual'
                }[userProfile.subscriptionDuration] || 'Active' : 'Active'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentScreen('subscription')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer"
              >
                <Crown className="w-4 h-4" /> Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Online AI Connection — required for real Gemini in APK */}
      <GlassCard className="space-y-3 border-[#06B6D4]/40">
        <h2 className="font-bold text-base flex items-center gap-2">
          <Wifi className={`w-5 h-5 ${geminiKeySaved ? 'text-emerald-400' : 'text-[#06B6D4]'}`} />
          Online AI Connection
          {geminiKeySaved && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              Connected
            </span>
          )}
        </h2>
        <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Paste your <strong>Gemini API key</strong> from{' '}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-[#06B6D4] font-semibold underline"
          >
            aistudio.google.com/apikey
          </a>
          . This is <em>not</em> the Firebase key in google-services.json. Required for real online chat, vision, and voice replies in the APK.
        </p>
        <div className="relative">
          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type={showGeminiKey ? 'text' : 'password'}
            value={geminiKey}
            onChange={(e) => setGeminiKeyLocal(e.target.value)}
            placeholder="AIza... your Gemini API key"
            className={`w-full border rounded-xl pl-10 pr-11 py-2.5 text-sm font-mono focus:outline-none focus:border-[#06B6D4] ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-900'
                : 'bg-[#0A0C14] border-[#2E3552] text-white'
            }`}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowGeminiKey((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#06B6D4] cursor-pointer"
            title={showGeminiKey ? 'Hide key' : 'Show key'}
          >
            {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex justify-end">
          <NeonButton type="button" size="md" onClick={handleSaveGeminiKey}>
            <Save className="w-4 h-4" /> Save Gemini Key
          </NeonButton>
        </div>
      </GlassCard>

      {/* Theme Selection Card */}
      <GlassCard className="space-y-3">
        <h2 className="font-bold text-base flex items-center gap-2">
          {isLight ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-400" />} Theme Mode
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => toggleThemeMode('Light')}
            className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              userProfile.themeMode === 'Light'
                ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400 font-extrabold shadow-sm'
                : isLight
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
                : 'bg-[#131726] border-[#2E3552] text-slate-300 hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" /> Light Mode
          </button>
          <button
            type="button"
            onClick={() => toggleThemeMode('Dark')}
            className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              userProfile.themeMode === 'Dark'
                ? 'bg-[#7C3AED]/25 border-[#7C3AED] text-[#A78BFA] font-extrabold shadow-sm'
                : isLight
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
                : 'bg-[#131726] border-[#2E3552] text-slate-300 hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400" /> Dark Mode
          </button>
        </div>
      </GlassCard>

      {/* Settings Form */}
      <GlassCard className="space-y-4">
        <h2 className="font-bold text-base border-b border-slate-200 dark:border-[#2E3552] pb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#06B6D4]" /> Workspace & Business Profile
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-900'
                      : 'bg-[#0A0C14] border-[#2E3552] text-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 flex items-center justify-between">
                <span>Work Email</span>
                <span className="text-[10px] text-[#06B6D4]">Inbox Sync</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="alex@apexscale.com"
                  className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-900'
                      : 'bg-[#0A0C14] border-[#2E3552] text-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Company Name</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-900'
                      : 'bg-[#0A0C14] border-[#2E3552] text-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Gender Selector */}
          <div>
            <label className="block text-xs font-semibold mb-1.5">Gender Option</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {GENDER_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer truncate ${
                    gender === g
                      ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                      : isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                      : 'bg-[#0A0C14] border-[#2E3552] text-slate-300 hover:border-slate-400'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Searchable Country Selector */}
          <div>
            <label className="block text-xs font-semibold mb-1 flex items-center justify-between">
              <span>Country / Region</span>
              <span className="text-[10px] text-[#06B6D4]">Auto-updates currency & timezone</span>
            </label>
            <SearchableCountrySelector
              selectedCountry={selectedCountry}
              onSelectCountry={(c) => setSelectedCountry(c)}
              isLightMode={isLight}
            />
          </div>

          {/* Phone Number & Industry & Revenue Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Industry</label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-900'
                    : 'bg-[#0A0C14] border-[#2E3552] text-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Phone Number ({selectedCountry.dialCode})
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-900'
                      : 'bg-[#0A0C14] border-[#2E3552] text-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Current Revenue ({selectedCountry.currencyCode})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm font-mono">
                  {selectedCountry.currencySymbol}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={currentMonthlyRevenue}
                  onChange={(e) => setCurrentMonthlyRevenue(e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#00E676] ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-900'
                      : 'bg-[#0A0C14] border-[#2E3552] text-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Monthly Target Goal ({selectedCountry.currencyCode})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm font-mono">
                  {selectedCountry.currencySymbol}
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={monthlyRevenueGoal}
                  onChange={(e) => setMonthlyRevenueGoal(e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#7C3AED] ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-900'
                      : 'bg-[#0A0C14] border-[#2E3552] text-white'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <NeonButton type="submit" size="md">
              <Save className="w-4 h-4" /> Save Profile Changes
            </NeonButton>
          </div>
        </form>
      </GlassCard>

      {/* AI Provider Config */}
      <GlassCard className="space-y-3">
        <h2 className="font-bold text-base flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#A78BFA]" /> Executive AI Engine Selector
        </h2>
        <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Choose which AI model handles your Daily Strategy, Task Generation & Chat Assistant.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {[
            { id: 'GEMINI', name: 'Gemini 3.5 Flash', tag: 'Fastest & Recommended', icon: <Sparkles className="w-5 h-5 text-blue-400" />, activeClass: 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.35)] animate-glow-blue' },
            { id: 'OPENAI', name: 'OpenAI GPT-4o', tag: 'Advanced Reasoning', icon: <Cpu className="w-5 h-5 text-purple-400" />, activeClass: 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(124,58,237,0.35)] animate-glow-purple' },
            { id: 'DEEPSEEK', name: 'DeepSeek R1', tag: 'Deep Logic & Math', icon: <Shield className="w-5 h-5 text-emerald-400" />, activeClass: 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)] animate-glow-green' },
          ].map((provider) => {
            const isSelected = aiProvider === provider.id;
            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => {
                  setAiProvider(provider.id as any);
                  triggerNotification('AI Model Switch', `Switched active provider to ${provider.name}`, 'SYSTEM');
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? provider.activeClass
                    : isLight
                    ? 'bg-slate-100 border-slate-300 hover:border-slate-400'
                    : 'bg-[#0A0C14] border-[#2E3552] hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  {provider.icon}
                  {isSelected && (
                    <Check className={`w-4 h-4 ${provider.id === 'DEEPSEEK' ? 'text-emerald-400' : provider.id === 'GEMINI' ? 'text-blue-400' : 'text-purple-400'}`} />
                  )}
                </div>
                <h3 className="font-bold text-sm mt-2">{provider.name}</h3>
                <p className={`text-[10px] mt-0.5 ${isSelected ? 'opacity-90' : isLight ? 'text-slate-500' : 'text-slate-400'}`}>{provider.tag}</p>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Account Management & Reset */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleResetOnboarding}
          className={`flex-1 py-3 px-4 rounded-2xl border text-xs font-bold text-amber-500 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            isLight
              ? 'bg-white border-slate-300 hover:bg-slate-100'
              : 'bg-[#131726] border-[#2E3552] hover:border-amber-500/50'
          }`}
        >
          <RotateCcw className="w-4 h-4" /> Re-run Setup Onboarding Wizard
        </button>

        <button
          type="button"
          onClick={() => {
            triggerNotification('Signed Out', 'You have been signed out of your workspace.', 'SYSTEM');
            setCurrentScreen('landing');
          }}
          className={`flex-1 py-3 px-4 rounded-2xl border text-xs font-bold text-red-500 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            isLight
              ? 'bg-white border-slate-300 hover:bg-slate-100'
              : 'bg-[#131726] border-[#2E3552] hover:border-red-500/50'
          }`}
        >
          <LogOut className="w-4 h-4" /> Sign Out of TaskFlow AI
        </button>
      </div>
    </div>
  );
};
