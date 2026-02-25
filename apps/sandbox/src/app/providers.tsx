'use client';

import {createContext, useContext, useState, useEffect, useMemo} from 'react';
import {XDSTheme} from '@xds/core/theme';
import type {ThemeType, ThemeMode} from '@xds/core/theme';
import {defaultTheme} from '@xds/theme-default';
import {neutralTheme} from '@xds/theme-neutral';
import {brutalistTheme} from '@xds/theme-brutalist';

export const themes: Record<string, ThemeType> = {
  default: defaultTheme,
  neutral: neutralTheme,
  brutalist: brutalistTheme,
};

interface ThemeSwitcherContextValue {
  themeName: string;
  mode: ThemeMode;
  setThemeName: (name: string) => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeSwitcherContext = createContext<ThemeSwitcherContextValue>({
  themeName: 'default',
  mode: 'system',
  setThemeName: () => {},
  setMode: () => {},
});

export function useThemeSwitcher() {
  return useContext(ThemeSwitcherContext);
}

const COLOR_SCHEME_MAP: Record<ThemeMode, string> = {
  light: 'light',
  dark: 'dark',
  system: 'light dark',
};

export function Providers({children}: {children: React.ReactNode}) {
  const [themeName, setThemeName] = useState('default');
  const [mode, setMode] = useState<ThemeMode>('system');

  const theme = themes[themeName] ?? defaultTheme;

  // Sync color-scheme to <body> so the browser canvas background,
  // scrollbars, and light-dark() all resolve correctly.
  useEffect(() => {
    document.body.style.colorScheme = COLOR_SCHEME_MAP[mode];
    if (mode === 'system') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', mode);
    }
  }, [mode]);

  const contextValue = useMemo(
    () => ({themeName, mode, setThemeName, setMode}),
    [themeName, mode],
  );

  return (
    <ThemeSwitcherContext.Provider value={contextValue}>
      <XDSTheme theme={theme} mode={mode}>
        {children}
      </XDSTheme>
    </ThemeSwitcherContext.Provider>
  );
}
