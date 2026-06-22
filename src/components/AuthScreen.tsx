import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Key, Mail, Lock, User as UserIcon, BookOpen, ArrowRight, ShieldCheck, Heart, ShieldAlert } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { signUpUser, signInUser, signInWithOAuth } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  
  // Form values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState<'client' | 'freelancer'>('client');
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isRegister) {
        const defaultBio = bio.trim() || (role === 'client' ? "Creative director looking for design solutions." : "Creative professional designer.");
        const { error } = await signUpUser(email, password, fullName, role, defaultBio);
        if (error) throw error;
        setSuccessMsg("🚀 Account registered successfully! A verification email has been sent. Please confirm your email, then log in here. (Tip: You can disable 'Confirm email' in your Supabase Authentication settings to bypass this and log in immediately!)");
        setIsRegister(false); // Move to login tab so they can try to authenticate
      } else {
        const { error } = await signInUser(email, password);
        if (error) throw error;
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || "An authentication error occurred.";
      if (msg.toLowerCase().includes('confirm') || msg.toLowerCase().includes('verified')) {
        msg = "Email not verified yet! 📧 Please click the confirmation link in your inbox, or toggle off 'Confirm email' in your Supabase Auth provider settings to log in instantly.";
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedOAuth = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await signInWithOAuth(provider);
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to authenticate with ${provider}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-bg-dark relative justify-center items-center font-sans">
      {/* Playful Floating background elements */}
      <div className="floating-bubble-1 -top-24 -left-24" />
      <div className="floating-bubble-2 -bottom-32 -right-32" />
      <div className="floating-bubble-3 top-1/3 left-1/4" />
      <div className="floating-bubble-4 bottom-1/4 right-1/3" />

      {/* Main card box container */}
      <div className="w-full max-w-[900px] min-h-0 md:min-h-[580px] grid grid-cols-1 md:grid-cols-12 gap-0 rounded-[2.5rem] overflow-hidden z-10 p-4 m-4 relative animate-scale-up glass-panel glass-panel-hover">
        
        {/* Left column: Welcome Vibe banner (Frosted Glass sheet glowing from behind) */}
        <div className="hidden md:flex md:col-span-5 bg-white/[0.02] backdrop-blur-xl p-8 text-white rounded-[2rem] flex flex-col justify-between relative overflow-hidden border border-white/10 shadow-lg shadow-black/40">
          {/* Subtle inside glowing spheres for high-end refraction */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-brand-purple/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-brand-cyan/20 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-brand-rose/10 blur-[80px] pointer-events-none" />

          {/* Top Logo */}
          <div className="flex items-center gap-2.5 z-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-cyan flex items-center justify-center font-black text-sm text-white shadow-lg shadow-brand-purple/35 animate-bounce">
              💬
            </div>
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-brand-cyan to-brand-purple bg-clip-text text-transparent" style={{ fontFamily: 'Righteous' }}>
              Chatable
            </span>
          </div>

          {/* Message / Tagline */}
          <div className="my-10 flex flex-col gap-4 z-10">
            <h1 className="text-3xl font-black leading-tight tracking-tight text-white animate-scale-up" style={{ fontFamily: 'Syne' }}>
              Where ideas become <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-amber to-brand-rose underline decoration-wavy decoration-brand-amber">design reality</span>.
            </h1>
            <p className="text-xs text-white/75 leading-relaxed max-w-[240px] font-medium">
              Chatable translates natural request parameters into professional coordinates, bridging client goals with builder briefs.
            </p>
            
            {/* Playful Interactive Mini Badge */}
            <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-white/[0.01] shadow-inner mt-4 z-10 flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                <span className="text-[9px] text-brand-cyan font-bold uppercase tracking-wider">Workspace Active</span>
              </div>
              <span className="text-[10px] text-white/90 leading-relaxed font-medium">
                "Translate natural language request parameters into professional briefs and visuals instantly."
              </span>
            </div>
          </div>

          {/* Bottom Footer Info */}
          <div className="flex items-center gap-2 text-[10px] text-white/60 z-10 mt-auto font-semibold">
            <Heart size={10} className="text-brand-rose animate-bounce fill-brand-rose" />
            <span>Built for creative professionals & clients</span>
          </div>
        </div>

        {/* Right column: Interactive form */}
        <div className="col-span-12 md:col-span-7 p-6 md:p-8 flex flex-col justify-center bg-transparent z-10">
          {/* Mobile Logo Header */}
          <div className="flex items-center gap-2 mb-6 md:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-cyan flex items-center justify-center font-black text-xs text-white">
              💬
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white" style={{ fontFamily: 'Righteous' }}>
              Chatable
            </span>
          </div>

          {/* Header titles toggle switcher */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'Syne' }}>
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h2>
              <span className="text-xs text-gray-400 font-medium">
                {isRegister ? 'Register your workspace profile' : 'Sign in to access projects'}
              </span>
            </div>

            <button
              onClick={() => { setIsRegister(!isRegister); setErrorMsg(null); setSuccessMsg(null); }}
              className="text-xs text-brand-cyan hover:text-brand-cyan/85 font-extrabold border-b-2 border-dashed border-brand-cyan/35 hover:border-brand-cyan transition-all cursor-pointer"
            >
              {isRegister ? 'Log In Instead' : 'Create Account'}
            </button>
          </div>

          {/* Error and Success alerts styled as frosted glass panels */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-red-400 font-semibold mb-4 animate-shake backdrop-blur-md">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-green-400 font-semibold mb-4 animate-scale-up backdrop-blur-md">
              <ShieldCheck size={16} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <>
                {/* Registration inputs */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Sarah Chen"
                      className="w-full glass-input rounded-2xl pl-10 pr-4 py-3 text-xs text-white"
                    />
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
                  </div>
                </div>

                {/* Role selection cards */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Select Workspace Role</label>
                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      type="button"
                      onClick={() => setRole('client')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                        role === 'client'
                          ? 'bg-brand-cyan/10 border-brand-cyan text-white shadow-lg shadow-brand-cyan/20 scale-[1.02]'
                          : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/10 hover:bg-white/[0.04] hover:scale-[1.01]'
                      }`}
                    >
                      <span className="text-xs font-black text-white flex items-center gap-1.5" style={{ fontFamily: 'Outfit' }}>
                        🚀 Client
                      </span>
                      <span className="text-[9px] leading-relaxed text-gray-400 font-medium">
                        I need to translate ideas into structured visual parameters.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('freelancer')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                        role === 'freelancer'
                          ? 'bg-brand-purple/10 border-brand-purple text-white shadow-lg shadow-brand-purple/20 scale-[1.02]'
                          : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/10 hover:bg-white/[0.04] hover:scale-[1.01]'
                      }`}
                    >
                      <span className="text-xs font-black text-white flex items-center gap-1.5" style={{ fontFamily: 'Outfit' }}>
                        🎨 Freelancer
                      </span>
                      <span className="text-[9px] leading-relaxed text-gray-400 font-medium">
                        I want structured briefings, payments escrow, and task boards.
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full glass-input rounded-2xl pl-10 pr-4 py-3 text-xs text-white"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input rounded-2xl pl-10 pr-4 py-3 text-xs text-white"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
              </div>
            </div>

            {isRegister && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Short Bio (Optional)</label>
                <div className="relative">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={role === 'client' ? "Creative director building a new brand..." : "Identity logo designer..."}
                    className="w-full glass-input rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white resize-none h-[65px]"
                  />
                  <BookOpen className="absolute left-3.5 top-4 text-gray-500" size={13} />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 btn-metallic text-white font-bold text-xs rounded-2xl flex justify-center items-center gap-1.5 cursor-pointer font-sans"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  <span>{isRegister ? 'Generate Workspace Account' : 'Authenticate Credentials'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* OAuth Simulation Divider */}
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-[9px] text-gray-500 font-bold uppercase tracking-wider">Test OAuth Portals</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <button
              onClick={() => handleSimulatedOAuth('google')}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/15 rounded-2xl text-xs text-gray-300 font-bold transition-all cursor-pointer btn-playful shadow-md"
            >
              <Sparkles size={13} className="text-brand-purple" />
              <span>Google Signup</span>
            </button>
            <button
              onClick={() => handleSimulatedOAuth('apple')}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/15 rounded-2xl text-xs text-gray-300 font-bold transition-all cursor-pointer btn-playful shadow-md"
            >
              <Key size={13} className="text-brand-cyan" />
              <span>Apple Signup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
