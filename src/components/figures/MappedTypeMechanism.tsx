/* Static diagram: a mapped type is a for-loop over `keyof T`. `keyof T` yields the union of keys; the
   `[K in keyof T as …]` clause visits each key, optionally remaps its name (template literal +
   Capitalize) and transforms its value `T[K]`, producing a new object type. */
export function MappedTypeMechanism() {
  return (
    <svg
      viewBox="0 0 640 300"
      width="100%"
      role="img"
      aria-label="A source type T with name and age becomes keyof T, the union 'name' | 'age'. The mapped clause [K in keyof T as get-Capitalize-K] visits each key, producing the type getName returns string and getAge returns number."
      style={{ maxWidth: 640 }}
    >
      <title>How a mapped type works</title>

      {/* Source T */}
      <rect x="24" y="34" width="180" height="66" rx="9" fill="var(--c-storage-soft)" stroke="var(--c-storage)" strokeWidth="1.6" />
      <text x="114" y="55" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--tx)">type T</text>
      <text x="114" y="74" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx2)">name: string</text>
      <text x="114" y="90" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx2)">age: number</text>

      {/* keyof T */}
      <line x1="204" y1="67" x2="300" y2="67" stroke="var(--line2)" strokeWidth="1.5" markerEnd="url(#mp-arrow)" />
      <text x="252" y="58" textAnchor="middle" fontFamily="var(--font-body)" fontSize="11" fill="var(--tx3)">keyof T</text>
      <rect x="300" y="46" width="200" height="42" rx="21" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.5" />
      <text x="400" y="72" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--tx)">"name" | "age"</text>

      {/* mapping clause */}
      <line x1="400" y1="88" x2="400" y2="126" stroke="var(--line2)" strokeWidth="1.5" markerEnd="url(#mp-arrow)" />
      <rect x="70" y="126" width="500" height="52" rx="9" fill="var(--bg)" stroke="var(--c-analytics)" strokeWidth="1.5" strokeDasharray="5 4" />
      <text x="320" y="150" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--tx)">
        {'{ [K in keyof T as '}
        <tspan fill="var(--c-analytics)">{'`get${Capitalize<K>}`'}</tspan>
        {']: () => T[K] }'}
      </text>
      <text x="320" y="168" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fill="var(--tx3)">visit each key · remap the name · transform the value</text>

      {/* output */}
      <line x1="320" y1="178" x2="320" y2="212" stroke="var(--line2)" strokeWidth="1.5" markerEnd="url(#mp-arrow)" />
      <rect x="150" y="212" width="340" height="66" rx="9" fill="var(--c-commit-soft)" stroke="var(--c-commit)" strokeWidth="1.6" />
      <text x="320" y="233" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--tx)">Getters&lt;T&gt; =</text>
      <text x="320" y="251" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx2)">getName: () =&gt; string</text>
      <text x="320" y="268" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx2)">getAge: () =&gt; number</text>

      <defs>
        <marker id="mp-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--line2)" />
        </marker>
      </defs>
    </svg>
  );
}
