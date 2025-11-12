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
    const apexAppUrl =
      process.env.APEX_APP_URL || "https://activeweather-ha2v.vercel.app";
    return [
      {
        source: "/trout/:path*",
        destination: `${apexAppUrl}/:path*`,
      },
      {
        source: "/trout",
        destination: `${apexAppUrl}/`,
      },
    ];
  },
};

export default nextConfig;
