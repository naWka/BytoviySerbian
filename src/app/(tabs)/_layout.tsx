import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Font } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type IoniconName = keyof typeof Ionicons.glyphMap;

// Стартовая вкладка — «Учить» (BS-19: вкладка «Ситуации» убрана).
export const unstable_settings = { initialRouteName: 'learn' };

function tabIcon(base: IoniconName, filled: IoniconName) {
  return ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? filled : base} size={size} color={color as string} />
  );
}

export default function TabsLayout() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        // Хедер навигатора убран: каждый экран рисует свой заголовок сам.
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarLabelStyle: { fontFamily: Font.bold, fontSize: 11 },
        // Высота + нижний отступ учитывают safe-area (home indicator / панель Safari),
        // иначе подписи вкладок обрезаются снизу.
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          height: 58 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 10,
        },
      }}>
      <Tabs.Screen
        name="learn"
        options={{ title: 'Учить', tabBarIcon: tabIcon('flash-outline', 'flash') }}
      />
      <Tabs.Screen
        name="vocab"
        options={{ title: 'Слова', tabBarIcon: tabIcon('book-outline', 'book') }}
      />
      <Tabs.Screen
        name="saved"
        options={{ title: 'Сохранённое', tabBarIcon: tabIcon('star-outline', 'star') }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Прогресс', tabBarIcon: tabIcon('stats-chart-outline', 'stats-chart') }}
      />
    </Tabs>
  );
}
