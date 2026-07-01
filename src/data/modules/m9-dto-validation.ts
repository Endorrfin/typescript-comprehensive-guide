import type { Module } from '../types';

/*
 * M9 (S7) — DTOs, Validation & API Boundaries. Section III (Applied), order 2.
 * Diagram-first (no signature sim — CURRICULUM marks M9 '—'). Two figures:
 * 'trust-boundary' (untrusted input crossing a validation gate into the typed core; `as` is a hole)
 * and 'schema-single-source' (one schema derives BOTH the static type via z.infer AND the runtime
 * check via parse, vs a hand-written interface + separate validator that drift). All version-sensitive
 * facts web-verified (see sources): TS types are fully erased at emit, so `as`/`JSON.parse`/`res.json()`
 * hand back any/unknown; Zod 4 stable (mid-2025) — ~14x faster string / 7x array / 6.5x object parsing,
 * ~57% smaller core, ~10x faster tsc, plus tree-shakable @zod/mini; z.infer<typeof S> derives the type;
 * .parse throws ZodError, .safeParse returns a { success } discriminated union; class-validator +
 * class-transformer power NestJS ValidationPipe (whitelist strips unknown props, forbidNonWhitelisted
 * rejects them, transform builds the DTO instance) and lean on reflect-metadata/emitDecoratorMetadata
 * (M8); class-validator's forbidUnknownValues DEFAULTS to true — flipping it false lets unknown objects
 * pass (a real bypass); Standard Schema (~standard property, standardschema.dev, ~60-line TS interface
 * by the Zod/Valibot/ArkType authors) unifies validators for tools like tRPC/TanStack; TS 6.0 stable /
 * 7.0 Go-native RC (Jun 2026), checking semantics identical.
 */
export const m9: Module = {
  id: 'm9-dto-validation',
  num: 9,
  section: 's3-applied',
  order: 2,
  level: 'senior',
  title: { en: 'DTOs, Validation & API Boundaries', uk: 'DTO, Валідація та межі API' },
  tagline: {
    en: 'Types vanish at runtime, so the edge of your system is where they lie. Validate there, and derive the type from the validator.',
    uk: 'Типи зникають у runtime, тож край вашої системи — це місце, де вони брешуть. Валідуйте там і виводьте тип із валідатора.',
  },
  readMins: 21,
  mentalModel: {
    en: 'A type annotation is a promise the compiler cannot keep about data it never saw. At every trust boundary, parse untrusted input into a typed value once — never cast it — and make the runtime schema the single source of truth the static type is derived from.',
    uk: 'Анотація типу — це обіцянка, яку компілятор не може стримати щодо даних, яких він ніколи не бачив. На кожній межі довіри перетворюйте (parse) недовірений вхід на типізоване значення один раз — ніколи не кастуйте його — і робіть runtime-схему єдиним джерелом правди, з якого виводиться статичний тип.',
  },

  topics: [
    // ── Topic 1 ───────────────────────────────────────────────────────────────
    {
      id: 't1-erasure-boundary',
      title: { en: 'Why the boundary needs a runtime check', uk: 'Чому межа потребує runtime-перевірки' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "TypeScript's types are **fully erased** at emit — nothing about `CreateUserDto` survives into the JavaScript that runs. That is fine *inside* your program, where the compiler has already checked every assignment. It stops being fine the moment data crosses a **trust boundary**: an HTTP request body, a query string, a queue message, a config file, a third-party API response. There, the value was produced by something the compiler never saw, so its real shape at runtime is whatever the sender chose — and the type you wrote is just a *claim*. Two everyday functions make the gap concrete: `JSON.parse(body)` returns **`any`**, and `await fetch(url).then(r => r.json())` returns **`Promise<any>`**. `any` silently satisfies every annotation, so `const dto: CreateUserDto = JSON.parse(body)` type-checks and is a lie. Writing `input as CreateUserDto` is worse — an **assertion**, an unchecked override where you tell the compiler to stop reasoning. The only thing that makes the type true again is a **runtime check** that inspects the value and refuses it if the shape is wrong.",
            uk: "Типи TypeScript **повністю стираються** при emit — нічого від `CreateUserDto` не переживає до JavaScript, що виконується. Це нормально *всередині* вашої програми, де компілятор уже перевірив кожне присвоєння. Це перестає бути нормальним тієї миті, коли дані перетинають **межу довіри**: тіло HTTP-запиту, query-рядок, повідомлення з черги, config-файл, відповідь стороннього API. Там значення створило щось, чого компілятор ніколи не бачив, тож його реальна форма в runtime — це те, що обрав відправник, а тип, який ви написали, — лише *твердження*. Дві щоденні функції роблять цей розрив відчутним: `JSON.parse(body)` повертає **`any`**, а `await fetch(url).then(r => r.json())` повертає **`Promise<any>`**. `any` мовчки задовольняє кожну анотацію, тож `const dto: CreateUserDto = JSON.parse(body)` проходить перевірку — і це брехня. Написати `input as CreateUserDto` — ще гірше: це **assertion**, неперевірене перевизначення, де ви кажете компілятору припинити міркувати. Єдине, що знову робить тип істинним, — це **runtime-перевірка**, яка оглядає значення й відмовляє йому, якщо форма не та.",
          },
        },
        {
          kind: 'figure',
          fig: 'trust-boundary',
          caption: {
            en: 'The boundary is where the type lies. Untrusted sources hand you `any`/`unknown`; a validation gate is the only thing that turns that into a value the annotation actually describes. An `as` cast is a hole in the wall — it changes the type, not the data.',
            uk: 'Межа — це місце, де тип бреше. Недовірені джерела дають вам `any`/`unknown`; validation-gate — єдине, що перетворює це на значення, яке анотація реально описує. `as`-каст — це діра в стіні: він міняє тип, а не дані.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// The three ways the boundary lies — all type-check, none is safe:
const a: CreateUserDto = JSON.parse(req.body);        // JSON.parse → any, swallows the annotation
const b = req.body as CreateUserDto;                  // assertion: an unchecked override, a "trust me"
const c: User = await fetch(url).then((r) => r.json()); // r.json() → Promise<any>

// Prefer 'unknown' for raw input: it forbids use until you PROVE the shape (M2).
function handle(raw: unknown) {
  // raw.email;                    // ✗ compile error — good, you can't touch it yet
  const dto = CreateUser.parse(raw); // ✓ parse/validate → now it's a typed CreateUserDto
  return dto.email;                  // safe: the value was actually checked
}`,
          note: {
            en: 'Typing raw input as `unknown` instead of `any` (or a hopeful DTO) turns "I forgot to validate" from a silent runtime bug into a compile error at the boundary.',
            uk: 'Типізація сирого входу як `unknown` замість `any` (чи оптимістичного DTO) перетворює «я забув провалідувати» з тихого runtime-бага на compile-помилку на межі.',
          },
        },
        {
          kind: 'callout',
          tone: 'security',
          title: { en: 'Parse, don’t validate — and never cast untrusted input', uk: 'Parse, а не validate — і ніколи не кастуйте недовірений вхід' },
          md: {
            en: "\"Parse, don't validate\" means: at the edge, turn unstructured input into a **typed value in one step**, and hand the rest of the program that value — not a boolean saying the raw data \"looked ok\". A validator that returns `true` leaves you still holding `unknown`; a parser returns `CreateUserDto` or throws, so the type and the reality can never drift apart afterward. Casting (`as`) does the opposite: it asserts the type is right and checks nothing, so hostile or malformed input flows inward wearing a type it does not have — the root of countless injection and crash bugs. Rule: untrusted data enters as `unknown`, leaves the boundary as a validated type, and `as` never appears on that path.",
            uk: "«Parse, don't validate» означає: на краю перетворіть неструктурований вхід на **типізоване значення за один крок** і передайте решті програми саме це значення — а не boolean, що сирі дані «виглядали ок». Валідатор, який повертає `true`, лишає вас усе ще з `unknown`; parser повертає `CreateUserDto` або кидає, тож тип і реальність далі вже не можуть розійтися. Каст (`as`) робить протилежне: він стверджує, що тип правильний, і не перевіряє нічого, тож ворожий чи спотворений вхід тече всередину в типі, якого не має, — корінь безлічі injection- і crash-багів. Правило: недовірені дані входять як `unknown`, лишають межу як провалідований тип, а `as` на цьому шляху не зʼявляється ніколи.",
          },
        },
      ],
    },
    // ── Topic 2 ───────────────────────────────────────────────────────────────
    {
      id: 't2-schema-first',
      title: { en: 'Schema-first: derive the type from the validator', uk: 'Schema-first: виводьте тип із валідатора' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "The schema-first approach (zod, valibot, arktype) inverts the usual order: you write **one runtime schema**, and the static type is **derived from it**, not written by hand. In zod you build `CreateUser = z.object({ email: z.string().email(), age: z.number().int().min(0) })`, then `type CreateUser = z.infer<typeof CreateUser>` reads the compile-time type straight out of the schema. Now there is a **single source of truth**: change the schema and the type follows automatically, so they can never disagree. Validating is a method call. `schema.parse(raw)` returns a typed, deep-cloned value on success and **throws a `ZodError`** on failure; `schema.safeParse(raw)` never throws — it returns a **discriminated union** `{ success: true; data: T } | { success: false; error: ZodError }` that you narrow exactly like Topic 2 of M2. `safeParse` is the right default at a boundary: it forces you to handle the failure branch instead of relying on a `try/catch` you might forget. **Zod 4** (stable since mid-2025) made this cheap — benchmarks show roughly 14× faster string, 7× array and 6.5× object parsing than v3, a ~57% smaller core, and about 10× faster `tsc` on large schemas, with a tree-shakable `@zod/mini` build (~1.9 KB) for the browser.",
            uk: "Підхід schema-first (zod, valibot, arktype) перевертає звичний порядок: ви пишете **одну runtime-схему**, а статичний тип **виводиться з неї**, а не пишеться руками. У zod ви будуєте `CreateUser = z.object({ email: z.string().email(), age: z.number().int().min(0) })`, а тоді `type CreateUser = z.infer<typeof CreateUser>` зчитує compile-time-тип прямо зі схеми. Тепер є **єдине джерело правди**: змініть схему — і тип іде за нею автоматично, тож вони ніколи не розійдуться. Валідація — це виклик методу. `schema.parse(raw)` повертає типізоване, глибоко клоноване значення при успіху й **кидає `ZodError`** при невдачі; `schema.safeParse(raw)` не кидає ніколи — він повертає **discriminated union** `{ success: true; data: T } | { success: false; error: ZodError }`, який ви звужуєте точно як у Темі 2 з M2. `safeParse` — правильний дефолт на межі: він змушує обробити гілку помилки, а не покладатися на `try/catch`, який можна забути. **Zod 4** (стабільний із середини 2025) зробив це дешевим — бенчмарки показують приблизно 14× швидший розбір рядків, 7× масивів і 6.5× обʼєктів проти v3, ~57% менше ядро й близько 10× швидший `tsc` на великих схемах, плюс tree-shakable-збірка `@zod/mini` (~1.9 КБ) для браузера.",
          },
        },
        {
          kind: 'figure',
          fig: 'schema-single-source',
          caption: {
            en: 'One schema, two outputs. A zod schema derives the static type (via `z.infer`) and performs the runtime check (via `parse`) from the *same* definition — they cannot drift. The alternative, a hand-written `interface` beside a separate validator, has two sources of truth that quietly fall out of sync.',
            uk: 'Одна схема — два виходи. Zod-схема виводить статичний тип (через `z.infer`) і виконує runtime-перевірку (через `parse`) з *того самого* визначення — вони не можуть розійтися. Альтернатива — написаний руками `interface` поряд з окремим валідатором — має два джерела правди, що тихо втрачають синхронність.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `import { z } from 'zod';

// 1) One schema — the single source of truth.
const CreateUser = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(130),
  role: z.enum(['admin', 'user']).default('user'),
});

// 2) Derive the static type from it — no hand-written interface to drift.
type CreateUser = z.infer<typeof CreateUser>;   // { email: string; age: number; role: 'admin' | 'user' }

// 3) At the boundary, safeParse → a discriminated union you must narrow (M2).
function handle(raw: unknown): CreateUser {
  const result = CreateUser.safeParse(raw);
  if (!result.success) {
    throw new BadRequestException(result.error.issues); // fail closed with structured errors
  }
  return result.data;                            // typed CreateUser, actually validated & coerced
}`,
          note: {
            en: '`z.infer` reads the type out of the schema, so the annotation and the runtime rule are one artifact. `safeParse` returns `{ success }` — the compiler will not let you reach `.data` until you have checked `success`.',
            uk: '`z.infer` зчитує тип зі схеми, тож анотація й runtime-правило — один артефакт. `safeParse` повертає `{ success }` — компілятор не дасть дістатися до `.data`, доки ви не перевірили `success`.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Method', uk: 'Метод' },
            { en: 'On success', uk: 'При успіху' },
            { en: 'On failure', uk: 'При невдачі' },
            { en: 'Use when', uk: 'Коли вживати' },
          ],
          rows: [
            [
              { en: '`schema.parse(x)`', uk: '`schema.parse(x)`' },
              { en: 'Returns `T`', uk: 'Повертає `T`' },
              { en: 'Throws `ZodError`', uk: 'Кидає `ZodError`' },
              { en: 'Deep in trusted code; a framework catches the throw', uk: 'Глибоко в довіреному коді; throw ловить фреймворк' },
            ],
            [
              { en: '`schema.safeParse(x)`', uk: '`schema.safeParse(x)`' },
              { en: '`{ success: true; data: T }`', uk: '`{ success: true; data: T }`' },
              { en: '`{ success: false; error }`', uk: '`{ success: false; error }`' },
              { en: 'At a boundary — forces you to handle failure', uk: 'На межі — змушує обробити невдачу' },
            ],
            [
              { en: '`z.infer<typeof schema>`', uk: '`z.infer<typeof schema>`' },
              { en: 'The static type', uk: 'Статичний тип' },
              { en: '— (compile-time only)', uk: '— (лише compile-time)' },
              { en: 'Everywhere you need the DTO’s type', uk: 'Скрізь, де потрібен тип DTO' },
            ],
          ],
          caption: {
            en: '`parse` vs `safeParse` vs `infer`. The failure shape of `safeParse` is a discriminated union — the same narrowing machinery as any other tagged union (M2).',
            uk: '`parse` проти `safeParse` проти `infer`. Форма невдачі `safeParse` — це discriminated union, той самий механізм звуження, що й будь-який tagged union (M2).',
          },
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: { en: 'Derive, don’t duplicate', uk: 'Виводьте, не дублюйте' },
          md: {
            en: "The whole value of schema-first is that the type is a *projection* of the schema, so resist re-declaring shapes by hand. If you catch yourself writing `interface CreateUser { … }` next to a `CreateUser` schema, delete the interface and `z.infer` it — otherwise you own two definitions that will drift the first time someone edits only one. When you need a variant, derive it too: `CreateUser.partial()` for a PATCH body, `CreateUser.pick({ email: true })` for a narrower endpoint, `CreateUser.extend({ id: z.string().uuid() })` for the stored entity. Each stays welded to the base schema, so a change to `email` propagates everywhere at once — the same map-or-filter thinking as the utility types in M7, but now anchored to a runtime source of truth.",
            uk: "Уся цінність schema-first у тому, що тип — це *проєкція* схеми, тож не переоголошуйте форми руками. Якщо ловите себе на написанні `interface CreateUser { … }` поряд зі схемою `CreateUser` — видаліть interface і зробіть `z.infer` — інакше у вас два визначення, що розійдуться першої ж миті, коли хтось відредагує лише одне. Коли потрібен варіант, виводьте і його: `CreateUser.partial()` для PATCH-body, `CreateUser.pick({ email: true })` для вужчого endpoint, `CreateUser.extend({ id: z.string().uuid() })` для збереженої сутності. Кожен лишається привареним до базової схеми, тож зміна `email` поширюється всюди одразу — те саме map-or-filter-мислення, що й utility-типи в M7, але тепер закріплене за runtime-джерелом правди.",
          },
        },
      ],
    },
    // ── Topic 3 ───────────────────────────────────────────────────────────────
    {
      id: 't3-class-first-nest',
      title: { en: 'Class-first in NestJS: DTO classes + ValidationPipe', uk: 'Class-first у NestJS: DTO-класи + ValidationPipe' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "NestJS's built-in path is **class-first**: a DTO is a real `class`, and validation rules are **decorators** on its fields — `@IsEmail()`, `@IsInt()`, `@Min(0)`, `@IsEnum(Role)` — read at runtime by **class-validator**, with **class-transformer** turning the plain parsed JSON into an instance of that class. You wire it once with the **`ValidationPipe`**, and Nest validates every `@Body()`/`@Query()`/`@Param()` typed as a decorated DTO. This leans directly on M8's machinery: the pipe knows a parameter's DTO type only because `emitDecoratorMetadata` emitted `design:paramtypes`, which `reflect-metadata` hands back at runtime — validation is the *reason* NestJS keeps `experimentalDecorators` on. Three pipe options carry the security weight. `whitelist: true` **strips** any property the DTO does not declare; `forbidNonWhitelisted: true` upgrades that to a **rejection** (extra props → 400); `transform: true` returns an actual DTO **instance** and coerces primitives (the string `\"42\"` in a URL becomes `42` for an `@IsInt()` field). The class here is doing double duty — it is both the static type *and*, through its decorators, the runtime schema.",
            uk: "Вбудований шлях NestJS — **class-first**: DTO — це справжній `class`, а правила валідації — **decorators** на його полях — `@IsEmail()`, `@IsInt()`, `@Min(0)`, `@IsEnum(Role)` — які в runtime читає **class-validator**, а **class-transformer** перетворює розібраний JSON на екземпляр цього класу. Ви підключаєте це раз через **`ValidationPipe`**, і Nest валідує кожен `@Body()`/`@Query()`/`@Param()`, типізований як декорований DTO. Це прямо спирається на механіку M8: pipe знає тип DTO параметра лише тому, що `emitDecoratorMetadata` емітив `design:paramtypes`, який `reflect-metadata` віддає в runtime — валідація і є *причиною*, чому NestJS тримає `experimentalDecorators` увімкненим. Три опції pipe несуть вагу безпеки. `whitelist: true` **зрізає** будь-яку властивість, якої DTO не оголошує; `forbidNonWhitelisted: true` підвищує це до **відмови** (зайві props → 400); `transform: true` повертає справжній **екземпляр** DTO і приводить примітиви (рядок `\"42\"` в URL стає `42` для поля `@IsInt()`). Клас тут виконує подвійну роль — він і статичний тип, *і*, через свої decorators, runtime-схема.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `import { IsEmail, IsInt, Min, Max, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsEmail() email!: string;
  @IsInt() @Min(0) @Max(130) age!: number;
  @IsEnum(Role) role!: Role;
}

@Controller('users')
export class UsersController {
  @Post()
  create(@Body() dto: CreateUserDto) {   // Nest validates via design:paramtypes (M8) + ValidationPipe
    return this.users.create(dto);       // reaches here only if the body passed validation
  }
}

// main.ts — one global pipe. These three flags are the security posture:
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,             // strip properties not on the DTO
  forbidNonWhitelisted: true,  // …or reject the request outright if any appear
  transform: true,             // return a real DTO instance + coerce primitives ("42" → 42)
}));`,
          note: {
            en: 'The decorators are the runtime schema; the class is the static type. Without `ValidationPipe` the annotations are inert and `@Body()` is just an unchecked `any` wearing a type (M8’s security callout).',
            uk: 'Decorators — це runtime-схема; клас — статичний тип. Без `ValidationPipe` анотації інертні, а `@Body()` — просто неперевірений `any` у типі (security-callout з M8).',
          },
        },
        {
          kind: 'compare',
          a: { en: 'Schema-first (zod)', uk: 'Schema-first (zod)' },
          b: { en: 'Class-first (class-validator)', uk: 'Class-first (class-validator)' },
          rows: [
            [
              { en: 'Source of truth', uk: 'Джерело правди' },
              { en: 'The schema; type via `z.infer`', uk: 'Схема; тип через `z.infer`' },
              { en: 'The class; type is the class itself', uk: 'Клас; тип — це сам клас' },
            ],
            [
              { en: 'Runtime dependency', uk: 'Runtime-залежність' },
              { en: 'None special (plain functions)', uk: 'Немає особливих (звичайні функції)' },
              { en: '`reflect-metadata` + decorators (M8)', uk: '`reflect-metadata` + decorators (M8)' },
            ],
            [
              { en: 'Shares with the browser', uk: 'Ділиться з браузером' },
              { en: 'Yes — same schema client + server', uk: 'Так — одна схема клієнт + сервер' },
              { en: 'Awkward — classes + metadata ship along', uk: 'Незручно — класи + metadata їдуть слідом' },
            ],
            [
              { en: 'Native fit', uk: 'Природна відповідність' },
              { en: 'Any layer; tRPC, TanStack', uk: 'Будь-який шар; tRPC, TanStack' },
              { en: 'NestJS defaults, TypeORM entities', uk: 'Дефолти NestJS, TypeORM-сутності' },
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: { en: 'A decorated DTO without the pipe validates nothing', uk: 'Декорований DTO без pipe не валідує нічого' },
          md: {
            en: "`@IsEmail()` on a field is just metadata until a runtime consumer reads it. If the `ValidationPipe` is not registered (globally, or on the route/controller), the decorators do nothing and `@Body() dto: CreateUserDto` is exactly the erased `any` from Topic 1 — the request flows straight through with whatever shape it had. The same trap hits `transform`: with it **off**, a numeric route param arrives as the *string* `\"42\"` even though the field is typed `number`, so `dto.age > 18` compares a string and misbehaves silently. Register the pipe, turn on `whitelist` + `forbidNonWhitelisted` + `transform`, and treat any DTO reachable from the network as unvalidated until you can point to the pipe that checks it.",
            uk: "`@IsEmail()` на полі — лише metadata, доки runtime-споживач її не прочитає. Якщо `ValidationPipe` не зареєстровано (глобально чи на route/controller), decorators не роблять нічого, а `@Body() dto: CreateUserDto` — це рівно той стертий `any` із Теми 1: запит тече наскрізь із будь-якою формою, яку мав. Та сама пастка з `transform`: із ним **вимкненим** числовий route-param приходить як *рядок* `\"42\"`, хоча поле типізоване `number`, тож `dto.age > 18` порівнює рядок і тихо збоїть. Зареєструйте pipe, увімкніть `whitelist` + `forbidNonWhitelisted` + `transform` і вважайте будь-який DTO, досяжний із мережі, непровалідованим, доки не покажете pipe, що його перевіряє.",
          },
        },
      ],
    },
    // ── Topic 4 ───────────────────────────────────────────────────────────────
    {
      id: 't4-security-fail-closed',
      title: { en: 'Fail closed: mass-assignment, coercion & every boundary', uk: 'Fail closed: mass-assignment, coercion і кожна межа' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "Validation is a **security control**, so its failure mode has to be *closed*: an unexpected input is rejected, never waved through. Two classic holes come from getting that backwards. The first is **mass assignment / over-posting**: if you spread a request body into an entity — `Object.assign(user, body)` or `repo.create(body)` — a caller can set fields you never meant to expose (`isAdmin`, `passwordHash`, `balance`). `whitelist: true` is the fix: properties outside the DTO are stripped before they can reach the model. The second is a class-validator subtlety worth memorizing: **`forbidUnknownValues` defaults to `true`**, and it must stay that way. It rejects objects the validator has no metadata for; flip it to `false` and an unknown object can **pass validation with no checks at all** — a genuine bypass. Coercion is the third trap: `transform: true` and zod's `z.coerce.number()` are conveniences, but coercion of untrusted strings has surprising edges (`Number(\"\")` is `0`, `Boolean(\"false\")` is `true`), so validate the *coerced* result, not just the raw string. Finally, boundaries are **plural**. The inbound `@Body()` is the obvious one, but the response from a third-party API is `any` too, `process.env` values are all `string | undefined`, and a queue payload is untyped — each deserves a schema, or the erasure hole reopens somewhere you were not looking.",
            uk: "Валідація — це **засіб безпеки**, тож її режим відмови має бути *закритим*: неочікуваний вхід відхиляється, а не пропускається. Дві класичні діри виникають, коли це роблять навпаки. Перша — **mass assignment / over-posting**: якщо ви розгортаєте тіло запиту в сутність — `Object.assign(user, body)` чи `repo.create(body)` — викликач може виставити поля, які ви не збиралися відкривати (`isAdmin`, `passwordHash`, `balance`). `whitelist: true` — це виправлення: властивості поза DTO зрізаються, перш ніж досягнуть моделі. Друга — тонкість class-validator, яку варто запамʼятати: **`forbidUnknownValues` типово `true`**, і має таким лишатися. Він відхиляє обʼєкти, для яких у валідатора немає metadata; переставте на `false` — і невідомий обʼєкт може **пройти валідацію взагалі без перевірок**, справжній bypass. Coercion — третя пастка: `transform: true` і zod-івський `z.coerce.number()` зручні, але приведення недовірених рядків має несподівані краї (`Number(\"\")` — це `0`, `Boolean(\"false\")` — це `true`), тож валідуйте *приведений* результат, а не лише сирий рядок. Нарешті, меж — **багато**. Вхідний `@Body()` очевидний, але відповідь стороннього API — теж `any`, значення `process.env` усі `string | undefined`, а payload черги нетипізований — кожен заслуговує схему, інакше діра стирання відкриється там, куди ви не дивилися.",
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Boundary', uk: 'Межа' },
            { en: 'What TypeScript gives you', uk: 'Що дає TypeScript' },
            { en: 'The control', uk: 'Контроль' },
          ],
          rows: [
            [
              { en: 'HTTP body / query / params', uk: 'HTTP body / query / params' },
              { en: '`any` (erased DTO)', uk: '`any` (стертий DTO)' },
              { en: 'ValidationPipe / `schema.safeParse`', uk: 'ValidationPipe / `schema.safeParse`' },
            ],
            [
              { en: 'Third-party API response', uk: 'Відповідь стороннього API' },
              { en: '`any` from `res.json()`', uk: '`any` з `res.json()`' },
              { en: 'Parse the response with a schema', uk: 'Розберіть відповідь схемою' },
            ],
            [
              { en: 'Environment / config', uk: 'Оточення / config' },
              { en: '`string | undefined`', uk: '`string | undefined`' },
              { en: 'Validate `process.env` at boot', uk: 'Валідуйте `process.env` на старті' },
            ],
            [
              { en: 'Queue / event message', uk: 'Повідомлення черги / події' },
              { en: 'Untyped payload', uk: 'Нетипізований payload' },
              { en: 'Schema per message type', uk: 'Схема на кожен тип повідомлення' },
            ],
            [
              { en: 'Database row (loose driver)', uk: 'Рядок БД (слабкий драйвер)' },
              { en: 'Asserted, not checked', uk: 'Стверджений, не перевірений' },
              { en: 'Parse if the source is not trusted', uk: 'Розберіть, якщо джерело не довірене' },
            ],
          ],
          caption: {
            en: 'Every row is a place a type is a claim, not a fact. Validate at each one you do not fully control; “inbound only” leaves the others open.',
            uk: 'Кожен рядок — це місце, де тип є твердженням, а не фактом. Валідуйте кожне, що не контролюєте повністю; «лише вхідне» лишає решту відкритими.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// Validate config at boot — fail fast instead of discovering a bad env var mid-request.
const Env = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3000),  // "3000" (string) → 3000 (number)
  NODE_ENV: z.enum(['development', 'production', 'test']),
});
export const env = Env.parse(process.env);   // throws at startup if anything is missing/wrong

// Over-posting: without whitelist, a hostile field rides straight into the entity.
async function update(id: string, body: unknown) {
  const patch = UpdateUser.parse(body);      // schema has NO 'isAdmin' → it is dropped/rejected
  return this.repo.update(id, patch);        // never: repo.update(id, body as User)  ← privilege escalation
}`,
          note: {
            en: 'Config validated once at boot converts a whole class of "works on my machine" outages into a loud startup failure. The `update` shows why you parse into a narrow DTO instead of forwarding the raw body.',
            uk: 'Config, провалідований раз на старті, перетворює цілий клас збоїв «працює на моїй машині» на гучну помилку запуску. `update` показує, чому ви розбираєте у вузький DTO, а не пересилаєте сире тіло.',
          },
        },
        {
          kind: 'callout',
          tone: 'security',
          title: { en: 'The type after validation is only as narrow as the schema', uk: 'Тип після валідації рівно настільки вузький, як схема' },
          md: {
            en: "A passing validation proves the value matches *the schema you wrote* — no more. `z.string()` accepts an email-shaped string and a 10 MB string equally; `z.number()` accepts `-1` for a quantity; a `z.string()` on a URL field still lets in `javascript:` schemes. So encode the real invariant, not just the primitive: `.email()`, `.max(255)`, `.int().positive()`, `.url()`, `.uuid()`, `.regex(...)`. For values with a domain meaning, consider a **branded type** — `z.string().uuid().brand<'UserId'>()` yields a `UserId` that a plain `string` cannot be assigned to, so an unvalidated id is a *compile* error downstream, carrying the boundary check forward in the type system (the nominal trick from M1). Validation narrows the type; you decide how narrow.",
            uk: "Успішна валідація доводить, що значення відповідає *схемі, яку ви написали*, — не більше. `z.string()` однаково приймає рядок-схожий-на-email і рядок на 10 МБ; `z.number()` приймає `-1` для кількості; `z.string()` на полі URL усе одно впускає схеми `javascript:`. Тож кодуйте реальний інваріант, а не лише примітив: `.email()`, `.max(255)`, `.int().positive()`, `.url()`, `.uuid()`, `.regex(...)`. Для значень із доменним змістом розгляньте **branded type** — `z.string().uuid().brand<'UserId'>()` дає `UserId`, до якого не можна присвоїти звичайний `string`, тож непровалідований id стає *compile*-помилкою далі по коду, несучи перевірку межі вперед у системі типів (nominal-трюк із M1). Валідація звужує тип; наскільки вузько — вирішуєте ви.",
          },
        },
      ],
    },
    // ── Topic 5 ───────────────────────────────────────────────────────────────
    {
      id: 't5-choosing-composing',
      title: { en: 'Choosing an approach & Standard Schema', uk: 'Вибір підходу та Standard Schema' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "Which approach? Reach for **schema-first (zod/valibot/arktype)** when the same shape has to hold on both sides of the wire — a schema is a plain value you can `import` into an Angular app and a NestJS service alike, so the client validates a form and the server validates the body against **one** definition. Reach for **class-first (class-validator)** when you are living inside NestJS's defaults and your DTOs already double as TypeORM entities, where the decorator style is idiomatic and the tooling assumes it. You are not locked in, because of a 2025 development worth knowing: **Standard Schema**. It is not a library but a tiny (~60-line) TypeScript **interface** — a `~standard` property the schema exposes — authored jointly by the creators of Zod, Valibot and ArkType so that *consuming* tools can accept any of them without a per-library adapter. tRPC, TanStack Form/Router and a growing set of frameworks now accept \"any Standard Schema\", which means you can start on Zod for familiarity, switch to Valibot for a smaller bundle, and never touch the code that consumes the schema. The staff-level takeaway: validation has converged on a shared contract, so choose per *layer* on ergonomics and bundle size, and let the interface keep your boundaries portable.",
            uk: "Який підхід? Беріть **schema-first (zod/valibot/arktype)**, коли та сама форма має триматися з обох боків дроту — схема це звичайне значення, яке можна `import` і в Angular-застосунок, і в NestJS-сервіс однаково, тож клієнт валідує форму, а сервер валідує тіло проти **одного** визначення. Беріть **class-first (class-validator)**, коли ви живете всередині дефолтів NestJS і ваші DTO вже слугують TypeORM-сутностями, де decorator-стиль ідіоматичний, а інструментарій його припускає. Ви не замкнені, завдяки розробці 2025 року, яку варто знати: **Standard Schema**. Це не бібліотека, а крихітний (~60 рядків) TypeScript-**інтерфейс** — властивість `~standard`, яку схема відкриває — створений спільно авторами Zod, Valibot і ArkType, щоб *споживчі* інструменти могли приймати будь-який із них без адаптера на кожну бібліотеку. tRPC, TanStack Form/Router і дедалі більше фреймворків тепер приймають «будь-яку Standard Schema», а це означає, що можна почати на Zod заради звички, перейти на Valibot заради меншого bundle і жодного разу не торкнутися коду, що споживає схему. Staff-level-висновок: валідація зійшлася на спільному контракті, тож обирайте на кожен *шар* за ергономікою та розміром bundle, а інтерфейс тримає ваші межі портативними.",
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Situation', uk: 'Ситуація' },
            { en: 'Lean toward', uk: 'Схиляйтесь до' },
            { en: 'Why', uk: 'Чому' },
          ],
          rows: [
            [
              { en: 'Shared shape, client + server', uk: 'Спільна форма, клієнт + сервер' },
              { en: 'Schema-first (zod)', uk: 'Schema-first (zod)' },
              { en: 'A schema is an importable value', uk: 'Схема — це значення, яке можна import' },
            ],
            [
              { en: 'Deep in NestJS + TypeORM', uk: 'Глибоко в NestJS + TypeORM' },
              { en: 'Class-first', uk: 'Class-first' },
              { en: 'Idiomatic; DTO doubles as entity', uk: 'Ідіоматично; DTO = сутність' },
            ],
            [
              { en: 'Browser bundle size matters', uk: 'Важливий розмір bundle у браузері' },
              { en: 'Valibot / `@zod/mini`', uk: 'Valibot / `@zod/mini`' },
              { en: 'Tree-shakable, tiny footprint', uk: 'Tree-shakable, крихітний слід' },
            ],
            [
              { en: 'Consuming many validators', uk: 'Споживання багатьох валідаторів' },
              { en: 'Standard Schema', uk: 'Standard Schema' },
              { en: 'One `~standard` interface, no adapters', uk: 'Один інтерфейс `~standard`, без адаптерів' },
            ],
          ],
          caption: {
            en: 'Pick per layer, not per project. Standard Schema means the consuming code no longer has to care which validator you chose.',
            uk: 'Обирайте на кожен шар, не на весь проєкт. Standard Schema означає, що споживчий код більше не мусить знати, який валідатор ви обрали.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// Derive variants from ONE base schema instead of writing parallel DTOs (ties to M7 utility types).
const User = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  age: z.number().int().min(0),
});
const CreateUser = User.omit({ id: true });        // POST body — no id yet
const UpdateUser = CreateUser.partial();           // PATCH body — every field optional
type User = z.infer<typeof User>;

// Standard Schema: a tool accepts ANY compliant validator via the ~standard interface.
function parseWith<T>(schema: StandardSchemaV1<unknown, T>, input: unknown): T {
  const r = schema['~standard'].validate(input);
  if (r instanceof Promise) throw new Error('sync only here');
  if (r.issues) throw new BadRequestException(r.issues);
  return r.value;                                  // works for zod, valibot, arktype — unchanged
}`,
          note: {
            en: '`omit`/`partial`/`pick`/`extend` keep every variant welded to the base schema — the runtime-anchored version of the utility-type derivations in M7. `parseWith` never names Zod, so swapping validators does not touch it.',
            uk: '`omit`/`partial`/`pick`/`extend` тримають кожен варіант привареним до базової схеми — runtime-закріплена версія деривацій utility-типів із M7. `parseWith` ніде не називає Zod, тож заміна валідатора його не торкається.',
          },
        },
        {
          kind: 'callout',
          tone: 'senior',
          title: { en: 'One schema per boundary, derived everywhere else', uk: 'Одна схема на межу, виведена скрізь інше' },
          md: {
            en: "The pattern that scales is a **small set of base schemas at the edges** — one per resource or message — with every DTO, entity shape and client type *derived* from them by `pick`/`omit`/`partial`/`extend`. That gives you exactly one place to change when a field changes, a single artifact that is simultaneously the runtime check and the compile-time type, and — via Standard Schema — freedom to swap the validator without rewriting consumers. It is the same principle as the SSOT that runs through this whole guide: don't state a shape twice. State it once, at the boundary where it actually matters, validate against it, and let the type system carry the guarantee inward.",
            uk: "Патерн, що масштабується, — це **невеликий набір базових схем на краях** — одна на ресурс чи повідомлення — з кожним DTO, формою сутності й клієнтським типом, *виведеними* з них через `pick`/`omit`/`partial`/`extend`. Це дає рівно одне місце для зміни, коли поле змінюється, єдиний артефакт, що одночасно є runtime-перевіркою й compile-time-типом, і — через Standard Schema — свободу замінити валідатор без переписування споживачів. Це той самий принцип, що й SSOT, який проходить через увесь цей гайд: не оголошуйте форму двічі. Оголосіть її раз, на межі, де вона реально важлива, валідуйте проти неї й дайте системі типів пронести гарантію всередину.",
          },
        },
      ],
    },
  ],

  keyPoints: [
    {
      en: 'Types are **fully erased** at runtime, so at every trust boundary an annotation is only a claim. `JSON.parse` returns `any` and `res.json()` returns `Promise<any>`; type raw input as `unknown` and refuse to touch it until it is validated.',
      uk: 'Типи **повністю стираються** в runtime, тож на кожній межі довіри анотація — лише твердження. `JSON.parse` повертає `any`, а `res.json()` — `Promise<any>`; типізуйте сирий вхід як `unknown` і не торкайтесь його, доки він не провалідований.',
    },
    {
      en: '“Parse, don’t validate”: turn input into a **typed value in one step** and never `as`-cast untrusted data — a cast asserts the type and checks nothing, letting malformed input flow inward wearing a type it does not have.',
      uk: '«Parse, don’t validate»: перетворюйте вхід на **типізоване значення за один крок** і ніколи не кастуйте (`as`) недовірені дані — каст стверджує тип і не перевіряє нічого, впускаючи спотворений вхід у типі, якого він не має.',
    },
    {
      en: 'Schema-first (zod) makes the schema the **single source of truth**: `z.infer<typeof S>` derives the type; `parse` throws a `ZodError`, `safeParse` returns a `{ success }` **discriminated union** (M2) you must narrow. Zod 4 (2025) is far faster and slimmer, with a tree-shakable `@zod/mini`.',
      uk: 'Schema-first (zod) робить схему **єдиним джерелом правди**: `z.infer<typeof S>` виводить тип; `parse` кидає `ZodError`, `safeParse` повертає **discriminated union** `{ success }` (M2), який треба звузити. Zod 4 (2025) значно швидший і легший, з tree-shakable `@zod/mini`.',
    },
    {
      en: 'NestJS class-first uses **class-validator** decorators + **`ValidationPipe`** (`whitelist` strips unknown props, `forbidNonWhitelisted` rejects them, `transform` builds the DTO instance and coerces). It depends on `reflect-metadata`/`design:paramtypes` (M8) — which is why Nest keeps `experimentalDecorators` on.',
      uk: 'Class-first у NestJS використовує decorators **class-validator** + **`ValidationPipe`** (`whitelist` зрізає невідомі props, `forbidNonWhitelisted` відхиляє їх, `transform` будує екземпляр DTO і приводить типи). Він залежить від `reflect-metadata`/`design:paramtypes` (M8) — тому Nest тримає `experimentalDecorators` увімкненим.',
    },
    {
      en: 'Validation is a **security control that must fail closed**: `whitelist` stops mass-assignment/over-posting; class-validator’s `forbidUnknownValues` **defaults to `true`** and flipping it off is a real bypass; encode the true invariant (`.email()`, `.max()`, `.uuid()`), optionally as a **branded type** (M1), not just the primitive.',
      uk: 'Валідація — це **засіб безпеки, що має fail closed**: `whitelist` спиняє mass-assignment/over-posting; `forbidUnknownValues` у class-validator **типово `true`**, і вимкнути його — справжній bypass; кодуйте реальний інваріант (`.email()`, `.max()`, `.uuid()`), за потреби як **branded type** (M1), а не лише примітив.',
    },
    {
      en: 'Boundaries are plural — inbound bodies, third-party responses, `process.env`, queue messages all need a schema. Keep **one base schema per boundary** and derive DTO variants with `pick`/`omit`/`partial` (M7); **Standard Schema** (`~standard`) lets tools like tRPC/TanStack accept any validator without adapters.',
      uk: 'Меж багато — вхідні тіла, відповіді сторонніх, `process.env`, повідомлення черг усі потребують схему. Тримайте **одну базову схему на межу** й виводьте варіанти DTO через `pick`/`omit`/`partial` (M7); **Standard Schema** (`~standard`) дає інструментам на кшталт tRPC/TanStack приймати будь-який валідатор без адаптерів.',
    },
  ],

  pitfalls: [
    {
      title: { en: 'Casting untrusted input with `as`', uk: 'Каст недовіреного входу через `as`' },
      body: {
        en: '`const dto = req.body as CreateUserDto` (or annotating a `JSON.parse` result) type-checks and validates nothing — an assertion overrides the compiler without inspecting the data. Hostile or malformed input then enters typed as something it is not. Type raw input as `unknown` and `parse` it; keep `as` off the boundary path entirely.',
        uk: '`const dto = req.body as CreateUserDto` (чи анотація результату `JSON.parse`) проходить перевірку й не валідує нічого — assertion перевизначає компілятор, не оглядаючи дані. Ворожий чи спотворений вхід тоді входить у типі, якого не має. Типізуйте сирий вхід як `unknown` і `parse`-ніть його; тримайте `as` повністю поза шляхом межі.',
      },
    },
    {
      title: { en: 'Duplicating an interface next to a schema', uk: 'Дублювання interface поряд зі схемою' },
      body: {
        en: 'Writing `interface CreateUser {…}` beside a zod `CreateUser` schema creates two sources of truth that drift the first time only one is edited, reintroducing the mismatch validation was meant to remove. Delete the interface and `type CreateUser = z.infer<typeof CreateUser>`; derive variants with `.partial()`/`.pick()` rather than re-declaring them.',
        uk: 'Написання `interface CreateUser {…}` поряд зі схемою zod `CreateUser` створює два джерела правди, що розходяться першої ж миті, коли редагують лише одне, повертаючи невідповідність, яку валідація мала прибрати. Видаліть interface і `type CreateUser = z.infer<typeof CreateUser>`; виводьте варіанти через `.partial()`/`.pick()`, а не переоголошуйте їх.',
      },
    },
    {
      title: { en: 'Decorated DTOs with no ValidationPipe (or no `transform`)', uk: 'Декоровані DTO без ValidationPipe (чи без `transform`)' },
      body: {
        en: 'class-validator decorators are inert metadata until the `ValidationPipe` reads them; forget to register it and `@Body() dto` is an unchecked `any`. With `transform` off, numeric route/query params arrive as strings despite a `number` annotation, so comparisons silently misbehave. Register the pipe globally with `whitelist` + `forbidNonWhitelisted` + `transform`.',
        uk: 'Decorators class-validator — інертна metadata, доки `ValidationPipe` їх не прочитає; забудьте зареєструвати його — і `@Body() dto` стає неперевіреним `any`. Із вимкненим `transform` числові route/query-параметри приходять рядками попри анотацію `number`, тож порівняння тихо збоять. Реєструйте pipe глобально з `whitelist` + `forbidNonWhitelisted` + `transform`.',
      },
    },
    {
      title: { en: 'Trusting a shallow schema', uk: 'Довіра поверхневій схемі' },
      body: {
        en: 'A passing `z.string()`/`z.number()` proves only the primitive, not the invariant: it accepts a 10 MB string, a negative quantity, or a `javascript:` URL. Under-constrained schemas give a false sense of safety. Encode the real rule (`.email()`, `.max()`, `.int().positive()`, `.url()`, `.regex()`), and for domain ids consider a branded type so an unvalidated value is a compile error downstream.',
        uk: 'Успішний `z.string()`/`z.number()` доводить лише примітив, а не інваріант: він приймає рядок на 10 МБ, відʼємну кількість чи URL `javascript:`. Недообмежені схеми дають хибне відчуття безпеки. Кодуйте реальне правило (`.email()`, `.max()`, `.int().positive()`, `.url()`, `.regex()`), а для доменних id розгляньте branded type, щоб непровалідоване значення стало compile-помилкою далі.',
      },
    },
  ],

  interview: [
    {
      q: { en: 'Why isn’t a TypeScript type enough to trust an HTTP request body, and what do you do instead?', uk: 'Чому типу TypeScript недостатньо, щоб довіряти тілу HTTP-запиту, і що робити натомість?' },
      a: {
        en: 'Types are erased at compile time — nothing about the DTO exists in the running JavaScript — so a body annotated `CreateUserDto` is just a claim about data the compiler never saw. `JSON.parse` hands back `any`, which satisfies any annotation silently, and `as` asserts a type while checking nothing. You close the gap with a runtime check at the boundary: type the raw input as `unknown`, then parse it with a schema (zod `safeParse`) or a NestJS `ValidationPipe` reading class-validator decorators, so the value is inspected and refused if the shape is wrong. The rule is “parse, don’t validate”: produce a typed value in one step rather than a boolean, and never cast untrusted input.',
        uk: 'Типи стираються при компіляції — нічого від DTO немає в JavaScript, що виконується — тож тіло, анотоване `CreateUserDto`, лише твердження про дані, яких компілятор не бачив. `JSON.parse` віддає `any`, що мовчки задовольняє будь-яку анотацію, а `as` стверджує тип, не перевіряючи нічого. Розрив закривають runtime-перевіркою на межі: типізуйте сирий вхід як `unknown`, тоді розберіть його схемою (zod `safeParse`) чи NestJS `ValidationPipe`, що читає decorators class-validator, щоб значення оглянули й відмовили, якщо форма не та. Правило — «parse, don’t validate»: створюйте типізоване значення за один крок, а не boolean, і ніколи не кастуйте недовірений вхід.',
      },
      level: 'senior',
    },
    {
      q: { en: 'What does `z.infer` buy you over hand-writing an interface, and how does `safeParse` relate to narrowing?', uk: 'Що дає `z.infer` порівняно з ручним interface, і як `safeParse` повʼязаний зі звуженням?' },
      a: {
        en: '`z.infer<typeof Schema>` derives the static type from the runtime schema, so there is a single source of truth: change the schema and the type follows, and they can never drift the way a separate `interface` and validator do. `safeParse` returns a discriminated union — `{ success: true; data: T } | { success: false; error: ZodError }` — so consuming it is ordinary narrowing (M2): you check `result.success`, and only in the `true` branch does the compiler let you reach `result.data` as `T`. That makes the failure path impossible to forget, which is why `safeParse` is the better default at a boundary than `parse` + `try/catch`.',
        uk: '`z.infer<typeof Schema>` виводить статичний тип із runtime-схеми, тож є єдине джерело правди: змініть схему — тип іде за нею, і вони не розійдуться, як окремі `interface` й валідатор. `safeParse` повертає discriminated union — `{ success: true; data: T } | { success: false; error: ZodError }` — тож його споживання це звичайне звуження (M2): ви перевіряєте `result.success`, і лише в гілці `true` компілятор дає дістатися до `result.data` як `T`. Це робить шлях помилки неможливим забути, тому `safeParse` кращий дефолт на межі, ніж `parse` + `try/catch`.',
      },
      level: 'senior',
    },
    {
      q: { en: 'In NestJS, what do ValidationPipe’s `whitelist`, `forbidNonWhitelisted` and `transform` do, and why does validation depend on M8’s metadata?', uk: 'У NestJS що роблять `whitelist`, `forbidNonWhitelisted` і `transform` у ValidationPipe і чому валідація залежить від metadata з M8?' },
      a: {
        en: '`whitelist: true` strips any property not declared on the DTO (stopping over-posting); `forbidNonWhitelisted: true` turns those extra properties into a 400 instead of silently dropping them; `transform: true` returns a real class instance and coerces primitives, so a `"42"` route param becomes `42` for a `number` field. Validation depends on M8 because the pipe learns a parameter’s DTO type from `design:paramtypes`, which only exists because `emitDecoratorMetadata` emitted it and `reflect-metadata` exposes it at runtime — that’s exactly why NestJS stays on `experimentalDecorators`. Without the pipe registered, the decorators are inert and `@Body()` is an unchecked `any`.',
        uk: '`whitelist: true` зрізає будь-яку властивість, не оголошену на DTO (спиняючи over-posting); `forbidNonWhitelisted: true` перетворює ці зайві властивості на 400 замість тихого відкидання; `transform: true` повертає справжній екземпляр класу й приводить примітиви, тож route-параметр `"42"` стає `42` для поля `number`. Валідація залежить від M8, бо pipe дізнається тип DTO параметра з `design:paramtypes`, який існує лише тому, що `emitDecoratorMetadata` його емітив, а `reflect-metadata` відкриває в runtime — саме тому NestJS лишається на `experimentalDecorators`. Без зареєстрованого pipe decorators інертні, а `@Body()` — неперевірений `any`.',
      },
      level: 'senior',
    },
    {
      q: { en: 'How would you architect validation across a NestJS API and an Angular client, and where does Standard Schema fit?', uk: 'Як би ви побудували валідацію між NestJS API та Angular-клієнтом, і де тут Standard Schema?' },
      a: {
        en: 'I’d keep a small set of schema-first base schemas (zod/valibot) as the single source of truth per resource, in a shared package both sides import — the client validates the form and the server validates the body against the same definition, and DTO variants (create/update/response) are derived with `pick`/`omit`/`partial` rather than re-declared, so a field change propagates once. Class-first class-validator is reasonable when DTOs double as TypeORM entities and you live in Nest’s defaults, but it ships classes + metadata to the browser awkwardly. Standard Schema is the interop layer: it’s a ~60-line `~standard` interface the Zod/Valibot/ArkType authors agreed on, so tools like tRPC and TanStack accept any compliant validator without a per-library adapter — you can switch validators for bundle-size reasons without rewriting the code that consumes them. Net: one schema per boundary, everything else derived, and the consuming code decoupled from the validator choice.',
        uk: 'Я б тримав невеликий набір schema-first базових схем (zod/valibot) як єдине джерело правди на ресурс, у спільному пакеті, який імпортують обидві сторони — клієнт валідує форму, сервер валідує тіло проти того самого визначення, а варіанти DTO (create/update/response) виводяться через `pick`/`omit`/`partial`, а не переоголошуються, тож зміна поля поширюється раз. Class-first class-validator доречний, коли DTO слугують TypeORM-сутностями і ви в дефолтах Nest, але він незручно везе класи + metadata у браузер. Standard Schema — це шар взаємодії: це ~60-рядковий інтерфейс `~standard`, на який погодились автори Zod/Valibot/ArkType, тож інструменти на кшталт tRPC і TanStack приймають будь-який сумісний валідатор без адаптера на бібліотеку — можна змінити валідатор заради розміру bundle, не переписуючи код, що його споживає. Підсумок: одна схема на межу, решта виведена, а споживчий код відвʼязаний від вибору валідатора.',
      },
      level: 'staff',
    },
  ],

  seeAlso: ['m8-decorators-metadata', 'm2-narrowing', 'm7-utility-types', 'm1-structural-typing'],

  sources: [
    { title: 'Zod — Basics (parse vs safeParse, error handling)', url: 'https://zod.dev/basics' },
    { title: 'Zod — Defining schemas & z.infer', url: 'https://zod.dev/api' },
    { title: 'Zod v4 — Release notes (performance, @zod/mini)', url: 'https://zod.dev/v4' },
    { title: 'NestJS — Validation (ValidationPipe: whitelist, forbidNonWhitelisted, transform)', url: 'https://docs.nestjs.com/techniques/validation' },
    { title: 'class-validator — README (forbidUnknownValues defaults true; validation options)', url: 'https://github.com/typestack/class-validator' },
    { title: 'class-transformer — README (plainToInstance / transform)', url: 'https://github.com/typestack/class-transformer' },
    { title: 'Standard Schema — the shared validator interface (~standard)', url: 'https://standardschema.dev/' },
    { title: 'Standard Schema — spec & rationale (Zod/Valibot/ArkType authors)', url: 'https://github.com/standard-schema/standard-schema' },
    { title: 'Valibot — modular, tree-shakable schema library', url: 'https://valibot.dev/' },
    { title: 'Parse, don’t validate (Alexis King) — the guiding principle', url: 'https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/' },
    { title: 'Announcing TypeScript 7.0 RC (Go-native; checking semantics identical to 6.0)', url: 'https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-rc/' },
  ],
};
