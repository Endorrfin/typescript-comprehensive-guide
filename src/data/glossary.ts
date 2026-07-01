import type { GlossaryEntry } from './types';

/*
 * Bilingual glossary seed (terms stay English; the gloss is translated).
 * Expanded across later sessions as modules are authored.
 */
export const glossary: GlossaryEntry[] = [
  {
    term: 'structural typing',
    def: {
      en: "TypeScript's rule that compatibility is decided by a type's shape (members), not its name or declaration. If the shape fits, it is assignable.",
      uk: 'Правило TypeScript: сумісність визначається формою типу (членами), а не його імʼям чи оголошенням. Якщо форма пасує — воно assignable.',
    },
    seeAlso: ['assignability'],
  },
  {
    term: 'assignability',
    def: {
      en: 'The relation "a value of type A can be used where type B is expected" (A <: B). The core check behind assignments, arguments and conditional types.',
      uk: 'Відношення «значення типу A можна використати там, де очікується тип B» (A <: B). Базова перевірка за присвоєннями, аргументами і conditional types.',
    },
    seeAlso: ['structural typing', 'variance'],
  },
  {
    term: 'generic',
    def: {
      en: 'A type or function parameterized by one or more type parameters, letting it work over many types while preserving the relationship between them.',
      uk: 'Тип чи функція, параметризовані одним або кількома type-параметрами, що дає працювати над багатьма типами, зберігаючи звʼязок між ними.',
    },
    seeAlso: ['type parameter', 'constraint'],
  },
  {
    term: 'type parameter',
    def: {
      en: 'The placeholder (e.g. `T`) introduced by `<…>` that stands for a type supplied or inferred at the use site.',
      uk: 'Заглушка (напр. `T`), уведена через `<…>`, що позначає тип, наданий або виведений у місці використання.',
    },
    seeAlso: ['generic', 'const type parameter'],
  },
  {
    term: 'constraint',
    def: {
      en: 'An upper bound on a type parameter written `T extends U`; it both restricts callers and unlocks access to U’s members inside the generic.',
      uk: 'Верхня межа type-параметра, записана `T extends U`; вона і обмежує викликачів, і відкриває доступ до членів U усередині generic.',
    },
    seeAlso: ['generic'],
  },
  {
    term: 'conditional type',
    def: {
      en: 'A type-level if: `T extends U ? X : Y`, resolving to X when T is assignable to U, else Y.',
      uk: 'Type-level if: `T extends U ? X : Y`, що дає X, коли T assignable до U, інакше Y.',
    },
    seeAlso: ['distributive conditional type', 'infer'],
  },
  {
    term: 'distributive conditional type',
    def: {
      en: 'A conditional whose checked type is a naked type parameter; over a union it evaluates per member and re-unions the results. Wrap in `[T]` to disable.',
      uk: 'Conditional, де перевіряється naked type parameter; над union обчислюється по члену і результати знову обʼєднуються. Загорніть у `[T]`, щоб вимкнути.',
    },
    seeAlso: ['conditional type', 'union'],
  },
  {
    term: 'infer',
    def: {
      en: 'A keyword usable only inside a conditional’s `extends` clause that declares and binds a fresh type variable by pattern-matching the structure of T.',
      uk: 'Ключове слово, доступне лише в clause `extends` conditional-типу, що оголошує й звʼязує нову змінну типу через зіставлення структури T із патерном.',
    },
    seeAlso: ['conditional type'],
  },
  {
    term: 'mapped type',
    def: {
      en: 'A type built by iterating a key union: `{ [K in keyof T]: … }`. Modifiers (`?`, `readonly`, `+`/`-`) and `as` key-remapping make it powerful.',
      uk: 'Тип, побудований ітерацією union ключів: `{ [K in keyof T]: … }`. Модифікатори (`?`, `readonly`, `+`/`-`) та `as`-перейменування роблять його потужним.',
    },
    seeAlso: ['template literal type'],
  },
  {
    term: 'template literal type',
    def: {
      en: 'A string-literal type that interpolates other types, e.g. `` `get${Capitalize<K>}` ``; enables computed key names and string pattern types.',
      uk: 'Рядково-літеральний тип, що інтерполює інші типи, напр. `` `get${Capitalize<K>}` ``; дає обчислювані імена ключів і рядкові патерн-типи.',
    },
    seeAlso: ['mapped type'],
  },
  {
    term: 'variance',
    def: {
      en: 'How subtyping of a container relates to subtyping of its parts: covariant (out), contravariant (in), bivariant or invariant. Annotatable with `in`/`out` (4.7).',
      uk: 'Як підтипізація контейнера повʼязана з підтипізацією його частин: covariant (out), contravariant (in), bivariant чи invariant. Анотується `in`/`out` (4.7).',
    },
    seeAlso: ['assignability', 'covariance', 'contravariance'],
  },
  {
    term: 'covariance',
    def: {
      en: 'Subtyping that flows the same direction: Dog <: Animal ⇒ F<Dog> <: F<Animal>. Function return types and readonly outputs are covariant; annotated `out` (4.7).',
      uk: 'Підтипізація, що тече в той самий бік: Dog <: Animal ⇒ F<Dog> <: F<Animal>. Типи повернення функцій і readonly-outputs covariant; анотується `out` (4.7).',
    },
    seeAlso: ['variance', 'contravariance'],
  },
  {
    term: 'contravariance',
    def: {
      en: 'Subtyping that flows in reverse: Dog <: Animal ⇒ F<Animal> <: F<Dog>. Function parameter types are contravariant under `strictFunctionTypes` (2.6); annotated `in` (4.7).',
      uk: 'Підтипізація, що тече навпаки: Dog <: Animal ⇒ F<Animal> <: F<Dog>. Типи параметрів функцій contravariant під `strictFunctionTypes` (2.6); анотується `in` (4.7).',
    },
    seeAlso: ['variance', 'covariance'],
  },
  {
    term: 'bivariance',
    def: {
      en: 'Assignability in both directions at once — convenient but unsound. TypeScript keeps it for method and constructor parameters so generic collections like `Array<T>` stay covariant.',
      uk: 'Assignability одразу в обидва боки — зручно, але unsound. TypeScript тримає це для параметрів методів і конструкторів, щоб generic-колекції на кшталт `Array<T>` лишались covariant.',
    },
    seeAlso: ['variance', 'invariance'],
  },
  {
    term: 'invariance',
    def: {
      en: 'Neither covariant nor contravariant: F<Dog> and F<Animal> are unrelated. A mutable container that both reads and writes T is invariant; annotated `in out` (4.7).',
      uk: 'Ні covariant, ні contravariant: F<Dog> і F<Animal> непов’язані. Мутабельний контейнер, що і читає, і пише T, invariant; анотується `in out` (4.7).',
    },
    seeAlso: ['variance', 'covariance'],
  },
  {
    term: 'function overload',
    def: {
      en: 'Multiple call signatures over one implementation, so the return can depend on the argument shape. Callers see only the overloads; resolution is first-match-wins (order most-specific-first) and the implementation signature is not callable.',
      uk: 'Кілька call-сигнатур над однією реалізацією, тож повернення може залежати від форми аргументів. Викликачі бачать лише overload-и; розвʼязання — перший-збіг-перемагає (найконкретніші першими), а implementation-сигнатура не викликається.',
    },
    seeAlso: ['variance'],
  },
  {
    term: 'union',
    def: {
      en: 'A type that is one of several alternatives, `A | B | C`. `never` is the empty union and the identity element of `|`.',
      uk: 'Тип, що є однією з кількох альтернатив, `A | B | C`. `never` — порожній union і нейтральний елемент `|`.',
    },
    seeAlso: ['discriminated union', 'narrowing'],
  },
  {
    term: 'discriminated union',
    def: {
      en: 'A union whose members share a literal "tag" field, letting the compiler narrow to one member by checking that tag.',
      uk: 'Union, члени якого мають спільне літеральне «tag»-поле, що дозволяє компілятору звузити до одного члена за цим тегом.',
    },
    seeAlso: ['union', 'narrowing'],
  },
  {
    term: 'narrowing',
    def: {
      en: 'The compiler refining a broad type to a narrower one along a code path, via type guards, equality checks, `in`, `typeof`, etc.',
      uk: 'Уточнення компілятором широкого типу до вужчого вздовж шляху коду — через type guards, перевірки рівності, `in`, `typeof` тощо.',
    },
    seeAlso: ['discriminated union'],
  },
  {
    term: 'const type parameter',
    def: {
      en: 'A type parameter declared `<const T>` (TS 5.0) so arguments are inferred as literal/tuple types instead of being widened.',
      uk: 'Type-параметр, оголошений `<const T>` (TS 5.0), щоб аргументи виводились як літеральні/tuple типи, а не розширювались.',
    },
    seeAlso: ['type parameter', 'NoInfer'],
  },
  {
    term: 'NoInfer',
    def: {
      en: 'A utility type (TS 5.4) that marks a position so the compiler will not use it as a candidate when inferring a type parameter.',
      uk: 'Utility-тип (TS 5.4), що позначає позицію, аби компілятор не брав її як кандидата при виведенні type-параметра.',
    },
    seeAlso: ['const type parameter'],
  },
  {
    term: 'utility type',
    def: {
      en: 'A type shipped in `lib.d.ts` — Partial, Pick, Record, ReturnType, Awaited, … — each defined with conditional, infer or mapped types.',
      uk: 'Тип із `lib.d.ts` — Partial, Pick, Record, ReturnType, Awaited, … — кожен означений через conditional, infer чи mapped types.',
    },
    seeAlso: ['mapped type', 'conditional type'],
  },
  {
    term: 'satisfies',
    def: {
      en: 'An operator (TS 4.9) that checks a value matches a type without widening or changing the value’s inferred type.',
      uk: 'Оператор (TS 4.9), що перевіряє відповідність значення типу без widening чи зміни виведеного типу значення.',
    },
    seeAlso: ['assignability'],
  },
  {
    term: 'declaration file',
    def: {
      en: 'A `.d.ts` file carrying only type declarations (no implementation) — the public type contract a package ships to its consumers.',
      uk: 'Файл `.d.ts`, що містить лише оголошення типів (без реалізації) — публічний типовий контракт, який пакет постачає споживачам.',
    },
    seeAlso: [],
  },
  {
    term: 'strict',
    def: {
      en: 'The tsconfig flag enabling the family of strict checks (strictNullChecks, noImplicitAny, …) that catch the most runtime bugs at compile time.',
      uk: 'Флаг tsconfig, що вмикає сімейство строгих перевірок (strictNullChecks, noImplicitAny, …), які ловлять найбільше runtime-багів під час компіляції.',
    },
    seeAlso: [],
  },
  // ── S2: Section I (M1 structural typing · M2 narrowing) ──────────────────
  {
    term: 'excess property check',
    def: {
      en: "A stricter check applied to *fresh* object literals: any property the target type doesn't declare is an error (TS2561). Catches typos in optional keys; storing the literal in a variable first bypasses it.",
      uk: 'Суворіша перевірка для *свіжих* обʼєктних літералів: будь-яка властивість, якої ціль не оголошує, — помилка (TS2561). Ловить опечатки в опційних ключах; збереження літерала у змінну спершу її обходить.',
    },
    seeAlso: ['structural typing', 'assignability'],
  },
  {
    term: 'literal widening',
    def: {
      en: "Inference broadening a literal to its primitive: `let x = 'a'` becomes `string`. A `const` binding, `as const`, or `satisfies` preserve the literal type.",
      uk: "Inference розширює літерал до його примітиву: `let x = 'a'` стає `string`. `const`-звʼязування, `as const` чи `satisfies` зберігають літеральний тип.",
    },
    seeAlso: ['const assertion', 'satisfies'],
  },
  {
    term: 'const assertion',
    def: {
      en: '`as const` (TS 3.4): stops widening, makes object properties `readonly` and array literals `readonly` tuples. A type-level signal — it does not freeze at runtime.',
      uk: '`as const` (TS 3.4): зупиняє widening, робить властивості обʼєкта `readonly`, а масивні літерали — `readonly` tuples. Type-level-сигнал — у runtime не заморожує.',
    },
    seeAlso: ['literal widening', 'satisfies'],
  },
  {
    term: 'type guard',
    def: {
      en: 'An expression the compiler reads to narrow a type along a code path — `typeof`, `instanceof`, the `in` operator, equality, or a user-defined `x is T` function.',
      uk: 'Вираз, який компілятор читає, щоб звузити тип уздовж шляху коду — `typeof`, `instanceof`, оператор `in`, рівність чи user-defined функція `x is T`.',
    },
    seeAlso: ['narrowing', 'type predicate'],
  },
  {
    term: 'type predicate',
    def: {
      en: 'A function return type of the form `x is T`; a `true` result narrows the argument to `T` at the call site. TS 5.5 can infer one for a simple boolean-returning function.',
      uk: 'Тип повернення функції у формі `x is T`; результат `true` звужує аргумент до `T` у місці виклику. TS 5.5 може вивести його для простої функції, що повертає boolean.',
    },
    seeAlso: ['type guard', 'assertion function'],
  },
  {
    term: 'assertion function',
    def: {
      en: 'A function typed `asserts cond` or `asserts x is T` (TS 3.7) that throws on failure and narrows its argument for the rest of the scope if it returns.',
      uk: 'Функція з типом `asserts cond` чи `asserts x is T` (TS 3.7), що кидає при невдачі й звужує аргумент на решту scope, якщо повертається.',
    },
    seeAlso: ['type predicate', 'narrowing'],
  },
  {
    term: 'exhaustiveness check',
    def: {
      en: 'Assigning a fully-narrowed union to `never` in a `default` arm, so adding an unhandled union member becomes a compile error.',
      uk: 'Присвоєння повністю звуженого union до `never` у гілці `default`, щоб додавання неопрацьованого члена union стало compile-помилкою.',
    },
    seeAlso: ['never', 'discriminated union'],
  },
  {
    term: 'never',
    def: {
      en: 'The bottom type — the empty set of values. Assignable to every type; nothing (but `never`) is assignable to it. A union with all members removed is `never`.',
      uk: 'Bottom-тип — порожня множина значень. Assignable до кожного типу; ніщо (крім `never`) не assignable до нього. Union, з якого прибрано всі члени, — це `never`.',
    },
    seeAlso: ['unknown', 'narrowing'],
  },
  {
    term: 'unknown',
    def: {
      en: 'The safe top type — everything is assignable to it, but it is assignable to nothing until narrowed. Prefer it over `any` for untrusted input.',
      uk: 'Безпечний top-тип — усе assignable до нього, але він не assignable ні до чого, поки не звужений. Для недовіреного входу кращий за `any`.',
    },
    seeAlso: ['never', 'narrowing'],
  },
  // ── S3: Section II (M4 generics · M6 mapped/template-literal) ─────────────
  {
    term: 'keyof',
    def: {
      en: 'A type operator: `keyof T` yields the union of a type’s keys. `keyof { a: 1; b: 2 }` is `"a" | "b"` — the driver of mapped types and typed property access.',
      uk: 'Оператор типів: `keyof T` дає union ключів типу. `keyof { a: 1; b: 2 }` — це `"a" | "b"`; рушій mapped-типів і типізованого доступу до властивостей.',
    },
    seeAlso: ['indexed access type', 'mapped type'],
  },
  {
    term: 'indexed access type',
    def: {
      en: 'A "lookup" type `T[K]` that retrieves the value type at key `K`; `T[keyof T]` is the union of all value types.',
      uk: 'Тип-«пошук» `T[K]`, що дістає тип значення за ключем `K`; `T[keyof T]` — union усіх типів значень.',
    },
    seeAlso: ['keyof', 'mapped type'],
  },
  {
    term: 'homomorphic mapped type',
    def: {
      en: 'A mapped type of the form `{ [K in keyof T]: … }` that preserves the source’s `readonly`/`?` modifiers (why Partial/Readonly work). Mapping over a raw key union (Record) does not.',
      uk: 'Mapped-тип форми `{ [K in keyof T]: … }`, що зберігає модифікатори джерела `readonly`/`?` (чому працюють Partial/Readonly). Мапінг по сирому union ключів (Record) — ні.',
    },
    seeAlso: ['mapped type', 'utility type'],
  },
  {
    term: 'key remapping',
    def: {
      en: 'The `as` clause in a mapped type (TS 4.1): `[K in keyof T as NewKey]` renames each key; remapping to `never` drops the key entirely.',
      uk: 'Клауза `as` у mapped-типі (TS 4.1): `[K in keyof T as NewKey]` перейменовує кожен ключ; перейменування на `never` повністю викидає ключ.',
    },
    seeAlso: ['mapped type', 'template literal type'],
  },
  {
    term: 'intrinsic string types',
    def: {
      en: '`Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize` (TS 4.1) — string transforms built into the compiler (not in any `.d.ts`) and not locale-aware.',
      uk: '`Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize` (TS 4.1) — рядкові перетворення, вбудовані в компілятор (їх немає в жодному `.d.ts`) і не залежні від locale.',
    },
    seeAlso: ['template literal type'],
  },
  {
    term: 'best common type',
    def: {
      en: 'The type TypeScript infers for a parameter with several inference sites — a union when the candidates disagree, e.g. `pair(1, "x")` infers `string | number`.',
      uk: 'Тип, який TypeScript виводить для параметра з кількох місць inference — union, коли кандидати різняться, напр. `pair(1, "x")` виводить `string | number`.',
    },
    seeAlso: ['generic', 'union'],
  },
  // ── S4: Section II (M7 utility types) ─────────────────────────────────────
  {
    term: 'Exclude',
    def: {
      en: '`Exclude<T, U> = T extends U ? never : T` — a distributive conditional that drops every union member assignable to `U` (each becomes `never` and vanishes). `Extract` is the inverse, keeping the matches.',
      uk: '`Exclude<T, U> = T extends U ? never : T` — distributive conditional, що викидає кожен член union, assignable до `U` (кожен стає `never` і зникає). `Extract` — інверсія, лишає збіги.',
    },
    seeAlso: ['distributive conditional type', 'never', 'utility type'],
  },
  {
    term: 'Omit',
    def: {
      en: '`Omit<T, K> = Pick<T, Exclude<keyof T, K>>` — remove keys `K` from an object type. Built on Pick + Exclude, so it is NOT homomorphic and does not distribute over unions (use a distributive wrapper for discriminated unions).',
      uk: '`Omit<T, K> = Pick<T, Exclude<keyof T, K>>` — прибрати ключі `K` з обʼєктного типу. Побудований на Pick + Exclude, тож НЕ homomorphic і не дистрибутивний по union (для discriminated unions беріть distributive-обгортку).',
    },
    seeAlso: ['homomorphic mapped type', 'Exclude', 'utility type'],
  },
  {
    term: 'Awaited',
    def: {
      en: 'A recursive utility type (TS 4.5) that unwraps nested `Promise`s/thenables to model `await`; it also distributes over unions. `Awaited<Promise<Promise<string>>>` is `string`.',
      uk: 'Рекурсивний utility-тип (TS 4.5), що розгортає вкладені `Promise`/thenable, моделюючи `await`; також дистрибутивний по union. `Awaited<Promise<Promise<string>>>` — це `string`.',
    },
    seeAlso: ['conditional type', 'infer', 'utility type'],
  },
  {
    term: 'decorator',
    def: {
      en: 'A function attached to a declaration with `@name` that TypeScript runs when the class is defined (not per instance). It can observe, replace, or record metadata about the class, method, accessor or field.',
      uk: 'Функція, причеплена до оголошення через `@name`, яку TypeScript виконує коли клас визначається (не на кожен екземпляр). Може спостерігати, замінювати чи записувати metadata про клас, метод, accessor чи поле.',
    },
    seeAlso: ['standard decorators', 'experimental decorators', 'decorator factory'],
  },
  {
    term: 'standard decorators',
    def: {
      en: 'The TC39 Stage-3 decorator system, shipped in TypeScript 5.0 with no compiler flag. A decorator receives `(value, context)` and may return a replacement; it has no parameter decorators and no `emitDecoratorMetadata`.',
      uk: 'Система decorators TC39 Stage-3, що вийшла в TypeScript 5.0 без compiler-флага. Decorator отримує `(value, context)` і може повернути заміну; не має parameter decorators і `emitDecoratorMetadata`.',
    },
    seeAlso: ['decorator', 'experimental decorators', 'parameter decorator'],
  },
  {
    term: 'experimental decorators',
    def: {
      en: 'The legacy decorator system enabled by `experimentalDecorators` in `tsconfig`, based on a pre-standard proposal. A decorator receives `(target, key, descriptor)`; it supports parameter decorators and `design:*` metadata, so NestJS/Angular/TypeORM rely on it.',
      uk: 'Legacy-система decorators, що вмикається через `experimentalDecorators` у `tsconfig`, на основі до-стандартної пропозиції. Decorator отримує `(target, key, descriptor)`; підтримує parameter decorators і `design:*` metadata, тож NestJS/Angular/TypeORM спираються на неї.',
    },
    seeAlso: ['decorator', 'standard decorators', 'emitDecoratorMetadata'],
  },
  {
    term: 'decorator factory',
    def: {
      en: 'A function that takes configuration and *returns* a decorator, so you can parameterise it — e.g. `@Inject(\'TOKEN\')` or `@clamp(0, 100)`. The outer call runs first; its returned decorator is what actually decorates.',
      uk: 'Функція, що приймає конфігурацію і *повертає* decorator, аби його параметризувати — напр. `@Inject(\'TOKEN\')` чи `@clamp(0, 100)`. Зовнішній виклик відпрацьовує першим; повернений ним decorator і є тим, що реально декорує.',
    },
    seeAlso: ['decorator'],
  },
  {
    term: 'parameter decorator',
    def: {
      en: 'A decorator applied to a constructor/method parameter (e.g. NestJS `@Param()`, `@Inject()`). It exists only in the legacy system — standard decorators deliberately omit it, which keeps DI frameworks on `experimentalDecorators`.',
      uk: 'Decorator, застосований до параметра конструктора/методу (напр. `@Param()`, `@Inject()` у NestJS). Існує лише в legacy-системі — standard-decorators навмисно його опускають, що тримає DI-фреймворки на `experimentalDecorators`.',
    },
    seeAlso: ['experimental decorators', 'dependency injection'],
  },
  {
    term: 'emitDecoratorMetadata',
    def: {
      en: 'A legacy compiler flag that, for any decorated declaration, emits `design:type`/`design:paramtypes`/`design:returntype` via `reflect-metadata`. It is how by-type dependency injection learns constructor parameter types at runtime.',
      uk: 'Legacy compiler-флаг, що для будь-якого декорованого оголошення емітить `design:type`/`design:paramtypes`/`design:returntype` через `reflect-metadata`. Саме так DI-за-типом дізнається типи параметрів конструктора в runtime.',
    },
    seeAlso: ['design:paramtypes', 'reflect-metadata', 'experimental decorators'],
  },
  {
    term: 'design:paramtypes',
    def: {
      en: 'The metadata key holding a decorated constructor/method’s parameter types as an array of runtime constructors. A DI container reads it to resolve dependencies by type. Interfaces/unions/aliases have no runtime value and collapse to `Object`.',
      uk: 'Metadata-ключ, що містить типи параметрів декорованого конструктора/методу як масив runtime-конструкторів. DI-контейнер читає його, щоб резолвити залежності за типом. Interface-и/union-и/alias-и не мають runtime-значення і згортаються в `Object`.',
    },
    seeAlso: ['emitDecoratorMetadata', 'reflect-metadata', 'dependency injection'],
  },
  {
    term: 'reflect-metadata',
    def: {
      en: 'A polyfill implementing the `Reflect.metadata`/`Reflect.getMetadata` API that stores decorator-emitted metadata on objects. NestJS imports it once at the entrypoint so its DI container can read `design:paramtypes` at runtime.',
      uk: 'Polyfill, що реалізує API `Reflect.metadata`/`Reflect.getMetadata` і зберігає metadata, емітовану decorators, на обʼєктах. NestJS імпортує його раз на вході, щоб DI-контейнер міг читати `design:paramtypes` у runtime.',
    },
    seeAlso: ['emitDecoratorMetadata', 'design:paramtypes'],
  },
  {
    term: 'dependency injection',
    def: {
      en: 'A pattern where a container constructs an object’s dependencies and passes them in, rather than the object creating them. In NestJS this is by-type via `design:paramtypes`; in Angular via the compiler and `inject()`.',
      uk: 'Патерн, де контейнер конструює залежності обʼєкта й передає їх, замість того щоб обʼєкт створював їх сам. У NestJS це за типом через `design:paramtypes`; в Angular — через компілятор і `inject()`.',
    },
    seeAlso: ['design:paramtypes', 'parameter decorator'],
  },
  // ── S7: Section III (M9 DTO validation · M10 RxJS/signals) ────────────────
  {
    term: 'DTO',
    def: {
      en: 'Data Transfer Object — the declared shape of data crossing a boundary (a request body, a response). Because types are erased, a DTO is only trustworthy once a runtime check has validated the value against it.',
      uk: 'Data Transfer Object — оголошена форма даних, що перетинають межу (тіло запиту, відповідь). Оскільки типи стираються, DTO надійний лише після того, як runtime-перевірка провалідувала значення проти нього.',
    },
    seeAlso: ['schema-first validation', 'ValidationPipe'],
  },
  {
    term: 'schema-first validation',
    def: {
      en: 'Defining one runtime schema (zod/valibot/arktype) and deriving the static type from it with `z.infer<typeof S>`, so the type and the check are a single source of truth that cannot drift.',
      uk: 'Означення однієї runtime-схеми (zod/valibot/arktype) і виведення статичного типу з неї через `z.infer<typeof S>`, тож тип і перевірка — єдине джерело правди, що не може розійтися.',
    },
    seeAlso: ['DTO', 'parse, don’t validate', 'Standard Schema'],
  },
  {
    term: 'parse, don’t validate',
    def: {
      en: 'The principle of turning untrusted input into a typed value in one step — a function that returns `T` or throws — instead of a boolean that leaves you still holding `unknown`. Never cast (`as`) untrusted data.',
      uk: 'Принцип перетворення недовіреного входу на типізоване значення за один крок — функція, що повертає `T` або кидає — замість boolean, який лишає вас із `unknown`. Ніколи не кастуйте (`as`) недовірені дані.',
    },
    seeAlso: ['schema-first validation', 'unknown', 'branded type'],
  },
  {
    term: 'ValidationPipe',
    def: {
      en: 'The NestJS pipe that runs class-validator/class-transformer on a DTO: `whitelist` strips unknown properties, `forbidNonWhitelisted` rejects them, `transform` builds the DTO instance and coerces primitives. Inert unless registered.',
      uk: 'Pipe у NestJS, що запускає class-validator/class-transformer на DTO: `whitelist` зрізає невідомі властивості, `forbidNonWhitelisted` відхиляє їх, `transform` будує екземпляр DTO і приводить примітиви. Інертний, доки не зареєстрований.',
    },
    seeAlso: ['DTO', 'dependency injection'],
  },
  {
    term: 'branded type',
    def: {
      en: 'A structural type tagged to behave nominally — `string & { readonly __brand: \'UserId\' }` — so only a validated value can be assigned, carrying a boundary check forward as a compile error (a nominal trick over structural typing).',
      uk: 'Структурний тип, позначений тегом для номінальної поведінки — `string & { readonly __brand: \'UserId\' }` — тож присвоїти можна лише провалідоване значення, несучи перевірку межі вперед як compile-помилку (nominal-трюк над structural typing).',
    },
    seeAlso: ['structural typing', 'parse, don’t validate'],
  },
  {
    term: 'Standard Schema',
    def: {
      en: 'A tiny (~60-line) TypeScript interface (the `~standard` property) agreed by the Zod, Valibot and ArkType authors, letting consuming tools (tRPC, TanStack) accept any compliant validator with no per-library adapter.',
      uk: 'Крихітний (~60 рядків) TypeScript-інтерфейс (властивість `~standard`), узгоджений авторами Zod, Valibot і ArkType, що дає споживчим інструментам (tRPC, TanStack) приймати будь-який сумісний валідатор без адаптера на бібліотеку.',
    },
    seeAlso: ['schema-first validation'],
  },
  {
    term: 'signal',
    def: {
      en: 'Angular’s pull-based reactive primitive: a `WritableSignal<T>` holds one current value read synchronously by calling it (`count()`) and written with `.set`/`.update`. Reads are tracked so dependents recompute on change.',
      uk: 'Pull-based реактивний примітив Angular: `WritableSignal<T>` тримає одне поточне значення, що читається синхронно викликом (`count()`) і пишеться через `.set`/`.update`. Читання відстежуються, тож залежні переобчислюються при зміні.',
    },
    seeAlso: ['computed', 'Observable', 'toSignal'],
  },
  {
    term: 'computed',
    def: {
      en: 'A read-only signal derived from other signals via `computed(() => …)`. It is memoized (recomputes only when a read signal changed) and lazy. Use it for derived state instead of writing a signal inside an `effect`.',
      uk: 'Read-only signal, похідний від інших signals через `computed(() => …)`. Він memoized (переобчислюється лише коли прочитаний signal змінився) і лінивий. Уживайте його для похідного стану замість запису signal усередині `effect`.',
    },
    seeAlso: ['signal', 'effect'],
  },
  {
    term: 'effect',
    def: {
      en: 'A reactive callback (`effect(() => …)`) that re-runs when the signals it reads change. It returns no value and is for side effects only — logging, persistence, imperative APIs — never for deriving state (that is `computed`/`linkedSignal`).',
      uk: 'Реактивний callback (`effect(() => …)`), що перезапускається, коли змінюються прочитані ним signals. Він не повертає значення й лише для side effects — логування, персистентність, імперативні API — ніколи для похідного стану (це `computed`/`linkedSignal`).',
    },
    seeAlso: ['signal', 'computed'],
  },
  {
    term: 'Observable',
    def: {
      en: 'RxJS’s push-based reactive primitive: `Observable<T>` is a stream that pushes zero or more `T`s over time, can complete or error, and does nothing until subscribed. Contrast with a signal’s single synchronous value.',
      uk: 'Push-based реактивний примітив RxJS: `Observable<T>` — це потік, що штовхає нуль або більше `T` у часі, може завершитись чи впасти, і нічого не робить до підписки. На противагу одному синхронному значенню signal.',
    },
    seeAlso: ['OperatorFunction', 'signal', 'toSignal'],
  },
  {
    term: 'OperatorFunction',
    def: {
      en: 'The core RxJS operator type: `OperatorFunction<T, R>` turns an `Observable<T>` into an `Observable<R>`. `pipe` composes them so types thread left-to-right; a type-guard `filter` returns `OperatorFunction<T, U>` and narrows the stream.',
      uk: 'Базовий тип оператора RxJS: `OperatorFunction<T, R>` перетворює `Observable<T>` на `Observable<R>`. `pipe` компонує їх, тож типи протягуються зліва направо; type-guard `filter` повертає `OperatorFunction<T, U>` і звужує потік.',
    },
    seeAlso: ['Observable', 'narrowing'],
  },
  {
    term: 'toSignal',
    def: {
      en: 'The `@angular/core/rxjs-interop` bridge from an Observable to a signal. Its overloads encode timing: bare → `Signal<T | undefined>`; `{ initialValue }` → `Signal<T | U>`; `{ requireSync: true }` → `Signal<T>` (asserts a synchronous emit).',
      uk: 'Міст `@angular/core/rxjs-interop` з Observable у signal. Його overloads кодують таймінг: голий → `Signal<T | undefined>`; `{ initialValue }` → `Signal<T | U>`; `{ requireSync: true }` → `Signal<T>` (стверджує синхронну емісію).',
    },
    seeAlso: ['signal', 'Observable'],
  },
];
