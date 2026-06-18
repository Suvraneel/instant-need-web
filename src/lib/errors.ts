import axios from "axios";

/**
 * Extracts a human-readable error message from any thrown value.
 *
 * Priority order:
 *  1. Backend JSON body: `{ message: "..." }` or `{ error: "..." }`
 *  2. HTTP status description
 *  3. JS Error message
 *  4. Fallback string
 */
export function getApiError(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;

    if (typeof data === "string" && data.length > 0 && data.length < 300) {
      return data;
    }
    if (data && typeof data === "object") {
      if (typeof data.message === "string") return data.message;
      if (typeof data.error === "string") return data.error;
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors[0].message ?? data.errors[0] ?? fallback;
      }
    }

    // HTTP-level descriptions
    const status = err.response?.status;
    if (status === 401) return "You must be logged in to do that.";
    if (status === 403) return "You don't have permission to do that.";
    if (status === 404) return "The requested resource was not found.";
    if (status === 409) return "A conflict occurred — the resource may already exist.";
    if (status === 422) return "The submitted data is invalid.";
    if (status === 429) return "Too many requests. Please wait a moment and try again.";
    if (status && status >= 500) return "Server error. Please try again later.";
    if (!err.response) return "Network error. Check your connection.";
  }

  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;

  return fallback;
}
