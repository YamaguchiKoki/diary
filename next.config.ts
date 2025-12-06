import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/api/og",
      },
    ],
  },
};

export default nextConfig;
