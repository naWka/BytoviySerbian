// Панель оценки ответа: 4 кнопки. Под каждой — когда карточка вернётся.
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Font, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { previewLabel } from '@/lib/srs';
import type { CardProgress, Grade } from '@/lib/types';

export function GradeBar({
  prev,
  onGrade,
}: {
  prev: CardProgress | undefined;
  onGrade: (g: Grade) => void;
}) {
  const c = useTheme();
  const grades: { g: Grade; label: string; color: string }[] = [
    { g: 'again', label: 'Не помню', color: c.gradeAgain },
    { g: 'hard', label: 'Трудно', color: c.gradeHard },
    { g: 'good', label: 'Помню', color: c.gradeGood },
    { g: 'easy', label: 'Легко', color: c.gradeEasy },
  ];

  const press = (g: Grade) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onGrade(g);
  };

  return (
    <View style={styles.row}>
      {grades.map(({ g, label, color }) => (
        <Pressable
          key={g}
          onPress={() => press(g)}
          style={({ pressed }) => [styles.btn, { backgroundColor: color }, pressed && { opacity: 0.82 }]}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.hint}>{previewLabel(prev, g)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.sm },
  btn: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 2,
  },
  label: { color: '#fff', fontSize: 14, fontFamily: Font.extrabold },
  hint: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontFamily: Font.semibold },
});
