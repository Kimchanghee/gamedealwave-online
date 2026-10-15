import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '../site.config.ts';

export async function GET() {
  const guides = await getCollection('guides');
  const posts = await getCollection('posts');
  const items = [
    ...guides.map((g) => ({ title: g.data.title, description: g.data.answer, link: `/guides/${g.data.slug}/`, pubDate: g.data.updated })),
    ...posts.map((p) => ({ title: p.data.title, description: p.data.answer, link: `/picks/${p.data.slug}/`, pubDate: new Date(p.data.published) })),
  ].sort((a, b) => +b.pubDate - +a.pubDate);
  return rss({ title: `${site.name} guides and picks`, description: site.description, site: site.url, items });
}
