import type { NextConfig } from "next";

const API_ORIGIN = process.env.API_ORIGIN?.replace(/\/$/, "");

const SECURITY_HEADERS = [
  // Prevent DNS pre-fetch leaking referrer info
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Clickjacking protection
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer information
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser feature access
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  // ── API rewrite proxy ─────────────────────────────────────────────────
  async rewrites() {
    if (!API_ORIGIN) {
      return [];
    }

    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_ORIGIN}/api/v1/:path*`,
      },
    ];
  },

  // ── Security headers ──────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },

  // ── Image optimisation ────────────────────────────────────────────────
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // CDN / object-storage for product images (configurable via env)
      {
        protocol: "https",
        hostname: process.env.IMAGE_HOSTNAME ?? "storage.googleapis.com",
      },
      // S3-compatible buckets
      {
        protocol: "https",
        hostname: "**.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.s3.**.amazonaws.com",
      },
    // Cloudinary
    {
      protocol: "https",
      hostname: "res.cloudinary.com",
    },
    // Placeholder images (development/testing)
    {
      protocol: "https",
      hostname: "placehold.co",
    },
    // Development / local mocks
    {
      protocol: "http",
      hostname: "localhost",
      port: "8080",
    },
    ],
    // Use AVIF first for better compression, fallback to WebP
    formats: ["image/avif", "image/webp"],
  },

  // ── Logging ───────────────────────────────────────────────────────────
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },

  // ── API proxy (eliminates CORS + mixed-content) ───────────────────────
  // Browser calls https://instant-need-web-one.vercel.app/api/v1/* (same origin, HTTPS).
  // Vercel server-side forwards to EC2 — no browser CORS preflight, no mixed content.
  // Set NEXT_PUBLIC_API_URL=/api/v1 on Vercel (relative URL).
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL ?? "http://ec2-54-82-251-88.compute-1.amazonaws.com:8080";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },

  // ── TypeScript ───────────────────────────────────────────────────────
  // Fail CI on type errors (default false = do NOT ignore)
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
