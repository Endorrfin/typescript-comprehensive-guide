# PROJECT BRIEF — the ideal commission for this guide

> The single *upstream* instruction that, handed to a capable agent, lets it build the whole guide with
> **near‑zero clarification**. It complements `CLAUDE.md`: this BRIEF is the **input** (what the
> commissioner wants and how they want you to work); `CLAUDE.md` is the **living contract**.
>
> **How to read it (agent):** §5 (locked decisions) and §10 (decision rights) are authoritative — do
> **not** re‑ask anything answered here.

---

## 0. TL;DR — the one‑paragraph commission

Build a **deep, interactive, bilingual (EN/UA) web guide to TypeScript**, modelled on the
`../database guide` / `../Node-js guide` quality bar — **internals‑first**, taught through concrete,
runnable type mechanics, for a **senior / staff** audience (with a short beginner on‑ramp where it costs
nothing). Cover the surface **balanced across three centers of gravity**: the type system, type‑level
programming, and the applied stack + compiler/tooling. **Tier 1:** Vite + React 19 + TS (strict), static,
GitHub Pages. Teach with prose **plus** diagrams, tables, mental models and a handful of **curated
signature simulators**; diagram‑first everywhere else; no WASM/real `tsc` in the browser — sims model the
mechanics with small pure engines. Work **plan‑first, 1–2 modules per session, quality over speed**,
verify every session, close each session with the fixed summary. Decisions in §5 are locked.

## 1. Goal & why
A guide that makes a professional **understand, internalize and remember** how TypeScript actually works
— not a feature list or cheat‑sheet, but **internals + mental models + hands‑on interactives**. Doubles
as a public portfolio piece (GitHub Pages, possibly LinkedIn).

## 2. Audience & outcomes
- **Primary:** senior → staff engineers (the brief‑owner's level: NestJS + Angular, Node 22).
  **Secondary:** a short beginner on‑ramp in Section I.
- **After reading, the user can:** reason precisely about assignability and narrowing; read and *write*
  type‑level code (generics, conditional types, `infer`, mapped/utility types) with intent; and make
  sound `tsconfig`/module/declaration decisions. Every module is **independently useful**.
- **Success = depth + learning‑UX + correctness**, in that order. Completeness and polish next. Speed last.

## 3. References & quality bar (what "golden" means)
- **Gold standard:** `../database guide` (canonical Tier‑1) and `../Node-js guide` — data‑driven modules,
  hero simulators, verified facts. Match their depth and polish; reuse the architecture and component
  patterns and the shared `types.ts` content contract.
- **"Golden" for one module =** clear mental model + prose that teaches (not lists) + ≥1 diagram + ≥1
  table + key points + pitfalls + interview Q&A + cross‑links + **verified sources**, in **both
  languages**, typechecking and building clean.

## 4. Scope
- **In:** (I) the type system — structural typing & assignability, narrowing & CFA, functions/overloads/
  variance; (II) type‑level programming — generics, **conditional types & `infer`**, mapped & template‑
  literal types, the utility types; (III) applied TS — decorators & DI (NestJS · Angular), DTO validation
  & API boundaries, typing RxJS/signals; (IV) compiler & tooling — `tsconfig`/strictness, module
  resolution & project references, declaration files & publishing.
- **Curriculum source:** the official TypeScript Handbook + release notes are the **seed** — cover them,
  but go beyond with mental models and sims. Detailed map lives in `CURRICULUM.md`.
- **Weighting:** Section II (type‑level) gets the deepest treatment and carries the golden sim; the
  applied section is grounded in the owner's real stack (NestJS 11 / Angular 21).
- **Out (for now):** a runtime in‑browser `tsc`; TS‑to‑JS emit internals beyond a conceptual level; a PDF
  booklet (deferred/optional).

## 5. Locked decisions — DO NOT re‑ask
| Topic | Decision |
|---|---|
| **Stack** | Vite + React 19 + TypeScript (strict). No router lib (hash router). All content static. |
| **Content model** | SSOT `src/data/concepts.ts` (+ per‑module `src/data/modules/*`); pages render from data. `Section → Module → Topic → Block`. Eager chrome reads `concepts` directly; the meta/bundle split (standard §4.4) is **deferred until the guide grows**. |
| **Language** | Bilingual **EN/UA** with a runtime toggle. **All technical terms stay English** in both; translate only the explanation/analogy. Author EN first, UA second. |
| **Audience / emphasis** | Senior → staff, internals‑first; curriculum **balanced** across type‑system / type‑level / applied+tooling, with Section II weighted deepest. |
| **Theme** | Dark editorial + TypeScript‑blue accent (`#3178c6` family). Fonts **Fraunces** (display) · Inter · JetBrains Mono. |
| **Interactivity** | **Curated simulations only.** ~6–8 signature sims + diagram‑first baseline. Each sim = a pure engine in `lib/*` + a `prefers-reduced-motion` step fallback + ARIA. |
| **Signature sims** | **★ Conditional‑type / `infer` evaluator** (M5, golden, shipped). Planned: a narrowing / control‑flow visualizer (M2), a structural‑assignability checker (M1), a `tsconfig` strictness explorer (M11), a module‑resolution tracer (M12). |
| **Deploy** | GitHub Pages via Actions. Repo `typescript-comprehensive-guide` @ `endorrfin` → `https://endorrfin.github.io/typescript-comprehensive-guide/`. `vite base:'./'` + `.nojekyll`. |
| **Golden module** | **M5 — Generics & Conditional Types** + its signature sim (the conditional‑type / `infer` evaluator), built first. |
| **Tooling** | Node 22 LTS; TS 6.x strict + `noUnusedLocals/Parameters`; build must pass; ESLint clean. |

## 6. Constraints & non‑negotiables
- **Correctness mandate.** Web‑search and verify **every version‑sensitive fact** per module (feature →
  TS version, current releases); fill `sources`. Never trust model memory.
- **Content only in `src/data/*`** — never hand‑edit rendered output.
- **Accessibility:** keyboard nav, focus rings, ARIA on sims, `prefers-reduced-motion` fallback,
  contrast‑checked palette, light + dark themes.
- **Bilingual integrity:** every human‑readable string is `Localized {en;uk}`; no missing language.
- **Security framing** throughout (types are erased — validate untrusted input at the boundary).
- **Sandbox gotchas:** Linux sandbox blocks `unlink` (Vite `emptyOutDir` fails on rebuild → build in a
  scratch `dist-sN` or set `emptyOutDir:false`; don't git against the live repo). The **owner** runs
  `npm install` + deploy (native darwin‑arm64).

## 7. Deliverables
- **The web guide** (primary). **`README.md`** (overview + live link + commands, bilingual).
- **`CLAUDE.md`** kept current (source of truth + status log). **`CURRICULUM.md`** kept current.
- Deferred/optional: a PDF booklet; a LinkedIn pack.

## 8. Working agreement
- **Plan → approve → build.** Big steps get a plan signed off before implementation.
- **Cadence:** 1–2 modules per session, **golden quality**; speed is not a priority.
- **Verify every session:** `npm run verify` (typecheck + lint + check:data + test + smoke + build) + fact spot‑check.
- **The 8 working rules:** (1) specific not generic; (2) brief "why"; (3) describe change + why **before**
  doing it; (4) mark edits `// CHANGED (sN):`; (5) lint‑aware; (6) reliability/security/best‑practice
  first; (7) ask when unclear; (8) don't just agree — challenge wrong/partial reasoning.
- **Branch/commit:** branch `sN-short-topic`; concise imperative commit messages.
- **Session summary (every session):** (1) what was done; (2) branch + commit + short description;
  (3) challenges/questions.

## 9. Definition of Done
- **Per module:** all topics authored EN+UA; mental model, key points, pitfalls, see‑also, sources; any
  planned diagrams/tables/sim present; typecheck + lint + check:data + test + smoke + build clean; facts
  verified & cited.
- **Per session:** the above for the session's modules + verification run + summary + `CLAUDE.md` log updated.
- **Project:** all 13 modules authored; signature sims + landing overview; global search, glossary,
  mental‑models gallery; bilingual QA; deployed and live.

## 10. Decision rights
- **Decide yourself:** component structure & naming; micro‑UX & copy wording; which diagram type; colors
  *within* the locked palette; block ordering within a module; verification details.
- **Ask me first:** changing scope (adding/dropping modules); changing stack, theme, or language policy;
  anything that changes the published URL or breaks the data contract; spending money or destructive/
  irreversible actions; product facts web search can't resolve.

## 11. Clarifying questions — answered for this guide
Reader = senior/staff TS engineers (+ beginner on‑ramp) · public portfolio · success = depth + UX +
correctness · in/out per §4 · seed = TS Handbook + release notes, cover‑all beyond · weighting = Section
II deepest · depth = internals · facts = web‑verified, version‑sensitive · format = Tier‑1 SPA ·
interactivity = curated sims · EN+UA, terms stay English · dark editorial + TS blue · a11y per §6 · stack
per §5 · reuse the database/Node guide patterns · 1–2 modules/session, quality first · plan‑first ·
verify = `npm run verify` · content in `src/data/*` · decision rights per §10 · 3‑part session report.

## 12. How to start a session (bootstrap ritual)
1. Read `CLAUDE.md` fully, then the relevant `CURRICULUM.md` section(s), then existing
   `src/components/*` + `src/data/*` patterns.
2. Confirm the session's target modules (from the roadmap) and restate the plan briefly.
3. Build to the golden bar; **web‑verify** every version‑sensitive fact and fill `sources`.
4. Verify: `npm run verify` (in a scratch copy; don't touch the live `.git`).
5. Update the `CLAUDE.md` status log and deliver the 3‑part session summary.
