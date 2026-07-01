/*
 * tsconfigStrict.ts — a deterministic "strictness explorer" (M11 engine).
 *
 * Pure logic (no React, no i18n) so the ★ strictness sim renders it and the golden test
 * (scripts/test-tsconfigstrict.ts) verifies its behaviour directly. It makes M11's thesis concrete:
 * `"strict": true` is not one switch but a FAMILY of nine flags, each of which catches a specific
 * class of latent bug — and a few equally valuable checks (noUncheckedIndexedAccess,
 * exactOptionalPropertyTypes) live OUTSIDE that family, so "strict" is not the same as "as strict as
 * possible". The engine holds a few small, real code samples; for each it records exactly which flag
 * would raise which diagnostic on which line, with the real TypeScript error code.
 *
 * Findings carry LANGUAGE-NEUTRAL data (a `code` fragment + the real TS `error` text + a `flag`);
 * the component supplies the localized "why this matters" captions keyed by `flag` (mirrors
 * lib/utilityType.ts). Version-sensitive facts web-verified (see the module's sources): the nine
 * members of `strict` and their introduction versions; strictBuiltinIteratorReturn added to the
 * family in 5.6; noUncheckedIndexedAccess (4.1) and exactOptionalPropertyTypes (4.4) are recommended
 * but NOT part of `strict`.
 */

// ── The strict family + the two most-cited "beyond strict" opt-ins ─────────────────────────────────
export type StrictFlag =
  | 'noImplicitAny'
  | 'strictNullChecks'
  | 'strictFunctionTypes'
  | 'strictBindCallApply'
  | 'strictPropertyInitialization'
  | 'noImplicitThis'
  | 'useUnknownInCatchVariables'
  | 'alwaysStrict'
  | 'strictBuiltinIteratorReturn'
  | 'noUncheckedIndexedAccess'
  | 'exactOptionalPropertyTypes';

export type FlagMeta = {
  id: StrictFlag;
  since: string;       // TS version that introduced the flag
  inStrict: boolean;   // true if `"strict": true` turns it on
};

// Canonical teaching order. The first nine ARE `strict` (verified against the TSConfig `strict`
// reference); the last two are recommended add-ons that `strict` deliberately does NOT include.
export const FLAGS: FlagMeta[] = [
  { id: 'noImplicitAny', since: '2.0', inStrict: true },
  { id: 'strictNullChecks', since: '2.0', inStrict: true },
  { id: 'strictFunctionTypes', since: '2.6', inStrict: true },
  { id: 'strictBindCallApply', since: '3.2', inStrict: true },
  { id: 'strictPropertyInitialization', since: '2.7', inStrict: true },
  { id: 'noImplicitThis', since: '2.0', inStrict: true },
  { id: 'useUnknownInCatchVariables', since: '4.4', inStrict: true },
  { id: 'alwaysStrict', since: '2.1', inStrict: true },
  { id: 'strictBuiltinIteratorReturn', since: '5.6', inStrict: true },
  { id: 'noUncheckedIndexedAccess', since: '4.1', inStrict: false },
  { id: 'exactOptionalPropertyTypes', since: '4.4', inStrict: false },
];

export const STRICT_FAMILY: StrictFlag[] = FLAGS.filter((f) => f.inStrict).map((f) => f.id);

const ORDER: Record<StrictFlag, number> = FLAGS.reduce(
  (acc, f, i) => ((acc[f.id] = i), acc),
  {} as Record<StrictFlag, number>,
);

// ── A finding: one flag raising one real diagnostic on one line of a sample ─────────────────────────
export type Finding = {
  flag: StrictFlag;
  line: number;   // 1-based line within the sample
  code: string;   // the offending fragment (language-neutral)
  error: string;  // the REAL TypeScript diagnostic (English, technical — stays English in both langs)
};

export type Sample = {
  id: string;
  label: string;   // short display label
  lines: string[]; // the code, one entry per line (1-based when indexed +1)
  findings: Finding[];
};

// ── The curated samples (each fragment + finding cross-checked against tsc output) ─────────────────
export const SAMPLES: Sample[] = [
  {
    id: 'service',
    label: 'A class with a cache',
    lines: [
      'class UserService {',
      '  private cache: Map<string, User>;',
      '  find(id) {',
      '    const u = this.cache.get(id);',
      '    return u.name;',
      '  }',
      '  async load() {',
      '    try { await risky(); }',
      '    catch (e) { console.log(e.message); }',
      '  }',
      '}',
    ],
    findings: [
      { flag: 'strictPropertyInitialization', line: 2, code: 'private cache: Map<string, User>;', error: "TS2564: Property 'cache' has no initializer and is not definitely assigned in the constructor." },
      { flag: 'noImplicitAny', line: 3, code: 'find(id) {', error: "TS7006: Parameter 'id' implicitly has an 'any' type." },
      { flag: 'strictNullChecks', line: 5, code: 'return u.name;', error: "TS18048: 'u' is possibly 'undefined'." },
      { flag: 'useUnknownInCatchVariables', line: 9, code: 'console.log(e.message);', error: "TS18046: 'e' is of type 'unknown'." },
    ],
  },
  {
    id: 'callbacks',
    label: 'Callbacks & this',
    lines: [
      'type Handler = (e: Event) => void;',
      'function listen(h: Handler) {}',
      'const onClick = (e: MouseEvent) => e.button;',
      'listen(onClick);',
      '',
      'function label() {',
      '  return this.textContent;',
      '}',
      '',
      'function greet(name: string) { return "hi " + name; }',
      'greet.call(null, 123);',
      '',
      'function scan(o: any) {',
      '  with (o) { return x; }',
      '}',
    ],
    findings: [
      { flag: 'strictFunctionTypes', line: 4, code: 'listen(onClick);', error: "TS2345: Argument of type '(e: MouseEvent) => number' is not assignable to parameter of type 'Handler'." },
      { flag: 'noImplicitThis', line: 7, code: 'return this.textContent;', error: "TS2683: 'this' implicitly has type 'any' because it does not have a type annotation." },
      { flag: 'strictBindCallApply', line: 11, code: 'greet.call(null, 123);', error: "TS2345: Argument of type 'number' is not assignable to parameter of type 'string'." },
      { flag: 'alwaysStrict', line: 14, code: 'with (o) { return x; }', error: "TS1101: 'with' statements are not allowed in strict mode." },
    ],
  },
  {
    id: 'config',
    label: 'Config & indexing (beyond strict)',
    lines: [
      'type Options = { debug?: boolean };',
      'const opts: Options = { debug: undefined };',
      '',
      'const env: Record<string, string> = {};',
      'const host = env["DB_HOST"];',
      'host.toUpperCase();',
      '',
      'const list = ["a", "b"];',
      'const third = list[2];',
      'third.length;',
    ],
    findings: [
      { flag: 'exactOptionalPropertyTypes', line: 2, code: 'const opts: Options = { debug: undefined };', error: "TS2375: Type '{ debug: undefined }' is not assignable to type 'Options' with 'exactOptionalPropertyTypes: true'." },
      { flag: 'noUncheckedIndexedAccess', line: 6, code: 'host.toUpperCase();', error: "TS18048: 'host' is possibly 'undefined'." },
      { flag: 'noUncheckedIndexedAccess', line: 10, code: 'third.length;', error: "TS18048: 'third' is possibly 'undefined'." },
    ],
  },
];

// ── Public API ──────────────────────────────────────────────────────────────────
export function flagMeta(id: StrictFlag): FlagMeta {
  return FLAGS.find((f) => f.id === id)!;
}

export function sampleById(id: string): Sample | undefined {
  return SAMPLES.find((s) => s.id === id);
}

/** The findings for a sample, ordered by the canonical flag order (the order the stepper reveals). */
export function analyze(sampleId: string): { sample: Sample; findings: Finding[] } | undefined {
  const sample = sampleById(sampleId);
  if (!sample) return undefined;
  const findings = [...sample.findings].sort((a, b) => ORDER[a.flag] - ORDER[b.flag] || a.line - b.line);
  return { sample, findings };
}

/** The distinct flags that fire on a sample, in canonical order. */
export function firedFlags(sampleId: string): StrictFlag[] {
  const s = sampleById(sampleId);
  if (!s) return [];
  const seen = new Set<StrictFlag>();
  for (const f of s.findings) seen.add(f.flag);
  return FLAGS.filter((f) => seen.has(f.id)).map((f) => f.id);
}
