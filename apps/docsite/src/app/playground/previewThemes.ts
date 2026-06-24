// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file previewThemes.ts
 * @input generated theme registry + package registry
 * @output Selectable theme options + value→theme lookup for the playground
 * @position Playground — single source of truth for selectable themes.
 *
 * Derived entirely from the docsite's generated registries, so any official
 * @astryxdesign/theme-* package installed on the docsite automatically shows up in the
 * playground theme selector (and resolves in the preview) with no code change.
 */

import type {DefinedTheme} from '@astryxdesign/core/theme';
import {themeObjectsFull} from '../../generated/themeRegistry';
import {packages} from '../../generated/packageRegistry';

interface PlaygroundTheme {
  /** Short, stable key used as the selector value + postMessage payload. */
  value: string;
  /** Human-readable label shown in the selector. */
  label: string;
  /** The resolved theme object passed to <Theme>. */
  theme: DefinedTheme;
  /** Full package name, e.g. `@astryxdesign/theme-matcha` (for picker artwork). */
  packageName: string;
}

// Curated visual order shared with the /themes explorer (most restrained →
// most expressive). Themes not listed fall to the end alphabetically.
const PRESET_ORDER: ReadonlyArray<string> = [
  '@astryxdesign/theme-neutral',
  '@astryxdesign/theme-stone',
  '@astryxdesign/theme-gothic',
  '@astryxdesign/theme-matcha',
  '@astryxdesign/theme-y2k',
  '@astryxdesign/theme-butter',
];

const displayNameByPackage = new Map(
  packages.map(p => [p.name, p.displayName]),
);

/** "@astryxdesign/theme-default" → "default" */
function toShortName(packageName: string): string {
  return packageName.replace(/^@astryxdesign\/theme-/, '');
}

/**
 * Produce a clean label. Package displayNames are inconsistent
 * ("Default Theme", "Theme: matcha", "Gothic Theme") — strip the "theme"
 * noise and title-case, falling back to the short package name.
 */
function toLabel(packageName: string, shortName: string): string {
  const display = displayNameByPackage.get(packageName);
  const cleaned = display?.replace(/theme:?/gi, '').trim();
  const base = cleaned || shortName;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

const PLAYGROUND_THEMES: PlaygroundTheme[] = Object.entries(themeObjectsFull)
  .map(([packageName, theme]) => {
    const value = toShortName(packageName);
    return {value, label: toLabel(packageName, value), theme, packageName};
  })
  .sort((a, b) => a.label.localeCompare(b.label));

export const PLAYGROUND_THEME_OPTIONS = PLAYGROUND_THEMES.map(
  ({value, label}) => ({value, label}),
);

export const themeByValue: Record<string, DefinedTheme> = Object.fromEntries(
  PLAYGROUND_THEMES.map(t => [t.value, t.theme]),
);

export interface PlaygroundPreset {
  /** Short slug used to apply the theme (e.g. `matcha`). */
  value: string;
  label: string;
  theme: DefinedTheme;
  packageName: string;
}

// Selectable presets for the Theme editor's Presets tab — every theme except
// the base "default", ordered like the /themes explorer.
export const PLAYGROUND_PRESETS: PlaygroundPreset[] = PLAYGROUND_THEMES.filter(
  t => t.value !== 'default',
).sort((a, b) => {
  const ai = PRESET_ORDER.indexOf(a.packageName);
  const bi = PRESET_ORDER.indexOf(b.packageName);
  if (ai === -1 && bi === -1) {
    return a.label.localeCompare(b.label);
  }
  if (ai === -1) {
    return 1;
  }
  if (bi === -1) {
    return -1;
  }
  return ai - bi;
});

/** Preferred initial theme — neutral if present, else the first available. */
export const DEFAULT_PLAYGROUND_THEME =
  PLAYGROUND_THEMES.find(t => t.value === 'neutral')?.value ??
  PLAYGROUND_THEMES[0]?.value ??
  'default';
