import type { Module } from '../types';

/*
 * ★ SIGNATURE MODULE (S3) — Mapped & Template-Literal Types.
 * Section II's "type system as a language for transforming shapes": a mapped type is a for-loop over
 * `keyof T`. Signature sim: 'mapped-type-transform' (step Partial/Readonly/Getters key by key).
 * Figure: 'mapped-type-mechanism'. Version-sensitive facts web-verified (see sources): mapped types &
 * plain modifiers (2.1), `+`/`-` modifier prefixes (2.8), homomorphic modifier preservation (2.8),
 * key remapping via `as` (4.1), template literal types (4.1), intrinsic string types (4.1).
 */
export const m6: Module = {
  id: 'm6-mapped-template-literals',
  num: 6,
  section: 's2-type-level',
  order: 3,
  level: 'senior',
  signature: true,
  title: { en: 'Mapped & Template-Literal Types', uk: 'Mapped- та Template-Literal типи' },
  tagline: {
    en: 'Iterate keys, flip modifiers, remap names and compute string types — build Pick/Partial/Record from scratch.',
    uk: 'Ітеруйте ключі, змінюйте модифікатори, перейменовуйте та обчислюйте рядкові типи — зберіть Pick/Partial/Record з нуля.',
  },
  readMins: 19,
  mentalModel: {
    en: 'A mapped type is a for-loop over `keyof T`. Each pass can flip the key’s modifiers, rename the key, and transform its value — and template literals are string arithmetic in that same type world.',
    uk: 'Mapped-тип — це for-цикл по `keyof T`. Кожен прохід може змінити модифікатори ключа, перейменувати ключ і перетворити його значення — а template literals це рядкова арифметика в тому ж світі типів.',
  },

  topics: [
    // ── Topic 1 ───────────────────────────────────────────────────────────────
    {
      id: 't1-mapped-basics',
      title: { en: 'A for-loop over `keyof T`', uk: 'For-цикл по `keyof T`' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "Two operators set the stage. **`keyof T`** produces the *union of a type's keys* (`keyof { a: 1; b: 2 }` is `\"a\" | \"b\"`), and an **indexed-access type** `T[K]` looks up the *value* type at a key. A **mapped type** combines them into a loop: `{ [K in keyof T]: … }` visits every key `K` of `T` and produces a new property for each. In the body you have both `K` (the current key) and `T[K]` (its value type) to work with — so `{ [K in keyof T]: T[K] }` rebuilds `T` unchanged, and `{ [K in keyof T]: boolean }` gives you a same-shaped record of flags. Everything else in this module is a variation on this one loop.",
            uk: "Два оператори задають сцену. **`keyof T`** дає *union ключів типу* (`keyof { a: 1; b: 2 }` — це `\"a\" | \"b\"`), а **indexed-access тип** `T[K]` шукає *тип значення* за ключем. **Mapped-тип** поєднує їх у цикл: `{ [K in keyof T]: … }` відвідує кожен ключ `K` типу `T` і створює нову властивість для кожного. У тілі маєте і `K` (поточний ключ), і `T[K]` (тип його значення) — тож `{ [K in keyof T]: T[K] }` відтворює `T` без змін, а `{ [K in keyof T]: boolean }` дає record прапорців тієї ж форми. Усе інше в модулі — варіації цього одного циклу.",
          },
        },
        {
          kind: 'figure',
          fig: 'mapped-type-mechanism',
          caption: {
            en: '`keyof T` becomes a union of keys; the `[K in …]` clause visits each, optionally remaps the name and transforms the value `T[K]`.',
            uk: '`keyof T` стає union ключів; клауза `[K in …]` відвідує кожен, за потреби перейменовує ключ і перетворює значення `T[K]`.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `type T = { name: string; age: number };

type Keys = keyof T;        // "name" | "age"
type NameType = T['name'];  // string   (indexed access)
type Values = T[keyof T];   // string | number

// a mapped type is a for-loop over those keys:
type Clone<T>  = { [K in keyof T]: T[K] };    // structurally identical to T
type Flags<T>  = { [K in keyof T]: boolean }; // { name: boolean; age: boolean }`,
          note: {
            en: '`T[keyof T]` — indexing by the whole key union — is the idiom for "the union of all value types".',
            uk: '`T[keyof T]` — індексація всім union ключів — це ідіома для «union усіх типів значень».',
          },
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: { en: 'Reach for a mapped type when shapes move together', uk: 'Беріть mapped-тип, коли форми змінюються разом' },
          md: {
            en: "If you find yourself hand-maintaining a second interface that mirrors a first (a form-state type shadowing a model, an \"all fields optional\" copy), that is a mapped type waiting to happen. Deriving one type from another with `keyof` keeps them in lockstep — add a field to the source and every derived type updates.",
            uk: "Якщо ви вручну підтримуєте другий інтерфейс, що дзеркалить перший (тип стану форми, що повторює модель, копію «усі поля опційні»), — це mapped-тип, який проситься назовні. Виведення одного типу з іншого через `keyof` тримає їх синхронно: додайте поле в джерело — і кожен похідний тип оновиться.",
          },
        },
      ],
    },
    // ── Topic 2 ───────────────────────────────────────────────────────────────
    {
      id: 't2-modifiers',
      title: { en: 'Modifiers & homomorphic preservation', uk: 'Модифікатори та homomorphic-збереження' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "Inside the loop you can attach `readonly` and `?` to each property — and, since **TS 2.8**, *remove* them with the `-` prefix (`-readonly`, `-?`) or add them explicitly with `+`. That is the entire implementation of four standard utilities: `Partial` adds `?`, `Required` writes `-?`, `Readonly` adds `readonly`, and a `Mutable` helper writes `-readonly`. The subtle, senior-level part is **homomorphic** behavior: because these map over `keyof T`, they **preserve the source's existing modifiers** and apply their change on top. `Partial<{ readonly host: string }>` stays `readonly`, just becomes optional too. Step the simulator over the `Config` input to watch a `readonly` key keep its modifier while `?` is layered on.",
            uk: "Усередині циклу до кожної властивості можна причепити `readonly` і `?` — а з **TS 2.8** *знімати* їх префіксом `-` (`-readonly`, `-?`) чи явно додавати через `+`. Це вся реалізація чотирьох стандартних utility: `Partial` додає `?`, `Required` пише `-?`, `Readonly` додає `readonly`, а helper `Mutable` пише `-readonly`. Тонкий senior-нюанс — **homomorphic**-поведінка: оскільки вони мапляться по `keyof T`, вони **зберігають наявні модифікатори джерела** й накладають свою зміну зверху. `Partial<{ readonly host: string }>` лишається `readonly`, просто стає ще й опційним. Проженіть симулятор над входом `Config`, щоб побачити, як `readonly`-ключ зберігає модифікатор, поки додається `?`.",
          },
        },
        {
          kind: 'sim',
          sim: 'mapped-type-transform',
          caption: {
            en: 'Pick an input type and a transform, then step `[K in keyof T]` key by key. Watch modifiers flip, keys remap and values transform as the result type builds up.',
            uk: 'Оберіть вхідний тип і перетворення, тоді покроково пройдіть `[K in keyof T]` ключ за ключем. Дивіться, як змінюються модифікатори, перейменовуються ключі й трансформуються значення, а результат збирається.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// modifiers, and the +/- prefixes to ADD or REMOVE them (2.8):
type Partial<T>  = { [K in keyof T]?: T[K] };          // add ?
type Required<T> = { [K in keyof T]-?: T[K] };         // remove ?
type Readonly<T> = { readonly [K in keyof T]: T[K] };  // add readonly
type Mutable<T>  = { -readonly [K in keyof T]: T[K] }; // remove readonly

// homomorphic: mapping over keyof T PRESERVES T's own modifiers, then applies the delta:
type Config = { readonly host: string; port: number; debug?: boolean };
type P = Partial<Config>;
//   { readonly host?: string; port?: number; debug?: boolean }  — readonly kept, ? added everywhere`,
          note: {
            en: 'A mapped type that maps over a raw key union instead of `keyof T` (like `Record`) is NOT homomorphic and has no source modifiers to preserve.',
            uk: 'Mapped-тип, що мапиться по сирому union ключів замість `keyof T` (як `Record`), НЕ homomorphic і не має модифікаторів джерела для збереження.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Utility', uk: 'Utility' },
            { en: 'Modifier written', uk: 'Записаний модифікатор' },
            { en: 'Effect', uk: 'Ефект' },
          ],
          rows: [
            [
              { en: 'Partial<T>', uk: 'Partial<T>' },
              { en: '?', uk: '?' },
              { en: 'Every property becomes optional', uk: 'Кожна властивість стає опційною' },
            ],
            [
              { en: 'Required<T>', uk: 'Required<T>' },
              { en: '-?', uk: '-?' },
              { en: 'Strips optionality from every property', uk: 'Знімає опційність з усіх властивостей' },
            ],
            [
              { en: 'Readonly<T>', uk: 'Readonly<T>' },
              { en: 'readonly', uk: 'readonly' },
              { en: 'Every property becomes read-only', uk: 'Кожна властивість стає read-only' },
            ],
            [
              { en: 'Mutable<T>', uk: 'Mutable<T>' },
              { en: '-readonly', uk: '-readonly' },
              { en: 'Removes read-only from every property', uk: 'Знімає read-only з усіх властивостей' },
            ],
          ],
          caption: {
            en: 'Four utilities, one loop each — the only difference is which modifier the body writes.',
            uk: 'Чотири utility, по одному циклу — різниця лише в тому, який модифікатор пише тіло.',
          },
        },
      ],
    },
    // ── Topic 3 ───────────────────────────────────────────────────────────────
    {
      id: 't3-key-remapping',
      title: { en: 'Key remapping with `as`', uk: 'Перейменування ключів через `as`' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "By default a mapped type keeps each key's name. **TS 4.1** added an **`as` clause** that lets you *rename* the key to any string-typed expression: `{ [K in keyof T as NewName]: … }`. Combined with template literals (next topic) this builds `getX`/`onXChange`-style APIs from a model. It has a second, quieter power: remap a key to **`never`** and it is **dropped** from the result — a built-in filter that needs no `Omit`. So \"all keys except the `kind` tag\" is just `as Exclude<K, 'kind'>`.",
            uk: "За замовчуванням mapped-тип зберігає імʼя кожного ключа. **TS 4.1** додав **клаузу `as`**, що дозволяє *перейменувати* ключ на будь-який вираз рядкового типу: `{ [K in keyof T as NewName]: … }`. У поєднанні з template literals (наступна тема) це будує API у стилі `getX`/`onXChange` з моделі. Є й друга, тихіша сила: перейменуйте ключ на **`never`** — і його **викине** з результату; вбудований фільтр без `Omit`. Тож «усі ключі, крім тегу `kind`» — це просто `as Exclude<K, 'kind'>`.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// rename keys with 'as' (4.1) — build getters from a model:
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};
type G = Getters<{ name: string; age: number }>;
//   { getName: () => string; getAge: () => number }

// remap a key to 'never' to FILTER it out — no Omit needed:
type RemoveKind<T> = { [K in keyof T as Exclude<K, 'kind'>]: T[K] };
type Shape = { kind: 'circle'; r: number };
type R = RemoveKind<Shape>; // { r: number }`,
          note: {
            en: 'The `string & K` intersection narrows `K` to the string keys before `Capitalize` — `keyof` can also yield `number | symbol`, which template literals reject.',
            uk: 'Перетин `string & K` звужує `K` до рядкових ключів перед `Capitalize` — `keyof` може дати ще `number | symbol`, які template literals відхиляють.',
          },
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: { en: 'Only string, number & symbol are legal keys', uk: 'Легальні ключі — лише string, number та symbol' },
          md: {
            en: "A remapped key must resolve to `string | number | symbol` (the `PropertyKey` type). Because `keyof T` can include `number` and `symbol`, template-literal remaps usually intersect with `string` (`string & K`) or the whole mapped type errors on the non-string keys. It is the most common first stumble with `as`.",
            uk: "Перейменований ключ має розвʼязатися в `string | number | symbol` (тип `PropertyKey`). Оскільки `keyof T` може містити `number` і `symbol`, template-literal-перейменування зазвичай перетинають зі `string` (`string & K`), інакше весь mapped-тип падає на нерядкових ключах. Це найпоширеніша перша помилка з `as`.",
          },
        },
      ],
    },
    // ── Topic 4 ───────────────────────────────────────────────────────────────
    {
      id: 't4-template-literals',
      title: { en: 'Template-literal & intrinsic string types', uk: 'Template-literal та intrinsic-рядкові типи' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "**Template literal types** (**TS 4.1**) are `string` literals that interpolate *other types*: `` `/${Lang}/${Page}` ``. Their defining behavior is the **cross-product** — when you interpolate unions, TypeScript multiplies them, so two 2-member unions yield a 4-member union of every combination. They also *infer* from positions (`` T extends `${infer Head}Changed` ``), which is how routers and event-name types are typed. Alongside them ship four **intrinsic string types** — `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize` — which are **built into the compiler** (you won't find them in any `.d.ts`) and are **not** locale-aware.",
            uk: "**Template literal types** (**TS 4.1**) — це `string`-літерали, що інтерполюють *інші типи*: `` `/${Lang}/${Page}` ``. Їхня визначальна поведінка — **cross-product**: коли інтерполюєте union-и, TypeScript їх перемножує, тож два 2-членні union дають 4-членний union усіх комбінацій. Вони також *виводять* із позицій (`` T extends `${infer Head}Changed` ``), — так типізують роутери й імена подій. Разом із ними йдуть чотири **intrinsic-рядкові типи** — `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize` — які **вбудовані в компілятор** (їх немає в жодному `.d.ts`) і **не** зважають на locale.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `type Lang = 'en' | 'uk';
type Page = 'home' | 'about';
type Route = \`/\${Lang}/\${Page}\`;
//   "/en/home" | "/en/about" | "/uk/home" | "/uk/about"  — unions cross-multiply

// intrinsic string types (4.1) — compiler built-ins, not in any .d.ts:
type A = Uppercase<'get'>;   // "GET"
type B = Capitalize<'name'>; // "Name"

// infer from a template position:
type EventName<S extends string> = \`\${S}Changed\`;
type PropOf<E> = E extends \`\${infer K}Changed\` ? K : never;
type P = PropOf<'nameChanged'>; // "name"`,
          note: {
            en: 'The cross-product is powerful and dangerous: interpolating three large unions can generate thousands of members and stall the checker. Keep the inputs small.',
            uk: 'Cross-product потужний і небезпечний: інтерполяція трьох великих union може згенерувати тисячі членів і застопорити checker. Тримайте входи малими.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Intrinsic', uk: 'Intrinsic' },
            { en: 'Example', uk: 'Приклад' },
            { en: 'Note', uk: 'Нотатка' },
          ],
          rows: [
            [
              { en: 'Uppercase<S>', uk: 'Uppercase<S>' },
              { en: '"get" → "GET"', uk: '"get" → "GET"' },
              { en: 'Whole string', uk: 'Весь рядок' },
            ],
            [
              { en: 'Capitalize<S>', uk: 'Capitalize<S>' },
              { en: '"name" → "Name"', uk: '"name" → "Name"' },
              { en: 'First character only', uk: 'Лише перший символ' },
            ],
            [
              { en: 'Lowercase / Uncapitalize', uk: 'Lowercase / Uncapitalize' },
              { en: '"NAME" → "name" / "N…" → "n…"', uk: '"NAME" → "name" / "N…" → "n…"' },
              { en: 'The inverses; not locale-aware', uk: 'Інверсії; не зважають на locale' },
            ],
          ],
        },
      ],
    },
    // ── Topic 5 ───────────────────────────────────────────────────────────────
    {
      id: 't5-utility-bridge',
      title: { en: 'The standard library, decoded', uk: 'Стандартна бібліотека, розібрана' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "With mapped types in hand, the object-shaping half of `lib.d.ts` stops being magic. `Pick<T, K>` is `{ [P in K]: T[P] }`; `Record<K, V>` is `{ [P in K]: V }`. The difference between them is the homomorphic point from earlier: `Pick` maps over a subset of `keyof T`, so it **preserves modifiers**; `Record` maps over a raw key union with no source `T`, so there are **no modifiers to carry** — a distinction that explains real bugs when people expect `Record` to keep `readonly`. As with all type-level work, the discipline is legibility: these are powerful, so name the intermediate types and keep the public surface something a teammate can read in a hover.",
            uk: "З mapped-типами під рукою обʼєкто-формувальна половина `lib.d.ts` перестає бути магією. `Pick<T, K>` — це `{ [P in K]: T[P] }`; `Record<K, V>` — це `{ [P in K]: V }`. Різниця між ними — той самий homomorphic-нюанс: `Pick` мапиться по підмножині `keyof T`, тож **зберігає модифікатори**; `Record` мапиться по сирому union ключів без джерела `T`, тож **модифікаторів для перенесення немає** — і це пояснює реальні баґи, коли від `Record` очікують збереження `readonly`. Як і в усій type-level роботі, дисципліна — це читабельність: вони потужні, тож іменуйте проміжні типи й тримайте публічну поверхню такою, яку колега прочитає в hover-підказці.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// the object-shaping utilities, decoded — each is one mapped line:
type Pick<T, K extends keyof T> = { [P in K]: T[P] };  // homomorphic subset → keeps modifiers
type Record<K extends keyof any, V> = { [P in K]: V };  // K is a raw union → NOT homomorphic

// so this loses readonly, by design:
type Frozen = { readonly a: number };
type R = Record<'a', number>; // { a: number }  — no source T, no modifier to preserve`,
          note: {
            en: '`Omit<T, K>` is the odd one out — it is defined via `Pick` + `Exclude`, not a single mapped clause, which is why it can be less precise on unions.',
            uk: '`Omit<T, K>` — виняток: він означений через `Pick` + `Exclude`, а не одну mapped-клаузу, тому буває менш точним на union.',
          },
        },
        {
          kind: 'compare',
          a: { en: 'Homomorphic  ([K in keyof T])', uk: 'Homomorphic  ([K in keyof T])' },
          b: { en: 'Non-homomorphic  ([K in Union])', uk: 'Non-homomorphic  ([K in Union])' },
          rows: [
            [
              { en: 'Maps over', uk: 'Мапиться по' },
              { en: 'The keys of a source type T', uk: 'Ключі джерельного типу T' },
              { en: 'A standalone key union', uk: 'Окремий union ключів' },
            ],
            [
              { en: 'Modifiers', uk: 'Модифікатори' },
              { en: 'Preserved from T (then delta)', uk: 'Збережені з T (потім delta)' },
              { en: 'None to preserve', uk: 'Немає що зберігати' },
            ],
            [
              { en: 'Examples', uk: 'Приклади' },
              { en: 'Partial, Readonly, Pick', uk: 'Partial, Readonly, Pick' },
              { en: 'Record', uk: 'Record' },
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'senior',
          title: { en: 'Powerful types still need to be readable', uk: 'Потужні типи все одно мають бути читабельними' },
          md: {
            en: "A three-line mapped type that remaps keys, filters with `never` and cross-multiplies template literals is clever — and a hover tooltip nobody can parse is a maintenance cost. Name each step (`type PascalKeys<T> = …`), prefer one obvious transform over a nested one, and expose a small facade. Your reviewer, and your future self reading an \"is not assignable\" error, will thank you.",
            uk: "Трирядковий mapped-тип, що перейменовує ключі, фільтрує через `never` й перемножує template literals, — розумний, а hover-підказка, яку ніхто не розбере, — це вартість підтримки. Іменуйте кожен крок (`type PascalKeys<T> = …`), обирайте одне очевидне перетворення замість вкладеного й давайте маленький facade. Ваш рецензент і майбутній ви, що читає помилку «is not assignable», подякують.",
          },
        },
      ],
    },
  ],

  keyPoints: [
    {
      en: 'A mapped type `{ [K in keyof T]: … }` is a for-loop over a type’s keys; `keyof` gives the key union and `T[K]` the value type.',
      uk: 'Mapped-тип `{ [K in keyof T]: … }` — це for-цикл по ключах типу; `keyof` дає union ключів, а `T[K]` — тип значення.',
    },
    {
      en: 'Modifiers `readonly` and `?` can be added or removed with `+`/`-` (2.8): Partial `?`, Required `-?`, Readonly `readonly`, Mutable `-readonly`.',
      uk: 'Модифікатори `readonly` і `?` додають/знімають через `+`/`-` (2.8): Partial `?`, Required `-?`, Readonly `readonly`, Mutable `-readonly`.',
    },
    {
      en: 'Homomorphic mapped types (over `keyof T`) preserve the source’s modifiers; mapping over a raw union (Record) does not.',
      uk: 'Homomorphic mapped-типи (по `keyof T`) зберігають модифікатори джерела; мапінг по сирому union (Record) — ні.',
    },
    {
      en: 'Key remapping with `as` (4.1) renames keys; remapping to `never` filters a key out with no `Omit`.',
      uk: 'Перейменування через `as` (4.1) міняє ключі; перейменування на `never` фільтрує ключ без `Omit`.',
    },
    {
      en: 'Template literal types (4.1) interpolate types and cross-multiply unions; `Uppercase`/`Capitalize`/… are compiler intrinsics, not locale-aware.',
      uk: 'Template literal types (4.1) інтерполюють типи й перемножують union-и; `Uppercase`/`Capitalize`/… — інтринсики компілятора, не зважають на locale.',
    },
    {
      en: 'Pick/Record/Partial/Readonly are one mapped line each — the standard library is not magic, just this loop.',
      uk: 'Pick/Record/Partial/Readonly — по одному mapped-рядку; стандартна бібліотека не магія, а цей самий цикл.',
    },
  ],

  pitfalls: [
    {
      title: { en: 'Expecting `Record` to preserve `readonly`/`?`', uk: 'Очікувати, що `Record` збереже `readonly`/`?`' },
      body: {
        en: '`Record<K, V>` maps over a raw key union with no source type, so it is non-homomorphic and carries no modifiers. Only `keyof T`-based maps (Pick, Partial, Readonly) preserve them.',
        uk: '`Record<K, V>` мапиться по сирому union ключів без джерельного типу, тож він non-homomorphic і не несе модифікаторів. Лише мапи на основі `keyof T` (Pick, Partial, Readonly) їх зберігають.',
      },
    },
    {
      title: { en: 'Remapping keys without `string & K`', uk: 'Перейменування ключів без `string & K`' },
      body: {
        en: 'Because `keyof T` can include `number | symbol`, a template-literal remap must intersect with `string` (`string & K`), or the mapped type errors on the non-string keys.',
        uk: 'Оскільки `keyof T` може містити `number | symbol`, template-literal-перейменування має перетинатися зі `string` (`string & K`), інакше mapped-тип падає на нерядкових ключах.',
      },
    },
    {
      title: { en: 'Cross-multiplying large unions', uk: 'Перемноження великих union' },
      body: {
        en: 'Template literals multiply their interpolated unions. Three sizeable unions can explode into thousands of members and slow or crash the checker — keep the inputs small.',
        uk: 'Template literals множать свої інтерпольовані union. Три чималі union можуть вибухнути в тисячі членів і сповільнити чи завалити checker — тримайте входи малими.',
      },
    },
    {
      title: { en: 'Unreadable derived types', uk: 'Нечитабельні похідні типи' },
      body: {
        en: 'A mapped type that remaps, filters and interpolates in one expression produces a hover nobody can read. Name the intermediate steps and expose a simple facade.',
        uk: 'Mapped-тип, що перейменовує, фільтрує та інтерполює в одному виразі, дає hover, який ніхто не прочитає. Іменуйте проміжні кроки й давайте простий facade.',
      },
    },
  ],

  interview: [
    {
      q: { en: 'What is a mapped type, and how do `keyof` and `T[K]` participate?', uk: 'Що таке mapped-тип і як у ньому беруть участь `keyof` та `T[K]`?' },
      a: {
        en: 'A mapped type `{ [K in keyof T]: … }` iterates the union of a type’s keys and builds a new property per key. `keyof T` supplies that key union; the indexed-access type `T[K]` gives the value type at the current key, so the body can reuse or transform it (e.g. `{ [K in keyof T]: T[K] }` clones `T`).',
        uk: 'Mapped-тип `{ [K in keyof T]: … }` ітерує union ключів типу й будує нову властивість на кожен ключ. `keyof T` дає цей union ключів; indexed-access тип `T[K]` дає тип значення за поточним ключем, тож тіло може його перевикористати чи перетворити (напр. `{ [K in keyof T]: T[K] }` клонує `T`).',
      },
      level: 'senior',
    },
    {
      q: { en: 'Why does `Partial<{ readonly a: string }>` keep `readonly`, but `Record` does not preserve modifiers?', uk: 'Чому `Partial<{ readonly a: string }>` зберігає `readonly`, а `Record` не зберігає модифікатори?' },
      a: {
        en: '`Partial` is a homomorphic mapped type — it maps over `keyof T`, so it copies the source’s `readonly`/`?` modifiers and then applies its own delta (adding `?`). `Record<K, V>` maps over a standalone key union with no source type `T` to copy modifiers from, so it is non-homomorphic and produces plain, mutable, required properties.',
        uk: '`Partial` — homomorphic mapped-тип: мапиться по `keyof T`, тож копіює модифікатори джерела `readonly`/`?`, а тоді застосовує свою delta (додає `?`). `Record<K, V>` мапиться по окремому union ключів без джерельного типу `T`, звідки копіювати модифікатори, тож він non-homomorphic і дає прості, мутабельні, обовʼязкові властивості.',
      },
      level: 'staff',
    },
    {
      q: { en: 'How would you build a `Getters<T>` type, and what makes key remapping tricky?', uk: 'Як побудувати тип `Getters<T>` і що ускладнює перейменування ключів?' },
      a: {
        en: '`type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] }`. The `as` clause (4.1) renames each key with a template literal, and `Capitalize` upper-cases the first letter. The trap is that `keyof T` may include `number | symbol`, which template literals reject — hence the `string & K` intersection to keep only string keys.',
        uk: '`type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] }`. Клауза `as` (4.1) перейменовує кожен ключ через template literal, а `Capitalize` робить першу літеру великою. Пастка: `keyof T` може містити `number | symbol`, які template literals відхиляють — звідси перетин `string & K`, щоб лишити лише рядкові ключі.',
      },
      level: 'senior',
    },
    {
      q: { en: 'What is the cross-product behavior of template literal types, and why is it a performance risk?', uk: 'Що таке cross-product у template literal types і чому це ризик для продуктивності?' },
      a: {
        en: 'When a template literal interpolates unions, TypeScript produces every combination — `` `${A}-${B}` `` over two n-member and m-member unions yields n×m members. It is what makes route and event-name types expressive, but three large unions can generate thousands of members and stall or crash the checker, so the inputs must stay small or be constrained.',
        uk: 'Коли template literal інтерполює union-и, TypeScript дає всі комбінації — `` `${A}-${B}` `` над n-членним і m-членним union дає n×m членів. Це робить типи маршрутів та імен подій виразними, але три великі union можуть згенерувати тисячі членів і застопорити чи завалити checker, тож входи мають лишатися малими або обмеженими.',
      },
      level: 'staff',
    },
  ],

  seeAlso: ['m5-generics-conditional-types', 'm7-utility-types', 'm4-generics', 'm1-structural-typing'],

  sources: [
    { title: 'TypeScript Handbook — Mapped Types', url: 'https://www.typescriptlang.org/docs/handbook/2/mapped-types.html' },
    { title: 'TypeScript Handbook — Template Literal Types', url: 'https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html' },
    { title: 'TypeScript Handbook — Keyof Type Operator', url: 'https://www.typescriptlang.org/docs/handbook/2/keyof-types.html' },
    { title: 'TypeScript Handbook — Indexed Access Types', url: 'https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html' },
    { title: 'Release Notes — TypeScript 2.8 (mapped-type modifiers, homomorphic)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html' },
    { title: 'Release Notes — TypeScript 4.1 (key remapping, template literals, intrinsic string types)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html' },
    { title: 'TypeScript Handbook — Utility Types', url: 'https://www.typescriptlang.org/docs/handbook/utility-types.html' },
  ],
};
