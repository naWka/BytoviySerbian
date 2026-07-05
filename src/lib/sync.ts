// Синхронизация прогресса с облаком (BS-22).
// Модель: облако (Supabase profiles.state jsonb) — источник правды на пользователя.
// Локальный AsyncStorage/localStorage — офлайн-кэш. При входе тянем state,
// при изменениях стора — debounce-upsert. Конфликт: «последняя запись выигрывает».
import { supabase } from './supabase';
import { useStore, type CloudState } from './store';

let unsubscribe: (() => void) | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let userId: string | null = null;
let applyingRemote = false; // не пушить обратно то, что только что подтянули

function snapshot(): CloudState {
  const s = useStore.getState();
  return { progress: s.progress, saved: s.saved, suspended: s.suspended, stats: s.stats };
}

async function pushNow() {
  if (!userId) return;
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, state: snapshot(), updated_at: new Date().toISOString() });
  if (error) console.warn('[sync] push failed:', error.message);
}

async function pull() {
  if (!userId) return;
  const { data, error } = await supabase.from('profiles').select('state').eq('id', userId).maybeSingle();
  if (error) {
    console.warn('[sync] pull failed:', error.message);
    return;
  }
  if (data?.state && Object.keys(data.state).length > 0) {
    applyingRemote = true;
    useStore.getState().hydrateFromCloud(data.state as CloudState);
    applyingRemote = false;
  } else {
    // Первый вход (в облаке пусто) — поднимаем текущий локальный прогресс наверх.
    await pushNow();
  }
}

/** Запустить синк для пользователя: подтянуть облако + слушать изменения стора. */
export function startSync(uid: string) {
  stopSync();
  userId = uid;
  void pull();
  unsubscribe = useStore.subscribe(() => {
    if (!userId || applyingRemote) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void pushNow(), 800); // debounce
  });
}

/** Остановить синк (выход из аккаунта). */
export function stopSync() {
  if (unsubscribe) unsubscribe();
  if (timer) clearTimeout(timer);
  unsubscribe = null;
  timer = null;
  userId = null;
}
