// Загрузка контента из content/ и нормализация в единые карточки (Card).
// BS-19: только колоды слов — ситуации и SOS убраны из продукта.
import { decks as rawDecks } from '../../content';
import type { Card, DeckView } from './types';

// BS-14: стабильный id карточки выводится из САМОГО текста (сербской фразы),
// а не из позиции в файле. Правка/вставка/перестановка слов в JSON не сдвигает id,
// поэтому прогресс SRS и «сохранённое» держатся за конкретным словом.
function hash36(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
}

const seen = new Set<string>();
function stableId(prefix: string, groupId: string, kind: string, sr: string): string {
  let id = `${prefix}:${groupId}:${kind}:${hash36(sr)}`;
  let n = 2;
  while (seen.has(id)) id = `${prefix}:${groupId}:${kind}:${hash36(sr)}-${n++}`;
  seen.add(id);
  return id;
}

const deckViews: DeckView[] = rawDecks.map((d) => ({
  id: d.id,
  titleRu: d.title_ru,
  titleSr: d.title_sr,
  cards: d.words.map((w) => ({
    id: stableId('vo', d.id, 'w', w.sr_cyrillic),
    kind: 'word',
    groupId: d.id,
    groupKind: 'deck',
    groupTitleRu: d.title_ru,
    sr: w.sr_cyrillic,
    srLatin: w.sr_latin,
    pron: w.pronunciation_ru,
    ru: w.translation_ru,
    note: w.false_friend_note ?? '',
    // У глаголов пример живёт в examples[]; берём первый как основной,
    // чтобы карточка сессии/повторения (FlipWordCard) тоже показывала пример.
    exampleSr: w.example_sr ?? w.examples?.[0]?.sr,
    exampleRu: w.example_ru ?? w.examples?.[0]?.ru,
    present: w.present,
    past: w.past,
    examples: w.examples,
  })),
}));

// Все карточки — это слова из колод (BS-19: продукт только про слова).
const wordCards: Card[] = deckViews.flatMap((d) => d.cards);

const cardById = new Map<string, Card>(wordCards.map((c) => [c.id, c]));
const deckById = new Map<string, DeckView>(deckViews.map((d) => [d.id, d]));

export const content = {
  decks: deckViews,
  all: wordCards,
  words: wordCards,
  getCard: (id: string) => cardById.get(id),
  getDeck: (id: string) => deckById.get(id),
  cardsOf: (_groupKind: 'deck', id: string): Card[] => {
    const d = deckById.get(id);
    return d ? d.cards : [];
  },
  totals: {
    decks: deckViews.length,
    cards: wordCards.length,
  },
};
