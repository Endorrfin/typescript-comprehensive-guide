import type { Module } from '../types';

/*
 * ★ SIGNATURE MODULE (S8) — tsconfig & the Strictness Model. Section IV opener.
 * Thesis: tsconfig is a contract with the compiler, and `"strict": true` is not one switch but a
 * FAMILY of nine flags — while a few equally valuable checks live deliberately OUTSIDE it, so "strict"
 * is not the same as "as strict as possible". Signature sim: 'tsconfig-strictness' (step a code sample
 * and watch each strict flag surface its real diagnostic). Figure: 'strict-family'.
 * Version-sensitive facts web-verified (see sources): the nine members of `strict` and their versions;
 * strictBuiltinIteratorReturn joined `strict` in 5.6; noUncheckedIndexedAccess (4.1) &
 * exactOptionalPropertyTypes (4.4) are recommended but NOT in `strict`; verbatimModuleSyntax (5.0);
 * isolatedDeclarations (5.5); moduleDetection (4.7); module "preserve" (5.4). Current: TS 6.0 stable
 * (JS-based), TS 7.0 the Go-native port ("tsgo", RC Jun 2026) with identical checking semantics.
 */
export const m11: Module = {
  id: 'm11-tsconfig-strictness',
  num: 11,
  section: 's4-compiler',
  order: 1,
  level: 'senior',
  signature: true,
  title: { en: 'tsconfig & the Strictness Model', uk: 'tsconfig та модель strictness' },
  tagline: {
    en: 'What each strict flag actually buys you, why "strict" is nine checks not one, and how target/lib/module shape the emit.',
    uk: 'Що насправді дає кожен strict-флаг, чому «strict» — це девʼ ять перевірок, а не одна, і як target/lib/module формують emit.',
  },
  readMins: 18,
  mentalModel: {
    en: 'tsconfig is a contract with the compiler. "strict" is not a dial you turn to 100% — it is a bundle of nine independent checks, and a few of the most valuable checks are not even in the bundle.',
    uk: 'tsconfig — це контракт із компілятором. «strict» — не регулятор, який ви викручуєте на 100%: це набір із девʼяти незалежних перевірок, і кілька найцінніших перевірок узагалі не входять до нього.',
  },

  topics: [
    // ── Topic 1 ───────────────────────────────────────────────────────────────
    {
      id: 't1-contract',
      title: { en: 'tsconfig is a contract with the compiler', uk: 'tsconfig — це контракт із компілятором' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "A `tsconfig.json` is the single place that answers three questions for every file the compiler sees: **which files** are part of the program (`include`/`exclude`/`files`), **how strictly** to check them (the `strict` family and its neighbours), and **what to emit** (`target`, `module`, `outDir`, declaration files). Everything else — your editor's red squiggles, `tsc --noEmit` in CI, esbuild's transpile, `ts-node`/`tsx` — reads that one contract. The senior habit is to treat it as **code you own**, not boilerplate you copy: `extends` a shared base (e.g. `@tsconfig/node22` or `@tsconfig/strictest`) and override only what your project needs, so the intent is legible in the diff. A project reference build (`tsc -b`, Module 12) then composes several of these contracts into one graph.",
            uk: "`tsconfig.json` — це єдине місце, що відповідає на три питання для кожного файлу, який бачить компілятор: **які файли** входять до програми (`include`/`exclude`/`files`), **наскільки суворо** їх перевіряти (родина `strict` та її сусіди) і **що емітити** (`target`, `module`, `outDir`, declaration files). Усе інше — червоні підкреслення в редакторі, `tsc --noEmit` у CI, транспіляція esbuild, `ts-node`/`tsx` — читає цей один контракт. Senior-звичка — ставитися до нього як до **коду, яким ви володієте**, а не до boilerplate, який копіюють: `extends` спільної бази (напр. `@tsconfig/node22` чи `@tsconfig/strictest`) і перевизначення лише того, що потрібно проєкту, щоб намір читався в diff. Збірка з project references (`tsc -b`, Модуль 12) далі композує кілька таких контрактів в один граф.",
          },
        },
        {
          kind: 'code',
          lang: 'json',
          code: `// tsconfig.json — a modern Node 22 service (NestJS-style)
{
  "compilerOptions": {
    "target": "ES2023",          // emit modern JS — Node 22 runs it natively
    "lib": ["ES2023"],           // available APIs — no DOM, this is a server
    "module": "NodeNext",        // emit ESM or CJS per package.json "type"
    "moduleResolution": "NodeNext",
    "strict": true,              // the nine-flag family (Topic 2)
    "noUncheckedIndexedAccess": true,   // NOT in strict — add it (Topic 3)
    "verbatimModuleSyntax": true,       // 1:1 import emit (Topic 5)
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}`,
          note: {
            en: 'Read top-to-bottom this is a contract: check src with these rules, emit ES2023 modules to dist. Nothing here is magic — every line is a decision.',
            uk: 'Згори донизу це контракт: перевіряй src за цими правилами, емітуй ES2023-модулі в dist. Тут немає магії — кожен рядок є рішенням.',
          },
        },
        {
          kind: 'callout',
          tone: 'senior',
          title: { en: 'Extend a base; override with intent', uk: 'Розширюйте базу; перевизначайте усвідомлено' },
          md: {
            en: "The community `@tsconfig/*` bases (`node22`, `strictest`) encode the current best defaults so you do not hand-maintain twenty flags. `extends` one and let your own file contain only the deltas that are genuinely project-specific (`outDir`, `paths`, a check you consciously relax). A reviewer should be able to read your `tsconfig` and see *what you decided*, not wade through defaults.",
            uk: "Спільнотні бази `@tsconfig/*` (`node22`, `strictest`) кодують поточні найкращі дефолти, тож вам не треба вручну підтримувати двадцять флагів. `extends` однієї з них — і нехай ваш файл містить лише справді проєктно-специфічні дельти (`outDir`, `paths`, свідомо послаблена перевірка). Рецензент має прочитати ваш `tsconfig` і побачити *що ви вирішили*, а не продиратися крізь дефолти.",
          },
        },
      ],
    },
    // ── Topic 2 ───────────────────────────────────────────────────────────────
    {
      id: 't2-strict-family',
      title: { en: '"strict" is a family of nine flags', uk: '«strict» — це родина з девʼяти флагів' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "`\"strict\": true` is a shorthand that turns on **nine** independent checks; you can turn any of them back off individually. Knowing the members matters because when a codebase says \"we use strict\" and you still see `any` leaking or `null` crashes, the fix is usually a specific flag, not a vague \"be stricter\". The nine: **noImplicitAny** (no silent `any`), **strictNullChecks** (`null`/`undefined` leave every other type — the biggest one), **strictFunctionTypes** (contravariant parameter checking for function types, Module 3), **strictBindCallApply** (typed `bind`/`call`/`apply`), **strictPropertyInitialization** (class fields must be initialized), **noImplicitThis** (no `any` `this`), **useUnknownInCatchVariables** (a `catch` binding is `unknown`, 4.4), **alwaysStrict** (emit `\"use strict\"`), and **strictBuiltinIteratorReturn** (built-in iterators' `TReturn` is `undefined`, added to the family in 5.6). Step the explorer to watch each one catch a real bug on real code.",
            uk: "`\"strict\": true` — це скорочення, що вмикає **девʼ ять** незалежних перевірок; кожну можна вимкнути окремо. Знати склад важливо, бо коли кодова база каже «ми використовуємо strict», а ви все ще бачите витік `any` чи падіння на `null`, виправлення — це зазвичай конкретний флаг, а не розпливчасте «будь суворішим». Девʼ ять: **noImplicitAny** (без тихого `any`), **strictNullChecks** (`null`/`undefined` виходять з усіх інших типів — найбільший), **strictFunctionTypes** (контраваріантна перевірка параметрів функційних типів, Модуль 3), **strictBindCallApply** (типізовані `bind`/`call`/`apply`), **strictPropertyInitialization** (поля класу мають бути ініціалізовані), **noImplicitThis** (без `any` `this`), **useUnknownInCatchVariables** (змінна `catch` — `unknown`, 4.4), **alwaysStrict** (емітувати `\"use strict\"`) і **strictBuiltinIteratorReturn** (`TReturn` вбудованих ітераторів — `undefined`, додано до родини в 5.6). Проженіть explorer, щоб побачити, як кожен ловить реальний баг на реальному коді.",
          },
        },
        {
          kind: 'figure',
          fig: 'strict-family',
          caption: {
            en: 'One switch, nine checks — and two more (dimmed) that are recommended but not part of strict.',
            uk: 'Один перемикач, девʼ ять перевірок — і ще два (тьмяні), що рекомендовані, але не входять до strict.',
          },
        },
        {
          kind: 'sim',
          sim: 'tsconfig-strictness',
          caption: {
            en: 'Pick a code sample, then step the strict family one diagnostic at a time — each lights the offending line and shows the real TSxxxx error the flag raises.',
            uk: 'Оберіть приклад коду й покроково пройдіть родину strict по одній діагностиці — кожна підсвічує проблемний рядок і показує справжню помилку TSxxxx, яку піднімає флаг.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Flag', uk: 'Флаг' },
            { en: 'Since', uk: 'З версії' },
            { en: 'Catches', uk: 'Ловить' },
          ],
          rows: [
            [{ en: 'noImplicitAny', uk: 'noImplicitAny' }, { en: '2.0', uk: '2.0' }, { en: 'An un-annotated, un-inferrable value silently becoming any', uk: "Неанотоване значення без виводу, що тихо стає any" }],
            [{ en: 'strictNullChecks', uk: 'strictNullChecks' }, { en: '2.0', uk: '2.0' }, { en: 'Using a value before handling null / undefined', uk: 'Використання значення до обробки null / undefined' }],
            [{ en: 'strictFunctionTypes', uk: 'strictFunctionTypes' }, { en: '2.6', uk: '2.6' }, { en: 'Unsafe function-parameter variance (methods stay bivariant)', uk: 'Небезпечна варіантність параметрів функцій (методи лишаються біваріантними)' }],
            [{ en: 'strictBindCallApply', uk: 'strictBindCallApply' }, { en: '3.2', uk: '3.2' }, { en: 'Wrong this/args passed through bind/call/apply', uk: 'Неправильні this/args через bind/call/apply' }],
            [{ en: 'strictPropertyInitialization', uk: 'strictPropertyInitialization' }, { en: '2.7', uk: '2.7' }, { en: 'A class field never assigned a value', uk: 'Поле класу, якому ніколи не присвоєно значення' }],
            [{ en: 'noImplicitThis', uk: 'noImplicitThis' }, { en: '2.0', uk: '2.0' }, { en: 'this used with an implicit any type', uk: 'this з неявним типом any' }],
            [{ en: 'useUnknownInCatchVariables', uk: 'useUnknownInCatchVariables' }, { en: '4.4', uk: '4.4' }, { en: 'Treating a caught error as any instead of unknown', uk: 'Розгляд спійманої помилки як any замість unknown' }],
            [{ en: 'alwaysStrict', uk: 'alwaysStrict' }, { en: '2.1', uk: '2.1' }, { en: 'Non-strict-mode constructs; emits "use strict"', uk: 'Конструкції поза strict-режимом; емітує "use strict"' }],
            [{ en: 'strictBuiltinIteratorReturn', uk: 'strictBuiltinIteratorReturn' }, { en: '5.6', uk: '5.6' }, { en: "Built-in iterators typing TReturn as any instead of undefined", uk: 'Вбудовані ітератори типізують TReturn як any замість undefined' }],
          ],
          caption: {
            en: 'The nine members of `strict`. Turn any off individually with `"flag": false` after `"strict": true`.',
            uk: 'Девʼ ять членів `strict`. Вимкніть будь-який окремо через `"flag": false` після `"strict": true`.',
          },
        },
      ],
    },
    // ── Topic 3 ───────────────────────────────────────────────────────────────
    {
      id: 't3-beyond-strict',
      title: { en: 'strict ≠ maximally strict', uk: 'strict ≠ максимально суворо' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "The trap that catches most teams: `\"strict\": true` is **not** \"as safe as TypeScript can be\". Several of the highest-value checks are deliberately left out because they change the ergonomics of existing code too much to be a safe default. The two you should almost always add: **noUncheckedIndexedAccess** (4.1) makes `arr[i]` and `obj[key]` return `T | undefined`, because an index access can miss — this closes a hole `strictNullChecks` alone leaves wide open; and **exactOptionalPropertyTypes** (4.4) stops you assigning `undefined` to an optional property, so \"the key is absent\" and \"the key is present and undefined\" stay distinct. Also worth adding: **noImplicitOverride** (4.3), **noPropertyAccessFromIndexSignature** (4.2), and the non-`strict` lint-ish flags `noUnusedLocals`/`noUnusedParameters`. Step the sim's \"Config\" sample: it fires **only** beyond-strict flags — proof that a codebase can be `strict` and still ship these bugs.",
            uk: "Пастка, що ловить більшість команд: `\"strict\": true` — це **не** «настільки безпечно, наскільки може TypeScript». Кілька найцінніших перевірок свідомо не входять, бо надто змінюють ергономіку наявного коду, щоб бути безпечним дефолтом. Дві, які варто майже завжди додавати: **noUncheckedIndexedAccess** (4.1) робить `arr[i]` та `obj[key]` типом `T | undefined`, бо доступ за індексом може не влучити — це закриває діру, яку сам `strictNullChecks` лишає відкритою; і **exactOptionalPropertyTypes** (4.4) забороняє присвоювати `undefined` необовʼязковій властивості, тож «ключ відсутній» і «ключ присутній і undefined» лишаються різними. Також варто: **noImplicitOverride** (4.3), **noPropertyAccessFromIndexSignature** (4.2) та не-`strict` lint-флаги `noUnusedLocals`/`noUnusedParameters`. Проженіть приклад «Config» у симуляції: він тригерить **лише** beyond-strict флаги — доказ, що база може бути `strict` і все одно постачати ці баги.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// "strict": true is ON here — and both of these still compile clean without the add-ons:
const env: Record<string, string> = {};
env["DB_HOST"].toUpperCase();
//  ^ strict alone: string (looks safe). noUncheckedIndexedAccess: string | undefined → error ✅

type Options = { debug?: boolean };
const o: Options = { debug: undefined };
//  ^ strict alone: fine. exactOptionalPropertyTypes: undefined ≠ "absent" → error ✅`,
          note: {
            en: 'Both bugs are invisible under plain `strict`. "We use strict" is necessary, not sufficient — the checklist has more boxes.',
            uk: 'Обидва баги невидимі під звичайним `strict`. «Ми використовуємо strict» — необхідно, але недостатньо: у чеклісті більше пунктів.',
          },
        },
        {
          kind: 'compare',
          a: { en: '`strict: true` only', uk: 'Лише `strict: true`' },
          b: { en: '`strict` + the add-ons', uk: '`strict` + доповнення' },
          rows: [
            [
              { en: 'Index access `arr[i]`', uk: 'Доступ за індексом `arr[i]`' },
              { en: 'Typed `T` — can be undefined at runtime', uk: 'Тип `T` — у runtime може бути undefined' },
              { en: '`T | undefined` — you must check (noUncheckedIndexedAccess)', uk: '`T | undefined` — треба перевірити (noUncheckedIndexedAccess)' },
            ],
            [
              { en: 'Optional prop set to `undefined`', uk: 'Необовʼязкова властивість = `undefined`' },
              { en: 'Allowed — absent and undefined blur', uk: 'Дозволено — відсутнє й undefined змішуються' },
              { en: 'Rejected — they stay distinct (exactOptionalPropertyTypes)', uk: 'Відхилено — лишаються різними (exactOptionalPropertyTypes)' },
            ],
            [
              { en: 'Overriding a base method', uk: 'Перевизначення методу бази' },
              { en: 'Silent — a rename in the base breaks quietly', uk: 'Тихо — перейменування в базі ламає непомітно' },
              { en: '`override` keyword required (noImplicitOverride)', uk: 'Потрібне ключове слово `override` (noImplicitOverride)' },
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: { en: 'Adopt strictness incrementally', uk: 'Впроваджуйте strictness поступово' },
          md: {
            en: "On a large legacy codebase, do not flip every flag at once. Turn on `strict` (or one member) and fix the fallout, commit, then add the next flag. `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` in particular can surface hundreds of real edge cases — land them as their own reviewable steps, not buried in a feature PR.",
            uk: "На великій legacy-базі не вмикайте всі флаги одразу. Увімкніть `strict` (чи один член), виправте наслідки, закомітьте, тоді додайте наступний флаг. Особливо `noUncheckedIndexedAccess` та `exactOptionalPropertyTypes` можуть виявити сотні реальних крайніх випадків — вносьте їх окремими рецензованими кроками, а не сховавши у feature-PR.",
          },
        },
      ],
    },
    // ── Topic 4 ───────────────────────────────────────────────────────────────
    {
      id: 't4-target-lib-module',
      title: { en: 'target, lib & module — three independent axes', uk: 'target, lib і module — три незалежні осі' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "Three options that beginners conflate but that answer different questions. **`target`** sets the **JavaScript syntax level** of the emit: `ES2023` emits modern syntax; a lower target *down-levels* (e.g. `async/await` → generators), which can add helper code and hurt performance. **`lib`** declares which **runtime APIs** the type-checker believes exist — `[\"ES2023\"]` for a Node service (no `DOM`), `[\"ES2023\", \"DOM\"]` for a browser app; `lib` defaults from `target` but is independent, so you can promise a modern API surface while emitting older syntax, or vice-versa. **`module`** chooses the **output module format** (`NodeNext`, `ESNext`, `CommonJS`, `preserve`), and it is coupled to `moduleResolution` (Module 12). The rule of thumb: pick `target`/`lib` from *where the code runs* (Node 22 → `ES2023`), and `module`/`moduleResolution` from *how it is loaded*.",
            uk: "Три опції, які новачки плутають, але які відповідають на різні питання. **`target`** задає **рівень синтаксису JavaScript** для emit: `ES2023` емітує сучасний синтаксис; нижчий target *знижує рівень* (напр. `async/await` → генератори), що може додати helper-код і зашкодити продуктивності. **`lib`** оголошує, які **runtime-API** checker вважає наявними — `[\"ES2023\"]` для Node-сервісу (без `DOM`), `[\"ES2023\", \"DOM\"]` для браузерного застосунку; `lib` дефолтиться з `target`, але незалежний, тож ви можете обіцяти сучасний набір API, емітуючи старіший синтаксис, і навпаки. **`module`** обирає **формат вихідного модуля** (`NodeNext`, `ESNext`, `CommonJS`, `preserve`) і повʼязаний із `moduleResolution` (Модуль 12). Емпіричне правило: обирайте `target`/`lib` з того, *де виконується код* (Node 22 → `ES2023`), а `module`/`moduleResolution` — з того, *як він завантажується*.",
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Option', uk: 'Опція' },
            { en: 'Answers', uk: 'Відповідає на' },
            { en: 'Node 22 service', uk: 'Node 22 сервіс' },
          ],
          rows: [
            [{ en: 'target', uk: 'target' }, { en: 'What JS syntax do I emit?', uk: 'Який JS-синтаксис я емітую?' }, { en: 'ES2023', uk: 'ES2023' }],
            [{ en: 'lib', uk: 'lib' }, { en: 'What runtime APIs exist?', uk: 'Які runtime-API існують?' }, { en: '["ES2023"] (no DOM)', uk: '["ES2023"] (без DOM)' }],
            [{ en: 'module', uk: 'module' }, { en: 'What module format do I output?', uk: 'Який формат модулів я виводжу?' }, { en: 'NodeNext', uk: 'NodeNext' }],
            [{ en: 'moduleResolution', uk: 'moduleResolution' }, { en: 'How do I find imported files?', uk: 'Як я знаходжу імпортовані файли?' }, { en: 'NodeNext (Module 12)', uk: 'NodeNext (Модуль 12)' }],
          ],
          caption: {
            en: 'Four options, four different questions. `target`/`lib` follow the runtime; `module`/`moduleResolution` follow the loader.',
            uk: 'Чотири опції, чотири різні питання. `target`/`lib` слідують за runtime; `module`/`moduleResolution` — за завантажувачем.',
          },
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: { en: 'target too low, or lib mismatched', uk: 'target занизький або lib не збігається' },
          md: {
            en: "Two classic misconfigurations: a `target` far below your runtime (e.g. `ES2017` on Node 22) makes `tsc` down-level modern syntax into slower helper code you did not need — match the target to the runtime. And a `lib` that over-promises (`DOM` in a Node service) lets you call `document`/`localStorage` that crash at runtime; a `lib` that under-promises makes real APIs look like errors. `lib` is a promise about the environment — keep it honest.",
            uk: "Дві класичні помилки конфігурації: `target` набагато нижчий за runtime (напр. `ES2017` на Node 22) змушує `tsc` знижувати сучасний синтаксис до повільнішого helper-коду, який вам не потрібен — узгоджуйте target із runtime. А `lib`, що обіцяє забагато (`DOM` у Node-сервісі), дозволяє викликати `document`/`localStorage`, які падають у runtime; `lib`, що обіцяє замало, робить реальні API схожими на помилки. `lib` — це обіцянка про середовище: тримайте її чесною.",
          },
        },
      ],
    },
    // ── Topic 5 ───────────────────────────────────────────────────────────────
    {
      id: 't5-emit-flags',
      title: { en: 'Emit & interop: verbatimModuleSyntax, isolated*', uk: 'Emit та interop: verbatimModuleSyntax, isolated*' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "The flags that matter most for a **bundled Node/serverless build** govern how imports are emitted. **verbatimModuleSyntax** (5.0) makes emit **1:1** with your source: an `import` you wrote stays an `import`, and anything used only as a type must be marked `type` (or the whole import must be `import type`) — otherwise it is an error. It replaced the confusing pair `importsNotUsedAsValues` + `preserveValueImports`, and it is what keeps a single-file transpiler (esbuild, swc) from wrongly eliding an import with a side effect. **isolatedModules** enforces that every file can be transpiled **alone**, with no cross-file type information — required by esbuild/swc/Babel and by `tsx`, which is exactly the pipeline a Serverless bundle uses. **isolatedDeclarations** (5.5) goes further: it requires explicit types on every export so `.d.ts` files can be generated **without the type-checker**, enabling fast parallel declaration builds across a monorepo (Module 12). One more you meet through Module 8: decorators for NestJS/Angular still need `experimentalDecorators` + `emitDecoratorMetadata` in tsconfig.",
            uk: "Флаги, що найбільше важать для **бандленої Node/serverless-збірки**, керують тим, як емітуються імпорти. **verbatimModuleSyntax** (5.0) робить emit **1:1** із джерелом: написаний `import` лишається `import`, а все, що використано лише як тип, має бути позначене `type` (або весь імпорт — `import type`) — інакше помилка. Він замінив заплутану пару `importsNotUsedAsValues` + `preserveValueImports` і саме він не дає однофайловому транспілеру (esbuild, swc) помилково викинути імпорт із побічним ефектом. **isolatedModules** вимагає, щоб кожен файл транспілювався **окремо**, без міжфайлової типової інформації — потрібно для esbuild/swc/Babel і для `tsx`, а це саме той конвеєр, який використовує Serverless-бандл. **isolatedDeclarations** (5.5) іде далі: вимагає явних типів на кожному export, щоб `.d.ts` генерувалися **без type-checker**, уможливлюючи швидкі паралельні declaration-збірки в monorepo (Модуль 12). Ще один, який ви зустрічаєте через Модуль 8: декоратори для NestJS/Angular усе ще потребують `experimentalDecorators` + `emitDecoratorMetadata` у tsconfig.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// verbatimModuleSyntax: emit matches your source exactly — mark type-only imports.
import { type User, createUser } from './user';
//       ^^^^ erased at emit         ^^^^^^^^^^ kept (a value)
import type { Config } from './config';   // whole import erased

// Error under verbatimModuleSyntax — 'Logger' is used only as a type here:
import { Logger } from './logger';        // ✗  TS1484: 'Logger' is a type and must be imported using a type-only import
let log: Logger;`,
          note: {
            en: 'This is what lets esbuild/swc transpile each file alone without guessing which imports are types — the emit is unambiguous.',
            uk: 'Саме це дозволяє esbuild/swc транспілювати кожен файл окремо, не вгадуючи, які імпорти є типами — emit однозначний.',
          },
        },
        {
          kind: 'callout',
          tone: 'senior',
          title: { en: 'The build tool is not the type-checker', uk: 'Інструмент збірки — не type-checker' },
          md: {
            en: "In a Serverless/NestJS bundle, esbuild or swc does the emit and does **no type-checking** — it transpiles file-by-file. `isolatedModules` + `verbatimModuleSyntax` make your code safe for that model, and you run `tsc --noEmit` separately (in CI) as the actual type gate. Treat them as two jobs: the bundler ships fast JS; `tsc` guards correctness.",
            uk: "У Serverless/NestJS-бандлі esbuild чи swc виконує emit і **не робить type-checking** — транспілює файл за файлом. `isolatedModules` + `verbatimModuleSyntax` роблять ваш код безпечним для цієї моделі, а `tsc --noEmit` ви запускаєте окремо (у CI) як справжній типовий шлюз. Сприймайте це як дві задачі: бандлер швидко постачає JS; `tsc` стереже коректність.",
          },
        },
        {
          kind: 'callout',
          tone: 'security',
          title: { en: 'Strictness is a security control', uk: 'Strictness — це засіб безпеки' },
          md: {
            en: "`strictNullChecks` + `noUncheckedIndexedAccess` turn \"I assumed this field was there\" from a production `TypeError` (or an `undefined` flowing into a query) into a compile error. Strict flags do not validate untrusted input — that is the boundary's job (Module 9) — but they remove a whole class of latent `undefined`/`any` bugs before code ever runs, which is why raising strictness is one of the cheapest reliability wins on a legacy codebase.",
            uk: "`strictNullChecks` + `noUncheckedIndexedAccess` перетворюють «я думав, це поле є» з production-`TypeError` (чи `undefined`, що тече в запит) на помилку компіляції. Strict-флаги не валідують недовірений вхід — це робота межі (Модуль 9) — але вони прибирають цілий клас прихованих `undefined`/`any` багів ще до запуску коду, тому підвищення strictness — один із найдешевших виграшів надійності на legacy-базі.",
          },
        },
      ],
    },
  ],

  keyPoints: [
    {
      en: 'tsconfig is a contract: which files, how strictly to check, what to emit. Extend a shared base and override only project-specific deltas.',
      uk: 'tsconfig — це контракт: які файли, наскільки суворо перевіряти, що емітити. Розширюйте спільну базу й перевизначайте лише проєктні дельти.',
    },
    {
      en: '"strict": true enables NINE independent flags (noImplicitAny, strictNullChecks, strictFunctionTypes, strictBindCallApply, strictPropertyInitialization, noImplicitThis, useUnknownInCatchVariables, alwaysStrict, strictBuiltinIteratorReturn). You can disable any individually.',
      uk: '«strict»: true вмикає ДЕВʼ ЯТЬ незалежних флагів (noImplicitAny, strictNullChecks, strictFunctionTypes, strictBindCallApply, strictPropertyInitialization, noImplicitThis, useUnknownInCatchVariables, alwaysStrict, strictBuiltinIteratorReturn). Кожен можна вимкнути окремо.',
    },
    {
      en: 'strict is NOT maximal: noUncheckedIndexedAccess (4.1) and exactOptionalPropertyTypes (4.4) are among the most valuable checks and are deliberately excluded — add them.',
      uk: 'strict — НЕ максимум: noUncheckedIndexedAccess (4.1) та exactOptionalPropertyTypes (4.4) — серед найцінніших перевірок і свідомо не входять — додайте їх.',
    },
    {
      en: 'target = emitted JS syntax; lib = available runtime APIs; module = output module format. Pick target/lib from the runtime, module/moduleResolution from the loader.',
      uk: 'target = синтаксис емітованого JS; lib = наявні runtime-API; module = формат вихідних модулів. target/lib — з runtime, module/moduleResolution — із завантажувача.',
    },
    {
      en: 'verbatimModuleSyntax (5.0) makes emit 1:1 and requires type-only imports; isolatedModules guarantees single-file transpile (esbuild/swc); isolatedDeclarations (5.5) enables checker-free .d.ts builds.',
      uk: 'verbatimModuleSyntax (5.0) робить emit 1:1 і вимагає type-only імпортів; isolatedModules гарантує однофайлову транспіляцію (esbuild/swc); isolatedDeclarations (5.5) уможливлює .d.ts-збірки без checker.',
    },
    {
      en: 'TS 6.0 is the current JS-based stable; TS 7.0 is the Go-native port ("tsgo", RC Jun 2026) with identical checking semantics and ~10× faster builds.',
      uk: 'TS 6.0 — поточний стабільний на JS; TS 7.0 — Go-native порт («tsgo», RC черв. 2026) з ідентичною семантикою перевірок і ~10× швидшими збірками.',
    },
  ],

  pitfalls: [
    {
      title: { en: 'Believing "strict" means maximally safe', uk: 'Вважати, що «strict» означає максимально безпечно' },
      body: {
        en: 'strict is nine specific flags, not a global maximum. noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitOverride and others are excluded by design. A codebase can be "strict" and still ship undefined-index and optional-undefined bugs — add the neighbours explicitly.',
        uk: 'strict — це девʼ ять конкретних флагів, а не глобальний максимум. noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitOverride та інші не входять навмисно. База може бути «strict» і все одно постачати баги undefined-індексу та optional-undefined — додавайте сусідів явно.',
      },
    },
    {
      title: { en: 'Setting target far below the runtime', uk: 'Занизький target відносно runtime' },
      body: {
        en: 'A low target (ES2017 on Node 22) down-levels modern syntax into slower helper code for no benefit, and can bloat the bundle (worse cold starts on Lambda). Match target to where the code actually runs.',
        uk: 'Низький target (ES2017 на Node 22) знижує сучасний синтаксис до повільнішого helper-коду без користі й може роздути бандл (гірші cold start на Lambda). Узгоджуйте target із тим, де код реально виконується.',
      },
    },
    {
      title: { en: 'Confusing module with moduleResolution', uk: 'Плутати module з moduleResolution' },
      body: {
        en: 'module is the output format you emit; moduleResolution is how the compiler finds imported files. They are coupled (NodeNext ↔ NodeNext) but answer different questions. Mismatching them is a top source of "cannot find module" and wrong emit (Module 12).',
        uk: 'module — це формат, який ви емітуєте; moduleResolution — як компілятор знаходить імпортовані файли. Вони повʼязані (NodeNext ↔ NodeNext), але відповідають на різні питання. Їх неузгодження — головне джерело «cannot find module» і неправильного emit (Модуль 12).',
      },
    },
    {
      title: { en: 'Relying on the bundler to type-check', uk: 'Покладатися на бандлер для type-check' },
      body: {
        en: 'esbuild/swc transpile without type-checking. Without isolatedModules + verbatimModuleSyntax they can silently drop a type-only import that had a side effect, or misclassify emit. Keep tsc --noEmit as the real type gate in CI, separate from the bundle step.',
        uk: 'esbuild/swc транспілюють без type-check. Без isolatedModules + verbatimModuleSyntax вони можуть тихо викинути type-only імпорт із побічним ефектом чи неправильно класифікувати emit. Тримайте tsc --noEmit як справжній типовий шлюз у CI, окремо від кроку бандлінгу.',
      },
    },
  ],

  interview: [
    {
      q: { en: 'Someone says "we\'re fully strict". What follow-up questions do you ask?', uk: 'Кажуть «у нас повний strict». Які уточнення ви поставите?' },
      a: {
        en: '`"strict": true` is only nine flags, so I\'d ask whether the high-value non-strict checks are on: noUncheckedIndexedAccess (index access can be undefined) and exactOptionalPropertyTypes above all, then noImplicitOverride and noPropertyAccessFromIndexSignature. I\'d also confirm no member of the family has been individually disabled (e.g. `strictNullChecks: false` after `strict: true`), which quietly re-opens the biggest hole. "strict" is necessary but not the whole checklist.',
        uk: '`"strict": true` — це лише девʼ ять флагів, тож я б спитав, чи ввімкнені цінні не-strict перевірки: передусім noUncheckedIndexedAccess (доступ за індексом може бути undefined) та exactOptionalPropertyTypes, потім noImplicitOverride і noPropertyAccessFromIndexSignature. Ще перевірив би, чи не вимкнено окремо якийсь член родини (напр. `strictNullChecks: false` після `strict: true`), що тихо знову відкриває найбільшу діру. «strict» необхідний, але це не весь чекліст.',
      },
      level: 'senior',
    },
    {
      q: { en: 'Explain the difference between target, lib, and module.', uk: 'Поясніть різницю між target, lib і module.' },
      a: {
        en: 'target is the JavaScript syntax level of the emit — a lower target down-levels modern syntax into helpers. lib is the set of runtime APIs the checker assumes exist (ES2023, DOM…); it defaults from target but is independent, so you can adjust the promised API surface. module is the output module format (NodeNext/ESNext/CommonJS/preserve), coupled to moduleResolution. Rule: target and lib follow the runtime; module and moduleResolution follow how the code is loaded.',
        uk: 'target — рівень синтаксису JavaScript в emit; нижчий target знижує сучасний синтаксис у helper-и. lib — набір runtime-API, які checker вважає наявними (ES2023, DOM…); дефолтиться з target, але незалежний, тож можна коригувати обіцяний набір API. module — формат вихідних модулів (NodeNext/ESNext/CommonJS/preserve), повʼязаний із moduleResolution. Правило: target і lib слідують за runtime; module і moduleResolution — за тим, як код завантажується.',
      },
      level: 'senior',
    },
    {
      q: { en: 'What does verbatimModuleSyntax do, and why does a bundled build need it?', uk: 'Що робить verbatimModuleSyntax і чому бандлена збірка його потребує?' },
      a: {
        en: 'It makes emit 1:1 with your source: imports you wrote are emitted as-is, and any import used only as a type must be marked `type` or it errors. It replaced importsNotUsedAsValues + preserveValueImports. A single-file transpiler like esbuild or swc has no cross-file type info, so it cannot know whether `import { X }` is a value or a type; verbatimModuleSyntax makes that explicit in the source, so the transpiler never wrongly elides a side-effecting import or emits a type as a value. It pairs with isolatedModules, which guarantees each file is transpilable alone.',
        uk: 'Він робить emit 1:1 із джерелом: написані імпорти емітуються як є, а будь-який імпорт, використаний лише як тип, має бути позначений `type`, інакше помилка. Замінив importsNotUsedAsValues + preserveValueImports. Однофайловий транспілер на кшталт esbuild чи swc не має міжфайлової типової інформації, тож не знає, чи `import { X }` — значення чи тип; verbatimModuleSyntax робить це явним у джерелі, тож транспілер ніколи помилково не викине імпорт із побічним ефектом і не емітує тип як значення. Працює в парі з isolatedModules, який гарантує, що кожен файл транспілюється окремо.',
      },
      level: 'staff',
    },
    {
      q: { en: 'What is TypeScript 7.0, and does it change how your tsconfig behaves?', uk: 'Що таке TypeScript 7.0 і чи змінює він поведінку вашого tsconfig?' },
      a: {
        en: 'TS 7.0 ("tsgo", Project Corsa) is a native port of the compiler to Go — the same type-checker and emit re-implemented for roughly 10× faster builds and much lower memory, shipped as an RC in June 2026 (6.0 remains the JS-based stable). Crucially it is a port, not a redesign: checking semantics are identical, so the same tsconfig — the same strict flags, the same target/lib/module/moduleResolution — behaves the same way. You mostly gain speed; the contract does not change (programmatic-API consumers wait for 7.1).',
        uk: 'TS 7.0 («tsgo», Project Corsa) — нативний порт компілятора на Go: той самий type-checker та emit, переписані заради ~10× швидших збірок і значно меншої памʼяті, вийшов як RC у червні 2026 (6.0 лишається стабільним на JS). Головне — це порт, а не редизайн: семантика перевірок ідентична, тож той самий tsconfig — ті самі strict-флаги, той самий target/lib/module/moduleResolution — поводиться так само. Ви здебільшого отримуєте швидкість; контракт не змінюється (споживачі програмного API чекають на 7.1).',
      },
      level: 'staff',
    },
  ],

  seeAlso: ['m12-modules-resolution', 'm3-functions-variance', 'm8-decorators-metadata', 'm9-dto-validation'],

  sources: [
    { title: 'TSConfig Reference — strict', url: 'https://www.typescriptlang.org/tsconfig/strict.html' },
    { title: 'TSConfig Reference — all options (target, lib, module, moduleDetection)', url: 'https://www.typescriptlang.org/tsconfig/' },
    { title: 'TSConfig Reference — verbatimModuleSyntax', url: 'https://www.typescriptlang.org/tsconfig/verbatimModuleSyntax.html' },
    { title: 'TSConfig Reference — noUncheckedIndexedAccess', url: 'https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html' },
    { title: 'Release Notes — TypeScript 5.0 (verbatimModuleSyntax, bundler)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html' },
    { title: 'Release Notes — TypeScript 5.5 (isolatedDeclarations)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html' },
    { title: 'Release Notes — TypeScript 5.6 (strictBuiltinIteratorReturn)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-6.html' },
    { title: 'Announcing TypeScript 7.0 Beta (the Go-native compiler)', url: 'https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-beta/' },
  ],
};
