"use client";

import { useState, useEffect } from "react";
import {
  BarChart2, TrendingUp, AlertTriangle, Zap, Brain,
  CheckCircle, ArrowRight, Sparkles, Target, RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { loadFromStore, STORE_KEYS, loadSkillAnalysis } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";

type DemandPoint = { year: number; demand_index: number; label: string };
type RiskPoint = { year: number; risk_percent: number; note: string };
type SalaryMarket = { entry_level: string; mid_level: string; senior_level: string; projected_5yr_senior: string };

type ForecastData = {
  career_title: string;
  demand_curve: DemandPoint[];
  automation_risk_trend: RiskPoint[];
  salary_market: SalaryMarket;
  top_hiring_companies: string[];
  remote_work_index: number;
  outlook_summary: string;
};

type UserInsights = {
  velocity_label: string;
  velocity_score: number;
  streak_message: string;
  projected_ready_weeks: number;
  insight: string;
  next_action: string;
  skill_gaps_to_watch: string[];
};

const riskColor = (v: number) => v >= 60 ? "#f43f5e" : v >= 30 ? "#f59e0b" : "#10b981";
const velocityColor = (label: string) => ({
  "Accelerating": "#10b981",
  "Steady": "#22d3ee",
  "Needs Boost": "#f59e0b",
  "Just Starting": "#a855f7",
}[label] || "#94a3b8");

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [careerTitle, setCareerTitle] = useState("your career");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(false);

    const selectedCareer = loadFromStore<Record<string, unknown>>(STORE_KEYS.SELECTED_CAREER);
    const roadmap = loadFromStore<{ phases?: { milestones: unknown[] }[] }>(STORE_KEYS.ROADMAP);
    const milestones = loadFromStore<Record<string, boolean>>("disha_milestones") || {};
    const skillAnalysis = loadSkillAnalysis();

    const title = (selectedCareer?.title as string) || "Software Engineer";
    setCareerTitle(title);

    const totalMilestones = roadmap?.phases?.reduce((s, p) => s + p.milestones.length, 0) || 0;
    const doneMilestones = Object.values(milestones).filter(Boolean).length;
    const skillReadiness = skillAnalysis?.readiness_score as number | undefined;

    try {
      const [fRes, iRes] = await Promise.all([
        fetch("/api/analytics/forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ career_title: title }),
        }),
        fetch("/api/analytics/user-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user?.id || "anon",
            milestones_completed: doneMilestones,
            total_milestones: totalMilestones,
            career_title: title,
            skill_readiness: skillReadiness,
          }),
        }),
      ]);

      const fData = await fRes.json();
      const iData = await iRes.json();

      if (fData?.demand_curve) setForecast(fData);
      if (iData?.velocity_label) setInsights(iData);
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-violet-500 flex items-center justify-center mx-auto mb-4 pulse-glow">
            <BarChart2 className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="font-display text-xl font-bold text-white mb-1">Generating Analytics...</h2>
          <p className="text-slate-400 text-sm">Disha is crunching the career data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] px-4 py-12">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="glass-violet rounded-full px-2.5 py-1 text-xs text-violet-300 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Predictive Intelligence
              </div>
            </div>
            <h1 className="font-display text-4xl font-bold text-white mb-1">Career Analytics</h1>
            <p className="text-slate-400 text-sm">Data-driven insights for your path as a <span className="text-cyan-300 font-medium">{careerTitle}</span>.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/twin" className="btn-secondary text-xs !py-2 !px-3 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" /> Career Twin
            </Link>
            <button onClick={loadAnalytics} className="btn-secondary text-xs !py-2 !px-3 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="glass gradient-border rounded-2xl p-6 mb-6 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Analytics require the AI service to be running. Start it with <code className="text-violet-300">uvicorn main:app</code> in <code className="text-violet-300">apps/ai-service</code>.</p>
          </div>
        )}

        {/* User Learning Insights */}
        {insights && (
          <div className="glass gradient-border rounded-2xl p-6 mb-6">
            <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Your Learning Velocity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Velocity Score */}
              <div className="flex flex-col items-center justify-center glass rounded-2xl p-5 text-center">
                <div className="font-display text-5xl font-black mb-1" style={{ color: velocityColor(insights.velocity_label) }}>
                  {insights.velocity_score}
                </div>
                <div className="text-sm font-semibold" style={{ color: velocityColor(insights.velocity_label) }}>
                  {insights.velocity_label}
                </div>
                <div className="text-xs text-slate-500 mt-1">velocity score</div>
              </div>

              {/* Insights */}
              <div className="md:col-span-2 space-y-3">
                <p className="text-sm text-slate-300 leading-relaxed">{insights.insight}</p>
                <div className="glass rounded-xl p-3 border border-violet-500/20">
                  <div className="text-xs text-violet-400 font-semibold mb-1">Next Action</div>
                  <p className="text-sm text-white">{insights.next_action}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Projected job-ready in</span>
                  <span className="font-bold text-cyan-400">{insights.projected_ready_weeks} weeks</span>
                </div>
                <p className="text-xs text-emerald-400 italic">&ldquo;{insights.streak_message}&rdquo;</p>
              </div>
            </div>

            {/* Skill gaps */}
            {insights.skill_gaps_to_watch?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="text-xs text-slate-500 mb-2">Skill gaps to watch</div>
                <div className="flex flex-wrap gap-2">
                  {insights.skill_gaps_to_watch.map((gap) => (
                    <span key={gap} className="text-xs glass px-3 py-1.5 rounded-full border border-amber-500/20 text-amber-300">⚠ {gap}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {forecast && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Demand Bar Chart */}
            <div className="glass gradient-border rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" /> 5-Year Market Demand
              </h3>
              <div className="flex items-end gap-2 h-40 mb-2">
                {forecast.demand_curve.map((d) => (
                  <div key={d.year} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs font-bold text-cyan-400">{d.demand_index}</div>
                    <div
                      className="w-full rounded-t-lg transition-all duration-700"
                      style={{
                        height: `${d.demand_index}%`,
                        background: `linear-gradient(to top, rgba(34,211,238,0.5), rgba(34,211,238,0.2))`,
                        border: "1px solid rgba(34,211,238,0.3)",
                      }}
                    />
                    <div className="text-xs text-slate-600">&apos;{String(d.year).slice(2)}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">{forecast.outlook_summary}</p>
            </div>

            {/* Automation Risk */}
            <div className="glass gradient-border rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> AI Automation Risk
              </h3>
              <div className="space-y-4">
                {forecast.automation_risk_trend.map((d) => (
                  <div key={d.year}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{d.year}</span>
                      <span style={{ color: riskColor(d.risk_percent) }} className="font-semibold">{d.risk_percent}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-0.5">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.risk_percent}%`, background: riskColor(d.risk_percent) }} />
                    </div>
                    <p className="text-xs text-slate-600">{d.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Salary Bands */}
            <div className="glass gradient-border rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" /> Salary Market Bands
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Entry Level", value: forecast.salary_market.entry_level, color: "#22d3ee" },
                  { label: "Mid Level", value: forecast.salary_market.mid_level, color: "#a855f7" },
                  { label: "Senior Level", value: forecast.salary_market.senior_level, color: "#10b981" },
                  { label: "Projected (5yr Senior)", value: forecast.salary_market.projected_5yr_senior, color: "#f59e0b" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between glass rounded-xl px-4 py-2.5 border border-white/5">
                    <span className="text-xs text-slate-400">{item.label}</span>
                    <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Hiring + Remote */}
            <div className="glass gradient-border rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-400" /> Top Hiring Companies
              </h3>
              <div className="flex flex-wrap gap-2 mb-5">
                {forecast.top_hiring_companies.map((c) => (
                  <span key={c} className="text-xs glass px-3 py-1.5 rounded-full border border-white/10 text-slate-300">{c}</span>
                ))}
              </div>
              <div className="glass rounded-xl p-3 border border-violet-500/20">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Remote Work Index</span>
                  <span className="text-violet-400 font-semibold">{forecast.remote_work_index}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400" style={{ width: `${forecast.remote_work_index}%` }} />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* CTA */}
        <div className="glass gradient-border rounded-2xl p-8 text-center">
          <h3 className="font-display text-xl font-bold text-white mb-2">Ready to act on these insights?</h3>
          <p className="text-slate-400 text-sm mb-6">Use Disha&apos;s AI Career Twin to simulate your full 5-year journey, or ask the mentor anything.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/twin" className="btn-primary flex items-center gap-2 justify-center shine">
              Career Twin Simulation <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/chat" className="btn-secondary flex items-center gap-2 justify-center">
              <Sparkles className="w-4 h-4" /> Ask Disha
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
