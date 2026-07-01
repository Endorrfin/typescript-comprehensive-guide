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
| 3 | `m3-functions-variance` | Functions, Overloads & Variance | senior | parameter bivariance · overload resolution · co/contravariance · `in`/`out` | — |

### Section II — Type‑Level Programming (`s2-type-level`)
| # | id | Module | Level | Topics | Signature sim |
|---|---|---|---|---|---|
| 4 | **`m4-generics`** ★ | **Generic Functions & Classes** | senior | parametric polymorphism · constraints · defaults · inference sites | **★ generic‑inference tracer** |
| 5 | **`m5-generics-conditional-types`** ★ | **Generics & Conditional Types** | senior | generics→types that compute · conditional types & distribution · `infer` · the utility‑type bridge · engineering type‑level code | **★ conditional‑type / `infer` evaluator** |
| 6 | **`m6-mapped-template-literals`** ★ | **Mapped & Template‑Literal Types** | senior | `[K in keyof T]` · modifiers · key remapping (`as`) · template literal types | **★ mapped‑type transformer** |
| 7 | `m7-utility-types` | Built‑in Utility Types, Decoded | senior | Partial/Pick/Record · ReturnType/Parameters · Awaited · reading `lib.d.ts` | — |

### Section III — Applied TypeScript (`s3-applied`)
| # | id | Module | Level | Topics | Signature sim |
|---|---|---|---|---|---|
| 8 | `m8-decorators-metadata` | Decorators & Metadata (NestJS · Angular) | senior | stage‑3 vs legacy · `reflect-metadata` · DI typing | — |
| 9 | `m9-dto-validation` | DTOs, Validation & API Boundaries | senior | schema‑first (zod/class‑validator) · derive types from schema · never cast input | — |
| 10 | `m10-rxjs-signals` | Typing RxJS, Signals & Component State | senior | operator type flow · typed signals/computed · discriminated UI state | — |

### Section IV — Compiler & Tooling (`s4-compiler`)
| # | id | Module | Level | Topics | Signature sim |
|---|---|---|---|---|---|
| 11 | `m11-tsconfig-strictness` | tsconfig & the Strictness Model | senior | strict family · target/lib/module · `verbatimModuleSyntax` | tsconfig strictness explorer (planned) |
| 12 | `m12-modules-resolution` | Modules, Resolution & Project References | senior | `moduleResolution` · `paths`/exports maps · composite/project refs | module‑resolution tracer (planned) |
| 13 | `m13-declaration-files` | Declaration Files & Publishing Types | staff | authoring `.d.ts` · shipping types · not breaking consumers | — |

## E. Totals & asset budget
**4 sections · 13 modules · 5 signature sims shipped** (M5 · M1 · M2 · M4 · M6; target ~5–6 across the
project) · 6 figures shipped (M5 ×2, M1, M2, M4, M6). Rough topic count: ~40 across the curriculum.

## F. Build order
1. **S1 (golden, shipped):** M5 — Generics & Conditional Types + the conditional‑type/`infer` evaluator,
   with the scaffold/theme/nav/i18n/search/glossary/mental‑models shell.
2. **S2 (shipped):** M1 (structural typing + assignability checker) and M2 (narrowing + CFA visualizer) —
   grounding Section I and adding two signature sims.
3. **S3 (shipped):** M4 (generics + inference tracer) and M6 (mapped/template‑literal types + transformer)
   — deepening Section II around the golden M5.
4. **S4…SN:** batches of 1–2 modules. Suggested next: M7 (utility types) + M3 (functions & variance) —
   M3 completes Section I.
5. Remaining signature sims · `#/decide` picker · flashcards/quiz · polish · deploy.
