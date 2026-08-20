/** @type {import('next').NextConfig} */

/* GitHub Pages serves this repo from /roznaoman-demo/, not from the
   domain root, so every URL the app emits needs that prefix. The env
   var is set only by the deploy workflow — locally it is empty and the
   site runs at / as before. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig = {
  reactStrictMode: true,
  /* Pages is a static file host: no Node server, so no on-demand
     image optimisation and no server rendering. */
  output: "export",
  basePath,
  images: { unoptimized: true },
  /* Emit /room/index.html rather than /room.html so Pages resolves
     extensionless URLs. */
  trailingSlash: true,
};

export default nextConfig;
