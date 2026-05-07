"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Compass,
  MapPin,
  BookOpen,
  Heart,
  Star,
  Briefcase,
} from "lucide-react";

// ─── STEPS CONFIG ──────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    title: "Tell us about yourself",
    subtitle: "Let's start with the basics so Disha can personalize everything for you.",
    icon: Compass,
    color: "#a855f7",
  },
  {
    id: 2,
    title: "Where are you in life?",
    subtitle: "Your education and location help us find opportunities that are truly accessible.",
    icon: BookOpen,
    color: "#22d3ee",
  },
  {
    id: 3,
    title: "What excites you?",
    subtitle: "Pick everything that gives you energy. Don't overthink — go with your gut.",
    icon: Heart,
    color: "#f59e0b",
  },
  {
    id: 4,
    title: "Your work style",
    subtitle: "Understanding how you work helps us match you with careers that fit your personality.",
    icon: Star,
    color: "#10b981",
  },
  {
    id: 5,
    title: "Your vision for life",
    subtitle: "The most important step. Tell Disha what truly matters to you.",
    icon: Briefcase,
    color: "#f43f5e",
  },
];

const INTEREST_TAGS = [
  "Technology", "Design", "Art & Creativity", "Science", "Business",
  "Teaching", "Healthcare", "Sports", "Music", "Writing",
  "Social Work", "Environment", "Finance", "Gaming", "Film & Media",
  "Cooking", "Fashion", "Agriculture", "Law", "Psychology",
  "Engineering", "Architecture", "Travel", "Photography", "Animation",
];

const WORK_STYLES = [
  { id: "creative", label: "Creative & Expressive", emoji: "🎨" },
  { id: "analytical", label: "Analytical & Problem-Solving", emoji: "🔍" },
  { id: "social", label: "People & Relationship-Oriented", emoji: "🤝" },
  { id: "independent", label: "Independent & Self-Directed", emoji: "🦅" },
  { id: "structured", label: "Structured & Process-Driven", emoji: "📋" },
  { id: "entrepreneurial", label: "Entrepreneurial & Risk-Taking", emoji: "🚀" },
];

// ─── STEP COMPONENTS ───────────────────────────────────────
function Step1({ data, setData }: { data: Record<string, string>; setData: (d: Record<string, string>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs text-slate-400 mb-1.5 font-medium">Full Name</label>
        <input
          value={data.name || ""}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          placeholder="Your full name"
          className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 border border-white/5 focus:border-violet-500/50 focus:outline-none transition-all"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-1.5 font-medium">Age</label>
        <input
          type="number"
          min={13}
          max={40}
          value={data.age || ""}
          onChange={(e) => setData({ ...data, age: e.target.value })}
          placeholder="Your age"
          className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 border border-white/5 focus:border-violet-500/50 focus:outline-none transition-all"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-1.5 font-medium">Gender (optional)</label>
        <div className="flex gap-3">
          {["Male", "Female", "Other", "Prefer not to say"].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setData({ ...data, gender: g })}
              className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                data.gender === g
                  ? "border-violet-500 bg-violet-500/10 text-violet-300"
                  : "border-white/5 text-slate-400 glass hover:border-white/10"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step2({ data, setData }: { data: Record<string, string>; setData: (d: Record<string, string>) => void }) {
  const educationLevels = [
    { id: "class_9_10", label: "Class 9–10", emoji: "📚" },
    { id: "class_11_12", label: "Class 11–12", emoji: "🎒" },
    { id: "undergraduate", label: "Undergraduate", emoji: "🏛️" },
    { id: "graduate", label: "Graduate / Postgrad", emoji: "🎓" },
    { id: "working", label: "Working Professional", emoji: "💼" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs text-slate-400 mb-3 font-medium">Education Level</label>
        <div className="grid grid-cols-1 gap-2">
          {educationLevels.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => setData({ ...data, education_level: level.id })}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl text-sm border transition-all ${
                data.education_level === level.id
                  ? "border-violet-500 bg-violet-500/10 text-white"
                  : "border-white/5 text-slate-400 glass hover:border-white/10"
              }`}
            >
              <span className="text-lg">{level.emoji}</span>
              {level.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">City / Town</label>
          <input
            value={data.location_city || ""}
            onChange={(e) => setData({ ...data, location_city: e.target.value })}
            placeholder="e.g. Nagpur"
            className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 border border-white/5 focus:border-violet-500/50 focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">State</label>
          <input
            value={data.location_state || ""}
            onChange={(e) => setData({ ...data, location_state: e.target.value })}
            placeholder="e.g. Maharashtra"
            className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 border border-white/5 focus:border-violet-500/50 focus:outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
}

function Step3({ data, setData }: { data: Record<string, string[]>; setData: (d: Record<string, string[]>) => void }) {
  const selected: string[] = data.interests || [];
  const toggle = (tag: string) => {
    const next = selected.includes(tag)
      ? selected.filter((t) => t !== tag)
      : [...selected, tag];
    setData({ ...data, interests: next });
  };

  return (
    <div>
      <p className="text-xs text-slate-500 mb-4">
        Select all that apply ({selected.length} selected)
      </p>
      <div className="flex flex-wrap gap-2">
        {INTEREST_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`py-2 px-3.5 rounded-full text-xs font-medium border transition-all ${
              selected.includes(tag)
                ? "border-violet-500 bg-violet-500/20 text-violet-200"
                : "border-white/5 text-slate-400 glass hover:border-white/10 hover:text-slate-300"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

function Step4({ data, setData }: { data: Record<string, string>; setData: (d: Record<string, string>) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 mb-2">How do you naturally work? Choose your dominant style.</p>
      {WORK_STYLES.map((style) => (
        <button
          key={style.id}
          type="button"
          onClick={() => setData({ ...data, work_style: style.id })}
          className={`w-full flex items-center gap-4 py-4 px-5 rounded-xl text-sm border transition-all ${
            data.work_style === style.id
              ? "border-violet-500 bg-violet-500/10 text-white"
              : "border-white/5 text-slate-400 glass hover:border-white/10"
          }`}
        >
          <span className="text-2xl">{style.emoji}</span>
          <span className="font-medium">{style.label}</span>
        </button>
      ))}
    </div>
  );
}

function Step5({ data, setData }: { data: Record<string, string>; setData: (d: Record<string, string>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs text-slate-400 mb-1.5 font-medium">
          What does your ideal life look like in 10 years?
        </label>
        <textarea
          value={data.life_goals || ""}
          onChange={(e) => setData({ ...data, life_goals: e.target.value })}
          placeholder="e.g. I want to be financially independent, work on meaningful projects, live in a city I love, and have time for family..."
          rows={4}
          className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 border border-white/5 focus:border-violet-500/50 focus:outline-none transition-all resize-none"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-1.5 font-medium">
          What&rsquo;s your biggest career fear or concern?
        </label>
        <textarea
          value={data.biggest_fears || ""}
          onChange={(e) => setData({ ...data, biggest_fears: e.target.value })}
          placeholder="e.g. I'm scared of choosing the wrong path and wasting years, or not being able to support my family..."
          rows={3}
          className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 border border-white/5 focus:border-violet-500/50 focus:outline-none transition-all resize-none"
        />
      </div>
      <div className="glass-violet rounded-xl p-4">
        <p className="text-xs text-violet-300 leading-relaxed">
          ✨ <strong>Disha&rsquo;s Promise:</strong> Your responses help the AI understand you deeply.
          Everything you share stays private and is only used to personalize your experience.
        </p>
      </div>
    </div>
  );
}

// ─── MAIN ONBOARDING ───────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);

  const step = STEPS[currentStep - 1];
  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = async () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((s) => s + 1);
    } else {
      // Final step — save and redirect
      setLoading(true);
      await new Promise((r) => setTimeout(r, 1500)); // simulate API call
      router.push("/ikigai");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const stepData = formData as Record<string, string | string[]>;

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg gradient-text-violet">Disha AI</span>
          </div>
          <div className="text-xs text-slate-500">
            Step {currentStep} of {STEPS.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full progress-gradient rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step card */}
        <div className="glass gradient-border rounded-2xl p-8">
          {/* Step icon + title */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${step.color}18` }}
            >
              <step.icon className="w-5 h-5" style={{ color: step.color }} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">
                {step.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{step.subtitle}</p>
            </div>
          </div>

          {/* Step content */}
          <div className="min-h-64">
            {currentStep === 1 && (
              <Step1
                data={stepData as Record<string, string>}
                setData={(d) => setFormData(d)}
              />
            )}
            {currentStep === 2 && (
              <Step2
                data={stepData as Record<string, string>}
                setData={(d) => setFormData(d)}
              />
            )}
            {currentStep === 3 && (
              <Step3
                data={stepData as Record<string, string[]>}
                setData={(d) => setFormData(d)}
              />
            )}
            {currentStep === 4 && (
              <Step4
                data={stepData as Record<string, string>}
                setData={(d) => setFormData(d)}
              />
            )}
            {currentStep === 5 && (
              <Step5
                data={stepData as Record<string, string>}
                setData={(d) => setFormData(d)}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
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
                "Analyzing your profile..."
              ) : currentStep === STEPS.length ? (
                <>
                  Take IKIGAI Quiz
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-6">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`rounded-full transition-all duration-300 ${
                s.id === currentStep
                  ? "w-6 h-2 bg-violet-500"
                  : s.id < currentStep
                  ? "w-2 h-2 bg-violet-700"
                  : "w-2 h-2 bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
