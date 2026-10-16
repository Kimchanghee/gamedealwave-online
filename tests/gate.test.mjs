// node --test tests/  — hand-checked cases for the commerce gate and link helpers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkPostSource, splitMd, words } from '../scripts/gate-lib.mjs';
import { site, productHref, disclosureFor, AMAZON_STATEMENT, NO_TAG_STATEMENT } from '../src/site.config.ts';

const ROOT = process.cwd();
const ex = (f) => splitMd(readFileSync(join(ROOT, 'src/content/posts/_examples', f), 'utf8'));
const ctx = { allowlist: site.providerAllowlist, log: [], otherPosts: [], publicDir: join(ROOT, 'src/content/posts/_examples/assets'), rootDir: ROOT };

test('words() counts tokens, not markdown symbols', () => {
  assert.equal(words('## Is this a PS5 SSD?'), 5);
  assert.equal(words('[View it](https://x.y) - now'), 3); // link URLs are not words
});

test('pass example has zero commerce errors', () => {
  const { fm, body } = ex('pass-example.md');
  assert.deepEqual(checkPostSource(fm, body, ctx), []);
});

test('fail example is rejected for each planted defect', () => {
  const { fm, body } = ex('fail-example.md');
  const errs = checkPostSource(fm, body, ctx).join('\n');
  for (const needle of ['title length', 'explicit offset', '/dp/ASIN', 'cover image', '< 700', 'question-shaped', 'internal links', 'I tested', 'prices/availability', 'differs from product.url', 'evidence file not found'])
    assert.ok(errs.includes(needle), `missing rejection: ${needle}`);
});

test('duplicate product URL within 30 days is rejected; older than 30 days is allowed', () => {
  const { fm, body } = ex('pass-example.md');
  const recent = checkPostSource(fm, body, { ...ctx, log: [{ slug: 'a', productUrl: fm.product.url, publishedAt: new Date(Date.now() - 5 * 864e5).toISOString() }] });
  assert.ok(recent.some((e) => e.startsWith('duplicate product URL')));
  const old = checkPostSource(fm, body, { ...ctx, log: [{ slug: 'a', productUrl: fm.product.url, publishedAt: new Date(Date.now() - 40 * 864e5).toISOString() }] });
  assert.ok(!old.some((e) => e.startsWith('duplicate')));
});

test('non-allowlisted host and non-product Amazon URLs fail', () => {
  const { fm, body } = ex('pass-example.md');
  const a = checkPostSource({ ...fm, product: { ...fm.product, url: 'https://www.amaz0n.com/dp/B0EXAMPLE0', landingHost: 'www.amaz0n.com' } }, body.replaceAll('https://www.amazon.com/dp/B0EXAMPLE0', 'https://www.amaz0n.com/dp/B0EXAMPLE0'), ctx);
  assert.ok(a.some((e) => e.includes('not on amazon allowlist')));
});

test('with no Associates tag configured, links stay plain and disclosure says so', () => {
  assert.equal(site.amazonTag, '');
  assert.equal(productHref('https://www.amazon.com/dp/B0EXAMPLE0'), 'https://www.amazon.com/dp/B0EXAMPLE0');
  assert.equal(disclosureFor('amazon'), NO_TAG_STATEMENT);
  assert.notEqual(disclosureFor('amazon'), AMAZON_STATEMENT);
});
