import { useEffect, useMemo, useState } from 'react';
import type { FlashKind } from '../../data/flashcards';
import { deck, deckModules } from '../../data/flashcards';
import type { Localized } from '../../data/types';
import { useLang } from '../../i18n/lang';
import { ui } from '../../i18n/ui';
import { hrefModule } from '../../lib/hashRouter';
import { cx } from '../../lib/utils';
import { LevelBadge } from '../module/LevelBadge';
import { Md } from '../module/Md';

/**
 * `#/flashcards` — active-recall deck (S9 polish). Cards are DERIVED from concepts.ts (interview banks,
 * key points, mental models — see data/flashcards.ts), so the deck never drifts from the content. Read
 * the prompt, answer from memory, then reveal. Filter by module and shuffle; keyboard: Space/Enter =
 * flip, ←/→ = navigate. The answer stays in the DOM (just `hidden`) so it is keyboard/SSR-addressable.
 */
const KIND_LABEL: Record<FlashKind, Localized> = {
  interview: { en: 'Interview', uk: 'Співбесіда' },
  'mental-model': { en: 'Mental model', uk: 'Ментальна модель' },
  'key-points': { en: 'Key points', uk: 'Ключові тези' },
};

// Small seeded PRNG so a shuffle is deterministic per seed (stable across re-renders until re-shuffled).
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(arr: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function FlashcardsPage() {
  const { t } = useLang();
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [seed, setSeed] = useState(0); // 0 = deck order; non-zero = shuffled with that seed
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const cards = useMemo(() => {
    const base = deck.filter((c) => moduleFilter === 'all' || c.moduleId === moduleFilter);
    return seed ? shuffle(base, seed) : base;
  }, [moduleFilter, seed]);

  // Reset position whenever the deck changes (filter or shuffle).
  useEffect(() => {
    setIdx(0);
    setRevealed(false);
  }, [moduleFilter, seed]);

  const card = cards[idx];

  const go = (delta: number) => {
    if (!cards.length) return;
    setIdx((i) => (i + delta + cards.length) % cards.length);
    setRevealed(false);
  };
  const flip = () => setRevealed((r) => !r);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      flip();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    }
  };

  return (
    <div className="content flashcards">
      <h1>{t(ui.flashcards)}</h1>
      <p className="muted fc-lede">{t(ui.flashcardsLede)}</p>

      <div className="fc-controls">
        <select
          className="fc-select"
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          aria-label={t(ui.flashcardAllModules)}
        >
          <option value="all">{t(ui.flashcardAllModules)}</option>
          {deckModules.map((m) => (
            <option key={m.id} value={m.id}>
              {String(m.num).padStart(2, '0')} · {t(m.title)}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={cx('btn', seed !== 0 && 'btn-on')}
          onClick={() => setSeed(seed ? 0 : (Date.now() >>> 0) || 1)}
          aria-pressed={!!seed}
        >
          ⇄ {t(ui.flashcardShuffle)}
        </button>
        <span className="fc-progress mono dim">
          {cards.length ? idx + 1 : 0} {t(ui.flashcardProgress)} {cards.length}
        </span>
      </div>

      {!card ? (
        <p className="muted">{t(ui.flashcardDeckEmpty)}</p>
      ) : (
        <>
          <div
            className="fc-card"
            style={{ ['--sec' as string]: card.accent }}
            tabIndex={0}
            role="group"
            aria-label={`${t(KIND_LABEL[card.kind])} — ${t(card.moduleTitle)}`}
            onKeyDown={onKeyDown}
          >
            <div className="fc-meta">
              <span className="fc-kind">{t(KIND_LABEL[card.kind])}</span>
              <a className="fc-modchip" href={hrefModule(card.moduleId)}>
                <span className="mono dim">{String(card.moduleNum).padStart(2, '0')}</span> {t(card.moduleTitle)}
              </a>
              {card.level && <LevelBadge level={card.level} />}
            </div>

            <Md className="fc-front" text={t(card.front)} />

            <button type="button" className="fc-flip" onClick={flip} aria-expanded={revealed}>
              {revealed ? t(ui.flashcardHide) : t(ui.flashcardShow)}
            </button>

            <div className="fc-answer" hidden={!revealed}>
              <Md className="fc-answer-body" text={t(card.back)} />
              <a className="fc-golink" href={hrefModule(card.moduleId)}>
                {t(ui.seeAlso)}: {t(card.moduleTitle)} →
              </a>
            </div>
          </div>

          <div className="fc-nav">
            <button type="button" className="btn" onClick={() => go(-1)}>
              ← {t(ui.flashcardPrev)}
            </button>
            <button type="button" className="btn btn-primary" onClick={flip}>
              {revealed ? t(ui.flashcardHide) : t(ui.flashcardShow)}
            </button>
            <button type="button" className="btn" onClick={() => go(1)}>
              {t(ui.flashcardNext)} →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
