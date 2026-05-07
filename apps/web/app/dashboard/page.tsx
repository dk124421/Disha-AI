"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Brain, Target, Map, MessageCircle, MapPin, TrendingUp, Star, Zap, ChevronRight, Compass } from "lucide-react";

// ─── MOCK USER DATA ────────────────────────────────────────
const USER = {
  name: "Priya",
  location: "Nagpur, Maharashtra",
  education: "Undergraduate",
  ikigai_score: 78,
  top_career: "UX/Product Designer",
  roadmap_progress: 25,
  next_milestone: "Visual Design Principles",
  streak: 5,
};

// ─── STAT CARD ──────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon: Icon }: {
  label: string; value: string | number; sub: string; color: string; icon: React.ElementType;
}) {
  return (
    <div className="glass gradient-border rounded-2xl p-5 glass-hover">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="font-display text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-xs text-slate-500">{sub}</div>
    </div>
  );
}

// ─── QUICK ACTION ──────────────────────────────────────────
function QuickAction({ href, emoji, title, desc, color }: {
  href: string; emoji: string; title: string; desc: string; color: string;
}) {
  return (
    <Link href={href} className="glass gradient-border rounded-2xl p-5 glass-hover flex items-start gap-4 group">
      <span className="text-2xl">{emoji}</span>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-violet-300 transition-colors">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors flex-shrink-0 mt-0.5" />
    </Link>
  );
}

// ─── DASHBOARD ──────────────────────────────────────────────
export default function DashboardPage() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-[#050508]">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Top nav */}
        <nav className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg gradient-text-violet">Disha AI</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 glass rounded-full px-3 py-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-amber-300 font-semibold">{USER.streak}-day streak</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-purple-400 flex items-center justify-center text-sm font-bold text-white">
              {USER.name[0]}
            </div>
          </div>
        </nav>

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            {greeting}, {USER.name} 👋
          </h1>
          <p className="text-slate-400">
            {USER.location} · {USER.education}
          </p>
        </div>

        {/* AI Insight banner */}
        <div className="glass-violet gradient-border rounded-2xl p-5 mb-8 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-violet-200 mb-1">Disha&rsquo;s Insight for Today</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your IKIGAI analysis shows strong creative-analytical balance — rare and valuable in UX design.
              You&rsquo;re 25% through your roadmap. Complete the &quot;Visual Design Principles&quot; milestone this week to stay on track.
            </p>
          </div>
          <Link href="/chat" className="btn-primary !py-2 !px-4 text-xs shine flex-shrink-0">
            Ask Disha
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="IKIGAI Score" value={`${USER.ikigai_score}%`} sub="Purpose alignment" color="#a855f7" icon={Star} />
          <StatCard label="Top Career Match" value="UX Design" sub="92% passion fit" color="#22d3ee" icon={Target} />
          <StatCard label="Roadmap Progress" value={`${USER.roadmap_progress}%`} sub="Week 6 of 24" color="#f59e0b" icon={Map} />
          <StatCard label="Career Score" value="88/100" sub="Market readiness" color="#10b981" icon={TrendingUp} />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Quick actions */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-display font-bold text-white text-lg mb-4">Continue Your Journey</h2>

            <QuickAction
              href="/chat"
              emoji="💬"
              title="Chat with Disha"
              desc="Ask about career decisions, get honest advice, discuss your fears and goals."
              color="#a855f7"
            />
            <QuickAction
              href="/ikigai"
              emoji="🌀"
              title="Refine Your IKIGAI"
              desc="Update your assessment as you learn more about yourself. Your answers evolve."
              color="#22d3ee"
            />
            <QuickAction
              href="/roadmap"
              emoji="🗺️"
              title="Your Learning Roadmap"
              desc={`Next: "${USER.next_milestone}" — Week 6 of 24. You're making great progress.`}
              color="#f59e0b"
            />
            <QuickAction
              href="/opportunities"
              emoji="📍"
              title="Local Opportunities"
              desc="Internships, government schemes, and startup opportunities near Nagpur."
              color="#10b981"
            />
          </div>

          {/* Right: Career snapshot */}
          <div className="space-y-4">
            <h2 className="font-display font-bold text-white text-lg mb-4">Career Snapshot</h2>

            <div className="glass gradient-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-400 font-medium">Your Top Match</p>
                <Link href="/career" className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
                  See all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-1">UX/Product Designer</h3>
              <p className="text-xs text-slate-400 mb-4">Design & Technology</p>

              <div className="space-y-2.5">
                {[
                  { label: "Passion Fit", value: 92, color: "#10b981" },
                  { label: "Market Demand", value: 88, color: "#22d3ee" },
                  { label: "Remote Work", value: 95, color: "#a855f7" },
                  { label: "Future Growth", value: 90, color: "#f59e0b" },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{m.label}</span>
                      <span className="font-medium" style={{ color: m.color }}>{m.value}%</span>
                    </div>
                    <div className="score-bar">
                      <div
                        className="score-bar-fill"
                        style={{ width: `${m.value}%`, background: m.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/career" className="block w-full btn-primary text-center text-sm !py-2.5 mt-4 shine">
                Full Reality Report →
              </Link>
            </div>

            {/* Mentor suggestion */}
            <div className="glass rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-semibold text-white">Ask Disha</span>
              </div>
              <div className="space-y-2">
                {[
                  "What skills should I build first?",
                  "How do I build a UX portfolio?",
                  "Can I get a UX job without a degree?",
                ].map((q) => (
                  <Link
                    key={q}
                    href={`/chat`}
                    className="block text-xs text-slate-400 hover:text-violet-300 transition-colors py-1.5 px-3 glass rounded-lg hover:border hover:border-violet-500/20"
                  >
                    &ldquo;{q}&rdquo;
                  </Link>
                ))}
              </div>
            </div>

            {/* Location insight */}
            <div className="glass rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white">Nagpur Opportunities</span>
              </div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                3 UX internships and 2 remote design jobs available near you this week.
              </p>
              <Link href="/opportunities" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                View opportunities <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
