/** @type {import('next').NextConfig} */

// Use a separate build directory for production builds so that running
// `next build` never corrupts the `.next` cache used by a running `next dev`
// server (which caused intermittent "Cannot find module './xxx.js'" errors).
const isProductionBuild = process.env.NODE_ENV === "production";

const nextConfig = {
  reactStrictMode: true,
  distDir: isProductionBuild ? ".next-build" : ".next",
};

export default nextConfig;
