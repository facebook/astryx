// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, createContext, useContext, useEffect} from 'react';
import {Theme} from '@xds/core/theme';
import {LayerProvider} from '@xds/core/Layer';
import {defaultTheme} from '@xds/theme-default/built';
import {neutralTheme} from '@xds/theme-neutral/built';
import {brutalistTheme} from '@xds/theme-brutalist/built';
import {matchaTheme} from '@xds/theme-matcha/built';
import {dailyTheme} from '@xds/theme-daily/built';
import {stoneTheme} from '@xds/theme-stone/built';
import {gothicTheme} from '@xds/theme-gothic/built';
import {chocolateTheme} from '@xds/theme-chocolate/built';
import {y2kTheme} from '@xds/theme-y2k/built';
import type {DefinedTheme, ThemeMode} from '@xds/core/theme';

/**
 * Ordered list of available themes — single source of truth.
 *
 * Adding a new theme: add an entry here and the Theme dropdown in
 * SandboxNav, the embed sync, the localStorage hydration, and any other
 * theme-aware UI all pick it up automatically.
 */
export const SANDBOX_THEMES: ReadonlyArray<{
  id: string;
  label: string;
  theme: DefinedTheme;
}> = [
  {id: 'default', label: 'Default', theme: defaultTheme},
  {id: 'neutral', label: 'Neutral', theme: neutralTheme},
  {id: 'brutalist', label: 'Brutalist', theme: brutalistTheme},
  {id: 'matcha', label: 'Matcha', theme: matchaTheme},
  {id: 'daily', label: 'Daily', theme: dailyTheme},
  {id: 'stone', label: 'Stone', theme: stoneTheme},
  {id: 'gothic', label: 'Gothic', theme: gothicTheme},
  {id: 'chocolate', label: 'Chocolate', theme: chocolateTheme},
  {id: 'y2k', label: 'Y2K', theme: y2kTheme},
];

const themes: Record<string, DefinedTheme> = Object.fromEntries(
  SANDBOX_THEMES.map(t => [t.id, t.theme]),
);

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

const THEME_STORAGE_KEY = 'astryx-sandbox-theme';
const MODE_STORAGE_KEY = 'astryx-sandbox-mode';

/**
 * Reads theme/mode from URL search params when rendered inside an embed iframe.
 * Uses window.location directly to avoid requiring a Suspense boundary for
 * useSearchParams in the root Providers component.
 *
 * For non-embed contexts, localStorage hydration is handled via useEffect in
 * Providers so the initial server render matches the client (avoiding hydration
 * mismatches on Next.js SSR).
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
  const [hasHydrated, setHasHydrated] = useState(false);

  // Hydrate theme/mode from localStorage after mount (non-embed only).
  // Doing this in useEffect ensures server and initial client render match —
  // we start with defaults on both, then sync to the stored preference.
  useEffect(() => {
    if (isEmbed) {
      setHasHydrated(true);
      return;
    }
    try {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      const storedMode = window.localStorage.getItem(MODE_STORAGE_KEY);
      if (storedTheme && storedTheme in themes) {
        setThemeName(storedTheme);
      }
      if (storedMode === 'light' || storedMode === 'dark') {
        setMode(storedMode as ThemeMode);
      }
    } catch {
      // localStorage can throw in private mode / sandboxed iframes
    }
    setHasHydrated(true);
  }, [isEmbed]);

  // Persist theme/mode to localStorage so selection survives navigation.
  // Skip writes until after hydration to avoid overwriting stored values on
  // first render, and skip entirely when embedded (parent controls theme).
  useEffect(() => {
    if (isEmbed || !hasHydrated) {
      return;
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeName);
    } catch {
      // ignore
    }
  }, [themeName, isEmbed, hasHydrated]);

  useEffect(() => {
    if (isEmbed || !hasHydrated) {
      return;
    }
    try {
      window.localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, [mode, isEmbed, hasHydrated]);

  // When embedded, sync theme/mode from parent shell via postMessage
  useEffect(() => {
    if (!isEmbed) {
      return;
    }
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'astryx-theme-sync') {
        const {theme: newTheme, mode: newMode} = event.data;
        if (newTheme && newTheme in themes) {
          setThemeName(newTheme);
        }
        if (newMode === 'light' || newMode === 'dark') {
          setMode(newMode);
        }
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
      <Theme theme={theme} mode={mode}>
        <LayerProvider>{children}</LayerProvider>
      </Theme>
    </ThemeContext.Provider>
  );
}
