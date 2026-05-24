"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";

/**
 * Syncs the Zustand auth state into cookies so Next.js middleware
 * can read the token server-side for route protection.
 */
export function useAuthSync() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (accessToken && user) {
      document.cookie = `instant-need-access-token=${accessToken}; path=/; SameSite=Lax`;
      document.cookie = `instant-need-role=${user.role}; path=/; SameSite=Lax`;
    } else {
      document.cookie =
        "instant-need-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "instant-need-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }, [accessToken, user]);
}
