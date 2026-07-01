/*
 * test-inference.ts — golden tests for the M4 generic-inference engine (src/lib/inference.ts).
 * Auto-discovered by scripts/run-tests.ts (`npm test`) and run in CI before build. Verifies the
 * mechanics M4 teaches: candidate collection from inference sites, literal widening, best-common-type
 * (union) when sites disagree, default fallback when there are no candidates, explicit type arguments,
 * and constraint checking.
 */
import {
  arr, assignable, collect, infer, lit, prim, presetById, renderTy, substitute, T, tuple, union, widen,
} from '../src/lib/inference';

let failures = 0;
let checks = 0;
function assert(cond: boolean, msg: string): void {
  checks++;
  if (!cond) {
    failures++;
    console.error('  ✖ ' + msg);
  }
}

/** Run preset `pid` with call `cid` and return the InferResult. */
function run(pid: string, cid: string) {
  const p = presetById(pid)!;
  const c = p.calls.find((x) => x.id === cid)!;
  return infer(p, c);
}

// ── render / union / widen ────────────────────────────────────────────────────────
assert(renderTy(tuple(prim('number'), prim('number'))) === '[number, number]', 'render tuple');
assert(renderTy(union(prim('string'), prim('number'))) === 'string | number', 'render union');
assert(renderTy(widen(lit('hi'))) === 'string', 'widen literal "hi" → string');
assert(renderTy(widen(arr(lit(1)))) === 'number[]', 'widen number literal array');
assert(renderTy(union(prim('number'), prim('number'))) === 'number', 'union dedupes');

// ── collect: candidate extraction from inference sites ────────────────────────────
assert(renderTy(collect(T, prim('string'))[0]) === 'string', 'collect from a bare T site');
assert(renderTy(collect(arr(T), arr(prim('number')))[0]) === 'number', 'collect T from T[] against number[]');
assert(collect(prim('string'), prim('number')).length === 0, 'a concrete position yields no candidate');
{
  const cands = collect(tuple(T, T), tuple(prim('number'), prim('string')));
  assert(cands.length === 2, 'tuple site yields one candidate per element');
}

// ── assignability (for constraint checks) ─────────────────────────────────────────
assert(assignable(prim('string'), prim('string')), 'string <: string');
assert(!assignable(prim('number'), prim('string')), 'number is not <: string');

// ── substitute (return-type rendering) ────────────────────────────────────────────
assert(renderTy(substitute(tuple(T, T), prim('number'))) === '[number, number]', 'substitute T in [T, T]');

// ── identity: literal args WIDEN to primitives ───────────────────────────────────
assert(run('identity', 'str').inferred === 'string', "identity('hello') infers T = string (widened)");
assert(run('identity', 'num').inferred === 'number', 'identity(42) infers T = number');
assert(run('identity', 'str').returnType === 'string', 'identity return type is string');

// ── first: infer T from an array element, incl. a union element ───────────────────
assert(run('first', 'nums').inferred === 'number', 'first([1,2,3]) infers T = number');
assert(run('first', 'mixed').inferred === 'string | number', "first(['a',1]) infers T = string | number");

// ── pair: best-common-type — agreeing sites collapse, disagreeing sites union ─────
assert(run('pair', 'same').inferred === 'number', 'pair(1, 2): both sites agree → number');
{
  const r = run('pair', 'diff');
  assert(r.inferred === 'number | string' || r.inferred === 'string | number', "pair(1,'x'): sites disagree → union");
  assert(r.sites.length === 2, 'pair reports two inference sites');
  assert(r.returnType === '[number | string, number | string]' || r.returnType === '[string | number, string | number]', 'return type substitutes the union into [T, T]');
}

// ── make<T = string>: default fallback when no candidates; explicit overrides ──────
{
  const none = run('make', 'none');
  assert(none.usedDefault && none.inferred === 'string', 'make() with no args falls back to the default string');
  assert(none.returnType === 'Box<string>', 'make() return type is Box<string>');
  const ex = run('make', 'explicit');
  assert(ex.explicit && ex.inferred === 'number', 'make<number>() uses the explicit type argument');
  assert(ex.returnType === 'Box<number>', 'explicit return type is Box<number>');
}

// ── label<T extends string>: constraint pass / fail ──────────────────────────────
{
  const ok = run('label', 'ok');
  assert(ok.inferred === 'string' && ok.constraintOk, 'label(name:string): T = string satisfies T extends string');
  const bad = run('label', 'bad');
  assert(bad.inferred === 'number' && !bad.constraintOk, 'label(count:number): number violates T extends string');
}

// ── every preset/call runs without throwing ──────────────────────────────────────
for (const p of ['identity', 'first', 'pair', 'make', 'label']) {
  const preset = presetById(p)!;
  for (const c of preset.calls) {
    const r = infer(preset, c);
    assert(typeof r.inferred === 'string' && r.inferred.length > 0, `${p}/${c.id} produces an inferred type`);
  }
}

console.log(`\n— inference engine — ${checks} checks, ${failures} failed.`);
process.exit(failures > 0 ? 1 : 0);
