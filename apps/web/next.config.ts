import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);

const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  output: "standalone",
  typedRoutes: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  transpilePackages: ["@platform/db", "@platform/shared"],
  // Treat the API package as external — it uses Bun-only APIs and
  // must never be bundled by Next.js webpack. Type imports from it
  // are erased at compile time (import type).
  serverExternalPackages: ["@platform/api"],
  webpack: (config) => {
    // Allow .js extension in imports to resolve to .ts/.tsx files
    config.resolve = config.resolve ?? {};
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
