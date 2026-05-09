"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles, Brain, Zap, Heart, TrendingUp, Shield, Coffee, X,
  Calendar, BarChart2, AlertTriangle, CheckCircle, ArrowRight, RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { loadFromStore, STORE_KEYS } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type YearData = {
  year: number;
  title: string;
  salary: string;
  salary_midpoint: number;
  lifestyle: string;
  milestone: string;
  stress_level: number;
  work_life_balance: number;
  ai_replacement_risk: number;
  skills_unlocked: string[];
  remote_possibility: number;
};

type DayBlock = {
  time: string;
  activity: string;
  description: string;
  type: "deep_work" | "meeting" | "break" | "learning" | "personal";
};

type DayData = {
  year: number;
  mood: string;
  narrative: string;
  schedule: DayBlock[];
  tips: string[];
};

type ForecastData = {
  demand_curve: { year: number; demand_index: number; label: string }[];
  automation_risk_trend: { year: number; risk_percent: number; note: string }[];
  salary_market: { entry_level: string; mid_level: string; senior_level: string; projected_5yr_senior: string };
  top_hiring_companies: string[];
  remote_work_index: number;
  outlook_summary: string;
};

// ─── Color Helpers ────────────────────────────────────────────────────────────

const stressColor = (v: number) => v >= 70 ? "#f43f5e" : v >= 40 ? "#f59e0b" : "#10b981";
const balanceColor = (v: number) => v >= 70 ? "#10b981" : v >= 40 ? "#f59e0b" : "#f43f5e";
const riskColor = (v: number) => v >= 60 ? "#f43f5e" : v >= 30 ? "#f59e0b" : "#10b981";

const BLOCK_TYPE_STYLE: Record<string, string> = {
  deep_work: "border-violet-500/40 bg-violet-500/10",
  meeting: "border-cyan-500/40 bg-cyan-500/10",
  break: "border-emerald-500/40 bg-emerald-500/10",
  learning: "border-amber-500/40 bg-amber-500/10",
  personal: "border-rose-500/40 bg-rose-500/10",
};

const BLOCK_TYPE_DOT: Record<string, string> = {
  deep_work: "bg-violet-400",
  meeting: "bg-cyan-400",
  break: "bg-emerald-400",
  learning: "bg-amber-400",
  personal: "bg-rose-400",
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function MeterBar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-semibold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function SalaryRing({ midpoint, max = 100 }: { midpoint: number; max?: number }) {
  const pct = Math.min((midpoint / max) * 100, 100);
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="100" height="100" className="mx-auto" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke="url(#salary-grad)" strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <defs>
        <linearGradient id="salary-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <text x="50" y="46" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Outfit, sans-serif">₹{midpoint}L</text>
      <text x="50" y="60" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="Inter, sans-serif">/ year</text>
    </svg>
  );
}

function DayInLifeModal({ data, onClose, careerTitle }: { data: DayData; onClose: () => void; careerTitle: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass gradient-border p-6 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white">A Day in the Life — Year {data.year}</h3>
            <p className="text-xs text-slate-400">{careerTitle}</p>
          </div>
          <div className="ml-auto glass-violet rounded-full px-3 py-1 text-xs text-violet-300 capitalize">{data.mood}</div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-6 italic border-l-2 border-violet-500/40 pl-4">{data.narrative}</p>

        <div className="space-y-2 mb-6">
          {data.schedule.map((block, i) => (
            <div key={i} className={`flex gap-3 p-3 rounded-xl border ${BLOCK_TYPE_STYLE[block.type]}`}>
              <div className="flex flex-col items-center gap-1 flex-shrink-0 w-12 text-center">
                <span className="text-xs font-mono font-semibold text-slate-300">{block.time}</span>
                <div className={`w-2 h-2 rounded-full ${BLOCK_TYPE_DOT[block.type]}`} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white mb-0.5">{block.activity}</div>
                <div className="text-xs text-slate-400">{block.description}</div>
              </div>
            </div>
          ))}
        </div>

        {data.tips?.length > 0 && (
          <div className="glass rounded-xl p-4">
            <div className="text-xs font-semibold text-violet-400 mb-2 uppercase tracking-wider">Disha&apos;s Tips for Year {data.year}</div>
            <ul className="space-y-1.5">
              {data.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-300"><CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TwinPage() {
  const { user } = useAuth();
  const [twin, setTwin] = useState<YearData[]>([]);
  const [careerTitle, setCareerTitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dayModal, setDayModal] = useState<DayData | null>(null);
  const [loadingDay, setLoadingDay] = useState<number | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [activeYear, setActiveYear] = useState(0);

  useEffect(() => { generateTwin(); }, []);

  const generateTwin = async () => {
    setGenerating(true);
    setLoading(true);
    const selectedCareer = loadFromStore<Record<string, unknown>>(STORE_KEYS.SELECTED_CAREER);
    const profile = loadFromStore<Record<string, unknown>>(STORE_KEYS.ONBOARDING);
    const title = (selectedCareer?.title as string) || "Software Engineer";
    setCareerTitle(title);

    try {
      const [twinRes, forecastRes] = await Promise.all([
        fetch("/api/twin/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ career: selectedCareer || { title }, profile: profile || {} }),
        }),
        fetch("/api/analytics/forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ career_title: title }),
        }),
      ]);

      const twinData = await twinRes.json();
      if (twinData?.simulation) setTwin(twinData.simulation);

      const fData = await forecastRes.json();
      if (fData?.demand_curve) setForecast(fData);
    } catch {
      // use empty state, show retry
    }
    setGenerating(false);
    setLoading(false);
  };

  const openDayInLife = async (year: number) => {
    setLoadingDay(year);
    try {
      const res = await fetch("/api/twin/day-in-life", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ career_title: careerTitle, year }),
      });
      const data = await res.json();
      if (data?.schedule) setDayModal(data);
    } catch { /* silent */ }
    setLoadingDay(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center mx-auto mb-6 pulse-glow">
            <Brain className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Simulating Your Future...</h2>
          <p className="text-slate-400 text-sm">Disha is looking 5 years into the future for <span className="text-violet-400">{careerTitle}</span>.</p>
        </div>
      </div>
    );
  }

  const maxSalary = Math.max(...twin.map((y) => y.salary_midpoint || 1), 1);

  return (
    <div className="min-h-screen bg-[#050508] px-4 py-12">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 bg-grid opacity-20" />

      {dayModal && (
        <DayInLifeModal data={dayModal} onClose={() => setDayModal(null)} careerTitle={careerTitle} />
      )}

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="glass-violet rounded-full px-2.5 py-1 text-xs text-violet-300 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> AI Career Twin — Phase 3
              </div>
            </div>
            <h1 className="font-display text-4xl font-bold text-white mb-1">Your 5-Year Simulation</h1>
            <p className="text-slate-400 text-sm">A data-driven future as a <span className="text-violet-300 font-medium">{careerTitle}</span>.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/analytics" className="btn-secondary text-xs !py-2 !px-3 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5" /> Analytics
            </Link>
            <button onClick={generateTwin} disabled={generating} className="btn-secondary text-xs !py-2 !px-3 flex items-center gap-1.5">
              <RotateCcw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} /> Regenerate
            </button>
          </div>
        </div>

        {/* Salary Arc Overview */}
        {twin.length > 0 && (
          <div className="glass gradient-border rounded-2xl p-6 mb-8">
            <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Salary Growth Arc
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {twin.map((y, i) => (
                <button
                  key={i}
                  onClick={() => setActiveYear(activeYear === i ? -1 : i)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${activeYear === i ? "border-violet-500/50 bg-violet-500/10" : "border-white/5 hover:border-white/10"}`}
                >
                  <SalaryRing midpoint={y.salary_midpoint} max={maxSalary} />
                  <div className="text-xs font-medium text-slate-400">Year {y.year}</div>
                  <div className="text-xs text-slate-500 truncate w-full text-center">{y.title.split(" ").slice(-1)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-5 mb-10">
          {twin.map((yearData, i) => (
            <div
              key={i}
              className={`glass gradient-border rounded-2xl overflow-hidden transition-all duration-300 ${activeYear === i ? "ring-1 ring-violet-500/40" : ""}`}
            >
              {/* Year header */}
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-sm bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-violet-500/20 flex-shrink-0">
                    <span className="gradient-text">{yearData.year}</span>
                  </div>
                  <div>
                    <div className="font-display font-bold text-lg text-white leading-tight">{yearData.title}</div>
                    <div className="text-sm font-semibold text-emerald-400">{yearData.salary}</div>
                  </div>
                </div>

                {/* AI Risk Badge */}
                <div className="flex flex-col items-end gap-2">
                  <div
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full glass border"
                    style={{ color: riskColor(yearData.ai_replacement_risk), borderColor: `${riskColor(yearData.ai_replacement_risk)}30` }}
                  >
                    <Shield className="w-3 h-3" />
                    AI Risk: {yearData.ai_replacement_risk}%
                  </div>
                  <button
                    onClick={() => openDayInLife(yearData.year)}
                    disabled={loadingDay === yearData.year}
                    className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors glass px-2.5 py-1.5 rounded-full border border-violet-500/20 hover:border-violet-500/40"
                  >
                    {loadingDay === yearData.year ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      <><Coffee className="w-3 h-3" /> Day in Life</>
                    )}
                  </button>
                </div>
              </div>

              {/* Meters */}
              <div className="px-5 pb-2 grid grid-cols-3 gap-4">
                <MeterBar value={yearData.stress_level} color={stressColor(yearData.stress_level)} label="Stress" />
                <MeterBar value={yearData.work_life_balance} color={balanceColor(yearData.work_life_balance)} label="Work-Life" />
                <MeterBar value={yearData.remote_possibility} color="#a855f7" label="Remote %" />
              </div>

              {/* Details */}
              <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-4 mt-2">
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-300">{yearData.milestone}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-400">{yearData.lifestyle}</p>
                </div>
                {yearData.skills_unlocked?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {yearData.skills_unlocked.map((skill) => (
                      <span key={skill} className="text-xs glass px-2.5 py-1 rounded-full border border-emerald-500/20 text-emerald-300">
                        ✦ {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Forecast Panel */}
        {forecast && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Demand Curve */}
            <div className="glass gradient-border rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" /> 5-Year Market Demand
              </h3>
              <div className="flex items-end gap-2 h-32">
                {forecast.demand_curve.map((d) => (
                  <div key={d.year} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs text-cyan-400 font-semibold">{d.demand_index}</div>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-cyan-600/40 to-cyan-400/60 transition-all duration-700"
                      style={{ height: `${d.demand_index}%` }}
                    />
                    <div className="text-xs text-slate-600">&apos;{String(d.year).slice(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Salary Market */}
            <div className="glass gradient-border rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" /> Salary Market Bands
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Entry Level", value: forecast.salary_market.entry_level, color: "#22d3ee" },
                  { label: "Mid Level", value: forecast.salary_market.mid_level, color: "#a855f7" },
                  { label: "Senior Level", value: forecast.salary_market.senior_level, color: "#10b981" },
                  { label: "5-Yr Projected Senior", value: forecast.salary_market.projected_5yr_senior, color: "#f59e0b" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between glass rounded-xl px-4 py-2.5 border border-white/5">
                    <span className="text-xs text-slate-400">{item.label}</span>
                    <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Automation Risk Timeline */}
            <div className="glass gradient-border rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> AI Automation Risk Trend
              </h3>
              <div className="space-y-3">
                {forecast.automation_risk_trend.map((d) => (
                  <div key={d.year}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">{d.year}</span>
                      <span style={{ color: riskColor(d.risk_percent) }}>{d.risk_percent}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${d.risk_percent}%`, background: riskColor(d.risk_percent) }} />
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{d.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Hiring + Remote */}
            <div className="glass gradient-border rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-violet-400" /> Top Hiring Companies
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {forecast.top_hiring_companies.map((c) => (
                  <span key={c} className="text-xs glass px-3 py-1.5 rounded-full border border-white/10 text-slate-300">{c}</span>
                ))}
              </div>
              <div className="glass rounded-xl p-3 border border-violet-500/20">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Remote Work Index</span>
                  <span className="text-violet-400 font-semibold">{forecast.remote_work_index}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400" style={{ width: `${forecast.remote_work_index}%` }} />
                </div>
              </div>
              {forecast.outlook_summary && (
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">{forecast.outlook_summary}</p>
              )}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="glass gradient-border rounded-2xl p-8 text-center">
          <h3 className="font-display text-xl font-bold text-white mb-2">Excited about this future?</h3>
          <p className="text-slate-400 text-sm mb-6">Start building it today. Disha can help you generate a detailed 24-week roadmap to get started.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/roadmap" className="btn-primary flex items-center gap-2 justify-center shine">
              Build My Roadmap <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/analytics" className="btn-secondary flex items-center gap-2 justify-center">
              <BarChart2 className="w-4 h-4" /> View Analytics
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
