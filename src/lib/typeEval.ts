/*
 * typeEval.ts — a correct, deterministic mini type-level evaluator (golden M5 engine).
 *
 * Pure logic (no React, no i18n) so the ★ Conditional-type sim renders it and the golden test
 * (scripts/test-typeeval.ts) verifies its behaviour directly. It models a small, honest subset of
 * the TypeScript type system and evaluates DISTRIBUTIVE conditional types with `infer` — the exact
 * mechanic M5 teaches:
 *
 *   type C<T> = T extends Pattern ? WhenTrue : WhenFalse
 *
 * A *naked* type parameter (`T extends …`) distributes over a union: C<A | B> = C<A> | C<B>.
 * Wrapping in a tuple (`[T] extends […]`) turns distribution OFF — the union is checked as one unit.
 * (TS handbook · "Distributive Conditional Types".)
 */

// ── The type model ────────────────────────────────────────────────────────────
export type PrimName =
  | 'string' | 'number' | 'boolean' | 'bigint' | 'symbol' | 'object'
  | 'null' | 'undefined' | 'void' | 'unknown' | 'never' | 'any';

export type Ty =
  | { k: 'prim'; name: PrimName }
  | { k: 'lit'; value: string | number | boolean }
  | { k: 'array'; elem: Ty }
  | { k: 'promise'; inner: Ty }
  | { k: 'fn'; ret: Ty } // params elided — only the return type matters for `infer R`
  | { k: 'union'; members: Ty[] };

// ── Constructors ────────────────────────────────────────────────────────────────
export const prim = (name: PrimName): Ty => ({ k: 'prim', name });
export const lit = (value: string | number | boolean): Ty => ({ k: 'lit', value });
export const arr = (elem: Ty): Ty => ({ k: 'array', elem });
export const promise = (inner: Ty): Ty => ({ k: 'promise', inner });
export const fn = (ret: Ty): Ty => ({ k: 'fn', ret });

export const NEVER = prim('never');
export const UNKNOWN = prim('unknown');

/** A structural key for dedupe / equality — two types are equal iff their keys match. */
export function key(t: Ty): string {
  switch (t.k) {
    case 'prim': return `p:${t.name}`;
    case 'lit': return `l:${typeof t.value}:${String(t.value)}`;
    case 'array': return `a:${key(t.elem)}`;
    case 'promise': return `P:${key(t.inner)}`;
    case 'fn': return `f:${key(t.ret)}`;
    case 'union': return `u:[${[...t.members].map(key).sort().join('|')}]`;
  }
}

/**
 * Build a normalized union: flatten nested unions, drop `never`, dedupe structurally.
 * 0 members → `never`; 1 member → that member (TS has no 1-ary unions).
 */
export function union(...parts: Ty[]): Ty {
  const flat: Ty[] = [];
  const seen = new Set<string>();
  const push = (t: Ty): void => {
    if (t.k === 'union') { t.members.forEach(push); return; }
    if (t.k === 'prim' && t.name === 'never') return; // never is the identity of |
    const k = key(t);
    if (seen.has(k)) return;
    seen.add(k);
    flat.push(t);
  };
  parts.forEach(push);
  if (flat.length === 0) return NEVER;
  if (flat.length === 1) return flat[0];
  return { k: 'union', members: flat };
}

// ── Pretty-printer (renders the model back to TS-looking source) ─────────────────
export function renderTy(t: Ty): string {
  switch (t.k) {
    case 'prim': return t.name;
    case 'lit': return typeof t.value === 'string' ? `"${t.value}"` : String(t.value);
    case 'array': {
      // Parenthesize unions so `(A | B)[]` reads correctly.
      const inner = renderTy(t.elem);
      return t.elem.k === 'union' ? `(${inner})[]` : `${inner}[]`;
    }
    case 'promise': return `Promise<${renderTy(t.inner)}>`;
    case 'fn': return `(...args: any[]) => ${renderTy(t.ret)}`;
    case 'union': return t.members.map(renderTy).join(' | ');
  }
}

/** Expand a (possibly union) type to its member list — used to drive distribution. */
export function members(t: Ty): Ty[] {
  return t.k === 'union' ? t.members : [t];
}

// ── Assignability (a <: b) — structural, covering the subset we model ────────────
export function assignable(a: Ty, b: Ty): boolean {
  if (b.k === 'prim' && (b.name === 'unknown' || b.name === 'any')) return true; // top types
  if (a.k === 'prim' && a.name === 'never') return true;                          // never <: everything
  if (a.k === 'prim' && a.name === 'any') return true;                            // any <: everything
  if (b.k === 'union') return members(b).some((m) => assignable(a, m));
  if (a.k === 'union') return members(a).every((m) => assignable(m, b));

  switch (a.k) {
    case 'lit': {
      // Literal widening: "red" <: string, 42 <: number, true <: boolean. Also lit <: same lit.
      if (b.k === 'lit') return a.value === b.value && typeof a.value === typeof b.value;
      if (b.k === 'prim') return primOf(a.value) === b.name;
      return false;
    }
    case 'prim': return b.k === 'prim' && b.name === a.name;
    case 'array': return b.k === 'array' && assignable(a.elem, b.elem);
    case 'promise': return b.k === 'promise' && assignable(a.inner, b.inner);
    case 'fn': return b.k === 'fn' && assignable(a.ret, b.ret);
    default: return false;
  }
}

function primOf(v: string | number | boolean): PrimName {
  return typeof v === 'string' ? 'string' : typeof v === 'number' ? 'number' : 'boolean';
}

// ── The conditional-type description ─────────────────────────────────────────────
/** The `extends` clause: either a concrete type, or a structural pattern with one `infer` slot. */
export type Extends =
  | { t: 'type'; ty: Ty; text: string }        // T extends <ty>
  | { t: 'array'; infer: string; text: string }   // T extends (infer X)[]
  | { t: 'promise'; infer: string; text: string } // T extends Promise<infer X>
  | { t: 'fnReturn'; infer: string; text: string }; // T extends (...a: any[]) => infer X

/** How a branch resolves to a result type for a given checked member + infer bindings. */
export type Branch =
  | { b: 'checked'; text: string }            // T
  | { b: 'infer'; name: string; text: string } // an inferred variable, e.g. E
  | { b: 'arrayOfChecked'; text: string }     // T[]
  | { b: 'type'; ty: Ty; text: string };      // a concrete type (e.g. never)

export type Conditional = {
  id: string;
  name: string;        // display name, e.g. 'ToArray<T>'
  signature: string;   // the TS source line
  param: string;       // 'T'
  ext: Extends;
  whenTrue: Branch;
  whenFalse: Branch;
  distribute: boolean; // naked param distributes over unions; [T] extends [U] does not
};

// ── Matching + branch resolution ─────────────────────────────────────────────────
export type Match = { matched: boolean; binds: Record<string, Ty> };

export function matchExtends(ext: Extends, member: Ty): Match {
  switch (ext.t) {
    case 'type':
      return { matched: assignable(member, ext.ty), binds: {} };
    case 'array':
      return member.k === 'array'
        ? { matched: true, binds: { [ext.infer]: member.elem } }
        : { matched: false, binds: { [ext.infer]: NEVER } };
    case 'promise':
      return member.k === 'promise'
        ? { matched: true, binds: { [ext.infer]: member.inner } }
        : { matched: false, binds: { [ext.infer]: NEVER } };
    case 'fnReturn':
      return member.k === 'fn'
        ? { matched: true, binds: { [ext.infer]: member.ret } }
        : { matched: false, binds: { [ext.infer]: NEVER } };
  }
}

export function resolveBranch(branch: Branch, member: Ty, binds: Record<string, Ty>): Ty {
  switch (branch.b) {
    case 'checked': return member;
    case 'infer': return binds[branch.name] ?? NEVER;
    case 'arrayOfChecked': return arr(member);
    case 'type': return branch.ty;
  }
}

// ── Evaluation ──────────────────────────────────────────────────────────────────
export type Step = {
  member: Ty;
  matched: boolean;
  binds: Record<string, Ty>;
  branch: 'true' | 'false';
  result: Ty;
};

export type EvalResult = {
  input: Ty;
  distributed: boolean;
  steps: Step[]; // one per distributed member (or a single step for the whole input)
  result: Ty;    // the normalized union of all step results
};

/**
 * Evaluate a conditional type against an input type.
 * Distributive + naked union → one step per member, results unioned (TS semantics, incl. the
 * "distribute over `never` ⇒ `never`" edge case where the empty union yields no steps).
 */
export function evaluate(cond: Conditional, input: Ty): EvalResult {
  const distributing = cond.distribute && input.k === 'union';
  // Distributing over `never` (the empty union) produces no members and resolves to `never`.
  const distributeNever = cond.distribute && input.k === 'prim' && input.name === 'never';
  const checks: Ty[] = distributeNever ? [] : distributing ? input.members : [input];

  const steps: Step[] = checks.map((member) => {
    const { matched, binds } = matchExtends(cond.ext, member);
    const branch = matched ? cond.whenTrue : cond.whenFalse;
    return {
      member,
      matched,
      binds,
      branch: matched ? 'true' : 'false',
      result: resolveBranch(branch, member, binds),
    };
  });

  return {
    input,
    distributed: distributing || distributeNever,
    steps,
    result: union(...steps.map((s) => s.result)),
  };
}

// ── Library of teachable conditionals (the sim's presets) ───────────────────────
export const PRESETS: Conditional[] = [
  {
    id: 'to-array',
    name: 'ToArray<T>',
    signature: 'type ToArray<T> = T extends unknown ? T[] : never',
    param: 'T',
    ext: { t: 'type', ty: UNKNOWN, text: 'unknown' },
    whenTrue: { b: 'arrayOfChecked', text: 'T[]' },
    whenFalse: { b: 'type', ty: NEVER, text: 'never' },
    distribute: true,
  },
  {
    id: 'to-array-nondist',
    name: 'ToArrayND<T>',
    signature: 'type ToArrayND<T> = [T] extends [unknown] ? T[] : never',
    param: 'T',
    ext: { t: 'type', ty: UNKNOWN, text: '[unknown]' },
    whenTrue: { b: 'arrayOfChecked', text: 'T[]' },
    whenFalse: { b: 'type', ty: NEVER, text: 'never' },
    distribute: false,
  },
  {
    id: 'non-null',
    name: 'NonNull<T>',
    signature: 'type NonNull<T> = T extends null | undefined ? never : T',
    param: 'T',
    ext: { t: 'type', ty: union(prim('null'), prim('undefined')), text: 'null | undefined' },
    whenTrue: { b: 'type', ty: NEVER, text: 'never' },
    whenFalse: { b: 'checked', text: 'T' },
    distribute: true,
  },
  {
    id: 'element-type',
    name: 'ElementType<T>',
    signature: 'type ElementType<T> = T extends (infer E)[] ? E : T',
    param: 'T',
    ext: { t: 'array', infer: 'E', text: '(infer E)[]' },
    whenTrue: { b: 'infer', name: 'E', text: 'E' },
    whenFalse: { b: 'checked', text: 'T' },
    distribute: true,
  },
  {
    id: 'awaited',
    name: 'Awaited1<T>',
    signature: 'type Awaited1<T> = T extends Promise<infer R> ? R : T',
    param: 'T',
    ext: { t: 'promise', infer: 'R', text: 'Promise<infer R>' },
    whenTrue: { b: 'infer', name: 'R', text: 'R' },
    whenFalse: { b: 'checked', text: 'T' },
    distribute: true,
  },
  {
    id: 'return-type',
    name: 'ReturnTypeOf<T>',
    signature: 'type ReturnTypeOf<T> = T extends (...a: any[]) => infer R ? R : never',
    param: 'T',
    ext: { t: 'fnReturn', infer: 'R', text: '(...a: any[]) => infer R' },
    whenTrue: { b: 'infer', name: 'R', text: 'R' },
    whenFalse: { b: 'type', ty: NEVER, text: 'never' },
    distribute: true,
  },
];

/** Input types the sim offers — a representative spread incl. unions, arrays, promises, functions. */
export const INPUTS: { id: string; label: string; ty: Ty }[] = [
  { id: 'str-num', label: 'string | number', ty: union(prim('string'), prim('number')) },
  { id: 'str-null', label: 'string | null | undefined', ty: union(prim('string'), prim('null'), prim('undefined')) },
  { id: 'union3', label: 'string | number | boolean', ty: union(prim('string'), prim('number'), prim('boolean')) },
  { id: 'num-arr', label: 'number[]', ty: arr(prim('number')) },
  { id: 'arr-or-str', label: 'string[] | number', ty: union(arr(prim('string')), prim('number')) },
  { id: 'promise-bool', label: 'Promise<boolean>', ty: promise(prim('boolean')) },
  { id: 'fn-str', label: '() => string', ty: fn(prim('string')) },
  { id: 'never', label: 'never', ty: NEVER },
];

export function presetById(id: string): Conditional | undefined {
  return PRESETS.find((p) => p.id === id);
}
export function inputById(id: string): Ty | undefined {
  return INPUTS.find((i) => i.id === id)?.ty;
}
