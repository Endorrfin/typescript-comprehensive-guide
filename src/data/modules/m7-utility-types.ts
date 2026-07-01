import type { Module } from '../types';

/*
 * ★ SIGNATURE MODULE (S4) — Built-in Utility Types, Decoded.
 * Section II's capstone: every utility in lib.d.ts is one of the two mechanisms M5/M6 already taught —
 * a mapped type (reshape an object) or a distributive conditional + `infer` (filter/extract a union),
 * with Awaited as the recursive special case. Signature sim: 'utility-type-decode' (pick a utility +
 * input, step its real definition expanding to the concrete result). Figure: 'utility-type-taxonomy'.
 * Version-sensitive facts web-verified (see sources): Partial/Readonly/Record/Pick 2.1; Required/Exclude/
 * Extract/NonNullable/ReturnType/InstanceType 2.8; Parameters/ConstructorParameters 3.1; Omit 3.5;
 * Awaited 4.5. NonNullable rewritten in 4.8 from `T extends null|undefined ? never : T` to `T & {}`.
 * Overloads: ReturnType/Parameters infer from the LAST signature.
 */
export const m7: Module = {
  id: 'm7-utility-types',
  num: 7,
  section: 's2-type-level',
  order: 4,
  level: 'senior',
  signature: true,
  title: { en: 'Built-in Utility Types, Decoded', uk: 'Вбудовані Utility-типи, розібрані' },
  tagline: {
    en: 'Partial, Pick, Record, ReturnType, Awaited — read the real lib.d.ts source and see there is no magic, just two mechanisms.',
    uk: 'Partial, Pick, Record, ReturnType, Awaited — прочитайте справжнє джерело lib.d.ts і побачте, що магії немає, лише два механізми.',
  },
  readMins: 18,
  mentalModel: {
    en: 'There is no magic in the standard library: every utility is either a mapped type that reshapes an object or a distributive conditional that filters a union — three lines you could have written yourself.',
    uk: 'У стандартній бібліотеці немає магії: кожен utility — це або mapped-тип, що переформовує обʼєкт, або distributive conditional, що фільтрує union — три рядки, які ви могли б написати самі.',
  },

  topics: [
    // ── Topic 1 ───────────────────────────────────────────────────────────────
    {
      id: 't1-two-families',
      title: { en: 'No magic: map or filter', uk: 'Без магії: map або filter' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "TypeScript ships around twenty utility types, but you do not memorize twenty things — you learn **two mechanisms** and learn to recognize which one each utility is. The object-shaping half (`Partial`, `Required`, `Readonly`, `Pick`, `Record`, `Omit`) is a **mapped type** from M6: a for-loop over `keyof T` that reshapes an object. The filtering-and-extracting half (`Exclude`, `Extract`, `NonNullable`, `ReturnType`, `Parameters`, `Awaited`) is a **distributive conditional type** from M5, usually with `infer` to pull a type out of a position. Once you see the split, `lib.d.ts` stops being a reference you look things up in and becomes code you can read — because it is exactly the code you have been writing since M5.",
            uk: "TypeScript постачає близько двадцяти utility-типів, але ви не запамʼятовуєте двадцять речей — ви вивчаєте **два механізми** й вчитеся впізнавати, який із них кожен utility. Обʼєкто-формувальна половина (`Partial`, `Required`, `Readonly`, `Pick`, `Record`, `Omit`) — це **mapped-тип** з M6: for-цикл по `keyof T`, що переформовує обʼєкт. Фільтрувально-екстрактивна половина (`Exclude`, `Extract`, `NonNullable`, `ReturnType`, `Parameters`, `Awaited`) — це **distributive conditional type** з M5, зазвичай із `infer`, щоб дістати тип із позиції. Щойно ви бачите цей поділ, `lib.d.ts` перестає бути довідником і стає кодом, який ви можете прочитати — бо це саме той код, який ви пишете ще з M5.",
          },
        },
        {
          kind: 'figure',
          fig: 'utility-type-taxonomy',
          caption: {
            en: 'The whole module on one page: two trunks — mapped (reshape objects) and conditional + `infer` (filter/extract) — with Awaited as the recursive special case.',
            uk: 'Увесь модуль на одній сторінці: два стовбури — mapped (переформувати обʼєкти) та conditional + `infer` (фільтрувати/екстрагувати) — з Awaited як рекурсивним особливим випадком.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// object-shaping  →  a MAPPED type (M6): loop over keys, reshape the object
type Partial<T> = { [P in keyof T]?: T[P] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };

// filtering / extracting  →  a DISTRIBUTIVE CONDITIONAL (M5), often with infer
type Exclude<T, U> = T extends U ? never : T;
type ReturnType<T extends (...a: any) => any> =
  T extends (...a: any) => infer R ? R : any;`,
          note: {
            en: 'Two mechanisms cover almost the entire file. The rest of this module fills in each branch and shows where the built-ins are subtly loose.',
            uk: 'Два механізми покривають майже весь файл. Решта модуля наповнює кожну гілку й показує, де вбудовані типи тонко неточні.',
          },
        },
      ],
    },
    // ── Topic 2 ───────────────────────────────────────────────────────────────
    {
      id: 't2-object-shaping',
      title: { en: 'Object-shaping utilities (mapped)', uk: 'Обʼєкто-формувальні utility (mapped)' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "The object-shaping utilities are one mapped line each. `Partial` writes `?`, `Required` writes `-?`, `Readonly` writes `readonly`, `Pick` maps over a *subset* of `keyof T`, and `Record` maps over a *raw* key union. The senior distinction from M6 is **homomorphic** vs not: `Partial`/`Required`/`Readonly`/`Pick` map over `keyof T`, so they **preserve** the source's own `readonly` and `?` modifiers; `Record` maps over a standalone union with no source `T`, so there are no modifiers to carry. `Omit` is the outlier — it is not a primitive mapped type at all but `Pick<T, Exclude<keyof T, K>>`, a Pick composed with a filter, which is why it is not homomorphic and misbehaves on unions (the pitfall in the last topic). Step the decoder over `Partial`, `Pick` and `Omit` to watch the loop run key by key.",
            uk: "Обʼєкто-формувальні utility — по одному mapped-рядку кожен. `Partial` пише `?`, `Required` пише `-?`, `Readonly` пише `readonly`, `Pick` мапиться по *підмножині* `keyof T`, а `Record` — по *сирому* union ключів. Senior-різниця з M6 — **homomorphic** чи ні: `Partial`/`Required`/`Readonly`/`Pick` мапляться по `keyof T`, тож **зберігають** власні модифікатори джерела `readonly` і `?`; `Record` мапиться по окремому union без джерела `T`, тож переносити нічого. `Omit` — виняток: це взагалі не примітивний mapped-тип, а `Pick<T, Exclude<keyof T, K>>`, Pick у поєднанні з фільтром, — тому він не homomorphic і збоїть на union (пастка в останній темі). Проженіть декодер над `Partial`, `Pick` та `Omit`, щоб побачити, як цикл біжить ключ за ключем.",
          },
        },
        {
          kind: 'sim',
          sim: 'utility-type-decode',
          caption: {
            en: 'Pick a utility and an input, then step its real lib.d.ts definition as it expands to the concrete result — each step badged by mechanism (mapped · conditional · infer · recursive).',
            uk: 'Оберіть utility та вхід, тоді покроково пройдіть його справжнє означення з lib.d.ts, поки воно розгортається до конкретного результату — кожен крок позначено механізмом (mapped · conditional · infer · recursive).',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// five are a single mapped line; Omit is the one composition:
type Partial<T>  = { [P in keyof T]?: T[P] };            // add ?
type Required<T> = { [P in keyof T]-?: T[P] };           // remove ? (2.8)
type Readonly<T> = { readonly [P in keyof T]: T[P] };    // add readonly
type Pick<T, K extends keyof T> = { [P in K]: T[P] };    // homomorphic subset → keeps modifiers
type Record<K extends keyof any, T> = { [P in K]: T };   // raw union → NO modifiers to keep
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>; // Pick + a filter`,
          note: {
            en: 'So Record<K, V> does not preserve `readonly`/`?` (no source T), and Omit inherits Pick + Exclude behavior rather than being homomorphic itself.',
            uk: 'Тож Record<K, V> не зберігає `readonly`/`?` (немає джерела T), а Omit успадковує поведінку Pick + Exclude, замість бути homomorphic сам.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Utility', uk: 'Utility' },
            { en: 'Definition (lib.d.ts)', uk: 'Означення (lib.d.ts)' },
            { en: 'Note', uk: 'Нотатка' },
          ],
          rows: [
            [
              { en: 'Partial<T>', uk: 'Partial<T>' },
              { en: '{ [P in keyof T]?: T[P] }', uk: '{ [P in keyof T]?: T[P] }' },
              { en: 'Adds ?; homomorphic (keeps readonly)', uk: 'Додає ?; homomorphic (зберігає readonly)' },
            ],
            [
              { en: 'Readonly<T>', uk: 'Readonly<T>' },
              { en: '{ readonly [P in keyof T]: T[P] }', uk: '{ readonly [P in keyof T]: T[P] }' },
              { en: 'Adds readonly; homomorphic', uk: 'Додає readonly; homomorphic' },
            ],
            [
              { en: 'Pick<T, K>', uk: 'Pick<T, K>' },
              { en: '{ [P in K]: T[P] }', uk: '{ [P in K]: T[P] }' },
              { en: 'Subset of keyof T → keeps modifiers', uk: 'Підмножина keyof T → зберігає модифікатори' },
            ],
            [
              { en: 'Record<K, V>', uk: 'Record<K, V>' },
              { en: '{ [P in K]: V }', uk: '{ [P in K]: V }' },
              { en: 'Raw key union → NOT homomorphic', uk: 'Сирий union ключів → НЕ homomorphic' },
            ],
            [
              { en: 'Omit<T, K>', uk: 'Omit<T, K>' },
              { en: 'Pick<T, Exclude<keyof T, K>>', uk: 'Pick<T, Exclude<keyof T, K>>' },
              { en: 'Pick + Exclude → not homomorphic', uk: 'Pick + Exclude → не homomorphic' },
            ],
          ],
          caption: {
            en: 'The object-shaping half of lib.d.ts. Five mapped one-liners plus Omit, the one composition.',
            uk: 'Обʼєкто-формувальна половина lib.d.ts. Пʼять mapped-однорядковиків плюс Omit — єдина композиція.',
          },
        },
      ],
    },
    // ── Topic 3 ───────────────────────────────────────────────────────────────
    {
      id: 't3-union-filtering',
      title: { en: 'Union-filtering utilities (distributive)', uk: 'Union-фільтрувальні utility (distributive)' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "`Exclude`, `Extract` and `NonNullable` filter a union. `Exclude<T, U> = T extends U ? never : T` — because `T` is a **naked type parameter**, the conditional is **distributive** (M5): it runs once per union member, and every member assignable to `U` becomes `never`. Since `never` is the **empty union** (M2), those members simply vanish and the survivors re-union. `Extract` is the mirror image (`? T : never`). `NonNullable` is the special case \"exclude `null | undefined`\", and it carries a small `lib.d.ts` history lesson: in **TS 4.8** its definition changed from `T extends null | undefined ? never : T` to just **`T & {}`** — because `{}` is a supertype of every type *except* `null` and `undefined`, intersecting with it absorbs the nullish members, and unlike a conditional an intersection can be reduced and assigned to (so `NonNullable<NonNullable<T>>` now simplifies).",
            uk: "`Exclude`, `Extract` і `NonNullable` фільтрують union. `Exclude<T, U> = T extends U ? never : T` — оскільки `T` є **naked type parameter**, conditional є **distributive** (M5): він виконується по разу на кожен член union, і кожен член, assignable до `U`, стає `never`. Оскільки `never` — це **порожній union** (M2), ці члени просто зникають, а ті, що вціліли, знову обʼєднуються. `Extract` — дзеркальний (`? T : never`). `NonNullable` — окремий випадок «виключити `null | undefined`», і він несе маленький урок історії `lib.d.ts`: у **TS 4.8** його означення змінилося з `T extends null | undefined ? never : T` на просто **`T & {}`** — бо `{}` є супертипом кожного типу, *крім* `null` і `undefined`, тож перетин із ним поглинає nullish-члени, а на відміну від conditional перетин можна редукувати й присвоювати (тож `NonNullable<NonNullable<T>>` тепер спрощується).",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `type Exclude<T, U> = T extends U ? never : T;   // distributive: runs per union member
type Extract<T, U> = T extends U ? T : never;   // the mirror

type A = Exclude<'a' | 'b' | 'c', 'a'>;         // "b" | "c"   ('a' → never, and never vanishes)
type B = Extract<'a' | 'b' | 'c', 'a' | 'f'>;   // "a"

// NonNullable: since TS 4.8 an intersection, not a conditional:
type NonNullable<T> = T & {};
type C = NonNullable<string | null | undefined>; // string   ({} absorbs everything non-nullish)`,
          note: {
            en: '`never` is the identity element of `|` (`X | never` is `X`), so “map a member to never” is exactly “delete that member”.',
            uk: '`never` — нейтральний елемент `|` (`X | never` це `X`), тож «перевести член у never» — це точно «видалити цей член».',
          },
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: { en: '`never` is the delete key for unions', uk: '`never` — це клавіша delete для union' },
          md: {
            en: "Understanding that `X | never` collapses to `X` demystifies half the library. **Any conditional whose branch is `never` is a filter:** the members you route to `never` disappear, the rest survive. It is the same trick M6 used when remapping a key `as never` to drop it from a mapped type — one idea (`never` = the empty set) doing double duty across both mechanisms.",
            uk: "Розуміння, що `X | never` згортається до `X`, демістифікує половину бібліотеки. **Будь-який conditional, чия гілка — `never`, є фільтром:** члени, які ви скеровуєте в `never`, зникають, решта виживає. Це той самий трюк, що M6 використовував, перейменовуючи ключ `as never`, щоб викинути його з mapped-типу — одна ідея (`never` = порожня множина) працює в обох механізмах.",
          },
        },
      ],
    },
    // ── Topic 4 ───────────────────────────────────────────────────────────────
    {
      id: 't4-function-inspection',
      title: { en: 'Function inspection (`infer`)', uk: 'Інспекція функцій (`infer`)' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "The function-inspection utilities all use **`infer`** (M5) to pull a type out of a call or construct signature. `ReturnType<T> = T extends (...a: any) => infer R ? R : any` pattern-matches a function type and binds its return position to `R`. `Parameters` binds the whole parameter list as a **tuple** (`infer P` inside `(...args: infer P)`); `ConstructorParameters` and `InstanceType` do the same against a `new (...)` signature. The senior gotcha lives right here: for an **overloaded** function, `infer` matches only the **last** overload signature — so `ReturnType`/`Parameters` on an overloaded function silently return the *last* overload's types, a real source of \"why is this type wrong?\". The everyday payoff is composition: `Awaited<ReturnType<typeof fetchUser>>` reads the resolved type of an async function in one expression (next topic).",
            uk: "Утиліти інспекції функцій усі використовують **`infer`** (M5), щоб дістати тип із call- або construct-сигнатури. `ReturnType<T> = T extends (...a: any) => infer R ? R : any` зіставляє тип функції з патерном і звʼязує позицію повернення з `R`. `Parameters` звʼязує весь список параметрів як **tuple** (`infer P` усередині `(...args: infer P)`); `ConstructorParameters` та `InstanceType` роблять те саме проти сигнатури `new (...)`. Senior-пастка саме тут: для **перевантаженої** (overloaded) функції `infer` збігається лише з **останньою** overload-сигнатурою — тож `ReturnType`/`Parameters` над overloaded-функцією тихо повертають типи *останнього* overload, справжнє джерело «чому цей тип неправильний?». Щоденний виграш — композиція: `Awaited<ReturnType<typeof fetchUser>>` читає розвʼязаний тип async-функції одним виразом (наступна тема).",
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Utility', uk: 'Utility' },
            { en: 'Extracts', uk: 'Дістає' },
            { en: 'From the pattern', uk: 'З патерну' },
          ],
          rows: [
            [
              { en: 'ReturnType<T>', uk: 'ReturnType<T>' },
              { en: 'The return type R', uk: 'Тип повернення R' },
              { en: '(...a: any) => infer R', uk: '(...a: any) => infer R' },
            ],
            [
              { en: 'Parameters<T>', uk: 'Parameters<T>' },
              { en: 'The parameter tuple P', uk: 'Tuple параметрів P' },
              { en: '(...a: infer P) => any', uk: '(...a: infer P) => any' },
            ],
            [
              { en: 'ConstructorParameters<T>', uk: 'ConstructorParameters<T>' },
              { en: 'The constructor params P', uk: 'Параметри конструктора P' },
              { en: 'abstract new (...a: infer P) => any', uk: 'abstract new (...a: infer P) => any' },
            ],
            [
              { en: 'InstanceType<T>', uk: 'InstanceType<T>' },
              { en: 'The instance type R', uk: 'Тип екземпляра R' },
              { en: 'abstract new (...a: any) => infer R', uk: 'abstract new (...a: any) => infer R' },
            ],
          ],
          caption: {
            en: 'Four inspectors, one idea: bind a function/constructor position with `infer`.',
            uk: 'Чотири інспектори, одна ідея: звʼязати позицію функції/конструктора через `infer`.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `type ReturnType<T extends (...a: any) => any> =
  T extends (...a: any) => infer R ? R : any;
type Parameters<T extends (...a: any) => any> =
  T extends (...a: infer P) => any ? P : never;

type R = ReturnType<(id: number) => User>;        // User
type P = Parameters<(s: string, n: number) => void>; // [s: string, n: number]

// overload gotcha — infer matches the LAST signature only:
declare function len(s: string): number;
declare function len(a: unknown[]): number;
type L = Parameters<typeof len>;                  // [a: unknown[]]  — not the string overload`,
          note: {
            en: 'You compose them: `Awaited<ReturnType<typeof fetchUser>>` is the resolved return type of an async function — the everyday payoff of the library.',
            uk: 'Ви їх компонуєте: `Awaited<ReturnType<typeof fetchUser>>` — це розвʼязаний тип повернення async-функції — щоденний виграш бібліотеки.',
          },
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: { en: 'Overloads collapse to the last signature', uk: 'Overload-и згортаються до останньої сигнатури' },
          md: {
            en: "`ReturnType`, `Parameters` and `OmitThisParameter` infer from a single call signature, and for an overloaded function that is the **last** declared overload. If you need a *specific* overload's types you cannot get them from these utilities — reorder the overloads so the one you want is last, or model the type by hand. This bites most often when typing wrappers around overloaded DOM or library functions.",
            uk: "`ReturnType`, `Parameters` та `OmitThisParameter` виводять з однієї call-сигнатури, і для overloaded-функції це **остання** оголошена overload. Якщо вам потрібні типи *конкретного* overload — ви не дістанете їх із цих утиліт: переставте overload-и так, щоб потрібний був останнім, або змоделюйте тип вручну. Це найчастіше кусає, коли типізуєте обгортки над overloaded DOM- чи бібліотечними функціями.",
          },
        },
      ],
    },
    // ── Topic 5 ───────────────────────────────────────────────────────────────
    {
      id: 't5-awaited-composing',
      title: { en: '`Awaited` & composing the library', uk: '`Awaited` та композиція бібліотеки' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "`Awaited<T>` (**TS 4.5**) is the recursive one. `await` unwraps a `Promise`, and if it resolves to another `Promise` it unwraps again — so `Awaited` is a conditional that **calls itself**: it `infer`s the value a thenable's `.then` resolves to, then applies `Awaited` to *that* value. It retired a decade of hand-rolled `UnwrapPromise<T>` helpers, and it **distributes over unions** too (`Awaited<A | Promise<B>>` is `A | B`). The everyday payoff is composition: `Awaited<ReturnType<typeof fetchUser>>` gives the resolved type of an async function in one expression. That is the whole design of the library — small, sharp utilities you **compose**. The discipline that keeps it readable: name intermediate types, prefer composition over one dense expression, and know where the built-ins are loose (`Omit` on unions, `ReturnType` on overloads) so you hand-write a type only when a built-in genuinely cannot express the shape.",
            uk: "`Awaited<T>` (**TS 4.5**) — рекурсивний. `await` розгортає `Promise`, і якщо той розвʼязується в інший `Promise`, розгортає знову — тож `Awaited` — це conditional, що **викликає сам себе**: він `infer`-ить значення, у яке розвʼязується `.then` thenable, а тоді застосовує `Awaited` до *цього* значення. Він відправив на пенсію десятиліття саморобних `UnwrapPromise<T>` і **дистрибутивний по union** теж (`Awaited<A | Promise<B>>` — це `A | B`). Щоденний виграш — композиція: `Awaited<ReturnType<typeof fetchUser>>` дає розвʼязаний тип async-функції одним виразом. Це весь задум бібліотеки — маленькі гострі утиліти, які ви **компонуєте**. Дисципліна, що тримає це читабельним: іменуйте проміжні типи, обирайте композицію замість одного щільного виразу, і знайте, де вбудовані типи неточні (`Omit` на union, `ReturnType` на overload), щоб писати тип вручну лише коли вбудований справді не виражає форму.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// Awaited (4.5) — a conditional that recurses on the resolved value:
type Awaited<T> =
  T extends null | undefined ? T :
  T extends object & { then(onfulfilled: infer F, ...a: infer _): any } ?
    F extends (value: infer V, ...a: infer _) => any ? Awaited<V> : never :
  T;

type A = Awaited<Promise<Promise<string>>>;      // string  (unwrapped twice)
type B = Awaited<ReturnType<typeof fetchUser>>;  // the resolved User — utilities compose`,
          note: {
            en: 'This recursion is why you rarely need a custom UnwrapPromise anymore — and why the return type of an async function already flows through Awaited internally.',
            uk: 'Ця рекурсія — причина, чому власний UnwrapPromise тепер рідко потрібен — і чому тип повернення async-функції вже проходить через Awaited усередині.',
          },
        },
        {
          kind: 'compare',
          a: { en: 'Hand-rolled helper', uk: 'Саморобний helper' },
          b: { en: 'Built-in utility', uk: 'Вбудований utility' },
          rows: [
            [
              { en: 'Correctness', uk: 'Коректність' },
              { en: 'You re-derive every edge case (nested promises, unions, overloads)', uk: 'Ви заново виводите кожен крайній випадок (вкладені promise, union, overload)' },
              { en: 'Battle-tested against the whole ecosystem', uk: 'Перевірений усією екосистемою' },
            ],
            [
              { en: 'Readability', uk: 'Читабельність' },
              { en: 'A reviewer must read and trust your helper', uk: 'Рецензент має прочитати й довіритись вашому helper' },
              { en: 'A name every TypeScript dev already knows', uk: 'Імʼя, яке знає кожен TypeScript-розробник' },
            ],
            [
              { en: 'When to reach for it', uk: 'Коли брати' },
              { en: 'Only a shape a built-in cannot express', uk: 'Лише форма, яку вбудований не виражає' },
              { en: 'Everything else — the library first', uk: 'Усе інше — спершу бібліотека' },
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'security',
          title: { en: 'Types are erased — utilities never validate', uk: 'Типи стираються — utility ніколи не валідують' },
          md: {
            en: "A `Partial<Dto>` or `ReturnType<typeof parse>` shapes types at compile time and vanishes at runtime. None of these utilities inspect a value — casting an HTTP body to `ReturnType<typeof handler>` is an unchecked assertion, not a check. At a trust boundary (a request body, `JSON.parse`, a queue message) validate with a runtime schema and **derive** the static type from it (M9), rather than casting untrusted input into a utility-shaped type and hoping the shape holds.",
            uk: "`Partial<Dto>` чи `ReturnType<typeof parse>` формують типи під час компіляції й зникають у runtime. Жодна з цих утиліт не інспектує значення — кастинг HTTP-тіла до `ReturnType<typeof handler>` є неперевіреним assertion, а не перевіркою. На межі довіри (тіло запиту, `JSON.parse`, повідомлення черги) валідуйте runtime-схемою і **виводьте** статичний тип із неї (M9), замість кастити недовірений вхід у тип форми utility й сподіватись, що форма витримає.",
          },
        },
      ],
    },
  ],

  keyPoints: [
    {
      en: 'Almost every lib.d.ts utility is one of two mechanisms: a mapped type (reshape an object) or a distributive conditional (filter/extract a union), often with `infer`.',
      uk: 'Майже кожен utility з lib.d.ts — це один із двох механізмів: mapped-тип (переформувати обʼєкт) або distributive conditional (фільтрувати/екстрагувати union), часто з `infer`.',
    },
    {
      en: 'Partial/Required/Readonly/Pick are homomorphic (map over keyof T → preserve modifiers); Record maps a raw union (no modifiers); Omit = Pick<T, Exclude<keyof T, K>> (not homomorphic).',
      uk: 'Partial/Required/Readonly/Pick — homomorphic (мапляться по keyof T → зберігають модифікатори); Record мапить сирий union (без модифікаторів); Omit = Pick<T, Exclude<keyof T, K>> (не homomorphic).',
    },
    {
      en: 'Exclude/Extract/NonNullable filter a union: a member routed to `never` (the empty union) vanishes. NonNullable is `T & {}` since TS 4.8.',
      uk: 'Exclude/Extract/NonNullable фільтрують union: член, скерований у `never` (порожній union), зникає. NonNullable — це `T & {}` з TS 4.8.',
    },
    {
      en: 'ReturnType/Parameters/InstanceType/ConstructorParameters use `infer` to bind a function/constructor position; on overloads they infer from the LAST signature.',
      uk: 'ReturnType/Parameters/InstanceType/ConstructorParameters використовують `infer`, щоб звʼязати позицію функції/конструктора; на overload виводять з ОСТАННЬОЇ сигнатури.',
    },
    {
      en: 'Awaited (4.5) is a recursive conditional that unwraps nested Promises/thenables and distributes over unions; compose it, e.g. `Awaited<ReturnType<typeof fn>>`.',
      uk: 'Awaited (4.5) — рекурсивний conditional, що розгортає вкладені Promise/thenable й дистрибутивний по union; компонуйте його, напр. `Awaited<ReturnType<typeof fn>>`.',
    },
    {
      en: 'Utilities are static-only — they never validate at runtime. Validate untrusted input at the boundary and derive the type (M9).',
      uk: 'Utility лише статичні — вони ніколи не валідують у runtime. Валідуйте недовірений вхід на межі й виводьте тип (M9).',
    },
  ],

  pitfalls: [
    {
      title: { en: 'Expecting `Omit` to distribute over a union', uk: 'Очікувати, що `Omit` дистрибутивний по union' },
      body: {
        en: '`Omit<T, K>` is `Pick<T, Exclude<keyof T, K>>` — not homomorphic and not distributive. Over a union it takes `keyof` of the whole union (only the common keys) instead of acting per member, so a discriminated union loses its per-member shape. Use a distributive helper: `type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never`.',
        uk: '`Omit<T, K>` — це `Pick<T, Exclude<keyof T, K>>` — не homomorphic і не distributive. Над union він бере `keyof` усього union (лише спільні ключі) замість дії по члену, тож discriminated union втрачає свою поформенну форму. Використайте distributive helper: `type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never`.',
      },
    },
    {
      title: { en: 'Assuming `Record` keeps `readonly`/`?`', uk: 'Гадати, що `Record` зберігає `readonly`/`?`' },
      body: {
        en: '`Record<K, V>` maps over a raw key union with no source type `T`, so it is non-homomorphic and carries no modifiers. Only keyof-T maps (Partial, Readonly, Pick) preserve the source’s `readonly` and `?`.',
        uk: '`Record<K, V>` мапиться по сирому union ключів без джерельного типу `T`, тож він non-homomorphic і не несе модифікаторів. Лише мапи по keyof T (Partial, Readonly, Pick) зберігають `readonly` і `?` джерела.',
      },
    },
    {
      title: { en: '`ReturnType`/`Parameters` on overloaded functions', uk: '`ReturnType`/`Parameters` на overloaded-функціях' },
      body: {
        en: '`infer` matches a single call signature, and for an overloaded function that is the last declared overload — so these utilities silently return the last overload’s types. Reorder the overloads or model the type by hand when you need a different one.',
        uk: '`infer` збігається з однією call-сигнатурою, і для overloaded-функції це остання оголошена overload — тож ці утиліти тихо повертають типи останнього overload. Переставте overload-и або змоделюйте тип вручну, коли потрібен інший.',
      },
    },
    {
      title: { en: 'Casting untrusted input into a utility type', uk: 'Кастинг недовіреного входу в utility-тип' },
      body: {
        en: '`body as ReturnType<typeof parse>` is an unchecked assertion, not validation — every utility type is erased at runtime. Validate at the boundary with a runtime schema and derive the static type from it (M9); never trust a cast to enforce a shape.',
        uk: '`body as ReturnType<typeof parse>` — неперевірений assertion, а не валідація — кожен utility-тип стирається в runtime. Валідуйте на межі runtime-схемою й виводьте статичний тип із неї (M9); ніколи не довіряйте касту забезпечувати форму.',
      },
    },
  ],

  interview: [
    {
      q: { en: 'The standard library has ~20 utility types. How do you make sense of them without memorizing each one?', uk: 'У стандартній бібліотеці ~20 utility-типів. Як їх осмислити, не запамʼятовуючи кожен?' },
      a: {
        en: 'They reduce to two mechanisms. The object-shaping utilities (Partial, Required, Readonly, Pick, Record, Omit) are mapped types — a loop over keys that reshapes an object. The filtering/extracting utilities (Exclude, Extract, NonNullable, ReturnType, Parameters, Awaited) are distributive conditional types, usually with `infer` to bind a position. Recognize which mechanism a utility is and its definition is obvious; you read lib.d.ts instead of memorizing it.',
        uk: 'Вони зводяться до двох механізмів. Обʼєкто-формувальні утиліти (Partial, Required, Readonly, Pick, Record, Omit) — mapped-типи, цикл по ключах, що переформовує обʼєкт. Фільтрувальні/екстрактивні (Exclude, Extract, NonNullable, ReturnType, Parameters, Awaited) — distributive conditional types, зазвичай із `infer`, щоб звʼязати позицію. Упізнайте механізм — і означення очевидне; ви читаєте lib.d.ts, а не запамʼятовуєте його.',
      },
      level: 'senior',
    },
    {
      q: { en: 'Decode `Exclude` and explain why `Exclude<"a" | "b", "a">` is `"b"`.', uk: 'Розберіть `Exclude` і поясніть, чому `Exclude<"a" | "b", "a">` — це `"b"`.' },
      a: {
        en: '`Exclude<T, U> = T extends U ? never : T`. `T` is a naked type parameter, so the conditional is distributive: it runs per union member. `"a" extends "a"` is true → `never`; `"b" extends "a"` is false → `"b"`. Because `never` is the empty union, the `"a"` branch contributes nothing when the results re-union, leaving `"b"`.',
        uk: '`Exclude<T, U> = T extends U ? never : T`. `T` — naked type parameter, тож conditional дистрибутивний: виконується по члену union. `"a" extends "a"` — true → `never`; `"b" extends "a"` — false → `"b"`. Оскільки `never` — порожній union, гілка `"a"` нічого не додає при повторному обʼєднанні, лишаючи `"b"`.',
      },
      level: 'senior',
    },
    {
      q: { en: 'Why does `Omit` behave differently from `Pick` on a discriminated union, and how do you fix it?', uk: 'Чому `Omit` поводиться інакше за `Pick` на discriminated union і як це виправити?' },
      a: {
        en: '`Omit<T, K>` is `Pick<T, Exclude<keyof T, K>>`, which is neither homomorphic nor distributive. Over a union it evaluates `keyof T` on the whole union — yielding only the keys common to every member — instead of mapping per member, so a discriminated union collapses. Fix it with a distributive wrapper that forces per-member evaluation: `type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never`.',
        uk: '`Omit<T, K>` — це `Pick<T, Exclude<keyof T, K>>`, який ні homomorphic, ні distributive. Над union він обчислює `keyof T` на всьому union — даючи лише спільні для всіх членів ключі — замість мапити по члену, тож discriminated union згортається. Виправлення — distributive-обгортка, що змушує обчислення по члену: `type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never`.',
      },
      level: 'staff',
    },
    {
      q: { en: 'Implement `ReturnType`, and what happens for an overloaded function?', uk: 'Реалізуйте `ReturnType` — і що станеться для overloaded-функції?' },
      a: {
        en: '`type ReturnType<T extends (...a: any) => any> = T extends (...a: any) => infer R ? R : any`. The conditional pattern-matches a call signature and `infer R` binds the return position. For an overloaded function, `infer` sees only one call signature — the last declared overload — so `ReturnType` returns that last overload’s return type, which is a common surprise when wrapping overloaded APIs.',
        uk: '`type ReturnType<T extends (...a: any) => any> = T extends (...a: any) => infer R ? R : any`. Conditional зіставляє call-сигнатуру, а `infer R` звʼязує позицію повернення. Для overloaded-функції `infer` бачить лише одну call-сигнатуру — останню оголошену overload — тож `ReturnType` повертає тип повернення саме останнього overload, що часто дивує при обгортанні overloaded API.',
      },
      level: 'staff',
    },
  ],

  seeAlso: ['m6-mapped-template-literals', 'm5-generics-conditional-types', 'm4-generics', 'm9-dto-validation'],

  sources: [
    { title: 'TypeScript Handbook — Utility Types', url: 'https://www.typescriptlang.org/docs/handbook/utility-types.html' },
    { title: 'TypeScript Handbook — Conditional Types (distribution & infer)', url: 'https://www.typescriptlang.org/docs/handbook/2/conditional-types.html' },
    { title: 'TypeScript Handbook — Mapped Types', url: 'https://www.typescriptlang.org/docs/handbook/2/mapped-types.html' },
    { title: 'Release Notes — TypeScript 2.1 (Partial, Readonly, Record, Pick)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html' },
    { title: 'Release Notes — TypeScript 2.8 (predefined conditional types: Exclude/Extract/NonNullable/ReturnType)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html' },
    { title: 'Release Notes — TypeScript 3.5 (the Omit helper type)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-5.html' },
    { title: 'Release Notes — TypeScript 4.5 (the Awaited type)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html' },
    { title: 'Release Notes — TypeScript 4.8 (NonNullable as an intersection, T & {})', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-8.html' },
  ],
};
