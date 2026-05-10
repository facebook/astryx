'use client';

import {useState, createContext, useContext, useEffect} from 'react';
import {XDSTheme} from '@xds/core/theme';
import {XDSLayerProvider} from '@xds/core/Layer';
import {defaultTheme} from '@xds/theme-default/built';
import {neutralTheme} from '@xds/theme-neutral/built';
import {brutalistTheme} from '@xds/theme-brutalist/built';
import {matchaTheme} from '@xds/theme-matcha/built';
import {dailyTheme} from '@xds/theme-daily/built';
import {stoneTheme} from '@xds/theme-stone/built';
import {gothicTheme} from '@xds/theme-gothic/built';
import {chocolateTheme} from '@xds/theme-chocolate/built';
import {y2kTheme} from '@xds/theme-y2k';
import type {XDSDefinedTheme, ThemeMode} from '@xds/core/theme';

const themes: Record<string, XDSDefinedTheme> = {
  default: defaultTheme,
  neutral: neutralTheme,
  brutalist: brutalistTheme,
  matcha: matchaTheme,
  daily: dailyTheme,
  stone: stoneTheme,
  gothic: gothicTheme,
  chocolate: chocolateTheme,
  y2k: y2kTheme,
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
        <XDSLayerProvider>{children}</XDSLayerProvider>
      </XDSTheme>
    </ThemeContext.Provider>
  );
}
