import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Photos in public/images are already resized for the web. Serving them
  // directly also keeps local development independent from Cloudflare's
  // production-only image and asset bindings.
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
