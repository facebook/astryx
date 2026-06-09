// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Theme presets available to the playground, derived from the docsite's
 * generated theme registry. The [theme] route segment maps to one of these by
 * name and seeds the editor with the full theme object.
 */

import type {XDSDefinedTheme} from '@xds/core/theme';
import {themeObjectsFull} from '../../generated/themeRegistry';

export interface ThemeListEntry {
  name: string;
  label: string;
  theme: XDSDefinedTheme;
}

export function getThemeList(): ThemeListEntry[] {
  return Object.values(themeObjectsFull)
    .map(theme => ({
      name: theme.name,
      label: theme.name.charAt(0).toUpperCase() + theme.name.slice(1),
      theme,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getThemeByName(name: string): ThemeListEntry | undefined {
  return getThemeList().find(entry => entry.name === name);
}
