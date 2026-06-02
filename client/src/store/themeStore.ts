import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('devconnect-theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  toggle: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('devconnect-theme', next);
      if (next === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return { theme: next };
    }),
  setTheme: (theme) => {
    localStorage.setItem('devconnect-theme', theme);
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    set({ theme });
  },
}));
