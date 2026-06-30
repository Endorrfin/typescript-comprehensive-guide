/* Static diagram: a naked-parameter conditional distributes across union members, then re-unions. */
export function DistributiveConditional() {
  const members = ['A', 'B', 'C'];
  const colXs = [120, 300, 480];
  return (
    <svg
      viewBox="0 0 600 320"
      width="100%"
      role="img"
      aria-label="ToArray over a union A | B | C distributes to ToArray<A> | ToArray<B> | ToArray<C>, which resolves to A[] | B[] | C[]."
      style={{ maxWidth: 600 }}
    >
      <title>Distributive conditional types</title>

      {/* Source union */}
      <rect x="210" y="14" width="180" height="40" rx="8" fill="var(--c-storage-soft)" stroke="var(--c-storage)" strokeWidth="1.5" />
      <text x="300" y="39" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="15" fill="var(--tx)">
        C&lt;A | B | C&gt;
      </text>

      {/* Fan-out lines */}
      {colXs.map((x) => (
        <line key={x} x1="300" y1="54" x2={x} y2="96" stroke="var(--line2)" strokeWidth="1.5" />
      ))}

      {/* Per-member conditionals */}
      {members.map((m, i) => (
        <g key={m}>
          <rect x={colXs[i] - 60} y="96" width="120" height="40" rx="8" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.4" />
          <text x={colXs[i]} y="121" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fill="var(--tx)">
            C&lt;{m}&gt;
          </text>
          {/* extends check */}
          <text x={colXs[i]} y="162" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx3)">
            {m} extends … ?
          </text>
          {/* result */}
          <line x1={colXs[i]} y1="172" x2={colXs[i]} y2="196" stroke="var(--line2)" strokeWidth="1.5" />
          <rect x={colXs[i] - 50} y="196" width="100" height="38" rx="8" fill="var(--c-commit-soft)" stroke="var(--c-commit)" strokeWidth="1.4" />
          <text x={colXs[i]} y="220" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fill="var(--tx)">
            {m}[]
          </text>
        </g>
      ))}

      {/* Re-union */}
      {colXs.map((x) => (
        <line key={`r-${x}`} x1={x} y1="234" x2="300" y2="270" stroke="var(--line2)" strokeWidth="1.5" />
      ))}
      <rect x="190" y="270" width="220" height="40" rx="8" fill="var(--c-commit-soft)" stroke="var(--c-commit)" strokeWidth="1.6" />
      <text x="300" y="295" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="15" fill="var(--tx)">
        A[] | B[] | C[]
      </text>
    </svg>
  );
}
