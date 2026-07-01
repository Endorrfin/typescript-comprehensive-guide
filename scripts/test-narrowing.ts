/*
 * test-narrowing.ts — golden tests for the M2 control-flow-narrowing engine (src/lib/narrowing.ts).
 * Auto-discovered by scripts/run-tests.ts (`npm test`) and run in CI before build. Verifies the
 * mechanics M2 teaches: typeof / equality (== null) / in / instanceof / discriminant guards, the
 * typeof-null gotcha, truthiness keeping a broad primitive in both branches, type predicates,
 * assertion functions, and discriminated-union exhaustiveness bottoming out in `never`.
 */
import {
  applyGuard, renderSet, run, snippetById,
} from '../src/lib/narrowing';
import type { Member } from '../src/lib/narrowing';

let failures = 0;
let checks = 0;
function assert(cond: boolean, msg: string): void {
  checks++;
  if (!cond) {
    failures++;
    console.error('  ✖ ' + msg);
  }
}

const S = (m: Member[]): string => renderSet(m);

const str: Member = { id: 'string', render: 'string', typeof: 'string', truthy: 'maybe' };
const num: Member = { id: 'number', render: 'number', typeof: 'number', truthy: 'maybe' };
const undef: Member = { id: 'undefined', render: 'undefined', typeof: 'undefined', truthy: 'never', nullish: 'undefined' };
const nul: Member = { id: 'null', render: 'null', typeof: 'object', truthy: 'never', nullish: 'null' };
const Fish: Member = { id: 'Fish', render: 'Fish', typeof: 'object', props: ['name', 'swim'], ctor: 'Fish', guard: 'Fish' };
const Bird: Member = { id: 'Bird', render: 'Bird', typeof: 'object', props: ['name', 'fly'], ctor: 'Bird', guard: 'Bird' };

// ── renderSet: empty union is never ──────────────────────────────────────────────
assert(S([str, num]) === 'string | number', 'renderSet joins with |');
assert(S([]) === 'never', 'empty member set renders as never');

// ── typeof guard partitions, and typeof null === "object" gotcha ─────────────────
{
  const { pass, fail } = applyGuard([str, num, undef], { g: 'typeof', op: '===', value: 'string' });
  assert(S(pass) === 'string', 'typeof === string → string');
  assert(S(fail) === 'number | undefined', 'typeof === string false branch → number | undefined');
}
{
  // string[] modelled as an object-typeof member; null ALSO has typeof "object"
  const arr: Member = { id: 'string[]', render: 'string[]', typeof: 'object' };
  const { pass } = applyGuard([arr, nul], { g: 'typeof', op: '===', value: 'object' });
  assert(S(pass) === 'string[] | null', 'typeof === object keeps null too (the classic gotcha)');
}

// ── equality: == null / != null hit BOTH null and undefined ──────────────────────
{
  const both = applyGuard([str, nul, undef], { g: 'eq', op: '!=', value: 'null' });
  assert(S(both.pass) === 'string', '!= null removes null AND undefined → string');
  assert(S(both.fail) === 'null | undefined', '!= null false branch → null | undefined');
  const strict = applyGuard([str, nul, undef], { g: 'eq', op: '===', value: 'null' });
  assert(S(strict.pass) === 'null', '=== null is strict: only null');
}

// ── truthiness: a broad primitive stays in BOTH branches (the 0 / "" gotcha) ──────
{
  const { pass, fail } = applyGuard([num, undef], { g: 'truthy' });
  assert(S(pass) === 'number', 'if (x) truthy branch drops undefined → number');
  assert(S(fail) === 'number | undefined', 'if (x) falsy branch keeps number (0 is falsy) and undefined');
}

// ── in / instanceof / predicate ──────────────────────────────────────────────────
assert(S(applyGuard([Fish, Bird], { g: 'in', prop: 'swim' }).pass) === 'Fish', "'swim' in pet → Fish");
assert(S(applyGuard([Fish, Bird], { g: 'in', prop: 'swim' }).fail) === 'Bird', "'swim' in pet else → Bird");
assert(S(applyGuard([Fish, Bird], { g: 'instanceof', ctor: 'Fish' }).pass) === 'Fish', 'instanceof Fish → Fish');
assert(S(applyGuard([Fish, Bird], { g: 'predicate', guard: 'Fish' }).pass) === 'Fish', 'isFish(pet) → Fish');

// ── run(): typeof snippet narrows down each branch ───────────────────────────────
{
  const lines = run(snippetById('typeof')!);
  const byCode = (frag: string) => lines.find((l) => l.code.includes(frag))!;
  assert(byCode("typeof x === 'string'").narrowed === 'string', 'inside typeof===string branch: x is string');
  assert(byCode("typeof x === 'number'").narrowed === 'number', 'inside else-if number branch: x is number');
  assert(byCode('} else {').narrowed === 'undefined', 'final else: x is undefined');
}

// ── run(): != null snippet ───────────────────────────────────────────────────────
{
  const lines = run(snippetById('equality-nullish')!);
  assert(lines.find((l) => l.code.includes('if (s != null)'))!.narrowed === 'string', 's != null → string');
}

// ── run(): assertion function narrows for the rest of scope ───────────────────────
{
  const lines = run(snippetById('assertion')!);
  const useLine = lines.find((l) => l.code.includes('val.toUpperCase'))!;
  assert(useLine.narrowed === 'string', 'after assertString(val), val is string for the rest of scope');
}

// ── run(): discriminated union → each case narrows, default is never (exhaustive) ─
{
  const lines = run(snippetById('discriminated')!);
  assert(lines.find((l) => l.code.includes("case 'circle'"))!.narrowed === 'Circle', 'case circle → Circle');
  assert(lines.find((l) => l.code.includes("case 'square'"))!.narrowed === 'Square', 'case square → Square');
  assert(lines.find((l) => l.code.includes("case 'triangle'"))!.narrowed === 'Triangle', 'case triangle → Triangle');
  const def = lines.find((l) => l.code.includes('default:'))!;
  assert(def.narrowed === 'never' && def.isNever, 'default arm: s is never (all members handled)');
  const never = lines.find((l) => l.code.includes('_exhaustive'))!;
  assert(never.ok, 'const _exhaustive: never = s is sound when exhaustive');
}

// ── run(): missing a case → default is Triangle, the never-assignment is unsound ──
{
  const lines = run(snippetById('discriminated-missing')!);
  const def = lines.find((l) => l.code.includes('default:'))!;
  assert(def.narrowed === 'Triangle' && !def.isNever, 'missing case: default arm still holds Triangle');
  const never = lines.find((l) => l.code.includes('_exhaustive'))!;
  assert(!never.ok, 'const _exhaustive: never = s FAILS — Triangle is not assignable to never');
}

// ── every snippet runs to completion without throwing ────────────────────────────
for (const s of ['typeof', 'equality-nullish', 'in-operator', 'instanceof', 'predicate', 'assertion', 'discriminated', 'discriminated-missing']) {
  const snip = snippetById(s);
  assert(!!snip, `snippet ${s} exists`);
  const lines = run(snip!);
  assert(lines.length === snip!.program.length, `${s}: one rendered line per program node`);
}

console.log(`\n— narrowing engine — ${checks} checks, ${failures} failed.`);
process.exit(failures > 0 ? 1 : 0);
