import { Suspense, lazy, useEffect, useRef } from 'react';
import { Footer } from './components/layout/Footer';
import { ProgressBar } from './components/layout/ProgressBar';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { useLang } from './i18n/lang';
import { ui } from './i18n/ui';
import { useRoute } from './lib/hashRouter';

// Route-level lazy loading — pages load on demand; TopBar/Sidebar/Footer stay eager.
const LandscapeMap = lazy(() => import('./components/map/LandscapeMap').then((m) => ({ default: m.LandscapeMap })));
const ModulePage = lazy(() => import('./components/module/ModulePage').then((m) => ({ default: m.ModulePage })));
const GlossaryPage = lazy(() => import('./components/pages/GlossaryPage').then((m) => ({ default: m.GlossaryPage })));
const MentalModelsPage = lazy(() => import('./components/pages/MentalModelsPage').then((m) => ({ default: m.MentalModelsPage })));
// CHANGED (S9): polish routes — the #/decide picker + #/flashcards active-recall deck.
const DecidePage = lazy(() => import('./components/pages/DecidePage').then((m) => ({ default: m.DecidePage })));
const FlashcardsPage = lazy(() => import('./components/pages/FlashcardsPage').then((m) => ({ default: m.FlashcardsPage })));

export function App() {
  const route = useRoute();
  const { t } = useLang();
  const firstRender = useRef(true);

  // Move focus to the main landmark on route change (not initial load) for keyboard/SR users.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    document.getElementById('main')?.focus();
  }, [route]);

  return (
    <div className="app">
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          const el = document.getElementById('main');
          el?.focus();
          el?.scrollIntoView();
        }}
      >
        {t(ui.skipToContent)}
      </a>
      <ProgressBar />
      <TopBar />
      <div className="app-body">
        <Sidebar />
        <main className="main-col" id="main" tabIndex={-1}>
          <Suspense fallback={<div className="content" style={{ padding: '2rem', color: 'var(--tx3)' }}>Loading…</div>}>
            {route.name === 'map' && <LandscapeMap />}
            {route.name === 'module' && <ModulePage moduleId={route.moduleId} topicId={route.topicId} />}
            {route.name === 'mentalModels' && <MentalModelsPage />}
            {route.name === 'decide' && <DecidePage />}
            {route.name === 'flashcards' && <FlashcardsPage />}
            {route.name === 'glossary' && <GlossaryPage term={route.term} />}
          </Suspense>
          <Footer />
        </main>
      </div>
    </div>
  );
}
