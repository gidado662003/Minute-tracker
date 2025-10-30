import type { NextConfig } from "next";

const SERVER_ORIGIN = process.env.SERVER_ORIGIN || "http://localhost:5000";
// const SERVER_ORIGIN = process.env.SERVER_ORIGIN || "http://10.0.0.253:5000";
// n8n instance used in development/production; default dev port is 5678
const N8N_ORIGIN = process.env.N8N_ORIGIN || "http://localhost:5678";

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
      // Proxy /n8n/* to your n8n instance (used for webhooks, etc.)
      {
        source: "/n8n/:path*",
        destination: `${N8N_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
