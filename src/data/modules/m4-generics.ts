import type { Module } from '../types';

/*
 * ★ SIGNATURE MODULE (S3) — Generic Functions & Classes.
 * The value-level foundation Section II rests on: write code once for a placeholder type and let the
 * compiler recover it at each call. Signature sim: 'generic-inference' (trace T from argument sites to
 * best-common-type, with defaults + constraints). Figure: 'inference-sites'.
 * Version-sensitive facts web-verified (see sources): generic parameter defaults (2.3), const type
 * parameters (5.0), NoInfer (5.4). Static-member erasure per the Classes handbook.
 */
export const m4: Module = {
  id: 'm4-generics',
  num: 4,
  section: 's2-type-level',
  order: 1,
  level: 'senior',
  signature: true,
  title: { en: 'Generic Functions & Classes', uk: 'Generic-функції та класи' },
  tagline: {
    en: 'Parametric polymorphism at the value level: write it once for a placeholder type, infer the rest.',
    uk: 'Параметричний поліморфізм на рівні значень: напишіть раз для типу-заглушки, решту виведе компілятор.',
  },
  readMins: 18,
  mentalModel: {
    en: 'A generic is a function whose argument is a *type*. You write it once for a placeholder `T`; the compiler stamps out a precise version per caller by inferring `T` from the arguments.',
    uk: 'Generic — це функція, чий аргумент — *тип*. Ви пишете її раз для заглушки `T`; компілятор штампує точну версію під кожного викликача, виводячи `T` з аргументів.',
  },

  topics: [
    // ── Topic 1 ───────────────────────────────────────────────────────────────
    {
      id: 't1-parametric',
      title: { en: 'Parametric polymorphism', uk: 'Параметричний поліморфізм' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "A **generic** is a type parameterized by another type — a function whose argument is a *type*, not a value. The canonical example is `identity<T>(x: T): T`: it works for *any* type while keeping the exact one it was handed. The contrast with `any` is the whole point. `identityAny(x: any): any` also accepts anything, but it **throws the type away** — the result is `any`, with no autocomplete and no checking. A generic instead **captures and reuses** the caller's type, so the relationship *input type equals output type* is preserved. Type parameters exist to *relate* values to each other, not merely to accept many types.",
            uk: "**Generic** — це тип, параметризований іншим типом: функція, чий аргумент — *тип*, а не значення. Канонічний приклад — `identity<T>(x: T): T`: працює для *будь-якого* типу, зберігаючи саме той, що отримав. Контраст із `any` — і є вся суть. `identityAny(x: any): any` теж приймає будь-що, але **викидає тип** — результат `any`, без автодоповнення й без перевірки. Generic натомість **захоплює й перевикористовує** тип викликача, тож звʼязок *тип входу дорівнює типу виходу* зберігається. Type-параметри існують, щоб *повʼязувати* значення між собою, а не просто приймати багато типів.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// 'any' accepts everything but THROWS THE TYPE AWAY:
function identityAny(x: any): any { return x; }
const a = identityAny('hi'); // a: any — no autocomplete, no safety

// a generic CAPTURES and reuses the caller's type:
function identity<T>(x: T): T { return x; }
const b = identity('hi'); // b: string — inferred and precise

// the value of T is the RELATIONSHIP it preserves: here, input type === output type`,
          note: {
            en: 'If a function would work identically with `unknown` in every position, it may not need a type parameter at all — see the guidelines in the last topic.',
            uk: 'Якщо функція працювала б однаково з `unknown` у кожній позиції, type-параметр може бути й не потрібен — див. рекомендації в останній темі.',
          },
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: { en: 'Generics are how library types stay honest', uk: 'Generics — це те, як типи бібліотек лишаються чесними' },
          md: {
            en: 'Every precise API you rely on is generic under the hood: `Array<T>.map<U>`, `Promise<T>.then`, `Map<K, V>`. They are what let `[1,2,3].map(String)` know its result is `string[]`, not `any[]`. Reading their signatures is the fastest way to build fluency.',
            uk: 'Кожен точний API, на який ви покладаєтесь, під капотом generic: `Array<T>.map<U>`, `Promise<T>.then`, `Map<K, V>`. Саме вони дають `[1,2,3].map(String)` знати, що результат — `string[]`, а не `any[]`. Читання їхніх сигнатур — найшвидший шлях до вільного володіння.',
          },
        },
      ],
    },
    // ── Topic 2 ───────────────────────────────────────────────────────────────
    {
      id: 't2-inference',
      title: { en: 'Inference sites & best common type', uk: 'Місця inference та best common type' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "You rarely write `<T>` at a call — the compiler **infers** it. Every argument position that mentions `T` is an **inference site** that offers a *candidate*: from `arr: T[]` and a `number[]` argument, the candidate is `number`. When several sites offer candidates, TypeScript takes their **best common type** — often a union when they disagree, so `pair(1, 'x')` over `(a: T, b: T)` infers `T = string | number`. Literals **widen** during this process (a bare `'hi'` infers `string`, not `\"hi\"`). And when there is *no* site to infer from — a `T` that appears only in the return, or a call with no arguments — you must supply the type argument yourself (`new Set<string>()`).",
            uk: "Ви рідко пишете `<T>` у виклику — компілятор його **виводить**. Кожна позиція аргументу, що згадує `T`, — це **місце inference**, що дає *кандидата*: з `arr: T[]` і аргументу `number[]` кандидат — `number`. Коли кілька місць дають кандидатів, TypeScript бере їхній **best common type** — часто union, коли вони різняться, тож `pair(1, 'x')` над `(a: T, b: T)` виводить `T = string | number`. Літерали під час цього **розширюються** (голе `'hi'` виводить `string`, а не `\"hi\"`). А коли місця для inference *немає* — `T` лише в поверненні чи виклик без аргументів — тип-аргумент доводиться вказати самому (`new Set<string>()`).",
          },
        },
        {
          kind: 'figure',
          fig: 'inference-sites',
          caption: {
            en: 'Two arguments, two inference sites: their candidates (number, string) merge into the best common type `number | string`.',
            uk: 'Два аргументи — два місця inference: їхні кандидати (number, string) зливаються в best common type `number | string`.',
          },
        },
        {
          kind: 'sim',
          sim: 'generic-inference',
          caption: {
            en: 'Pick a generic function and a call, then step each inference site. Watch candidates merge into the best common type, a default fill in when there are none, and a constraint accept or reject the result.',
            uk: 'Оберіть generic-функцію та виклик, тоді пройдіть кожне місце inference. Дивіться, як кандидати зливаються в best common type, як default заповнює порожнечу, а constraint приймає чи відхиляє результат.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `function first<T>(arr: T[]): T { return arr[0]; }
first([1, 2, 3]);   // T inferred as number
first(['a', 'b']);  // T inferred as string

function pair<T>(a: T, b: T): [T, T] { return [a, b]; }
pair(1, 'x');       // T = string | number  (best common type of the two sites)

// no site to infer from → annotate the type argument:
const set = new Set<string>();`,
          note: {
            en: 'Explicit type arguments also *disable* inference — useful to force a wider type than the compiler would pick (e.g. `useState<string | null>(null)`).',
            uk: 'Явні тип-аргументи також *вимикають* inference — корисно, щоб змусити ширший тип, ніж обрав би компілятор (напр. `useState<string | null>(null)`).',
          },
        },
      ],
    },
    // ── Topic 3 ───────────────────────────────────────────────────────────────
    {
      id: 't3-constraints',
      title: { en: 'Constraints', uk: 'Constraints' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "An unconstrained `T` is opaque — inside the body you can pass it around but not *touch* it, because it could be anything. A **constraint** `T extends Shape` changes that: it both **bounds** what callers may pass and **unlocks** the members of `Shape` on `T` inside the function. `T extends { length: number }` is what makes `a.length` legal. A very common form constrains one parameter *by another* with `keyof`: `getProp<T, K extends keyof T>(obj: T, key: K): T[K]` is the fully-typed property accessor. The guiding rule is **constrain to enable, not to restrict** — pick the loosest constraint that still unlocks the members you actually use.",
            uk: "Необмежений `T` непрозорий — у тілі його можна передавати, але не *торкатися*, бо він може бути будь-чим. **Constraint** `T extends Shape` це змінює: він і **обмежує** те, що можуть передати викликачі, і **відкриває** члени `Shape` на `T` усередині функції. `T extends { length: number }` — це те, що робить `a.length` легальним. Дуже поширена форма обмежує один параметр *іншим* через `keyof`: `getProp<T, K extends keyof T>(obj: T, key: K): T[K]` — повністю типізований аксесор властивості. Керівне правило — **constraint щоб увімкнути, а не обмежити**: обирайте найслабший constraint, що все ще відкриває потрібні члени.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// a constraint bounds callers AND unlocks members inside the body:
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b; // .length is legal because of the constraint
}
longest([1, 2], [1, 2, 3]); // ✓ arrays have length
longest('ab', 'cde');       // ✓ strings have length
// longest(1, 2);           // ✗ number has no 'length'

// constrain one parameter BY another with keyof — a typed getter:
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
getProp({ name: 'Ada', age: 36 }, 'age'); // returns number, and 'age' autocompletes`,
          note: {
            en: 'A constraint is a lower bound on what you can *do* with `T`, not just an upper bound on what may be *passed* — it is what makes the body type-check.',
            uk: 'Constraint — це нижня межа того, що можна *робити* з `T`, а не лише верхня межа того, що можна *передати*: саме він дає тілу пройти перевірку типів.',
          },
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: { en: 'A constrained `T` is not its constraint', uk: '`T` з constraint — це не сам constraint' },
          md: {
            en: "`function f<T extends string>(x: T)` is *not* the same as `f(x: string)`. The generic keeps the caller's **specific** type (a literal `\"a\"`, a subtype), so it can return exactly that; the plain version widens to `string`. Reach for the generic when the precise input type must survive to the output.",
            uk: "`function f<T extends string>(x: T)` — це *не* те саме, що `f(x: string)`. Generic зберігає **конкретний** тип викликача (літерал `\"a\"`, підтип), тож може повернути саме його; проста версія розширює до `string`. Беріть generic, коли точний тип входу має дожити до виходу.",
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Constraint', uk: 'Constraint' },
            { en: 'Unlocks', uk: 'Відкриває' },
            { en: 'Typical use', uk: 'Типове застосування' },
          ],
          rows: [
            [
              { en: 'T extends object', uk: 'T extends object' },
              { en: 'Spreads, key iteration', uk: 'Spread, ітерація ключів' },
              { en: 'Merge / clone helpers', uk: 'Merge / clone helper-и' },
            ],
            [
              { en: 'K extends keyof T', uk: 'K extends keyof T' },
              { en: 'Indexed access T[K]', uk: 'Indexed access T[K]' },
              { en: 'Typed property access', uk: 'Типізований доступ до властивостей' },
            ],
            [
              { en: 'T extends { length: number }', uk: 'T extends { length: number }' },
              { en: '.length', uk: '.length' },
              { en: 'Works on arrays & strings', uk: 'Працює з масивами й рядками' },
            ],
          ],
        },
      ],
    },
    // ── Topic 4 ───────────────────────────────────────────────────────────────
    {
      id: 't4-defaults-inference-knobs',
      title: { en: 'Defaults, `const` params & `NoInfer`', uk: 'Defaults, `const`-параметри та `NoInfer`' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "Three modifiers tune the parameter itself. A **default** `T = Fallback` (**TS 2.3**) makes the type argument optional at the use site — `Box` means `Box<string>` — with the rules that the default must satisfy any constraint and that required parameters can't follow defaulted ones. A **`const` type parameter** (**TS 5.0**) makes inference preserve literal and tuple types instead of widening them, so a typed builder gets `readonly [\"a\", 1]` rather than `(string | number)[]` without writing `as const` at every call. And **`NoInfer<T>`** (**TS 5.4**) marks a position so it does *not* drive inference — the way to say \"infer `T` from *these* arguments, and merely *check* it against that one.\"",
            uk: "Три модифікатори налаштовують сам параметр. **Default** `T = Fallback` (**TS 2.3**) робить тип-аргумент опційним у місці використання — `Box` означає `Box<string>` — з правилами, що default має задовольняти constraint, а обовʼязкові параметри не можуть іти після default-них. **`const` type parameter** (**TS 5.0**) змушує inference зберігати літеральні й tuple типи замість widening, тож типізований builder отримує `readonly [\"a\", 1]`, а не `(string | number)[]`, без `as const` на кожному виклику. А **`NoInfer<T>`** (**TS 5.4**) позначає позицію так, щоб вона *не* керувала inference — спосіб сказати «виведи `T` з *цих* аргументів, а той лише *перевір*».",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// default type parameter (2.3): optional at the use site
interface Box<T = string> { value: T }
const b1: Box = { value: 'hi' };     // T defaults to string
const b2: Box<number> = { value: 1 };

// const type parameter (5.0): infer literals/tuples instead of widening
function asTuple<const T extends readonly unknown[]>(t: T): T { return t; }
const t = asTuple(['a', 1]); // readonly ["a", 1] — NOT (string | number)[]

// NoInfer (5.4): stop one position from driving inference
function paint<C extends string>(colors: C[], fallback: NoInfer<C>): C { return fallback; }
paint(['red', 'green'], 'red'); // C = "red" | "green"; 'fallback' can't widen it`,
          note: {
            en: 'Defaults and `NoInfer` shine in factory/builder APIs; `const` params in anything where a caller writes an inline literal you want to keep narrow.',
            uk: 'Defaults і `NoInfer` сяють у factory/builder-API; `const`-параметри — там, де викликач пише інлайн-літерал, який треба лишити вузьким.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Knob', uk: 'Важіль' },
            { en: 'Since', uk: 'З версії' },
            { en: 'Effect', uk: 'Ефект' },
          ],
          rows: [
            [
              { en: 'T = Default', uk: 'T = Default' },
              { en: '2.3', uk: '2.3' },
              { en: 'Type argument becomes optional', uk: 'Тип-аргумент стає опційним' },
            ],
            [
              { en: 'const T', uk: 'const T' },
              { en: '5.0', uk: '5.0' },
              { en: 'Infers literals/tuples, no widening', uk: 'Виводить літерали/tuple, без widening' },
            ],
            [
              { en: 'NoInfer<T>', uk: 'NoInfer<T>' },
              { en: '5.4', uk: '5.4' },
              { en: 'Excludes a position from inference', uk: 'Виключає позицію з inference' },
            ],
          ],
        },
      ],
    },
    // ── Topic 5 ───────────────────────────────────────────────────────────────
    {
      id: 't5-classes-guidelines',
      title: { en: 'Generic classes & good taste', uk: 'Generic-класи та гарний смак' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "A **generic class** is generic over its *instances*: `class Box<T>` gives each `Box` a `value: T`, and methods can introduce their own parameters (`map<U>(fn: (v: T) => U): Box<U>`). One firm limit: **static members cannot use the class type parameter**, because types are erased — there is a single runtime slot for a static, so `Box<string>` and `Box<number>` could not disagree about it. Beyond mechanics, generics reward restraint. The handbook's guidelines are worth memorizing: a type parameter should **relate two or more values** (a `T` used in exactly one spot relates nothing — replace it with `unknown`); **push type parameters down** (prefer `first<T>(arr: T[]): T` over `first<T extends any[]>(arr: T)`, which resolves to `any`); and use **as few type parameters as possible**.",
            uk: "**Generic-клас** generic щодо своїх *екземплярів*: `class Box<T>` дає кожному `Box` `value: T`, а методи можуть уводити власні параметри (`map<U>(fn: (v: T) => U): Box<U>`). Одне тверде обмеження: **статичні члени не можуть використовувати type-параметр класу**, бо типи стираються — для статика є єдиний runtime-слот, тож `Box<string>` і `Box<number>` не могли б розходитись щодо нього. Окрім механіки, generics винагороджують стриманість. Рекомендації handbook варто завчити: type-параметр має **повʼязувати два або більше значень** (`T`, ужитий рівно в одному місці, не повʼязує нічого — замініть на `unknown`); **проштовхуйте type-параметри вниз** (краще `first<T>(arr: T[]): T`, ніж `first<T extends any[]>(arr: T)`, що розвʼязується в `any`); і вживайте **якнайменше type-параметрів**.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `class Box<T> {
  constructor(public value: T) {}
  map<U>(fn: (v: T) => U): Box<U> { return new Box(fn(this.value)); }
  // static defaultValue: T  ✗ static members can't use the class type parameter (erasure)
}

// guideline: a type parameter should relate two or more values
function bad<T>(x: T): void {}          // T used once — relates nothing; take unknown
function good<T>(x: T): T[] { return [x]; } // T relates input to output — keep it

// guideline: push type parameters DOWN
function first1<T extends any[]>(arr: T) { return arr[0]; } // returns any — bad
function first2<T>(arr: T[]): T { return arr[0]; }         // returns T — good`,
          note: {
            en: 'The "relates two values" test is the fastest smell check: if deleting the type parameter and writing `unknown`/`any` loses nothing, it was never earning its keep.',
            uk: 'Тест «повʼязує два значення» — найшвидша перевірка на запах: якщо видалити type-параметр і написати `unknown`/`any` нічого не втрачаючи, він не виправдовував себе.',
          },
        },
        {
          kind: 'callout',
          tone: 'senior',
          title: { en: 'Fewer, lower, related', uk: 'Менше, нижче, повʼязані' },
          md: {
            en: 'Before adding a type parameter, ask: does it *relate* two positions? Can it live *lower* (on the element, not the array)? Could the function do the same job with *fewer*? Most over-generic code fails one of these — and the fix usually makes the signature both simpler and more precise.',
            uk: 'Перш ніж додати type-параметр, спитайте: чи він *повʼязує* дві позиції? Чи може жити *нижче* (на елементі, а не масиві)? Чи впоралася б функція з *меншою* кількістю? Більшість надмірно-generic коду завалює одне з цих — і виправлення зазвичай робить сигнатуру і простішою, і точнішою.',
          },
        },
      ],
    },
  ],

  keyPoints: [
    {
      en: 'A generic captures the caller’s type and reuses it, preserving relationships (input↔output) that `any` throws away.',
      uk: 'Generic захоплює тип викликача й перевикористовує його, зберігаючи звʼязки (вхід↔вихід), які `any` викидає.',
    },
    {
      en: 'The compiler infers `T` from inference sites (argument positions mentioning `T`), taking the best common type — a union when they disagree.',
      uk: 'Компілятор виводить `T` з місць inference (позицій аргументів, що згадують `T`), беручи best common type — union, коли вони різняться.',
    },
    {
      en: 'A constraint `T extends U` both bounds callers and unlocks U’s members on T; `K extends keyof T` gives typed property access.',
      uk: 'Constraint `T extends U` і обмежує викликачів, і відкриває члени U на T; `K extends keyof T` дає типізований доступ до властивостей.',
    },
    {
      en: 'Defaults (2.3) make a type argument optional; `const` params (5.0) preserve literals; `NoInfer` (5.4) blocks a position from inference.',
      uk: 'Defaults (2.3) роблять тип-аргумент опційним; `const`-параметри (5.0) зберігають літерали; `NoInfer` (5.4) блокує позицію від inference.',
    },
    {
      en: 'Generic classes are generic over instances; static members cannot use the class type parameter (types are erased).',
      uk: 'Generic-класи generic щодо екземплярів; статичні члени не можуть використовувати type-параметр класу (типи стираються).',
    },
    {
      en: 'Good generics relate two or more values, push type parameters down, and use as few as possible.',
      uk: 'Хороші generics повʼязують два+ значення, проштовхують type-параметри вниз і вживають якнайменше.',
    },
  ],

  pitfalls: [
    {
      title: { en: 'A type parameter used only once', uk: 'Type-параметр, ужитий лише раз' },
      body: {
        en: 'If `T` appears in a single position it relates nothing and adds noise — the function behaves the same with `unknown`. Delete the parameter.',
        uk: 'Якщо `T` зʼявляється в одній позиції, він нічого не повʼязує й лише додає шуму — функція поводиться так само з `unknown`. Видаліть параметр.',
      },
    },
    {
      title: { en: 'Constraining the container instead of the element', uk: 'Обмежувати контейнер замість елемента' },
      body: {
        en: '`<T extends any[]>(arr: T)` returns `any` from `arr[0]`, because access resolves through the constraint. Push the parameter down: `<T>(arr: T[]): T`.',
        uk: '`<T extends any[]>(arr: T)` повертає `any` з `arr[0]`, бо доступ розвʼязується через constraint. Проштовхніть параметр униз: `<T>(arr: T[]): T`.',
      },
    },
    {
      title: { en: 'Expecting inference where there is no site', uk: 'Очікувати inference там, де немає місця' },
      body: {
        en: 'A `T` that appears only in the return type, or a call with no arguments, gives the compiler nothing to infer from — supply the type argument explicitly or add a default.',
        uk: '`T`, що зʼявляється лише в типі повернення, чи виклик без аргументів не дають компілятору звідки виводити — вкажіть тип-аргумент явно або додайте default.',
      },
    },
    {
      title: { en: 'Reaching for a static member of the class type', uk: 'Тягнутися до статичного члена типу класу' },
      body: {
        en: 'Static members share one runtime slot across all instantiations, so they cannot reference the class type parameter. Move the generic to a method or a standalone function.',
        uk: 'Статичні члени ділять один runtime-слот на всі інстанціації, тож не можуть посилатися на type-параметр класу. Перенесіть generic у метод чи окрему функцію.',
      },
    },
  ],

  interview: [
    {
      q: { en: 'Why use a generic instead of `any`, or instead of a union of concrete types?', uk: 'Чому generic замість `any` чи замість union конкретних типів?' },
      a: {
        en: '`any` accepts everything but erases the type, so the result is unchecked. A generic *captures* the caller’s type and reuses it, preserving relationships — `identity<T>(x: T): T` guarantees the output is the same type as the input, which neither `any` nor a fixed union can express. Generics keep precision across a boundary that would otherwise widen.',
        uk: '`any` приймає все, але стирає тип, тож результат неперевірений. Generic *захоплює* тип викликача й перевикористовує його, зберігаючи звʼязки — `identity<T>(x: T): T` гарантує, що вихід того ж типу, що й вхід, чого не виразити ні `any`, ні фіксованим union. Generics тримають точність через межу, яка інакше розширила б тип.',
      },
      level: 'middle',
    },
    {
      q: { en: 'How does the compiler infer a type argument, and when must you annotate it?', uk: 'Як компілятор виводить тип-аргумент і коли його треба анотувати?' },
      a: {
        en: 'It collects a candidate for `T` from every argument position that mentions `T` (an inference site) and takes the best common type — a union if the sites disagree, with literals widened. You must annotate when there is no site to infer from: `T` appearing only in the return type, or a zero-argument call like `new Set<string>()`. An explicit type argument also overrides/widens what inference would pick.',
        uk: 'Він збирає кандидата для `T` з кожної позиції аргументу, що згадує `T` (місце inference), і бере best common type — union, якщо місця різняться, з розширеними літералами. Анотувати треба, коли місця для inference немає: `T` лише в типі повернення чи виклик без аргументів на кшталт `new Set<string>()`. Явний тип-аргумент також перекриває/розширює те, що обрав би inference.',
      },
      level: 'senior',
    },
    {
      q: { en: 'What does a constraint give you beyond restricting callers?', uk: 'Що дає constraint, окрім обмеження викликачів?' },
      a: {
        en: 'It unlocks members inside the body. With an unconstrained `T` you cannot access any property, because it could be anything; `T extends { length: number }` makes `a.length` type-check. Constrain to *enable* the members you use, and pick the loosest such constraint — `K extends keyof T` is the canonical example, tying a key parameter to the object it indexes so `obj[key]` is typed as `T[K]`.',
        uk: 'Він відкриває члени всередині тіла. З необмеженим `T` не можна звернутися до жодної властивості, бо він може бути будь-чим; `T extends { length: number }` робить `a.length` валідним. Обмежуйте, щоб *увімкнути* потрібні члени, і беріть найслабший такий constraint — `K extends keyof T` канонічний приклад, що прив’язує параметр-ключ до обʼєкта, який він індексує, тож `obj[key]` типізується як `T[K]`.',
      },
      level: 'senior',
    },
    {
      q: { en: '"Push type parameters down" — what does it mean and why?', uk: '«Проштовхуйте type-параметри вниз» — що це означає і чому?' },
      a: {
        en: 'Prefer putting the type parameter on the smallest thing that varies. `firstElement<T>(arr: T[]): T` is better than `firstElement<T extends any[]>(arr: T)`: in the second, indexing `arr[0]` resolves through the constraint `any[]` and yields `any`, losing the element type. Putting `T` on the element (`T[]`) keeps the return precise. It pairs with "use as few type parameters as possible" and "a type parameter should relate two or more values" as the core generic hygiene rules.',
        uk: 'Краще ставити type-параметр на найменшу річ, що варіюється. `firstElement<T>(arr: T[]): T` кращий за `firstElement<T extends any[]>(arr: T)`: у другому індексація `arr[0]` розвʼязується через constraint `any[]` і дає `any`, втрачаючи тип елемента. Розміщення `T` на елементі (`T[]`) тримає повернення точним. Це поєднується з «вживайте якнайменше type-параметрів» та «type-параметр має повʼязувати два+ значення» як базові правила гігієни generics.',
      },
      level: 'staff',
    },
  ],

  seeAlso: ['m5-generics-conditional-types', 'm6-mapped-template-literals', 'm1-structural-typing', 'm3-functions-variance'],

  sources: [
    { title: 'TypeScript Handbook — Generics', url: 'https://www.typescriptlang.org/docs/handbook/2/generics.html' },
    { title: 'TypeScript Handbook — Type Inference', url: 'https://www.typescriptlang.org/docs/handbook/type-inference.html' },
    { title: 'TypeScript Handbook — Classes (type parameters in static members)', url: 'https://www.typescriptlang.org/docs/handbook/2/classes.html' },
    { title: 'TypeScript Handbook — Do’s and Don’ts (generics guidelines)', url: 'https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html' },
    { title: 'Release Notes — TypeScript 2.3 (generic parameter defaults)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-3.html' },
    { title: 'Release Notes — TypeScript 5.0 (const type parameters)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html' },
    { title: 'Release Notes — TypeScript 5.4 (NoInfer)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html' },
  ],
};
