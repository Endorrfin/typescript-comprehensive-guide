import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Localized } from '../../data/types';
import { useLang } from '../../i18n/lang';
import { ui } from '../../i18n/ui';
import { cx } from '../../lib/utils';
import { expand, MECHANISMS, UTILITIES, utilityById } from '../../lib/utilityType';
import type { Mechanism, StepKind } from '../../lib/utilityType';

/*
 * ★ Utility-type decoder (M7 sim).
 * The engine lives in src/lib/utilityType.ts (pure + unit-tested). This component drives it: pick a
 * utility (Partial/Pick/Omit/Exclude/ReturnType/Awaited/…) and an input, then step its REAL lib.d.ts
 * definition as it expands — mapped loop, distributive filter, `infer` bind or recursive unwrap —
 * building the concrete result type one line at a time, each step badged by mechanism.
 * Play/pause/step/back/reset · ARIA live region · prefers-reduced-motion reveals everything at once.
 */

const L = (en: string, uk: string): Localized => ({ en, uk });

// Technical terms stay English in both languages (i18n policy); only the gloss is translated.
const MECH_LABEL: Record<Mechanism, Localized> = {
  mapped: L('mapped — reshape an object', 'mapped — переформувати обʼєкт'),
  conditional: L('conditional — filter a union', 'conditional — фільтрувати union'),
  infer: L('infer — extract a position', 'infer — дістати позицію'),
  recursive: L('recursive — unwrap (Awaited)', 'recursive — розгорнути (Awaited)'),
};

const STEP_CAPTION: Record<StepKind, Localized> = {
  keyof: L('expand keyof T', 'розгорнути keyof T'),
  'pick-keys': L('keep the picked keys', 'лишити обрані ключі'),
  'omit-exclude': L('Omit = Pick + Exclude the omitted keys', 'Omit = Pick + Exclude вилучених ключів'),
  'record-keys': L('the raw key union K (no source T)', 'сирий union ключів K (без джерела T)'),
  member: L('rewrite the member', 'переписати властивість'),
  kept: L('member survives', 'член виживає'),
  dropped: L('filtered out → never', 'відфільтровано → never'),
  substitute: L('substitute F into the conditional', 'підставити F у conditional'),
  match: L('pattern-match the signature', 'зіставити сигнатуру'),
  bind: L('bind the inferred position', 'звʼязати виведену позицію'),
  distribute: L('distribute over the union', 'дистрибуція по union'),
  unwrap: L('unwrap one Promise → recurse', 'розгорнути один Promise → рекурсія'),
  'as-is': L('not a thenable — left as-is', 'не thenable — лишається як є'),
  result: L('result', 'результат'),
};

const MSG = {
  utility: L('Utility', 'Utility'),
  example: L('Example', 'Приклад'),
  mechanism: L('Mechanism', 'Механізм'),
  result: L('Result type', 'Результівний тип'),
  building: L('building…', 'будуємо…'),
  step: L('Step', 'Крок'),
};

export function UtilityTypeSim() {
  const { t, lang } = useLang();
  const [utilityId, setUtilityId] = useState('partial');
  const [exampleId, setExampleId] = useState('User');
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const utility = utilityById(utilityId) ?? UTILITIES[0];

  // Always resolve a valid (utility, example) pair even mid-transition.
  const exp = useMemo(() => {
    const u = utilityById(utilityId) ?? UTILITIES[0];
    const eid = u.examples.some((e) => e.id === exampleId) ? exampleId : u.examples[0].id;
    return expand(u.id, eid)!;
  }, [utilityId, exampleId]);
  const N = exp.steps.length;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Switching utility resets the example to that utility's first.
  const onUtility = useCallback((id: string) => {
    setUtilityId(id);
    const u = utilityById(id) ?? UTILITIES[0];
    setExampleId(u.examples[0].id);
  }, []);

  useEffect(() => {
    setPlaying(false);
    setCursor(reduced ? N : 0);
  }, [utilityId, exampleId, reduced, N]);

  useEffect(() => {
    if (!playing) return;
    if (cursor >= N) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setCursor((c) => Math.min(c + 1, N)), 1100);
    return () => window.clearTimeout(id);
  }, [playing, cursor, N]);

  const activeStep = cursor > 0 ? exp.steps[cursor - 1] : undefined;
  const showResult = cursor >= N;

  useEffect(() => {
    if (!liveRef.current) return;
    if (activeStep) {
      liveRef.current.textContent = `${t(STEP_CAPTION[activeStep.kind])}: ${activeStep.expr}`;
    } else if (showResult) {
      liveRef.current.textContent = `${t(MSG.result)}: ${exp.result}`;
    }
  }, [cursor, activeStep, showResult, exp.result, t]);

  const step = useCallback(() => setCursor((c) => Math.min(c + 1, N)), [N]);
  const back = useCallback(() => setCursor((c) => Math.max(c - 1, 0)), []);
  const reset = useCallback(() => {
    setPlaying(false);
    setCursor(0);
  }, []);

  return (
    <div className="ut-sim" aria-label="Utility type decoder">
      {/* Controls */}
      <div className="ut-controls">
        <label className="ct-field">
          <span className="ct-label dim">{t(MSG.utility)}</span>
          <select value={utilityId} onChange={(e) => onUtility(e.target.value)} className="mono">
            {MECHANISMS.map((mech) => (
              <optgroup key={mech} label={mech}>
                {UTILITIES.filter((u) => u.mechanism === mech).map((u) => (
                  <option key={u.id} value={u.id}>{u.name} · {u.since}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="ct-field">
          <span className="ct-label dim">{t(MSG.example)}</span>
          <select value={exampleId} onChange={(e) => setExampleId(e.target.value)} className="mono">
            {utility.examples.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.label}</option>
            ))}
          </select>
        </label>
      </div>

      {/* The real lib.d.ts definition + which mechanism it is */}
      <pre className="ut-signature mono">{exp.signature}</pre>
      <p className="ut-mech-line dim">
        {t(MSG.mechanism)}: <span className="ut-accent">{t(MECH_LABEL[exp.mechanism])}</span>
      </p>

      {/* Per-step expansion trace */}
      <ol className="ut-steps">
        {exp.steps.map((s, i) => {
          const on = i < cursor;
          const active = i === cursor - 1;
          const isResult = s.kind === 'result';
          return (
            <li
              key={s.n}
              className={cx('ut-step', on && 'ut-step--on', active && 'ut-step--active', isResult && 'ut-step--result')}
              aria-hidden={!on}
            >
              <span className={cx('ut-badge', `ut-badge--${s.tag}`)}>{s.tag === 'result' ? '=' : s.tag}</span>
              <span className="ut-step-cap dim">{t(STEP_CAPTION[s.kind])}</span>
              <code className="ut-step-expr mono">{s.expr}</code>
            </li>
          );
        })}
      </ol>

      {/* Result — reveals when the trace completes */}
      <div className={cx('ut-result', showResult && 'ut-result--on')}>
        <span className="ut-result-label dim">{t(MSG.result)}{!showResult && <> · {t(MSG.building)}</>}</span>
        <code className="ut-result-ty mono">{showResult ? exp.result : '…'}</code>
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
