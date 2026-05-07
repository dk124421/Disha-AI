"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Circle, ChevronDown, ChevronUp, Download, Sparkles, BookOpen, Trophy, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";
import { loadFromStore, saveToStore, STORE_KEYS, saveRoadmapData } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";

type Resource = { title: string; url: string; free: boolean };
type Milestone = { week: number; title: string; done: boolean; deliverable: string; resources?: Resource[] };
type Phase = { phase: number; title: string; weeks: string; color: string; focus: string; milestones: Milestone[] };
type Roadmap = { title: string; description: string; career: string; total_weeks: number; phases: Phase[]; key_certifications?: string[]; first_step?: string };

const FALLBACK_ROADMAP: Roadmap = {
  title: "Your UX/Product Design Journey",
  description: "A structured 24-week path from beginner to job-ready designer",
  career: "UX/Product Designer",
  total_weeks: 24,
  phases: [
    {
      phase: 1, title: "Foundations", weeks: "1–6", color: "#a855f7",
      focus: "Learn design fundamentals and core tools",
      milestones: [
        { week: 2, title: "Design Basics", done: false, deliverable: "Complete Figma basics course", resources: [{ title: "Figma for Beginners", url: "https://www.youtube.com/", free: true }] },
        { week: 4, title: "First Wireframe", done: false, deliverable: "Wireframe 3 app screens", resources: [{ title: "Google UX Certificate", url: "https://grow.google/", free: false }] },
        { week: 6, title: "UX Research", done: false, deliverable: "Conduct 3 user interviews", resources: [{ title: "NN Group Articles", url: "https://www.nngroup.com/", free: true }] },
      ],
    },
    {
      phase: 2, title: "Build Skills", weeks: "7–12", color: "#22d3ee",
      focus: "Build a real project from scratch",
      milestones: [
        { week: 8, title: "Case Study #1", done: false, deliverable: "Complete a full UX case study", resources: [{ title: "UX Case Study Template", url: "https://dribbble.com/", free: true }] },
        { week: 10, title: "Usability Testing", done: false, deliverable: "Test your design with 5 users", resources: [{ title: "Maze Testing Tool", url: "https://maze.co/", free: true }] },
        { week: 12, title: "Design System", done: false, deliverable: "Create a reusable component library", resources: [{ title: "Figma Community", url: "https://figma.com/community", free: true }] },
      ],
    },
    {
      phase: 3, title: "Portfolio", weeks: "13–18", color: "#f59e0b",
      focus: "Build 3 showcase projects",
      milestones: [
        { week: 14, title: "App Redesign", done: false, deliverable: "Redesign a popular app with improvements", resources: [{ title: "Mobbin for Inspiration", url: "https://mobbin.com/", free: true }] },
        { week: 16, title: "Portfolio Website", done: false, deliverable: "Launch your portfolio on Behance/Webflow", resources: [{ title: "Webflow University", url: "https://university.webflow.com/", free: true }] },
        { week: 18, title: "Case Study #2", done: false, deliverable: "End-to-end project from research to handoff", resources: [] },
      ],
    },
    {
      phase: 4, title: "Job Ready", weeks: "19–24", color: "#10b981",
      focus: "Applications, networking, and landing your first role",
      milestones: [
        { week: 20, title: "Resume + LinkedIn", done: false, deliverable: "Optimized designer resume and profile", resources: [{ title: "Designer Resume Template", url: "https://read.cv/", free: true }] },
        { week: 22, title: "Apply to 30 Jobs", done: false, deliverable: "Active applications on LinkedIn, Internshala, AngelList", resources: [{ title: "Internshala Jobs", url: "https://internshala.com/", free: true }] },
        { week: 24, title: "First Interview", done: false, deliverable: "Ace your portfolio presentation", resources: [{ title: "UX Interview Questions", url: "https://www.nngroup.com/", free: true }] },
      ],
    },
  ],
  key_certifications: ["Google UX Design Certificate", "Figma Advanced Certification", "Interaction Design Foundation"],
  first_step: "Open Figma today and watch their official beginners tutorial — takes just 2 hours.",
};

export default function RoadmapPage() {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [milestoneStates, setMilestoneStates] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 0: true });
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedRoadmap = loadFromStore<Roadmap>(STORE_KEYS.ROADMAP);
    const savedMilestones = loadFromStore<Record<string, boolean>>("disha_milestones") || {};
    setMilestoneStates(savedMilestones);

    if (savedRoadmap) {
      setRoadmap(savedRoadmap);
      setLoading(false);
    } else {
      generateRoadmap();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateRoadmap = async () => {
    setGenerating(true);
    setLoading(true);
    const selectedCareer = loadFromStore<Record<string, unknown>>(STORE_KEYS.SELECTED_CAREER);
    const profile = loadFromStore<Record<string, unknown>>(STORE_KEYS.ONBOARDING);

    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ career: selectedCareer || { title: "UX Designer", top_skills: ["Figma", "Research"] }, profile: profile || {} }),
      });
      const data = await res.json();
      const generated = data.roadmap as Roadmap;
      if (generated?.phases) {
        setRoadmap(generated);
        saveRoadmapData(generated, milestoneStates, user?.id);
      } else {
        setRoadmap(FALLBACK_ROADMAP);
      }
    } catch {
      setRoadmap(FALLBACK_ROADMAP);
    }
    setGenerating(false);
    setLoading(false);
  };

  const toggleMilestone = (phaseIdx: number, milestoneIdx: number) => {
    const key = `${phaseIdx}-${milestoneIdx}`;
    const updated = { ...milestoneStates, [key]: !milestoneStates[key] };
    setMilestoneStates(updated);
    saveRoadmapData(roadmap, updated, user?.id);
  };

  const getTotalProgress = () => {
    if (!roadmap) return 0;
    const total = roadmap.phases.reduce((sum, p) => sum + p.milestones.length, 0);
    const done = Object.values(milestoneStates).filter(Boolean).length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] px-4 py-12">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <div className="flex items-start justify-between mb-8">
            <div className="space-y-4 w-1/2">
              <div className="w-24 h-6 bg-white/5 rounded-full animate-pulse" />
              <div className="w-full h-10 bg-white/5 rounded-lg animate-pulse" />
              <div className="w-3/4 h-4 bg-white/5 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="glass rounded-2xl p-5 h-32 animate-pulse bg-white/5" />
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl p-5 h-20 animate-pulse bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap) return null;
  const progress = getTotalProgress();

  return (
    <div className="min-h-screen bg-[#050508] px-4 py-12">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="glass-violet rounded-full px-2.5 py-1 text-xs text-violet-300 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3"/> AI-Generated
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">{roadmap.title}</h1>
            <p className="text-slate-400 text-sm">{roadmap.description}</p>
          </div>
          <button onClick={generateRoadmap} className="btn-secondary text-xs !py-2 !px-3 flex-shrink-0 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5"/> Regenerate
          </button>
        </div>

        {/* Progress Overview */}
        <div className="glass gradient-border rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-display text-3xl font-black gradient-text">{progress}%</div>
              <div className="text-xs text-slate-500">Overall Progress</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-white">{roadmap.total_weeks} weeks</div>
              <div className="text-xs text-slate-500">total journey</div>
            </div>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full progress-gradient rounded-full transition-all duration-700" style={{ width: `${progress}%` }}/>
          </div>
          {roadmap.first_step && (
            <div className="mt-4 glass-violet rounded-xl p-3">
              <p className="text-xs text-violet-300"><span className="font-semibold">Today&apos;s first step:</span> {roadmap.first_step}</p>
            </div>
          )}
        </div>

        {/* Phases */}
        <div className="space-y-4 mb-8">
          {roadmap.phases.map((phase, pi) => {
            const phaseCompleted = phase.milestones.filter((_, mi) => milestoneStates[`${pi}-${mi}`]).length;
            const phaseTotal = phase.milestones.length;
            const isExpanded = expanded[pi];

            return (
              <div key={pi} className="glass gradient-border rounded-2xl overflow-hidden">
                <button className="w-full p-5 flex items-center gap-4 text-left" onClick={() => setExpanded({ ...expanded, [pi]: !isExpanded })}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-black text-sm" style={{ background: `${phase.color}20`, color: phase.color }}>{phase.phase}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-display font-bold text-white">{phase.title}</h3>
                      <span className="text-xs text-slate-500">Week {phase.weeks}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{phase.focus}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs font-medium" style={{ color: phase.color }}>{phaseCompleted}/{phaseTotal}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500"/> : <ChevronDown className="w-4 h-4 text-slate-500"/>}
                  </div>
                </button>

                {/* Phase progress bar */}
                <div className="px-5 pb-2">
                  <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${phaseTotal > 0 ? (phaseCompleted/phaseTotal)*100 : 0}%`, background: phase.color }}/>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-4">
                    {phase.milestones.map((ms, mi) => {
                      const key = `${pi}-${mi}`;
                      const done = milestoneStates[key] || false;
                      return (
                        <div key={mi} className={`glass rounded-xl p-4 border transition-all ${done ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/5"}`}>
                          <div className="flex items-start gap-3">
                            <button onClick={() => toggleMilestone(pi, mi)} className="mt-0.5 flex-shrink-0 transition-colors">
                              {done ? <CheckCircle className="w-5 h-5 text-emerald-400"/> : <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400"/>}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-slate-500">Week {ms.week}</span>
                              </div>
                              <h4 className={`font-semibold text-sm mb-1 ${done ? "text-emerald-300 line-through" : "text-white"}`}>{ms.title}</h4>
                              <p className="text-xs text-slate-400 mb-2">{ms.deliverable}</p>
                              {ms.resources && ms.resources.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {ms.resources.map((r, ri) => (
                                    <a key={ri} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs glass px-2.5 py-1 rounded-full border border-white/5 text-slate-300 hover:text-violet-300 hover:border-violet-500/30 transition-all">
                                      {r.free && <span className="text-emerald-400 text-xs">Free</span>}
                                      <BookOpen className="w-3 h-3"/>
                                      {r.title}
                                      <ExternalLink className="w-2.5 h-2.5"/>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Certifications */}
        {roadmap.key_certifications && roadmap.key_certifications.length > 0 && (
          <div className="glass gradient-border rounded-2xl p-6 mb-6">
            <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-400"/>Key Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {roadmap.key_certifications.map((cert) => (
                <div key={cert} className="flex items-center gap-1.5 glass px-3 py-2 rounded-xl border border-amber-500/20 text-sm text-amber-200">
                  <Trophy className="w-3.5 h-3.5 text-amber-400"/>{cert}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="glass gradient-border rounded-2xl p-8 text-center">
          <h3 className="font-display text-xl font-bold text-white mb-2">Need help staying on track?</h3>
          <p className="text-slate-400 text-sm mb-6">Chat with Disha whenever you feel stuck, unmotivated, or need guidance.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/chat" className="btn-primary flex items-center gap-2 justify-center shine">
              Chat with Disha <ArrowRight className="w-4 h-4"/>
            </Link>
            <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 justify-center">
              <Download className="w-4 h-4"/> Save Roadmap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
