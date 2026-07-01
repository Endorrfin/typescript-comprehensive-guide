/*
 * utilityType.ts — a correct, deterministic "utility-type decoder" (M7 engine).
 *
 * Pure logic (no React, no i18n) so the ★ utility-type sim renders it and the golden test
 * (scripts/test-utilitytype.ts) verifies its behaviour directly. It makes M7's thesis concrete:
 * every utility in lib.d.ts is ONE of four mechanisms you already met in M5/M6 —
 *   • 'mapped'      — a for-loop over keyof T that reshapes an object  (Partial/Required/Readonly/Pick/Record/Omit)
 *   • 'conditional' — a distributive conditional that FILTERS a union  (Exclude/Extract/NonNullable)
 *   • 'infer'       — a conditional + `infer` that EXTRACTS a position  (ReturnType/Parameters/InstanceType)
 *   • 'recursive'   — a self-referential conditional that unwraps       (Awaited)
 *
 * Each utility carries its real lib.d.ts signature; `expand()` produces the step-by-step reasoning
 * trace the sim reveals. Steps are LANGUAGE-NEUTRAL (an `expr` of pure type code + a structured `kind`);
 * the component supplies the localized captions, keeping the engine i18n-free (mirrors lib/mappedType.ts).
 * Version-sensitive facts web-verified (see the module's sources): Partial/Readonly/Record/Pick 2.1;
 * Required/Exclude/Extract/NonNullable/ReturnType/InstanceType 2.8; Parameters 3.1; Omit 3.5; Awaited 4.5.
 * NonNullable was rewritten in 4.8 from `T extends null|undefined ? never : T` to the intersection `T & {}`.
 */

// ── Mechanism families (the two-branch taxonomy, with infer/recursive as sub-branches) ─────────────
export type Mechanism = 'mapped' | 'conditional' | 'infer' | 'recursive';

// A stable key for the KIND of step; the sim maps each to a localized caption.
export type StepKind =
  | 'keyof' | 'pick-keys' | 'omit-exclude' | 'record-keys' | 'member'
  | 'kept' | 'dropped'
  | 'substitute' | 'match' | 'bind'
  | 'distribute' | 'unwrap' | 'as-is'
  | 'result';

export type Step = {
  n: number;                       // 1-based order
  kind: StepKind;                  // what this step is (localized caption comes from the component)
  expr: string;                    // the type expression at this point — pure code, language-neutral
  tag: Mechanism | 'result';       // colour/badge in the sim; 'result' = the final line
};

export type Expansion = {
  signature: string;               // the real lib.d.ts definition line(s)
  input: string;                   // the rendered input type
  mechanism: Mechanism;            // which family fired
  steps: Step[];                   // the reasoning trace (last step is kind/tag 'result')
  result: string;                  // the concrete output type
};

// ── Per-family input specs (compact, structured — the engine COMPUTES the trace from these) ────────
type Member = { name: string; type: string; optional?: boolean; readonly?: boolean };

type MappedSpec = {
  kind: 'mapped';
  op: 'partial' | 'required' | 'readonly' | 'pick' | 'record' | 'omit';
  members: Member[];               // the source object's members
  keys?: string[];                 // Pick/Omit: the key subset; Record: the key union
  recordVal?: string;              // Record: the shared value type
};
type CondMember = { type: string; matches: boolean }; // matches = assignable to U (Exclude/Extract) / is nullish (NonNullable)
type CondSpec = {
  kind: 'conditional';
  op: 'exclude' | 'extract' | 'nonnull';
  test: string;                    // the U / probe shown in the trace (e.g. `"a"`, `null | undefined`)
  members: CondMember[];
};
type InferSpec = {
  kind: 'infer';
  fn: string;                      // the rendered function/constructor type F
  pattern: string;                 // the extends-clause pattern with `infer`
  bindName: string;                // R or P
  bind: string;                    // what `infer` binds to = the result
};
type AwaitedTerm = { wrappers: number; inner: string }; // Promise<…> nesting depth around a plain inner type
type AwaitedSpec = { kind: 'recursive'; terms: AwaitedTerm[] };

type Spec = MappedSpec | CondSpec | InferSpec | AwaitedSpec;

export type Example = { id: string; label: string; spec: Spec };
export type Utility = {
  id: string;
  name: string;                    // display, e.g. 'Partial<T>'
  signature: string;               // the real lib.d.ts line(s)
  since: string;                   // TS version introduced
  mechanism: Mechanism;
  examples: Example[];
};

type RawStep = Omit<Step, 'n'>;

// ── Renderers ──────────────────────────────────────────────────────────────────
export function renderMembers(members: Member[]): string {
  if (members.length === 0) return '{}';
  const body = members
    .map((m) => `${m.readonly ? 'readonly ' : ''}${m.name}${m.optional ? '?' : ''}: ${m.type}`)
    .join('; ');
  return `{ ${body} }`;
}
const renderUnion = (parts: string[]): string => (parts.length === 0 ? 'never' : parts.join(' | '));
const memberLine = (m: Member): string =>
  `${m.readonly ? 'readonly ' : ''}${m.name}${m.optional ? '?' : ''}: ${m.type}`;
const keyUnion = (names: string[]): string => names.map((k) => `"${k}"`).join(' | ');

// ── mapped: reshape an object by looping over its keys ───────────────────────────
function expandMapped(spec: MappedSpec): { steps: RawStep[]; result: string } {
  const steps: RawStep[] = [];
  const src = spec.members;

  if (spec.op === 'record') {
    const keys = spec.keys ?? [];
    const val = spec.recordVal ?? 'unknown';
    steps.push({ kind: 'record-keys', expr: keyUnion(keys), tag: 'mapped' });
    const out: Member[] = keys.map((k) => ({ name: k, type: val }));
    for (const m of out) steps.push({ kind: 'member', expr: memberLine(m), tag: 'mapped' });
    const result = renderMembers(out);
    steps.push({ kind: 'result', expr: result, tag: 'result' });
    return { steps, result };
  }

  // homomorphic family: map over keyof T, preserving the source's own modifiers
  steps.push({ kind: 'keyof', expr: keyUnion(src.map((m) => m.name)), tag: 'mapped' });

  let keep = src;
  if (spec.op === 'pick') {
    const ks = spec.keys ?? [];
    steps.push({ kind: 'pick-keys', expr: keyUnion(ks), tag: 'mapped' });
    keep = src.filter((m) => ks.includes(m.name));
  } else if (spec.op === 'omit') {
    const ks = spec.keys ?? [];
    const remaining = src.filter((m) => !ks.includes(m.name));
    steps.push({ kind: 'omit-exclude', expr: `Exclude<keyof T, ${keyUnion(ks)}> = ${keyUnion(remaining.map((m) => m.name))}`, tag: 'mapped' });
    keep = remaining;
  }

  const out: Member[] = keep.map((m) => {
    const r: Member = { ...m };
    if (spec.op === 'partial') r.optional = true;
    if (spec.op === 'required') r.optional = false;
    if (spec.op === 'readonly') r.readonly = true;
    return r;
  });
  for (const m of out) steps.push({ kind: 'member', expr: memberLine(m), tag: 'mapped' });

  const result = renderMembers(out);
  steps.push({ kind: 'result', expr: result, tag: 'result' });
  return { steps, result };
}

// ── conditional: distribute over a union, dropping/keeping each member (never = the empty union) ───
function expandConditional(spec: CondSpec): { steps: RawStep[]; result: string } {
  const steps: RawStep[] = [];
  const kept: string[] = [];
  for (const m of spec.members) {
    let keep: boolean;
    let expr: string;
    if (spec.op === 'exclude') {
      keep = !m.matches; // drop members assignable to U
      expr = `${m.type} extends ${spec.test} ? never : ${m.type}  →  ${keep ? m.type : 'never'}`;
    } else if (spec.op === 'extract') {
      keep = m.matches; // keep members assignable to U
      expr = `${m.type} extends ${spec.test} ? ${m.type} : never  →  ${keep ? m.type : 'never'}`;
    } else {
      keep = !m.matches; // nonnull: {} absorbs everything except null/undefined
      expr = `${m.type} & {}  →  ${keep ? m.type : 'never'}`;
    }
    if (keep) kept.push(m.type);
    steps.push({ kind: keep ? 'kept' : 'dropped', expr, tag: 'conditional' });
  }
  const result = renderUnion(kept);
  steps.push({ kind: 'result', expr: result, tag: 'result' });
  return { steps, result };
}

// ── infer: pattern-match a function/constructor and bind a position ──────────────
function expandInfer(spec: InferSpec): { steps: RawStep[]; result: string } {
  const steps: RawStep[] = [
    { kind: 'substitute', expr: `${spec.fn} extends ${spec.pattern} ? ${spec.bindName} : …`, tag: 'infer' },
    { kind: 'match', expr: spec.fn, tag: 'infer' },
    { kind: 'bind', expr: `${spec.bindName} = ${spec.bind}`, tag: 'infer' },
    { kind: 'result', expr: spec.bind, tag: 'result' },
  ];
  return { steps, result: spec.bind };
}

// ── recursive: Awaited unwraps each Promise/thenable layer, distributing over unions ─────────────
const wrap = (t: AwaitedTerm): string => {
  let s = t.inner;
  for (let i = 0; i < t.wrappers; i++) s = `Promise<${s}>`;
  return s;
};
function expandAwaited(spec: AwaitedSpec): { steps: RawStep[]; result: string } {
  const steps: RawStep[] = [];
  const union = spec.terms.length > 1;
  if (union) steps.push({ kind: 'distribute', expr: spec.terms.map(wrap).join(' | '), tag: 'recursive' });

  const inners: string[] = [];
  for (const t of spec.terms) {
    let cur = wrap(t);
    for (let d = t.wrappers; d > 0; d--) {
      const next = d - 1 === 0 ? t.inner : wrap({ wrappers: d - 1, inner: t.inner });
      steps.push({ kind: 'unwrap', expr: `${cur}  →  ${next}`, tag: 'recursive' });
      cur = next;
    }
    if (t.wrappers === 0) steps.push({ kind: 'as-is', expr: cur, tag: 'recursive' });
    inners.push(t.inner);
  }
  const result = renderUnion(inners);
  steps.push({ kind: 'result', expr: result, tag: 'result' });
  return { steps, result };
}

// ── render the input type (for the sim header) ───────────────────────────────────
function renderInput(spec: Spec): string {
  switch (spec.kind) {
    case 'mapped':
      return spec.op === 'record'
        ? `${keyUnion(spec.keys ?? [])}, ${spec.recordVal}`
        : renderMembers(spec.members);
    case 'conditional':
      return renderUnion(spec.members.map((m) => m.type));
    case 'infer':
      return spec.fn;
    case 'recursive':
      return renderUnion(spec.terms.map(wrap));
  }
}

// ── The public entry point ───────────────────────────────────────────────────────
export function expand(utilityId: string, exampleId: string): Expansion | undefined {
  const u = utilityById(utilityId);
  const ex = u?.examples.find((e) => e.id === exampleId);
  if (!u || !ex) return undefined;

  let out: { steps: RawStep[]; result: string };
  switch (ex.spec.kind) {
    case 'mapped': out = expandMapped(ex.spec); break;
    case 'conditional': out = expandConditional(ex.spec); break;
    case 'infer': out = expandInfer(ex.spec); break;
    case 'recursive': out = expandAwaited(ex.spec); break;
  }
  const steps: Step[] = out.steps.map((s, i) => ({ ...s, n: i + 1 }));
  return { signature: u.signature, input: renderInput(ex.spec), mechanism: u.mechanism, steps, result: out.result };
}

// ── The curated library (each is one real lib.d.ts line, grouped by mechanism) ───
const M = (name: string, type: string, mods?: Partial<Member>): Member => ({ name, type, ...mods });

export const UTILITIES: Utility[] = [
  // ── mapped ──────────────────────────────────────────────────────────────────
  {
    id: 'partial', name: 'Partial<T>', since: '2.1', mechanism: 'mapped',
    signature: 'type Partial<T> = { [P in keyof T]?: T[P] }',
    examples: [
      { id: 'User', label: 'Partial<User>', spec: { kind: 'mapped', op: 'partial', members: [M('id', 'number'), M('name', 'string'), M('email', 'string')] } },
      { id: 'Config', label: 'Partial<Config>', spec: { kind: 'mapped', op: 'partial', members: [M('host', 'string', { readonly: true }), M('port', 'number')] } },
    ],
  },
  {
    id: 'required', name: 'Required<T>', since: '2.8', mechanism: 'mapped',
    signature: 'type Required<T> = { [P in keyof T]-?: T[P] }',
    examples: [
      { id: 'Props', label: 'Required<Props>', spec: { kind: 'mapped', op: 'required', members: [M('a', 'number', { optional: true }), M('b', 'string', { optional: true })] } },
    ],
  },
  {
    id: 'readonly', name: 'Readonly<T>', since: '2.1', mechanism: 'mapped',
    signature: 'type Readonly<T> = { readonly [P in keyof T]: T[P] }',
    examples: [
      { id: 'Point', label: 'Readonly<Point>', spec: { kind: 'mapped', op: 'readonly', members: [M('x', 'number'), M('y', 'number')] } },
    ],
  },
  {
    id: 'pick', name: 'Pick<T, K>', since: '2.1', mechanism: 'mapped',
    signature: 'type Pick<T, K extends keyof T> = { [P in K]: T[P] }',
    examples: [
      { id: 'Todo', label: 'Pick<Todo, "title" | "completed">', spec: { kind: 'mapped', op: 'pick', members: [M('title', 'string'), M('description', 'string'), M('completed', 'boolean')], keys: ['title', 'completed'] } },
    ],
  },
  {
    id: 'record', name: 'Record<K, V>', since: '2.1', mechanism: 'mapped',
    signature: 'type Record<K extends keyof any, T> = { [P in K]: T }',
    examples: [
      { id: 'roles', label: 'Record<"admin" | "user", boolean>', spec: { kind: 'mapped', op: 'record', members: [], keys: ['admin', 'user'], recordVal: 'boolean' } },
    ],
  },
  {
    id: 'omit', name: 'Omit<T, K>', since: '3.5', mechanism: 'mapped',
    signature: 'type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>',
    examples: [
      { id: 'Todo', label: 'Omit<Todo, "description">', spec: { kind: 'mapped', op: 'omit', members: [M('title', 'string'), M('description', 'string'), M('completed', 'boolean')], keys: ['description'] } },
    ],
  },
  // ── conditional (distributive filter) ─────────────────────────────────────────
  {
    id: 'exclude', name: 'Exclude<T, U>', since: '2.8', mechanism: 'conditional',
    signature: 'type Exclude<T, U> = T extends U ? never : T',
    examples: [
      { id: 'abc', label: 'Exclude<"a" | "b" | "c", "a">', spec: { kind: 'conditional', op: 'exclude', test: '"a"', members: [{ type: '"a"', matches: true }, { type: '"b"', matches: false }, { type: '"c"', matches: false }] } },
    ],
  },
  {
    id: 'extract', name: 'Extract<T, U>', since: '2.8', mechanism: 'conditional',
    signature: 'type Extract<T, U> = T extends U ? T : never',
    examples: [
      { id: 'abc', label: 'Extract<"a" | "b" | "c", "a" | "f">', spec: { kind: 'conditional', op: 'extract', test: '"a" | "f"', members: [{ type: '"a"', matches: true }, { type: '"b"', matches: false }, { type: '"c"', matches: false }] } },
    ],
  },
  {
    id: 'nonnullable', name: 'NonNullable<T>', since: '2.8', mechanism: 'conditional',
    signature: 'type NonNullable<T> = T & {}',
    examples: [
      { id: 'snu', label: 'NonNullable<string | number | undefined>', spec: { kind: 'conditional', op: 'nonnull', test: 'null | undefined', members: [{ type: 'string', matches: false }, { type: 'number', matches: false }, { type: 'undefined', matches: true }] } },
    ],
  },
  // ── infer (conditional + infer extraction) ────────────────────────────────────
  {
    id: 'returntype', name: 'ReturnType<T>', since: '2.8', mechanism: 'infer',
    signature: 'type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any',
    examples: [
      { id: 'f', label: 'ReturnType<() => string>', spec: { kind: 'infer', fn: '() => string', pattern: '(...args: any) => infer R', bindName: 'R', bind: 'string' } },
      { id: 'g', label: 'ReturnType<(id: number) => User>', spec: { kind: 'infer', fn: '(id: number) => User', pattern: '(...args: any) => infer R', bindName: 'R', bind: 'User' } },
    ],
  },
  {
    id: 'parameters', name: 'Parameters<T>', since: '3.1', mechanism: 'infer',
    signature: 'type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never',
    examples: [
      { id: 'f', label: 'Parameters<(s: string, n: number) => void>', spec: { kind: 'infer', fn: '(s: string, n: number) => void', pattern: '(...args: infer P) => any', bindName: 'P', bind: '[s: string, n: number]' } },
    ],
  },
  {
    id: 'instancetype', name: 'InstanceType<T>', since: '2.8', mechanism: 'infer',
    signature: 'type InstanceType<T extends abstract new (...args: any) => any> = T extends abstract new (...args: any) => infer R ? R : any',
    examples: [
      { id: 'C', label: 'InstanceType<typeof C>', spec: { kind: 'infer', fn: 'typeof C', pattern: 'abstract new (...args: any) => infer R', bindName: 'R', bind: 'C' } },
    ],
  },
  // ── recursive (Awaited) ───────────────────────────────────────────────────────
  {
    id: 'awaited', name: 'Awaited<T>', since: '4.5', mechanism: 'recursive',
    signature: 'type Awaited<T> =\n  T extends null | undefined ? T :\n  T extends object & { then(onfulfilled: infer F, ...a: infer _): any } ?\n    F extends (value: infer V, ...a: infer _) => any ? Awaited<V> : never :\n  T',
    examples: [
      { id: 'p1', label: 'Awaited<Promise<string>>', spec: { kind: 'recursive', terms: [{ wrappers: 1, inner: 'string' }] } },
      { id: 'p2', label: 'Awaited<Promise<Promise<number>>>', spec: { kind: 'recursive', terms: [{ wrappers: 2, inner: 'number' }] } },
      { id: 'union', label: 'Awaited<Promise<number> | boolean>', spec: { kind: 'recursive', terms: [{ wrappers: 1, inner: 'number' }, { wrappers: 0, inner: 'boolean' }] } },
    ],
  },
];

export const MECHANISMS: Mechanism[] = ['mapped', 'conditional', 'infer', 'recursive'];

export function utilityById(id: string): Utility | undefined {
  return UTILITIES.find((u) => u.id === id);
}
