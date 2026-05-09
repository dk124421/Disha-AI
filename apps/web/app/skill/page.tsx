"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { saveSkillAnalysis } from "@/lib/store";

interface SkillGap {
  skill: string;
  priority: string;
  why_needed: string;
  estimated_learning_weeks: number;
  resources: { title: string; type: string; url: string; is_free: boolean; estimated_hours: number }[];
}

interface Strength {
  skill: string;
  level: string;
  market_value: string;
  description: string;
}

interface LearningPath {
  week_range: string;
  focus: string;
  goal: string;
  resources: string[];
}

interface PortfolioSuggestion {
  project: string;
  skills_demonstrated: string[];
  difficulty: string;
  impact: string;
}

interface SkillAnalysis {
  readiness_score: number;
  readiness_label: string;
  readiness_description: string;
  strengths: Strength[];
  skill_gaps: SkillGap[];
  quick_wins: string[];
  learning_path: LearningPath[];
  portfolio_suggestions: PortfolioSuggestion[];
  market_insights: {
    demand_level: string;
    avg_salary_inr: number;
    top_hiring_companies: string[];
    remote_friendly: boolean;
    tier2_friendly: boolean;
  };
  personalized_advice: string;
}

const PRIORITY_COLOR: Record<string, string> = {
  High: "text-red-400 bg-red-400/10 border-red-400/30",
  Medium: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  Low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
};

const MARKET_VALUE_COLOR: Record<string, string> = {
  High: "text-emerald-400",
  Medium: "text-amber-400",
  Low: "text-slate-400",
};

function ReadinessRing({ score }: { score: number }) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs text-slate-400">/ 100</span>
      </div>
    </div>
  );
}

export default function SkillPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [rawSkills, setRawSkills] = useState("");
  const [careerTarget, setCareerTarget] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SkillAnalysis | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"gaps" | "path" | "portfolio">("gaps");

  async function handleAnalyze() {
    if (!rawSkills.trim()) {
      setError("Please describe your current skills.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const onboarding = JSON.parse(localStorage.getItem("disha_onboarding") || "{}");
      const res = await fetch("/api/skill/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_skills_text: rawSkills,
          career_target: careerTarget || undefined,
          github_url: githubUrl || undefined,
          user_profile: onboarding,
        }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data: SkillAnalysis = await res.json();
      setAnalysis(data);
      await saveSkillAnalysis(
        { ...data, career_target: careerTarget, raw_input: rawSkills },
        user?.id
      );
    } catch {
      setError("Analysis failed. Make sure the AI service is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-lg font-semibold text-white">Skill Gap Analyzer</h1>
            <p className="text-xs text-slate-500">AI-powered career readiness assessment</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Input Section */}
        {!analysis && (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium">
                ⚡ Intelligence Layer
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Know Your Skill DNA
              </h2>
              <p className="text-slate-400 max-w-lg mx-auto">
                Tell Disha what you know. She'll map your strengths, gaps, and the exact path to your goal.
              </p>
            </div>

            <div className="grid gap-5">
              {/* Skills textarea */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-3 backdrop-blur">
                <label className="text-sm font-medium text-slate-300">
                  Describe your current skills *
                </label>
                <textarea
                  value={rawSkills}
                  onChange={(e) => setRawSkills(e.target.value)}
                  placeholder="e.g. I know Python basics, some React, built 2 personal projects. Good at problem solving, decent at SQL. Never done system design or cloud."
                  rows={5}
                  className="w-full bg-transparent border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 resize-none focus:outline-none focus:border-violet-500/50 transition-colors"
                />
                <p className="text-xs text-slate-600">Be honest — the more detail you give, the better Disha's analysis.</p>
              </div>

              {/* Career target + GitHub */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-2 backdrop-blur">
                  <label className="text-sm font-medium text-slate-300">Career Target</label>
                  <input
                    value={careerTarget}
                    onChange={(e) => setCareerTarget(e.target.value)}
                    placeholder="e.g. Full Stack Developer"
                    className="w-full bg-transparent border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-2 backdrop-blur">
                  <label className="text-sm font-medium text-slate-300">GitHub Profile (optional)</label>
                  <input
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full bg-transparent border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-center text-red-400 text-sm">{error}</p>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="relative px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-900/30"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing your skills...
                  </span>
                ) : (
                  "Analyze My Skills →"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {analysis && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top: Readiness Score + Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur p-6 flex flex-col items-center gap-3">
                <ReadinessRing score={analysis.readiness_score} />
                <div className="text-center">
                  <div className="text-base font-semibold text-white">{analysis.readiness_label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Readiness Score</div>
                </div>
              </div>

              <div className="sm:col-span-2 rounded-2xl border border-white/8 bg-white/3 backdrop-blur p-6 space-y-4">
                <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider">Disha's Assessment</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{analysis.readiness_description}</p>
                <p className="text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">{analysis.personalized_advice}</p>
              </div>
            </div>

            {/* Market Insights */}
            <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Market Demand</div>
                <div className={`text-sm font-semibold ${analysis.market_insights.demand_level === "High" ? "text-emerald-400" : "text-amber-400"}`}>
                  {analysis.market_insights.demand_level}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Avg Salary</div>
                <div className="text-sm font-semibold text-white">
                  ₹{(analysis.market_insights.avg_salary_inr / 100000).toFixed(1)}L/yr
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Remote-Friendly</div>
                <div className={`text-sm font-semibold ${analysis.market_insights.remote_friendly ? "text-emerald-400" : "text-slate-400"}`}>
                  {analysis.market_insights.remote_friendly ? "Yes ✓" : "Limited"}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Tier-2 Friendly</div>
                <div className={`text-sm font-semibold ${analysis.market_insights.tier2_friendly ? "text-emerald-400" : "text-slate-400"}`}>
                  {analysis.market_insights.tier2_friendly ? "Yes ✓" : "Limited"}
                </div>
              </div>
            </div>

            {/* Quick Wins */}
            {analysis.quick_wins?.length > 0 && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur p-6 space-y-3">
                <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">⚡ Quick Wins — Do This Week</h3>
                <ul className="space-y-2">
                  {analysis.quick_wins.map((win, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-300">
                      <span className="text-emerald-400 font-bold shrink-0">{i + 1}.</span>
                      {win}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tabs */}
            <div>
              <div className="flex gap-1 p-1 bg-white/3 rounded-xl border border-white/8 w-fit mb-6">
                {(["gaps", "path", "portfolio"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab
                        ? "bg-violet-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab === "gaps" ? "Skill Gaps" : tab === "path" ? "Learning Path" : "Portfolio"}
                  </button>
                ))}
              </div>

              {/* Strengths + Gaps */}
              {activeTab === "gaps" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-emerald-400">Your Strengths</h4>
                    {analysis.strengths.map((s, i) => (
                      <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{s.skill}</span>
                          <span className={`text-xs font-medium ${MARKET_VALUE_COLOR[s.market_value] || "text-slate-400"}`}>
                            {s.market_value} demand
                          </span>
                        </div>
                        <div className="text-xs text-violet-400">{s.level}</div>
                        <p className="text-xs text-slate-500">{s.description}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-red-400">Skill Gaps to Close</h4>
                    {analysis.skill_gaps.map((g, i) => (
                      <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{g.skill}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_COLOR[g.priority] || ""}`}>
                            {g.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{g.why_needed}</p>
                        <div className="text-xs text-slate-600">~{g.estimated_learning_weeks}w to close</div>
                        {g.resources?.slice(0, 2).map((r, j) => (
                          <div key={j} className="flex items-center gap-2 text-xs text-violet-400">
                            <span>{r.is_free ? "🆓" : "💳"}</span>
                            <span>{r.title}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Path */}
              {activeTab === "path" && (
                <div className="space-y-4">
                  {analysis.learning_path.map((phase, i) => (
                    <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-400">
                          {i + 1}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">Week {phase.week_range}</div>
                          <div className="text-xs text-slate-500">{phase.focus}</div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300">{phase.goal}</p>
                      <div className="flex flex-wrap gap-2">
                        {phase.resources.map((r, j) => (
                          <span key={j} className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-slate-400 border border-white/8">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Portfolio */}
              {activeTab === "portfolio" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {analysis.portfolio_suggestions.map((p, i) => (
                    <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white">{p.project}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          {p.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{p.impact}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.skills_demonstrated.map((s, j) => (
                          <span key={j} className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-slate-400 border border-white/8">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Re-analyze button */}
            <div className="flex gap-3 justify-center pt-4">
              <button
                onClick={() => { setAnalysis(null); setRawSkills(""); setCareerTarget(""); setGithubUrl(""); }}
                className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:text-white hover:border-white/20 transition-all"
              >
                Start Fresh
              </button>
              <button
                onClick={() => router.push("/roadmap")}
                className="px-6 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-all"
              >
                View My Roadmap →
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease forwards; }
      `}</style>
    </div>
  );
}
