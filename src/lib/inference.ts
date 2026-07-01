/*
 * inference.ts — a correct, deterministic generic type-argument inference engine (M4 engine).
 *
 * Pure logic (no React, no i18n) so the ★ inference sim renders it and the golden test
 * (scripts/test-inference.ts) verifies its behaviour directly. It models the mechanic M4 teaches:
 * given a generic signature `f<T>(…)` and a call, TypeScript collects a CANDIDATE for `T` from every
 * argument position that mentions `T` (an "inference site"), takes the best-common-type of the
 * candidates (a union when they disagree), widens literals, falls back to a DEFAULT when there are no
 * candidates, and checks the result against the type parameter's CONSTRAINT.
 * (TS handbook · "Generics" / "Type Inference".)
 */

// ── The type model ──────────────────────────────────────────────────────────────
export type Ty =
  | { k: 'prim'; name: string }
  | { k: 'lit'; value: string | number | boolean }
  | { k: 'array'; elem: Ty }
  | { k: 'tuple'; elems: Ty[] }
  | { k: 'named'; name: string; args: Ty[] }
  | { k: 'param' } // the type parameter T (a placeholder inside a signature shape)
  | { k: 'union'; members: Ty[] };

export const prim = (name: string): Ty => ({ k: 'prim', name });
export const lit = (value: string | number | boolean): Ty => ({ k: 'lit', value });
export const arr = (elem: Ty): Ty => ({ k: 'array', elem });
export const tuple = (...elems: Ty[]): Ty => ({ k: 'tuple', elems });
export const named = (name: string, ...args: Ty[]): Ty => ({ k: 'named', name, args });
export const T: Ty = { k: 'param' };

const primOfLiteral = (v: string | number | boolean): string =>
  typeof v === 'string' ? 'string' : typeof v === 'number' ? 'number' : 'boolean';

// ── Render ──────────────────────────────────────────────────────────────────────
export function renderTy(t: Ty): string {
  switch (t.k) {
    case 'prim': return t.name;
    case 'lit': return typeof t.value === 'string' ? `"${t.value}"` : String(t.value);
    case 'array': return t.elem.k === 'union' ? `(${renderTy(t.elem)})[]` : `${renderTy(t.elem)}[]`;
    case 'tuple': return `[${t.elems.map(renderTy).join(', ')}]`;
    case 'named': return t.args.length ? `${t.name}<${t.args.map(renderTy).join(', ')}>` : t.name;
    case 'param': return 'T';
    case 'union': return t.members.map(renderTy).join(' | ');
  }
}

function keyOf(t: Ty): string {
  switch (t.k) {
    case 'prim': return `p:${t.name}`;
    case 'lit': return `l:${typeof t.value}:${String(t.value)}`;
    case 'array': return `a:${keyOf(t.elem)}`;
    case 'tuple': return `t:[${t.elems.map(keyOf).join(',')}]`;
    case 'named': return `n:${t.name}<${t.args.map(keyOf).join(',')}>`;
    case 'param': return 'T';
    case 'union': return `u:[${[...t.members].map(keyOf).sort().join('|')}]`;
  }
}

/** Normalized union: flatten, dedupe, drop nothing (no never here); 1 member collapses. */
export function union(...parts: Ty[]): Ty {
  const flat: Ty[] = [];
  const seen = new Set<string>();
  const push = (t: Ty): void => {
    if (t.k === 'union') { t.members.forEach(push); return; }
    const k = keyOf(t);
    if (seen.has(k)) return;
    seen.add(k);
    flat.push(t);
  };
  parts.forEach(push);
  if (flat.length === 1) return flat[0];
  return { k: 'union', members: flat };
}

/** Widen literal types to their primitive — models non-`const` inference to a bare type parameter. */
export function widen(t: Ty): Ty {
  switch (t.k) {
    case 'lit': return prim(primOfLiteral(t.value));
    case 'array': return arr(widen(t.elem));
    case 'tuple': return tuple(...t.elems.map(widen));
    case 'named': return named(t.name, ...t.args.map(widen));
    case 'union': return union(...t.members.map(widen));
    default: return t;
  }
}

// ── Assignability (only what constraint checks need) ────────────────────────────
export function assignable(a: Ty, b: Ty): boolean {
  if (b.k === 'prim' && (b.name === 'unknown' || b.name === 'any')) return true;
  if (a.k === 'prim' && a.name === 'never') return true;
  if (b.k === 'union') return b.members.some((m) => assignable(a, m));
  if (a.k === 'union') return a.members.every((m) => assignable(m, b));
  switch (a.k) {
    case 'lit':
      if (b.k === 'lit') return a.value === b.value;
      return b.k === 'prim' && primOfLiteral(a.value) === b.name;
    case 'prim': return b.k === 'prim' && b.name === a.name;
    case 'array': return b.k === 'array' && assignable(a.elem, b.elem);
    case 'tuple': return b.k === 'tuple' && a.elems.length === b.elems.length && a.elems.every((e, i) => assignable(e, b.elems[i]));
    case 'named': return b.k === 'named' && a.name === b.name && a.args.length === b.args.length && a.args.every((e, i) => assignable(e, b.args[i]));
    default: return false;
  }
}

// ── Candidate collection: match a parameter SHAPE (with `T`) against an argument type ─
/** Extract every candidate type for `T` from one inference site. */
export function collect(shape: Ty, arg: Ty): Ty[] {
  switch (shape.k) {
    case 'param': return [arg];
    case 'array':
      if (arg.k === 'array') return collect(shape.elem, arg.elem);
      if (arg.k === 'tuple') return arg.elems.flatMap((e) => collect(shape.elem, e));
      return [];
    case 'tuple':
      return arg.k === 'tuple' && arg.elems.length === shape.elems.length
        ? shape.elems.flatMap((s, i) => collect(s, arg.elems[i]))
        : [];
    case 'named':
      return arg.k === 'named' && arg.name === shape.name && arg.args.length === shape.args.length
        ? shape.args.flatMap((s, i) => collect(s, arg.args[i]))
        : [];
    default:
      return []; // a concrete position (prim/lit/union) contributes no inference
  }
}

/** Substitute the inferred type for every `T` placeholder in a shape (used to render the return type). */
export function substitute(shape: Ty, t: Ty): Ty {
  switch (shape.k) {
    case 'param': return t;
    case 'array': return arr(substitute(shape.elem, t));
    case 'tuple': return tuple(...shape.elems.map((e) => substitute(e, t)));
    case 'named': return named(shape.name, ...shape.args.map((e) => substitute(e, t)));
    default: return shape;
  }
}

// ── The preset model ─────────────────────────────────────────────────────────────
export type TParam = { constraint?: Ty; constraintText?: string; default?: Ty; defaultText?: string };
export type Param = { shape: Ty; text: string };
export type Call = { id: string; label: string; args: { text: string; ty: Ty }[]; explicit?: { ty: Ty; text: string } };

export type Preset = {
  id: string;
  name: string;
  signature: string;
  tparam: TParam;
  params: Param[];
  retShape: Ty;
  retText: string;
  calls: Call[];
};

// ── The inference result (what the sim reveals) ─────────────────────────────────
export type Site = { paramText: string; argText: string; candidates: string[] };
export type InferResult = {
  signature: string;
  callText: string;
  explicit: boolean;
  sites: Site[];
  combined: string;      // best-common-type of the candidates (rendered), before default fallback
  usedDefault: boolean;
  inferred: string;      // final T (rendered)
  constraintText?: string;
  constraintOk: boolean;
  returnType: string;    // the call's result type (rendered)
};

export function infer(preset: Preset, call: Call): InferResult {
  const base = { signature: preset.signature, callText: call.label, constraintText: preset.tparam.constraintText };

  if (call.explicit) {
    const t = call.explicit.ty;
    return {
      ...base,
      explicit: true,
      sites: [],
      combined: renderTy(t),
      usedDefault: false,
      inferred: renderTy(t),
      constraintOk: preset.tparam.constraint ? assignable(t, preset.tparam.constraint) : true,
      returnType: renderTy(substitute(preset.retShape, t)),
    };
  }

  const sites: Site[] = preset.params.map((p, i) => {
    const arg = call.args[i];
    const cands = arg ? collect(p.shape, arg.ty) : [];
    return { paramText: p.text, argText: arg?.text ?? '—', candidates: cands.map(renderTy) };
  });

  const allCandidates = preset.params.flatMap((p, i) => (call.args[i] ? collect(p.shape, call.args[i].ty) : []));
  const widened = allCandidates.map(widen);
  const combinedTy = widened.length ? union(...widened) : undefined;

  const usedDefault = !combinedTy && !!preset.tparam.default;
  const t: Ty = combinedTy ?? preset.tparam.default ?? prim('unknown');

  return {
    ...base,
    explicit: false,
    sites,
    combined: combinedTy ? renderTy(combinedTy) : usedDefault ? renderTy(preset.tparam.default!) : 'unknown',
    usedDefault,
    inferred: renderTy(t),
    constraintOk: preset.tparam.constraint ? assignable(t, preset.tparam.constraint) : true,
    returnType: renderTy(substitute(preset.retShape, t)),
  };
}

// ── The sim's presets ─────────────────────────────────────────────────────────────
export const PRESETS: Preset[] = [
  {
    id: 'identity',
    name: 'identity<T>',
    signature: 'function identity<T>(x: T): T',
    tparam: {},
    params: [{ shape: T, text: 'x: T' }],
    retShape: T,
    retText: 'T',
    calls: [
      { id: 'str', label: "identity('hello')", args: [{ text: "'hello'", ty: lit('hello') }] },
      { id: 'num', label: 'identity(42)', args: [{ text: '42', ty: lit(42) }] },
    ],
  },
  {
    id: 'first',
    name: 'first<T>',
    signature: 'function first<T>(arr: T[]): T',
    tparam: {},
    params: [{ shape: arr(T), text: 'arr: T[]' }],
    retShape: T,
    retText: 'T',
    calls: [
      { id: 'nums', label: 'first([1, 2, 3])', args: [{ text: '[1, 2, 3]', ty: arr(prim('number')) }] },
      { id: 'mixed', label: "first(['a', 1])", args: [{ text: "['a', 1]", ty: arr(union(prim('string'), prim('number'))) }] },
    ],
  },
  {
    id: 'pair',
    name: 'pair<T>',
    signature: 'function pair<T>(a: T, b: T): [T, T]',
    tparam: {},
    params: [{ shape: T, text: 'a: T' }, { shape: T, text: 'b: T' }],
    retShape: tuple(T, T),
    retText: '[T, T]',
    calls: [
      { id: 'same', label: 'pair(1, 2)', args: [{ text: '1', ty: lit(1) }, { text: '2', ty: lit(2) }] },
      { id: 'diff', label: "pair(1, 'x')", args: [{ text: '1', ty: lit(1) }, { text: "'x'", ty: lit('x') }] },
    ],
  },
  {
    id: 'make',
    name: 'make<T = string>',
    signature: 'function make<T = string>(): Box<T>',
    tparam: { default: prim('string'), defaultText: 'string' },
    params: [],
    retShape: named('Box', T),
    retText: 'Box<T>',
    calls: [
      { id: 'none', label: 'make()', args: [] },
      { id: 'explicit', label: 'make<number>()', args: [], explicit: { ty: prim('number'), text: 'number' } },
    ],
  },
  {
    id: 'label',
    name: 'label<T extends string>',
    signature: 'function label<T extends string>(x: T): T',
    tparam: { constraint: prim('string'), constraintText: 'string' },
    params: [{ shape: T, text: 'x: T' }],
    retShape: T,
    retText: 'T',
    calls: [
      { id: 'ok', label: 'label(name)  // name: string', args: [{ text: 'name', ty: prim('string') }] },
      { id: 'bad', label: 'label(count)  // count: number', args: [{ text: 'count', ty: prim('number') }] },
    ],
  },
];

export function presetById(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
