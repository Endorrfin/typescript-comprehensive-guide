/*
 * assignability.ts — a correct, deterministic structural-assignability checker (M1 engine).
 *
 * Pure logic (no React, no i18n) so the ★ structural-assignability sim renders it and the golden
 * test (scripts/test-assignability.ts) verifies its behaviour directly. It models an honest subset
 * of the TypeScript type system and answers the one question at the heart of Section I:
 *
 *   is a value of type A assignable to type B?   (A <: B)
 *
 * The interesting output is not the yes/no but the *reasoning trace*: for an object target, every
 * required member becomes an obligation the source must discharge, checked recursively. Extra source
 * members are allowed (structural typing) — UNLESS the source is a *fresh object literal*, which
 * additionally triggers TypeScript's excess-property check. (TS handbook · "Type Compatibility" +
 * "Object Types → excess property checks".)
 */

// ── The type model ──────────────────────────────────────────────────────────────
export type PrimName =
  | 'string' | 'number' | 'boolean' | 'bigint' | 'symbol'
  | 'null' | 'undefined' | 'void' | 'unknown' | 'never' | 'any';

export type Member = { name: string; ty: Ty; optional?: boolean; readonly?: boolean };

export type Ty =
  | { k: 'prim'; name: PrimName }
  | { k: 'lit'; value: string | number | boolean }
  | { k: 'array'; elem: Ty }
  | { k: 'object'; name?: string; members: Member[] }
  | { k: 'fn'; params: Ty[]; ret: Ty }
  | { k: 'union'; members: Ty[] };

// ── Constructors ────────────────────────────────────────────────────────────────
export const prim = (name: PrimName): Ty => ({ k: 'prim', name });
export const lit = (value: string | number | boolean): Ty => ({ k: 'lit', value });
export const arr = (elem: Ty): Ty => ({ k: 'array', elem });
export const obj = (name: string, members: Member[]): Ty => ({ k: 'object', name, members });
export const fn = (params: Ty[], ret: Ty): Ty => ({ k: 'fn', params, ret });
export const uni = (...members: Ty[]): Ty =>
  members.length === 1 ? members[0] : { k: 'union', members };

const primOfLiteral = (v: string | number | boolean): PrimName =>
  typeof v === 'string' ? 'string' : typeof v === 'number' ? 'number' : 'boolean';

// ── Pretty-printer (renders the model back to TS-looking source) ─────────────────
export function renderTy(t: Ty): string {
  switch (t.k) {
    case 'prim': return t.name;
    case 'lit': return typeof t.value === 'string' ? `"${t.value}"` : String(t.value);
    case 'array': {
      const inner = renderTy(t.elem);
      return t.elem.k === 'union' ? `(${inner})[]` : `${inner}[]`;
    }
    case 'object':
      return t.name ?? renderMembers(t);
    case 'fn':
      return `(${t.params.map((p, i) => `a${i}: ${renderTy(p)}`).join(', ')}) => ${renderTy(t.ret)}`;
    case 'union':
      return t.members.map(renderTy).join(' | ');
  }
}

/** The full `{ name: string; age?: number }` shape (the sim shows this in the type cards). */
export function renderMembers(t: Ty): string {
  if (t.k !== 'object') return renderTy(t);
  if (t.members.length === 0) return '{}';
  const body = t.members
    .map((m) => `${m.readonly ? 'readonly ' : ''}${m.name}${m.optional ? '?' : ''}: ${renderTy(m.ty)}`)
    .join('; ');
  return `{ ${body} }`;
}

// ── Assignability (a <: b) — structural, covering the subset we model ────────────
export function assignable(a: Ty, b: Ty): boolean {
  if (b.k === 'prim' && (b.name === 'unknown' || b.name === 'any')) return true; // top types
  if (a.k === 'prim' && a.name === 'never') return true;                          // never <: everything
  if (a.k === 'prim' && a.name === 'any') return b.k !== 'prim' || b.name !== 'never'; // any <: all but never
  if (b.k === 'union') return b.members.some((m) => assignable(a, m));            // hit at least one arm
  if (a.k === 'union') return a.members.every((m) => assignable(m, b));           // every arm must fit

  switch (a.k) {
    case 'lit':
      if (b.k === 'lit') return a.value === b.value && typeof a.value === typeof b.value;
      if (b.k === 'prim') return primOfLiteral(a.value) === b.name; // literal widens to its primitive
      return false;
    case 'prim':
      return b.k === 'prim' && b.name === a.name;
    case 'array':
      return b.k === 'array' && assignable(a.elem, b.elem); // arrays are covariant in their element
    case 'object':
      // Every REQUIRED target member must be matched by an assignable source member.
      if (b.k !== 'object') return false;
      return b.members.every((bm) => {
        const am = a.members.find((m) => m.name === bm.name);
        if (!am) return !!bm.optional;      // missing a required member → not assignable
        return assignable(am.ty, bm.ty);    // recurse into the member type
      });
    case 'fn': {
      if (b.k !== 'fn') return false;
      if (a.params.length > b.params.length) return false;          // source may take FEWER params
      for (let i = 0; i < a.params.length; i++) {
        if (!assignable(b.params[i], a.params[i])) return false;    // params contravariant (strictFunctionTypes)
      }
      if (b.ret.k === 'prim' && b.ret.name === 'void') return true; // a void-returning target ignores the result
      return assignable(a.ret, b.ret);                              // return type covariant
    }
    default:
      return false;
  }
}

// ── The reasoning trace (what the sim reveals step by step) ──────────────────────
export type ReasonCode =
  | 'ok-exact' | 'ok-widen' | 'ok-top' | 'ok-never' | 'ok-array' | 'ok-object' | 'ok-fn'
  | 'bad-prim' | 'bad-widen' | 'bad-shape' | 'bad-array' | 'bad-fn' | 'bad-kind'
  | 'member-ok' | 'member-bad' | 'member-missing' | 'member-optional-absent' | 'member-excess';

/** One obligation in the trace: a target member the source must satisfy (or an excess source member). */
export type MemberStep = {
  name: string;
  targetTy?: string; // rendered; undefined when this is an EXCESS source member (absent from target)
  sourceTy?: string; // rendered; undefined when the source is MISSING this member
  optional: boolean;
  ok: boolean;
  code: ReasonCode;
};

export type Trace = {
  a: string;                       // rendered source
  b: string;                       // rendered target
  aName?: string;
  bName?: string;
  aMembers?: string;               // full source shape (object)
  bMembers?: string;               // full target shape (object)
  kind: 'object' | 'array' | 'fn' | 'scalar';
  ok: boolean;
  code: ReasonCode;                // overall verdict reason
  steps: MemberStep[];             // per-member obligations (object/fn); [] for scalar/array-as-scalar
  excess: MemberStep[];            // source members absent from the target (EPC candidates)
  fresh: boolean;                  // was the source treated as a fresh object literal?
  excessFails: boolean;           // fresh AND excess.length > 0 → the whole check fails on EPC
};

function scalarCode(a: Ty, b: Ty, ok: boolean): ReasonCode {
  if (ok) {
    if (b.k === 'prim' && (b.name === 'unknown' || b.name === 'any')) return 'ok-top';
    if (a.k === 'prim' && a.name === 'never') return 'ok-never';
    if (a.k === 'lit' && b.k === 'prim') return 'ok-widen';
    return 'ok-exact';
  }
  if (a.k === 'prim' && b.k === 'lit') return 'bad-widen'; // e.g. string ⊄ "admin"
  if (a.k === b.k) return 'bad-prim';
  return 'bad-kind';
}

/**
 * Explain whether `a` is assignable to `b`, producing an ordered, teachable trace.
 * `opts.fresh` treats `a` as a fresh object literal → excess properties become errors (EPC).
 */
export function explain(a: Ty, b: Ty, opts: { fresh?: boolean } = {}): Trace {
  const fresh = !!opts.fresh;
  const base = {
    a: renderTy(a),
    b: renderTy(b),
    aName: a.k === 'object' ? a.name : undefined,
    bName: b.k === 'object' ? b.name : undefined,
    aMembers: a.k === 'object' ? renderMembers(a) : undefined,
    bMembers: b.k === 'object' ? renderMembers(b) : undefined,
    fresh,
  };

  // ── object → object: the member-by-member core ────────────────────────────────
  if (a.k === 'object' && b.k === 'object') {
    const steps: MemberStep[] = b.members.map((bm) => {
      const am = a.members.find((m) => m.name === bm.name);
      if (!am) {
        return bm.optional
          ? { name: bm.name, targetTy: renderTy(bm.ty), optional: true, ok: true, code: 'member-optional-absent' }
          : { name: bm.name, targetTy: renderTy(bm.ty), optional: false, ok: false, code: 'member-missing' };
      }
      const ok = assignable(am.ty, bm.ty);
      return {
        name: bm.name,
        targetTy: renderTy(bm.ty),
        sourceTy: renderTy(am.ty),
        optional: !!bm.optional,
        ok,
        code: ok ? 'member-ok' : 'member-bad',
      };
    });
    const targetNames = new Set(b.members.map((m) => m.name));
    const excess: MemberStep[] = a.members
      .filter((m) => !targetNames.has(m.name))
      .map((m) => ({
        name: m.name,
        sourceTy: renderTy(m.ty),
        optional: !!m.optional,
        ok: !fresh, // excess is fine for a plain value; a FRESH literal rejects it
        code: 'member-excess',
      }));
    const membersOk = steps.every((s) => s.ok);
    const excessFails = fresh && excess.length > 0;
    return {
      ...base,
      kind: 'object',
      steps,
      excess,
      excessFails,
      ok: membersOk && !excessFails,
      code: !membersOk ? 'bad-shape' : excessFails ? 'member-excess' : 'ok-object',
    };
  }

  // ── fn → fn: params (contravariant) + return (covariant) as steps ──────────────
  if (a.k === 'fn' && b.k === 'fn') {
    const steps: MemberStep[] = [];
    const arityOk = a.params.length <= b.params.length;
    for (let i = 0; i < b.params.length; i++) {
      const ap = a.params[i];
      const bp = b.params[i];
      if (!ap) {
        steps.push({ name: `param ${i}`, targetTy: renderTy(bp), optional: true, ok: true, code: 'member-optional-absent' });
        continue;
      }
      const ok = assignable(bp, ap); // contravariant: target param must flow into source param
      steps.push({ name: `param ${i}`, targetTy: renderTy(bp), sourceTy: renderTy(ap), optional: false, ok, code: ok ? 'member-ok' : 'member-bad' });
    }
    const voidTarget = b.ret.k === 'prim' && b.ret.name === 'void';
    const retOk = voidTarget || assignable(a.ret, b.ret);
    steps.push({ name: 'return', targetTy: renderTy(b.ret), sourceTy: renderTy(a.ret), optional: false, ok: retOk, code: retOk ? 'member-ok' : 'member-bad' });
    const ok = arityOk && steps.every((s) => s.ok);
    return { ...base, kind: 'fn', steps, excess: [], excessFails: false, ok, code: ok ? 'ok-fn' : 'bad-fn' };
  }

  // ── array → array: one covariant element obligation ───────────────────────────
  if (a.k === 'array' && b.k === 'array') {
    const ok = assignable(a.elem, b.elem);
    const step: MemberStep = { name: 'element', targetTy: renderTy(b.elem), sourceTy: renderTy(a.elem), optional: false, ok, code: ok ? 'member-ok' : 'member-bad' };
    return { ...base, kind: 'array', steps: [step], excess: [], excessFails: false, ok, code: ok ? 'ok-array' : 'bad-array' };
  }

  // ── scalar / mixed: a single top-level verdict ────────────────────────────────
  const ok = assignable(a, b);
  return { ...base, kind: 'scalar', steps: [], excess: [], excessFails: false, ok, code: scalarCode(a, b, ok) };
}

// ── The sim's type library (all object types → every trace is a member walk) ─────
// Chosen so same-family pairs teach direction, widening and unions, while cross-family
// pairs cleanly fail on a missing member.
export const TYPES: { id: string; ty: Ty }[] = [
  { id: 'Pet', ty: obj('Pet', [{ name: 'name', ty: prim('string') }]) },
  { id: 'Dog', ty: obj('Dog', [{ name: 'name', ty: prim('string') }, { name: 'breed', ty: prim('string') }]) },
  { id: 'Cat', ty: obj('Cat', [{ name: 'name', ty: prim('string') }, { name: 'indoor', ty: prim('boolean') }]) },
  { id: 'Point2D', ty: obj('Point2D', [{ name: 'x', ty: prim('number') }, { name: 'y', ty: prim('number') }]) },
  { id: 'Point3D', ty: obj('Point3D', [{ name: 'x', ty: prim('number') }, { name: 'y', ty: prim('number') }, { name: 'z', ty: prim('number') }]) },
  { id: 'User', ty: obj('User', [{ name: 'id', ty: prim('number') }, { name: 'name', ty: prim('string') }, { name: 'role', ty: uni(lit('admin'), lit('user')) }]) },
  { id: 'Admin', ty: obj('Admin', [{ name: 'id', ty: prim('number') }, { name: 'name', ty: prim('string') }, { name: 'role', ty: lit('admin') }]) },
];

export function typeById(id: string): Ty | undefined {
  return TYPES.find((t) => t.id === id)?.ty;
}
