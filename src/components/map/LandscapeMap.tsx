import { COUNTS, modulesBySection, sections } from '../../data/concepts';
import { useLang } from '../../i18n/lang';
import { ui } from '../../i18n/ui';
import { hrefModule } from '../../lib/hashRouter';
import { cx } from '../../lib/utils';

/** Landing overview — hero + section grid with module cards. The golden (signature) module is starred. */
export function LandscapeMap() {
  const { t } = useLang();
  return (
    <div className="content map">
      <section className="hero">
        <p className="hero-kicker mono dim">Vite · React · TypeScript</p>
        <h1 className="hero-title">{t(ui.brandTitle)}</h1>
        <p className="hero-lede">
          {t({
            en: 'A deep, interactive, bilingual guide to how TypeScript actually works — from the structural type system to type-level programming, your applied stack, and the compiler.',
            uk: 'Глибокий інтерактивний двомовний посібник про те, як насправді працює TypeScript — від структурної системи типів до type-level програмування, вашого прикладного стеку та компілятора.',
          })}
        </p>
        <p className="hero-stats dim">
          {COUNTS.sections} {t(ui.sectionsLabel)} · {COUNTS.modules} {t(ui.modulesLabel)} · {COUNTS.sims}{' '}
          {t(ui.simsLabel)}
        </p>
      </section>

      <div className="map-sections">
        {sections.map((s) => {
          const mods = modulesBySection(s.id);
          return (
            <section className="map-section" key={s.id} style={{ ['--sec' as string]: s.accent }}>
              <header className="map-section-head">
                <span className="map-roman" style={{ color: s.accent }}>
                  {s.roman}
                </span>
                <div>
                  <h2>{t(s.title)}</h2>
                  {s.blurb && <p className="muted">{t(s.blurb)}</p>}
                </div>
              </header>
              <div className="map-cards">
                {mods.map((m) => (
                  <a
                    className={cx('map-card', m.signature && 'map-card--star')}
                    href={hrefModule(m.id)}
                    key={m.id}
                    style={{ ['--sec' as string]: s.accent }}
                  >
                    <span className="map-card-num mono dim">{String(m.num).padStart(2, '0')}</span>
                    <span className="map-card-body">
                      <span className="map-card-title">
                        {t(m.title)}
                        {m.signature && <span className="map-card-star"> ★</span>}
                      </span>
                      <span className="map-card-tag dim">{t(m.tagline)}</span>
                    </span>
                    <span className="chip badge-level" data-level={m.level}>
                      {t(ui[m.level])}
                    </span>
                  </a>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
