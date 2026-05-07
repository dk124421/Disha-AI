"use client";

import { useEffect, useState } from "react";
import { MapPin, Briefcase, Globe, Building, Sparkles, ExternalLink, Filter, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { loadFromStore, STORE_KEYS } from "@/lib/store";

type Opportunity = {
  id: string;
  title: string;
  organization: string;
  type: string;
  district: string;
  state: string;
  is_remote: boolean;
  stipend: string;
  description: string;
  tags: string[];
};

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

function OpportunityCard({ opp }: { opp: Opportunity }) {
  const style = TYPE_COLORS[opp.type] || { bg: "rgba(255,255,255,0.1)", text: "#fff", label: opp.type };
  const Icon = TYPE_ICONS[opp.type] || Briefcase;

  return (
    <div className="glass gradient-border rounded-2xl p-5 glass-hover">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: style.bg }}>
            <Icon className="w-5 h-5" style={{ color: style.text }} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm mb-0.5">{opp.title}</h3>
            <p className="text-xs text-slate-400">{opp.organization}</p>
          </div>
        </div>
        <span className="text-xs px-2 py-1 rounded-full flex-shrink-0" style={{ background: style.bg, color: style.text }}>
          {style.label}
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-3">{opp.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="w-3 h-3" />
            {opp.district ? `${opp.district}, ${opp.state || ""}` : "All India"}
          </div>
          {opp.is_remote && (
            <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
              🌐 Remote OK
            </span>
          )}
        </div>
        <span className="text-xs font-semibold text-white">{opp.stipend || "TBD"}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
        {opp.tags?.map((tag) => (
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
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("Nagpur");

  useEffect(() => {
    const fetchOpps = async () => {
      const supabase = createClient();
      const profile = loadFromStore<any>(STORE_KEYS.ONBOARDING);
      const userCity = profile?.location_city || "Nagpur";
      setLocation(userCity);

      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (data) {
        // Prioritize opportunities in user's city or remote
        const sorted = data.sort((a: any, b: any) => {
          if (a.district === userCity && b.district !== userCity) return -1;
          if (b.district === userCity && a.district !== userCity) return 1;
          if (a.is_remote && !b.is_remote) return -1;
          if (b.is_remote && !a.is_remote) return 1;
          return 0;
        });
        setOpportunities(sorted as Opportunity[]);
      }
      setLoading(false);
    };
    fetchOpps();
  }, []);

  const filtered = filter === "all"
    ? opportunities
    : opportunities.filter((o) => o.type === filter);

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
              {location}, Maharashtra · AI-curated for your profile
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
            <span className="text-violet-300 font-semibold">Disha found {opportunities.length} opportunities</span> matching your interests and {location} location.
            We recommend prioritizing remote opportunities or those close to your location.
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((opp, i) => (
              <OpportunityCard key={i} opp={opp} />
            ))
          ) : (
            <div className="text-center py-12 text-slate-400">
              No opportunities found matching this filter.
            </div>
          )}
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
