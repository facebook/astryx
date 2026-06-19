// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {createContext, useContext, useEffect, useState} from 'react';
import Link from 'next/link';
import {XDSTheme} from '@xds/core/theme';
import {XDSLinkProvider} from '@xds/core/Link';
import {astryxTheme} from '../themes/astryx';

type ThemeMode = 'light' | 'dark';

const ThemeModeContext = createContext<{
  /** Resolved color mode for UI consumers (toggle icon, ColorSwatch). */
  mode: ThemeMode;
  /**
   * Raw, system-aware mode for theme rendering. Stays 'system' on the first
   * paint so nested <XDSTheme> scopes keep `color-scheme: light dark` and their
   * light-dark() tokens follow the OS preference — no flash before the OS mode
   * resolves (#2713).
   */
  themeMode: 'system' | ThemeMode;
  toggleMode: () => void;
}>({
  mode: 'light',
  themeMode: 'system',
  toggleMode: () => {},
});

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

export function Providers({children}: {children: React.ReactNode}) {
  // Start in 'system' so SSR and the first paint defer to the OS scheme via
  // reset.css's `color-scheme: light dark` + light-dark() tokens — no flash,
  // no script (#2713). The effect resolves it to a concrete 'light'/'dark'
  // (visually identical) and tracks OS changes until the user toggles.
  // A fully SSR-correct manual toggle would need a server-read cookie; left
  // out of scope here.
  const [mode, setMode] = useState<'system' | ThemeMode>('system');
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    if (isManual) {
      return;
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setMode(mq.matches ? 'dark' : 'light');
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [isManual]);

  const toggleMode = () => {
    setIsManual(true);
    setMode(m => (m === 'dark' ? 'light' : 'dark'));
  };

  // Expose a concrete light/dark to consumers (toggle icons, ColorSwatch).
  // 'system' only survives the first render before the effect resolves it.
  const resolvedMode: ThemeMode = mode === 'dark' ? 'dark' : 'light';

  return (
    <ThemeModeContext value={{mode: resolvedMode, themeMode: mode, toggleMode}}>
      <XDSTheme theme={astryxTheme} mode={mode}>
        <XDSLinkProvider component={Link}>{children}</XDSLinkProvider>
      </XDSTheme>
    </ThemeModeContext>
  );
}
