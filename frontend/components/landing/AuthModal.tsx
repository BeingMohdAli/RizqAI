"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

export default function AuthModal() {
  const router = useRouter();
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(authModalMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
        router.push("/app");
      } else {
        const msg = await signup(email, password);
        if (msg) {
          setInfo(msg);
        } else {
          router.push("/app");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication request failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    // Generate a temporary local guest session for development/testing
    const guestId = "guest-" + Math.random().toString(36).slice(2, 8);
    localStorage.setItem("rizqai_token", "guest-access-token");
    localStorage.setItem("rizqai_user_id", guestId);
    localStorage.setItem("rizqai_user_email", "guest@rizq.ai");
    closeAuthModal();
    router.push("/app");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line-soft bg-[#0a101d] p-7 shadow-2xl shadow-emerald-950/20">
        {/* Glow accent */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 text-text-muted transition-colors hover:text-text"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Title & Brand */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-display text-xl font-semibold tracking-tight text-text">
              Rizq<span className="text-emerald-400">AI</span>
            </span>
          </div>
          <h2 className="text-lg font-medium text-text">
            {mode === "login" ? "Welcome back to your desk" : "Create your analyst account"}
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            Institutional-grade multi-agent financial intelligence.
          </p>
        </div>

        {/* Tab switch */}
        <div className="mb-6 flex rounded-xl border border-line-soft bg-ink p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
              mode === "login"
                ? "bg-emerald-500/15 text-emerald-400 shadow-sm border border-emerald-500/20"
                : "text-text-muted hover:text-text"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
              mode === "signup"
                ? "bg-emerald-500/15 text-emerald-400 shadow-sm border border-emerald-500/20"
                : "text-text-muted hover:text-text"
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-bear/30 bg-bear-soft px-3 py-2 text-xs text-bear">
            {error}
          </div>
        )}

        {info && (
          <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
            {info}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="analyst@firm.com"
              className="w-full rounded-xl border border-line-soft bg-ink px-3.5 py-2.5 text-sm text-text placeholder-text-faint transition-colors focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-line-soft bg-ink px-3.5 py-2.5 text-sm text-text placeholder-text-faint transition-colors focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-ink shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                Connecting...
              </span>
            ) : mode === "login" ? (
              "Sign In to Desk"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Quick guest demo option */}
        <div className="mt-5 border-t border-line-soft pt-4 text-center">
          <p className="text-[11px] text-text-faint mb-2">Want to explore without credentials?</p>
          <button
            onClick={handleGuestAccess}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line-soft px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-emerald-500/30 hover:text-emerald-400"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Enter Workspace as Guest Analyst
          </button>
        </div>
      </div>
    </div>
  );
}

