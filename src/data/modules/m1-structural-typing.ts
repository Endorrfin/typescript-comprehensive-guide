import type { Module } from '../types';

/*
 * ★ SIGNATURE MODULE (S2) — Structural Typing & Assignability.
 * The foundation of Section I: TypeScript matches SHAPES, not names, and "assignable" is a precise,
 * member-by-member relation you can reason about. Signature sim: 'structural-assignability' (an
 * A-assignable-to-B checker with a reasoning trace). Figure: 'structural-vs-nominal'.
 * All version-sensitive facts web-verified (see sources): const assertions (3.4), satisfies (4.9),
 * strictFunctionTypes (2.6). Excess-property checks per the handbook "Object Types".
 */
export const m1: Module = {
  id: 'm1-structural-typing',
  num: 1,
  section: 's1-type-system',
  order: 1,
  level: 'middle',
  signature: true,
  title: { en: 'Structural Typing & Assignability', uk: 'Structural Typing та Assignability' },
  tagline: {
    en: 'Why TypeScript matches shapes, not names — and what "assignable" really means, member by member.',
    uk: 'Чому TypeScript зіставляє форми, а не імена — і що насправді означає «assignable», член за членом.',
  },
  readMins: 18,
  mentalModel: {
    en: 'If it has the right shape, it fits. TypeScript never checks the name on the box — it checks that every member the target needs is present, with a compatible type.',
    uk: 'Якщо форма підходить — воно пасує. TypeScript не дивиться на назву коробки — він перевіряє, що кожен член, потрібний цілі, присутній і має сумісний тип.',
  },

  topics: [
    // ── Topic 1 ───────────────────────────────────────────────────────────────
    {
      id: 't1-structural-vs-nominal',
      title: { en: 'Shapes, not names', uk: 'Форми, а не імена' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "TypeScript uses a **structural** type system: two types are compatible when their *members line up*, regardless of what they are named or where they were declared. The handbook states the core rule plainly — *x is compatible with y if y has at least the same members as x*. Coming from Java or C#, this is the surprise: there you need `class Dog implements Pet`, an explicit **nominal** declaration, or the compiler rejects the code. In TypeScript a `Dog` is a `Pet` the moment it *has a `name`* — no `implements`, no inheritance, nothing to wire up. People informally call this **duck typing** (\"if it walks and quacks like a duck…\"), though the TypeScript docs use the precise term *structural subtyping*.",
            uk: "TypeScript має **structural** систему типів: два типи сумісні, коли *їхні члени збігаються*, незалежно від того, як вони названі чи де оголошені. Handbook формулює правило прямо — *x сумісний з y, якщо y має щонайменше ті самі члени, що й x*. Для тих, хто прийшов із Java чи C#, це несподіванка: там потрібне `class Dog implements Pet`, явне **nominal**-оголошення, інакше компілятор відкине код. У TypeScript `Dog` стає `Pet` тієї миті, коли він *має `name`* — без `implements`, без наслідування, нічого не треба звʼязувати. Неформально це звуть **duck typing** («якщо воно ходить і крякає, як качка…»), хоча документація TypeScript вживає точний термін *structural subtyping*.",
          },
        },
        {
          kind: 'figure',
          fig: 'structural-vs-nominal',
          caption: {
            en: 'Same Dog, two worlds: TypeScript accepts it as a Pet by shape; a nominal language demands an explicit `implements`.',
            uk: 'Той самий Dog, два світи: TypeScript приймає його як Pet за формою; nominal-мова вимагає явного `implements`.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `interface Pet { name: string }
function greet(pet: Pet) { return \`Hello, \${pet.name}\`; }

// No 'implements Pet' anywhere — compatibility is decided purely by shape:
const dog = { name: 'Rex', breed: 'Collie' };
greet(dog);            // ✓ dog has a string 'name', so it structurally IS a Pet

class Robot { name = 'R2'; serial = 42; }
greet(new Robot());    // ✓ a class instance is just a shape too — the name 'Robot' is irrelevant`,
          note: {
            en: 'A class in TypeScript contributes a *shape*, not a nominal identity. Two unrelated classes with the same members are mutually assignable.',
            uk: 'Клас у TypeScript дає *форму*, а не nominal-ідентичність. Два неповʼязані класи з однаковими членами взаємно assignable.',
          },
        },
        {
          kind: 'callout',
          tone: 'senior',
          title: { en: 'Structural by default, nominal on demand', uk: 'Structural за замовчуванням, nominal — за потреби' },
          md: {
            en: "Sometimes you *want* nominal behavior — a `UserId` that must not be interchangeable with an arbitrary `string`. TypeScript has no built-in nominal types, so engineers simulate one with a **branded type**: `type UserId = string & { readonly __brand: 'UserId' }`. The private brand field has no runtime cost and makes the two structurally distinct.",
            uk: "Іноді nominal-поведінка *потрібна* — `UserId`, який не має бути взаємозамінним із довільним `string`. Вбудованих nominal-типів у TypeScript немає, тож інженери симулюють їх **branded type**: `type UserId = string & { readonly __brand: 'UserId' }`. Приватне brand-поле не має runtime-вартості й робить два типи structurally різними.",
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Question', uk: 'Питання' },
            { en: 'Structural (TypeScript)', uk: 'Structural (TypeScript)' },
            { en: 'Nominal (Java, C#)', uk: 'Nominal (Java, C#)' },
          ],
          rows: [
            [
              { en: 'What makes A compatible with B?', uk: 'Що робить A сумісним із B?' },
              { en: "A has all of B's members", uk: 'A має всі члени B' },
              { en: 'A explicitly declares it extends/implements B', uk: 'A явно оголошує extends/implements B' },
            ],
            [
              { en: 'Does an anonymous object work?', uk: 'Чи працює анонімний обʼєкт?' },
              { en: 'Yes — shape is all that matters', uk: 'Так — важлива лише форма' },
              { en: 'No — it has no declared type', uk: 'Ні — у нього немає оголошеного типу' },
            ],
            [
              { en: 'How to force distinct types?', uk: 'Як зробити типи різними?' },
              { en: 'Add a brand member', uk: 'Додати brand-член' },
              { en: 'Automatic — names differ', uk: 'Автоматично — імена різні' },
            ],
          ],
          caption: {
            en: 'Structural typing models how JavaScript objects are actually used — anonymous, ad-hoc, shaped.',
            uk: 'Structural typing моделює, як обʼєкти JavaScript реально використовуються — анонімно, ad-hoc, за формою.',
          },
        },
      ],
    },
    // ── Topic 2 ───────────────────────────────────────────────────────────────
    {
      id: 't2-assignability',
      title: { en: 'The assignability relation', uk: 'Відношення assignability' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "Assignability answers one question the compiler asks constantly: *can a value of type A be used where type B is expected?* — written `A` **assignable to** `B`, or `A <: B`. It powers assignments, argument passing, return values and the `extends` test inside conditional types. The rule for objects is mechanical: the compiler walks **every member of the target `B`** and checks the **source `A`** has a corresponding member with an assignable type, recursing into each. Crucially it only inspects the *target's* members — **extra members on the source are ignored**. That is why `Dog` (with `name` and `breed`) is assignable to `Pet` (just `name`), but not the other way around.",
            uk: "Assignability відповідає на питання, яке компілятор ставить постійно: *чи можна значення типу A використати там, де очікується тип B?* — записується `A` **assignable до** `B`, або `A <: B`. Це рушій присвоєнь, передавання аргументів, значень повернення і тесту `extends` усередині conditional types. Правило для обʼєктів механічне: компілятор проходить **кожен член цілі `B`** і перевіряє, що **джерело `A`** має відповідний член із assignable-типом, рекурсивно занурюючись у кожен. Важливо, що він дивиться лише на члени *цілі* — **зайві члени джерела ігноруються**. Саме тому `Dog` (з `name` і `breed`) assignable до `Pet` (лише `name`), але не навпаки.",
          },
        },
        {
          kind: 'sim',
          sim: 'structural-assignability',
          caption: {
            en: 'Pick a Source (A) and Target (B) and step the check member by member. Swap ⇄ to see assignability flip direction; toggle "fresh object literal" to switch on the excess-property check.',
            uk: 'Оберіть Source (A) і Target (B) та покроково пройдіть перевірку член за членом. Swap ⇄ показує, як assignability змінює напрям; перемикач «fresh object literal» вмикає excess-property check.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `type Point2D = { x: number; y: number };
type Point3D = { x: number; y: number; z: number };

let p2: Point2D = { x: 1, y: 2 };
let p3: Point3D = { x: 1, y: 2, z: 3 };

p2 = p3;   // ✓ Point3D has every member Point2D requires (the extra 'z' is ignored)
p3 = p2;   // ✗ Property 'z' is missing in type 'Point2D' but required in 'Point3D'`,
          note: {
            en: 'Assignability is directional. "Superset of members" flows into "subset of members", never the reverse — the target sets the requirements.',
            uk: 'Assignability має напрям. «Надмножина членів» тече в «підмножину членів», ніколи не навпаки — вимоги задає ціль.',
          },
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: { en: 'Optional and readonly bend the rule', uk: 'Optional і readonly згинають правило' },
          md: {
            en: 'An **optional** target member (`nick?: string`) need not be present in the source — its obligation is satisfied by absence. And `readonly` is **not** part of assignability: a `readonly` property is assignable to a mutable one and vice-versa, because readonly-ness is a compile-time constraint, not part of the shape. Do not lean on `readonly` for safety across a boundary.',
            uk: '**Optional**-член цілі (`nick?: string`) не мусить бути присутнім у джерелі — його зобовʼязання задовольняє сама відсутність. А `readonly` **не** є частиною assignability: `readonly`-властивість assignable до мутабельної і навпаки, бо readonly — це compile-time-обмеження, а не частина форми. Не покладайтеся на `readonly` для безпеки через межу.',
          },
        },
        {
          kind: 'compare',
          a: { en: 'Subtype compatibility', uk: 'Subtype-сумісність' },
          b: { en: 'Assignment compatibility', uk: 'Assignment-сумісність' },
          rows: [
            [
              { en: 'Where it applies', uk: 'Де застосовується' },
              { en: 'extends clauses, class members', uk: 'extends-клаузи, члени класів' },
              { en: 'Assignments, arguments, returns', uk: 'Присвоєння, аргументи, повернення' },
            ],
            [
              { en: 'Rules for `any`', uk: 'Правила для `any`' },
              { en: 'Stricter — no free `any` bridge', uk: 'Суворіше — без вільного містка `any`' },
              { en: 'Adds "to and from `any`"', uk: 'Додає «to and from `any`»' },
            ],
            [
              { en: 'Day-to-day', uk: 'На щодень' },
              { en: 'Rarely reasoned about directly', uk: 'Рідко розглядають напряму' },
              { en: 'The one you feel in editor errors', uk: 'Та, що відчувається в помилках редактора' },
            ],
          ],
        },
      ],
    },
    // ── Topic 3 ───────────────────────────────────────────────────────────────
    {
      id: 't3-excess-property-checks',
      title: { en: 'Excess-property checks & freshness', uk: 'Excess-property checks та freshness' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "If extra members are always ignored, why does `greet({ name: 'Rex', bark: true })` sometimes error on `bark`? Because object **literals get special treatment**. A *fresh* literal — one written directly at the assignment or call site — undergoes an **excess-property check**: any property the target doesn't declare is flagged (`TS2561: Object literal may only specify known properties`). It is a targeted safety net for the most common real bug — a **typo in an optional property** (`onClick` vs `onClik`) that plain structural rules would silently accept. The check keys off **freshness**: the moment the literal is stored in a variable it is no longer fresh, and the ordinary \"extra members are fine\" rule returns.",
            uk: "Якщо зайві члени завжди ігноруються, чому ж `greet({ name: 'Rex', bark: true })` іноді помиляється на `bark`? Бо обʼєктні **літерали мають особливий режим**. *Свіжий* літерал — записаний прямо в місці присвоєння чи виклику — проходить **excess-property check**: будь-яка властивість, якої ціль не оголошує, підсвічується (`TS2561: Object literal may only specify known properties`). Це точкова страхувальна сітка для найпоширенішого реального баґу — **опечатки в опційній властивості** (`onClick` замість `onClik`), яку звичайні structural-правила тихо прийняли б. Перевірка тримається на **freshness**: щойно літерал збережено у змінну, він більше не свіжий, і повертається звичайне правило «зайві члени — це ок».",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `interface Options { width?: number; height?: number }
declare function make(o: Options): void;

make({ width: 10, heigth: 20 });
//                ~~~~~~ TS2561: 'heigth' does not exist in type 'Options' (a typo, caught!)

// The three documented ways the check is bypassed:
const opts = { width: 10, heigth: 20 };
make(opts);                                  // 1) via a variable — no longer a *fresh* literal
make({ width: 10, heigth: 20 } as Options);  // 2) via a type assertion — you silenced a real typo

interface Loose { width?: number; [key: string]: unknown } // 3) an index signature invites extras
const loose: Loose = { width: 10, heigth: 20 };            // ✓ no error — extras are expected`,
          note: {
            en: 'Bypass #1 is the useful one (compose config from variables); #2 is a smell — a type assertion silences the very typo the check exists to catch.',
            uk: 'Обхід №1 корисний (складати конфіг зі змінних); №2 — запах: type assertion глушить саме ту опечатку, заради якої перевірка й існує.',
          },
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: { en: 'Excess-property errors mean "typo", not "wrong shape"', uk: 'Excess-property помилки означають «опечатка», а не «не та форма»' },
          md: {
            en: "When you hit `TS2561`, the reflex should be *\"did I misspell a key?\"* — not *\"let me add `as Target` to make it go away.\"* The assertion route compiles but re-introduces exactly the bug the compiler just found. If the extra key is genuinely intended, widen the target type (add the property or an index signature) instead of asserting.",
            uk: "Коли ловите `TS2561`, рефлекс має бути *«чи не помилився я в назві ключа?»* — а не *«додам `as Target`, щоб зникло»*. Шлях через assertion компілюється, але повертає рівно той баґ, який компілятор щойно знайшов. Якщо зайвий ключ справді потрібен — розширте цільовий тип (додайте властивість чи index signature), а не робіть assertion.",
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Situation', uk: 'Ситуація' },
            { en: 'Excess property?', uk: 'Excess property?' },
            { en: 'Why', uk: 'Чому' },
          ],
          rows: [
            [
              { en: 'Literal passed directly', uk: 'Літерал переданий напряму' },
              { en: 'Checked → error', uk: 'Перевіряється → помилка' },
              { en: 'The literal is fresh', uk: 'Літерал свіжий' },
            ],
            [
              { en: 'Literal assigned to a variable first', uk: 'Літерал спершу присвоєно змінній' },
              { en: 'Not checked', uk: 'Не перевіряється' },
              { en: 'Freshness is lost on assignment', uk: 'Freshness втрачається при присвоєнні' },
            ],
            [
              { en: 'Target has an index signature', uk: 'Ціль має index signature' },
              { en: 'Not checked', uk: 'Не перевіряється' },
              { en: 'Extra keys are explicitly expected', uk: 'Зайві ключі явно очікувані' },
            ],
          ],
        },
      ],
    },
    // ── Topic 4 ───────────────────────────────────────────────────────────────
    {
      id: 't4-widening-const',
      title: { en: 'Widening, `const` & `satisfies`', uk: 'Widening, `const` та `satisfies`' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "Assignability depends on *what type the compiler inferred in the first place*, and inference **widens** literals by default. `let role = 'admin'` is inferred as `string`, not `\"admin\"`, because a mutable binding is expected to change. A `const` binding cannot change, so `const role = 'admin'` keeps the **literal type** `\"admin\"`. To freeze a whole *object or array* literal, use a **`const` assertion** (`as const`, TS 3.4): it stops all widening, makes properties `readonly`, and turns array literals into `readonly` tuples. When you want to *check* a literal against a type **without** widening it, reach for **`satisfies`** (TS 4.9) — it validates conformance while preserving the precise inferred type.",
            uk: "Assignability залежить від *того, який тип компілятор вивів на самому початку*, а inference за замовчуванням **розширює** (widens) літерали. `let role = 'admin'` виводиться як `string`, а не `\"admin\"`, бо мутабельне звʼязування може змінитися. `const`-звʼязування змінитися не може, тож `const role = 'admin'` зберігає **літеральний тип** `\"admin\"`. Щоб заморозити цілий *обʼєктний чи масивний* літерал, використайте **`const` assertion** (`as const`, TS 3.4): він зупиняє все widening, робить властивості `readonly` і перетворює масивні літерали на `readonly` tuples. Коли треба *перевірити* літерал на відповідність типу **без** widening — беріть **`satisfies`** (TS 4.9): він валідує відповідність, зберігаючи точний виведений тип.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `let a = 'admin';              // widened → string
const b = 'admin';            // literal → "admin"

const xs = ['admin', 'user'];            // string[]
const ys = ['admin', 'user'] as const;   // readonly ["admin", "user"]  (3.4)

type Role = 'admin' | 'user';
// An annotation validates — but WIDENS the value's type to the annotation:
const m1: Record<'home' | 'away', Role> = { home: 'admin', away: 'user' };
//    m1.home is Role, so you lost the fact it is specifically "admin"

// satisfies (4.9) validates the SAME shape but keeps the narrow inferred type:
const m2 = { home: 'admin', away: 'user' } satisfies Record<'home' | 'away', Role>;
//    m2.home is still "admin"; a typo like 'amin' would be caught at the boundary`,
          note: {
            en: 'Rule of thumb: annotate when you want the broad type as the contract; `satisfies` when you want the check *and* the narrow value type for downstream inference.',
            uk: 'Правило: анотуйте, коли контрактом має бути широкий тип; `satisfies` — коли потрібні і перевірка, *і* вузький тип значення для подальшого inference.',
          },
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: { en: '`as const` is not deep-frozen at runtime', uk: '`as const` не «глибоко заморожує» в runtime' },
          md: {
            en: 'A `const` assertion is a **type-level** signal: it changes inferred types and adds `readonly` in the type system, but it emits no `Object.freeze` and does not deeply immutabilize. `arr.push` is a compile error, yet a plain-JS caller with no types can still mutate the array. For real runtime immutability, freeze explicitly.',
            uk: '`const` assertion — це **type-level**-сигнал: він змінює виведені типи й додає `readonly` у системі типів, але не емітить `Object.freeze` і не робить глибокої незмінності. `arr.push` — compile-помилка, проте plain-JS-викликач без типів усе одно змінить масив. Для реальної runtime-незмінності заморожуйте явно.',
          },
        },
      ],
    },
    // ── Topic 5 ───────────────────────────────────────────────────────────────
    {
      id: 't5-compatibility',
      title: { en: 'Objects, functions, arrays & the edges', uk: 'Обʼєкти, функції, масиви та краї' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "The member walk extends to every kind of type. **Arrays** are compatible when their element types are — covariantly, so `Dog[]` is assignable to `Pet[]`. **Functions** have two rules that trip people up: a source function may accept **fewer** parameters than the target (a click handler that ignores its event is a valid `(e) => void`), and the **return** type is checked **covariantly** (returning a `Dog` satisfies a `() => Pet`). Parameter *types* are checked **contravariantly** under `strictFunctionTypes` (TS 2.6) — with one deliberate hole: **methods** stay bivariant so `Array<T>` and friends keep working. (The full variance story is M3.) At the edges sit the three special types: **`unknown`** (the safe top — everything is assignable to it, it to nothing until you narrow), **`never`** (the bottom — assignable to everything, nothing assignable to it), and **`any`**, which opts out of checking in both directions.",
            uk: "Прохід по членах поширюється на кожен вид типу. **Масиви** сумісні, коли сумісні їхні елементи — covariantly, тож `Dog[]` assignable до `Pet[]`. У **функцій** два правила, що спантеличують: джерело-функція може приймати **менше** параметрів, ніж ціль (click-handler, що ігнорує подію, — валідний `(e) => void`), а тип **повернення** перевіряється **covariantly** (повернути `Dog` задовольняє `() => Pet`). *Типи* параметрів перевіряються **contravariantly** під `strictFunctionTypes` (TS 2.6) — з однією навмисною діркою: **методи** лишаються bivariant, щоб `Array<T>` і подібні працювали. (Повна історія variance — це M3.) На краях сидять три особливі типи: **`unknown`** (безпечний top — усе assignable до нього, а він — ні до чого, поки не звузите), **`never`** (bottom — assignable до всього, ніщо не assignable до нього) та **`any`**, що вимикає перевірку в обидва боки.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `type Handler = (e: MouseEvent) => void;
const h1: Handler = () => track('click');     // ✓ a function may ignore its arguments
const h2: Handler = (e) => track(e.type);      // ✓ it uses no more than it is given

// return type is covariant:
const makeDog = (): { name: string; breed: string } => ({ name: 'Rex', breed: 'Collie' });
const makePet: () => { name: string } = makeDog; // ✓ a Dog result satisfies a Pet result

// the top & bottom types:
let u: unknown = JSON.parse(input);  // everything is assignable TO unknown…
// u.toFixed(2);                     // ✗ …but unknown is assignable to nothing until narrowed
function fail(): never { throw new Error(); } // never fits everywhere it appears`,
          note: {
            en: 'The "fewer parameters is fine" rule is why array callbacks like `arr.map(x => x.id)` need not declare the index and array parameters they ignore.',
            uk: 'Правило «менше параметрів — це ок» — саме тому callback-и масивів на кшталт `arr.map(x => x.id)` можуть не оголошувати index та array-параметри, які ігнорують.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Type', uk: 'Тип' },
            { en: 'Assignable TO it', uk: 'Assignable ДО нього' },
            { en: 'Assignable FROM it', uk: 'Assignable ВІД нього' },
          ],
          rows: [
            [
              { en: 'unknown (top)', uk: 'unknown (top)' },
              { en: 'Everything', uk: 'Усе' },
              { en: 'Only unknown / any (narrow first)', uk: 'Лише unknown / any (спершу звузьте)' },
            ],
            [
              { en: 'never (bottom)', uk: 'never (bottom)' },
              { en: 'Only never', uk: 'Лише never' },
              { en: 'Everything', uk: 'Усе' },
            ],
            [
              { en: 'any (escape hatch)', uk: 'any (люк для втечі)' },
              { en: 'Everything', uk: 'Усе' },
              { en: 'Everything except never', uk: 'Усе, крім never' },
            ],
          ],
          caption: {
            en: '`unknown` and `never` are inverses; `any` bypasses the checker entirely — prefer `unknown` at untrusted boundaries.',
            uk: '`unknown` і `never` — інверсії; `any` повністю обходить checker — на недовірених межах віддавайте перевагу `unknown`.',
          },
        },
        {
          kind: 'callout',
          tone: 'security',
          title: { en: 'Assignability is compile-time only', uk: 'Assignability існує лише в compile-time' },
          md: {
            en: "Every rule on this page is erased at `tsc` emit. A value that *typechecks* as `User` is not guaranteed to be one at runtime — `JSON.parse` returns `any`, and a cast like `data as User` only silences the compiler. Type untrusted input as **`unknown`** and validate it at the boundary with a runtime schema (zod, class-validator, a DTO + pipe), then let the static type flow *out* of the validator.",
            uk: "Кожне правило на цій сторінці стирається під час emit у `tsc`. Значення, що *проходить перевірку* як `User`, не гарантовано є ним у runtime — `JSON.parse` повертає `any`, а каст `data as User` лише глушить компілятор. Типізуйте недовірений вхід як **`unknown`** і валідуйте його на межі runtime-схемою (zod, class-validator, DTO + pipe), а потім дайте статичному типу витікати *з* валідатора.",
          },
        },
      ],
    },
  ],

  keyPoints: [
    {
      en: 'TypeScript is structural: A is assignable to B when A has every member B requires, with compatible types — names and declarations are irrelevant.',
      uk: 'TypeScript structural: A assignable до B, коли A має кожен член, потрібний B, із сумісними типами — імена й оголошення не важать.',
    },
    {
      en: 'Assignability is directional and target-driven: only the target’s members are obligations; extra source members are ignored.',
      uk: 'Assignability має напрям і керується ціллю: зобовʼязаннями є лише члени цілі; зайві члени джерела ігноруються.',
    },
    {
      en: 'Fresh object literals get an excess-property check (TS2561) — a typo-catcher; it disappears once the literal is stored in a variable.',
      uk: 'Свіжі обʼєктні літерали проходять excess-property check (TS2561) — ловець опечаток; він зникає, щойно літерал збережено у змінну.',
    },
    {
      en: 'Inference widens literals; `const` keeps a literal, `as const` (3.4) freezes a whole literal, `satisfies` (4.9) checks without widening.',
      uk: 'Inference розширює літерали; `const` зберігає літерал, `as const` (3.4) заморожує цілий літерал, `satisfies` (4.9) перевіряє без widening.',
    },
    {
      en: 'Functions: fewer parameters is fine, returns are covariant, parameters contravariant under strictFunctionTypes (2.6) — but methods stay bivariant.',
      uk: 'Функції: менше параметрів — ок, повернення covariant, параметри contravariant під strictFunctionTypes (2.6) — але методи лишаються bivariant.',
    },
    {
      en: '`unknown` is the safe top type, `never` the bottom; type untrusted input as `unknown` and validate — assignability is erased at runtime.',
      uk: '`unknown` — безпечний top, `never` — bottom; типізуйте недовірений вхід як `unknown` і валідуйте — assignability стирається в runtime.',
    },
  ],

  pitfalls: [
    {
      title: { en: 'Reading assignability in the wrong direction', uk: 'Читати assignability не в той бік' },
      body: {
        en: 'The target sets the requirements. A type with *more* members is assignable to one with fewer, never the reverse. "Bigger fits into smaller" feels backwards until you remember only the target’s members are checked.',
        uk: 'Вимоги задає ціль. Тип із *більшою* кількістю членів assignable до типу з меншою, ніколи не навпаки. «Більше входить у менше» здається дивним, поки не згадаєте: перевіряються лише члени цілі.',
      },
    },
    {
      title: { en: 'Silencing an excess-property error with `as`', uk: 'Глушити excess-property помилку через `as`' },
      body: {
        en: 'A `TS2561` almost always means a misspelled key. Adding `as TargetType` compiles but reintroduces the exact bug. Fix the spelling or widen the target instead.',
        uk: '`TS2561` майже завжди означає неправильно написаний ключ. Додавання `as TargetType` компілюється, але повертає той самий баґ. Виправте написання або розширте ціль.',
      },
    },
    {
      title: { en: 'Expecting `readonly` to block assignment', uk: 'Очікувати, що `readonly` блокує присвоєння' },
      body: {
        en: '`readonly` is not part of the shape for assignability — a `readonly` object is freely assignable to a mutable one. It prevents *you* from writing, not another reference from mutating.',
        uk: '`readonly` не є частиною форми для assignability — `readonly`-обʼєкт вільно assignable до мутабельного. Він заважає писати *вам*, а не іншому посиланню мутувати.',
      },
    },
    {
      title: { en: 'Trusting a typechecked shape at runtime', uk: 'Довіряти перевіреній формі в runtime' },
      body: {
        en: 'Structural checks vanish at emit. `data as User` on a fetch response guarantees nothing. Validate untrusted input with a runtime schema and derive the type from it.',
        uk: 'Structural-перевірки зникають при emit. `data as User` на відповіді fetch нічого не гарантує. Валідуйте недовірений вхід runtime-схемою і виводьте тип із неї.',
      },
    },
  ],

  interview: [
    {
      q: { en: 'What does "structural typing" mean, and how does it differ from nominal typing?', uk: 'Що означає «structural typing» і чим воно відрізняється від nominal?' },
      a: {
        en: 'Structural typing decides compatibility by a type’s members (its shape), not its name or declaration — if a value has everything a target needs, it fits, with no `implements`. Nominal systems (Java, C#) require an explicit declared relationship. TypeScript is structural because JavaScript pervasively uses anonymous, ad-hoc objects; you can simulate nominal typing with a branded type.',
        uk: 'Structural typing вирішує сумісність за членами типу (його формою), а не за імʼям чи оголошенням — якщо значення має все, що потрібно цілі, воно пасує без `implements`. Nominal-системи (Java, C#) вимагають явно оголошеного звʼязку. TypeScript structural, бо JavaScript усюди використовує анонімні ad-hoc обʼєкти; nominal можна симулювати branded-типом.',
      },
      level: 'middle',
    },
    {
      q: { en: 'Extra properties are usually ignored — so why does passing `{ name, extra }` sometimes error?', uk: 'Зайві властивості зазвичай ігноруються — то чому передавання `{ name, extra }` іноді помиляється?' },
      a: {
        en: 'Because of the excess-property check on *fresh* object literals. A literal written directly at a call/assignment site is checked for properties the target doesn’t declare, to catch typos in optional fields. Store the literal in a variable first, add an index signature, or (worst) assert the type, and the check no longer fires — but the first is the only clean bypass.',
        uk: 'Через excess-property check на *свіжих* обʼєктних літералах. Літерал, записаний прямо в місці виклику/присвоєння, перевіряється на властивості, яких ціль не оголошує, щоб ловити опечатки в опційних полях. Збережіть літерал у змінну, додайте index signature або (найгірше) зробіть assertion — і перевірка не спрацює, але чистий обхід лише перший.',
      },
      level: 'senior',
    },
    {
      q: { en: 'When would you use `satisfies` instead of a type annotation?', uk: 'Коли брати `satisfies` замість анотації типу?' },
      a: {
        en: 'When you want to validate a value against a type but keep its *narrow* inferred type for later use. An annotation (`const x: T = …`) widens `x` to `T`; `satisfies` (`const x = … satisfies T`) checks conformance yet leaves `x` at its most specific type — so literal keys stay literal and downstream inference (e.g. `keyof typeof x`, discriminant narrowing) still works. Introduced in TS 4.9.',
        uk: 'Коли треба перевірити значення на відповідність типу, але зберегти його *вузький* виведений тип для подальшого вжитку. Анотація (`const x: T = …`) розширює `x` до `T`; `satisfies` (`const x = … satisfies T`) перевіряє відповідність, лишаючи `x` максимально конкретним — тож літеральні ключі лишаються літеральними, а подальший inference (напр. `keyof typeof x`, звуження за дискримінантом) працює. Зʼявився в TS 4.9.',
      },
      level: 'senior',
    },
    {
      q: { en: 'Why can two functions with different parameter counts be assignable, and where does `strictFunctionTypes` change things?', uk: 'Чому дві функції з різною кількістю параметрів можуть бути assignable, і де `strictFunctionTypes` щось змінює?' },
      a: {
        en: 'A source function may take fewer parameters than the target, because ignoring arguments is always safe — that’s why `arr.map(x => …)` can omit index/array. Return types are covariant. Parameter *types* are bivariant by default, but `strictFunctionTypes` (TS 2.6, part of `strict`) checks function-type parameters contravariantly for soundness — deliberately excluding methods, which stay bivariant so generic collections like `Array<T>` keep relating covariantly.',
        uk: 'Джерело-функція може брати менше параметрів, ніж ціль, бо ігнорувати аргументи завжди безпечно — тому `arr.map(x => …)` може опустити index/array. Типи повернення covariant. *Типи* параметрів за замовчуванням bivariant, але `strictFunctionTypes` (TS 2.6, частина `strict`) перевіряє параметри функціональних типів contravariantly задля коректності — навмисно виключаючи методи, що лишаються bivariant, аби generic-колекції на кшталт `Array<T>` співвідносились covariantly.',
      },
      level: 'staff',
    },
  ],

  seeAlso: ['m2-narrowing', 'm3-functions-variance', 'm5-generics-conditional-types', 'm7-utility-types'],

  sources: [
    { title: 'TypeScript Handbook — Type Compatibility', url: 'https://www.typescriptlang.org/docs/handbook/type-compatibility.html' },
    { title: 'TypeScript Handbook — Object Types (excess property checks)', url: 'https://www.typescriptlang.org/docs/handbook/2/objects.html' },
    { title: 'TypeScript Handbook — Everyday Types', url: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html' },
    { title: 'Release Notes — TypeScript 3.4 (const assertions)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html' },
    { title: 'Release Notes — TypeScript 4.9 (satisfies operator)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html' },
    { title: 'Release Notes — TypeScript 2.6 (strictFunctionTypes)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-6.html' },
  ],
};
