// Загрузка контента из content/ и нормализация в единые карточки (Card).
import { decks as rawDecks, scenarios as rawScenarios, sosPhrases as rawSos } from '../../content';
import type { Card, DeckView, ScenarioView } from './types';

const SOS_TITLE = '🆘 SOS-фразы';

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

const scenarioViews: ScenarioView[] = rawScenarios.map((s) => ({
  id: s.id,
  titleRu: s.title_ru,
  titleSr: s.title_sr,
  role: s.role_for_ai,
  hear: s.will_hear.map((w) => ({
    id: stableId('sc', s.id, 'h', w.sr_cyrillic),
    kind: 'hear',
    groupId: s.id,
    groupKind: 'scenario',
    groupTitleRu: s.title_ru,
    sr: w.sr_cyrillic,
    srLatin: w.sr_latin,
    pron: w.pronunciation_ru,
    ru: w.translation_ru,
    note: w.false_friend_note ?? '',
    reactSr: w.react_sr,
    reactPron: w.react_pron,
    reactRu: w.react_ru,
  })),
  say: s.your_phrases.map((p) => ({
    id: stableId('sc', s.id, 's', p.sr_cyrillic),
    kind: 'say',
    groupId: s.id,
    groupKind: 'scenario',
    groupTitleRu: s.title_ru,
    sr: p.sr_cyrillic,
    srLatin: p.sr_latin,
    pron: p.pronunciation_ru,
    ru: p.translation_ru,
    note: p.false_friend_note ?? '',
  })),
}));

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

const sosCards: Card[] = rawSos.map((p) => ({
  id: stableId('sos', 'sos', 'x', p.sr_cyrillic),
  kind: 'sos',
  groupId: 'sos',
  groupKind: 'sos',
  groupTitleRu: SOS_TITLE,
  sr: p.sr_cyrillic,
  srLatin: p.sr_latin,
  pron: p.pronunciation_ru,
  ru: p.translation_ru,
  note: p.false_friend_note ?? '',
}));

// Только слова из колод — очередь вкладки «Учить» работает с ними (BS-17).
const wordCards: Card[] = deckViews.flatMap((d) => d.cards);

const allCards: Card[] = [
  ...scenarioViews.flatMap((s) => [...s.hear, ...s.say]),
  ...wordCards,
  ...sosCards,
];

const cardById = new Map<string, Card>(allCards.map((c) => [c.id, c]));
const scenarioById = new Map<string, ScenarioView>(scenarioViews.map((s) => [s.id, s]));
const deckById = new Map<string, DeckView>(deckViews.map((d) => [d.id, d]));

export const content = {
  scenarios: scenarioViews,
  decks: deckViews,
  sos: sosCards,
  all: allCards,
  words: wordCards,
  getCard: (id: string) => cardById.get(id),
  getScenario: (id: string) => scenarioById.get(id),
  getDeck: (id: string) => deckById.get(id),
  cardsOf: (groupKind: 'scenario' | 'deck' | 'sos', id: string): Card[] => {
    if (groupKind === 'sos') return sosCards;
    if (groupKind === 'scenario') {
      const s = scenarioById.get(id);
      return s ? [...s.hear, ...s.say] : [];
    }
    const d = deckById.get(id);
    return d ? d.cards : [];
  },
  totals: {
    scenarios: scenarioViews.length,
    decks: deckViews.length,
    cards: allCards.length,
  },
};
