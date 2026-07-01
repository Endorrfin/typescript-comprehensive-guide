import type { Module } from '../types';

/*
 * M10 (S7) — Typing RxJS, Signals & Component State. Section III (Applied), order 3. Closes Section III.
 * Diagram-first (no signature sim — CURRICULUM marks M10 '—'). Two figures:
 * 'signals-vs-streams' (a signal is a pull-based memoized cell; an Observable is a push-based stream of
 * emissions over time; toSignal / toObservable bridge them) and 'operator-type-flow' (Observable<string>
 * → map → Observable<number> → filter type-guard → Observable<Even>, OperatorFunction<T,R> threading the
 * types through pipe). All version-sensitive facts web-verified (see sources): RxJS 7.8.x is the current
 * stable line, RxJS 8 is still alpha/on hold pending the TC39 Observable standardization; the core operator
 * type is OperatorFunction<T,R>, filter is MonoTypeOperatorFunction<T> but a type-guard predicate
 * `filter((x): x is U => …)` returns OperatorFunction<T,U> and narrows the stream. Angular 21 signal APIs:
 * signal()/computed()/effect() + linkedSignal() + signal input()/output() are STABLE (graduated in v20);
 * resource()/httpResource() are DEVELOPER PREVIEW in Angular 21; Signal Forms shipped experimental in 21.
 * rxjs-interop: toSignal(obs) → Signal<T|undefined>, with {initialValue:U} → Signal<T|U>, with
 * {requireSync:true} → Signal<T>; toObservable(sig) tracks via an effect + ReplaySubject. TS 6.0 stable /
 * 7.0 Go-native RC (Jun 2026), checking semantics identical.
 */
export const m10: Module = {
  id: 'm10-rxjs-signals',
  num: 10,
  section: 's3-applied',
  order: 3,
  level: 'senior',
  title: { en: 'Typing RxJS, Signals & Component State', uk: 'Типізація RxJS, Signals та стану компонентів' },
  tagline: {
    en: 'Two reactive models with two type stories: streams over time (RxJS) and memoized values (signals) — and how to model UI state so impossible states cannot compile.',
    uk: 'Дві реактивні моделі з двома історіями типів: потоки в часі (RxJS) і memoized-значення (signals) — і як моделювати UI-стан, щоб неможливі стани не компілювались.',
  },
  readMins: 21,
  mentalModel: {
    en: 'A signal is a pull-based cell whose value you read now; an Observable is a push-based stream of values over time. Type the transformation, not the value — `OperatorFunction<T, R>` threads types through a pipe, `computed` derives one signal from another — and model component state as a discriminated union so impossible combinations are unrepresentable.',
    uk: 'Signal — це pull-based комірка, значення якої ви читаєте зараз; Observable — це push-based потік значень у часі. Типізуйте перетворення, а не значення — `OperatorFunction<T, R>` протягує типи крізь pipe, `computed` виводить один signal з іншого — і моделюйте стан компонента як discriminated union, щоб неможливі комбінації не можна було виразити.',
  },

  topics: [
    // ── Topic 1 ───────────────────────────────────────────────────────────────
    {
      id: 't1-two-reactive-models',
      title: { en: 'Two reactive models: streams vs signals', uk: 'Дві реактивні моделі: streams проти signals' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "Angular now carries **two reactive primitives**, and typing them well starts with knowing what each one *is*. An **Observable** (RxJS) is a **push-based stream**: values arrive over time, the stream can complete or error, and nothing happens until you subscribe. Its type, `Observable<T>`, says \"a source that will push zero or more `T`s.\" A **signal** (Angular) is a **pull-based cell**: it holds one current value you read synchronously by calling it — `count()` — and any `computed` or template that read it re-evaluate when it changes. Its type, `Signal<T>` (or `WritableSignal<T>`), says \"a value of `T`, available right now.\" The difference drives the type story. With signals you mostly type *values* and let `computed` infer the rest; with RxJS you type *transformations* — each operator is a function from one stream type to another, and the interesting work is threading those types through a `pipe`. The practical rule of thumb: reach for **signals for synchronous component state** (what the template renders) and **RxJS for asynchronous event streams and coordination** (debounced input, HTTP with retry, websockets, cancellation). They are not rivals — the `rxjs-interop` bridges (Topic 4) let each feed the other.",
            uk: "Angular тепер несе **два реактивні примітиви**, і добра їх типізація починається зі знання, чим кожен *є*. **Observable** (RxJS) — це **push-based потік**: значення надходять у часі, потік може завершитись чи впасти з помилкою, і нічого не стається, доки ви не підпишетесь. Його тип, `Observable<T>`, каже «джерело, що штовхатиме нуль або більше `T`». **Signal** (Angular) — це **pull-based комірка**: вона тримає одне поточне значення, яке ви читаєте синхронно, викликаючи її — `count()` — і будь-який `computed` чи шаблон, що її прочитали, переобчислюються, коли вона змінюється. Його тип, `Signal<T>` (чи `WritableSignal<T>`), каже «значення `T`, доступне просто зараз». Ця різниця веде історію типів. Із signals ви здебільшого типізуєте *значення* й даєте `computed` вивести решту; з RxJS ви типізуєте *перетворення* — кожен оператор це функція з одного типу потоку в інший, і цікава робота — протягнути ці типи крізь `pipe`. Практичне правило: беріть **signals для синхронного стану компонента** (те, що рендерить шаблон) і **RxJS для асинхронних потоків подій та координації** (debounce-інпут, HTTP із retry, websockets, скасування). Вони не суперники — мости `rxjs-interop` (Тема 4) дають кожному живити інший.",
          },
        },
        {
          kind: 'figure',
          fig: 'signals-vs-streams',
          caption: {
            en: 'A signal is a memoized cell you pull a value out of now; an Observable is a stream you subscribe to and that pushes values over time. `toSignal` and `toObservable` bridge the two models, which is why a component can use whichever fits each job.',
            uk: 'Signal — це memoized-комірка, з якої ви тягнете значення зараз; Observable — це потік, на який ви підписуєтесь і який штовхає значення в часі. `toSignal` і `toObservable` мостять дві моделі, тому компонент може вживати те, що пасує кожній задачі.',
          },
        },
        {
          kind: 'compare',
          a: { en: 'Observable<T> (RxJS)', uk: 'Observable<T> (RxJS)' },
          b: { en: 'Signal<T> (Angular)', uk: 'Signal<T> (Angular)' },
          rows: [
            [
              { en: 'Delivery', uk: 'Доставка' },
              { en: 'Push — values arrive over time', uk: 'Push — значення надходять у часі' },
              { en: 'Pull — read the current value now', uk: 'Pull — читаєте поточне значення зараз' },
            ],
            [
              { en: 'Time', uk: 'Час' },
              { en: 'Asynchronous, multi-value, can error/complete', uk: 'Асинхронний, багато значень, error/complete' },
              { en: 'Synchronous, always exactly one value', uk: 'Синхронний, завжди рівно одне значення' },
            ],
            [
              { en: 'You type', uk: 'Ви типізуєте' },
              { en: 'Transformations (`OperatorFunction<T,R>`)', uk: 'Перетворення (`OperatorFunction<T,R>`)' },
              { en: 'Values; `computed` infers the rest', uk: 'Значення; `computed` виводить решту' },
            ],
            [
              { en: 'Best for', uk: 'Найкраще для' },
              { en: 'Async events, HTTP, debounce, cancellation', uk: 'Async-події, HTTP, debounce, скасування' },
              { en: 'Synchronous view state', uk: 'Синхронний стан вигляду' },
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: { en: 'Type the shape of time, not just the payload', uk: 'Типізуйте форму часу, а не лише payload' },
          md: {
            en: "`Observable<User>` and `Signal<User>` both mention `User`, but they promise different things about *when* and *how many*. An `Observable<User>` may emit zero users (and complete), one, or many, and may error — so consuming code must handle absence and failure over time. A `Signal<User>` always has exactly one `User` available synchronously. Confusing them is the source of most interop bugs: people treat a `toSignal` result as always-present and forget it is `User | undefined` until the stream first emits (Topic 4). Read the type as a statement about the shape of time — one-now versus zero-or-more-later — and the correct handling follows.",
            uk: "`Observable<User>` і `Signal<User>` обидва згадують `User`, але обіцяють різне про *коли* й *скільки*. `Observable<User>` може видати нуль користувачів (і завершитись), одного чи багатьох, і може впасти — тож споживчий код мусить обробити відсутність і збій у часі. `Signal<User>` завжди має рівно один `User`, доступний синхронно. Плутати їх — джерело більшості interop-багів: люди сприймають результат `toSignal` як завжди-присутній і забувають, що він `User | undefined`, доки потік уперше не видасть значення (Тема 4). Читайте тип як твердження про форму часу — один-зараз проти нуль-або-більше-потім — і правильна обробка випливе.",
          },
        },
      ],
    },
    // ── Topic 2 ───────────────────────────────────────────────────────────────
    {
      id: 't2-operator-type-flow',
      title: { en: 'RxJS operator type flow through `pipe`', uk: 'Потік типів операторів RxJS крізь `pipe`' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "The whole RxJS type system rests on one alias: **`OperatorFunction<T, R>`** — a function that turns an `Observable<T>` into an `Observable<R>`. `pipe` is just left-to-right composition of these, so the output type of each operator becomes the input type of the next, exactly like function composition, and the final `Observable`'s type is whatever fell out of the last operator. `map((s: string) => s.length)` is an `OperatorFunction<string, number>`, so it turns `Observable<string>` into `Observable<number>`. `filter` is special: normally it is a **`MonoTypeOperatorFunction<T>`** (input and output the same `T`, because filtering removes values but does not change their type) — *unless* you give it a **type-guard predicate**. Writing `filter((x): x is Even => x % 2 === 0)` makes it an `OperatorFunction<number, Even>`, and the stream downstream is narrowed to `Observable<Even>` — the same predicate narrowing from M2, now flowing through a pipe. This is why a well-typed `pipe` needs almost no annotations: each operator's generic parameters are inferred from the callback you pass, and the types thread themselves. On versions: **RxJS 7.8.x** is the current stable line; **RxJS 8** is still in alpha and on hold while the TC39 `Observable` proposal is standardized, so production code today is RxJS 7.",
            uk: "Уся система типів RxJS тримається на одному alias: **`OperatorFunction<T, R>`** — функція, що перетворює `Observable<T>` на `Observable<R>`. `pipe` — це просто композиція їх зліва направо, тож вихідний тип кожного оператора стає вхідним типом наступного, точно як композиція функцій, а тип фінального `Observable` — це те, що випало з останнього оператора. `map((s: string) => s.length)` — це `OperatorFunction<string, number>`, тож він перетворює `Observable<string>` на `Observable<number>`. `filter` особливий: зазвичай це **`MonoTypeOperatorFunction<T>`** (вхід і вихід той самий `T`, бо фільтрація прибирає значення, але не міняє їх тип) — *якщо* ви не дасте йому **type-guard-предикат**. Написання `filter((x): x is Even => x % 2 === 0)` робить його `OperatorFunction<number, Even>`, і потік далі звужується до `Observable<Even>` — те саме звуження предикатом із M2, що тепер тече крізь pipe. Тому добре типізований `pipe` майже не потребує анотацій: generic-параметри кожного оператора виводяться з callback, який ви передаєте, і типи протягуються самі. Про версії: **RxJS 7.8.x** — поточна стабільна лінія; **RxJS 8** досі в alpha й на паузі, доки стандартизують пропозицію TC39 `Observable`, тож продакшн сьогодні — це RxJS 7.",
          },
        },
        {
          kind: 'figure',
          fig: 'operator-type-flow',
          caption: {
            en: 'Types thread through a pipe. Each operator is an `OperatorFunction<T, R>`, so `map` carries `string → number` and a type-guard `filter` narrows `number → Even`. The `Observable`’s type parameter is whatever the last operator produced — inferred, not annotated.',
            uk: 'Типи протягуються крізь pipe. Кожен оператор — `OperatorFunction<T, R>`, тож `map` несе `string → number`, а type-guard `filter` звужує `number → Even`. Параметр типу `Observable` — це те, що дав останній оператор, — виведене, не анотоване.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `import { of, map, filter, type Observable } from 'rxjs';

type Even = number & { __even: true };
const isEven = (n: number): n is Even => n % 2 === 0;

const lengths$: Observable<number> = of('a', 'bb', 'ccc').pipe(
  map((s) => s.length),        // OperatorFunction<string, number>  → Observable<number>
  filter((n) => n > 0),        // MonoTypeOperatorFunction<number>  → still Observable<number>
);

const even$: Observable<Even> = lengths$.pipe(
  filter(isEven),              // OperatorFunction<number, Even>    → Observable<Even> (narrowed, M2)
);

// A reusable, fully-typed custom operator is just an OperatorFunction you name:
const lengthsOf = (): OperatorFunction<string, number> => (src) => src.pipe(map((s) => s.length));`,
          note: {
            en: 'No generic arguments were written by hand — each operator’s `<T, R>` is inferred from its callback, and `pipe` threads output-of-one into input-of-next. The type-guard `filter` is the one that *changes* the element type.',
            uk: 'Жоден generic-аргумент не написаний руками — `<T, R>` кожного оператора виводиться з його callback, а `pipe` протягує вихід-одного у вхід-наступного. Type-guard `filter` — той, що *змінює* тип елемента.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Operator', uk: 'Оператор' },
            { en: 'Type', uk: 'Тип' },
            { en: 'Effect on the element type', uk: 'Вплив на тип елемента' },
          ],
          rows: [
            [
              { en: '`map(fn)`', uk: '`map(fn)`' },
              { en: '`OperatorFunction<T, R>`', uk: '`OperatorFunction<T, R>`' },
              { en: 'Changes `T → R` (fn’s return)', uk: 'Міняє `T → R` (повернення fn)' },
            ],
            [
              { en: '`filter(pred)`', uk: '`filter(pred)`' },
              { en: '`MonoTypeOperatorFunction<T>`', uk: '`MonoTypeOperatorFunction<T>`' },
              { en: 'Keeps `T` (removes values only)', uk: 'Лишає `T` (прибирає лише значення)' },
            ],
            [
              { en: '`filter((x): x is U)`', uk: '`filter((x): x is U)`' },
              { en: '`OperatorFunction<T, U>`', uk: '`OperatorFunction<T, U>`' },
              { en: 'Narrows `T → U` (type guard, M2)', uk: 'Звужує `T → U` (type guard, M2)' },
            ],
            [
              { en: '`switchMap(fn)`', uk: '`switchMap(fn)`' },
              { en: '`OperatorFunction<T, R>`', uk: '`OperatorFunction<T, R>`' },
              { en: 'Flattens `Observable<R>` → `R`', uk: 'Розгортає `Observable<R>` → `R`' },
            ],
          ],
          caption: {
            en: 'The element type is carried by the operator’s type. Only `map`/`switchMap`-style operators and the type-guard `filter` change it; a plain `filter` leaves it alone.',
            uk: 'Тип елемента несе тип оператора. Лише оператори стилю `map`/`switchMap` і type-guard `filter` його міняють; звичайний `filter` лишає незмінним.',
          },
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: { en: '`any` in a pipe poisons every downstream type', uk: '`any` у pipe отруює кожен тип далі' },
          md: {
            en: "Because operators infer their types from their callbacks, one untyped callback silently collapses the rest of the pipe to `any`. A `map((x) => x.foo)` where `x` is `any` (often from an untyped HTTP call — see M9) makes the whole downstream stream `Observable<any>`, and every operator after it stops checking. The fixes: give the source a real element type (type the HTTP response, validate it with a schema at the boundary — M9), or annotate the first callback parameter so inference has somewhere to start. Treat an `Observable<any>` in your editor’s hover as a red flag that a boundary upstream was left untyped, not as a harmless convenience.",
            uk: "Оскільки оператори виводять типи зі своїх callback, один нетипізований callback тихо згортає решту pipe до `any`. `map((x) => x.foo)`, де `x` — `any` (часто з нетипізованого HTTP-виклику — див. M9), робить увесь потік далі `Observable<any>`, і кожен оператор після нього перестає перевіряти. Виправлення: дайте джерелу реальний тип елемента (типізуйте HTTP-відповідь, провалідуйте її схемою на межі — M9) або анотуйте перший параметр callback, щоб inference було звідки почати. Сприймайте `Observable<any>` у підказці редактора як червоний прапорець, що межу вище лишили нетипізованою, а не як безневинну зручність.",
          },
        },
      ],
    },
    // ── Topic 3 ───────────────────────────────────────────────────────────────
    {
      id: 't3-typed-signals',
      title: { en: 'Typed signals: signal, computed, effect', uk: 'Типізовані signals: signal, computed, effect' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "The signal APIs are small and infer cleanly. `signal(0)` returns a **`WritableSignal<number>`** — the initial value fixes `T`; you read with `count()`, write with `.set(v)` or `.update(prev => …)`. `computed(() => count() * 2)` returns a read-only **`Signal<number>`**: its type is inferred from the callback's return, it is **memoized** (recomputes only when a signal it read actually changed) and **lazy** (it does not run until something reads it). `effect(() => …)` also tracks the signals it reads, but it returns nothing and exists for **side effects only** — logging, syncing to `localStorage`, imperatively driving a non-signal library. The single most common design error is using `effect` to *write* one signal from another; that is what `computed` (for derived-only) or `linkedSignal` (for derived-but-also-writable, stable since v20) are for. For component I/O, signals replace the old decorators from M8: **`input<T>()`** creates a read-only `InputSignal<T>` (with `input.required<T>()` when there is no default), and **`output<T>()`** returns an `OutputEmitterRef<T>` — both fully generic, so `userId = input.required<string>()` is a `Signal<string>` the template reads like any other. When you annotate, prefer typing the *value* and letting `computed`/`input` carry it, rather than restating the type on every read.",
            uk: "API signals невеликі й чисто виводяться. `signal(0)` повертає **`WritableSignal<number>`** — початкове значення фіксує `T`; читаєте через `count()`, пишете через `.set(v)` чи `.update(prev => …)`. `computed(() => count() * 2)` повертає read-only **`Signal<number>`**: його тип виводиться з повернення callback, він **memoized** (переобчислюється лише коли прочитаний signal реально змінився) і **лінивий** (не запускається, доки щось його не прочитає). `effect(() => …)` теж відстежує signals, які читає, але нічого не повертає й існує **лише для side effects** — логування, синхронізації в `localStorage`, імперативного керування не-signal-бібліотекою. Найпоширеніша помилка дизайну — вживати `effect`, щоб *писати* один signal з іншого; для цього є `computed` (для лише-похідного) чи `linkedSignal` (для похідного-але-й-записуваного, стабільний із v20). Для I/O компонента signals заміняють старі decorators із M8: **`input<T>()`** створює read-only `InputSignal<T>` (з `input.required<T>()`, коли немає дефолту), а **`output<T>()`** повертає `OutputEmitterRef<T>` — обидва повністю generic, тож `userId = input.required<string>()` це `Signal<string>`, який шаблон читає як будь-який інший. Коли анотуєте, краще типізуйте *значення* й дайте `computed`/`input` його нести, а не повторюйте тип на кожному читанні.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `import { signal, computed, effect, input, output } from '@angular/core';

const count = signal(0);                       // WritableSignal<number>
const doubled = computed(() => count() * 2);   // Signal<number> — read-only, memoized, lazy
count.set(5);
count.update((c) => c + 1);                    // 6 → doubled recomputes to 12 on next read
effect(() => console.log('count is', count())); // side effect only — re-runs when count changes

// Component I/O as signals (replace @Input()/@Output() decorators — M8):
class UserCard {
  userId = input.required<string>();           // InputSignal<string>  (no default → required)
  compact = input(false);                      // InputSignal<boolean> (inferred from default)
  selected = output<string>();                 // OutputEmitterRef<string>
  label = computed(() => this.userId().slice(0, 8)); // derived Signal<string>
}`,
          note: {
            en: '`T` is fixed once — by the initial value, the callback return, or the explicit `input<T>()` — and every read is typed from there. `computed` is inferred read-only; reserve `effect` for genuine side effects, never to derive state.',
            uk: '`T` фіксується раз — початковим значенням, поверненням callback чи явним `input<T>()` — і кожне читання типізується звідти. `computed` виводиться read-only; лишіть `effect` для справжніх side effects, ніколи для похідного стану.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'API', uk: 'API' },
            { en: 'Returns', uk: 'Повертає' },
            { en: 'Use it for', uk: 'Використовуйте для' },
          ],
          rows: [
            [
              { en: '`signal(v)`', uk: '`signal(v)`' },
              { en: '`WritableSignal<T>`', uk: '`WritableSignal<T>`' },
              { en: 'Source state you set/update', uk: 'Джерельний стан, який set/update' },
            ],
            [
              { en: '`computed(fn)`', uk: '`computed(fn)`' },
              { en: '`Signal<T>` (read-only)', uk: '`Signal<T>` (read-only)' },
              { en: 'A value derived from other signals', uk: 'Значення, похідне від інших signals' },
            ],
            [
              { en: '`linkedSignal(fn)`', uk: '`linkedSignal(fn)`' },
              { en: '`WritableSignal<T>`', uk: '`WritableSignal<T>`' },
              { en: 'Derived but also locally settable', uk: 'Похідне, але й локально записуване' },
            ],
            [
              { en: '`effect(fn)`', uk: '`effect(fn)`' },
              { en: '`EffectRef` (no value)', uk: '`EffectRef` (без значення)' },
              { en: 'Side effects only — never to derive', uk: 'Лише side effects — не для похідного' },
            ],
          ],
          caption: {
            en: 'The four building blocks. `linkedSignal` is stable since Angular v20; `resource()`/`httpResource()` (async → signals) are developer preview in Angular 21.',
            uk: 'Чотири будівельні блоки. `linkedSignal` стабільний із Angular v20; `resource()`/`httpResource()` (async → signals) — developer preview в Angular 21.',
          },
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: { en: 'Don’t derive state in an `effect`', uk: 'Не виводьте стан в `effect`' },
          md: {
            en: "The signal anti-pattern that costs the most debugging is `effect(() => this.total.set(this.a() * this.b()))` — using an effect to write one signal from others. It runs *after* change detection, so readers see a stale value for a tick; it can loop if it writes a signal it also reads; and Angular actively discourages (and by default disallows) writes inside effects. If a value is a pure function of other signals, it is a `computed` — memoized, glitch-free, always current. If it is derived *but* the user can also override it (a selected row that resets when the list reloads), it is a `linkedSignal`. Keep `effect` for stepping outside the reactive graph entirely: logging, analytics, `localStorage`, or driving an imperative third-party widget.",
            uk: "Signal-антипатерн, що коштує найбільше дебагу, — це `effect(() => this.total.set(this.a() * this.b()))` — вживання effect, щоб писати один signal з інших. Він виконується *після* change detection, тож читачі бачать застаріле значення один tick; він може зациклитись, якщо пише signal, який також читає; і Angular активно відраджує (і типово забороняє) записи всередині effects. Якщо значення — чиста функція інших signals, це `computed` — memoized, без глітчів, завжди актуальне. Якщо воно похідне, *але* користувач може й перевизначити його (обраний рядок, що скидається при перезавантаженні списку), це `linkedSignal`. Лишіть `effect` для повного виходу за межі реактивного графа: логування, аналітика, `localStorage` чи керування імперативним стороннім віджетом.",
          },
        },
      ],
    },
    // ── Topic 4 ───────────────────────────────────────────────────────────────
    {
      id: 't4-interop',
      title: { en: 'Bridging RxJS ↔ signals: `toSignal` / `toObservable`', uk: 'Мости RxJS ↔ signals: `toSignal` / `toObservable`' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "The `@angular/core/rxjs-interop` package connects the two models, and its **type overloads are the whole lesson**. `toSignal(obs$)` subscribes for you (and unsubscribes on destroy) and returns a signal — but *what* signal depends on the options, because a stream may not have emitted yet. With **no options**, the result is **`Signal<T | undefined>`**: until the Observable's first emission there is no value, so the type honestly includes `undefined`. Pass **`{ initialValue: v }`** and you get **`Signal<T | U>`** — the signal reads `v` until the stream emits, so the `undefined` is gone and replaced by your seed's type. Pass **`{ requireSync: true }`** and you get **`Signal<T>`** with no `undefined` — but this is an *assertion* that the Observable emits synchronously on subscribe (like a `BehaviorSubject` or `of`), and if it does not, Angular throws at runtime. Going the other way, `toObservable(sig)` returns an `Observable<T>` that tracks the signal via an internal `effect` and re-emits on change (through a `ReplaySubject`). One more piece, **developer preview in Angular 21**: `resource()` / `httpResource()` take an async source and give you back signals for its value, status and error — the signal-native way to fold an HTTP call into the graph without hand-writing the `toSignal` plumbing.",
            uk: "Пакет `@angular/core/rxjs-interop` зʼєднує дві моделі, і його **type-overloads — це весь урок**. `toSignal(obs$)` підписується за вас (і відписується при знищенні) й повертає signal — але *який* signal, залежить від опцій, бо потік міг ще нічого не видати. **Без опцій** результат — **`Signal<T | undefined>`**: до першої емісії Observable значення немає, тож тип чесно включає `undefined`. Передайте **`{ initialValue: v }`** — і отримаєте **`Signal<T | U>`**: signal читає `v`, доки потік не видасть значення, тож `undefined` зникає, заміщений типом вашого seed. Передайте **`{ requireSync: true }`** — і отримаєте **`Signal<T>`** без `undefined` — але це *assertion*, що Observable видає значення синхронно при підписці (як `BehaviorSubject` чи `of`), і якщо ні, Angular кине помилку в runtime. У зворотний бік `toObservable(sig)` повертає `Observable<T>`, що відстежує signal через внутрішній `effect` і повторно видає при зміні (через `ReplaySubject`). Ще одна деталь, **developer preview в Angular 21**: `resource()` / `httpResource()` беруть async-джерело й віддають signals для його значення, статусу й помилки — signal-нативний спосіб згорнути HTTP-виклик у граф без ручного `toSignal`-водопроводу.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `import { toSignal, toObservable } from '@angular/core/rxjs-interop';

const a = toSignal(user$);                          // Signal<User | undefined>  (no value yet)
const b = toSignal(user$, { initialValue: null }); // Signal<User | null>       (seed until first emit)
const c = toSignal(count$, { requireSync: true });  // Signal<number>            (asserts a sync emit)

// Signal → Observable, to reuse RxJS operators (debounce, switchMap, retry):
const query = signal('');
const results$ = toObservable(query).pipe(
  debounceTime(300),
  switchMap((q) => this.api.search(q)),             // Observable<Result[]>
);
const results = toSignal(results$, { initialValue: [] as Result[] }); // back to a Signal<Result[]>`,
          note: {
            en: 'The overload you pick decides whether the type carries `undefined`. Forgetting that `toSignal(x$)` is `T | undefined` — and templating it as if always present — is the classic interop bug.',
            uk: 'Обраний overload вирішує, чи несе тип `undefined`. Забути, що `toSignal(x$)` — це `T | undefined`, і шаблонити його ніби завжди присутній — класичний interop-баг.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Call', uk: 'Виклик' },
            { en: 'Result type', uk: 'Тип результату' },
            { en: 'Meaning / caveat', uk: 'Значення / застереження' },
          ],
          rows: [
            [
              { en: '`toSignal(obs$)`', uk: '`toSignal(obs$)`' },
              { en: '`Signal<T | undefined>`', uk: '`Signal<T | undefined>`' },
              { en: '`undefined` until the first emission', uk: '`undefined` до першої емісії' },
            ],
            [
              { en: '`toSignal(obs$, { initialValue: v })`', uk: '`toSignal(obs$, { initialValue: v })`' },
              { en: '`Signal<T | U>`', uk: '`Signal<T | U>`' },
              { en: 'Reads the seed until the stream emits', uk: 'Читає seed, доки потік не видасть' },
            ],
            [
              { en: '`toSignal(obs$, { requireSync: true })`', uk: '`toSignal(obs$, { requireSync: true })`' },
              { en: '`Signal<T>`', uk: '`Signal<T>`' },
              { en: 'Asserts a sync emit — throws if none', uk: 'Стверджує sync-емісію — кидає, якщо ні' },
            ],
            [
              { en: '`toObservable(sig)`', uk: '`toObservable(sig)`' },
              { en: '`Observable<T>`', uk: '`Observable<T>`' },
              { en: 'Tracks the signal via an effect', uk: 'Відстежує signal через effect' },
            ],
          ],
          caption: {
            en: 'The `toSignal` overloads encode a real question — has the stream produced a value yet? — in the type. Choose the overload that matches the source’s timing.',
            uk: 'Overloads `toSignal` кодують реальне питання — чи потік уже дав значення? — у типі. Обирайте overload, що відповідає таймінгу джерела.',
          },
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: { en: 'Let the `| undefined` remind you the value can be absent', uk: 'Дайте `| undefined` нагадати, що значення може бути відсутнім' },
          md: {
            en: "The `T | undefined` from a bare `toSignal` is not noise to silence with `!` — it is the type telling the truth about an async source that has not emitted. Handle it deliberately: give an `initialValue` when a sensible default exists (an empty array, `null`, a loading sentinel), use `requireSync: true` only when the source genuinely emits synchronously (a `BehaviorSubject`, a `store.select` seeded with state), or narrow the `undefined` in the template with `@if (user(); as u)`. Reaching for `toSignal(x$)!` to delete the `undefined` re-opens exactly the M9 hole — asserting a value is present without checking — but now inside your view layer. The honest type is doing you a favour.",
            uk: "`T | undefined` від голого `toSignal` — це не шум, який глушать через `!` — це тип, що каже правду про async-джерело, яке ще не видало значення. Обробіть його свідомо: дайте `initialValue`, коли є розумний дефолт (порожній масив, `null`, loading-sentinel), уживайте `requireSync: true` лише коли джерело справді видає синхронно (`BehaviorSubject`, `store.select`, засіяний станом), або звузьте `undefined` у шаблоні через `@if (user(); as u)`. Тягнутися до `toSignal(x$)!`, щоб видалити `undefined`, знову відкриває саме ту діру з M9 — стверджувати присутність значення без перевірки — але тепер усередині шару вигляду. Чесний тип робить вам послугу.",
          },
        },
      ],
    },
    // ── Topic 5 ───────────────────────────────────────────────────────────────
    {
      id: 't5-discriminated-state',
      title: { en: 'Modelling component state as a discriminated union', uk: 'Моделювання стану компонента як discriminated union' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "How you *type* component state decides which bugs are even possible. The common shape is \"boolean soup\": separate `isLoading`, `error` and `data` fields, each independent. That type permits nonsense the UI should never show — `isLoading: true` with a non-null `error`, or `data` and `error` both set — and every template then defends with tangled `*ngIf` chains. The fix is to make the state a **discriminated union** (M2), a single field whose `status` tag decides which *other* fields exist: `{ status: 'idle' } | { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: E }`. Now `data` exists **only** in the `success` member and `error` **only** in the `error` member, so \"loading with data\" or \"error with data\" are **unrepresentable** — they cannot be constructed, let alone rendered. In the template, `@switch (state().status)` narrows each branch, and inside `@case ('success')` the compiler knows `state().data` is a `T` (the exhaustiveness idea from M2, now driving the view). This is the same principle Angular's own `resource()` encodes — it exposes a `status` plus value/error — and it composes with everything above: a `toSignal` of an HTTP stream, `map`ped into this union, gives a component whose every visual state is a distinct, type-checked case.",
            uk: "Те, як ви *типізуєте* стан компонента, вирішує, які баги взагалі можливі. Поширена форма — «boolean soup»: окремі поля `isLoading`, `error` і `data`, кожне незалежне. Цей тип дозволяє нісенітницю, яку UI ніколи не має показувати — `isLoading: true` з ненульовим `error`, чи `data` й `error` обидва виставлені — і кожен шаблон тоді захищається заплутаними ланцюгами `*ngIf`. Виправлення — зробити стан **discriminated union** (M2), єдиним полем, чий тег `status` вирішує, які *інші* поля існують: `{ status: 'idle' } | { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: E }`. Тепер `data` існує **лише** в члені `success`, а `error` **лише** в члені `error`, тож «loading з data» чи «error з data» **невиразні** — їх не можна сконструювати, не те що відрендерити. У шаблоні `@switch (state().status)` звужує кожну гілку, а всередині `@case ('success')` компілятор знає, що `state().data` — це `T` (ідея вичерпності з M2, що тепер керує виглядом). Це той самий принцип, який кодує власний `resource()` Angular — він відкриває `status` плюс value/error — і він компонується з усім вищим: `toSignal` HTTP-потоку, `map`-нутий у цей union, дає компонент, чий кожен візуальний стан — окремий, перевірений типом випадок.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// One tagged union — the tag decides which other fields exist (M2 · M7).
type RemoteData<T, E = Error> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E };

class UsersList {
  state = signal<RemoteData<User[]>>({ status: 'idle' });

  load() {
    this.state.set({ status: 'loading' });
    this.api.getUsers().subscribe({
      next: (data) => this.state.set({ status: 'success', data }),   // data required here
      error: (error) => this.state.set({ status: 'error', error }),  // error required here
    });
  }
  // ✗ this.state.set({ status: 'loading', data });  // compile error — 'loading' has no data field
}`,
          note: {
            en: 'The union makes illegal states unconstructible: you cannot build a `loading` value that carries `data`, so the template never has to guard against a combination that cannot exist.',
            uk: 'Union робить нелегальні стани неконструйовними: не можна побудувати значення `loading`, що несе `data`, тож шаблон ніколи не мусить захищатися від комбінації, якої не може бути.',
          },
        },
        {
          kind: 'compare',
          a: { en: 'Boolean soup', uk: 'Boolean soup' },
          b: { en: 'Discriminated union', uk: 'Discriminated union' },
          rows: [
            [
              { en: 'Shape', uk: 'Форма' },
              { en: '`{ isLoading; error?; data? }`', uk: '`{ isLoading; error?; data? }`' },
              { en: '`{ status } & tag-specific fields`', uk: '`{ status } & поля за тегом`' },
            ],
            [
              { en: 'Impossible states', uk: 'Неможливі стани' },
              { en: 'Representable (loading + error…)', uk: 'Виразні (loading + error…)' },
              { en: 'Unrepresentable by construction', uk: 'Невиразні за побудовою' },
            ],
            [
              { en: 'Template', uk: 'Шаблон' },
              { en: 'Nested `*ngIf` guards', uk: 'Вкладені `*ngIf`-захисти' },
              { en: '`@switch` narrows each case', uk: '`@switch` звужує кожен випадок' },
            ],
            [
              { en: 'Adding a state', uk: 'Додавання стану' },
              { en: 'Another boolean, more combos', uk: 'Ще один boolean, більше комбо' },
              { en: 'One member; `@switch` flags gaps', uk: 'Один член; `@switch` показує прогалини' },
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'senior',
          title: { en: 'Make impossible states unrepresentable — in the view too', uk: 'Робіть неможливі стани невиразними — і у вигляді теж' },
          md: {
            en: "The deepest lesson of this module is that reactivity and typing are the same discipline applied at the edge of the UI: choose representations where the compiler rules out what should never happen. A discriminated union for remote data does for the view what a validated schema (M9) does for the boundary and what `never`-exhaustiveness (M2) does for a switch — it removes a whole class of bugs by making them not type-check. Combine the three: validate input into a typed value at the boundary, carry it through typed operators or `computed` signals, and land it in a tagged-union state your template switches over exhaustively. The reward is components where every render path corresponds to a real, reachable, type-checked state — and where adding a new state is a compile error everywhere you must handle it, not a runtime surprise.",
            uk: "Найглибший урок цього модуля: реактивність і типізація — це одна дисципліна, застосована на краю UI: обирайте представлення, де компілятор виключає те, чого не має статися. Discriminated union для віддалених даних робить для вигляду те, що провалідована схема (M9) робить для межі, а `never`-вичерпність (M2) — для switch: він прибирає цілий клас багів, роблячи так, що вони не проходять перевірку типів. Поєднайте всі три: провалідуйте вхід у типізоване значення на межі, пронесіть його крізь типізовані оператори чи `computed`-signals і посадіть у стан-tagged-union, який ваш шаблон вичерпно перемикає. Нагорода — компоненти, де кожен шлях рендеру відповідає реальному, досяжному, перевіреному типом стану, і де додавання нового стану — це compile-помилка скрізь, де ви мусите його обробити, а не runtime-сюрприз.",
          },
        },
      ],
    },
  ],

  keyPoints: [
    {
      en: 'Angular has two reactive models: an **Observable** is a push-based, async, multi-value **stream** (`Observable<T>`); a **signal** is a pull-based, synchronous **single value** (`Signal<T>`). Rule of thumb: signals for synchronous view state, RxJS for async event streams and coordination.',
      uk: 'Angular має дві реактивні моделі: **Observable** — це push-based, async, багатозначний **потік** (`Observable<T>`); **signal** — pull-based, синхронне **одне значення** (`Signal<T>`). Правило: signals для синхронного стану вигляду, RxJS для async-потоків подій і координації.',
    },
    {
      en: 'RxJS typing rests on **`OperatorFunction<T, R>`**; `pipe` composes them so types thread left-to-right. `map` changes `T → R`; plain `filter` is `MonoTypeOperatorFunction<T>`, but `filter((x): x is U)` returns `OperatorFunction<T, U>` and **narrows** the stream (M2). RxJS 7.8 is stable; RxJS 8 is still alpha/on hold.',
      uk: 'Типізація RxJS тримається на **`OperatorFunction<T, R>`**; `pipe` компонує їх, тож типи протягуються зліва направо. `map` міняє `T → R`; звичайний `filter` — `MonoTypeOperatorFunction<T>`, але `filter((x): x is U)` повертає `OperatorFunction<T, U>` і **звужує** потік (M2). RxJS 7.8 стабільний; RxJS 8 досі alpha/на паузі.',
    },
    {
      en: '`signal(v)` → `WritableSignal<T>` (`.set`/`.update`); `computed(fn)` → read-only, **memoized**, lazy `Signal<T>`; `effect(fn)` is for **side effects only**. Component I/O uses signal `input<T>()`/`input.required<T>()`/`output<T>()`, which replace the `@Input()`/`@Output()` decorators (M8).',
      uk: '`signal(v)` → `WritableSignal<T>` (`.set`/`.update`); `computed(fn)` → read-only, **memoized**, лінивий `Signal<T>`; `effect(fn)` — **лише для side effects**. I/O компонента через signal `input<T>()`/`input.required<T>()`/`output<T>()`, що заміняють decorators `@Input()`/`@Output()` (M8).',
    },
    {
      en: 'Never derive one signal from others inside an `effect` (stale reads, loops) — use `computed` (derived-only) or `linkedSignal` (derived + writable, stable since v20). `resource()`/`httpResource()` fold async into signals but are **developer preview in Angular 21**.',
      uk: 'Ніколи не виводьте один signal з інших усередині `effect` (застарілі читання, цикли) — уживайте `computed` (лише похідне) чи `linkedSignal` (похідне + записуване, стабільний із v20). `resource()`/`httpResource()` згортають async у signals, але це **developer preview в Angular 21**.',
    },
    {
      en: '`toSignal(obs$)` is **`Signal<T | undefined>`** (no value until first emit); `{ initialValue: v }` → `Signal<T | U>`; `{ requireSync: true }` → `Signal<T>` (asserts a sync emit, throws otherwise). `toObservable(sig)` tracks a signal via an effect. Don’t `!`-away the `undefined` — reopen the M9 hole.',
      uk: '`toSignal(obs$)` — це **`Signal<T | undefined>`** (немає значення до першої емісії); `{ initialValue: v }` → `Signal<T | U>`; `{ requireSync: true }` → `Signal<T>` (стверджує sync-емісію, інакше кидає). `toObservable(sig)` відстежує signal через effect. Не прибирайте `undefined` через `!` — це знову відкриває діру з M9.',
    },
    {
      en: 'Model component state as a **discriminated union** — `{ status: \'loading\' } | { status: \'success\'; data: T } | { status: \'error\'; error: E }` — so impossible states (loading-with-data) are **unrepresentable** and `@switch` narrows each branch. Same discipline as validation (M9) and exhaustiveness (M2), applied to the view.',
      uk: 'Моделюйте стан компонента як **discriminated union** — `{ status: \'loading\' } | { status: \'success\'; data: T } | { status: \'error\'; error: E }` — щоб неможливі стани (loading-з-data) були **невиразними**, а `@switch` звужував кожну гілку. Та сама дисципліна, що валідація (M9) і вичерпність (M2), застосована до вигляду.',
    },
  ],

  pitfalls: [
    {
      title: { en: 'Treating a `toSignal` result as always-present', uk: 'Сприймати результат `toSignal` як завжди-присутній' },
      body: {
        en: 'A bare `toSignal(user$)` is `Signal<User | undefined>` because the stream may not have emitted; rendering `user().name` (or using `!`) crashes on first paint. Give an `initialValue`, use `requireSync: true` only for genuinely synchronous sources, or narrow with `@if (user(); as u)`. The `undefined` is the type being honest about async timing.',
        uk: 'Голий `toSignal(user$)` — це `Signal<User | undefined>`, бо потік міг не видати значення; рендер `user().name` (чи `!`) падає на першому paint. Дайте `initialValue`, уживайте `requireSync: true` лише для справді синхронних джерел або звузьте через `@if (user(); as u)`. `undefined` — це тип, чесний щодо async-таймінгу.',
      },
    },
    {
      title: { en: 'Using `effect` to compute derived state', uk: 'Вживати `effect` для похідного стану' },
      body: {
        en: '`effect(() => this.total.set(this.a() * this.b()))` runs after change detection (stale reads for a tick), can loop, and fights Angular’s default ban on writing signals in effects. A pure derivation is a `computed`; a derivation the user can also override is a `linkedSignal`. Reserve `effect` for true side effects — logging, `localStorage`, imperative libraries.',
        uk: '`effect(() => this.total.set(this.a() * this.b()))` виконується після change detection (застарілі читання один tick), може зациклитись і бореться з дефолтною забороною Angular писати signals в effects. Чиста деривація — це `computed`; деривація, яку користувач може й перевизначити, — `linkedSignal`. Лишіть `effect` для справжніх side effects — логування, `localStorage`, імперативні бібліотеки.',
      },
    },
    {
      title: { en: 'Letting `any` leak into a pipe', uk: 'Пускати `any` у pipe' },
      body: {
        en: 'Operators infer their types from callbacks, so one `any` source (typically an untyped HTTP response) makes the whole downstream `Observable<any>` and silently disables checking on every later operator. Type the source — validate the HTTP response at the boundary (M9) — or annotate the first callback param so inference has an anchor. An `Observable<any>` on hover means a boundary upstream was left untyped.',
        uk: 'Оператори виводять типи з callback, тож одне `any`-джерело (зазвичай нетипізована HTTP-відповідь) робить увесь потік далі `Observable<any>` і тихо вимикає перевірку на кожному пізнішому операторі. Типізуйте джерело — провалідуйте HTTP-відповідь на межі (M9) — або анотуйте перший параметр callback, щоб inference мав якір. `Observable<any>` у підказці означає, що межу вище лишили нетипізованою.',
      },
    },
    {
      title: { en: 'Boolean-soup component state', uk: 'Стан компонента як boolean soup' },
      body: {
        en: 'Independent `isLoading`/`error`/`data` fields let impossible combinations exist (loading with an error, data with an error) and force tangled `*ngIf` guards. Model state as a discriminated union keyed by `status`, so tag-specific fields exist only in their member and `@switch` narrows each branch. Adding a state becomes one new member the compiler forces you to handle, not another boolean.',
        uk: 'Незалежні поля `isLoading`/`error`/`data` дають існувати неможливим комбінаціям (loading з помилкою, data з помилкою) і змушують до заплутаних `*ngIf`-захистів. Моделюйте стан як discriminated union за ключем `status`, щоб поля за тегом існували лише у своєму члені, а `@switch` звужував кожну гілку. Додавання стану стає одним новим членом, який компілятор змушує обробити, а не ще одним boolean.',
      },
    },
  ],

  interview: [
    {
      q: { en: 'When would you use a signal vs an Observable, and how do the types reflect the difference?', uk: 'Коли ви б уживали signal, а коли Observable, і як типи відображають різницю?' },
      a: {
        en: 'A signal is a synchronous, pull-based single value — `Signal<T>` means "a T available now" — so it fits component view state the template reads directly, with `computed` for derivations. An Observable is an asynchronous, push-based stream — `Observable<T>` means "zero or more Ts over time, possibly erroring" — so it fits async events and coordination: debounced input, HTTP with retry/cancel, websockets. The types encode the difference in the shape of time: one-value-now vs zero-or-more-later. In practice you use both and bridge with `toSignal`/`toObservable` — e.g. a `signal` search box → `toObservable` → `debounceTime`/`switchMap` → `toSignal` back into the view.',
        uk: 'Signal — це синхронне, pull-based одне значення — `Signal<T>` означає «T, доступне зараз» — тож пасує стану вигляду, який шаблон читає прямо, з `computed` для деривацій. Observable — асинхронний, push-based потік — `Observable<T>` означає «нуль або більше T у часі, можливо з помилкою» — тож пасує async-подіям і координації: debounce-інпут, HTTP із retry/cancel, websockets. Типи кодують різницю у формі часу: одне-значення-зараз проти нуль-або-більше-потім. На практиці вживають обидва й мостять через `toSignal`/`toObservable` — напр. `signal`-поле пошуку → `toObservable` → `debounceTime`/`switchMap` → `toSignal` назад у вигляд.',
      },
      level: 'senior',
    },
    {
      q: { en: 'How do types flow through an RxJS `pipe`, and what makes `filter` sometimes change the element type?', uk: 'Як типи течуть крізь RxJS `pipe`, і чому `filter` іноді міняє тип елемента?' },
      a: {
        en: 'Every operator is an `OperatorFunction<T, R>` — a function from `Observable<T>` to `Observable<R>` — and `pipe` composes them left to right, so each operator’s output type is the next one’s input, and the final Observable’s type is the last operator’s R. Generics are inferred from the callbacks, so you rarely annotate. `map` changes the type (`T → R` from the callback’s return). `filter` is normally `MonoTypeOperatorFunction<T>` because removing values doesn’t change their type — but if you pass a type-guard predicate, `filter((x): x is U => …)`, it becomes `OperatorFunction<T, U>` and narrows the stream to `Observable<U>`. That’s the same predicate narrowing from control-flow analysis (M2), just carried through the pipe.',
        uk: 'Кожен оператор — це `OperatorFunction<T, R>` — функція з `Observable<T>` в `Observable<R>` — і `pipe` компонує їх зліва направо, тож вихідний тип кожного оператора — вхідний наступного, а тип фінального Observable — R останнього оператора. Generics виводяться з callback, тож анотуєте рідко. `map` міняє тип (`T → R` з повернення callback). `filter` зазвичай `MonoTypeOperatorFunction<T>`, бо прибирання значень не міняє їх тип — але якщо передати type-guard-предикат, `filter((x): x is U => …)`, він стає `OperatorFunction<T, U>` і звужує потік до `Observable<U>`. Це те саме звуження предикатом із control-flow analysis (M2), просто пронесене крізь pipe.',
      },
      level: 'senior',
    },
    {
      q: { en: 'Why is `computed` preferable to an `effect` for derived state, and when is `linkedSignal` the right tool?', uk: 'Чому `computed` кращий за `effect` для похідного стану, і коли `linkedSignal` — правильний інструмент?' },
      a: {
        en: '`computed` returns a read-only, memoized, lazy signal whose value is always consistent with its inputs: it recomputes only when a signal it read changed, and readers always see the current derived value. Deriving state in an `effect` instead — writing one signal from others — runs after change detection so readers can see a stale value for a tick, risks infinite loops if it writes a signal it reads, and Angular disallows signal writes in effects by default. So `computed` is correct for anything that is a pure function of other signals. `linkedSignal` is the tool when a value is derived *but also locally writable* — e.g. a selected item that defaults from a list but the user can change, and that resets when the source list changes. `effect` stays for genuine side effects only: logging, persistence, driving imperative APIs.',
        uk: '`computed` повертає read-only, memoized, лінивий signal, чиє значення завжди узгоджене зі входами: він переобчислюється лише коли прочитаний signal змінився, і читачі завжди бачать актуальне похідне значення. Виводити стан в `effect` натомість — писати один signal з інших — виконується після change detection, тож читачі можуть бачити застаріле значення один tick, ризикує нескінченними циклами, якщо пише signal, який читає, і Angular типово забороняє записи signals в effects. Тож `computed` правильний для будь-чого, що є чистою функцією інших signals. `linkedSignal` — інструмент, коли значення похідне, *але й локально записуване* — напр. обраний елемент, що дефолтиться зі списку, але користувач може змінити, і що скидається, коли джерельний список змінюється. `effect` лишається лише для справжніх side effects: логування, персистентність, керування імперативними API.',
      },
      level: 'senior',
    },
    {
      q: { en: 'How would you type an async view — loading, data, error — so the template can’t render an impossible state?', uk: 'Як би ви типізували async-вигляд — loading, data, error — щоб шаблон не міг відрендерити неможливий стан?' },
      a: {
        en: 'I’d model it as a discriminated union rather than independent booleans: `{ status: \'idle\' } | { status: \'loading\' } | { status: \'success\'; data: T } | { status: \'error\'; error: E }`, held in a `signal<RemoteData<T>>`. Because `data` lives only in the `success` member and `error` only in the `error` member, illegal combinations — loading-with-data, data-with-error — are unrepresentable; you literally cannot construct them, so the template never guards against them. In the view, `@switch (state().status)` narrows each branch, and inside `@case (\'success\')` the compiler knows `data` is a `T`. It’s the same discipline as validating input at the boundary (M9) and `never`-exhaustiveness on a switch (M2), applied to view state — and it’s exactly what Angular’s `resource()` exposes with its `status`. Adding a new state becomes a compile error everywhere the union is switched over, which is what you want.',
        uk: 'Я б змоделював це як discriminated union, а не незалежні boolean: `{ status: \'idle\' } | { status: \'loading\' } | { status: \'success\'; data: T } | { status: \'error\'; error: E }`, у `signal<RemoteData<T>>`. Оскільки `data` живе лише в члені `success`, а `error` лише в `error`, нелегальні комбінації — loading-з-data, data-з-error — невиразні; їх буквально не можна сконструювати, тож шаблон ніколи від них не захищається. У вигляді `@switch (state().status)` звужує кожну гілку, а всередині `@case (\'success\')` компілятор знає, що `data` — це `T`. Це та сама дисципліна, що валідація входу на межі (M9) і `never`-вичерпність на switch (M2), застосована до стану вигляду — і саме це відкриває `resource()` Angular своїм `status`. Додавання нового стану стає compile-помилкою скрізь, де union перемикають, чого ви й хочете.',
      },
      level: 'staff',
    },
  ],

  seeAlso: ['m2-narrowing', 'm9-dto-validation', 'm8-decorators-metadata', 'm7-utility-types'],

  sources: [
    { title: 'Angular — Signals overview (signal, computed, effect)', url: 'https://angular.dev/guide/signals' },
    { title: 'Angular — linkedSignal (dependent, writable state)', url: 'https://angular.dev/guide/signals/linked-signal' },
    { title: 'Angular — Async reactivity with resources (developer preview)', url: 'https://angular.dev/guide/signals/resource' },
    { title: 'Angular — RxJS interop (toSignal / toObservable)', url: 'https://angular.dev/ecosystem/rxjs-interop' },
    { title: 'Angular — toSignal API & ToSignalOptions (initialValue, requireSync overloads)', url: 'https://angular.dev/api/core/rxjs-interop/toSignal' },
    { title: 'Angular — inputs as signals (input / input.required)', url: 'https://angular.dev/guide/signals/inputs' },
    { title: 'RxJS — filter (MonoTypeOperatorFunction; type-guard overload)', url: 'https://rxjs.dev/api/operators/filter' },
    { title: 'RxJS — OperatorFunction & operator typing guide', url: 'https://rxjs.dev/guide/operators' },
    { title: 'RxJS — v7 → v8 roadmap (on hold pending TC39 Observable)', url: 'https://github.com/ReactiveX/rxjs/issues/6367' },
    { title: 'Angular — control flow (@switch / @if template narrowing)', url: 'https://angular.dev/guide/templates/control-flow' },
    { title: 'Announcing TypeScript 7.0 RC (Go-native; checking semantics identical to 6.0)', url: 'https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-rc/' },
  ],
};
