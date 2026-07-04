// Глобальное состояние: прогресс SRS, сохранённые карточки, статистика.
// Сохраняется на телефоне (AsyncStorage) — данные не теряются между запусками.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { gradeCard, makeKnown, makeLearning } from './srs';
import type { CardProgress, Grade } from './types';

const DAY = 24 * 60 * 60 * 1000;

function dayKey(ts: number): string {
  const d = new Date(ts);
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

interface Stats {
  streak: number;
  lastDay: string;
  reviewsByDay: Record<string, number>;
  totalReviews: number;
}

const emptyStats: Stats = { streak: 0, lastDay: '', reviewsByDay: {}, totalReviews: 0 };

interface AppState {
  progress: Record<string, CardProgress>;
  saved: Record<string, true>;
  buried: Record<string, true>; // «позже»: отложенные при разборе слова
  stats: Stats;
  _hydrated: boolean;
  grade: (cardId: string, g: Grade) => void;
  markKnown: (cardId: string) => void;
  unmarkKnown: (cardId: string) => void;
  startLearning: (cardId: string) => void; // «учить»: взять слово в работу
  bury: (cardId: string) => void; // «позже»
  unbury: (cardId: string) => void; // вернуть из отложенных
  toggleSaved: (cardId: string) => void;
  savedIds: () => string[];
  resetProgress: () => void;
  setHydrated: (v: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      progress: {},
      saved: {},
      buried: {},
      stats: emptyStats,
      _hydrated: false,

      grade: (cardId, g) => {
        const now = Date.now();
        const state = get();
        const next = gradeCard(state.progress[cardId], g, now);

        const today = dayKey(now);
        const stats = { ...state.stats, reviewsByDay: { ...state.stats.reviewsByDay } };
        stats.reviewsByDay[today] = (stats.reviewsByDay[today] ?? 0) + 1;
        stats.totalReviews += 1;
        if (stats.lastDay !== today) {
          const yesterday = dayKey(now - DAY);
          stats.streak = stats.lastDay === yesterday ? stats.streak + 1 : 1;
          stats.lastDay = today;
        }

        set({ progress: { ...state.progress, [cardId]: next }, stats });
      },

      markKnown: (cardId) =>
        set((s) => {
          const buried = { ...s.buried };
          delete buried[cardId];
          return { progress: { ...s.progress, [cardId]: makeKnown(Date.now()) }, buried };
        }),

      unmarkKnown: (cardId) =>
        set((s) => {
          const progress = { ...s.progress };
          delete progress[cardId];
          return { progress };
        }),

      startLearning: (cardId) =>
        set((s) => {
          const buried = { ...s.buried };
          delete buried[cardId];
          return { progress: { ...s.progress, [cardId]: makeLearning(Date.now()) }, buried };
        }),

      bury: (cardId) =>
        set((s) => ({ buried: { ...s.buried, [cardId]: true } })),

      unbury: (cardId) =>
        set((s) => {
          const buried = { ...s.buried };
          delete buried[cardId];
          return { buried };
        }),

      toggleSaved: (cardId) =>
        set((s) => {
          const saved = { ...s.saved };
          if (saved[cardId]) delete saved[cardId];
          else saved[cardId] = true;
          return { saved };
        }),

      savedIds: () => Object.keys(get().saved),

      resetProgress: () => set({ progress: {}, buried: {}, stats: emptyStats }),

      setHydrated: (v) => set({ _hydrated: v }),
    }),
    {
      name: 'bs-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ progress: s.progress, saved: s.saved, buried: s.buried, stats: s.stats }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);

/** Актуальная серия дней (сбрасывается, если пропустил вчерашний день). */
export function currentStreak(stats: Stats): number {
  if (!stats.lastDay) return 0;
  const today = dayKey(Date.now());
  const yesterday = dayKey(Date.now() - DAY);
  if (stats.lastDay === today || stats.lastDay === yesterday) return stats.streak;
  return 0;
}
