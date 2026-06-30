# TypeScript — The Comprehensive Guide

A deep, interactive, **bilingual (EN / UA)** guide to *how TypeScript actually works* — the structural
type system, type‑level programming, your applied stack, and the compiler — taught with prose **plus**
diagrams, tables, mental models and hero simulators.

**Live:** https://endorrfin.github.io/typescript-comprehensive-guide/
**Author:** Vasyl Krupka · Senior Fullstack Engineer · 🇺🇦

---

## What's here
- **4 sections · 13 modules** — from a beginner on‑ramp to staff‑level internals.
- **★ Signature interactive** — a **conditional‑type / `infer` evaluator**: pick a conditional type and an
  input, then step distribution → match → `infer` → re‑union, driven by a pure, unit‑tested engine.
- **Bilingual** at the data layer — every string is `{ en, uk }`; technical terms stay English in both.
- A landing **Overview**, collapsible sidebar, global search (modules + topics + glossary), a level
  filter, a mental‑models gallery, and a bilingual glossary. Light / dark / system themes.

## Tech
Vite + React 19 + TypeScript (strict). No router library — a tiny hash router (`#/m/<module>/<topic>`) +
`vite base:'./'` makes the build work under any GitHub Pages sub‑path. All content is static data in
`src/data`; pages are **rendered from data**, never hand‑written. Sims are pure engines in `src/lib` with
a `prefers-reduced-motion` step fallback and ARIA.

## Local development
```bash
npm install        # the owner runs this (native darwin-arm64 / your platform)
npm run dev        # start the Vite dev server
npm run build      # tsc -b && vite build  → dist/
npm run preview    # preview the production build
```
Quality gates (also enforced in CI before every deploy):
```bash
npm run typecheck  # tsc -b --noEmit
npm run lint       # eslint
npm run check:data # bilingual completeness, unique ids, registry + cross-link integrity
npm run test       # pure engine golden tests (scripts/test-*.ts)
npm run smoke      # SSR-render every sim/figure/page in EN + UK
npm run verify     # all of the above + build
```

## Project layout
```
src/
  data/        concepts.ts (SSOT) · modules/ · glossary · mentalModels · types
  i18n/        ui strings + EN/UA language provider
  theme/       tokens.css · global.css · components.css
  lib/         hashRouter · search · registry (sims + figures) · appState · utils · typeEval (M5 engine)
  components/  layout/ · module/ · map/ · pages/ · sims/ · figures/
scripts/       check-data.ts · run-tests.ts · test-typeeval.ts · smoke.ts
```

## Adding content
Edit **only** `src/data/*`. Add a module file under `src/data/modules/`, import it in `concepts.ts`,
reference figures/sims by key, and register new widgets in `src/lib/registry.tsx`. Author EN first, UA
second. Run `npm run verify`.

## Status
**S1 delivered:** the scaffold + app shell + the golden module **M5 — Generics & Conditional Types** with
its signature sim. The remaining 12 modules are navigable stubs, authored 1–2 per session per
`CURRICULUM.md`.

---

# TypeScript — Вичерпний гайд (UA)

Глибокий, інтерактивний, **двомовний (EN / UA)** гайд про те, *як насправді працює TypeScript* — система
типів, type‑level програмування, ваш прикладний стек і компілятор — навчання прозою **плюс** діаграми,
таблиці, mental models і hero‑симулятори.

**Live:** https://endorrfin.github.io/typescript-comprehensive-guide/ · **Автор:** Vasyl Krupka · 🇺🇦

## Що тут
**4 секції · 13 модулів** — від beginner on‑ramp до staff‑level internals. **★ Signature‑інтерактив** —
evaluator для **conditional types / `infer`**: оберіть conditional type і вхід, далі покроково distribution
→ match → `infer` → re‑union (на чистому, протестованому движку). **Двомовність** на шарі даних — кожен
рядок `{ en, uk }`; технічні терміни лишаються англійською. Landing **Overview**, згортний sidebar,
глобальний пошук (модулі + теми + glossary), фільтр рівня, галерея mental models, glossary. Теми:
light / dark / system.

## Стек
Vite + React 19 + TypeScript (strict). Без router‑бібліотеки — крихітний hash router + `vite base:'./'`.
Увесь контент — статичні дані в `src/data`; сторінки **рендеряться з даних**, не пишуться руками. Sims —
чисті движки в `src/lib` з `prefers-reduced-motion` fallback та ARIA.

## Розробка локально / команди
Ті самі команди, що в EN‑блоці (`npm run dev | build | preview | typecheck | lint | check:data | test |
smoke | verify`). `npm install` і деплой виконує **власник** (native darwin‑arm64).

## Додавання контенту
Редагуй **лише** `src/data/*`. Додай файл модуля в `src/data/modules/`, імпортуй його в `concepts.ts`,
посилайся на figures/sims за ключем, реєструй віджети в `src/lib/registry.tsx`. Спочатку EN, потім UA.
Запусти `npm run verify`.
