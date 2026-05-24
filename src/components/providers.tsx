"use client";

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { registerAuthStore } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/authStore";
import { useAuthSync } from "@/lib/hooks/useAuthSync";
import { getApiError } from "@/lib/errors";

function AuthStoreRegistrar() {
  useAuthSync();
  // store reference only used for registering — suppress the lint warning
  useAuthStore();
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
    // Surface unhandled query errors as toasts so every page gets basic
    // error feedback without needing per-hook error handling.
    queryCache: new QueryCache({
      onError(error, query) {
        // Don't toast for queries that are already handling errors locally
        // (they set meta.silent = true).
        if (query.meta?.silent) return;

        const message = getApiError(error);
        // Deduplicate by error message to avoid spamming
        toast.error(message, { id: message });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: (failureCount, error) => {
          // Don't retry on 4xx client errors
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const status = (error as any)?.response?.status;
          if (status && status >= 400 && status < 500) return false;
          return failureCount < 1;
        },
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
      <Toaster richColors position="top-right" closeButton />
    </QueryClientProvider>
  );
}
