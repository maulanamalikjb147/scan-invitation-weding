import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Photos in public/images are already resized for the web. Serving them
  // directly also keeps local development independent from Cloudflare's
  // production-only image and asset bindings.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
