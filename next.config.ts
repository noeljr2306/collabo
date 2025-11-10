import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-src 'self' http://localhost:3000 http://192.168.56.1:3000;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
