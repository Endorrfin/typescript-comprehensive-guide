/* Static diagram (M9): one schema, one source of truth. A zod schema derives BOTH the static type
   (via z.infer, compile time) AND the runtime check (via parse) from the same definition, so they
   cannot drift. The alternative — a hand-written interface beside a separate validator — has two
   sources of truth that quietly fall out of sync (the jagged "drift" gap). */
export function SchemaSingleSource() {
  return (
    <svg
      viewBox="0 0 660 330"
      width="100%"
      role="img"
      aria-label="Two approaches side by side. On the left, schema-first: a single zod schema box fans out to two outputs — upward to the static type, produced by z.infer at compile time, and downward to the runtime check, produced by parse. A bracket labels these one source of truth, so the type and the check cannot drift. On the right, the alternative: a hand-written interface box and a separate validator box, joined by a jagged red gap labelled drift, because they are two independent sources of truth that fall out of sync when only one is edited."
      style={{ maxWidth: 660 }}
    >
      <title>One schema derives both the static type (z.infer) and the runtime check (parse) — no drift</title>

      <text x="20" y="26" fontFamily="var(--font-body)" fontSize="13" fontWeight="600" fill="var(--accent-bright)">
        Schema-first: one definition is both the type and the check
      </text>

      {/* ── LEFT: schema-first (one source) ── */}
      <text x="170" y="52" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fontWeight="600" fill="var(--c-commit)">SINGLE SOURCE OF TRUTH</text>

      {/* the schema */}
      <rect x="30" y="130" width="150" height="70" rx="10" fill="var(--c-storage-soft)" stroke="var(--c-storage)" strokeWidth="1.7" />
      <text x="105" y="158" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--tx)">{'z.object({…})'}</text>
      <text x="105" y="178" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fill="var(--tx3)">the schema</text>

      {/* fan-out arrows */}
      <line x1="180" y1="150" x2="250" y2="100" stroke="var(--c-query)" strokeWidth="1.8" markerEnd="url(#ss-q)" />
      <line x1="180" y1="180" x2="250" y2="230" stroke="var(--c-commit)" strokeWidth="1.8" markerEnd="url(#ss-c)" />

      {/* top output — static type */}
      <rect x="252" y="74" width="176" height="56" rx="9" fill="var(--c-query-soft)" stroke="var(--c-query)" strokeWidth="1.5" />
      <text x="340" y="96" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fontWeight="600" fill="var(--c-query)">static type · compile time</text>
      <text x="340" y="118" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx)">{'type T = z.infer<…>'}</text>

      {/* bottom output — runtime check */}
      <rect x="252" y="202" width="176" height="56" rx="9" fill="var(--c-commit-soft)" stroke="var(--c-commit)" strokeWidth="1.5" />
      <text x="340" y="224" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fontWeight="600" fill="var(--c-commit)">runtime check</text>
      <text x="340" y="246" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx)">{'schema.parse(x)'}</text>

      {/* divider */}
      <line x1="452" y1="66" x2="452" y2="266" stroke="var(--line)" strokeWidth="1.2" strokeDasharray="4 5" />

      {/* ── RIGHT: the alternative (two sources → drift) ── */}
      <text x="556" y="52" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fontWeight="600" fill="var(--c-danger)">TWO SOURCES → DRIFT</text>

      <rect x="474" y="86" width="164" height="52" rx="9" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1.4" />
      <text x="556" y="108" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx)">{'interface T {…}'}</text>
      <text x="556" y="126" textAnchor="middle" fontFamily="var(--font-body)" fontSize="9.5" fill="var(--tx3)">hand-written type</text>

      <rect x="474" y="196" width="164" height="52" rx="9" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1.4" />
      <text x="556" y="218" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx)">{'validate(x)'}</text>
      <text x="556" y="236" textAnchor="middle" fontFamily="var(--font-body)" fontSize="9.5" fill="var(--tx3)">separate validator</text>

      {/* jagged drift gap */}
      <path d="M556,138 l-10,12 l20,12 l-20,12 l20,10" fill="none" stroke="var(--c-danger)" strokeWidth="1.7" />
      <text x="600" y="176" fontFamily="var(--font-body)" fontSize="10.5" fontWeight="600" fill="var(--c-danger)">drift</text>

      {/* footnote */}
      <text x="20" y="308" fontFamily="var(--font-body)" fontSize="11" fill="var(--tx2)">Delete the interface and <tspan fontFamily="var(--font-mono)" fill="var(--tx)">z.infer</tspan> it: change the schema once and the type follows automatically.</text>

      <defs>
        <marker id="ss-q" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--c-query)" />
        </marker>
        <marker id="ss-c" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--c-commit)" />
        </marker>
      </defs>
    </svg>
  );
}
