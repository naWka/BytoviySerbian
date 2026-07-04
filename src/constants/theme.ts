// Палитра и токены оформления. Светлая и тёмная тема.
import '@/global.css';

import { Platform } from 'react-native';

// Палитра «тёплая бумага + терракота». Нейтрали тонированы в тёплый оттенок,
// акцент — терракота (светлая) / коралл (тёмная). См. docs/DESIGN.md.
export const Colors = {
  light: {
    text: '#241C15',
    textSecondary: '#6E6053',
    textMuted: '#9E9082',
    background: '#FAF5EE',
    surface: '#FFFDF9',
    surfaceAlt: '#F1E7D9',
    border: '#E8DBC9',

    primary: '#C0562B', // терракота
    primarySoft: '#F7E5D8',
    onPrimary: '#FFF9F4',

    hear: '#6D5AE0', // «что услышишь»
    hearSoft: '#ECE7FB',
    say: '#2E9E6B', // «чем ответить» / «знаю»
    saySoft: '#DEEFE3',
    sos: '#D2483F',
    sosSoft: '#F8E3DD',

    snooze: '#B08544', // «позже»
    snoozeSoft: '#F3E8D2',

    star: '#E0972A',
    warning: '#C77A1E',

    gradeAgain: '#D2483F',
    gradeHard: '#D08322',
    gradeGood: '#2E9E6B',
    gradeEasy: '#2E82A0',
  },
  dark: {
    text: '#F4ECE1',
    textSecondary: '#C3B4A3',
    textMuted: '#8A7B6B',
    background: '#17120D',
    surface: '#221A13',
    surfaceAlt: '#2E241B',
    border: '#3A2E23',

    primary: '#E88B5A', // коралл-терракота
    primarySoft: '#3B291C',
    onPrimary: '#1F1108',

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
  },
} as const;

export type ThemeColors = typeof Colors.light;
export type ThemeColor = keyof ThemeColors;

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
