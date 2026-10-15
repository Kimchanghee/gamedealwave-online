import { getCollection } from 'astro:content';
import { site, isAffiliateMode, AMAZON_STATEMENT, NO_TAG_STATEMENT } from '../site.config.ts';

export async function GET() {
  const guides = await getCollection('guides');
  const posts = await getCollection('posts');
  const lines = [
    `# ${site.name}`, '', `> ${site.description}`, '',
    `Link policy: ${isAffiliateMode() ? AMAZON_STATEMENT : NO_TAG_STATEMENT} We never show Amazon prices, stock or star ratings.`, '',
    '## Buying checklists',
    ...guides.map((g) => `- [${g.data.title}](${site.url}/guides/${g.data.slug}/): ${g.data.answer}`), '',
    '## Product picks',
    ...(posts.length ? posts.map((p) => `- [${p.data.title}](${site.url}/picks/${p.data.slug}/): ${p.data.answer}`) : ['- None published yet.']), '',
    '## About',
    `- [About](${site.url}/about/)`, `- [Methodology](${site.url}/methodology/)`, `- [Affiliate disclosure](${site.url}/affiliate-disclosure/)`, `- Contact: ${site.contactEmail}`,
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
