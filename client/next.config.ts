import type { NextConfig } from "next";

const SERVER_ORIGIN = process.env.SERVER_ORIGIN || "http://localhost:5000";
// const SERVER_ORIGIN = process.env.SERVER_ORIGIN || "http://10.0.0.253:5000";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Disable ESLint during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Disable type checking during production builds.
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${SERVER_ORIGIN}/api/:path*`, // ✅ include /api here
      },
    ];
  },
};

export default nextConfig;
