// Registry — content references figures and sims by KEY (CLAUDE.md §4), resolved here with
// React.lazy so each widget gets its own on-demand chunk. blocks.tsx wraps renders in <Suspense>.
import { lazy, type ComponentType } from 'react';

// Adapt a named-export lazy import to the { default } shape React.lazy requires.
function lazyNamed<M extends Record<string, ComponentType>>(
  factory: () => Promise<M>,
  name: keyof M & string,
): ComponentType {
  return lazy(() => factory().then((m) => ({ default: m[name] }))) as unknown as ComponentType;
}

// ── Sims ─────────────────────────────────────────────────────────────────────
export const sims: Record<string, ComponentType> = {
  'conditional-type-eval': lazyNamed(() => import('../components/sims/ConditionalTypeSim'), 'ConditionalTypeSim'), // ★ M5
};

// ── Figures ───────────────────────────────────────────────────────────────────
export const figures: Record<string, ComponentType> = {
  'distributive-conditional': lazyNamed(() => import('../components/figures/DistributiveConditional'), 'DistributiveConditional'), // M5
  'infer-extraction': lazyNamed(() => import('../components/figures/InferExtraction'), 'InferExtraction'), // M5
};

export const getSim = (key: string): ComponentType | undefined => sims[key];
export const getFigure = (key: string): ComponentType | undefined => figures[key];
