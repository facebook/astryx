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
  FONT_SIZE_STEP_STYLES,
  TEXT_SIZE_CATEGORIES,
  dynamicTypeScale,
  dynamicTypeScaleProperty,
  dynamicTypeScaleRule,
  scaledFontSizeEntries,
  syncReaderTextSize,
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
  // Every row names where its values come from, and a measurement names its
  // subject, the iOS version and the date.
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

  it('names a source for every row, and the iOS version and date of every measurement', () => {
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

  it('gives the page a category its scales on :root, Large and an unnamed size none', () => {
    expect(dynamicTypeScaleRule('l')).toBe('');
    expect(dynamicTypeScaleRule(null)).toBe('');
    const ax5 = dynamicTypeScaleRule('ax5');
    expect(ax5).toMatch(/\n:root \{\n {2}--_dynamic-type-/);
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
        typography: {scale},
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

describe('every theme follows the reader text size', () => {
  /**
   * The value of `property` that wins where the media queries `holds` accepts
   * hold: the last declaration whose media queries all hold. Every declaration
   * a theme emits sits in its own scope at the same specificity, so source
   * order decides.
   */
  const winning = (
    css: string,
    property: string,
    holds: (query: string) => boolean,
  ): string | undefined => {
    const open: string[] = [];
    let value: string | undefined;
    for (const raw of css.split('\n')) {
      const line = raw.trim();
      if (line.endsWith('{') && !line.includes('}')) {
        open.push(line);
      } else if (line === '}') {
        open.pop();
      } else if (line.startsWith(`${property}:`)) {
        const media = open
          .filter(rule => rule.startsWith('@media '))
          .map(rule => rule.slice('@media '.length, -1).trim());
        if (media.every(holds)) {
          value = line.slice(property.length + 1, -1).trim();
        }
      }
    }
    return value;
  };
  const nowhere = () => false;
  const scaled = (name: string, value: string) =>
    `${name === '--font-size-5xl' ? '' : 'min('}calc(${value} * var(${dynamicTypeScaleProperty(FONT_SIZE_STEP_STYLES[name as keyof typeof FONT_SIZE_STEP_STYLES])}, 1))`;

  it('writes every font-size step a theme sets scaled, branded included, keeping its family', () => {
    for (const theme of [
      defineTheme({
        name: 'dt-scale',
        typography: {scale: {base: 15, ratio: 1.25}},
      }),
      defineTheme({
        name: 'dt-brand',
        typography: {
          scale: {base: 16, ratio: 1.2},
          body: {family: 'Outfit', fallbacks: 'sans-serif'},
        },
      }),
    ]) {
      const css = generateThemeCSS(theme).component;
      for (const name of Object.keys(textSizeDefaults)) {
        const value = theme.tokens[name];
        expect(value).toBeDefined();
        expect(
          winning(css, name, nowhere)?.startsWith(scaled(name, value)),
        ).toBe(true);
      }
      // Only sizes follow the reader: no family, line height, spacing or
      // anything else reads a scale.
      const readers = [
        ...css.matchAll(/(--[a-z0-9-]+|[a-z-]+): [^;]*--_dynamic-type-/g),
      ].map(match => match[1]);
      expect(
        readers.every(name =>
          /^--(font-size-|text-[a-z0-9-]+-size$)/.test(name),
        ),
      ).toBe(true);
    }
    expect(
      winning(
        generateThemeCSS(
          defineTheme({
            name: 'dt-brand-family',
            typography: {body: {family: 'Outfit', fallbacks: 'sans-serif'}},
          }),
        ).component,
        '--font-family-body',
        nowhere,
      ),
    ).toContain('Outfit');
  });

  it('leaves a theme that sets no type scale on the sizes it inherits, already scaled', () => {
    // A nested theme with no type scale of its own keeps the outer theme's
    // sizes; at the top of the page they are the core defaults, which the
    // root stylesheet scales below every theme.
    const css = generateThemeCSS(
      defineTheme({name: 'dt-colors-only', tokens: {'--color-accent': 'red'}}),
    ).component;
    for (const name of Object.keys(textSizeDefaults)) {
      expect(winning(css, name, nowhere)).toBeUndefined();
    }
    const rule = dynamicTypeScaleRule('ax5');
    expect(rule.startsWith('@layer astryx-base {\n:root {')).toBe(true);
    for (const [name, value] of Object.entries(textSizeDefaults)) {
      expect(rule).toContain(`  ${name}: ${scaled(name, value)}`);
    }
  });

  it('adds no theme option, prop or document attribute', () => {
    defineTheme({
      name: 'dt-no-option',
      // @ts-expect-error following the reader text size is not an option
      typography: {dynamicType: true},
    });
    const css = generateThemeCSS(
      defineTheme({
        name: 'dt-attr',
        typography: {scale: {base: 14, ratio: 1.2}},
      }),
    ).component;
    // The theme reads only the private scales the root Theme provides.
    expect(css).not.toContain('data-astryx-text-size');
    expect(css).not.toMatch(/:root/);
  });

  it('scales the sizes an adaptation rule writes inside its own condition', () => {
    const theme = defineTheme({
      name: 'dt-phone',
      typography: {scale: {base: 14, ratio: 1.2}},
      adaptations: {
        rules: [
          {
            when: {pointer: 'coarse', width: {below: 'lg'}},
            value: {typography: {scale: {base: 16, ratio: 1.1736}}},
          },
        ],
      },
    });
    const css = generateThemeCSS(theme).component;
    const phone = (query: string) => query.includes('pointer: coarse');
    // A full ramp in order: each step is capped at the next one's scaled size.
    expect(winning(css, '--font-size-base', phone)).toBe(
      'min(calc(1rem * var(--_dynamic-type-body, 1)), var(--font-size-lg))',
    );
    expect(winning(css, '--font-size-base', nowhere)).toBe(
      'min(calc(0.875rem * var(--_dynamic-type-body, 1)), var(--font-size-lg))',
    );
  });

  it('scales a size the theme fixes on the curve of the step it reads', () => {
    // Butter, Stone and Y2K fix supporting text at 12px. Supporting text reads
    // --font-size-sm by default, so the fixed size scales like Footnote
    // instead of staying 12px while every step grows.
    const theme = defineTheme({
      name: 'dt-fixed',
      tokens: {'--text-supporting-size': '12px'},
    });
    const css = generateThemeCSS(theme).component;
    const value = winning(css, '--text-supporting-size', nowhere);
    expect(value).toBe('calc(12px * var(--_dynamic-type-footnote, 1))');
    for (const category of TEXT_SIZE_CATEGORIES) {
      expect(
        computedSizes([['--text-supporting-size', value ?? '']], category)[0],
      ).toBeCloseTo(12 * dynamicTypeScale('footnote', category), 6);
    }
  });

  it('keeps the size each adaptation rule writes, scaling it when the rule fixes it', () => {
    // Butter and Stone's shape: a fixed size at the root, and a phone rule
    // whose scale turns it back into a step.
    const theme = defineTheme({
      name: 'dt-fixed-rules',
      typography: {scale: {base: 14, ratio: 1.25}},
      tokens: {'--text-supporting-size': '12px'},
      adaptations: {
        rules: [
          {
            when: {pointer: 'coarse', width: {below: 'lg'}},
            value: {typography: {scale: {base: 16, ratio: 1.2225}}},
          },
          {
            when: {pointer: 'fine'},
            value: {tokens: {'--text-supporting-size': '13px'}},
          },
        ],
      },
    });
    const css = generateThemeCSS(theme).component;
    const phone = (query: string) => query.includes('pointer: coarse');
    const mouse = (query: string) => query.includes('pointer: fine');
    // Outside every rule, the root's fixed size scales.
    expect(winning(css, '--text-supporting-size', nowhere)).toBe(
      'calc(12px * var(--_dynamic-type-footnote, 1))',
    );
    // On a phone the rule's step wins, and the step itself scales.
    expect(winning(css, '--text-supporting-size', phone)).toBe(
      'var(--font-size-sm)',
    );
    // A rule that fixes the size gets it scaled inside its own condition.
    expect(winning(css, '--text-supporting-size', mouse)).toBe(
      'calc(13px * var(--_dynamic-type-footnote, 1))',
    );
  });

  it('keeps !important outside the scaling expression, on a fixed size and on a step', () => {
    // `!important` inside calc() makes the value invalid where it is used, so
    // the text would fall back to its parent's size in every browser.
    const css = generateThemeCSS(
      defineTheme({
        name: 'dt-important',
        tokens: {
          '--text-supporting-size': '12px !important',
          '--font-size-base': '1rem !important',
        },
      }),
    ).component;
    expect(winning(css, '--text-supporting-size', nowhere)).toBe(
      'calc(12px * var(--_dynamic-type-footnote, 1)) !important',
    );
    const [[, plain]] = scaledFontSizeEntries({'--font-size-base': '1rem'});
    expect(winning(css, '--font-size-base', nowhere)).toBe(
      `${plain} !important`,
    );
    // The importance does not hide a length from the order check.
    expect(
      scaledFontSizeEntries({
        '--font-size-sm': '0.75rem',
        '--font-size-base': '0.875rem !important',
      }),
    ).toEqual([
      [
        '--font-size-sm',
        'min(calc(0.75rem * var(--_dynamic-type-footnote, 1)), var(--font-size-base))',
      ],
      [
        '--font-size-base',
        'min(calc(0.875rem * var(--_dynamic-type-body, 1)), max(var(--font-size-lg), 0.875rem)) !important',
      ],
    ]);
    for (const [name, value] of [
      [
        '--text-supporting-size',
        winning(css, '--text-supporting-size', nowhere),
      ],
      ['--font-size-base', winning(css, '--font-size-base', nowhere)],
    ]) {
      expect(value, name).not.toMatch(/!important.*\)/);
    }
  });

  it('scales only fixed sizes: a size that reads a variable or its parent is never scaled twice', () => {
    const tokens = {
      '--text-supporting-size': '0.75rem',
      '--text-heading-6-size': 'clamp(10px, 1vw + 6px, 12px)',
      '--text-heading-5-size': 'var(--font-size-xs)',
      '--text-label-size': 'calc(var(--font-size-base) + 1px)',
      '--text-code-size': '0.9em',
      '--text-large-size': '110%',
    };
    const css = generateThemeCSS(
      defineTheme({name: 'dt-fixed-only', tokens}),
    ).component;
    expect(winning(css, '--text-supporting-size', nowhere)).toBe(
      'calc(0.75rem * var(--_dynamic-type-footnote, 1))',
    );
    expect(winning(css, '--text-heading-6-size', nowhere)).toBe(
      'calc(clamp(10px, 1vw + 6px, 12px) * var(--_dynamic-type-caption1, 1))',
    );
    // The others keep what the theme wrote: a step already follows the
    // reader, and em or % follows the parent's size.
    for (const name of [
      '--text-heading-5-size',
      '--text-label-size',
      '--text-code-size',
      '--text-large-size',
    ] as const) {
      expect(winning(css, name, nowhere)).toBe(tokens[name]);
    }
  });

  it('lets a set size replace the phone base, smaller or larger, and scales the pinned role too', () => {
    // neutral's shape: a 14/1.2 scale whose phone rule moves the base to 16px
    // and pins Display 1 at its desktop 42px (design:mobile-typography DR1,
    // DR2). A size the reader set replaces that base and lifts the pin.
    const theme = defineTheme({
      name: 'dt-phone-profile',
      typography: {scale: {base: 14, ratio: 1.2}},
      adaptations: {
        rules: [
          {
            when: {pointer: 'coarse', width: {below: 'lg'}},
            value: {typography: {scale: {base: 16, ratio: 1.1736}}},
          },
        ],
      },
    });
    const phone = (
      theme as unknown as {
        __adaptationRules: {tokens: Record<string, string>}[];
      }
    ).__adaptationRules[0].tokens;
    const entries = scaledFontSizeEntries(phone);
    const at = (category: (typeof TEXT_SIZE_CATEGORIES)[number]) => {
      const sizes = computedSizes(entries, category);
      return Object.fromEntries(entries.map(([name], i) => [name, sizes[i]]));
    };
    // No size set: the phone base and the pinned Display 1 are the theme's.
    expect(at('l')['--font-size-base']).toBeCloseTo(16, 6);
    expect(at('l')['--font-size-5xl']).toBeCloseTo(42, 6);
    // A smaller size goes below the 16px base, a larger one above it.
    expect(at('xs')['--font-size-base']).toBeCloseTo((16 * 14) / 17, 6);
    expect(at('ax5')['--font-size-base']).toBeCloseTo((16 * 53) / 17, 6);
    // The pinned role scales too.
    expect(at('ax5')['--font-size-5xl']).toBeCloseTo((42 * 60) / 34, 6);
  });

  it('keeps the iOS text-entry floor: the root font size never changes, so text inputs stay at 16px', () => {
    // Only custom properties change, the root's font size never
    // (design:mobile-typography DR4): the page's rule declares nothing else.
    const rule = dynamicTypeScaleRule('xs');
    for (const line of rule.split('\n').filter(l => l.includes(':'))) {
      expect(line.trim().startsWith('--') || line.startsWith(':root')).toBe(
        true,
      );
    }
    // TextInput's iOS floor is 1rem, which therefore stays 16px however small
    // body text gets (family:input-fields FR9).
    const textInput = fs.readFileSync(
      path.resolve(__dirname, '../TextInput/TextInput.tsx'),
      'utf8',
    );
    expect(textInput).toContain(
      "`max(1rem, ${typeScaleVars['--text-body-size']})`",
    );
  });
});

describe('the root sync', () => {
  const html = document.documentElement;
  let observerCallback: (() => void) | null = null;
  let probeSize = '17px';

  /** A stylesheet as the sync can see one: its whole text. */
  class FakeSheet {
    text = '';
    replaceSync(text: string) {
      this.text = text;
    }
  }

  /**
   * An engine as the sync can see it: whether it provides
   * `font: -apple-system-body` (the capability), whether it has a touch
   * callout (an iOS idiom the sync must not look at), and whether it can
   * construct a stylesheet for the document to adopt.
   */
  function pretendEngine({
    textSize,
    touchCallout = textSize,
    constructable = true,
  }: {
    textSize: boolean;
    touchCallout?: boolean;
    constructable?: boolean;
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
    vi.stubGlobal('CSSStyleSheet', constructable ? FakeSheet : undefined);
    Object.defineProperty(document, 'adoptedStyleSheets', {
      configurable: true,
      writable: true,
      value: constructable ? [] : undefined,
    });
    const real = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation(element =>
      element instanceof HTMLElement &&
      element.hasAttribute('data-astryx-text-size-probe')
        ? ({fontSize: probeSize} as CSSStyleDeclaration)
        : real(element),
    );
  }

  /** The page's scales, from the stylesheets the document adopted. */
  const adoptedText = () =>
    ((document.adoptedStyleSheets ?? []) as unknown as FakeSheet[])
      .map(sheet => sheet.text)
      .join('');
  const htmlAttributes = () => html.getAttributeNames().sort().join(' ');

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete (document as {adoptedStyleSheets?: unknown}).adoptedStyleSheets;
    probeSize = '17px';
  });

  // The gate is the capability alone, never a platform idiom (one touch
  // behavior on every touch device).
  it('does nothing where the engine has no font: -apple-system-body, touch callout or not', () => {
    pretendEngine({textSize: false, touchCallout: true});
    expect(syncReaderTextSize(document)).toBeUndefined();
    expect(document.querySelector('[data-astryx-text-size-probe]')).toBeNull();
    expect(document.adoptedStyleSheets).toEqual([]);
  });

  it('follows the reader text size wherever the engine provides it, with no platform check', () => {
    pretendEngine({textSize: true, touchCallout: false});
    probeSize = '23px';
    const cleanup = syncReaderTextSize(document);
    expect(adoptedText()).toBe(dynamicTypeScaleRule('xxxl'));
    expect(adoptedText()).toContain(
      `${dynamicTypeScaleProperty('body')}: 1.3529;`,
    );
    cleanup?.();
  });

  it('scales nothing where the keyword follows no reader setting (a fixed 13px Body, as on a Mac)', () => {
    pretendEngine({textSize: true, touchCallout: false});
    probeSize = '13px';
    const cleanup = syncReaderTextSize(document);
    expect(cleanup).toBeTypeOf('function');
    expect(adoptedText()).toBe('');
    cleanup?.();
  });

  it('writes the scales, follows a change and cleans up, with an empty probe and nothing on <html>', () => {
    pretendEngine({textSize: true});
    const before = htmlAttributes();
    probeSize = '23px';
    const cleanup = syncReaderTextSize(document);
    const probe = document.querySelector<HTMLElement>(
      '[data-astryx-text-size-probe]',
    );
    // A hidden box, 1em square, that renders no text.
    expect(probe?.getAttribute('aria-hidden')).toBe('true');
    expect(probe?.style.getPropertyValue('visibility')).toBe('hidden');
    expect(probe?.style.getPropertyValue('inline-size')).toBe('1em');
    expect(probe?.textContent).toBe('');
    expect(adoptedText()).toBe(dynamicTypeScaleRule('xxxl'));

    // The reader moves the slider while the page is open: the probe resizes.
    probeSize = '53px';
    observerCallback?.();
    expect(adoptedText()).toBe(dynamicTypeScaleRule('ax5'));

    // A size that names no category clears the scales rather than guessing.
    probeSize = '18px';
    observerCallback?.();
    expect(adoptedText()).toBe('');
    expect(htmlAttributes()).toBe(before);

    cleanup?.();
    expect(document.adoptedStyleSheets).toEqual([]);
    expect(document.querySelector('[data-astryx-text-size-probe]')).toBeNull();
    expect(observerCallback).toBeNull();
  });

  it('does nothing where the engine cannot construct a stylesheet', () => {
    pretendEngine({textSize: true, constructable: false});
    probeSize = '53px';
    expect(syncReaderTextSize(document)).toBeUndefined();
    expect(document.querySelector('[data-astryx-text-size-probe]')).toBeNull();
    expect(document.querySelector('style')?.textContent ?? '').not.toContain(
      '--_dynamic-type-',
    );
  });
});
