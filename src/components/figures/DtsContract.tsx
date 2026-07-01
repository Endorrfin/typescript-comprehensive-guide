/* Static diagram (M13): one source file splits under `tsc --declaration` into three outputs. The .js
   keeps the runtime implementation (types erased — M9); the .d.ts keeps the SHAPE with bodies removed —
   this is the public type contract a consumer reads; the .d.ts.map links that contract back to the
   original source line so an editor's Go-to-Definition jumps to the .ts, not the generated .d.ts. */
export function DtsContract() {
  return (
    <svg
      viewBox="0 0 690 316"
      width="100%"
      role="img"
      aria-label="One source file greet.ts is compiled by tsc with the declaration flag into three outputs. First, greet.js keeps the runtime implementation with types erased. Second, greet.d.ts keeps only the shape — the exported interface and the function signature with the body removed — and this is the public type contract that a consumer reads. Third, greet.d.ts.map is a source map that links the declaration back to the original greet.ts source line, so an editor's Go to Definition jumps to the source rather than the generated declaration."
      style={{ maxWidth: 690 }}
    >
      <title>A .d.ts is the public contract: tsc --declaration splits source into .js, .d.ts and .d.ts.map</title>

      <text x="20" y="24" fontFamily="var(--font-body)" fontSize="13" fontWeight="600" fill="var(--accent-bright)">
        A .d.ts is the public contract — shape kept, implementation removed
      </text>

      {/* Source box */}
      <rect x="20" y="92" width="196" height="120" rx="11" fill="var(--c-storage-soft)" stroke="var(--c-storage)" strokeWidth="1.7" />
      <text x="34" y="86" fontFamily="var(--font-body)" fontSize="10.5" fontWeight="600" fill="var(--tx3)">SOURCE (you write)</text>
      <text x="34" y="116" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx)">greet.ts</text>
      <text x="34" y="140" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--tx2)">export function greet(</text>
      <text x="34" y="156" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--tx2)">{'  name: string): Greeting {'}</text>
      <text x="34" y="172" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--tx3)">{'  return { text, at };'}</text>
      <text x="34" y="188" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--tx2)">{'}'}</text>

      {/* tsc arrow */}
      <line x1="216" y1="150" x2="270" y2="150" stroke="var(--accent)" strokeWidth="1.8" markerEnd="url(#dc-a)" />
      <text x="243" y="142" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--tx3)">tsc</text>
      <text x="243" y="166" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--tx3)">--declaration</text>

      {/* Output 1 — .js implementation (de-emphasised) */}
      <rect x="286" y="60" width="384" height="52" rx="9" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1.3" />
      <text x="300" y="82" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx2)">greet.js</text>
      <text x="300" y="99" fontFamily="var(--font-body)" fontSize="10.5" fill="var(--tx3)">runtime implementation · types erased</text>

      {/* Output 2 — .d.ts THE CONTRACT (emphasised) */}
      <rect x="286" y="120" width="384" height="66" rx="9" fill="var(--c-commit-soft)" stroke="var(--c-commit)" strokeWidth="1.8" />
      <text x="300" y="142" fontFamily="var(--font-mono)" fontSize="12" fontWeight="600" fill="var(--tx)">greet.d.ts</text>
      <text x="560" y="142" textAnchor="end" fontFamily="var(--font-body)" fontSize="10" fontWeight="600" fill="var(--c-commit)">the public contract</text>
      <text x="300" y="160" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--tx2)">export interface Greeting {'{ text; at }'}</text>
      <text x="300" y="176" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--tx2)">export declare function greet(name): Greeting;</text>

      {/* Output 3 — .d.ts.map back-link */}
      <rect x="286" y="194" width="384" height="48" rx="9" fill="var(--c-analytics-soft)" stroke="var(--c-analytics)" strokeWidth="1.4" />
      <text x="300" y="214" fontFamily="var(--font-mono)" fontSize="11.5" fill="var(--tx)">greet.d.ts.map</text>
      <text x="300" y="231" fontFamily="var(--font-body)" fontSize="10.5" fill="var(--tx3)">Go-to-Definition → jumps to the source line</text>

      {/* back-link arrow from map to source */}
      <path d="M286,224 C250,224 244,208 216,202" fill="none" stroke="var(--c-analytics)" strokeWidth="1.4" strokeDasharray="4 4" markerEnd="url(#dc-m)" />

      {/* footnote */}
      <rect x="20" y="258" width="650" height="44" rx="9" fill="var(--bg)" stroke="var(--line)" strokeWidth="1.2" />
      <text x="34" y="278" fontFamily="var(--font-body)" fontSize="11" fill="var(--tx2)">The bodies are gone; only the signatures remain. What you ship is only as precise as the</text>
      <text x="34" y="294" fontFamily="var(--font-body)" fontSize="11" fill="var(--tx2)">exported types you wrote — a sloppy public signature becomes a sloppy contract for every consumer.</text>

      <defs>
        <marker id="dc-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--accent)" />
        </marker>
        <marker id="dc-m" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill="var(--c-analytics)" />
        </marker>
      </defs>
    </svg>
  );
}
