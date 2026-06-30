/*
 * test-typeeval.ts — golden tests for the M5 conditional-type evaluator (src/lib/typeEval.ts).
 * Auto-discovered by scripts/run-tests.ts (`npm test`) and run in CI before build. Verifies the
 * mechanics M5 teaches: literal widening + assignability, distribution over unions (and the
 * non-distributive tuple form), `infer` extraction, and the distribute-over-`never` edge case.
 */
import {
  arr, assignable, evaluate, fn, INPUTS, lit, NEVER, presetById, prim, promise, renderTy, union,
} from '../src/lib/typeEval';

let failures = 0;
let checks = 0;
function assert(cond: boolean, msg: string): void {
  checks++;
  if (!cond) {
    failures++;
    console.error('  ✖ ' + msg);
  }
}

/** Evaluate preset `id` against input `ty` and return the rendered result type. */
function run(id: string, ty: Parameters<typeof evaluate>[1]): string {
  const p = presetById(id);
  if (!p) throw new Error(`unknown preset ${id}`);
  return renderTy(evaluate(p, ty).result);
}

const strNum = union(prim('string'), prim('number'));

// ── renderer / union normalization ───────────────────────────────────────────────
assert(renderTy(prim('string')) === 'string', 'render prim');
assert(renderTy(lit('red')) === '"red"', 'render string literal in quotes');
assert(renderTy(arr(strNum)) === '(string | number)[]', 'render parenthesizes a union element');
assert(renderTy(union(prim('string'), prim('string'))) === 'string', 'union dedupes structurally');
assert(renderTy(union(prim('string'), NEVER)) === 'string', 'union drops never (identity of |)');
assert(renderTy(union()) === 'never', 'empty union is never');

// ── assignability ─────────────────────────────────────────────────────────────────
assert(assignable(lit('red'), prim('string')), 'literal "red" widens to string');
assert(!assignable(prim('string'), prim('number')), 'string is not assignable to number');
assert(assignable(prim('never'), prim('number')), 'never is assignable to everything');
assert(assignable(prim('number'), prim('unknown')), 'everything is assignable to unknown');
assert(assignable(strNum, prim('unknown')), 'a union is assignable to unknown');
assert(!assignable(strNum, prim('string')), 'string | number is NOT assignable to string');

// ── distribution: ToArray distributes, ToArrayND does not ──────────────────────────
assert(run('to-array', strNum) === 'string[] | number[]', 'ToArray distributes: string[] | number[]');
assert(run('to-array-nondist', strNum) === '(string | number)[]', '[T] extends [U] does NOT distribute');

// ── filtering a union: NonNull drops null & undefined ──────────────────────────────
assert(
  run('non-null', union(prim('string'), prim('null'), prim('undefined'))) === 'string',
  'NonNull<string | null | undefined> = string',
);

// ── infer: array element, promise value, function return ───────────────────────────
assert(run('element-type', arr(prim('number'))) === 'number', 'ElementType<number[]> = number');
assert(run('element-type', prim('string')) === 'string', 'ElementType<string> = string (false branch)');
assert(run('awaited', promise(prim('boolean'))) === 'boolean', 'Awaited1<Promise<boolean>> = boolean');
assert(run('awaited', prim('number')) === 'number', 'Awaited1<number> = number (false branch)');
assert(run('return-type', fn(prim('string'))) === 'string', 'ReturnTypeOf<() => string> = string');

// ── distribute over never ⇒ never (empty union, zero steps) ─────────────────────────
{
  const p = presetById('to-array')!;
  const res = evaluate(p, NEVER);
  assert(res.steps.length === 0 && renderTy(res.result) === 'never', 'ToArray<never> = never (0 steps)');
}

// ── step bookkeeping: one step per distributed member, branch flags correct ─────────
{
  const p = presetById('element-type')!;
  const res = evaluate(p, union(arr(prim('string')), prim('number')));
  assert(res.steps.length === 2, 'two union members → two steps');
  assert(res.steps[0].matched && res.steps[0].branch === 'true', 'string[] matches (infer) → true branch');
  assert(!res.steps[1].matched && res.steps[1].branch === 'false', 'number does not match → false branch');
  assert(renderTy(res.result) === 'string | number', 'ElementType<string[] | number> = string | number');
}

// ── every advertised INPUT evaluates against every PRESET without throwing ──────────
for (const inp of INPUTS) {
  for (const p of ['to-array', 'to-array-nondist', 'non-null', 'element-type', 'awaited', 'return-type']) {
    const out = run(p, inp.ty);
    assert(typeof out === 'string' && out.length > 0, `${p}<${inp.label}> renders a result`);
  }
}

console.log(`\n— type-eval engine — ${checks} checks, ${failures} failed.`);
process.exit(failures > 0 ? 1 : 0);
