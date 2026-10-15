import { site } from '../site.config.ts';

export const ORG_ID = `${site.url}/#organization`;
export const WEBSITE_ID = `${site.url}/#website`;

export function organization() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: site.name,
    url: `${site.url}/`,
    description: site.description,
    email: site.contactEmail,
    logo: `${site.url}/favicon.svg`,
  };
}

export function website() {
  return { '@type': 'WebSite', '@id': WEBSITE_ID, name: site.name, url: `${site.url}/`, publisher: { '@id': ORG_ID }, inLanguage: 'en-US' };
}

export function breadcrumb(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${site.url}${it.path}` })),
  };
}

export function article(o: { headline: string; description: string; path: string; published: string; modified: string; image: string; type?: string }) {
  return {
    '@type': o.type ?? 'Article',
    headline: o.headline,
    description: o.description,
    mainEntityOfPage: `${site.url}${o.path}`,
    datePublished: o.published,
    dateModified: o.modified,
    image: `${site.url}${o.image}`,
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    inLanguage: 'en-US',
  };
}

export function faqPage(faq: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export function graph(...nodes: object[]) {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
}

export function isoDate(d: Date | string) {
  return (typeof d === 'string' ? new Date(d) : d).toISOString().slice(0, 10);
}

export function wordCount(text: string) {
  return (text.replace(/[#>*_`\[\]()|-]/g, ' ').match(/[A-Za-z0-9'’]+/g) ?? []).length;
}
