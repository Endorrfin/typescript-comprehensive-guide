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
- **Meta/bundle split DEFERRED** (standard §4.4): with one authored module the eager chrome imports
  `concepts.ts` directly. Add the `gen:meta` + `meta.ts` split when the bundle grows (multiple authored
  modules). `// CHANGED (S1)`.
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
Deviation from §4.3: no `data/meta.*` yet (split deferred, see §2).

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
- **4 sections · 13 modules.** S1 shipped M5 + the app shell.

## 6. Signature interactives + diagram‑first baseline
Curated sims only — a pure engine in `lib/*` (deterministic, unit‑tested) + a component (play/pause/step,
ARIA + live region, **`prefers-reduced-motion`** fallback). Shipped: **★ `conditional-type-eval`** (M5),
engine `lib/typeEval.ts` + `scripts/test-typeeval.ts` (73 assertions). Diagram‑first elsewhere (crisp SVG +
table). Planned sims: narrowing/CFA (M2), assignability checker (M1), tsconfig explorer (M11), resolution
tracer (M12).

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
- **S2 (next) — Section I, M1 + M2.** Author both to the golden DoD (§§4,6,10), replacing their stubs in
  `concepts.ts` (import like `m5`, set `signature:true`, `level:'middle'`):
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
- **S3:** M4 (generics) + M6 (mapped/template‑literal types).
- **S4:** M7 (utility types) + M3 (functions & variance).
- **S5–S7:** Section III (applied) then Section IV (compiler/tooling), 1–2 modules each.
- **Polish:** remaining sims · `#/decide` picker · flashcards/quiz · deploy.

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
