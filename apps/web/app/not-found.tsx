import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="relative z-10 text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center mx-auto mb-6 pulse-glow">
          <Compass className="w-10 h-10 text-white" />
        </div>
        <div className="font-display text-7xl font-black gradient-text mb-4">404</div>
        <h1 className="font-display text-2xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-slate-400 text-sm mb-8">
          Even Disha can&apos;t find this path. Let&apos;s get you back on track.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">Go Home</Link>
          <Link href="/chat" className="btn-secondary">Talk to Disha</Link>
        </div>
      </div>
    </div>
  );
}
