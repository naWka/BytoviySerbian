// Состояние входа (BS-22): сессия Supabase + email/пароль.
// Если ключи Supabase не заданы (supabaseConfigured === false) — режим без входа
// (локально, как раньше): ready сразу true, экран входа не показывается.
import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { startSync, stopSync } from './sync';
import { supabase, supabaseConfigured } from './supabase';

/** Человеческие сообщения об ошибках входа. */
function humanError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'Неверная почта или пароль.';
  if (m.includes('already registered') || m.includes('already exists')) return 'Такая почта уже зарегистрирована — войдите.';
  if (m.includes('password') && m.includes('6')) return 'Пароль слишком короткий (нужно минимум 6 символов).';
  if (m.includes('email') && m.includes('valid')) return 'Проверьте адрес почты.';
  if (m.includes('network') || m.includes('failed to fetch')) return 'Нет связи. Проверьте интернет.';
  return message;
}

interface AuthState {
  session: Session | null;
  ready: boolean; // проверили ли начальную сессию
  needsAuth: boolean; // нужен ли вообще экран входа (ключи заданы)
  init: () => void;
  signIn: (email: string, password: string) => Promise<string | null>; // null = успех, иначе текст ошибки
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  session: null,
  ready: false,
  needsAuth: supabaseConfigured,

  init: () => {
    if (!supabaseConfigured) {
      set({ ready: true, needsAuth: false });
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, ready: true });
      if (data.session) startSync(data.session.user.id);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
      if (session) startSync(session.user.id);
      else stopSync();
    });
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? humanError(error.message) : null;
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) return humanError(error.message);
    // Если email-подтверждение выключено — сессия придёт сразу; иначе просим подтвердить.
    if (!data.session) return 'Аккаунт создан. Подтвердите почту по ссылке из письма, затем войдите.';
    return null;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    stopSync();
    set({ session: null });
  },
}));
