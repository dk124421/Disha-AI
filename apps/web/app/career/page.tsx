"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, TrendingUp, Shield, Brain, Zap, Globe, AlertTriangle, Star, ChevronDown, ChevronUp, Heart } from "lucide-react";
import Link from "next/link";
import { loadFromStore, saveToStore, STORE_KEYS } from "@/lib/store";

// ─── FALLBACK DATA (used when no AI data in store) ─────────
const FALLBACK_CAREERS = [
  { rank: 1, title: "UX/Product Designer", category: "Design & Technology", tagline: "The perfect blend of creativity, psychology, and technology.", why_this_fits: "Your creative passion and analytical thinking make you a natural UX designer.", reality_scores: { passion_fit: 92, salary_potential: 78, market_demand: 88, ai_risk: 25, stress_level: 55, difficulty: 60, remote_possibility: 95, future_growth: 90 }, salary_range: { min: 600000, max: 2800000, currency: "INR" }, top_skills: ["Figma", "User Research", "Prototyping", "Psychology"], day_in_life: "Mornings in user research, afternoons building wireframes, evenings with developers.", tier2_note: "Fully remote-friendly.", entry_paths: ["Google UX Certificate", "Portfolio projects", "Internshala"], color: "#a855f7" },
  { rank: 2, title: "AI/ML Engineer", category: "Technology", tagline: "Build systems reshaping every industry.", why_this_fits: "Analytical mindset + India's booming AI market = strong fit.", reality_scores: { passion_fit: 80, salary_potential: 95, market_demand: 97, ai_risk: 15, stress_level: 65, difficulty: 80, remote_possibility: 85, future_growth: 98 }, salary_range: { min: 800000, max: 4000000, currency: "INR" }, top_skills: ["Python", "TensorFlow", "Statistics", "SQL"], day_in_life: "Writing model scripts, debugging pipelines, presenting insights.", tier2_note: "Strong remote opportunities at startups.", entry_paths: ["Fast.ai", "Kaggle", "3 portfolio projects"], color: "#22d3ee" },
  { rank: 3, title: "Content Creator", category: "Media & Education", tagline: "Turn your knowledge into income and impact.", why_this_fits: "Love for sharing ideas + India's creator economy boom.", reality_scores: { passion_fit: 88, salary_potential: 65, market_demand: 82, ai_risk: 30, stress_level: 40, difficulty: 45, remote_possibility: 100, future_growth: 85 }, salary_range: { min: 300000, max: 5000000, currency: "INR" }, top_skills: ["Video Editing", "SEO", "Writing", "Community"], day_in_life: "Recording tutorials, engaging your audience, building courses.", tier2_note: "100% location-independent.", entry_paths: ["Start YouTube", "Udemy course", "Newsletter"], color: "#f59e0b" },
  { rank: 4, title: "Digital Marketing Strategist", category: "Business", tagline: "Help brands reach people in the digital age.", why_this_fits: "Communication skills + every business needs this.", reality_scores: { passion_fit: 75, salary_potential: 70, market_demand: 88, ai_risk: 35, stress_level: 50, difficulty: 45, remote_possibility: 90, future_growth: 80 }, salary_range: { min: 400000, max: 2000000, currency: "INR" }, top_skills: ["SEO", "Analytics", "Social Media", "Copywriting"], day_in_life: "Planning campaigns, analyzing data, writing copy.", tier2_note: "Fully remote, high freelance demand.", entry_paths: ["Google Certificate", "HubSpot Academy", "Local agency"], color: "#10b981" },
  { rank: 5, title: "Social Entrepreneur", category: "Entrepreneurship", tagline: "Build something the world needs.", why_this_fits: "Impact-orientation + entrepreneurial spirit.", reality_scores: { passion_fit: 90, salary_potential: 60, market_demand: 80, ai_risk: 10, stress_level: 85, difficulty: 90, remote_possibility: 70, future_growth: 95 }, salary_range: { min: 0, max: 10000000, currency: "INR" }, top_skills: ["Business Strategy", "Sales", "Product", "Fundraising"], day_in_life: "Pitching investors, solving customer problems, building team.", tier2_note: "Many solve Tier-2 problems from Tier-2 cities.", entry_paths: ["Side project", "NASSCOM Startup", "Ecosystem events"], color: "#f43f5e" },
];

const METRICS = [
  { key: "passion_fit", label: "Passion Fit", icon: Heart, higherIsBetter: true },
  { key: "salary_potential", label: "Salary Potential", icon: TrendingUp, higherIsBetter: true },
  { key: "market_demand", label: "Market Demand", icon: Globe, higherIsBetter: true },
  { key: "ai_risk", label: "AI Risk", icon: Zap, higherIsBetter: false },
  { key: "stress_level", label: "Stress Level", icon: AlertTriangle, higherIsBetter: false },
  { key: "difficulty", label: "Entry Difficulty", icon: Brain, higherIsBetter: false },
  { key: "remote_possibility", label: "Remote Work", icon: Globe, higherIsBetter: true },
  { key: "future_growth", label: "Future Growth", icon: TrendingUp, higherIsBetter: true },
];

function ScoreBar({ value, higherIsBetter }: { value: number; higherIsBetter: boolean }) {
  const isGood = higherIsBetter ? value >= 70 : value <= 40;
  const isMid = higherIsBetter ? (value >= 50 && value < 70) : (value > 40 && value <= 65);
  const color = isGood ? "#10b981" : isMid ? "#f59e0b" : "#f43f5e";
  return (
    <div className="flex items-center gap-2">
      <div className="score-bar flex-1">
        <div className="score-bar-fill" style={{ width: `${value}%`, background: color }}/>
      </div>
      <span className="text-xs font-medium w-8 text-right" style={{ color }}>{value}</span>
    </div>
  );
}

type Career = typeof FALLBACK_CAREERS[0];

function CareerCard({ career, isTop, onSelect }: { career: Career; isTop: boolean; onSelect: () => void }) {
  const [expanded, setExpanded] = useState(isTop);
  const salaryK = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${n.toLocaleString()}`;

  return (
    <div className={`glass gradient-border rounded-2xl overflow-hidden transition-all duration-300 ${isTop ? "ring-1 ring-violet-500/30" : ""}`}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isTop && (
                <div className="flex items-center gap-1 glass-violet rounded-full px-2 py-0.5">
                  <Star className="w-3 h-3 fill-violet-400 text-violet-400"/>
                  <span className="text-xs text-violet-300 font-medium">Best Match</span>
                </div>
              )}
              <span className="text-xs text-slate-500">#{career.rank}</span>
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-1">{career.title}</h3>
            <p className="text-xs text-slate-500">{career.category}</p>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-display font-black" style={{ background: `${career.color}20`, color: career.color }}>#{career.rank}</div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed italic mb-4">&ldquo;{career.tagline}&rdquo;</p>

        <div className="flex gap-3 mb-4">
          <div className="glass rounded-lg px-3 py-2 text-center flex-1">
            <div className="text-xs text-slate-500 mb-0.5">Salary Range</div>
            <div className="text-sm font-semibold text-white">{salaryK(career.salary_range.min)} – {salaryK(career.salary_range.max)}</div>
          </div>
          <div className="glass rounded-lg px-3 py-2 text-center flex-1">
            <div className="text-xs text-slate-500 mb-0.5">Remote</div>
            <div className="text-sm font-semibold" style={{ color: career.color }}>{career.reality_scores.remote_possibility}%</div>
          </div>
          <div className="glass rounded-lg px-3 py-2 text-center flex-1">
            <div className="text-xs text-slate-500 mb-0.5">Growth</div>
            <div className="text-sm font-semibold text-emerald-400">{career.reality_scores.future_growth}%</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {career.top_skills.map((skill) => (
            <span key={skill} className="text-xs glass px-2.5 py-1 rounded-full border border-white/5 text-slate-300">{skill}</span>
          ))}
        </div>

        <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors py-2">
          {expanded ? <>Less detail <ChevronUp className="w-3.5 h-3.5"/></> : <>Full reality check <ChevronDown className="w-3.5 h-3.5"/></>}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-white/5 p-6 space-y-5">
          <div>
            <h4 className="font-semibold text-white text-sm mb-2 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-violet-400"/>Why this fits you</h4>
            <p className="text-slate-400 text-sm leading-relaxed">{career.why_this_fits}</p>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-cyan-400"/>Reality Score Breakdown</h4>
            <div className="space-y-2.5">
              {METRICS.map((metric) => (
                <div key={metric.key} className="grid grid-cols-5 gap-2 items-center">
                  <div className="flex items-center gap-1 col-span-2">
                    <metric.icon className="w-3 h-3 text-slate-500"/>
                    <span className="text-xs text-slate-400">{metric.label}</span>
                  </div>
                  <div className="col-span-3">
                    <ScoreBar value={career.reality_scores[metric.key as keyof typeof career.reality_scores]} higherIsBetter={metric.higherIsBetter}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-4">
              <h5 className="text-xs font-semibold text-white mb-2">☀️ A Day in Your Life</h5>
              <p className="text-xs text-slate-400 leading-relaxed">{career.day_in_life}</p>
            </div>
            <div className="glass rounded-xl p-4" style={{ border: `1px solid ${career.color}25` }}>
              <h5 className="text-xs font-semibold text-white mb-2">📍 From Your City</h5>
              <p className="text-xs text-slate-400 leading-relaxed">{career.tier2_note}</p>
            </div>
          </div>

          {career.entry_paths && (
            <div>
              <h5 className="text-xs font-semibold text-white mb-2">🚀 How to Start</h5>
              <div className="flex flex-wrap gap-2">
                {career.entry_paths.map((path) => (
                  <span key={path} className="text-xs glass px-2.5 py-1 rounded-full border border-white/5 text-slate-300">{path}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onSelect} className="flex-1 btn-primary text-center text-sm !py-2.5 shine" style={{ background: `linear-gradient(135deg, ${career.color}, ${career.color}cc)` }}>
              Get My Roadmap →
            </button>
            <Link href="/chat" className="btn-secondary text-sm !py-2.5 !px-4">Ask Disha</Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CareerPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [ikigaiScore, setIkigaiScore] = useState<number | null>(null);
  const [sweetSpot, setSweetSpot] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = loadFromStore<{ careers?: Career[]; match_reasoning?: string; ikigai_sweet_spot?: string }>(STORE_KEYS.CAREER_MATCHES);
    const analysis = loadFromStore<{ ikigai_score?: number; sweet_spot?: string }>(STORE_KEYS.IKIGAI_ANALYSIS);

    if (stored?.careers && stored.careers.length > 0) {
      setCareers(stored.careers);
      setSweetSpot(stored.ikigai_sweet_spot || stored.match_reasoning || "");
    } else {
      setCareers(FALLBACK_CAREERS);
    }
    if (analysis?.ikigai_score) setIkigaiScore(analysis.ikigai_score);
    if (analysis?.sweet_spot) setSweetSpot(analysis.sweet_spot);

    setTimeout(() => setLoading(false), 800);
  }, []);

  const handleSelectCareer = (career: Career) => {
    saveToStore(STORE_KEYS.SELECTED_CAREER, career);
    window.location.href = "/roadmap";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center mx-auto mb-6 pulse-glow">
            <Brain className="w-8 h-8 text-white"/>
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Loading Your Matches</h2>
          <div className="flex gap-2 justify-center mt-4">
            {[0,1,2].map((i) => <div key={i} className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: `${i*0.2}s` }}/>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] px-4 py-12">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 glass-violet rounded-full px-3 py-1.5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-violet-400"/>
            <span className="text-xs text-violet-300">AI-personalized for you</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-3">Your Career Matches</h1>
          <p className="text-slate-400">
            Based on your IKIGAI assessment.{" "}
            <Link href="/chat" className="text-violet-400 hover:text-violet-300 transition-colors">Ask Disha to explain →</Link>
          </p>

          {(ikigaiScore || sweetSpot) && (
            <div className="glass gradient-border rounded-2xl p-4 mt-6 text-left">
              <div className="flex items-center gap-4">
                {ikigaiScore && (
                  <div className="text-center flex-shrink-0">
                    <div className="font-display text-3xl font-black gradient-text">{ikigaiScore}%</div>
                    <div className="text-xs text-slate-500">IKIGAI Score</div>
                  </div>
                )}
                {sweetSpot && (
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 mb-1 font-semibold text-violet-300">Your Sweet Spot</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{sweetSpot}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {careers.map((career, i) => (
            <CareerCard key={career.rank || i} career={career} isTop={i === 0} onSelect={() => handleSelectCareer(career)}/>
          ))}
        </div>

        <div className="mt-10 glass gradient-border rounded-2xl p-8 text-center">
          <h3 className="font-display text-xl font-bold text-white mb-2">Ready to build your roadmap?</h3>
          <p className="text-slate-400 text-sm mb-6">Choose your top career match and Disha generates a personalized 24-week learning path.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => handleSelectCareer(careers[0])} className="btn-primary flex items-center gap-2 shine glow-violet">
              Build Roadmap for {careers[0]?.title} <ArrowRight className="w-4 h-4"/>
            </button>
            <Link href="/chat" className="btn-secondary flex items-center gap-2 justify-center">Discuss with Disha</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
