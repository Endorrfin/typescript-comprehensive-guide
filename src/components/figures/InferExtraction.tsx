/* Static diagram: `infer` pattern-matches a structure and binds the hole; the true branch returns it. */
export function InferExtraction() {
  return (
    <svg
      viewBox="0 0 600 260"
      width="100%"
      role="img"
      aria-label="Matching Promise<boolean> against the pattern Promise<infer R> binds R to boolean; the true branch returns R, so the result is boolean."
      style={{ maxWidth: 600 }}
    >
      <title>Extracting a type with infer</title>

      {/* The conditional */}
      <text x="20" y="34" fontFamily="var(--font-mono)" fontSize="14" fill="var(--tx2)">
        T extends Promise&lt;infer R&gt; ? R : T
      </text>

      {/* Input value type */}
      <rect x="40" y="62" width="200" height="44" rx="8" fill="var(--c-storage-soft)" stroke="var(--c-storage)" strokeWidth="1.5" />
      <text x="140" y="89" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="15" fill="var(--tx)">
        Promise&lt;boolean&gt;
      </text>

      {/* Pattern with the hole */}
      <rect x="340" y="62" width="220" height="44" rx="8" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="5 4" />
      <text x="450" y="89" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="15" fill="var(--tx)">
        Promise&lt;
        <tspan fill="var(--c-analytics)">infer R</tspan>&gt;
      </text>

      {/* match arrow */}
      <line x1="240" y1="84" x2="338" y2="84" stroke="var(--line2)" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <text x="289" y="76" textAnchor="middle" fontFamily="var(--font-body)" fontSize="11" fill="var(--tx3)">
        match
      </text>

      {/* binding */}
      <line x1="450" y1="106" x2="450" y2="146" stroke="var(--c-analytics)" strokeWidth="1.5" />
      <rect x="372" y="146" width="156" height="40" rx="8" fill="var(--c-analytics-soft)" stroke="var(--c-analytics)" strokeWidth="1.4" />
      <text x="450" y="171" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fill="var(--tx)">
        R = boolean
      </text>

      {/* result */}
      <line x1="372" y1="166" x2="250" y2="166" stroke="var(--line2)" strokeWidth="1.5" />
      <text x="250" y="150" textAnchor="middle" fontFamily="var(--font-body)" fontSize="11" fill="var(--tx3)">
        true branch → R
      </text>
      <rect x="120" y="200" width="200" height="44" rx="8" fill="var(--c-commit-soft)" stroke="var(--c-commit)" strokeWidth="1.6" />
      <text x="220" y="227" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="15" fill="var(--tx)">
        boolean
      </text>

      <defs>
        <marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--line2)" />
        </marker>
      </defs>
    </svg>
  );
}
