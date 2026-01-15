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
      (context: any, request: any, callback: any) => {
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
