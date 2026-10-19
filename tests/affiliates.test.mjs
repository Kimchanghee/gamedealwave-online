import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkAffiliates } from '../scripts/affiliate-check.mjs';

const real = JSON.parse(readFileSync(new URL('../src/data/affiliates.json', import.meta.url), 'utf8'));
const first = Object.keys(real.programs)[0];
const host = real.programs[first].hosts[0];

function fixture(mut, post) {
  const d = mkdtempSync(join(tmpdir(), 'aff-'));
  mkdirSync(join(d, 'src/data'), { recursive: true });
  mkdirSync(join(d, 'src/content/posts'), { recursive: true });
  const c = structuredClone(real);
  mut?.(c);
  writeFileSync(join(d, 'src/data/affiliates.json'), JSON.stringify(c));
  if (post) writeFileSync(join(d, 'src/content/posts/x.md'), post);
  return d;
}
const enable = (c) => { c.programs[first].enabled = true; c.programs[first].id = 'real-id-1'; };
const post = (url, extra = '') => `---\ncategory: x\nproduct:\n  provider: ${first}\n  url: "${url}"\n---\n${extra}\n`;

test('shipped config keeps every program disabled with no id', () => {
  for (const p of Object.values(real.programs)) { assert.equal(p.enabled, false); assert.equal(p.id, ''); }
  assert.deepEqual(checkAffiliates(fixture()), []);
});
test('enabled program without an id fails', () => {
  assert.ok(checkAffiliates(fixture((c) => { c.programs[first].enabled = true; })).some((m) => m.includes('without a real id')));
});
test('post using a disabled program fails', () => {
  assert.ok(checkAffiliates(fixture(null, post(`https://${host}/p`))).some((m) => m.includes('disabled')));
});
test('placeholder link fails even when the program is enabled', () => {
  assert.ok(checkAffiliates(fixture(enable, post(`https://${host}/p`, 'AFFILIATE_URL_PENDING'))).some((m) => m.includes('placeholder')));
});
test('non-allowlisted host fails', () => {
  assert.ok(checkAffiliates(fixture(enable, post('https://evil.example/p'))).some((m) => m.includes('not allowlisted')));
});
test('enabled program with real id and exact allowlisted url passes', () => {
  assert.deepEqual(checkAffiliates(fixture(enable, post(`https://${host}/p`))), []);
});
