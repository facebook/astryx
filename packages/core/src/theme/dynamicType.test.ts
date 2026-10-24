// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dynamicType.test.ts
 * @input vitest, dynamicType.ts, the UIKit typography table, defineTheme and
 *   generateThemeCSS
 * @output Proves the Dynamic Type rules: Body's size names the reader's
 *   category, each raw font-size step scales exactly on its UIKit curve and is
 *   the theme's own size at Large, a theme emits the scaled sizes only when it
 *   opts in (root and adaptation rules, iOS WebKit only), and the root sync
 *   writes and clears `<html data-astryx-text-size>`
 * @position Testing; validates theme/dynamicType.ts and its use in
 *   generateThemeRules.ts without a browser (the iOS evidence is the
 *   simulator's)
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import {typography} from '../motion/uikit/typography';
import {defineTheme, generateThemeCSS} from './defineTheme';
import {
  DYNAMIC_TYPE_SUPPORTS,
  FONT_SIZE_STEP_STYLES,
  TEXT_SIZE_ATTRIBUTE,
  TEXT_SIZE_CATEGORIES,
  dynamicTypeCategoryRules,
  dynamicTypeScale,
  dynamicTypeScaleProperty,
  scaledFontSizeEntries,
  syncTextSizeCategory,
  textSizeCategoryForBodySize,
  type DynamicTypeStyle,
} from './dynamicType';
import {textSizeDefaults} from './tokens.stylex';

const STYLES = Object.keys(typography) as DynamicTypeStyle[];

describe('the reader text size category', () => {
  it('has one category per column of the UIKit table, Large fourth', () => {
    for (const style of STYLES) {
      expect(typography[style]).toHaveLength(TEXT_SIZE_CATEGORIES.length);
    }
    expect(TEXT_SIZE_CATEGORIES[3]).toBe('l');
  });

  it('is named by the size of Body alone', () => {
    TEXT_SIZE_CATEGORIES.forEach((category, index) => {
      expect(textSizeCategoryForBodySize(typography.body[index])).toBe(
        category,
      );
    });
    // Sub-pixel rounding of a computed size still names the category.
    expect(textSizeCategoryForBodySize(17.2)).toBe('l');
  });

  it('names nothing for a size Safari does not produce', () => {
    expect(textSizeCategoryForBodySize(18)).toBeNull();
    expect(textSizeCategoryForBodySize(16.5)).toBeNull();
    expect(textSizeCategoryForBodySize(Number.NaN)).toBeNull();
  });
});

describe('the UIKit curves', () => {
  it('maps every raw font-size step to a UIKit text style', () => {
    expect(Object.keys(FONT_SIZE_STEP_STYLES).sort()).toEqual(
      Object.keys(textSizeDefaults).sort(),
    );
    for (const style of Object.values(FONT_SIZE_STEP_STYLES)) {
      expect(STYLES).toContain(style);
    }
  });

  it('leaves every size alone at Large', () => {
    for (const style of STYLES) {
      expect(dynamicTypeScale(style, 'l')).toBe(1);
    }
  });

  it('turns a Large size into the UIKit size at every category', () => {
    // A theme step that equals the style's Large size lands on UIKit's own
    // size everywhere: UIFontMetrics' rule for custom fonts.
    for (const style of STYLES) {
      const large = typography[style][3];
      TEXT_SIZE_CATEGORIES.forEach((category, index) => {
        expect(large * dynamicTypeScale(style, category)).toBeCloseTo(
          typography[style][index],
          10,
        );
      });
    }
    expect(dynamicTypeScale('body', 'ax5')).toBeCloseTo(53 / 17, 10);
    expect(dynamicTypeScale('largeTitle', 'xs')).toBeCloseTo(31 / 34, 10);
  });

  it('gives each category its scales on <html>, Large none', () => {
    const rules = dynamicTypeCategoryRules();
    expect(rules).toHaveLength(11);
    expect(rules.join('\n')).not.toContain(`${TEXT_SIZE_ATTRIBUTE}="l"`);
    const ax5 = rules.find(rule =>
      rule.includes(`${TEXT_SIZE_ATTRIBUTE}="ax5"`),
    );
    expect(ax5).toContain(`${dynamicTypeScaleProperty('body')}: 3.1176;`);
    expect(ax5).toContain(`${dynamicTypeScaleProperty('largeTitle')}: 1.7647;`);
    expect(dynamicTypeScaleProperty('largeTitle')).toBe(
      '--_dynamic-type-large-title',
    );
  });

  it('scales only the raw font-size steps it is given, each capped by the next', () => {
    expect(
      scaledFontSizeEntries({
        '--font-size-base': '1rem',
        '--font-size-5xl': '2.625rem',
        '--spacing-4': '1rem',
      }),
    ).toEqual([
      [
        '--font-size-base',
        'min(calc(1rem * var(--_dynamic-type-body, 1)), max(var(--font-size-lg), 1rem))',
      ],
      // The largest step has nothing above it.
      [
        '--font-size-5xl',
        'calc(2.625rem * var(--_dynamic-type-large-title, 1))',
      ],
    ]);
  });

  it('keeps the theme hierarchy at every category, and its own sizes at Large', () => {
    // The neutral phone ramp (base 16, ratio 1.1736), in px: what the emitted
    // min()/max() chain computes, step by step from the largest down.
    const steps = Object.keys(
      FONT_SIZE_STEP_STYLES,
    ) as (keyof typeof FONT_SIZE_STEP_STYLES)[];
    const own = steps.map((_, index) => 16 * 1.1736 ** (index - 5));
    for (const category of TEXT_SIZE_CATEGORIES) {
      const effective: number[] = [];
      for (let index = steps.length - 1; index >= 0; index -= 1) {
        const scaled =
          own[index] *
          dynamicTypeScale(FONT_SIZE_STEP_STYLES[steps[index]], category);
        effective[index] =
          index === steps.length - 1
            ? scaled
            : Math.min(scaled, Math.max(effective[index + 1], own[index]));
      }
      for (let index = 1; index < steps.length; index += 1) {
        expect(effective[index]).toBeGreaterThanOrEqual(effective[index - 1]);
      }
      if (category === 'l') {
        expect(effective).toEqual(own);
      }
    }
    // Uncapped, heading 2 (Title 2) would pass heading 1 (Title 1) at AX5.
    expect(own[7] * dynamicTypeScale('title2', 'ax5')).toBeGreaterThan(
      own[8] * dynamicTypeScale('title1', 'ax5'),
    );
  });
});

describe('a theme that follows the reader text size', () => {
  const supportsBlock = (css: string): string => {
    const start = css.indexOf(`@supports ${DYNAMIC_TYPE_SUPPORTS} {`);
    return start === -1 ? '' : css.slice(start);
  };

  it('emits nothing unless it opts in', () => {
    const css = generateThemeCSS(defineTheme({name: 'dt-off'})).component;
    expect(css).not.toContain('-apple-system-body');
    expect(css).not.toContain('--_dynamic-type-');
  });

  it('scales its own raw sizes on iOS WebKit, after everything else', () => {
    const theme = defineTheme({
      name: 'dt-on',
      typography: {dynamicType: true, scale: {base: 15, ratio: 1.25}},
    });
    const css = generateThemeCSS(theme).component;
    const block = supportsBlock(css);
    expect(block).not.toBe('');
    // The category scales live on <html>, where the root Theme writes it.
    expect(block).toContain(`:root[${TEXT_SIZE_ATTRIBUTE}="xs"] {`);
    // Every step, from the theme's own value.
    expect(block).toContain('@scope ([data-astryx-theme="dt-on"])');
    for (const name of Object.keys(textSizeDefaults)) {
      const value = theme.tokens[name];
      expect(value).toBeDefined();
      expect(block).toContain(
        `${name}: ${name === '--font-size-5xl' ? '' : 'min('}calc(${value} * var(${dynamicTypeScaleProperty(FONT_SIZE_STEP_STYLES[name as keyof typeof FONT_SIZE_STEP_STYLES])}, 1))`,
      );
    }
    // Nothing but font sizes changes.
    expect(block).not.toMatch(/--spacing-|--radius-|--text-[a-z0-9-]+-leading/);
  });

  it('scales the sizes an adaptation rule writes inside its own condition', () => {
    const theme = defineTheme({
      name: 'dt-phone',
      typography: {dynamicType: true, scale: {base: 14, ratio: 1.2}},
      adaptations: {
        rules: [
          {
            when: {pointer: 'coarse', width: {below: 'lg'}},
            value: {typography: {scale: {base: 16, ratio: 1.1736}}},
          },
        ],
      },
    });
    const block = supportsBlock(generateThemeCSS(theme).component);
    const media = block.slice(block.indexOf('@media '));
    expect(media).toMatch(/^@media [^{]*pointer: coarse[^{]*\{/);
    expect(media).toContain(
      '--font-size-base: min(calc(1rem * var(--_dynamic-type-body, 1)), max(var(--font-size-lg), 1rem));',
    );
  });

  it('is inherited by a theme that extends it, and can be turned off', () => {
    const base = defineTheme({
      name: 'dt-base',
      typography: {dynamicType: true},
    });
    const child = defineTheme({name: 'dt-child', extends: base});
    const off = defineTheme({
      name: 'dt-child-off',
      extends: base,
      typography: {dynamicType: false},
    });
    expect(supportsBlock(generateThemeCSS(child).component)).toContain(
      '@scope ([data-astryx-theme="dt-child"])',
    );
    expect(supportsBlock(generateThemeCSS(off).component)).toBe('');
  });
});

describe('the root sync', () => {
  const html = document.documentElement;
  let observerCallback: (() => void) | null = null;
  let probeSize = '17px';

  /** iOS WebKit, as far as the sync can tell. */
  function pretendIOS(supports: boolean) {
    vi.stubGlobal('CSS', {supports: vi.fn(() => supports)});
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          observerCallback = callback;
        }
        observe() {}
        disconnect() {
          observerCallback = null;
        }
      },
    );
    const real = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation(element =>
      element instanceof HTMLElement &&
      element.hasAttribute('data-astryx-text-size-probe')
        ? ({fontSize: probeSize} as CSSStyleDeclaration)
        : real(element),
    );
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    html.removeAttribute(TEXT_SIZE_ATTRIBUTE);
    probeSize = '17px';
  });

  it('does nothing outside iOS WebKit', () => {
    pretendIOS(false);
    expect(syncTextSizeCategory(document)).toBeUndefined();
    expect(html.hasAttribute(TEXT_SIZE_ATTRIBUTE)).toBe(false);
    expect(document.querySelector('[data-astryx-text-size-probe]')).toBeNull();
  });

  it('writes the category, follows a change, and cleans up', () => {
    pretendIOS(true);
    probeSize = '23px';
    const cleanup = syncTextSizeCategory(document);
    const probe = document.querySelector<HTMLElement>(
      '[data-astryx-text-size-probe]',
    );
    expect(probe?.getAttribute('aria-hidden')).toBe('true');
    expect(probe?.style.getPropertyValue('visibility')).toBe('hidden');
    expect(html.getAttribute(TEXT_SIZE_ATTRIBUTE)).toBe('xxxl');

    // The reader moves the slider while the page is open: the probe resizes.
    probeSize = '53px';
    observerCallback?.();
    expect(html.getAttribute(TEXT_SIZE_ATTRIBUTE)).toBe('ax5');

    // A size that names no category clears it rather than guessing.
    probeSize = '18px';
    observerCallback?.();
    expect(html.hasAttribute(TEXT_SIZE_ATTRIBUTE)).toBe(false);

    cleanup?.();
    expect(document.querySelector('[data-astryx-text-size-probe]')).toBeNull();
    expect(observerCallback).toBeNull();
  });
});
