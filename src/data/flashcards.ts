import type { Level, Localized } from './types';
import { getSection, modules } from './concepts';

/*
 * flashcards.ts — the active-recall deck (S9 polish). DERIVED, not re-authored: every card comes from
 * content already in concepts.ts, so the deck stays in sync automatically as modules evolve.
 *   • mental-model card — one per module (front = title, back = the module's mental model)
 *   • key-points card   — one per module (front = title, back = the numbered key points)
 *   • interview cards   — one per interview Q&A (front = question, back = answer, carries the level)
 * Imports concepts.ts (the heavy body chunk), so the FlashcardsPage that consumes it is lazy-loaded.
 */
export type FlashKind = 'interview' | 'mental-model' | 'key-points';

export type Flashcard = {
  id: string;
  moduleId: string;
  moduleNum: number;
  moduleTitle: Localized;
  accent: string;
  kind: FlashKind;
  level?: Level;
  front: Localized;
  back: Localized;
};

/** Join a module's key points into one numbered back-of-card body (blank line → Md paragraph). */
function joinPoints(points: Localized[]): Localized {
  return {
    en: points.map((p, i) => `${i + 1}. ${p.en}`).join('\n\n'),
    uk: points.map((p, i) => `${i + 1}. ${p.uk}`).join('\n\n'),
  };
}

/** The full deck, grouped by module (mental model → key points → interview Q&A), module order by num. */
export const deck: Flashcard[] = [...modules]
  .filter((m) => m.topics.length > 0) // authored modules only
  .sort((a, b) => a.num - b.num)
  .flatMap((m) => {
    const accent = getSection(m.section)?.accent ?? 'var(--accent)';
    const base = { moduleId: m.id, moduleNum: m.num, moduleTitle: m.title, accent };
    const cards: Flashcard[] = [
      { ...base, id: `${m.id}-mm`, kind: 'mental-model', front: m.title, back: m.mentalModel },
    ];
    if (m.keyPoints.length > 0) {
      cards.push({ ...base, id: `${m.id}-kp`, kind: 'key-points', front: m.title, back: joinPoints(m.keyPoints) });
    }
    for (const [i, qa] of (m.interview ?? []).entries()) {
      cards.push({ ...base, id: `${m.id}-iv-${i}`, kind: 'interview', level: qa.level, front: qa.q, back: qa.a });
    }
    return cards;
  });

/** Distinct modules present in the deck — drives the per-module filter dropdown. */
export const deckModules: { id: string; num: number; title: Localized }[] = [...modules]
  .filter((m) => m.topics.length > 0)
  .sort((a, b) => a.num - b.num)
  .map((m) => ({ id: m.id, num: m.num, title: m.title }));
