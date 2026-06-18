import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { FreelancerProfile } from '../context/AppContext';
import { Search, Sparkles, Star, BadgePercent, Layers } from 'lucide-react';

interface MatchResult extends FreelancerProfile {
  matchScore: number;
  matchReason: string;
}

export const FreelancerMatch: React.FC = () => {
  const { freelancersCatalog, geminiApiKey } = useApp();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);

    if (!geminiApiKey) {
      // Local keyword matching fallback simulator
      setTimeout(() => {
        const lowerQ = query.toLowerCase();
        const results = freelancersCatalog.map((f) => {
          let score = 50; // default base match score
          let reason = "Candidate has general creative development experience matching your requirements.";

          // Simple keywords match
          const skillHits = f.skills.filter(s => lowerQ.includes(s.toLowerCase())).length;
          const bioHits = lowerQ.split(' ').filter(word => f.bio.toLowerCase().includes(word) && word.length > 3).length;
          
          score += (skillHits * 12) + (bioHits * 8);
          if (score > 98) score = 98; // cap

          // Custom preset justifications
          if (f.id === 'f-1' && (lowerQ.includes('logo') || lowerQ.includes('illustr') || lowerQ.includes('vector') || lowerQ.includes('brand'))) {
            score = Math.max(score, 94);
            reason = "David specializes in vector logos and branding handoffs, fitting your request for custom visual design guidelines.";
          } else if (f.id === 'f-2' && (lowerQ.includes('ui') || lowerQ.includes('code') || lowerQ.includes('web') || lowerQ.includes('tailwind') || lowerQ.includes('dark'))) {
            score = Math.max(score, 97);
            reason = "Elena is a dark mode dashboard expert with extensive CSS/Tailwind frontend building experience, perfect for design systems.";
          } else if (f.id === 'f-3' && (lowerQ.includes('copy') || lowerQ.includes('tone') || lowerQ.includes('writ') || lowerQ.includes('message'))) {
            score = Math.max(score, 92);
            reason = "Marcus is a copywriter who structures brand copy guidelines, matching your specifications for voice strategies.";
          }

          return {
            ...f,
            matchScore: score,
            matchReason: reason
          };
        }).sort((a, b) => b.matchScore - a.matchScore);

        setMatches(results);
        setIsSearching(false);
      }, 1500);
      return;
    }

    // Call live Gemini to perform the matching
    try {
      const freelancerDataStr = JSON.stringify(
        freelancersCatalog.map((f) => ({
          id: f.id,
          fullName: f.fullName,
          title: f.title,
          skills: f.skills,
          bio: f.bio
        }))
      );

      const prompt = `You are an AI recruiting matchmaker. We have a list of freelancer profiles: ${freelancerDataStr}.
The client is looking for a talent with these guidelines: "${query}".
Compute a match percentage (0 to 100) and write a short (1-2 sentences) explanation of why they fit.
You MUST output ONLY a valid JSON array matching this structure:
[
  {
    "id": "freelancer-id",
    "matchScore": 95,
    "matchReason": "Short explanation of the fit..."
  }
]
Do not include any formatting or extra texts. Return only the JSON array.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Gemini API call failed");
      }

      const resData = await response.json();
      const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedMatches = JSON.parse(cleanJson);

      const results = freelancersCatalog.map((f) => {
        const matchInfo = parsedMatches.find((m: any) => m.id === f.id);
        return {
          ...f,
          matchScore: matchInfo?.matchScore || 50,
          matchReason: matchInfo?.matchReason || "No details provided."
        };
      }).sort((a, b) => b.matchScore - a.matchScore);

      setMatches(results);
    } catch (err) {
      console.error(err);
      // Fallback on error
      setMatches([]);
    } finally {
      setIsSearching(false);
    }
  };

  const presets = [
    "Looking for a designer to build minimalist vector logo sets",
    "I need a UI expert for a dark mode dashboard project",
    "Need a copywriter to establish SaaS landing page tones"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto max-h-[calc(100vh-80px)]">
      {/* Search Input Bar */}
      <div className="lg:col-span-12 flex flex-col gap-4">
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-purple/20 text-brand-purple rounded-lg">
              <Sparkles size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">AI Freelancer Matchmaker</h2>
              <p className="text-xs text-gray-400">Describe the profile, skills, and scope you need. AI will parse the registry.</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3 mt-2">
            <div className="flex-1 relative">
              <input
                type="text"
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='e.g., "I want a branding designer who specialized in vector layouts and handles typography guidelines..."'
                className="w-full glass-input rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500"
              />
              <Search className="absolute left-4 top-3.5 text-gray-500" size={16} />
            </div>
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="px-6 py-3 bg-brand-purple hover:bg-brand-purple/90 disabled:bg-brand-purple/35 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-purple/25 flex items-center gap-1.5"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Matching...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Find Matches</span>
                </>
              )}
            </button>
          </form>

          {/* Preset tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Search Hints:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(p)}
                className="text-xs px-3 py-1.5 bg-surface-card hover:bg-surface-card/90 border border-border-dark hover:border-brand-purple/30 text-gray-300 rounded-lg transition-colors cursor-pointer"
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Matching Results catalog list */}
      <div className="lg:col-span-12 flex flex-col gap-4">
        {isSearching ? (
          <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center gap-4 min-h-[300px]">
            <div className="p-4 bg-brand-purple/15 text-brand-purple rounded-full animate-spin border-4 border-dashed border-brand-purple" />
            <h3 className="text-sm font-bold text-white">AI Recruiting Engine Computing Scores</h3>
            <p className="text-xs text-gray-500 text-center max-w-sm">
              Analyzing freelancer portfolios, parsing Day Rates, extracting skill directories, and compiling semantic match ratios...
            </p>
          </div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((item) => (
              <div
                key={item.id}
                className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden glass-panel-hover"
              >
                {/* Match percentage badge overlay */}
                <div className="absolute top-0 right-0 p-3.5 bg-brand-purple/20 border-bl border-border-dark flex items-center gap-1 rounded-bl-2xl">
                  <BadgePercent size={14} className="text-brand-purple" />
                  <span className="text-xs font-mono font-black text-white">{item.matchScore}% Match</span>
                </div>

                {/* Profile Header */}
                <div className="flex gap-3">
                  <img
                    src={item.profileImage}
                    alt={item.fullName}
                    className="w-12 h-12 rounded-full object-cover border border-border-dark"
                  />
                  <div className="flex flex-col gap-0.5 justify-center pr-16">
                    <h4 className="text-sm font-extrabold text-white truncate">{item.fullName}</h4>
                    <span className="text-[10px] text-gray-450 truncate">{item.title}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                  {item.bio}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.skills.map((s, i) => (
                    <span key={i} className="text-[9px] font-bold px-2 py-0.5 bg-surface-dark/90 border border-border-dark text-brand-cyan rounded">
                      {s}
                    </span>
                  ))}
                </div>

                {/* AI recommendation reason card */}
                <div className="bg-brand-purple/10 border border-brand-purple/20 rounded-xl p-3 flex flex-col gap-1 mt-1">
                  <span className="text-[9px] text-brand-purple font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={9} className="animate-pulse" /> AI Match Justification
                  </span>
                  <p className="text-[10px] text-gray-300 leading-relaxed italic">
                    "{item.matchReason}"
                  </p>
                </div>

                {/* Stats */}
                <div className="flex justify-between items-center pt-3 border-t border-border-dark mt-auto text-[10px] text-gray-500">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1">
                      <Star size={11} className="text-brand-amber fill-brand-amber" /> {item.reputationScore}% Score
                    </span>
                    <span>•</span>
                    <span>{item.completedProjectsCount} Projects</span>
                  </div>
                  <span className="font-mono text-xs font-black text-white">${item.dayRate}/day</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center gap-3 min-h-[300px] text-gray-500">
            <Layers size={44} className="opacity-45" />
            <div className="text-center flex flex-col gap-1">
              <h3 className="text-sm font-bold text-white">Search Freelancer Registry</h3>
              <p className="text-xs text-gray-400 max-w-xs">
                Enter your project needs in the search query above to compare profiles and generate AI matching justification logs.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default FreelancerMatch;
