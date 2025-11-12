import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/trout/:path*",
        destination: "https://activeweather-ha2v.vercel.app/trout/:path*",
      },
    ];
  },
};

export default nextConfig;
