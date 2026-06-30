import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Localized } from '../../data/types';
import { useLang } from '../../i18n/lang';
import { ui } from '../../i18n/ui';
import { cx } from '../../lib/utils';
import {
  evaluate,
  INPUTS,
  inputById,
  PRESETS,
  presetById,
  renderTy,
} from '../../lib/typeEval';
import type { Step } from '../../lib/typeEval';

/*
 * ★ Conditional-type / infer evaluator (golden M5 sim).
 * The engine lives in src/lib/typeEval.ts (pure + unit-tested). This component drives it:
 * pick a conditional + an input, then step distribution → match → infer → re-union.
 * Play/pause/step/back/reset · ARIA live region · prefers-reduced-motion reveals all steps at once.
 */

const L = (en: string, uk: string): Localized => ({ en, uk });

const MSG = {
  conditional: L('Conditional type', 'Conditional type'),
  input: L('Input type', 'Вхідний тип'),
  distributesN: L('Distributes over', 'Розподіляється на'),
  members: L('union members', 'членів union'),
  oneUnit: L('Non-distributive — the union is checked as one unit.', 'Non-distributive — union перевіряється як єдине ціле.'),
  neverNote: L('Distributing over never (the empty union) yields never — zero members.', 'Розподіл над never (порожнім union) дає never — нуль членів.'),
  checks: L('extends', 'extends'),
  matchTrue: L('matches → true branch', 'збіг → true-гілка'),
  matchFalse: L('no match → false branch', 'немає збігу → false-гілка'),
  binds: L('binds', 'звʼязує'),
  contributes: L('contributes', 'дає'),
  result: L('Result', 'Результат'),
  stepOf: L('Step', 'Крок'),
};

export function ConditionalTypeSim() {
  const { t, lang } = useLang();
  const [presetId, setPresetId] = useState('to-array');
  const [inputId, setInputId] = useState('str-num');
  const [cursor, setCursor] = useState(0); // 0..N revealed steps (N → result shown)
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const preset = presetById(presetId) ?? PRESETS[0];
  const input = inputById(inputId) ?? INPUTS[0].ty;
  const evald = useMemo(() => evaluate(preset, input), [preset, input]);
  const N = evald.steps.length;

  // Honour reduced motion: reveal everything, no autoplay.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Reset the walkthrough whenever the inputs change.
  useEffect(() => {
    setPlaying(false);
    setCursor(reduced ? N : 0);
  }, [presetId, inputId, reduced, N]);

  // Autoplay: advance one step ~every 1.1s until the result is shown.
  useEffect(() => {
    if (!playing) return;
    if (cursor >= N) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setCursor((c) => Math.min(c + 1, N)), 1100);
    return () => window.clearTimeout(id);
  }, [playing, cursor, N]);

  const activeStep: Step | undefined = cursor > 0 ? evald.steps[cursor - 1] : undefined;

  // Announce the active step for screen readers.
  useEffect(() => {
    if (!liveRef.current) return;
    if (activeStep) {
      liveRef.current.textContent = `${renderTy(activeStep.member)} → ${renderTy(activeStep.result)}`;
    } else if (cursor >= N) {
      liveRef.current.textContent = `${t(MSG.result)}: ${renderTy(evald.result)}`;
    }
  }, [cursor, activeStep, evald.result, N, t]);

  const step = useCallback(() => setCursor((c) => Math.min(c + 1, N)), [N]);
  const back = useCallback(() => setCursor((c) => Math.max(c - 1, 0)), []);
  const reset = useCallback(() => {
    setPlaying(false);
    setCursor(0);
  }, []);

  const showResult = cursor >= N;
  const usesInfer = preset.ext.t !== 'type';

  return (
    <div className="ct-sim" aria-label="Conditional type evaluator">
      {/* Controls row: pick a conditional + an input */}
      <div className="ct-controls">
        <label className="ct-field">
          <span className="ct-label dim">{t(MSG.conditional)}</span>
          <select value={presetId} onChange={(e) => setPresetId(e.target.value)} className="mono">
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="ct-field">
          <span className="ct-label dim">{t(MSG.input)}</span>
          <select value={inputId} onChange={(e) => setInputId(e.target.value)} className="mono">
            {INPUTS.map((i) => (
              <option key={i.id} value={i.id}>
                {i.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* The conditional being evaluated */}
      <pre className="ct-signature mono">{preset.signature}</pre>

      {/* Distribution banner */}
      <p className="ct-dist mono">
        <span className="dim">{preset.name.replace('<T>', '')}&lt;</span>
        <span className="ct-accent">{renderTy(input)}</span>
        <span className="dim">&gt;</span>
        {'  '}
        {N === 0 ? (
          <span className="ct-note">— {t(MSG.neverNote)}</span>
        ) : preset.distribute && evald.distributed ? (
          <span className="ct-note">
            — {t(MSG.distributesN)} {N} {t(MSG.members)}
          </span>
        ) : (
          <span className="ct-note">— {t(MSG.oneUnit)}</span>
        )}
      </p>

      {/* Steps */}
      <ol className="ct-steps">
        {evald.steps.map((s, i) => {
          const revealed = i < cursor;
          const active = i === cursor - 1;
          const inferBinds = usesInfer && s.matched ? Object.entries(s.binds) : [];
          return (
            <li
              key={i}
              className={cx('ct-step', revealed && 'ct-step--on', active && 'ct-step--active', s.matched ? 'ct-step--true' : 'ct-step--false')}
              aria-hidden={!revealed}
            >
              <div className="ct-step-check mono">
                <span className="ct-accent">{renderTy(s.member)}</span> <span className="dim">{t(MSG.checks)}</span>{' '}
                {preset.ext.text} <span className="dim">?</span>
              </div>
              <div className="ct-step-outcome">
                <span className={cx('ct-flag', s.matched ? 'ct-flag--true' : 'ct-flag--false')}>
                  {s.matched ? '✓' : '✗'} {s.matched ? t(MSG.matchTrue) : t(MSG.matchFalse)}
                </span>
                {inferBinds.map(([k, v]) => (
                  <span className="ct-bind mono" key={k}>
                    {t(MSG.binds)} <strong>infer {k}</strong> = {renderTy(v)}
                  </span>
                ))}
                <span className="ct-contrib mono">
                  {t(MSG.contributes)} <strong>{renderTy(s.result)}</strong>
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Result */}
      <div className={cx('ct-result', showResult && 'ct-result--on')}>
        <span className="ct-result-label dim">{t(MSG.result)}</span>
        <code className="ct-result-ty mono">{showResult ? renderTy(evald.result) : '…'}</code>
      </div>

      {/* Transport */}
      <div className="ct-transport">
        <button className="btn" onClick={back} disabled={cursor === 0} aria-label={t(ui.back)}>
          ← {t(ui.back)}
        </button>
        <button
          className="btn btn-primary"
          onClick={() => (cursor >= N ? reset() : setPlaying((p) => !p))}
          disabled={reduced && cursor >= N}
        >
          {cursor >= N ? t(ui.reset) : playing ? t(ui.pause) : t(ui.play)}
        </button>
        <button className="btn" onClick={step} disabled={cursor >= N} aria-label={t(ui.next)}>
          {t(ui.step)} →
        </button>
        <span className="ct-counter mono dim">
          {t(MSG.stepOf)} {Math.min(cursor, N)} / {N}
        </span>
      </div>

      <p ref={liveRef} className="sr-only" aria-live="polite" role="status" lang={lang} />
    </div>
  );
}
