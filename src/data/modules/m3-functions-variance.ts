import type { Module } from '../types';

/*
 * M3 (S5) — Functions, Overloads & Variance. Completes Section I.
 * Diagram-first (no signature sim — CURRICULUM marks M3 '—'). Two figures:
 * 'variance-directions' (co/contra/invariant over Dog <: Animal) and 'overload-resolution'
 * (first-match-wins). Builds directly on M1's function-compatibility teaser ("the full variance
 * story is M3"). All version-sensitive facts web-verified (see sources): strictFunctionTypes (2.6,
 * methods stay bivariant), optional variance annotations in/out (4.7), the () => void assignability
 * rule, overload resolution order, current TS 6.0 stable / 7.0 Go-native RC (Jun 2026).
 */
export const m3: Module = {
  id: 'm3-functions-variance',
  num: 3,
  section: 's1-type-system',
  order: 3,
  level: 'senior',
  title: { en: 'Functions, Overloads & Variance', uk: 'Функції, Overloads та Variance' },
  tagline: {
    en: 'When one function can safely stand in for another — parameter contravariance, overload resolution, and where variance bites.',
    uk: 'Коли одна функція може безпечно підмінити іншу — контраваріантність параметрів, розвʼязання overload-ів і де кусає variance.',
  },
  readMins: 20,
  mentalModel: {
    en: 'A function is safe to substitute when it asks for no more and promises no less: it may accept fewer (or wider) parameters, and must return the same or a more specific type.',
    uk: 'Функцію безпечно підставити, коли вона просить не більше і обіцяє не менше: вона може приймати менше (або ширші) параметри й мусить повертати той самий чи конкретніший тип.',
  },

  topics: [
    // ── Topic 1 ───────────────────────────────────────────────────────────────
    {
      id: 't1-functions-as-shapes',
      title: { en: 'Functions are shapes too: substitutability', uk: 'Функції — теж форми: підставність' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "A function type is a contract with two halves: the parameters say *what the function demands of its caller*, and the return type says *what it promises back*. Structural assignability (M1) extends to that contract with one guiding question — *can this function be called everywhere the target type can?* The answer is the mental model for the whole module: **a function is substitutable when it asks for no more and promises no less.** Two mechanical rules fall out of it. First, a source function may accept **fewer parameters** than the target, because ignoring arguments is always safe — that is why `arr.map(x => x.id)` need not declare the index and array parameters it never uses. Second, the **return type is covariant** — returning a `Dog` satisfies a target that promises an `Animal`, because a more specific promise is still a kept promise.",
            uk: "Тип функції — це контракт із двох половин: параметри кажуть, *чого функція вимагає від викликача*, а тип повернення — *що вона обіцяє назад*. Structural assignability (M1) поширюється на цей контракт з одним провідним питанням — *чи можна викликати цю функцію всюди, де можна ціль?* Відповідь і є ментальною моделлю всього модуля: **функція підставна, коли просить не більше і обіцяє не менше.** Звідси два механічні правила. По-перше, джерело-функція може приймати **менше параметрів**, ніж ціль, бо ігнорувати аргументи завжди безпечно — саме тому `arr.map(x => x.id)` може не оголошувати index та array-параметри, яких не вживає. По-друге, **тип повернення covariant** — повернути `Dog` задовольняє ціль, що обіцяє `Animal`, бо конкретніша обіцянка — теж виконана обіцянка.",
          },
        },
        {
          kind: 'figure',
          fig: 'variance-directions',
          caption: {
            en: 'One base relation, Dog <: Animal, produces three derived directions: covariant in the return position (same way), contravariant in the parameter position (reversed), and invariant for a mutable container (neither).',
            uk: 'Одне базове відношення, Dog <: Animal, дає три похідні напрями: covariant у позиції повернення (той самий бік), contravariant у позиції параметра (обернений) та invariant для мутабельного контейнера (жоден).',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `class Animal { move() {} }
class Dog extends Animal { bark() {} }

// 1) A source function may accept FEWER parameters — ignoring arguments is safe:
type Click = (e: MouseEvent) => void;
const onClick: Click = () => track('clicked');   // ✓ it uses no more than it is given

// 2) The return type is COVARIANT — "promise no less":
const getDog = (): Dog => new Dog();
const getAnimal: () => Animal = getDog;           // ✓ a Dog result satisfies an Animal result

// 3) The void-return rule: a value-returning function fits a () => void slot:
const out: number[] = [];
[1, 2, 3].forEach((n) => out.push(n));            // push returns number; forEach wants void — allowed`,
          note: {
            en: 'Rule 3 is why `array.forEach(x => set.add(x))` type-checks even though `Set.add` returns the set — the callback’s result is simply discarded.',
            uk: 'Правило 3 — саме тому `array.forEach(x => set.add(x))` проходить перевірку, хоча `Set.add` повертає set: результат callback-а просто відкидається.',
          },
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: { en: 'The `() => void` rule cuts one way only', uk: 'Правило `() => void` діє лише в один бік' },
          md: {
            en: "A function type whose return is `void` accepts a source function that returns *any* value — the value is dropped. But this is about the **target type being `void`**, not the implementation: if you *write* a function literal with an explicit `: void` annotation, its body still must not `return` a value. So `const f: () => void = () => 42` is fine (target is `void`), while `function f(): void { return 42 }` is an error (a literal void declaration). The rule exists so callbacks like `Array.prototype.push` can be handed to `Array.prototype.forEach`.",
            uk: "Тип функції з поверненням `void` приймає джерело-функцію, що повертає *будь-яке* значення — значення відкидається. Але це про те, що **ціль має тип `void`**, а не про реалізацію: якщо ви *пишете* функцію-літерал з явною анотацією `: void`, її тіло все одно не має `return`-ити значення. Тож `const f: () => void = () => 42` — ок (ціль `void`), а `function f(): void { return 42 }` — помилка (літеральне void-оголошення). Правило існує, щоб callback-и на кшталт `Array.prototype.push` можна було передати в `Array.prototype.forEach`.",
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Part of the function', uk: 'Частина функції' },
            { en: 'Rule for substitution', uk: 'Правило для підстановки' },
            { en: 'Direction', uk: 'Напрям' },
          ],
          rows: [
            [
              { en: 'Parameter count (arity)', uk: 'Кількість параметрів (arity)' },
              { en: 'Source may take fewer than the target', uk: 'Джерело може брати менше, ніж ціль' },
              { en: 'Fewer is safe', uk: 'Менше — безпечно' },
            ],
            [
              { en: 'Return type', uk: 'Тип повернення' },
              { en: 'Source may return a more specific type', uk: 'Джерело може повертати конкретніший тип' },
              { en: 'Covariant', uk: 'Covariant' },
            ],
            [
              { en: 'Parameter types', uk: 'Типи параметрів' },
              { en: 'Source may accept a wider type (Topic 2)', uk: 'Джерело може приймати ширший тип (Тема 2)' },
              { en: 'Contravariant', uk: 'Contravariant' },
            ],
          ],
          caption: {
            en: 'Substitutability in one table: relax what you demand (parameters), tighten what you promise (return).',
            uk: 'Підставність в одній таблиці: послаблюй те, що вимагаєш (параметри), звужуй те, що обіцяєш (повернення).',
          },
        },
      ],
    },
    // ── Topic 2 ───────────────────────────────────────────────────────────────
    {
      id: 't2-parameter-variance',
      title: { en: 'Parameter variance & `strictFunctionTypes`', uk: 'Variance параметрів та `strictFunctionTypes`' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "Why are parameters **contravariant** — accept *wider*, not narrower? Think about who calls the substitute. A target `(d: Dog) => void` will be invoked with `Dog`s. A function that actually accepts *any* `Animal` handles every one of those `Dog`s and more, so it is a safe stand-in. The reverse is not: a function that demands a `Dog` would break the moment the `Animal`-typed slot passed it a `Cat`. So the sound rule is *a handler of a wider input can replace a handler of a narrower input.* TypeScript did not always enforce this. Before **`strictFunctionTypes` (TS 2.6**, included in `strict`) function parameters were checked **bivariantly** — assignable in *both* directions, which is convenient but unsound. With the flag on, standalone function types are checked contravariantly.",
            uk: "Чому параметри **contravariant** — приймають *ширше*, а не вужче? Подумайте, хто викликає замінника. Ціль `(d: Dog) => void` викликатимуть із `Dog`-ами. Функція, що насправді приймає *будь-який* `Animal`, обробляє кожен із тих `Dog`-ів і більше, тож вона — безпечна підміна. Навпаки — ні: функція, що вимагає `Dog`, зламається тієї миті, коли слот типу `Animal` передасть їй `Cat`. Отже, коректне правило: *обробник ширшого входу може замінити обробник вужчого.* TypeScript не завжди це вимагав. До **`strictFunctionTypes` (TS 2.6**, входить у `strict`) параметри функцій перевірялися **bivariantly** — assignable в *обидва* боки, що зручно, але unsound. З увімкненим прапорцем окремі функціональні типи перевіряються contravariantly.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `type DogHandler = (d: Dog) => void;
type AnimalHandler = (a: Animal) => void;

// Parameters are CONTRAVARIANT under strictFunctionTypes — wider input can stand in:
const hd: DogHandler = (a: Animal) => a.move();   // ✓ an Animal-handler fills a Dog-handler slot
const ha: AnimalHandler = (d: Dog) => d.bark();   // ✗ Error: a Dog-handler cannot fill an Animal slot
//    ha would let a caller pass a Cat, then .bark() explodes — exactly what the check prevents`,
          note: {
            en: 'Read it as data flow: the slot decides what values arrive; the function must be willing to accept at least those. Wider parameters accept more, so they are always safe.',
            uk: 'Читайте як потік даних: слот вирішує, які значення надходять; функція має бути готова прийняти щонайменше їх. Ширші параметри приймають більше, тож вони завжди безпечні.',
          },
        },
        {
          kind: 'callout',
          tone: 'senior',
          title: { en: 'Methods stay bivariant — on purpose', uk: 'Методи лишаються bivariant — навмисно' },
          md: {
            en: "`strictFunctionTypes` has a deliberate hole: it checks parameters contravariantly for **function-typed properties**, but **method and constructor declarations are exempt** and keep bivariant parameters. This is a pragmatic trade: generic collections like `Array<T>` are riddled with methods (`push`, `indexOf`, …), and making them contravariant would stop `Dog[]` from relating to `Animal[]`. The syntax you choose decides which check you get: `interface X { on(cb: (e: E) => void): void }` (method) is bivariant, while `interface X { on: (cb: (e: E) => void) => void }` (property) gets the sound contravariant check. If you want the strict behaviour for a callback field, write it as a **property**, not a method.",
            uk: "`strictFunctionTypes` має навмисну дірку: він перевіряє параметри contravariantly для **властивостей функціонального типу**, але **оголошення методів і конструкторів звільнені** й зберігають bivariant-параметри. Це прагматичний компроміс: generic-колекції на кшталт `Array<T>` рясніють методами (`push`, `indexOf`, …), і зробити їх contravariant означало б, що `Dog[]` перестане співвідноситися з `Animal[]`. Синтаксис, який ви обрали, вирішує, яку перевірку ви отримаєте: `interface X { on(cb: (e: E) => void): void }` (метод) — bivariant, а `interface X { on: (cb: (e: E) => void) => void }` (властивість) — коректна contravariant-перевірка. Якщо хочете суворої поведінки для callback-поля, пишіть його як **властивість**, а не метод.",
          },
        },
        {
          kind: 'compare',
          a: { en: 'Method syntax `on(cb)`', uk: 'Метод-синтаксис `on(cb)`' },
          b: { en: 'Property syntax `on: (cb) => …`', uk: 'Властивість `on: (cb) => …`' },
          rows: [
            [
              { en: 'Parameter check', uk: 'Перевірка параметрів' },
              { en: 'Bivariant (loophole)', uk: 'Bivariant (лазівка)' },
              { en: 'Contravariant (sound)', uk: 'Contravariant (коректно)' },
            ],
            [
              { en: 'Why it exists', uk: 'Чому існує' },
              { en: 'Keeps `Array<T>` & friends covariant', uk: 'Тримає `Array<T>` та подібні covariant' },
              { en: 'Catches unsafe handler swaps', uk: 'Ловить небезпечні заміни обробників' },
            ],
            [
              { en: 'Choose when', uk: 'Обирайте коли' },
              { en: 'Collection / fluent ergonomics', uk: 'Ергономіка колекцій / fluent' },
              { en: 'You want the unsound assignment flagged', uk: 'Хочете, щоб unsound-присвоєння підсвітилось' },
            ],
          ],
        },
      ],
    },
    // ── Topic 3 ───────────────────────────────────────────────────────────────
    {
      id: 't3-overloads',
      title: { en: 'Overloads & resolution', uk: 'Overloads та розвʼязання' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "An **overloaded** function exposes several call signatures over one implementation, so the return type can depend on the argument shape. You write one or more **overload signatures** (no body), then a single **implementation signature** (with the body) that must be broad enough to cover them all. The critical, often-missed rule: the implementation signature is **not visible to callers** — only the overloads are, and TypeScript resolves a call by picking the **first overload that matches**, top to bottom. It does *not* search for the best match. So ordering is load-bearing: put the **most specific signature first**, because a more general earlier overload will shadow a more specific one below it, making the lower one uncallable.",
            uk: "**Overload**-функція виставляє кілька call-сигнатур над однією реалізацією, тож тип повернення може залежати від форми аргументів. Ви пишете одну чи більше **overload-сигнатур** (без тіла), потім єдину **implementation-сигнатуру** (з тілом), достатньо широку, щоб покрити їх усі. Критичне, часто пропущене правило: implementation-сигнатура **не видима викликачам** — видимі лише overload-и, і TypeScript розвʼязує виклик, обираючи **перший overload, що збігається**, згори вниз. Він *не* шукає найкращого збігу. Тож порядок несе навантаження: ставте **найконкретнішу сигнатуру першою**, бо загальніший ранній overload затінить конкретніший нижче, зробивши нижній невикличним.",
          },
        },
        {
          kind: 'figure',
          fig: 'overload-resolution',
          caption: {
            en: 'A call is tested against the overload signatures top to bottom; the first match wins. The implementation signature sits below them and is never a call target.',
            uk: 'Виклик перевіряється проти overload-сигнатур згори вниз; перемагає перший збіг. Implementation-сигнатура стоїть нижче й ніколи не є ціллю виклику.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `function len(s: string): number;              // most specific signatures first
function len(a: unknown[]): number;
function len(x: string | unknown[]): number { // implementation signature — invisible to callers
  return x.length;
}

len('hi');    // ✓ picks the FIRST matching overload → number
len([1, 2]);  // ✓ second overload → number
// len(42);   // ✗ no overload matches; the implementation signature is not a call signature`,
          note: {
            en: 'A common bug: writing `function fn(x: any): any` as the first *overload* (not the impl) — it matches everything, so every later overload is dead. The `any`/broad signature belongs only on the hidden implementation line.',
            uk: 'Типовий баг: написати `function fn(x: any): any` першим *overload*-ом (а не impl) — він збігається з усім, тож кожен наступний overload мертвий. Широка `any`-сигнатура належить лише прихованому рядку реалізації.',
          },
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: { en: 'Prefer a union or generic before reaching for overloads', uk: 'Віддавайте перевагу union чи generic перед overload-ами' },
          md: {
            en: "Overloads duplicate the parameter→return relationship across several lines, and they resolve by position, so they drift and hide each other as they grow. When the return type is a *function of* the input type, a single **generic** or **conditional** signature expresses the link once and resolves without an ordering trap — e.g. `function first<T>(a: T[]): T | undefined` beats two overloads, and a conditional return (`T extends string ? … : …`, M5) can replace a whole overload set. Keep overloads for the genuine case: **unrelated argument shapes that map to unrelated returns** (like the DOM’s `createElement('a')` vs `createElement('div')`).",
            uk: "Overload-и дублюють звʼязок параметр→повернення на кількох рядках і розвʼязуються за позицією, тож із ростом вони розходяться й ховають один одного. Коли тип повернення є *функцією від* типу входу, єдина **generic**- чи **conditional**-сигнатура виражає звʼязок раз і розвʼязується без пастки порядку — напр. `function first<T>(a: T[]): T | undefined` кращий за два overload-и, а conditional-повернення (`T extends string ? … : …`, M5) може замінити цілий набір overload-ів. Лишайте overload-и для справжнього випадку: **непов'язані форми аргументів, що дають непов'язані повернення** (як `createElement('a')` проти `createElement('div')` у DOM).",
          },
        },
      ],
    },
    // ── Topic 4 ───────────────────────────────────────────────────────────────
    {
      id: 't4-generic-variance-annotations',
      title: { en: 'Variance in generics & `in`/`out`', uk: 'Variance у generics та `in`/`out`' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "Variance is not only about functions — it is a property of **every generic type parameter**, decided by *where the parameter is used*. If `T` appears only in **output** positions (return types, readonly members) the type is **covariant** in `T`. If `T` appears only in **input** positions (parameters) it is **contravariant**. If `T` appears in **both** — the classic mutable container with a getter *and* a setter — it is **invariant**: `Box<Dog>` and `Box<Animal>` are unrelated in either direction. TypeScript normally *infers* variance structurally, but since **TS 4.7** you can write it explicitly with the **`out`** and **`in`** modifiers on the type parameter. The annotations are optional and mainly pay off for library authors with deep recursive types: they document intent, and they let the checker compare type arguments directly instead of re-walking the whole structure — a real accuracy and speed win.",
            uk: "Variance стосується не лише функцій — це властивість **кожного generic type-параметра**, визначена тим, *де параметр вжито*. Якщо `T` зʼявляється лише в **output**-позиціях (типи повернення, readonly-члени), тип **covariant** щодо `T`. Якщо `T` лише в **input**-позиціях (параметри) — **contravariant**. Якщо `T` і там, і там — класичний мутабельний контейнер із getter-ом *і* setter-ом — він **invariant**: `Box<Dog>` і `Box<Animal>` не повʼязані в жодному напрямі. TypeScript зазвичай *виводить* variance структурно, але з **TS 4.7** його можна написати явно модифікаторами **`out`** та **`in`** на type-параметрі. Анотації опційні й головно окупаються для авторів бібліотек із глибокими рекурсивними типами: вони документують намір і дають checker-у порівнювати type-аргументи напряму, а не переобходити всю структуру — реальний виграш у точності й швидкості.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `interface Getter<out T> { get(): T }            // T only in OUTPUT  → covariant
interface Setter<in T> { set(value: T): void }  // T only in INPUT   → contravariant
interface Box<in out T> { get(): T; set(v: T): void } // both → INVARIANT

declare let animalBox: Box<Animal>;
declare let dogBox: Box<Dog>;
// animalBox = dogBox; // ✗ not covariant: set(Animal) could put a Cat into a Dog box
// dogBox = animalBox; // ✗ not contravariant: get() would hand back a bare Animal
// invariance = neither assignment is allowed, and 'in out' documents exactly that`,
          note: {
            en: 'An annotation that contradicts real usage is an error: mark a parameter-only `T` as `out` and TypeScript rejects it. The modifiers assert variance; they do not override how `T` is actually used.',
            uk: 'Анотація, що суперечить реальному вжитку, — помилка: позначте `out` параметр-лише `T`, і TypeScript відкине це. Модифікатори стверджують variance; вони не перевизначають те, як `T` реально вживається.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Variance', uk: 'Variance' },
            { en: 'Annotation (4.7)', uk: 'Анотація (4.7)' },
            { en: 'Given Dog <: Animal', uk: 'За Dog <: Animal' },
            { en: 'Where T appears', uk: 'Де зʼявляється T' },
          ],
          rows: [
            [
              { en: 'Covariant', uk: 'Covariant' },
              { en: '`out`', uk: '`out`' },
              { en: 'F<Dog> <: F<Animal>', uk: 'F<Dog> <: F<Animal>' },
              { en: 'Output only (returns, readonly)', uk: 'Лише output (повернення, readonly)' },
            ],
            [
              { en: 'Contravariant', uk: 'Contravariant' },
              { en: '`in`', uk: '`in`' },
              { en: 'F<Animal> <: F<Dog>', uk: 'F<Animal> <: F<Dog>' },
              { en: 'Input only (parameters)', uk: 'Лише input (параметри)' },
            ],
            [
              { en: 'Invariant', uk: 'Invariant' },
              { en: '`in out`', uk: '`in out`' },
              { en: 'Neither direction', uk: 'Жоден напрям' },
              { en: 'Both (mutable container)', uk: 'Обидва (мутабельний контейнер)' },
            ],
            [
              { en: 'Bivariant', uk: 'Bivariant' },
              { en: '— (no annotation)', uk: '— (без анотації)' },
              { en: 'Both (unsound)', uk: 'Обидва (unsound)' },
              { en: 'Method parameters (2.6 loophole)', uk: 'Параметри методів (лазівка 2.6)' },
            ],
          ],
          caption: {
            en: 'Four variances; `in`/`out` let you state the first three explicitly. Bivariance is the pragmatic exception TypeScript keeps for method parameters.',
            uk: 'Чотири variance; `in`/`out` дають перші три виразити явно. Bivariance — прагматичний виняток, який TypeScript тримає для параметрів методів.',
          },
        },
      ],
    },
    // ── Topic 5 ───────────────────────────────────────────────────────────────
    {
      id: 't5-unsound-corners',
      title: { en: 'The unsound corners & safe APIs', uk: 'Unsound-кути та безпечні API' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "TypeScript deliberately trades a little soundness for everyday ergonomics, and knowing exactly *where* keeps you out of trouble. The two famous holes are **array covariance** and **method-parameter bivariance** — both let an assignment through that a fully sound system would reject. The fix is rarely a compiler flag; it is an **API shape** that removes the hole. For collections you don’t mutate, type them as **`ReadonlyArray<T>`** (or `readonly T[]`): a read-only array is covariant *and* safe, because with no `push` there is no way to smuggle in the wrong element. For callbacks you want checked strictly, use a **function-property** field rather than a method. And because every one of these rules is erased at emit, variance never protects you at runtime — it is a compile-time discipline layered on top of plain JavaScript.",
            uk: "TypeScript навмисно міняє трохи коректності на щоденну ергономіку, і знати, *де саме*, — значить не вскочити в халепу. Дві відомі дірки — **array covariance** та **bivariance параметрів методів** — обидві пропускають присвоєння, яке повністю sound-система відкинула б. Виправлення рідко є прапорцем компілятора; це **форма API**, що прибирає дірку. Для колекцій, які ви не мутуєте, типізуйте їх як **`ReadonlyArray<T>`** (або `readonly T[]`): read-only масив covariant *і* безпечний, бо без `push` немає як протягнути неправильний елемент. Для callback-ів, які хочете суворо перевіряти, беріть **функцію-властивість**, а не метод. А оскільки кожне з цих правил стирається при emit, variance ніколи не захищає вас у runtime — це compile-time-дисципліна поверх звичайного JavaScript.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `class Cat extends Animal { meow() {} }

const dogs: Dog[] = [new Dog()];
const animals: Animal[] = dogs;   // ✓ arrays are treated COVARIANTLY — this is allowed…
animals.push(new Cat());          // …and so is this: now 'dogs' secretly holds a Cat 💥
dogs[1].bark();                    // compiles, throws at runtime — the unsound corner

// Make covariance safe by removing mutation:
const safe: readonly Animal[] = dogs;  // ✓ covariant AND sound — no push to corrupt the element type`,
          note: {
            en: 'The array stays a plain JS array at runtime; `readonly` only removes the mutating methods from the *type*. It is enough to close the covariance hole because the hole needs a write.',
            uk: 'Масив лишається звичайним JS-масивом у runtime; `readonly` прибирає мутуючі методи лише з *типу*. Цього досить, щоб закрити дірку covariance, бо дірці потрібен запис.',
          },
        },
        {
          kind: 'callout',
          tone: 'security',
          title: { en: 'Variance is compile-time only — validate at the boundary', uk: 'Variance існує лише в compile-time — валідуйте на межі' },
          md: {
            en: "Because every rule here is erased by `tsc`, a value that *type-checks* as `(x: Animal) => void` might, through a bivariant method or a cast, actually be a function that calls `.bark()`. Types cannot stop that at runtime. At trust boundaries — request handlers, message consumers, plugin callbacks — don’t rely on function-type assignability to guarantee behaviour: validate the shape of untrusted **data** with a runtime schema (zod, class-validator), and treat externally supplied **functions** as capable of anything their broadest signature allows.",
            uk: "Оскільки кожне правило тут стирається `tsc`, значення, що *проходить перевірку* як `(x: Animal) => void`, через bivariant-метод чи cast може насправді бути функцією, що викликає `.bark()`. Типи не спинять це в runtime. На межах довіри — обробники запитів, консюмери повідомлень, plugin-callback-и — не покладайтеся на assignability функціональних типів як гарантію поведінки: валідуйте форму недовірених **даних** runtime-схемою (zod, class-validator), а надані ззовні **функції** вважайте здатними на все, що дозволяє їхня найширша сигнатура.",
          },
        },
      ],
    },
  ],

  keyPoints: [
    {
      en: 'A function is substitutable when it asks no more and promises no less: it may take fewer parameters, and its return type is covariant (more specific is fine).',
      uk: 'Функція підставна, коли просить не більше й обіцяє не менше: може брати менше параметрів, а її тип повернення covariant (конкретніший — ок).',
    },
    {
      en: 'Parameter types are contravariant under `strictFunctionTypes` (2.6, part of `strict`): a handler of a wider input can replace a handler of a narrower one.',
      uk: 'Типи параметрів contravariant під `strictFunctionTypes` (2.6, частина `strict`): обробник ширшого входу може замінити обробник вужчого.',
    },
    {
      en: 'Method & constructor parameters stay bivariant — a deliberate hole so generic collections like `Array<T>` keep relating covariantly; a function-property field gets the strict check.',
      uk: 'Параметри методів і конструкторів лишаються bivariant — навмисна дірка, щоб generic-колекції на кшталт `Array<T>` співвідносились covariantly; функція-властивість отримує сувору перевірку.',
    },
    {
      en: 'A value-returning function is assignable to a `() => void` target (enables `push`→`forEach`); a function literal *declared* `: void` must still not return a value.',
      uk: 'Функція, що повертає значення, assignable до цілі `() => void` (уможливлює `push`→`forEach`); функція-літерал, *оголошений* `: void`, все одно не має повертати значення.',
    },
    {
      en: 'Overloads resolve first-match-wins, not best-match: order signatures most-specific-first; the implementation signature is invisible to callers.',
      uk: 'Overload-и розвʼязуються за принципом перший-збіг-перемагає, а не найкращий: ставте сигнатури найконкретніші першими; implementation-сигнатура невидима викликачам.',
    },
    {
      en: 'A type parameter is covariant (`out`), contravariant (`in`) or invariant (`in out`); TS 4.7 lets you annotate it. Mutable containers are invariant.',
      uk: 'Type-параметр covariant (`out`), contravariant (`in`) чи invariant (`in out`); TS 4.7 дозволяє це анотувати. Мутабельні контейнери invariant.',
    },
  ],

  pitfalls: [
    {
      title: { en: 'Expecting best-match overload resolution', uk: 'Очікувати розвʼязання overload за найкращим збігом' },
      body: {
        en: 'TypeScript picks the first overload that matches, top to bottom. Put a general signature above a specific one and the specific one becomes uncallable. Order most-specific-first, and never make an early overload as broad as the implementation.',
        uk: 'TypeScript обирає перший overload, що збігається, згори вниз. Поставте загальну сигнатуру над конкретною — і конкретна стане невикличною. Впорядковуйте найконкретніші першими й ніколи не робіть ранній overload таким широким, як реалізація.',
      },
    },
    {
      title: { en: 'Trusting array covariance', uk: 'Довіряти array covariance' },
      body: {
        en: '`Dog[]` is assignable to `Animal[]`, but then `animals.push(new Cat())` type-checks and corrupts the original array. Type collections you only read as `readonly T[]` to get covariance without the mutation hole.',
        uk: '`Dog[]` assignable до `Animal[]`, але тоді `animals.push(new Cat())` проходить перевірку й псує оригінальний масив. Типізуйте колекції, які лише читаєте, як `readonly T[]`, щоб мати covariance без дірки мутації.',
      },
    },
    {
      title: { en: 'Assuming a `() => void` callback’s result is enforced', uk: 'Вважати, що результат callback-а `() => void` контролюється' },
      body: {
        en: 'A `() => void` slot accepts a function returning any value — the value is silently dropped, not rejected. If you actually need the return, type the callback with its real return type; `void` explicitly means "I will ignore whatever you return".',
        uk: 'Слот `() => void` приймає функцію, що повертає будь-яке значення — значення тихо відкидається, а не відхиляється. Якщо повернення справді потрібне, типізуйте callback його реальним типом повернення; `void` явно означає «я проігнорую те, що ти повернеш».',
      },
    },
    {
      title: { en: 'Using method syntax when you wanted strict parameter checking', uk: 'Метод-синтаксис там, де хотіли сувору перевірку параметрів' },
      body: {
        en: 'Declaring `on(cb: (e: Wide) => void): void` as a method keeps parameters bivariant, so an unsafe handler slips through. Write the callback holder as a property (`on: (cb: …) => void`) to get the sound contravariant check.',
        uk: 'Оголошення `on(cb: (e: Wide) => void): void` методом лишає параметри bivariant, тож небезпечний обробник прослизне. Пишіть тримач callback-а властивістю (`on: (cb: …) => void`), щоб отримати коректну contravariant-перевірку.',
      },
    },
  ],

  interview: [
    {
      q: { en: 'Why can a function that takes fewer parameters be assigned where a function with more is expected?', uk: 'Чому функцію з меншою кількістю параметрів можна присвоїти там, де очікується функція з більшою?' },
      a: {
        en: 'Because ignoring arguments is always safe. The target’s call sites will pass N arguments; a function that reads only the first few still behaves correctly — it "asks for no more" than it is given. This is why array callbacks like `arr.map(x => x.id)` can omit the index and array parameters. The same intuition (asks no more, promises no less) makes return types covariant.',
        uk: 'Бо ігнорувати аргументи завжди безпечно. Місця виклику цілі передадуть N аргументів; функція, що читає лише перші кілька, все одно поводиться коректно — вона «просить не більше», ніж їй дають. Тому callback-и масивів на кшталт `arr.map(x => x.id)` можуть опускати index та array-параметри. Та сама інтуїція (просити не більше, обіцяти не менше) робить типи повернення covariant.',
      },
      level: 'senior',
    },
    {
      q: { en: 'What does `strictFunctionTypes` change, and why are methods exempt?', uk: 'Що змінює `strictFunctionTypes` і чому методи звільнені?' },
      a: {
        en: 'It checks standalone function-type parameters contravariantly instead of bivariantly (TS 2.6, part of `strict`), so a `(a: Animal) => void` is assignable to a `(d: Dog) => void` but not the reverse — the sound rule. Methods and constructors are deliberately excluded and stay bivariant, because generic collections like `Array<T>` are defined with methods; enforcing contravariance there would break the everyday `Dog[]`→`Animal[]` relationship. To opt a callback into the strict check, declare it as a function-typed property rather than a method.',
        uk: 'Він перевіряє параметри окремих функціональних типів contravariantly замість bivariantly (TS 2.6, частина `strict`), тож `(a: Animal) => void` assignable до `(d: Dog) => void`, але не навпаки — коректне правило. Методи й конструктори навмисно виключені й лишаються bivariant, бо generic-колекції на кшталт `Array<T>` визначені через методи; вимога contravariance там зламала б щоденний звʼязок `Dog[]`→`Animal[]`. Щоб увімкнути сувору перевірку для callback-а, оголосіть його функцією-властивістю, а не методом.',
      },
      level: 'senior',
    },
    {
      q: { en: 'How does TypeScript resolve a call to an overloaded function, and when would you avoid overloads?', uk: 'Як TypeScript розвʼязує виклик overload-функції, і коли варто уникати overload-ів?' },
      a: {
        en: 'It walks the overload signatures top to bottom and uses the first one that matches — first-match-wins, not best-match — so ordering matters and a broad earlier signature hides more specific ones below it. The implementation signature is not a call signature and callers never see it. Avoid overloads when the return is a function of the input: a single generic or conditional-type signature expresses that once, resolves without an ordering trap, and doesn’t drift. Keep overloads for genuinely unrelated argument shapes with unrelated returns.',
        uk: 'Він проходить overload-сигнатури згори вниз і бере першу, що збігається — перший-збіг-перемагає, а не найкращий — тож порядок важить, і широка рання сигнатура ховає конкретніші під нею. Implementation-сигнатура не є call-сигнатурою, і викликачі її не бачать. Уникайте overload-ів, коли повернення є функцією від входу: єдина generic- чи conditional-сигнатура виражає це раз, розвʼязується без пастки порядку й не розходиться. Лишайте overload-и для справді неповʼязаних форм аргументів із неповʼязаними поверненнями.',
      },
      level: 'senior',
    },
    {
      q: { en: 'When would you add `in`/`out` variance annotations, and what does `in out` mean?', uk: 'Коли додавати анотації variance `in`/`out` і що означає `in out`?' },
      a: {
        en: 'Variance annotations (TS 4.7) explicitly mark a type parameter as covariant (`out`, used only in outputs), contravariant (`in`, used only in inputs) or invariant (`in out`, used in both — a mutable container with a getter and setter, so `Box<Dog>` and `Box<Animal>` are unrelated). They’re optional because TypeScript infers variance structurally; you add them in library code with deep recursive generics to document intent and to speed up checking — the compiler can compare type arguments directly instead of re-walking the structure. An annotation that contradicts actual usage is a compile error, so they assert, not override.',
        uk: 'Анотації variance (TS 4.7) явно позначають type-параметр як covariant (`out`, лише в outputs), contravariant (`in`, лише в inputs) чи invariant (`in out`, і там, і там — мутабельний контейнер із getter і setter, тож `Box<Dog>` і `Box<Animal>` неповʼязані). Вони опційні, бо TypeScript виводить variance структурно; додають їх у бібліотечному коді з глибокими рекурсивними generics, щоб документувати намір і пришвидшити перевірку — компілятор порівнює type-аргументи напряму, а не переобходить структуру. Анотація, що суперечить реальному вжитку, — compile-помилка, тож вони стверджують, а не перевизначають.',
      },
      level: 'staff',
    },
  ],

  seeAlso: ['m1-structural-typing', 'm2-narrowing', 'm4-generics', 'm5-generics-conditional-types'],

  sources: [
    { title: 'TypeScript Handbook — More on Functions (overloads, this params, void return)', url: 'https://www.typescriptlang.org/docs/handbook/2/functions.html' },
    { title: 'TypeScript Handbook — Type Compatibility (function compatibility & variance)', url: 'https://www.typescriptlang.org/docs/handbook/type-compatibility.html' },
    { title: 'Release Notes — TypeScript 2.6 (strictFunctionTypes)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-6.html' },
    { title: 'Release Notes — TypeScript 4.7 (optional variance annotations in/out)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html' },
    { title: 'Announcing TypeScript 4.7 — Optional Variance Annotations', url: 'https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/' },
    { title: 'Learning TypeScript — Void-Returning Function Assignability', url: 'https://www.learningtypescript.com/articles/void-returning-function-assignability' },
    { title: 'Announcing TypeScript 7.0 Beta (Go-native compiler; semantics identical to 6.0)', url: 'https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-beta/' },
  ],
};
