"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, TrendingUp, Shield, Brain, Zap, Globe, AlertTriangle, Star, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

// ─── MOCK CAREER DATA ──────────────────────────────────────
// (In production, this comes from /api/career/match)
const MOCK_CAREERS = [
  {
    rank: 1,
    title: "UX/Product Designer",
    category: "Design & Technology",
    tagline: "The perfect blend of creativity, psychology, and technology.",
    why_this_fits: "Your love for design, analytical thinking, and empathy for people make you a natural fit for UX. You'll create experiences that millions use daily — and you can do this from anywhere in India.",
    reality_scores: {
      passion_fit: 92,
      salary_potential: 78,
      market_demand: 88,
      ai_risk: 25,
      stress_level: 55,
      difficulty: 60,
      remote_possibility: 95,
      future_growth: 90,
    },
    salary_range: { min: 600000, max: 2800000, currency: "INR" },
    top_skills: ["Figma", "User Research", "Prototyping", "Psychology"],
    day_in_life: "Mornings in user research calls, afternoons building wireframes and prototypes, evenings collaborating with developers to bring designs to life.",
    tier2_note: "Fully remote-friendly. Many top companies hire UX designers from Tier-2 cities.",
    color: "#a855f7",
  },
  {
    rank: 2,
    title: "AI/ML Engineer",
    category: "Technology",
    tagline: "Build the systems that are reshaping every industry.",
    why_this_fits: "Your analytical mindset and interest in technology position you perfectly for AI. Python is learnable, and India's AI job market is exploding — especially in Bangalore, Hyderabad, and remote roles.",
    reality_scores: {
      passion_fit: 80,
      salary_potential: 95,
      market_demand: 97,
      ai_risk: 15,
      stress_level: 65,
      difficulty: 80,
      remote_possibility: 85,
      future_growth: 98,
    },
    salary_range: { min: 800000, max: 4000000, currency: "INR" },
    top_skills: ["Python", "TensorFlow", "Statistics", "SQL"],
    day_in_life: "Writing model training scripts, debugging data pipelines, and presenting insights to business teams.",
    tier2_note: "Strong remote opportunities, especially for ML roles at startups and product companies.",
    color: "#22d3ee",
  },
  {
    rank: 3,
    title: "Content Creator / Digital Educator",
    category: "Media & Education",
    tagline: "Turn your knowledge into income and impact.",
    why_this_fits: "If you love teaching and communicating ideas, the creator economy is your opportunity. India's edtech market is ₹43,000 crore — and content creators in niche spaces are in massive demand.",
    reality_scores: {
      passion_fit: 88,
      salary_potential: 65,
      market_demand: 82,
      ai_risk: 30,
      stress_level: 40,
      difficulty: 45,
      remote_possibility: 100,
      future_growth: 85,
    },
    salary_range: { min: 300000, max: 5000000, currency: "INR" },
    top_skills: ["Video Editing", "SEO", "Writing", "Community Building"],
    day_in_life: "Recording tutorials, editing videos, engaging with your audience, building a course that teaches while you sleep.",
    tier2_note: "100% location-independent. Many successful creators are from Tier-2 cities.",
    color: "#f59e0b",
  },
  {
    rank: 4,
    title: "Climate Tech Entrepreneur",
    category: "Sustainability & Business",
    tagline: "India needs 10,000 climate startups. Be one of them.",
    why_this_fits: "Your concern for the environment + entrepreneurial spirit = climate tech. India's clean energy sector is receiving record investment and government support through schemes like PM KUSUM and National Solar Mission.",
    reality_scores: {
      passion_fit: 90,
      salary_potential: 70,
      market_demand: 85,
      ai_risk: 10,
      stress_level: 80,
      difficulty: 75,
      remote_possibility: 50,
      future_growth: 95,
    },
    salary_range: { min: 200000, max: 10000000, currency: "INR" },
    top_skills: ["Business Strategy", "Sustainability", "Fundraising", "Tech Basics"],
    day_in_life: "Meeting village solar entrepreneurs, pitching to impact investors, designing affordable clean energy solutions.",
    tier2_note: "Many climate opportunities are specifically in Tier-2/3 and rural areas — it's an advantage.",
    color: "#10b981",
  },
  {
    rank: 5,
    title: "Mental Health Counselor",
    category: "Healthcare & Social Impact",
    tagline: "India needs 1 million more mental health professionals.",
    why_this_fits: "Your empathy, patience, and people skills make you a natural counselor. India has 1 psychiatrist per 500,000 people — the need is enormous, and online therapy has made this a viable remote career.",
    reality_scores: {
      passion_fit: 85,
      salary_potential: 60,
      market_demand: 92,
      ai_risk: 5,
      stress_level: 70,
      difficulty: 65,
      remote_possibility: 80,
      future_growth: 88,
    },
    salary_range: { min: 400000, max: 1800000, currency: "INR" },
    top_skills: ["Psychology", "Active Listening", "CBT", "Research"],
    day_in_life: "Client sessions, writing case notes, ongoing supervision, continuous learning through workshops.",
    tier2_note: "Online platforms like iCall and Vandrevala Foundation hire counselors nationwide.",
    color: "#f43f5e",
  },
];

// ─── SCORE METRIC ──────────────────────────────────────────
const METRICS = [
  { key: "passion_fit", label: "Passion Fit", icon: Heart2, higherIsBetter: true },
  { key: "salary_potential", label: "Salary Potential", icon: TrendingUp, higherIsBetter: true },
  { key: "market_demand", label: "Market Demand", icon: Globe, higherIsBetter: true },
  { key: "ai_risk", label: "AI Risk", icon: Zap, higherIsBetter: false },
  { key: "stress_level", label: "Stress Level", icon: AlertTriangle, higherIsBetter: false },
  { key: "difficulty", label: "Entry Difficulty", icon: Brain, higherIsBetter: false },
  { key: "remote_possibility", label: "Remote Work", icon: Globe, higherIsBetter: true },
  { key: "future_growth", label: "Future Growth", icon: TrendingUp, higherIsBetter: true },
];

function Heart2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function ScoreBar({ value, higherIsBetter }: { value: number; higherIsBetter: boolean }) {
  const isGood = higherIsBetter ? value >= 70 : value <= 40;
  const isMid = higherIsBetter ? (value >= 50 && value < 70) : (value > 40 && value <= 65);
  const color = isGood ? "#10b981" : isMid ? "#f59e0b" : "#f43f5e";

  return (
    <div className="flex items-center gap-2">
      <div className="score-bar flex-1">
        <div
          className="score-bar-fill"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-xs font-medium w-8 text-right" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

// ─── CAREER CARD ───────────────────────────────────────────
function CareerCard({ career, isTop }: { career: typeof MOCK_CAREERS[0]; isTop: boolean }) {
  const [expanded, setExpanded] = useState(isTop);
  const salaryK = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString()}`;

  return (
    <div
      className={`glass gradient-border rounded-2xl overflow-hidden transition-all duration-300 ${
        isTop ? "ring-1 ring-violet-500/30" : ""
      }`}
    >
      {/* Card header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isTop && (
                <div className="flex items-center gap-1 glass-violet rounded-full px-2 py-0.5">
                  <Star className="w-3 h-3 fill-violet-400 text-violet-400" />
                  <span className="text-xs text-violet-300 font-medium">Best Match</span>
                </div>
              )}
              <span className="text-xs text-slate-500">#{career.rank}</span>
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-1">{career.title}</h3>
            <p className="text-xs text-slate-500">{career.category}</p>
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-display font-black"
            style={{ background: `${career.color}20`, color: career.color }}
          >
            #{career.rank}
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed italic mb-4">
          &ldquo;{career.tagline}&rdquo;
        </p>

        {/* Quick stats */}
        <div className="flex gap-4 mb-4">
          <div className="glass rounded-lg px-3 py-2 text-center flex-1">
            <div className="text-xs text-slate-500 mb-0.5">Salary Range</div>
            <div className="text-sm font-semibold text-white">
              {salaryK(career.salary_range.min)} – {salaryK(career.salary_range.max)}
            </div>
            <div className="text-xs text-slate-600">per year</div>
          </div>
          <div className="glass rounded-lg px-3 py-2 text-center flex-1">
            <div className="text-xs text-slate-500 mb-0.5">Remote Work</div>
            <div className="text-sm font-semibold" style={{ color: career.color }}>
              {career.reality_scores.remote_possibility}%
            </div>
            <div className="text-xs text-slate-600">compatible</div>
          </div>
          <div className="glass rounded-lg px-3 py-2 text-center flex-1">
            <div className="text-xs text-slate-500 mb-0.5">Future Growth</div>
            <div className="text-sm font-semibold text-emerald-400">
              {career.reality_scores.future_growth}%
            </div>
            <div className="text-xs text-slate-600">potential</div>
          </div>
        </div>

        {/* Top skills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {career.top_skills.map((skill) => (
            <span key={skill} className="text-xs glass px-2.5 py-1 rounded-full border border-white/5 text-slate-300">
              {skill}
            </span>
          ))}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors py-2"
        >
          {expanded ? (
            <>Less detail <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>Full reality check <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-white/5 p-6 space-y-6">
          {/* Why this fits */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              Why this fits you
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">{career.why_this_fits}</p>
          </div>

          {/* Reality Scores */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              Reality Score Breakdown
            </h4>
            <div className="space-y-2.5">
              {METRICS.map((metric) => (
                <div key={metric.key} className="grid grid-cols-5 gap-2 items-center">
                  <div className="flex items-center gap-1 col-span-2">
                    <metric.icon className="w-3 h-3 text-slate-500" />
                    <span className="text-xs text-slate-400">{metric.label}</span>
                  </div>
                  <div className="col-span-3">
                    <ScoreBar
                      value={career.reality_scores[metric.key as keyof typeof career.reality_scores]}
                      higherIsBetter={metric.higherIsBetter}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Day in life + Tier 2 */}
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

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/roadmap"
              className="flex-1 btn-primary text-center text-sm !py-2.5 shine"
              style={{ background: `linear-gradient(135deg, ${career.color}, ${career.color}cc)` }}
            >
              Get My Roadmap →
            </Link>
            <Link
              href="/chat"
              className="btn-secondary text-sm !py-2.5 !px-4"
            >
              Ask Disha
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN CAREER PAGE ──────────────────────────────────────
export default function CareerPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI analysis time
    setTimeout(() => setLoading(false), 1500);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center mx-auto mb-6 pulse-glow">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Analyzing Your IKIGAI</h2>
          <p className="text-slate-400 text-sm">Our AI is matching you with your ideal careers...</p>
          <div className="flex gap-2 justify-center mt-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-violet-500 animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
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
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 glass-violet rounded-full px-3 py-1.5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs text-violet-300">Your personalized matches</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-3">
            Your Career Matches
          </h1>
          <p className="text-slate-400">
            Based on your IKIGAI assessment and personality profile.{" "}
            <Link href="/chat" className="text-violet-400 hover:text-violet-300 transition-colors">
              Ask Disha to explain →
            </Link>
          </p>
        </div>

        {/* Career cards */}
        <div className="space-y-5">
          {MOCK_CAREERS.map((career, i) => (
            <CareerCard key={career.rank} career={career} isTop={i === 0} />
          ))}
        </div>

        {/* Next step CTA */}
        <div className="mt-10 glass gradient-border rounded-2xl p-8 text-center">
          <h3 className="font-display text-xl font-bold text-white mb-2">
            Ready to build your roadmap?
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Choose your top career match and Disha will generate a personalized learning path
            with milestones, certifications, and projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/roadmap" className="btn-primary flex items-center gap-2 shine glow-violet">
              Generate My Roadmap
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/chat" className="btn-secondary flex items-center gap-2">
              Discuss with Disha
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
