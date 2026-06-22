import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Send, Sparkles, Mic, FileText, Paperclip, Play, Square, ShieldAlert, Flag } from 'lucide-react';

export const ChatWorkspace: React.FC = () => {
  const { currentUser, chats, sendChatMessage, enhanceMessage, uploadProjectFile, flagMessage, users, activeProject } = useApp();
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const recordingTimer = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Audio playback simulator state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioTimer = useRef<any>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  // Voice recording timer simulator
  const startRecording = () => {
    setIsRecording(true);
    setRecordTime(0);
    recordingTimer.current = setInterval(() => {
      setRecordTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
    }
    setIsRecording(false);
    
    // Send voice message
    if (recordTime > 0) {
      const minutes = Math.floor(recordTime / 60);
      const seconds = recordTime % 60;
      const durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      
      sendChatMessage(`Simulated voice note (${durationStr})`, 'audio', undefined, `voice_note_${Date.now()}.wav`, durationStr);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText);
    setInputText('');
  };

  // Mock audio playing
  const playAudio = (msgId: string, durationStr: string) => {
    if (playingId === msgId) {
      // Pause
      if (audioTimer.current) clearInterval(audioTimer.current);
      setPlayingId(null);
      setAudioProgress(0);
      return;
    }

    if (audioTimer.current) clearInterval(audioTimer.current);
    setPlayingId(msgId);
    setAudioProgress(0);

    const parts = durationStr.split(':');
    const totalSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    let currentSec = 0;

    audioTimer.current = setInterval(() => {
      currentSec += 0.5;
      const percentage = (currentSec / totalSeconds) * 100;
      if (percentage >= 100) {
        clearInterval(audioTimer.current!);
        setPlayingId(null);
        setAudioProgress(0);
      } else {
        setAudioProgress(percentage);
      }
    }, 500);
  };

  // File Upload Handlers (Simulated)
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const mockUrl = reader.result as string || 'blob:mock-file-url';
      const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      uploadProjectFile(file.name, file.type, sizeStr, mockUrl);
    };
    reader.readAsDataURL(file);
  };

  // Predefined prompt helper for quick input enhancements
  const handleEnhanceInput = () => {
    if (!inputText.trim()) return;
    let enhanced = inputText;
    if (inputText.toLowerCase().includes('pop')) {
      enhanced = 'Increase visual contrast across core landing page layouts, establishing clear typographic weight hierarchy and accentuating call-to-action triggers.';
    } else if (inputText.toLowerCase().includes('apple')) {
      enhanced = 'Design a clean, minimal interface utilizing extensive negative space, clean typography (sans-serif), high-contrast styling, and premium product-centric imagery.';
    } else if (inputText.toLowerCase().includes('richer')) {
      enhanced = 'Refine color values to include deeper slate textures and metallic amber/gold accents, paired with subtle drop shadows and glassmorphic blur layers to convey a high-end feel.';
    } else if (inputText.toLowerCase().includes('gen z')) {
      enhanced = 'Implement a highly dynamic aesthetic using bold gradients, interactive hovering effects, micro-animations, rounded components, and layout blocks geared towards mobile-first interaction.';
    } else {
      enhanced = `Refine parameters: ${inputText}. Set consistent paddings, soft borders, and an elegant dark theme.`;
    }
    setInputText(enhanced);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-80px)] border-t border-border-dark">
      {/* Left Column: Context Card / Info (hidden on mobile, visible on desktop) */}
      <div className="hidden lg:flex lg:col-span-3 border-r border-border-dark bg-surface-dark/45 p-6 flex-col gap-6">
        <div>
          <h2 className="text-lg font-bold text-white">Project Workspace</h2>
          <p className="text-xs text-gray-400">{activeProject?.title || 'No Active Project'}</p>
        </div>

        {/* Contact info */}
        <div className="glass-panel p-4 rounded-xl flex flex-col gap-4">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Partner</span>
          {currentUser?.role === 'client' ? (
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                alt="Alex Design"
                className="w-10 h-10 rounded-full object-cover border border-brand-purple/45"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Alex Rivera</span>
                <span className="text-[10px] text-brand-purple font-medium uppercase">Freelancer</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                alt="Sarah"
                className="w-10 h-10 rounded-full object-cover border border-brand-cyan/45"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Sarah Chen</span>
                <span className="text-[10px] text-brand-cyan font-medium uppercase">Client</span>
              </div>
            </div>
          )}
        </div>

        {/* Hints */}
        <div className="text-xs text-gray-400 flex flex-col gap-3 mt-auto">
          <div className="bg-surface-card border border-border-dark p-3.5 rounded-xl flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-brand-purple uppercase">AI Enhancement</span>
            <p className="text-[11px] leading-relaxed">
              If client sends descriptive feedback like <strong className="text-white">"Make it pop"</strong>, click <strong className="text-brand-purple">Enhance with AI</strong> on their chat bubble to translate it!
            </p>
          </div>
          <div className="bg-surface-card border border-border-dark p-3.5 rounded-xl flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-brand-cyan uppercase">Safety & Security</span>
            <p className="text-[11px] leading-relaxed">
              Users can flag messages if they contain toxic content. Admin will review flags instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Chat Feed & Controls */}
      <div className="col-span-12 lg:col-span-9 flex flex-col h-full bg-bg-dark">
        {/* Messages list */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
          {chats.map((chat) => {
            const isMe = chat.senderId === currentUser?.id;
            const sender = users.find(u => u.id === chat.senderId);
            const senderImage = sender?.profileImage || (chat.senderId === 'user-client' 
              ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
              : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');
            const senderName = sender?.fullName || (chat.senderId === 'user-client' ? 'Sarah Chen' : 'Alex Rivera');

            return (
              <div
                key={chat.id}
                className={`flex gap-3 max-w-[70%] group ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                <img
                  src={senderImage}
                  alt={senderName}
                  className="w-8 h-8 rounded-full object-cover mt-1 border border-border-dark"
                />

                <div className="flex flex-col gap-1">
                  {/* Sender details and options */}
                  <div className={`flex items-center gap-2 text-[10px] text-gray-500 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="font-semibold text-gray-400">{senderName}</span>
                    <span>•</span>
                    <span>{new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`rounded-2xl p-4 border relative ${
                      chat.isFlagged
                        ? 'bg-red-500/10 border-red-500/35 text-red-200'
                        : isMe
                        ? 'bg-brand-purple/20 border-brand-purple/35 text-white'
                        : 'bg-surface-card border-border-dark text-white'
                    }`}
                  >
                    {chat.isFlagged && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 mb-1.5 uppercase">
                        <ShieldAlert size={12} />
                        <span>Message flagged for admin review</span>
                      </div>
                    )}

                    {chat.type === 'text' && (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{chat.message}</p>
                    )}

                    {chat.type === 'file' && (
                      <div className="flex items-center gap-3 bg-surface-dark/40 border border-border-dark/60 p-3 rounded-xl max-w-sm">
                        <div className="p-2.5 bg-brand-cyan/20 text-brand-cyan rounded-lg">
                          <FileText size={20} />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-bold text-white truncate">{chat.fileName}</span>
                          <span className="text-[10px] text-gray-400 font-mono">{chat.fileSize}</span>
                        </div>
                        <a
                          href={chat.fileUrl}
                          download={chat.fileName}
                          className="text-[10px] font-bold text-brand-cyan hover:underline ml-auto bg-brand-cyan/10 px-2.5 py-1.5 rounded-lg border border-brand-cyan/20 cursor-pointer"
                        >
                          Get File
                        </a>
                      </div>
                    )}

                    {chat.type === 'audio' && (
                      <div className="flex items-center gap-3 min-w-[220px]">
                        <button
                          onClick={() => playAudio(chat.id, chat.fileSize || '0:10')}
                          className="p-2 bg-brand-purple text-white rounded-full hover:scale-105 transition-all cursor-pointer"
                        >
                          {playingId === chat.id ? <Square size={12} fill="white" /> : <Play size={12} fill="white" />}
                        </button>
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="h-1.5 bg-surface-dark/70 rounded-full overflow-hidden relative border border-border-dark">
                            <div
                              className="h-full bg-brand-purple transition-all duration-300"
                              style={{ width: `${playingId === chat.id ? audioProgress : 0}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[8px] text-gray-400 font-mono">
                            <span>Audio Note</span>
                            <span>{chat.fileSize}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {chat.isEnhanced && (
                      <div className="mt-2.5 pt-2 border-t border-brand-purple/20 flex flex-col gap-1">
                        <span className="text-[9px] text-brand-purple font-bold uppercase tracking-wider flex items-center gap-1">
                          <Sparkles size={10} className="animate-pulse" /> AI Translated Clarification
                        </span>
                        <p className="text-[11px] text-gray-300 italic">
                          Original input: "{chat.originalMessage}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions (Enhance for Client text/Flag for safety) */}
                  <div className={`flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && chat.type === 'text' && !chat.isEnhanced && (
                      <button
                        onClick={() => enhanceMessage(chat.id)}
                        className="text-[10px] text-brand-purple hover:text-white font-semibold flex items-center gap-1 hover:bg-brand-purple/10 px-2 py-0.5 rounded border border-transparent hover:border-brand-purple/25 transition-all cursor-pointer"
                      >
                        <Sparkles size={11} />
                        <span>Translate to Design Speak</span>
                      </button>
                    )}
                    {!isMe && !chat.isFlagged && (
                      <button
                        onClick={() => flagMessage(chat.id)}
                        className="text-[10px] text-gray-500 hover:text-red-400 font-semibold flex items-center gap-1 hover:bg-red-500/10 px-2 py-0.5 rounded border border-transparent hover:border-red-500/25 transition-all cursor-pointer"
                      >
                        <Flag size={10} />
                        <span>Flag Content</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-border-dark bg-surface-dark/40">
          <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
            {/* Attachment Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,application/pdf,text/plain"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 bg-surface-card border border-border-dark text-gray-400 hover:text-brand-cyan hover:border-brand-cyan/40 rounded-xl transition-all cursor-pointer"
              title="Attach File"
            >
              <Paperclip size={18} />
            </button>

            {/* Main Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isRecording ? "Recording voice note..." : "Type a message... try using 'make it pop' or 'apple vibes'..."}
                disabled={isRecording}
                className="w-full glass-input rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-gray-500"
              />
              {inputText.trim().length > 0 && (
                <button
                  type="button"
                  onClick={handleEnhanceInput}
                  className="absolute right-3 top-2.5 p-1 text-brand-purple hover:text-white rounded hover:bg-brand-purple/20 transition-all cursor-pointer"
                  title="Preview AI Enhancement"
                >
                  <Sparkles size={16} />
                </button>
              )}
            </div>

            {/* Voice Recording / Stop Button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-surface-card border border-border-dark text-gray-400 hover:text-brand-purple hover:border-brand-purple/40'
              }`}
              title={isRecording ? "Stop & Send" : "Record Voice Note"}
            >
              {isRecording ? <Square size={16} fill="white" /> : <Mic size={18} />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 bg-brand-purple hover:bg-brand-purple/90 disabled:bg-brand-purple/35 text-white rounded-xl transition-all shadow-md shadow-brand-purple/20 cursor-pointer"
            >
              <Send size={18} />
            </button>
          </form>

          {/* Visual Waveform while recording */}
          {isRecording && (
            <div className="flex items-center gap-3 mt-3 px-2">
              <div className="flex items-center gap-1.5 h-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                  <div
                    key={i}
                    className="w-1 bg-red-400 voice-bar rounded-full"
                    style={{
                      height: '100%',
                      animationDuration: `${0.8 + Math.random() * 0.8}s`
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-red-400 font-mono font-bold">
                Recording: 0:{recordTime < 10 ? '0' : ''}{recordTime}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
