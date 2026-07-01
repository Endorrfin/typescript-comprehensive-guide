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
  'structural-assignability': lazyNamed(() => import('../components/sims/AssignabilitySim'), 'AssignabilitySim'), // ★ M1
  'control-flow-narrowing': lazyNamed(() => import('../components/sims/NarrowingSim'), 'NarrowingSim'), // ★ M2
  'mapped-type-transform': lazyNamed(() => import('../components/sims/MappedTypeSim'), 'MappedTypeSim'), // ★ M6
  'generic-inference': lazyNamed(() => import('../components/sims/InferenceSim'), 'InferenceSim'), // ★ M4
  'utility-type-decode': lazyNamed(() => import('../components/sims/UtilityTypeSim'), 'UtilityTypeSim'), // ★ M7
  'tsconfig-strictness': lazyNamed(() => import('../components/sims/TsconfigStrictSim'), 'TsconfigStrictSim'), // ★ M11 (S8)
  'module-resolution': lazyNamed(() => import('../components/sims/ResolutionSim'), 'ResolutionSim'), // ★ M12 (S8)
};

// ── Figures ───────────────────────────────────────────────────────────────────
export const figures: Record<string, ComponentType> = {
  'distributive-conditional': lazyNamed(() => import('../components/figures/DistributiveConditional'), 'DistributiveConditional'), // M5
  'infer-extraction': lazyNamed(() => import('../components/figures/InferExtraction'), 'InferExtraction'), // M5
  'structural-vs-nominal': lazyNamed(() => import('../components/figures/StructuralVsNominal'), 'StructuralVsNominal'), // M1
  'narrowing-funnel': lazyNamed(() => import('../components/figures/NarrowingFunnel'), 'NarrowingFunnel'), // M2
  'mapped-type-mechanism': lazyNamed(() => import('../components/figures/MappedTypeMechanism'), 'MappedTypeMechanism'), // M6
  'inference-sites': lazyNamed(() => import('../components/figures/InferenceSites'), 'InferenceSites'), // M4
  'utility-type-taxonomy': lazyNamed(() => import('../components/figures/UtilityTypeTaxonomy'), 'UtilityTypeTaxonomy'), // M7
  'variance-directions': lazyNamed(() => import('../components/figures/VarianceDirections'), 'VarianceDirections'), // M3
  'overload-resolution': lazyNamed(() => import('../components/figures/OverloadResolution'), 'OverloadResolution'), // M3
  'decorator-two-systems': lazyNamed(() => import('../components/figures/DecoratorTwoSystems'), 'DecoratorTwoSystems'), // M8 (S6)
  'di-metadata-flow': lazyNamed(() => import('../components/figures/DiMetadataFlow'), 'DiMetadataFlow'), // M8 (S6)
  'trust-boundary': lazyNamed(() => import('../components/figures/TrustBoundary'), 'TrustBoundary'), // M9 (S7)
  'schema-single-source': lazyNamed(() => import('../components/figures/SchemaSingleSource'), 'SchemaSingleSource'), // M9 (S7)
  'signals-vs-streams': lazyNamed(() => import('../components/figures/SignalsVsStreams'), 'SignalsVsStreams'), // M10 (S7)
  'operator-type-flow': lazyNamed(() => import('../components/figures/OperatorTypeFlow'), 'OperatorTypeFlow'), // M10 (S7)
  'strict-family': lazyNamed(() => import('../components/figures/StrictFamily'), 'StrictFamily'), // M11 (S8)
  'resolution-pipeline': lazyNamed(() => import('../components/figures/ResolutionPipeline'), 'ResolutionPipeline'), // M12 (S8)
  'project-references': lazyNamed(() => import('../components/figures/ProjectReferences'), 'ProjectReferences'), // M12 (S8)
};

export const getSim = (key: string): ComponentType | undefined => sims[key];
export const getFigure = (key: string): ComponentType | undefined => figures[key];
