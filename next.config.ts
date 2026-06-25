import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  // skipWaiting handled by service worker automatically
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Development can use Turbopack; production builds use webpack because next-pwa emits via webpack.
  turbopack: {},
};

export default withPWA(nextConfig);
