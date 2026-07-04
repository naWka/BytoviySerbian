import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type IoniconName = keyof typeof Ionicons.glyphMap;

function tabIcon(base: IoniconName, filled: IoniconName) {
  return ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? filled : base} size={size} color={color as string} />
  );
}

export default function TabsLayout() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: c.background },
        headerTitleStyle: { color: c.text, fontWeight: '800' },
        headerShadowVisible: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.border },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Ситуации', tabBarIcon: tabIcon('chatbubbles-outline', 'chatbubbles') }}
      />
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
