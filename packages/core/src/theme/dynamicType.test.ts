// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dynamicType.test.ts
 * @input vitest, dynamicType.ts, the UIKit typography table, defineTheme and
 *   generateThemeCSS
 * @output Proves the Dynamic Type rules: Body's size names the reader's
 *   category, each raw font-size step scales exactly on its UIKit curve and is
 *   the theme's own size at Large, a theme emits the scaled sizes only when it
 *   opts in (root and adaptation rules, behind the capability alone), and the root sync
 *   writes and clears `<html data-astryx-text-size>`
 * @position Testing; validates theme/dynamicType.ts and its use in
 *   generateThemeRules.ts without a browser (the iOS evidence is the
 *   simulator's)
 */

import fs from 'node:fs';
import path from 'node:path';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {typography} from './uikitTypography';
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

/** A `rem` or `px` length, in px (16px to the rem). */
function lengthInPx(value: string | undefined): number {
  const match = /^(-?[\d.]+)(rem|px)$/.exec(value ?? '');
  if (match == null) {
    throw new Error(`not a length: ${value}`);
  }
  return Number(match[1]) * (match[2] === 'rem' ? 16 : 1);
}

/**
 * What the browser computes for the emitted font-size steps at one category,
 * in px: each expression evaluated (min, max, calc of a length times a
 * category scale, the next step's variable), from the largest step down.
 */
function computedSizes(
  entries: ReadonlyArray<readonly [string, string]>,
  category: (typeof TEXT_SIZE_CATEGORIES)[number],
): number[] {
  const variables = new Map<string, number>();
  for (const style of STYLES) {
    variables.set(
      dynamicTypeScaleProperty(style),
      dynamicTypeScale(style, category),
    );
  }
  const evaluate = (source: string): number => {
    let at = 0;
    const read = (text: string) => {
      if (!source.startsWith(text, at)) {
        throw new Error(`expected "${text}" at ${at} in ${source}`);
      }
      at += text.length;
    };
    const skipSpaces = () => {
      while (source[at] === ' ') {
        at += 1;
      }
    };
    const term = (): number => {
      skipSpaces();
      for (const [name, pick] of [
        ['min(', Math.min],
        ['max(', Math.max],
      ] as const) {
        if (source.startsWith(name, at)) {
          read(name);
          const first = term();
          read(',');
          const second = term();
          skipSpaces();
          read(')');
          return pick(first, second);
        }
      }
      if (source.startsWith('calc(', at)) {
        read('calc(');
        const left = term();
        skipSpaces();
        read('*');
        const right = term();
        skipSpaces();
        read(')');
        return left * right;
      }
      if (source.startsWith('var(', at)) {
        read('var(');
        const end = source.indexOf(')', at);
        const [name] = source.slice(at, end).split(',');
        at = end + 1;
        const value = variables.get(name.trim());
        if (value === undefined) {
          throw new Error(`unset ${name} in ${source}`);
        }
        return value;
      }
      const match = /^-?[\d.]+(rem|px)/.exec(source.slice(at));
      if (match == null) {
        throw new Error(`unexpected input at ${at} in ${source}`);
      }
      at += match[0].length;
      return lengthInPx(match[0]);
    };
    const value = term();
    skipSpaces();
    if (at !== source.length) {
      throw new Error(`trailing input at ${at} in ${source}`);
    }
    return value;
  };
  const sizes: number[] = [];
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const [name, expression] = entries[index];
    sizes[index] = evaluate(expression);
    variables.set(name, sizes[index]);
  }
  return sizes;
}

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

describe('the UIKit point sizes', () => {
  // The motion tables' rule for sources (motion/uikit/uikit.test.ts), applied
  // to this theme table: every row names where its values come from, and a
  // measurement names its subject, the iOS version and the date.
  const MEASURED =
    /^@source measured: .*iOS \d.*(\b20\d\d-\d\d-\d\d\b|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? 20\d\d\b)/;
  const SOURCE_KINDS =
    /^@source (apple-docs https:\/\/developer\.apple\.com\/|wwdc \d{4}-\d+ |webkit Source\/|measured: .*iOS \d|GUESS — )/;

  /** Each row's key and the `@source` tags of the JSDoc block above it. */
  function rowSources(): Map<string, string[]> {
    const text = fs.readFileSync(
      path.resolve(__dirname, 'uikitTypography.ts'),
      'utf8',
    );
    const body = text.slice(text.indexOf('export const typography = {'));
    const rows = new Map<string, string[]>();
    const pattern = /\/\*\*([\s\S]*?)\*\/\s*(\w+): \[/g;
    for (const match of body.matchAll(pattern)) {
      const doc = (match[1] ?? '')
        .split('\n')
        .map(line => line.replace(/^\s*\*\s?/, ''))
        .join('\n');
      // A tag continues on the following lines until the next tag.
      const tags = doc
        .split(/\n(?=@)/)
        .map(tag => tag.replace(/\s*\n\s*/g, ' ').trim())
        .filter(tag => tag.startsWith('@source'));
      rows.set(match[2] ?? '', tags);
    }
    return rows;
  }

  it("names a source for every row, in the motion tables' form", () => {
    const rows = rowSources();
    expect([...rows.keys()].sort()).toEqual(STYLES.slice().sort());
    for (const [style, tags] of rows) {
      expect(tags.length, style).toBeGreaterThan(0);
      for (const tag of tags) {
        expect(tag, style).toMatch(SOURCE_KINDS);
        if (tag.startsWith('@source measured:')) {
          expect(tag, style).toMatch(MEASURED);
        }
      }
    }
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

  it('keeps every ramp in order at every category, and its own sizes at Large', () => {
    // The ramps a theme gets from `typography.scale`: the neutral phone
    // profile, and the dense, default and airy starting points. A tight ramp
    // is the hard case: below Large, Body shrinks faster than Footnote (17 to
    // 14 against 13 to 12 at xs), so supporting text could pass body text.
    const ramps = [
      {base: 16, ratio: 1.1736},
      {base: 12, ratio: 1.125},
      {base: 14, ratio: 1.2},
      {base: 16, ratio: 1.25},
    ];
    const steps = Object.keys(FONT_SIZE_STEP_STYLES);
    for (const scale of ramps) {
      const theme = defineTheme({
        name: `dt-ramp-${scale.base}-${scale.ratio}`,
        typography: {dynamicType: true, scale},
      });
      const entries = scaledFontSizeEntries(theme.tokens);
      expect(entries.map(([name]) => name)).toEqual(steps);
      const own = steps.map(name => lengthInPx(theme.tokens[name]));
      for (const category of TEXT_SIZE_CATEGORIES) {
        const sizes = computedSizes(entries, category);
        const ramp = `${scale.base}/${scale.ratio} at ${category}`;
        for (let index = 1; index < steps.length; index += 1) {
          expect(
            sizes[index],
            `${steps[index]}, ${ramp}`,
          ).toBeGreaterThanOrEqual(sizes[index - 1] - 1e-9);
        }
        if (category === 'l') {
          sizes.forEach((size, index) => {
            expect(size, `${steps[index]}, ${ramp}`).toBeCloseTo(own[index], 9);
          });
        }
      }
    }
    // Uncapped, heading 2 (Title 2) would pass heading 1 (Title 1) at AX5.
    const own = (index: number) => 16 * 1.1736 ** (index - 5);
    expect(own(7) * dynamicTypeScale('title2', 'ax5')).toBeGreaterThan(
      own(8) * dynamicTypeScale('title1', 'ax5'),
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

  it('scales its own raw sizes where the engine provides the reader text size, after everything else', () => {
    const theme = defineTheme({
      name: 'dt-on',
      typography: {dynamicType: true, scale: {base: 15, ratio: 1.25}},
    });
    const css = generateThemeCSS(theme).component;
    const block = supportsBlock(css);
    expect(block).not.toBe('');
    // Gated by the capability alone: no touch-callout or pointer idiom (one
    // touch behavior on every touch device).
    expect(block.startsWith('@supports (font: -apple-system-body) {')).toBe(
      true,
    );
    expect(css).not.toContain('touch-callout');
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
    // A full ramp in order: each step is capped at the next one's scaled size.
    expect(media).toContain(
      '--font-size-base: min(calc(1rem * var(--_dynamic-type-body, 1)), var(--font-size-lg));',
    );
  });

  it('is a setting of the whole theme, not of an adaptation rule', () => {
    const theme = defineTheme({
      name: 'dt-rule-flag',
      adaptations: {
        rules: [
          {
            when: {pointer: 'coarse'},
            // @ts-expect-error a rule's typography cannot turn Dynamic Type on
            value: {typography: {dynamicType: true}},
          },
        ],
      },
    });
    expect(generateThemeCSS(theme).component).not.toContain('--_dynamic-type-');
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

  /**
   * An engine as the sync can see it: whether it provides
   * `font: -apple-system-body` (the capability), and whether it has a touch
   * callout (an iOS idiom the sync must not look at).
   */
  function pretendEngine({
    textSize,
    touchCallout = textSize,
  }: {
    textSize: boolean;
    touchCallout?: boolean;
  }) {
    vi.stubGlobal('CSS', {
      supports: vi.fn((property: string, value?: string) =>
        property === 'font' && value === '-apple-system-body'
          ? textSize
          : property === '-webkit-touch-callout'
            ? touchCallout
            : false,
      ),
    });
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

  // The gate is the capability alone, never a platform idiom (one touch
  // behavior on every touch device).
  it('does nothing where the engine has no font: -apple-system-body, touch callout or not', () => {
    pretendEngine({textSize: false, touchCallout: true});
    expect(syncTextSizeCategory(document)).toBeUndefined();
    expect(html.hasAttribute(TEXT_SIZE_ATTRIBUTE)).toBe(false);
    expect(document.querySelector('[data-astryx-text-size-probe]')).toBeNull();
  });

  it('follows the reader text size wherever the engine provides it, with no platform check', () => {
    pretendEngine({textSize: true, touchCallout: false});
    probeSize = '23px';
    const cleanup = syncTextSizeCategory(document);
    expect(html.getAttribute(TEXT_SIZE_ATTRIBUTE)).toBe('xxxl');
    cleanup?.();
  });

  it('writes no category where the keyword follows no reader setting (a fixed 13px Body, as on a Mac)', () => {
    pretendEngine({textSize: true, touchCallout: false});
    probeSize = '13px';
    const cleanup = syncTextSizeCategory(document);
    expect(cleanup).toBeTypeOf('function');
    expect(html.hasAttribute(TEXT_SIZE_ATTRIBUTE)).toBe(false);
    cleanup?.();
  });

  it('writes the category, follows a change, and cleans up', () => {
    pretendEngine({textSize: true});
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
