import type { Module } from '../types';

/*
 * ★ SIGNATURE MODULE (S8) — Modules, Resolution & Project References. Section IV, second module.
 * Thesis: module resolution is the compiler retracing the EXACT path your runtime (or bundler) will
 * take to a file — so the failure modes are "cannot find module", a wrong emit, or a type that lies.
 * Signature sim: 'module-resolution' (step the ordered candidate-path probes for a real import).
 * Figures: 'resolution-pipeline' (extension substitution + node_modules walk) and 'project-references'
 * (composite build graph). Version-sensitive facts web-verified (see sources): moduleResolution modes
 * classic/node10/node16/nodenext/bundler (bundler added 5.0; node → node10 rename 5.0); extension
 * substitution order; ESM requires the extension; allowImportingTsExtensions (5.0);
 * rewriteRelativeImportExtensions (5.7); package.json exports/imports conditions; composite/tsc -b.
 */
export const m12: Module = {
  id: 'm12-modules-resolution',
  num: 12,
  section: 's4-compiler',
  order: 2,
  level: 'senior',
  signature: true,
  title: { en: 'Modules, Resolution & Project References', uk: 'Модулі, Resolution та Project References' },
  tagline: {
    en: 'How TypeScript finds a file behind an import: moduleResolution, extension substitution, exports maps, and composite project builds.',
    uk: 'Як TypeScript знаходить файл за імпортом: moduleResolution, підстановка розширень, exports maps і composite-збірки проєктів.',
  },
  readMins: 20,
  mentalModel: {
    en: 'Module resolution is the compiler retracing the exact path your runtime or bundler will take to reach a file. When it and the runtime disagree, you get "cannot find module" — or worse, code that type-checks and then crashes.',
    uk: 'Module resolution — це компілятор, що повторює точний шлях, яким ваш runtime чи bundler дійде до файлу. Коли він і runtime розходяться, ви отримуєте «cannot find module» — або гірше, код, що проходить перевірку типів і потім падає.',
  },

  topics: [
    // ── Topic 1 ───────────────────────────────────────────────────────────────
    {
      id: 't1-what-resolution',
      title: { en: 'What resolution actually answers', uk: 'На що насправді відповідає resolution' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "Every `import './x'` or `import 'pkg'` poses one question: **which file on disk is that?** Module resolution is the algorithm the compiler runs to answer it — and the whole design goal is to **retrace the exact path your runtime or bundler will take**, so that the file TypeScript type-checks is the file that actually loads. That is why it is not one algorithm but a family selected by `moduleResolution`: Node's ESM loader, Node's old CommonJS loader, and bundlers each search differently, and TypeScript has to mimic whichever one will run your emitted code. Get it right and imports \"just work\"; get it wrong and you see `TS2307: cannot find module`, or the subtler failure where the compiler resolves to a different file (or a stale `.d.ts`) than the runtime, so it type-checks and then throws at load.",
            uk: "Кожен `import './x'` чи `import 'pkg'` ставить одне питання: **який це файл на диску?** Module resolution — це алгоритм, який компілятор запускає, щоб відповісти, і вся мета дизайну — **повторити точний шлях, яким піде ваш runtime чи bundler**, щоб файл, який TypeScript перевіряє, був тим файлом, що реально завантажується. Тому це не один алгоритм, а родина, обрана через `moduleResolution`: ESM-завантажувач Node, старий CommonJS-завантажувач Node і бандлери шукають по-різному, і TypeScript має імітувати той, що виконуватиме ваш емітований код. Зробите правильно — імпорти «просто працюють»; неправильно — бачите `TS2307: cannot find module`, або тонший збій, коли компілятор резолвиться в інший файл (чи застарілий `.d.ts`), ніж runtime, тож перевірка проходить, а потім падіння на завантаженні.",
          },
        },
        {
          kind: 'figure',
          fig: 'resolution-pipeline',
          caption: {
            en: 'The two mechanics behind every resolution: extension substitution (the .ts is read before the .js) and the types-first node_modules walk.',
            uk: 'Два механізми за кожним resolution: підстановка розширення (.ts читається перед .js) і types-first обхід node_modules.',
          },
        },
        {
          kind: 'callout',
          tone: 'senior',
          title: { en: 'module and moduleResolution move together', uk: 'module і moduleResolution рухаються разом' },
          md: {
            en: "`module` (what format you emit) and `moduleResolution` (how you find files) are two options, but they are coupled: `module: \"NodeNext\"` implies `moduleResolution: \"NodeNext\"`, and `moduleResolution: \"bundler\"` requires `module: \"esnext\"` or `\"preserve\"`. Modern TypeScript will even infer one from the other. The mental split still holds — one is about output, one is about lookup — but you almost always set them as a matched pair.",
            uk: "`module` (який формат ви емітуєте) і `moduleResolution` (як ви знаходите файли) — це дві опції, але вони повʼязані: `module: \"NodeNext\"` передбачає `moduleResolution: \"NodeNext\"`, а `moduleResolution: \"bundler\"` потребує `module: \"esnext\"` чи `\"preserve\"`. Сучасний TypeScript навіть виводить одне з одного. Ментальний поділ лишається — одне про вихід, інше про пошук — але ви майже завжди задаєте їх узгодженою парою.",
          },
        },
      ],
    },
    // ── Topic 2 ───────────────────────────────────────────────────────────────
    {
      id: 't2-modes',
      title: { en: 'The four resolution modes', uk: 'Чотири режими resolution' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "There are four `moduleResolution` values and only three you should ever type. **`classic`** predates Node and should never be used. **`node10`** (renamed from `node` in 5.0) models Node's *old* CommonJS `require` algorithm — extensionless paths, directory `index.js`, the `node_modules` walk — but it does **not** understand package.json `\"exports\"`, so it is wrong for any modern package. **`node16`/`nodenext`** model Node's *current* dual algorithm: they pick the ESM or CommonJS rules per file based on package.json `\"type\"` and the file extension, honour `\"exports\"`/`\"imports\"`, and require extensions on relative ESM imports. `node16` and `nodenext` are equivalent today; `nodenext` tracks the latest, so it is the safer choice. **`bundler`** (5.0) is for code a bundler compiles (Vite, esbuild, webpack, Next): it supports `\"exports\"`/`\"imports\"` like nodenext but, like CommonJS, **never requires a file extension**. Rule of thumb: `nodenext` if Node runs your emitted `.js` directly; `bundler` if a bundler processes it first.",
            uk: "Є чотири значення `moduleResolution` і лише три, які варто колись писати. **`classic`** старіший за Node і не має використовуватися ніколи. **`node10`** (перейменований з `node` у 5.0) моделює *старий* CommonJS `require`-алгоритм Node — шляхи без розширення, директорний `index.js`, обхід `node_modules` — але **не** розуміє package.json `\"exports\"`, тож хибний для будь-якого сучасного пакета. **`node16`/`nodenext`** моделюють *поточний* подвійний алгоритм Node: обирають правила ESM чи CommonJS для кожного файлу за package.json `\"type\"` і розширенням, шанують `\"exports\"`/`\"imports\"` і вимагають розширення на відносних ESM-імпортах. `node16` і `nodenext` сьогодні еквівалентні; `nodenext` відстежує найновіше, тож безпечніший вибір. **`bundler`** (5.0) — для коду, який компілює bundler (Vite, esbuild, webpack, Next): підтримує `\"exports\"`/`\"imports\"` як nodenext, але, як CommonJS, **ніколи не вимагає розширення файлу**. Правило: `nodenext`, якщо Node виконує ваш емітований `.js` напряму; `bundler`, якщо його спершу обробляє bundler.",
          },
        },
        {
          kind: 'sim',
          sim: 'module-resolution',
          caption: {
            en: 'Pick an import scenario and step the ordered candidate paths the compiler probes — extension substitution, the node_modules walk, exports conditions — until it resolves or fails.',
            uk: 'Оберіть сценарій імпорту й покроково пройдіть впорядковані кандидати-шляхи, які пробує компілятор — підстановка розширення, обхід node_modules, умови exports — доки він не розвʼяже або не зазнає невдачі.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Mode', uk: 'Режим' },
            { en: 'Models', uk: 'Моделює' },
            { en: '"exports"?', uk: '"exports"?' },
            { en: 'Needs extension?', uk: 'Потрібне розширення?' },
          ],
          rows: [
            [{ en: 'classic', uk: 'classic' }, { en: 'Pre-Node TS (legacy)', uk: 'До-Node TS (legacy)' }, { en: 'No', uk: 'Ні' }, { en: '— (do not use)', uk: '— (не використовуйте)' }],
            [{ en: 'node10', uk: 'node10' }, { en: "Node's old CommonJS require", uk: 'Старий CommonJS require Node' }, { en: 'No', uk: 'Ні' }, { en: 'No (extensionless OK)', uk: 'Ні (без розширення OK)' }],
            [{ en: 'node16 / nodenext', uk: 'node16 / nodenext' }, { en: "Node's modern ESM + CJS", uk: 'Сучасний ESM + CJS Node' }, { en: 'Yes', uk: 'Так' }, { en: 'Yes, for ESM relative imports', uk: 'Так, для відносних ESM-імпортів' }],
            [{ en: 'bundler', uk: 'bundler' }, { en: 'Vite / esbuild / webpack', uk: 'Vite / esbuild / webpack' }, { en: 'Yes', uk: 'Так' }, { en: 'No', uk: 'Ні' }],
          ],
          caption: {
            en: 'nodenext for code Node runs directly; bundler for code a bundler compiles first. node10 only for legacy CJS-only packages; classic never.',
            uk: 'nodenext для коду, який Node виконує напряму; bundler для коду, який спершу компілює bundler. node10 лише для legacy CJS-пакетів; classic ніколи.',
          },
        },
      ],
    },
    // ── Topic 3 ───────────────────────────────────────────────────────────────
    {
      id: 't3-extensions',
      title: { en: 'Extension substitution & the ESM extension rule', uk: 'Підстановка розширень і правило розширення ESM' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "One rule underlies every mode. Whenever resolution would look up a JavaScript file, TypeScript first tries the **TypeScript** file with the analogous extension, in a fixed order: for a `./x.js` lookup it tries `./x.ts`, then `./x.tsx`, then `./x.d.ts`, and only then `./x.js` (and `.mjs` → `.mts`/`.d.mts`, `.cjs` → `.cts`/`.d.cts`). This is **extension substitution**, and it is why you can — and under ESM must — **write the runtime `.js` extension in your import while the file on disk is `.ts`**: you write `./parser.js`, the compiler reads `parser.ts`. The surprise for people new to `nodenext` is that this extension is **mandatory** for relative imports in an ESM file (because Node's ESM loader requires it), while it is optional under `node10`, CommonJS, and `bundler`. Two newer escape hatches: **allowImportingTsExtensions** (5.0) lets you literally write `./parser.ts` (only with `noEmit`/`emitDeclarationOnly`), and **rewriteRelativeImportExtensions** (5.7) lets you write `.ts` and have `tsc` rewrite it to `.js` on emit.",
            uk: "Одне правило лежить в основі кожного режиму. Щоразу, коли resolution шукав би JavaScript-файл, TypeScript спершу пробує **TypeScript**-файл з аналогічним розширенням у фіксованому порядку: для пошуку `./x.js` пробує `./x.ts`, тоді `./x.tsx`, тоді `./x.d.ts`, і лише потім `./x.js` (а `.mjs` → `.mts`/`.d.mts`, `.cjs` → `.cts`/`.d.cts`). Це **extension substitution**, і саме тому ви можете — а під ESM мусите — **писати runtime-розширення `.js` в імпорті, тоді як файл на диску — `.ts`**: ви пишете `./parser.js`, компілятор читає `parser.ts`. Несподіванка для новачків у `nodenext`: це розширення **обовʼязкове** для відносних імпортів в ESM-файлі (бо ESM-завантажувач Node його вимагає), тоді як під `node10`, CommonJS і `bundler` воно необовʼязкове. Дві новіші лазівки: **allowImportingTsExtensions** (5.0) дозволяє буквально писати `./parser.ts` (лише з `noEmit`/`emitDeclarationOnly`), а **rewriteRelativeImportExtensions** (5.7) дозволяє писати `.ts` і мати, що `tsc` перепише його на `.js` при emit.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// module/moduleResolution: NodeNext, inside an ESM file (package.json "type": "module")

import { parse } from './parser.js';   // ✅ you WRITE .js — TS READS ./parser.ts (extension substitution)
import { parse } from './parser';      // ✗ TS2835: relative import needs an explicit '.js' extension
import { shape } from './shapes';      // ✗ directory index is not allowed under ESM either

// escape hatches:
import { parse } from './parser.ts';   // only with allowImportingTsExtensions (5.0) + noEmit
// rewriteRelativeImportExtensions (5.7): write .ts, tsc rewrites it to .js on emit`,
          note: {
            en: 'Under bundler or node10 the extensionless forms all resolve — the requirement is an ESM rule, not a TypeScript whim.',
            uk: 'Під bundler чи node10 усі форми без розширення резолвляться — вимога є правилом ESM, а не примхою TypeScript.',
          },
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: { en: 'The extension you write is the runtime extension', uk: 'Розширення, яке ви пишете, — це runtime-розширення' },
          md: {
            en: "It feels wrong to import `./parser.js` from `parser.ts`, but that is correct: the import specifier is a message to the **runtime**, which will load the emitted `.js`. TypeScript follows it back to the source. Writing `./parser.ts` (without the escape-hatch flags) is the actual error, because that path will not exist after compilation. This trips up almost everyone migrating a codebase to `nodenext`.",
            uk: "Здається неправильним імпортувати `./parser.js` з `parser.ts`, але це коректно: специфікатор імпорту — це повідомлення для **runtime**, який завантажить емітований `.js`. TypeScript слідує за ним назад до джерела. Писати `./parser.ts` (без флагів-лазівок) — і є справжня помилка, бо цей шлях не існуватиме після компіляції. Це спотикає майже всіх, хто мігрує базу на `nodenext`.",
          },
        },
      ],
    },
    // ── Topic 4 ───────────────────────────────────────────────────────────────
    {
      id: 't4-exports-paths',
      title: { en: '"exports"/"imports" maps & the paths trap', uk: '"exports"/"imports" maps і пастка paths' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "For bare specifiers, modern packages steer resolution with package.json **`\"exports\"`**. It is a conditional map: for a given subpath it lists **conditions** — `\"types\"`, `\"import\"`, `\"require\"`, `\"node\"`, `\"default\"` — and the resolver picks the **first key that matches**, in the object's key order. That is why authors put `\"types\"` first: it must win before `\"import\"`/`\"require\"` so the compiler finds the `.d.ts`. Two consequences to internalize. First, **`\"exports\"` encapsulates**: once a package has it, any subpath it does not list is **blocked** — even if the file physically exists. Second, the mirror field **`\"imports\"`** (keys start with `#`) gives a package private internal aliases resolved the same way. Contrast all of this with **`paths`**, a *compiler-only* alias: it rewrites specifiers for the type-checker but **does not change the emitted import**, so `import '@app/db'` type-checks and then crashes at runtime unless a bundler or loader applies the same mapping. Use `paths` for build-tool aliases you know are remapped downstream; never point it at `node_modules` packages.",
            uk: "Для bare-специфікаторів сучасні пакети керують resolution через package.json **`\"exports\"`**. Це умовна мапа: для заданого підшляху вона перелічує **умови** — `\"types\"`, `\"import\"`, `\"require\"`, `\"node\"`, `\"default\"` — і резолвер обирає **перший ключ, що збігається**, у порядку ключів обʼєкта. Тому автори ставлять `\"types\"` першим: він має перемогти до `\"import\"`/`\"require\"`, щоб компілятор знайшов `.d.ts`. Два наслідки для засвоєння. Перший: **`\"exports\"` інкапсулює** — щойно пакет його має, будь-який підшлях, якого немає в списку, **заблоковано**, навіть якщо файл фізично існує. Другий: дзеркальне поле **`\"imports\"`** (ключі починаються з `#`) дає пакету приватні внутрішні аліаси, що резолвляться так само. Протиставте це **`paths`** — аліасу *лише для компілятора*: він переписує специфікатори для type-checker, але **не змінює емітований import**, тож `import '@app/db'` проходить перевірку й потім падає в runtime, якщо bundler чи loader не застосує те саме мапування. Використовуйте `paths` для аліасів інструмента збірки, які, як ви знаєте, ремапляться далі; ніколи не спрямовуйте його на пакети з `node_modules`.",
          },
        },
        {
          kind: 'code',
          lang: 'json',
          code: `// A dual-published package. Conditions match in KEY ORDER — "types" is placed first so it wins.
{
  "name": "pkg",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./sub": { "types": "./dist/sub.d.ts", "import": "./dist/sub.mjs" }
  }
}`,
          note: {
            en: 'import "pkg" and import "pkg/sub" resolve; import "pkg/dist/secret" is BLOCKED by the presence of "exports", even though the file exists.',
            uk: 'import "pkg" та import "pkg/sub" резолвляться; import "pkg/dist/secret" ЗАБЛОКОВАНО наявністю "exports", навіть якщо файл існує.',
          },
        },
        {
          kind: 'compare',
          a: { en: 'package.json "exports"', uk: 'package.json "exports"' },
          b: { en: 'tsconfig "paths"', uk: 'tsconfig "paths"' },
          rows: [
            [
              { en: 'Who reads it', uk: 'Хто це читає' },
              { en: 'The runtime AND the compiler', uk: 'Runtime І компілятор' },
              { en: 'The compiler only', uk: 'Лише компілятор' },
            ],
            [
              { en: 'Affects emit?', uk: 'Впливає на emit?' },
              { en: 'It IS how the module loads', uk: 'Це і Є те, як модуль завантажується' },
              { en: 'No — the emitted import is unchanged', uk: 'Ні — емітований import незмінний' },
            ],
            [
              { en: 'Failure mode', uk: 'Режим збою' },
              { en: 'Unlisted subpath is blocked at build time', uk: 'Неперелічений підшлях блокується на збірці' },
              { en: 'Type-checks, then crashes at runtime if unmapped', uk: 'Проходить перевірку, тоді падає в runtime, якщо не змаплено' },
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'security',
          title: { en: '"exports" is an encapsulation boundary', uk: '"exports" — це межа інкапсуляції' },
          md: {
            en: "Because `\"exports\"` blocks every unlisted subpath, it is the package author's public API contract: consumers cannot reach into `dist/internal/*` and depend on your private files. When you publish a package (Module 13), a deliberate `\"exports\"` map is both a correctness tool and an encapsulation control — it stops the ecosystem from coupling to internals you intend to change.",
            uk: "Оскільки `\"exports\"` блокує кожен неперелічений підшлях, це публічний контракт API автора пакета: споживачі не можуть залізти в `dist/internal/*` і залежати від ваших приватних файлів. Коли ви публікуєте пакет (Модуль 13), свідома мапа `\"exports\"` — це і інструмент коректності, і засіб інкапсуляції: вона не дає екосистемі чіплятися за внутрішні деталі, які ви плануєте змінювати.",
          },
        },
      ],
    },
    // ── Topic 5 ───────────────────────────────────────────────────────────────
    {
      id: 't5-project-refs',
      title: { en: 'Project references & composite builds', uk: 'Project references і composite-збірки' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "When one repository holds several TypeScript projects — a backend, a shared library, a frontend — **project references** turn them into one build graph instead of one giant program. A referenced project sets **`composite: true`** (which forces `declaration` and a known `rootDir`), so it emits `.d.ts` files plus a **`.tsbuildinfo`** fingerprint of its inputs. The consumer lists it under **`references`**, and you build with **`tsc -b`** (build mode), which acts as an orchestrator: it builds dependencies **leaf-first** in topological order and, crucially, **skips any project whose inputs are unchanged** by reading `.tsbuildinfo` — turning a multi-minute monorepo type-check into an incremental one. Add **`declarationMap: true`** and your editor's *Go to Definition* jumps across project boundaries to the original `.ts` source, not the generated `.d.ts`. This is the mechanism behind fast CI on a monorepo: cached, incremental, dependency-ordered builds.",
            uk: "Коли один репозиторій містить кілька TypeScript-проєктів — бекенд, спільну бібліотеку, фронтенд — **project references** перетворюють їх на один граф збірки замість однієї гігантської програми. Проєкт, на який посилаються, ставить **`composite: true`** (що вмикає `declaration` і відомий `rootDir`), тож він емітує `.d.ts` плюс **`.tsbuildinfo`** — відбиток своїх входів. Споживач перелічує його під **`references`**, і ви збираєте через **`tsc -b`** (build-режим), який діє як оркестратор: він збирає залежності **від листків** у топологічному порядку і, головне, **пропускає будь-який проєкт, чиї входи незмінні**, читаючи `.tsbuildinfo` — перетворюючи багатохвилинну перевірку monorepo на інкрементну. Додайте **`declarationMap: true`** — і *Go to Definition* у редакторі перестрибує межі проєктів до оригінального `.ts`-джерела, а не згенерованого `.d.ts`. Це механізм за швидким CI на monorepo: кешовані, інкрементні, впорядковані за залежностями збірки.",
          },
        },
        {
          kind: 'figure',
          fig: 'project-references',
          caption: {
            en: 'composite projects emit .d.ts + .tsbuildinfo; tsc -b builds them leaf-first and skips the unchanged ones.',
            uk: 'composite-проєкти емітують .d.ts + .tsbuildinfo; tsc -b збирає їх від листків і пропускає незмінні.',
          },
        },
        {
          kind: 'code',
          lang: 'json',
          code: `// packages/app/tsconfig.json — app depends on the built output of ../core
{
  "compilerOptions": {
    "composite": true,        // emit .d.ts + .tsbuildinfo; enables reference builds
    "declaration": true,
    "declarationMap": true,   // cross-project "Go to Definition" → source, not .d.ts
    "outDir": "dist",
    "rootDir": "src"
  },
  "references": [{ "path": "../core" }]
}
// then:  tsc -b        → builds core, then app, incrementally (skips unchanged via .tsbuildinfo)`,
          note: {
            en: 'references points at the dependency\'s tsconfig, not its source. tsc -b reads .tsbuildinfo to rebuild only what changed.',
            uk: 'references вказує на tsconfig залежності, а не її джерело. tsc -b читає .tsbuildinfo, щоб перезбирати лише змінене.',
          },
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: { en: 'composite = "publish types to your own repo"', uk: 'composite = «публікувати типи у власний репозиторій»' },
          md: {
            en: "Think of a composite project as publishing a package to the rest of your monorepo: it hands out `.d.ts` files, and downstream projects consume those types instead of re-checking its source. That is why `tsc -b` can skip it when unchanged — the contract (`.d.ts` + `.tsbuildinfo`) is stable. It is the same `.d.ts`-as-contract idea you use to ship a real package (Module 13), applied inside one repo.",
            uk: "Уявіть composite-проєкт як публікацію пакета для решти вашого monorepo: він роздає `.d.ts`, а нижчі проєкти споживають ці типи замість повторної перевірки його джерела. Тому `tsc -b` може пропустити його, коли він незмінний — контракт (`.d.ts` + `.tsbuildinfo`) стабільний. Це та сама ідея `.d.ts`-як-контракт, яку ви використовуєте для постачання справжнього пакета (Модуль 13), застосована всередині одного репозиторію.",
          },
        },
      ],
    },
  ],

  keyPoints: [
    {
      en: 'Module resolution retraces the exact path the runtime/bundler will take to a file, so the type-checked file is the one that loads. module (emit format) and moduleResolution (lookup) move as a coupled pair.',
      uk: 'Module resolution повторює точний шлях, яким runtime/bundler дійде до файлу, щоб перевірений файл був тим, що завантажується. module (формат emit) і moduleResolution (пошук) рухаються повʼязаною парою.',
    },
    {
      en: 'Four modes: classic (never), node10 (legacy CJS, no "exports"), node16/nodenext (Node\'s modern ESM+CJS, honours "exports", needs extensions on ESM relative imports), bundler (Vite/esbuild, no extensions needed).',
      uk: 'Чотири режими: classic (ніколи), node10 (legacy CJS, без "exports"), node16/nodenext (сучасний ESM+CJS Node, шанує "exports", потребує розширень на відносних ESM-імпортах), bundler (Vite/esbuild, розширення не потрібні).',
    },
    {
      en: 'Extension substitution: a would-be .js lookup tries .ts → .tsx → .d.ts first. You write the runtime .js extension; TypeScript reads the .ts. ESM makes that extension mandatory; bundler/node10 do not.',
      uk: 'Extension substitution: потенційний пошук .js спершу пробує .ts → .tsx → .d.ts. Ви пишете runtime-розширення .js; TypeScript читає .ts. ESM робить це розширення обовʼязковим; bundler/node10 — ні.',
    },
    {
      en: 'package.json "exports" is a conditional map matched in key order (types first) and it ENCAPSULATES: any unlisted subpath is blocked. "imports" (# keys) does the same for internal aliases.',
      uk: 'package.json "exports" — умовна мапа, що збігається в порядку ключів (types першим) і ІНКАПСУЛЮЄ: будь-який неперелічений підшлях заблоковано. "imports" (# ключі) робить те саме для внутрішніх аліасів.',
    },
    {
      en: 'tsconfig paths is a compiler-only alias — it does NOT rewrite the emit, so an unmapped path type-checks then crashes at runtime. Never point paths at node_modules packages.',
      uk: 'tsconfig paths — аліас лише для компілятора: він НЕ переписує emit, тож незмаплений шлях проходить перевірку й потім падає в runtime. Ніколи не спрямовуйте paths на пакети з node_modules.',
    },
    {
      en: 'Project references: composite:true emits .d.ts + .tsbuildinfo; tsc -b builds leaf-first and skips unchanged projects (incremental monorepo builds); declarationMap enables cross-project Go to Definition.',
      uk: 'Project references: composite:true емітує .d.ts + .tsbuildinfo; tsc -b збирає від листків і пропускає незмінні проєкти (інкрементні monorepo-збірки); declarationMap уможливлює міжпроєктний Go to Definition.',
    },
  ],

  pitfalls: [
    {
      title: { en: 'Writing ".ts" (or no extension) in a nodenext ESM import', uk: 'Писати «.ts» (чи без розширення) в nodenext ESM-імпорті' },
      body: {
        en: 'Under nodenext in an ESM file, a relative import must carry the runtime .js extension (import "./x.js"), and the compiler substitutes back to x.ts. Writing "./x" (extensionless) or "./x.ts" is an error without allowImportingTsExtensions/rewriteRelativeImportExtensions. The specifier targets the runtime, not the source file.',
        uk: 'Під nodenext в ESM-файлі відносний імпорт має нести runtime-розширення .js (import "./x.js"), а компілятор підставляє назад x.ts. Писати "./x" (без розширення) чи "./x.ts" — помилка без allowImportingTsExtensions/rewriteRelativeImportExtensions. Специфікатор націлений на runtime, а не на файл-джерело.',
      },
    },
    {
      title: { en: 'Using node10 (or "node") for a modern package', uk: 'Використання node10 (чи «node») для сучасного пакета' },
      body: {
        en: 'node10 does not read package.json "exports", so it can resolve to a file the runtime will refuse to load, or fail to find one the runtime would. If Node runs your code, use nodenext; if a bundler does, use bundler. node10 is only for legacy CJS-only setups.',
        uk: 'node10 не читає package.json "exports", тож може розвʼязатися у файл, який runtime відмовиться завантажити, або не знайти той, що runtime знайшов би. Якщо Node виконує ваш код — nodenext; якщо bundler — bundler. node10 лише для legacy CJS-конфігурацій.',
      },
    },
    {
      title: { en: 'Pointing tsconfig paths at real packages', uk: 'Спрямування tsconfig paths на реальні пакети' },
      body: {
        en: 'paths is a compiler alias that does not change emit and bypasses "exports". Aliasing a node_modules package via paths makes the type-checker resolve one file while the runtime loads another. Reserve paths for build-tool aliases the bundler/loader also remaps, and let node_modules resolve normally.',
        uk: 'paths — аліас компілятора, що не змінює emit і обходить "exports". Аліасинг node_modules-пакета через paths змушує type-checker резолвити один файл, тоді як runtime завантажує інший. Лишіть paths для аліасів інструмента збірки, які bundler/loader теж ремапить, а node_modules нехай резолвиться нормально.',
      },
    },
    {
      title: { en: 'Expecting tsc -b without composite', uk: 'Очікувати tsc -b без composite' },
      body: {
        en: 'A referenced project must set composite:true or the reference build fails — composite is what makes it emit the .d.ts + .tsbuildinfo the graph depends on. Forgetting it (or declaration) is the usual first error when adopting project references.',
        uk: 'Проєкт, на який посилаються, має мати composite:true, інакше reference-збірка падає — саме composite змушує його емітувати .d.ts + .tsbuildinfo, від яких залежить граф. Забути це (чи declaration) — звична перша помилка при впровадженні project references.',
      },
    },
  ],

  interview: [
    {
      q: { en: 'Your import type-checks in the editor but Node throws "cannot find module" at runtime. How do you reason about it?', uk: 'Ваш імпорт проходить перевірку в редакторі, але Node кидає «cannot find module» у runtime. Як міркуєте?' },
      a: {
        en: 'The compiler and the runtime disagreed on resolution. First I check moduleResolution matches how the code runs — nodenext if Node loads the emitted .js, bundler only if a bundler does. Then the usual culprits: a relative ESM import missing its .js extension (TS may resolve x.ts while Node needs x.js), a paths alias that type-checks but was never remapped in emit, or a package with "exports" that blocks the subpath I imported. The tracer\'s mental model — the compiler must retrace the runtime\'s exact path — points straight at where they diverged.',
        uk: 'Компілятор і runtime розійшлися в resolution. Спершу перевіряю, що moduleResolution відповідає тому, як код виконується — nodenext, якщо Node завантажує емітований .js, bundler лише якщо це робить bundler. Тоді звичні винуватці: відносний ESM-імпорт без розширення .js (TS може розвʼязати x.ts, тоді як Node потребує x.js), аліас paths, що проходить перевірку, але не був ремаплений в emit, або пакет з "exports", що блокує підшлях, який я імпортував. Ментальна модель трасера — компілятор має повторити точний шлях runtime — вказує прямо на місце розходження.',
      },
      level: 'senior',
    },
    {
      q: { en: 'Why can you import "./x.js" from a file called x.ts — and when is that required?', uk: 'Чому можна імпортувати «./x.js» з файлу x.ts — і коли це обовʼязково?' },
      a: {
        en: 'Because of extension substitution: for any would-be .js lookup, TypeScript first tries the analogous .ts/.tsx/.d.ts and reads that, so ./x.js resolves to x.ts. The specifier is written for the runtime, which will load the emitted x.js. It becomes required under nodenext inside an ESM file, because Node\'s ESM loader mandates explicit extensions on relative imports — extensionless and directory-index imports are errors there. Under bundler, node10 or CommonJS the extension is optional.',
        uk: 'Через extension substitution: для будь-якого потенційного пошуку .js TypeScript спершу пробує аналогічний .ts/.tsx/.d.ts і читає його, тож ./x.js резолвиться в x.ts. Специфікатор написаний для runtime, який завантажить емітований x.js. Він стає обовʼязковим під nodenext в ESM-файлі, бо ESM-завантажувач Node вимагає явних розширень на відносних імпортах — без розширення й директорний index там помилки. Під bundler, node10 чи CommonJS розширення необовʼязкове.',
      },
      level: 'senior',
    },
    {
      q: { en: 'How does package.json "exports" resolution pick a file, and what does its presence change?', uk: 'Як resolution через package.json "exports" обирає файл і що змінює його наявність?' },
      a: {
        en: 'For a subpath, "exports" gives a conditional object; the resolver walks its keys in order and takes the first condition in the active set — types and default always eligible, plus node and import or require depending on how the file will load. Authors put "types" first so the compiler finds the .d.ts before the import/require target. Its presence also encapsulates the package: any subpath not listed (or matched by a pattern) is blocked, even if the file exists — so consumers cannot import internal paths. That is both a correctness rule and an API boundary you design when publishing.',
        uk: 'Для підшляху "exports" дає умовний обʼєкт; резолвер іде по його ключах по черзі й бере першу умову з активного набору — types і default завжди прийнятні, плюс node та import чи require залежно від того, як файл завантажиться. Автори ставлять "types" першим, щоб компілятор знайшов .d.ts до цілі import/require. Його наявність також інкапсулює пакет: будь-який підшлях, якого немає в списку (чи не збігається з патерном), заблоковано, навіть якщо файл існує — тож споживачі не можуть імпортувати внутрішні шляхи. Це і правило коректності, і межа API, яку ви проєктуєте при публікації.',
      },
      level: 'staff',
    },
    {
      q: { en: 'A monorepo type-check takes minutes in CI. How do project references help?', uk: 'Перевірка типів monorepo займає хвилини в CI. Як допомагають project references?' },
      a: {
        en: 'They split the one big program into a graph of composite projects. Each composite project emits .d.ts plus a .tsbuildinfo fingerprint of its inputs; downstream projects consume the .d.ts instead of re-checking source. tsc -b then builds leaf-first in dependency order and skips any project whose inputs are unchanged, reading .tsbuildinfo — so an incremental CI run only rechecks what actually changed. declarationMap keeps editor navigation jumping to source across boundaries. It is the same publish-a-package-with-types model (Module 13) applied inside the repo, and it is the standard fix for slow monorepo builds.',
        uk: 'Вони розбивають одну велику програму на граф composite-проєктів. Кожен composite-проєкт емітує .d.ts плюс .tsbuildinfo — відбиток входів; нижчі проєкти споживають .d.ts замість повторної перевірки джерела. tsc -b тоді збирає від листків у порядку залежностей і пропускає будь-який проєкт, чиї входи незмінні, читаючи .tsbuildinfo — тож інкрементний CI-запуск перевіряє лише те, що справді змінилося. declarationMap лишає навігацію редактора зі стрибком до джерела через межі. Це та сама модель «публікуй пакет із типами» (Модуль 13), застосована всередині репозиторію, і це стандартне виправлення повільних monorepo-збірок.',
      },
      level: 'staff',
    },
  ],

  seeAlso: ['m11-tsconfig-strictness', 'm6-mapped-template-literals', 'm13-declaration-files', 'm8-decorators-metadata'],

  sources: [
    { title: 'TSConfig Reference — moduleResolution', url: 'https://www.typescriptlang.org/tsconfig/moduleResolution.html' },
    { title: 'Handbook — Modules: Reference (resolution algorithms, extension substitution, exports)', url: 'https://www.typescriptlang.org/docs/handbook/modules/reference.html' },
    { title: 'Handbook — Modules: Theory & choosing compiler options', url: 'https://www.typescriptlang.org/docs/handbook/modules/theory.html' },
    { title: 'Handbook — Project References', url: 'https://www.typescriptlang.org/docs/handbook/project-references.html' },
    { title: 'Release Notes — TypeScript 5.0 (bundler resolution, allowImportingTsExtensions, node → node10)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html' },
    { title: 'Release Notes — TypeScript 5.7 (rewriteRelativeImportExtensions)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-7.html' },
    { title: 'Node.js — Packages: "exports" & conditional exports', url: 'https://nodejs.org/api/packages.html' },
  ],
};
