import { useEffect } from 'react';
import { useThemeStore, applyTheme } from '@/store/useThemeStore';

export function useTheme() {
  const { theme, setTheme } = useThemeStore();

  // 监听系统主题变化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 应用当前主题
    applyTheme(theme);

    // 如果是系统主题，监听系统主题变化
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        applyTheme('system');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return { theme, setTheme };
}