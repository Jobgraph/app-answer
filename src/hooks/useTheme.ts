import { useCallback, useContext, useEffect, useState } from 'react';
import {
  type Theme,
  ThemeContext,
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  resolveTheme,
  storeTheme,
} from '../lib/theme';

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemeProvider() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => resolveTheme(getStoredTheme()));

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    storeTheme(t);
    const r = resolveTheme(t);
    setResolved(r);
    applyTheme(r);
  }, []);

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const r = getSystemTheme();
      setResolved(r);
      applyTheme(r);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return { theme, resolved, setTheme };
}
