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
import {y2kTheme} from '@xds/theme-y2k/built';
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

/**
 * Reads theme/mode from URL search params when rendered inside an embed iframe.
 * Uses window.location directly to avoid requiring a Suspense boundary for
 * useSearchParams in the root Providers component.
 */
function getEmbedThemeParams(): {
  initialTheme: string;
  initialMode: ThemeMode;
  isEmbed: boolean;
} {
  if (typeof window === 'undefined') {
    return {initialTheme: 'default', initialMode: 'light', isEmbed: false};
  }
  const params = new URLSearchParams(window.location.search);
  const isEmbed = params.get('embed') === '1';
  const paramTheme = params.get('theme');
  const paramMode = params.get('mode');

  return {
    initialTheme:
      isEmbed && paramTheme && paramTheme in themes ? paramTheme : 'default',
    initialMode:
      isEmbed && (paramMode === 'light' || paramMode === 'dark')
        ? (paramMode as ThemeMode)
        : 'light',
    isEmbed,
  };
}

export function Providers({children}: {children: React.ReactNode}) {
  const {initialTheme, initialMode, isEmbed} = getEmbedThemeParams();
  const [themeName, setThemeName] = useState(initialTheme);
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  // When embedded, sync theme/mode from parent shell via postMessage
  useEffect(() => {
    if (!isEmbed) return;
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'xds-theme-sync') {
        const {theme: newTheme, mode: newMode} = event.data;
        if (newTheme && newTheme in themes) setThemeName(newTheme);
        if (newMode === 'light' || newMode === 'dark') setMode(newMode);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [isEmbed]);

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
