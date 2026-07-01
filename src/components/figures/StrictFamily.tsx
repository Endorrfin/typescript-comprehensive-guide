/* Static diagram (M11): `strict: true` is one switch that turns on NINE checks — not a single check.
   Two more equally useful flags (noUncheckedIndexedAccess, exactOptionalPropertyTypes) sit OUTSIDE the
   family, so "strict" is not the same as "as strict as possible". */
const STRICT = [
  'noImplicitAny',
  'strictNullChecks',
  'strictFunctionTypes',
  'strictBindCallApply',
  'strictPropertyInitialization',
  'noImplicitThis',
  'useUnknownInCatchVariables',
  'alwaysStrict',
  'strictBuiltinIteratorReturn',
];
const BEYOND = ['noUncheckedIndexedAccess', 'exactOptionalPropertyTypes'];

export function StrictFamily() {
  const rowH = 26;
  const top = 60;
  return (
    <svg
      viewBox="0 0 660 400"
      width="100%"
      role="img"
      aria-label="The strict compiler option is a single switch that enables nine separate checks: noImplicitAny, strictNullChecks, strictFunctionTypes, strictBindCallApply, strictPropertyInitialization, noImplicitThis, useUnknownInCatchVariables, alwaysStrict and strictBuiltinIteratorReturn. Two further recommended checks, noUncheckedIndexedAccess and exactOptionalPropertyTypes, are shown outside the family because strict does not include them."
      style={{ maxWidth: 660 }}
    >
      <title>strict is nine flags, not one — and two useful checks live outside it</title>

      <text x="20" y="26" fontFamily="var(--font-body)" fontSize="13" fontWeight="600" fill="var(--accent-bright)">
        “strict”: true — one switch, nine checks
      </text>

      {/* the master switch */}
      <rect x="24" y={top + 3 * rowH} width="150" height="56" rx="11" fill="var(--accent-soft)" stroke="var(--accent-deep)" strokeWidth="1.8" />
      <text x="99" y={top + 3 * rowH + 26} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fill="var(--tx)">{'"strict": true'}</text>
      <text x="99" y={top + 3 * rowH + 44} textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fill="var(--tx3)">the master switch</text>

      {/* the nine strict flags */}
      {STRICT.map((f, i) => {
        const y = top + i * rowH;
        return (
          <g key={f}>
            <line x1="174" y1={top + 3 * rowH + 31} x2="292" y2={y + 13} stroke="var(--c-commit)" strokeWidth="1.1" opacity="0.5" markerEnd="url(#sf-a)" />
            <rect x="292" y={y} width="336" height="21" rx="6" fill="var(--c-commit-soft)" stroke="var(--c-commit)" strokeWidth="1.1" />
            <text x="304" y={y + 15} fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx)">{f}</text>
          </g>
        );
      })}

      {/* beyond strict — dimmed, detached */}
      <text x="24" y={top + 9 * rowH + 18} fontFamily="var(--font-body)" fontSize="11.5" fontWeight="600" fill="var(--tx3)">
        Recommended — but NOT in strict:
      </text>
      {BEYOND.map((f, i) => (
        <g key={f} opacity="0.62">
          <rect x="292" y={top + 9 * rowH + 26 + i * rowH} width="336" height="21" rx="6" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1.1" strokeDasharray="3 3" />
          <text x="304" y={top + 9 * rowH + 41 + i * rowH} fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx2)">{f}</text>
        </g>
      ))}

      <defs>
        <marker id="sf-a" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 z" fill="var(--c-commit)" />
        </marker>
      </defs>
    </svg>
  );
}
