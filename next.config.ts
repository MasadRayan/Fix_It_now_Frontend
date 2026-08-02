import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "example.com"
      }
    ]
  }
};

export default nextConfig;
