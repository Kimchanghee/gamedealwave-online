// pnpm gate:examples — proves the commerce gate accepts the pass example and rejects the fail example.
// Source-level (no build). Exit 1 if pass-example has errors or fail-example has none.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { site } from '../src/site.config.ts';
import { checkPostSource, splitMd } from './gate-lib.mjs';

const ROOT = process.cwd();
const dir = join(ROOT, 'src/content/posts/_examples');
const ctx = { allowlist: site.providerAllowlist, log: [], otherPosts: [], publicDir: join(dir, 'assets'), rootDir: ROOT };
let bad = false;
for (const [file, expectPass] of [['pass-example.md', true], ['fail-example.md', false]]) {
  const { fm, body } = splitMd(readFileSync(join(dir, file), 'utf8'));
  const errs = checkPostSource(fm, body, ctx);
  const ok = expectPass ? errs.length === 0 : errs.length > 0;
  console.log(`${ok ? 'OK  ' : 'BAD '} ${file}: ${errs.length} error(s)${expectPass ? '' : ' (expected >0)'}`);
  for (const e of errs) console.log('      - ' + e);
  if (!ok) bad = true;
}
// Duplicate guard: the same product URL already in the publish log (within 30 days) must be rejected.
{
  const { fm, body } = splitMd(readFileSync(join(dir, 'pass-example.md'), 'utf8'));
  const errs = checkPostSource(fm, body, { ...ctx, log: [{ slug: 'older-post', productUrl: fm.product.url, publishedAt: new Date().toISOString() }] });
  const ok = errs.some((e) => e.startsWith('duplicate product URL'));
  console.log(`${ok ? 'OK  ' : 'BAD '} duplicate-url guard ${ok ? 'rejects' : 'did NOT reject'} a repeated product URL`);
  if (!ok) bad = true;
}
process.exit(bad ? 1 : 0);
