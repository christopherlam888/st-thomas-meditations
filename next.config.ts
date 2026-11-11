import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for easy deployment on render.com (or any static host).
  // `bun run build` emits the complete site into ./out
  output: "export",
  images: { unoptimized: true },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
