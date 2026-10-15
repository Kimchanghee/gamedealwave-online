import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const source = z.object({ title: z.string().min(3), url: z.string().url() });
const asof = z.union([z.string(), z.date()]).transform((v) => (typeof v === 'string' ? v : v.toISOString().slice(0, 10)));
const faq = z.object({ q: z.string().min(5), a: z.string().min(10) });
const category = z.enum(['consoles', 'games', 'gift-cards', 'storage', 'controllers']);

// Evergreen buying-criteria guides (no product links needed).
const guides = defineCollection({
  loader: glob({ pattern: '[^_]*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string(),
    description: z.string(),
    slug: z.string(),
    question: z.string().min(5),
    answer: z.string().min(40),
    category,
    published: z.coerce.date(),
    updated: z.coerce.date(),
    data_asof: asof,
    sources: z.array(source).min(1),
    faq: z.array(faq).default([]),
    checklist: z.array(z.string()).min(3),
  }),
});

// Hourly commerce posts. Files in _examples/ are excluded by the glob pattern.
const posts = defineCollection({
  loader: glob({ pattern: '[^_]*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    description: z.string(),
    slug: z.string(),
    question: z.string().min(5),
    answer: z.string().min(40),
    published: z.string().regex(/T.*(Z|[+-]\d{2}:\d{2})$/, 'ISO with explicit offset'),
    updated: z.string().regex(/T.*(Z|[+-]\d{2}:\d{2})$/),
    category,
    primaryKeyword: z.string(),
    product: z.object({
      name: z.string(),
      optionDetail: z.string(),
      provider: z.enum(['coupang', 'ohou', 'toss', 'naver', 'amazon']),
      url: z.string().url(),
      landingHost: z.string(),
      verifiedAt: z.string(),
      evidence: z.string(),
    }),
    images: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string().min(8),
          role: z.enum(['cover', 'context', 'detail', 'comparison', 'use']),
          credit: z.string(),
          rights: z.enum(['generated', 'provider-api', 'own']),
        }),
      )
      .min(1),
    sources: z.array(source).min(1),
    faq: z.array(faq).default([]),
    disclosure: z.string().optional(),
    data_asof: asof.optional(),
  }),
});

const docs = defineCollection({
  loader: glob({ pattern: '[^_]*.md', base: './src/content/docs' }),
  schema: z.object({ title: z.string(), seoTitle: z.string(), description: z.string(), slug: z.string(), updated: z.coerce.date() }),
});

export const collections = { guides, posts, docs };
