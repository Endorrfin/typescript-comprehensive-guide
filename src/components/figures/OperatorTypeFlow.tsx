/* Static diagram (M10): types thread through an RxJS pipe. Each operator is an OperatorFunction<T, R>,
   so map carries string → number and a type-guard filter narrows number → Even. The Observable's type
   parameter at each stage is whatever the previous operator produced — inferred, not annotated. */
export function OperatorTypeFlow() {
  return (
    <svg
      viewBox="0 0 680 260"
      width="100%"
      role="img"
      aria-label="Types flowing through an RxJS pipe, left to right. It starts as Observable of string. A map operator, typed OperatorFunction of string to number, turns it into Observable of number. Then a filter with a type-guard predicate, typed OperatorFunction of number to Even, narrows it into Observable of Even. A caption notes that each operator is an OperatorFunction of T to R, so pipe threads the output type of one into the input type of the next, and the generics are inferred from the callbacks rather than annotated."
      style={{ maxWidth: 680 }}
    >
      <title>Operator type flow: each operator is an OperatorFunction&lt;T, R&gt;; pipe threads the types</title>

      <text x="20" y="26" fontFamily="var(--font-body)" fontSize="13" fontWeight="600" fill="var(--accent-bright)">
        Types thread through a pipe — each operator is an OperatorFunction&lt;T, R&gt;
      </text>

      {/* Stage 1 — Observable<string> */}
      <rect x="20" y="98" width="120" height="48" rx="9" fill="var(--c-storage-soft)" stroke="var(--c-storage)" strokeWidth="1.6" />
      <text x="80" y="127" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--tx)">Observable&lt;string&gt;</text>

      {/* op: map */}
      <line x1="140" y1="122" x2="196" y2="122" stroke="var(--c-query)" strokeWidth="1.8" markerEnd="url(#otf-q)" />
      <rect x="198" y="92" width="150" height="60" rx="9" fill="var(--c-query-soft)" stroke="var(--c-query)" strokeWidth="1.6" />
      <text x="273" y="114" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx)">map(s =&gt; s.length)</text>
      <text x="273" y="134" textAnchor="middle" fontFamily="var(--font-body)" fontSize="9.5" fill="var(--c-query)">OperatorFunction&lt;string, number&gt;</text>

      {/* Stage 2 — Observable<number> */}
      <line x1="348" y1="122" x2="404" y2="122" stroke="var(--c-query)" strokeWidth="1.8" markerEnd="url(#otf-q)" />
      <rect x="406" y="98" width="128" height="48" rx="9" fill="var(--c-storage-soft)" stroke="var(--c-storage)" strokeWidth="1.6" />
      <text x="470" y="127" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--tx)">Observable&lt;number&gt;</text>

      {/* op: filter (type guard) */}
      <line x1="470" y1="146" x2="470" y2="176" stroke="var(--c-analytics)" strokeWidth="1.8" markerEnd="url(#otf-a)" />
      <rect x="360" y="178" width="220" height="56" rx="9" fill="var(--c-analytics-soft)" stroke="var(--c-analytics)" strokeWidth="1.6" />
      <text x="470" y="200" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11.5" fill="var(--tx)">filter((n): n is Even =&gt; …)</text>
      <text x="470" y="220" textAnchor="middle" fontFamily="var(--font-body)" fontSize="9.5" fill="var(--c-analytics)">OperatorFunction&lt;number, Even&gt; — narrows</text>

      {/* Stage 3 — Observable<Even> */}
      <line x1="360" y1="206" x2="230" y2="206" stroke="var(--c-analytics)" strokeWidth="1.8" markerEnd="url(#otf-a)" />
      <rect x="96" y="182" width="128" height="48" rx="9" fill="var(--c-commit-soft)" stroke="var(--c-commit)" strokeWidth="1.7" />
      <text x="160" y="211" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--tx)">Observable&lt;Even&gt;</text>

      {/* caption strip */}
      <text x="20" y="60" fontFamily="var(--font-body)" fontSize="11" fill="var(--tx2)">
        <tspan fontFamily="var(--font-mono)" fill="var(--tx)">map</tspan> changes T → R; a plain <tspan fontFamily="var(--font-mono)" fill="var(--tx)">filter</tspan> keeps T; a type-guard <tspan fontFamily="var(--font-mono)" fill="var(--tx)">filter</tspan> narrows T → U. Generics are inferred from the callbacks.
      </text>

      <defs>
        <marker id="otf-q" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--c-query)" />
        </marker>
        <marker id="otf-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--c-analytics)" />
        </marker>
      </defs>
    </svg>
  );
}
