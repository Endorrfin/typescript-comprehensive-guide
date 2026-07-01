/* Static diagram (M13): the publish-types pipeline. (1) tsc emits format-matched declarations —
   .d.mts for the ESM output, .d.cts for the CommonJS output. (2) the package.json `exports` map routes
   each condition to the right file, with the "types" condition FIRST in the block (exports is
   order-sensitive). (3) each consumer resolution mode lands on the matching declaration. A bottom gate
   shows publint + @arethetypeswrong/cli running on the PACKED tarball to catch masquerading before
   npm publish — the checks a local `tsc` can't do because it reads sources, not the published layout. */
export function PublishTypesFlow() {
  return (
    <svg
      viewBox="0 0 690 344"
      width="100%"
      role="img"
      aria-label="The publish-types pipeline in three stages plus a verification gate. Stage one, emit: tsc with the declaration flag emits format-matched declarations — a .d.mts for the ESM JavaScript and a .d.cts for the CommonJS JavaScript. Stage two, route: the package.json exports map lists the types condition first, before import and require, because exports conditions match in written order. Stage three, resolve: node16 ESM lands on the .d.mts, node16 CommonJS lands on the .d.cts, and bundler lands on the .d.ts. A bottom gate runs publint and arethetypeswrong CLI on the packed tarball to catch masquerading — a declaration whose module format disagrees with its JavaScript — before npm publish."
      style={{ maxWidth: 690 }}
    >
      <title>Publish-types pipeline: emit format-matched declarations, route types-first, verify the tarball with publint + attw</title>

      <text x="20" y="24" fontFamily="var(--font-body)" fontSize="13" fontWeight="600" fill="var(--accent-bright)">
        Publishing types — emit format-matched, route types-first, verify the tarball
      </text>

      {/* Stage 1 — emit */}
      <text x="24" y="52" fontFamily="var(--font-body)" fontSize="10.5" fontWeight="600" fill="var(--tx3)">1 · EMIT</text>
      <rect x="20" y="60" width="176" height="120" rx="10" fill="var(--c-storage-soft)" stroke="var(--c-storage)" strokeWidth="1.6" />
      <text x="34" y="82" fontFamily="var(--font-mono)" fontSize="11" fill="var(--tx)">tsc --declaration</text>
      <rect x="34" y="94" width="148" height="34" rx="6" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1.1" />
      <text x="46" y="109" fontFamily="var(--font-mono)" fontSize="11" fill="var(--tx)">index.d.mts</text>
      <text x="46" y="123" fontFamily="var(--font-body)" fontSize="9" fill="var(--tx3)">describes ESM .mjs</text>
      <rect x="34" y="134" width="148" height="34" rx="6" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1.1" />
      <text x="46" y="149" fontFamily="var(--font-mono)" fontSize="11" fill="var(--tx)">index.d.cts</text>
      <text x="46" y="163" fontFamily="var(--font-body)" fontSize="9" fill="var(--tx3)">describes CJS .cjs</text>

      <line x1="196" y1="120" x2="230" y2="120" stroke="var(--accent)" strokeWidth="1.8" markerEnd="url(#pf-a)" />

      {/* Stage 2 — route (exports, types first) */}
      <text x="238" y="52" fontFamily="var(--font-body)" fontSize="10.5" fontWeight="600" fill="var(--tx3)">2 · ROUTE — exports (order-sensitive)</text>
      <rect x="234" y="60" width="216" height="120" rx="10" fill="var(--bg)" stroke="var(--line)" strokeWidth="1.4" />
      <text x="248" y="80" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--tx3)">"exports": {'{ ".": {'}</text>
      <rect x="248" y="88" width="188" height="22" rx="5" fill="var(--c-commit-soft)" stroke="var(--c-commit)" strokeWidth="1.4" />
      <text x="256" y="103" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--tx)">"types": "./index.d.mts",</text>
      <text x="248" y="126" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--tx2)">"import": "./index.mjs",</text>
      <text x="248" y="144" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--tx2)">"require": "./index.cjs"</text>
      <text x="248" y="162" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--tx3)">{'} }'}</text>
      <text x="342" y="176" textAnchor="middle" fontFamily="var(--font-body)" fontSize="9" fontStyle="italic" fill="var(--c-commit)">↑ "types" first — matched before JS</text>

      <line x1="450" y1="120" x2="484" y2="120" stroke="var(--accent)" strokeWidth="1.8" markerEnd="url(#pf-a)" />

      {/* Stage 3 — resolve per mode */}
      <text x="492" y="52" fontFamily="var(--font-body)" fontSize="10.5" fontWeight="600" fill="var(--tx3)">3 · RESOLVE</text>
      <rect x="488" y="60" width="182" height="120" rx="10" fill="var(--c-query-soft)" stroke="var(--c-query)" strokeWidth="1.5" />
      <text x="500" y="82" fontFamily="var(--font-mono)" fontSize="10" fill="var(--tx2)">node16-esm</text>
      <text x="660" y="82" textAnchor="end" fontFamily="var(--font-mono)" fontSize="10" fill="var(--tx)">.d.mts</text>
      <line x1="500" y1="90" x2="660" y2="90" stroke="var(--line2)" strokeWidth="0.8" />
      <text x="500" y="110" fontFamily="var(--font-mono)" fontSize="10" fill="var(--tx2)">node16-cjs</text>
      <text x="660" y="110" textAnchor="end" fontFamily="var(--font-mono)" fontSize="10" fill="var(--tx)">.d.cts</text>
      <line x1="500" y1="118" x2="660" y2="118" stroke="var(--line2)" strokeWidth="0.8" />
      <text x="500" y="138" fontFamily="var(--font-mono)" fontSize="10" fill="var(--tx2)">bundler</text>
      <text x="660" y="138" textAnchor="end" fontFamily="var(--font-mono)" fontSize="10" fill="var(--tx)">.d.ts</text>
      <line x1="500" y1="146" x2="660" y2="146" stroke="var(--line2)" strokeWidth="0.8" />
      <text x="500" y="166" fontFamily="var(--font-body)" fontSize="9.5" fill="var(--tx3)">each mode gets its matching type</text>

      {/* Gate — verify the tarball */}
      <rect x="20" y="200" width="650" height="122" rx="11" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1.4" />
      <text x="34" y="222" fontFamily="var(--font-body)" fontSize="11.5" fontWeight="600" fill="var(--accent-bright)">GATE — verify the PACKED tarball (a green local tsc can't see this)</text>

      <rect x="34" y="234" width="200" height="34" rx="7" fill="var(--c-commit-soft)" stroke="var(--c-commit)" strokeWidth="1.3" />
      <text x="46" y="249" fontFamily="var(--font-mono)" fontSize="11" fill="var(--tx)">publint</text>
      <text x="46" y="263" fontFamily="var(--font-body)" fontSize="9" fill="var(--tx3)">exports order · extensions · files</text>

      <rect x="246" y="234" width="220" height="34" rx="7" fill="var(--c-commit-soft)" stroke="var(--c-commit)" strokeWidth="1.3" />
      <text x="258" y="249" fontFamily="var(--font-mono)" fontSize="11" fill="var(--tx)">attw --pack</text>
      <text x="258" y="263" fontFamily="var(--font-body)" fontSize="9" fill="var(--tx3)">resolves node10 / node16 / bundler</text>

      <line x1="466" y1="251" x2="500" y2="251" stroke="var(--c-commit)" strokeWidth="1.8" markerEnd="url(#pf-ok)" />
      <rect x="502" y="234" width="156" height="34" rx="7" fill="var(--c-query-soft)" stroke="var(--c-query)" strokeWidth="1.3" />
      <text x="580" y="256" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11.5" fill="var(--tx)">npm publish</text>

      <rect x="34" y="278" width="624" height="34" rx="7" fill="var(--c-danger-soft)" stroke="var(--c-danger)" strokeWidth="1.2" />
      <text x="46" y="293" fontFamily="var(--font-body)" fontSize="10.5" fontWeight="600" fill="var(--c-danger)">Masquerading (blocks release):</text>
      <text x="46" y="306" fontFamily="var(--font-body)" fontSize="10" fill="var(--tx2)">the "import" condition served a .d.ts that describes CommonJS — type-checks in a bundler, breaks on real Node.</text>

      <defs>
        <marker id="pf-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--accent)" />
        </marker>
        <marker id="pf-ok" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--c-commit)" />
        </marker>
      </defs>
    </svg>
  );
}
