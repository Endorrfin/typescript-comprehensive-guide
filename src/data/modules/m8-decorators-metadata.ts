import type { Module } from '../types';

/*
 * M8 (S6) — Decorators & Metadata (NestJS · Angular). Opens Section III (Applied).
 * Diagram-first (no signature sim — CURRICULUM marks M8 '—'). Two figures:
 * 'decorator-two-systems' (legacy (target, key, descriptor) vs standard (value, context)) and
 * 'di-metadata-flow' (constructor → emitDecoratorMetadata → design:paramtypes → Reflect.getMetadata →
 * container resolves by type). All version-sensitive facts web-verified (see sources): standard
 * decorators shipped TS 5.0 (no flag, (value, context)); decorator metadata / Symbol.metadata TS 5.2;
 * standard decorators deliberately DROP parameter decorators + emitDecoratorMetadata, so NestJS 11 /
 * Angular / TypeORM stay on legacy experimentalDecorators; Nest reads design:paramtypes via
 * reflect-metadata at runtime, Angular's ngtsc generates metadata at build (AOT, no emitDecoratorMetadata)
 * and is shifting to inject() + signal input()/output(); TS 6.0 stable / 7.0 Go-native RC (Jun 2026),
 * checking semantics identical.
 */
export const m8: Module = {
  id: 'm8-decorators-metadata',
  num: 8,
  section: 's3-applied',
  order: 1,
  level: 'senior',
  title: { en: 'Decorators & Metadata (NestJS · Angular)', uk: 'Decorators та Metadata (NestJS · Angular)' },
  tagline: {
    en: 'Two incompatible decorator systems, the metadata that powers dependency injection, and why frameworks are stuck on the legacy one.',
    uk: 'Дві несумісні системи decorators, metadata, що живить dependency injection, і чому фреймворки застрягли на legacy.',
  },
  readMins: 22,
  mentalModel: {
    en: 'A decorator is a function that runs on a declaration at definition time — it can observe it, replace it, or record metadata a framework reads back later to wire things up.',
    uk: 'Decorator — це функція, що виконується над оголошенням у момент його визначення: вона може спостерігати за ним, замінити його або записати metadata, яку фреймворк зчитає потім, щоб усе звʼязати.',
  },

  topics: [
    // ── Topic 1 ───────────────────────────────────────────────────────────────
    {
      id: 't1-two-decorator-systems',
      title: { en: 'Two decorator systems: standard vs legacy', uk: 'Дві системи decorators: standard проти legacy' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "A decorator is just a function attached to a declaration with `@name`, and TypeScript runs it *when the class is defined*, not when instances are created. The trap for anyone working in NestJS or Angular is that **there are two different decorator systems**, and they are not compatible. The modern one is the **TC39 standard** (Stage 3), shipped in **TypeScript 5.0** — it needs *no* compiler flag, and a decorator receives `(value, context)`. The older one is **legacy/experimental**, enabled by `experimentalDecorators` in `tsconfig`, based on a 2015-era proposal draft, where a decorator receives `(target, propertyKey, descriptor)`. Your `tsconfig` selects **one system for the whole compilation** — you cannot mix them. The reason this matters far beyond trivia: the standard system deliberately removed the two features every DI framework relies on, so NestJS, Angular, TypeORM and TypeGraphQL are all still built on **legacy** decorators (Topics 3–4).",
            uk: "Decorator — це просто функція, причеплена до оголошення через `@name`, і TypeScript виконує її *коли клас визначається*, а не коли створюються екземпляри. Пастка для будь-кого в NestJS чи Angular: **існує дві різні системи decorators**, і вони несумісні. Сучасна — це **TC39 standard** (Stage 3), що вийшла в **TypeScript 5.0**: їй *не* потрібен жоден compiler-флаг, і decorator отримує `(value, context)`. Старіша — **legacy/experimental**, вмикається через `experimentalDecorators` у `tsconfig`, базується на чернетці пропозиції 2015 року, де decorator отримує `(target, propertyKey, descriptor)`. Ваш `tsconfig` обирає **одну систему на всю компіляцію** — змішати їх не можна. Чому це важливо, а не просто дрібниця: standard-система навмисно прибрала дві можливості, на які спирається кожен DI-фреймворк, тож NestJS, Angular, TypeORM і TypeGraphQL усі досі побудовані на **legacy**-decorators (Теми 3–4).",
          },
        },
        {
          kind: 'figure',
          fig: 'decorator-two-systems',
          caption: {
            en: 'The same `@log` name, two shapes. A legacy decorator receives `(target, key, descriptor)` and mutates the descriptor; a standard decorator receives `(value, context)` and returns a replacement. The `tsconfig` flag picks which.',
            uk: 'Те саме імʼя `@log`, дві форми. Legacy-decorator отримує `(target, key, descriptor)` і мутує descriptor; standard-decorator отримує `(value, context)` і повертає заміну. Флаг у `tsconfig` вирішує, яка.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// STANDARD (TS 5.0+, no flag): (value, context) → optional replacement
function logged(value: Function, context: ClassMethodDecoratorContext) {
  return function (this: unknown, ...args: unknown[]) {
    console.log('call', String(context.name));
    return (value as Function).apply(this, args);
  };
}

// LEGACY (experimentalDecorators): (target, propertyKey, descriptor)
function loggedLegacy(target: object, key: string, desc: PropertyDescriptor) {
  const original = desc.value;
  desc.value = function (...args: unknown[]) {
    console.log('call', key);
    return original.apply(this, args);
  };
}

class Api { @logged getUser(id: string) { /* … */ } }`,
          note: {
            en: 'Same intent, different mechanics: the standard decorator *returns* a new method; the legacy one *mutates* the property descriptor in place. Swapping the `tsconfig` flag changes which signature type-checks.',
            uk: 'Той самий намір, різна механіка: standard-decorator *повертає* новий метод; legacy — *мутує* property descriptor на місці. Перемикання флага в `tsconfig` змінює, яка сигнатура проходить перевірку.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Aspect', uk: 'Аспект' },
            { en: 'Standard (TC39, TS 5.0)', uk: 'Standard (TC39, TS 5.0)' },
            { en: 'Legacy (experimental)', uk: 'Legacy (experimental)' },
          ],
          rows: [
            [
              { en: 'tsconfig', uk: 'tsconfig' },
              { en: 'No flag (default)', uk: 'Без флага (типово)' },
              { en: '`experimentalDecorators: true`', uk: '`experimentalDecorators: true`' },
            ],
            [
              { en: 'Decorator signature', uk: 'Сигнатура decorator-а' },
              { en: '`(value, context)`', uk: '`(value, context)`' },
              { en: '`(target, key, descriptor)`', uk: '`(target, key, descriptor)`' },
            ],
            [
              { en: 'Parameter decorators', uk: 'Parameter decorators' },
              { en: 'Not supported', uk: 'Не підтримуються' },
              { en: 'Supported', uk: 'Підтримуються' },
            ],
            [
              { en: '`emitDecoratorMetadata`', uk: '`emitDecoratorMetadata`' },
              { en: 'Not compatible', uk: 'Несумісно' },
              { en: 'Supported (`design:*`)', uk: 'Підтримується (`design:*`)' },
            ],
            [
              { en: 'Used by NestJS / Angular / TypeORM', uk: 'Використовують NestJS / Angular / TypeORM' },
              { en: 'Not yet', uk: 'Ще ні' },
              { en: 'Yes (today)', uk: 'Так (сьогодні)' },
            ],
          ],
          caption: {
            en: 'The two systems at a glance. The last two rows are why the whole DI ecosystem stays on legacy decorators.',
            uk: 'Дві системи побіжно. Останні два рядки — причина, чому вся DI-екосистема лишається на legacy-decorators.',
          },
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: { en: 'You cannot half-migrate — the flag is per compilation', uk: 'Не можна мігрувати наполовину — флаг діє на всю компіляцію' },
          md: {
            en: "`experimentalDecorators` is a single switch for the *entire* program, not a per-file choice. With it **on**, every decorator in the build is legacy and type-checks against `(target, key, descriptor)`; with it **off**, every decorator is standard and checks against `(value, context)`. There is no gradual migration where old and new decorators coexist. That is why a codebase built on NestJS is committed to legacy decorators everywhere, and adopting standard-decorator libraries means flipping the flag off *and* rewriting every decorator at once — plus finding replacements for the parameter decorators and metadata the standard system does not provide.",
            uk: "`experimentalDecorators` — це один перемикач для *усієї* програми, а не вибір на кожен файл. З ним **увімкненим** кожен decorator у збірці — legacy й перевіряється проти `(target, key, descriptor)`; з ним **вимкненим** кожен decorator — standard і перевіряється проти `(value, context)`. Немає поступової міграції, де старі й нові decorators співіснують. Саме тому кодова база на NestJS прив'язана до legacy-decorators усюди, а перехід на standard-decorator-бібліотеки означає вимкнути флаг *і* переписати кожен decorator одразу — плюс знайти заміну для parameter decorators і metadata, яких standard-система не дає.",
          },
        },
      ],
    },
    // ── Topic 2 ───────────────────────────────────────────────────────────────
    {
      id: 't2-standard-decorators',
      title: { en: 'The standard decorator: value in, replacement out', uk: 'Standard-decorator: value на вході, заміна на виході' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "A standard decorator is a function `(value, context) => replacement | void`. The `value` is the thing being decorated — the method function for a method decorator, the constructor for a class decorator, or `undefined` for a field. The `context` is a strongly-typed object describing the declaration: `context.kind` (`'class' | 'method' | 'getter' | 'setter' | 'field' | 'accessor'`), `context.name`, `context.static`, `context.private`, an `access` object, and `context.addInitializer(fn)`. If the decorator **returns a value, it replaces the declaration** — a method decorator returns a new function that stands in for the method; a field decorator returns an initializer `(initialValue) => newValue`. TypeScript gives you exact contextual types through helpers like `ClassMethodDecoratorContext<This, Value>`, so the replacement you return is checked against the real member signature. There is also the **auto-accessor**: writing `accessor x = 0` (the `accessor` keyword, TS 5.0) generates a getter/setter backed by a private field, decoratable as a single unit.",
            uk: "Standard-decorator — це функція `(value, context) => replacement | void`. `value` — це те, що декорується: функція-метод для method-decorator, конструктор для class-decorator або `undefined` для field. `context` — строго типізований обʼєкт, що описує оголошення: `context.kind` (`'class' | 'method' | 'getter' | 'setter' | 'field' | 'accessor'`), `context.name`, `context.static`, `context.private`, обʼєкт `access` та `context.addInitializer(fn)`. Якщо decorator **повертає значення — воно замінює оголошення**: method-decorator повертає нову функцію, що підміняє метод; field-decorator повертає initializer `(initialValue) => newValue`. TypeScript дає точні контекстні типи через helper-и на кшталт `ClassMethodDecoratorContext<This, Value>`, тож заміна, яку ви повертаєте, перевіряється проти реальної сигнатури члена. Є ще **auto-accessor**: запис `accessor x = 0` (ключове слово `accessor`, TS 5.0) генерує getter/setter на основі приватного поля, яке декорується як єдине ціле.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// A fully-typed standard method decorator: This = instance type, Args/Return preserved.
function bound<This, Args extends unknown[], Return>(
  value: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  const name = context.name;                // string | symbol — the member name
  context.addInitializer(function (this: This) {
    // runs once per instance, at construction — bind the method to 'this':
    (this as Record<string | symbol, unknown>)[name] = (value as Function).bind(this);
  });
  return value;                             // return a replacement, or nothing to keep the original
}

class Counter {
  count = 0;
  @bound increment() { this.count++; }      // 'increment' stays bound even when passed as a callback
}`,
          note: {
            en: 'The generic `This` / `Args` / `Return` parameters keep the returned function assignable to the original method signature (M3) — the decorator is transparent to callers.',
            uk: 'Generic-параметри `This` / `Args` / `Return` тримають повернуту функцію assignable до оригінальної сигнатури методу (M3) — decorator прозорий для викликачів.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'Decorator kind', uk: 'Вид decorator-а' },
            { en: '`value` it receives', uk: '`value`, який отримує' },
            { en: 'A returned value…', uk: 'Повернене значення…' },
          ],
          rows: [
            [
              { en: 'Class', uk: 'Class' },
              { en: 'The constructor', uk: 'Конструктор' },
              { en: 'Replaces the class', uk: 'Замінює клас' },
            ],
            [
              { en: 'Method', uk: 'Method' },
              { en: 'The method function', uk: 'Функція-метод' },
              { en: 'Replaces the method', uk: 'Замінює метод' },
            ],
            [
              { en: 'Getter / Setter', uk: 'Getter / Setter' },
              { en: 'The get/set function', uk: 'Функція get/set' },
              { en: 'Replaces that accessor', uk: 'Замінює цей accessor' },
            ],
            [
              { en: 'Field', uk: 'Field' },
              { en: '`undefined`', uk: '`undefined`' },
              { en: 'Is an initializer `(v) => v`', uk: 'Є initializer `(v) => v`' },
            ],
            [
              { en: 'Auto-accessor (`accessor x`)', uk: 'Auto-accessor (`accessor x`)' },
              { en: '`{ get, set }`', uk: '`{ get, set }`' },
              { en: 'Replaces get/set/init', uk: 'Замінює get/set/init' },
            ],
          ],
          caption: {
            en: 'Every standard decorator kind: what arrives as `value`, and what returning something does. Parameter decorators are absent by design — that gap drives Topic 3.',
            uk: 'Кожен вид standard-decorator-а: що приходить як `value` і що робить повернення. Parameter decorators відсутні за задумом — саме цей пробіл рухає Тему 3.',
          },
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: { en: '`addInitializer` replaces the constructor hook', uk: '`addInitializer` заміняє гачок у конструкторі' },
          md: {
            en: "A standard decorator cannot reach into the constructor the way a legacy one could, so per-instance setup goes through **`context.addInitializer(fn)`** — the callback runs once per instance during construction, with `this` bound to the instance. It is the idiomatic place to bind a method (as above), register the instance somewhere, or validate initial state. For field decorators the returned initializer `(initialValue) => newValue` is the other per-instance hook — it lets you transform or wrap the default value each time an instance is built.",
            uk: "Standard-decorator не може дістатися до конструктора так, як міг legacy, тож налаштування на кожен екземпляр іде через **`context.addInitializer(fn)`** — callback виконується раз на екземпляр під час конструювання, з `this`, привʼязаним до екземпляра. Це ідіоматичне місце, щоб привʼязати метод (як вище), десь зареєструвати екземпляр чи перевірити початковий стан. Для field-decorators повернений initializer `(initialValue) => newValue` — інший per-instance-гачок: він дає трансформувати чи обгорнути дефолтне значення щоразу, коли будується екземпляр.",
          },
        },
      ],
    },
    // ── Topic 3 ───────────────────────────────────────────────────────────────
    {
      id: 't3-metadata-reflection',
      title: { en: 'Metadata & `reflect-metadata`: how DI reads types', uk: 'Metadata та `reflect-metadata`: як DI читає типи' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "Dependency injection needs to know *what type* each constructor parameter is, at runtime — but types are erased, so how? The legacy answer is **`emitDecoratorMetadata`**. With that flag on, for any declaration carrying **at least one** decorator, TypeScript emits three metadata keys through the `reflect-metadata` polyfill: **`design:type`** (the member's type), **`design:paramtypes`** (an array of the parameter types, as runtime constructors), and **`design:returntype`**. A DI container then reads `Reflect.getMetadata('design:paramtypes', SomeClass)` to get `[UserRepository, Logger]` and resolves a provider for each — which is exactly why `@Injectable()` on a class with `constructor(private repo: UserRepository)` is enough for NestJS to wire it, with no manual token. **The catch is fundamental:** the emitted entry is the *runtime value* of the type annotation, so anything without a runtime representation collapses to `Object` — interfaces, type aliases, unions, and generic type parameters all erase. Inject `constructor(private cfg: AppConfig)` where `AppConfig` is an `interface`, and the metadata says `Object`; the container has nothing to resolve.",
            uk: "Dependency injection має знати, *якого типу* кожен параметр конструктора, у runtime — але типи стираються, тож як? Legacy-відповідь — **`emitDecoratorMetadata`**. З увімкненим флагом для будь-якого оголошення, що має **хоча б один** decorator, TypeScript емітить три metadata-ключі через polyfill `reflect-metadata`: **`design:type`** (тип члена), **`design:paramtypes`** (масив типів параметрів як runtime-конструктори) і **`design:returntype`**. DI-контейнер тоді читає `Reflect.getMetadata('design:paramtypes', SomeClass)`, отримує `[UserRepository, Logger]` і резолвить provider для кожного — саме тому `@Injectable()` на класі з `constructor(private repo: UserRepository)` достатньо, щоб NestJS усе звʼязав, без ручного token. **Пастка фундаментальна:** емітований запис — це *runtime-значення* анотації типу, тож усе, що не має runtime-представлення, згортається в `Object` — interface-и, type alias-и, union-и та generic type-параметри стираються. Впровадьте `constructor(private cfg: AppConfig)`, де `AppConfig` — `interface`, і metadata скаже `Object`; контейнеру нема що резолвити.",
          },
        },
        {
          kind: 'figure',
          fig: 'di-metadata-flow',
          caption: {
            en: 'The legacy DI pipeline: a decorated constructor makes `emitDecoratorMetadata` write `design:paramtypes` via `reflect-metadata`; at runtime the container reads it back with `Reflect.getMetadata` and resolves each parameter by type.',
            uk: 'Legacy DI-конвеєр: декорований конструктор змушує `emitDecoratorMetadata` записати `design:paramtypes` через `reflect-metadata`; у runtime контейнер зчитує це назад через `Reflect.getMetadata` і резолвить кожен параметр за типом.',
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `import 'reflect-metadata';                 // once, at the entrypoint (main.ts)

@Injectable()
class UserService {
  // design:paramtypes = [UserRepository] → Nest resolves it from the container:
  constructor(private repo: UserRepository) {}
}

// ✗ Interfaces have no runtime value — design:paramtypes sees Object here:
@Injectable()
class ReportService {
  constructor(private cfg: AppConfig) {}   // AppConfig is an interface → Nest: "can't resolve"
}

// ✓ Fix: inject a token (class or string/symbol) the container can key on:
@Injectable()
class ReportServiceOk {
  constructor(@Inject('APP_CONFIG') private cfg: AppConfig) {}
}`,
          note: {
            en: 'The rule of thumb: you can inject by *type* only when the type is a class (a runtime value). For interfaces, unions or config objects, inject an explicit token with `@Inject(TOKEN)`.',
            uk: 'Правило: впроваджувати за *типом* можна лише коли тип — це клас (runtime-значення). Для interface-ів, union-ів чи config-обʼєктів впроваджуйте явний token через `@Inject(TOKEN)`.',
          },
        },
        {
          kind: 'callout',
          tone: 'security',
          title: { en: 'Metadata is wiring, not validation — the boundary is still open', uk: 'Metadata — це звʼязування, не валідація — межа досі відкрита' },
          md: {
            en: "`design:paramtypes` reflects the *annotation you wrote*, not the *value that actually arrives*. It tells the container which provider to construct; it does nothing to check untrusted input. At a trust boundary — an HTTP body, a queue message, a config file — a value typed as `CreateUserDto` can still be any shape at runtime, because the type is erased and the decorator only *tagged* the parameter. Never treat DI metadata (or a `@Body()` type) as a guarantee about the data. Validate the shape with a runtime schema at the door (class-validator, zod — M9), and let the decorator do only what it can: wire the graph.",
            uk: "`design:paramtypes` відображає *анотацію, яку ви написали*, а не *значення, що реально надходить*. Воно каже контейнеру, який provider сконструювати; воно нічого не робить для перевірки недовіреного входу. На межі довіри — HTTP-body, повідомлення з черги, config-файл — значення, типізоване як `CreateUserDto`, у runtime все ще може мати будь-яку форму, бо тип стерто, а decorator лише *позначив* параметр. Ніколи не сприймайте DI-metadata (чи тип у `@Body()`) як гарантію щодо даних. Валідуйте форму runtime-схемою на вході (class-validator, zod — M9), а decorator-у лишіть тільки те, що він може: звʼязати граф.",
          },
        },
      ],
    },
    // ── Topic 4 ───────────────────────────────────────────────────────────────
    {
      id: 't4-nest-angular-stacks',
      title: { en: 'In the frameworks: NestJS 11 vs Angular 21', uk: 'У фреймворках: NestJS 11 проти Angular 21' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "Both frameworks are decorator-driven, but they read metadata at opposite ends of the build. **NestJS 11** stays fully on legacy: its `tsconfig` ships `experimentalDecorators` + `emitDecoratorMetadata`, you `import 'reflect-metadata'` once in `main.ts`, and the DI container resolves constructor parameters by `design:paramtypes` **at runtime**. **Angular** does *not* use `emitDecoratorMetadata` at all. Its own compiler, **ngtsc**, reads `@Component` / `@Injectable` / `@Directive` at **build time** (AOT), lowers each decorator into a static class field (`ɵfac`, `setClassMetadata`) and generates the injector code directly — so the metadata is compiler-produced and tree-shakeable, and no `reflect-metadata` polyfill is needed. Angular is also actively *shrinking* its decorator surface: the **`inject()`** function replaces constructor injection (with more accurate types and use inside plain functions), and signal **`input()`** / **`output()`** replace the `@Input()` / `@Output()` decorators.",
            uk: "Обидва фреймворки керовані decorators, але читають metadata на протилежних кінцях збірки. **NestJS 11** повністю на legacy: його `tsconfig` містить `experimentalDecorators` + `emitDecoratorMetadata`, ви `import 'reflect-metadata'` раз у `main.ts`, і DI-контейнер резолвить параметри конструктора за `design:paramtypes` **у runtime**. **Angular** *не* використовує `emitDecoratorMetadata` взагалі. Його власний компілятор, **ngtsc**, читає `@Component` / `@Injectable` / `@Directive` **під час збірки** (AOT), знижує кожен decorator у статичне поле класу (`ɵfac`, `setClassMetadata`) і генерує код injector-а напряму — тож metadata створюється компілятором і піддається tree-shaking, а polyfill `reflect-metadata` не потрібен. Angular ще й активно *зменшує* свою decorator-поверхню: функція **`inject()`** заміняє constructor injection (з точнішими типами й вжитком усередині звичайних функцій), а signal **`input()`** / **`output()`** заміняють decorators `@Input()` / `@Output()`.",
          },
        },
        {
          kind: 'compare',
          a: { en: 'NestJS 11', uk: 'NestJS 11' },
          b: { en: 'Angular 21', uk: 'Angular 21' },
          rows: [
            [
              { en: 'When metadata is read', uk: 'Коли metadata читається' },
              { en: 'Runtime (reflection)', uk: 'Runtime (reflection)' },
              { en: 'Build time (AOT / ngtsc)', uk: 'Під час збірки (AOT / ngtsc)' },
            ],
            [
              { en: 'Needs `emitDecoratorMetadata`', uk: 'Потрібен `emitDecoratorMetadata`' },
              { en: 'Yes', uk: 'Так' },
              { en: 'No — compiler generates it', uk: 'Ні — компілятор генерує це' },
            ],
            [
              { en: 'Needs `reflect-metadata`', uk: 'Потрібен `reflect-metadata`' },
              { en: 'Yes (import in `main.ts`)', uk: 'Так (import у `main.ts`)' },
              { en: 'No', uk: 'Ні' },
            ],
            [
              { en: 'Direction of travel', uk: 'Напрям розвитку' },
              { en: 'Stays on legacy decorators', uk: 'Лишається на legacy-decorators' },
              { en: 'Toward `inject()` + signal `input()`/`output()`', uk: 'До `inject()` + signal `input()`/`output()`' },
            ],
          ],
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// NestJS — legacy decorators + a custom parameter decorator (createParamDecorator):
@Controller('users')
class UsersController {
  constructor(private users: UserService) {}          // resolved via design:paramtypes
  @Get(':id') find(@Param('id') id: string) { return this.users.find(id); }
}
export const CurrentUser = createParamDecorator(
  (_data, ctx) => ctx.switchToHttp().getRequest().user, // a PARAMETER decorator → legacy-only
);

// Angular — decorator on the class, but dependencies via inject() and a signal input():
@Component({ selector: 'user-card', template: '' })
class UserCard {
  private users = inject(UserService);                 // no constructor, more precise types
  userId = input.required<string>();                   // signal input replaces @Input()
}`,
          note: {
            en: "Nest's `@Param()` / `@CurrentUser()` are **parameter** decorators — the exact feature standard decorators dropped — so Nest cannot move off legacy without redesigning them. Angular sidesteps the whole question by generating metadata itself.",
            uk: "`@Param()` / `@CurrentUser()` у Nest — це **parameter**-decorators, саме та можливість, яку standard-decorators прибрали, тож Nest не може піти з legacy, не переробивши їх. Angular обходить усе питання, генеруючи metadata самостійно.",
          },
        },
        {
          kind: 'callout',
          tone: 'senior',
          title: { en: 'Why Nest is more stuck on legacy than Angular', uk: 'Чому Nest сильніше застряг на legacy, ніж Angular' },
          md: {
            en: "Angular already reads decorators through its own compiler, so it never depended on TypeScript's `emitDecoratorMetadata` — migrating its *class* decorators to the standard form is mostly a compiler concern, and it is steadily removing member decorators in favour of `inject()` and signals. NestJS is bound tighter: it leans on **runtime** `design:paramtypes` for by-type DI *and* on **parameter decorators** (`@Body()`, `@Param()`, `@Inject()`, and every `createParamDecorator`). Standard decorators provide **neither**, so until the TC39 proposal grows parameter decorators (or Nest adopts an explicit-token/DI-by-code style), Nest stays on `experimentalDecorators`. Knowing which framework depends on which mechanism tells you exactly what a migration would cost.",
            uk: "Angular уже читає decorators через власний компілятор, тож ніколи не залежав від `emitDecoratorMetadata` TypeScript — міграція його *class*-decorators на standard-форму — переважно справа компілятора, і він поступово прибирає member-decorators на користь `inject()` та signals. NestJS звʼязаний тісніше: він спирається на **runtime** `design:paramtypes` для DI-за-типом *і* на **parameter decorators** (`@Body()`, `@Param()`, `@Inject()` та кожен `createParamDecorator`). Standard-decorators не дають **жодного**, тож доки TC39-пропозиція не отримає parameter decorators (або Nest не перейде на стиль явних token / DI-у-коді), Nest лишається на `experimentalDecorators`. Знання, який фреймворк від якого механізму залежить, точно каже, у скільки обійдеться міграція.",
          },
        },
      ],
    },
    // ── Topic 5 ───────────────────────────────────────────────────────────────
    {
      id: 't5-authoring-typing-decorators',
      title: { en: 'Writing your own typed decorators (and picking a system)', uk: 'Пишемо власні типізовані decorators (і обираємо систему)' },
      blocks: [
        {
          kind: 'prose',
          md: {
            en: "When you author a decorator, choose the system by what you need, not by which is newer. Reach for **standard** decorators for portable, framework-free behaviour — logging, memoization, timing, validate-on-set — because they need no flags, no polyfill (until you opt into metadata), and give you precise contextual types through the `*DecoratorContext` helpers. You are **forced onto legacy** the moment you need a **parameter decorator** or **`design:*` metadata** — that is, any time you are extending NestJS, Angular's DI, or TypeORM. Type standard decorators with generic `This` / `Value` parameters so the value you return stays assignable to the real member (M3), and use `addInitializer` for per-instance work. And keep the erasure boundary in view: a decorator can tag a route or wrap a method, but it cannot make untrusted input safe — that is validation's job (M9), not the decorator's.",
            uk: "Коли пишете decorator, обирайте систему за тим, що вам потрібно, а не за тим, що новіше. Беріть **standard**-decorators для портативної, незалежної від фреймворку поведінки — logging, memoization, timing, validate-on-set — бо їм не треба флагів, ні polyfill (доки не увімкнете metadata), і вони дають точні контекстні типи через helper-и `*DecoratorContext`. Вас **змушує на legacy** тієї миті, коли потрібен **parameter decorator** чи **`design:*` metadata** — тобто коли ви розширюєте NestJS, DI Angular-а чи TypeORM. Типізуйте standard-decorators generic-параметрами `This` / `Value`, щоб значення, яке ви повертаєте, лишалося assignable до реального члена (M3), і використовуйте `addInitializer` для роботи на кожен екземпляр. І тримайте в полі зору межу стирання: decorator може позначити маршрут чи обгорнути метод, але не може зробити недовірений вхід безпечним — це робота валідації (M9), а не decorator-а.",
          },
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `// STANDARD: a portable, fully-typed field decorator — clamp a number on every assignment.
function clamp(min: number, max: number) {
  return function (_value: undefined, ctx: ClassFieldDecoratorContext<unknown, number>) {
    if (ctx.static) throw new Error('@clamp is instance-only');
    return (initial: number) => Math.min(max, Math.max(min, initial)); // initializer transform
  };
}
class Volume { @clamp(0, 100) level = 150; } // → 100

// LEGACY: the parameter-decorator shape you can ONLY write with experimentalDecorators.
function Inject(token: string) {
  return (target: object, _key: string | undefined, index: number) =>
    Reflect.defineMetadata('inject:' + index, token, target); // records which token fills a slot
}`,
          note: {
            en: 'Left needs no `tsconfig` flag and is framework-agnostic; right cannot exist without `experimentalDecorators`, because it decorates a *parameter* and writes `design`-style metadata.',
            uk: 'Ліве не потребує флага в `tsconfig` і не залежить від фреймворку; праве не може існувати без `experimentalDecorators`, бо декорує *параметр* і пише metadata в стилі `design`.',
          },
        },
        {
          kind: 'table',
          head: [
            { en: 'What you need', uk: 'Що вам потрібно' },
            { en: 'Which system', uk: 'Яка система' },
            { en: 'Why', uk: 'Чому' },
          ],
          rows: [
            [
              { en: 'A parameter decorator', uk: 'Parameter decorator' },
              { en: 'Legacy', uk: 'Legacy' },
              { en: 'Standard has none', uk: 'У standard їх немає' },
            ],
            [
              { en: '`design:paramtypes` for by-type DI', uk: '`design:paramtypes` для DI-за-типом' },
              { en: 'Legacy', uk: 'Legacy' },
              { en: '`emitDecoratorMetadata` only', uk: 'Лише `emitDecoratorMetadata`' },
            ],
            [
              { en: 'Portable behaviour, no config', uk: 'Портативна поведінка, без config' },
              { en: 'Standard', uk: 'Standard' },
              { en: 'On by default, precise types', uk: 'Увімкнено типово, точні типи' },
            ],
            [
              { en: 'Extend NestJS / Angular DI / TypeORM', uk: 'Розширити NestJS / Angular DI / TypeORM' },
              { en: 'Legacy', uk: 'Legacy' },
              { en: 'They are built on it', uk: 'Вони на ньому побудовані' },
            ],
          ],
          caption: {
            en: 'Pick by capability, not recency. If a parameter decorator or design metadata appears in the requirement, the answer is legacy.',
            uk: 'Обирайте за можливістю, не за новизною. Якщо у вимозі зʼявляється parameter decorator чи design-metadata — відповідь legacy.',
          },
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: { en: 'A decorator is not a trust boundary', uk: 'Decorator — це не межа довіри' },
          md: {
            en: "It is tempting to read `@IsEmail()` or `@Body() dto: CreateUserDto` as a guarantee, but decorators run where you *define* code, and their types are erased at emit. `@Body() dto: CreateUserDto` only *names* the expected shape; nothing checks the request against it unless a **runtime validator** actually inspects the value (in NestJS, a `ValidationPipe` reading class-validator decorators). If you take the type annotation as proof, malformed or hostile input flows straight into your service typed as something it is not. Put a validating pipe or schema at every boundary, fail closed, and treat the decorator as a *declaration of intent* that a runtime check must still enforce (M9).",
            uk: "Спокусливо читати `@IsEmail()` чи `@Body() dto: CreateUserDto` як гарантію, але decorators виконуються там, де ви *визначаєте* код, а їхні типи стираються при emit. `@Body() dto: CreateUserDto` лише *називає* очікувану форму; ніщо не перевіряє запит проти неї, доки **runtime-валідатор** реально не огляне значення (у NestJS — `ValidationPipe`, що читає decorators class-validator). Якщо взяти анотацію типу за доказ, спотворений чи ворожий вхід потече прямо у ваш service, типізований як щось, чим він не є. Ставте validating pipe чи схему на кожній межі, fail closed, і сприймайте decorator як *декларацію наміру*, яку runtime-перевірка все одно мусить забезпечити (M9).",
          },
        },
      ],
    },
  ],

  keyPoints: [
    {
      en: 'There are two incompatible decorator systems: the TC39 **standard** one (TS 5.0, no flag, `(value, context)`) and the **legacy** one (`experimentalDecorators`, `(target, key, descriptor)`). `tsconfig` picks one for the whole compilation.',
      uk: 'Існує дві несумісні системи decorators: **standard** від TC39 (TS 5.0, без флага, `(value, context)`) і **legacy** (`experimentalDecorators`, `(target, key, descriptor)`). `tsconfig` обирає одну на всю компіляцію.',
    },
    {
      en: 'Standard decorators deliberately drop **parameter decorators** and **`emitDecoratorMetadata`** — the two features DI frameworks depend on — so NestJS, Angular and TypeORM remain on legacy.',
      uk: 'Standard-decorators навмисно прибрали **parameter decorators** і **`emitDecoratorMetadata`** — дві можливості, від яких залежать DI-фреймворки — тож NestJS, Angular і TypeORM лишаються на legacy.',
    },
    {
      en: 'A standard decorator is `(value, context) => replacement | void`: `context` carries `kind`/`name`/`addInitializer`/`metadata`, and returning a value replaces the declaration.',
      uk: 'Standard-decorator — це `(value, context) => replacement | void`: `context` несе `kind`/`name`/`addInitializer`/`metadata`, а повернення значення замінює оголошення.',
    },
    {
      en: '`emitDecoratorMetadata` + `reflect-metadata` emit `design:type`/`design:paramtypes`/`design:returntype`; a container reads `design:paramtypes` to resolve constructor parameters by type.',
      uk: '`emitDecoratorMetadata` + `reflect-metadata` емітять `design:type`/`design:paramtypes`/`design:returntype`; контейнер читає `design:paramtypes`, щоб резолвити параметри конструктора за типом.',
    },
    {
      en: 'Design-type metadata is the *runtime value* of the annotation, so interfaces, unions, aliases and generics collapse to `Object` — inject a class or an explicit `@Inject(TOKEN)` instead.',
      uk: 'Design-type metadata — це *runtime-значення* анотації, тож interface-и, union-и, alias-и та generics згортаються в `Object` — впроваджуйте клас чи явний `@Inject(TOKEN)`.',
    },
    {
      en: 'NestJS 11 reads metadata at **runtime** (legacy + `reflect-metadata`); Angular’s **ngtsc** generates it at **build** (AOT, no `emitDecoratorMetadata`) and is shifting to `inject()` + signal `input()`/`output()`. A decorator is wiring, not validation — validate untrusted input at the boundary (M9).',
      uk: 'NestJS 11 читає metadata в **runtime** (legacy + `reflect-metadata`); **ngtsc** в Angular генерує її під час **збірки** (AOT, без `emitDecoratorMetadata`) і рухається до `inject()` + signal `input()`/`output()`. Decorator — це звʼязування, не валідація: валідуйте недовірений вхід на межі (M9).',
    },
  ],

  pitfalls: [
    {
      title: { en: 'Assuming standard decorators are a drop-in for legacy', uk: 'Вважати standard-decorators прямою заміною legacy' },
      body: {
        en: 'Flipping `experimentalDecorators` off to "modernise" a NestJS/Angular codebase breaks it: you lose parameter decorators and `emitDecoratorMetadata`, so by-type DI and `@Param()`/`@Body()` stop working. The two systems do not coexist — migrate only when the whole framework supports standard decorators.',
        uk: 'Вимкнути `experimentalDecorators`, щоб «осучаснити» кодову базу NestJS/Angular, ламає її: ви втрачаєте parameter decorators і `emitDecoratorMetadata`, тож DI-за-типом і `@Param()`/`@Body()` перестають працювати. Дві системи не співіснують — мігруйте лише коли весь фреймворк підтримає standard-decorators.',
      },
    },
    {
      title: { en: 'Injecting an interface in NestJS', uk: 'Впровадження interface у NestJS' },
      body: {
        en: '`constructor(private cfg: AppConfig)` where `AppConfig` is an interface emits `design:paramtypes` of `Object`, and Nest throws "can’t resolve dependencies". Interfaces have no runtime value. Inject a class, or bind an explicit token with `@Inject(\'APP_CONFIG\')` and a matching provider.',
        uk: '`constructor(private cfg: AppConfig)`, де `AppConfig` — interface, емітить `design:paramtypes` як `Object`, і Nest кидає «can’t resolve dependencies». Interface-и не мають runtime-значення. Впроваджуйте клас або привʼяжіть явний token через `@Inject(\'APP_CONFIG\')` з відповідним provider.',
      },
    },
    {
      title: { en: 'Forgetting `reflect-metadata` or `emitDecoratorMetadata`', uk: 'Забути `reflect-metadata` чи `emitDecoratorMetadata`' },
      body: {
        en: 'Omit `import \'reflect-metadata\'` at the entrypoint, or leave `emitDecoratorMetadata` off, and `design:paramtypes` is simply absent — the container sees `undefined` parameter types and DI fails at bootstrap with confusing errors. Both are required together for by-type injection.',
        uk: 'Пропустіть `import \'reflect-metadata\'` на вході чи лишіть `emitDecoratorMetadata` вимкненим — і `design:paramtypes` просто відсутній: контейнер бачить `undefined`-типи параметрів, і DI падає на bootstrap із заплутаними помилками. Обидва потрібні разом для впровадження за типом.',
      },
    },
    {
      title: { en: 'Trusting a decorator to validate data', uk: 'Довіряти decorator-у валідацію даних' },
      body: {
        en: 'A `@Body() dto: CreateUserDto` annotation is erased; without a runtime `ValidationPipe` (reading class-validator decorators) nothing checks the request, so hostile input enters typed as something it is not. Decorators wire and tag; validation is a separate runtime step at the boundary (M9).',
        uk: 'Анотація `@Body() dto: CreateUserDto` стирається; без runtime-`ValidationPipe` (що читає decorators class-validator) ніщо не перевіряє запит, тож ворожий вхід входить типізованим як щось, чим не є. Decorators звʼязують і позначають; валідація — окремий runtime-крок на межі (M9).',
      },
    },
  ],

  interview: [
    {
      q: { en: 'What are the two TypeScript decorator systems, and why do frameworks still use the legacy one?', uk: 'Які дві системи decorators у TypeScript і чому фреймворки досі використовують legacy?' },
      a: {
        en: 'The standard system is the TC39 Stage-3 proposal, shipped in TS 5.0 with no compiler flag, where a decorator is `(value, context)`. The legacy system is enabled by `experimentalDecorators` and passes `(target, key, descriptor)`. They are mutually exclusive per compilation. Frameworks stay on legacy because the standard proposal deliberately omits two things they depend on: parameter decorators (Nest’s `@Param()`, `@Inject()`) and `emitDecoratorMetadata` (the `design:paramtypes` used for by-type DI). Until the standard gains those — or a framework redesigns around explicit tokens — it cannot migrate.',
        uk: 'Standard-система — це пропозиція TC39 Stage-3, що вийшла в TS 5.0 без compiler-флага, де decorator — це `(value, context)`. Legacy вмикається через `experimentalDecorators` і передає `(target, key, descriptor)`. Вони взаємовиключні на компіляцію. Фреймворки лишаються на legacy, бо standard-пропозиція навмисно опускає дві речі, від яких вони залежать: parameter decorators (`@Param()`, `@Inject()` у Nest) і `emitDecoratorMetadata` (`design:paramtypes` для DI-за-типом). Доки standard не отримає їх — або фреймворк не перебудується навколо явних token — мігрувати не можна.',
      },
      level: 'senior',
    },
    {
      q: { en: 'How does NestJS resolve `constructor(private repo: UserRepository)` with no explicit token?', uk: 'Як NestJS резолвить `constructor(private repo: UserRepository)` без явного token?' },
      a: {
        en: 'With `emitDecoratorMetadata` on, the presence of a decorator (`@Injectable()`) makes TypeScript emit `design:paramtypes` for the constructor — an array of the parameter types as runtime constructor references — through `reflect-metadata`. At bootstrap Nest calls `Reflect.getMetadata(\'design:paramtypes\', UserService)`, gets `[UserRepository]`, and resolves a provider for each entry from its container, constructing the graph. It works only because `UserRepository` is a class (a real runtime value); the mechanism needs the type to survive erasure.',
        uk: 'З увімкненим `emitDecoratorMetadata` наявність decorator-а (`@Injectable()`) змушує TypeScript емітити `design:paramtypes` для конструктора — масив типів параметрів як runtime-посилання на конструктори — через `reflect-metadata`. На bootstrap Nest викликає `Reflect.getMetadata(\'design:paramtypes\', UserService)`, отримує `[UserRepository]` і резолвить provider для кожного запису зі свого контейнера, будуючи граф. Це працює лише тому, що `UserRepository` — клас (реальне runtime-значення); механізму потрібно, щоб тип пережив стирання.',
      },
      level: 'senior',
    },
    {
      q: { en: 'Why can’t you inject an interface in NestJS, and what do you do instead?', uk: 'Чому не можна впровадити interface у NestJS і що робити натомість?' },
      a: {
        en: 'Because `design:paramtypes` stores the *runtime value* of each parameter type, and an interface (or type alias, union, or generic) has no runtime representation — it erases to `Object`, which the container cannot map to a provider, so it reports it cannot resolve the dependency. The fix is to give the container something with runtime identity: inject a class, or define an explicit injection token (a string or `Symbol`/`InjectionToken`) and use `@Inject(TOKEN)` on the parameter with a matching `{ provide: TOKEN, useValue/useClass }` provider.',
        uk: 'Бо `design:paramtypes` зберігає *runtime-значення* кожного типу параметра, а interface (чи type alias, union, generic) не має runtime-представлення — він стирається в `Object`, який контейнер не може зіставити з provider, тож повідомляє, що не може резолвити залежність. Виправлення — дати контейнеру щось із runtime-ідентичністю: впровадити клас або визначити явний injection token (рядок чи `Symbol`/`InjectionToken`) і вжити `@Inject(TOKEN)` на параметрі з відповідним provider `{ provide: TOKEN, useValue/useClass }`.',
      },
      level: 'senior',
    },
    {
      q: { en: 'Could Angular or NestJS move to standard decorators today? What blocks it, and how do they differ?', uk: 'Чи можуть Angular або NestJS перейти на standard-decorators сьогодні? Що заважає і чим вони різняться?' },
      a: {
        en: 'Not fully, and NestJS is the more constrained. The standard proposal has no parameter decorators and no design-type metadata, which Nest needs for `@Param()`/`@Inject()` and by-type DI, so it stays on `experimentalDecorators`. Angular is closer: it never used `emitDecoratorMetadata` — its compiler (ngtsc) reads `@Component`/`@Injectable` at build time and generates the injector code and metadata itself, so its class decorators are largely a compiler concern — and it is actively moving member decorators to `inject()` and signal `input()`/`output()`, shrinking the surface that would need to change. So the blocker is the missing parameter decorators + metadata in the standard, and Angular’s build-time model insulates it far more than Nest’s runtime reflection does.',
        uk: 'Не повністю, і NestJS обмежений сильніше. Standard-пропозиція не має parameter decorators і design-type metadata, які потрібні Nest для `@Param()`/`@Inject()` і DI-за-типом, тож він лишається на `experimentalDecorators`. Angular ближчий: він ніколи не використовував `emitDecoratorMetadata` — його компілятор (ngtsc) читає `@Component`/`@Injectable` під час збірки й сам генерує код injector-а та metadata, тож його class-decorators — здебільшого справа компілятора — і він активно переносить member-decorators на `inject()` та signal `input()`/`output()`, зменшуючи поверхню, яку треба було б міняти. Тож блокер — відсутні parameter decorators + metadata в standard, а build-time-модель Angular ізолює його значно більше, ніж runtime-reflection у Nest.',
      },
      level: 'staff',
    },
  ],

  seeAlso: ['m9-dto-validation', 'm1-structural-typing', 'm10-rxjs-signals', 'm5-generics-conditional-types'],

  sources: [
    { title: 'TypeScript 5.0 Release Notes — Decorators (TC39 standard)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html' },
    { title: 'TypeScript 5.2 Release Notes — Decorator Metadata (Symbol.metadata)', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html' },
    { title: 'TypeScript Handbook — Decorators (legacy / experimental reference)', url: 'https://www.typescriptlang.org/docs/handbook/decorators.html' },
    { title: 'TSConfig Reference — emitDecoratorMetadata', url: 'https://www.typescriptlang.org/tsconfig/emitDecoratorMetadata.html' },
    { title: 'TC39 — Decorators proposal (Stage 3)', url: 'https://github.com/tc39/proposal-decorators' },
    { title: 'reflect-metadata (npm)', url: 'https://www.npmjs.com/package/reflect-metadata' },
    { title: 'NestJS Docs — Custom decorators (param decorators & metadata)', url: 'https://docs.nestjs.com/custom-decorators' },
    { title: 'Angular — Dependency injection overview', url: 'https://angular.dev/guide/di' },
    { title: 'Angular — Migrate to the inject() function', url: 'https://angular.dev/reference/migrations/inject-function' },
    { title: 'Announcing TypeScript 7.0 RC (Go-native; checking semantics identical to 6.0)', url: 'https://devblogs.microsoft.com/typescript/announcing-typescript-7-0-rc/' },
  ],
};
