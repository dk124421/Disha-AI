"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name },
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // If email confirmation is disabled, redirect immediately
    setSuccess(true);
    setTimeout(() => router.push("/onboarding"), 1500);
    setLoading(false);
  };

  const pwStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 8 ? 2 : /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 4 : 3;
  const pwColors = ["", "#f43f5e", "#f59e0b", "#22d3ee", "#10b981"];
  const pwLabels = ["", "Too short", "Weak", "Good", "Strong"];

  if (success) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-slate-400 text-sm">Taking you to your personalization wizard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center glow-violet">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl gradient-text-violet">Disha AI</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Start your journey</h1>
          <p className="text-slate-400 text-sm">Discover the career you&apos;re truly meant for</p>
        </div>

        <div className="glass gradient-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Priya Sharma"
                className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 border border-white/5 focus:border-violet-500/50 focus:outline-none transition-all"
              />
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a strong password (8+ chars)"
                  className="w-full glass rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-600 border border-white/5 focus:border-violet-500/50 focus:outline-none transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i <= pwStrength ? pwColors[pwStrength] : "rgba(255,255,255,0.06)" }}/>
                    ))}
                  </div>
                  <span className="text-xs font-medium" style={{ color: pwColors[pwStrength] }}>{pwLabels[pwStrength]}</span>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 glass rounded-xl p-3 border border-rose-500/20">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0"/>
                <p className="text-rose-400 text-xs">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full btn-primary !py-3.5 shine glow-violet mt-2 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Creating account...</>
              ) : (
                <><Sparkles className="w-4 h-4"/>Create Free Account</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Sign in</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          By signing up, you agree to our Terms and Privacy Policy.
          <br />Core features are free forever for students.
        </p>
      </div>
    </div>
  );
}
