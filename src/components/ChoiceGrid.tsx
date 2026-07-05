// BS-27: варианты ответа для стороны «говорение». Тапаешь — приложение проверяет.
// До выбора — нейтральные кнопки; после — правильный зелёным, ошибочный (если ошибся) красным.
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Font, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Txt } from './ui';

export function ChoiceGrid({
  options,
  correct,
  picked,
  onPick,
}: {
  options: string[];
  correct: string;
  picked: string | null; // выбранный вариант (null — ещё не выбирали)
  onPick: (opt: string) => void;
}) {
  const c = useTheme();
  const answered = picked !== null;

  const press = (opt: string) => {
    if (answered) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(
        opt === correct ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Rigid,
      ).catch(() => {});
    }
    onPick(opt);
  };

  return (
    <View style={styles.grid}>
      {options.map((opt) => {
        const isCorrect = opt === correct;
        const isPicked = opt === picked;
        let bg: string = c.surface;
        let border: string = c.border;
        let fg: string = c.text;
        let icon: keyof typeof Ionicons.glyphMap | null = null;
        if (answered && isCorrect) {
          bg = c.saySoft;
          border = c.say;
          fg = c.say;
          icon = 'checkmark-circle';
        } else if (answered && isPicked) {
          bg = c.sosSoft;
          border = c.sos;
          fg = c.sos;
          icon = 'close-circle';
        }
        return (
          <Pressable
            key={opt}
            disabled={answered}
            onPress={() => press(opt)}
            style={({ pressed }) => [
              styles.opt,
              { backgroundColor: bg, borderColor: border },
              pressed && !answered && { opacity: 0.8, transform: [{ scale: 0.99 }] },
            ]}>
            <Txt center style={{ fontFamily: Font.bold, fontSize: 18, color: fg, flexShrink: 1 }}>{opt}</Txt>
            {icon ? <Ionicons name={icon} size={20} color={fg} style={{ marginLeft: 6 }} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: Spacing.sm },
  opt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    paddingVertical: 15,
    paddingHorizontal: Spacing.md,
    minHeight: 54,
  },
});
