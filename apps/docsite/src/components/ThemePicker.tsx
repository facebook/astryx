// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ThemePicker.tsx
 * @input A list of themes + the selected id + a select callback
 * @output A vertical list (or single cards) of themed preview tiles
 * @position Shared theme selector — used by the /themes explorer sidebar +
 *   carousel and the playground's Theme editor "Presets" tab.
 *
 * Each tile is a SelectableCard wrapping a <Theme>-scoped surface so the card
 * previews the brand at a glance: per-theme artwork (a CDN banner) when one
 * exists, otherwise a soft multi-radial gradient built from the theme's accent
 * + categorical hues. The wordmark renders in the theme's own display font.
 */

'use client';

import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {Theme} from '@astryxdesign/core/theme';
import type {DefinedTheme} from '@astryxdesign/core/theme';
import {Text} from '@astryxdesign/core/Text';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';

// CDN host for the per-theme picker banners (same host as the showcase
// product photos), so the artwork can be updated without a code change.
const PICKER_CDN = 'https://lookaside.facebook.com/assets/astryx';

// Graceful fallback behind the CDN artwork: if the banner can't load (e.g.
// offline / network-restricted dev), the card shows this neutral grey instead
// of a blank surface. When the image loads it covers the grey entirely.
const FALLBACK_GREY = '#E6E8EB';

const styles = stylex.create({
  themeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  themeCard: {
    width: '100%',
  },
  // Inner card surface — lives inside the per-card <Theme> wrapper so the
  // theme's heading typography (wordmark) + brand color tokens (gradient) all
  // resolve to the represented theme. Fixed height so every card lines up
  // regardless of the theme's heading font.
  themedSurface: {
    height: 120,
    padding: 'var(--spacing-4)',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-surface)',
    backgroundImage: [
      'radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--color-accent) 65%, transparent), transparent 60%)',
      'radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--color-background-orange) 70%, transparent), transparent 60%)',
      'radial-gradient(circle at 0% 100%, color-mix(in srgb, var(--color-background-green) 70%, transparent), transparent 60%)',
      'radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--color-background-blue) 70%, transparent), transparent 60%)',
      'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--color-accent-muted) 50%, transparent), transparent 70%)',
    ].join(', '),
  },
  surfaceButter: {
    backgroundColor: FALLBACK_GREY,
    backgroundImage: `url(${PICKER_CDN}/theme-butter-picker.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  surfaceGothic: {
    backgroundColor: FALLBACK_GREY,
    backgroundImage: `url(${PICKER_CDN}/theme-gothic-picker.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  surfaceY2k: {
    backgroundColor: FALLBACK_GREY,
    backgroundImage: `url(${PICKER_CDN}/theme-y2k-picker.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  surfaceStone: {
    backgroundColor: FALLBACK_GREY,
    backgroundImage: `url(${PICKER_CDN}/theme-stone-picker.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  surfaceNeutral: {
    backgroundColor: FALLBACK_GREY,
    backgroundImage: `url(${PICKER_CDN}/theme-neutral-picker.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  surfaceMatcha: {
    backgroundColor: FALLBACK_GREY,
    backgroundImage: `url(${PICKER_CDN}/theme-matcha-picker.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  labelAccent: {
    color: 'var(--color-accent)',
  },
  // Wordmark on top of the artwork/gradient. Fixed font-size overrides each
  // theme's heading scale so all cards read at a uniform size.
  themeCardLabel: {
    fontSize: 24,
    lineHeight: 1.2,
    color: 'var(--color-text-primary)',
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    position: 'relative',
    zIndex: 1,
  },
  smallLabel: {
    fontSize: 20,
  },
});

// Per-theme artwork registry, keyed by package name. Themes without an entry
// render the default radial-gradient backdrop + default wordmark color.
const PICKER_OVERRIDES: Record<
  string,
  {surface: StyleXStyles; label?: StyleXStyles}
> = {
  '@astryxdesign/theme-butter': {
    surface: styles.surfaceButter,
    label: styles.labelAccent,
  },
  '@astryxdesign/theme-gothic': {
    surface: styles.surfaceGothic,
    label: styles.labelAccent,
  },
  '@astryxdesign/theme-y2k': {
    surface: styles.surfaceY2k,
    label: styles.labelAccent,
  },
  '@astryxdesign/theme-stone': {
    surface: styles.surfaceStone,
    label: styles.labelAccent,
  },
  '@astryxdesign/theme-neutral': {
    surface: styles.surfaceNeutral,
    label: styles.labelAccent,
  },
  '@astryxdesign/theme-matcha': {
    surface: styles.surfaceMatcha,
    label: styles.labelAccent,
  },
};

export interface ThemePickerItem {
  /** Stable id used for selection — a playground slug or a package name. */
  id: string;
  /** Friendly wordmark, e.g. "Neutral". */
  label: string;
  /** Theme object used to render the mini preview. */
  theme?: DefinedTheme;
  /** Package name (e.g. `@astryxdesign/theme-butter`) for artwork lookup. */
  packageName: string;
}

interface ThemePickerCardProps {
  item: ThemePickerItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  /** Use the smaller wordmark size (e.g. in the mobile carousel). */
  isCompact?: boolean;
}

/** A single themed preview tile. Exported for carousel/grid placements. */
export function ThemePickerCard({
  item,
  isSelected,
  onSelect,
  isCompact = false,
}: ThemePickerCardProps) {
  const override = PICKER_OVERRIDES[item.packageName];
  const labelStyles = [
    styles.themeCardLabel,
    isCompact && styles.smallLabel,
    override?.label ?? false,
  ];
  return (
    <SelectableCard
      label={`Preview ${item.label} theme`}
      isSelected={isSelected}
      onChange={() => onSelect(item.id)}
      padding={0}
      variant="transparent"
      xstyle={styles.themeCard}>
      {item.theme ? (
        // Mini cards always render in light mode so the picker reads as a
        // stable swatch palette regardless of the preview's mode.
        <Theme theme={item.theme} mode="light">
          <div
            {...stylex.props(styles.themedSurface, override?.surface ?? false)}>
            <Text type="display-3" weight="bold" xstyle={labelStyles}>
              {item.label}
            </Text>
          </div>
        </Theme>
      ) : (
        <div {...stylex.props(styles.themedSurface)}>
          <Text type="display-3" weight="bold" xstyle={labelStyles}>
            {item.label}
          </Text>
        </div>
      )}
    </SelectableCard>
  );
}

interface ThemePickerProps {
  items: ThemePickerItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  xstyle?: StyleXStyles;
}

/** Vertical list of themed preview tiles. */
export function ThemePicker({
  items,
  selectedId,
  onSelect,
  xstyle,
}: ThemePickerProps) {
  return (
    <div {...stylex.props(styles.themeList, xstyle)}>
      {items.map(item => (
        <ThemePickerCard
          key={item.id}
          item={item}
          isSelected={item.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
