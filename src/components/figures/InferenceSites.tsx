/* Static diagram: a call to `pair<T>(a: T, b: T)` has two inference sites. Each argument offers a
   candidate for T (1 → number, 'x' → string); the compiler takes the best-common-type of the
   candidates, which here is the union `number | string`. */
export function InferenceSites() {
  return (
    <svg
      viewBox="0 0 600 250"
      width="100%"
      role="img"
      aria-label="Calling pair with 1 and the string x gives two inference sites: the first argument's candidate for T is number, the second is string. The best common type of number and string is the union number or string, so T is inferred as number | string."
      style={{ maxWidth: 600 }}
    >
      <title>Inferring a type parameter from multiple sites</title>

      {/* Signature + call */}
      <text x="300" y="26" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--tx2)">
        pair&lt;T&gt;(a: T, b: T)  ·  pair(1, "x")
      </text>

      {/* Two argument inference sites */}
      <rect x="46" y="56" width="180" height="52" rx="9" fill="var(--c-storage-soft)" stroke="var(--c-storage)" strokeWidth="1.5" />
      <text x="136" y="78" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--tx)">a = 1</text>
      <text x="136" y="97" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--c-analytics)">candidate: number</text>

      <rect x="374" y="56" width="180" height="52" rx="9" fill="var(--c-storage-soft)" stroke="var(--c-storage)" strokeWidth="1.5" />
      <text x="464" y="78" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--tx)">b = "x"</text>
      <text x="464" y="97" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--c-analytics)">candidate: string</text>

      {/* converging arrows */}
      <line x1="136" y1="108" x2="270" y2="150" stroke="var(--line2)" strokeWidth="1.5" markerEnd="url(#in-arrow)" />
      <line x1="464" y1="108" x2="330" y2="150" stroke="var(--line2)" strokeWidth="1.5" markerEnd="url(#in-arrow)" />
      <text x="300" y="132" textAnchor="middle" fontFamily="var(--font-body)" fontSize="11" fill="var(--tx3)">best common type</text>

      {/* merge → T */}
      <rect x="196" y="150" width="208" height="44" rx="9" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.6" />
      <text x="300" y="177" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fill="var(--tx)">T = number | string</text>

      {/* result */}
      <line x1="300" y1="194" x2="300" y2="214" stroke="var(--line2)" strokeWidth="1.5" markerEnd="url(#in-arrow)" />
      <text x="300" y="236" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--c-commit)">
        pair(1, "x"): [number | string, number | string]
      </text>

      <defs>
        <marker id="in-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--line2)" />
        </marker>
      </defs>
    </svg>
  );
}
