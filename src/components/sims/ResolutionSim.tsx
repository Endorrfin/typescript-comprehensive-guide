import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Localized } from '../../data/types';
import { useLang } from '../../i18n/lang';
import { ui } from '../../i18n/ui';
import { cx } from '../../lib/utils';
import { resolveScenario, SCENARIOS } from '../../lib/resolution';
import type { RuleKind } from '../../lib/resolution';

/*
 * ★ Module-resolution tracer (M12 sim).
 * The engine lives in src/lib/resolution.ts (a real, unit-tested resolver over one fixed virtual
 * project). This component drives it: pick an import scenario, then step the ORDERED list of candidate
 * paths TypeScript probes — extension substitution, the node_modules walk, "exports"/"imports"
 * conditions — until it resolves a file or fails. The ordering is the lesson; each probe shows whether
 * that candidate existed. Play/pause/step/back/reset · ARIA live region · reduced-motion reveals all.
 */

const L = (en: string, uk: string): Localized => ({ en, uk });

const RULE_CAPTION: Record<RuleKind, Localized> = {
  'ext-sub': L('try file — extension substitution', 'пробуємо файл — підстановка розширення'),
  index: L('directory module → index.*', 'директорія-модуль → index.*'),
  'esm-needs-ext': L('ESM: an explicit extension is required', 'ESM: потрібне явне розширення'),
  nm: L('found the node_modules package', 'знайдено пакет у node_modules'),
  field: L('read a package.json field', 'читаємо поле package.json'),
  exports: L('consult package.json "exports"', 'дивимось package.json "exports"'),
  imports: L('consult package.json "imports"', 'дивимось package.json "imports"'),
  condition: L('test an export condition', 'перевіряємо умову export'),
  blocked: L('blocked — not listed in "exports"', 'заблоковано — немає в "exports"'),
  remap: L('remap output path → input source', 'ремап вихідного шляху → джерело'),
  'at-types': L('fall back to node_modules/@types', 'запасний варіант node_modules/@types'),
};

// Fully bilingual teaching hook per scenario (the engine keeps only an English `teaches`).
const SCENARIO_NOTE: Record<string, Localized> = {
  'rel-node10': L('Extension substitution: a ".js" lookup tries .ts, .tsx, .d.ts first.', 'Підстановка розширення: пошук ".js" спершу пробує .ts, .tsx, .d.ts.'),
  'rel-esm-js': L('You WRITE the runtime ".js"; TypeScript READS the ".ts".', 'Ви ПИШЕТЕ runtime ".js"; TypeScript ЧИТАЄ ".ts".'),
  'rel-esm-noext': L('Under ESM, an extensionless relative import is an error — add ".js".', 'Під ESM відносний імпорт без розширення — помилка; додайте ".js".'),
  'rel-bundler-noext': L('Same import as ESM — but bundler never requires an extension.', 'Той самий імпорт, що й ESM, — але bundler ніколи не вимагає розширення.'),
  'dir-node10': L('A folder resolves to its index.* — only where directory modules are allowed.', 'Тека резолвиться до свого index.* — лише там, де директорії-модулі дозволені.'),
  'bare-exports': L('Conditions match in key order: "types" wins over "import" here.', 'Умови збігаються в порядку ключів: тут "types" перемагає "import".'),
  'bare-blocked': L('The presence of "exports" BLOCKS any subpath it does not list.', 'Наявність "exports" БЛОКУЄ будь-який підшлях, якого там немає.'),
  'bare-attypes': L('Types-first: the real package has no .d.ts, so @types/lodash wins.', 'Спершу типи: у самого пакета немає .d.ts, тож перемагає @types/lodash.'),
  'imports-remap': L('A local "#imports" target is remapped from outDir back to the rootDir source.', 'Локальна ціль "#imports" ремапиться з outDir назад до джерела в rootDir.'),
};

const MSG = {
  scenario: L('Import scenario', 'Сценарій імпорту'),
  from: L('from', 'з'),
  mode: L('moduleResolution', 'moduleResolution'),
  resolvedTo: L('resolved to', 'розвʼязано до'),
  unresolved: L('unresolved — this import is a compile error', 'не розвʼязано — цей імпорт є помилкою компіляції'),
  step: L('Step', 'Крок'),
  tracing: L('tracing…', 'трасуємо…'),
  probe: L('candidate', 'кандидат'),
};

export function ResolutionSim() {
  const { t, lang } = useLang();
  const [scenarioId, setScenarioId] = useState('rel-esm-js');
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const trace = useMemo(() => resolveScenario(scenarioId) ?? resolveScenario('rel-esm-js')!, [scenarioId]);
  const { scenario, probes, resolved } = trace;
  const N = probes.length;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    setPlaying(false);
    setCursor(reduced ? N : 0);
  }, [scenarioId, reduced, N]);

  useEffect(() => {
    if (!playing) return;
    if (cursor >= N) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setCursor((c) => Math.min(c + 1, N)), 1100);
    return () => window.clearTimeout(id);
  }, [playing, cursor, N]);

  const active = cursor > 0 ? probes[cursor - 1] : undefined;
  const showResult = cursor >= N;

  useEffect(() => {
    if (!liveRef.current) return;
    if (active) {
      liveRef.current.textContent = `${t(RULE_CAPTION[active.rule])}: ${active.path} — ${active.hit ? 'hit' : 'miss'}`;
    } else if (showResult) {
      liveRef.current.textContent = resolved ? `${t(MSG.resolvedTo)} ${resolved}` : t(MSG.unresolved);
    }
  }, [cursor, active, showResult, resolved, t]);

  const step = useCallback(() => setCursor((c) => Math.min(c + 1, N)), [N]);
  const back = useCallback(() => setCursor((c) => Math.max(c - 1, 0)), []);
  const reset = useCallback(() => {
    setPlaying(false);
    setCursor(0);
  }, []);

  return (
    <div className="rt-sim" aria-label="Module resolution tracer">
      {/* Controls */}
      <div className="rt-controls">
        <label className="ct-field">
          <span className="ct-label dim">{t(MSG.scenario)}</span>
          <select value={scenarioId} onChange={(e) => setScenarioId(e.target.value)}>
            {SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </label>
      </div>

      {/* The import under trace */}
      <pre className="rt-import mono">
        {`import … from "${scenario.specifier}"`}
      </pre>
      <p className="rt-context dim">
        <span className="rt-chip">{t(MSG.mode)}: {scenario.mode}</span>
        {scenario.mode === 'node16' && <span className="rt-chip">{scenario.format.toUpperCase()}</span>}
        <span className="rt-from">{t(MSG.from)} {scenario.importer}</span>
      </p>
      <p className="rt-teaches">{t(SCENARIO_NOTE[scenario.id])}</p>

      {/* The ordered probe trace */}
      <ol className="rt-steps">
        {probes.map((p, i) => {
          const on = i < cursor;
          const isActive = i === cursor - 1;
          return (
            <li
              key={i}
              className={cx('rt-step', on && 'rt-step--on', isActive && 'rt-step--active', on && (p.hit ? 'rt-step--hit' : 'rt-step--miss'))}
              aria-hidden={!on}
            >
              <span className={cx('rt-badge', `rt-badge--${p.rule}`)}>{p.rule}</span>
              <span className="rt-step-cap dim">{t(RULE_CAPTION[p.rule])}</span>
              <code className="rt-step-path mono">{p.path}</code>
              <span className={cx('rt-mark', p.hit ? 'rt-mark--hit' : 'rt-mark--miss')} aria-hidden="true">{p.hit ? '✓' : '·'}</span>
            </li>
          );
        })}
      </ol>

      {/* Result */}
      <div className={cx('rt-result', showResult && 'rt-result--on', showResult && (resolved ? 'rt-result--ok' : 'rt-result--fail'))}>
        <span className="rt-result-label dim">{showResult ? (resolved ? t(MSG.resolvedTo) : '') : t(MSG.tracing)}</span>
        <code className="rt-result-ty mono">{showResult ? (resolved ?? t(MSG.unresolved)) : '…'}</code>
      </div>

      {/* Transport */}
      <div className="ct-transport">
        <button className="btn" onClick={back} disabled={cursor === 0} aria-label={t(ui.back)}>← {t(ui.back)}</button>
        <button
          className="btn btn-primary"
          onClick={() => (cursor >= N ? reset() : setPlaying((p) => !p))}
          disabled={reduced && cursor >= N}
        >
          {cursor >= N ? t(ui.reset) : playing ? t(ui.pause) : t(ui.play)}
        </button>
        <button className="btn" onClick={step} disabled={cursor >= N} aria-label={t(ui.next)}>{t(ui.step)} →</button>
        <span className="ct-counter mono dim">{t(MSG.step)} {Math.min(cursor, N)} / {N}</span>
      </div>

      <p ref={liveRef} className="sr-only" aria-live="polite" role="status" lang={lang} />
    </div>
  );
}
