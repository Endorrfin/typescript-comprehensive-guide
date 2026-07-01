import type { Localized } from './types';

/*
 * decide.ts — data for the `#/decide` "which feature / which config" picker (S9 polish).
 * A curated catalog of the real forks a senior/staff TS engineer hits, each option grounded in an
 * authored module (deep-linked). Content is self-contained here; the DecidePage resolves the module
 * number/title + section accent from the light meta index (src/data/meta.ts), so the picker stays out
 * of the heavy concepts chunk. All claims mirror the (web-verified) module bodies they link to.
 */
export type DecideOption = {
  label: Localized;
  when: Localized; // "choose this when…"
  moduleId: string; // deep-link target
  topicId?: string;
};
export type Decision = {
  id: string;
  section: string; // section id → accent (resolved via meta.getSection)
  question: Localized;
  hint: Localized;
  options: DecideOption[];
  bottomLine: Localized; // the heuristic / TL;DR
};

export const decisions: Decision[] = [
  {
    id: 'decorator-system',
    section: 's3-applied',
    question: { en: 'Which decorator system should I use?', uk: 'Яку систему decorators обрати?' },
    hint: {
      en: 'Standard (TC39, TS 5.0) vs legacy (`experimentalDecorators`) — `tsconfig` picks one for the whole compilation.',
      uk: 'Standard (TC39, TS 5.0) проти legacy (`experimentalDecorators`) — `tsconfig` обирає одну на всю компіляцію.',
    },
    options: [
      {
        label: { en: 'Legacy (`experimentalDecorators`)', uk: 'Legacy (`experimentalDecorators`)' },
        when: {
          en: 'You are in NestJS / Angular / TypeORM, or you need a parameter decorator (`@Param()`, `@Inject()`) or `design:paramtypes` for by-type DI. The whole DI ecosystem lives here.',
          uk: 'Ви в NestJS / Angular / TypeORM, або вам потрібен parameter decorator (`@Param()`, `@Inject()`) чи `design:paramtypes` для DI-за-типом. Уся DI-екосистема тут.',
        },
        moduleId: 'm8-decorators-metadata',
      },
      {
        label: { en: 'Standard (TC39, no flag)', uk: 'Standard (TC39, без флага)' },
        when: {
          en: 'You want portable, framework-free behaviour — logging, memoization, bound methods. No flag, no polyfill, and precise `(value, context)` types.',
          uk: 'Вам потрібна портативна, незалежна від фреймворку поведінка — logging, memoization, bound-методи. Без флага, без polyfill, і точні `(value, context)`-типи.',
        },
        moduleId: 'm8-decorators-metadata',
      },
    ],
    bottomLine: {
      en: 'Pick by capability, not recency: if a parameter decorator or design metadata appears in the requirement, the answer is legacy.',
      uk: 'Обирайте за можливістю, не за новизною: якщо у вимозі зʼявляється parameter decorator чи design-metadata — відповідь legacy.',
    },
  },
  {
    id: 'validation-style',
    section: 's3-applied',
    question: { en: 'Schema-first or class-first validation?', uk: 'Валідація schema-first чи class-first?' },
    hint: {
      en: 'Both validate the untrusted boundary; they differ in where the single source of truth lives.',
      uk: 'Обидві валідують недовірену межу; різняться тим, де живе єдине джерело правди.',
    },
    options: [
      {
        label: { en: 'Schema-first (zod)', uk: 'Schema-first (zod)' },
        when: {
          en: 'You want the static type derived from the validator (`z.infer`), framework-agnostic checks, or Standard Schema interop (tRPC/TanStack). Parse, don’t cast.',
          uk: 'Ви хочете статичний тип, виведений із валідатора (`z.infer`), незалежні від фреймворку перевірки чи Standard Schema-interop (tRPC/TanStack). Parse, не cast.',
        },
        moduleId: 'm9-dto-validation',
      },
      {
        label: { en: 'Class-first (class-validator)', uk: 'Class-first (class-validator)' },
        when: {
          en: 'You are in NestJS and want DTO classes that double as DI/Swagger metadata. Enable `whitelist` + `forbidNonWhitelisted` on the `ValidationPipe`.',
          uk: 'Ви в NestJS і хочете DTO-класи, що водночас є DI/Swagger-metadata. Увімкніть `whitelist` + `forbidNonWhitelisted` на `ValidationPipe`.',
        },
        moduleId: 'm9-dto-validation',
      },
    ],
    bottomLine: {
      en: 'In a NestJS app, class-first is the path of least resistance; for shared or isomorphic contracts, schema-first with `z.infer` keeps one source of truth.',
      uk: 'У NestJS-застосунку class-first — шлях найменшого спротиву; для спільних чи ізоморфних контрактів schema-first із `z.infer` тримає одне джерело правди.',
    },
  },
  {
    id: 'module-resolution',
    section: 's4-compiler',
    question: { en: 'Which `moduleResolution` should my tsconfig use?', uk: 'Який `moduleResolution` має мати мій tsconfig?' },
    hint: {
      en: 'It must model how your runtime or bundler actually finds modules.',
      uk: 'Він має моделювати те, як ваш runtime чи bundler реально знаходить модулі.',
    },
    options: [
      {
        label: { en: '`bundler`', uk: '`bundler`' },
        when: {
          en: 'A bundler (Vite / esbuild / webpack) resolves imports. Extensionless imports, reads `exports`, no mandatory `.js` — the modern app default.',
          uk: 'Bundler (Vite / esbuild / webpack) резолвить import-и. Import-и без розширень, читає `exports`, без обовʼязкового `.js` — сучасний дефолт для застосунків.',
        },
        moduleId: 'm12-modules-resolution',
      },
      {
        label: { en: '`node16` / `nodenext`', uk: '`node16` / `nodenext`' },
        when: {
          en: 'Node runs your output directly (NestJS, Serverless). Enforces ESM/CJS rules and mandatory import extensions — required if you publish a dual-format package.',
          uk: 'Node виконує ваш вихід напряму (NestJS, Serverless). Забезпечує правила ESM/CJS і обовʼязкові розширення в import — потрібне, якщо публікуєте dual-format-пакет.',
        },
        moduleId: 'm12-modules-resolution',
      },
      {
        label: { en: '`node10` (legacy `node`)', uk: '`node10` (legacy `node`)' },
        when: {
          en: 'Only for legacy setups that predate the `exports` field. Avoid for new code — it cannot read conditional exports.',
          uk: 'Лише для legacy-налаштувань, старіших за поле `exports`. Уникайте для нового коду — воно не читає умовні exports.',
        },
        moduleId: 'm12-modules-resolution',
      },
    ],
    bottomLine: {
      en: 'App bundled by a tool → `bundler`; code run by Node or published to npm → `nodenext`.',
      uk: 'Застосунок, зібраний інструментом → `bundler`; код, що виконує Node чи публікується в npm → `nodenext`.',
    },
  },
  {
    id: 'ship-types',
    section: 's4-compiler',
    question: { en: 'How should I publish my package’s types?', uk: 'Як публікувати типи мого пакета?' },
    hint: {
      en: 'Emitting the `.d.ts` is half the job — the consumer’s resolver must also find it.',
      uk: 'Емітувати `.d.ts` — половина роботи: resolver споживача теж має його знайти.',
    },
    options: [
      {
        label: { en: 'Bundle with the package', uk: 'Постачати з пакетом' },
        when: {
          en: 'You own the TypeScript source. Emit with `declaration`, point the `exports` `"types"` condition (first!) at it, and gate the tarball with `attw` + `publint`.',
          uk: 'Ви володієте TypeScript-source. Емітуйте через `declaration`, наведіть умову `exports` `"types"` (першою!) на нього й перевіряйте tarball через `attw` + `publint`.',
        },
        moduleId: 'm13-declaration-files',
      },
      {
        label: { en: 'DefinitelyTyped (`@types/*`)', uk: 'DefinitelyTyped (`@types/*`)' },
        when: {
          en: 'The package ships no types and you cannot change it — contribute community declarations, published separately under the `@types` scope.',
          uk: 'Пакет не постачає типів, і ви не можете його змінити — зробіть внесок community-декларацій, що публікуються окремо під scope `@types`.',
        },
        moduleId: 'm13-declaration-files',
      },
    ],
    bottomLine: {
      en: 'Own the source → ship types with it (one version, always in sync). Typing someone else’s untyped package → DefinitelyTyped.',
      uk: 'Володієте source → постачайте типи з ним (одна версія, завжди в синхроні). Типізуєте чужий untyped-пакет → DefinitelyTyped.',
    },
  },
  {
    id: 'package-format',
    section: 's4-compiler',
    question: { en: 'Ship my package ESM-only or dual ESM/CJS?', uk: 'Постачати пакет ESM-only чи dual ESM/CJS?' },
    hint: {
      en: 'Dual-format doubles the surface `attw` has to verify — and is where “masquerading” bugs live.',
      uk: 'Dual-format подвоює поверхню, яку `attw` має перевірити — і саме там живуть баги «masquerading».',
    },
    options: [
      {
        label: { en: 'ESM-only', uk: 'ESM-only' },
        when: {
          en: 'Your consumers are modern (bundlers, Node ESM). Simplest possible packaging: one `.d.ts`, one `.js`, least room for a format mismatch.',
          uk: 'Ваші споживачі сучасні (bundler-и, Node ESM). Найпростіший packaging: один `.d.ts`, один `.js`, найменше місця для розбіжності форматів.',
        },
        moduleId: 'm13-declaration-files',
      },
      {
        label: { en: 'Dual ESM + CJS', uk: 'Dual ESM + CJS' },
        when: {
          en: 'You must support `require()` consumers. Emit `.d.mts` + `.d.cts` matching each JS format, and verify every resolution mode with `attw`.',
          uk: 'Ви маєте підтримати `require()`-споживачів. Емітуйте `.d.mts` + `.d.cts` під кожен JS-формат і перевіряйте кожен режим resolution через `attw`.',
        },
        moduleId: 'm13-declaration-files',
      },
    ],
    bottomLine: {
      en: 'Prefer ESM-only unless a real CJS consumer forces dual; dual-format is where declaration-format mismatches hide.',
      uk: 'Віддавайте перевагу ESM-only, доки реальний CJS-споживач не змусить dual; dual-format — де ховаються розбіжності форматів декларацій.',
    },
  },
  {
    id: 'type-or-interface',
    section: 's1-type-system',
    question: { en: '`type` alias or `interface`?', uk: '`type` alias чи `interface`?' },
    hint: {
      en: 'Mostly interchangeable for object shapes; a few real differences decide it.',
      uk: 'Здебільшого взаємозамінні для обʼєктних форм; вирішують кілька реальних відмінностей.',
    },
    options: [
      {
        label: { en: '`interface`', uk: '`interface`' },
        when: {
          en: 'A public, extensible object or class contract — clearer error messages, declaration merging, `extends`. A good default for library object types.',
          uk: 'Публічний, розширюваний обʼєктний чи класовий контракт — зрозуміліші помилки, declaration merging, `extends`. Гарний дефолт для обʼєктних типів бібліотеки.',
        },
        moduleId: 'm1-structural-typing',
      },
      {
        label: { en: '`type`', uk: '`type`' },
        when: {
          en: 'You need unions, tuples, mapped / conditional / template-literal types, or `infer` — anything beyond a plain object shape.',
          uk: 'Вам потрібні union-и, tuple-и, mapped / conditional / template-literal типи чи `infer` — будь-що поза простою обʼєктною формою.',
        },
        moduleId: 'm6-mapped-template-literals',
      },
    ],
    bottomLine: {
      en: 'Object shape you might extend or ship → `interface`; a computed, union or tuple type → `type`. Stay consistent within a codebase.',
      uk: 'Обʼєктна форма, яку можете розширити чи постачати → `interface`; обчислений, union- чи tuple-тип → `type`. Тримайтеся послідовності в кодовій базі.',
    },
  },
  {
    id: 'beyond-strict',
    section: 's4-compiler',
    question: { en: 'Which checks beyond `strict` should I turn on?', uk: 'Які перевірки поза `strict` увімкнути?' },
    hint: {
      en: '`strict` is a family of nine flags; the two highest-value checks sit OUTSIDE it.',
      uk: '`strict` — це родина з девʼяти флагів; дві найцінніші перевірки — ПОЗА нею.',
    },
    options: [
      {
        label: { en: '`noUncheckedIndexedAccess`', uk: '`noUncheckedIndexedAccess`' },
        when: {
          en: 'You index arrays or records by dynamic keys — it adds `| undefined` so you handle the missing case. The highest-value beyond-strict flag.',
          uk: 'Ви індексуєте масиви чи record-и динамічними ключами — воно додає `| undefined`, щоб ви обробили відсутній випадок. Найцінніший флаг поза strict.',
        },
        moduleId: 'm11-tsconfig-strictness',
      },
      {
        label: { en: '`exactOptionalPropertyTypes`', uk: '`exactOptionalPropertyTypes`' },
        when: {
          en: 'You must distinguish “absent” from “present but `undefined`” — PATCH semantics, config merging, precise optional fields.',
          uk: 'Вам треба розрізняти «відсутнє» й «присутнє, але `undefined`» — PATCH-семантика, злиття config, точні опціональні поля.',
        },
        moduleId: 'm11-tsconfig-strictness',
      },
      {
        label: { en: '`verbatimModuleSyntax`', uk: '`verbatimModuleSyntax`' },
        when: {
          en: 'You publish or bundle and want import elision to be predictable — it forces `import type` to be explicit, so emit is unambiguous.',
          uk: 'Ви публікуєте чи бандлите й хочете передбачуване import elision — воно змушує `import type` бути явним, тож emit однозначний.',
        },
        moduleId: 'm11-tsconfig-strictness',
      },
    ],
    bottomLine: {
      en: 'Turn on `strict`, then add `noUncheckedIndexedAccess` — it catches the most real bugs of anything left outside the family.',
      uk: 'Увімкніть `strict`, тоді додайте `noUncheckedIndexedAccess` — він ловить найбільше реальних багів з усього, що лишилося поза родиною.',
    },
  },
];
