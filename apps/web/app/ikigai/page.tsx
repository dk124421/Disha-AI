"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Sparkles, RotateCcw, CheckCircle } from "lucide-react";
import { saveToStore, STORE_KEYS } from "@/lib/store";

const QUESTIONS = [
  { id: "love_1", dim: "love", label: "What You Love", color: "#a855f7", question: "What activities make you completely lose track of time?", placeholder: "e.g. building websites, painting, solving puzzles..." },
  { id: "love_2", dim: "love", label: "What You Love", color: "#a855f7", question: "If money wasn't a concern, what would you spend your days doing?", placeholder: "e.g. traveling, teaching kids, creating music..." },
  { id: "skill_1", dim: "goodAt", label: "What You're Good At", color: "#22d3ee", question: "What do people regularly come to you for help with?", placeholder: "e.g. fixing tech issues, giving advice, designing..." },
  { id: "skill_2", dim: "goodAt", label: "What You're Good At", color: "#22d3ee", question: "What skills have you developed that feel almost natural?", placeholder: "e.g. public speaking, coding, drawing, analyzing data..." },
  { id: "world_1", dim: "worldNeeds", label: "What the World Needs", color: "#f59e0b", question: "What problems genuinely anger or sadden you?", placeholder: "e.g. lack of education, climate change, unemployment..." },
  { id: "world_2", dim: "worldNeeds", label: "What the World Needs", color: "#f59e0b", question: "What kind of impact do you want to have on society?", placeholder: "e.g. helping students, building tech for rural areas..." },
  { id: "earn_1", dim: "canEarn", label: "What You Can Earn From", color: "#10b981", question: "What skills or services would people pay for from you?", placeholder: "e.g. design, tutoring, coding, content creation..." },
  { id: "earn_2", dim: "canEarn", label: "What You Can Earn From", color: "#10b981", question: "What work model appeals to you most?", placeholder: "e.g. stable job, freelancing, startup, remote work..." },
];

const DIMS = [
  { dim: "love", label: "What You Love", color: "#a855f7" },
  { dim: "goodAt", label: "Good At", color: "#22d3ee" },
  { dim: "worldNeeds", label: "World Needs", color: "#f59e0b" },
  { dim: "canEarn", label: "Can Earn", color: "#10b981" },
];

function IkigaiWheel({ answers }: { answers: Record<string, string> }) {
  const filled = Object.values(answers).filter(Boolean).length;
  const pct = filled / QUESTIONS.length;
  return (
    <svg viewBox="0 0 220 220" className="w-full h-full">
      <defs><filter id="glow2"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <circle cx="85" cy="85" r="60" fill={`rgba(168,85,247,${0.08+pct*0.12})`} stroke={`rgba(168,85,247,${0.3+pct*0.4})`} strokeWidth="1.5" filter="url(#glow2)"/>
      <circle cx="135" cy="85" r="60" fill={`rgba(34,211,238,${0.06+pct*0.1})`} stroke={`rgba(34,211,238,${0.25+pct*0.35})`} strokeWidth="1.5" filter="url(#glow2)"/>
      <circle cx="85" cy="135" r="60" fill={`rgba(245,158,11,${0.06+pct*0.1})`} stroke={`rgba(245,158,11,${0.25+pct*0.35})`} strokeWidth="1.5" filter="url(#glow2)"/>
      <circle cx="135" cy="135" r="60" fill={`rgba(16,185,129,${0.06+pct*0.1})`} stroke={`rgba(16,185,129,${0.25+pct*0.35})`} strokeWidth="1.5" filter="url(#glow2)"/>
      <circle cx="110" cy="110" r={12+pct*14} fill={`rgba(124,58,237,${0.4+pct*0.4})`} stroke="rgba(124,58,237,0.8)" strokeWidth="2" filter="url(#glow2)"/>
      <text x="110" y="107" textAnchor="middle" fontSize="8" fill="white" fontFamily="Outfit" fontWeight="700">IKIGAI</text>
      <text x="110" y="118" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.6)" fontFamily="Inter">{Math.round(pct*100)}%</text>
      <text x="66" y="52" textAnchor="middle" fontSize="7" fill="rgba(168,85,247,0.9)" fontFamily="Outfit" fontWeight="600">Love</text>
      <text x="154" y="52" textAnchor="middle" fontSize="7" fill="rgba(34,211,238,0.9)" fontFamily="Outfit" fontWeight="600">Good At</text>
      <text x="66" y="178" textAnchor="middle" fontSize="7" fill="rgba(245,158,11,0.9)" fontFamily="Outfit" fontWeight="600">World</text>
      <text x="154" y="178" textAnchor="middle" fontSize="7" fill="rgba(16,185,129,0.9)" fontFamily="Outfit" fontWeight="600">Earn</text>
    </svg>
  );
}

type AnalyzingStep = "idle" | "analyzing" | "matching" | "done" | "error";

export default function IkigaiPage() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState<AnalyzingStep>("idle");
  const [statusMsg, setStatusMsg] = useState("");

  const q = QUESTIONS[currentQ];
  const isLast = currentQ === QUESTIONS.length - 1;

  const handleSubmit = async () => {
    setStep("analyzing");
    setStatusMsg("Analyzing your IKIGAI dimensions...");
    try {
      const analyzeRes = await fetch("/api/ikigai/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const { analysis } = await analyzeRes.json();
      saveToStore(STORE_KEYS.IKIGAI_ANSWERS, answers);
      saveToStore(STORE_KEYS.IKIGAI_ANALYSIS, analysis);

      setStep("matching");
      setStatusMsg("Finding your ideal careers...");
      const onboarding = JSON.parse(localStorage.getItem(STORE_KEYS.ONBOARDING) || "{}");
      const matchRes = await fetch("/api/career/match", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ikigai_answers: answers, profile: onboarding, ikigai_analysis: analysis }),
      });
      const careerData = await matchRes.json();
      saveToStore(STORE_KEYS.CAREER_MATCHES, careerData);

      setStep("done");
      setStatusMsg("Ready! Redirecting to your matches...");
      await new Promise((r) => setTimeout(r, 800));
      router.push("/career");
    } catch {
      setStep("error");
      setStatusMsg("Using smart defaults. Redirecting...");
      await new Promise((r) => setTimeout(r, 1000));
      router.push("/career");
    }
  };

  // Loading overlay
  if (step !== "idle") {
    const stepsCheck = [
      { label: "Mapping your passions", done: ["analyzing","matching","done","error"].includes(step) },
      { label: "Scoring your strengths", done: ["matching","done","error"].includes(step) },
      { label: "Matching career paths", done: ["done","error"].includes(step) },
    ];
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center mx-auto mb-6 pulse-glow">
            {step === "done" ? <CheckCircle className="w-10 h-10 text-white"/> : <Sparkles className="w-10 h-10 text-white animate-spin"/>}
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-3">
            {step === "analyzing" && "Analyzing Your IKIGAI..."}
            {step === "matching" && "Finding Your Careers..."}
            {step === "done" && "Analysis Complete!"}
            {step === "error" && "Almost There!"}
          </h2>
          <p className="text-slate-400 text-sm mb-8">{statusMsg}</p>
          <div className="glass gradient-border rounded-2xl p-5 text-left space-y-3">
            {stepsCheck.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${item.done ? "bg-emerald-500" : "bg-white/10"}`}>
                  {item.done && <CheckCircle className="w-3 h-3 text-white"/>}
                </div>
                <span className={`text-sm ${item.done ? "text-white" : "text-slate-500"}`}>{item.label}</span>
              </div>
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
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">IKIGAI Assessment</h1>
            <p className="text-slate-400 text-sm">Question {currentQ + 1} of {QUESTIONS.length}</p>
          </div>
          <div className="flex items-center gap-2 glass rounded-full px-3 py-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs text-slate-300">{Object.values(answers).filter(Boolean).length} answered</span>
          </div>
        </div>

        <div className="h-1 bg-white/5 rounded-full mb-10 overflow-hidden">
          <div className="h-full progress-gradient rounded-full transition-all duration-700" style={{ width: `${((currentQ+1)/QUESTIONS.length)*100}%` }}/>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 text-xs font-medium" style={{ background: `${q.color}18`, border: `1px solid ${q.color}40`, color: q.color }}>
              {q.label}
            </div>
            <div className="glass gradient-border rounded-2xl p-8">
              <p className="font-display text-xl font-semibold text-white mb-6 leading-relaxed">{q.question}</p>
              <textarea
                key={q.id}
                value={answers[q.id] || ""}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                placeholder={q.placeholder}
                rows={5}
                className="w-full glass rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-600 border border-white/5 focus:border-violet-500/50 focus:outline-none transition-all resize-none"
              />
              <p className="text-xs text-slate-600 mt-2">Be honest and specific — the more detail, the better Disha can guide you.</p>
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                <button onClick={() => currentQ > 0 && setCurrentQ((i) => i-1)} disabled={currentQ === 0} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={isLast ? handleSubmit : () => setCurrentQ((i) => i+1)} className="btn-primary flex items-center gap-1.5 !py-2.5 !px-6 shine group">
                  {isLast ? (<><Sparkles className="w-4 h-4 mr-1" /> Analyze My IKIGAI</>) : (<>Next <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"/></>)}
                </button>
              </div>
            </div>
            <div className="flex gap-1.5 mt-4 flex-wrap">
              {QUESTIONS.map((question, i) => (
                <button key={question.id} onClick={() => setCurrentQ(i)} className={`h-2 rounded-full transition-all ${i === currentQ ? "w-6 bg-violet-500" : answers[question.id] ? "w-2 bg-violet-700" : "w-2 bg-white/10"}`}/>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="glass gradient-border rounded-2xl p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-white text-sm">Your IKIGAI</h3>
                <button onClick={() => setAnswers({})} className="text-slate-600 hover:text-slate-400 transition-colors"><RotateCcw className="w-3.5 h-3.5"/></button>
              </div>
              <div className="aspect-square"><IkigaiWheel answers={answers}/></div>
              <div className="mt-4 space-y-2">
                {DIMS.map((d) => {
                  const count = QUESTIONS.filter((question) => question.dim === d.dim && answers[question.id]).length;
                  const total = QUESTIONS.filter((question) => question.dim === d.dim).length;
                  return (
                    <div key={d.dim} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color }}/>
                      <span className="text-xs text-slate-400 flex-1">{d.label}</span>
                      <span className="text-xs font-medium" style={{ color: d.color }}>{count}/{total}</span>
                    </div>
                  );
                })}
              </div>
              {Object.values(answers).filter(Boolean).length === QUESTIONS.length && (
                <button onClick={handleSubmit} className="w-full btn-primary text-sm !py-2.5 mt-4 shine">
                  <Sparkles className="w-4 h-4 inline mr-1.5"/>Analyze My IKIGAI
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
