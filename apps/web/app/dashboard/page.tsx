"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Brain, Target, Map, Briefcase, TrendingUp, MapPin, Star, CheckCircle, Zap, MessageCircle, BarChart2, LogOut, User, UploadCloud, Loader2 } from "lucide-react";
import Link from "next/link";
import { loadFromStore, STORE_KEYS, uploadAvatar } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";

type Profile = { name?: string; location_city?: string; education_level?: string };
type Career = { title?: string; color?: string; reality_scores?: { passion_fit?: number; salary_potential?: number; future_growth?: number } };
type CareerData = { careers?: Career[] };
type IkigaiAnalysis = { ikigai_score?: number; sweet_spot?: string };
type Roadmap = { title?: string; phases?: { milestones: unknown[] }[] };

const NAV_ITEMS = [
  { href: "/ikigai", icon: Brain, label: "IKIGAI Quiz", desc: "Discover your sweet spot", color: "#a855f7", badge: null },
  { href: "/career", icon: Target, label: "Career Matches", desc: "View your AI matches", color: "#22d3ee", badge: null },
  { href: "/twin", icon: Sparkles, label: "Career AI Twin", desc: "5-Year simulation", color: "#f43f5e", badge: "New" },
  { href: "/roadmap", icon: Map, label: "My Roadmap", desc: "Your learning path", color: "#f59e0b", badge: null },
  { href: "/opportunities", icon: Briefcase, label: "Opportunities", desc: "Jobs, gigs & schemes", color: "#10b981", badge: null },
  { href: "/chat", icon: MessageCircle, label: "Chat with Disha", desc: "Your AI mentor", color: "#3b82f6", badge: null },
];

const INSIGHTS = [
  "The gap between dreaming and doing is called action. Your roadmap is waiting.",
  "Careers built on passion + skill are the hardest to replace by AI.",
  "Tier-2 India is producing world-class talent. Location is no longer your limit.",
  "The best career isn't the most prestigious — it's the one you'll still love in 10 years.",
  "Start before you're ready. Ship before it's perfect. Learn as you go.",
];

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [careerData, setCareerData] = useState<CareerData | null>(null);
  const [ikigai, setIkigai] = useState<IkigaiAnalysis | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [milestones, setMilestones] = useState<Record<string, boolean>>({});
  const [insight, setInsight] = useState("");
  const [mounted, setMounted] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProfile(loadFromStore<Profile>(STORE_KEYS.ONBOARDING));
    setCareerData(loadFromStore<CareerData>(STORE_KEYS.CAREER_MATCHES));
    setIkigai(loadFromStore<IkigaiAnalysis>(STORE_KEYS.IKIGAI_ANALYSIS));
    setRoadmap(loadFromStore<Roadmap>(STORE_KEYS.ROADMAP));
    setMilestones(loadFromStore<Record<string, boolean>>("disha_milestones") || {});
    setInsight(INSIGHTS[Math.floor(Date.now() / 86400000) % INSIGHTS.length]);
  }, []);

  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url);
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    const url = await uploadAvatar(file, user.id);
    if (url) {
      setAvatarUrl(url);
    }
    setUploadingAvatar(false);
  };

  const topCareer = careerData?.careers?.[0];
  const totalMilestones = roadmap?.phases?.reduce((sum, p) => sum + p.milestones.length, 0) || 0;
  const doneMilestones = Object.values(milestones).filter(Boolean).length;
  const roadmapProgress = totalMilestones > 0 ? Math.round((doneMilestones / totalMilestones) * 100) : 0;

  if (!mounted) return null;

  const hasStarted = !!profile;
  const hasIkigai = !!ikigai?.ikigai_score;
  const hasCareers = !!topCareer;
  const hasRoadmap = !!roadmap?.title;

  const journeySteps = [
    { label: "Profile Setup", done: hasStarted, href: "/onboarding" },
    { label: "IKIGAI Assessment", done: hasIkigai, href: "/ikigai" },
    { label: "Career Matches", done: hasCareers, href: "/career" },
    { label: "Roadmap Active", done: hasRoadmap, href: "/roadmap" },
  ];
  const journeyPct = Math.round((journeySteps.filter((s) => s.done).length / journeySteps.length) * 100);

  return (
    <div className="min-h-screen bg-[#050508] px-4 py-12">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-5">
            {/* Avatar Upload */}
            <div className="relative group">
              <label className="cursor-pointer block relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center transition-all group-hover:border-violet-500/50">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                      <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-violet-600 border-2 border-[#050508] flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                  <UploadCloud className="w-3.5 h-3.5 text-white" />
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar || !user} />
              </label>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white"/>
                </div>
                <span className="font-display font-bold gradient-text-violet text-xs uppercase tracking-wider">Disha AI</span>
              </div>
              <h1 className="font-display text-3xl font-bold text-white">
                {user?.user_metadata?.full_name
                  ? `Welcome back, ${user.user_metadata.full_name.split(" ")[0]} 👋`
                  : profile?.name
                  ? `Welcome back, ${profile.name.split(" ")[0]} 👋`
                  : "Welcome to Disha AI 👋"}
              </h1>
              <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-1">
                {user?.email && <span className="text-slate-600">{user.email}</span>}
                {profile?.location_city && (<><MapPin className="w-3.5 h-3.5 ml-2"/>{profile.location_city}</>)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={signOut} className="btn-secondary flex items-center gap-1.5 !py-2 !px-3 text-xs text-slate-400 hover:text-rose-400 transition-colors">
              <LogOut className="w-3.5 h-3.5"/>Sign Out
            </button>
            <Link href="/chat" className="btn-primary flex items-center gap-2 !py-2.5 shine">
              <MessageCircle className="w-4 h-4"/> Ask Disha
            </Link>
          </div>
        </div>

        {/* AI Insight Banner */}
        <div className="glass-violet gradient-border rounded-2xl p-5 mb-8 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-violet-400"/>
          </div>
          <div>
            <div className="text-xs font-medium text-violet-400 mb-1">Disha&apos;s Insight for Today</div>
            <p className="text-sm text-white leading-relaxed">&ldquo;{insight}&rdquo;</p>
          </div>
        </div>

        {/* Journey Progress */}
        <div className="glass gradient-border rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-white">Your Journey</h2>
            <span className="text-sm font-semibold gradient-text">{journeyPct}% complete</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
            <div className="h-full progress-gradient rounded-full transition-all duration-700" style={{ width: `${journeyPct}%` }}/>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {journeySteps.map((s) => (
              <Link key={s.label} href={s.href} className={`flex items-center gap-2 glass rounded-xl p-3 border transition-all ${s.done ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/5 hover:border-violet-500/30"}`}>
                {s.done ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0"/> : <div className="w-4 h-4 rounded-full border-2 border-slate-600 flex-shrink-0"/>}
                <span className={`text-xs font-medium ${s.done ? "text-white" : "text-slate-500"}`}>{s.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "IKIGAI Score", value: ikigai?.ikigai_score ? `${ikigai.ikigai_score}%` : "—", icon: Brain, color: "#a855f7", sub: "Overall fit" },
            { label: "Career Matches", value: careerData?.careers?.length || "—", icon: Target, color: "#22d3ee", sub: "AI generated" },
            { label: "Roadmap Progress", value: `${roadmapProgress}%`, icon: BarChart2, color: "#f59e0b", sub: `${doneMilestones}/${totalMilestones} done` },
            { label: "Top Match Score", value: topCareer?.reality_scores?.passion_fit ? `${topCareer.reality_scores.passion_fit}%` : "—", icon: Star, color: "#10b981", sub: "Passion fit" },
          ].map((stat) => (
            <div key={stat.label} className="glass gradient-border rounded-2xl p-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${stat.color}18` }}>
                <stat.icon className="w-4.5 h-4.5" style={{ color: stat.color }}/>
              </div>
              <div className="font-display text-2xl font-black text-white mb-0.5">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
              <div className="text-xs" style={{ color: stat.color }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Career */}
          <div className="lg:col-span-2 glass gradient-border rounded-2xl p-6">
            <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400"/> Your Top Career Match
            </h3>
            {topCareer ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-sm" style={{ background: `${topCareer.color || "#a855f7"}20`, color: topCareer.color || "#a855f7" }}>
                    #1
                  </div>
                  <div>
                    <div className="font-display text-xl font-bold text-white">{topCareer.title}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400"/>
                      <span className="text-xs text-slate-400">{topCareer.reality_scores?.passion_fit}% passion fit</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Passion", value: topCareer.reality_scores?.passion_fit },
                    { label: "Salary", value: topCareer.reality_scores?.salary_potential },
                    { label: "Growth", value: topCareer.reality_scores?.future_growth },
                  ].map((m) => (
                    <div key={m.label} className="glass rounded-xl p-3 text-center">
                      <div className="font-display text-lg font-bold" style={{ color: topCareer.color || "#a855f7" }}>{m.value}%</div>
                      <div className="text-xs text-slate-500">{m.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Link href="/career" className="btn-primary flex items-center gap-1.5 text-sm !py-2.5 flex-1 justify-center shine">
                    View All Matches <ArrowRight className="w-3.5 h-3.5"/>
                  </Link>
                  <Link href="/roadmap" className="btn-secondary flex items-center gap-1.5 text-sm !py-2.5 flex-1 justify-center">
                    My Roadmap
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-slate-700 mx-auto mb-3"/>
                <p className="text-slate-500 text-sm mb-4">Take the IKIGAI quiz to get your personalized career matches</p>
                <Link href="/ikigai" className="btn-primary inline-flex items-center gap-2 text-sm !py-2.5 shine">
                  <Sparkles className="w-4 h-4"/> Start IKIGAI Quiz
                </Link>
              </div>
            )}
          </div>

          {/* Quick Navigation */}
          <div className="glass gradient-border rounded-2xl p-6">
            <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400"/> Quick Actions
            </h3>
            <div className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 glass rounded-xl p-3 border border-white/5 hover:border-white/10 glass-hover group transition-all">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}18` }}>
                    <item.icon className="w-4 h-4" style={{ color: item.color }}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-xs text-slate-500 truncate">{item.desc}</div>
                  </div>
                  {item.badge && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-1.5 py-0.5">{item.badge}</span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0"/>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Roadmap Progress */}
        {hasRoadmap && (
          <div className="glass gradient-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-white flex items-center gap-2"><TrendingUp className="w-4 h-4 text-amber-400"/> Roadmap Progress</h3>
              <Link href="/roadmap" className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">View full <ArrowRight className="w-3 h-3"/></Link>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="font-display text-3xl font-black gradient-text">{roadmapProgress}%</div>
              <div className="flex-1">
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full progress-gradient rounded-full transition-all duration-700" style={{ width: `${roadmapProgress}%` }}/>
                </div>
                <p className="text-xs text-slate-500 mt-1">{doneMilestones} of {totalMilestones} milestones completed</p>
              </div>
            </div>
            {roadmap.title && <p className="text-sm text-slate-300">{roadmap.title}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
