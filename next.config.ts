import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  reactStrictMode: true,
  cacheComponents: true,

  experimental: {
    cssChunking: true,
    webVitalsAttribution: ["CLS", "LCP"],
    globalNotFound: true,
  },
};

export default nextConfig;
