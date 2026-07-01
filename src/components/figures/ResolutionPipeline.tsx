/* Static diagram (M12): the two things that decide where an import resolves — (A) extension
   substitution, the fixed order TypeScript tries files for any would-be ".js" lookup (it reads the
   .ts/.tsx/.d.ts BEFORE the .js), and (B) the node_modules walk for bare specifiers, which runs
   types-first (the real package, then @types) up the directory tree. */
const EXT = ['./x.ts', './x.tsx', './x.d.ts', './x.js', './x.jsx'];

export function ResolutionPipeline() {
  return (
    <svg
      viewBox="0 0 680 360"
      width="100%"
      role="img"
      aria-label="Two panels. Panel A, extension substitution: for a would-be lookup of ./x.js, TypeScript tries ./x.ts, then ./x.tsx, then ./x.d.ts, then ./x.js, then ./x.jsx, in that order, and the first file that exists wins — so a .ts is read before a .js. Panel B, the node_modules walk for a bare specifier like pkg: TypeScript looks in the nearest node_modules for the real package, then node_modules/@types, then walks up to the parent directory's node_modules, running a types-first pass before it will accept a JavaScript-only file."
      style={{ maxWidth: 680 }}
    >
      <title>Extension substitution order, and the types-first node_modules walk</title>

      {/* Panel A — extension substitution */}
      <text x="20" y="24" fontFamily="var(--font-body)" fontSize="13" fontWeight="600" fill="var(--accent-bright)">
        A · Extension substitution — the order for a “./x.js” lookup
      </text>
      {EXT.map((e, i) => {
        const x = 24 + i * 128;
        const isType = i < 3;
        return (
          <g key={e}>
            <rect x={x} y="40" width="112" height="34" rx="8" fill={isType ? 'var(--c-commit-soft)' : 'var(--surface)'} stroke={isType ? 'var(--c-commit)' : 'var(--line2)'} strokeWidth="1.4" />
            <text x={x + 56} y="62" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--tx)">{e}</text>
            {i < EXT.length - 1 && (
              <line x1={x + 112} y1="57" x2={x + 128} y2="57" stroke="var(--tx3)" strokeWidth="1.5" markerEnd="url(#rp-a)" />
            )}
          </g>
        );
      })}
      <text x="24" y="94" fontFamily="var(--font-body)" fontSize="11" fill="var(--tx3)">first file that exists wins — the .ts / .d.ts is read before the .js</text>

      {/* Panel B — node_modules walk */}
      <text x="20" y="134" fontFamily="var(--font-body)" fontSize="13" fontWeight="600" fill="var(--accent-bright)">
        B · Bare specifier “pkg” — the types-first node_modules walk
      </text>

      {/* nearest node_modules */}
      <rect x="24" y="150" width="300" height="86" rx="11" fill="var(--c-query-soft)" stroke="var(--c-query)" strokeWidth="1.6" />
      <text x="40" y="172" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx2)">src/node_modules/</text>
      <rect x="40" y="182" width="268" height="20" rx="5" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1" />
      <text x="52" y="196" fontFamily="var(--font-mono)" fontSize="11.5" fill="var(--tx)">pkg/  → package.json "exports"</text>
      <rect x="40" y="206" width="268" height="20" rx="5" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1" />
      <text x="52" y="220" fontFamily="var(--font-mono)" fontSize="11.5" fill="var(--tx)">@types/pkg/  → index.d.ts</text>

      {/* walk-up arrow */}
      <line x1="330" y1="193" x2="366" y2="193" stroke="var(--c-analytics)" strokeWidth="1.8" markerEnd="url(#rp-b)" />
      <text x="348" y="184" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10" fill="var(--tx3)">walk up</text>

      {/* parent node_modules */}
      <rect x="372" y="150" width="284" height="86" rx="11" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1.4" strokeDasharray="4 3" />
      <text x="388" y="172" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx2)">../node_modules/  (then ../../ …)</text>
      <text x="388" y="196" fontFamily="var(--font-body)" fontSize="11" fill="var(--tx3)">same order at each ancestor,</text>
      <text x="388" y="212" fontFamily="var(--font-body)" fontSize="11" fill="var(--tx3)">types-first before a JS-only hit</text>

      <text x="24" y="256" fontFamily="var(--font-body)" fontSize="11.5" fill="var(--tx2)">
        ESM requires the extension &amp; forbids directory index; node10 / require / bundler allow both.
      </text>

      <defs>
        <marker id="rp-a" markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill="var(--tx3)" />
        </marker>
        <marker id="rp-b" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--c-analytics)" />
        </marker>
      </defs>
    </svg>
  );
}
