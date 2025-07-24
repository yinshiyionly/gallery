import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from '@/types';

interface ThemeState {
  theme: Theme;
  systemTheme: 'light' | 'dark';
  resolvedTheme: 'light' | 'dark';
  
  setTheme: (theme: Theme) => void;
  setSystemTheme: (theme: 'light' | 'dark') => void;
  updateResolvedTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      systemTheme: 'light',
      resolvedTheme: 'light',
      
      setTheme: (theme) => {
        set({ theme });
        get().updateResolvedTheme();
      },
      
      setSystemTheme: (systemTheme) => {
        set({ systemTheme });
        get().updateResolvedTheme();
      },
      
      updateResolvedTheme: () => {
        const { theme, systemTheme } = get();
        const resolvedTheme = theme === 'system' ? systemTheme : theme;
        set({ resolvedTheme });
        applyTheme(resolvedTheme);
      },
    }),
    {
      name: 'theme-store',
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
);

// 在客户端使用时，应用主题
export const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof window === 'undefined') return;

  const root = window.document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// 监听系统主题变化
export const initThemeListener = () => {
  if (typeof window === 'undefined') return;

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const { setSystemTheme } = useThemeStore.getState();
  
  // 设置初始系统主题
  setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
  
  // 监听系统主题变化
  const handleChange = (e: MediaQueryListEvent) => {
    setSystemTheme(e.matches ? 'dark' : 'light');
  };
  
  mediaQuery.addEventListener('change', handleChange);
  
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
};