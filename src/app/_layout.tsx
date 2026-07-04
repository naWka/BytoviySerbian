import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useStore } from '@/lib/store';

export default function RootLayout() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const colors = dark ? Colors.dark : Colors.light;
  const hydrated = useStore((s) => s._hydrated);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={dark ? DarkTheme : DefaultTheme}>
          <StatusBar style={dark ? 'light' : 'dark'} />
          {!hydrated ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTitleStyle: { color: colors.text },
                headerTintColor: colors.primary,
                headerShadowVisible: false,
                contentStyle: { backgroundColor: colors.background },
                headerBackTitle: 'Назад',
              }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="scenario/[id]" options={{ title: '' }} />
              <Stack.Screen name="deck/[id]" options={{ title: '' }} />
              <Stack.Screen name="review/[mode]" options={{ title: 'Повторение' }} />
              <Stack.Screen name="triage" options={{ title: 'Разбор слов' }} />
              <Stack.Screen name="session" options={{ title: 'Повторение' }} />
              <Stack.Screen name="later" options={{ title: 'Отложенные' }} />
              <Stack.Screen name="sos" options={{ title: '🆘 SOS-фразы' }} />
            </Stack>
          )}
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
