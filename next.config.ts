import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      process: require.resolve('process/browser'),
    };
    config.module.rules.push({
      test: /\.(md|txt)$|\/LICENSE$/,
      use: 'null-loader',
    });
    config.externals = [
      (context: string, request: string, callback: (error?: Error | null, result?: string) => void) => {
        if (request.startsWith('@libsql/')) {
          return callback(null, 'commonjs ' + request);
        }
        callback();
      },
      ...config.externals,
    ];
    return config;
  },
  turbopack: {},
};

export default nextConfig;
