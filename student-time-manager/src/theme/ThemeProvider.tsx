import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type ThemeMode = 'auto' | 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function computeAuto(): 'light' | 'dark' {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 18 ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => (localStorage.getItem('theme-mode') as ThemeMode) || 'auto');

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    const effective = mode === 'auto' ? computeAuto() : mode;
    root.classList.add(effective);
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode }), [mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('ThemeProvider missing');
  return ctx;
}

