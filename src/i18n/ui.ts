import type { Localized } from '../data/types';

/**
 * UI chrome strings (bilingual). Technical terms stay English in both languages.
 * Resolve with the `t()` helper from useLang(): t(ui.search).
 */
export const ui = {
  brandTitle: { en: 'TypeScript', uk: 'TypeScript' },
  brandSubtitle: { en: 'The Comprehensive Guide', uk: 'Вичерпний посібник' },

  search: { en: 'Search', uk: 'Пошук' },
  searchPlaceholder: { en: 'Search modules, topics & terms…', uk: 'Пошук модулів, тем і термінів…' },
  searchNoResults: { en: 'No matches', uk: 'Нічого не знайдено' },
  searchKindModule: { en: 'Module', uk: 'Модуль' },
  searchKindTopic: { en: 'Topic', uk: 'Тема' },
  searchKindGlossary: { en: 'Term', uk: 'Термін' },

  levelFilter: { en: 'Level', uk: 'Рівень' },
  allLevels: { en: 'All', uk: 'Усі' },
  beginner: { en: 'Beginner', uk: 'Beginner' },
  middle: { en: 'Middle', uk: 'Middle' },
  senior: { en: 'Senior', uk: 'Senior' },
  staff: { en: 'Staff', uk: 'Staff' },

  language: { en: 'Language', uk: 'Мова' },
  theme: { en: 'Theme', uk: 'Тема' },
  themeSystem: { en: 'System', uk: 'Системна' },
  themeDark: { en: 'Dark', uk: 'Темна' },
  themeLight: { en: 'Light', uk: 'Світла' },

  landscapeMap: { en: 'Overview', uk: 'Огляд' },
  mentalModels: { en: 'Mental Models', uk: 'Ментальні моделі' },
  glossary: { en: 'Glossary', uk: 'Глосарій' },

  // CHANGED (S9): polish routes — the #/decide picker + #/flashcards.
  decide: { en: 'Decide', uk: 'Порадник' },
  decideLede: {
    en: 'The real forks a TypeScript engineer hits — pick an option to see when to reach for it, and jump to the module that teaches it.',
    uk: 'Реальні розвилки TypeScript-інженера — оберіть варіант, щоб побачити, коли його брати, і перейти до модуля, що його навчає.',
  },
  decideChooseWhen: { en: 'Choose when', uk: 'Обирайте, коли' },
  decideBottomLine: { en: 'Bottom line', uk: 'Підсумок' },
  flashcards: { en: 'Flashcards', uk: 'Флешкартки' },
  flashcardsLede: {
    en: 'Active recall from the interview banks and key points — read the prompt, answer from memory, then flip.',
    uk: 'Активне пригадування з банків співбесід і ключових тез — прочитайте питання, дайте відповідь з памʼяті, тоді перегорніть.',
  },
  flashcardShow: { en: 'Show answer', uk: 'Показати відповідь' },
  flashcardHide: { en: 'Hide answer', uk: 'Сховати відповідь' },
  flashcardNext: { en: 'Next', uk: 'Далі' },
  flashcardPrev: { en: 'Previous', uk: 'Попередня' },
  flashcardShuffle: { en: 'Shuffle', uk: 'Перемішати' },
  flashcardAllModules: { en: 'All modules', uk: 'Усі модулі' },
  flashcardDeckEmpty: { en: 'No cards match this filter.', uk: 'Немає карток за цим фільтром.' },
  flashcardProgress: { en: 'of', uk: 'з' },
  startHere: { en: 'Start here', uk: 'Почати тут' },
  suggestedPath: { en: 'Suggested path', uk: 'Рекомендований шлях' },
  suggestedPathLede: {
    en: 'A guided route from the type system to type-level programming — skip ahead any time.',
    uk: 'Орієнтовний шлях від системи типів до type-level програмування — пропускайте вперед будь-коли.',
  },

  onThisPage: { en: 'On this page', uk: 'На цій сторінці' },
  keyPoints: { en: 'Key points', uk: 'Ключові тези' },
  pitfalls: { en: 'Pitfalls & misconceptions', uk: 'Пастки та хибні уявлення' },
  interview: { en: 'Interview questions', uk: 'Питання для співбесіди' },
  seeAlso: { en: 'See also', uk: 'Дивіться також' },
  sources: { en: 'Sources', uk: 'Джерела' },
  mentalModelLabel: { en: 'Mental model', uk: 'Ментальна модель' },
  readMins: { en: 'min read', uk: 'хв читання' },

  prevModule: { en: 'Previous', uk: 'Попередній' },
  nextModule: { en: 'Next', uk: 'Наступний' },
  markKnown: { en: 'Mark as known', uk: 'Позначити як вивчене' },
  known: { en: 'Known', uk: 'Вивчено' },

  comingSoon: { en: 'Content coming in a later session', uk: 'Контент зʼявиться в наступній сесії' },
  stubNote: {
    en: 'This module is part of the navigable skeleton. Its full content is authored in a later session per the roadmap.',
    uk: 'Цей модуль — частина навігаційного каркасу. Його повний зміст буде створено в наступній сесії згідно з планом.',
  },

  play: { en: 'Play', uk: 'Відтворити' },
  pause: { en: 'Pause', uk: 'Пауза' },
  reset: { en: 'Reset', uk: 'Скинути' },
  step: { en: 'Step', uk: 'Крок' },
  next: { en: 'Next', uk: 'Далі' },
  back: { en: 'Back', uk: 'Назад' },

  toggleSidebar: { en: 'Toggle navigation', uk: 'Перемкнути навігацію' },
  skipToContent: { en: 'Skip to content', uk: 'Перейти до вмісту' },

  footerRole: { en: 'Senior Fullstack Engineer', uk: 'Senior Fullstack Engineer' },
  footerCountry: { en: 'Ukraine', uk: 'Україна' },
  footerTagline: {
    en: 'Deep, interactive, bilingual guide to how TypeScript actually works.',
    uk: 'Глибокий інтерактивний двомовний посібник про те, як насправді працює TypeScript.',
  },
  builtWith: { en: 'Built with Vite · React · TypeScript', uk: 'Зроблено на Vite · React · TypeScript' },
  sectionsLabel: { en: 'sections', uk: 'розділів' },
  modulesLabel: { en: 'modules', uk: 'модулів' },
  simsLabel: { en: 'signature sims', uk: 'фірмових симуляцій' },
} satisfies Record<string, Localized>;

export type UiKey = keyof typeof ui;
