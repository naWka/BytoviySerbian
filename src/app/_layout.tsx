import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  useFonts,
} from '@expo-google-fonts/nunito';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from '@/components/LoginScreen';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { setupPWA } from '@/lib/pwa';
import { useStore } from '@/lib/store';

export default function RootLayout() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const colors = dark ? Colors.dark : Colors.light;
  const hydrated = useStore((s) => s._hydrated);

  // BS-22: вход/облачный прогресс. init один раз проверяет сессию и слушает изменения.
  const authInit = useAuth((s) => s.init);
  const authReady = useAuth((s) => s.ready);
  const needsAuth = useAuth((s) => s.needsAuth);
  const session = useAuth((s) => s.session);
  useEffect(() => {
    setupPWA(); // web: manifest + service worker + iOS-теги
    authInit();
  }, [authInit]);

  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });
  const ready = hydrated && fontsLoaded && authReady;
  const showLogin = needsAuth && !session;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={dark ? DarkTheme : DefaultTheme}>
          <StatusBar style={dark ? 'light' : 'dark'} />
          {!ready ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : showLogin ? (
            <LoginScreen />
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
              <Stack.Screen name="deck/[id]" options={{ title: '' }} />
              <Stack.Screen name="review/[mode]" options={{ title: 'Повторение' }} />
              <Stack.Screen name="session" options={{ title: 'Занятие' }} />
              <Stack.Screen name="suspended" options={{ title: 'Убранные' }} />
              <Stack.Screen name="grammar" options={{ title: 'Грамматика' }} />
              <Stack.Screen name="browse" options={{ title: 'Смотрю' }} />
              <Stack.Screen name="browse/[id]" options={{ title: 'Смотрю' }} />
              <Stack.Screen name="study" options={{ title: 'Учу' }} />
              <Stack.Screen name="dictionary" options={{ title: 'Мой словарь' }} />
            </Stack>
          )}
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
