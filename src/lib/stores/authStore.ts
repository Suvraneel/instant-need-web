"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserDTO } from "@/lib/types/auth";

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

      login: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      logout: () => set({ user: null, accessToken: null, refreshToken: null }),

      getAccessToken: () => get().accessToken,
      getRefreshToken: () => get().refreshToken,
      clearAuth: () => set({ user: null, accessToken: null, refreshToken: null }),

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
    }
  )
);
