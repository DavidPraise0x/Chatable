import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { TranslatedBrief } from '../context/AppContext';
import { Sparkles, Check, Eye, ArrowRight, BookOpen } from 'lucide-react';

const DEFAULT_BRIEF: TranslatedBrief = {
  id: 'brief-default',
  projectId: 'proj-default',
  originalPrompt: 'I want my brand to feel modern and premium',
  objective: 'Design a contemporary brand identity combining clean aesthetics with premium visual accents.',
  styleKeywords: ['Modern', 'Premium', 'Clean', 'Elegant'],
  colors: ['#0d0822', '#af52de', '#5ac8fa', '#f3f4f6'],
  typography: 'Outfit & Inter (Geometric Sans-Serif)',
  targetAudience: 'Ages 25–45, quality-conscious digital consumers.',
  timestamp: new Date().toISOString()
};

// Sleeping Astronaut Vector SVG component for empty history states
const SleepingAstronaut: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-6 text-center gap-4 select-none">
    <svg width="130" height="130" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-bounce" style={{ animationDuration: '5s' }}>
      {/* Background space stars */}
      <circle cx="20" cy="30" r="1.5" fill="#5ac8fa" opacity="0.6"/>
      <circle cx="130" cy="40" r="1" fill="#af52de" opacity="0.5"/>
      <circle cx="120" cy="110" r="1.5" fill="#ffcc00" opacity="0.7"/>
      <circle cx="35" cy="120" r="2" fill="#ff2d55" opacity="0.6"/>
      
      {/* Floating Sleep Zzz */}
      <path d="M105 45h6l-6 6h6" stroke="#ffcc00" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" style={{ animationDelay: '0s' }}/>
      <path d="M115 32h4l-4 4h4" stroke="#af52de" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" style={{ animationDelay: '0.4s' }}/>
      
      {/* Orbit Line */}
      <circle cx="75" cy="75" r="45" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" strokeDasharray="3 3"/>
      
      {/* Sleeping Space Astronaut */}
      <g transform="translate(12, 12)">
        {/* Oxygen Pack */}
        <rect x="36" y="55" width="16" height="30" rx="4" fill="#202028" stroke="rgba(255,255,255,0.08)"/>
        
        {/* Suit Legs */}
        <rect x="51" y="82" width="10" height="12" rx="3" fill="#ffffff"/>
        <rect x="65" y="82" width="10" height="12" rx="3" fill="#ffffff"/>
        
        {/* Suit Body */}
        <rect x="46" y="48" width="34" height="36" rx="10" fill="#e5e7eb" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
        
        {/* Chest Panel */}
        <rect x="53" y="56" width="20" height="10" rx="2" fill="#18181f"/>
        <circle cx="58" cy="61" r="1.5" fill="#ff2d55" className="animate-pulse"/>
        <circle cx="63" cy="61" r="1.5" fill="#5ac8fa"/>
        <circle cx="68" cy="61" r="1.5" fill="#ffcc00"/>
        
        {/* Helmet */}
        <circle cx="63" cy="33" r="18" fill="#ffffff" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        
        {/* Helmet Visor */}
        <path d="M50 32c0-7 5-11 13-11s13 4 13 11-5 9-13 9-13-2-13-9z" fill="#14141a" stroke="#5ac8fa" strokeWidth="1.2"/>
        {/* Sleepy eye curves */}
        <path d="M56 32c1 1.5 3 1.5 4 0" stroke="#ffffff" strokeWidth="1" strokeLinecap="round"/>
        <path d="M66 32c1 1.5 3 1.5 4 0" stroke="#ffffff" strokeWidth="1" strokeLinecap="round"/>
        
        {/* Floating Arms */}
        <rect x="36" y="52" width="10" height="18" rx="5" fill="#ffffff" transform="rotate(-25 36 52)"/>
        <rect x="78" y="52" width="10" height="18" rx="5" fill="#ffffff" transform="rotate(25 78 52)"/>
      </g>
    </svg>
    <div className="flex flex-col gap-1">
      <span className="text-xs text-white font-extrabold tracking-tight">Your creative journey is waiting...</span>
      <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">No briefs yet!</span>
    </div>
  </div>
);

export const BriefTranslator: React.FC = () => {
  const { currentUser, translateClientBrief, briefs, uploadProjectFile } = useApp();
  const [prompt, setPrompt] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeBrief, setActiveBrief] = useState<TranslatedBrief>(briefs[0] || DEFAULT_BRIEF);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Sync activeBrief to state when a new brief is translated/fetched
  React.useEffect(() => {
    if (briefs.length > 0) {
      setActiveBrief(briefs[0]);
    }
  }, [briefs]);

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsTranslating(true);
    setIsApproved(false);
    try {
      const result = await translateClientBrief(prompt);
      setActiveBrief(result);
      setPrompt('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  const copyColorToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const handleApproveBrief = () => {
    setIsApproved(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    
    // Simulate exporting the brief as a PDF deliverable
    const briefDocContent = `
========================================
           CHATABLE AI BRIEF
========================================
Project ID: ${activeBrief.projectId}
Created: ${new Date(activeBrief.timestamp).toLocaleDateString()}
Original Request: "${activeBrief.originalPrompt}"

1. OBJECTIVE:
   ${activeBrief.objective}

2. STYLE DIRECTION:
   ${activeBrief.styleKeywords.join(', ')}

3. TYPOGRAPHY:
   ${activeBrief.typography}

4. COLOR SCHEME:
   ${activeBrief.colors.join(', ')}

5. TARGET AUDIENCE:
   ${activeBrief.targetAudience}
========================================
    `;
    
    const blob = new Blob([briefDocContent], { type: 'text/plain' });
    const mockFileUrl = URL.createObjectURL(blob);
    uploadProjectFile(
      `AI_Brief_Approval_${activeBrief.id.substring(0, 6)}.txt`,
      'text/plain',
      `${(blob.size / 1024).toFixed(1)} KB`,
      mockFileUrl
    );
  };

  const presets = [
    "I want my logo to feel luxurious and youthful",
    "Minimal tech feel with coding font accents",
    "Bold gradients and dynamic elements for Gen Z wellness app"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto max-h-[calc(100vh-80px)] relative">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
          {Array.from({ length: 45 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* LEFT COLUMN: Brief Input & Brief History */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {currentUser?.role === 'client' ? (
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-purple/20 text-brand-purple rounded-lg">
                <Sparkles size={22} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">AI Brief Translator</h2>
                <p className="text-xs text-gray-400">Describe your project casually; AI will build the industry brief.</p>
              </div>
            </div>

            <form onSubmit={handleTranslate} className="flex flex-col gap-4 mt-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='e.g., "I want a tech website with dark mode, glowing teal highlights, and very clean structure..."'
                className="glass-input w-full min-h-[110px] rounded-xl p-4 text-sm text-white placeholder-gray-500 resize-none"
                disabled={isTranslating}
              />
              <button
                type="submit"
                disabled={isTranslating || !prompt.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 btn-metallic text-xs font-bold rounded-xl cursor-pointer"
              >
                {isTranslating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI Interpreting Details...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Translate Brief</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Try Presets:</span>
              <div className="flex flex-col gap-2">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(preset)}
                    className="text-left text-xs bg-surface-card/65 hover:bg-surface-card border border-border-dark hover:border-brand-purple/40 p-2.5 rounded-lg text-gray-300 transition-all cursor-pointer"
                  >
                    "{preset}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-cyan/20 text-brand-cyan rounded-lg">
                <BookOpen size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Client Briefings</h2>
                <p className="text-xs text-gray-400">View briefs generated and approved by the client.</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mt-2 leading-relaxed">
              Below are the technical translations of the client's creative ideas. Use these coordinates to guide your styles, colors, and layout design.
            </p>
          </div>
        )}

        {/* Translation History List */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 flex-1">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Brief History</h3>
          {briefs.length === 0 ? (
            <SleepingAstronaut />
          ) : (
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-1">
              {briefs.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setActiveBrief(b); setIsApproved(false); }}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    activeBrief.id === b.id
                      ? 'bg-brand-purple/10 border-brand-purple/50 text-white'
                      : 'bg-surface-dark/50 border-border-dark text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <span className="font-semibold text-xs text-white truncate w-full">
                    "{b.originalPrompt}"
                  </span>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 w-full mt-1">
                    <span>{b.styleKeywords[0]} • {b.styleKeywords[1]}</span>
                    <span>{new Date(b.timestamp).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Typography showcase, Color swatches, and Dynamic Viewport */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {isTranslating ? (
          <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6 items-center justify-center min-h-[450px] animate-pulse">
            <div className="p-4 bg-brand-purple/20 text-brand-purple rounded-full animate-spin border-4 border-dashed border-brand-purple" />
            <div className="flex flex-col items-center text-center gap-2 max-w-sm">
              <h3 className="text-lg font-bold text-white">AI Brief Machine at Work</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Parsing descriptive language, selecting CSS swatches, building style parameters, and composing visual structures...
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Split Top row for Typography Showcase and Color Swatches */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Typography Showcase Card */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 justify-between relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-brand-purple font-semibold uppercase tracking-wider">Typography Family</span>
                  <span className="text-[10px] text-gray-500 font-mono">Outfit & Inter</span>
                </div>
                <div className="flex flex-col gap-2.5 mt-2 bg-black/30 p-4.5 rounded-xl border border-border-dark">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-extrabold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>
                      {activeBrief.typography.split('&')[0]?.trim() || 'Outfit'}
                    </span>
                    <span className="text-[9px] text-gray-500 font-serif italic">Clean-Serif hybrid</span>
                  </div>
                  <div className="text-[9px] text-brand-cyan font-bold uppercase tracking-wider mt-1">
                    {activeBrief.typography.split('&')[1]?.split('(')[0]?.trim() || 'Inter'} Type by
                  </div>
                  <div 
                    className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-brand-rose via-brand-purple to-brand-cyan uppercase"
                    style={{ fontFamily: 'Righteous', letterSpacing: '1px' }}
                  >
                    GROOVY DISPLAY
                  </div>
                </div>
              </div>

              {/* Color Swatches Palette Widget */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-brand-cyan font-semibold uppercase tracking-wider">Color Palette</span>
                  {copiedColor ? (
                    <span className="text-[9px] text-green-400 font-bold">Copied {copiedColor}!</span>
                  ) : (
                    <span className="text-[9px] text-gray-500 font-medium">Click Swatch to Copy</span>
                  )}
                </div>
                <div className="flex gap-3 mt-2 justify-center py-2 border border-border-dark bg-black/20 rounded-xl">
                  {activeBrief.colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => copyColorToClipboard(color)}
                      className="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110"
                      title={`Copy ${color}`}
                    >
                      <div 
                        className="w-10 h-10 rounded-full border border-white/10 shadow-md shadow-black/40 group-hover:border-white/35" 
                        style={{ backgroundColor: color }} 
                      />
                      <span className="text-[8px] font-mono text-gray-500 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {color}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Brief Objective and Keywords details */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 bg-brand-purple/10 border-bl border-border-dark text-[9px] uppercase font-bold text-brand-purple rounded-bl-xl">
                AI Structured Brief
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-brand-purple font-bold uppercase tracking-wider">Objective</span>
                <p className="text-sm text-white leading-relaxed">{activeBrief.objective}</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-brand-purple font-bold uppercase tracking-wider">Style Archetype & Keywords</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {activeBrief.styleKeywords.map((kw, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-surface-card border border-border-dark text-brand-cyan rounded-full font-bold">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-1 md:flex-row md:gap-6 justify-between mt-1 pt-4 border-t border-border-dark">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-gray-500 font-bold uppercase">Target Demographics</span>
                  <span className="text-xs text-white font-medium">{activeBrief.targetAudience}</span>
                </div>
                {currentUser?.role === 'client' && (
                  <button
                    onClick={handleApproveBrief}
                    disabled={isApproved}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer self-end mt-2 md:mt-0 ${
                      isApproved
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-brand-purple hover:bg-brand-purple/95 text-white shadow-md shadow-brand-purple/20'
                    }`}
                  >
                    {isApproved ? (
                      <>
                        <Check size={12} />
                        <span>Brief Approved</span>
                      </>
                    ) : (
                      <>
                        <span>Approve & Share</span>
                        <ArrowRight size={12} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Visual Sandbox Preview Card */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative">
              <div className="absolute top-0 right-0 p-2.5 bg-brand-rose/10 border-bl border-border-dark text-[9px] uppercase font-black text-brand-rose rounded-bl-xl">
                Sandbox Viewport
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                <Eye size={14} className="text-brand-purple" />
                <span>Visual Sandbox Preview</span>
              </div>

              <div
                className="w-full min-h-[220px] rounded-xl border border-border-dark/60 p-6 flex flex-col justify-between relative overflow-hidden transition-all shadow-inner"
                style={{
                  backgroundColor: activeBrief.colors[0],
                  color: activeBrief.colors[3] || '#ffffff',
                }}
              >
                {/* Decorative background gradients */}
                <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-brand-cyan/12 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-brand-purple/12 blur-2xl pointer-events-none" />

                {/* Center visual widget (Sun / Garden logo) */}
                <div className="flex flex-col items-center justify-center text-center my-2 gap-2">
                  <div 
                    className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-black/45 shadow-lg text-lg animate-pulse"
                    style={{ borderColor: activeBrief.colors[1] }}
                  >
                    <span className="text-2xl">☀️</span>
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-brand-cyan" style={{ fontFamily: 'Syne' }}>
                    Sun Studio
                  </span>
                </div>

                {/* Dynamic Headline & Description */}
                <div className="text-center flex flex-col gap-2 z-10">
                  <h1
                    className="text-2xl font-black tracking-tight leading-tight"
                    style={{
                      fontFamily: activeBrief.typography.split('&')[0].trim(),
                    }}
                  >
                    Elevate Your <span style={{ color: activeBrief.colors[1] }}>Mind & Body</span>
                  </h1>
                  <p className="text-[11px] max-w-xs mx-auto leading-relaxed opacity-80">
                    Experience organic premium wellness guidelines crafted for design-conscious younger audiences.
                  </p>
                </div>

                {/* Bouncy buttons with custom styling */}
                <div className="flex gap-3 justify-center mt-4 z-10">
                  <button
                    className="px-4 py-2 rounded-xl text-[10px] font-bold transition-all text-white cursor-pointer shadow-md"
                    style={{
                      backgroundColor: activeBrief.colors[1],
                      boxShadow: `0 4px 12px ${activeBrief.colors[1]}45`,
                    }}
                  >
                    Book Session
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl text-[10px] font-bold transition-all border cursor-pointer hover:bg-white/5"
                    style={{
                      borderColor: `${activeBrief.colors[3]}33`,
                      color: activeBrief.colors[3],
                    }}
                  >
                    Explore Options
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default BriefTranslator;
