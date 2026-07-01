import type { Module } from '../types';

/*
 * M13 (S9) — Declaration Files & Publishing Types. Completes Section IV (Compiler & Tooling) and the
 * whole 13-module curriculum. Diagram-first (no signature sim — like M3/M8/M9/M10). Two figures:
 * 'dts-contract' (one .ts splits under tsc into .js implementation + .d.ts shape + .d.ts.map back-link)
 * and 'publish-types-flow' (declaration emit → package.json exports "types"-first conditions → the
 * consumer resolves types per mode → attw/publint gate). Ties to M12 (exports/resolution) and M11
 * (isolatedDeclarations). All version-sensitive facts web-verified (see sources):
 *   - `declaration` emits .d.ts (TS AND JS projects); `emitDeclarationOnly` = types only (a bundler
 *     emits the JS); `declarationMap` writes .d.ts.map so editors Go-to-Definition to the .ts source.
 *   - package.json "types"/"typings" points at the main .d.ts; the modern `exports` "types" condition
 *     MUST be listed FIRST in each block (exports is order-sensitive) — publint enforces this.
 *   - node16/nodenext: .d.mts / .d.cts declaration extensions (TS 4.7) must match the .mjs/.cjs format;
 *     mismatch = "masquerading as CJS/ESM". @arethetypeswrong/cli resolves the PUBLISHED package under
 *     node10 / node16-cjs / node16-esm / bundler and flags mismatches; publint lints packaging.
 *   - `typesVersions` (TS 3.1) redirects .d.ts by compiler-version range (order-sensitive; external API
 *     only; falls back to `types`). isolatedDeclarations (TS 5.5) requires explicit export annotations
 *     (+ `declaration`/`composite`) so .d.ts emit can be parallelized (transpileDeclaration) — it changes
 *     error reporting, not emit. DefinitelyTyped publishes @types for packages that ship no types.
 *   - TS 6.0 JS-based stable; TS 7.0 Go-native ("tsgo") RC (Jun 18 2026), checking semantics identical.
 */
export const m13: Module = {
  id: 'm13-declaration-files',
  num: 13,
  section: 's4-compiler',
  order: 3,
  level: 'staff',
  title: { en: 'Declaration Files & Publishing Types', uk: 'Declaration Files та публікація типів' },
  tagline: {
    en: 'Authoring .d.ts, shipping types with your package so every resolver finds them, and evolving that public contract without breaking your consumers.',
    uk: 'Написання .d.ts, постачання типів із пакетом так, щоб кожен resolver їх знайшов, і розвиток цього публічного контракту без ламання споживачів.',
  },
  readMins: 21,
  mentalModel: {
    en: 'A .d.ts is the public type contract of a package — its shape with the implementation removed. Publishing types is a routing problem: make every resolution mode land on the right .d.ts, then treat that surface as an API you version like code.',
    uk: '.d.ts — це публічний типовий контракт пакета: його форма без реалізації. Публікація типів — це задача маршрутизації: зробити так, щоб кожен режим resolution потрапив у правильний .d.ts, а потім ставитися до цієї поверхні як до API, який ви версіонуєте, мов код.',
  },

  topics: [
    // ── Topic 1 ───────────────────────────────────────────────────────────────
    {
      id: 't1-dts-as-contract',
      title: { en: 'A `.d.ts` is a contract: shape without implementation', uk: '`.d.ts` — це контракт: форма без реалізації' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "A declaration file is what is left of a module after the compiler throws away every function body and keeps only the *types*: the signatures, the exported shapes, the `declare`d ambient names. It is the file a consumer's TypeScript reads instead of your source, so it is the **public type contract** of your package — and nothing else about your implementation is visible through it. You rarely write `.d.ts` by hand for your own code: `tsc` **generates** them from the `.ts` source when [`declaration`](https://www.typescriptlang.org/tsconfig#declaration) is on (this works for JavaScript projects too, from JSDoc). Two companion flags matter. **`emitDeclarationOnly`** produces the `.d.ts` and *no* `.js` — the pattern when a bundler (esbuild/Serverless, Vite, tsup) emits the runtime output and you only want `tsc` for types. **`declarationMap`** writes a `.d.ts.map` beside each declaration so that a consumer's editor doing *Go to Definition* jumps to your original `.ts` line, not to the generated `.d.ts` — a real DX win for anyone depending on a library you also maintain the source of.",
            uk: "Declaration-файл — це те, що лишається від модуля після того, як компілятор викидає кожне тіло функції й тримає лише *типи*: сигнатури, експортовані форми, `declare`-ані ambient-імена. Це файл, який TypeScript споживача читає замість вашого source, тож це **публічний типовий контракт** вашого пакета — і більше нічого про вашу реалізацію крізь нього не видно. Ви рідко пишете `.d.ts` руками для власного коду: `tsc` **генерує** їх із `.ts`-джерела, коли увімкнено [`declaration`](https://www.typescriptlang.org/tsconfig#declaration) (для JavaScript-проєктів це теж працює, із JSDoc). Важать два супутні флаги. **`emitDeclarationOnly`** видає `.d.ts` і *жодного* `.js` — патерн, коли bundler (esbuild/Serverless, Vite, tsup) видає runtime-вихід, а `tsc` вам потрібен лише для типів. **`declarationMap`** пише `.d.ts.map` поруч із кожною декларацією, щоб редактор споживача під час *Go to Definition* стрибав на ваш оригінальний рядок `.ts`, а не на згенерований `.d.ts` — реальний DX-виграш для будь-кого, хто залежить від бібліотеки, чий source ви теж супроводжуєте.",
          },
        },
        {
          kind: 'figure',
          fig: 'dts-contract',
          caption: {
            en: 'One `greet.ts` under `tsc --declaration`: the `.js` keeps the runtime code (types erased — M9), the `.d.ts` keeps the shape (bodies erased), and the `.d.ts.map` links the contract back to the source line for Go-to-Definition.',
            uk: 'Один `greet.ts` під `tsc --declaration`: `.js` тримає runtime-код (типи стерто — M9), `.d.ts` тримає форму (тіла стерто), а `.d.ts.map` повʼязує контракт назад із рядком source для Go-to-Definition.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// greet.ts — the SOURCE you write
export interface Greeting { text: string; at: Date }
export function greet(name: string): Greeting {
  return { text: \`Hello, \${name}\`, at: new Date() }; // ← body: runtime only
}

// greet.d.ts — what tsc EMITS (the public contract): signatures, no bodies
export interface Greeting { text: string; at: Date }
export declare function greet(name: string): Greeting;`,
          note: {
            en: 'The emitted `.d.ts` is the interface a consumer sees. The body of `greet` — the template string, the `new Date()` — is gone; only the promise `(name: string) => Greeting` remains.',
            uk: 'Емітований `.d.ts` — це інтерфейс, який бачить споживач. Тіло `greet` — шаблонний рядок, `new Date()` — зникло; лишається тільки обіцянка `(name: string) => Greeting`.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Kind of `.d.ts`', uk: 'Вид `.d.ts`' },
            { en: 'How you get it', uk: 'Як його отримати' },
            { en: 'What it describes', uk: 'Що описує' },
          ],
          rows: [
            [
              { en: 'Module declaration', uk: 'Module-декларація' },
              { en: 'Emitted by `tsc` (`declaration`) from your `.ts`', uk: 'Емітує `tsc` (`declaration`) з вашого `.ts`' },
              { en: 'The exports of one module (has top-level `import`/`export`)', uk: 'Експорти одного модуля (має top-level `import`/`export`)' },
            ],
            [
              { en: 'Ambient / global', uk: 'Ambient / global' },
              { en: 'Hand-written (no `import`/`export` at top level)', uk: 'Пишеться руками (без `import`/`export` на top level)' },
              { en: 'Names in the global scope — `window.__CFG`, a CSS-import shim', uk: 'Імена в глобальному scope — `window.__CFG`, shim для CSS-import' },
            ],
            [
              { en: '`declare module "x"`', uk: '`declare module "x"`' },
              { en: 'Hand-written augmentation', uk: 'Написана руками аугментація' },
              { en: 'Types for an untyped dep, or an addition to an existing one', uk: 'Типи для untyped-залежності або доповнення до наявної' },
            ],
          ],
          caption: {
            en: 'Three things people call "a `.d.ts`". Only the first is normally generated; the other two are the hand-written cases Topic 5 returns to.',
            uk: 'Три речі, які називають «`.d.ts`». Лише перша зазвичай генерується; інші дві — випадки, написані руками, до яких повертається Тема 5.',
          },
        },
        {
          kind: 'callout',
          tone: 'senior',
          title: { en: 'The `.d.ts` is generated — so its correctness is your source’s correctness', uk: '`.d.ts` генерується — тож його коректність = коректність вашого source' },
          md: {
            en: "Because `tsc` derives the declaration from your implementation, a sloppy public signature becomes a sloppy contract automatically: return `any` from an exported function and the `.d.ts` promises `any` to every consumer; let a type parameter leak `unknown` and they inherit it. This is the leverage of the module: the `.d.ts` you *ship* is only as precise as the `.ts` you *wrote*, and unlike a runtime bug a wrong type propagates silently into every downstream build. Treat the exported surface — not the internals — as the thing to get exactly right, and let `declaration` emit prove it: if `tsc` cannot produce a name for an exported type (Topic 4), that is the compiler telling you the contract is not expressible.",
            uk: "Оскільки `tsc` виводить декларацію з вашої реалізації, неохайна публічна сигнатура автоматично стає неохайним контрактом: поверніть `any` з експортованої функції — і `.d.ts` обіцяє `any` кожному споживачу; дайте type-параметру протекти `unknown` — і вони його успадкують. У цьому важіль модуля: `.d.ts`, який ви *постачаєте*, рівно настільки точний, наскільки точний `.ts`, який ви *написали*, і, на відміну від runtime-бага, неправильний тип тихо поширюється в кожну downstream-збірку. Ставтеся до експортованої поверхні — не до нутрощів — як до того, що треба зробити ідеально точним, і дайте `declaration`-emit це довести: якщо `tsc` не може створити імʼя для експортованого типу (Тема 4), це компілятор каже вам, що контракт невиразний.",
          },
        },
      ],
    },
    // ── Topic 2 ───────────────────────────────────────────────────────────────
    {
      id: 't2-shipping-types',
      title: { en: 'Shipping types: the `types` field vs the `exports` map', uk: 'Постачання типів: поле `types` проти `exports`-мапи' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "Emitting a `.d.ts` is half the job; the consumer's compiler still has to *find* it. There are two mechanisms and one hard rule. The old mechanism is the top-level **`types`** field (a.k.a. `typings`) in `package.json`, pointing at your main declaration file: `\"types\": \"./dist/index.d.ts\"`. It still works and is the right fallback for older resolvers, but it describes a single entry point. The modern mechanism is the **`exports`** map (M12), which lets you declare types *per entry and per module format* — and it comes with a rule that trips up a huge fraction of published packages: because `exports` conditions are matched **in the order they are written**, the **`\"types\"` condition must be listed first** in each block, before `\"import\"`/`\"require\"`/`\"default\"`. Put it after and TypeScript walks past it, matches the JavaScript condition, and reports your package as having no types at all. This is not a lint nicety — it is load-bearing ordering, and it is exactly what `publint` checks.",
            uk: "Емітувати `.d.ts` — половина роботи; компілятор споживача ще має його *знайти*. Є два механізми й одне жорстке правило. Старий механізм — top-level-поле **`types`** (воно ж `typings`) у `package.json`, що вказує на ваш головний declaration-файл: `\"types\": \"./dist/index.d.ts\"`. Воно досі працює й є правильним fallback для старіших resolver-ів, але описує єдину точку входу. Сучасний механізм — мапа **`exports`** (M12), що дає оголошувати типи *на кожну точку входу й на кожен формат модуля* — і йде з правилом, на якому спотикається величезна частка опублікованих пакетів: оскільки умови `exports` матчаться **в порядку написання**, умова **`\"types\"` має стояти першою** в кожному блоці, перед `\"import\"`/`\"require\"`/`\"default\"`. Поставте її після — і TypeScript проходить повз неї, матчить JavaScript-умову й повідомляє, що ваш пакет узагалі не має типів. Це не lint-дрібниця — це несуча черговість, і саме її перевіряє `publint`.",
          },
        },
        {
          kind: 'code',
          lang: 'json',
          code: `{
  "name": "@acme/sdk",
  "type": "module",
  "types": "./dist/index.d.ts",          // fallback for legacy resolvers
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",      // <-- FIRST in the block: TS matches it before JS
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./package.json": "./package.json"
  }
}`,
          note: {
            en: 'Keep the top-level `types` as a belt-and-braces fallback, but the `exports` block is what modern resolvers read. `"types"` sits above `"import"`/`"require"` on purpose — reorder it below and `moduleResolution: "bundler"`/`node16` stops seeing your declarations.',
            uk: 'Тримайте top-level `types` як підстраховку, але сучасні resolver-и читають блок `exports`. `"types"` стоїть над `"import"`/`"require"` навмисно — переставте нижче, і `moduleResolution: "bundler"`/`node16` перестає бачити ваші декларації.',
          },
        },
        {
          kind: 'compare',
          a: { en: 'Bundle types with the package', uk: 'Постачати типи з пакетом' },
          b: { en: 'Publish to DefinitelyTyped (`@types/*`)', uk: 'Публікувати в DefinitelyTyped (`@types/*`)' },
          rows: [
            [
              { en: 'When', uk: 'Коли' },
              { en: 'You own the source and it is written in TS (or typed JS)', uk: 'Ви володієте source і він на TS (чи типізований JS)' },
              { en: 'The package ships no types and you cannot change it', uk: 'Пакет не постачає типів, і ви не можете його змінити' },
            ],
            [
              { en: 'Where types live', uk: 'Де живуть типи' },
              { en: 'Inside the published tarball, next to the `.js`', uk: 'Усередині опублікованого tarball, поруч із `.js`' },
              { en: 'A separate community package on npm', uk: 'Окремий community-пакет на npm' },
            ],
            [
              { en: 'Versioning', uk: 'Версіонування' },
              { en: 'Locked to the code — one version, always in sync', uk: 'Привʼязані до коду — одна версія, завжди в синхроні' },
              { en: 'Versioned separately — can drift from the runtime', uk: 'Версіонуються окремо — можуть розійтися з runtime' },
            ],
            [
              { en: 'Best for', uk: 'Найкраще для' },
              { en: 'Your own libraries & internal SDKs', uk: 'Ваших власних бібліотек і внутрішніх SDK' },
              { en: 'Adding types to someone else’s untyped package', uk: 'Додавання типів до чужого untyped-пакета' },
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: { en: 'If your types depend on `@types/x`, it belongs in `dependencies`', uk: 'Якщо ваші типи залежать від `@types/x`, це `dependencies`' },
          md: {
            en: "When your *public* `.d.ts` references a type from another package's declarations — say an exported function returns an `express.Router` — that `@types/express` is part of your contract, not a private build tool. It must sit in **`dependencies`** (not `devDependencies`), because a consumer resolving your types needs those declarations installed too; hide it in `devDependencies` and they get *\"cannot find name\"* errors from inside your package. The mirror-image red flag from the handbook: never wire declaration files together with `/// <reference path=\"../other/x.d.ts\" />` (a brittle filesystem link) — use `/// <reference types=\"other\" />`, which resolves through node like a normal dependency.",
            uk: "Коли ваш *публічний* `.d.ts` посилається на тип із декларацій іншого пакета — скажімо, експортована функція повертає `express.Router` — цей `@types/express` є частиною вашого контракту, а не приватним build-інструментом. Він має бути в **`dependencies`** (не `devDependencies`), бо споживач, що резолвить ваші типи, потребує ці декларації теж встановленими; сховайте його в `devDependencies` — і він отримає помилки *«cannot find name»* зсередини вашого пакета. Дзеркальний red flag із handbook: ніколи не звʼязуйте declaration-файли через `/// <reference path=\"../other/x.d.ts\" />` (крихкий filesystem-лінк) — вживайте `/// <reference types=\"other\" />`, що резолвиться через node, як звичайна залежність.",
          },
        },
      ],
    },
    // ── Topic 3 ───────────────────────────────────────────────────────────────
    {
      id: 't3-dual-format-resolution',
      title: { en: 'The hard part: dual-format & the “masquerading” trap', uk: 'Найважче: dual-format і пастка «masquerading»' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "Everything above is easy for a single-format package. It gets sharp the moment you ship both ESM and CommonJS, because under `node16`/`nodenext` resolution (M12) the compiler picks a declaration file *by module format*, and the format of a `.d.ts` is decided the same way as a `.js`: by extension and by the nearest `package.json` `\"type\"`. TypeScript 4.7 added the matching declaration extensions — **`.d.mts`** (describes an ESM `.mjs`) and **`.d.cts`** (describes a CommonJS `.cjs`) — alongside plain `.d.ts`. The failure mode with a name is **masquerading**: the `import` condition points at a `.d.ts` that *claims* ESM while the `.js` it stands for is actually CommonJS (or vice-versa). It type-checks in a bundler, then explodes for a consumer on real Node ESM, because the types said `export default` while the runtime needs `require`. You cannot eyeball this reliably, so the ecosystem settled on two gates: **`publint`** (lints the `package.json` packaging — exports order, missing files, wrong extensions) and **`@arethetypeswrong/cli`** (`attw`), which resolves your *actually published* tarball under `node10`, `node16-cjs`, `node16-esm` and `bundler` and tells you which resolutions get the right types.",
            uk: "Усе вище легко для однформатного пакета. Стає гостро тієї миті, коли ви постачаєте і ESM, і CommonJS, бо під resolution `node16`/`nodenext` (M12) компілятор обирає declaration-файл *за форматом модуля*, а формат `.d.ts` визначається так само, як `.js`: за розширенням і за найближчим `package.json` `\"type\"`. TypeScript 4.7 додав відповідні declaration-розширення — **`.d.mts`** (описує ESM `.mjs`) і **`.d.cts`** (описує CommonJS `.cjs`) — поряд зі звичайним `.d.ts`. Режим збою має назву — **masquerading**: умова `import` вказує на `.d.ts`, що *заявляє* ESM, тоді як `.js`, який він представляє, насправді CommonJS (чи навпаки). Воно проходить перевірку в bundler, а потім вибухає у споживача на справжньому Node ESM, бо типи сказали `export default`, а runtime потребує `require`. Це не можна надійно оцінити на око, тож екосистема осіла на двох gate-ах: **`publint`** (лінтить packaging у `package.json` — порядок exports, відсутні файли, хибні розширення) і **`@arethetypeswrong/cli`** (`attw`), що резолвить ваш *реально опублікований* tarball під `node10`, `node16-cjs`, `node16-esm` і `bundler` та каже, які resolution отримують правильні типи.",
          },
        },
        {
          kind: 'figure',
          fig: 'publish-types-flow',
          caption: {
            en: 'The publishing pipeline: `tsc` emits format-matched declarations, the `exports` map routes each condition (`types` first) to the right one, and `attw` + `publint` verify the published tarball resolves cleanly under every mode before `npm publish`.',
            uk: 'Конвеєр публікації: `tsc` емітує declaration під формат, мапа `exports` маршрутизує кожну умову (`types` перша) до потрібної, а `attw` + `publint` перевіряють, що опублікований tarball чисто резолвиться під кожним режимом перед `npm publish`.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'JS file it describes', uk: 'JS-файл, який описує' },
            { en: 'Declaration extension', uk: 'Розширення декларації' },
            { en: 'Module format', uk: 'Формат модуля' },
          ],
          rows: [
            [
              { en: '`.mjs` (or `.js` under `"type":"module"`)', uk: '`.mjs` (чи `.js` під `"type":"module"`)' },
              { en: '`.d.mts` (or `.d.ts`)', uk: '`.d.mts` (чи `.d.ts`)' },
              { en: 'ESM', uk: 'ESM' },
            ],
            [
              { en: '`.cjs` (or `.js` under `"type":"commonjs"`)', uk: '`.cjs` (чи `.js` під `"type":"commonjs"`)' },
              { en: '`.d.cts` (or `.d.ts`)', uk: '`.d.cts` (чи `.d.ts`)' },
              { en: 'CommonJS', uk: 'CommonJS' },
            ],
            [
              { en: 'Mismatch (types say ESM, JS is CJS)', uk: 'Розбіжність (типи кажуть ESM, JS — CJS)' },
              { en: 'Wrong extension for the format', uk: 'Хибне розширення для формату' },
              { en: '🎭 Masquerading — `attw` flags it', uk: '🎭 Masquerading — `attw` це ловить' },
            ],
          ],
          caption: {
            en: 'The declaration extension must agree with the format of the `.js` it stands in for. `attw` exists because the mismatch is invisible in a bundler and only fails on real Node.',
            uk: 'Розширення декларації має узгоджуватися з форматом `.js`, який воно представляє. `attw` існує, бо розбіжність невидима в bundler і падає лише на справжньому Node.',
          },
        },
        {
          kind: 'code',
          lang: 'bash',
          code: `# Gate the PUBLISHED artifact, not the source — run in CI before "npm publish":
npx publint            # exports order, missing files, wrong "type"/extension
npx @arethetypeswrong/cli --pack   # resolve the tarball: node10 / node16-cjs / node16-esm / bundler

# A masquerading failure reads like:
#   ✗ node16 (from ESM)   🎭 Masquerading as CJS
#   → the "import" condition served a .d.ts that describes CommonJS`,
          note: {
            en: '`--pack` runs `npm pack` first so the tools see exactly what consumers download. Wire both into CI; a green local `tsc` says nothing about how your *package* resolves on Node.',
            uk: '`--pack` спершу запускає `npm pack`, тож інструменти бачать саме те, що завантажують споживачі. Увімкніть обидва в CI; зелений локальний `tsc` нічого не каже про те, як ваш *пакет* резолвиться на Node.',
          },
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: { en: 'A green `tsc` in your repo does not mean consumers get types', uk: 'Зелений `tsc` у вашому repo не означає, що споживачі отримають типи' },
          md: {
            en: "The single most common publishing bug is trusting your own build. Inside your repo the compiler reads your `.ts` sources directly, so of course everything type-checks — but a consumer reads only the *published files* through your `exports` map, under *their* `moduleResolution`, which may differ from yours. Every packaging defect — a `\"types\"` condition ordered last, a `.d.ts` where a `.d.cts` was needed, a declaration file that npm never included because it was outside `files` — is invisible to your local `tsc` and visible only to the resolver on the far side. That gap is precisely why `attw`/`publint` operate on the packed tarball. Add them to the release job and treat a masquerading flag as release-blocking, not advisory.",
            uk: "Найпоширеніший баг публікації — довіряти власній збірці. Усередині repo компілятор читає ваші `.ts`-джерела напряму, тож звісно все проходить перевірку — але споживач читає лише *опубліковані файли* крізь вашу мапу `exports`, під *своїм* `moduleResolution`, що може відрізнятися від вашого. Кожен дефект packaging — умова `\"types\"` останньою, `.d.ts` там, де треба було `.d.cts`, declaration-файл, який npm не включив, бо він поза `files` — невидимий для вашого локального `tsc` і видимий лише resolver-у з того боку. Саме цей розрив — причина, чому `attw`/`publint` працюють на запакованому tarball. Додайте їх у release-job і ставтеся до masquerading-прапорця як до блокера релізу, а не поради.",
          },
        },
      ],
    },
    // ── Topic 4 ───────────────────────────────────────────────────────────────
    {
      id: 't4-not-breaking-consumers',
      title: { en: 'Types are an API: evolving without breaking consumers', uk: 'Типи — це API: розвиток без ламання споживачів' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "Once types are shipped, the declaration surface is a public API under semver — and it can break consumers even when the runtime is untouched. **Widening** an input is usually safe (accepting `string | number` where you took `string`); **narrowing** an input or a return, renaming an exported type, making an optional property required, or tightening a union are **breaking** and belong in a major. The subtle ones are structural (M1): adding a required field to an object you *accept* breaks callers, while adding a field to an object you *return* is fine — variance decides. Two tools help you evolve deliberately. **`typesVersions`** (TS 3.1) redirects declarations by the *consumer's* compiler version, so you can ship a modern `.d.ts` to TS ≥ 5.x and a downlevel one to older compilers — it is order-sensitive and only affects the external API. And **`isolatedDeclarations`** (TS 5.5 — M11) forces every export to carry an explicit type annotation so that a declaration file can be produced from one file alone, without whole-program inference; the payoff is parallel, tool-generated `.d.ts` in a big monorepo (via `transpileDeclaration`), but the discipline is the real prize: it makes your public contract *explicit at the source*, so a careless change to an exported signature fails loudly instead of silently reshaping the emitted type.",
            uk: "Щойно типи постачені, declaration-поверхня — це публічний API під semver, і вона може зламати споживачів, навіть коли runtime незмінний. **Розширення** входу зазвичай безпечне (приймати `string | number` там, де брали `string`); **звуження** входу чи повернення, перейменування експортованого типу, робити опціональну властивість обовʼязковою чи стискати union — **ламальні** й належать до major. Тонкі — структурні (M1): додавання обовʼязкового поля до обʼєкта, який ви *приймаєте*, ламає викликачів, а додавання поля до обʼєкта, який ви *повертаєте*, — нормально: вирішує variance. Два інструменти допомагають розвиватися свідомо. **`typesVersions`** (TS 3.1) перенаправляє декларації за версією компілятора *споживача*, тож ви можете постачати сучасний `.d.ts` для TS ≥ 5.x і downlevel-версію для старіших компіляторів — воно order-sensitive і впливає лише на зовнішній API. А **`isolatedDeclarations`** (TS 5.5 — M11) змушує кожен export нести явну анотацію типу, щоб declaration-файл можна було створити з одного файлу самого по собі, без inference по всій програмі; виграш — паралельний, згенерований інструментом `.d.ts` у великому monorepo (через `transpileDeclaration`), але справжній приз — дисципліна: вона робить ваш публічний контракт *явним у source*, тож необережна зміна експортованої сигнатури падає гучно, а не тихо перекроює емітований тип.",
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Change to the public surface', uk: 'Зміна публічної поверхні' },
            { en: 'Semver', uk: 'Semver' },
            { en: 'Why', uk: 'Чому' },
          ],
          rows: [
            [
              { en: 'Add a new optional export / optional field', uk: 'Додати новий опціональний export / поле' },
              { en: 'Minor', uk: 'Minor' },
              { en: 'Existing code still assignable', uk: 'Наявний код лишається assignable' },
            ],
            [
              { en: 'Widen a parameter type (`string` → `string | number`)', uk: 'Розширити тип параметра (`string` → `string | number`)' },
              { en: 'Minor', uk: 'Minor' },
              { en: 'Every old call still fits', uk: 'Кожен старий виклик усе ще пасує' },
            ],
            [
              { en: 'Narrow a return, rename a type, required-ify a field', uk: 'Звузити повернення, перейменувати тип, зробити поле обовʼязковим' },
              { en: 'Major', uk: 'Major' },
              { en: 'Breaks assignability at call sites', uk: 'Ламає assignability у місцях виклику' },
            ],
            [
              { en: 'Add a required field to a returned object', uk: 'Додати обовʼязкове поле до поверненого обʼєкта' },
              { en: 'Minor', uk: 'Minor' },
              { en: 'Consumers read, don’t construct it (variance — M1/M3)', uk: 'Споживачі читають, не конструюють його (variance — M1/M3)' },
            ],
          ],
          caption: {
            en: 'Semver for types follows assignability, not intuition. The last two rows look similar but differ because one shape is an input and the other an output.',
            uk: 'Semver для типів іде за assignability, а не за інтуїцією. Останні два рядки схожі, але різняться, бо одна форма — вхід, інша — вихід.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// isolatedDeclarations (M11) rejects exports whose type it cannot print from THIS file alone:
export const version = "1.0.0";              // ✅ literal type is inferable in isolation
export function make() { return { id: 1 }; } // ✗ error: return type must be explicit
export function makeOk(): { id: number } {   // ✅ explicit → .d.ts emittable in parallel
  return { id: 1 };
}`,
          note: {
            en: 'The annotation `isolatedDeclarations` demands is exactly your public contract, written down. It converts "the emitted `.d.ts` silently changed" into a compile error at the source.',
            uk: 'Анотація, якої вимагає `isolatedDeclarations`, — це саме ваш публічний контракт, записаний явно. Вона перетворює «емітований `.d.ts` тихо змінився» на помилку компіляції в source.',
          },
        },
        {
          kind: 'callout',
          tone: 'senior',
          title: { en: 'Keep internal types out of the public surface', uk: 'Тримайте внутрішні типи поза публічною поверхнею' },
          md: {
            en: "The widest contract is the hardest to evolve, so shrink it deliberately. Every exported type is a promise you now owe forever; a type that only appears *inside* function bodies costs you nothing and can change freely. Two habits keep the surface small. First, do not `export` helper/intermediate types that consumers do not need — the smaller the emitted `.d.ts`, the fewer things can break. Second, watch for **inadvertent** exports: a public function that returns an internal `type Cache = …` drags `Cache` into your contract even if you never exported it, because `tsc` must name it in the `.d.ts`. `isolatedDeclarations` surfaces exactly these (it forces you to name and therefore notice them). A tight, explicit surface is what makes the difference between a library you can refactor and one frozen by its own declarations.",
            uk: "Найширший контракт найважче розвивати, тож звужуйте його свідомо. Кожен експортований тип — це обіцянка, яку ви тепер винні назавжди; тип, що зʼявляється лише *всередині* тіл функцій, не коштує вам нічого й може вільно змінюватися. Дві звички тримають поверхню малою. Перше: не `export`-уйте helper/проміжні типи, які споживачам не потрібні — чим менший емітований `.d.ts`, тим менше що може зламатися. Друге: стежте за **ненавмисними** export-ами: публічна функція, що повертає внутрішній `type Cache = …`, затягує `Cache` у ваш контракт, навіть якщо ви його не експортували, бо `tsc` мусить назвати його в `.d.ts`. `isolatedDeclarations` виявляє саме такі (він змушує вас назвати їх і тому помітити). Щільна, явна поверхня — це те, що відрізняє бібліотеку, яку можна рефакторити, від тієї, що заморожена власними деклараціями.",
          },
        },
      ],
    },
    // ── Topic 5 ───────────────────────────────────────────────────────────────
    {
      id: 't5-in-your-stack',
      title: { en: 'In your stack: monorepo libs, ambient shims, the erasure line', uk: 'У вашому стеку: monorepo-бібліотеки, ambient-shim-и, межа стирання' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "You meet declaration files long before you publish to npm. In a NestJS/Angular monorepo, the internal packages you split out — a shared `@app/contracts`, a `@app/logger` — are consumed across project boundaries, so each is a **composite** project (M12) that emits `.d.ts` + `.d.ts.map`, and `tsc -b` uses those declarations to build the graph incrementally and skip unchanged projects. That is the same publishing machinery, aimed inward. Hand-written declarations show up for the other jobs: an **ambient `.d.ts`** to describe an untyped dependency (`declare module 'legacy-lib';` to stop the red squiggles, then refine), a **`declare module`** *augmentation* to add a field to an existing type (extending Express's `Request` with `user`, or a NestJS config namespace), and shims for non-code imports (`declare module '*.svg'`). Reach for `/// <reference types=\"…\" />` over `path`, and let `tsc --declaration` generate everything it can. And keep the module's spine in view: a `.d.ts` is a *promise about shape*, enforced only at compile time. At a real trust boundary — a Lambda event, a queue message, a third-party webhook — the declaration guarantees nothing about the bytes that actually arrive; you still parse and validate at the door (M9). Declaration files describe the contract; they do not enforce it at runtime.",
            uk: "Ви зустрічаєте declaration-файли задовго до публікації в npm. У NestJS/Angular-monorepo внутрішні пакети, які ви виділяєте — спільний `@app/contracts`, `@app/logger` — споживаються через межі проєктів, тож кожен є **composite**-проєктом (M12), що емітує `.d.ts` + `.d.ts.map`, і `tsc -b` використовує ці декларації, щоб будувати граф інкрементно й пропускати незмінні проєкти. Це та сама машинерія публікації, спрямована всередину. Написані руками декларації зʼявляються для інших задач: **ambient `.d.ts`**, щоб описати untyped-залежність (`declare module 'legacy-lib';`, щоб прибрати червоні підкреслення, потім уточнити), **`declare module`**-*аугментація*, щоб додати поле до наявного типу (розширити `Request` в Express полем `user` чи config-namespace у NestJS), і shim-и для non-code-import-ів (`declare module '*.svg'`). Беріть `/// <reference types=\"…\" />` замість `path` і дайте `tsc --declaration` згенерувати все, що може. І тримайте в полі зору хребет модуля: `.d.ts` — це *обіцянка про форму*, що забезпечується лише під час компіляції. На справжній межі довіри — Lambda-event, повідомлення з черги, сторонній webhook — декларація нічого не гарантує про байти, які реально надходять; ви все одно парсите й валідуєте на вході (M9). Declaration-файли описують контракт; вони не забезпечують його в runtime.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// 1. Ambient shim for an untyped dependency (put in a types/*.d.ts on your tsconfig "include"):
declare module 'legacy-lib' {
  export function connect(url: string): Promise<void>;
}

// 2. Module augmentation — add a field to an existing type (merges, does not replace):
import 'express';
declare module 'express' {
  interface Request { user?: { id: string; roles: string[] } }
}

// 3. Non-code import shim (so bundler asset imports type-check):
declare module '*.svg' { const src: string; export default src; }`,
          note: {
            en: 'All three are hand-written declarations that add types without runtime code. Augmentation (2) *merges* into the existing interface — the same declaration-merging that lets `@types` extend globals.',
            uk: 'Усі три — написані руками декларації, що додають типи без runtime-коду. Аугментація (2) *зливається* в наявний interface — те саме declaration-merging, що дає `@types` розширювати глобали.',
          },
        },
        {
          kind: 'callout',
          tone: 'security',
          title: { en: 'A `.d.ts` is a promise, not a runtime check', uk: '`.d.ts` — це обіцянка, а не runtime-перевірка' },
          md: {
            en: "It is easy to over-trust a well-typed SDK: the declarations are precise, the editor is green, so the data *must* be right. But a declaration file is erased before your code runs (M9), so it constrains nothing at a trust boundary. A published type that says `getUser(): Promise<User>` is a claim about what the author *intends* to return, not a guarantee about the JSON that crosses the wire — a version skew, a proxy, or a malicious response can hand you a shape that violates the type while every call still \"type-checks\". Consume third-party types as documentation, and still validate untrusted responses at the boundary with a runtime schema (zod/class-validator — M9). The declaration tells you the shape to *expect*; only a runtime check makes it the shape you actually *have*.",
            uk: "Легко надто довіритися добре типізованому SDK: декларації точні, редактор зелений, тож дані *мусять* бути правильні. Але declaration-файл стирається до запуску вашого коду (M9), тож на межі довіри він нічого не обмежує. Опублікований тип, що каже `getUser(): Promise<User>`, — це твердження про те, що автор *має намір* повернути, а не гарантія щодо JSON, який перетинає мережу — розбіжність версій, proxy чи зловмисна відповідь можуть віддати вам форму, що порушує тип, тоді як кожен виклик усе ще «проходить перевірку». Споживайте сторонні типи як документацію й усе одно валідуйте недовірені відповіді на межі runtime-схемою (zod/class-validator — M9). Декларація каже вам форму, яку *очікувати*; лише runtime-перевірка робить її формою, яку ви реально *маєте*.",
          },
        },
        {
          kind: 'compare',
          a: { en: 'Emitted (generated) `.d.ts`', uk: 'Емітований (згенерований) `.d.ts`' },
          b: { en: 'Ambient (hand-written) `.d.ts`', uk: 'Ambient (написаний руками) `.d.ts`' },
          rows: [
            [
              { en: 'Origin', uk: 'Походження' },
              { en: '`tsc --declaration` from your `.ts`', uk: '`tsc --declaration` з вашого `.ts`' },
              { en: 'Written by you, no implementation exists', uk: 'Написаний вами, реалізації немає' },
            ],
            [
              { en: 'Typical use', uk: 'Типове використання' },
              { en: 'Your library’s public API + monorepo project refs', uk: 'Публічний API вашої бібліотеки + monorepo project refs' },
              { en: 'Untyped deps, module augmentation, asset shims', uk: 'Untyped-залежності, module augmentation, asset-shim-и' },
            ],
            [
              { en: 'Stays in sync automatically', uk: 'Автоматично лишається в синхроні' },
              { en: 'Yes — regenerated from source', uk: 'Так — регенерується з source' },
              { en: 'No — you maintain it by hand', uk: 'Ні — ви супроводжуєте його руками' },
            ],
          ],
        },
      ],
    },
  ],

  keyPoints: [
    {
      en: 'A `.d.ts` is the **public type contract** — your source’s shape with the bodies removed. `tsc` generates it from `.ts`/typed-JS via `declaration`; `emitDeclarationOnly` emits types only (a bundler makes the JS); `declarationMap` writes `.d.ts.map` for Go-to-Definition to the source.',
      uk: '`.d.ts` — це **публічний типовий контракт**: форма вашого source без тіл. `tsc` генерує його з `.ts`/типізованого-JS через `declaration`; `emitDeclarationOnly` емітує лише типи (JS робить bundler); `declarationMap` пише `.d.ts.map` для Go-to-Definition у source.',
    },
    {
      en: 'Ship types via the top-level `types` field (fallback) **and** the `exports` map — where the **`"types"` condition MUST be first** in each block, because `exports` matches in order. Put it after `import`/`require` and resolvers report no types. `publint` checks this.',
      uk: 'Постачайте типи через top-level-поле `types` (fallback) **і** мапу `exports` — де умова **`"types"` МАЄ бути першою** в кожному блоці, бо `exports` матчиться по порядку. Поставте її після `import`/`require` — і resolver-и повідомлять «немає типів». `publint` це перевіряє.',
    },
    {
      en: 'For dual ESM/CJS packages the declaration extension must match the JS format: **`.d.mts`** for ESM, **`.d.cts`** for CommonJS (TS 4.7). A mismatch is **“masquerading”** — invisible in a bundler, broken on real Node. Gate the published tarball with `@arethetypeswrong/cli` + `publint`.',
      uk: 'Для dual ESM/CJS-пакетів розширення декларації має збігатися з форматом JS: **`.d.mts`** для ESM, **`.d.cts`** для CommonJS (TS 4.7). Розбіжність — це **«masquerading»**: невидима в bundler, зламана на справжньому Node. Перевіряйте опублікований tarball через `@arethetypeswrong/cli` + `publint`.',
    },
    {
      en: 'A green local `tsc` proves nothing about the published package — the compiler reads your sources, consumers read the emitted files through `exports` under their own resolution. `attw --pack`/`publint` operate on the packed tarball for exactly this reason.',
      uk: 'Зелений локальний `tsc` нічого не доводить про опублікований пакет — компілятор читає ваші джерела, споживачі читають емітовані файли крізь `exports` під власним resolution. `attw --pack`/`publint` працюють на запакованому tarball саме тому.',
    },
    {
      en: 'The declaration surface is a **semver API**: widening inputs is minor, but narrowing/renaming/required-ifying is major. `typesVersions` (TS 3.1) redirects `.d.ts` by the consumer’s compiler version; `isolatedDeclarations` (TS 5.5 — M11) makes the public contract explicit and emit parallelizable.',
      uk: 'Declaration-поверхня — це **semver-API**: розширення входів — minor, а звуження/перейменування/робити-обовʼязковим — major. `typesVersions` (TS 3.1) перенаправляє `.d.ts` за версією компілятора споживача; `isolatedDeclarations` (TS 5.5 — M11) робить публічний контракт явним, а emit — паралельним.',
    },
    {
      en: 'You meet `.d.ts` internally too: monorepo composite projects emit them for `tsc -b` (M12); hand-written **ambient** declarations type untyped deps / augment modules / shim asset imports. But a `.d.ts` is erased at runtime — at a trust boundary it is a promise, not a check, so still validate untrusted input (M9).',
      uk: 'Ви зустрічаєте `.d.ts` і всередині: monorepo composite-проєкти емітують їх для `tsc -b` (M12); написані руками **ambient**-декларації типізують untyped-залежності / augment-ять модулі / shim-лять asset-import-и. Але `.d.ts` стирається в runtime — на межі довіри це обіцянка, а не перевірка, тож усе одно валідуйте недовірений вхід (M9).',
    },
  ],

  pitfalls: [
    {
      title: { en: 'The `"types"` condition ordered after `import`/`require`', uk: 'Умова `"types"` після `import`/`require`' },
      body: {
        en: 'Because `exports` conditions match in written order, a `"types"` key placed below `"import"`/`"require"` is never reached — TypeScript matches the JS condition first and reports the package as untyped. The `"types"` (or `"types@>=…"`) condition must be the FIRST key in every `exports` block. `publint` flags this; it is the most common publishing bug.',
        uk: 'Оскільки умови `exports` матчаться в порядку написання, ключ `"types"` під `"import"`/`"require"` ніколи не досягається — TypeScript матчить JS-умову першою й повідомляє пакет як untyped. Умова `"types"` (чи `"types@>=…"`) має бути ПЕРШИМ ключем у кожному блоці `exports`. `publint` це ловить; це найпоширеніший баг публікації.',
      },
    },
    {
      title: { en: 'Declaration extension that lies about the module format', uk: 'Розширення декларації, що бреше про формат модуля' },
      body: {
        en: 'Serving a `.d.ts` describing ESM (`export default`) for a JS file that is actually CommonJS (or the reverse) is “masquerading”. It type-checks under `moduleResolution: bundler` and fails for a consumer on Node ESM/CJS. Match the extension to the format (`.d.mts`/`.d.cts`) and verify with `@arethetypeswrong/cli --pack`, which resolves the real tarball under every mode.',
        uk: 'Віддавати `.d.ts`, що описує ESM (`export default`), для JS-файлу, який насправді CommonJS (чи навпаки) — це «masquerading». Воно проходить під `moduleResolution: bundler` і падає у споживача на Node ESM/CJS. Узгоджуйте розширення з форматом (`.d.mts`/`.d.cts`) і перевіряйте через `@arethetypeswrong/cli --pack`, що резолвить справжній tarball під кожним режимом.',
      },
    },
    {
      title: { en: 'A public `@types/*` dependency hidden in `devDependencies`', uk: 'Публічна `@types/*`-залежність схована в `devDependencies`' },
      body: {
        en: 'If your emitted `.d.ts` references a type from `@types/express` (a returned `Router`, an accepted `Request`), that package is part of your contract and must live in `dependencies`. In `devDependencies` it is not installed for consumers, so they get “cannot find name” errors originating inside your package. Same class of bug: wiring declarations with `/// <reference path>` instead of `/// <reference types>`.',
        uk: 'Якщо ваш емітований `.d.ts` посилається на тип із `@types/express` (повернений `Router`, прийнятий `Request`), цей пакет є частиною вашого контракту й має бути в `dependencies`. У `devDependencies` він не встановлюється для споживачів, тож вони отримують помилки «cannot find name» зсередини вашого пакета. Той самий клас бага: звʼязування декларацій через `/// <reference path>` замість `/// <reference types>`.',
      },
    },
    {
      title: { en: 'Treating a shipped type as a runtime guarantee', uk: 'Сприймати постачений тип як runtime-гарантію' },
      body: {
        en: 'A dependency whose types say `fetchUser(): Promise<User>` has told you its intent, not the truth about the bytes that arrive — the `.d.ts` is erased before the call runs. Version skew or a hostile response can violate the type while every call still type-checks. Use third-party declarations as documentation and validate untrusted responses at the boundary with a runtime schema (M9). The type describes the shape; only a runtime check enforces it.',
        uk: 'Залежність, чиї типи кажуть `fetchUser(): Promise<User>`, повідомила вам намір, а не правду про байти, що надходять — `.d.ts` стирається до виконання виклику. Розбіжність версій чи ворожа відповідь можуть порушити тип, тоді як кожен виклик усе ще проходить перевірку. Вживайте сторонні декларації як документацію й валідуйте недовірені відповіді на межі runtime-схемою (M9). Тип описує форму; лише runtime-перевірка її забезпечує.',
      },
    },
  ],

  interview: [
    {
      q: { en: 'What is a `.d.ts` file, and how does one normally come to exist?', uk: 'Що таке файл `.d.ts` і як він зазвичай зʼявляється?' },
      a: {
        en: 'A declaration file is a module’s public type surface with the implementation removed — the signatures, exported interfaces and `declare`d names, and nothing runnable. For your own code you almost never write it by hand: `tsc` generates it from the `.ts` (or typed JS via JSDoc) when `declaration` is enabled, so the contract stays in sync with the source. `emitDeclarationOnly` emits just the types (a bundler produces the JS), and `declarationMap` writes a `.d.ts.map` so an editor’s Go-to-Definition lands on your original source. Hand-written `.d.ts` is reserved for the cases with no source to generate from — ambient declarations for untyped dependencies, module augmentation, and asset-import shims.',
        uk: 'Declaration-файл — це публічна типова поверхня модуля без реалізації: сигнатури, експортовані interface-и й `declare`-ані імена, і нічого виконуваного. Для власного коду ви майже ніколи не пишете його руками: `tsc` генерує його з `.ts` (чи типізованого JS через JSDoc), коли увімкнено `declaration`, тож контракт лишається в синхроні з source. `emitDeclarationOnly` емітує лише типи (JS робить bundler), а `declarationMap` пише `.d.ts.map`, щоб Go-to-Definition редактора потрапляв на ваш оригінальний source. Написаний руками `.d.ts` лишається для випадків без source для генерації — ambient-декларації для untyped-залежностей, module augmentation і shim-и для asset-import-ів.',
      },
      level: 'middle',
    },
    {
      q: { en: 'A consumer says your package “has no types”, but it type-checks fine in your repo. Where do you look?', uk: 'Споживач каже, що ваш пакет «не має типів», але у вашому repo він чисто проходить перевірку. Куди дивитесь?' },
      a: {
        en: 'At the packaging, not the compiler — inside your repo `tsc` reads your `.ts` sources directly, while the consumer reads only the published files through your `exports` map under their `moduleResolution`. The classic cause is the `"types"` condition not being first in the `exports` block: conditions match in written order, so if `"import"`/`"require"` precede `"types"`, the resolver matches the JS file and never sees the declarations. Other suspects: a `.d.ts` served where a `.d.cts`/`.d.mts` was needed (masquerading), or the declaration file not included by `files`/npm. I would run `publint` and `@arethetypeswrong/cli --pack`, which resolve the actual tarball under node10/node16-cjs/node16-esm/bundler and pinpoint which resolution fails.',
        uk: 'На packaging, а не на компілятор — усередині repo `tsc` читає ваші `.ts`-джерела напряму, тоді як споживач читає лише опубліковані файли крізь вашу мапу `exports` під своїм `moduleResolution`. Класична причина — умова `"types"` не перша в блоці `exports`: умови матчаться в порядку написання, тож якщо `"import"`/`"require"` передують `"types"`, resolver матчить JS-файл і ніколи не бачить декларацій. Інші підозрювані: `.d.ts` там, де треба `.d.cts`/`.d.mts` (masquerading), або declaration-файл не включений `files`/npm. Я б запустив `publint` і `@arethetypeswrong/cli --pack`, що резолвлять справжній tarball під node10/node16-cjs/node16-esm/bundler і точно вказують, який resolution падає.',
      },
      level: 'senior',
    },
    {
      q: { en: 'Which changes to a library’s types are breaking, and how do you evolve types without a major bump when possible?', uk: 'Які зміни типів бібліотеки є ламальними і як розвивати типи без major-бампа, коли можна?' },
      a: {
        en: 'Breaking is anything that stops previously-valid consumer code from type-checking, which tracks assignability, not effort. Widening an input (accepting a larger union) is non-breaking; narrowing an input or a return, renaming an exported type, making an optional property required, or tightening a union are breaking and need a major. Structural variance matters: adding a required field to an object you accept breaks callers, but adding one to an object you return does not. To evolve safely I keep the public surface small (don’t export helper types), prefer additive optional changes for minors, and use `typesVersions` when I must serve different declarations to different compiler versions. `isolatedDeclarations` helps proactively: by forcing explicit annotations on exports, it turns an accidental signature change into a compile error instead of a silent `.d.ts` reshuffle.',
        uk: 'Ламальне — це будь-що, що зупиняє раніше-валідний код споживача від проходження перевірки, а це йде за assignability, не за зусиллям. Розширення входу (прийняти більший union) не ламальне; звуження входу чи повернення, перейменування експортованого типу, робити опціональну властивість обовʼязковою чи стискати union — ламальні й потребують major. Структурний variance важить: додавання обовʼязкового поля до обʼєкта, який ви приймаєте, ламає викликачів, а до того, який повертаєте, — ні. Щоб розвивати безпечно, я тримаю публічну поверхню малою (не експортую helper-типи), віддаю перевагу адитивним опціональним змінам для minor-ів і вживаю `typesVersions`, коли мушу віддавати різні декларації різним версіям компілятора. `isolatedDeclarations` допомагає проактивно: змушуючи явні анотації на export-ах, він перетворює випадкову зміну сигнатури на помилку компіляції замість тихого перетасування `.d.ts`.',
      },
      level: 'staff',
    },
    {
      q: { en: 'Why do `.d.mts`/`.d.cts` exist, and what problem do `attw`/`publint` solve that `tsc` does not?', uk: 'Навіщо існують `.d.mts`/`.d.cts` і яку проблему розвʼязують `attw`/`publint`, якої не розвʼязує `tsc`?' },
      a: {
        en: 'Under node16/nodenext resolution the compiler decides a file’s module format from its extension and nearest `package.json` "type" — and it decides a `.d.ts`’s format the same way. So a dual-format package needs declarations whose format matches the JS they describe: `.d.mts` for the ESM `.mjs`, `.d.cts` for the CommonJS `.cjs` (TS 4.7). If the `import` condition serves a declaration that claims ESM while the runtime file is CommonJS, that’s “masquerading”: it type-checks under a bundler’s loose resolution but breaks for a consumer on real Node. `tsc` can’t catch this because in your repo it reads sources directly, not the published layout. `publint` lints the `package.json` packaging (exports order, extensions, missing files) and `@arethetypeswrong/cli --pack` resolves the packed tarball under node10, node16-cjs, node16-esm and bundler, reporting exactly which resolution mode gets the wrong types — the check that models what consumers actually experience.',
        uk: 'Під resolution node16/nodenext компілятор визначає формат модуля файлу за його розширенням і найближчим `package.json` "type" — і формат `.d.ts` визначає так само. Тож dual-format-пакет потребує декларацій, чий формат збігається з JS, який вони описують: `.d.mts` для ESM `.mjs`, `.d.cts` для CommonJS `.cjs` (TS 4.7). Якщо умова `import` віддає декларацію, що заявляє ESM, тоді як runtime-файл — CommonJS, це «masquerading»: воно проходить під слабким resolution bundler-а, але падає у споживача на справжньому Node. `tsc` не може це зловити, бо у вашому repo він читає джерела напряму, а не опублікований розклад. `publint` лінтить packaging у `package.json` (порядок exports, розширення, відсутні файли), а `@arethetypeswrong/cli --pack` резолвить запакований tarball під node10, node16-cjs, node16-esm і bundler, повідомляючи, який саме режим resolution отримує неправильні типи — перевірка, що моделює те, що реально переживають споживачі.',
      },
      level: 'staff',
    },
  ],

  seeAlso: ['m12-modules-resolution', 'm11-tsconfig-strictness', 'm9-dto-validation', 'm1-structural-typing'],

  sources: [
    { title: 'TypeScript Handbook — Publishing (types field, typesVersions, red flags)', url: 'https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html' },
    { title: 'TypeScript Handbook — Declaration Files: Introduction', url: 'https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html' },
    { title: 'TSConfig Reference — declaration', url: 'https://www.typescriptlang.org/tsconfig/declaration.html' },
    { title: 'TSConfig Reference — declarationMap', url: 'https://www.typescriptlang.org/tsconfig/declarationMap.html' },
    { title: 'TSConfig Reference — emitDeclarationOnly', url: 'https://www.typescriptlang.org/tsconfig/emitDeclarationOnly.html' },
    { title: 'TSConfig Reference — isolatedDeclarations', url: 'https://www.typescriptlang.org/tsconfig/isolatedDeclarations.html' },
    { title: 'TypeScript 5.5 Release Notes — Isolated Declarations & transpileDeclaration', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html' },
    { title: 'TypeScript 4.7 Release Notes — ESM/CJS, .d.mts/.d.cts, package.json exports', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html' },
    { title: 'TypeScript Modules Reference — resolution, conditions & declaration formats', url: 'https://www.typescriptlang.org/docs/handbook/modules/reference.html' },
    { title: 'publint — package.json packaging rules (types condition ordering)', url: 'https://publint.dev/rules' },
    { title: '@arethetypeswrong/cli — analyze published package types (masquerading)', url: 'https://www.npmjs.com/package/@arethetypeswrong/cli' },
    { title: 'Announcing TypeScript 7.0 RC (Go-native "tsgo"; checking semantics identical to 6.0)', url: 'https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-rc/' },
  ],
};
