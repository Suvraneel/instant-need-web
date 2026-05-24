"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { registerAuthStore } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/authStore";
import { useAuthSync } from "@/lib/hooks/useAuthSync";

function AuthStoreRegistrar() {
  useAuthSync();
  const store = useAuthStore();
  const registered = useRef(false);

  useEffect(() => {
    if (!registered.current) {
      registerAuthStore({
        getAccessToken: () => useAuthStore.getState().accessToken,
        getRefreshToken: () => useAuthStore.getState().refreshToken,
        setTokens: (access, refresh) =>
          useAuthStore.getState().setTokens(access, refresh),
        clearAuth: () => useAuthStore.getState().clearAuth(),
      });
      registered.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthStoreRegistrar />
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
