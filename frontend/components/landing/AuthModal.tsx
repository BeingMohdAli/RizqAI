"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getOAuthUrl, requestSignupOtp } from "@/lib/api";
import { useAuth } from "@/lib/authContext";

export default function AuthModal() {
  const router = useRouter();
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, signupWithOtp } = useAuth();
  const [activeTabOverride, setActiveTabOverride] = useState<"login" | "signup" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [name, setName] = useState("");

  if (!isAuthModalOpen) return null;

  const mode = activeTabOverride ?? authModalMode;

  const handleClose = () => {
    setActiveTabOverride(null);
    setError(null);
    setInfo(null);
    setOtp("");
    setOtpRequested(false);
    closeAuthModal();
  };

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
        if (!otpRequested) {
          const response = await requestSignupOtp(email, password);
          setOtpRequested(true);
          setInfo(response.message);
        } else {
          await signupWithOtp(email, password, otp, name);
          router.push("/app");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication request failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setError(null);
    setLoading(true);
    try {
      const { url } = await getOAuthUrl(provider);
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start OAuth login.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line-soft bg-[#0a101d] p-7 shadow-2xl shadow-emerald-950/20">
        {/* Glow accent */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={handleClose}
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
              setActiveTabOverride("login");
              setError(null);
              setOtpRequested(false);
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
              setActiveTabOverride("signup");
              setError(null);
              setOtpRequested(false);
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
            {mode === "signup" && otpRequested && (
              <>
                <label className="mb-1.5 block text-xs font-medium text-text-muted">Your name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-line-soft bg-ink px-3.5 py-2.5 text-sm text-text placeholder-text-faint"
                />
              </>
            )}
          </div>
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

          {mode === "signup" && otpRequested && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">OTP Code</label>
              <input
                type="text"
                required
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit OTP"
                className="w-full rounded-xl border border-line-soft bg-ink px-3.5 py-2.5 text-sm text-text placeholder-text-faint transition-colors focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>
          )}

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
            ) : otpRequested ? (
              "Verify OTP & Create Account"
            ) : (
              "Send Signup OTP"
            )}
          </button>
        </form>

        <div className="mt-5 border-t border-line-soft pt-4">
          <p className="mb-2 text-center text-[11px] text-text-faint">Or continue with</p>
          <div className="grid grid-cols-2 gap-2">
            {(["google", "github"] as const).map((provider) => (
              <button
                key={provider}
                type="button"
                disabled={loading}
                onClick={() => handleOAuth(provider)}
                className="rounded-lg border border-line-soft px-3 py-2 text-xs font-medium capitalize text-text-muted transition-colors hover:border-emerald-500/30 hover:text-emerald-400 disabled:opacity-50"
              >
                {provider}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
