// Палитра и токены оформления. Светлая и тёмная тема.
import '@/global.css';

import { Platform, type ViewStyle } from 'react-native';

// Палитра «тёплая бумага + терракота + мёд». Нейтрали тонированы в тёплый оттенок,
// акцент — терракота, вторичный тёплый — медовый (для градиентов и серии). См. docs/DESIGN.md.
export const Colors = {
  light: {
    text: '#241C15',
    textSecondary: '#6E6053',
    textMuted: '#9E9082',
    background: '#F6EFE4',
    surface: '#FFFDF9',
    surfaceAlt: '#F0E6D6',
    border: '#E7D9C5',

    primary: '#C0562B', // терракота
    primarySoft: '#F8E3D5',
    onPrimary: '#FFF9F4',

    accent: '#E0972A', // медовый (вторичный тёплый)
    accentSoft: '#F8EBCF',

    hear: '#6D5AE0', // «что услышишь»
    hearSoft: '#ECE7FB',
    say: '#2E9E6B', // «чем ответить» / «знаю»
    saySoft: '#DBEFE2',
    sos: '#D2483F',
    sosSoft: '#F8E1DB',

    snooze: '#B08544', // «позже»
    snoozeSoft: '#F2E7D0',

    star: '#E0972A',
    warning: '#C77A1E',

    gradeAgain: '#D2483F',
    gradeHard: '#D08322',
    gradeGood: '#2E9E6B',
    gradeEasy: '#2E82A0',

    shadow: '#5A3A22', // тёплая коричневая тень (не серая)
  },
  dark: {
    text: '#F4ECE1',
    textSecondary: '#C3B4A3',
    textMuted: '#8A7B6B',
    background: '#14100C',
    surface: '#221A13',
    surfaceAlt: '#2E241B',
    border: '#3A2E23',

    primary: '#E88B5A', // коралл-терракота
    primarySoft: '#3B291C',
    onPrimary: '#1F1108',

    accent: '#EEAE4E', // медовый
    accentSoft: '#372A17',

    hear: '#A594F5',
    hearSoft: '#2A2340',
    say: '#4FC28A',
    saySoft: '#173026',
    sos: '#F0736A',
    sosSoft: '#391E1A',

    snooze: '#D6A659',
    snoozeSoft: '#33281A',

    star: '#EEAE4E',
    warning: '#E5A04A',

    gradeAgain: '#F0736A',
    gradeHard: '#E5A04A',
    gradeGood: '#4FC28A',
    gradeEasy: '#5AA6C6',

    shadow: '#000000',
  },
} as const;

export type ThemeColors = typeof Colors.light;
export type ThemeColor = keyof ThemeColors;
// Тема как её отдаёт useTheme() — светлая ИЛИ тёмная (литералы значений различаются).
export type Theme = typeof Colors.light | typeof Colors.dark;

// Тёплые градиенты для «геройских» моментов (CTA, серия, финиш). Не декор ради декора.
export const Gradients = {
  light: {
    primary: ['#E8894E', '#C0562B'] as const, // терракота
    streak: ['#F6B44A', '#E0722A'] as const, // мёд → терракота (пламя)
    hear: ['#8877F0', '#6048D6'] as const,
    say: ['#4FC08A', '#278F5E'] as const,
  },
  dark: {
    primary: ['#F0A26E', '#D96C3C'] as const,
    streak: ['#F2B85C', '#E5813C'] as const,
    hear: ['#B4A6F8', '#8B76EE'] as const,
    say: ['#63CE97', '#3AA871'] as const,
  },
} as const;

// Nunito — тёплый скруглённый гротеск. Один шрифт на всё, вес несёт иерархию.
// Веса подключаются в src/app/_layout.tsx.
export const Font = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
})!;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  pill: 999,
} as const;

export const MaxContentWidth = 720;

// Мягкая тёплая тень для «живых» поверхностей. level: 0 нет, 1 карточка, 2 герой.
export function elevation(shadowColor: string, level: 1 | 2 = 1): ViewStyle {
  if (level === 2) {
    return {
      shadowColor,
      shadowOpacity: 0.16,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 8,
    };
  }
  return {
    shadowColor,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  };
}

// Ротация тёплых акцентов для списка тем (колод) — чтобы список не был монохромным.
export function categoryColors(c: Theme): string[] {
  return [c.primary, c.hear, c.say, c.accent, c.gradeEasy, c.snooze];
}
