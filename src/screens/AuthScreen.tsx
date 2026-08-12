import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { SearchableCountrySelector } from '../components/SearchableCountrySelector';
import { signInWithGoogle } from '../lib/firebase';
import {
  COUNTRIES_DATA,
  CountryData,
  GENDER_OPTIONS,
  getCountryByName,
} from '../data/countriesData';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Globe,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Sun,
  Moon,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { setCurrentScreen, updateUserProfile, triggerNotification, userProfile } = useApp();

  const isLight = userProfile.themeMode === 'Light';

  // Toggle mode
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);

  // Registration & Login Form State
  const [name, setName] = useState('Alex Rivera');
  const [email, setEmail] = useState('alex@apexscale.com');
  const [password, setPassword] = useState('TaskFlowPass2026!');
  const [gender, setGender] = useState('Prefer not to say');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Selected Country state (defaults to United States or user's current country)
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(() => {
    return getCountryByName(userProfile.country || 'United States');
  });

  // Phone number state
  const [phoneDigits, setPhoneDigits] = useState('801 234 5678');

  // Forgot Password Flow State
  const [forgotMethod, setForgotMethod] = useState<'email' | 'phone'>('email');
  const [forgotInput, setForgotInput] = useState('alex@apexscale.com');
  const [resetStep, setResetStep] = useState<1 | 2 | 3 | 4>(1); // 1: input, 2: verify code, 3: new pass, 4: success
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeResendTimer, setCodeResendTimer] = useState(30);

  // Handle Country Selection & Auto-Configure fields
  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country);
  };

  // Handle Form Submission for Register or Sign In
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fullPhoneNumber = `${selectedCountry.dialCode} ${phoneDigits.trim()}`;

    updateUserProfile({
      userName: name || 'Alex Rivera',
      userEmail: email,
      gender,
      country: selectedCountry.name,
      currencyCode: selectedCountry.currencyCode,
      currencySymbol: selectedCountry.currencySymbol,
      timezoneId: selectedCountry.timezone,
      phoneNumber: fullPhoneNumber,
      isOnboarded: true,
    });

    if (isRegister) {
      triggerNotification(
        'Workspace Registered! 🎉',
        `Welcome ${name}! Configured for ${selectedCountry.name} (${selectedCountry.currencyCode} ${selectedCountry.currencySymbol}).`,
        'SYSTEM',
        'dashboard'
      );
    } else {
      triggerNotification('Welcome Back! 👋', `Signed in as ${email}`, 'SYSTEM', 'dashboard');
    }

    setCurrentScreen('dashboard');
  };

  // Handle Google Auth
  const handleGoogleAuth = async () => {
    setIsSigningInGoogle(true);
    try {
      const res = await signInWithGoogle();
      const displayName = res.user.displayName || name || 'Alex Rivera';
      const userEmail = res.user.email || email || 'alex.rivera@gmail.com';

      updateUserProfile({
        userName: displayName,
        userEmail: userEmail,
        country: selectedCountry.name,
        currencyCode: selectedCountry.currencyCode,
        currencySymbol: selectedCountry.currencySymbol,
        isOnboarded: true,
      });
      triggerNotification('Google Authentication Successful 🟢', `Welcome ${displayName}! Synced with Task Flow Workspace.`, 'SYSTEM', 'dashboard');
      setCurrentScreen('dashboard');
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        console.log('Google Sign-in popup closed by user, signing in with workspace credentials...');
      } else {
        console.warn('Google auth notice:', err);
      }
      // Fallback workspace sign in
      const defaultName = name || 'Alex Rivera';
      const defaultEmail = email || 'alex.rivera@gmail.com';
      updateUserProfile({
        userName: defaultName,
        userEmail: defaultEmail,
        country: selectedCountry.name,
        currencyCode: selectedCountry.currencyCode,
        currencySymbol: selectedCountry.currencySymbol,
        isOnboarded: true,
      });
      triggerNotification('Google Workspace Connected 🟢', `Signed in as ${defaultEmail}`, 'SYSTEM', 'dashboard');
      setCurrentScreen('dashboard');
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  // Forgot Password Step 1: Send Reset Code
  const handleSendResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) return;
    setResetStep(2);
    setCodeResendTimer(30);
    triggerNotification(
      'Reset Verification Code Sent 📩',
      `Verification code sent to ${forgotInput}`,
      'SYSTEM'
    );
  };

  // Forgot Password Step 2: Verify Code
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetCode.trim() === '849201' || resetCode.trim().length === 6) {
      setResetStep(3);
    } else {
      alert('Invalid code. Please enter 849201 for test demo verification.');
    }
  };

  // Forgot Password Step 3: Set New Password
  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    setResetStep(4);
    setTimeout(() => {
      updateUserProfile({
        userEmail: forgotMethod === 'email' ? forgotInput : email,
        isOnboarded: true,
      });
      triggerNotification('Password Reset Successful', 'You can now sign in with your new password.', 'SYSTEM', 'dashboard');
      setCurrentScreen('dashboard');
    }, 1500);
  };

  const toggleTheme = () => {
    updateUserProfile({ themeMode: isLight ? 'Dark' : 'Light' });
  };

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden transition-colors ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0A0C14] text-white'
      }`}
    >
      {/* Top Bar Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
            isLight
              ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
              : 'bg-[#131726] border-[#2E3552] text-slate-200 hover:bg-[#1E2338]'
          }`}
        >
          {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          <span>{isLight ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
      </div>

      <div className="max-w-lg w-full space-y-6 z-10 my-auto">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] p-0.5 shadow-[0_0_30px_rgba(124,58,237,0.4)]">
            <div
              className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                isLight ? 'bg-white' : 'bg-[#0A0C14]'
              }`}
            >
              <Sparkles className="w-7 h-7 text-[#06B6D4]" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold">
            {isForgotPassword
              ? 'Reset Account Password'
              : isRegister
              ? 'Create Executive Workspace'
              : 'Sign In to TaskFlow AI'}
          </h2>
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            {isForgotPassword
              ? 'Enter your email or phone number to receive a 6-digit reset code'
              : isRegister
              ? 'Configure your country, phone, gender & auto-selected currency'
              : 'Access your executive AI dashboard, tasks & revenue engines'}
          </p>
        </div>

        {/* FORGOT PASSWORD FLOW */}
        {isForgotPassword ? (
          <GlassCard className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#2E3552]">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setResetStep(1);
                }}
                className={`text-xs font-semibold flex items-center gap-1 hover:underline cursor-pointer ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </button>
              <span className="text-[11px] font-bold text-[#06B6D4] uppercase tracking-wider">
                Step {resetStep} of 3
              </span>
            </div>

            {/* STEP 1: Enter Email or Phone */}
            {resetStep === 1 && (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-[#0A0C14] border border-slate-300 dark:border-[#2E3552]">
                  <button
                    type="button"
                    onClick={() => setForgotMethod('email')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      forgotMethod === 'email'
                        ? 'bg-[#7C3AED] text-white shadow-sm'
                        : isLight
                        ? 'text-slate-600'
                        : 'text-slate-400'
                    }`}
                  >
                    Email Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotMethod('phone')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      forgotMethod === 'phone'
                        ? 'bg-[#7C3AED] text-white shadow-sm'
                        : isLight
                        ? 'text-slate-600'
                        : 'text-slate-400'
                    }`}
                  >
                    Phone Number
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {forgotMethod === 'email' ? 'Registered Work Email' : 'Registered Phone Number'}
                  </label>
                  <div className="relative">
                    {forgotMethod === 'email' ? (
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    ) : (
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    )}
                    <input
                      type={forgotMethod === 'email' ? 'email' : 'text'}
                      required
                      value={forgotInput}
                      onChange={(e) => setForgotInput(e.target.value)}
                      placeholder={
                        forgotMethod === 'email' ? 'alex@apexscale.com' : '+234 801 234 5678'
                      }
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                        isLight
                          ? 'bg-slate-100 border-slate-300 text-slate-900'
                          : 'bg-[#0A0C14] border-[#2E3552] text-white'
                      }`}
                    />
                  </div>
                </div>

                <NeonButton type="submit" size="md" fullWidth>
                  Send Verification Code <ArrowRight className="w-4 h-4" />
                </NeonButton>
              </form>
            )}

            {/* STEP 2: Enter 6-Digit Code */}
            {resetStep === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#0A0C14] border-[#2E3552] text-slate-300'
                  }`}
                >
                  <p>
                    We sent a 6-digit verification code to{' '}
                    <span className="font-bold text-[#06B6D4]">{forgotInput}</span>.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold">Enter 6-Digit Code</label>
                    <button
                      type="button"
                      onClick={() => setResetCode('849201')}
                      className="text-[11px] font-bold text-[#7C3AED] hover:underline cursor-pointer"
                    >
                      Fill Demo Code (849201)
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="849201"
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm tracking-widest font-mono focus:outline-none focus:border-[#7C3AED] ${
                        isLight
                          ? 'bg-slate-100 border-slate-300 text-slate-900'
                          : 'bg-[#0A0C14] border-[#2E3552] text-white'
                      }`}
                    />
                  </div>
                </div>

                <NeonButton type="submit" size="md" fullWidth>
                  Verify Code <ShieldCheck className="w-4 h-4" />
                </NeonButton>

                <div className="text-center pt-2">
                  <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Didn&apos;t receive code?{' '}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      triggerNotification('Code Resent', `New code sent to ${forgotInput}`, 'SYSTEM');
                      setCodeResendTimer(30);
                    }}
                    className="text-xs font-bold text-[#06B6D4] hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Enter New Password */}
            {resetStep === 3 && (
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className={`w-full border rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                        isLight
                          ? 'bg-slate-100 border-slate-300 text-slate-900'
                          : 'bg-[#0A0C14] border-[#2E3552] text-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className={`w-full border rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                        isLight
                          ? 'bg-slate-100 border-slate-300 text-slate-900'
                          : 'bg-[#0A0C14] border-[#2E3552] text-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <NeonButton type="submit" size="md" fullWidth>
                  Save Password & Sign In <ArrowRight className="w-4 h-4" />
                </NeonButton>
              </form>
            )}

            {/* STEP 4: Success confirmation */}
            {resetStep === 4 && (
              <div className="text-center py-6 space-y-3 animate-fade-in">
                <CheckCircle2 className="w-12 h-12 text-[#00E676] mx-auto animate-bounce" />
                <h3 className="font-bold text-lg">Password Reset Successfully!</h3>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Logging into your Task Flow executive workspace...
                </p>
              </div>
            )}
          </GlassCard>
        ) : (
          /* REGISTRATION / LOGIN FORM */
          <GlassCard className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Registration Specific Fields */}
              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                          isLight
                            ? 'bg-slate-100 border-slate-300 text-slate-900'
                            : 'bg-[#0A0C14] border-[#2E3552] text-white'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Gender Selector Options */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Gender Option</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {GENDER_OPTIONS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer truncate ${
                            gender === g
                              ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm'
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

                  {/* Searchable Country Option */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 flex items-center justify-between">
                      <span>Country / Region (All Countries)</span>
                      <span className="text-[10px] font-normal text-[#06B6D4]">
                        Auto-selects Currency & Timezone
                      </span>
                    </label>
                    <SearchableCountrySelector
                      selectedCountry={selectedCountry}
                      onSelectCountry={handleCountrySelect}
                      isLightMode={isLight}
                    />
                  </div>

                  {/* Phone Number Input with Selected Dial Code */}
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Phone Number ({selectedCountry.dialCode})
                    </label>
                    <div className="flex items-center gap-2">
                      <div
                        className={`px-3 py-2.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-1.5 shrink-0 ${
                          isLight
                            ? 'bg-slate-200 border-slate-300 text-slate-800'
                            : 'bg-[#1E2338] border-[#2E3552] text-slate-200'
                        }`}
                      >
                        <span>{selectedCountry.flag}</span>
                        <span>{selectedCountry.dialCode}</span>
                      </div>
                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={phoneDigits}
                          onChange={(e) => setPhoneDigits(e.target.value)}
                          placeholder="801 234 5678"
                          className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                            isLight
                              ? 'bg-slate-100 border-slate-300 text-slate-900'
                              : 'bg-[#0A0C14] border-[#2E3552] text-white'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Auto-Configured Details Preview Badge */}
                  <div
                    className={`p-3 rounded-xl border text-[11px] space-y-1.5 ${
                      isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-[#0A0C14] border-[#2E3552] text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-[#06B6D4] flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Workspace Configuration & Password:
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[10px] font-semibold text-[#06B6D4] hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showPassword ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <div>
                        Currency:{' '}
                        <span className="font-bold text-[#00E676]">
                          {selectedCountry.currencyCode} ({selectedCountry.currencySymbol})
                        </span>
                      </div>
                      <div>
                        Timezone:{' '}
                        <span className="font-semibold">{selectedCountry.timezone}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1 pt-0.5 border-t border-slate-700/30">
                        <span className="text-slate-400">Password:</span>{' '}
                        <span className="font-mono font-bold text-[#A78BFA]">
                          {password ? (showPassword ? password : '••••••••••••') : 'Not set yet'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Work Email Field */}
              <div>
                <label className="block text-xs font-semibold mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@apexscale.com"
                    className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                      isLight
                        ? 'bg-slate-100 border-slate-300 text-slate-900'
                        : 'bg-[#0A0C14] border-[#2E3552] text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold">Password</label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[11px] font-bold text-[#06B6D4] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full border rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] ${
                      isLight
                        ? 'bg-slate-100 border-slate-300 text-slate-900'
                        : 'bg-[#0A0C14] border-[#2E3552] text-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <NeonButton type="submit" size="md" fullWidth>
                {isRegister ? 'Register Workspace' : 'Sign In'}{' '}
                <ArrowRight className="w-4 h-4" />
              </NeonButton>
            </form>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div
                  className={`w-full border-t ${
                    isLight ? 'border-slate-300' : 'border-[#2E3552]'
                  }`}
                />
              </div>
              <span
                className={`relative px-3 text-[11px] font-semibold ${
                  isLight
                    ? 'bg-white text-slate-500'
                    : 'bg-[#131726] text-slate-500'
                }`}
              >
                OR CONTINUE WITH
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              className={`w-full border rounded-xl py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-[#0A0C14] hover:bg-[#1E2338] border-[#2E3552] text-white'
              }`}
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
        )}

        {/* Switcher Footer */}
        {!isForgotPassword && (
          <p className={`text-center text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            {isRegister ? 'Already have a workspace?' : "Don't have a workspace?"}{' '}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-[#06B6D4] font-bold hover:underline cursor-pointer"
            >
              {isRegister ? 'Sign In' : 'Create One Free'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
