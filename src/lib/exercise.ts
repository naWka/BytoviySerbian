// BS-26 / BS-27: упражнения поверх карточек слов — без новых SRS-сущностей.
//  - cloze: пример-предложение с пропуском на месте изучаемого слова («вставь слово»);
//  - choices: варианты ответа для стороны «говорение» (выбор вместо самооценки).
// Чистые функции, детерминированные (никакого Math.random — порядок выводим из id).
import { content } from './content';
import type { Card } from './types';

// Детерминированный хеш строки → неотрицательное число (для «псевдослучайного», но стабильного порядка).
function seed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Сербское слово нормализуем для сравнения (без регистра, убираем пунктуацию по краям). */
function norm(w: string): string {
  return w.toLowerCase().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
}

export interface Cloze {
  before: string; // текст до пропуска
  after: string; // текст после пропуска
  answer: string; // слово, которое было в пропуске (как в предложении)
  ru: string; // перевод предложения
}

/**
 * BS-26: собрать «пропуск в предложении» из примера карточки.
 * Ищем вхождение сербского слова (card.sr) в примере и заменяем его на пропуск.
 * Возвращает null, если у карточки нет примера или слово в нём не встретилось
 * (например, слово в примере в другой форме — тогда cloze не показываем).
 */
export function clozeFor(card: Card): Cloze | null {
  const sentence = card.exampleSr;
  if (!sentence || !card.exampleRu) return null;
  const target = norm(card.sr);
  if (!target) return null;

  const tokens = sentence.split(/(\s+)/); // сохраняем пробелы, чтобы собрать обратно
  let hitIndex = -1;
  for (let i = 0; i < tokens.length; i++) {
    if (norm(tokens[i]) === target) {
      hitIndex = i;
      break;
    }
  }
  if (hitIndex === -1) return null;

  return {
    before: tokens.slice(0, hitIndex).join(''),
    after: tokens.slice(hitIndex + 1).join(''),
    answer: tokens[hitIndex],
    ru: card.exampleRu,
  };
}

/**
 * BS-27: варианты ответа для стороны «говорение».
 * Правильный — card.sr; остальные — из той же темы (при нехватке — из общего пула).
 * Порядок стабилен (выводится из id карточки), чтобы не «прыгал» при перерисовке.
 */
export function choicesFor(card: Card, count = 4): string[] {
  const correct = card.sr;
  const pool = content.cardsOf('deck', card.groupId).length >= count ? content.cardsOf('deck', card.groupId) : content.words;

  const s = seed(card.id);
  // Кандидаты в дистракторы: другие слова, не равные правильному.
  const others = pool.filter((x) => x.id !== card.id && x.sr !== correct);
  // Стабильно «перемешиваем» кандидатов сортировкой по хешу (id + seed).
  others.sort((a, b) => (seed(a.id + s) % 100000) - (seed(b.id + s) % 100000));

  const distractors: string[] = [];
  const usedSr = new Set([correct]);
  for (const o of others) {
    if (distractors.length >= count - 1) break;
    if (usedSr.has(o.sr)) continue;
    usedSr.add(o.sr);
    distractors.push(o.sr);
  }

  const options = [correct, ...distractors];
  // Стабильная позиция правильного ответа среди вариантов.
  options.sort((a, b) => (seed(a + card.id) % 100000) - (seed(b + card.id) % 100000));
  return options;
}

/**
 * Можно ли собирать слово из букв (BS-30): одно короткое слово.
 * Лимит 8 символов (фидбек владельца: длинные слова собирать неприятно) —
 * длиннее уходит на «выбор из 4».
 */
export const ASSEMBLE_MAX_LEN = 8;
export function canAssemble(word: string): boolean {
  const w = word.trim();
  return w.length >= 2 && w.length <= ASSEMBLE_MAX_LEN && !/\s/.test(w);
}

/**
 * BS-30 «сборка из букв»: буквы слова в стабильно перемешанном порядке.
 * Регистр приводим к нижнему (плитки), кроме случаев — оставляем как есть в слове.
 * Возвращает массив букв (с повторами). Детерминированно (порядок из самого слова).
 */
export function letterTiles(word: string): string[] {
  const letters = Array.from(word.trim());
  const s = seed(word);
  // стабильная перестановка: сортируем по хешу «буква+позиция+seed»
  return letters
    .map((ch, i) => ({ ch, k: seed(`${ch}#${i}#${s}`) }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.ch);
}
