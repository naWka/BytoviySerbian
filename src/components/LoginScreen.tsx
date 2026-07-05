// Экран входа/регистрации (BS-22). Email + пароль. Показывается, когда не вошёл.
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Font, MaxContentWidth, Radius, Spacing, elevation } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const signIn = useAuth((s) => s.signIn);
  const signUp = useAuth((s) => s.signUp);

  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const canSubmit = email.includes('@') && password.length >= 6 && !busy;

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    setMsg(null);
    const err = mode === 'in' ? await signIn(email, password) : await signUp(email, password);
    setBusy(false);
    if (err) setMsg(err);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: Spacing.xl,
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        }}
        keyboardShouldPersistTaps="handled">
        <View
          style={{
            width: '100%',
            maxWidth: 420,
            backgroundColor: c.surface,
            borderRadius: Radius.xl,
            borderWidth: 1,
            borderColor: c.border,
            padding: Spacing.xl,
            gap: Spacing.md,
            ...elevation(c.shadow, 2),
          }}>
          <Text style={{ fontFamily: Font.black, fontSize: 26, color: c.text }}>Bytoviy Serbian</Text>
          <Text style={{ fontFamily: Font.medium, fontSize: 15, color: c.textSecondary, marginBottom: Spacing.sm }}>
            {mode === 'in'
              ? 'Войдите, чтобы прогресс сохранялся и был на любом телефоне.'
              : 'Заведите аккаунт — прогресс будет храниться в облаке.'}
          </Text>

          <Field
            label="Почта"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoComplete="email"
            c={c}
          />
          <Field
            label="Пароль"
            value={password}
            onChangeText={setPassword}
            placeholder="минимум 6 символов"
            secureTextEntry
            autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
            c={c}
          />

          {msg ? (
            <Text style={{ fontFamily: Font.semibold, fontSize: 14, color: c.gradeAgain }}>{msg}</Text>
          ) : null}

          <Pressable
            onPress={submit}
            disabled={!canSubmit}
            style={{
              backgroundColor: canSubmit ? c.primary : c.border,
              borderRadius: Radius.lg,
              paddingVertical: Spacing.lg,
              alignItems: 'center',
              marginTop: Spacing.xs,
            }}>
            {busy ? (
              <ActivityIndicator color={c.onPrimary} />
            ) : (
              <Text style={{ fontFamily: Font.extrabold, fontSize: 17, color: c.onPrimary }}>
                {mode === 'in' ? 'Войти' : 'Создать аккаунт'}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              setMode(mode === 'in' ? 'up' : 'in');
              setMsg(null);
            }}
            style={{ alignItems: 'center', paddingVertical: Spacing.sm }}>
            <Text style={{ fontFamily: Font.semibold, fontSize: 14, color: c.primary }}>
              {mode === 'in' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
            </Text>
          </Pressable>
        </View>
        <View style={{ maxWidth: MaxContentWidth }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  c,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string; c: ReturnType<typeof useTheme> }) {
  return (
    <View style={{ gap: Spacing.xs }}>
      <Text style={{ fontFamily: Font.bold, fontSize: 13, color: c.textSecondary }}>{label}</Text>
      <TextInput
        placeholderTextColor={c.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          fontFamily: Font.medium,
          fontSize: 16,
          color: c.text,
          backgroundColor: c.background,
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: Radius.md,
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
        }}
        {...props}
      />
    </View>
  );
}
