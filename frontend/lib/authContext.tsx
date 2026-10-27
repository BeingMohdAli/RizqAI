"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  loginUser,
  signupUser,
  logoutUser,
  getStoredToken,
  getStoredRefreshToken,
  clearStoredTokens,
  getCurrentUser,
  refreshAuthSession,
  verifySignupOtp,
  type SessionResponse,
} from "./api";

export interface UserSession {
  userId: string;
  name: string;
  email: string | null;
  token: string;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<string | void>;
  signupWithOtp: (email: string, password: string, otp: string, name: string) => Promise<void>;
  establishSession: (session: {
    user_id: string;
    email?: string;
    access_token: string;
    refresh_token?: string;
  }) => void;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
  authModalMode: "login" | "signup";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Lazy state initializers read stored session without triggering cascading renders in effect
  const [user, setUser] = useState<UserSession | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const storedToken = localStorage.getItem("rizqai_token");
      const storedUserId = localStorage.getItem("rizqai_user_id");
      const storedEmail = localStorage.getItem("rizqai_user_email");
      const storedName = localStorage.getItem("rizqai_user_name");
      if (storedToken && storedUserId) {
        return {
          userId: storedUserId,
          email: storedEmail,
          name: storedName || storedEmail?.split("@")[0] || "Analyst",
          token: storedToken,
        };
      }
    } catch {
      // Ignore localStorage read errors
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem("rizqai_token");
    } catch {
      return null;
    }
  });

  const [isLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");

  // Validate session on mount and restore/refresh if expired
  useEffect(() => {
    const storedToken = getStoredToken();
    const storedRefresh = getStoredRefreshToken();

    if (!storedToken) {
      return;
    }

    let active = true;

    getCurrentUser(storedToken)
      .then((me) => {
        if (!active) return;
        setUser({
          userId: me.user_id,
          email: me.email || null,
          name: me.name,
          token: storedToken,
        });
      })
      .catch(async () => {
        // Access token might be expired, attempt refresh
        if (storedRefresh) {
          try {
            const refreshed: SessionResponse = await refreshAuthSession(storedRefresh);
            if (!active) return;
            setUser({
              userId: refreshed.user_id,
              email: refreshed.email || null,
              name: refreshed.name || refreshed.email?.split("@")[0] || "Analyst",
              token: refreshed.access_token,
            });
            setToken(refreshed.access_token);
            localStorage.setItem("rizqai_token", refreshed.access_token);
            if (refreshed.refresh_token) {
              localStorage.setItem("rizqai_refresh_token", refreshed.refresh_token);
            }
            localStorage.setItem("rizqai_user_id", refreshed.user_id);
            if (refreshed.email) {
              localStorage.setItem("rizqai_user_email", refreshed.email);
            }
            return;
          } catch {
            // Refresh token also invalid
          }
        }
        if (!active) return;
        clearStoredTokens();
        setUser(null);
        setToken(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const establishSession = useCallback((session: {
    user_id: string;
    email?: string;
    name?: string;
    access_token: string;
    refresh_token?: string;
  }) => {
    const nextUser: UserSession = {
      userId: session.user_id,
      email: session.email || null,
      name: session.name || session.email?.split("@")[0] || "Analyst",
      token: session.access_token,
    };
    setUser(nextUser);
    setToken(session.access_token);
    try {
      localStorage.setItem("rizqai_token", session.access_token);
      localStorage.setItem("rizqai_user_id", session.user_id);
      if (session.refresh_token) {
        localStorage.setItem("rizqai_refresh_token", session.refresh_token);
      }
      if (session.email) {
        localStorage.setItem("rizqai_user_email", session.email);
      }
      if (session.name) {
        localStorage.setItem("rizqai_user_name", session.name);
      }
    } catch {
      // Ignore storage write issues
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginUser(email, password);
    establishSession(res);
    setIsAuthModalOpen(false);
  };

  const signup = async (email: string, password: string) => {
    const res = await signupUser(email, password);
    if ("access_token" in res && res.access_token) {
      establishSession(res);
      setIsAuthModalOpen(false);
    } else {
      return (res as { message?: string }).message || "Signup successful! Check email to confirm.";
    }
  };

  const signupWithOtp = useCallback(async (email: string, password: string, otp: string, name: string) => {
    const res = await verifySignupOtp(email, password, otp, name);
    establishSession(res);
    setIsAuthModalOpen(false);
  }, [establishSession]);

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore server logout errors
    } finally {
      clearStoredTokens();
      setUser(null);
      setToken(null);
    }
  };

  const openAuthModal = (mode: "login" | "signup" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        signupWithOtp,
        establishSession,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
