/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, Gradients } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function scheme(): 'light' | 'dark' {
  const s = useColorScheme();
  return s === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  return Colors[scheme()];
}

export function useGradients() {
  return Gradients[scheme()];
}

export function useScheme() {
  return scheme();
}
