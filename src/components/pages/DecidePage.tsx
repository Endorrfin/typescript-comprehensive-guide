import { useState } from 'react';
import type { Decision } from '../../data/decide';
import { decisions } from '../../data/decide';
import { getModule, getSection } from '../../data/meta'; // light index — keeps the picker out of the concepts chunk
import { useLang } from '../../i18n/lang';
import { ui } from '../../i18n/ui';
import { hrefModule } from '../../lib/hashRouter';
import { cx } from '../../lib/utils';
import { MdInline } from '../module/Md';

/**
 * `#/decide` — a curated "which feature / which config" picker (S9 polish). Each decision is a small
 * chooser: select an option to see when to reach for it, with a deep-link to the module that teaches it.
 * Data lives in src/data/decide.ts; module number/title + section accent come from the light meta index.
 */
export function DecidePage() {
  const { t } = useLang();
  return (
    <div className="content decide">
      <h1>{t(ui.decide)}</h1>
      <p className="muted decide-lede">{t(ui.decideLede)}</p>
      <div className="decide-list">
        {decisions.map((d) => (
          <DecisionCard key={d.id} decision={d} />
        ))}
      </div>
    </div>
  );
}

function DecisionCard({ decision }: { decision: Decision }) {
  const { t } = useLang();
  const [sel, setSel] = useState(0);
  const accent = getSection(decision.section)?.accent ?? 'var(--accent)';
  const chosen = decision.options[sel];
  const mod = getModule(chosen.moduleId);

  return (
    <section className="decide-card" style={{ ['--sec' as string]: accent }}>
      <h2 className="decide-q">{t(decision.question)}</h2>
      <p className="decide-hint">
        <MdInline text={t(decision.hint)} />
      </p>

      <div className="decide-opts" role="radiogroup" aria-label={t(decision.question)}>
        {decision.options.map((o, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={i === sel}
            className={cx('decide-opt', i === sel && 'on')}
            onClick={() => setSel(i)}
          >
            <MdInline text={t(o.label)} />
          </button>
        ))}
      </div>

      <div className="decide-detail">
        <p className="decide-when">
          <span className="decide-tag">{t(ui.decideChooseWhen)}</span>{' '}
          <MdInline text={t(chosen.when)} />
        </p>
        {mod && (
          <a className="decide-golink" href={hrefModule(chosen.moduleId, chosen.topicId)}>
            <span className="mono dim">{String(mod.num).padStart(2, '0')}</span>
            <span>{t(mod.title)}</span>
            <span aria-hidden="true">→</span>
          </a>
        )}
      </div>

      <p className="decide-bottom">
        <span className="decide-tag decide-tag--sum">{t(ui.decideBottomLine)}</span>{' '}
        <MdInline text={t(decision.bottomLine)} />
      </p>
    </section>
  );
}
