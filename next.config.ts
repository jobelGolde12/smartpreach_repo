import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      process: require.resolve('process/browser'),
    };
    return config;
  },
  turbopack: {},
};

export default nextConfig;
