"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Sparkles, RotateCcw } from "lucide-react";

// ─── IKIGAI QUESTIONS ──────────────────────────────────────
const QUESTIONS = [
  // LOVE
  {
    id: "love_1",
    dim: "love",
    label: "What You Love",
    color: "#a855f7",
    question: "What activities make you completely lose track of time?",
    placeholder: "e.g. building websites, painting, solving math puzzles, talking to people, writing stories...",
  },
  {
    id: "love_2",
    dim: "love",
    label: "What You Love",
    color: "#a855f7",
    question: "If money wasn't a concern, what would you spend your days doing?",
    placeholder: "e.g. traveling and documenting stories, teaching kids, creating music...",
  },
  // GOOD AT
  {
    id: "skill_1",
    dim: "goodAt",
    label: "What You're Good At",
    color: "#22d3ee",
    question: "What do people regularly come to you for help with?",
    placeholder: "e.g. fixing tech issues, giving advice, designing things, explaining concepts...",
  },
  {
    id: "skill_2",
    dim: "goodAt",
    label: "What You're Good At",
    color: "#22d3ee",
    question: "What skills have you developed that feel almost natural to you now?",
    placeholder: "e.g. public speaking, coding, drawing, analyzing data, negotiating...",
  },
  // WORLD NEEDS
  {
    id: "world_1",
    dim: "worldNeeds",
    label: "What the World Needs",
    color: "#f59e0b",
    question: "What problems in the world genuinely anger or sadden you?",
    placeholder: "e.g. lack of quality education, climate change, healthcare access, youth unemployment...",
  },
  {
    id: "world_2",
    dim: "worldNeeds",
    label: "What the World Needs",
    color: "#f59e0b",
    question: "What kind of impact do you want to have on society?",
    placeholder: "e.g. helping underprivileged students, building tech for rural areas...",
  },
  // CAN EARN
  {
    id: "earn_1",
    dim: "canEarn",
    label: "What You Can Earn From",
    color: "#10b981",
    question: "What skills or services do you think people would pay for from you?",
    placeholder: "e.g. graphic design, tutoring, coding, content creation, counseling...",
  },
  {
    id: "earn_2",
    dim: "canEarn",
    label: "What You Can Earn From",
    color: "#10b981",
    question: "What type of work model appeals to you most?",
    placeholder: "e.g. stable corporate job, freelancing, building my own startup, remote work...",
  },
];

// ─── ANIMATED IKIGAI WHEEL ─────────────────────────────────
function IkigaiWheel({ answers }: { answers: Record<string, string> }) {
  const filled = Object.values(answers).filter(Boolean).length;
  const total = QUESTIONS.length;
  const pct = total > 0 ? filled / total : 0;

  return (
    <svg viewBox="0 0 220 220" className="w-full h-full" aria-label="IKIGAI wheel">
      <defs>
        <filter id="glow2">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer glow ring */}
      <circle cx="110" cy="110" r="100" fill="none" stroke="rgba(124,58,237,0.08)" strokeWidth="1" />

      {/* Love */}
      <circle cx="85" cy="85" r="60"
        fill={`rgba(168,85,247,${0.08 + pct * 0.12})`}
        stroke={`rgba(168,85,247,${0.3 + pct * 0.4})`}
        strokeWidth="1.5"
        filter="url(#glow2)"
        className="ikigai-circle" />

      {/* Good At */}
      <circle cx="135" cy="85" r="60"
        fill={`rgba(34,211,238,${0.06 + pct * 0.1})`}
        stroke={`rgba(34,211,238,${0.25 + pct * 0.35})`}
        strokeWidth="1.5"
        filter="url(#glow2)"
        className="ikigai-circle" />

      {/* World Needs */}
      <circle cx="85" cy="135" r="60"
        fill={`rgba(245,158,11,${0.06 + pct * 0.1})`}
        stroke={`rgba(245,158,11,${0.25 + pct * 0.35})`}
        strokeWidth="1.5"
        filter="url(#glow2)"
        className="ikigai-circle" />

      {/* Can Earn */}
      <circle cx="135" cy="135" r="60"
        fill={`rgba(16,185,129,${0.06 + pct * 0.1})`}
        stroke={`rgba(16,185,129,${0.25 + pct * 0.35})`}
        strokeWidth="1.5"
        filter="url(#glow2)"
        className="ikigai-circle" />

      {/* Center sweet spot */}
      <circle cx="110" cy="110" r={12 + pct * 14}
        fill={`rgba(124,58,237,${0.4 + pct * 0.4})`}
        stroke="rgba(124,58,237,0.8)"
        strokeWidth="2"
        filter="url(#glow2)" />

      {/* Center text */}
      <text x="110" y="107" textAnchor="middle" fontSize="8" fill="white" fontFamily="Outfit" fontWeight="700">IKIGAI</text>
      <text x="110" y="118" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.6)" fontFamily="Inter">
        {Math.round(pct * 100)}%
      </text>

      {/* Labels */}
      <text x="66" y="52" textAnchor="middle" fontSize="7" fill="rgba(168,85,247,0.9)" fontFamily="Outfit" fontWeight="600">Love</text>
      <text x="154" y="52" textAnchor="middle" fontSize="7" fill="rgba(34,211,238,0.9)" fontFamily="Outfit" fontWeight="600">Good At</text>
      <text x="66" y="178" textAnchor="middle" fontSize="7" fill="rgba(245,158,11,0.9)" fontFamily="Outfit" fontWeight="600">World</text>
      <text x="154" y="178" textAnchor="middle" fontSize="7" fill="rgba(16,185,129,0.9)" fontFamily="Outfit" fontWeight="600">Earn</text>
    </svg>
  );
}

// ─── MAIN IKIGAI PAGE ──────────────────────────────────────
export default function IkigaiPage() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const q = QUESTIONS[currentQ];
  const isLast = currentQ === QUESTIONS.length - 1;

  const handleNext = async () => {
    if (!isLast) {
      setCurrentQ((i) => i + 1);
    } else {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 2000));
      router.push("/career");
    }
  };

  const handleBack = () => {
    if (currentQ > 0) setCurrentQ((i) => i - 1);
  };

  return (
    <div className="min-h-screen bg-[#050508] px-4 py-12">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">IKIGAI Assessment</h1>
            <p className="text-slate-400 text-sm">Question {currentQ + 1} of {QUESTIONS.length}</p>
          </div>
          <div className="flex items-center gap-2 glass rounded-full px-3 py-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs text-slate-300">
              {Object.values(answers).filter(Boolean).length} answered
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1 bg-white/5 rounded-full mb-10 overflow-hidden">
          <div
            className="h-full progress-gradient rounded-full transition-all duration-700"
            style={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Question */}
          <div className="lg:col-span-3">
            {/* Dimension badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 text-xs font-medium"
              style={{
                background: `${q.color}18`,
                border: `1px solid ${q.color}40`,
                color: q.color,
              }}
            >
              {q.label}
            </div>

            {/* Question card */}
            <div className="glass gradient-border rounded-2xl p-8">
              <p className="font-display text-xl font-semibold text-white mb-6 leading-relaxed">
                {q.question}
              </p>
              <textarea
                key={q.id}
                value={answers[q.id] || ""}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                placeholder={q.placeholder}
                rows={5}
                className="w-full glass rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-600 border border-white/5 focus:border-violet-500/50 focus:outline-none transition-all resize-none"
              />
              <p className="text-xs text-slate-600 mt-2">
                Be honest and specific — the more detail you share, the better Disha can guide you.
              </p>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                <button
                  onClick={handleBack}
                  disabled={currentQ === 0}
                  className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="btn-primary flex items-center gap-1.5 !py-2.5 !px-6 shine group"
                >
                  {loading ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Analyzing your IKIGAI...
                    </>
                  ) : isLast ? (
                    <>
                      See My Careers
                      <Sparkles className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Question dots */}
            <div className="flex gap-1.5 mt-4 flex-wrap">
              {QUESTIONS.map((question, i) => (
                <button
                  key={question.id}
                  onClick={() => setCurrentQ(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentQ
                      ? "w-6 bg-violet-500"
                      : answers[question.id]
                      ? "bg-violet-700"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* IKIGAI Wheel */}
          <div className="lg:col-span-2">
            <div className="glass gradient-border rounded-2xl p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-white text-sm">Your IKIGAI</h3>
                <button
                  onClick={() => setAnswers({})}
                  className="text-slate-600 hover:text-slate-400 transition-colors"
                  title="Reset all answers"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="aspect-square">
                <IkigaiWheel answers={answers} />
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { dim: "love", label: "What You Love", color: "#a855f7" },
                  { dim: "goodAt", label: "Good At", color: "#22d3ee" },
                  { dim: "worldNeeds", label: "World Needs", color: "#f59e0b" },
                  { dim: "canEarn", label: "Can Earn", color: "#10b981" },
                ].map((d) => {
                  const count = QUESTIONS.filter(
                    (q) => q.dim === d.dim && answers[q.id]
                  ).length;
                  const total = QUESTIONS.filter((q) => q.dim === d.dim).length;
                  return (
                    <div key={d.dim} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-xs text-slate-400 flex-1">{d.label}</span>
                      <span className="text-xs font-medium" style={{ color: d.color }}>
                        {count}/{total}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
