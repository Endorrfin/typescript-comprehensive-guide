import { useEffect, useState } from 'react';

/*
 * Tiny hash router (no router lib — CLAUDE.md §2).
 * Routes: #/map · #/m/<moduleId>[/<topicId>] · #/mental-models · #/glossary[/<term>] ·
 *         #/decide · #/flashcards
 * Hash routing + vite base:'./' = works under any GitHub Pages sub-path.
 * CHANGED (S9): added #/decide (the picker) + #/flashcards (active recall). #/quiz lands later.
 */

export type Route =
  | { name: 'map' }
  | { name: 'module'; moduleId: string; topicId?: string }
  | { name: 'mentalModels' }
  | { name: 'glossary'; term?: string }
  | { name: 'decide' }
  | { name: 'flashcards' };

export function parseHash(raw: string): Route {
  const hash = raw.replace(/^#/, '').replace(/^\/+/, '');
  const parts = hash.split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'map' };
  switch (parts[0]) {
    case 'map':
      return { name: 'map' };
    case 'mental-models':
      return { name: 'mentalModels' };
    case 'decide':
      return { name: 'decide' };
    case 'flashcards':
      return { name: 'flashcards' };
    case 'glossary':
      return { name: 'glossary', term: parts[1] ? safeDecode(parts[1]) : undefined };
    case 'm':
      if (parts[1]) return { name: 'module', moduleId: parts[1], topicId: parts[2] };
      return { name: 'map' };
    default:
      return { name: 'map' };
  }
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export const hrefMap = () => '#/map';
export const hrefModule = (moduleId: string, topicId?: string) =>
  topicId ? `#/m/${moduleId}/${topicId}` : `#/m/${moduleId}`;
export const hrefMentalModels = () => '#/mental-models';
export const hrefDecide = () => '#/decide';
export const hrefFlashcards = () => '#/flashcards';
export const hrefGlossary = (term?: string) =>
  term ? `#/glossary/${encodeURIComponent(term)}` : '#/glossary';

export function navigate(href: string): void {
  window.location.hash = href.replace(/^#/, '');
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
