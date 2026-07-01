import type { Module } from '../types';

/*
 * ★ SIGNATURE MODULE (S2) — Narrowing & Control-Flow Analysis.
 * The second pillar of Section I: the compiler tracks a type as it flows through guards, shrinking a
 * union branch by branch until — at an exhaustive switch — it bottoms out in `never`. Signature sim:
 * 'control-flow-narrowing' (a line-by-line CFA visualizer). Figure: 'narrowing-funnel'.
 * Version-sensitive facts web-verified (see sources): assertion functions / `asserts` (3.7), inferred
 * type predicates (5.5), `satisfies` (4.9), `const` assertions (3.4).
 */
export const m2: Module = {
  id: 'm2-narrowing',
  num: 2,
  section: 's1-type-system',
  order: 2,
  level: 'middle',
  signature: true,
  title: { en: 'Narrowing & Control-Flow Analysis', uk: 'Narrowing та Control-Flow Analysis' },
  tagline: {
    en: 'How the compiler tracks a type as it flows through guards, returns and assignments — down to `never`.',
    uk: 'Як компілятор відстежує тип, поки той тече крізь guards, returns і присвоєння — аж до `never`.',
  },
  readMins: 19,
  mentalModel: {
    en: 'A union is a wide funnel and each guard is a checkpoint that narrows it. The compiler walks the control flow with you; when every member has been peeled off, what remains is `never`.',
    uk: 'Union — це широка лійка, а кожен guard — checkpoint, що її звужує. Компілятор іде потоком керування разом із вами; коли всі члени відсіяно, лишається `never`.',
  },

  topics: [
    // ── Topic 1 ───────────────────────────────────────────────────────────────
    {
      id: 't1-cfa-guards',
      title: { en: 'Control-flow analysis & the built-in guards', uk: 'Control-flow analysis та вбудовані guards' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "**Narrowing** is the compiler *refining a declared type to a more specific one along a code path*. Inside `if (typeof x === 'number') { … }`, a `string | number` becomes just `number` — TypeScript performs **control-flow analysis (CFA)**, a reachability walk of your code, and updates the type of each variable at every point. The everyday guards are ordinary JavaScript: `typeof` for primitives, `instanceof` for class instances, the `in` operator for property presence, plus truthiness, equality and `switch`. The remarkable part is that these are *runtime* expressions the compiler reads *statically* to refine types — no special syntax required.",
            uk: "**Narrowing** — це коли компілятор *уточнює оголошений тип до конкретнішого вздовж шляху коду*. Усередині `if (typeof x === 'number') { … }` тип `string | number` стає просто `number` — TypeScript виконує **control-flow analysis (CFA)**, обхід коду за досяжністю, і оновлює тип кожної змінної в кожній точці. Щоденні guards — це звичайний JavaScript: `typeof` для примітивів, `instanceof` для екземплярів класів, оператор `in` для наявності властивості, плюс truthiness, рівність і `switch`. Дивовижне те, що це *runtime*-вирази, які компілятор читає *статично*, щоб уточнити типи — без спеціального синтаксису.",
          },
        },
        {
          kind: 'sim',
          sim: 'control-flow-narrowing',
          caption: {
            en: 'Step a snippet line by line and watch the tracked variable narrow. Try `typeof`, `in`, `instanceof`, an assertion function, and the discriminated-union presets that end in `never`.',
            uk: 'Крокуйте фрагментом рядок за рядком і дивіться, як звужується змінна. Спробуйте `typeof`, `in`, `instanceof`, assertion function та discriminated-union пресети, що завершуються `never`.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `function pad(value: string | number, padding: number) {
  // value: string | number
  if (typeof value === 'number') {
    return ' '.repeat(padding) + value;  // value: number — narrowed on this path
  }
  return value.padStart(padding);        // value: string — number was ruled out
}

// typeof recognises exactly eight strings — and typeof null is "object":
function first(x: string[] | null) {
  if (typeof x === 'object') {
    // x: string[] | null  — the guard did NOT remove null (typeof null === "object")
  }
}`,
          note: {
            en: 'The `typeof null === "object"` quirk is the classic narrowing gotcha — reach for `x != null` or `Array.isArray(x)` when you actually mean "not null".',
            uk: 'Квірк `typeof null === "object"` — класична пастка narrowing; коли ви маєте на увазі «не null», беріть `x != null` чи `Array.isArray(x)`.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Guard', uk: 'Guard' },
            { en: 'Narrows by', uk: 'Звужує за' },
            { en: 'Watch out', uk: 'Обережно' },
          ],
          rows: [
            [
              { en: '`typeof x`', uk: '`typeof x`' },
              { en: 'The 8 primitive tags', uk: '8 примітивних тегів' },
              { en: '`typeof null === "object"`', uk: '`typeof null === "object"`' },
            ],
            [
              { en: '`x instanceof C`', uk: '`x instanceof C`' },
              { en: 'The prototype chain', uk: 'Ланцюг прототипів' },
              { en: 'Fails across realms/iframes', uk: 'Ламається між realm/iframe' },
            ],
            [
              { en: '`"k" in x`', uk: '`"k" in x`' },
              { en: 'Property presence', uk: 'Наявність властивості' },
              { en: 'Optional keys sit on both sides', uk: 'Опційні ключі — по обидва боки' },
            ],
            [
              { en: '`x === literal`', uk: '`x === literal`' },
              { en: 'Equality to a value', uk: 'Рівність значенню' },
              { en: '`== null` also catches `undefined`', uk: '`== null` ловить і `undefined`' },
            ],
          ],
        },
      ],
    },
    // ── Topic 2 ───────────────────────────────────────────────────────────────
    {
      id: 't2-truthiness-equality',
      title: { en: 'Truthiness & equality (and their traps)', uk: 'Truthiness та рівність (та їхні пастки)' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "A bare `if (x)` narrows by **truthiness**, removing the always-falsy members — `null`, `undefined`, `false`, `0`, `\"\"`, `0n`, `NaN`. That is perfect for filtering out `null | undefined`, but a **trap on primitives**: for `number | undefined`, `if (n)` sends `undefined` *and the valid value `0`* to the `else` branch, because `0` is falsy. **Equality** narrowing is often the precise tool instead — and it has a quiet superpower: `x != null` removes **both** `null` and `undefined` in a single check (loose equality treats them as equal), which is why the `!= null` idiom is so common.",
            uk: "Голий `if (x)` звужує за **truthiness**, прибираючи завжди-falsy члени — `null`, `undefined`, `false`, `0`, `\"\"`, `0n`, `NaN`. Це ідеально для відсіювання `null | undefined`, але **пастка на примітивах**: для `number | undefined` вираз `if (n)` відправляє `undefined` *і валідне значення `0`* у гілку `else`, бо `0` — falsy. **Рівність** часто є точнішим інструментом — і має тиху суперсилу: `x != null` прибирає **обидва** `null` і `undefined` за одну перевірку (нестрога рівність вважає їх рівними), тому ідіома `!= null` така поширена.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// == null / != null removes BOTH null and undefined at once:
function trimmed(s: string | null | undefined) {
  if (s != null) {
    return s.trim();   // s: string
  }
  return '';           // s: null | undefined
}

// truthiness is a trap on numbers — 0 is falsy:
function width(n: number | undefined) {
  if (n) {             // n: number in here…
    return n;
  }
  return 100;          // …but n === 0 ALSO lands here, silently defaulting a valid width
}`,
          note: {
            en: 'Prefer an explicit `n !== undefined` (or `n == null`) over `if (n)` whenever `0`, `""` or `false` is a legal value you must keep.',
            uk: 'Віддавайте перевагу явному `n !== undefined` (чи `n == null`) над `if (n)`, коли `0`, `""` чи `false` — легальні значення, які треба зберегти.',
          },
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: { en: 'Truthiness ≠ "is defined"', uk: 'Truthiness ≠ «визначено»' },
          md: {
            en: 'The handbook flags bare truthiness checks on primitives as error-prone for exactly this reason. `if (value)` conflates "present" with "non-zero / non-empty". When you mean "has a value", say it: `value !== undefined`, `value != null`, or `Number.isFinite(value)` for numbers.',
            uk: 'Handbook позначає голі truthiness-перевірки на примітивах як схильні до помилок саме тому. `if (value)` змішує «присутнє» з «не-нуль / не-порожнє». Коли маєте на увазі «має значення» — скажіть це: `value !== undefined`, `value != null` чи `Number.isFinite(value)` для чисел.',
          },
        },
      ],
    },
    // ── Topic 3 ───────────────────────────────────────────────────────────────
    {
      id: 't3-discriminated-unions',
      title: { en: 'Discriminated unions', uk: 'Discriminated unions' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "The most powerful narrowing pattern is the **discriminated (tagged) union**: several object types that share one common property with **literal** types — a `kind`, `type`, or `status` tag. Because the tag values are distinct literals, a single `switch (s.kind)` (or `if`) narrows the whole union to exactly one member in each arm, unlocking that member's fields. This is how you model *mutually-exclusive states* so the wrong combination cannot even be written — a loading state that carries no data, an error state that carries an error.",
            uk: "Найпотужніший патерн narrowing — **discriminated (tagged) union**: кілька обʼєктних типів зі спільною властивістю **літеральних** типів — тегом `kind`, `type` чи `status`. Оскільки значення тегів — різні літерали, один `switch (s.kind)` (чи `if`) звужує весь union рівно до одного члена в кожній гілці, відкриваючи його поля. Саме так моделюють *взаємовиключні стани*, щоб хибну комбінацію не можна було навіть записати — стан loading, що не несе даних, стан error, що несе помилку.",
          },
        },
        {
          kind: 'figure',
          fig: 'narrowing-funnel',
          caption: {
            en: 'Each `case` on the discriminant peels one member off the union; after the last, nothing remains — the type is `never`, which makes the default arm provably unreachable.',
            uk: 'Кожен `case` за дискримінантом відсіює один член union; після останнього не лишається нічого — тип стає `never`, що робить гілку default доказово недосяжною.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `type Shape =
  | { kind: 'circle'; r: number }
  | { kind: 'square'; side: number };

function area(s: Shape) {
  switch (s.kind) {
    case 'circle': return Math.PI * s.r ** 2;  // s: { kind: 'circle'; r: number }
    case 'square': return s.side ** 2;         // s: { kind: 'square'; side: number }
  }
}`,
          note: {
            en: 'The discriminant must be a literal type. If you build the object dynamically, keep the tag narrow with `as const` (3.4) or `satisfies` (4.9) so it stays `\'circle\'`, not `string`.',
            uk: 'Дискримінант має бути літеральним типом. Якщо будуєте обʼєкт динамічно, тримайте тег вузьким через `as const` (3.4) чи `satisfies` (4.9), щоб він лишався `\'circle\'`, а не `string`.',
          },
        },
        {
          kind: 'callout',
          tone: 'senior',
          title: { en: 'Make impossible states unrepresentable', uk: 'Зробіть неможливі стани невиразними' },
          md: {
            en: 'Model UI/async state as `{ status: "loading" } | { status: "ok"; data: T } | { status: "error"; error: E }`, not a bag of optional booleans (`isLoading`, `data?`, `error?`). The discriminated union makes "loading *with* data" or "ok *with* an error" unrepresentable, and narrowing gives you the right fields in each branch for free.',
            uk: 'Моделюйте UI/async-стан як `{ status: "loading" } | { status: "ok"; data: T } | { status: "error"; error: E }`, а не мішок опційних булевих (`isLoading`, `data?`, `error?`). Discriminated union робить «loading *з* даними» чи «ok *з* помилкою» невиразними, а narrowing безкоштовно дає правильні поля в кожній гілці.',
          },
        },
      ],
    },
    // ── Topic 4 ───────────────────────────────────────────────────────────────
    {
      id: 't4-predicates-assertions',
      title: { en: 'Type predicates & assertion functions', uk: 'Type predicates та assertion functions' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "When a check is too complex for a built-in guard, you can teach the compiler with a **user-defined type guard** — a function whose return type is a **type predicate** `pet is Fish`. A `true` result narrows the argument to `Fish` at the call site, which is what makes `array.filter(isFish)` return `Fish[]`. Since **TypeScript 5.5**, the compiler *infers* the predicate automatically for a simple boolean-returning function (no explicit annotation needed), so `filter(x => x !== undefined)` now yields `T[]` instead of `(T | undefined)[]`. For the *throw-or-continue* case there are **assertion functions** (`asserts`, **TS 3.7**): `assert(cond)` narrows for the rest of the scope if it returns, and `assertIsString(x): asserts x is string` narrows a specific type.",
            uk: "Коли перевірка складніша за вбудований guard, компілятор можна навчити **user-defined type guard** — функцією, чий тип повернення є **type predicate** `pet is Fish`. Результат `true` звужує аргумент до `Fish` у місці виклику — саме тому `array.filter(isFish)` повертає `Fish[]`. Починаючи з **TypeScript 5.5**, компілятор *виводить* предикат автоматично для простої функції, що повертає boolean (без явної анотації), тож `filter(x => x !== undefined)` тепер дає `T[]` замість `(T | undefined)[]`. Для випадку *кинути-або-продовжити* є **assertion functions** (`asserts`, **TS 3.7**): `assert(cond)` звужує на решту scope, якщо повертається, а `assertIsString(x): asserts x is string` звужує конкретний тип.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// user-defined type guard — the 'pet is Fish' return type:
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
const fish = pets.filter(isFish); // Fish[]

// TS 5.5 INFERS the predicate for a simple boolean function — no annotation:
const defined = [1, 2, undefined, 4].filter((x) => x !== undefined); // number[]

// assertion functions (asserts, 3.7): throw, or narrow the rest of the scope
function assert(cond: unknown, msg?: string): asserts cond {
  if (!cond) throw new Error(msg);
}
function assertIsString(v: unknown): asserts v is string {
  if (typeof v !== 'string') throw new Error('not a string');
}`,
          note: {
            en: 'An inferred predicate requires a single-return, non-mutating function whose result is tied to a refinement of the parameter — otherwise annotate `x is T` explicitly.',
            uk: 'Виведений предикат вимагає функції з єдиним return, без мутацій, чий результат повʼязаний з уточненням параметра — інакше анотуйте `x is T` явно.',
          },
        },
        {
          kind: 'callout',
          tone: 'security',
          title: { en: 'A hand-written predicate is a promise the compiler trusts', uk: 'Написаний вручну предикат — це обіцянка, якій компілятор вірить' },
          md: {
            en: "`pet is Fish` and `asserts x is string` are **unchecked assertions**: the compiler believes your `return` without verifying it. A buggy predicate (`return true`) silently corrupts every downstream type. For untrusted input, do not hand-roll a predicate over a dozen fields — validate with a runtime schema (zod, class-validator) whose own guard is generated from the schema.",
            uk: "`pet is Fish` та `asserts x is string` — це **неперевірені твердження**: компілятор вірить вашому `return`, не перевіряючи його. Баґнутий предикат (`return true`) тихо псує кожен подальший тип. Для недовіреного входу не пишіть предикат вручну на десяток полів — валідуйте runtime-схемою (zod, class-validator), guard якої згенеровано зі схеми.",
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Tool', uk: 'Інструмент' },
            { en: 'Shape', uk: 'Форма' },
            { en: 'Use when', uk: 'Коли використовувати' },
          ],
          rows: [
            [
              { en: 'Type predicate', uk: 'Type predicate' },
              { en: '`x is T` return', uk: 'Повернення `x is T`' },
              { en: 'A boolean test you branch on / filter by', uk: 'Boolean-перевірка для гілки / filter' },
            ],
            [
              { en: 'Inferred predicate (5.5)', uk: 'Inferred predicate (5.5)' },
              { en: 'Plain `=> boolean`', uk: 'Простий `=> boolean`' },
              { en: 'Simple one-liners; let TS infer it', uk: 'Прості однорядкові; хай TS виведе' },
            ],
            [
              { en: 'Assertion function (3.7)', uk: 'Assertion function (3.7)' },
              { en: '`asserts …`', uk: '`asserts …`' },
              { en: 'Throw on failure, narrow after', uk: 'Кинути при невдачі, звузити після' },
            ],
          ],
        },
      ],
    },
    // ── Topic 5 ───────────────────────────────────────────────────────────────
    {
      id: 't5-exhaustiveness',
      title: { en: 'Exhaustiveness, `never` & the limits of narrowing', uk: 'Exhaustiveness, `never` та межі narrowing' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "When narrowing removes every member of a union, the type is **`never`** — the empty set. This gives you a **compile-time exhaustiveness check**: assign the switch subject to a `never` in the `default` arm, and the day someone adds a new union member without a matching `case`, that assignment fails to compile (`Type 'Triangle' is not assignable to type 'never'`). It turns \"I forgot a case\" from a runtime surprise into a red squiggle. Two limits to remember: narrowing is **erased at runtime** (the guards run as real JS, but no type survives the emit), and it **does not cross a closure boundary** — a variable that might be reassigned reverts to its declared type inside a callback.",
            uk: "Коли narrowing прибирає всі члени union, тип стає **`never`** — порожньою множиною. Це дає **compile-time перевірку вичерпності**: присвойте субʼєкт switch до `never` у гілці `default`, і того дня, коли хтось додасть новий член union без відповідного `case`, це присвоєння не скомпілюється (`Type 'Triangle' is not assignable to type 'never'`). Так «я забув case» перетворюється з runtime-сюрпризу на червону підкреслку. Дві межі, які варто памʼятати: narrowing **стирається в runtime** (guards виконуються як справжній JS, але жоден тип не переживає emit), і воно **не перетинає межу closure** — змінна, яку могли б переприсвоїти, повертається до оголошеного типу всередині callback.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `type Shape = Circle | Square | Triangle;

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle':   return Math.PI * s.r ** 2;
    case 'square':   return s.side ** 2;
    case 'triangle': return (s.base * s.height) / 2;
    default:
      const _exhaustive: never = s; // add a 4th Shape → this line stops compiling
      return _exhaustive;
  }
}

// narrowing does NOT survive a closure if the variable could be reassigned:
let x: string | number = getInput();
if (typeof x === 'string') {
  setTimeout(() => x.toUpperCase()); // ✗ x is string | number again inside the callback
}
const s = typeof x === 'string' ? x : String(x);
setTimeout(() => s.toUpperCase());   // ✓ copy the narrowed value into a const first`,
          note: {
            en: 'The `never` default is the single highest-leverage line in a discriminated-union codebase — it makes adding a case a compile error until every switch is updated.',
            uk: 'Гілка `never` у default — найважливіший один рядок у кодовій базі з discriminated unions: додавання case стає compile-помилкою, поки не оновлять кожен switch.',
          },
        },
        {
          kind: 'compare',
          a: { en: 'Truthiness `if (x)`', uk: 'Truthiness `if (x)`' },
          b: { en: 'Explicit `x != null`', uk: 'Явне `x != null`' },
          rows: [
            [
              { en: 'Removes', uk: 'Прибирає' },
              { en: 'All falsy: 0, "", false, null, undefined', uk: 'Усі falsy: 0, "", false, null, undefined' },
              { en: 'Only null & undefined', uk: 'Лише null і undefined' },
            ],
            [
              { en: 'Keeps `0` / `""`?', uk: 'Зберігає `0` / `""`?' },
              { en: 'No — sent to else', uk: 'Ні — у гілку else' },
              { en: 'Yes — a valid value', uk: 'Так — валідне значення' },
            ],
            [
              { en: 'Use for', uk: 'Використовувати для' },
              { en: 'Objects you know are non-empty', uk: 'Обʼєктів, які точно не порожні' },
              { en: 'Nullable primitives', uk: 'Nullable-примітивів' },
            ],
          ],
        },
      ],
    },
  ],

  keyPoints: [
    {
      en: 'Narrowing = the compiler refining a union to a specific member along a code path via control-flow analysis.',
      uk: 'Narrowing = компілятор уточнює union до конкретного члена вздовж шляху коду через control-flow analysis.',
    },
    {
      en: 'Guards are plain JS read statically: `typeof`, `instanceof`, `in`, equality and truthiness — mind `typeof null === "object"`.',
      uk: 'Guards — це звичайний JS, читаний статично: `typeof`, `instanceof`, `in`, рівність і truthiness — памʼятайте `typeof null === "object"`.',
    },
    {
      en: '`x != null` drops both null and undefined; bare `if (x)` also drops `0`/`""`/`false` — a trap on primitives.',
      uk: '`x != null` прибирає і null, і undefined; голий `if (x)` прибирає ще й `0`/`""`/`false` — пастка на примітивах.',
    },
    {
      en: 'Discriminated unions narrow a whole union by one literal tag — the way to make impossible states unrepresentable.',
      uk: 'Discriminated unions звужують весь union за одним літеральним тегом — спосіб зробити неможливі стани невиразними.',
    },
    {
      en: 'Type predicates (`x is T`), inferred predicates (5.5) and assertion functions (`asserts`, 3.7) extend narrowing to custom checks.',
      uk: 'Type predicates (`x is T`), inferred predicates (5.5) та assertion functions (`asserts`, 3.7) розширюють narrowing на власні перевірки.',
    },
    {
      en: 'An exhausted union is `never`; a `const _: never = x` default makes a missing case a compile error. Narrowing is erased at runtime and does not cross closures.',
      uk: 'Вичерпаний union — це `never`; гілка `const _: never = x` робить пропущений case compile-помилкою. Narrowing стирається в runtime і не перетинає closures.',
    },
  ],

  pitfalls: [
    {
      title: { en: 'Using `typeof x === "object"` to mean "not null"', uk: 'Вживати `typeof x === "object"` як «не null»' },
      body: {
        en: '`typeof null` is `"object"`, so the guard keeps `null` in the narrowed type. Use `x != null`, an explicit `x !== null`, or `Array.isArray(x)` for arrays.',
        uk: '`typeof null` — це `"object"`, тож guard лишає `null` у звуженому типі. Використовуйте `x != null`, явне `x !== null` чи `Array.isArray(x)` для масивів.',
      },
    },
    {
      title: { en: 'Truthiness-checking a number or string', uk: 'Truthiness-перевірка числа чи рядка' },
      body: {
        en: '`if (count)` treats `0` as absent and `if (name)` treats `""` as absent. When zero or empty is a legal value, narrow with `!== undefined` / `!= null` instead.',
        uk: '`if (count)` вважає `0` відсутнім, а `if (name)` — `""` відсутнім. Коли нуль чи порожнє — легальне значення, звужуйте через `!== undefined` / `!= null`.',
      },
    },
    {
      title: { en: 'A discriminant widened to `string`', uk: 'Дискримінант, розширений до `string`' },
      body: {
        en: 'If the tag is inferred as `string` (built dynamically without `as const`/`satisfies`), the union will not narrow. Keep the tag a literal type.',
        uk: 'Якщо тег виведено як `string` (побудований динамічно без `as const`/`satisfies`), union не звузиться. Тримайте тег літеральним типом.',
      },
    },
    {
      title: { en: 'Expecting a narrowing to survive a callback', uk: 'Очікувати, що narrowing переживе callback' },
      body: {
        en: 'A reassignable variable reverts to its declared type inside a closure, since it might change before the callback runs. Copy the narrowed value into a `const` first.',
        uk: 'Переприсвоювана змінна повертається до оголошеного типу всередині closure, бо може змінитися до запуску callback. Спершу скопіюйте звужене значення в `const`.',
      },
    },
  ],

  interview: [
    {
      q: { en: 'What is control-flow analysis, and name the built-in ways to narrow a type.', uk: 'Що таке control-flow analysis і назвіть вбудовані способи звузити тип.' },
      a: {
        en: 'CFA is the compiler’s reachability walk of your code that tracks and refines each variable’s type at every point along a path. The built-in narrowing constructs are `typeof`, `instanceof`, the `in` operator, truthiness, equality (`===`/`!==`/`==`/`!=`, incl. `switch`), assignments, and user-defined type guards / assertion functions.',
        uk: 'CFA — це обхід коду компілятором за досяжністю, що відстежує й уточнює тип кожної змінної в кожній точці шляху. Вбудовані конструкції narrowing: `typeof`, `instanceof`, оператор `in`, truthiness, рівність (`===`/`!==`/`==`/`!=`, вкл. `switch`), присвоєння та user-defined type guards / assertion functions.',
      },
      level: 'middle',
    },
    {
      q: { en: 'Why does `if (x != null)` remove undefined too, and why prefer it over `if (x)`?', uk: 'Чому `if (x != null)` прибирає й undefined, і чому це краще за `if (x)`?' },
      a: {
        en: 'Loose equality treats `null == undefined` as `true`, so `x != null` excludes both nullish values in one check. Prefer it over `if (x)` because truthiness also removes `0`, `""`, `false` and `NaN`, silently dropping legal primitive values; `!= null` targets exactly the nullish ones.',
        uk: 'Нестрога рівність вважає `null == undefined` за `true`, тож `x != null` виключає обидва nullish за одну перевірку. Це краще за `if (x)`, бо truthiness прибирає ще й `0`, `""`, `false` та `NaN`, тихо втрачаючи легальні примітивні значення; `!= null` цілиться саме в nullish.',
      },
      level: 'senior',
    },
    {
      q: { en: 'How do you get a compile-time exhaustiveness check over a discriminated union?', uk: 'Як отримати compile-time перевірку вичерпності над discriminated union?' },
      a: {
        en: 'Switch on the discriminant, handle each case, and in `default` assign the subject to a `never`: `const _exhaustive: never = s`. When every member is handled the subject narrows to `never` and the assignment is legal; add a member without a case and it narrows to that member, which is not assignable to `never`, so the code fails to compile.',
        uk: 'Зробіть switch за дискримінантом, опрацюйте кожен case, а в `default` присвойте субʼєкт до `never`: `const _exhaustive: never = s`. Коли всі члени опрацьовано, субʼєкт звужується до `never` і присвоєння легальне; додайте член без case — і він звузиться до цього члена, який не assignable до `never`, тож код не скомпілюється.',
      },
      level: 'senior',
    },
    {
      q: { en: 'What changed with inferred type predicates in 5.5, and when do you still annotate `x is T`?', uk: 'Що змінили inferred type predicates у 5.5, і коли ще анотувати `x is T`?' },
      a: {
        en: 'Before 5.5, `arr.filter(x => x !== undefined)` returned `(T | undefined)[]` because the callback’s `boolean` said nothing about the type. TS 5.5 infers a type predicate for a simple function — single return, no mutation, result tied to a refinement of the parameter — so the same filter now yields `T[]`. You still annotate `x is T` explicitly for multi-statement guards, guards that mutate, or when you want the predicate to be part of a documented API contract.',
        uk: 'До 5.5 `arr.filter(x => x !== undefined)` повертав `(T | undefined)[]`, бо `boolean` callback нічого не казав про тип. TS 5.5 виводить type predicate для простої функції — єдиний return, без мутацій, результат повʼязаний з уточненням параметра — тож той самий filter тепер дає `T[]`. Явно анотувати `x is T` варто для багаторядкових guards, guards із мутаціями чи коли предикат має бути частиною задокументованого API-контракту.',
      },
      level: 'staff',
    },
  ],

  seeAlso: ['m1-structural-typing', 'm3-functions-variance', 'm5-generics-conditional-types', 'm10-rxjs-signals'],

  sources: [
    { title: 'TypeScript Handbook — Narrowing', url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html' },
    { title: 'Release Notes — TypeScript 3.7 (assertion functions)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html' },
    { title: 'Release Notes — TypeScript 5.5 (inferred type predicates)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html' },
    { title: 'Announcing TypeScript 5.5 (inferred type predicates)', url: 'https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/' },
    { title: 'Release Notes — TypeScript 4.9 (satisfies operator)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html' },
    { title: 'Release Notes — TypeScript 3.4 (const assertions)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html' },
  ],
};
