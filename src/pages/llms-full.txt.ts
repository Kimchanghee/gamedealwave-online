import { getCollection } from 'astro:content';
import { site } from '../site.config.ts';

const day = (d: Date | string) => (typeof d === 'string' ? d : d.toISOString()).slice(0, 10);

export async function GET() {
  const guides = (await getCollection('guides')).sort((a, b) => a.data.slug.localeCompare(b.data.slug));
  const posts = await getCollection('posts');
  const block = (url: string, d: any, body: string | undefined) =>
    [
      `## ${d.title}`,
      `URL: ${url}`,
      `Question: ${d.question}`,
      `Updated: ${day(d.updated)}`,
      '',
      d.answer,
      '',
      (body ?? '').trim(),
      '',
      ...(d.checklist ? ['Checklist:', ...d.checklist.map((c: string) => `- ${c}`), ''] : []),
      `Sources: ${d.sources.map((s: any) => s.url).join(', ')}`,
      '',
    ].join('\n');
  const out = [
    `# ${site.name} (full text)`,
    '',
    `> ${site.description}`,
    '',
    'Full text of every published checklist, so answer engines can quote it together with its source page.',
    '',
    '# Buying checklists',
    '',
    ...guides.map((g) => block(`${site.url}/guides/${g.data.slug}/`, g.data, g.body)),
    '# Product picks',
    '',
    ...(posts.length ? posts.map((p) => block(`${site.url}/picks/${p.data.slug}/`, p.data, p.body)) : ['None published yet.', '']),
  ];
  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
