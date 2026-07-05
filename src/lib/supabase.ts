// Supabase-клиент (BS-22). Браузер ходит в Supabase напрямую, своего сервера нет.
// Ключи — из env с префиксом EXPO_PUBLIC_ (инлайнятся в web-бандл при сборке).
// anon-ключ публичный по дизайну; доступ к данным ограничивает RLS (см. scripts/supabase-setup.sql).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Заданы ли ключи. Нет → приложение работает локально без входа (удобно для dev). */
export const supabaseConfigured = Boolean(url && anonKey);

// Клиент создаём всегда (чтобы импорт не падал), но с заглушками, если ключей нет.
export const supabase = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder-anon-key', {
  auth: {
    storage: AsyncStorage, // работает и в web (localStorage), и в native
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // email+пароль, разбор URL не нужен (важно для сабпути Pages)
  },
});
