// BS-18: учебные шаги (Anki learning steps) + SM-2-lite ядро для «дней».
// Чистые функции, без побочных эффектов.
import type { Card, CardProgress, CardSide, CardStatus, Grade } from './types';

const MIN = 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;
const MAX_EASE = 3.0;
const MASTER_INTERVAL = 21; // дней — считаем «выучено»

// Учебные шаги для новых и забытых слов: сначала короткие промежутки внутри занятия,
// только пройдя их слово выходит «на дни». Провал (again) возвращает к первому шагу.
const LEARNING_STEPS_MIN = [1, 10]; // ≈1 мин, затем ≈10 мин
const GRADUATING_DAYS = 1; // интервал после прохождения всех шагов на «помню»
const EASY_GRAD_DAYS = 4; // интервал, если сразу «легко»

// Зрелость для говорения (рус→серб): слово уже неплохо сидит.
const MATURE_REPS = 2;
const MATURE_INTERVAL_DAYS = 3;

const clampEase = (e: number) => Math.max(MIN_EASE, Math.min(MAX_EASE, e));

/** Фаза карточки: учебные шаги или «дни». Старые записи без phase выводятся из интервала. */
export function phaseOf(p: CardProgress | undefined): 'learning' | 'review' {
  if (!p) return 'learning';
  if (p.phase) return p.phase;
  return p.intervalDays >= 1 ? 'review' : 'learning';
}

/** Пересчитать состояние карточки после оценки. */
export function gradeCard(prev: CardProgress | undefined, grade: Grade, now: number): CardProgress {
  let ease = prev?.ease ?? DEFAULT_EASE;
  let reps = prev?.reps ?? 0;
  let lapses = prev?.lapses ?? 0;
  const phase = phaseOf(prev);

  // Результат «карточка на учебном шаге» (короткий промежуток внутри занятия).
  const learningResult = (step: number): CardProgress => {
    const mins = LEARNING_STEPS_MIN[Math.min(step, LEARNING_STEPS_MIN.length - 1)];
    return {
      ease,
      intervalDays: (mins * MIN) / DAY,
      reps,
      lapses,
      phase: 'learning',
      step,
      due: now + mins * MIN,
      last: now,
    };
  };
  // Результат «карточка вышла на дни».
  const reviewResult = (intervalDays: number): CardProgress => ({
    ease,
    intervalDays,
    reps,
    lapses,
    phase: 'review',
    step: 0,
    due: now + intervalDays * DAY,
    last: now,
  });

  if (phase === 'learning') {
    const step = prev?.step ?? 0;
    switch (grade) {
      case 'again':
        return learningResult(0);
      case 'hard':
        return learningResult(step); // повторить текущий шаг
      case 'good': {
        const nextStep = step + 1;
        if (nextStep >= LEARNING_STEPS_MIN.length) {
          reps += 1;
          return reviewResult(GRADUATING_DAYS); // прошёл все шаги → на дни
        }
        return learningResult(nextStep);
      }
      case 'easy':
        ease = clampEase(ease + 0.15);
        reps += 1;
        return reviewResult(EASY_GRAD_DAYS); // сразу «легко» → на дни
    }
  }

  // phase === 'review' (слово уже на днях)
  let intervalDays = prev?.intervalDays ?? GRADUATING_DAYS;
  switch (grade) {
    case 'again':
      ease = clampEase(ease - 0.2);
      lapses += 1;
      reps = 0;
      return learningResult(0); // провал повторения → назад в учебные шаги
    case 'hard':
      ease = clampEase(ease - 0.15);
      reps += 1;
      return reviewResult(Math.max(intervalDays + 1, intervalDays * 1.2));
    case 'good':
      reps += 1;
      return reviewResult(intervalDays * ease);
    case 'easy':
      ease = clampEase(ease + 0.15);
      reps += 1;
      return reviewResult(intervalDays * ease * 1.3);
  }

  return reviewResult(intervalDays); // недостижимо, для полноты типов
}

/** «Знаю ✓»: сразу пометить карточку выученной (следующий повтор — нескоро). */
export function makeKnown(now: number): CardProgress {
  return { ease: 2.6, intervalDays: 30, reps: 6, lapses: 0, phase: 'review', step: 0, due: now + 30 * DAY, last: now };
}

export function statusOf(p: CardProgress | undefined): CardStatus {
  if (!p) return 'new';
  if (phaseOf(p) === 'learning') return 'learning';
  if (p.intervalDays >= MASTER_INTERVAL) return 'mastered';
  return 'review';
}

/**
 * Сторона тренировки (BS-18):
 * - новые/свежие/забытые — узнавание (серб → перевод);
 * - зрелые (reps ≥ 2 и интервал ≥ 3 дней) — говорение (русский → вспомни серб.).
 * Провал (again) роняет слово в учебные шаги → оно снова тренируется на узнавание.
 */
export function sideOf(p: CardProgress | undefined): CardSide {
  if (!p) return 'recognize';
  if (phaseOf(p) === 'learning') return 'recognize';
  return p.reps >= MATURE_REPS && p.intervalDays >= MATURE_INTERVAL_DAYS ? 'produce' : 'recognize';
}

/** Карточка «пора повторить»: есть прогресс и срок наступил. */
export function isDue(p: CardProgress | undefined, now: number): boolean {
  return !!p && p.due <= now;
}

/**
 * Очередь на повторение: сначала просроченные (самые давние сверху),
 * затем — новые карточки, но не больше newLimit за сессию.
 * Используется экраном тренировки темы/сохранённого (review/[mode]).
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
