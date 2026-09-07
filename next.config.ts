import type { NextConfig } from 'next';

/**
 * The scorecard is a single client-rendered page with no backend, so it is exported as static
 * files and can be served from GitHub Pages, S3, Netlify, or any web server. Deploying under a
 * sub-path (github.io/<repo>) needs `NEXT_PUBLIC_BASE_PATH=/<repo>` at build time.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  poweredByHeader: false,
  reactStrictMode: true,
  // The static export has no image optimizer behind it, and the page ships no bitmaps anyway.
  images: { unoptimized: true },
};

export default nextConfig;
