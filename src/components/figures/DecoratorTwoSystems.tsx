/* Static diagram (M8): one `@log` method decorator, two incompatible systems. The standard system
   (TS 5.0, no flag) passes (value, context) and returns a replacement; the legacy system
   (experimentalDecorators) passes (target, key, descriptor) and mutates the descriptor in place.
   The tsconfig flag selects one for the whole compilation. */
export function DecoratorTwoSystems() {
  return (
    <svg
      viewBox="0 0 640 320"
      width="100%"
      role="img"
      aria-label="A single at-log method decorator forks into two systems. On the left, the standard system from TypeScript 5.0 needs no flag: the decorator receives value and context and returns a replacement, and it has no parameter decorators. On the right, the legacy system enabled by experimentalDecorators: the decorator receives target, key and descriptor and mutates the descriptor in place, and it supports parameter decorators and design metadata. The tsconfig flag chooses one system for the whole compilation."
      style={{ maxWidth: 640 }}
    >
      <title>Two decorator systems: standard (value, context) vs legacy (target, key, descriptor)</title>

      <text x="20" y="26" fontFamily="var(--font-body)" fontSize="13" fontWeight="600" fill="var(--accent-bright)">
        One @log method decorator — two incompatible systems
      </text>

      {/* the shared declaration at the top */}
      <rect x="235" y="42" width="170" height="42" rx="9" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1.4" />
      <text x="320" y="60" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--tx)">{'@log method()'}</text>
      <text x="320" y="76" textAnchor="middle" fontFamily="var(--font-body)" fontSize="10.5" fill="var(--tx3)">the same declaration</text>

      {/* fork connectors */}
      <line x1="290" y1="84" x2="165" y2="126" stroke="var(--c-commit)" strokeWidth="1.8" markerEnd="url(#dts-a)" />
      <line x1="350" y1="84" x2="475" y2="126" stroke="var(--c-storage)" strokeWidth="1.8" markerEnd="url(#dts-b)" />

      {/* LEFT — standard */}
      <rect x="26" y="128" width="278" height="164" rx="11" fill="var(--c-commit-soft)" stroke="var(--c-commit)" strokeWidth="1.7" />
      <text x="44" y="152" fontFamily="var(--font-body)" fontSize="12.5" fontWeight="600" fill="var(--c-commit)">Standard — TS 5.0, no flag</text>
      <rect x="44" y="164" width="242" height="34" rx="7" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1.2" />
      <text x="60" y="186" fontFamily="var(--font-mono)" fontSize="13" fill="var(--tx)">{'(value, context) => replacement'}</text>
      <text x="46" y="222" fontFamily="var(--font-body)" fontSize="11.5" fill="var(--tx2)">• returns a replacement, or void</text>
      <text x="46" y="242" fontFamily="var(--font-body)" fontSize="11.5" fill="var(--tx2)">• context.kind / name / addInitializer</text>
      <text x="46" y="262" fontFamily="var(--font-body)" fontSize="11.5" fill="var(--tx2)">• no parameter decorators</text>
      <text x="46" y="282" fontFamily="var(--font-body)" fontSize="11.5" fill="var(--tx2)">• no emitDecoratorMetadata</text>

      {/* RIGHT — legacy */}
      <rect x="336" y="128" width="278" height="164" rx="11" fill="var(--c-storage-soft)" stroke="var(--c-storage)" strokeWidth="1.7" />
      <text x="354" y="152" fontFamily="var(--font-body)" fontSize="12.5" fontWeight="600" fill="var(--c-storage)">Legacy — experimentalDecorators</text>
      <rect x="354" y="164" width="242" height="34" rx="7" fill="var(--surface)" stroke="var(--line2)" strokeWidth="1.2" />
      <text x="368" y="186" fontFamily="var(--font-mono)" fontSize="12" fill="var(--tx)">{'(target, key, descriptor)'}</text>
      <text x="356" y="222" fontFamily="var(--font-body)" fontSize="11.5" fill="var(--tx2)">• mutates the descriptor in place</text>
      <text x="356" y="242" fontFamily="var(--font-body)" fontSize="11.5" fill="var(--tx2)">• parameter decorators supported</text>
      <text x="356" y="262" fontFamily="var(--font-body)" fontSize="11.5" fill="var(--tx2)">• emits design:* metadata</text>
      <text x="356" y="282" fontFamily="var(--font-body)" fontSize="11.5" fill="var(--tx2)">• used by NestJS / Angular / TypeORM</text>

      <defs>
        <marker id="dts-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--c-commit)" />
        </marker>
        <marker id="dts-b" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--c-storage)" />
        </marker>
      </defs>
    </svg>
  );
}
