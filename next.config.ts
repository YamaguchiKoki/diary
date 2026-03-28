import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    cms: {
      stale: 300,
      revalidate: 60 * 60 * 3,
      expire: 60 * 60 * 24,
    },
  },
  async redirects() {
    return [
      {
        source: "/books",
        has: [
          {
            type: "query",
            key: "topic",
            value: "(?<topic>.*)",
          },
        ],
        destination: "/books/topic/:topic",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
