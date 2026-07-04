import type { NextConfig } from "next";

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
    // Images proxied through Vercel (STORAGE_BASE_URL=https://instant-need.vercel.app/uploads)
    {
      protocol: "https",
      hostname: "instant-need.vercel.app",
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

  // ── API + uploads proxy (eliminates CORS + mixed-content) ───────────────
  // Browser/mobile calls https://instant-need.vercel.app/api/v1/* or /uploads/*.
  // Vercel forwards server-side to EC2 over HTTP — no CORS preflight,
  // no cleartext-HTTP issues on Android 9+.
  // /uploads/** only serves content when EC2 has STORAGE_TYPE=local; in the
  // normal STORAGE_TYPE=s3 setup, uploaded files are served directly from
  // CloudFront (STORAGE_BASE_URL) and never touch this rewrite.
  async rewrites() {
    const backendUrl = process.env.API_ORIGIN ?? "http://ec2-35-171-29-245.compute-1.amazonaws.com:8080";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },

  // ── TypeScript ───────────────────────────────────────────────────────
  // Fail CI on type errors (default false = do NOT ignore)
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
