/// <reference types="node" />
/* Codegen — derive the lightweight nav/search metadata index (src/data/meta.json)
   from concepts.ts (the content SSOT). The eager shell (TopBar level filter, Sidebar
   nav, Footer counts) + the landing map + global search read meta.json; only the lazy
   ModulePage imports the full module bodies from concepts.ts. This keeps the ~250 KB
   of authored module content OUT of the initial bundle (standard §4.4).

   Run: `npm run gen:meta` (Node 22, via tsx). Also wired as the `predev`/`prebuild`
   hook so dev + production builds never ship stale metadata. Commit meta.json.
   Added S5 — the meta/bundle split that CLAUDE.md §2 deferred until the guide grew. */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { sections, modules } from '../src/data/concepts';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'src', 'data', 'meta.json');

// Slim per-module record: every field the eager shell reads, but NO block bodies.
const meta = {
  sections,
  signatureSims: modules.filter((m) => m.signature).map((m) => m.id).sort(),
  modules: modules.map((m) => ({
    id: m.id,
    num: m.num,
    section: m.section,
    order: m.order,
    level: m.level,
    signature: !!m.signature,
    title: m.title,
    tagline: m.tagline,
    mentalModel: m.mentalModel,
    readMins: m.readMins,
    topics: m.topics.map((t) => ({ id: t.id, title: t.title })),
    seeAlso: m.seeAlso,
    authored: m.topics.length > 0,
  })),
};

writeFileSync(out, JSON.stringify(meta, null, 2) + '\n', 'utf8');
console.log(
  `meta.json written → ${meta.modules.length} modules · ${meta.sections.length} sections · ${meta.signatureSims.length} signature sims`,
);
