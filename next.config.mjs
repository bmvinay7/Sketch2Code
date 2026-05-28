import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const SECURITY_HEADERS = [
  // Browsers won't try to MIME-sniff anything we serve as a different type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Block embedding the site in an iframe (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Don't leak full URLs to third parties on cross-origin navigations.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features we never use.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: projectRoot,
  serverExternalPackages: ["@prisma/client"],
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  webpack: (config) => {
    config.externals.push({ canvas: "canvas" });
    return config;
  }
};

export default nextConfig;
