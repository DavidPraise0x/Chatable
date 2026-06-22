import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ProjectDashboard } from './components/ProjectDashboard';
import { BriefTranslator } from './components/BriefTranslator';
import { ChatWorkspace } from './components/ChatWorkspace';
import { KanbanBoard } from './components/KanbanBoard';
import { AdminPanel } from './components/AdminPanel';
import { ReputationScores } from './components/ReputationScores';
import { PaymentsWorkspace } from './components/PaymentsWorkspace';
import { FreelancerMatch } from './components/FreelancerMatch';
import { AuthScreen } from './components/AuthScreen';
import {
  LayoutDashboard,
  Sparkles,
  MessageCircle,
  ClipboardList,
  Shield,
  ShieldAlert,
  Settings,
  CreditCard,
  Users,
  Award,
  X,
  Key,
  LogOut
} from 'lucide-react';

// Global Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#080414] p-6 text-center gap-4">
          <div className="glass-panel p-8 rounded-3xl max-w-xl border border-red-500/25 flex flex-col items-center gap-4 shadow-2xl shadow-red-500/10">
            <div className="p-4 bg-red-500/20 text-red-500 rounded-full animate-bounce">
              <ShieldAlert size={36} />
            </div>
            <h2 className="text-lg font-black text-white">Something went wrong in the workspace</h2>
            <p className="text-xs text-gray-400">
              The application encountered a visual rendering crash. You can check the error stack below:
            </p>
            <pre className="text-xs text-red-405 bg-black/40 p-4 rounded-xl overflow-auto max-w-full text-left font-mono border border-border-dark whitespace-pre-wrap break-all w-full max-h-[200px]">
              {this.state.error?.stack || this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-5 py-2.5 bg-brand-purple hover:bg-brand-purple/90 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-purple/25"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const { currentUser, switchRole, activeProject, geminiApiKey, saveGeminiApiKey, session, authLoading, signOutUser } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'brief' | 'chat' | 'kanban' | 'reputation' | 'payments' | 'matchmaker' | 'admin'>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(geminiApiKey || '');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Theme state initialization
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('chatable_theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
      return 'light';
    } else {
      document.documentElement.classList.remove('light');
      return 'dark';
    }
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('chatable_theme', next);
      if (next === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
      return next;
    });
  };

  // Navigation Items
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard, role: ['client', 'freelancer', 'admin'] },
    { id: 'brief' as const, label: 'AI Brief Translator', icon: Sparkles, role: ['client', 'freelancer'] },
    { id: 'chat' as const, label: 'Messages', icon: MessageCircle, role: ['client', 'freelancer'] },
    { id: 'kanban' as const, label: 'Kanban Board', icon: ClipboardList, role: ['client', 'freelancer'] },
    { id: 'reputation' as const, label: 'Reputation Scores', icon: Award, role: ['client', 'freelancer'] },
    { id: 'payments' as const, label: 'Milestone Payments', icon: CreditCard, role: ['client', 'freelancer'] },
    { id: 'matchmaker' as const, label: 'AI Matchmaker', icon: Users, role: ['client', 'freelancer'] },
    { id: 'admin' as const, label: 'Admin Control', icon: Shield, role: ['admin'] },
  ];

  // Filter tabs by active user role permission safely
  const filteredNavItems = currentUser
    ? navItems.filter((item) => item.role.includes(currentUser.role))
    : [];

  React.useEffect(() => {
    if (!currentUser) return;
    const activeNavIds = filteredNavItems.map(item => item.id);
    if (!activeNavIds.includes(activeTab as any)) {
      setActiveTab('dashboard');
    }
  }, [currentUser, activeTab, filteredNavItems]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveGeminiApiKey(tempApiKey.trim() || null);
    setIsSettingsOpen(false);
  };

  // 1. Session Loading Gate
  if (authLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#080414] gap-4">
        <div className="p-4 bg-brand-purple/20 text-brand-purple rounded-full animate-spin border-4 border-dashed border-brand-purple w-12 h-12" />
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider animate-pulse">
          Setting Up Chatable Workspace...
        </span>
      </div>
    );
  }

  // 2. Authentication Login Check
  if (!session) {
    return <AuthScreen />;
  }

  // 3. User Profile Fetch Check
  if (!currentUser) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#080414] gap-4">
        <div className="p-4 bg-brand-cyan/20 text-brand-cyan rounded-full animate-pulse w-10 h-10 flex items-center justify-center">
          <ShieldAlert size={20} />
        </div>
        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
          Fetching profile details...
        </span>
        <button
          onClick={() => signOutUser()}
          className="mt-2 text-xs text-brand-cyan underline cursor-pointer"
        >
          Sign Out & Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-bg-dark text-slate-100 select-none">
      {/* Playful Floating background elements */}
      <div className="floating-bubble-1 -top-24 -left-24" />
      <div className="floating-bubble-2 -bottom-32 -right-32" />
      <div className="floating-bubble-3 top-1/3 left-1/4" />
      <div className="floating-bubble-4 bottom-1/4 right-1/3" />
      
      {/* ACCOUNT SUSPENDED BLOCKING OVERLAY */}
      {currentUser.isSuspended && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6 text-center animate-fade-in">
          <div className="glass-panel p-8 rounded-3xl max-w-md border border-red-500/25 flex flex-col items-center gap-4 shadow-2xl shadow-red-500/10">
            <div className="p-4 bg-red-500/20 text-red-500 rounded-full animate-bounce">
              <ShieldAlert size={48} />
            </div>
            <h2 className="text-xl font-black text-white">Account Deactivated</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              The profile <strong className="text-white">"{currentUser.fullName}"</strong> has been temporarily suspended by the system moderator for content guidelines compliance review.
            </p>
            <div className="flex flex-col gap-2.5 w-full mt-4 pt-4 border-t border-border-dark">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">Test Sandbox Access</span>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => signOutUser()}
                  className="px-4 py-2.5 bg-red-500 hover:bg-red-650 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Return to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="hidden lg:flex w-64 border-r border-border-dark bg-surface-dark/70 flex-col justify-between p-5 shrink-0 z-10">
        <div className="flex flex-col gap-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 px-2 z-10">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-cyan flex items-center justify-center font-black text-sm text-white shadow-md shadow-brand-purple/35 animate-bounce">
              💬
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-brand-cyan to-brand-purple bg-clip-text text-transparent">
              Chatable
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? 'active-tab-nav'
                      : 'text-gray-400 hover:text-white hover:bg-surface-card/65'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card info + logout inside sidebar */}
        <div className="flex flex-col gap-2">
          <div className="glass-panel squiggly-profile p-3.5 border border-border-dark flex items-center gap-3">
            <img
              src={currentUser.profileImage}
              alt={currentUser.fullName}
              className="w-9 h-9 rounded-full object-cover border border-border-dark"
            />
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">{currentUser.fullName}</span>
              <span className="text-[9px] text-gray-505 font-bold uppercase tracking-wider mt-0.5">{currentUser.role}</span>
            </div>
          </div>

          <button
            onClick={() => signOutUser()}
            className="flex items-center gap-2.5 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl text-xs font-bold transition-all cursor-pointer w-full text-left"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE MENU DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative w-64 h-full border-r border-border-dark bg-bg-dark flex flex-col justify-between p-5 z-50">
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="absolute top-5 right-5 text-gray-405 hover:text-white p-1"
            >
              <X size={18} />
            </button>
            
            <div className="flex flex-col gap-6">
              {/* Brand Logo */}
              <div className="flex items-center gap-2.5 px-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-cyan flex items-center justify-center font-black text-sm text-white shadow-md shadow-brand-purple/35 animate-bounce">
                  💬
                </div>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-brand-cyan to-brand-purple bg-clip-text text-transparent">
                  Chatable
                </span>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1.5">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        isActive
                          ? 'active-tab-nav'
                          : 'text-gray-400 hover:text-white hover:bg-surface-card/65'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* User Card info */}
            <div className="flex flex-col gap-2">
              <div className="glass-panel squiggly-profile p-3.5 border border-border-dark flex items-center gap-3">
                <img
                  src={currentUser.profileImage}
                  alt={currentUser.fullName}
                  className="w-9 h-9 rounded-full object-cover border border-border-dark"
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-white truncate">{currentUser.fullName}</span>
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{currentUser.role}</span>
                </div>
              </div>

              <button
                onClick={() => signOutUser()}
                className="flex items-center gap-2.5 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl text-xs font-bold transition-all cursor-pointer w-full text-left"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN VIEW AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-bg-dark">
        {/* TOP HEADER */}
        <header className="h-[79px] border-b border-border-dark bg-surface-dark/45 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 bg-surface-card border border-border-dark text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-brand-purple font-semibold uppercase tracking-wider">Active Workspace</span>
              <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[120px] sm:max-w-xs">
                {activeProject ? activeProject.title : 'No Project Selected'}
              </h2>
            </div>
          </div>

          {/* Settings & Sandbox Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 bg-surface-card border border-border-dark text-gray-400 hover:text-white hover:border-gray-500 rounded-xl transition-all cursor-pointer"
              title={theme === 'dark' ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-[15px] sm:h-[15px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-[15px] sm:h-[15px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M5.25 12h2.25m9 0h2.25m-10.5 5.25 1.5-1.5m7.5-7.5 1.5-1.5M5.25 5.25l1.5 1.5m7.5 7.5 1.5 1.5M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
                </svg>
              )}
            </button>

            {/* Gear Settings Button */}
            <button
              onClick={() => { setTempApiKey(geminiApiKey || ''); setIsSettingsOpen(true); }}
              className="p-2 sm:p-2.5 bg-surface-card border border-border-dark text-gray-400 hover:text-white hover:border-gray-500 rounded-xl transition-all cursor-pointer"
              title="API Key Configuration"
            >
              <Settings size={14} className="sm:w-[15px] sm:h-[15px]" />
            </button>

            {/* Sandbox switcher */}
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-450 bg-surface-card border border-border-dark px-2 sm:px-3 py-2 rounded-xl">
              <span className="hidden sm:inline font-semibold">Dev Switch:</span>
              <select
                value={currentUser.role}
                onChange={(e) => switchRole(e.target.value as 'client' | 'freelancer' | 'admin')}
                className="bg-transparent text-white font-bold border-none outline-none pl-0.5 cursor-pointer max-w-[70px] sm:max-w-none text-ellipsis"
              >
                <option value="client" className="bg-surface-card text-white">Client</option>
                <option value="freelancer" className="bg-surface-card text-white">Freelancer</option>
                <option value="admin" className="bg-surface-card text-white">Admin</option>
              </select>
            </div>
          </div>
        </header>

        {/* VIEW BODY */}
        <div className="flex-1 min-h-0 bg-bg-dark">
          {activeTab === 'dashboard' && <ProjectDashboard />}
          {activeTab === 'brief' && <BriefTranslator />}
          {activeTab === 'chat' && <ChatWorkspace />}
          {activeTab === 'kanban' && <KanbanBoard />}
          {activeTab === 'reputation' && <ReputationScores />}
          {activeTab === 'payments' && <PaymentsWorkspace />}
          {activeTab === 'matchmaker' && <FreelancerMatch />}
          {activeTab === 'admin' && <AdminPanel />}
        </div>
      </main>

      {/* MODAL: API Key Setup */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border-dark bg-surface-dark/40">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-brand-purple" />
                <h3 className="text-sm font-bold text-white">System Settings</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Key size={14} className="text-brand-cyan" />
                  Gemini API Integration
                </span>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Provide your Gemini API Key to enable live generative brief parsing and feedback conversions. 
                  This key remains in your local sandbox browser.
                </p>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="glass-input rounded-xl px-4 py-2.5 text-xs text-white font-mono mt-1"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-border-dark">
                <button
                  type="button"
                  onClick={() => { saveGeminiApiKey(null); setTempApiKey(''); setIsSettingsOpen(false); }}
                  className="px-4 py-2 border border-border-dark hover:border-gray-500 bg-surface-card text-xs font-semibold rounded-xl text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Clear Key
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-purple hover:bg-brand-purple/95 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-purple/20"
                >
                  Save settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
