"use client";

import { useState } from "react";
import { MapPin, Briefcase, Globe, Building, Sparkles, ExternalLink, Filter } from "lucide-react";
import Link from "next/link";

const OPPORTUNITIES = [
  {
    title: "UI/UX Design Intern",
    org: "TechNagpur Startup Hub",
    type: "internship",
    location: "Nagpur, MH",
    remote: true,
    stipend: "₹8,000/month",
    tags: ["Design", "Figma", "Fresher-friendly"],
    desc: "Work with early-stage startups in Nagpur's growing tech ecosystem. Build real products used by real people.",
  },
  {
    title: "PM KUSUM Solar Scheme",
    org: "Ministry of New & Renewable Energy",
    type: "scheme",
    location: "All India",
    remote: false,
    stipend: "Up to ₹6L subsidy",
    tags: ["Government", "Solar", "Rural"],
    desc: "Provides subsidy for installing solar pumps and plants. Ideal for youth in agricultural families looking to start businesses.",
  },
  {
    title: "Graphic Design Freelancer",
    org: "Fiverr / Upwork",
    type: "gig",
    location: "Remote",
    remote: true,
    stipend: "₹15,000–₹80,000/project",
    tags: ["Freelance", "Creative", "Remote"],
    desc: "Indian freelance designers earn significantly on global platforms. Start with small projects and build your profile.",
  },
  {
    title: "Digital Marketing Executive",
    org: "VidarbhaMart (Local MSME)",
    type: "job",
    location: "Nagpur, MH",
    remote: false,
    stipend: "₹15,000/month",
    tags: ["Marketing", "Social Media", "MSME"],
    desc: "Help local businesses grow online. This role often leads to significant responsibilities and growth opportunities.",
  },
  {
    title: "PMKVY Skill Training",
    org: "National Skill Development Corporation",
    type: "skill_center",
    location: "Nagpur",
    remote: false,
    stipend: "Free training + certificate",
    tags: ["Free", "Government", "Certification"],
    desc: "NSDC-certified courses in IT, design, and digital skills. Completely free for eligible students.",
  },
  {
    title: "Content Writer (Remote)",
    org: "Mumbai EdTech Company",
    type: "job",
    location: "Remote",
    remote: true,
    stipend: "₹20,000/month",
    tags: ["Writing", "EdTech", "Remote"],
    desc: "Write educational content for students across India. Work from anywhere with just a laptop.",
  },
];

const TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  internship: { bg: "rgba(168,85,247,0.12)", text: "#a855f7", label: "Internship" },
  scheme: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b", label: "Gov. Scheme" },
  gig: { bg: "rgba(34,211,238,0.12)", text: "#22d3ee", label: "Gig / Freelance" },
  job: { bg: "rgba(16,185,129,0.12)", text: "#10b981", label: "Job" },
  skill_center: { bg: "rgba(99,102,241,0.12)", text: "#6366f1", label: "Skill Training" },
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  internship: Briefcase,
  scheme: Building,
  gig: Globe,
  job: Briefcase,
  skill_center: Sparkles,
};

function OpportunityCard({ opp }: { opp: typeof OPPORTUNITIES[0] }) {
  const style = TYPE_COLORS[opp.type];
  const Icon = TYPE_ICONS[opp.type];

  return (
    <div className="glass gradient-border rounded-2xl p-5 glass-hover">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: style.bg }}>
            <Icon className="w-5 h-5" style={{ color: style.text }} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm mb-0.5">{opp.title}</h3>
            <p className="text-xs text-slate-400">{opp.org}</p>
          </div>
        </div>
        <span className="text-xs px-2 py-1 rounded-full flex-shrink-0" style={{ background: style.bg, color: style.text }}>
          {style.label}
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-3">{opp.desc}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="w-3 h-3" />
            {opp.location}
          </div>
          {opp.remote && (
            <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
              🌐 Remote OK
            </span>
          )}
        </div>
        <span className="text-xs font-semibold text-white">{opp.stipend}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
        {opp.tags.map((tag) => (
          <span key={tag} className="text-xs glass px-2 py-0.5 rounded-full border border-white/5 text-slate-400">
            {tag}
          </span>
        ))}
        <button className="ml-auto text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
          View Details <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default function OpportunitiesPage() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all"
    ? OPPORTUNITIES
    : OPPORTUNITIES.filter((o) => o.type === filter);

  return (
    <div className="min-h-screen bg-[#050508] px-4 py-12">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">
              Opportunities Near You
            </h1>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <MapPin className="w-4 h-4 text-cyan-400" />
              Nagpur, Maharashtra · AI-curated for your profile
            </div>
          </div>
          <Link href="/dashboard" className="btn-secondary text-sm !py-2 !px-4">
            ← Dashboard
          </Link>
        </div>

        {/* AI insight */}
        <div className="glass-violet gradient-border rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-300">
            <span className="text-violet-300 font-semibold">Disha found 6 opportunities</span> matching your UX design interests and Nagpur location.
            3 are remote-friendly. The PMKVY skill training is especially recommended as a free starting point.
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </div>
          {["all", "internship", "job", "gig", "scheme", "skill_center"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                filter === f
                  ? "border-violet-500 bg-violet-500/15 text-violet-300"
                  : "border-white/5 text-slate-400 glass hover:border-white/10"
              }`}
            >
              {f === "all" ? "All" : TYPE_COLORS[f]?.label || f}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {filtered.map((opp, i) => (
            <OpportunityCard key={i} opp={opp} />
          ))}
        </div>

        {/* Chat CTA */}
        <div className="mt-10 glass gradient-border rounded-2xl p-6 text-center">
          <h3 className="font-display font-bold text-white mb-2">Not finding what you need?</h3>
          <p className="text-slate-400 text-sm mb-4">
            Tell Disha your specific situation and she&rsquo;ll search for more targeted opportunities.
          </p>
          <Link href="/chat" className="btn-primary inline-flex items-center gap-2 shine">
            Ask Disha for More
          </Link>
        </div>
      </div>
    </div>
  );
}
