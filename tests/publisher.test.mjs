import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dryRun, fingerprint, root } from '../scripts/isolated-dryrun.mjs';

test('default fails closed without changing source/dist/cache/log',()=>{
  const before=fingerprint(root);
  assert.throws(()=>dryRun(),/Fail closed/);
  for (const script of ['publish.ps1','qa-staged.ps1']) {
    const p=spawnSync('pwsh',['-NoProfile','-File',`scripts/${script}`],{cwd:root,encoding:'utf8'});
    assert.equal(p.status,1);
  }
  assert.equal(fingerprint(root),before);
});
test('non-fixture path refuses fixture slug and preserves all protected bytes',()=>{
  const before=fingerprint(root);
  assert.throws(()=>dryRun({slug:'example-2tb-gen4-ps5-ssd'}),/Missing real post/);
  assert.equal(fingerprint(root),before);
});
test('copy-stage failure preserves protected bytes',()=>{
  const before=fingerprint(root);
  assert.throws(()=>dryRun({fixture:true,fault:'after-copy'}),/Injected failure/);
  assert.equal(fingerprint(root),before);
});
test('build-stage failure preserves protected bytes',()=>{
  const before=fingerprint(root);
  assert.throws(()=>dryRun({fixture:true,fault:'after-build'}),/Injected failure/);
  assert.equal(fingerprint(root),before);
});
test('explicit isolated fixture runs production renderer, positive and negative gates',()=>{
  const before=fingerprint(root);
  const r=dryRun({fixture:true});
  assert.equal(r.deployed,false);
  assert.equal(r.productionReady,false);
  assert.equal(r.results.length,3);
  assert.equal(fingerprint(root),before);
});
