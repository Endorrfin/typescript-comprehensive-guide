/*
 * mappedType.ts — a correct, deterministic mapped-type evaluator (M6 engine).
 *
 * Pure logic (no React, no i18n) so the ★ mapped-type sim renders it and the golden test
 * (scripts/test-mappedtype.ts) verifies its behaviour directly. It models the exact mechanic M6
 * teaches: a mapped type is a for-loop over `keyof T`, and each key can have its MODIFIERS changed
 * (`+`/`-` on `readonly` and `?`), its NAME remapped (`as`, with template-literal + `Capitalize`),
 * and its VALUE transformed (`T[K]` → `() => T[K]`, `T[K] | null`, …).
 *
 * The subtle, senior-level point it makes concrete: a homomorphic mapped type (one that maps over
 * `keyof T`) PRESERVES the original `readonly`/`?` modifiers, then applies the transform's delta on
 * top — which is exactly why `Partial<Readonly<T>>` keeps things `readonly`. (TS handbook · "Mapped
 * Types"; modifier `+`/`-` prefixes since 2.8; key remapping + template literals since 4.1.)
 */

// ── The input model (an object type = a list of members) ────────────────────────
export type InMember = { name: string; value: string; optional?: boolean; readonly?: boolean };

// ── A mapped transform (how each key is rewritten) ──────────────────────────────
export type ModifierDelta = '+' | '-' | undefined; // add / remove / leave as-is (homomorphic default)
export type KeyRemap = { kind: 'none' } | { kind: 'prefix-capitalize'; prefix: string };
export type ValueOp = { kind: 'same' } | { kind: 'getter' } | { kind: 'nullable' };

export type Transform = {
  id: string;
  name: string;       // display, e.g. 'Partial<T>'
  signature: string;  // the mapped-type source line
  readonly: ModifierDelta;
  optional: ModifierDelta;
  key: KeyRemap;
  value: ValueOp;
};

const capitalize = (s: string): string => (s.length ? s[0].toUpperCase() + s.slice(1) : s);

/** Resolve a modifier: an explicit delta wins; otherwise the input's own modifier is preserved (homomorphic). */
function resolveModifier(delta: ModifierDelta, original: boolean): boolean {
  if (delta === '+') return true;
  if (delta === '-') return false;
  return original; // preserved
}

function remapKey(remap: KeyRemap, name: string): string {
  return remap.kind === 'prefix-capitalize' ? `${remap.prefix}${capitalize(name)}` : name;
}

function transformValue(op: ValueOp, value: string): string {
  switch (op.kind) {
    case 'same': return value;
    case 'getter': return `() => ${value}`;
    case 'nullable': return `${value} | null`;
  }
}

// ── The per-key trace (what the sim reveals one key at a time) ───────────────────
export type KeyStep = {
  origKey: string;           // K
  key: string;               // the (possibly remapped) output key
  value: string;             // the (possibly transformed) output value type
  readonly: boolean;
  optional: boolean;
  readonlyChange: ModifierDelta; // did the modifier actually change vs the input?
  optionalChange: ModifierDelta;
  keyChanged: boolean;
  valueChanged: boolean;
};

export type MappedResult = {
  inputRender: string;   // { … } form of the source
  outputRender: string;  // { … } form of the result
  steps: KeyStep[];      // one per key of the input
};

export function renderMembers(members: InMember[]): string {
  if (members.length === 0) return '{}';
  const body = members
    .map((m) => `${m.readonly ? 'readonly ' : ''}${m.name}${m.optional ? '?' : ''}: ${m.value}`)
    .join('; ');
  return `{ ${body} }`;
}

function renderSteps(steps: KeyStep[]): string {
  if (steps.length === 0) return '{}';
  const body = steps
    .map((s) => `${s.readonly ? 'readonly ' : ''}${s.key}${s.optional ? '?' : ''}: ${s.value}`)
    .join('; ');
  return `{ ${body} }`;
}

/** Apply a mapped transform to an input object type, producing the result + a per-key trace. */
export function applyTransform(input: InMember[], t: Transform): MappedResult {
  const steps: KeyStep[] = input.map((m) => {
    const readonly = resolveModifier(t.readonly, !!m.readonly);
    const optional = resolveModifier(t.optional, !!m.optional);
    const key = remapKey(t.key, m.name);
    const value = transformValue(t.value, m.value);
    return {
      origKey: m.name,
      key,
      value,
      readonly,
      optional,
      readonlyChange: readonly === !!m.readonly ? undefined : readonly ? '+' : '-',
      optionalChange: optional === !!m.optional ? undefined : optional ? '+' : '-',
      keyChanged: key !== m.name,
      valueChanged: value !== m.value,
    };
  });
  return { inputRender: renderMembers(input), outputRender: renderSteps(steps), steps };
}

// ── The sim's input library ──────────────────────────────────────────────────────
export const INPUTS: { id: string; members: InMember[] }[] = [
  { id: 'User', members: [
    { name: 'id', value: 'number' },
    { name: 'name', value: 'string' },
    { name: 'email', value: 'string' },
  ] },
  { id: 'Config', members: [
    { name: 'host', value: 'string', readonly: true },
    { name: 'port', value: 'number' },
    { name: 'debug', value: 'boolean', optional: true },
  ] },
  { id: 'Point', members: [
    { name: 'x', value: 'number' },
    { name: 'y', value: 'number' },
  ] },
];

// ── The sim's transforms (the library, reimplemented from lib.d.ts) ──────────────
export const TRANSFORMS: Transform[] = [
  {
    id: 'partial',
    name: 'Partial<T>',
    signature: 'type Partial<T> = { [K in keyof T]?: T[K] }',
    readonly: undefined, optional: '+', key: { kind: 'none' }, value: { kind: 'same' },
  },
  {
    id: 'required',
    name: 'Required<T>',
    signature: 'type Required<T> = { [K in keyof T]-?: T[K] }',
    readonly: undefined, optional: '-', key: { kind: 'none' }, value: { kind: 'same' },
  },
  {
    id: 'readonly',
    name: 'Readonly<T>',
    signature: 'type Readonly<T> = { readonly [K in keyof T]: T[K] }',
    readonly: '+', optional: undefined, key: { kind: 'none' }, value: { kind: 'same' },
  },
  {
    id: 'mutable',
    name: 'Mutable<T>',
    signature: 'type Mutable<T> = { -readonly [K in keyof T]: T[K] }',
    readonly: '-', optional: undefined, key: { kind: 'none' }, value: { kind: 'same' },
  },
  {
    id: 'nullable',
    name: 'Nullable<T>',
    signature: 'type Nullable<T> = { [K in keyof T]: T[K] | null }',
    readonly: undefined, optional: undefined, key: { kind: 'none' }, value: { kind: 'nullable' },
  },
  {
    id: 'getters',
    name: 'Getters<T>',
    signature: 'type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] }',
    readonly: undefined, optional: undefined, key: { kind: 'prefix-capitalize', prefix: 'get' }, value: { kind: 'getter' },
  },
];

export function inputById(id: string): InMember[] | undefined {
  return INPUTS.find((i) => i.id === id)?.members;
}
export function transformById(id: string): Transform | undefined {
  return TRANSFORMS.find((t) => t.id === id);
}
