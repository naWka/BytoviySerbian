// Логика вкладки «Учить» (BS-17): отбор новых слов, очередь сессии, счётчики.
// Работает только со словами из колод (content.words). Чистые функции.
import { content } from './content';
import { statusOf } from './srs';
import type { Card, CardProgress } from './types';

type Progress = Record<string, CardProgress | undefined>;
type IdSet = Record<string, true | undefined>;

const BATCH = 10; // размер пачки разбора

/** Слово «новое для разбора»: нет прогресса и не отложено. */
function isNew(id: string, progress: Progress, buried: IdSet): boolean {
  return !progress[id] && !buried[id];
}

/**
 * Пачка новых слов для разбора: перемешиваем темы (round-robin по колодам),
 * чтобы за раз шли слова из разных тем, а не одна колода подряд.
 */
export function newWordQueue(progress: Progress, buried: IdSet, limit = BATCH): Card[] {
  const byDeck = content.decks.map((d) => d.cards.filter((card) => isNew(card.id, progress, buried)));
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

/** Очередь учебной сессии: слова, которым пора повтор (без новых). Самые давние — первыми. */
export function dueWordQueue(progress: Progress, now: number): Card[] {
  const due: { card: Card; due: number }[] = [];
  for (const card of content.words) {
    const p = progress[card.id];
    if (p && p.due <= now) due.push({ card, due: p.due });
  }
  due.sort((a, b) => a.due - b.due);
  return due.map((d) => d.card);
}

/** Отложенные слова («позже»). */
export function buriedWords(buried: IdSet): Card[] {
  return content.words.filter((card) => buried[card.id]);
}

export interface LearnCounts {
  totalWords: number;
  toTriage: number; // новых, ждут разбора
  due: number; // пора повторить
  learning: number; // в работе (не выучено)
  mastered: number; // выучено
  buried: number; // отложено
}

/** Сводка вкладки «Учить». */
export function learnCounts(progress: Progress, buried: IdSet, now: number): LearnCounts {
  const counts: LearnCounts = { totalWords: content.words.length, toTriage: 0, due: 0, learning: 0, mastered: 0, buried: 0 };
  for (const card of content.words) {
    if (buried[card.id]) {
      counts.buried += 1;
      continue;
    }
    const p = progress[card.id];
    if (!p) {
      counts.toTriage += 1;
      continue;
    }
    const st = statusOf(p);
    if (st === 'mastered') counts.mastered += 1;
    else counts.learning += 1;
    if (p.due <= now) counts.due += 1;
  }
  return counts;
}
