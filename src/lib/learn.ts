// Логика вкладки «Учить» (BS-18): единый поток занятия и счётчики.
// Работает только со словами из колод (content.words). Чистые функции.
import { content } from './content';
import { statusOf } from './srs';
import type { Card, CardProgress } from './types';

type Progress = Record<string, CardProgress | undefined>;
type IdSet = Record<string, true | undefined>;

export const NEW_PER_DAY = 10; // дневной лимит новых слов

/** Слово «новое»: нет прогресса и не убрано из учёбы. */
function isNewCandidate(id: string, progress: Progress, suspended: IdSet): boolean {
  return !progress[id] && !suspended[id];
}

/** Round-robin по колодам: берём по одному слову из каждой темы по кругу, пока не наберём limit. */
function roundRobin(byDeck: Card[][], limit: number): Card[] {
  const out: Card[] = [];
  let added = true;
  for (let i = 0; added && out.length < limit; i++) {
    added = false;
    for (const cards of byDeck) {
      if (i < cards.length) {
        out.push(cards[i]);
        added = true;
        if (out.length >= limit) break;
      }
    }
  }
  return out;
}

/** Перемешать карточки по темам (round-robin по groupId), сохраняя порядок внутри темы. */
function interleaveByGroup(cards: Card[]): Card[] {
  const groups = new Map<string, Card[]>();
  const order: string[] = [];
  for (const c of cards) {
    let arr = groups.get(c.groupId);
    if (!arr) {
      arr = [];
      groups.set(c.groupId, arr);
      order.push(c.groupId);
    }
    arr.push(c);
  }
  const out: Card[] = [];
  let remaining = true;
  while (remaining) {
    remaining = false;
    for (const g of order) {
      const arr = groups.get(g)!;
      const next = arr.shift();
      if (next) {
        out.push(next);
        remaining = true;
      }
    }
  }
  return out;
}

/**
 * Единая очередь занятия (BS-18): просроченные (due) + новые слова
 * (не больше остатка дневного лимита), перемешанные по темам.
 * BS-23: слова, помеченные «Знаю ✓» (progress.known), в очередь не попадают вовсе;
 * «пропущенные» (skipped) уходят стабильно в самый хвост — показываются последними.
 */
export function sessionQueue(
  progress: Progress,
  suspended: IdSet,
  skipped: IdSet,
  newDoneToday: number,
  now: number,
  newLimit = NEW_PER_DAY,
): Card[] {
  const newAllowed = Math.max(0, newLimit - newDoneToday);

  // Новые: round-robin по колодам, в пределах остатка лимита.
  const newByDeck = content.decks.map((d) => d.cards.filter((card) => isNewCandidate(card.id, progress, suspended)));
  const fresh = roundRobin(newByDeck, newAllowed);

  // Просроченные (без убранных и без «Знаю ✓»), самые давние первыми.
  const due: { card: Card; due: number }[] = [];
  for (const card of content.words) {
    if (suspended[card.id]) continue;
    const p = progress[card.id];
    if (p && !p.known && p.due <= now) due.push({ card, due: p.due });
  }
  due.sort((a, b) => a.due - b.due);

  // Внутри темы сперва идёт повторение, затем новые; всё перемешиваем по темам.
  const queue = interleaveByGroup([...due.map((d) => d.card), ...fresh]);

  // BS-23: пропущенные — в хвост очереди (самый низкий приоритет), порядок сохраняем.
  const active = queue.filter((card) => !skipped[card.id]);
  const later = queue.filter((card) => skipped[card.id]);
  return [...active, ...later];
}

/** Убранные из учёбы слова (BS-18). */
export function suspendedWords(suspended: IdSet): Card[] {
  return content.words.filter((card) => suspended[card.id]);
}

// ─────────────────────────────────────────────────────────────────────────
// BS-29/BS-30: режимы «Смотрю» (набор словаря) и «Учу» (упражнения по словарю).
// ─────────────────────────────────────────────────────────────────────────

/** Слова личного словаря (BS-29). */
export function dictionaryCards(dictionary: IdSet): Card[] {
  return content.words.filter((card) => dictionary[card.id]);
}

/**
 * BS-29 «Смотрю»: кандидаты для листания — слова, которых ещё НЕТ в словаре
 * и которые не помечены «знаю навсегда». deckId=null → из всех тем (перемешанный поток).
 */
export function browseCandidates(deckId: string | null, dictionary: IdSet, progress: Progress): Card[] {
  const src = deckId ? content.cardsOf('deck', deckId) : content.words;
  return src.filter((card) => !dictionary[card.id] && !progress[card.id]?.known);
}

/** Пул одной темы (для счётчиков/совместимости). */
export function browsePool(deckId: string, dictionary: IdSet, progress: Progress, size = 20): Card[] {
  return browseCandidates(deckId, dictionary, progress).slice(0, size);
}

/** Сколько в теме ещё можно «насмотреть» (не в словаре, не «знаю»). */
export function browseRemaining(deckId: string, dictionary: IdSet, progress: Progress): number {
  return content.cardsOf('deck', deckId).filter((card) => !dictionary[card.id] && !progress[card.id]?.known).length;
}

/**
 * BS-30 «Учу»: очередь занятия ТОЛЬКО из личного словаря.
 * Просроченные (due) + новые слова словаря (в пределах дневного лимита), перемешаны по темам.
 * Слова «Знаю ✓» (known) не берём.
 */
export function studyQueue(
  dictionary: IdSet,
  progress: Progress,
  newDoneToday: number,
  now: number,
  newLimit = NEW_PER_DAY,
): Card[] {
  const cards = dictionaryCards(dictionary);
  const newAllowed = Math.max(0, newLimit - newDoneToday);

  const fresh: Card[] = [];
  const due: { card: Card; due: number }[] = [];
  for (const card of cards) {
    const p = progress[card.id];
    if (!p) fresh.push(card);
    else if (!p.known && p.due <= now) due.push({ card, due: p.due });
  }
  due.sort((a, b) => a.due - b.due);
  return interleaveByGroup([...due.map((d) => d.card), ...fresh.slice(0, newAllowed)]);
}

export interface StudyCounts {
  inDict: number; // всего в личном словаре
  due: number; // пора повторить
  newAvailable: number; // новых из словаря доступно сегодня
  newDoneToday: number;
  newLimit: number;
  sessionSize: number; // due + newAvailable
  learning: number; // учу (не выучено)
  mastered: number; // выучено
}

/** Сводка для «Учу» по личному словарю (BS-30). */
export function studyCounts(dictionary: IdSet, progress: Progress, newDoneToday: number, now: number): StudyCounts {
  const cards = dictionaryCards(dictionary);
  let due = 0;
  let learning = 0;
  let mastered = 0;
  let totalNew = 0;
  for (const card of cards) {
    const p = progress[card.id];
    if (!p) {
      totalNew += 1;
      continue;
    }
    if (statusOf(p) === 'mastered') mastered += 1;
    else learning += 1;
    if (!p.known && p.due <= now) due += 1;
  }
  const newRemaining = Math.max(0, NEW_PER_DAY - newDoneToday);
  const newAvailable = Math.min(totalNew, newRemaining);
  return {
    inDict: cards.length,
    due,
    newAvailable,
    newDoneToday,
    newLimit: NEW_PER_DAY,
    sessionSize: due + newAvailable,
    learning,
    mastered,
  };
}

export interface LearnCounts {
  totalWords: number;
  due: number; // пора повторить
  newAvailable: number; // новых можно взять сегодня (с учётом лимита)
  newDoneToday: number; // уже начато сегодня
  newLimit: number; // дневной лимит
  sessionSize: number; // сколько будет в занятии сейчас (due + newAvailable)
  learning: number; // в работе (не выучено)
  mastered: number; // выучено
  suspended: number; // убрано из учёбы
}

/** Сводка вкладки «Учить». */
export function learnCounts(progress: Progress, suspended: IdSet, newDoneToday: number, now: number): LearnCounts {
  let due = 0;
  let learning = 0;
  let mastered = 0;
  let suspendedCount = 0;
  let totalNew = 0;

  for (const card of content.words) {
    if (suspended[card.id]) {
      suspendedCount += 1;
      continue;
    }
    const p = progress[card.id];
    if (!p) {
      totalNew += 1;
      continue;
    }
    const st = statusOf(p);
    if (st === 'mastered') mastered += 1;
    else learning += 1;
    if (p.due <= now) due += 1;
  }

  const newRemaining = Math.max(0, NEW_PER_DAY - newDoneToday);
  const newAvailable = Math.min(totalNew, newRemaining);

  return {
    totalWords: content.words.length,
    due,
    newAvailable,
    newDoneToday,
    newLimit: NEW_PER_DAY,
    sessionSize: due + newAvailable,
    learning,
    mastered,
    suspended: suspendedCount,
  };
}
