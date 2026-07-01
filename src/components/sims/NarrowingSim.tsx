import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Localized } from '../../data/types';
import { useLang } from '../../i18n/lang';
import { ui } from '../../i18n/ui';
import { cx } from '../../lib/utils';
import { run, SNIPPETS, snippetById } from '../../lib/narrowing';

/*
 * ★ Control-flow narrowing visualizer (M2 sim).
 * The engine lives in src/lib/narrowing.ts (pure + unit-tested). This component drives it like a
 * debugger: step through a snippet line by line and watch the tracked variable's union SHRINK at
 * every guard — down to a single member, or to `never` at an exhaustive switch default.
 * Play/pause/step/back/reset · ARIA live region · prefers-reduced-motion reveals everything at once.
 */

const L = (en: string, uk: string): Localized => ({ en, uk });

const MSG = {
  snippet: L('Narrowing example', 'Приклад narrowing'),
  nowLabel: L('Type here', 'Тип тут'),
  narrowsTo: L('narrows to', 'звужується до'),
  exhaustive: L('exhaustive — every member handled', 'вичерпно — усі члени опрацьовано'),
  unsound: L('not exhaustive — a member is still assignable', 'не вичерпно — член ще assignable'),
  stepOf: L('Line', 'Рядок'),
  hint: L('Step through the code; the tracked type updates on the right.', 'Крокуйте кодом; тип праворуч оновлюється.'),
};

export function NarrowingSim() {
  const { t, lang } = useLang();
  const [snipId, setSnipId] = useState('typeof');
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const snippet = snippetById(snipId) ?? SNIPPETS[0];
  const lines = useMemo(() => run(snippet), [snippet]);
  const N = lines.length;

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
  }, [snipId, reduced, N]);

  useEffect(() => {
    if (!playing) return;
    if (cursor >= N) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setCursor((c) => Math.min(c + 1, N)), 1000);
    return () => window.clearTimeout(id);
  }, [playing, cursor, N]);

  // The most recent revealed line that carries a narrowed type drives the readout.
  const current = useMemo(() => {
    for (let i = Math.min(cursor, N) - 1; i >= 0; i--) {
      if (lines[i].show) return lines[i];
    }
    return undefined;
  }, [cursor, N, lines]);

  useEffect(() => {
    if (!liveRef.current || !current) return;
    liveRef.current.textContent = `${snippet.varName}: ${current.narrowed}`;
  }, [current, snippet.varName]);

  const step = useCallback(() => setCursor((c) => Math.min(c + 1, N)), [N]);
  const back = useCallback(() => setCursor((c) => Math.max(c - 1, 0)), []);
  const reset = useCallback(() => {
    setPlaying(false);
    setCursor(0);
  }, []);

  const readoutTone = current?.kind === 'never' ? (current.ok ? 'ok' : 'bad') : current?.isNever ? 'never' : 'live';

  return (
    <div className="nr-sim" aria-label="Control-flow narrowing visualizer">
      {/* Controls */}
      <div className="nr-controls">
        <label className="ct-field">
          <span className="ct-label dim">{t(MSG.snippet)}</span>
          <select value={snipId} onChange={(e) => setSnipId(e.target.value)} className="mono">
            {SNIPPETS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
        <span className="nr-hint dim">{t(MSG.hint)}</span>
      </div>

      <div className="nr-body">
        {/* Code panel */}
        <ol className="nr-code">
          {lines.map((line, i) => {
            const revealed = i < cursor;
            const active = i === cursor - 1;
            return (
              <li
                key={i}
                className={cx('nr-line', revealed && 'nr-line--on', active && 'nr-line--active', line.kind === 'never' && (line.ok ? 'nr-line--never-ok' : 'nr-line--never-bad'))}
                aria-hidden={!revealed}
              >
                <code className="nr-src mono">{line.code}</code>
                {line.show && (
                  <span className={cx('nr-type mono', line.isNever && 'nr-type--never')}>
                    {snippet.varName}: {line.narrowed}
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        {/* Live readout — the tracked variable's type "right now" */}
        <aside className={cx('nr-readout', `nr-readout--${readoutTone}`)}>
          <span className="nr-readout-label dim">{t(MSG.nowLabel)}</span>
          <div className="nr-readout-type mono">
            <span className="dim">{snippet.varName}:</span>{' '}
            <strong>{current ? current.narrowed : renderDeclared(snippet.declared.map((m) => m.render))}</strong>
          </div>
          {current?.kind === 'never' && (
            <p className={cx('nr-readout-note', current.ok ? 'nr-ok' : 'nr-bad')}>
              {current.ok ? `✓ ${t(MSG.exhaustive)}` : `✗ ${t(MSG.unsound)}`}
            </p>
          )}
        </aside>
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

/** The initial declared union, shown in the readout before any line is stepped. */
function renderDeclared(renders: string[]): string {
  return renders.length ? renders.join(' | ') : 'never';
}
