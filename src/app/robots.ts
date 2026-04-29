import type { MetadataRoute } from 'next';
const SITE = 'https://gamedealwave.online';
const AI_BOTS = ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-Web', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Bytespider', 'CCBot',
  'meta-externalagent', 'Applebot-Extended'];
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/_next/'] },
      ...AI_BOTS.map(ua => ({ userAgent: ua, allow: '/' })),
    ],
    sitemap: [`${SITE}/sitemap.xml`], host: SITE,
  };
}
