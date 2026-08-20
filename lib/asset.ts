/* Files in /public are served from wherever the site is mounted. On
   GitHub Pages that is /roznaoman-demo/, not /. Next rewrites its own
   /_next/* URLs for us, but an <Image> with `unoptimized` skips the
   loader that would apply basePath, so any path we hand it has to be
   prefixed here. Empty prefix locally, so nothing changes in dev. */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string) => `${BASE}${path}`;
