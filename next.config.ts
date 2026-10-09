import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/equipment/run-pond-pump-24-hours",
        destination: "/guides/do-pond-pumps-need-to-run-24-hours",
        permanent: true,
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
