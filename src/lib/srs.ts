// SM-2-lite: интервальные повторения. Чистые функции, без побочных эффектов.
import type { Card, CardProgress, CardStatus, Grade } from './types';

const MIN = 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;
const MAX_EASE = 3.0;
const MASTER_INTERVAL = 21; // дней — считаем «выучено»

const clampEase = (e: number) => Math.max(MIN_EASE, Math.min(MAX_EASE, e));

/** Пересчитать состояние карточки после оценки. */
export function gradeCard(prev: CardProgress | undefined, grade: Grade, now: number): CardProgress {
  let ease = prev?.ease ?? DEFAULT_EASE;
  let intervalDays = prev?.intervalDays ?? 0;
  let reps = prev?.reps ?? 0;
  let lapses = prev?.lapses ?? 0;

  switch (grade) {
    case 'again':
      ease = clampEase(ease - 0.2);
      lapses += 1;
      reps = 0;
      intervalDays = MIN / DAY; // повторить почти сразу (в этой же сессии)
      break;
    case 'hard':
      ease = clampEase(ease - 0.15);
      reps += 1;
      intervalDays = intervalDays < 1 ? (10 * MIN) / DAY : intervalDays * 1.2;
      break;
    case 'good':
      reps += 1;
      intervalDays = intervalDays < 1 ? 1 : intervalDays * ease;
      break;
    case 'easy':
      ease = clampEase(ease + 0.15);
      reps += 1;
      intervalDays = intervalDays < 1 ? 3 : intervalDays * ease * 1.3;
      break;
  }

  return {
    ease,
    intervalDays,
    reps,
    lapses,
    due: now + intervalDays * DAY,
    last: now,
  };
}

/** «Знаю ✓»: сразу пометить карточку выученной (следующий повтор — нескоро). */
export function makeKnown(now: number): CardProgress {
  return { ease: 2.6, intervalDays: 30, reps: 6, lapses: 0, due: now + 30 * DAY, last: now };
}

/** «Учить»: взять слово в работу — доступно к повтору сразу (статус learning). */
export function makeLearning(now: number): CardProgress {
  return { ease: DEFAULT_EASE, intervalDays: 0, reps: 0, lapses: 0, due: now, last: now };
}

export function statusOf(p: CardProgress | undefined): CardStatus {
  if (!p) return 'new';
  if (p.intervalDays >= MASTER_INTERVAL) return 'mastered';
  if (p.intervalDays >= 1) return 'review';
  return 'learning';
}

/** Карточка «пора повторить»: есть прогресс и срок наступил. */
export function isDue(p: CardProgress | undefined, now: number): boolean {
  return !!p && p.due <= now;
}

/**
 * Очередь на повторение: сначала просроченные (самые давние сверху),
 * затем — новые карточки, но не больше newLimit за сессию.
 */
export function buildQueue(
  cards: Card[],
  progress: Record<string, CardProgress | undefined>,
  now: number,
  newLimit = 20,
): Card[] {
  const due: { card: Card; due: number }[] = [];
  const fresh: Card[] = [];
  for (const c of cards) {
    const p = progress[c.id];
    if (!p) fresh.push(c);
    else if (p.due <= now) due.push({ card: c, due: p.due });
  }
  due.sort((a, b) => a.due - b.due);
  return [...due.map((d) => d.card), ...fresh.slice(0, newLimit)];
}

export interface Summary {
  total: number;
  new: number;
  learning: number;
  review: number;
  mastered: number;
  due: number;
}

/** Сводка по набору карточек: сколько новых / учатся / на повторении / выучено / пора. */
export function summarize(
  cards: Card[],
  progress: Record<string, CardProgress | undefined>,
  now: number,
): Summary {
  const s: Summary = { total: cards.length, new: 0, learning: 0, review: 0, mastered: 0, due: 0 };
  for (const c of cards) {
    const p = progress[c.id];
    const st = statusOf(p);
    s[st] += 1;
    if (isDue(p, now)) s.due += 1;
  }
  return s;
}

/** Короткая подпись «когда снова» для кнопки оценки. */
export function previewLabel(prev: CardProgress | undefined, grade: Grade): string {
  const next = gradeCard(prev, grade, 0);
  const d = next.intervalDays;
  if (d < 1 / 24) return `${Math.max(1, Math.round(d * 24 * 60))} мин`;
  if (d < 1) return `${Math.round(d * 24)} ч`;
  if (d < 30) return `${Math.round(d)} дн`;
  return `${Math.round(d / 30)} мес`;
}
