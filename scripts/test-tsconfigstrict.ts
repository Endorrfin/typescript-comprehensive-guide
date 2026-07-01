/*
 * test-tsconfigstrict.ts — golden tests for the M11 strictness explorer (src/lib/tsconfigStrict.ts).
 * Auto-discovered by scripts/run-tests.ts (`npm test`) and run in CI before build. Verifies M11's
 * thesis: `strict` is a family of nine flags (not one switch), each catching a specific latent bug,
 * and two equally useful checks live OUTSIDE it. Flag membership + versions were cross-checked against
 * the TSConfig `strict` reference; each sample fragment + diagnostic against tsc's output.
 */
import { analyze, FLAGS, firedFlags, flagMeta, SAMPLES, sampleById, STRICT_FAMILY } from '../src/lib/tsconfigStrict';
import type { StrictFlag } from '../src/lib/tsconfigStrict';

let failures = 0;
let checks = 0;
function assert(cond: boolean, msg: string): void {
  checks++;
  if (!cond) {
    failures++;
    console.error('  ✖ ' + msg);
  }
}

// ── the family: exactly nine flags are in `strict`, in the documented order ─────────────
const EXPECTED_STRICT: StrictFlag[] = [
  'noImplicitAny', 'strictNullChecks', 'strictFunctionTypes', 'strictBindCallApply',
  'strictPropertyInitialization', 'noImplicitThis', 'useUnknownInCatchVariables',
  'alwaysStrict', 'strictBuiltinIteratorReturn',
];
assert(STRICT_FAMILY.length === 9, '`strict` is a family of exactly nine flags');
assert(STRICT_FAMILY.join(',') === EXPECTED_STRICT.join(','), 'the nine strict flags are in the documented order');

// the two most-cited add-ons are present but NOT in strict
assert(flagMeta('noUncheckedIndexedAccess').inStrict === false, 'noUncheckedIndexedAccess is NOT part of strict (4.1)');
assert(flagMeta('exactOptionalPropertyTypes').inStrict === false, 'exactOptionalPropertyTypes is NOT part of strict (4.4)');
assert(FLAGS.length === 11, 'FLAGS = the 9 strict members + 2 recommended add-ons');

// version provenance sanity (a few load-bearing ones)
assert(flagMeta('strictNullChecks').since === '2.0', 'strictNullChecks landed in 2.0');
assert(flagMeta('strictFunctionTypes').since === '2.6', 'strictFunctionTypes landed in 2.6');
assert(flagMeta('useUnknownInCatchVariables').since === '4.4', 'useUnknownInCatchVariables landed in 4.4');
assert(flagMeta('strictBuiltinIteratorReturn').since === '5.6', 'strictBuiltinIteratorReturn joined strict in 5.6');

// ── per-sample findings are real, ordered, and on valid lines ────────────────────────────
for (const s of SAMPLES) {
  const a = analyze(s.id)!;
  assert(!!a, `${s.id}: analyzes`);
  assert(a.findings.length >= 2, `${s.id}: surfaces at least two latent bugs`);
  // canonical order (by flag, then line)
  const order = FLAGS.map((f) => f.id);
  const idx = (f: StrictFlag) => order.indexOf(f);
  assert(
    a.findings.every((f, i) => i === 0 || idx(a.findings[i - 1].flag) < idx(f.flag) || (a.findings[i - 1].flag === f.flag && a.findings[i - 1].line <= f.line)),
    `${s.id}: findings are sorted by canonical flag order`,
  );
  for (const f of a.findings) {
    assert(f.line >= 1 && f.line <= s.lines.length, `${s.id}: finding line ${f.line} is within the sample`);
    assert(/^TS\d{3,5}: /.test(f.error), `${s.id}: '${f.flag}' carries a real TSxxxx diagnostic`);
    assert(f.code.trim().length > 0, `${s.id}: '${f.flag}' points at a code fragment`);
    // the offending fragment should actually appear on the cited line (keeps data honest)
    assert(s.lines[f.line - 1].includes(f.code.trim()) || f.code.includes(s.lines[f.line - 1].trim()), `${s.id}: '${f.flag}' fragment matches its line`);
  }
}

// ── specific, memorable diagnostics ──────────────────────────────────────────────────────
const service = analyze('service')!.findings;
assert(service.some((f) => f.flag === 'noImplicitAny' && f.error.includes('TS7006')), 'the untyped param trips noImplicitAny (TS7006)');
assert(service.some((f) => f.flag === 'strictNullChecks' && f.error.includes("possibly 'undefined'")), 'Map.get() forces the possibly-undefined check under strictNullChecks');
assert(service.some((f) => f.flag === 'useUnknownInCatchVariables' && f.error.includes('TS18046')), 'the catch variable is unknown, not any (TS18046)');

const callbacks = analyze('callbacks')!.findings;
assert(callbacks.some((f) => f.flag === 'strictFunctionTypes' && f.error.includes('TS2345')), 'the narrower callback param is rejected under strictFunctionTypes');
assert(callbacks.some((f) => f.flag === 'noImplicitThis' && f.error.includes('TS2683')), 'a free function referencing this trips noImplicitThis (TS2683)');
assert(callbacks.some((f) => f.flag === 'alwaysStrict'), 'the with-statement is a parse error under alwaysStrict');

const config = analyze('config')!.findings;
assert(config.every((f) => flagMeta(f.flag).inStrict === false), 'the config sample fires only BEYOND-strict flags — strict alone would miss these');
assert(config.filter((f) => f.flag === 'noUncheckedIndexedAccess').length === 2, 'both index accesses are possibly-undefined under noUncheckedIndexedAccess');

// ── coverage: the samples together demonstrate the whole demonstrable family ──────────────
const allFired = new Set<StrictFlag>(SAMPLES.flatMap((s) => firedFlags(s.id)));
// strictBuiltinIteratorReturn is listed-but-not-demoed (its effect is niche); the other 8 strict flags fire:
for (const f of STRICT_FAMILY.filter((x) => x !== 'strictBuiltinIteratorReturn')) {
  assert(allFired.has(f), `some sample demonstrates ${f}`);
}
assert(!allFired.has('strictBuiltinIteratorReturn'), 'strictBuiltinIteratorReturn is listed in the family but not force-demoed (niche effect)');

// ── guards ────────────────────────────────────────────────────────────────────────────────
assert(analyze('nope') === undefined, 'analyze returns undefined for a bad sample id');
assert(sampleById('service')!.label.length > 0, 'sampleById resolves');
assert(firedFlags('nope').length === 0, 'firedFlags is empty for a bad id');

console.log(`\n— strictness explorer — ${checks} checks, ${failures} failed.`);
process.exit(failures > 0 ? 1 : 0);
