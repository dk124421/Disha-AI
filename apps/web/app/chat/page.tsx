"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Compass, RotateCcw, Bot, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getOrCreateConversation, loadChatMessages, saveChatMessage } from "@/lib/store";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── SUGGESTION CHIPS ──────────────────────────────────────
const SUGGESTIONS = [
  "Can I get into AI if I'm weak in math?",
  "Should I choose BCA or BTech?",
  "How do I work remotely from a small city?",
  "What careers are safe from AI automation?",
  "How do I become financially independent by 30?",
  "Best careers for an introvert who loves design?",
];

// ─── STREAMING MESSAGE ─────────────────────────────────────
function StreamingMessage({ content, done }: { content: string; done: boolean }) {
  return (
    <span>
      {content}
      {!done && <span className="typing-cursor" />}
    </span>
  );
}

// ─── SIDEBAR ───────────────────────────────────────────────
function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 glass border-r border-white/5 p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6 px-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
          <Compass className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-bold gradient-text-violet">Disha AI</span>
      </div>

      {/* Nav */}
      <nav className="space-y-1 mb-6">
        {[
          { href: "/dashboard", label: "Dashboard", emoji: "🏠" },
          { href: "/chat", label: "AI Mentor", emoji: "💬", active: true },
          { href: "/ikigai", label: "IKIGAI Quiz", emoji: "🌀" },
          { href: "/career", label: "Career Matches", emoji: "🎯" },
          { href: "/roadmap", label: "My Roadmap", emoji: "🗺️" },
          { href: "/opportunities", label: "Local Opportunities", emoji: "📍" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              item.active
                ? "bg-violet-500/15 text-white border border-violet-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>{item.emoji}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* AI tips */}
      <div className="mt-auto glass-violet rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-xs font-semibold text-violet-300">Disha&rsquo;s Tip</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Be specific in your questions. The more context you share, the more personalized my guidance becomes.
        </p>
      </div>
    </aside>
  );
}

// ─── MAIN CHAT PAGE ────────────────────────────────────────
export default function ChatPage() {
  const { user } = useAuth();
  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Namaste! 🙏 I'm Disha, your AI career mentor.\n\nI'm here to help you think through your career path — whether you're confused about stream selection, wondering about remote work, figuring out how to switch careers, or just need someone to talk to about your future.\n\nWhat's on your mind today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function initChat() {
      if (!user) return;
      const cid = await getOrCreateConversation(user.id);
      if (cid) {
        setConvId(cid);
        const history = await loadChatMessages(cid);
        if (history && history.length > 0) {
          setMessages([
            messages[0], // Keep welcome message
            ...history.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: new Date(m.created_at),
            }))
          ]);
        }
      }
    }
    initChat();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamContent]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);
    setStreamContent("");

    if (convId) {
      saveChatMessage(convId, "user", text);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullContent += data.content;
                setStreamContent(fullContent);
              }
              if (data.done) {
                const aiMsg: Message = {
                  id: (Date.now() + 1).toString(),
                  role: "assistant",
                  content: fullContent,
                  timestamp: new Date(),
                };
                setMessages((prev) => [...prev, aiMsg]);
                setStreamContent("");
                setStreaming(false);

                if (convId) {
                  saveChatMessage(convId, "assistant", fullContent);
                }
              }
            } catch {
              // continue
            }
          }
        }
      }
    } catch {
      // Fallback response
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please make sure the AI service is running. In the meantime, feel free to explore your IKIGAI quiz or career matches!",
          timestamp: new Date(),
        },
      ]);
      setStreamContent("");
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="h-screen bg-[#050508] flex overflow-hidden">
      <Sidebar />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="glass border-b border-white/5 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
              <Bot className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-white text-sm">Disha — AI Career Mentor</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-glow" />
                <span className="text-xs text-slate-400">Online · Emotionally intelligent</span>
              </div>
            </div>
          </div>
          <button
            onClick={() =>
              setMessages([
                {
                  id: "welcome-reset",
                  role: "assistant",
                  content: "Chat cleared. Starting fresh! What would you like to explore?",
                  timestamp: new Date(),
                },
              ])
            }
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="Clear chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                  msg.role === "assistant"
                    ? "bg-gradient-to-br from-violet-600 to-violet-400"
                    : "bg-white/10"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Bot className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-slate-300" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[75%] px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Streaming message */}
          {streaming && streamContent && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl flex-shrink-0 bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="max-w-[75%] chat-bubble-ai px-5 py-4 text-sm leading-relaxed">
                <StreamingMessage content={streamContent} done={false} />
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {streaming && !streamContent && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl flex-shrink-0 bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="chat-bubble-ai px-5 py-4">
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-6 pb-3">
            <p className="text-xs text-slate-600 mb-2">Try asking:</p>
            <div className="flex gap-2 flex-wrap">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs glass border border-white/5 hover:border-violet-500/30 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-full transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="glass border-t border-white/5 px-6 py-4 flex-shrink-0">
          <div className="flex gap-3 items-end">
            <div className="flex-1 glass border border-white/5 rounded-2xl focus-within:border-violet-500/30 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Disha anything about your career..."
                rows={1}
                disabled={streaming}
                className="w-full bg-transparent px-4 py-3.5 text-sm text-white placeholder-slate-600 focus:outline-none resize-none max-h-32"
                style={{ lineHeight: "1.5" }}
              />
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || streaming}
              id="chat-send-btn"
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-violet-500 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:from-violet-500 hover:to-violet-400 transition-all glow-violet flex-shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-xs text-slate-700 mt-2 text-center">
            Disha remembers your profile to give personalized answers.
          </p>
        </div>
      </div>
    </div>
  );
}
