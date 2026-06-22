import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, Clock, FileText, Users, Paperclip, Calendar, Download, ArrowRight } from 'lucide-react';

export const ProjectDashboard: React.FC = () => {
  const { activeProject, tasks, files, users, uploadProjectFile, createProject, currentUser } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for project creation form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newFreelancerId, setNewFreelancerId] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!activeProject) {
    const freelancers = users.filter(u => u.role === 'freelancer');

    const handleCreateProject = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTitle.trim() || !newFreelancerId || !newDueDate) return;
      setIsCreating(true);
      await createProject(newTitle.trim(), newDesc.trim(), newFreelancerId, newDueDate);
      setIsCreating(false);
    };

    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] p-6 overflow-y-auto w-full">
        <div className="w-full max-w-lg glass-panel p-8 rounded-3xl flex flex-col gap-6 border border-white/10 shadow-2xl relative overflow-hidden animate-scale-up">
          <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-brand-purple/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-brand-cyan/15 blur-3xl pointer-events-none" />

          <div className="flex flex-col gap-1.5 z-10">
            <span className="text-[10px] text-brand-purple font-semibold uppercase tracking-wider">Project Dashboard</span>
            <h2 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'Syne' }}>Start Collaboration</h2>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Create a fresh workspace project to translate design briefs, assign tasks, track milestones, and manage payments.
            </p>
          </div>

          {currentUser?.role === 'client' || currentUser?.role === 'admin' ? (
            <form onSubmit={handleCreateProject} className="flex flex-col gap-4 z-10">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wider ml-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Wellness Mobile App Design"
                  className="w-full glass-input rounded-2xl px-4 py-3 text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wider ml-1">Description</label>
                <textarea
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Briefly outline the objective and scope..."
                  className="w-full glass-input rounded-2xl px-4 py-3 text-xs text-white resize-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wider ml-1">Assign Freelancer</label>
                  <select
                    required
                    value={newFreelancerId}
                    onChange={(e) => setNewFreelancerId(e.target.value)}
                    className="w-full glass-input rounded-2xl px-3 py-3 text-xs text-white bg-bg-dark border border-white/10 outline-none"
                  >
                    <option value="" className="bg-bg-dark text-gray-450">Select collaborator</option>
                    {freelancers.map(f => (
                      <option key={f.id} value={f.id} className="bg-bg-dark text-white">
                        {f.fullName}
                      </option>
                    ))}
                    {/* Fallback mock option if no users are returned yet */}
                    {freelancers.length === 0 && (
                      <option value="user-freelancer" className="bg-bg-dark text-white">Alex Rivera (Mock Freelancer)</option>
                    )}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wider ml-1">Target Due Date</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full glass-input rounded-2xl px-4 py-2.5 text-xs text-white cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full mt-2 py-3.5 btn-metallic text-white font-bold text-xs rounded-2xl flex justify-center items-center gap-1.5 cursor-pointer font-sans"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Launching Project...</span>
                  </>
                ) : (
                  <>
                    <span>Initialize Collaboration Project</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3 z-10 border-t border-white/5 pt-6">
              <div className="w-12 h-12 bg-white/[0.03] border border-white/10 rounded-full flex items-center justify-center animate-pulse text-brand-purple">
                <Users size={20} />
              </div>
              <span className="text-xs text-gray-300 font-semibold">Waiting for Client Assignment</span>
              <p className="text-[11px] text-gray-500 leading-relaxed max-w-[280px]">
                You are registered as a <strong className="text-brand-purple">Freelancer</strong>. Once a client assigns a project to you, your collaborative dashboard, milestones, and invoice tracking will activate.
              </p>
              <div className="text-[10px] text-gray-500 font-mono mt-4 border-t border-white/5 pt-4 w-full">
                Tip: You can use the "Developer Switch" in the header to change your role to Client to create a project.
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Calculate project metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getClientUser = () => users.find(u => u.id === activeProject.clientId);
  const getFreelancerUser = () => users.find(u => u.id === activeProject.freelancerId);

  const client = getClientUser();
  const freelancer = getFreelancerUser();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded || uploaded.length === 0) return;
    
    const file = uploaded[0];
    const reader = new FileReader();
    reader.onload = () => {
      const mockUrl = reader.result as string || 'blob:mock-file-url';
      const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      uploadProjectFile(file.name, file.type, sizeStr, mockUrl);
    };
    reader.readAsDataURL(file);
  };

  // Hardcoded milestones corresponding to tasks for simplicity in visualization
  const milestones = [
    { name: '1. Brand Brief Translation & Alignment', desc: 'Synthesize client goals to style coordinates.', status: tasks.find(t => t.title.includes('Brief'))?.status || 'todo' },
    { name: '2. Logo Concept Exploration', desc: 'Formulate design paths and vector structures.', status: tasks.find(t => t.title.includes('Logo'))?.status || 'todo' },
    { name: '3. Color System Development', desc: 'Design detailed color swatches and rules.', status: tasks.find(t => t.title.includes('Color'))?.status || 'todo' },
    { name: '4. Final Assets & Styleguide Handoff', desc: 'Package and handover core brand assets.', status: tasks.find(t => t.title.includes('Assets'))?.status || 'todo' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto max-h-[calc(100vh-80px)]">
      {/* Left Column: Metrics & Milestones */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Project Overview Card */}
        <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-brand-cyan/15 border-bl border-border-dark text-[10px] uppercase font-bold text-brand-cyan rounded-bl-xl">
            Active Workspace
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
            <div className="flex flex-col gap-1.5 flex-1 pr-4">
              <h1 className="text-2xl font-bold tracking-tight text-white">{activeProject.title}</h1>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">
                {activeProject.description}
              </p>
            </div>
            <div className="w-full md:w-36 h-24 rounded-xl border border-border-dark shadow-md shrink-0 bg-gradient-to-br from-brand-purple/30 via-brand-cyan/20 to-brand-rose/20 flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
              <span>Overall Deliverables Progress</span>
              <span className="text-brand-cyan font-mono">{progressPercent}% Completed</span>
            </div>
            <div className="h-3 w-full bg-surface-dark border border-border-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-purple to-brand-cyan transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Metadata chips */}
          <div className="flex flex-wrap gap-4 mt-2 pt-4 border-t border-border-dark/65 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-brand-purple" />
              <span>Due: <strong className="text-white font-semibold font-mono">{activeProject.dueDate}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-green-400" />
              <span>Tasks: <strong className="text-white font-semibold">{completedTasks} / {totalTasks}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-brand-cyan" />
              <span>Collaborators: <strong className="text-white font-semibold">2 Active</strong></span>
            </div>
          </div>
        </div>

        {/* Interactive Milestones / Timeline */}
        <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-brand-purple" />
            <h2 className="text-base font-bold text-white">Project Milestones</h2>
          </div>
          <p className="text-xs text-gray-400">
            Core progress benchmarks for the brand package timeline.
          </p>

          <div className="flex flex-col gap-4 mt-2">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex gap-4 items-start relative">
                {/* Visual timeline node */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold font-mono transition-all ${
                      m.status === 'completed'
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : m.status === 'inprogress'
                        ? 'bg-brand-purple/20 border-brand-purple text-brand-purple'
                        : 'bg-surface-dark border-border-dark text-gray-500'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  {idx < milestones.length - 1 && (
                    <div className="w-0.5 h-12 bg-border-dark/65 mt-1" />
                  )}
                </div>

                {/* Milestone details */}
                <div className="flex-1 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-surface-dark/45 border border-border-dark/60 rounded-xl p-3.5 hover:border-gray-700 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-white">{m.name}</span>
                    <span className="text-[11px] text-gray-400 leading-relaxed">{m.desc}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                      m.status === 'completed'
                        ? 'bg-green-500/10 text-green-400'
                        : m.status === 'inprogress'
                        ? 'bg-brand-purple/10 text-brand-purple animate-pulse'
                        : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    {m.status === 'inprogress' ? 'in progress' : m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Files & Uploads */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Collaborators Card */}
        <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-brand-cyan" />
            <h2 className="text-base font-bold text-white">Project Members</h2>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {client && (
              <div className="flex items-center gap-3">
                <img
                  src={client.profileImage}
                  alt={client.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-brand-cyan"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{client.fullName}</span>
                  <span className="text-[10px] text-brand-cyan font-bold uppercase tracking-wider">{client.role}</span>
                </div>
              </div>
            )}
            {freelancer && (
              <div className="flex items-center gap-3">
                <img
                  src={freelancer.profileImage}
                  alt={freelancer.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-brand-purple"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{freelancer.fullName}</span>
                  <span className="text-[10px] text-brand-purple font-bold uppercase tracking-wider">{freelancer.role}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Files Storage Card */}
        <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col gap-4 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip size={18} className="text-brand-cyan" />
              <h2 className="text-base font-bold text-white">Project Files</h2>
            </div>
            
            {/* Upload Action */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 bg-surface-card border border-border-dark text-gray-400 hover:text-brand-cyan hover:border-brand-cyan/40 rounded-lg transition-all cursor-pointer"
              title="Upload File"
            >
              <Paperclip size={14} />
            </button>
          </div>
          <p className="text-xs text-gray-400">
            A shared catalog of creative briefs, project deliverables, and handoff assets.
          </p>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[350px] pr-1 mt-2">
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 text-center gap-2">
                <FileText size={32} className="opacity-45" />
                <span className="text-xs">No files uploaded yet.</span>
              </div>
            ) : (
              files.map((f) => (
                <div
                  key={f.id}
                  className="bg-surface-dark/45 border border-border-dark/60 rounded-xl p-3.5 hover:border-brand-cyan/30 transition-colors flex items-center gap-3"
                >
                  <div className="p-2 bg-brand-cyan/15 text-brand-cyan rounded-lg">
                    <FileText size={18} />
                  </div>
                  <div className="flex flex-col overflow-hidden flex-1">
                    <span className="text-xs font-bold text-white truncate">{f.name}</span>
                    <span className="text-[9px] text-gray-500 font-mono">{f.size} • {new Date(f.timestamp).toLocaleDateString()}</span>
                  </div>
                  <a
                    href={f.url}
                    download={f.name}
                    className="p-2 hover:bg-surface-card rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                    title="Download File"
                  >
                    <Download size={14} />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
