import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */

const nextConfig = {
  typescript: {
    // ビルドを止めない
    ignoreBuildErrors: true,
  },
  eslint: {
    // Lintエラーでも止めない
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

export default nextConfig;
