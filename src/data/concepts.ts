import type { Level, Localized, Module, Section } from './types';
// CHANGED (S1): golden module M5 authored; M1–M4, M6–M13 are navigable stubs (authored in later sessions).
import { m5 } from './modules/m5-generics-conditional-types';
// CHANGED (S2): Section I authored — M1 (structural typing) + M2 (narrowing), each with a signature sim.
import { m1 } from './modules/m1-structural-typing';
import { m2 } from './modules/m2-narrowing';
// CHANGED (S3): Section II deepened — M4 (generics) + M6 (mapped/template-literal types), each with a sim.
import { m4 } from './modules/m4-generics';
import { m6 } from './modules/m6-mapped-template-literals';
// CHANGED (S4): Section II capstone — M7 (utility types) authored with the ★ utility-type decoder sim.
import { m7 } from './modules/m7-utility-types';

/*
 * concepts.ts — the SINGLE SOURCE OF TRUTH (CLAUDE.md §2, §4).
 * 4 sections · 13 modules. S1 shipped Section II's golden M5; S2 added Section I's M1 + M2; S3 deepened
 * Section II with M4 (Generics) + M6 (Mapped & Template-Literal Types); S4 completed Section II with M7
 * (Utility Types). Each authored module carries a signature sim. The remaining modules are stubs
 * (mental model + nav only) until authored.
 * The eager chrome reads from here directly — the meta/bundle split (standard §4.4) is deferred
 * until the guide grows (template package.json note).
 */

export const sections: Section[] = [
  {
    id: 's1-type-system',
    roman: 'I',
    title: { en: 'The Type System', uk: 'Система типів' },
    accent: '#3178c6', // TypeScript blue
    blurb: {
      en: 'How TypeScript reasons: structural typing, assignability, narrowing, functions and variance.',
      uk: 'Як міркує TypeScript: structural typing, assignability, narrowing, функції та variance.',
    },
  },
  {
    id: 's2-type-level',
    roman: 'II',
    title: { en: 'Type-Level Programming', uk: 'Type-Level програмування' },
    accent: '#1593ad', // teal
    blurb: {
      en: 'The type system as a language: generics, conditional types, infer, mapped & utility types.',
      uk: 'Система типів як мова: generics, conditional types, infer, mapped- та utility-типи.',
    },
  },
  {
    id: 's3-applied',
    roman: 'III',
    title: { en: 'Applied TypeScript', uk: 'Прикладний TypeScript' },
    accent: '#6a7fe0', // indigo-blue
    blurb: {
      en: 'TypeScript in your stack: decorators & DI, DTO validation, typing RxJS and Angular signals.',
      uk: 'TypeScript у вашому стеку: decorators і DI, валідація DTO, типізація RxJS та Angular signals.',
    },
  },
  {
    id: 's4-compiler',
    roman: 'IV',
    title: { en: 'Compiler & Tooling', uk: 'Компілятор та інструменти' },
    accent: '#4f86a8', // steel blue
    blurb: {
      en: 'tsconfig & strictness, module resolution, project references, declaration files and the build.',
      uk: 'tsconfig і strictness, module resolution, project references, declaration files та збірка.',
    },
  },
];

// ── Stub helper: a navigable module with a mental model but no body yet ──────────
type StubInput = {
  id: string;
  num: number;
  section: string;
  order: number;
  level: Level;
  title: Localized;
  tagline: Localized;
  mentalModel: Localized;
  signature?: boolean;
};
function stub(s: StubInput): Module {
  return {
    ...s,
    readMins: 0,
    topics: [],
    keyPoints: [],
    pitfalls: [],
    interview: [],
    seeAlso: [],
    sources: [],
  };
}

export const modules: Module[] = [
  // ── Section I · The Type System ──────────────────────────────────────────
  m1, // ★ authored (S2) — Structural Typing & Assignability
  m2, // ★ authored (S2) — Narrowing & Control-Flow Analysis
  stub({
    id: 'm3-functions-variance',
    num: 3,
    section: 's1-type-system',
    order: 3,
    level: 'senior',
    title: { en: 'Functions, Overloads & Variance', uk: 'Функції, Overloads та Variance' },
    tagline: {
      en: 'Parameter bivariance, overload resolution, and where co/contravariance bites.',
      uk: 'Біваріантність параметрів, розвʼязання overload-ів і де кусає co/contravariance.',
    },
    mentalModel: {
      en: 'A function is safe to substitute when it asks for no more and promises no less.',
      uk: 'Функцію безпечно підставити, коли вона просить не більше і обіцяє не менше.',
    },
  }),

  // ── Section II · Type-Level Programming ───────────────────────────────────
  m4, // ★ authored (S3) — Generic Functions & Classes
  m5, // ★ GOLDEN — fully authored (Generics & Conditional Types)
  m6, // ★ authored (S3) — Mapped & Template-Literal Types
  m7, // ★ authored (S4) — Built-in Utility Types, Decoded

  // ── Section III · Applied TypeScript ──────────────────────────────────────
  stub({
    id: 'm8-decorators-metadata',
    num: 8,
    section: 's3-applied',
    order: 1,
    level: 'senior',
    title: { en: 'Decorators & Metadata (NestJS · Angular)', uk: 'Decorators та Metadata (NestJS · Angular)' },
    tagline: {
      en: 'Stage-3 decorators vs the legacy experimental ones, and how DI reads metadata.',
      uk: 'Stage-3 decorators проти legacy experimental, і як DI читає metadata.',
    },
    mentalModel: {
      en: 'A decorator is a function that tags or rewrites a declaration so a framework can find it later.',
      uk: 'Decorator — це функція, що позначає чи переписує оголошення, щоб фреймворк знайшов його потім.',
    },
  }),
  stub({
    id: 'm9-dto-validation',
    num: 9,
    section: 's3-applied',
    order: 2,
    level: 'senior',
    title: { en: 'DTOs, Validation & API Boundaries', uk: 'DTO, Валідація та межі API' },
    tagline: {
      en: 'One source of truth for a shape: a runtime schema, with the static type derived from it.',
      uk: 'Єдине джерело правди для форми: runtime-схема, з якої виводиться статичний тип.',
    },
    mentalModel: {
      en: 'Validate at the door, infer the type from the validator — never cast untrusted input.',
      uk: 'Валідуйте на вході, виводьте тип із валідатора — ніколи не кастуйте недовірений вхід.',
    },
  }),
  stub({
    id: 'm10-rxjs-signals',
    num: 10,
    section: 's3-applied',
    order: 3,
    level: 'senior',
    title: { en: 'Typing RxJS, Signals & Component State', uk: 'Типізація RxJS, Signals та стану компонентів' },
    tagline: {
      en: 'Operator type flow, typed signals/computed, and discriminated unions for UI state.',
      uk: 'Потік типів через оператори, типізовані signals/computed і discriminated unions для UI-стану.',
    },
    mentalModel: {
      en: 'Model state as a discriminated union so impossible states cannot be represented.',
      uk: 'Моделюйте стан як discriminated union, щоб неможливі стани не можна було виразити.',
    },
  }),

  // ── Section IV · Compiler & Tooling ───────────────────────────────────────
  stub({
    id: 'm11-tsconfig-strictness',
    num: 11,
    section: 's4-compiler',
    order: 1,
    level: 'senior',
    title: { en: 'tsconfig & the Strictness Model', uk: 'tsconfig та модель strictness' },
    tagline: {
      en: 'What each strict flag buys you, and how target/lib/module shape emit.',
      uk: 'Що дає кожен strict-флаг, і як target/lib/module формують emit.',
    },
    mentalModel: {
      en: 'tsconfig is a contract with the compiler — strictness trades a little friction for fewer runtime bugs.',
      uk: 'tsconfig — це контракт із компілятором: strictness міняє трохи тертя на менше runtime-багів.',
    },
  }),
  stub({
    id: 'm12-modules-resolution',
    num: 12,
    section: 's4-compiler',
    order: 2,
    level: 'senior',
    title: { en: 'Modules, Resolution & Project References', uk: 'Модулі, Resolution та Project References' },
    tagline: {
      en: 'How TS finds files: moduleResolution, paths, exports maps, and composite builds.',
      uk: 'Як TS знаходить файли: moduleResolution, paths, exports maps та composite-збірки.',
    },
    mentalModel: {
      en: 'Module resolution is the compiler retracing the exact path your runtime will take to a file.',
      uk: 'Module resolution — це компілятор, що повторює точний шлях, яким runtime дійде до файлу.',
    },
  }),
  stub({
    id: 'm13-declaration-files',
    num: 13,
    section: 's4-compiler',
    order: 3,
    level: 'staff',
    title: { en: 'Declaration Files & Publishing Types', uk: 'Declaration Files та публікація типів' },
    tagline: {
      en: 'Authoring .d.ts, shipping types with your package, and not breaking your consumers.',
      uk: 'Написання .d.ts, постачання типів із пакетом і як не зламати споживачів.',
    },
    mentalModel: {
      en: 'A .d.ts is the public type contract of a package — the shape, with the implementation removed.',
      uk: '.d.ts — це публічний типовий контракт пакета: форма без реалізації.',
    },
  }),
];

// ── Lookups ────────────────────────────────────────────────────────────────
const moduleById = new Map(modules.map((m) => [m.id, m]));
const sectionById = new Map(sections.map((s) => [s.id, s]));

export function getModule(id: string): Module | undefined {
  return moduleById.get(id);
}
export function getSection(id: string): Section | undefined {
  return sectionById.get(id);
}
export function modulesBySection(sectionId: string): Module[] {
  return modules.filter((m) => m.section === sectionId).sort((a, b) => a.order - b.order);
}
/** Previous / next module in global order (by `num`). */
export function adjacentModules(id: string): { prev?: Module; next?: Module } {
  const ordered = [...modules].sort((a, b) => a.num - b.num);
  const i = ordered.findIndex((m) => m.id === id);
  if (i === -1) return {};
  return { prev: ordered[i - 1], next: ordered[i + 1] };
}
/** A module is "authored" (vs a navigable stub) once it has topics. */
export function isAuthored(m: Module): boolean {
  return m.topics.length > 0;
}

export const LEVELS: Level[] = ['beginner', 'middle', 'senior', 'staff'];

export const COUNTS = {
  sections: sections.length,
  modules: modules.length,
  sims: modules.filter((m) => m.signature).length,
};
