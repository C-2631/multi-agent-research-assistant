import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: 'system', // 'light', 'dark', 'system'
  setTheme: (newTheme) => {
    set({ theme: newTheme });
    const isDark = newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.remove('light-theme', 'dark-theme', 'system-theme');
    document.documentElement.classList.add(isDark ? 'dark-theme' : 'light-theme');
  },
  initTheme: () => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.remove('light-theme', 'dark-theme', 'system-theme');
    document.documentElement.classList.add(isDark ? 'dark-theme' : 'light-theme');
  }
}));
