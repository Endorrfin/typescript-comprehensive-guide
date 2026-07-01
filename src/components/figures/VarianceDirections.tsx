/* Static diagram (M3): one base subtype relation, Dog <: Animal, produces three derived directions.
   In the return position a function type is COVARIANT (same direction); in the parameter position it is
   CONTRAVARIANT (reversed); a mutable container Array<T> is INVARIANT (neither assignment is sound).
   Colours: covariant = success green, contravariant = amber, invariant = danger. */
export function VarianceDirections() {
  const rows = [
    {
      y: 96,
      variance: 'covariant',
      color: 'var(--c-commit)',
      soft: 'var(--c-commit-soft)',
      left: '() => Dog',
      right: '() => Animal',
      note: 'return position — same direction',
      marker: 'url(#vd-cov)',
      blocked: false,
    },
    {
      y: 176,
      variance: 'contravariant',
      color: 'var(--c-analytics)',
      soft: 'var(--c-analytics-soft)',
      left: '(x: Animal) => void',
      right: '(x: Dog) => void',
      note: 'parameter position — reversed',
      marker: 'url(#vd-con)',
      blocked: false,
    },
    {
      y: 256,
      variance: 'invariant',
      color: 'var(--c-danger)',
      soft: 'var(--c-danger-soft)',
      left: 'Array<Dog>',
      right: 'Array<Animal>',
      note: 'mutable container — neither way',
      marker: '',
      blocked: true,
    },
  ];

  return (
    <svg
      viewBox="0 0 640 320"
      width="100%"
      role="img"
      aria-label="The base relation Dog is a subtype of Animal produces three derived directions. A function type is covariant in its return position, so a function returning Dog is assignable to one returning Animal. It is contravariant in its parameter position, so a function taking an Animal parameter is assignable to one taking a Dog parameter — reversed. A mutable Array is invariant: neither Array of Dog nor Array of Animal is assignable to the other."
      style={{ maxWidth: 640 }}
    >
      <title>Variance directions: covariant, contravariant, invariant</title>

      {/* Base relation header */}
      <text x="20" y="30" fontFamily="var(--font-body)" fontSize="13" fontWeight="600" fill="var(--accent-bright)">
        Base subtype relation
      </text>
      <g transform="translate(20, 46)">
        <rect x="0" y="0" width="96" height="30" rx="8" fill="var(--c-storage-soft)" stroke="var(--c-storage)" strokeWidth="1.5" />
        <text x="48" y="20" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--tx)">Dog</text>
        <line x1="104" y1="15" x2="150" y2="15" stroke="var(--tx3)" strokeWidth="1.6" markerEnd="url(#vd-base)" />
        <text x="127" y="9" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--tx3)">{'<:'}</text>
        <rect x="158" y="0" width="110" height="30" rx="8" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="213" y="20" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--tx)">Animal</text>
        <text x="284" y="20" fontFamily="var(--font-body)" fontSize="11.5" fill="var(--tx3)">Dog is a subtype of Animal</text>
      </g>

      {/* Three derived rows */}
      {rows.map((r) => (
        <g key={r.variance} transform={`translate(0, ${r.y})`}>
          {/* variance pill */}
          <rect x="20" y="6" width="126" height="30" rx="15" fill={r.soft} stroke={r.color} strokeWidth="1.5" />
          <text x="83" y="26" textAnchor="middle" fontFamily="var(--font-body)" fontSize="12.5" fontWeight="600" fill={r.color}>
            {r.variance}
          </text>

          {/* left type box */}
          <rect x="164" y="4" width="180" height="34" rx="8" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1.4" />
          <text x="254" y="26" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--tx)">
            {r.left}
          </text>

          {/* relation in the gap */}
          {r.blocked ? (
            <>
              <line x1="352" y1="21" x2="392" y2="21" stroke={r.color} strokeWidth="1.6" strokeDasharray="4 4" />
              <text x="372" y="14" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fontWeight="700" fill={r.color}>✗</text>
            </>
          ) : (
            <>
              <line x1="352" y1="21" x2="392" y2="21" stroke={r.color} strokeWidth="1.8" markerEnd={r.marker} />
              <text x="372" y="14" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill={r.color}>{'<:'}</text>
            </>
          )}

          {/* right type box */}
          <rect x="400" y="4" width="180" height="34" rx="8" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1.4" />
          <text x="490" y="26" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--tx)">
            {r.right}
          </text>

          {/* note under the row */}
          <text x="164" y="52" fontFamily="var(--font-body)" fontSize="10.5" fill="var(--tx3)">
            {r.note}
          </text>
        </g>
      ))}

      <defs>
        <marker id="vd-base" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--tx3)" />
        </marker>
        <marker id="vd-cov" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--c-commit)" />
        </marker>
        <marker id="vd-con" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--c-analytics)" />
        </marker>
      </defs>
    </svg>
  );
}
