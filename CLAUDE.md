# CLAUDE.md — `typescript-comprehensive-guide`

> **Working guide and source of truth for every session in this repo. Read this file fully before
> starting any session.** Update the *Status / progress log* (§14) at the end of each session.
> See `../_standard/GUIDE-AUTHORING-STANDARD.md` for the cross‑guide rules this guide conforms to (Tier 1).

## 1. Mission
A deep, interactive, **bilingual (EN/UA)** guide to how **TypeScript actually works** — the structural
type system, type‑level programming (generics, conditional types, `infer`, mapped/utility types), the
applied stack (NestJS · Angular), and the compiler/tooling. Audience: **senior → staff** (with a beginner
on‑ramp). Quality bar = the `../database guide` "golden" standard: mental models + teaching prose +
diagrams/tables + curated signature sims + **verified sources**, in both languages, typechecking and
building clean.

## 2. Stack & key decisions (with why)
- **Vite + React 19 + TypeScript (strict).** Static content, no runtime fetch — works offline, deploys anywhere.
- **No router library** — a small custom **hash router** (`#/m/<module>/<topic>`, `#/map`,
  `#/mental-models`, `#/glossary`). Hash routing + `vite base:'./'` makes the build work under **any**
  GitHub Pages sub‑path with zero config. (Later routes: `#/decide`, `#/flashcards`, `#/quiz`.)
- **Single source of truth for content:** `src/data/concepts.ts` (thin aggregator) + `src/data/modules/*`.
  Pages are *rendered from data*; we never hand‑write page HTML.
- **Bilingual at the data layer:** every human‑readable string is a `Localized` value `{ en; uk }`.
- **Figures and sims are referenced by key** and resolved via `lib/registry.tsx` (React.lazy). Content is
  edited **only** in `src/data/*`.
- **Meta/bundle split DONE (S5)** (standard §4.4): `scripts/genMeta.ts` derives `src/data/meta.json` (slim
  nav/search index) from `concepts.ts`; the eager chrome (TopBar, Sidebar, Footer, LandscapeMap, search)
  imports `src/data/meta.ts`, and only the lazy `ModulePage` imports full bodies from `concepts.ts` — so
  the ~242 KB content chunk loads on module navigation, not initial paint. `checkMeta.ts` guards drift
  (chained into `typecheck`); `gen:meta` runs on `predev`/`prebuild`; `meta.json` is committed. `// CHANGED (S5)`.
- **TypeScript‑blue accent** (`#3178c6` family) on the shared dark‑editorial palette.

## 3. Repo layout (target — standard §4.3)
```
src/
  main.tsx · App.tsx · vite-env.d.ts
  data/      concepts.ts (SSOT) · modules/mN-*.ts · types.ts · glossary.ts · mentalModels.ts
  i18n/      lang.ts (useLang) · LangProvider.tsx · ui.ts
  lib/       hashRouter.ts · registry.tsx · search.ts · appState.ts · utils.ts · typeEval.ts (M5 engine)
  theme/     tokens.css · global.css · components.css
  components/ layout/ · module/ · map/ · pages/ · sims/ · figures/
scripts/     check-data.ts · run-tests.ts · test-typeeval.ts · smoke.ts · css-stub-hooks.mjs
public/      favicon.svg · .nojekyll
.github/workflows/deploy.yml · CLAUDE.md · PROJECT-BRIEF.md · CURRICULUM.md · README.md · configs
```
`data/meta.ts` + generated `data/meta.json` present (S5 meta split, §2) — layout now matches §4.3.

## 4. Content / data model (the contract)
**Section** (top‑level) → **Module** (navigable, skippable) → **Topic** (deep‑linkable
`#/m/<module>/<topic>`) → content **Block**. The 7 block kinds: `prose · figure · sim · table · code ·
callout · compare`. The TypeScript contract lives in `src/data/types.ts` (the shared Tier‑1 contract +
`GlossaryEntry`/`MentalModelCard`). Each module opens with a **mental model** + **key points** and closes
with **pitfalls** + interview Q&A. Stubs carry a mental model + nav only (`topics: []` → `isAuthored` false).

## 5. Curriculum (at a glance — `CURRICULUM.md` is authoritative)
- **I · The Type System** — structural typing, narrowing/CFA, functions & variance.
- **II · Type‑Level Programming** — generics, **★ conditional types & `infer` (M5, golden)**, mapped/
  template‑literal types, utility types.
- **III · Applied TypeScript** — decorators & DI, DTO validation, RxJS/signals typing.
- **IV · Compiler & Tooling** — tsconfig/strictness, module resolution & project refs, declaration files.
- **4 sections · 13 modules.** S1 shipped M5 + the app shell; S2 shipped M1 + M2 (Section I); S3 added
  M4 + M6 (Section II); S4 added M7 (**Section II complete**); S5 added M3 + the meta split (**Section I
  complete**); S6 opened **Section III** with **M8 (Decorators & Metadata)**; S7 added **M9 (DTO Validation)
  + M10 (RxJS/Signals)** — **Section III complete**; S8 opened **Section IV** with **M11 (tsconfig &
  strictness) + M12 (modules & resolution)**, each with a ★ signature sim. Only **M13** remains (stub).

## 6. Signature interactives + diagram‑first baseline
Curated sims only — a pure engine in `lib/*` (deterministic, unit‑tested) + a component (play/pause/step,
ARIA + live region, **`prefers-reduced-motion`** fallback). Shipped (8): **★ `conditional-type-eval`** (M5,
`lib/typeEval.ts` · 73); **★ `structural-assignability`** (M1, `lib/assignability.ts` · 141);
**★ `control-flow-narrowing`** (M2, `lib/narrowing.ts` · 42); **★ `generic-inference`** (M4,
`lib/inference.ts` · 37); **★ `mapped-type-transform`** (M6, `lib/mappedType.ts` · 52);
**★ `utility-type-decode`** (M7, `lib/utilityType.ts` · 188); **★ `tsconfig-strictness`** (M11,
`lib/tsconfigStrict.ts` · 82); **★ `module-resolution`** (M12, `lib/resolution.ts` · 67). Diagram‑first elsewhere (crisp SVG + table) —
**M3 (functions & variance) is diagram‑first**, no sim: figures `variance-directions` + `overload-resolution`;
**M8 (decorators & metadata) is diagram‑first** too: figures `decorator-two-systems` + `di-metadata-flow`;
**M9 (DTO validation)** adds `trust-boundary` + `schema-single-source`; **M10 (RxJS/signals)** adds
`signals-vs-streams` + `operator-type-flow`; **M11** adds `strict-family`; **M12** adds `resolution-pipeline`
+ `project-references` (figures now **18**). All planned signature sims are shipped (M11 · M12); the final
module M13 will be diagram-first.

## 7. Theme / brand
Dark editorial; palette in `theme/tokens.css`; TypeScript‑blue accent (`#3178c6`). Fonts **Fraunces**
(display) · **Inter** · **JetBrains Mono**. Light + dark + system themes (persisted).

## 8. Internationalization
**Author EN first, UA second.** Keep **ALL technical terms English** in UA (TypeScript, generic,
conditional type, `infer`, union, mapped type, variance…). Translate only explanation/analogy. Runtime
toggle in the top bar; `i18n/` holds the provider + `useLang` hook + ui strings.

## 9. Deliverables
The web guide (primary) · bilingual `README.md` · this `CLAUDE.md` (current) · `CURRICULUM.md` (current).
Deferred/optional: PDF booklet · LinkedIn pack.

## 10. Conventions
- TypeScript **strict** + `noUnusedLocals/Parameters`; **ESLint clean** (build fails otherwise).
- Content edited **only** in `src/data/*`; never hand‑edit rendered output.
- Every non‑trivial product claim must be verifiable — fill `sources`; **web‑search** version‑sensitive facts.
- Each content session ends with the verification gate (`npm run verify`) + a fact spot‑check.
- **User working rules (every session):** (1) specific not generic; (2) brief "why"; (3) describe change +
  why **before** doing it; (4) mark edits `// CHANGED (S<N>):`; (5) lint‑aware; (6) reliability/security/
  best‑practice first; (7) ask when unclear; (8) don't just agree — challenge wrong/partial reasoning.
- **Session summary (end of EVERY session):** (1) what was done; (2) suggested **branch name**
  (`sN-short-topic`) + **commit message** + short description; (3) challenges/questions.

## 11. Deploy
GitHub Pages via Actions (`.github/workflows/deploy.yml`): typecheck → lint → check:data → test → smoke →
build → upload `dist` → deploy. `concurrency: cancel-in-progress: false`. `vite base:'./'` +
`public/.nojekyll` make it sub‑path‑safe. **Agent sessions never push** — the owner deploys.

## 12. Gotchas / constraints
- The Linux sandbox **blocks `unlink`** → Vite `emptyOutDir` fails on rebuild (EPERM), and `rm -rf
  node_modules/dist` only partially succeeds. Build into a fresh `--outDir dist-sN` (gitignored) or
  `build.emptyOutDir:false`; verify in a scratch copy. The **owner** deletes sandbox `node_modules`/`dist`
  and runs `npm install` natively (darwin‑arm64).
- Don't run git against the live repo from the sandbox.
- `check-data.ts`'s registry parser was hardened (S1) to read the whole `export const sims/figures = {…}`
  body — the template's split‑on‑word version missed keys when the record name appeared in comments/paths.

## 13. Session roadmap
- **S1 (done):** scaffold + app shell + **M5 golden** (Generics & Conditional Types) + sim + 2 figures
  + palette retuned to the official TypeScript brand (white + #00273F navy + #3178C6; light default).
- **S2 (done) — Section I, M1 + M2.** Authored both to the golden DoD (§§4,6,10), replacing their stubs in
  `concepts.ts` (imported like `m5`, `signature:true`, `level:'middle'`):
  - **M1 `m1-structural-typing`** — *Structural Typing & Assignability*. Sim = **structural-assignability
    checker** ("is A assignable to B?" with a member-by-member reasoning trace): pure engine
    `src/lib/assignability.ts` + `scripts/test-assignability.ts` + `components/sims/AssignabilitySim.tsx`
    + a figure. Topics: structural vs nominal · the assignability relation · excess-property checks ·
      widening/`const` · object/function/array compatibility.
  - **M2 `m2-narrowing`** — *Narrowing & Control-Flow Analysis*. Sim = **control-flow narrowing
    visualizer** (step preset snippets line-by-line; show the variable's inferred type at each point,
    ending in `never` exhaustiveness): engine `src/lib/narrowing.ts` + `scripts/test-narrowing.ts` +
    `components/sims/NarrowingSim.tsx` + a figure. Topics: type guards · `typeof`/`in`/`instanceof` ·
    truthiness/equality · discriminated unions · assertion functions & type predicates · exhaustiveness.
  - Web-verify & cite: inferred type predicates (5.5), assertion functions / `asserts` (3.7), `satisfies`
    (4.9), `const` assertions. Register sims/figures in `registry.tsx`; add `smoke.ts` canaries (English
    terms, no angle brackets); update `glossary.ts`. COUNTS stay 4/13 (sim count → 3). Append sim CSS to
    `components.css` (mirror the `.ct-*` block); ARIA + live region + reduced-motion fallback each.
  - **Verify** (sandbox blocks `unlink`): `npm install` if needed, then typecheck · lint · check:data ·
    test · smoke · `vite build --outDir dist-s2 --emptyOutDir`. Branch `s2-section-i-m1-m2`. Owner ships.
  - **Kickoff phrase for the new session:** *"Continue the TypeScript guide — author modules M1 and M2
    (Section I) per CLAUDE.md §13. Read CLAUDE.md, PROJECT-BRIEF and CURRICULUM and the M5/typeEval
    patterns first."*
- **S3 (done):** M4 (generics) + M6 (mapped/template‑literal types) — both authored with signature sims.
- **S4 (done):** M7 (utility types) + the ★ utility‑type decoder — **Section II complete**. Single module,
  golden depth (M3 deferred to S5).
- **S5 (done):** shipped the **meta/bundle split** (standard §4.4: `genMeta.ts` + `checkMeta.ts` +
  `data/meta.ts`/`meta.json`; eager chrome repointed to `meta`, bodies deferred to the lazy `ModulePage`)
  **then authored M3 (Functions, Overloads & Variance)** to golden depth — **Section I complete**. See §14.
- **S6 (done):** **Section III (applied) opened — M8 (Decorators & Metadata), diagram-first.** Golden DoD,
  grounded in the owner's NestJS 11 / Angular 21 stack (legacy vs standard decorators; DI metadata). See §14.
- **S7 (done):** continued **Section III** — M9 (DTO Validation & API Boundaries) + M10 (Typing RxJS,
  Signals & Component State), both diagram‑first, grounded in the owner's NestJS 11 / Angular 21 stack.
  **Section III complete.** See §14.
- **S8 (done):** **Section IV opened — M11 (tsconfig & the Strictness Model) + M12 (Modules, Resolution &
  Project References), both with the two remaining planned ★ signature sims** (`tsconfig-strictness` ·
  `module-resolution`, each a pure engine + unit test). Golden DoD, grounded in the owner's Node 22 / NestJS /
  esbuild-Serverless stack. See §14. Only M13 remains a stub.
- **S9 (next):** **M13 (Declaration Files & Publishing Types)** — completes all 13 modules and Section IV.
  Diagram-first (staff level; no planned sim); authoring `.d.ts`, shipping types with a package, `exports`
  types conditions, and not breaking consumers (ties to M12 exports + M11 isolatedDeclarations).
  - **Kickoff phrase for the new session:** *"Continue the TypeScript guide — author M13 (declaration files
    & publishing types), diagram-first, per CLAUDE.md §13 to golden depth. Read CLAUDE.md, PROJECT-BRIEF,
    CURRICULUM and the M8/M9/M10 diagram-first patterns + M11/M12 first."*
- **Polish:** `#/decide` picker · flashcards/quiz · final QA · deploy.

## 14. Status / progress log
- **S1** — **Scaffolded the guide and shipped the golden module.** Stood up the Tier‑1 SPA (Vite + React
  19 + TS strict): app shell (TopBar with global search, collapsible Sidebar, Footer, ProgressBar, hash
  router, i18n EN/UA, light/dark/system theme), landing Overview, Glossary (20 terms), Mental‑Models
  gallery. Authored **M5 — Generics & Conditional Types** (5 topics, all 7 block kinds, key points,
  pitfalls, 4 interview Q&A, 8 verified sources) with its **★ signature sim** (`conditional-type-eval`)
  driven by a pure engine `lib/typeEval.ts` (73‑assertion golden test) + 2 SVG figures. 12 other modules
  are navigable stubs with mental models. Facts web‑verified (TS 6.0.3 current; TS 7.0 Go‑native RC Jun
  2026; `NoInfer` 5.4; `const` type params 5.0; distributive conditionals / `[T] extends [U]`).
  **Verification:** `typecheck ✓ · lint ✓ · check:data ✓ (4 sections, 13 modules) · test ✓ (73) ·
  smoke ✓ (53 SSR checks, EN+UK) · build ✓` (code‑split, react‑vendor isolated).
  Branch `s1-scaffold-golden-m5`. **Owner:** delete sandbox `node_modules`/`dist`, `npm install`, then
  commit + first Pages deploy. **Open items:** meta/bundle split deferred; next session = M1 + M2.
- **S2** — **Authored Section I: M1 (Structural Typing & Assignability) + M2 (Narrowing & CFA).** Both to
  the golden DoD — 5 topics each, all 7 block kinds, key points, pitfalls, 4 interview Q&A, verified
  sources, EN+UA. Two **★ signature sims**, each a pure engine + unit test + component (ARIA live region +
  `prefers-reduced-motion`): **`structural-assignability`** (`lib/assignability.ts`, 141‑assertion test) —
  pick Source/Target, step the member‑by‑member obligations, toggle "fresh literal" for the excess‑property
  check, ⇄ to flip direction; **`control-flow-narrowing`** (`lib/narrowing.ts`, 42‑assertion test) — step
  preset snippets line‑by‑line, watch the union shrink to `never` at an exhaustive switch. Added 2 figures
  (`structural-vs-nominal`, `narrowing-funnel`), 9 glossary terms, `.as-*`/`.nr-*` sim CSS, smoke canaries +
  M1/M2 route hashes. Facts web‑verified: excess‑property checks & freshness; const assertions (3.4);
  `satisfies` (4.9); `strictFunctionTypes` (2.6, methods stay bivariant); assertion functions / `asserts`
  (3.7); inferred type predicates (5.5). COUNTS 4/13, sims → 3.
  **Verification:** `typecheck ✓ · lint ✓ · check:data ✓ (4 sections, 13 modules) · test ✓ (256:
  141+42+73) · smoke ✓ (73 checks, 3 sims + 4 figures, EN+UK) · build ✓` (all sims code‑split).
  Branch `s2-section-i-m1-m2`. **Owner:** delete sandbox `node_modules`/`dist*`, `npm install`, commit +
  deploy. **Open items:** meta/bundle split still deferred; next = S3 (M4 generics + M6 mapped/template).
- **S3** — **Deepened Section II: M4 (Generic Functions & Classes) + M6 (Mapped & Template‑Literal Types).**
  Both to the golden DoD — 5 topics each, all 7 block kinds, key points, pitfalls, 4 interview Q&A,
  verified sources, EN+UA. Two **★ signature sims**, each a pure engine + unit test + component (ARIA live
  region + `prefers-reduced-motion`): **`generic-inference`** (`lib/inference.ts`, 37‑assertion test) —
  pick a generic fn + a call, step each inference site’s candidate → best‑common‑type, with default
  fallback + constraint check; **`mapped-type-transform`** (`lib/mappedType.ts`, 52‑assertion test) — step
  `[K in keyof T]` key by key through modifier flips, `as` key remapping and value transforms, watching
  homomorphic preservation. Added 2 figures (`inference-sites`, `mapped-type-mechanism`), 6 glossary terms,
  `.in-*`/`.mp-*` sim CSS, smoke canaries + M4/M6 route hashes. Facts web‑verified: generic defaults (2.3),
  const type params (5.0), NoInfer (5.4); mapped types & plain modifiers (2.1), `+`/`-` modifier prefixes &
  homomorphic preservation (2.8), key remapping `as` + template literals + intrinsic string types (4.1);
  static members can’t use the class type param (erasure). COUNTS 4/13, sims → 5.
  **Verification:** `typecheck ✓ · lint ✓ · check:data ✓ (4 sections, 13 modules) · test ✓ (345:
  141+37+52+42+73) · smoke ✓ (91 checks, 5 sims + 6 figures, EN+UK) · build ✓` (all sims code‑split).
  Branch `s3-section-ii-m4-m6`. **Owner:** delete sandbox `node_modules`/`dist*`, `npm install`, commit +
  deploy. **Open items:** meta/bundle split still deferred (5 authored modules — revisit soon); next = S4
  (M7 utility types + M3 functions & variance). Section I now needs only M3 to be complete.
- **S4** — **Completed Section II: M7 (Built‑in Utility Types, Decoded).** Authored to the golden DoD —
  5 topics (map‑or‑filter taxonomy · object‑shaping mapped · union‑filtering distributive · function
  inspection `infer` · `Awaited` & composing), all 7 block kinds, 6 key points, 4 pitfalls, 4 interview
  Q&A, 8 verified sources, EN+UA. One **★ signature sim** — pure engine + unit test + component (ARIA live
  region + `prefers-reduced-motion`): **`utility-type-decode`** (`lib/utilityType.ts`, 188‑assertion test)
  — pick a utility (Partial/Pick/Omit/Exclude/ReturnType/Awaited/…) + an input and step its REAL `lib.d.ts`
  definition as it expands to the concrete type, each step badged by mechanism (mapped · conditional ·
  infer · recursive). Added 1 figure (`utility-type-taxonomy`, the two‑trunk family tree), 3 glossary terms
  (Exclude, Omit, Awaited), `.ut-*` sim CSS, smoke canaries + the M7 route hash. Facts web‑verified:
  Partial/Readonly/Record/Pick 2.1; Required/Exclude/Extract/NonNullable/ReturnType/InstanceType 2.8;
  Parameters/ConstructorParameters 3.1; Omit 3.5; Awaited 4.5; NonNullable rewritten in **4.8** to `T & {}`;
  overloads infer from the **last** signature; current TS 6.0 stable / 7.0 RC (Go‑native, Jun 2026, identical
  checking semantics). COUNTS 4/13, sims → 6, figures → 7.
  **Verification:** `typecheck ✓ · lint ✓ · check:data ✓ (4 sections, 13 modules) · test ✓ (533:
  141+37+52+42+73+188) · smoke ✓ (100 checks, 6 sims + 7 figures, EN+UK) · build ✓` (all sims code‑split;
  `UtilityTypeSim`/`UtilityTypeTaxonomy` isolated chunks). Branch `s4-section-ii-m7`. **Owner:** delete
  sandbox `node_modules`/`dist*`, `npm install`, commit + deploy. **Open items:** meta/bundle split still
  deferred (6 authored modules — revisit); **Section II complete**; next = S5 (M3, completes Section I).
- **S5** — **Shipped the meta/bundle split, then authored M3 (Functions, Overloads & Variance) — Section I
  complete.** Two parts. **(A) Meta/bundle split** (standard §4.4, the long‑deferred infra): added
  `scripts/genMeta.ts` (derives the slim `src/data/meta.json` nav/search index from the `concepts.ts`
  SSOT), `scripts/checkMeta.ts` (drift guard, chained into `typecheck`), and `src/data/meta.ts` (the
  lightweight API mirroring `concepts` export names). Wired `gen:meta` + `predev`/`prebuild`; repointed the
  five eager importers (TopBar `LEVELS`, Footer `COUNTS`, Sidebar `modulesBySection/sections`, `search.ts`
  `getSection/modules`, LandscapeMap) from `concepts` → `meta`; only the lazy `ModulePage` (and the Node
  scripts `check-data`/`smoke`/`genMeta`/`checkMeta`) still read `concepts`. **Build proof:** module bodies
  are now an isolated `concepts` chunk (**242 KB**) that loads on module navigation, not initial paint —
  `index.html` preloads only the 59 KB eager entry + react‑vendor; the entry references `concepts` only via
  `__vite__mapDeps` (dynamic‑import preload map), not a static import; block‑body strings (pitfalls, prose)
  are absent from the entry chunk. JSON default import verified clean under `verbatimModuleSyntax`.
  **(B) M3 `m3-functions-variance`** — *Functions, Overloads & Variance*, **diagram‑first** (CURRICULUM
  marks it "—", no sim). Golden DoD: 5 topics (functions‑as‑shapes/substitutability · parameter variance &
  `strictFunctionTypes` · overloads & resolution · generic variance & `in`/`out` · unsound corners & safe
  APIs), block kinds prose/figure/code/callout/table/compare, 6 key points, 4 pitfalls, 4 interview Q&A,
  7 verified sources, EN+UA. Two figures (`variance-directions`, `overload-resolution`) registered +
  SSR‑smoke‑canaried; 5 glossary terms (covariance, contravariance, bivariance, invariance, function
  overload); smoke route hash added; replaced the stub in `concepts.ts`. Facts web‑verified:
  `strictFunctionTypes` (2.6, part of `strict`; methods/constructors stay **bivariant** so `Array<T>` relates
  covariantly); optional variance annotations `in`/`out` (**4.7**; both positions → invariant); the
  value‑return→`() => void` assignability rule (`push`→`forEach`); overload resolution is **first‑match‑wins**
  (order most‑specific‑first); TS **6.0** final JS‑based stable, **7.0** Go‑native **RC** (Jun 18 2026,
  checking semantics identical to 6.0). COUNTS 4/13, sims **6** (unchanged — M3 has none), figures **9**.
  **Verification:** `gen:meta ✓ · typecheck ✓ (+check:meta) · lint ✓ · check:data ✓ (4 sections, 13
  modules) · test ✓ (533: 141+37+52+42+73+188) · smoke ✓ (109 checks, 6 sims + 9 figures, EN+UK) · build ✓
  (dist-s5; module bodies deferred to the `concepts` chunk)`. Branch `s5-meta-split-m3-functions-variance`.
  **Owner:** delete sandbox `node_modules`/`dist*`, `npm install`, commit + deploy. **Open items:**
  **Section I complete**; next = S6 (Section III applied — M8 decorators/metadata, grounded in NestJS 11 /
  Angular 21).
- **S6** — **Opened Section III (Applied): M8 (Decorators & Metadata, NestJS · Angular) — diagram-first.**
  Authored to the golden DoD — 5 topics (two decorator systems: standard vs legacy · the standard
  `(value, context)` decorator · metadata & `reflect-metadata` for DI · NestJS 11 vs Angular 21 · authoring
  typed decorators), block kinds prose/figure/code/table/callout/compare (no sim — CURRICULUM marks M8 '—',
  like M3), 6 key points, 4 pitfalls, 4 interview Q&A, 10 verified sources, EN+UA. Two figures
  (`decorator-two-systems` — legacy `(target, key, descriptor)` vs standard `(value, context)`;
  `di-metadata-flow` — constructor → `emitDecoratorMetadata` → `design:paramtypes` → `Reflect.getMetadata`
  → container resolves by type) registered + SSR-smoke-canaried; 9 glossary terms (decorator, standard/
  experimental decorators, decorator factory, parameter decorator, `emitDecoratorMetadata`,
  `design:paramtypes`, `reflect-metadata`, dependency injection); M8 route hash added; replaced the stub in
  `concepts.ts`. Facts web-verified: standard decorators shipped **TS 5.0** (no flag, `(value, context)`);
  decorator metadata / `Symbol.metadata` **TS 5.2**; the standard proposal deliberately drops **parameter
  decorators** and **`emitDecoratorMetadata`**, so NestJS 11 / Angular / TypeORM stay on legacy
  `experimentalDecorators`; Nest reads `design:paramtypes` via `reflect-metadata` at **runtime**, Angular's
  **ngtsc** generates metadata at **build** (AOT, no `emitDecoratorMetadata`, tree-shakeable) and is shifting
  to `inject()` + signal `input()`/`output()`; interfaces/unions/aliases erase to `Object` in
  `design:paramtypes`; TS **6.0** stable / **7.0** Go-native **RC** (Jun 2026), checking semantics identical.
  COUNTS 4/13, sims **6** (unchanged — M8 has none), figures **11**.
  **Verification:** `gen:meta ✓ · typecheck ✓ (+check:meta) · lint ✓ · check:data ✓ (4 sections, 13
  modules) · test ✓ (533: 141+37+52+42+73+188) · smoke ✓ (118 checks, 6 sims + 11 figures, EN+UK) · build ✓
  (dist-s6; both M8 figures isolated chunks; `concepts` body chunk 292 KB, deferred)`. Branch
  `s6-section-iii-m8-decorators`. **Owner:** delete sandbox `node_modules`/`dist*`, `npm install`, commit +
  deploy. **Open items:** **Section III opened**; next = S7 (M9 DTO validation and/or M10 RxJS/signals).
- **S7** — **Completed Section III (Applied): M9 (DTOs, Validation & API Boundaries) + M10 (Typing RxJS,
  Signals & Component State) — both diagram-first.** Authored to the golden DoD — 5 topics each, block
  kinds prose/figure/code/table/callout/compare (no sims — CURRICULUM marks M9 & M10 '—', like M3/M8),
  6 key points, 4 pitfalls, 4 interview Q&A, ~11 verified sources each, EN+UA. **M9** grounds the erasure→
  boundary argument in the owner's stack: types erased at emit, so `JSON.parse`/`res.json()` hand back
  `any` and `as` is an unchecked lie → parse (not cast) untrusted input as `unknown`; schema-first (zod)
  `z.infer` as single source of truth, `parse` (throws) vs `safeParse` (a `{ success }` discriminated
  union → M2); class-first class-validator + NestJS `ValidationPipe` (`whitelist`/`forbidNonWhitelisted`/
  `transform`) leaning on `reflect-metadata`/`design:paramtypes` (M8); fail-closed security (mass-assignment/
  over-posting, `forbidUnknownValues` **defaults true**, coercion edges, every boundary — env/3rd-party/
  queue), branded types (M1); choosing schema- vs class-first + **Standard Schema** (`~standard`) interop
  (tRPC/TanStack). **M10** grounds the two reactive models in Angular 21 + RxJS: `Observable<T>` (push,
  async) vs `Signal<T>` (pull, sync); RxJS `OperatorFunction<T,R>` threads types through `pipe`, `map`
  changes T→R, a type-guard `filter` narrows T→U (M2); `signal`/`computed` (memoized, read-only)/`effect`
  (side-effects only), signal `input()`/`output()` replacing decorators (M8); `toSignal` overloads
  (`T|undefined` vs `initialValue` vs `requireSync`) + `toObservable`; UI state as a **discriminated union**
  so impossible states are unrepresentable (M2·M7). Four figures (`trust-boundary`, `schema-single-source`,
  `signals-vs-streams`, `operator-type-flow`) registered + SSR-smoke-canaried; 12 glossary terms (DTO,
  schema-first validation, parse-don't-validate, ValidationPipe, branded type, Standard Schema, signal,
  computed, effect, Observable, OperatorFunction, toSignal); M9/M10 route hashes added; both stubs replaced
  in `concepts.ts`. Facts web-verified: Zod 4 stable (mid-2025; ~14×/7×/6.5× faster string/array/object,
  ~57% smaller core, `@zod/mini`); NestJS `ValidationPipe` flags; class-validator `forbidUnknownValues`
  defaults **true** (flip = bypass); Standard Schema (~60-line `~standard`, Zod/Valibot/ArkType authors,
  tRPC/TanStack); RxJS **7.8** stable, **8** alpha/on hold pending TC39 Observable; Angular 21 signals —
  `signal`/`computed`/`effect`/`linkedSignal` + signal `input()`/`output()` **stable** (graduated v20),
  `resource()`/`httpResource()` **developer preview**; `toSignal` overload types; TS **6.0** stable / **7.0**
  Go-native **RC** (Jun 2026), checking semantics identical. COUNTS 4/13, sims **6** (unchanged — M9/M10
  have none), figures **15**.
  **Verification:** `gen:meta ✓ · typecheck ✓ (+check:meta) · lint ✓ · check:data ✓ (4 sections, 13
  modules) · test ✓ (533: 141+37+52+42+73+188) · smoke ✓ (136 checks, 6 sims + 15 figures, EN+UK) · build ✓
  (dist-s7; all four M9/M10 figures isolated chunks; `concepts` body chunk 412 KB, deferred)`. Branch
  `s7-section-iii-m9-m10`. **Owner:** delete sandbox `node_modules`/`dist*`, `npm install`, commit + deploy.
  **Open items:** **Section III complete**; next = S8 (Section IV — M11 tsconfig/strictness + M12 modules/
  resolution, both with planned signature sims).
- **S8** — **Opened Section IV (Compiler & Tooling): M11 (tsconfig & the Strictness Model) + M12 (Modules,
  Resolution & Project References) — both signature modules with the two remaining planned ★ sims.**
  Authored to the golden DoD — 5 topics each, all 7 block kinds, 6 key points, 4 pitfalls, 4 interview
  Q&A, 8/7 verified sources, EN+UA. **M11** teaches tsconfig-as-contract, then the thesis that `strict`
  is a **family of nine flags** (not one switch) and that `noUncheckedIndexedAccess`/`exactOptionalPropertyTypes`
  are the highest-value checks left OUTSIDE it, then `target`/`lib`/`module` as three independent axes, then
  the bundled-build emit flags (`verbatimModuleSyntax`, `isolatedModules`, `isolatedDeclarations`) grounded
  in the owner's Node 22 / NestJS / esbuild-Serverless stack. **★ sim `tsconfig-strictness`**
  (`lib/tsconfigStrict.ts`, 82-assertion test) — pick a code sample, step the strict family one diagnostic
  at a time; each flag lights its offending line and shows the real TSxxxx error, with a checklist marking
  in-strict vs beyond-strict. Figure `strict-family`. **M12** grounds resolution as "the compiler retracing
  the runtime's exact path": the four modes (classic/node10/node16·nodenext/bundler), extension substitution
  (`.ts`/`.d.ts` read before `.js`; ESM makes the written `.js` extension mandatory), package.json
  `exports`/`imports` conditional maps (key-order matching + encapsulation) versus the compiler-only `paths`
  trap, and composite project references (`tsc -b`, `.tsbuildinfo`, `declarationMap`). **★ sim
  `module-resolution`** (`lib/resolution.ts`, 67-assertion test) — a **real resolver** over one fixed virtual
  project; step the ordered candidate-path probes until it resolves or fails. Figures `resolution-pipeline`
  + `project-references`. Registered both sims + 3 figures in `registry.tsx`; added 12 glossary terms
  (strict, strictNullChecks, noUncheckedIndexedAccess, verbatimModuleSyntax, isolatedModules,
  moduleResolution, extension substitution, package exports, project references, composite, tsbuildinfo,
  declaration file); `.sx-*`/`.rt-*` sim CSS; smoke canaries + M11/M12 route hashes; replaced both stubs in
  `concepts.ts`. Facts web-verified: the nine `strict` members + versions; strictBuiltinIteratorReturn joined
  `strict` in **5.6**; noUncheckedIndexedAccess (**4.1**) & exactOptionalPropertyTypes (**4.4**) are NOT in
  `strict`; verbatimModuleSyntax (**5.0**, replaced importsNotUsedAsValues + preserveValueImports);
  isolatedDeclarations (**5.5**); moduleResolution modes with `bundler` + `node`→`node10` rename (**5.0**);
  extension-substitution order; ESM requires the extension; allowImportingTsExtensions (**5.0**);
  rewriteRelativeImportExtensions (**5.7**); `exports`/`imports` conditions match in key order and encapsulate;
  composite/`tsc -b`/`.tsbuildinfo`/`declarationMap`; **TS 6.0** JS-based stable, **TS 7.0** the Go-native port
  ("tsgo", RC **Jun 18 2026**) with identical checking semantics. COUNTS 4/13, sims **6 → 8**, figures **15 → 18**.
  **Verification:** `gen:meta ✓ (13 modules, 8 sims) · typecheck ✓ (+check:meta) · lint ✓ · check:data ✓
  (4 sections, 13 modules) · test ✓ (682: 141+37+52+42+67+82+73+188) · smoke ✓ (158 checks, 8 sims + 18
  figures, EN+UK) · build ✓ (dist-s8x; TsconfigStrictSim/ResolutionSim + StrictFamily/ResolutionPipeline/
  ProjectReferences isolated chunks; concepts body chunk 492 KB, deferred)`. Branch `s8-section-iv-m11-m12`.
  **Owner:** delete sandbox `node_modules`/`dist*`, `npm install`, commit + deploy. **Open items:** Section IV
  nearly complete — only **M13 (declaration files)** remains a stub; next = S9 (M13, completing all 13
  modules) then polish (`#/decide` picker · flashcards/quiz · deploy). Note: build into a fresh `dist-sNx`
  (sandbox `unlink` block means `--emptyOutDir` fails on a dir that already exists).
