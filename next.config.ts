import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone output is only needed for Docker production builds.
  // It causes heavy memory usage in dev that can freeze WSL2.
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
};

export default nextConfig;
