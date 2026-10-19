import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { hrefFor, disclosureText, isActive, providerForHost, AMAZON_STATEMENT } from '../src/lib/affiliate-core.ts';
import * as cfgApi from '../src/site.config.ts';

const shipped = JSON.parse(readFileSync(new URL('../src/data/affiliates.json', import.meta.url), 'utf8')).programs;
const clone = () => structuredClone(shipped);
const opts = { amazonOff: 'AMAZON-OFF', generic: 'GENERIC' };
const other = Object.keys(shipped).find((k) => k !== 'amazon');

test('all shipped programs inactive: links unchanged, no Amazon line', () => {
  for (const k of Object.keys(shipped)) {
    assert.equal(isActive(shipped, k), false);
    const url = `https://${shipped[k].hosts[0]}/dp/B000000000?x=1`;
    assert.equal(hrefFor(shipped, url, k), new URL(url).toString());
    assert.notEqual(disclosureText(shipped, k, opts), AMAZON_STATEMENT);
  }
  assert.equal(cfgApi.isAffiliateMode(), false);
});

test('Amazon enabled: tag appended in ?tag= format, Amazon line used', () => {
  const p = clone(); p.amazon.enabled = true; p.amazon.id = 'mytag-20';
  assert.equal(hrefFor(p, 'https://www.amazon.com/dp/B0ABCDEFGH', 'amazon'), 'https://www.amazon.com/dp/B0ABCDEFGH?tag=mytag-20');
  assert.equal(hrefFor(p, 'https://amzn.to/abc', 'amazon'), 'https://amzn.to/abc');
  assert.equal(disclosureText(p, 'amazon', opts), AMAZON_STATEMENT);
});

test('enabled flag without a real id stays inactive', () => {
  const p = clone(); p.amazon.enabled = true; p.amazon.id = '';
  assert.equal(isActive(p, 'amazon'), false);
  assert.equal(hrefFor(p, 'https://www.amazon.com/dp/B0ABCDEFGH', 'amazon'), 'https://www.amazon.com/dp/B0ABCDEFGH');
});

test('non-Amazon program: own disclosure, never the Amazon line; query format appends its param', () => {
  const p = clone(); p[other].enabled = true; p[other].id = 'partner-77'; p[other].linkFormat = { type: 'query', param: 'aff' };
  const d = disclosureText(p, other, opts);
  assert.equal(d, p[other].disclosure);
  assert.ok(!d.includes('Amazon Associate'));
  assert.equal(hrefFor(p, `https://${p[other].hosts[0]}/item`, other), `https://${p[other].hosts[0]}/item?aff=partner-77`);
});

test('issued-link programs keep the issued URL untouched', () => {
  const p = clone(); p[other].enabled = true; p[other].id = 'partner-77'; p[other].linkFormat = { type: 'issued' }; p[other].trackingHosts = ['track.example'];
  assert.equal(hrefFor(p, 'https://track.example/c/123/456', other), 'https://track.example/c/123/456');
  assert.equal(providerForHost(p, 'track.example'), other);
});

test('shipped config uses rel sponsored nofollow on product links', () => {
  assert.equal(cfgApi.productRel(), 'sponsored nofollow noopener');
});
