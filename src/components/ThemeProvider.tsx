import React, { useEffect, useState, createContext, useContext } from 'react';
type Theme = 'dark' | 'light';
type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};
type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};
const initialState: ThemeProviderState = {
  theme: 'dark',
  setTheme: () => null
};
const ThemeProviderContext = createContext<ThemeProviderState>(initialState);
export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  ...props
}: ThemeProviderProps) {
  // Используем тему из localStorage, если она есть, иначе используем dark
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'dark';
  });
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);
  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem('theme', theme);
      setTheme(theme);
    }
  };
  return <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>;
}
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};