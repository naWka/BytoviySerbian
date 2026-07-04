// Типы контента и прогресса.
// Контент лежит в content/*.json (черновики, сгенерированы+вычитаны AI).

/** Одна реплика собеседника («что услышишь») + как на неё среагировать. */
export interface RawWillHear {
  sr_cyrillic: string;
  sr_latin: string;
  pronunciation_ru: string;
  translation_ru: string;
  react_sr: string;
  react_pron: string;
  react_ru: string;
  false_friend_note: string;
}

/** Фраза пользователя «второго слоя» («чем ответить»). */
export interface RawYourPhrase {
  sr_cyrillic: string;
  sr_latin: string;
  pronunciation_ru: string;
  translation_ru: string;
  false_friend_note: string;
}

export interface RawScenario {
  id: string;
  title_ru: string;
  title_sr: string;
  role_for_ai: string;
  will_hear: RawWillHear[];
  your_phrases: RawYourPhrase[];
}

/** Пример употребления глагола + короткое «когда так говорят» (BS-16). */
export interface RawVerbExample {
  sr: string;
  ru: string;
  when: string;
}

export interface RawWord {
  sr_cyrillic: string;
  sr_latin: string;
  pronunciation_ru: string;
  translation_ru: string;
  example_sr?: string;
  example_ru?: string;
  false_friend_note: string;
  // BS-16: только у глаголов. Каждая форма — строка "кириллица · latin".
  present?: string[]; // 6 форм наст. времени: ja / ti / on-ona / mi / vi / oni
  past?: string[]; // 4 формы прош. времени: он / она / они (м) / они (ж)
  examples?: RawVerbExample[]; // 1–2 примера с переводом и «когда»
}

export interface RawDeck {
  id: string;
  title_ru: string;
  title_sr: string;
  words: RawWord[];
}

export type RawSosPhrase = RawYourPhrase;

// --- Нормализованная модель для UI и SRS ---

export type CardKind = 'hear' | 'say' | 'word' | 'sos';

/** Единая карточка: всё, что можно показать флэшкартой и учить через SRS. */
export interface Card {
  id: string; // стабильный: "sc:<scenario>:h:<i>" | "sc:<scenario>:s:<i>" | "vo:<deck>:<i>" | "sos:<i>"
  kind: CardKind;
  groupId: string; // id сценария/колоды, или 'sos'
  groupKind: 'scenario' | 'deck' | 'sos';
  groupTitleRu: string;
  sr: string;
  srLatin: string;
  pron: string;
  ru: string;
  note: string; // «ложный друг», может быть ''
  // только для kind === 'hear':
  reactSr?: string;
  reactPron?: string;
  reactRu?: string;
  // только для kind === 'word':
  exampleSr?: string;
  exampleRu?: string;
  // только для глаголов (BS-16):
  present?: string[]; // 6 форм наст. времени
  past?: string[]; // 4 формы прош. времени
  examples?: { sr: string; ru: string; when: string }[];
}

export interface ScenarioView {
  id: string;
  titleRu: string;
  titleSr: string;
  role: string;
  hear: Card[];
  say: Card[];
}

export interface DeckView {
  id: string;
  titleRu: string;
  titleSr: string;
  cards: Card[];
}

// --- Прогресс / SRS ---

/** Оценка ответа: чем выше, тем лучше знаешь. */
export type Grade = 'again' | 'hard' | 'good' | 'easy';

/** Состояние интервального повторения для одной карточки (SM-2-lite). */
export interface CardProgress {
  ease: number; // фактор лёгкости (>= 1.3)
  intervalDays: number; // текущий интервал
  due: number; // timestamp (ms) следующего повтора
  reps: number; // число успешных повторов подряд
  lapses: number; // сколько раз забыл
  last: number; // timestamp последнего ответа
}

/** Статус карточки для отображения прогресса. */
export type CardStatus = 'new' | 'learning' | 'review' | 'mastered';
