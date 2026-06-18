import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Award, AlertCircle, TrendingUp, ThumbsUp, DollarSign } from 'lucide-react';

export const ReputationScores: React.FC = () => {
  const { users } = useApp();

  const client = users.find(u => u.role === 'client');
  const freelancer = users.find(u => u.role === 'freelancer');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[calc(100vh-80px)]">
      {/* Client Scorecard */}
      {client && (
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-brand-cyan/15 border-bl border-border-dark text-[10px] uppercase font-bold text-brand-cyan rounded-bl-xl">
            Client Rating
          </div>

          <div className="flex items-center gap-4">
            <img
              src={client.profileImage}
              alt={client.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-brand-cyan"
            />
            <div className="flex flex-col gap-0.5">
              <h3 className="text-lg font-bold text-white">{client.fullName}</h3>
              <span className="text-xs text-brand-cyan font-bold uppercase tracking-wider">Project Owner</span>
            </div>
          </div>

          {/* Core Score Ring */}
          <div className="flex items-center justify-between bg-surface-dark/45 border border-border-dark/65 rounded-xl p-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 font-semibold">Reputation Score</span>
              <p className="text-xs text-gray-500 max-w-[170px] leading-relaxed">
                Calculated automatically based on payment speed and scope changes.
              </p>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-brand-cyan/10 border border-brand-cyan/25 shadow-lg shadow-brand-cyan/10">
              <span className="text-lg font-mono font-black text-brand-cyan">{client.reputationScore}%</span>
            </div>
          </div>

          {/* Metrics breakdown */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Metrics Analytics</span>
            
            <div className="grid grid-cols-1 gap-2.5">
              <div className="flex items-center justify-between bg-surface-card border border-border-dark p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-xs">
                  <DollarSign size={14} className="text-brand-cyan" />
                  <span className="text-gray-300">Payment Escrow Release</span>
                </div>
                <span className="text-xs font-bold text-white">{client.metrics.paymentSpeed}</span>
              </div>

              <div className="flex items-center justify-between bg-surface-card border border-border-dark p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-xs">
                  <TrendingUp size={14} className="text-brand-cyan" />
                  <span className="text-gray-300">Scope Creep Index</span>
                </div>
                <span className="text-xs font-bold text-white">{client.metrics.scopeCreep}</span>
              </div>

              <div className="flex items-center justify-between bg-surface-card border border-border-dark p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-xs">
                  <ThumbsUp size={14} className="text-brand-cyan" />
                  <span className="text-gray-300">Revision Frequency</span>
                </div>
                <span className="text-xs font-bold text-white">{client.metrics.revisionRate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-gray-500 pt-2 border-t border-border-dark mt-auto">
            <Shield size={12} />
            <span>Verified Escrow Trust Profile. Client has active escrow deposits.</span>
          </div>
        </div>
      )}

      {/* Freelancer Scorecard */}
      {freelancer && (
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-brand-purple/15 border-bl border-border-dark text-[10px] uppercase font-bold text-brand-purple rounded-bl-xl">
            Freelancer Rating
          </div>

          <div className="flex items-center gap-4">
            <img
              src={freelancer.profileImage}
              alt={freelancer.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-brand-purple"
            />
            <div className="flex flex-col gap-0.5">
              <h3 className="text-lg font-bold text-white">{freelancer.fullName}</h3>
              <span className="text-xs text-brand-purple font-bold uppercase tracking-wider">Brand Architect Expert</span>
            </div>
          </div>

          {/* Core Score Ring */}
          <div className="flex items-center justify-between bg-surface-dark/45 border border-border-dark/65 rounded-xl p-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 font-semibold">Reputation Score</span>
              <p className="text-xs text-gray-500 max-w-[170px] leading-relaxed">
                Calculated based on delivery speeds and checklist completion rates.
              </p>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-brand-purple/10 border border-brand-purple/25 shadow-lg shadow-brand-purple/10">
              <span className="text-lg font-mono font-black text-brand-purple">{freelancer.reputationScore}%</span>
            </div>
          </div>

          {/* Metrics breakdown */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Metrics Analytics</span>
            
            <div className="grid grid-cols-1 gap-2.5">
              <div className="flex items-center justify-between bg-surface-card border border-border-dark p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-xs">
                  <Award size={14} className="text-brand-purple" />
                  <span className="text-gray-300">On-Time Delivery Rate</span>
                </div>
                <span className="text-xs font-bold text-white">{freelancer.metrics.deliverySpeed}</span>
              </div>

              <div className="flex items-center justify-between bg-surface-card border border-border-dark p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-xs">
                  <ThumbsUp size={14} className="text-brand-purple" />
                  <span className="text-gray-300">Escrow Contracts Completed</span>
                </div>
                <span className="text-xs font-bold text-white">{freelancer.metrics.completionRate}</span>
              </div>

              <div className="flex items-center justify-between bg-surface-card border border-border-dark p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-xs">
                  <AlertCircle size={14} className="text-brand-purple" />
                  <span className="text-gray-300">Avg Revision Iterations</span>
                </div>
                <span className="text-xs font-bold text-white">{freelancer.metrics.revisionRate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-gray-500 pt-2 border-t border-border-dark mt-auto">
            <Shield size={12} />
            <span>Top Rated Talent. Backed by Chatable Performance Escrow Assurance.</span>
          </div>
        </div>
      )}
    </div>
  );
};
export default ReputationScores;
