import type { Module } from '../types';

/*
 * ★ GOLDEN MODULE (S1) — Generics & Conditional Types.
 * The high-insight centerpiece of Section II: the type system as a small functional language.
 * Signature sim: 'conditional-type-eval' (a distributive conditional-type / infer evaluator).
 * Figures: 'distributive-conditional', 'infer-extraction'. All facts web-verified (see sources).
 */
export const m5: Module = {
  id: 'm5-generics-conditional-types',
  num: 5,
  section: 's2-type-level',
  order: 2,
  level: 'senior',
  signature: true,
  title: { en: 'Generics & Conditional Types', uk: 'Generics та Conditional Types' },
  tagline: {
    en: 'The type system as a small functional language: parameters, constraints, conditional types, and `infer`.',
    uk: 'Система типів як маленька функціональна мова: параметри, constraints, conditional types та `infer`.',
  },
  readMins: 18,
  mentalModel: {
    en: 'A conditional type is a function in the type world — `T extends U ? X : Y`. Hand it a *naked* union and it runs once per member, then unions the answers.',
    uk: 'Conditional type — це функція у світі типів: `T extends U ? X : Y`. Дай йому *naked* union — і він виконається для кожного члена окремо, а потім обʼєднає відповіді через union.',
  },

  topics: [
    // ── Topic 1 ───────────────────────────────────────────────────────────────
    {
      id: 't1-generics',
      title: { en: 'From generics to types that compute', uk: 'Від generics до типів, що обчислюють' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: 'A **generic** is a type parameterized by another type — a function whose argument is a *type*, not a value. `function identity<T>(x: T): T` keeps the exact input type instead of widening it to `any`. The power comes from three modifiers on the parameter: a **constraint** (`T extends …`) bounds what may be passed; a **default** (`T = …`) makes it optional; and inference lets the compiler *recover* `T` from the call site so you rarely write it by hand.',
            uk: '**Generic** — це тип, параметризований іншим типом: функція, чий аргумент — *тип*, а не значення. `function identity<T>(x: T): T` зберігає точний тип входу, а не розширює його до `any`. Сила — у трьох модифікаторах параметра: **constraint** (`T extends …`) обмежує, що можна передати; **default** (`T = …`) робить його опційним; а inference дозволяє компілятору *відновити* `T` з місця виклику, тож вручну ви його пишете рідко.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// Constraint: T must have a .length
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

// Default type parameter
type Box<T = string> = { value: T };
const b: Box = { value: 'hi' }; // T defaults to string

// const type parameter (TS 5.0): infer literal types, not widened ones
function asTuple<const T extends readonly unknown[]>(t: T): T { return t; }
const t = asTuple(['a', 1, true]); // readonly ["a", 1, true] — NOT (string | number | boolean)[]

// NoInfer (TS 5.4): block an unwanted inference candidate
function paint<C extends string>(colors: C[], fallback: NoInfer<C>): C { return fallback; }
paint(['red', 'green'], 'red'); // C = "red" | "green"; fallback can't widen it`,
          note: {
            en: '`const` type parameters (5.0) and `NoInfer` (5.4) are the two newest knobs on inference — reach for them in typed builders and factory APIs.',
            uk: '`const` type parameters (5.0) та `NoInfer` (5.4) — два найновіші важелі inference; беріть їх для типізованих builder-ів і factory-API.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Knob', uk: 'Важіль' },
            { en: 'Syntax', uk: 'Синтаксис' },
            { en: 'What it does', uk: 'Що робить' },
          ],
          rows: [
            [
              { en: 'Constraint', uk: 'Constraint' },
              { en: 'T extends Shape', uk: 'T extends Shape' },
              { en: 'Bounds what may be passed; unlocks member access on T.', uk: 'Обмежує, що можна передати; відкриває доступ до членів T.' },
            ],
            [
              { en: 'Default', uk: 'Default' },
              { en: 'T = Fallback', uk: 'T = Fallback' },
              { en: 'Makes the parameter optional at the use site.', uk: 'Робить параметр опційним у місці використання.' },
            ],
            [
              { en: 'const parameter (5.0)', uk: 'const-параметр (5.0)' },
              { en: 'function f<const T>(…)', uk: 'function f<const T>(…)' },
              { en: 'Infers literal/tuple types instead of widening.', uk: 'Виводить літеральні/tuple типи замість widening.' },
            ],
            [
              { en: 'NoInfer (5.4)', uk: 'NoInfer (5.4)' },
              { en: 'p: NoInfer<T>', uk: 'p: NoInfer<T>' },
              { en: 'Excludes a position from inference candidates.', uk: 'Виключає позицію з кандидатів inference.' },
            ],
          ],
          caption: {
            en: 'The four knobs on a type parameter. Inference fills T from the call so you rarely annotate it.',
            uk: 'Чотири важелі type-параметра. Inference заповнює T із виклику, тож анотуєте його рідко.',
          },
        },
        {
          kind: 'callout',
          tone: 'senior',
          title: { en: 'Constrain to enable, not to restrict', uk: 'Constraint — щоб увімкнути, а не обмежити' },
          md: {
            en: 'A constraint is what lets you *use* `T` — `T extends { length: number }` is what makes `a.length` legal inside the generic. Pick the loosest constraint that still unlocks the members you touch; over-constraining rejects valid callers.',
            uk: 'Constraint — це те, що дозволяє *користуватися* `T`: саме `T extends { length: number }` робить `a.length` легальним усередині generic. Обирайте найслабший constraint, що все ще відкриває потрібні члени; надмірний constraint відкидає валідних викликачів.',
          },
        },
      ],
    },
    // ── Topic 2 ───────────────────────────────────────────────────────────────
    {
      id: 't2-conditional',
      title: { en: 'Conditional types & distribution', uk: 'Conditional types та розподіл (distribution)' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: 'A **conditional type** picks a branch by an assignability test: `T extends U ? X : Y` resolves to `X` when `T` is assignable to `U`, else `Y`. The crucial twist: when the checked type is a **naked type parameter**, the conditional is **distributive** — applied to a union it runs *per member*. `C<A | B | C>` becomes `C<A> | C<B> | C<C>`. Distributing over `never` (the empty union) yields `never`.',
            uk: '**Conditional type** обирає гілку за тестом assignability: `T extends U ? X : Y` дає `X`, коли `T` assignable до `U`, інакше `Y`. Ключовий нюанс: коли перевіряється **naked type parameter**, conditional є **distributive** — над union він виконується *для кожного члена*. `C<A | B | C>` стає `C<A> | C<B> | C<C>`. Розподіл над `never` (порожній union) дає `never`.',
          },
        },
        {
          kind: 'figure',
          fig: 'distributive-conditional',
          caption: {
            en: 'A naked parameter distributes the conditional across each union member, then re-unions the results.',
            uk: 'Naked-параметр розподіляє conditional по кожному члену union, а потім знову обʼєднує результати.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// Distributive: naked T
type ToArray<T> = T extends unknown ? T[] : never;
type A = ToArray<string | number>;   // string[] | number[]

// Non-distributive: wrap each side in a tuple to make T "not naked"
type ToArrayND<T> = [T] extends [unknown] ? T[] : never;
type B = ToArrayND<string | number>; // (string | number)[]

type C = ToArray<never>;             // never (distributes over the empty union)`,
          note: {
            en: 'The `[T] extends [U]` tuple wrap is the canonical way to turn distribution OFF when you want the union treated as one unit.',
            uk: 'Обгортка `[T] extends [U]` у tuple — канонічний спосіб ВИМКНУТИ distribution, коли union треба трактувати як єдине ціле.',
          },
        },
        {
          kind: 'sim',
          sim: 'conditional-type-eval',
          caption: {
            en: 'Step a conditional type over an input. Watch distribution split a union, `infer` bind a variable, and the branches re-union into the result.',
            uk: 'Покроково проженіть conditional type над входом. Дивіться, як distribution розбиває union, `infer` звʼязує змінну, а гілки знову обʼєднуються в результат.',
          },
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: { en: 'Distribution is easy to trigger by accident', uk: 'Distribution легко увімкнути випадково' },
          md: {
            en: 'If `T` appears *naked* on the left of `extends`, you get per-member behavior whether you wanted it or not. Counting union members, testing "is this exactly type X", or building `[T]`-shaped results usually means you want the **tuple wrap** to switch distribution off.',
            uk: 'Якщо `T` стоїть *naked* зліва від `extends`, ви отримуєте поведінку «по члену» — хотіли ви того чи ні. Підрахунок членів union, перевірка «це точно тип X» чи побудова результату форми `[T]` зазвичай означають, що потрібна **tuple-обгортка**, аби вимкнути distribution.',
          },
        },
        {
          kind: 'compare',
          a: { en: 'Distributive  (T extends U)', uk: 'Distributive  (T extends U)' },
          b: { en: 'Non-distributive  ([T] extends [U])', uk: 'Non-distributive  ([T] extends [U])' },
          rows: [
            [
              { en: 'Checked type', uk: 'Що перевіряється' },
              { en: 'A naked type parameter', uk: 'Naked type parameter' },
              { en: 'Parameter wrapped in a tuple', uk: 'Параметр, загорнутий у tuple' },
            ],
            [
              { en: 'Over a union', uk: 'Над union' },
              { en: 'Runs once per member', uk: 'Виконується для кожного члена' },
              { en: 'Runs once for the whole union', uk: 'Виконується раз для всього union' },
            ],
            [
              { en: 'Use when', uk: 'Коли використовувати' },
              { en: 'Mapping/filtering each member', uk: 'Map/filter кожного члена' },
              { en: 'Treating the union as one unit', uk: 'Трактувати union як єдине ціле' },
            ],
          ],
        },
      ],
    },
    // ── Topic 3 ───────────────────────────────────────────────────────────────
    {
      id: 't3-infer',
      title: { en: 'Extracting types with `infer`', uk: 'Видобування типів через `infer`' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: '`infer` declares a fresh type variable **inside** the `extends` clause and binds it by pattern-matching the structure of `T`. It is how you reach *into* a type: the element of an array, the value of a `Promise`, the return type or parameters of a function. You may use several `infer`s in one clause, and since 5.x constrain them inline (`infer S extends string`). This single feature is the engine behind most of the standard utility types.',
            uk: '`infer` оголошує нову змінну типу **всередині** clause `extends` і звʼязує її, зіставляючи структуру `T` із патерном. Це спосіб дотягнутися *всередину* типу: елемент масиву, значення `Promise`, тип повернення чи параметри функції. В одному clause можна мати кілька `infer`, а з 5.x — обмежувати їх інлайн (`infer S extends string`). Саме ця можливість — двигун більшості стандартних utility-типів.',
          },
        },
        {
          kind: 'figure',
          fig: 'infer-extraction',
          caption: {
            en: '`infer` pattern-matches a structure and binds the hole; the true branch returns the captured type.',
            uk: '`infer` зіставляє структуру з патерном і звʼязує «дірку»; true-гілка повертає захоплений тип.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `type ElementType<T> = T extends (infer E)[] ? E : T;
type E1 = ElementType<number[]>;   // number
type E2 = ElementType<string>;     // string  (false branch — no match)

type Awaited1<T> = T extends Promise<infer R> ? R : T;
type R1 = Awaited1<Promise<boolean>>; // boolean

type ReturnTypeOf<T> = T extends (...a: any[]) => infer R ? R : never;
type R2 = ReturnTypeOf<() => string>; // string

// infer with an inline constraint (TS 4.7+)
type FirstChar<S> = S extends \`\${infer C extends string}\${string}\` ? C : never;`,
          note: {
            en: '`infer` is only legal in the `extends` clause of a conditional type — not in arbitrary positions.',
            uk: '`infer` дозволений лише у clause `extends` conditional type — не в довільних позиціях.',
          },
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: { en: 'Read the false branch as "no match"', uk: 'Читайте false-гілку як «немає збігу»' },
          md: {
            en: 'When the pattern with `infer` does not match, every inferred variable would be `never`, so well-designed extractors fall back to a sensible default (often `T` itself) in the `: false` branch rather than leaking `never`.',
            uk: 'Коли патерн з `infer` не збігається, кожна inferred-змінна була б `never`, тож добре спроєктовані екстрактори у гілці `: false` повертають розумний default (часто сам `T`), а не «протікають» `never`.',
          },
        },
      ],
    },
    // ── Topic 4 ───────────────────────────────────────────────────────────────
    {
      id: 't4-utility-bridge',
      title: { en: 'How the standard library is built', uk: 'Як збудована стандартна бібліотека типів' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "Once conditional types and `infer` click, the built-in utility types stop being magic — they are a few lines each. `Exclude`, `Extract` and `NonNullable` are distributive conditionals; `ReturnType` and `Parameters` are `infer`; `Pick`, `Omit` and `Record` are **mapped types**. A mapped type iterates a key union with `[K in keyof T]`, and since 4.1 can **remap** keys with `as` and build new key strings with **template literal types**.",
            uk: "Щойно conditional types та `infer` «клацнуть», вбудовані utility-типи перестають бути магією — це кілька рядків кожен. `Exclude`, `Extract` і `NonNullable` — distributive conditionals; `ReturnType` і `Parameters` — `infer`; `Pick`, `Omit`, `Record` — **mapped types**. Mapped type ітерує union ключів через `[K in keyof T]`, а з 4.1 може **перейменовувати** ключі через `as` і будувати нові рядки-ключі через **template literal types**.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// The library, reimplemented from scratch:
type Exclude2<T, U>    = T extends U ? never : T;          // distributive
type Extract2<T, U>    = T extends U ? T : never;          // distributive
type NonNullable2<T>   = T extends null | undefined ? never : T;
type ReturnType2<T>    = T extends (...a: any[]) => infer R ? R : never;

// Mapped type + key remapping (4.1) + template literal types (4.1):
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};
type G = Getters<{ name: string; age: number }>;
//   { getName: () => string; getAge: () => number }`,
          note: {
            en: 'Modifiers `+`/`-` on `readonly` and `?` (e.g. `-readonly`, `-?`) let mapped types add or strip those — that is all `Required`, `Readonly` and `Partial` are.',
            uk: 'Модифікатори `+`/`-` для `readonly` та `?` (напр. `-readonly`, `-?`) дають mapped-типам додавати чи знімати їх — саме це і є `Required`, `Readonly`, `Partial`.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Utility type', uk: 'Utility-тип' },
            { en: 'Built from', uk: 'З чого збудований' },
            { en: 'One-line definition', uk: 'Однорядкове означення' },
          ],
          rows: [
            [
              { en: 'NonNullable<T>', uk: 'NonNullable<T>' },
              { en: 'Distributive conditional', uk: 'Distributive conditional' },
              { en: 'T extends null | undefined ? never : T', uk: 'T extends null | undefined ? never : T' },
            ],
            [
              { en: 'ReturnType<T>', uk: 'ReturnType<T>' },
              { en: 'infer', uk: 'infer' },
              { en: 'T extends (...a) => infer R ? R : never', uk: 'T extends (...a) => infer R ? R : never' },
            ],
            [
              { en: 'Pick<T, K>', uk: 'Pick<T, K>' },
              { en: 'Mapped type', uk: 'Mapped type' },
              { en: '{ [P in K]: T[P] }', uk: '{ [P in K]: T[P] }' },
            ],
            [
              { en: 'Record<K, V>', uk: 'Record<K, V>' },
              { en: 'Mapped type', uk: 'Mapped type' },
              { en: '{ [P in K]: V }', uk: '{ [P in K]: V }' },
            ],
          ],
        },
      ],
    },
    // ── Topic 5 ───────────────────────────────────────────────────────────────
    {
      id: 't5-engineering',
      title: { en: 'Engineering type-level code', uk: 'Інженерія type-level коду' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: 'Type-level programming is real programming, with the same discipline. **Variance** matters: since 4.7 you can annotate type parameters `in` (contravariant) and `out` (covariant) to document and speed up checking. **Performance** matters: deeply recursive conditional types hit the instantiation-depth limit and slow the checker — the new Go-based compiler (TS 7.0, RC June 2026, ~10× faster) raises the ceiling but does not change the design rules. And **legibility** matters most: keep public types readable, push the gnarly conditionals into named internal helpers.',
            uk: 'Type-level програмування — це справжнє програмування з тією ж дисципліною. **Variance** важлива: з 4.7 можна анотувати параметри `in` (contravariant) та `out` (covariant), щоб документувати й пришвидшувати перевірку. **Performance** важлива: глибоко рекурсивні conditional types впираються в ліміт instantiation-depth і сповільнюють checker — новий компілятор на Go (TS 7.0, RC у червні 2026, ~у 10× швидший) піднімає стелю, але не змінює правил дизайну. А **legibility** важлива найбільше: тримайте публічні типи читабельними, а складні conditionals ховайте в іменовані внутрішні helper-и.',
          },
        },
        {
          kind: 'callout',
          tone: 'senior',
          title: { en: 'Public types are an API — design them', uk: 'Публічні типи — це API; проєктуйте їх' },
          md: {
            en: 'A 200-character inferred type in a hover tooltip is a failure even if it is correct. Name intermediate types, prefer a clear conditional over a clever one, and add doc comments — your future self debugging an "is not assignable" error will thank you.',
            uk: 'Inferred-тип на 200 символів у hover-підказці — це провал, навіть якщо він коректний. Іменуйте проміжні типи, обирайте зрозумілий conditional замість «розумного», додавайте doc-коментарі — майбутній ви, що дебажить помилку «is not assignable», подякує.',
          },
        },
        {
          kind: 'callout',
          tone: 'security',
          title: { en: 'Types are erased — never trust them at runtime', uk: 'Типи стираються — ніколи не довіряйте їм у runtime' },
          md: {
            en: 'All of this disappears at `tsc` emit. A `User` type guarantees nothing about a JSON payload off the wire. Validate untrusted input at the boundary with a runtime schema (zod, class-validator, a DTO + pipe) and *derive* the static type from it — never the other way around.',
            uk: 'Усе це зникає під час emit у `tsc`. Тип `User` нічого не гарантує про JSON-payload із мережі. Валідуйте недовірений вхід на межі через runtime-схему (zod, class-validator, DTO + pipe) і *виводьте* статичний тип із неї — ніколи навпаки.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Smell', uk: 'Запах' },
            { en: 'Fix', uk: 'Виправлення' },
          ],
          rows: [
            [
              { en: 'Accidental union distribution', uk: 'Випадкова distribution union' },
              { en: 'Wrap in a tuple: [T] extends [U]', uk: 'Загорніть у tuple: [T] extends [U]' },
            ],
            [
              { en: '"Type instantiation is excessively deep"', uk: '«Type instantiation is excessively deep»' },
              { en: 'Cap recursion; use tail-recursive accumulators', uk: 'Обмежте рекурсію; tail-recursive акумулятори' },
            ],
            [
              { en: 'Unreadable hover types', uk: 'Нечитабельні hover-типи' },
              { en: 'Name intermediates; expose a simple facade', uk: 'Іменуйте проміжні; дайте простий facade' },
            ],
          ],
        },
      ],
    },
  ],

  keyPoints: [
    {
      en: 'A conditional type `T extends U ? X : Y` is a type-level if; a *naked* parameter makes it distribute per union member.',
      uk: 'Conditional type `T extends U ? X : Y` — це type-level if; *naked*-параметр змушує його розподілятись по кожному члену union.',
    },
    {
      en: 'Wrap with `[T] extends [U]` to switch distribution OFF and check the union as one unit.',
      uk: 'Обгортка `[T] extends [U]` ВИМИКАЄ distribution і перевіряє union як єдине ціле.',
    },
    {
      en: '`infer` binds a type variable inside `extends` by pattern-matching — array element, Promise value, function return/params.',
      uk: '`infer` звʼязує змінну типу всередині `extends` через зіставлення з патерном — елемент масиву, значення Promise, повернення/параметри функції.',
    },
    {
      en: 'The built-in utility types are thin: Exclude/Extract/NonNullable (conditional), ReturnType/Parameters (infer), Pick/Omit/Record (mapped).',
      uk: 'Вбудовані utility-типи — тонкі: Exclude/Extract/NonNullable (conditional), ReturnType/Parameters (infer), Pick/Omit/Record (mapped).',
    },
    {
      en: '`const` type parameters (5.0) preserve literal types; `NoInfer` (5.4) blocks an unwanted inference candidate.',
      uk: '`const` type parameters (5.0) зберігають літеральні типи; `NoInfer` (5.4) блокує небажаного кандидата inference.',
    },
    {
      en: 'Types are erased at emit — validate untrusted input at runtime and derive the static type from the schema.',
      uk: 'Типи стираються під час emit — валідуйте недовірений вхід у runtime і виводьте статичний тип зі схеми.',
    },
  ],

  pitfalls: [
    {
      title: { en: 'Forgetting that naked `T` distributes', uk: 'Забути, що naked `T` розподіляється' },
      body: {
        en: 'Writing `T extends … ? … : …` over a union silently runs per member. If you meant to test the whole union, wrap it: `[T] extends […]`.',
        uk: 'Запис `T extends … ? … : …` над union тихо виконується по члену. Якщо ви мали на увазі весь union — загорніть: `[T] extends […]`.',
      },
    },
    {
      title: { en: 'Leaking `never` from the false branch', uk: 'Протікання `never` з false-гілки' },
      body: {
        en: 'When an `infer` pattern fails to match, returning the inferred variable yields `never`. Fall back to `T` or a sensible default instead.',
        uk: 'Коли патерн `infer` не збігається, повернення inferred-змінної дає `never`. Замість цього повертайте `T` або розумний default.',
      },
    },
    {
      title: { en: 'Over-clever types nobody can read', uk: 'Надто «розумні» типи, які ніхто не читає' },
      body: {
        en: 'A correct but 200-character hover type is a maintenance liability. Name intermediates and keep the public surface simple.',
        uk: 'Коректний, але 200-символьний hover-тип — тягар у підтримці. Іменуйте проміжні типи й тримайте публічну поверхню простою.',
      },
    },
    {
      title: { en: 'Trusting types at runtime', uk: 'Довіра до типів у runtime' },
      body: {
        en: 'Type assertions and interfaces vanish after compilation; they cannot validate network or user input. Use a runtime validator at the boundary.',
        uk: 'Type assertions та інтерфейси зникають після компіляції; вони не валідують мережевий чи користувацький вхід. Використовуйте runtime-валідатор на межі.',
      },
    },
  ],

  interview: [
    {
      q: { en: 'What makes a conditional type "distributive", and how do you turn it off?', uk: 'Що робить conditional type «distributive» і як це вимкнути?' },
      a: {
        en: 'It is distributive when the checked type is a naked type parameter (`T extends U ? …`). Over a union it evaluates per member and re-unions the results. Wrapping both sides in a 1-tuple (`[T] extends [U] ? …`) makes `T` non-naked and disables distribution.',
        uk: 'Він distributive, коли перевіряється naked type parameter (`T extends U ? …`). Над union обчислюється по члену і результати знову обʼєднуються. Обгортка обох боків у 1-tuple (`[T] extends [U] ? …`) робить `T` не-naked і вимикає distribution.',
      },
      level: 'senior',
    },
    {
      q: { en: 'Implement `ReturnType<T>` and explain each piece.', uk: 'Реалізуйте `ReturnType<T>` і поясніть кожну частину.' },
      a: {
        en: '`type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never`. The conditional pattern-matches any function shape; `infer R` binds the return type in the true branch; the false branch is `never` because a non-function has no return type.',
        uk: '`type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never`. Conditional зіставляє будь-яку форму функції; `infer R` звʼязує тип повернення в true-гілці; false-гілка — `never`, бо не-функція не має типу повернення.',
      },
      level: 'senior',
    },
    {
      q: { en: 'When would you reach for a `const` type parameter or `NoInfer`?', uk: 'Коли брати `const` type parameter чи `NoInfer`?' },
      a: {
        en: '`const T` when you want literal/tuple types preserved through a generic call (config builders, `as const`-like factories) without writing `as const` at every call. `NoInfer<C>` when one parameter should be inferred from another argument only — e.g. a default value that must be one of the already-provided options, not widen the set.',
        uk: '`const T` — коли треба зберегти літеральні/tuple типи крізь generic-виклик (config-builder-и, factory у стилі `as const`) без `as const` на кожному виклику. `NoInfer<C>` — коли один параметр має виводитись лише з іншого аргументу: напр. default-значення, що мусить бути одним із уже наданих варіантів, а не розширювати множину.',
      },
      level: 'staff',
    },
    {
      q: { en: 'Why can’t you rely on TypeScript types to validate an API response?', uk: 'Чому не можна покладатися на типи TypeScript для валідації відповіді API?' },
      a: {
        en: 'Types are fully erased at compile time — there is no runtime representation to check against. A cast like `data as User` only silences the compiler. You must validate with a runtime schema at the boundary and infer the static type from it, keeping the two in sync from a single source.',
        uk: 'Типи повністю стираються під час компіляції — немає runtime-представлення для перевірки. Каст `data as User` лише глушить компілятор. Треба валідувати runtime-схемою на межі й виводити статичний тип із неї, тримаючи обидва в синхроні з єдиного джерела.',
      },
      level: 'staff',
    },
  ],

  seeAlso: ['m4-generics', 'm6-mapped-template-literals', 'm7-utility-types', 'm3-functions-variance'],

  sources: [
    { title: 'TypeScript Handbook — Conditional Types', url: 'https://www.typescriptlang.org/docs/handbook/2/conditional-types.html' },
    { title: 'TypeScript Handbook — Generics', url: 'https://www.typescriptlang.org/docs/handbook/2/generics.html' },
    { title: 'TypeScript Handbook — Mapped Types', url: 'https://www.typescriptlang.org/docs/handbook/2/mapped-types.html' },
    { title: 'TypeScript Handbook — Template Literal Types', url: 'https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html' },
    { title: 'Release Notes — TypeScript 2.8 (conditional types & infer)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html' },
    { title: 'Release Notes — TypeScript 5.0 (const type parameters)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html' },
    { title: 'Release Notes — TypeScript 5.4 (NoInfer)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html' },
    { title: 'Announcing TypeScript 6.0', url: 'https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/' },
  ],
};
