// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSTheme} from '@xds/core/theme';
import type {ReactNode} from 'react';
import {useThemeMode} from '../app/providers';

/**
 * Client wrapper that applies a given theme with the site's active mode.
 * Use in server components that can't call useThemeMode directly.
 */
export function ThemedPreview({
  theme,
  children,
}: {
  theme: Parameters<typeof XDSTheme>[0]['theme'];
  children: ReactNode;
}) {
  const {mode} = useThemeMode();
  return (
    <XDSTheme theme={theme} mode={mode}>
      {children}
    </XDSTheme>
  );
}
