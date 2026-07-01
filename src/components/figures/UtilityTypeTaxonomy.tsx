/* Static diagram: the utility-type family tree. Root = the lib.d.ts utilities; two trunks — MAPPED
   (reshape an object, a loop over keyof T) and CONDITIONAL + infer (filter/extract from a union) —
   with distributive filters, `infer` extractors, and the recursive Awaited hanging off the second. */
export function UtilityTypeTaxonomy() {
  return (
    <svg
      viewBox="0 0 680 340"
      width="100%"
      role="img"
      aria-label="The lib.d.ts utilities split into two trunks. MAPPED (reshape an object, a loop over keyof T): Partial, Required, Readonly, Pick, Record, Omit. CONDITIONAL plus infer (filter or extract from a union): the distributive filters Exclude, Extract and NonNullable; the infer extractors ReturnType, Parameters and InstanceType; and the recursive Awaited."
      style={{ maxWidth: 680 }}
    >
      <title>The utility-type family tree — mapped vs conditional/infer</title>

      {/* Root */}
      <rect x="250" y="14" width="180" height="40" rx="9" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.6" />
      <text x="340" y="39" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fill="var(--tx)">lib.d.ts utilities</text>

      {/* Root → trunks */}
      <line x1="340" y1="54" x2="180" y2="90" stroke="var(--line2)" strokeWidth="1.5" markerEnd="url(#ut-arrow)" />
      <line x1="340" y1="54" x2="500" y2="90" stroke="var(--line2)" strokeWidth="1.5" markerEnd="url(#ut-arrow)" />

      {/* Left trunk: MAPPED */}
      <rect x="40" y="90" width="280" height="42" rx="9" fill="var(--c-storage-soft)" stroke="var(--c-storage)" strokeWidth="1.6" />
      <text x="180" y="109" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--tx)">MAPPED</text>
      <text x="180" y="125" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fill="var(--tx2)">reshape an object · a loop over keyof T</text>

      {/* Right trunk: CONDITIONAL + infer */}
      <rect x="360" y="90" width="280" height="42" rx="9" fill="var(--c-analytics-soft)" stroke="var(--c-analytics)" strokeWidth="1.6" />
      <text x="500" y="109" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--tx)">CONDITIONAL + infer</text>
      <text x="500" y="125" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fill="var(--tx2)">filter / extract from a union</text>

      {/* Left children */}
      <line x1="180" y1="132" x2="180" y2="150" stroke="var(--line2)" strokeWidth="1.5" />
      <rect x="40" y="150" width="280" height="158" rx="9" fill="var(--bg)" stroke="var(--c-storage)" strokeWidth="1.4" strokeDasharray="5 4" />
      <text x="180" y="172" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--tx)">Partial · Required · Readonly</text>
      <text x="180" y="193" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--tx)">Pick · Record · Omit</text>
      <text x="180" y="228" textAnchor="middle" fontFamily="var(--font-body)" fontSize="11" fill="var(--tx3)">each ≈ {'{ [P in keyof T] … }'}</text>
      <text x="180" y="252" textAnchor="middle" fontFamily="var(--font-body)" fontSize="11" fill="var(--tx3)">Record: raw union → not homomorphic</text>
      <text x="180" y="276" textAnchor="middle" fontFamily="var(--font-body)" fontSize="11" fill="var(--tx3)">Omit = Pick + Exclude</text>
      <text x="180" y="298" textAnchor="middle" fontFamily="var(--font-body)" fontSize="11" fill="var(--tx3)">homomorphic → keeps readonly / ?</text>

      {/* Right children — spine + three boxes */}
      <line x1="500" y1="132" x2="500" y2="150" stroke="var(--line2)" strokeWidth="1.5" />
      <path d="M352,174 L352,286" stroke="var(--line2)" strokeWidth="1.3" fill="none" />
      <line x1="352" y1="174" x2="360" y2="174" stroke="var(--line2)" strokeWidth="1.3" />
      <line x1="352" y1="230" x2="360" y2="230" stroke="var(--line2)" strokeWidth="1.3" />
      <line x1="352" y1="286" x2="360" y2="286" stroke="var(--line2)" strokeWidth="1.3" />

      {/* distributive */}
      <rect x="360" y="150" width="280" height="48" rx="8" fill="var(--bg)" stroke="var(--c-analytics)" strokeWidth="1.4" strokeDasharray="5 4" />
      <text x="500" y="169" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx)">Exclude · Extract · NonNullable</text>
      <text x="500" y="187" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fill="var(--tx3)">distributive: T extends U ? never : T</text>

      {/* infer */}
      <rect x="360" y="206" width="280" height="48" rx="8" fill="var(--bg)" stroke="var(--c-analytics)" strokeWidth="1.4" strokeDasharray="5 4" />
      <text x="500" y="225" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx)">ReturnType · Parameters · InstanceType</text>
      <text x="500" y="243" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fill="var(--tx3)">infer: … =&gt; infer R ? R : …</text>

      {/* recursive */}
      <rect x="360" y="262" width="280" height="46" rx="8" fill="var(--c-commit-soft)" stroke="var(--c-commit)" strokeWidth="1.6" />
      <text x="500" y="281" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx)">Awaited</text>
      <text x="500" y="299" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fill="var(--tx3)">recursive: unwraps nested Promises</text>

      <defs>
        <marker id="ut-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--line2)" />
        </marker>
      </defs>
    </svg>
  );
}
