import type { MetadataRoute } from 'next';

const SITE = 'https://gamedealwave.online';
const LOCALES = ['ko', 'en', 'ja'];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    entries.push({ url: `${SITE}/${locale}`, lastModified, changeFrequency: 'hourly', priority: 1.0 });
    entries.push({ url: `${SITE}/${locale}/steam`, lastModified, changeFrequency: 'daily', priority: 0.9 });
    entries.push({ url: `${SITE}/${locale}/psn`, lastModified, changeFrequency: 'daily', priority: 0.85 });
    entries.push({ url: `${SITE}/${locale}/xbox`, lastModified, changeFrequency: 'daily', priority: 0.85 });
  }
  return entries;
}
