// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {createContext, useContext, useEffect, useState} from 'react';
import Link from 'next/link';
import {Theme} from '@xds/core/theme';
import {LinkProvider} from '@xds/core/Link';
import {astryxTheme} from '../themes/astryx';

type ThemeMode = 'light' | 'dark';

const ThemeModeContext = createContext<{
  mode: ThemeMode;
  toggleMode: () => void;
}>({
  mode: 'light',
  toggleMode: () => {},
});

export function useThemeMode() {
  return useContext(ThemeModeContext);
}

export function Providers({children}: {children: React.ReactNode}) {
  // Default to the OS color scheme. SSR/first paint use a deterministic 'light'
  // default (so hydration matches); the effect syncs to the real system
  // preference on mount and tracks live changes — until the user manually
  // toggles, after which their choice sticks for the rest of the session.
  const [mode, setMode] = useState<ThemeMode>('light');
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
    setMode(m => (m === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeModeContext value={{mode, toggleMode}}>
      <Theme theme={astryxTheme} mode={mode}>
        <LinkProvider component={Link}>{children}</LinkProvider>
      </Theme>
    </ThemeModeContext>
  );
}
