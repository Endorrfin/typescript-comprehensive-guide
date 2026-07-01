/// <reference types="node" />
/* Guard against a stale committed meta.json. The meta split (S5) generates
   src/data/meta.json from concepts.ts (the content SSOT) via `gen:meta`, wired as
   predev/prebuild. But a typecheck-only path (editor, the CI lint stage) never runs
   those hooks — so this check asserts the committed meta.json still matches
   concepts.ts. It is chained into `npm run typecheck` (hence `verify`) so nav/search
   divergence can't ship. If it fails: run `npm run gen:meta` and commit meta.json.

   Run: tsx scripts/checkMeta.ts  (chained into `npm run typecheck`). */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { sections, modules } from '../src/data/concepts';

const here = dirname(fileURLToPath(import.meta.url));
const meta = JSON.parse(readFileSync(join(here, '..', 'src', 'data', 'meta.json'), 'utf8'));

const errs: string[] = [];
const eq = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

if (!eq(meta.sections, sections)) errs.push('sections drift');
const expectedSigs = modules.filter((m) => m.signature).map((m) => m.id).sort();
if (!eq(meta.signatureSims, expectedSigs)) {
  errs.push(`signatureSims drift: meta=${JSON.stringify(meta.signatureSims)} vs src=${JSON.stringify(expectedSigs)}`);
}
if (meta.modules.length !== modules.length) errs.push(`module count ${meta.modules.length} vs ${modules.length}`);

for (const m of modules) {
  const mm = meta.modules.find((x: { id: string }) => x.id === m.id);
  if (!mm) {
    errs.push(`missing in meta: ${m.id}`);
    continue;
  }
  const fields: [string, unknown, unknown][] = [
    ['num', mm.num, m.num],
    ['section', mm.section, m.section],
    ['order', mm.order, m.order],
    ['level', mm.level, m.level],
    ['signature', mm.signature, !!m.signature],
    ['title', mm.title, m.title],
    ['tagline', mm.tagline, m.tagline],
    ['mentalModel', mm.mentalModel, m.mentalModel],
    ['readMins', mm.readMins, m.readMins],
    ['seeAlso', mm.seeAlso, m.seeAlso],
    ['topics', mm.topics, m.topics.map((t) => ({ id: t.id, title: t.title }))],
    ['authored', mm.authored, m.topics.length > 0],
  ];
  for (const [name, a, b] of fields) if (!eq(a, b)) errs.push(`${m.id}.${name} drift`);
}

if (errs.length) {
  console.error('META-SYNC FAIL (run `npm run gen:meta` and commit meta.json):\n - ' + errs.join('\n - '));
  process.exit(1);
}
console.log(`META-SYNC OK · ${modules.length} modules · ${meta.signatureSims.length} signature sims · sections ${sections.length}`);
