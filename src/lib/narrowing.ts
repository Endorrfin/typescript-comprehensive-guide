/*
 * narrowing.ts — a small, correct control-flow-analysis interpreter (M2 engine).
 *
 * Pure logic (no React, no i18n) so the ★ narrowing sim renders it and the golden test
 * (scripts/test-narrowing.ts) verifies its behaviour directly. It models the exact mechanic M2
 * teaches: a variable starts as a union and every guard along a code path *shrinks* that union,
 * branch by branch, until a discriminated `switch` bottoms out in `never` (exhaustiveness).
 *
 * We do NOT parse TypeScript — each preset is a tiny structured program of guarded blocks. The
 * engine walks it, applying each guard to the current member set to compute the narrowed type at
 * every line. (TS handbook · "Narrowing".)
 */

// ── The union-member model ──────────────────────────────────────────────────────
export type TypeofTag =
  | 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function';

/** One constituent of the tracked variable's union type. */
export type Member = {
  id: string;                       // unique key
  render: string;                   // how it prints in a union (e.g. 'string', 'Circle', 'null')
  typeof?: TypeofTag;               // result of the JS `typeof` operator (note: typeof null === 'object')
  truthy?: 'always' | 'never' | 'maybe'; // for truthiness narrowing; default 'maybe'
  nullish?: 'null' | 'undefined';   // participates in `== null` / `=== null`
  props?: string[];                 // property names present (for the `in` operator)
  ctor?: string;                    // class name (for `instanceof`)
  tag?: { field: string; value: string }; // discriminant, e.g. { field: 'kind', value: 'circle' }
  guard?: string;                   // name matched by a user-defined type predicate (e.g. 'Fish')
};

const truthyOf = (m: Member): 'always' | 'never' | 'maybe' => m.truthy ?? 'maybe';

/** Render a member set back to a union type — the empty set is `never`. */
export function renderSet(members: Member[]): string {
  return members.length === 0 ? 'never' : members.map((m) => m.render).join(' | ');
}

// ── Guards (the narrowing constructs) ───────────────────────────────────────────
export type Guard =
  | { g: 'typeof'; op: '===' | '!=='; value: TypeofTag }
  | { g: 'truthy'; negate?: boolean }
  | { g: 'eq'; op: '===' | '!==' | '==' | '!='; value: 'null' | 'undefined' }
  | { g: 'in'; prop: string }
  | { g: 'instanceof'; ctor: string }
  | { g: 'tag'; field: string; value: string; op?: '===' | '!==' }
  | { g: 'predicate'; guard: string };

/**
 * Split a member set by a guard into its true-branch (`pass`) and false-branch (`fail`).
 * For most guards these partition the set; for truthiness a 'maybe' member (e.g. a broad `string`,
 * which includes the falsy "") legitimately appears in BOTH branches.
 */
export function applyGuard(members: Member[], guard: Guard): { pass: Member[]; fail: Member[] } {
  const pass: Member[] = [];
  const fail: Member[] = [];
  for (const m of members) {
    if (guard.g === 'truthy') {
      const canTruthy = truthyOf(m) !== 'never';
      const canFalsy = truthyOf(m) !== 'always';
      const inPass = guard.negate ? canFalsy : canTruthy;
      const inFail = guard.negate ? canTruthy : canFalsy;
      if (inPass) pass.push(m);
      if (inFail) fail.push(m);
      continue;
    }
    let hit: boolean;
    switch (guard.g) {
      case 'typeof':
        hit = m.typeof === guard.value;
        if (guard.op === '!==') hit = !hit;
        break;
      case 'eq': {
        const isNull = m.nullish === 'null';
        const isUndef = m.nullish === 'undefined';
        const loose = guard.op === '==' || guard.op === '!=';
        const matchesValue = loose ? isNull || isUndef : m.nullish === guard.value; // == null hits both
        const positive = guard.op === '===' || guard.op === '==';
        hit = positive ? matchesValue : !matchesValue;
        break;
      }
      case 'in':
        hit = !!m.props?.includes(guard.prop);
        break;
      case 'instanceof':
        hit = m.ctor === guard.ctor;
        break;
      case 'tag':
        hit = m.tag?.field === guard.field && m.tag.value === guard.value;
        if (guard.op === '!==') hit = !hit;
        break;
      case 'predicate':
        hit = m.guard === guard.guard;
        break;
    }
    (hit ? pass : fail).push(m);
  }
  return { pass, fail };
}

// ── The program model (a tiny structured snippet the engine walks) ──────────────
export type Node =
  | { n: 'sig'; code: string }                              // structural line (type alias, fn signature, brace)
  | { n: 'decl'; code: string }                             // the declaration of the tracked variable
  | { n: 'use'; code: string }                              // a line that uses the variable (shows its type)
  | { n: 'if'; guard: Guard; code: string }                // opens a true-branch block
  | { n: 'elif'; guard: Guard; code: string }              // else-if in the same chain
  | { n: 'else'; code: string }                            // else branch (the chain's remaining members)
  | { n: 'end'; code: string }                             // closes an if/else chain (restore outer type)
  | { n: 'assert'; guard: Guard; code: string }            // assertion function — narrows the rest of scope
  | { n: 'switch'; field: string; code: string }           // opens a switch on a discriminant field
  | { n: 'case'; value: string; code: string }             // a case arm (narrow to the tagged member)
  | { n: 'default'; code: string }                         // the default arm (whatever is left)
  | { n: 'never'; code: string }                           // `const _: never = x` — exhaustiveness assertion
  | { n: 'endswitch'; code: string };                      // closes the switch

export type Snippet = {
  id: string;
  label: string;      // short English label (the sim localizes only chrome, code stays English)
  varName: string;
  declared: Member[]; // the initial union
  program: Node[];
};

// ── The rendered output (what the sim reveals line by line) ─────────────────────
export type Line = {
  code: string;
  kind: Node['n'];
  narrowed: string;  // the tracked variable's type AT this line
  show: boolean;     // whether to display the narrowed-type badge
  isNever: boolean;  // narrowed === 'never'
  ok: boolean;       // false only when a `never` exhaustiveness assertion has leftover members
};

type IfFrame = { kind: 'if'; outer: Member[]; remaining: Member[] };
type SwFrame = { kind: 'switch'; field: string; outer: Member[]; subject: Member[]; remaining: Member[] };

/** Walk a snippet, producing one rendered line per node with the narrowed type computed at each. */
export function run(snippet: Snippet): Line[] {
  let cur: Member[] = snippet.declared;
  const stack: (IfFrame | SwFrame)[] = [];
  const topIf = (): IfFrame => {
    const f = stack[stack.length - 1];
    if (!f || f.kind !== 'if') throw new Error('expected an if-frame');
    return f;
  };
  const topSwitch = (): SwFrame => {
    const f = stack[stack.length - 1];
    if (!f || f.kind !== 'switch') throw new Error('expected a switch-frame');
    return f;
  };

  const out: Line[] = [];
  const emit = (code: string, kind: Node['n'], show: boolean, ok = true): void => {
    out.push({ code, kind, narrowed: renderSet(cur), show, isNever: cur.length === 0, ok });
  };

  for (const node of snippet.program) {
    switch (node.n) {
      case 'sig':
        out.push({ code: node.code, kind: 'sig', narrowed: '', show: false, isNever: false, ok: true });
        break;
      case 'decl':
      case 'use':
        emit(node.code, node.n, true);
        break;
      case 'if': {
        const { pass, fail } = applyGuard(cur, node.guard);
        stack.push({ kind: 'if', outer: cur, remaining: fail });
        cur = pass;
        emit(node.code, 'if', true);
        break;
      }
      case 'elif': {
        const f = topIf();
        const { pass, fail } = applyGuard(f.remaining, node.guard);
        f.remaining = fail;
        cur = pass;
        emit(node.code, 'elif', true);
        break;
      }
      case 'else': {
        const f = topIf();
        cur = f.remaining;
        emit(node.code, 'else', true);
        break;
      }
      case 'end': {
        const f = topIf();
        cur = f.outer;
        stack.pop();
        out.push({ code: node.code, kind: 'end', narrowed: '', show: false, isNever: false, ok: true });
        break;
      }
      case 'assert': {
        cur = applyGuard(cur, node.guard).pass; // narrows for the remainder of the scope
        emit(node.code, 'assert', true);
        break;
      }
      case 'switch':
        stack.push({ kind: 'switch', field: node.field, outer: cur, subject: cur, remaining: cur });
        emit(node.code, 'switch', true);
        break;
      case 'case': {
        const f = topSwitch();
        const matched = f.subject.filter((m) => m.tag?.field === f.field && m.tag.value === node.value);
        const ids = new Set(matched.map((m) => m.id));
        f.remaining = f.remaining.filter((m) => !ids.has(m.id));
        cur = matched;
        emit(node.code, 'case', true);
        break;
      }
      case 'default': {
        const f = topSwitch();
        cur = f.remaining;
        emit(node.code, 'default', true);
        break;
      }
      case 'never':
        // The `const _exhaustive: never = x` line: sound only if nothing is left to assign.
        emit(node.code, 'never', true, cur.length === 0);
        break;
      case 'endswitch': {
        const f = topSwitch();
        cur = f.outer;
        stack.pop();
        out.push({ code: node.code, kind: 'endswitch', narrowed: '', show: false, isNever: false, ok: true });
        break;
      }
    }
  }
  return out;
}

// ── Member shorthands ────────────────────────────────────────────────────────────
const mString: Member = { id: 'string', render: 'string', typeof: 'string', truthy: 'maybe' };
const mNumber: Member = { id: 'number', render: 'number', typeof: 'number', truthy: 'maybe' };
const mUndef: Member = { id: 'undefined', render: 'undefined', typeof: 'undefined', truthy: 'never', nullish: 'undefined' };
const mNull: Member = { id: 'null', render: 'null', typeof: 'object', truthy: 'never', nullish: 'null' };
const Fish: Member = { id: 'Fish', render: 'Fish', typeof: 'object', truthy: 'always', props: ['name', 'swim'], ctor: 'Fish', guard: 'Fish' };
const Bird: Member = { id: 'Bird', render: 'Bird', typeof: 'object', truthy: 'always', props: ['name', 'fly'], ctor: 'Bird', guard: 'Bird' };
const DateM: Member = { id: 'Date', render: 'Date', typeof: 'object', truthy: 'always', props: ['getTime'], ctor: 'Date' };
const Circle: Member = { id: 'Circle', render: 'Circle', typeof: 'object', truthy: 'always', tag: { field: 'kind', value: 'circle' }, props: ['kind', 'r'] };
const Square: Member = { id: 'Square', render: 'Square', typeof: 'object', truthy: 'always', tag: { field: 'kind', value: 'square' }, props: ['kind', 'side'] };
const Triangle: Member = { id: 'Triangle', render: 'Triangle', typeof: 'object', truthy: 'always', tag: { field: 'kind', value: 'triangle' }, props: ['kind', 'base', 'height'] };

// ── The sim's presets (one per narrowing construct M2 teaches) ──────────────────
export const SNIPPETS: Snippet[] = [
  {
    id: 'typeof',
    label: 'typeof guard',
    varName: 'x',
    declared: [mString, mNumber, mUndef],
    program: [
      { n: 'decl', code: 'let x: string | number | undefined' },
      { n: 'if', guard: { g: 'typeof', op: '===', value: 'string' }, code: "if (typeof x === 'string') {" },
      { n: 'use', code: '  x.toUpperCase()' },
      { n: 'elif', guard: { g: 'typeof', op: '===', value: 'number' }, code: "} else if (typeof x === 'number') {" },
      { n: 'use', code: '  x.toFixed(2)' },
      { n: 'else', code: '} else {' },
      { n: 'use', code: '  // nothing left but undefined' },
      { n: 'end', code: '}' },
    ],
  },
  {
    id: 'equality-nullish',
    label: '!= null (drops null AND undefined)',
    varName: 's',
    declared: [mString, mNull, mUndef],
    program: [
      { n: 'decl', code: 'let s: string | null | undefined' },
      { n: 'if', guard: { g: 'eq', op: '!=', value: 'null' }, code: 'if (s != null) {' },
      { n: 'use', code: '  s.toUpperCase()' },
      { n: 'else', code: '} else {' },
      { n: 'use', code: '  // s is null | undefined here' },
      { n: 'end', code: '}' },
    ],
  },
  {
    id: 'in-operator',
    label: 'in operator',
    varName: 'pet',
    declared: [Fish, Bird],
    program: [
      { n: 'decl', code: 'let pet: Fish | Bird' },
      { n: 'if', guard: { g: 'in', prop: 'swim' }, code: "if ('swim' in pet) {" },
      { n: 'use', code: '  pet.swim()' },
      { n: 'else', code: '} else {' },
      { n: 'use', code: '  pet.fly()' },
      { n: 'end', code: '}' },
    ],
  },
  {
    id: 'instanceof',
    label: 'instanceof',
    varName: 'x',
    declared: [DateM, mString],
    program: [
      { n: 'decl', code: 'let x: Date | string' },
      { n: 'if', guard: { g: 'instanceof', ctor: 'Date' }, code: 'if (x instanceof Date) {' },
      { n: 'use', code: '  x.toISOString()' },
      { n: 'else', code: '} else {' },
      { n: 'use', code: '  x.toUpperCase()' },
      { n: 'end', code: '}' },
    ],
  },
  {
    id: 'predicate',
    label: 'user-defined type predicate',
    varName: 'pet',
    declared: [Fish, Bird],
    program: [
      { n: 'sig', code: 'function isFish(p: Fish | Bird): p is Fish {' },
      { n: 'sig', code: "  return (p as Fish).swim !== undefined" },
      { n: 'sig', code: '}' },
      { n: 'decl', code: 'let pet: Fish | Bird' },
      { n: 'if', guard: { g: 'predicate', guard: 'Fish' }, code: 'if (isFish(pet)) {' },
      { n: 'use', code: '  pet.swim()' },
      { n: 'else', code: '} else {' },
      { n: 'use', code: '  pet.fly()' },
      { n: 'end', code: '}' },
    ],
  },
  {
    id: 'assertion',
    label: 'assertion function (asserts)',
    varName: 'val',
    declared: [mString, mNumber],
    program: [
      { n: 'sig', code: 'function assertString(v: unknown): asserts v is string {' },
      { n: 'sig', code: "  if (typeof v !== 'string') throw new Error()" },
      { n: 'sig', code: '}' },
      { n: 'decl', code: 'let val: string | number' },
      { n: 'assert', guard: { g: 'typeof', op: '===', value: 'string' }, code: 'assertString(val)' },
      { n: 'use', code: '  val.toUpperCase()  // narrowed for the rest of the scope' },
    ],
  },
  {
    id: 'discriminated',
    label: 'discriminated union → never (exhaustive)',
    varName: 's',
    declared: [Circle, Square, Triangle],
    program: [
      { n: 'sig', code: 'type Shape = Circle | Square | Triangle' },
      { n: 'sig', code: 'function area(s: Shape) {' },
      { n: 'switch', field: 'kind', code: '  switch (s.kind) {' },
      { n: 'case', value: 'circle', code: "    case 'circle':" },
      { n: 'use', code: '      return Math.PI * s.r ** 2' },
      { n: 'case', value: 'square', code: "    case 'square':" },
      { n: 'use', code: '      return s.side ** 2' },
      { n: 'case', value: 'triangle', code: "    case 'triangle':" },
      { n: 'use', code: '      return (s.base * s.height) / 2' },
      { n: 'default', code: '    default:' },
      { n: 'never', code: '      const _exhaustive: never = s' },
      { n: 'endswitch', code: '  }' },
    ],
  },
  {
    id: 'discriminated-missing',
    label: 'discriminated union — a case is missing',
    varName: 's',
    declared: [Circle, Square, Triangle],
    program: [
      { n: 'sig', code: 'type Shape = Circle | Square | Triangle' },
      { n: 'sig', code: 'function area(s: Shape) {' },
      { n: 'switch', field: 'kind', code: '  switch (s.kind) {' },
      { n: 'case', value: 'circle', code: "    case 'circle':" },
      { n: 'use', code: '      return Math.PI * s.r ** 2' },
      { n: 'case', value: 'square', code: "    case 'square':" },
      { n: 'use', code: '      return s.side ** 2' },
      { n: 'default', code: '    default:' },
      { n: 'never', code: '      const _exhaustive: never = s  // ✗ Triangle is not assignable to never' },
      { n: 'endswitch', code: '  }' },
    ],
  },
];

export function snippetById(id: string): Snippet | undefined {
  return SNIPPETS.find((s) => s.id === id);
}
