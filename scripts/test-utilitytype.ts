/*
 * test-utilitytype.ts — golden tests for the M7 utility-type decoder (src/lib/utilityType.ts).
 * Auto-discovered by scripts/run-tests.ts (`npm test`) and run in CI before build. Verifies M7's
 * thesis: each lib.d.ts utility is one of four mechanisms, and the engine expands it to the SAME
 * concrete type the compiler produces. Results were cross-checked against the official Utility Types
 * handbook examples (Exclude/Extract/NonNullable/Parameters/ReturnType/InstanceType/Awaited).
 */
import { expand, UTILITIES, utilityById } from '../src/lib/utilityType';
import type { Mechanism } from '../src/lib/utilityType';

let failures = 0;
let checks = 0;
function assert(cond: boolean, msg: string): void {
  checks++;
  if (!cond) {
    failures++;
    console.error('  ✖ ' + msg);
  }
}
const resultOf = (u: string, e: string): string => expand(u, e)!.result;

// ── mapped: reshape an object, preserving the source's modifiers (homomorphic) ───
assert(resultOf('partial', 'User') === '{ id?: number; name?: string; email?: string }', 'Partial<User> makes every key optional');
assert(resultOf('partial', 'Config') === '{ readonly host?: string; port?: number }', 'Partial<Config> keeps readonly on host AND adds ?');
assert(resultOf('required', 'Props') === '{ a: number; b: string }', 'Required<Props> strips ?');
assert(resultOf('readonly', 'Point') === '{ readonly x: number; readonly y: number }', 'Readonly<Point> adds readonly to all');
assert(resultOf('pick', 'Todo') === '{ title: string; completed: boolean }', 'Pick<Todo, "title" | "completed"> keeps the subset');
assert(resultOf('record', 'roles') === '{ admin: boolean; user: boolean }', 'Record<"admin" | "user", boolean> builds a flag record');
assert(resultOf('omit', 'Todo') === '{ title: string; completed: boolean }', 'Omit<Todo, "description"> drops one key (via Pick + Exclude)');

// ── conditional: distribute over a union, dropping/keeping each member ────────────
assert(resultOf('exclude', 'abc') === '"b" | "c"', 'Exclude<"a" | "b" | "c", "a"> = "b" | "c"');
assert(resultOf('extract', 'abc') === '"a"', 'Extract<"a" | "b" | "c", "a" | "f"> = "a"');
assert(resultOf('nonnullable', 'snu') === 'string | number', 'NonNullable<string | number | undefined> = string | number');

// ── infer: pattern-match a function/constructor and bind a position ───────────────
assert(resultOf('returntype', 'f') === 'string', 'ReturnType<() => string> = string');
assert(resultOf('returntype', 'g') === 'User', 'ReturnType<(id: number) => User> = User');
assert(resultOf('parameters', 'f') === '[s: string, n: number]', 'Parameters<(s, n) => void> = the parameter tuple');
assert(resultOf('instancetype', 'C') === 'C', 'InstanceType<typeof C> = C');

// ── recursive: Awaited unwraps each Promise layer, distributing over unions ───────
assert(resultOf('awaited', 'p1') === 'string', 'Awaited<Promise<string>> = string');
assert(resultOf('awaited', 'p2') === 'number', 'Awaited<Promise<Promise<number>>> = number (recursion)');
assert(resultOf('awaited', 'union') === 'number | boolean', 'Awaited<Promise<number> | boolean> distributes → number | boolean');

// ── the trace shape: never (empty union) as the distributive identity ─────────────
{
  const ex = expand('exclude', 'abc')!;
  const dropped = ex.steps.find((s) => s.kind === 'dropped');
  assert(!!dropped && dropped.tag === 'conditional' && dropped.expr.endsWith('never'), 'Exclude shows the dropped member collapsing to never');
  assert(ex.steps.filter((s) => s.kind === 'kept').length === 2, 'two members survive Exclude');
}
{
  const ex = expand('omit', 'Todo')!;
  const step = ex.steps.find((s) => s.kind === 'omit-exclude');
  assert(!!step && step.expr.includes('Exclude<keyof T'), 'Omit trace reveals it is Pick + Exclude, not a primitive');
}
{
  const ex = expand('awaited', 'p2')!;
  assert(ex.steps.filter((s) => s.kind === 'unwrap').length === 2, 'Awaited<Promise<Promise<number>>> unwraps exactly twice');
}
{
  const ex = expand('awaited', 'union')!;
  assert(ex.steps.some((s) => s.kind === 'distribute'), 'Awaited over a union distributes first');
  assert(ex.steps.some((s) => s.kind === 'as-is'), 'the non-thenable union member is left as-is');
}

// ── infer traces always substitute → match → bind → result ────────────────────────
{
  const ex = expand('returntype', 'g')!;
  assert(ex.steps.map((s) => s.kind).join(',') === 'substitute,match,bind,result', 'infer trace is substitute → match → bind → result');
  const bind = ex.steps.find((s) => s.kind === 'bind');
  assert(!!bind && bind.expr === 'R = User', 'ReturnType binds infer R = User');
  assert(ex.steps[ex.steps.length - 1].expr === 'User', 'the final step is the bound type');
}

// ── structural invariants over EVERY utility × example ────────────────────────────
const mechs: Mechanism[] = ['mapped', 'conditional', 'infer', 'recursive'];
for (const u of UTILITIES) {
  assert(mechs.includes(u.mechanism), `${u.id}: mechanism is one of the four families`);
  assert(/^type /.test(u.signature), `${u.id}: signature is a real lib.d.ts line`);
  assert(u.examples.length >= 1, `${u.id}: has at least one example`);
  for (const ex of u.examples) {
    const e = expand(u.id, ex.id)!;
    assert(!!e, `${u.id}/${ex.id}: expands`);
    assert(e.mechanism === u.mechanism, `${u.id}/${ex.id}: expansion carries the utility's mechanism`);
    assert(e.result.length > 0 && e.result !== 'never', `${u.id}/${ex.id}: produces a concrete non-never result`);
    const last = e.steps[e.steps.length - 1];
    assert(last.tag === 'result', `${u.id}/${ex.id}: last step is tagged result`);
    assert(last.expr === e.result, `${u.id}/${ex.id}: the final step equals the result`);
    assert(e.steps.slice(0, -1).every((s) => s.tag === u.mechanism), `${u.id}/${ex.id}: every non-final step is tagged with the mechanism`);
    assert(e.steps.every((s, i) => s.n === i + 1), `${u.id}/${ex.id}: steps are numbered 1..N`);
  }
}

// ── lookups + guards ──────────────────────────────────────────────────────────────
assert(utilityById('partial')!.name === 'Partial<T>', 'utilityById resolves');
assert(utilityById('nope') === undefined, 'utilityById returns undefined for a bad id');
assert(expand('nope', 'x') === undefined, 'expand returns undefined for a bad utility');
assert(expand('partial', 'nope') === undefined, 'expand returns undefined for a bad example');

console.log(`\n— utility-type decoder — ${checks} checks, ${failures} failed.`);
process.exit(failures > 0 ? 1 : 0);
