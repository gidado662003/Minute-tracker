import type { NextConfig } from "next";

const SERVER_ORIGIN = process.env.SERVER_ORIGIN || "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${SERVER_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
