# CURRICULUM — `typescript-comprehensive-guide`

> The authoritative module‑by‑module / topic‑by‑topic map. `CLAUDE.md` §4 holds the content contract;
> this file holds the *content plan*. Keep them in sync.

## A. Modularity model (Section → Module → Topic)
- A **Module** is self‑contained: a user can land on it directly, finish it, and leave. Every module
  opens with its **mental model** + **key points**, and closes with **pitfalls** + interview Q&A.
- A **Topic** is independently **deep‑linkable** (`#/m/<module>/<topic>`).
- **Skip / jump freely:** modules are not a forced sequence.

## B. Navigation & UX
Landing **Overview** (`#/map`) · collapsible sidebar · global search (modules + topics + glossary terms)
· level filter (beginner → staff) · mental‑models gallery · bilingual glossary. (Later: a `#/decide`
"which feature / which config" picker, flashcards, quiz.)

## C. Data model
See `CLAUDE.md` §4 and `src/data/types.ts` (the shared Tier‑1 contract). Levels:
`beginner | middle | senior | staff`. Block kinds: `prose · figure · sim · table · code · callout · compare`.

## D. The modules
> One row per module. `★` = signature (has a hero sim). **bold id** = authored; the rest are navigable
> stubs (mental model + nav) until their session.

### Section I — The Type System (`s1-type-system`)
| # | id | Module | Level | Topics | Signature sim |
|---|---|---|---|---|---|
| 1 | **`m1-structural-typing`** ★ | **Structural Typing & Assignability** | middle | shapes vs names · assignability rules · excess‑property checks · fresh vs widened | **★ structural‑assignability checker** |
| 2 | **`m2-narrowing`** ★ | **Narrowing & Control‑Flow Analysis** | middle | guards · `typeof`/`in`/`instanceof` · discriminated unions · assertion functions | **★ narrowing / CFA visualizer** |
| 3 | **`m3-functions-variance`** | **Functions, Overloads & Variance** | senior | functions as shapes/substitutability · parameter variance & `strictFunctionTypes` · overload resolution · generic variance & `in`/`out` · unsound corners | — (diagram‑first: `variance-directions` + `overload-resolution`) |

### Section II — Type‑Level Programming (`s2-type-level`)
| # | id | Module | Level | Topics | Signature sim |
|---|---|---|---|---|---|
| 4 | **`m4-generics`** ★ | **Generic Functions & Classes** | senior | parametric polymorphism · constraints · defaults · inference sites | **★ generic‑inference tracer** |
| 5 | **`m5-generics-conditional-types`** ★ | **Generics & Conditional Types** | senior | generics→types that compute · conditional types & distribution · `infer` · the utility‑type bridge · engineering type‑level code | **★ conditional‑type / `infer` evaluator** |
| 6 | **`m6-mapped-template-literals`** ★ | **Mapped & Template‑Literal Types** | senior | `[K in keyof T]` · modifiers · key remapping (`as`) · template literal types | **★ mapped‑type transformer** |
| 7 | **`m7-utility-types`** ★ | **Built‑in Utility Types, Decoded** | senior | map-or-filter taxonomy · object-shaping (mapped) · union-filtering (distributive) · function inspection (`infer`) · Awaited & composing | **★ utility‑type decoder** |

### Section III — Applied TypeScript (`s3-applied`)
| # | id | Module | Level | Topics | Signature sim |
|---|---|---|---|---|---|
| 8 | **`m8-decorators-metadata`** | **Decorators & Metadata (NestJS · Angular)** | senior | two systems (standard vs legacy) · standard `(value, context)` · metadata & `reflect-metadata` (DI) · NestJS 11 vs Angular 21 · authoring typed decorators | — (diagram‑first: `decorator-two-systems` + `di-metadata-flow`) |
| 9 | **`m9-dto-validation`** | **DTOs, Validation & API Boundaries** | senior | erasure & the boundary · schema‑first (zod, `z.infer`, parse/safeParse) · class‑first NestJS (`ValidationPipe`) · fail‑closed security · choosing + Standard Schema | — (diagram‑first: `trust-boundary` + `schema-single-source`) |
| 10 | **`m10-rxjs-signals`** | **Typing RxJS, Signals & Component State** | senior | streams vs signals · RxJS operator type flow (`OperatorFunction`) · typed signal/computed/effect · `toSignal`/`toObservable` interop · discriminated‑union UI state | — (diagram‑first: `signals-vs-streams` + `operator-type-flow`) |

### Section IV — Compiler & Tooling (`s4-compiler`)
| # | id | Module | Level | Topics | Signature sim |
|---|---|---|---|---|---|
| 11 | **`m11-tsconfig-strictness`** ★ | **tsconfig & the Strictness Model** | senior | the nine-flag strict family · beyond-strict (noUncheckedIndexedAccess…) · target/lib/module · `verbatimModuleSyntax`/isolated* | **★ tsconfig strictness explorer** |
| 12 | **`m12-modules-resolution`** ★ | **Modules, Resolution & Project References** | senior | four modes · extension substitution · exports/imports maps · the `paths` trap · composite/project refs | **★ module‑resolution tracer** |
| 13 | `m13-declaration-files` | Declaration Files & Publishing Types | staff | authoring `.d.ts` · shipping types · not breaking consumers | — |

## E. Totals & asset budget
**4 sections · 13 modules · 12 modules authored · 8 signature sims shipped** (M5 · M1 · M2 · M4 · M6 · M7 ·
M11 · M12 — the project's ~6–8 target, now met) · **18 figures shipped** (M5 ×2, M1, M2, M4, M6, M7, M3 ×2,
M8 ×2, M9 ×2, M10 ×2, M11, M12 ×2). Rough topic count: ~75 across the curriculum. **Sections I (type‑system),
II (type‑level) and III (applied) are complete, and Section IV is nearly complete** (IV = M11·M12 authored,
M13 remaining). M3, M8, M9 and M10 are diagram‑first (authored, no sim). **Only M13 (declaration files &
publishing types) remains.**

## F. Build order
1. **S1 (golden, shipped):** M5 — Generics & Conditional Types + the conditional‑type/`infer` evaluator,
   with the scaffold/theme/nav/i18n/search/glossary/mental‑models shell.
2. **S2 (shipped):** M1 (structural typing + assignability checker) and M2 (narrowing + CFA visualizer) —
   grounding Section I and adding two signature sims.
3. **S3 (shipped):** M4 (generics + inference tracer) and M6 (mapped/template‑literal types + transformer)
   — deepening Section II around the golden M5.
4. **S4 (shipped):** M7 (utility types + the ★ utility‑type decoder) — completing Section II. Single
   module, golden depth.
5. **S5 (shipped):** the deferred **meta/bundle split** (standard §4.4) first, then **M3 (functions &
   variance, diagram‑first)** — **Section I complete**.
6. **S6 (shipped):** **Section III (applied) opened** — **M8 (decorators & metadata, diagram‑first)**,
   grounded in the owner's NestJS 11 / Angular 21 stack.
7. **S7 (shipped):** **M9 (DTO validation) + M10 (RxJS/signals), diagram‑first** — **Section III complete**.
8. **S8 (shipped):** **Section IV opened** — **M11 (tsconfig & the Strictness Model) + M12 (Modules,
   Resolution & Project References)**, each with its ★ signature sim (tsconfig strictness explorer ·
   module‑resolution tracer). All planned signature sims are now shipped (8 total).
9. **S9…SN:** **M13 (declaration files & publishing types)** — completes all 13 modules — then the
   `#/decide` picker · flashcards/quiz · final polish · deploy.
