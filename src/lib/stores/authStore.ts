"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserDTO } from "@/lib/types/auth";

// ── Cookie helpers (needed by Next.js middleware for server-side route guards) ──
const COOKIE_TOKEN = "instant-need-access-token";
const COOKIE_ROLE  = "instant-need-role";

function setCookies(token: string, role: string) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_TOKEN}=${token}; path=/; expires=${expires}; SameSite=Lax`;
  document.cookie = `${COOKIE_ROLE}=${role}; path=/; expires=${expires}; SameSite=Lax`;
}

function clearCookies() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_TOKEN}=; path=/; max-age=0`;
  document.cookie = `${COOKIE_ROLE}=; path=/; max-age=0`;
}

// ─────────────────────────────────────────────────────────────────────────────

interface AuthState {
  user: UserDTO | null;
  accessToken: string | null;
  refreshToken: string | null;

  // Actions
  login: (user: UserDTO, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;

  // Selectors (used by API client without importing the store)
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  clearAuth: () => void;

  isAdmin: () => boolean;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      login: (user, accessToken, refreshToken) => {
        setCookies(accessToken, user.role);
        set({ user, accessToken, refreshToken });
      },

      setTokens: (accessToken, refreshToken) => {
        const role = get().user?.role ?? "CUSTOMER";
        setCookies(accessToken, role);
        set({ accessToken, refreshToken });
      },

      logout: () => {
        clearCookies();
        set({ user: null, accessToken: null, refreshToken: null });
      },

      getAccessToken: () => get().accessToken,
      getRefreshToken: () => get().refreshToken,
      clearAuth: () => {
        clearCookies();
        set({ user: null, accessToken: null, refreshToken: null });
      },

      isAdmin: () => get().user?.role === "ADMIN",
      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: "instant-need-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      // Re-sync cookies when hydrating from localStorage on page load
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken && state?.user) {
          setCookies(state.accessToken, state.user.role);
        }
      },
    }
  )
);
