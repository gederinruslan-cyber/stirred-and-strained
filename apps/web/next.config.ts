import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  // Workspace packages export TypeScript source.
  transpilePackages: ["@stirred/ui", "@stirred/units", "@stirred/schema", "@stirred/api-client"],
};

export default nextConfig;
