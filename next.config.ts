import type { NextConfig } from "next";

// ─────────────────────────────────────────────────────────────────────────────
// GitHub Pages deployment configuration
//
// If your GitHub repo is named  →  gangulmissaka.github.io
//   Leave basePath and assetPrefix as empty strings '' (user/org site — served at root).
//
// If your GitHub repo is named anything else (e.g. "portfolio", "my-portfolio")
//   Set REPO_NAME below to exactly match your repository name.
//
const REPO_NAME = ""; // ← set to your repo name if it's a project site, e.g. "portfolio"
// ─────────────────────────────────────────────────────────────────────────────

const isProd   = process.env.NODE_ENV === "production";
const basePath = isProd && REPO_NAME ? `/${REPO_NAME}` : "";

const nextConfig: NextConfig = {
  output: "export",

  // Required for GitHub Pages project repos (e.g. username.github.io/portfolio)
  basePath,
  assetPrefix: basePath,

  images: {
    // Required for static export — Next.js image optimisation needs a server
    unoptimized: true,
  },

  // Trailing slash ensures all pages resolve correctly from GitHub Pages CDN
  trailingSlash: true,
};

export default nextConfig;
