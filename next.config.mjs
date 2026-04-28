/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"]
  },
  webpack: (config) => {
    config.externals.push({ canvas: "canvas" });
    return config;
  }
};

export default nextConfig;
