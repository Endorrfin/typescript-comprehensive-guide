/*
 * test-resolution.ts — golden tests for the M12 module-resolution tracer (src/lib/resolution.ts).
 * Auto-discovered by scripts/run-tests.ts (`npm test`) and run in CI before build. It runs the REAL
 * resolver over the fixed virtual project and asserts both the final resolution AND load-bearing
 * ordering facts. Outcomes were cross-checked against the TypeScript Handbook "Modules — Reference":
 * extension substitution order, ESM vs bundler extension rules, "exports" condition/key order and
 * subpath blocking, the types-first node_modules walk with @types, and the local "#imports" remap.
 */
import { MODES, resolveScenario, SCENARIOS } from '../src/lib/resolution';
import type { Probe, RuleKind } from '../src/lib/resolution';

let failures = 0;
let checks = 0;
function assert(cond: boolean, msg: string): void {
  checks++;
  if (!cond) {
    failures++;
    console.error('  ✖ ' + msg);
  }
}
const trace = (id: string) => resolveScenario(id)!;
const idxOf = (probes: Probe[], path: string) => probes.findIndex((p) => p.path === path);
const has = (probes: Probe[], rule: RuleKind, hit?: boolean) => probes.some((p) => p.rule === rule && (hit === undefined || p.hit === hit));

// ── final resolutions (the exact file TypeScript would read) ─────────────────────────────
assert(trace('rel-node10').resolved === '/proj/src/util.ts', 'node10 "./util" → util.ts via extension substitution');
assert(trace('rel-esm-js').resolved === '/proj/src/util.ts', 'node16 ESM "./util.js" → util.ts (wrote .js, read .ts)');
assert(trace('rel-esm-noext').resolved === undefined, 'node16 ESM "./util" fails — extensionless not allowed');
assert(trace('rel-bundler-noext').resolved === '/proj/src/util.ts', 'bundler "./util" → util.ts (no extension required)');
assert(trace('dir-node10').resolved === '/proj/src/shapes/index.ts', 'node10 "./shapes" → shapes/index.ts (directory module)');
assert(trace('bare-exports').resolved === '/proj/node_modules/pkg/dist/index.d.ts', 'node16 "pkg" → dist/index.d.ts via "exports"');
assert(trace('bare-blocked').resolved === undefined, 'node16 "pkg/secret" is blocked by "exports"');
assert(trace('bare-attypes').resolved === '/proj/node_modules/@types/lodash/index.d.ts', 'node10 "lodash" → @types/lodash (types-first)');
assert(trace('imports-remap').resolved === '/proj/src/utils.ts', 'node16 "#utils" → src/utils.ts (outDir → rootDir remap)');

// ── extension substitution ALWAYS tries the TS input before the JS runtime file ──────────
{
  const p = trace('rel-node10').probes;
  assert(p[0].path === '/proj/src/util.ts' && p[0].hit, 'the FIRST candidate tried is util.ts, not util.js');
}
{
  const p = trace('dir-node10').probes;
  assert(idxOf(p, '/proj/src/shapes.ts') !== -1 && idxOf(p, '/proj/src/shapes.ts') < idxOf(p, '/proj/src/shapes.js'), 'shapes.ts is tried before shapes.js');
  assert(has(p, 'index', true), 'the directory module resolves through an index.* candidate');
}

// ── the ESM-vs-bundler contrast (same specifier, opposite outcome) ───────────────────────
assert(has(trace('rel-esm-noext').probes, 'esm-needs-ext'), 'ESM reports that the extensionless import needs ".js"');
assert(!has(trace('rel-bundler-noext').probes, 'esm-needs-ext'), 'bundler never raises the extension requirement');

// ── "exports": conditions match in key order (types wins over import here) ───────────────
{
  const p = trace('bare-exports').probes;
  const conds = p.filter((x) => x.rule === 'condition');
  assert(conds.length >= 1 && conds[0].path === '"types"' && conds[0].hit, 'the first condition tested is "types", and it matches');
  assert(has(p, 'exports', true), 'resolution consults the package\'s "exports" field');
}

// ── "exports" blocks any unlisted subpath (encapsulation) ────────────────────────────────
assert(has(trace('bare-blocked').probes, 'blocked'), '"pkg/secret" is explicitly reported as blocked by "exports"');

// ── types-first walk: the real package (JS-only) loses to @types in the types pass ───────
{
  const p = trace('bare-attypes').probes;
  assert(has(p, 'nm', true), 'the walk enters node_modules/lodash');
  const at = p.find((x) => x.rule === 'at-types' && x.hit);
  assert(!!at && at.path === '/proj/node_modules/@types/lodash/index.d.ts', '@types/lodash provides the declarations');
  // no .js file was ever accepted as the result
  assert(!p.some((x) => x.hit && x.path.endsWith('.js')), 'a bare .js file is never accepted in the types pass');
}

// ── local "#imports": the output target is remapped to the input source ──────────────────
{
  const p = trace('imports-remap').probes;
  assert(has(p, 'imports', true), 'resolution consults the package\'s "imports" field');
  const remap = p.find((x) => x.rule === 'remap' && x.hit);
  assert(!!remap && remap.path === '/proj/src/utils.ts', 'the ./dist/*.d.ts target is remapped to ./src/*.ts');
}

// ── structural invariants over every scenario ────────────────────────────────────────────
for (const s of SCENARIOS) {
  const t = resolveScenario(s.id)!;
  assert(!!t && t.scenario.id === s.id, `${s.id}: resolves a trace`);
  assert(t.probes.length >= 1, `${s.id}: records at least one probe`);
  assert(t.resolved === undefined || /\.(d\.ts|d\.mts|d\.cts|ts|tsx|mts|cts)$/.test(t.resolved), `${s.id}: a resolution is always a TypeScript input file`);
  if (t.resolved) assert(t.probes[t.probes.length - 1].hit, `${s.id}: the final probe is the successful one`);
  assert(s.teaches.trim().length > 0, `${s.id}: carries a teaching hook`);
}

// ── guards ────────────────────────────────────────────────────────────────────────────────
assert(MODES.join(',') === 'node10,node16,bundler', 'the three modern resolution modes');
assert(resolveScenario('nope') === undefined, 'resolveScenario returns undefined for a bad id');

console.log(`\n— module-resolution tracer — ${checks} checks, ${failures} failed.`);
process.exit(failures > 0 ? 1 : 0);
