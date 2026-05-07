"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Brain, Briefcase, TrendingUp, Heart, MapPin, Zap } from "lucide-react";
import Link from "next/link";
import { loadFromStore, STORE_KEYS } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";

type TwinData = {
  year: number;
  title: string;
  salary: string;
  lifestyle: string;
  milestone: string;
};

const FALLBACK_TWIN = [
  { year: 1, title: "Junior UI/UX Designer", salary: "₹5L - ₹8L", lifestyle: "Working from a hybrid setup, learning aggressively, building foundational skills.", milestone: "Shipped first major product feature used by real users." },
  { year: 2, title: "UI/UX Designer", salary: "₹8L - ₹12L", lifestyle: "Moved to a better apartment, taking more ownership of design processes.", milestone: "Led the redesign of the core mobile application." },
  { year: 3, title: "Senior Product Designer", salary: "₹15L - ₹22L", lifestyle: "Mostly remote, traveling occasionally, mentoring junior designers.", milestone: "Established the company's design system from scratch." },
  { year: 4, title: "Lead Product Designer", salary: "₹25L - ₹35L", lifestyle: "High autonomy, managing a small design team, speaking at local meetups.", milestone: "Managed end-to-end design strategy for a new vertical." },
  { year: 5, title: "Principal Designer / Head of Design", salary: "₹40L+", lifestyle: "Working completely remote, angel investing in small startups, great work-life balance.", milestone: "Grew the design team to 10+ members and won an industry award." }
];

export default function TwinPage() {
  const { user } = useAuth();
  const [twin, setTwin] = useState<TwinData[]>([]);
  const [careerTitle, setCareerTitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateTwin();
  }, []);

  const generateTwin = async () => {
    setGenerating(true);
    setLoading(true);
    const selectedCareer = loadFromStore<any>(STORE_KEYS.SELECTED_CAREER);
    const profile = loadFromStore<any>(STORE_KEYS.ONBOARDING);

    const title = selectedCareer?.title || "UX/Product Designer";
    setCareerTitle(title);

    try {
      const res = await fetch("/api/twin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ career: selectedCareer || {}, profile: profile || {} }),
      });
      const data = await res.json();
      if (data?.simulation) {
        setTwin(data.simulation);
      } else {
        setTwin(FALLBACK_TWIN);
      }
    } catch {
      setTwin(FALLBACK_TWIN);
    }
    setGenerating(false);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center mx-auto mb-6 pulse-glow">
            <Brain className="w-10 h-10 text-white animate-spin"/>
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            Simulating Your Future...
          </h2>
          <p className="text-slate-400 text-sm">Disha is looking 5 years into the future.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] px-4 py-12">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="glass-violet rounded-full px-2.5 py-1 text-xs text-violet-300 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3"/> AI Career Twin
              </div>
            </div>
            <h1 className="font-display text-4xl font-bold text-white mb-2">Your 5-Year Simulation</h1>
            <p className="text-slate-400 text-sm">A glimpse into your future as a {careerTitle}.</p>
          </div>
          <Link href="/dashboard" className="btn-secondary text-xs !py-2 !px-4">
            ← Dashboard
          </Link>
        </div>

        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-violet-500 before:via-cyan-500 before:to-emerald-500">
          {twin.map((yearData, i) => (
            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#050508] bg-slate-800 group-[.is-active]:bg-violet-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <span className="font-display font-bold">{yearData.year}</span>
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] glass gradient-border rounded-2xl p-5 hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-lg text-white">{yearData.title}</h3>
                  <div className="text-xs font-semibold text-emerald-400 glass px-2 py-1 rounded-full border border-emerald-500/20">
                    {yearData.salary}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0"/>
                    <p className="text-sm text-slate-300">{yearData.milestone}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-rose-400 mt-0.5 shrink-0"/>
                    <p className="text-sm text-slate-400">{yearData.lifestyle}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 glass gradient-border rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <h3 className="font-display text-xl font-bold text-white mb-2">Excited about this future?</h3>
          <p className="text-slate-400 text-sm mb-6">Start building it today. Disha can help you generate a detailed 24-week roadmap to get started.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/roadmap" className="btn-primary flex items-center gap-2 justify-center shine">
              Build My Roadmap <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
