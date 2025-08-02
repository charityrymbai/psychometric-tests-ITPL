import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://172.16.38.120:3002/:path*',
      },
    ];
  },
  allowedDevOrigins: [
    'http://172.16.38.120:3000',
    'http://localhost:3000',
  ],
};

export default nextConfig;
