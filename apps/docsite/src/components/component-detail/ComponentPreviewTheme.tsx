// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * ComponentPreviewTheme.
 *
 * @input component preview chrome and preview content from the docsite
 * @output children rendered under the neutral preview theme with the current mode
 * @position Component detail previews — wraps the preview container as well as
 * the component so their backgrounds, borders, and content tokens match.
 */

import {type ReactNode} from 'react';
import {XDSTheme} from '@xds/core/theme';
import {neutralTheme} from '@xds/theme-neutral/built';
import {useThemeMode} from '../../app/providers';

export function ComponentPreviewTheme({children}: {children: ReactNode}) {
  const {mode} = useThemeMode();

  return (
    <XDSTheme theme={neutralTheme} mode={mode}>
      {children}
    </XDSTheme>
  );
}
