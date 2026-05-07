"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Brain,
  Target,
  Map,
  Zap,
  Globe,
  Star,
  ChevronRight,
  Play,
  Users,
  TrendingUp,
  Shield,
  Heart,
  Compass,
} from "lucide-react";

// ─── ANIMATED PARTICLES (deterministic to avoid hydration mismatch) ──────────
const PARTICLE_DATA = Array.from({ length: 25 }, (_, i) => {
  const seed = (i * 137.508 + 13) % 100;
  const seed2 = (i * 97.31 + 7) % 100;
  const seed3 = (i * 53.7 + 3) % 100;
  return {
    left: `${seed}%`,
    top: `${seed2}%`,
    duration: `${3 + (seed3 / 25)}s`,
    width: `${2 + (seed / 50)}px`,
    height: `${2 + (seed2 / 50)}px`,
    opacity: 0.3 + (seed3 / 250),
    color: i % 2 === 0 ? "#7c3aed" : "#22d3ee",
  };
});

function Particle({ delay, idx }: { delay: number; idx: number }) {
  const p = PARTICLE_DATA[idx];
  return (
    <div
      className="absolute rounded-full float"
      style={{
        left: p.left,
        top: p.top,
        animationDelay: `${delay}s`,
        animationDuration: p.duration,
        width: p.width,
        height: p.height,
        opacity: p.opacity,
        background: p.color,
        boxShadow: `0 0 6px ${p.color}`,
      }}
    />
  );
}

// ─── IKIGAI MINI VISUALIZATION ─────────────────────────────
function IkigaiMini() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Love circle */}
      <circle cx="80" cy="80" r="55" fill="rgba(168,85,247,0.15)" stroke="rgba(168,85,247,0.4)" strokeWidth="1" filter="url(#glow)" />
      {/* Good at circle */}
      <circle cx="120" cy="80" r="55" fill="rgba(34,211,238,0.12)" stroke="rgba(34,211,238,0.35)" strokeWidth="1" filter="url(#glow)" />
      {/* World needs circle */}
      <circle cx="80" cy="120" r="55" fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.35)" strokeWidth="1" filter="url(#glow)" />
      {/* Can earn circle */}
      <circle cx="120" cy="120" r="55" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.35)" strokeWidth="1" filter="url(#glow)" />
      {/* Center sweet spot */}
      <circle cx="100" cy="100" r="18" fill="rgba(124,58,237,0.6)" stroke="rgba(124,58,237,0.8)" strokeWidth="2" filter="url(#glow)" />
      <text x="100" y="96" textAnchor="middle" fontSize="7" fill="white" fontFamily="Outfit" fontWeight="700">IKIGAI</text>
      <text x="100" y="106" textAnchor="middle" fontSize="5" fill="rgba(255,255,255,0.7)" fontFamily="Inter">Sweet Spot</text>
      {/* Labels */}
      <text x="60" y="60" textAnchor="middle" fontSize="6" fill="rgba(168,85,247,0.9)" fontFamily="Outfit">Love</text>
      <text x="140" y="60" textAnchor="middle" fontSize="6" fill="rgba(34,211,238,0.9)" fontFamily="Outfit">Good At</text>
      <text x="60" y="150" textAnchor="middle" fontSize="6" fill="rgba(245,158,11,0.9)" fontFamily="Outfit">World</text>
      <text x="140" y="150" textAnchor="middle" fontSize="6" fill="rgba(16,185,129,0.9)" fontFamily="Outfit">Earn</text>
    </svg>
  );
}

// ─── NAV ───────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass border-b border-white/5 py-3" : "py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl gradient-text-violet">
            Disha AI
          </span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How It Works", "For Students", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="btn-primary text-sm !py-2 !px-5 shine"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── HERO ──────────────────────────────────────────────────
function HeroSection() {
  const [typed, setTyped] = useState("");
  const phrases = [
    "Product Designer",
    "AI Engineer",
    "Climate Scientist",
    "Indie Filmmaker",
    "Game Developer",
    "Social Entrepreneur",
  ];
  const [phraseIdx, setPhraseIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let i = 0;
    const phrase = phrases[phraseIdx];

    const typeNext = () => {
      if (i <= phrase.length) {
        setTyped(phrase.slice(0, i));
        i++;
        timerRef.current = setTimeout(typeNext, 80);
      } else {
        timerRef.current = setTimeout(() => {
          const eraseNext = () => {
            if (i >= 0) {
              setTyped(phrase.slice(0, i));
              i--;
              timerRef.current = setTimeout(eraseNext, 40);
            } else {
              setPhraseIdx((prev) => (prev + 1) % phrases.length);
            }
          };
          eraseNext();
        }, 2000);
      }
    };

    typeNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phraseIdx]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="absolute inset-0 bg-grid opacity-50" />

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 25 }).map((_, i) => (
          <Particle key={i} delay={i * 0.3} idx={i} />
        ))}
      </div>

      {/* Radial glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass border-neon rounded-full px-4 py-2 mb-8 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-xs font-medium text-violet-300">
            AI-Powered Career Identity Engine
          </span>
          <span className="text-xs text-slate-500">•</span>
          <span className="text-xs text-slate-400">Built for India</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl md:text-7xl font-black mb-6 animate-fadeInUp delay-100">
          <span className="text-white">Discover Work</span>
          <br />
          <span className="gradient-text text-glow-violet">You&rsquo;re Meant For.</span>
        </h1>

        {/* Typewriter */}
        <div className="text-2xl md:text-3xl font-display mb-4 animate-fadeInUp delay-200">
          <span className="text-slate-400">Your AI Career Twin: </span>
          <span className="gradient-text-cyan typing-cursor">{typed}</span>
        </div>

        {/* Subtitle */}
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fadeInUp delay-300">
          Disha AI combines IKIGAI philosophy, personality science, and real market intelligence
          to guide you to a career that&rsquo;s emotionally fulfilling, financially rewarding, and
          uniquely yours — whether you&rsquo;re in Mumbai or Meerut.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center animate-fadeInUp delay-400">
          <Link
            href="/sign-up"
            id="hero-get-started"
            className="btn-primary flex items-center gap-2 !py-4 !px-8 !text-base glow-violet shine group"
          >
            Start Your Journey Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="btn-secondary flex items-center gap-2 !py-4 !px-8 !text-base group">
            <Play className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
            Watch Demo
          </button>
        </div>

        {/* Social proof */}
        <div className="mt-12 flex items-center justify-center gap-6 animate-fadeIn delay-700">
          <div className="flex -space-x-2">
            {["V", "P", "A", "R", "M"].map((letter, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-violet-900 flex items-center justify-center text-xs font-bold text-white"
                style={{
                  background: `hsl(${260 + i * 15}, 70%, 45%)`,
                  zIndex: 5 - i,
                }}
              >
                {letter}
              </div>
            ))}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Trusted by <span className="text-white font-semibold">2,500+</span> students
            </p>
          </div>
        </div>
      </div>

      {/* IKIGAI preview card */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:block animate-fadeIn delay-700">
        <div className="glass gradient-border rounded-2xl p-4 w-48 float">
          <p className="text-xs text-slate-400 mb-2 font-medium text-center">Your IKIGAI</p>
          <div className="w-40 h-40">
            <IkigaiMini />
          </div>
          <div className="mt-2 glass rounded-lg p-2 text-center">
            <p className="text-xs text-violet-300 font-semibold">Purpose Score</p>
            <p className="text-xl font-display font-bold gradient-text">87%</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES ──────────────────────────────────────────────
const features = [
  {
    icon: Brain,
    color: "#a855f7",
    bg: "rgba(168,85,247,0.1)",
    title: "AI IKIGAI Engine",
    desc: "Deep psychological profiling combines what you love, what you're good at, what the world needs, and what you can earn from — to find your unique career sweet spot.",
  },
  {
    icon: Target,
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.1)",
    title: "Career Reality Scores",
    desc: "Every recommendation comes with 8 honest metrics: passion fit, salary potential, market demand, AI risk, stress level, and future growth.",
  },
  {
    icon: Compass,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    title: "AI Career Twin",
    desc: "See your simulated future self — a 'day in the life', career growth timeline, projected salary, and lifestyle visualization 5 years from now.",
  },
  {
    icon: Map,
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    title: "Personalized Roadmaps",
    desc: "Adaptive learning paths with milestones, certifications, projects, and timelines — generated specifically for your starting point and goals.",
  },
  {
    icon: Globe,
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.1)",
    title: "Hyper-Local Opportunities",
    desc: "District-level internships, government schemes, local MSMEs, skill centers, and gig opportunities — even in Tier-2/3 cities.",
  },
  {
    icon: Zap,
    color: "#6366f1",
    bg: "rgba(99,102,241,0.1)",
    title: "Streaming AI Mentor",
    desc: "Ask anything — 'Can I get into AI being weak in math?' or 'How do I work remotely from my village?' — and get honest, warm, strategic answers.",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 border border-white/5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-slate-400">Everything you need</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Not a job portal.{" "}
            <span className="gradient-text">A purpose engine.</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Six powerful AI systems working together to understand who you are and
            guide you toward work that truly fits.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="glass glass-hover gradient-border rounded-2xl p-6 group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{ background: f.bg }}
              >
                <f.icon className="w-6 h-6" style={{ color: f.color }} />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">
                {f.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ──────────────────────────────────────────
const steps = [
  {
    num: "01",
    title: "Tell Disha About You",
    desc: "Complete a thoughtful 5-step onboarding. Share your interests, education, location, work style, and life goals.",
    color: "#a855f7",
  },
  {
    num: "02",
    title: "Take the IKIGAI Assessment",
    desc: "Answer 20 reflective questions across 4 dimensions. Our AI analyzes your unique intersection of passion, skill, purpose, and opportunity.",
    color: "#22d3ee",
  },
  {
    num: "03",
    title: "Explore Your Career Matches",
    desc: "Get 5 deeply personalized career recommendations — each with Reality Scores, salary ranges, and honest reasoning.",
    color: "#f59e0b",
  },
  {
    num: "04",
    title: "Get Your Roadmap & Start",
    desc: "Receive a personalized learning path. Chat with Disha anytime for guidance, clarity, and strategic advice.",
    color: "#10b981",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-32 px-6">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            From <span className="gradient-text-violet">confused</span> to{" "}
            <span className="gradient-text-cyan">clear</span> — in 4 steps
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            The entire journey from uncertainty to a personalized career roadmap takes
            less than 30 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step) => (
            <div key={step.num} className="glass gradient-border rounded-2xl p-8 glass-hover group">
              <div
                className="text-5xl font-display font-black mb-4 opacity-20 group-hover:opacity-40 transition-opacity"
                style={{ color: step.color }}
              >
                {step.num}
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-slate-400 leading-relaxed">{step.desc}</p>
              <div
                className="mt-4 h-0.5 w-12 rounded-full group-hover:w-full transition-all duration-700"
                style={{ background: step.color }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ──────────────────────────────────────────
const testimonials = [
  {
    name: "Priya Sharma",
    role: "Class 12 Student, Patna",
    text: "I was torn between engineering and commerce. Disha AI helped me realize my passion for UX design — something I'd never even considered. Now I have a clear path.",
    avatar: "P",
    color: "hsl(280, 70%, 50%)",
  },
  {
    name: "Rahul Verma",
    role: "B.Com Student, Indore",
    text: "The hyper-local section showed me 3 government schemes I didn't know existed. I'm now interning at a local startup funded through MSME programs.",
    avatar: "R",
    color: "hsl(200, 70%, 45%)",
  },
  {
    name: "Anjali Mishra",
    role: "IT Professional, Nagpur",
    text: "I was stuck in a job I hated. The Career Twin feature showed me what my life could look like as a freelance data analyst. I made the switch 6 months ago — best decision.",
    avatar: "A",
    color: "hsl(340, 70%, 50%)",
  },
];

function TestimonialsSection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold mb-4">
            Students who found their <span className="gradient-text">direction</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="glass gradient-border rounded-2xl p-6 glass-hover">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── STATS ─────────────────────────────────────────────────
const stats = [
  { value: "2,500+", label: "Students Guided", icon: Users },
  { value: "94%", label: "Satisfaction Rate", icon: Heart },
  { value: "150+", label: "Career Paths Covered", icon: TrendingUp },
  { value: "600+", label: "Districts Supported", icon: Globe },
];

function StatsSection() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto glass gradient-border rounded-3xl p-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className="w-6 h-6 text-violet-400 mx-auto mb-3" />
              <div className="font-display text-3xl font-black gradient-text mb-1">
                {s.value}
              </div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA SECTION ───────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto text-center relative">
        {/* Glow */}
        <div className="absolute inset-0 bg-violet-600/5 rounded-3xl blur-3xl" />

        <div className="relative glass gradient-border rounded-3xl p-16">
          <div className="inline-flex items-center gap-2 glass-violet rounded-full px-4 py-2 mb-8">
            <Shield className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs text-violet-300">Free forever for students</span>
          </div>

          <h2 className="font-display text-4xl md:text-6xl font-black mb-6">
            Your career clarity
            <br />
            <span className="gradient-text">starts here.</span>
          </h2>

          <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto">
            Join 2,500+ students who discovered meaningful careers through Disha AI.
            No credit card required. Always free for core features.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              id="cta-start-journey"
              className="btn-primary flex items-center gap-2 !py-4 !px-10 !text-lg glow-violet shine group"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <p className="mt-6 text-xs text-slate-600">
            No spam. No sales calls. Just clarity.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
              <Compass className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold gradient-text-violet">Disha AI</span>
          </div>
          <p className="text-slate-600 text-xs">
            © 2026 Disha AI. Built with ❤️ for India&rsquo;s next generation.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main className="bg-[#050508] min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
