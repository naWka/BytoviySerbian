// PWA-инициализация на web (BS-22): manifest, iOS-теги «как приложение», service worker.
// Под output:"single" expo не применяет +html.tsx, поэтому теги вставляем в <head> в рантайме.
// На native — no-op. BASE = EXPO_BASE_URL (dev '' → от корня, прод '/BytoviySerbian').
import { Platform } from 'react-native';

const BASE = process.env.EXPO_BASE_URL || '';

export function setupPWA(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const head = document.head;

  const setLink = (rel: string, href: string) => {
    const sel = `link[rel="${rel}"][data-bs]`;
    let el = head.querySelector<HTMLLinkElement>(sel);
    if (!el) {
      el = document.createElement('link');
      el.rel = rel;
      el.setAttribute('data-bs', '1');
      head.appendChild(el);
    }
    el.href = href;
  };

  const setMeta = (name: string, content: string) => {
    let el = head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.name = name;
      head.appendChild(el);
    }
    el.content = content;
  };

  setLink('manifest', `${BASE}/manifest.json`);
  setLink('apple-touch-icon', `${BASE}/icon-192.png`);
  setMeta('theme-color', '#C0562B');
  setMeta('apple-mobile-web-app-capable', 'yes');
  setMeta('mobile-web-app-capable', 'yes');
  setMeta('apple-mobile-web-app-status-bar-style', 'default');
  setMeta('apple-mobile-web-app-title', 'Bytoviy Serbian');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(`${BASE}/sw.js`, { scope: `${BASE}/` }).catch(() => {});
  }
}
