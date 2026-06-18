// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {createContext, useContext, useEffect, useState} from 'react';
import Link from 'next/link';
import {XDSTheme} from '@xds/core/theme';
import {XDSLinkProvider} from '@xds/core/Link';
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
  // Default to the OS color scheme. The blocking <head> script in layout.tsx
  // already set <html data-theme> from the OS preference before first paint, so
  // we seed the initial client state from that attribute — this keeps the root
  // <XDSTheme> sync from briefly flipping the pre-painted dark theme back to
  // light during hydration. The effect below then tracks live OS changes until
  // the user manually toggles, after which their choice sticks for the session.
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof document !== 'undefined') {
      const attr = document.documentElement.getAttribute('data-theme');
      if (attr === 'dark' || attr === 'light') {
        return attr;
      }
    }
    return 'light';
  });
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
      <XDSTheme theme={astryxTheme} mode={mode}>
        <XDSLinkProvider component={Link}>{children}</XDSLinkProvider>
      </XDSTheme>
    </ThemeModeContext>
  );
}
