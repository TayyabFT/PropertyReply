/** @type {import('next').NextConfig} */

// On Vercel, always use the default `.next` output (required by the platform).
// Locally, production builds go to `.next-build` so `next build` never corrupts
// the `.next` cache used by a running `next dev` server.
const isVercel = Boolean(process.env.VERCEL);
const isProductionBuild = process.env.NODE_ENV === "production";

const nextConfig = {
  reactStrictMode: true,
  ...(isVercel
    ? {}
    : { distDir: isProductionBuild ? ".next-build" : ".next" }),
};

export default nextConfig;
