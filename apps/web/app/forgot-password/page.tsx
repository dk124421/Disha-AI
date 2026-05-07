"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

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
          <h1 className="font-display text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-slate-400 text-sm">We&apos;ll send you a reset link</p>
        </div>

        <div className="glass gradient-border rounded-2xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-emerald-400"/>
              </div>
              <h3 className="font-display font-bold text-white mb-2">Check Your Email</h3>
              <p className="text-slate-400 text-sm mb-6">We sent a reset link to <strong className="text-white">{email}</strong></p>
              <Link href="/sign-in" className="btn-secondary flex items-center justify-center gap-2 text-sm">
                <ArrowLeft className="w-4 h-4"/> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@email.com"
                  className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 border border-white/5 focus:border-violet-500/50 focus:outline-none transition-all"
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 glass rounded-xl p-3 border border-rose-500/20">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0"/>
                  <p className="text-rose-400 text-xs">{error}</p>
                </div>
              )}
              <button type="submit" disabled={loading} className="w-full btn-primary !py-3.5 shine">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <Link href="/sign-in" className="flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mt-2">
                <ArrowLeft className="w-3.5 h-3.5"/> Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
