// Pure partner-link logic. Config lives in src/data/affiliates.json; site.config.ts binds it.
// Erasable TypeScript only, so Node scripts and tests can import it directly.
export type LinkFormat = { type: 'query'; param: string } | { type: 'issued' };
export type Program = {
  name: string;
  enabled: boolean;
  id: string;
  hosts: string[];
  trackingHosts?: string[];
  disclosure: string;
  linkFormat: LinkFormat;
};
export type Programs = Record<string, Program>;

export const AMAZON_STATEMENT = 'As an Amazon Associate I earn from qualifying purchases.';
const REAL_ID = /^[A-Za-z0-9._-]{3,}$/;

export function isActive(programs: Programs, key: string | null | undefined): boolean {
  const p = key ? programs[key] : undefined;
  return !!p && p.enabled === true && REAL_ID.test((p.id ?? '').trim());
}

export function providerForHost(programs: Programs, host: string): string | null {
  for (const [k, p] of Object.entries(programs)) {
    if (p.hosts.includes(host) || (p.trackingHosts ?? []).includes(host)) return k;
  }
  return null;
}

/** Amazon tag in force: program config first, then the legacy build env tag. */
export function amazonTagValue(programs: Programs, envTag = ''): string {
  return isActive(programs, 'amazon') ? programs.amazon.id.trim() : envTag.trim();
}

/** Appends the program ID in its documented format. Issued links (dashboard deep links) are used as issued. */
export function hrefFor(programs: Programs, raw: string, provider?: string | null, envTag = ''): string {
  const u = new URL(raw);
  const key = provider ?? providerForHost(programs, u.hostname);
  if (key === 'amazon') {
    const tag = amazonTagValue(programs, envTag);
    const hosts = programs.amazon?.hosts ?? [];
    if (tag && u.hostname !== 'amzn.to' && hosts.includes(u.hostname)) u.searchParams.set('tag', tag);
    return u.toString();
  }
  if (key && isActive(programs, key)) {
    const f = programs[key].linkFormat;
    if (f?.type === 'query') u.searchParams.set(f.param, programs[key].id.trim());
  }
  return u.toString();
}

/** Program-specific disclosure. The Amazon line is used for Amazon only. */
export function disclosureText(programs: Programs, provider: string, opts: { envTag?: string; amazonOff: string; generic: string }): string {
  if (provider === 'amazon') return amazonTagValue(programs, opts.envTag) ? AMAZON_STATEMENT : opts.amazonOff;
  if (isActive(programs, provider)) return programs[provider].disclosure;
  return opts.generic;
}
