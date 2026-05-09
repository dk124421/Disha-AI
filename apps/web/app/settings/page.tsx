"use client";

import { useState, useEffect } from "react";
import {
  Settings, Shield, Wifi, WifiOff, Brain, Zap,
  CheckCircle, AlertTriangle, RefreshCw, ChevronDown,
} from "lucide-react";
import Link from "next/link";

type ProviderStatus = {
  provider: string;
  ollama_model: string;
  ollama_base_url: string;
  ollama_available: boolean;
  available_models: string[];
};

const OLLAMA_MODELS = ["llama3", "llama3.1", "mistral", "phi3", "gemma2", "codellama", "llama3:8b", "llama3:70b"];

export default function SettingsPage() {
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [ollamaEnabled, setOllamaEnabled] = useState(false);
  const [selectedModel, setSelectedModel] = useState("llama3");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<"success" | "fail" | null>(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    // Load saved preference from localStorage
    const saved = localStorage.getItem("disha_ai_provider");
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setOllamaEnabled(p.enabled);
        setSelectedModel(p.model || "llama3");
        setOllamaUrl(p.base_url || "http://localhost:11434");
      } catch { /* ignore */ }
    }
    fetchProviderStatus();
  }, []);

  const fetchProviderStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/config/provider");
      const data = await res.json();
      setStatus(data);
      setOllamaEnabled(data.provider === "ollama");
      if (data.ollama_model) setSelectedModel(data.ollama_model);
      if (data.ollama_base_url) setOllamaUrl(data.ollama_base_url);
    } catch {
      setStatus(null);
    }
    setLoading(false);
  };

  const pingOllama = async () => {
    setPinging(true);
    setPingResult(null);
    try {
      const res = await fetch("/api/config/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: true, model: selectedModel, base_url: ollamaUrl }),
      });
      if (res.ok) {
        setPingResult("success");
      } else {
        setPingResult("fail");
      }
    } catch {
      setPingResult("fail");
    }
    setPinging(false);
  };

  const applyProvider = async () => {
    setToggling(true);
    try {
      const res = await fetch("/api/config/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: ollamaEnabled,
          model: selectedModel,
          base_url: ollamaUrl,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // Persist to localStorage
        localStorage.setItem("disha_ai_provider", JSON.stringify({
          enabled: ollamaEnabled, model: selectedModel, base_url: ollamaUrl,
        }));
        await fetchProviderStatus();
        showToast(ollamaEnabled ? "🔒 Switched to Ollama Local AI" : "☁ Switched to Gemini Cloud");
      } else {
        showToast(`⚠ ${data.error || "Failed to switch provider"}`);
        setOllamaEnabled(!ollamaEnabled); // revert toggle
      }
    } catch {
      showToast("⚠ AI service not reachable");
      setOllamaEnabled(!ollamaEnabled);
    }
    setToggling(false);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const currentProvider = status?.provider || (ollamaEnabled ? "ollama" : "gemini");

  return (
    <div className="min-h-screen bg-[#050508] px-4 py-12">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 bg-grid opacity-20" />

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass gradient-border rounded-2xl px-6 py-3 text-sm text-white font-medium animate-slideUp shadow-2xl">
          {toast}
        </div>
      )}

      <div className="relative z-10 max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="glass-violet rounded-full px-2.5 py-1 text-xs text-violet-300 flex items-center gap-1.5">
                <Settings className="w-3 h-3" /> Configuration
              </div>
            </div>
            <h1 className="font-display text-4xl font-bold text-white mb-1">Settings</h1>
            <p className="text-slate-400 text-sm">Manage your AI provider and privacy preferences.</p>
          </div>
          <Link href="/dashboard" className="btn-secondary text-xs !py-2 !px-4">← Dashboard</Link>
        </div>

        {/* Provider Status Card */}
        <div className="glass gradient-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-400" /> Active AI Provider
            </h3>
            <button onClick={fetchProviderStatus} disabled={loading} className="text-slate-400 hover:text-white transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className={`flex items-center gap-3 p-4 rounded-xl border ${currentProvider === "ollama" ? "border-emerald-500/30 bg-emerald-500/5" : "border-violet-500/30 bg-violet-500/5"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentProvider === "ollama" ? "bg-emerald-500/20" : "bg-violet-500/20"}`}>
              {currentProvider === "ollama" ? <Shield className="w-5 h-5 text-emerald-400" /> : <Zap className="w-5 h-5 text-violet-400" />}
            </div>
            <div>
              <div className="font-semibold text-white text-sm">
                {currentProvider === "ollama" ? `🔒 Ollama Local — ${status?.ollama_model || selectedModel}` : "☁ Gemini Cloud (Google)"}
              </div>
              <div className="text-xs text-slate-400">
                {currentProvider === "ollama" ? `Connected at ${status?.ollama_base_url || ollamaUrl}` : "Using Gemini 2.0 Flash via API"}
              </div>
            </div>
            <div className={`ml-auto w-2 h-2 rounded-full ${status?.ollama_available || currentProvider === "gemini" ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-amber-400"}`} />
          </div>
        </div>

        {/* Provider Toggle */}
        <div className="glass gradient-border rounded-2xl p-6 mb-6">
          <h3 className="font-display font-bold text-white mb-5 flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" /> AI Provider
          </h3>

          {/* Toggle Row */}
          <div className="flex items-center justify-between p-4 glass rounded-xl border border-white/5 mb-5">
            <div>
              <div className="font-medium text-white text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> Ollama Local AI
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Route all AI calls to your local Ollama instance</div>
            </div>
            <button
              onClick={() => setOllamaEnabled(!ollamaEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${ollamaEnabled ? "bg-emerald-500" : "bg-white/10"}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${ollamaEnabled ? "translate-x-7" : "translate-x-1"}`} />
            </button>
          </div>

          {/* Ollama Config — shown when enabled */}
          {ollamaEnabled && (
            <div className="space-y-4 border-t border-white/5 pt-4">
              {/* URL */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Ollama Base URL</label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  className="w-full glass rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white bg-transparent focus:outline-none focus:border-violet-500/50 font-mono"
                  placeholder="http://localhost:11434"
                />
              </div>

              {/* Model Selector */}
              <div className="relative">
                <label className="text-xs text-slate-400 mb-1.5 block">Model</label>
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="w-full glass rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white flex items-center justify-between"
                >
                  <span className="font-mono">{selectedModel}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showModelDropdown ? "rotate-180" : ""}`} />
                </button>
                {showModelDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 glass rounded-xl border border-white/10 overflow-hidden z-20">
                    {/* Available from Ollama first */}
                    {status?.available_models?.length ? (
                      <>
                        <div className="px-3 py-2 text-xs text-slate-500 border-b border-white/5">Installed on your Ollama</div>
                        {status.available_models.map((m) => (
                          <button key={m} onClick={() => { setSelectedModel(m); setShowModelDropdown(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors font-mono ${selectedModel === m ? "text-violet-300" : "text-slate-300"}`}>
                            {selectedModel === m && "✓ "}{m}
                          </button>
                        ))}
                        <div className="px-3 py-2 text-xs text-slate-500 border-t border-white/5">Common Models</div>
                      </>
                    ) : null}
                    {OLLAMA_MODELS.map((m) => (
                      <button key={m} onClick={() => { setSelectedModel(m); setShowModelDropdown(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors font-mono ${selectedModel === m ? "text-violet-300" : "text-slate-300"}`}>
                        {selectedModel === m && "✓ "}{m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Ping Test */}
              <div className="flex items-center gap-3">
                <button
                  onClick={pingOllama}
                  disabled={pinging}
                  className="btn-secondary text-xs !py-2 !px-4 flex items-center gap-1.5"
                >
                  {pinging ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
                  Test Connection
                </button>
                {pingResult === "success" && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" /> Ollama is reachable
                  </div>
                )}
                {pingResult === "fail" && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-400">
                    <WifiOff className="w-3.5 h-3.5" /> Not reachable — is Ollama running?
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-5 pt-4 border-t border-white/5">
            <button
              onClick={applyProvider}
              disabled={toggling}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {toggling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Apply Settings
            </button>
            <div className="text-xs text-slate-500 flex items-center">
              Settings persist across sessions
            </div>
          </div>
        </div>

        {/* Privacy Info */}
        <div className="glass gradient-border rounded-2xl p-6">
          <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" /> Privacy & Data
          </h3>
          <div className="space-y-3">
            {[
              { icon: "🔒", label: "Ollama Local Mode", desc: "All AI calls stay on your device — nothing leaves your network." },
              { icon: "☁", label: "Gemini Cloud Mode", desc: "Conversation context is sent to Google Gemini API. No data is stored by Disha externally." },
              { icon: "💾", label: "Local Storage", desc: "Career data, roadmap progress, and IKIGAI profile are stored in your browser and Supabase account." },
            ].map((item) => (
              <div key={item.label} className="flex gap-3 p-3 glass rounded-xl border border-white/5">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <div className="text-xs text-slate-400">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
