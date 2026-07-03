// Copyright (c) Meta Platforms, Inc. and affiliates.

export type JediThemeMode = 'light' | 'dark';

export const JEDI_THEME_MODES = ['light', 'dark'] as const;

export function resolveJediThemeName(
  mode: JediThemeMode,
): 'gothic' | 'neutral' {
  return mode === 'dark' ? 'gothic' : 'neutral';
}
