// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file effective.ts
 * @input A DefinedTheme (or null for core defaults)
 * @output Contrast pairs for component slots themes are allowed to restyle
 * @position Component-override-aware half of the contrast contract
 *
 * Several themes restyle Badge variants, Banner statuses, Button variants,
 * and Link colors through their `components` map (direct backgroundColor /
 * color values or `--token` re-bindings). Auditing the raw token pairs for
 * those slots produces false positives (e.g. stone redirects Banner icons
 * to categorical text tokens), so this module computes the EFFECTIVE
 * foreground/background expression per theme: core component defaults,
 * overridden by whatever the theme's `components` entry declares.
 *
 * Core defaults mirrored here (SYNC when those components change):
 * - Badge/Badge.tsx `variants` (semantic solid + neutral wash)
 * - Banner/Banner.tsx `statusStyles` + `statusIconColor` + title/description
 * - Button/Button.tsx `variants` (primary/secondary/destructive)
 * - FieldStatus/FieldStatus.tsx status styles (message text on tinted bubble)
 * - Link/Link.tsx default color (--color-text-accent)
 */

import type {DefinedTheme} from '@astryxdesign/core/theme';

import type {ContrastPair} from './contract';

const SURFACE = '--color-background-surface';
const BODY = '--color-background-body';
const CARD = '--color-background-card';
const POPOVER = '--color-background-popover';

type StyleOverrides = Record<string, unknown>;

/** Read a plain string style value from a component override entry. */
function styleString(
  entry: StyleOverrides | undefined,
  property: string,
): string | undefined {
  const value = entry?.[property];
  return typeof value === 'string' ? value : undefined;
}

/** Extract `--token: value` re-bindings from a component override entry. */
function rebindings(
  entry: StyleOverrides | undefined,
): Record<string, string> | undefined {
  if (!entry) {
    return undefined;
  }
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(entry)) {
    if (key.startsWith('--') && typeof value === 'string') {
      result[key] = value;
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function componentEntry(
  theme: DefinedTheme | null,
  component: string,
  slot: string,
): StyleOverrides | undefined {
  const map = theme?.components?.[component] as
    Record<string, StyleOverrides> | undefined;
  return map?.[slot];
}

const BADGE_DEFAULTS = {
  info: {bg: '--color-accent', fg: '--color-on-accent'},
  neutral: {bg: '--color-neutral', fg: '--color-text-primary'},
  success: {bg: '--color-success', fg: '--color-on-success'},
  warning: {bg: '--color-warning', fg: '--color-on-warning'},
  error: {bg: '--color-error', fg: '--color-on-error'},
} as const;

const BUTTON_DEFAULTS = {
  primary: {bg: '--color-accent', fg: '--color-on-accent'},
  secondary: {bg: '--color-neutral', fg: '--color-text-primary'},
  destructive: {bg: '--color-error', fg: '--color-on-error'},
} as const;

const FIELD_STATUS_DEFAULTS = {
  success: {bg: '--color-success-muted', fg: '--color-text-green'},
  warning: {bg: '--color-warning-muted', fg: '--color-text-yellow'},
  error: {bg: '--color-error-muted', fg: '--color-text-red'},
} as const;

const BANNER_DEFAULTS = {
  info: {bg: '--color-accent-muted', icon: '--color-accent'},
  success: {bg: '--color-success-muted', icon: '--color-success'},
  warning: {bg: '--color-warning-muted', icon: '--color-warning'},
  error: {bg: '--color-error-muted', icon: '--color-error'},
} as const;

/**
 * Build the component-slot contrast pairs for a theme, applying its
 * `components` overrides on top of the core component defaults.
 */
export function effectivePairs(theme: DefinedTheme | null): ContrastPair[] {
  const pairs: ContrastPair[] = [];

  for (const [variant, defaults] of Object.entries(BADGE_DEFAULTS)) {
    const entry = componentEntry(theme, 'badge', `variant:${variant}`);
    pairs.push({
      fg: styleString(entry, 'color') ?? defaults.fg,
      bg: [SURFACE, styleString(entry, 'backgroundColor') ?? defaults.bg],
      min: 4.5,
      criterion: '1.4.3',
      context: `Badge variant="${variant}" label (effective)`,
      rebind: rebindings(entry),
    });
  }

  for (const [variant, defaults] of Object.entries(BUTTON_DEFAULTS)) {
    const entry = componentEntry(theme, 'button', `variant:${variant}`);
    pairs.push({
      fg: styleString(entry, 'color') ?? defaults.fg,
      bg: [SURFACE, styleString(entry, 'backgroundColor') ?? defaults.bg],
      min: 4.5,
      criterion: '1.4.3',
      context: `Button variant="${variant}" label (effective)`,
      rebind: rebindings(entry),
    });
  }

  for (const [status, defaults] of Object.entries(BANNER_DEFAULTS)) {
    const entry = componentEntry(theme, 'banner', `status:${status}`);
    const rebind = rebindings(entry);
    const bg = [SURFACE, styleString(entry, 'backgroundColor') ?? defaults.bg];
    pairs.push(
      {
        fg: defaults.icon,
        bg,
        min: 3,
        criterion: '1.4.11',
        context: `Banner status="${status}" icon (effective)`,
        rebind,
      },
      {
        fg: '--color-text-primary',
        bg,
        min: 4.5,
        criterion: '1.4.3',
        context: `Banner status="${status}" title (effective)`,
        rebind,
      },
      {
        fg: '--color-text-secondary',
        bg,
        min: 4.5,
        criterion: '1.4.3',
        context: `Banner status="${status}" description (effective)`,
        rebind,
      },
    );
  }

  for (const [type, defaults] of Object.entries(FIELD_STATUS_DEFAULTS)) {
    const entry = componentEntry(theme, 'field-status', `type:${type}`);
    pairs.push({
      fg: styleString(entry, 'color') ?? defaults.fg,
      bg: [SURFACE, styleString(entry, 'backgroundColor') ?? defaults.bg],
      min: 4.5,
      criterion: '1.4.3',
      context: `FieldStatus type="${type}" message (effective)`,
      rebind: rebindings(entry),
    });
  }

  const linkEntry = componentEntry(theme, 'link', 'base');
  const linkColor = styleString(linkEntry, 'color') ?? '--color-text-accent';
  for (const bg of [
    [BODY],
    [SURFACE],
    [CARD],
    [POPOVER],
    [SURFACE, '--color-background-muted'],
  ]) {
    pairs.push({
      fg: linkColor,
      bg,
      min: 4.5,
      criterion: '1.4.3',
      context: 'Link / Text color="accent" (effective)',
      rebind: rebindings(linkEntry),
    });
  }

  return pairs;
}
