/* Static diagram (M8): the legacy dependency-injection metadata pipeline. A decorated constructor
   makes `emitDecoratorMetadata` write `design:paramtypes` (via reflect-metadata) at COMPILE time;
   at RUNTIME the DI container reads it back with `Reflect.getMetadata` and resolves each constructor
   parameter by its type. A vertical divider separates the compile-time emit from the runtime read. */
export function DiMetadataFlow() {
  return (
    <svg
      viewBox="0 0 660 300"
      width="100%"
      role="img"
      aria-label="The dependency injection metadata pipeline, left to right. Stage one: an at-Injectable class whose constructor takes a UserRepository. At compile time, emitDecoratorMetadata writes the key design:paramtypes with the value array containing UserRepository, stored through reflect-metadata. A dashed divider separates compile time from runtime. At runtime the DI container calls Reflect.getMetadata to read design:paramtypes back and resolves the parameter by type, constructing new UserService with the repository."
      style={{ maxWidth: 660 }}
    >
      <title>DI metadata flow: emitDecoratorMetadata writes design:paramtypes, the container reads it at runtime</title>

      <text x="20" y="26" fontFamily="var(--font-body)" fontSize="13" fontWeight="600" fill="var(--accent-bright)">
        How DI reads constructor types — the design:paramtypes pipeline
      </text>

      {/* compile / runtime band labels */}
      <text x="150" y="52" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fontWeight="600" fill="var(--tx3)">COMPILE TIME</text>
      <text x="520" y="52" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fontWeight="600" fill="var(--tx3)">RUNTIME</text>
      <line x1="404" y1="60" x2="404" y2="270" stroke="var(--line)" strokeWidth="1.2" strokeDasharray="4 5" />

      {/* Stage 1 — the decorated class */}
      <rect x="20" y="92" width="180" height="86" rx="10" fill="var(--c-storage-soft)" stroke="var(--c-storage)" strokeWidth="1.6" />
      <text x="34" y="116" fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--tx)">{'@Injectable()'}</text>
      <text x="34" y="136" fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--tx)">{'class UserService {'}</text>
      <text x="34" y="154" fontFamily="var(--font-mono)" fontSize="11" fill="var(--tx2)">{'  constructor('}</text>
      <text x="34" y="170" fontFamily="var(--font-mono)" fontSize="11" fill="var(--tx2)">{'    repo: UserRepository)'}</text>

      {/* arrow 1 — emit */}
      <line x1="200" y1="135" x2="246" y2="135" stroke="var(--c-commit)" strokeWidth="1.8" markerEnd="url(#dmf-ok)" />
      <text x="223" y="126" textAnchor="middle" fontFamily="var(--font-body)" fontSize="9.5" fill="var(--tx3)">emit</text>

      {/* Stage 2 — the emitted metadata */}
      <rect x="248" y="98" width="150" height="74" rx="10" fill="var(--c-commit-soft)" stroke="var(--c-commit)" strokeWidth="1.6" />
      <text x="323" y="120" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11.5" fill="var(--tx)">design:paramtypes</text>
      <text x="323" y="142" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx)">{'[ UserRepository ]'}</text>
      <text x="323" y="160" textAnchor="middle" fontFamily="var(--font-body)" fontSize="9.5" fill="var(--tx3)">stored via reflect-metadata</text>

      {/* arrow 2 — read (crosses the divider) */}
      <line x1="398" y1="135" x2="456" y2="135" stroke="var(--c-analytics)" strokeWidth="1.8" markerEnd="url(#dmf-rt)" />
      <text x="427" y="126" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--tx3)">getMetadata</text>

      {/* Stage 3 — the container resolves */}
      <rect x="458" y="98" width="182" height="74" rx="10" fill="var(--c-analytics-soft)" stroke="var(--c-analytics)" strokeWidth="1.6" />
      <text x="549" y="120" textAnchor="middle" fontFamily="var(--font-body)" fontSize="11.5" fontWeight="600" fill="var(--c-analytics)">DI container</text>
      <text x="549" y="140" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fill="var(--tx2)">resolves each param by type</text>
      <text x="549" y="160" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--tx)">{'new UserService(repo)'}</text>

      {/* footnote: the erasure caveat */}
      <rect x="20" y="206" width="620" height="66" rx="9" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1.2" />
      <text x="34" y="230" fontFamily="var(--font-body)" fontSize="11.5" fontWeight="600" fill="var(--c-danger)">The catch — erasure</text>
      <text x="34" y="250" fontFamily="var(--font-body)" fontSize="11" fill="var(--tx2)">design:paramtypes is the runtime VALUE of the type, so an interface / union / alias collapses to</text>
      <text x="34" y="266" fontFamily="var(--font-mono)" fontSize="11.5" fill="var(--tx)">{'Object'}<tspan fontFamily="var(--font-body)" fill="var(--tx2)">  → inject a class or an explicit @Inject(TOKEN) instead.</tspan></text>

      <defs>
        <marker id="dmf-ok" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--c-commit)" />
        </marker>
        <marker id="dmf-rt" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--c-analytics)" />
        </marker>
      </defs>
    </svg>
  );
}
