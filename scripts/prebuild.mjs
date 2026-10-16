// Runs before every build: drop Astro's content-layer cache so deleted/staged posts and env-dependent
// link rewriting (amazonTag) never leak from a previous build, then regenerate OG images.
import { rmSync } from 'node:fs';
for (const p of ['node_modules/.astro/data-store.json', '.astro/data-store.json', 'public/og']) rmSync(p, { force: true, recursive: true });
await import('./og.mjs');
