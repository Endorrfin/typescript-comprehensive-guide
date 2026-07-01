/* Static diagram (M10): the two reactive models. An Observable is a push-based stream that emits
   values over time (top lane, dots on a timeline, consumed by subscribe). A signal is a pull-based
   memoized cell holding one current value you read now (bottom lane). `toSignal` and `toObservable`
   bridge the two, so a component can use whichever fits each job. */
export function SignalsVsStreams() {
  return (
    <svg
      viewBox="0 0 660 300"
      width="100%"
      role="img"
      aria-label="Two reactive models in two lanes. The top lane is an Observable of T: a push-based stream, drawn as a timeline with three emission dots arriving over time and an arrowhead, consumed by subscribe; it is asynchronous and multi-value. The bottom lane is a Signal of T: a pull-based memoized cell holding one current value, read synchronously by calling it like count(). Between the lanes, two vertical arrows bridge the models — toSignal converts an Observable into a signal, and toObservable converts a signal into an Observable."
      style={{ maxWidth: 660 }}
    >
      <title>Signals vs streams: a pull-based memoized cell vs a push-based stream, bridged by toSignal / toObservable</title>

      <text x="20" y="26" fontFamily="var(--font-body)" fontSize="13" fontWeight="600" fill="var(--accent-bright)">
        Two reactive models — push stream vs pull cell
      </text>

      {/* ── TOP LANE: Observable (push, over time) ── */}
      <rect x="20" y="48" width="620" height="92" rx="11" fill="var(--c-storage-soft)" stroke="var(--c-storage)" strokeWidth="1.5" />
      <text x="36" y="70" fontFamily="var(--font-mono)" fontSize="12.5" fontWeight="600" fill="var(--c-storage)">Observable&lt;T&gt;</text>
      <text x="150" y="70" fontFamily="var(--font-body)" fontSize="10.5" fill="var(--tx3)">— push · async · many values over time</text>

      {/* timeline */}
      <line x1="40" y1="112" x2="560" y2="112" stroke="var(--line2)" strokeWidth="1.4" markerEnd="url(#svs-t)" />
      <text x="574" y="116" fontFamily="var(--font-body)" fontSize="10" fill="var(--tx3)">time</text>
      {/* emission dots */}
      <circle cx="120" cy="112" r="7" fill="var(--c-storage)" />
      <circle cx="250" cy="112" r="7" fill="var(--c-storage)" />
      <circle cx="380" cy="112" r="7" fill="var(--c-storage)" />
      <text x="120" y="132" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--tx3)">emit</text>
      <text x="250" y="132" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--tx3)">emit</text>
      <text x="380" y="132" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--tx3)">emit</text>
      <text x="470" y="100" fontFamily="var(--font-body)" fontSize="10" fill="var(--tx3)">subscribe →</text>

      {/* ── BOTTOM LANE: Signal (pull, one value now) ── */}
      <rect x="20" y="184" width="620" height="86" rx="11" fill="var(--c-commit-soft)" stroke="var(--c-commit)" strokeWidth="1.5" />
      <text x="36" y="206" fontFamily="var(--font-mono)" fontSize="12.5" fontWeight="600" fill="var(--c-commit)">Signal&lt;T&gt;</text>
      <text x="150" y="206" fontFamily="var(--font-body)" fontSize="10.5" fill="var(--tx3)">— pull · synchronous · one current value</text>

      {/* the memoized cell */}
      <rect x="120" y="224" width="120" height="34" rx="8" fill="var(--surface)" stroke="var(--c-commit)" strokeWidth="1.6" />
      <text x="180" y="246" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--tx)">value</text>
      <text x="300" y="240" fontFamily="var(--font-mono)" fontSize="11.5" fill="var(--tx2)">read: count()</text>
      <text x="300" y="256" fontFamily="var(--font-body)" fontSize="9.5" fill="var(--tx3)">memoized · glitch-free</text>

      {/* ── BRIDGES ── */}
      <line x1="500" y1="140" x2="500" y2="184" stroke="var(--c-analytics)" strokeWidth="1.8" markerEnd="url(#svs-a)" />
      <text x="510" y="166" fontFamily="var(--font-mono)" fontSize="11" fill="var(--c-analytics)">toSignal</text>
      <line x1="590" y1="184" x2="590" y2="140" stroke="var(--c-query)" strokeWidth="1.8" markerEnd="url(#svs-q)" />
      <text x="524" y="180" fontFamily="var(--font-mono)" fontSize="11" fill="var(--c-query)">toObservable</text>

      <defs>
        <marker id="svs-t" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--line2)" />
        </marker>
        <marker id="svs-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--c-analytics)" />
        </marker>
        <marker id="svs-q" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--c-query)" />
        </marker>
      </defs>
    </svg>
  );
}
