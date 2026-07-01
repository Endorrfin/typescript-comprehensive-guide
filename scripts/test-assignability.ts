/*
 * test-assignability.ts — golden tests for the M1 structural-assignability engine (src/lib/assignability.ts).
 * Auto-discovered by scripts/run-tests.ts (`npm test`) and run in CI before build. Verifies the
 * mechanics M1 teaches: structural (member-by-member) assignability, literal widening, directionality,
 * optional/missing members, excess-property checks on fresh object literals, array covariance,
 * function arity + contravariant params + covariant returns, and the unknown/never edges.
 */
import {
  arr, assignable, explain, fn, lit, obj, prim, renderMembers, renderTy, TYPES, typeById, uni,
} from '../src/lib/assignability';

let failures = 0;
let checks = 0;
function assert(cond: boolean, msg: string): void {
  checks++;
  if (!cond) {
    failures++;
    console.error('  ✖ ' + msg);
  }
}

const Pet = typeById('Pet')!;
const Dog = typeById('Dog')!;
const Point2D = typeById('Point2D')!;
const Point3D = typeById('Point3D')!;
const User = typeById('User')!;
const Admin = typeById('Admin')!;

// ── renderer ────────────────────────────────────────────────────────────────────
assert(renderTy(prim('string')) === 'string', 'render prim');
assert(renderTy(lit('admin')) === '"admin"', 'render string literal in quotes');
assert(renderTy(uni(lit('admin'), lit('user'))) === '"admin" | "user"', 'render union of literals');
assert(renderTy(arr(uni(prim('string'), prim('number')))) === '(string | number)[]', 'render parenthesizes a union element');
assert(renderTy(Dog) === 'Dog', 'named object renders as its name');
assert(renderMembers(Dog) === '{ name: string; breed: string }', 'renderMembers shows the full shape');
assert(renderTy(fn([prim('string')], prim('void'))) === '(a0: string) => void', 'render function type');

// ── scalar assignability: literal widening + direction ───────────────────────────
assert(assignable(lit('admin'), prim('string')), 'literal "admin" widens to string');
assert(!assignable(prim('string'), lit('admin')), 'string does NOT narrow to "admin"');
assert(assignable(lit('admin'), uni(lit('admin'), lit('user'))), '"admin" is assignable to "admin" | "user"');
assert(!assignable(uni(lit('admin'), lit('user')), lit('admin')), '"admin" | "user" is NOT assignable to "admin"');
assert(!assignable(prim('string'), prim('number')), 'string is not assignable to number');

// ── top / bottom types ───────────────────────────────────────────────────────────
assert(assignable(prim('number'), prim('unknown')), 'everything is assignable to unknown (top)');
assert(!assignable(prim('unknown'), prim('number')), 'unknown is not assignable to number');
assert(assignable(prim('never'), Dog), 'never is assignable to everything (bottom)');
assert(assignable(prim('any'), prim('number')), 'any is assignable to number');
assert(!assignable(prim('any'), prim('never')), 'any is NOT assignable to never');

// ── arrays are covariant in the element type ─────────────────────────────────────
assert(assignable(arr(Dog), arr(Pet)), 'Dog[] is assignable to Pet[] (covariant)');
assert(!assignable(arr(Pet), arr(Dog)), 'Pet[] is NOT assignable to Dog[]');

// ── object structural assignability + direction ──────────────────────────────────
assert(assignable(Dog, Pet), 'Dog is assignable to Pet (has name; extra breed is fine)');
assert(!assignable(Pet, Dog), 'Pet is NOT assignable to Dog (missing breed)');
assert(assignable(Point3D, Point2D), 'Point3D is assignable to Point2D (superset of members)');
assert(!assignable(Point2D, Point3D), 'Point2D is NOT assignable to Point3D (missing z)');
assert(!assignable(Dog, Point2D), 'unrelated shapes: Dog is not assignable to Point2D');

// ── union-typed members: widening a discriminant ─────────────────────────────────
assert(assignable(Admin, User), 'Admin is assignable to User (role "admin" ⊆ "admin" | "user")');
assert(!assignable(User, Admin), 'User is NOT assignable to Admin (role union ⊄ "admin")');

// ── optional members may be omitted ──────────────────────────────────────────────
{
  const WithOpt = obj('WithOpt', [{ name: 'name', ty: prim('string') }, { name: 'nick', ty: prim('string'), optional: true }]);
  assert(assignable(Pet, WithOpt), 'a source without an OPTIONAL target member is still assignable');
  const t = explain(Pet, WithOpt);
  assert(t.steps.some((s) => s.name === 'nick' && s.ok && s.code === 'member-optional-absent'), 'optional-absent step is ok');
}

// ── explain(): object trace, missing member, excess (plain vs fresh) ──────────────
{
  const t = explain(Dog, Pet);
  assert(t.kind === 'object' && t.ok && t.code === 'ok-object', 'Dog→Pet: ok-object');
  assert(t.steps.length === 1 && t.steps[0].name === 'name' && t.steps[0].ok, 'one obligation: name, satisfied');
  assert(t.excess.length === 1 && t.excess[0].name === 'breed' && t.excess[0].ok, 'breed is excess but OK for a plain value');
}
{
  const t = explain(Pet, Dog);
  assert(!t.ok && t.code === 'bad-shape', 'Pet→Dog: bad-shape');
  assert(t.steps.some((s) => s.name === 'breed' && !s.ok && s.code === 'member-missing'), 'breed reported missing');
}
{
  const plain = explain(Dog, Pet, { fresh: false });
  const fresh = explain(Dog, Pet, { fresh: true });
  assert(plain.ok, 'Dog→Pet assignable when treated as a plain value (extra members ignored)');
  assert(!fresh.ok && fresh.excessFails && fresh.code === 'member-excess', 'Dog→Pet as a FRESH literal fails excess-property check');
  assert(fresh.excess[0].name === 'breed' && !fresh.excess[0].ok, 'the excess member is flagged when fresh');
}

// ── explain(): function trace — arity, contravariant params, covariant return ─────
{
  // a handler that ignores its argument is assignable to one that supplies an Event
  const src = fn([], prim('void'));
  const tgt = fn([prim('string')], prim('void'));
  const t = explain(src, tgt);
  assert(t.kind === 'fn' && t.ok && t.code === 'ok-fn', 'fewer params: () => void assignable to (string) => void');
  assert(t.steps.some((s) => s.name === 'param 0' && s.ok && s.code === 'member-optional-absent'), 'the unused param is an ok step');
}
{
  // return type is covariant: () => Dog assignable to () => Pet
  assert(explain(fn([], Dog), fn([], Pet)).ok, 'covariant return: () => Dog assignable to () => Pet');
  assert(!explain(fn([], Pet), fn([], Dog)).ok, 'return not covariant the other way: () => Pet ⊄ () => Dog');
}

// ── explain(): scalar verdicts carry a teachable reason code ──────────────────────
assert(explain(lit('admin'), prim('string')).code === 'ok-widen', 'scalar ok-widen');
assert(explain(prim('string'), lit('admin')).code === 'bad-widen', 'scalar bad-widen');
assert(explain(prim('number'), prim('unknown')).code === 'ok-top', 'scalar ok-top');

// ── every library pair explains without throwing and agrees with assignable() ─────
for (const A of TYPES) {
  for (const B of TYPES) {
    const t = explain(A.ty, B.ty);
    assert(typeof t.ok === 'boolean' && t.steps.every((s) => typeof s.ok === 'boolean'), `${A.id}→${B.id} explains`);
    assert(t.ok === assignable(A.ty, B.ty), `${A.id}→${B.id}: explain.ok matches assignable()`);
  }
}

console.log(`\n— assignability engine — ${checks} checks, ${failures} failed.`);
process.exit(failures > 0 ? 1 : 0);
