/* Static diagram: a discriminated union is a funnel. Each `case` on the `kind` discriminant peels one
   member off; after the last case the default arm is reached with nothing left — the type is `never`,
   which is what makes the exhaustiveness check sound. */
export function NarrowingFunnel() {
  const rows = [
    { y: 44, w: 300, label: 'Circle | Square | Triangle', peel: '', guard: 'switch (s.kind)' },
    { y: 104, w: 232, label: 'Square | Triangle', peel: "case 'circle'", guard: '' },
    { y: 164, w: 150, label: 'Triangle', peel: "case 'square'", guard: '' },
    { y: 224, w: 118, label: 'never', peel: "case 'triangle'", guard: 'default', never: true },
  ];
  const cx = 220;
  return (
    <svg
      viewBox="0 0 620 296"
      width="100%"
      role="img"
      aria-label="A discriminated union Circle | Square | Triangle narrows through a switch on kind: case circle leaves Square | Triangle, case square leaves Triangle, case triangle leaves never — so the default arm is unreachable and the exhaustiveness check passes."
      style={{ maxWidth: 620 }}
    >
      <title>Narrowing a discriminated union down to never</title>

      {rows.map((r, i) => (
        <g key={i}>
          {/* connector from the previous pill */}
          {i > 0 && <line x1={cx} y1={rows[i - 1].y + 26} x2={cx} y2={r.y} stroke="var(--line2)" strokeWidth="1.5" markerEnd="url(#nf-arrow)" />}
          {/* the narrowed union pill */}
          <rect
            x={cx - r.w / 2}
            y={r.y}
            width={r.w}
            height={26}
            rx={13}
            fill={r.never ? 'var(--c-danger-soft)' : 'var(--c-storage-soft)'}
            stroke={r.never ? 'var(--c-danger)' : 'var(--c-storage)'}
            strokeWidth="1.5"
          />
          <text x={cx} y={r.y + 17} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--tx)">
            {r.label}
          </text>
          {/* the case that peeled a member off, to the right */}
          {r.peel && (
            <text x={cx + r.w / 2 + 16} y={r.y + 17} textAnchor="start" fontFamily="var(--font-mono)" fontSize="12" fill="var(--c-commit)">
              {r.peel}
            </text>
          )}
          {/* the guard label to the left */}
          {r.guard && (
            <text x={cx - r.w / 2 - 16} y={r.y + 17} textAnchor="end" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx3)">
              {r.guard}
            </text>
          )}
        </g>
      ))}

      {/* exhaustive verdict */}
      <g transform="translate(220, 276)">
        <text x="0" y="0" textAnchor="middle" fontFamily="var(--font-body)" fontSize="12" fill="var(--c-commit)">
          ✓ default is unreachable — the switch is exhaustive
        </text>
      </g>

      <defs>
        <marker id="nf-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--line2)" />
        </marker>
      </defs>
    </svg>
  );
}
