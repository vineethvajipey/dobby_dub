import type { NextConfig } from "next";

const config: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  // Configure maximum payload size for API routes
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb'
    }
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'fluent-ffmpeg']
    return config
  },
};

export default config;
