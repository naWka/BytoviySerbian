// BS-25: озвучка сербского текста. Кроссплатформенно через expo-speech
// (на web использует Web Speech API / SpeechSynthesis).
// Если сербского голоса на устройстве нет — expo-speech проговорит доступным
// голосом либо промолчит; экран при этом не ломается (все вызовы «мягкие»).
import * as Speech from 'expo-speech';

// Сербский. Кириллицу большинство движков читают как сербскую латиницу нормально,
// но на всякий случай можно передавать латиницу — см. speakCard ниже.
const SR_LANG = 'sr-RS';

/** Озвучить произвольный сербский текст. Тихо гасит ошибки (нет голоса и т. п.). */
export function speak(text: string | undefined | null, opts?: { latin?: string }) {
  if (!text) return;
  try {
    Speech.stop();
  } catch {
    // ignore
  }
  // Латиница читается движками стабильнее кириллицы — если передана, берём её.
  const toSay = opts?.latin?.trim() || text;
  try {
    Speech.speak(toSay, { language: SR_LANG, rate: 0.92, pitch: 1.0 });
  } catch {
    // нет голоса / не поддерживается — молча пропускаем
  }
}

/** Остановить текущую озвучку. */
export function stopSpeaking() {
  try {
    Speech.stop();
  } catch {
    // ignore
  }
}
