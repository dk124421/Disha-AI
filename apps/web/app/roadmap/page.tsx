"use client";

import { useState } from "react";
import { CheckCircle, Circle, Clock, BookOpen, ExternalLink, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

// ─── MOCK ROADMAP DATA ─────────────────────────────────────
const ROADMAP = {
  title: "Your UX Designer Journey",
  description: "From beginner to job-ready in 24 weeks — with real projects at every step.",
  career: "UX/Product Designer",
  total_weeks: 24,
  phases: [
    {
      phase: 1,
      title: "Design Foundations",
      weeks: "1–6",
      color: "#a855f7",
      focus: "Learn design thinking, visual principles, and your first tool (Figma).",
      milestones: [
        {
          week: 2,
          title: "Design Thinking Mastered",
          done: true,
          deliverable: "Solve 1 real problem using the 5-step design thinking process",
          resources: [
            { title: "IDEO Design Thinking Course", url: "https://www.ideo.com", free: true },
            { title: "The Design of Everyday Things (Book)", url: "", free: false },
          ],
        },
        {
          week: 4,
          title: "Figma Proficiency",
          done: true,
          deliverable: "Redesign a popular app screen in Figma",
          resources: [
            { title: "Figma Tutorial (YouTube)", url: "https://figma.com", free: true },
          ],
        },
        {
          week: 6,
          title: "Visual Design Principles",
          done: false,
          deliverable: "Create a style guide for an imaginary app",
          resources: [
            { title: "Refactoring UI Book", url: "", free: false },
            { title: "Laws of UX (Website)", url: "https://lawsofux.com", free: true },
          ],
        },
      ],
    },
    {
      phase: 2,
      title: "UX Research & User Flows",
      weeks: "7–12",
      color: "#22d3ee",
      focus: "Learn to talk to users, conduct research, and map user journeys.",
      milestones: [
        {
          week: 8,
          title: "User Research Interviews",
          done: false,
          deliverable: "Conduct 5 user interviews and create an affinity map",
          resources: [
            { title: "Nielsen Norman Group UX Research", url: "https://nngroup.com", free: true },
          ],
        },
        {
          week: 10,
          title: "Information Architecture",
          done: false,
          deliverable: "Build a complete site map and user flow for an app",
          resources: [],
        },
        {
          week: 12,
          title: "Mid-Program Portfolio Project",
          done: false,
          deliverable: "Complete UX case study: Research → Wireframes → Prototype",
          resources: [],
        },
      ],
    },
    {
      phase: 3,
      title: "Portfolio & Job Readiness",
      weeks: "13–20",
      color: "#f59e0b",
      focus: "Build 3 strong case studies and prepare for interviews.",
      milestones: [
        {
          week: 15,
          title: "Case Study #1 Complete",
          done: false,
          deliverable: "Full UX case study published on Behance/Notion",
          resources: [],
        },
        {
          week: 18,
          title: "Case Study #2 + #3",
          done: false,
          deliverable: "Two more case studies — one showing mobile-first design",
          resources: [],
        },
        {
          week: 20,
          title: "Portfolio Website Live",
          done: false,
          deliverable: "Personal portfolio site at yourname.com or similar",
          resources: [
            { title: "Framer Portfolio Builder", url: "https://framer.com", free: true },
          ],
        },
      ],
    },
    {
      phase: 4,
      title: "Internship & Launch",
      weeks: "21–24",
      color: "#10b981",
      focus: "Apply to internships, freelance projects, and get your first experience.",
      milestones: [
        {
          week: 22,
          title: "First 10 Applications Sent",
          done: false,
          deliverable: "Applications to 10 companies + 5 freelance platforms",
          resources: [
            { title: "Internshala UX Design", url: "https://internshala.com", free: true },
            { title: "Toptal Freelance Design", url: "https://toptal.com", free: false },
          ],
        },
        {
          week: 24,
          title: "First Project / Internship",
          done: false,
          deliverable: "Secured first paid project or internship 🎉",
          resources: [],
        },
      ],
    },
  ],
  key_certifications: [
    "Google UX Design Certificate (Coursera)",
    "Figma Advanced Certification",
    "Nielsen Norman Group UX Certification",
  ],
};

// ─── MILESTONE CARD ─────────────────────────────────────────
function MilestoneCard({ milestone, phaseColor }: { milestone: typeof ROADMAP.phases[0]['milestones'][0]; phaseColor: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`glass rounded-xl overflow-hidden border transition-all ${
      milestone.done ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5"
    }`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        <div className="flex-shrink-0">
          {milestone.done ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <Circle className="w-5 h-5 text-slate-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Clock className="w-3 h-3 text-slate-600" />
            <span className="text-xs text-slate-500">Week {milestone.week}</span>
          </div>
          <p className="text-sm font-medium text-white">{milestone.title}</p>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-0 space-y-3">
          <div className="border-t border-white/5 pt-3">
            <p className="text-xs font-semibold text-slate-400 mb-1">🎯 Deliverable</p>
            <p className="text-xs text-slate-300 leading-relaxed">{milestone.deliverable}</p>
          </div>
          {milestone.resources.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">📚 Resources</p>
              <div className="space-y-1.5">
                {milestone.resources.map((r) => (
                  <a
                    key={r.title}
                    href={r.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    <BookOpen className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    <span className="flex-1">{r.title}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${r.free ? "text-emerald-400 bg-emerald-400/10" : "text-slate-500 bg-white/5"}`}>
                      {r.free ? "Free" : "Paid"}
                    </span>
                    {r.url && <ExternalLink className="w-3 h-3 text-slate-600" />}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MAIN ROADMAP PAGE ─────────────────────────────────────
export default function RoadmapPage() {
  const totalMilestones = ROADMAP.phases.flatMap((p) => p.milestones).length;
  const doneMilestones = ROADMAP.phases.flatMap((p) => p.milestones).filter((m) => m.done).length;
  const progress = Math.round((doneMilestones / totalMilestones) * 100);

  return (
    <div className="min-h-screen bg-[#050508] px-4 py-12">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 glass-violet rounded-full px-3 py-1.5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs text-violet-300">Personalized for you</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">{ROADMAP.title}</h1>
          <p className="text-slate-400 text-sm">{ROADMAP.description}</p>

          {/* Progress overview */}
          <div className="glass gradient-border rounded-2xl p-5 mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">Overall Progress</span>
              <span className="text-sm font-bold gradient-text-violet">{progress}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full progress-gradient rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-slate-500">{doneMilestones} milestones complete</span>
              <span className="text-xs text-slate-500">{ROADMAP.total_weeks} weeks total</span>
            </div>
          </div>
        </div>

        {/* Phases */}
        <div className="space-y-8">
          {ROADMAP.phases.map((phase) => (
            <div key={phase.phase}>
              {/* Phase header */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: `${phase.color}20`, color: phase.color }}
                >
                  {phase.phase}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display font-bold text-white">{phase.title}</h3>
                    <span className="text-xs glass rounded-full px-2 py-0.5 text-slate-400 border border-white/5">
                      Weeks {phase.weeks}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{phase.focus}</p>
                </div>
              </div>

              {/* Timeline line + milestones */}
              <div className="pl-5 border-l-2 border-white/5 space-y-2.5 ml-5">
                {phase.milestones.map((m) => (
                  <MilestoneCard key={m.title} milestone={m} phaseColor={phase.color} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="glass gradient-border rounded-2xl p-6 mt-8">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
            🏆 Recommended Certifications
          </h3>
          <div className="space-y-2">
            {ROADMAP.key_certifications.map((cert) => (
              <div key={cert} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0" />
                {cert}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex gap-3">
          <Link href="/chat" className="flex-1 btn-primary text-center shine glow-violet">
            Discuss with Disha →
          </Link>
          <Link href="/opportunities" className="btn-secondary text-center flex-1">
            Find Opportunities
          </Link>
        </div>
      </div>
    </div>
  );
}
