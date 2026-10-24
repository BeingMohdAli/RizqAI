"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUser, signupUser, logoutUser, getStoredToken } from "./api";

export interface UserSession {
  userId: string;
  email: string | null;
  token: string;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<string | void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
  authModalMode: "login" | "signup";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    try {
      const storedToken = getStoredToken();
      const storedEmail = localStorage.getItem("rizqai_user_email");
      const storedUserId = localStorage.getItem("rizqai_user_id");

      if (storedToken && storedUserId) {
        setToken(storedToken);
        setUser({
          userId: storedUserId,
          email: storedEmail,
          token: storedToken,
        });
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginUser(email, password);
    const session = {
      userId: res.user_id,
      email: res.email || email,
      token: res.access_token,
    };
    setUser(session);
    setToken(res.access_token);
    localStorage.setItem("rizqai_token", res.access_token);
    localStorage.setItem("rizqai_user_id", res.user_id);
    if (res.email) localStorage.setItem("rizqai_user_email", res.email);
    setIsAuthModalOpen(false);
  };

  const signup = async (email: string, password: string) => {
    const res = await signupUser(email, password);
    if ("access_token" in res && res.access_token) {
      const session = {
        userId: res.user_id,
        email: res.email || email,
        token: res.access_token,
      };
      setUser(session);
      setToken(res.access_token);
      localStorage.setItem("rizqai_token", res.access_token);
      localStorage.setItem("rizqai_user_id", res.user_id);
      if (res.email) localStorage.setItem("rizqai_user_email", res.email);
      setIsAuthModalOpen(false);
    } else {
      return (res as { message?: string }).message || "Signup successful! Check email.";
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore server logout errors
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("rizqai_token");
      localStorage.removeItem("rizqai_user_id");
      localStorage.removeItem("rizqai_user_email");
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

