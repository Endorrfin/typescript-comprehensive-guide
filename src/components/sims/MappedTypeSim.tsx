import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Localized } from '../../data/types';
import { useLang } from '../../i18n/lang';
import { ui } from '../../i18n/ui';
import { cx } from '../../lib/utils';
import { applyTransform, INPUTS, inputById, renderMembers, TRANSFORMS, transformById } from '../../lib/mappedType';
import type { KeyStep } from '../../lib/mappedType';

/*
 * ★ Mapped-type transformer (M6 sim).
 * The engine lives in src/lib/mappedType.ts (pure + unit-tested). This component drives it: pick an
 * input object type and a mapped transform (Partial/Required/Readonly/Mutable/Nullable/Getters), then
 * step `[K in keyof T]` KEY BY KEY — watch each key's modifiers change, its name remap via `as` +
 * template literals, and its value transform — building the result type up one member at a time.
 * Play/pause/step/back/reset · ARIA live region · prefers-reduced-motion reveals everything at once.
 */

const L = (en: string, uk: string): Localized => ({ en, uk });

const MSG = {
  input: L('Input type (T)', 'Вхідний тип (T)'),
  transform: L('Mapped transform', 'Mapped-перетворення'),
  loop: L('for each key K in keyof T', 'для кожного ключа K in keyof T'),
  addReadonly: L('+readonly', '+readonly'),
  removeReadonly: L('−readonly', '−readonly'),
  addOptional: L('added ?', 'додано ?'),
  removeOptional: L('removed ?', 'знято ?'),
  preserved: L('modifiers preserved (homomorphic)', 'модифікатори збережено (homomorphic)'),
  remapped: L('key remapped via `as`', 'ключ перейменовано через `as`'),
  valueWrapped: L('value transformed', 'значення перетворено'),
  result: L('Result type', 'Результівний тип'),
  building: L('building…', 'будуємо…'),
  stepOf: L('Key', 'Ключ'),
};

export function MappedTypeSim() {
  const { t, lang } = useLang();
  const [inputId, setInputId] = useState('User');
  const [transformId, setTransformId] = useState('partial');
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const input = inputById(inputId) ?? INPUTS[0].members;
  const transform = transformById(transformId) ?? TRANSFORMS[0];
  const result = useMemo(() => applyTransform(input, transform), [input, transform]);
  const N = result.steps.length;

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
  }, [inputId, transformId, reduced, N]);

  useEffect(() => {
    if (!playing) return;
    if (cursor >= N) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setCursor((c) => Math.min(c + 1, N)), 1100);
    return () => window.clearTimeout(id);
  }, [playing, cursor, N]);

  const activeStep = cursor > 0 ? result.steps[cursor - 1] : undefined;
  const showResult = cursor >= N;

  useEffect(() => {
    if (!liveRef.current) return;
    if (activeStep) {
      liveRef.current.textContent = `${activeStep.origKey} → ${memberText(activeStep)}`;
    } else if (showResult) {
      liveRef.current.textContent = `${t(MSG.result)}: ${result.outputRender}`;
    }
  }, [cursor, activeStep, showResult, result.outputRender, t]);

  const step = useCallback(() => setCursor((c) => Math.min(c + 1, N)), [N]);
  const back = useCallback(() => setCursor((c) => Math.max(c - 1, 0)), []);
  const reset = useCallback(() => {
    setPlaying(false);
    setCursor(0);
  }, []);

  // The result grows as keys are revealed.
  const revealed = result.steps.slice(0, cursor);
  const partialRender = revealed.length
    ? `{ ${revealed.map(memberText).join('; ')}${cursor < N ? '; …' : ''} }`
    : '{ … }';

  return (
    <div className="mp-sim" aria-label="Mapped type transformer">
      {/* Controls */}
      <div className="mp-controls">
        <label className="ct-field">
          <span className="ct-label dim">{t(MSG.input)}</span>
          <select value={inputId} onChange={(e) => setInputId(e.target.value)} className="mono">
            {INPUTS.map((i) => (
              <option key={i.id} value={i.id}>{i.id}</option>
            ))}
          </select>
        </label>
        <label className="ct-field">
          <span className="ct-label dim">{t(MSG.transform)}</span>
          <select value={transformId} onChange={(e) => setTransformId(e.target.value)} className="mono">
            {TRANSFORMS.map((tr) => (
              <option key={tr.id} value={tr.id}>{tr.name}</option>
            ))}
          </select>
        </label>
      </div>

      {/* The mapped-type signature + the input it maps over */}
      <pre className="mp-signature mono">{transform.signature}</pre>
      <p className="mp-io mono">
        <span className="dim">{transform.name.replace('<T>', '')}&lt;</span>
        <span className="mp-accent">{inputId}</span>
        <span className="dim">&gt; = </span>
        <span className="dim">{renderMembers(input)}</span>
      </p>

      <p className="mp-loop-head dim">{t(MSG.loop)}</p>

      {/* Per-key steps */}
      <ol className="mp-steps">
        {result.steps.map((s, i) => {
          const on = i < cursor;
          const active = i === cursor - 1;
          return (
            <li key={s.origKey} className={cx('mp-step', on && 'mp-step--on', active && 'mp-step--active')} aria-hidden={!on}>
              <div className="mp-step-key mono">
                <span className="dim">K = </span><span className="mp-accent">'{s.origKey}'</span>
              </div>
              <span className="mp-arrow" aria-hidden="true">→</span>
              <div className="mp-step-out mono">{memberText(s)}</div>
              <div className="mp-chips">
                {s.keyChanged && <span className="mp-chip mp-chip--key">{t(MSG.remapped)}</span>}
                {s.readonlyChange === '+' && <span className="mp-chip mp-chip--ro">{t(MSG.addReadonly)}</span>}
                {s.readonlyChange === '-' && <span className="mp-chip mp-chip--ro">{t(MSG.removeReadonly)}</span>}
                {s.optionalChange === '+' && <span className="mp-chip mp-chip--opt">{t(MSG.addOptional)}</span>}
                {s.optionalChange === '-' && <span className="mp-chip mp-chip--opt">{t(MSG.removeOptional)}</span>}
                {s.valueChanged && <span className="mp-chip mp-chip--val">{t(MSG.valueWrapped)}</span>}
                {(s.readonly && s.readonlyChange === undefined) && <span className="mp-chip mp-chip--keep">{t(MSG.preserved)}</span>}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Result — grows as keys reveal */}
      <div className={cx('mp-result', showResult && 'mp-result--on')}>
        <span className="mp-result-label dim">{t(MSG.result)}{!showResult && <> · {t(MSG.building)}</>}</span>
        <code className="mp-result-ty mono">{showResult ? result.outputRender : partialRender}</code>
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
        <span className="ct-counter mono dim">{t(MSG.stepOf)} {Math.min(cursor, N)} / {N}</span>
      </div>

      <p ref={liveRef} className="sr-only" aria-live="polite" role="status" lang={lang} />
    </div>
  );
}

/** Render one output member: `readonly getId?: () => number`. */
function memberText(s: KeyStep): string {
  return `${s.readonly ? 'readonly ' : ''}${s.key}${s.optional ? '?' : ''}: ${s.value}`;
}
