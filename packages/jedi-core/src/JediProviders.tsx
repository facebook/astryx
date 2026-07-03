// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import type {ReactNode} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import {LinkProvider} from '@astryxdesign/core/Link';
import type {LinkComponentType} from '@astryxdesign/core/Link';
import {
  gothicTheme,
  neutralTheme,
  type JediThemeMode,
} from '@jon4ohio/jedi-themes';

export type {JediThemeMode};

export function resolveJediTheme(mode: JediThemeMode) {
  return mode === 'dark' ? gothicTheme : neutralTheme;
}

export interface JediProvidersProps {
  children: ReactNode;
  mode?: JediThemeMode;
  linkComponent: LinkComponentType;
}

export function JediProviders({
  children,
  mode = 'dark',
  linkComponent,
}: JediProvidersProps) {
  const theme = resolveJediTheme(mode);
  return (
    <Theme theme={theme}>
      <LinkProvider component={linkComponent}>{children}</LinkProvider>
    </Theme>
  );
}
