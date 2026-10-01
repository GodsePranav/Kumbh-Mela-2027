import React, { useState, useEffect } from 'react';
import { LANGUAGES } from '../data/mockData';

type AuthStep = 'splash' | 'language' | 'login' | 'register' | 'otp' | 'forgot';

interface SplashLanguageAuthProps {
  onAuthComplete: (user: { name: string; email: string; language: string }) => void;
}

export default function SplashLanguageAuth({ onAuthComplete }: SplashLanguageAuthProps) {
  const [step, setStep] = useState<AuthStep>('splash');
  const [selectedLang, setSelectedLang] = useState('en');
  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', password: '', confirmPassword: '',
    emergencyContact: '', otp: ['', '', '', '', '', ''],
    forgotMobile: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStep('language'), 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData(f => ({ ...f, otp: newOtp }));
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleRegister = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.mobile.match(/^[6-9]\d{9}$/)) errs.mobile = 'Enter valid 10-digit mobile number';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Enter valid email address';
    if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!formData.emergencyContact.match(/^[6-9]\d{9}$/)) errs.emergencyContact = 'Enter valid emergency contact';
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      setTimeout(() => { setLoading(false); setOtpSent(true); setCountdown(30); setStep('otp'); }, 1500);
    }
  };

  const handleVerifyOtp = () => {
    const otp = formData.otp.join('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (otp === '123456' || otp.length === 6) {
        onAuthComplete({ name: formData.name || 'Pilgrim', email: formData.email, language: selectedLang });
      } else {
        setErrors({ otp: 'Invalid OTP. Try 123456 for demo.' });
      }
    }, 1200);
  };

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onAuthComplete({ name: 'Ramesh Kumar', email: formData.email || 'ramesh@example.com', language: selectedLang });
    }, 1200);
  };

  // SPLASH SCREEN
  if (step === 'splash') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1E1B4B 0%, #312E81 40%, #E8702A 100%)' }}>
        <div className="relative flex flex-col items-center gap-6 animate-float-up">
          {/* Decorative circles */}
          <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-orange-400/10" />
          {/* Kumbh Kalash Icon */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center shadow-2xl border border-white/20">
              <span className="text-6xl">🪔</span>
            </div>
            <div className="absolute -inset-2 rounded-full border-2 border-orange-300/30 animate-ping" />
          </div>
          <div className="text-center px-8">
            <h1 className="text-4xl font-bold text-white tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Kumbh Mela
            </h1>
            <p className="text-orange-200 text-lg font-medium mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Nashik 2027
            </p>
            <p className="text-white/60 text-sm mt-3">Smart Tourism Platform</p>
          </div>
          <div className="flex gap-1.5 mt-4">
            <div className="w-8 h-1.5 rounded-full bg-white" />
            <div className="w-2 h-1.5 rounded-full bg-white/40" />
            <div className="w-2 h-1.5 rounded-full bg-white/40" />
          </div>
        </div>
        <p className="absolute bottom-12 text-white/40 text-xs tracking-widest uppercase">
          Government of Maharashtra
        </p>
      </div>
    );
  }

  // LANGUAGE SELECTION
  if (step === 'language') {
    return (
      <div className="fixed inset-0 flex flex-col" style={{ background: '#FEFAF4' }}>
        <div className="gradient-saffron px-6 pt-14 pb-10">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins' }}>Choose Language</h1>
          <p className="text-orange-100 text-sm mt-1">भाषा चुनें / भाषा निवडा</p>
        </div>
        <div className="flex-1 px-5 py-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all category-card ${
                  selectedLang === lang.code
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-stone-200 bg-white'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-left">
                  <p className="font-semibold text-stone-800 text-sm" style={{ fontFamily: 'Poppins' }}>{lang.nativeName}</p>
                  <p className="text-xs text-stone-500">{lang.name}</p>
                </div>
                {selectedLang === lang.code && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="px-5 pb-8">
          <button onClick={() => setStep('login')}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base gradient-saffron shadow-lg transition-all active:scale-98"
            style={{ fontFamily: 'Poppins' }}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  // LOGIN
  if (step === 'login') {
    return (
      <div className="fixed inset-0 flex flex-col" style={{ background: '#FEFAF4' }}>
        <div className="gradient-indigo px-6 pt-14 pb-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-orange-400/10 translate-y-1/2 -translate-x-1/3" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <span className="text-3xl">🪔</span>
            </div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins' }}>Welcome Back</h1>
            <p className="text-indigo-200 text-sm mt-1">Sign in to Kumbh Mela 2027</p>
          </div>
        </div>
        <div className="flex-1 px-5 py-6 overflow-y-auto">
          <div className="space-y-4">
            <InputField label="Mobile / Email" value={formData.email}
              onChange={v => setFormData(f => ({ ...f, email: v }))}
              type="email" placeholder="Enter mobile number or email" error={errors.email} />
            <div className="relative">
              <InputField label="Password" value={formData.password}
                onChange={v => setFormData(f => ({ ...f, password: v }))}
                type={showPassword ? 'text' : 'password'} placeholder="Enter password" error={errors.password} />
              <button onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-9 text-stone-400 text-xs font-medium">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="text-right">
              <button onClick={() => setStep('forgot')} className="text-orange-600 text-sm font-medium">
                Forgot Password?
              </button>
            </div>
          </div>
          <button onClick={handleLogin}
            className="w-full mt-6 py-4 rounded-2xl text-white font-semibold gradient-saffron shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
            style={{ fontFamily: 'Poppins' }}>
            {loading ? <LoadingSpinner /> : 'Sign In'}
          </button>
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-stone-400 text-xs">or</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>
          <div className="space-y-3">
            <SocialButton icon="🇮🇳" label="Continue with DigiLocker" />
            <SocialButton icon="📱" label="Continue with OTP" onClick={() => setStep('register')} />
          </div>
          <p className="text-center text-stone-500 text-sm mt-6">
            New to Kumbh Mela 2027?{' '}
            <button onClick={() => setStep('register')} className="text-orange-600 font-semibold">Register Now</button>
          </p>
        </div>
      </div>
    );
  }

  // REGISTER
  if (step === 'register') {
    return (
      <div className="fixed inset-0 flex flex-col" style={{ background: '#FEFAF4' }}>
        <div className="gradient-saffron px-6 pt-14 pb-10 relative overflow-hidden">
          <button onClick={() => setStep('login')} className="mb-4 flex items-center gap-1 text-white/80 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins' }}>Create Account</h1>
          <p className="text-orange-100 text-sm mt-1">Register for Kumbh Mela 2027</p>
        </div>
        <div className="flex-1 px-5 py-5 overflow-y-auto pb-24">
          <div className="space-y-4">
            <InputField label="Full Name *" value={formData.name}
              onChange={v => setFormData(f => ({ ...f, name: v }))}
              placeholder="As per Aadhaar card" error={errors.name} />
            <InputField label="Mobile Number *" value={formData.mobile}
              onChange={v => setFormData(f => ({ ...f, mobile: v }))}
              type="tel" placeholder="10-digit mobile number" error={errors.mobile} />
            <InputField label="Email Address *" value={formData.email}
              onChange={v => setFormData(f => ({ ...f, email: v }))}
              type="email" placeholder="your@email.com" error={errors.email} />
            <div className="relative">
              <InputField label="Password *" value={formData.password}
                onChange={v => setFormData(f => ({ ...f, password: v }))}
                type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" error={errors.password} />
              <button onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-9 text-stone-400 text-xs font-medium">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <InputField label="Confirm Password *" value={formData.confirmPassword}
              onChange={v => setFormData(f => ({ ...f, confirmPassword: v }))}
              type="password" placeholder="Re-enter password" error={errors.confirmPassword} />
            <InputField label="Emergency Contact *" value={formData.emergencyContact}
              onChange={v => setFormData(f => ({ ...f, emergencyContact: v }))}
              type="tel" placeholder="Family member's mobile number" error={errors.emergencyContact} />
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1.5">Preferred Language</label>
              <select value={selectedLang} onChange={e => setSelectedLang(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-white text-stone-700 text-sm focus:border-orange-500">
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.nativeName} ({l.name})</option>)}
              </select>
            </div>
          </div>
          <p className="text-xs text-stone-400 mt-4 leading-relaxed">
            By registering, you agree to our Terms of Service and Privacy Policy. Your data is secured as per IT Act 2000.
          </p>
          <button onClick={handleRegister}
            className="w-full mt-5 py-4 rounded-2xl text-white font-semibold gradient-saffron shadow-md active:scale-98 flex items-center justify-center gap-2"
            style={{ fontFamily: 'Poppins' }}>
            {loading ? <LoadingSpinner /> : 'Send OTP & Register'}
          </button>
          <p className="text-center text-stone-500 text-sm mt-4">
            Already registered?{' '}
            <button onClick={() => setStep('login')} className="text-orange-600 font-semibold">Sign In</button>
          </p>
        </div>
      </div>
    );
  }

  // OTP VERIFICATION
  if (step === 'otp') {
    return (
      <div className="fixed inset-0 flex flex-col" style={{ background: '#FEFAF4' }}>
        <div className="gradient-saffron px-6 pt-14 pb-10">
          <button onClick={() => setStep('register')} className="mb-4 flex items-center gap-1 text-white/80 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
            <span className="text-3xl">📱</span>
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins' }}>Verify OTP</h1>
          <p className="text-orange-100 text-sm mt-1">
            Sent to +91 {formData.mobile || 'XXXXXXXXXX'}
          </p>
        </div>
        <div className="flex-1 px-5 py-8">
          <p className="text-stone-600 text-sm text-center mb-6">Enter the 6-digit verification code</p>
          <div className="flex gap-3 justify-center">
            {formData.otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all ${
                  errors.otp ? 'border-red-400 bg-red-50' : digit ? 'border-orange-500 bg-orange-50' : 'border-stone-200 bg-white'
                }`}
                style={{ fontFamily: 'Poppins' }}
              />
            ))}
          </div>
          {errors.otp && <p className="text-red-500 text-xs text-center mt-2">{errors.otp}</p>}
          <div className="text-center mt-4">
            {countdown > 0 ? (
              <p className="text-stone-500 text-sm">Resend OTP in <span className="font-semibold text-orange-600">{countdown}s</span></p>
            ) : (
              <button onClick={() => setCountdown(30)} className="text-orange-600 text-sm font-semibold">Resend OTP</button>
            )}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-700 text-center">🔒 Demo: Enter any 6 digits to proceed</p>
          </div>
          <button onClick={handleVerifyOtp}
            className="w-full mt-6 py-4 rounded-2xl text-white font-semibold gradient-saffron shadow-md active:scale-98 flex items-center justify-center gap-2"
            style={{ fontFamily: 'Poppins' }}>
            {loading ? <LoadingSpinner /> : 'Verify & Continue'}
          </button>
        </div>
      </div>
    );
  }

  // FORGOT PASSWORD
  if (step === 'forgot') {
    return (
      <div className="fixed inset-0 flex flex-col" style={{ background: '#FEFAF4' }}>
        <div className="gradient-indigo px-6 pt-14 pb-10">
          <button onClick={() => setStep('login')} className="mb-4 flex items-center gap-1 text-white/80 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Login
          </button>
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins' }}>Reset Password</h1>
          <p className="text-indigo-200 text-sm mt-1">We'll send a reset link to your mobile</p>
        </div>
        <div className="flex-1 px-5 py-8">
          <InputField label="Registered Mobile Number" value={formData.forgotMobile}
            onChange={v => setFormData(f => ({ ...f, forgotMobile: v }))}
            type="tel" placeholder="Enter your registered mobile" />
          <button onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); setStep('otp'); }, 1200); }}
            className="w-full mt-6 py-4 rounded-2xl text-white font-semibold gradient-saffron shadow-md flex items-center justify-center gap-2"
            style={{ fontFamily: 'Poppins' }}>
            {loading ? <LoadingSpinner /> : 'Send Reset OTP'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function InputField({ label, value, onChange, type = 'text', placeholder, error }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; error?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-stone-700 block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-xl bg-white text-stone-800 text-sm placeholder-stone-400 transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-100 ${
          error ? 'border-red-400 bg-red-50' : 'border-stone-200'
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function SocialButton({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-stone-200 bg-white text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors">
      <span className="text-xl">{icon}</span>
      {label}
    </button>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
