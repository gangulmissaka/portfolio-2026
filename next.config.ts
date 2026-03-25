/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/portfolio-2026',
  assetPrefix: '/portfolio-2026',
  // Required: GitHub Pages serves static files without a Node server,
  // so every route must resolve as a static index.html with a trailing slash.
  trailingSlash: true,
  // Expose basePath to client-side code so canvas image paths can be prefixed
  env: {
    NEXT_PUBLIC_BASE_PATH: '/portfolio-2026',
  },
};

export default nextConfig;