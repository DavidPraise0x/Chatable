import React from 'react';
import { useApp } from '../context/AppContext';
import type { User } from '../context/AppContext';
import { Shield, Users, AlertTriangle, ShieldCheck, UserCheck, UserMinus, Trash2 } from 'lucide-react';


export const AdminPanel: React.FC = () => {
  const { users, chats, toggleUserSuspension, dismissMessageFlag, deleteMessage } = useApp();

  const flaggedMessages = chats.filter((c) => c.isFlagged);

  const getSender = (senderId: string): User | undefined => {
    return users.find((u) => u.id === senderId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto max-h-[calc(100vh-80px)]">
      {/* Overview stats header */}
      <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-brand-purple/20 text-brand-purple rounded-xl">
            <Users size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Registered Accounts</span>
            <span className="text-xl font-bold text-white mt-0.5">{users.length}</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-red-500/20 text-red-400 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Content Flag Reports</span>
            <span className="text-xl font-bold text-white mt-0.5">{flaggedMessages.length} Reports</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-brand-cyan/20 text-brand-cyan rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Security Engine Status</span>
            <span className="text-sm font-bold text-green-400 mt-1 uppercase">Operational</span>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-brand-purple" />
            <h2 className="text-base font-bold text-white">User Accounts Manager</h2>
          </div>
          <p className="text-xs text-gray-400">
            Manage profile registrations and toggle suspension status. Suspended users will be locked out of workspaces.
          </p>

          <div className="flex flex-col gap-3 mt-2">
            {users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-3.5 border rounded-xl transition-all ${
                  user.isSuspended
                    ? 'bg-red-500/5 border-red-500/30'
                    : 'bg-surface-dark/45 border-border-dark/65'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.profileImage}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-border-dark"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">{user.fullName}</span>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5">{user.email}</span>
                    <div className="flex gap-2 items-center mt-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-surface-card border border-border-dark rounded-full text-brand-cyan">
                        {user.role}
                      </span>
                      {user.isSuspended && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-400">
                          Suspended
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {user.role !== 'admin' && (
                  <button
                    onClick={() => toggleUserSuspension(user.id)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                      user.isSuspended
                        ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                        : 'bg-red-500/10 text-red-450 border-red-500/20 hover:bg-red-500/20'
                    }`}
                    title={user.isSuspended ? "Unsuspend User" : "Suspend User"}
                  >
                    {user.isSuspended ? <UserCheck size={16} /> : <UserMinus size={16} />}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flagged Content Moderation Feed */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 flex-1">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-400" />
            <h2 className="text-base font-bold text-white">Content Flag Moderation</h2>
          </div>
          <p className="text-xs text-gray-400">
            Review chat conversations flagged by workspace members. Resolve flags by dismissing them or permanently deleting the message.
          </p>

          <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-[400px] pr-1">
            {flaggedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 text-center gap-2">
                <Shield size={32} className="opacity-45" />
                <span className="text-xs">No flagged messages reported. System is clean.</span>
              </div>
            ) : (
              flaggedMessages.map((msg) => {
                const sender = getSender(msg.senderId);

                return (
                  <div
                    key={msg.id}
                    className="bg-surface-dark/45 border border-red-500/25 rounded-xl p-4 flex flex-col gap-3"
                  >
                    {/* Report header */}
                    <div className="flex items-center justify-between text-[10px] text-gray-500 border-b border-border-dark pb-2">
                      <div className="flex items-center gap-2">
                        {sender && (
                          <img
                            src={sender.profileImage}
                            alt={sender.fullName}
                            className="w-4 h-4 rounded-full object-cover border border-border-dark"
                          />
                        )}
                        <span className="font-semibold text-gray-450">{sender?.fullName || 'Unknown User'}</span>
                      </div>
                      <span>{new Date(msg.timestamp).toLocaleString()}</span>
                    </div>

                    {/* Content */}
                    <div className="bg-surface-card border border-border-dark p-3 rounded-lg text-xs leading-relaxed text-gray-300 italic">
                      "{msg.message}"
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end mt-1">
                      <button
                        onClick={() => dismissMessageFlag(msg.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-border-dark hover:border-gray-500 bg-surface-card text-[10px] font-bold rounded-lg text-gray-300 hover:text-white transition-all cursor-pointer"
                      >
                        <ShieldCheck size={12} />
                        <span>Dismiss Flag</span>
                      </button>
                      
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 border border-red-500/20 hover:bg-red-500/35 text-[10px] font-bold rounded-lg text-red-400 hover:text-red-300 transition-all cursor-pointer"
                      >
                        <Trash2 size={12} />
                        <span>Delete Message</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminPanel;
