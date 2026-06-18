import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Task, User } from '../context/AppContext';
import { Calendar, Plus, MessageSquare, ClipboardList, Clock, X, MessageCircle } from 'lucide-react';

export const KanbanBoard: React.FC = () => {
  const { tasks, users, addTask, updateTaskStatus, addTaskComment } = useApp();
  
  // Modals state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newAssignee, setNewAssignee] = useState('user-freelancer');

  // Comment input state
  const [commentText, setCommentText] = useState('');

  // Column details
  const columns: { id: Task['status']; label: string; color: string; border: string }[] = [
    { id: 'todo', label: 'To Do', color: 'bg-gray-500/10 text-gray-400', border: 'border-gray-500/20' },
    { id: 'inprogress', label: 'In Progress', color: 'bg-brand-purple/10 text-brand-purple', border: 'border-brand-purple/20' },
    { id: 'review', label: 'Review', color: 'bg-brand-cyan/10 text-brand-cyan', border: 'border-brand-cyan/20' },
    { id: 'completed', label: 'Completed', color: 'bg-green-500/10 text-green-400', border: 'border-green-500/20' },
  ];

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      updateTaskStatus(taskId, status);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask(newTitle, newDesc, newDeadline || new Date().toISOString().split('T')[0], newAssignee);
    
    // Reset form
    setNewTitle('');
    setNewDesc('');
    setNewDeadline('');
    setNewAssignee('user-freelancer');
    setIsNewTaskOpen(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeTask) return;

    addTaskComment(activeTask.id, commentText);
    setCommentText('');
    
    // Refresh modal active task ref
    const updated = tasks.find(t => t.id === activeTask.id);
    if (updated) {
      setActiveTask(updated);
    }
  };

  const getAssignee = (assigneeId?: string): User | undefined => {
    return users.find(u => u.id === assigneeId);
  };

  return (
    <div className="p-6 overflow-y-auto max-h-[calc(100vh-80px)]">
      {/* Board Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-purple/20 text-brand-purple rounded-lg">
            <ClipboardList size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Kanban Task Board</h2>
            <p className="text-xs text-gray-400">Manage tasks and track project deliverables.</p>
          </div>
        </div>

        <button
          onClick={() => setIsNewTaskOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-purple hover:bg-brand-purple/90 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-brand-purple/20 cursor-pointer"
        >
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>

      {/* Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)] min-h-[500px]">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex flex-col gap-4 bg-surface-dark/30 border border-border-dark/60 rounded-2xl p-4 h-full"
            >
              {/* Column header */}
              <div className="flex items-center justify-between pb-2 border-b border-border-dark">
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${col.color}`}>
                  {col.label}
                </span>
                <span className="text-xs text-gray-500 font-mono font-bold">{colTasks.length}</span>
              </div>

              {/* Task cards list */}
              <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1">
                {colTasks.length === 0 ? (
                  <div className="border border-dashed border-border-dark rounded-xl py-8 text-center text-xs text-gray-600">
                    Drop items here
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const assignee = getAssignee(task.assigneeId);

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => setActiveTask(task)}
                        className="glass-panel p-4 rounded-xl border border-border-dark hover:border-brand-purple/35 transition-all cursor-pointer flex flex-col gap-3 group active:cursor-grabbing"
                      >
                        <h4 className="text-sm font-semibold text-white group-hover:text-brand-purple transition-colors">
                          {task.title}
                        </h4>
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>

                        <div className="flex items-center justify-between mt-1 pt-2 border-t border-border-dark/45 text-[10px] text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock size={11} />
                            <span>{new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            {task.comments && task.comments.length > 0 && (
                              <div className="flex items-center gap-1" title="Comments">
                                <MessageSquare size={11} />
                                <span>{task.comments.length}</span>
                              </div>
                            )}

                            {assignee && (
                              <img
                                src={assignee.profileImage}
                                alt={assignee.fullName}
                                className="w-5 h-5 rounded-full object-cover border border-border-dark"
                                title={`Assigned to ${assignee.fullName}`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: New Task Form */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border-dark bg-surface-dark/40">
              <h3 className="text-base font-bold text-white">Create New Task</h3>
              <button
                onClick={() => setIsNewTaskOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Design Typography Spec"
                  className="glass-input rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Outline task deliverables..."
                  className="glass-input rounded-xl px-4 py-2.5 text-sm text-white min-h-[90px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Deadline</label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="glass-input rounded-xl px-4 py-2.5 text-sm text-white font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Assignee</label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="glass-input rounded-xl px-4 py-2.5 text-sm text-white bg-surface-dark/80"
                  >
                    {users.filter(u => u.role !== 'admin').map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-brand-purple hover:bg-brand-purple/90 text-white font-medium rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-purple/20"
              >
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Task Details & Comments */}
      {activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-border-dark bg-surface-dark/40">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple uppercase">
                  {activeTask.status}
                </span>
                <h3 className="text-sm font-semibold text-gray-400">Task Details</h3>
              </div>
              <button
                onClick={() => setActiveTask(null)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-5 overflow-y-auto flex-1">
              <div>
                <h2 className="text-lg font-bold text-white">{activeTask.title}</h2>
                <p className="text-xs text-gray-400 mt-2 whitespace-pre-wrap leading-relaxed">
                  {activeTask.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-surface-dark/40 border border-border-dark p-3 rounded-xl text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-400 font-medium">Due Date</span>
                  <span className="text-white font-semibold flex items-center gap-1.5 mt-1 font-mono">
                    <Calendar size={13} />
                    {new Date(activeTask.deadline).toLocaleDateString([], { dateStyle: 'long' })}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-400 font-medium">Assignee</span>
                  {(() => {
                    const assignee = getAssignee(activeTask.assigneeId);
                    return assignee ? (
                      <div className="flex items-center gap-2 mt-1">
                        <img
                          src={assignee.profileImage}
                          alt={assignee.fullName}
                          className="w-5 h-5 rounded-full object-cover border border-border-dark"
                        />
                        <span className="text-white font-semibold">{assignee.fullName}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    );
                  })()}
                </div>
              </div>

              {/* Comments Section */}
              <div className="flex flex-col gap-3 mt-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle size={14} />
                  Comments ({activeTask.comments?.length || 0})
                </span>

                {/* Comment Feed */}
                <div className="flex flex-col gap-3 max-h-[180px] overflow-y-auto border border-border-dark/60 rounded-xl p-3 bg-surface-dark/25">
                  {!activeTask.comments || activeTask.comments.length === 0 ? (
                    <span className="text-xs text-gray-600 text-center py-4">No comments yet. Write one below!</span>
                  ) : (
                    activeTask.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2.5 text-xs">
                        <img
                          src={comment.profileImage}
                          alt={comment.userName}
                          className="w-6 h-6 rounded-full object-cover mt-0.5 border border-border-dark"
                        />
                        <div className="flex flex-col gap-0.5 bg-surface-card/60 border border-border-dark/60 rounded-xl px-3 py-2 flex-1">
                          <div className="flex items-center justify-between text-[9px] text-gray-500">
                            <span className="font-semibold text-gray-300">{comment.userName} ({comment.userRole})</span>
                            <span>{new Date(comment.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-300 leading-relaxed mt-0.5">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Form */}
                <form onSubmit={handleAddComment} className="flex gap-2 mt-1">
                  <input
                    type="text"
                    required
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Type a comment..."
                    className="flex-1 glass-input rounded-xl px-4 py-2 text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
