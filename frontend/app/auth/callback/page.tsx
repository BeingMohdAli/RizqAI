"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { exchangeOAuthCode, getCurrentUser } from "@/lib/api";
import { useAuth } from "@/lib/authContext";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { establishSession } = useAuth();

  // Initialize error state lazily from URL parameters if error was sent back by provider or no credentials
  const [error, setError] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const search = new URLSearchParams(window.location.search);
      const queryErr = search.get("error_description") || search.get("error");
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const hashErr = hash.get("error_description") || hash.get("error");
      if (queryErr || hashErr) return queryErr || hashErr;
      const code = search.get("code");
      const accessToken = hash.get("access_token");
      if (!code && !accessToken) {
        return "No authentication credentials returned by OAuth provider.";
      }
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const code = searchParams.get("code");
    const hashString = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    const hash = new URLSearchParams(hashString);
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token") || "";

    if (code) {
      exchangeOAuthCode(code)
        .then((session) => {
          establishSession(session);
          router.replace("/app");
        })
        .catch((reason) => {
          setError(reason instanceof Error ? reason.message : "OAuth code exchange failed.");
        });
    } else if (accessToken) {
      getCurrentUser(accessToken)
        .then((user) => {
          establishSession({
            user_id: user.user_id,
            email: user.email,
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          router.replace("/app");
        })
        .catch((reason) => {
          setError(reason instanceof Error ? reason.message : "Failed to validate OAuth user session.");
        });
    }
  }, [establishSession, router, searchParams]);

  return (
    <main className="flex h-screen items-center justify-center bg-[#070c14] px-4 text-center text-text-muted">
      {error ? (
        <div className="max-w-md rounded-2xl border border-red-500/20 bg-[#0c1421] p-6 shadow-2xl">
          <div className="mb-3 text-2xl">⚠️</div>
          <h2 className="mb-2 text-base font-semibold text-white">Sign-in Notice</h2>
          <p className="mb-5 text-xs text-rose-400">{error}</p>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-ink shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-400"
            onClick={() => router.replace("/")}
          >
            Return to Sign In
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-xs text-text-muted">Completing secure authentication…</p>
        </div>
      )}
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex h-screen items-center justify-center bg-[#070c14] text-xs text-text-muted">
          Completing secure authentication…
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
