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
    seeAlso: ['assignability'],
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
];
