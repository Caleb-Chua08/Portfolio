import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for hosts like Render static sites — `next build` emits
  // plain HTML/CSS/JS into ./out (Publish Directory = `out`).
  output: "export",
  // Emit /control-room as control-room/index.html so any static host serves it.
  trailingSlash: true,
  // The default image optimizer needs a server; serve files as-is instead.
  images: { unoptimized: true },
};

export default nextConfig;
