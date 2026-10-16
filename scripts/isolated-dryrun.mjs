import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, lstatSync, mkdirSync, readlinkSync, symlinkSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
export function fingerprint(base) {
  const h = createHash('sha256');
  function walk(p, rel) {
    if (!existsSync(p)) { h.update(`missing:${rel}\n`); return; }
    const st = lstatSync(p);
    if (st.isSymbolicLink()) throw new Error(`Protected tree contains symlink: ${rel}`);
    if (st.isDirectory()) { h.update(`dir:${rel}\n`); for (const n of readdirSync(p).sort()) walk(join(p,n), `${rel}/${n}`); }
    else { h.update(`file:${rel}\0`); h.update(readFileSync(p)); }
  }
  for (const n of ['src','public','dist','.astro','ops/publish-log.jsonl','node_modules/.astro']) walk(join(base,n), n);
  return h.digest('hex');
}
function run(cwd, args, env, expected = 0) {
  const r = spawnSync(process.execPath, args, { cwd, env, encoding:'utf8', timeout:180000, maxBuffer:20*1024*1024 });
  if (r.error || r.status !== expected) throw new Error(`Local command ${args[0]} exited ${r.status}: ${r.error?.message ?? ''}\n${r.stdout}\n${r.stderr}`);
  return r.stdout;
}
function copyDependencies(source, destination) {
  function copy(p, q) {
    const st=lstatSync(p);
    if(st.isSymbolicLink()) {
      const target=resolve(dirname(p),readlinkSync(p));
      const rel=relative(source,target);
      if(rel.startsWith('..') || /^[A-Za-z]:/.test(rel)) throw new Error('Dependency link escapes source tree');
      symlinkSync(join(destination,rel),q,'junction');
    } else if(st.isDirectory()) {
      mkdirSync(q,{recursive:true});
      for(const n of readdirSync(p)) if(!['.astro','.cache'].includes(n)) copy(join(p,n),join(q,n));
    } else cpSync(p,q);
  }
  copy(source,destination);
}
export function dryRun({ fixture, slug, fault } = {}) {
  if (!fixture && !slug) throw new Error('Fail closed: provide --fixture explicitly or --slug for an existing real post');
  if (fixture && slug) throw new Error('Choose fixture OR existing post');
  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Invalid slug');
  const before = fingerprint(root);
  const temp = mkdtempSync(join(tmpdir(), 'isolated-commerce-dryrun-'));
  // Do not inherit credentials, PUBLIC_* monetization values, NODE_OPTIONS or package-manager hooks.
  const env = Object.fromEntries(['PATH','Path','SystemRoot','WINDIR','TEMP','TMP','HOME','USERPROFILE','COMSPEC','PATHEXT'].filter(k=>process.env[k]).map(k=>[k,process.env[k]]));
  env.ASTRO_TELEMETRY_DISABLED='1'; env.DO_NOT_TRACK='1'; env.CI='1';
  const results=[];
  try {
    for (const name of ['src','public','scripts','ops','astro.config.mjs','package.json','tsconfig.json','node_modules']) {
      const from=join(root,name);
      if (name === 'node_modules') { copyDependencies(from, join(temp,name)); continue; }
      if (existsSync(from)) cpSync(from,join(temp,name),{recursive:true,dereference:true,filter:p=>!/(?:^|[\\/])(?:\.env[^\\/]*|\.astro|\.cache)(?:[\\/]|$)/.test(p)});
    }
    // No deploy configuration, git metadata, secrets or real output tree is copied.
    if (fault === 'after-copy') throw new Error('Injected failure after-copy');
    if (fixture) {
      cpSync(join(temp,'src/content/posts/_examples/pass-example.md'),join(temp,'src/content/posts/qa-staged-example.md'));
      cpSync(join(temp,'src/content/posts/_examples/assets/example-cover.svg'),join(temp,'public/example-cover.svg'));
      slug=readFileSync(join(temp,'src/content/posts/qa-staged-example.md'),'utf8').match(/^slug:\s*(\S+)/m)[1];
    } else {
      const dir=join(temp,'src/content/posts');
      const posts=readdirSync(dir).filter(f=>f.endsWith('.md')&&!f.startsWith('_'));
      const post=posts.map(f=>readFileSync(join(dir,f),'utf8')).find(t=>t.match(/^slug:\s*(\S+)/m)?.[1]===slug);
      if (!post || /EXAMPLE ONLY|B0EXAMPLE|qa-staged/i.test(post)) throw new Error('Missing real post or fixture not explicitly authorized');
      const log=join(temp,'ops/publish-log.jsonl');
      if (existsSync(log) && readFileSync(log,'utf8').split(/\r?\n/).filter(Boolean).some(l=>JSON.parse(l).slug===slug)) throw new Error('Already published slug');
    }
    run(temp,['scripts/prebuild.mjs'],env);
    run(temp,['node_modules/astro/astro.js','build'],env);
    if (fault === 'after-build') throw new Error('Injected failure after-build');
    run(temp,['scripts/gate.mjs','--slug',slug],env);
    const verified=JSON.parse(run(temp,['scripts/verify-post.mjs','--slug',slug,'--from','dist'],env));
    if (!verified.ok || /[?&]tag=/.test(verified.href)) throw new Error('Local verification or hard-disabled affiliate policy failed');
    results.push('production renderer + gate + dist verifier: PASS (affiliate OFF)');
    if (fixture) {
      // Existing negative fixture is rejected by the same commerce engine.
      run(temp,['scripts/gate-examples.mjs'],env);
      const staged=join(temp,'src/content/posts/qa-staged-example.md');
      writeFileSync(staged,readFileSync(staged,'utf8')+'\nI tested this product.\n');
      run(temp,['scripts/gate.mjs','--slug',slug],env,1);
      results.push('existing negative fixture and staged source rejection: PASS');
      // Negative verification after an isolated dist corruption.
      writeFileSync(join(temp,'dist/picks',slug,'index.html'),'<html>invalid local fixture</html>');
      run(temp,['scripts/verify-post.mjs','--slug',slug,'--from','dist'],env,1);
      results.push('corrupted output rejected: PASS');
    }
    return { localOnly:true, fixture:!!fixture, results, protectedHash:before, deployed:false, productionReady:false };
  } finally {
    try { rmSync(temp,{recursive:true,force:true,maxRetries:5,retryDelay:100}); }
    finally { if (fingerprint(root)!==before) throw new Error('Protected source/dist/cache/log changed during rehearsal'); }
  }
}
if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const args=process.argv.slice(2);
    if (args.some((a,i)=>!['--fixture','--slug','--fault'].includes(a)&&!['--slug','--fault'].includes(args[i-1]))) throw new Error('Unknown argument');
    const value=k=>args.includes(k)?args[args.indexOf(k)+1]:undefined;
    console.log(JSON.stringify(dryRun({fixture:args.includes('--fixture'),slug:value('--slug'),fault:value('--fault')}),null,2));
  } catch(e) { console.error(e.message); process.exitCode=1; }
}
