// scripts/check-data.ts — data-integrity gate (standard §3.8 / §4.6). Run with: tsx scripts/check-data.ts
// Validates the SSOT before every deploy. Exits non-zero on any error.
//
// Assumes: src/data/concepts.ts exports `sections: Section[]` and `modules: Module[]`,
//          src/lib/registry.tsx declares sim/figure keys as string literals.
// Adapt the COUNTS at the bottom and any guide-specific checks.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { sections, modules } from '../src/data/concepts';
import type { Localized, Module, Section } from '../src/data/types';

const here = dirname(fileURLToPath(import.meta.url));
const errors: string[] = [];
const err = (cond: unknown, msg: string) => { if (!cond) errors.push(msg); };

// --- helpers ---------------------------------------------------------------
const isLoc = (v: unknown): v is Localized =>
  !!v && typeof v === 'object' && 'en' in (v as object) && 'uk' in (v as object);
const locOk = (v: Localized | undefined, where: string) => {
  if (!isLoc(v)) { errors.push(`Localized expected at ${where}`); return; }
  err(v.en?.trim(), `empty EN at ${where}`);
  err(v.uk?.trim(), `empty UK at ${where}`);
};

// --- registry keys (parsed as text to avoid importing React) ---------------
// CHANGED (S1): read the whole `export const <record> = { … }` body (the template's split-on-word
// parser misses keys when the record name also appears in comments or import paths).
const registrySrc = readFileSync(resolve(here, '../src/lib/registry.tsx'), 'utf8');
const keysIn = (record: 'sims' | 'figures') => {
  const m = registrySrc.match(new RegExp(`export const ${record}\\b[^=]*=\\s*\\{([\\s\\S]*?)\\n\\}`));
  const block = m ? m[1] : '';
  return new Set([...block.matchAll(/['"]([a-z0-9-]+)['"]\s*:/g)].map((mm) => mm[1]));
};
const simKeys = keysIn('sims');
const figKeys = keysIn('figures');

// --- structural checks -----------------------------------------------------
const sectionIds = new Set<string>();
for (const s of sections as Section[]) {
  err(!sectionIds.has(s.id), `duplicate section id ${s.id}`); sectionIds.add(s.id);
  locOk(s.title, `section ${s.id}.title`);
}

const moduleIds = new Set<string>();
const nums = new Set<number>();
for (const m of modules as Module[]) {
  err(!moduleIds.has(m.id), `duplicate module id ${m.id}`); moduleIds.add(m.id);
  err(!nums.has(m.num), `duplicate module num ${m.num} (${m.id})`); nums.add(m.num);
  err(sectionIds.has(m.section), `module ${m.id} -> unknown section ${m.section}`);
  locOk(m.title, `${m.id}.title`); locOk(m.tagline, `${m.id}.tagline`); locOk(m.mentalModel, `${m.id}.mentalModel`);
  for (const sa of m.seeAlso) err(sa !== m.id, `${m.id} seeAlso self-reference`);
  for (const src of m.sources) err(/^https?:\/\//.test(src.url), `${m.id} bad source url: ${src.url}`);

  // order unique within section
  const sib = (modules as Module[]).filter((x) => x.section === m.section);
  err(sib.filter((x) => x.order === m.order).length === 1, `${m.id} duplicate order ${m.order} in ${m.section}`);

  for (const t of m.topics) {
    locOk(t.title, `${m.id}/${t.id}.title`);
    for (const [i, b] of t.blocks.entries()) {
      const at = `${m.id}/${t.id}#${i}`;
      if (b.kind === 'prose') locOk(b.md, `${at} prose`);
      if (b.kind === 'figure') err(figKeys.has(b.fig), `${at} unknown figure key '${b.fig}'`);
      if (b.kind === 'sim') err(simKeys.has(b.sim), `${at} unknown sim key '${b.sim}'`);
      if (b.kind === 'table') {
        for (const row of b.rows) err(row.length === b.head.length, `${at} table row width != head`);
      }
      if (b.kind === 'compare') for (const r of b.rows) err(r.length === 3, `${at} compare row not a 3-tuple`);
    }
  }
}

// seeAlso targets exist
for (const m of modules as Module[]) for (const sa of m.seeAlso) err(moduleIds.has(sa), `${m.id} seeAlso -> unknown ${sa}`);

// --- COUNTS (adapt to the guide) ------------------------------------------
const EXPECTED_SECTIONS = 4; // CHANGED (S1): curriculum locked — 4 sections
const EXPECTED_MODULES = 13;  // CHANGED (S1): 13 modules (M5 authored; the rest navigable stubs)
err(sections.length === EXPECTED_SECTIONS, `expected ${EXPECTED_SECTIONS} sections, got ${sections.length}`);
err(modules.length === EXPECTED_MODULES, `expected ${EXPECTED_MODULES} modules, got ${modules.length}`);

// --- report ----------------------------------------------------------------
if (errors.length) {
  console.error(`✗ check:data — ${errors.length} problem(s):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`✓ check:data — ${sections.length} sections, ${modules.length} modules, all bilingual, registry + links resolve.`);
