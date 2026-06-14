/**
 * Centralised environment variable access with runtime validation.
 *
 * Import this module instead of accessing process.env directly so missing
 * variables are caught at startup rather than at the call-site.
 */

function requireEnvValue(value: string | undefined, key: string, fallback?: string): string {
  const resolved = value ?? fallback;
  if (!resolved) {
    throw new Error(
      `[env] Missing required environment variable: ${key}\n` +
        `Copy .env.example to .env.local and fill in the value.`
    );
  }
  return resolved;
}

/** Public vars (safe to expose in browser bundles) */
export const env = {
  /** Base URL for the backend API, e.g. http://localhost:8080/api/v1 */
  // Direct access is required so Next.js can inline NEXT_PUBLIC_* on the client.
  apiUrl: requireEnvValue(process.env.NEXT_PUBLIC_API_URL, "NEXT_PUBLIC_API_URL", "/api/v1"),

  /** App display name used in titles and emails */
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "InstantNeed",

  /** Deployment environment */
  nodeEnv: (process.env.NODE_ENV ?? "development") as
    | "development"
    | "production"
    | "test",

  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
} as const;
