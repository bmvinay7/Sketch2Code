/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
      { protocol: "https", hostname: "api.dicebear.com" }
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
    turbo: {
      resolveAlias: {
        canvas: "./lib/canvas-empty.ts"
      }
    }
  },
  webpack: (config) => {
    config.externals.push({ canvas: "canvas" });
    return config;
  }
};

export default nextConfig;
