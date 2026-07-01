/* Static diagram (M12): project references turn one big program into a build GRAPH. Each referenced
   project sets composite:true, so it emits declaration files (.d.ts) plus a .tsbuildinfo fingerprint;
   `tsc -b` then builds leaf-first and skips any project whose inputs are unchanged. declarationMap lets
   an editor jump across project boundaries to the original source. */
const NODES = [
  { id: 'app', x: 40, label: 'app', dep: 'references core' },
  { id: 'core', x: 268, label: 'core', dep: 'references shared' },
  { id: 'shared', x: 496, label: 'shared', dep: 'leaf' },
];

export function ProjectReferences() {
  return (
    <svg
      viewBox="0 0 680 320"
      width="100%"
      role="img"
      aria-label="A build graph of three TypeScript projects: app references core, and core references shared. Each project sets composite true, which makes it emit declaration .d.ts files plus a tsbuildinfo file. The tsc -b build command builds them leaf-first — shared, then core, then app — and skips any project whose inputs have not changed, using the tsbuildinfo fingerprint. declarationMap lets the editor navigate across project boundaries back to the original source."
      style={{ maxWidth: 680 }}
    >
      <title>Project references: composite projects, .d.ts + tsbuildinfo, incremental tsc -b</title>

      <text x="20" y="24" fontFamily="var(--font-body)" fontSize="13" fontWeight="600" fill="var(--accent-bright)">
        Project references — one build graph, built leaf-first &amp; incrementally
      </text>

      {NODES.map((n) => (
        <g key={n.id}>
          <rect x={n.x} y="46" width="144" height="96" rx="12" fill="var(--c-storage-soft)" stroke="var(--c-storage)" strokeWidth="1.7" />
          <text x={n.x + 72} y="72" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="15" fontWeight="600" fill="var(--tx)">{n.label}</text>
          <text x={n.x + 72} y="90" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10" fill="var(--tx3)">tsconfig.json</text>
          <rect x={n.x + 12} y="100" width="120" height="20" rx="5" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1" />
          <text x={n.x + 72} y="114" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--tx2)">composite: true</text>
          <text x={n.x + 72} y="135" textAnchor="middle" fontFamily="var(--font-body)" fontSize="9.5" fill="var(--tx3)">{n.dep}</text>
        </g>
      ))}

      {/* reference arrows (app → core → shared) */}
      <line x1="184" y1="94" x2="268" y2="94" stroke="var(--accent)" strokeWidth="1.8" markerEnd="url(#pr-a)" />
      <line x1="412" y1="94" x2="496" y2="94" stroke="var(--accent)" strokeWidth="1.8" markerEnd="url(#pr-a)" />

      {/* emitted artifacts row */}
      <text x="20" y="182" fontFamily="var(--font-body)" fontSize="12" fontWeight="600" fill="var(--tx2)">each composite project emits:</text>
      <rect x="40" y="192" width="200" height="30" rx="7" fill="var(--c-commit-soft)" stroke="var(--c-commit)" strokeWidth="1.3" />
      <text x="140" y="211" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx)">*.d.ts  (+ declarationMap)</text>
      <rect x="260" y="192" width="200" height="30" rx="7" fill="var(--c-analytics-soft)" stroke="var(--c-analytics)" strokeWidth="1.3" />
      <text x="360" y="211" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx)">tsconfig.tsbuildinfo</text>

      {/* build command */}
      <rect x="40" y="244" width="600" height="52" rx="10" fill="var(--bg)" stroke="var(--line)" strokeWidth="1.3" />
      <text x="56" y="266" fontFamily="var(--font-mono)" fontSize="13" fill="var(--accent-bright)">tsc -b</text>
      <text x="112" y="266" fontFamily="var(--font-body)" fontSize="11.5" fill="var(--tx2)">builds shared → core → app in dependency order,</text>
      <text x="56" y="284" fontFamily="var(--font-body)" fontSize="11.5" fill="var(--tx2)">and skips any project whose inputs are unchanged (read from tsbuildinfo) — the incremental win.</text>

      <defs>
        <marker id="pr-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--accent)" />
        </marker>
      </defs>
    </svg>
  );
}
