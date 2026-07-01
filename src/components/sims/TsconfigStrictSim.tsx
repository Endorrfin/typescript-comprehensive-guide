import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Localized } from '../../data/types';
import { useLang } from '../../i18n/lang';
import { ui } from '../../i18n/ui';
import { cx } from '../../lib/utils';
import { analyze, FLAGS, flagMeta, SAMPLES } from '../../lib/tsconfigStrict';
import type { StrictFlag } from '../../lib/tsconfigStrict';

/*
 * ★ Strictness explorer (M11 sim).
 * The engine lives in src/lib/tsconfigStrict.ts (pure + unit-tested). This component drives it: pick a
 * code sample, then step the strict FAMILY one diagnostic at a time — each step lights the offending
 * line, badges the flag (in-strict vs beyond-strict) and shows the real TSxxxx error it raises. The
 * point lands visually: `strict` is nine flags, and a couple of equally useful checks live outside it.
 * Play/pause/step/back/reset · ARIA live region · prefers-reduced-motion reveals everything at once.
 */

const L = (en: string, uk: string): Localized => ({ en, uk });

// Flag ids stay English (technical); only the "why it matters" gloss is translated.
const FLAG_EXPLAIN: Record<StrictFlag, Localized> = {
  noImplicitAny: L('A parameter or variable with no inferrable type silently becomes any — the first hole strict closes.', 'Параметр чи змінна без виводимого типу тихо стає any — перша діра, яку закриває strict.'),
  strictNullChecks: L('null and undefined leave every other type; you must handle the empty case before using a value.', 'null та undefined виходять з усіх інших типів; порожній випадок треба обробити перед використанням значення.'),
  strictFunctionTypes: L('Function-type parameters are checked contravariantly, so a narrower callback is correctly rejected. Methods stay bivariant.', 'Параметри функційних типів перевіряються контраваріантно, тож вужчий callback справедливо відхиляється. Методи лишаються біваріантними.'),
  strictBindCallApply: L('bind, call and apply become strongly typed instead of accepting any this and arguments.', 'bind, call та apply стають строго типізованими замість приймати будь-які this та аргументи.'),
  strictPropertyInitialization: L('A class field with no initializer and no definite assignment in the constructor is flagged.', 'Поле класу без ініціалізатора й без певного присвоєння в конструкторі позначається помилкою.'),
  noImplicitThis: L('A free function that reads this without a typed this parameter is an implicit-any this.', 'Вільна функція, що читає this без типізованого this-параметра, — це implicit-any this.'),
  useUnknownInCatchVariables: L('The catch binding is unknown, not any — you must narrow it before touching its members.', 'Змінна catch — unknown, а не any: її треба звузити, перш ніж торкатися членів.'),
  alwaysStrict: L('Every file is parsed in ECMAScript strict mode and "use strict" is emitted.', 'Кожен файл парситься в strict-режимі ECMAScript, а "use strict" емітується.'),
  strictBuiltinIteratorReturn: L('Built-in iterators type their TReturn as undefined instead of any (added to strict in 5.6).', 'Вбудовані ітератори типізують TReturn як undefined замість any (додано до strict у 5.6).'),
  noUncheckedIndexedAccess: L('obj[key] and arr[i] become T | undefined — the index might miss. Recommended, but NOT in strict.', 'obj[key] та arr[i] стають T | undefined — індекс може не влучити. Рекомендовано, але НЕ у strict.'),
  exactOptionalPropertyTypes: L('An optional property cannot be explicitly set to undefined — missing and undefined differ. NOT in strict.', 'Необовʼязкову властивість не можна явно виставити в undefined — відсутнє й undefined відрізняються. НЕ у strict.'),
};

const MSG = {
  sample: L('Sample', 'Приклад'),
  family: L('The strict family — nine flags', 'Родина strict — девʼять флагів'),
  inStrict: L('in strict', 'у strict'),
  beyond: L('beyond strict', 'поза strict'),
  line: L('line', 'рядок'),
  stepping: L('stepping…', 'крокуємо…'),
  step: L('Step', 'Крок'),
  summaryPre: L('strict surfaced', 'strict виявив'),
  summaryPost: L('latent bugs on this sample', 'прихованих багів у цьому прикладі'),
  legendStrict: L('One switch, nine checks. Two more (dimmed) are recommended but not included.', 'Один перемикач, девʼять перевірок. Ще два (тьмяні) рекомендовані, але не входять.'),
};

export function TsconfigStrictSim() {
  const { t, lang } = useLang();
  const [sampleId, setSampleId] = useState('service');
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const { sample, findings } = useMemo(() => analyze(sampleId) ?? analyze('service')!, [sampleId]);
  const N = findings.length;

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
  }, [sampleId, reduced, N]);

  useEffect(() => {
    if (!playing) return;
    if (cursor >= N) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setCursor((c) => Math.min(c + 1, N)), 1200);
    return () => window.clearTimeout(id);
  }, [playing, cursor, N]);

  const revealed = findings.slice(0, cursor);
  const active = cursor > 0 ? findings[cursor - 1] : undefined;
  const hitLines = new Set(revealed.map((f) => f.line));
  const caught = new Set(revealed.map((f) => f.flag));
  const showResult = cursor >= N;

  useEffect(() => {
    if (!liveRef.current) return;
    if (active) {
      liveRef.current.textContent = `${active.flag} · ${t(MSG.line)} ${active.line}: ${active.error}`;
    } else if (showResult) {
      liveRef.current.textContent = `${t(MSG.summaryPre)} ${N} ${t(MSG.summaryPost)}`;
    }
  }, [cursor, active, showResult, N, t]);

  const step = useCallback(() => setCursor((c) => Math.min(c + 1, N)), [N]);
  const back = useCallback(() => setCursor((c) => Math.max(c - 1, 0)), []);
  const reset = useCallback(() => {
    setPlaying(false);
    setCursor(0);
  }, []);

  return (
    <div className="sx-sim" aria-label="tsconfig strictness explorer">
      {/* Controls */}
      <div className="sx-controls">
        <label className="ct-field">
          <span className="ct-label dim">{t(MSG.sample)}</span>
          <select value={sampleId} onChange={(e) => setSampleId(e.target.value)}>
            {SAMPLES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Code panel — offending lines light up as the trace advances */}
      <pre className="sx-code mono" aria-hidden="true">
        {sample.lines.map((ln, i) => {
          const no = i + 1;
          const hit = hitLines.has(no);
          const isActive = active?.line === no;
          return (
            <div key={no} className={cx('sx-line', hit && 'sx-line--hit', isActive && 'sx-line--active')}>
              <span className="sx-ln dim">{String(no).padStart(2, ' ')}</span>
              <span className="sx-src">{ln || ' '}</span>
            </div>
          );
        })}
      </pre>

      {/* The strict family checklist — a flag lights once its diagnostic is revealed */}
      <div className="sx-family">
        <p className="sx-family-title dim">{t(MSG.family)}</p>
        <ul className="sx-flags">
          {FLAGS.map((f) => {
            const on = caught.has(f.id);
            return (
              <li key={f.id} className={cx('sx-flag', !f.inStrict && 'sx-flag--beyond', on && 'sx-flag--on')}>
                <span className="sx-flag-mark" aria-hidden="true">{on ? '✓' : f.inStrict ? '·' : '+'}</span>
                <code className="sx-flag-id">{f.id}</code>
                <span className="sx-flag-since dim">{f.since}</span>
              </li>
            );
          })}
        </ul>
        <p className="sx-legend dim">{t(MSG.legendStrict)}</p>
      </div>

      {/* Per-finding trace */}
      <ol className="sx-steps">
        {findings.map((f, i) => {
          const on = i < cursor;
          const isActive = i === cursor - 1;
          const meta = flagMeta(f.flag);
          return (
            <li
              key={`${f.flag}-${f.line}`}
              className={cx('sx-step', on && 'sx-step--on', isActive && 'sx-step--active')}
              aria-hidden={!on}
            >
              <span className={cx('sx-badge', meta.inStrict ? 'sx-badge--strict' : 'sx-badge--beyond')}>
                {meta.inStrict ? t(MSG.inStrict) : t(MSG.beyond)}
              </span>
              <code className="sx-step-flag">{f.flag}</code>
              <span className="sx-step-line dim">{t(MSG.line)} {f.line}</span>
              <code className="sx-step-err mono">{f.error}</code>
              <span className="sx-step-why dim">{t(FLAG_EXPLAIN[f.flag])}</span>
            </li>
          );
        })}
      </ol>

      {/* Result */}
      <div className={cx('sx-result', showResult && 'sx-result--on')}>
        <span className="sx-result-label dim">{showResult ? '' : t(MSG.stepping)}</span>
        <span className="sx-result-ty">
          {showResult ? `${t(MSG.summaryPre)} ${N} ${t(MSG.summaryPost)}.` : '…'}
        </span>
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
