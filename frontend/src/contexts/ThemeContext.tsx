import { createContext, useContext, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

interface ThemeContextValue {
  accentColor: string;
}

const ThemeContext = createContext<ThemeContextValue>({ accentColor: '#00d4ff' });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { selectedGame } = useGameStore();
  const accentColor = selectedGame?.color_accent || '#00d4ff';

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
  }, [accentColor]);

  return (
    <ThemeContext.Provider value={{ accentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
