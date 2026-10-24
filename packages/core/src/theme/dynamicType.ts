// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dynamicType.ts
 * @input The UIKit point sizes per text style (uikitTypography.ts), the raw
 *   font-size tokens (tokens.stylex.ts)
 * @output The reader's text size categories, the category a measured Body
 *   size names, each raw font-size step's UIKit curve and scale, the CSS that
 *   maps a category to those scales, the scaled raw font-size declarations a
 *   theme emits, and the root Theme's category sync
 * @position Theme utility; read by generateThemeRules.ts (a theme's Dynamic
 *   Type CSS) and Theme.tsx (the root provider writes the category to <html>)
 *
 * On iOS the reader picks a text size in Settings (Display & Text Size, then
 * Larger Text), and every UIKit text style follows it on its own curve. Mobile
 * Safari reveals the choice only through the `font: -apple-system-*` keywords:
 * the root font size stays 16px, and Astryx never changes it
 * (design:mobile-typography DR4).
 *
 * So the root Theme measures `font: -apple-system-body` in a hidden probe,
 * names the category from Body's size (each category has its own), and writes
 * it to `<html data-astryx-text-size>`; it rereads when the probe resizes, so
 * a change made while the page is open applies at once, as Safari restyles its
 * own keywords. A theme with `typography.dynamicType` then re-declares, on iOS
 * only, each raw font-size step as its own value times the scale of the UIKit
 * text style that step plays (UIKit's own rule for custom fonts,
 * `UIFontMetrics`). Every scale is 1 at Large, the default category, so a
 * default reader sees exactly the theme's sizes, and only sizes move: spacing,
 * radius and the root stay where the theme put them.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/dynamicType.test.ts
 * - /packages/core/src/theme/generateThemeRules.ts (generateDynamicTypeCSS)
 */

import {typography} from './uikitTypography';
import {dataAttr} from '../naming';
import type {textSizeDefaults} from './tokens.stylex';

// =============================================================================
// Categories
// =============================================================================

/**
 * The reader's text size categories, smallest to largest, in the order of the
 * UIKit typography table: the seven standard sizes, then the five
 * accessibility sizes Larger Accessibility Sizes unlocks. `l` (Large) is the
 * default. `<html data-astryx-text-size>` carries one of these, so
 * `[data-astryx-text-size^="ax"]` selects the accessibility sizes.
 */
export const TEXT_SIZE_CATEGORIES = [
  'xs',
  's',
  'm',
  'l',
  'xl',
  'xxl',
  'xxxl',
  'ax1',
  'ax2',
  'ax3',
  'ax4',
  'ax5',
] as const;

/** One of the reader's text size categories. */
export type TextSizeCategory = (typeof TEXT_SIZE_CATEGORIES)[number];

/** Index of Large, the default category, in every table row. */
const LARGE = TEXT_SIZE_CATEGORIES.indexOf('l');

/** The attribute the root Theme writes on `<html>`. */
export const TEXT_SIZE_ATTRIBUTE = dataAttr('text-size');

/**
 * The category whose Body size this is, or null when no category has it (a
 * size Safari does not produce, so nothing can be inferred from it). Body has
 * a distinct size in every category, so it names the category alone.
 */
export function textSizeCategoryForBodySize(
  px: number,
): TextSizeCategory | null {
  if (!Number.isFinite(px)) {
    return null;
  }
  const index = typography.body.findIndex(size => Math.abs(size - px) < 0.5);
  return index === -1 ? null : TEXT_SIZE_CATEGORIES[index];
}

// =============================================================================
// Curves
// =============================================================================

/** A UIKit text style the theme's sizes can scale on. */
export type DynamicTypeStyle = keyof typeof typography;

/** A raw font-size token. */
export type FontSizeToken = keyof typeof textSizeDefaults;

/**
 * The UIKit text style each raw font-size step scales like. A step follows
 * the style of the roles built on it: the base step carries body, label, code
 * and heading 4 (Body); one step up, heading 3 and large text (Title 3); then
 * heading 2 (Title 2), heading 1 and display 3 (Title 1), display 2 and 1
 * (Large Title); one step down, supporting text and heading 5 (Footnote,
 * supporting text being the common one); heading 6 (Caption 1); the sub-scale
 * steps (Caption 2).
 */
export const FONT_SIZE_STEP_STYLES = {
  '--font-size-4xs': 'caption2',
  '--font-size-3xs': 'caption2',
  '--font-size-2xs': 'caption2',
  '--font-size-xs': 'caption1',
  '--font-size-sm': 'footnote',
  '--font-size-base': 'body',
  '--font-size-lg': 'title3',
  '--font-size-xl': 'title2',
  '--font-size-2xl': 'title1',
  '--font-size-3xl': 'title1',
  '--font-size-4xl': 'largeTitle',
  '--font-size-5xl': 'largeTitle',
} as const satisfies Record<FontSizeToken, DynamicTypeStyle>;

/** How much `style` grows (or shrinks) at `category`, relative to Large. */
export function dynamicTypeScale(
  style: DynamicTypeStyle,
  category: TextSizeCategory,
): number {
  const row = typography[style];
  return row[TEXT_SIZE_CATEGORIES.indexOf(category)] / row[LARGE];
}

/** The custom property carrying `style`'s scale, set per category on `<html>`. */
export function dynamicTypeScaleProperty(style: DynamicTypeStyle): string {
  return `--_dynamic-type-${style.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}`;
}

/** The styles some step scales on, in table order. */
const SCALED_STYLES = (Object.keys(typography) as DynamicTypeStyle[]).filter(
  style => Object.values(FONT_SIZE_STEP_STYLES).includes(style as never),
);

// =============================================================================
// CSS
// =============================================================================

/**
 * Where the Dynamic Type CSS applies: iOS WebKit, the only engine whose
 * `-apple-system-body` follows the reader's text size (macOS Safari also
 * knows the keyword, but has no touch callout).
 */
export const DYNAMIC_TYPE_SUPPORTS =
  '(-webkit-touch-callout: none) and (font: -apple-system-body)';

/** A scale written to four decimals, without trailing zeros. */
function formatScale(scale: number): string {
  return String(Number(scale.toFixed(4)));
}

/**
 * The rules that give each category its scales, on `<html>`. Large needs none:
 * every scaled declaration falls back to 1.
 */
export function dynamicTypeCategoryRules(): string[] {
  return TEXT_SIZE_CATEGORIES.filter((_, index) => index !== LARGE).map(
    category => {
      const declarations = SCALED_STYLES.map(
        style =>
          `    ${dynamicTypeScaleProperty(style)}: ${formatScale(dynamicTypeScale(style, category))};`,
      ).join('\n');
      return `  :root[${TEXT_SIZE_ATTRIBUTE}="${category}"] {\n${declarations}\n  }`;
    },
  );
}

/**
 * The raw font-size writes a theme scales: each step among `tokens`, as
 * `[token, value]` with its value times its curve's scale (1 when no category
 * is set). The caller emits them through its declaration checks.
 *
 * A step never outgrows the step above it. UIKit's curves differ: above
 * Large its smaller styles grow faster than its larger ones (a theme whose
 * ramp is tighter than UIKit's would see heading 2 pass heading 1 at the
 * largest accessibility sizes), and below Large Body shrinks faster than
 * Footnote (supporting text could pass body text). So each step is capped at
 * the next step's scaled size. When the theme's own step is no larger than
 * its next one, as in every ramp `typography.scale` generates, that cap is
 * the theme's own size at Large and binds at every other category; for a
 * ramp that is out of order (or a next step this theme does not set), the cap
 * never goes below the step's own size, so the theme's sizes at Large stay
 * exactly its own.
 */
export function scaledFontSizeEntries(
  tokens: Record<string, string>,
): [FontSizeToken, string][] {
  const steps = Object.keys(FONT_SIZE_STEP_STYLES) as FontSizeToken[];
  return steps
    .filter(name => tokens[name] !== undefined)
    .map(name => {
      const value = tokens[name];
      const scaled = `calc(${value} * var(${dynamicTypeScaleProperty(FONT_SIZE_STEP_STYLES[name])}, 1))`;
      const next = steps[steps.indexOf(name) + 1];
      if (next === undefined) {
        return [name, scaled];
      }
      const own = lengthInPx(value);
      const nextOwn = lengthInPx(tokens[next]);
      const inOrder = own !== null && nextOwn !== null && own <= nextOwn;
      return [
        name,
        inOrder
          ? `min(${scaled}, var(${next}))`
          : `min(${scaled}, max(var(${next}), ${value}))`,
      ];
    });
}

/** A `px` or `rem` length in px (16px to the rem); null for anything else. */
function lengthInPx(value: string | undefined): number | null {
  const match = /^(-?\d*\.?\d+)(px|rem)$/.exec(value?.trim() ?? '');
  if (match == null) {
    return null;
  }
  return Number(match[1]) * (match[2] === 'rem' ? 16 : 1);
}

// =============================================================================
// Root sync
// =============================================================================

/**
 * Measure the reader's text size and keep `<html data-astryx-text-size>` on
 * its category; returns the cleanup. Does nothing outside iOS WebKit.
 *
 * The probe is a hidden `font: -apple-system-body` element appended to
 * `<body>`, outside every app subtree; its box resizes when the reader's text
 * size changes, which is when the category is read again.
 */
export function syncTextSizeCategory(doc: Document): (() => void) | undefined {
  const view = doc.defaultView;
  const supports = view?.CSS?.supports;
  if (
    view == null ||
    typeof supports !== 'function' ||
    !view.CSS.supports('-webkit-touch-callout', 'none') ||
    !view.CSS.supports('font', '-apple-system-body')
  ) {
    return undefined;
  }

  const root = doc.documentElement;
  const probe = doc.createElement('span');
  probe.setAttribute('aria-hidden', 'true');
  probe.setAttribute(dataAttr('text-size-probe'), '');
  probe.textContent = 'M';
  const {style} = probe;
  style.setProperty('position', 'fixed');
  style.setProperty('inset-block-start', '0');
  style.setProperty('inset-inline-start', '0');
  style.setProperty('display', 'block');
  style.setProperty('inline-size', 'max-content');
  style.setProperty('visibility', 'hidden');
  style.setProperty('pointer-events', 'none');
  style.setProperty('white-space', 'nowrap');
  style.setProperty('font', '-apple-system-body');
  (doc.body ?? root).append(probe);

  const read = () => {
    const category = textSizeCategoryForBodySize(
      Number.parseFloat(view.getComputedStyle(probe).fontSize),
    );
    if (category === null) {
      root.removeAttribute(TEXT_SIZE_ATTRIBUTE);
    } else if (root.getAttribute(TEXT_SIZE_ATTRIBUTE) !== category) {
      root.setAttribute(TEXT_SIZE_ATTRIBUTE, category);
    }
  };
  read();

  const observer =
    typeof view.ResizeObserver === 'function'
      ? new view.ResizeObserver(read)
      : null;
  observer?.observe(probe);

  return () => {
    observer?.disconnect();
    probe.remove();
    root.removeAttribute(TEXT_SIZE_ATTRIBUTE);
  };
}
