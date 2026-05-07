"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Compass, Eye, EyeOff, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (signInError) {
      if (signInError.message.includes("Invalid login")) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError(signInError.message);
      }
      setLoading(false);
      return;
    }

    router.push(from);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-slate-400 mb-1.5 font-medium">Email Address</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="priya@email.com"
          className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 border border-white/5 focus:border-violet-500/50 focus:outline-none transition-all"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-slate-400 font-medium">Password</label>
          <Link href="/forgot-password" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Forgot password?</Link>
        </div>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Your password"
            className="w-full glass rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-600 border border-white/5 focus:border-violet-500/50 focus:outline-none transition-all"
          />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 glass rounded-xl p-3 border border-rose-500/20">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0"/>
          <p className="text-rose-400 text-xs">{error}</p>
        </div>
      )}

      <button type="submit" disabled={loading} className="w-full btn-primary !py-3.5 shine glow-violet mt-2 flex items-center justify-center gap-2">
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Signing in...</>
        ) : "Sign In"}
      </button>
    </form>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center glow-violet">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl gradient-text-violet">Disha AI</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400 text-sm">Continue your career discovery journey</p>
        </div>

        <div className="glass gradient-border rounded-2xl p-8">
          <Suspense fallback={<div className="h-48 flex items-center justify-center"><div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"/></div>}>
            <SignInForm />
          </Suspense>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Sign up free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
