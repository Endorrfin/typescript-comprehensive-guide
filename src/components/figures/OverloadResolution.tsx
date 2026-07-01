/* Static diagram (M3): a call is tested against the overload signatures top to bottom and the FIRST
   match wins (not the best match). Earlier, more-specific signatures shadow later ones. The
   implementation signature sits below the overloads and is never visible to callers. */
export function OverloadResolution() {
  const sigs = [
    { y: 44, label: 'len(s: string): number', tag: '✓ first match wins', state: 'match' as const },
    { y: 104, label: 'len(a: unknown[]): number', tag: 'not reached for len("hi")', state: 'skip' as const },
  ];

  return (
    <svg
      viewBox="0 0 640 300"
      width="100%"
      role="img"
      aria-label='The call len of the string "hi" is tested against the overload signatures from top to bottom. The first signature, len taking a string, matches and wins. The second overload, len taking an array, is not reached. Below them the implementation signature len taking a string or array is greyed out and is not callable — callers never see it.'
      style={{ maxWidth: 640 }}
    >
      <title>Overload resolution: first match wins</title>

      <text x="20" y="26" fontFamily="var(--font-body)" fontSize="13" fontWeight="600" fill="var(--accent-bright)">
        Overload resolution — tested top to bottom
      </text>

      {/* The call site on the left */}
      <rect x="20" y="70" width="150" height="46" rx="9" fill="var(--c-storage-soft)" stroke="var(--c-storage)" strokeWidth="1.6" />
      <text x="95" y="92" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--tx)">{'len("hi")'}</text>
      <text x="95" y="108" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fill="var(--tx3)">the call</text>

      {/* connector from call to the first (matching) signature */}
      <line x1="170" y1="67" x2="214" y2="67" stroke="var(--c-commit)" strokeWidth="1.8" markerEnd="url(#or-ok)" />

      {/* overload signatures */}
      {sigs.map((s) => {
        const match = s.state === 'match';
        return (
          <g key={s.label}>
            <rect
              x="220"
              y={s.y}
              width="300"
              height="46"
              rx="9"
              fill={match ? 'var(--c-commit-soft)' : 'var(--surface)'}
              stroke={match ? 'var(--c-commit)' : 'var(--line2)'}
              strokeWidth={match ? 1.8 : 1.3}
              opacity={match ? 1 : 0.6}
            />
            <text
              x="240"
              y={s.y + 28}
              fontFamily="var(--font-mono)"
              fontSize="13"
              fill="var(--tx)"
              opacity={match ? 1 : 0.65}
            >
              {s.label}
            </text>
            <text x="510" y={s.y + 20} textAnchor="end" fontFamily="var(--font-body)" fontSize="10.5" fontWeight={match ? 600 : 400} fill={match ? 'var(--c-commit)' : 'var(--tx3)'}>
              {s.tag}
            </text>
          </g>
        );
      })}

      {/* divider before the implementation signature */}
      <line x1="220" y1="168" x2="520" y2="168" stroke="var(--line)" strokeWidth="1" strokeDasharray="3 4" />

      {/* implementation signature — hidden from callers */}
      <rect x="220" y="182" width="300" height="46" rx="9" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1.3" strokeDasharray="5 4" opacity="0.55" />
      <text x="240" y="205" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx2)">{'len(x: string | unknown[]): number'}</text>
      <text x="240" y="220" fontFamily="var(--font-body)" fontSize="10.5" fill="var(--tx3)">implementation signature — not callable</text>

      <defs>
        <marker id="or-ok" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--c-commit)" />
        </marker>
      </defs>
    </svg>
  );
}
