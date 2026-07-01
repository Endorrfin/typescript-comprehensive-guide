/* Static diagram (M9): the trust boundary. Untrusted sources (HTTP body/query, 3rd-party response,
   env, queue) hand you `any` / `unknown`; a validation gate is the only thing that turns that into a
   value the DTO type actually describes. An `as` cast is a hole in the wall — it changes the type,
   not the data — so unchecked input slips straight through into the typed core. */
export function TrustBoundary() {
  return (
    <svg
      viewBox="0 0 660 320"
      width="100%"
      role="img"
      aria-label="A trust boundary, left to right. On the left, untrusted sources — an HTTP body, a query string, a third-party response, an environment variable — each typed only as any or unknown. In the middle stands a wall with a single validation gate labelled parse or ValidationPipe. Input that goes through the gate reaches the typed core on the right, a validated CreateUserDto. But a dashed red arrow labelled 'as CreateUserDto' bypasses the gate through a crack in the wall, carrying unchecked data straight into the core — the cast changes the type, not the data."
      style={{ maxWidth: 660 }}
    >
      <title>The trust boundary: validate to cross it; an `as` cast is a hole that bypasses the check</title>

      <text x="20" y="26" fontFamily="var(--font-body)" fontSize="13" fontWeight="600" fill="var(--accent-bright)">
        The boundary is where the type lies — validate to cross it
      </text>

      {/* band labels */}
      <text x="120" y="52" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fontWeight="600" fill="var(--tx3)">UNTRUSTED</text>
      <text x="560" y="52" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fontWeight="600" fill="var(--tx3)">TYPED CORE</text>

      {/* LEFT — untrusted sources */}
      <rect x="20" y="66" width="200" height="150" rx="10" fill="var(--c-danger-soft)" stroke="var(--c-danger)" strokeWidth="1.5" />
      <text x="120" y="88" textAnchor="middle" fontFamily="var(--font-body)" fontSize="11.5" fontWeight="600" fill="var(--c-danger)">raw input · any / unknown</text>
      <text x="36" y="112" fontFamily="var(--font-mono)" fontSize="11" fill="var(--tx2)">• HTTP body / query / params</text>
      <text x="36" y="134" fontFamily="var(--font-mono)" fontSize="11" fill="var(--tx2)">• 3rd-party res.json()</text>
      <text x="36" y="156" fontFamily="var(--font-mono)" fontSize="11" fill="var(--tx2)">• process.env</text>
      <text x="36" y="178" fontFamily="var(--font-mono)" fontSize="11" fill="var(--tx2)">• queue / event payload</text>
      <text x="36" y="202" fontFamily="var(--font-body)" fontSize="10.5" fontStyle="italic" fill="var(--tx3)">shape decided by the sender</text>

      {/* THE WALL */}
      <rect x="300" y="60" width="14" height="200" rx="3" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1.4" />
      {/* the gate (validation) */}
      <rect x="286" y="120" width="42" height="66" rx="8" fill="var(--c-commit-soft)" stroke="var(--c-commit)" strokeWidth="1.8" />
      <text x="307" y="100" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fontWeight="600" fill="var(--c-commit)">gate</text>
      <text x="307" y="150" textAnchor="middle" fontFamily="var(--font-body)" fontSize="9.5" fill="var(--tx2)">parse</text>
      <text x="307" y="164" textAnchor="middle" fontFamily="var(--font-body)" fontSize="9.5" fill="var(--tx2)">/ Pipe</text>

      {/* validated path — through the gate */}
      <line x1="220" y1="153" x2="286" y2="153" stroke="var(--c-commit)" strokeWidth="1.8" markerEnd="url(#tb-ok)" />
      <line x1="328" y1="153" x2="440" y2="153" stroke="var(--c-commit)" strokeWidth="1.8" markerEnd="url(#tb-ok)" />
      <text x="384" y="144" textAnchor="middle" fontFamily="var(--font-body)" fontSize="9.5" fill="var(--tx3)">validated</text>

      {/* RIGHT — typed core */}
      <rect x="442" y="118" width="196" height="72" rx="10" fill="var(--c-commit-soft)" stroke="var(--c-commit)" strokeWidth="1.6" />
      <text x="540" y="144" textAnchor="middle" fontFamily="var(--font-body)" fontSize="11.5" fontWeight="600" fill="var(--c-commit)">typed value</text>
      <text x="540" y="166" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx)">CreateUserDto</text>
      <text x="540" y="182" textAnchor="middle" fontFamily="var(--font-body)" fontSize="9.5" fill="var(--tx3)">the type is now true</text>

      {/* the `as` hole — bypasses the gate */}
      <line x1="220" y1="240" x2="638" y2="240" stroke="var(--c-danger)" strokeWidth="1.8" strokeDasharray="5 4" markerEnd="url(#tb-bad)" />
      {/* crack in the wall */}
      <path d="M300,232 l14,4 l-14,4 l14,4" fill="none" stroke="var(--c-danger)" strokeWidth="1.4" />
      <text x="150" y="232" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--c-danger)">{'input as CreateUserDto'}</text>
      <text x="150" y="266" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10" fill="var(--tx3)">a cast: changes the type, checks nothing</text>
      <text x="470" y="266" fontFamily="var(--font-body)" fontSize="10" fontWeight="600" fill="var(--c-danger)">unchecked data enters wearing a type it lacks</text>

      {/* footnote */}
      <text x="20" y="300" fontFamily="var(--font-body)" fontSize="11" fill="var(--tx2)">Type raw input as <tspan fontFamily="var(--font-mono)" fill="var(--tx)">unknown</tspan> so the compiler forbids use until a runtime check proves the shape.</text>

      <defs>
        <marker id="tb-ok" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--c-commit)" />
        </marker>
        <marker id="tb-bad" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--c-danger)" />
        </marker>
      </defs>
    </svg>
  );
}
