/*
 * test-mappedtype.ts — golden tests for the M6 mapped-type engine (src/lib/mappedType.ts).
 * Auto-discovered by scripts/run-tests.ts (`npm test`) and run in CI before build. Verifies the
 * mechanics M6 teaches: modifier add/remove (`?`, `readonly` via `+`/`-`), HOMOMORPHIC preservation
 * of the input's own modifiers, key remapping via `as` + template-literal `Capitalize`, and value
 * transforms (`T[K]` → `() => T[K]`, `T[K] | null`). Mirrors the standard library's utility types.
 */
import {
  applyTransform, INPUTS, inputById, renderMembers, TRANSFORMS, transformById,
} from '../src/lib/mappedType';

let failures = 0;
let checks = 0;
function assert(cond: boolean, msg: string): void {
  checks++;
  if (!cond) {
    failures++;
    console.error('  ✖ ' + msg);
  }
}

const User = inputById('User')!;
const Config = inputById('Config')!; // { readonly host: string; port: number; debug?: boolean }

const out = (inputId: string, transformId: string): string =>
  applyTransform(inputById(inputId)!, transformById(transformId)!).outputRender;

// ── renderer ────────────────────────────────────────────────────────────────────
assert(renderMembers(User) === '{ id: number; name: string; email: string }', 'renderMembers plain');
assert(renderMembers(Config) === '{ readonly host: string; port: number; debug?: boolean }', 'renderMembers with modifiers');

// ── Partial: adds ?, preserves readonly (homomorphic) ────────────────────────────
assert(out('User', 'partial') === '{ id?: number; name?: string; email?: string }', 'Partial<User> makes all optional');
assert(
  out('Config', 'partial') === '{ readonly host?: string; port?: number; debug?: boolean }',
  'Partial<Config> preserves readonly on host AND makes every key optional',
);

// ── Required: removes ? ───────────────────────────────────────────────────────────
assert(out('Config', 'required') === '{ readonly host: string; port: number; debug: boolean }', 'Required<Config> strips ? (keeps readonly)');

// ── Readonly / Mutable: add / remove readonly ────────────────────────────────────
assert(out('User', 'readonly') === '{ readonly id: number; readonly name: string; readonly email: string }', 'Readonly<User> adds readonly to all');
assert(out('Config', 'mutable') === '{ host: string; port: number; debug?: boolean }', 'Mutable<Config> removes readonly from host, keeps ? on debug');

// ── Nullable: value transform, modifiers untouched ───────────────────────────────
assert(out('Point', 'nullable') === '{ x: number | null; y: number | null }', 'Nullable<Point> adds | null to values');
assert(out('Config', 'nullable') === '{ readonly host: string | null; port: number | null; debug?: boolean | null }', 'Nullable<Config> preserves readonly/? and nulls the values');

// ── Getters: key remap (as + Capitalize) + value wrap ────────────────────────────
{
  const r = applyTransform(User, transformById('getters')!);
  assert(r.outputRender === '{ getId: () => number; getName: () => string; getEmail: () => string }', 'Getters<User> remaps keys and wraps values');
  assert(r.steps[0].origKey === 'id' && r.steps[0].key === 'getId', 'id remaps to getId (Capitalize)');
  assert(r.steps[0].keyChanged && r.steps[0].valueChanged, 'the key and value both changed');
}

// ── the per-key trace carries the modifier deltas ────────────────────────────────
{
  const r = applyTransform(Config, transformById('partial')!);
  const host = r.steps.find((s) => s.origKey === 'host')!;
  const debug = r.steps.find((s) => s.origKey === 'debug')!;
  assert(host.readonly && host.optional, 'host is readonly (preserved) and optional (added)');
  assert(host.optionalChange === '+' && host.readonlyChange === undefined, 'host: ? was added, readonly unchanged (preserved)');
  assert(debug.optional && debug.optionalChange === undefined, 'debug was already optional → no change flagged');
}
{
  const r = applyTransform(Config, transformById('mutable')!);
  const host = r.steps.find((s) => s.origKey === 'host')!;
  assert(!host.readonly && host.readonlyChange === '-', 'Mutable removed readonly from host (delta -)');
}

// ── every input × transform produces a well-formed result ────────────────────────
for (const inp of INPUTS) {
  for (const t of TRANSFORMS) {
    const r = applyTransform(inp.members, t);
    assert(r.steps.length === inp.members.length, `${t.id}<${inp.id}>: one step per key`);
    assert(r.outputRender.startsWith('{') && r.outputRender.endsWith('}'), `${t.id}<${inp.id}> renders an object type`);
  }
}

console.log(`\n— mapped-type engine — ${checks} checks, ${failures} failed.`);
process.exit(failures > 0 ? 1 : 0);
