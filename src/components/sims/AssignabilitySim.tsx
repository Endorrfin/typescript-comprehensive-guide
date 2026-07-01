import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Localized } from '../../data/types';
import { useLang } from '../../i18n/lang';
import { ui } from '../../i18n/ui';
import { cx } from '../../lib/utils';
import { explain, renderTy, TYPES, typeById } from '../../lib/assignability';
import type { MemberStep, Ty } from '../../lib/assignability';

/*
 * ★ Structural-assignability checker (M1 sim).
 * The engine lives in src/lib/assignability.ts (pure + unit-tested). This component drives it:
 * pick a Source (A) and Target (B), then step through the member-by-member obligations — is every
 * member B requires satisfied by A? — ending in a verdict. Toggle "fresh object literal" to switch on
 * TypeScript's excess-property check; use ⇄ to swap A/B and watch assignability flip direction.
 * Play/pause/step/back/reset · ARIA live region · prefers-reduced-motion reveals everything at once.
 */

const L = (en: string, uk: string): Localized => ({ en, uk });

const MSG = {
  source: L('Source type (A)', 'Тип-джерело (A)'),
  target: L('Target type (B)', 'Цільовий тип (B)'),
  fresh: L('fresh object literal', 'свіжий обʼєктний літерал'),
  swap: L('Swap A ⇄ B', 'Поміняти A ⇄ B'),
  question: L('assignable to?', 'assignable до?'),
  requires: L('Target requires', 'Ціль вимагає'),
  has: L('source has', 'джерело має'),
  memberOk: L('assignable', 'assignable'),
  memberBad: L('not assignable', 'не assignable'),
  memberMissing: L('missing required member', 'бракує обовʼязкового члена'),
  memberOptional: L('optional — may be omitted', 'опційний — можна пропустити'),
  excessIgnored: L('extra — ignored by structural typing', 'зайвий — structural typing його ігнорує'),
  excessError: L('excess property — rejected on a fresh literal', 'excess property — відхилено на свіжому літералі'),
  verdictOk: L('is assignable to', 'is assignable до'),
  verdictBad: L('is NOT assignable to', 'НЕ assignable до'),
  whyShape: L('a required member is missing or has an incompatible type.', 'обовʼязкового члена бракує або він має несумісний тип.'),
  whyExcess: L('every member fits, but a fresh literal may not carry excess properties.', 'усі члени пасують, але свіжий літерал не може нести зайві властивості.'),
  whyOk: L('every member the target requires is satisfied by the source.', 'кожен член, який вимагає ціль, задоволений джерелом.'),
  result: L('Verdict', 'Вердикт'),
  stepOf: L('Step', 'Крок'),
  obligations: L('Obligations — for each member B requires, does A satisfy it?', 'Зобовʼязання — для кожного члена, що вимагає B, чи задовольняє його A?'),
};

/** The member list of an object type, or null for non-object types. */
function objMembers(ty: Ty): { name: string; text: string; optional: boolean }[] | null {
  if (ty.k !== 'object') return null;
  return ty.members.map((m) => ({ name: m.name, text: `${m.name}${m.optional ? '?' : ''}: ${renderTy(m.ty)}`, optional: !!m.optional }));
}

export function AssignabilitySim() {
  const { t, lang } = useLang();
  const [srcId, setSrcId] = useState('Dog');
  const [tgtId, setTgtId] = useState('Pet');
  const [fresh, setFresh] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const srcTy = typeById(srcId) ?? TYPES[0].ty;
  const tgtTy = typeById(tgtId) ?? TYPES[1].ty;
  const trace = useMemo(() => explain(srcTy, tgtTy, { fresh }), [srcTy, tgtTy, fresh]);

  // The walkthrough = target obligations, then any excess source members.
  const walk = useMemo<(MemberStep & { group: 'member' | 'excess' })[]>(
    () => [
      ...trace.steps.map((s) => ({ ...s, group: 'member' as const })),
      ...trace.excess.map((s) => ({ ...s, group: 'excess' as const })),
    ],
    [trace],
  );
  const N = walk.length;

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
  }, [srcId, tgtId, fresh, reduced, N]);

  useEffect(() => {
    if (!playing) return;
    if (cursor >= N) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setCursor((c) => Math.min(c + 1, N)), 1100);
    return () => window.clearTimeout(id);
  }, [playing, cursor, N]);

  const activeStep = cursor > 0 ? walk[cursor - 1] : undefined;
  const activeName = activeStep?.name;
  const showResult = cursor >= N;

  useEffect(() => {
    if (!liveRef.current) return;
    if (activeStep) {
      liveRef.current.textContent = `${activeStep.name}: ${activeStep.ok ? t(MSG.memberOk) : t(MSG.memberBad)}`;
    } else if (showResult) {
      liveRef.current.textContent = `${trace.a} ${trace.ok ? t(MSG.verdictOk) : t(MSG.verdictBad)} ${trace.b}`;
    }
  }, [cursor, activeStep, showResult, trace, t]);

  const step = useCallback(() => setCursor((c) => Math.min(c + 1, N)), [N]);
  const back = useCallback(() => setCursor((c) => Math.max(c - 1, 0)), []);
  const reset = useCallback(() => {
    setPlaying(false);
    setCursor(0);
  }, []);
  const swap = useCallback(() => {
    setSrcId((prevSrc) => {
      setTgtId(prevSrc);
      return tgtId;
    });
  }, [tgtId]);

  const srcMembers = objMembers(srcTy);
  const tgtMembers = objMembers(tgtTy);

  function outcomeText(s: MemberStep & { group: 'member' | 'excess' }): string {
    if (s.group === 'excess') return t(s.ok ? MSG.excessIgnored : MSG.excessError);
    if (s.code === 'member-missing') return t(MSG.memberMissing);
    if (s.code === 'member-optional-absent') return t(MSG.memberOptional);
    return t(s.ok ? MSG.memberOk : MSG.memberBad);
  }

  return (
    <div className="as-sim" aria-label="Structural assignability checker">
      {/* Controls */}
      <div className="as-controls">
        <label className="ct-field">
          <span className="ct-label dim">{t(MSG.source)}</span>
          <select value={srcId} onChange={(e) => setSrcId(e.target.value)} className="mono">
            {TYPES.map((x) => (
              <option key={x.id} value={x.id}>{x.id}</option>
            ))}
          </select>
        </label>
        <button className="btn as-swap" onClick={swap} aria-label={t(MSG.swap)} title={t(MSG.swap)}>⇄</button>
        <label className="ct-field">
          <span className="ct-label dim">{t(MSG.target)}</span>
          <select value={tgtId} onChange={(e) => setTgtId(e.target.value)} className="mono">
            {TYPES.map((x) => (
              <option key={x.id} value={x.id}>{x.id}</option>
            ))}
          </select>
        </label>
        <label className="as-fresh">
          <input type="checkbox" checked={fresh} onChange={(e) => setFresh(e.target.checked)} />
          <span className="mono">{t(MSG.fresh)}</span>
        </label>
      </div>

      {/* Type cards + the question */}
      <div className="as-cards">
        <TypeCard role="A" name={trace.aName ?? trace.a} members={srcMembers} activeName={activeName} fresh={fresh} />
        <div className="as-rel">
          <span className="as-rel-q dim">{t(MSG.question)}</span>
          <span className={cx('as-rel-arrow', showResult && (trace.ok ? 'as-ok' : 'as-bad'))}>
            {showResult ? (trace.ok ? '✓' : '✗') : '→'}
          </span>
        </div>
        <TypeCard role="B" name={trace.bName ?? trace.b} members={tgtMembers} activeName={activeName} />
      </div>

      {/* Obligations */}
      <p className="as-obl-head dim">{t(MSG.obligations)}</p>
      <ol className="as-steps">
        {walk.map((s, i) => {
          const revealed = i < cursor;
          const active = i === cursor - 1;
          return (
            <li
              key={`${s.group}-${s.name}-${i}`}
              className={cx('as-step', revealed && 'as-step--on', active && 'as-step--active', s.ok ? 'as-step--ok' : 'as-step--bad')}
              aria-hidden={!revealed}
            >
              <div className="as-step-claim mono">
                {s.group === 'excess' ? (
                  <span className="dim">{s.name}: {s.sourceTy}</span>
                ) : (
                  <>
                    <span className="dim">{t(MSG.requires)} </span>
                    <span className="as-accent">{s.name}: {s.targetTy}</span>
                    {s.sourceTy && (
                      <>
                        <span className="dim">  ·  {t(MSG.has)} </span>
                        <span>{s.name}: {s.sourceTy}</span>
                      </>
                    )}
                  </>
                )}
              </div>
              <span className={cx('as-flag', s.ok ? 'as-flag--ok' : 'as-flag--bad')}>
                {s.ok ? '✓' : '✗'} {outcomeText(s)}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Verdict */}
      <div className={cx('as-result', showResult && 'as-result--on', showResult && (trace.ok ? 'as-result--ok' : 'as-result--bad'))}>
        <span className="as-result-label dim">{t(MSG.result)}</span>
        {showResult ? (
          <p className="as-result-text">
            <code className="mono">{trace.a}</code>{' '}
            <strong>{trace.ok ? t(MSG.verdictOk) : t(MSG.verdictBad)}</strong>{' '}
            <code className="mono">{trace.b}</code>
            <span className="as-why dim"> — {trace.ok ? t(MSG.whyOk) : trace.code === 'member-excess' ? t(MSG.whyExcess) : t(MSG.whyShape)}</span>
          </p>
        ) : (
          <code className="as-result-text mono">…</code>
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

function TypeCard({
  role,
  name,
  members,
  activeName,
  fresh,
}: {
  role: 'A' | 'B';
  name: string;
  members: { name: string; text: string; optional: boolean }[] | null;
  activeName?: string;
  fresh?: boolean;
}) {
  return (
    <div className={cx('as-card', role === 'A' && fresh && 'as-card--fresh')}>
      <div className="as-card-head">
        <span className="as-card-role dim">{role}</span>
        <span className="as-card-name mono">{name}</span>
      </div>
      {members ? (
        <ul className="as-card-members">
          {members.map((m) => (
            <li key={m.name} className={cx('as-member mono', m.name === activeName && 'as-member--active')}>
              {m.text}
            </li>
          ))}
        </ul>
      ) : (
        <code className="mono dim">{name}</code>
      )}
    </div>
  );
}
