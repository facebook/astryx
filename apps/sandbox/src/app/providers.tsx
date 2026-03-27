'use client';

import {useState, createContext, useContext, useEffect} from 'react';
import {XDSTheme} from '@xds/core/theme';
import {defaultTheme} from '@xds/theme-default';
import {neutralTheme} from '@xds/theme-neutral';
import {brutalistTheme} from '@xds/theme-brutalist';
import {metaTheme} from '@xds/theme-meta';
import {whatsappTheme} from '@xds/theme-whatsapp';
import type {XDSDefinedTheme, ThemeMode} from '@xds/core/theme';

const themes: Record<string, XDSDefinedTheme> = {
  default: defaultTheme,
  neutral: neutralTheme,
  brutalist: brutalistTheme,
  meta: metaTheme,
  whatsapp: whatsappTheme,
};

type ThemeContextValue = {
  themeName: string;
  setThemeName: (name: string) => void;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  themeName: 'default',
  setThemeName: () => {},
  mode: 'light',
  setMode: () => {},
});

export const useThemeControls = () => useContext(ThemeContext);

export function Providers({children}: {children: React.ReactNode}) {
  const [themeName, setThemeName] = useState('default');
  const [mode, setMode] = useState<ThemeMode>('light');

  // Sync color-scheme to document root
  useEffect(() => {
    document.documentElement.style.setProperty('color-scheme', mode);
  }, [mode]);

  const theme = themes[themeName] || defaultTheme;

  return (
    <ThemeContext.Provider value={{themeName, setThemeName, mode, setMode}}>
      <XDSTheme theme={theme} mode={mode}>
        {children}
      </XDSTheme>
    </ThemeContext.Provider>
  );
}
