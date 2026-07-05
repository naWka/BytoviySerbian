// Глобальное состояние: прогресс SRS, сохранённые карточки, статистика.
// Сохраняется на телефоне (AsyncStorage) — данные не теряются между запусками.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { gradeCard, makeKnown } from './srs';
import type { CardProgress, Grade } from './types';

const DAY = 24 * 60 * 60 * 1000;

export function dayKey(ts: number): string {
  const d = new Date(ts);
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

interface Stats {
  streak: number;
  lastDay: string;
  reviewsByDay: Record<string, number>;
  newByDay: Record<string, number>; // BS-18: сколько новых слов начато в этот день (дневной лимит)
  totalReviews: number;
}

const emptyStats: Stats = { streak: 0, lastDay: '', reviewsByDay: {}, newByDay: {}, totalReviews: 0 };

/** Сколько новых слов уже начато сегодня (для дневного лимита). */
export function newToday(stats: Stats, now = Date.now()): number {
  return stats.newByDay?.[dayKey(now)] ?? 0;
}

/** Часть состояния, которая синкается в облако (BS-22). */
export interface CloudState {
  progress: Record<string, CardProgress>;
  saved: Record<string, true>;
  suspended: Record<string, true>;
  stats: Stats;
}

interface AppState {
  progress: Record<string, CardProgress>;
  saved: Record<string, true>;
  suspended: Record<string, true>; // BS-18: слова, убранные из учёбы (можно вернуть)
  stats: Stats;
  _hydrated: boolean;
  hydrateFromCloud: (data: CloudState) => void; // BS-22: применить состояние из облака
  grade: (cardId: string, g: Grade) => void;
  markKnown: (cardId: string) => void;
  unmarkKnown: (cardId: string) => void;
  suspend: (cardId: string) => void; // «убрать слово» из учёбы
  unsuspend: (cardId: string) => void; // вернуть в учёбу
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
      suspended: {},
      stats: emptyStats,
      _hydrated: false,

      hydrateFromCloud: (data) =>
        set({
          progress: data.progress ?? {},
          saved: data.saved ?? {},
          suspended: data.suspended ?? {},
          stats: { ...emptyStats, ...(data.stats ?? {}) },
        }),

      grade: (cardId, g) => {
        const now = Date.now();
        const state = get();
        const wasNew = !state.progress[cardId]; // первое касание слова = «новое сегодня»
        const next = gradeCard(state.progress[cardId], g, now);

        const today = dayKey(now);
        const stats: Stats = {
          ...state.stats,
          reviewsByDay: { ...state.stats.reviewsByDay },
          newByDay: { ...state.stats.newByDay },
        };
        stats.reviewsByDay[today] = (stats.reviewsByDay[today] ?? 0) + 1;
        stats.totalReviews += 1;
        if (wasNew) stats.newByDay[today] = (stats.newByDay[today] ?? 0) + 1;
        if (stats.lastDay !== today) {
          const yesterday = dayKey(now - DAY);
          stats.streak = stats.lastDay === yesterday ? stats.streak + 1 : 1;
          stats.lastDay = today;
        }

        set({ progress: { ...state.progress, [cardId]: next }, stats });
      },

      markKnown: (cardId) =>
        set((s) => {
          const suspended = { ...s.suspended };
          delete suspended[cardId];
          return { progress: { ...s.progress, [cardId]: makeKnown(Date.now()) }, suspended };
        }),

      unmarkKnown: (cardId) =>
        set((s) => {
          const progress = { ...s.progress };
          delete progress[cardId];
          return { progress };
        }),

      suspend: (cardId) => set((s) => ({ suspended: { ...s.suspended, [cardId]: true } })),

      unsuspend: (cardId) =>
        set((s) => {
          const suspended = { ...s.suspended };
          delete suspended[cardId];
          return { suspended };
        }),

      toggleSaved: (cardId) =>
        set((s) => {
          const saved = { ...s.saved };
          if (saved[cardId]) delete saved[cardId];
          else saved[cardId] = true;
          return { saved };
        }),

      savedIds: () => Object.keys(get().saved),

      resetProgress: () => set({ progress: {}, suspended: {}, stats: emptyStats }),

      setHydrated: (v) => set({ _hydrated: v }),
    }),
    {
      name: 'bs-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ progress: s.progress, saved: s.saved, suspended: s.suspended, stats: s.stats }),
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
