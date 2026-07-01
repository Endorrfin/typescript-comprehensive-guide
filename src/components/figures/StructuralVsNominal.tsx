/* Static diagram: the same Dog value fits a Pet-shaped slot by STRUCTURE in TypeScript (no `implements`
   needed), while a NOMINAL language (Java/C#) rejects it unless Dog explicitly declares `implements Pet`. */
export function StructuralVsNominal() {
  return (
    <svg
      viewBox="0 0 620 300"
      width="100%"
      role="img"
      aria-label="In TypeScript's structural system a Dog with a name is assignable to Pet purely because the shape matches, with no implements clause. In a nominal system the same code is an error unless Dog explicitly declares it implements Pet."
      style={{ maxWidth: 620 }}
    >
      <title>Structural vs nominal typing</title>

      {/* Panel labels */}
      <text x="155" y="24" textAnchor="middle" fontFamily="var(--font-body)" fontSize="13" fontWeight="600" fill="var(--accent-bright)">
        Structural — TypeScript
      </text>
      <text x="465" y="24" textAnchor="middle" fontFamily="var(--font-body)" fontSize="13" fontWeight="600" fill="var(--tx3)">
        Nominal — Java / C#
      </text>
      <line x1="310" y1="36" x2="310" y2="278" stroke="var(--line)" strokeWidth="1" strokeDasharray="4 5" />

      {/* ── Structural panel ─────────────────────────────────────────────── */}
      {/* Source: Dog */}
      <rect x="40" y="52" width="140" height="58" rx="9" fill="var(--c-storage-soft)" stroke="var(--c-storage)" strokeWidth="1.6" />
      <text x="110" y="76" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fill="var(--tx)">Dog</text>
      <text x="110" y="96" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11.5" fill="var(--tx2)">{'{ name; breed }'}</text>

      {/* Target slot: Pet */}
      <rect x="40" y="176" width="140" height="58" rx="9" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.6" />
      <text x="110" y="200" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fill="var(--tx)">Pet</text>
      <text x="110" y="220" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11.5" fill="var(--tx2)">{'{ name }'}</text>

      {/* fits-by-shape arrow */}
      <line x1="110" y1="110" x2="110" y2="174" stroke="var(--c-commit)" strokeWidth="1.8" markerEnd="url(#arrow-ok)" />
      <text x="200" y="146" textAnchor="start" fontFamily="var(--font-body)" fontSize="11" fill="var(--tx3)">fits by shape</text>

      {/* verdict */}
      <g transform="translate(110, 258)">
        <circle cx="-84" cy="-2" r="9" fill="var(--c-commit-soft)" stroke="var(--c-commit)" strokeWidth="1.4" />
        <text x="-84" y="2" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--c-commit)">✓</text>
        <text x="-70" y="2" textAnchor="start" fontFamily="var(--font-body)" fontSize="11.5" fill="var(--tx2)">assignable — no `implements`</text>
      </g>

      {/* ── Nominal panel ────────────────────────────────────────────────── */}
      <rect x="350" y="52" width="140" height="58" rx="9" fill="var(--c-storage-soft)" stroke="var(--c-storage)" strokeWidth="1.6" />
      <text x="420" y="76" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fill="var(--tx)">Dog</text>
      <text x="420" y="96" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--tx3)">no implements Pet</text>

      <rect x="350" y="176" width="140" height="58" rx="9" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1.6" />
      <text x="420" y="200" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fill="var(--tx)">Pet</text>
      <text x="420" y="220" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11.5" fill="var(--tx2)">interface</text>

      <line x1="420" y1="110" x2="420" y2="174" stroke="var(--c-danger)" strokeWidth="1.8" strokeDasharray="5 4" markerEnd="url(#arrow-bad)" />
      <text x="510" y="146" textAnchor="start" fontFamily="var(--font-body)" fontSize="11" fill="var(--tx3)">name only</text>

      <g transform="translate(420, 258)">
        <circle cx="-84" cy="-2" r="9" fill="var(--c-danger-soft)" stroke="var(--c-danger)" strokeWidth="1.4" />
        <text x="-84" y="2" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--c-danger)">✗</text>
        <text x="-70" y="2" textAnchor="start" fontFamily="var(--font-body)" fontSize="11.5" fill="var(--tx2)">error — must declare it</text>
      </g>

      <defs>
        <marker id="arrow-ok" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--c-commit)" />
        </marker>
        <marker id="arrow-bad" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--c-danger)" />
        </marker>
      </defs>
    </svg>
  );
}
