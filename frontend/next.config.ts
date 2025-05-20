import { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.figma.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
        port: "",
      },
    ],
  },
  productionBrowserSourceMaps: false,
};

export default nextConfig;
