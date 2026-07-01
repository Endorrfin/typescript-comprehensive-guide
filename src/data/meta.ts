/* The lightweight metadata API — backed by the generated meta.json (see
   scripts/genMeta.ts). Everything that needs only nav/search/title data (the eager
   shell: TopBar level filter, Sidebar nav, Footer counts; plus the landing map and
   global search) imports from HERE, not from concepts.ts — so the authored module
   bodies never enter the initial bundle. Only the lazy ModulePage imports full
   content from concepts.ts. Exports mirror concepts.ts names so consumers swap the
   import path only (standard §4.4). Added S5. */
import metaRaw from './meta.json';
import type { Level, Localized, Section } from './types';

export type TopicMeta = { id: string; title: Localized };
export type ModuleMeta = {
  id: string;
  num: number;
  section: string;
  order: number;
  level: Level;
  signature: boolean;
  title: Localized;
  tagline: Localized;
  mentalModel: Localized;
  readMins: number;
  topics: TopicMeta[];
  seeAlso: string[];
  authored: boolean;
};
type MetaFile = { sections: Section[]; signatureSims: string[]; modules: ModuleMeta[] };

const META = metaRaw as unknown as MetaFile;

export const sections: Section[] = META.sections;
export const modules: ModuleMeta[] = [...META.modules].sort((a, b) => a.num - b.num);

const moduleById = new Map(modules.map((m) => [m.id, m]));
const sectionById = new Map(sections.map((s) => [s.id, s]));

export function getModule(id: string): ModuleMeta | undefined {
  return moduleById.get(id);
}
export function getSection(id: string): Section | undefined {
  return sectionById.get(id);
}
export function modulesBySection(sectionId: string): ModuleMeta[] {
  return modules.filter((m) => m.section === sectionId).sort((a, b) => a.order - b.order);
}
/** Previous / next module in global order (by `num`) — mirrors concepts.adjacentModules. */
export function adjacentModules(id: string): { prev?: ModuleMeta; next?: ModuleMeta } {
  const i = modules.findIndex((m) => m.id === id);
  if (i === -1) return {};
  return { prev: modules[i - 1], next: modules[i + 1] };
}
/** A module is "authored" (vs a navigable stub) — the flag is precomputed by the codegen. */
export function isAuthored(m: { authored?: boolean }): boolean {
  return !!m.authored;
}

export const LEVELS: Level[] = ['beginner', 'middle', 'senior', 'staff'];

export const COUNTS = {
  sections: sections.length,
  modules: modules.length,
  sims: modules.filter((m) => m.signature).length,
};
