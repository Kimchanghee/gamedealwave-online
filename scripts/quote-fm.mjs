// Authoring helper: double-quote plain frontmatter string values that contain ": " so YAML parses.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
for (const dir of ['src/content/guides', 'src/content/docs', 'src/content/posts', 'src/content/posts/_examples']) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.md')) continue;
    const p = `${dir}/${f}`;
    const raw = readFileSync(p, 'utf8');
    const parts = raw.split(/^---\s*$/m);
    if (parts.length < 3) continue;
    parts[1] = parts[1].replace(/^(\s*(?:- )?[A-Za-z_]+): (?!["'\[{|>])(.+?)\s*$/gm, (m, k, v) => (v.includes(': ') || v.includes(' #') ? `${k}: "${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` : m));
    // bare list items whose prose contains ": " (text before the colon has a space, so it is not a key)
    parts[1] = parts[1].replace(/^(\s*- )(?!["'])([^:\n]*\s[^:\n]*: .*?)\s*$/gm, (m, k, v) => `${k}"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
    writeFileSync(p, parts.join('---'));
  }
}
