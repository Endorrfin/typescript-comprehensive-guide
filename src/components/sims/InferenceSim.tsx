import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Localized } from '../../data/types';
import { useLang } from '../../i18n/lang';
import { ui } from '../../i18n/ui';
import { cx } from '../../lib/utils';
import { infer, PRESETS, presetById } from '../../lib/inference';

/*
 * ★ Generic inference tracer (M4 sim).
 * The engine lives in src/lib/inference.ts (pure + unit-tested). This component drives it: pick a
 * generic function and a call, then step each argument's INFERENCE SITE — the candidate it offers for
 * T — before the compiler takes the best-common-type, applies the default, and checks the constraint.
 * Play/pause/step/back/reset · ARIA live region · prefers-reduced-motion reveals everything at once.
 */

const L = (en: string, uk: string): Localized => ({ en, uk });

const MSG = {
  fn: L('Generic function', 'Generic-функція'),
  call: L('Call', 'Виклик'),
  callLabel: L('call', 'виклик'),
  sitesHead: L('Inference sites — each argument offers a candidate for T', 'Місця inference — кожен аргумент дає кандидата для T'),
  candidate: L('candidate', 'кандидат'),
  noCandidate: L('no candidate here', 'тут немає кандидата'),
  bestCommon: L('best common type', 'best common type'),
  defaultUsed: L('no candidates → falls back to the default', 'немає кандидатів → падіння на default'),
  explicit: L('explicit type argument — inference skipped', 'явний type argument — inference пропущено'),
  constraint: L('constraint', 'constraint'),
  satisfies: L('satisfies', 'задовольняє'),
  violates: L('violates the constraint', 'порушує constraint'),
  inferred: L('inferred', 'виведено'),
  returns: L('call returns', 'виклик повертає'),
  stepOf: L('Site', 'Місце'),
};

export function InferenceSim() {
  const { t, lang } = useLang();
  const [presetId, setPresetId] = useState('identity');
  const preset = presetById(presetId) ?? PRESETS[0];
  const [callId, setCallId] = useState(preset.calls[0].id);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const call = preset.calls.find((c) => c.id === callId) ?? preset.calls[0];
  const result = useMemo(() => infer(preset, call), [preset, call]);
  const N = result.sites.length;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Keep the selected call valid when the preset changes.
  useEffect(() => {
    if (!preset.calls.some((c) => c.id === callId)) setCallId(preset.calls[0].id);
  }, [preset, callId]);

  useEffect(() => {
    setPlaying(false);
    setCursor(reduced ? N : 0);
  }, [presetId, callId, reduced, N]);

  useEffect(() => {
    if (!playing) return;
    if (cursor >= N) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setCursor((c) => Math.min(c + 1, N)), 1100);
    return () => window.clearTimeout(id);
  }, [playing, cursor, N]);

  const showResult = cursor >= N;

  useEffect(() => {
    if (!liveRef.current) return;
    if (showResult) liveRef.current.textContent = `T = ${result.inferred}`;
    else if (cursor > 0) {
      const s = result.sites[cursor - 1];
      liveRef.current.textContent = `${s.paramText}: ${s.candidates.join(', ') || t(MSG.noCandidate)}`;
    }
  }, [cursor, showResult, result, t]);

  const step = useCallback(() => setCursor((c) => Math.min(c + 1, N)), [N]);
  const back = useCallback(() => setCursor((c) => Math.max(c - 1, 0)), []);
  const reset = useCallback(() => {
    setPlaying(false);
    setCursor(0);
  }, []);

  return (
    <div className="in-sim" aria-label="Generic inference tracer">
      {/* Controls */}
      <div className="in-controls">
        <label className="ct-field">
          <span className="ct-label dim">{t(MSG.fn)}</span>
          <select value={presetId} onChange={(e) => setPresetId(e.target.value)} className="mono">
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
        <label className="ct-field">
          <span className="ct-label dim">{t(MSG.call)}</span>
          <select value={callId} onChange={(e) => setCallId(e.target.value)} className="mono">
            {preset.calls.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </label>
      </div>

      <pre className="in-signature mono">{preset.signature}</pre>
      <p className="in-call mono">
        <span className="dim">{t(MSG.callLabel)}: </span>
        <span className="in-accent">{call.label}</span>
      </p>

      {/* Inference sites */}
      {N > 0 ? (
        <>
          <p className="in-sites-head dim">{t(MSG.sitesHead)}</p>
          <ol className="in-sites">
            {result.sites.map((s, i) => {
              const on = i < cursor;
              const active = i === cursor - 1;
              const has = s.candidates.length > 0;
              return (
                <li key={i} className={cx('in-site', on && 'in-site--on', active && 'in-site--active')} aria-hidden={!on}>
                  <span className="in-site-param mono">{s.paramText}</span>
                  <span className="in-arrow" aria-hidden="true">←</span>
                  <span className="in-site-arg mono">{s.argText}</span>
                  <span className={cx('in-cand mono', !has && 'in-cand--none')}>
                    {has ? <>{t(MSG.candidate)}: <strong>{s.candidates.join(' | ')}</strong></> : t(MSG.noCandidate)}
                  </span>
                </li>
              );
            })}
          </ol>
        </>
      ) : (
        <p className="in-sites-head dim">
          {result.explicit ? t(MSG.explicit) : t(MSG.defaultUsed)}
        </p>
      )}

      {/* Conclusion */}
      <div className={cx('in-result', showResult && 'in-result--on', showResult && (result.constraintOk ? 'in-result--ok' : 'in-result--bad'))}>
        {showResult ? (
          <>
            <p className="in-line">
              <span className="in-result-label dim">
                {result.explicit ? t(MSG.explicit) : result.usedDefault ? t(MSG.defaultUsed) : t(MSG.bestCommon)}
              </span>{' '}
              <code className="mono">{result.combined}</code>
            </p>
            {result.constraintText && (
              <p className={cx('in-line mono', result.constraintOk ? 'in-ok' : 'in-bad')}>
                {t(MSG.constraint)}: T extends {result.constraintText} — {result.inferred} {result.constraintOk ? `✓ ${t(MSG.satisfies)}` : `✗ ${t(MSG.violates)}`}
              </p>
            )}
            <p className="in-final">
              <span className="in-result-label dim">{t(MSG.inferred)}</span>{' '}
              <code className="mono in-t">T = {result.inferred}</code>
            </p>
            <p className="in-line mono dim">{t(MSG.returns)}: {result.returnType}</p>
          </>
        ) : (
          <code className="mono dim">T = …</code>
        )}
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
