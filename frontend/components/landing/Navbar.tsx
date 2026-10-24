"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

export default function Navbar() {
  const router = useRouter();
  const { user, openAuthModal, logout } = useAuth();

  const handleLaunchApp = () => {
    if (user) {
      router.push("/app");
    } else {
      openAuthModal("login");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-500/10 bg-[#060b11]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/20 transition-transform group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-white">
            Rizq<span className="text-emerald-400">AI</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
          <a href="#home" className="text-text hover:text-emerald-400 transition-colors">
            Home
          </a>
          <a href="#features" className="hover:text-emerald-400 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
            How It Works
          </a>
          <a href="#about" className="hover:text-emerald-400 transition-colors">
            About
          </a>
        </nav>

        {/* Right CTA / Auth controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <span className="hidden text-xs text-text-muted sm:inline-block max-w-[130px] truncate">
                {user.email || "Analyst"}
              </span>
              <button
                onClick={logout}
                className="hidden text-xs text-text-faint hover:text-bear transition-colors sm:inline-block"
              >
                Sign Out
              </button>
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-ink shadow-md shadow-emerald-400/20 transition-all hover:bg-emerald-300 hover:shadow-emerald-400/30"
              >
                Launch App
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal("login")}
                className="hidden px-3.5 py-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text sm:inline-block"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal("signup")}
                className="hidden rounded-full border border-line-soft px-3.5 py-1.5 text-xs font-medium text-text transition-colors hover:border-emerald-500/40 hover:text-emerald-400 sm:inline-block"
              >
                Sign Up
              </button>
              <button
                onClick={handleLaunchApp}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-ink shadow-md shadow-emerald-400/20 transition-all hover:bg-emerald-300 hover:shadow-emerald-400/30"
              >
                Launch App
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

