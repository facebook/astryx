// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {createContext, useContext, useState} from 'react';
import Link from 'next/link';
import {XDSTheme} from '@xds/core/theme';
import {XDSLinkProvider} from '@xds/core/Link';
import {defaultTheme} from '@xds/theme-default/built';

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
  const [mode, setMode] = useState<ThemeMode>('light');

  const toggleMode = () => setMode(m => (m === 'light' ? 'dark' : 'light'));

  return (
    <ThemeModeContext value={{mode, toggleMode}}>
      <XDSTheme theme={defaultTheme} mode={mode}>
        <XDSLinkProvider component={Link}>{children}</XDSLinkProvider>
      </XDSTheme>
    </ThemeModeContext>
  );
}
