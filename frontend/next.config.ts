import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.railway.app" },
      { protocol: "https", hostname: "**.tigrisdata.com" },
    ],
  },
}

export default nextConfig
