import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { parse } from 'yaml';
import { site, productHref, productRel } from './src/site.config.ts';

// lastmod map from real content dates (frontmatter `updated`), never build time.
function contentDates() {
  const map = new Map();
  for (const [dir, prefix] of [['src/content/guides', '/guides/'], ['src/content/posts', '/picks/']]) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.md') || f.startsWith('_')) continue;
      const raw = readFileSync(`${dir}/${f}`, 'utf8');
      const fm = parse(raw.split(/^---\s*$/m)[1] ?? '');
      map.set(`${site.url}${prefix}${fm.slug}/`, String(fm.updated).slice(0, 10));
    }
  }
  return map;
}
const dates = contentDates();
const latest = [...dates.values(), site.siteUpdated].sort().at(-1);

// Rewrites Amazon product links in markdown bodies so in-text href == card href == CTA href.
function rehypeProductLinks() {
  const hosts = site.providerAllowlist.amazon;
  const walk = (node) => {
    if (node.type === 'element' && node.tagName === 'a' && node.properties?.href) {
      try {
        const u = new URL(String(node.properties.href));
        if (hosts.includes(u.hostname)) {
          node.properties.href = productHref(u.toString());
          node.properties.rel = productRel().split(' ');
          node.properties.className = ['product-link'];
          node.properties['data-outbound'] = u.hostname;
        }
      } catch {}
    }
    for (const c of node.children ?? []) walk(c);
  };
  return (tree) => walk(tree);
}

export default defineConfig({
  site: site.url,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: { rehypePlugins: [rehypeProductLinks] },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      serialize(item) {
        item.lastmod = dates.get(item.url) ?? (item.url.match(/\/(guides|picks|category)\/$|\.online\/$/) ? latest : site.siteUpdated);
        return item;
      },
    }),
  ],
});
