// Типы контента и прогресса.
// Контент лежит в content/vocab/*.json — колоды слов (черновики, сгенерированы+вычитаны AI).
// Ситуации и SOS убраны из продукта (BS-19): продукт про запоминание слов.

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

// --- Нормализованная модель для UI и SRS ---

export type CardKind = 'word';

/** Единая карточка слова: то, что показывается флэшкартой и учится через SRS. */
export interface Card {
  id: string; // стабильный, выводится из текста слова: "vo:<deck>:w:<hash>"
  kind: CardKind;
  groupId: string; // id колоды
  groupKind: 'deck';
  groupTitleRu: string;
  sr: string;
  srLatin: string;
  pron: string;
  ru: string;
  note: string; // «ложный друг», может быть ''
  exampleSr?: string;
  exampleRu?: string;
  // только для глаголов (BS-16):
  present?: string[]; // 6 форм наст. времени
  past?: string[]; // 4 формы прош. времени
  examples?: { sr: string; ru: string; when: string }[];
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

/** Состояние интервального повторения для одной карточки (SM-2-lite + учебные шаги, BS-18). */
export interface CardProgress {
  ease: number; // фактор лёгкости (>= 1.3)
  intervalDays: number; // текущий интервал
  due: number; // timestamp (ms) следующего повтора
  reps: number; // число успешных повторов подряд
  lapses: number; // сколько раз забыл
  last: number; // timestamp последнего ответа
  // BS-18: учебные шаги (Anki learning steps).
  // 'learning' — слово в коротких шагах (≈1 мин / 10 мин), ещё не вышло на дни;
  // 'review' — слово уже на днях. Старые записи без phase выводятся из intervalDays.
  phase?: 'learning' | 'review';
  step?: number; // индекс текущего учебного шага (когда phase === 'learning')
}

/** Статус карточки для отображения прогресса. */
export type CardStatus = 'new' | 'learning' | 'review' | 'mastered';

/** Сторона тренировки карточки (BS-18): узнавание (серб→рус) или говорение (рус→серб). */
export type CardSide = 'recognize' | 'produce';
