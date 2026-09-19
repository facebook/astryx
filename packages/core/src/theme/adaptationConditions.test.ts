// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file adaptationConditions.test.ts
 * Tests the shared AST-012 condition grammar (spec:AST-031 IR1): one
 * normalizer and one compiler serve theme CSS and component adaptations, with
 * the caller's own diagnostic path and axis set.
 */

import {describe, expect, it} from 'vitest';
import {
  COMPONENT_ADAPTATION_AXES,
  DEFAULT_WIDTH_BREAKPOINTS,
  THEME_ADAPTATION_AXES,
  WIDTH_BREAKPOINT_NAMES,
  compileAdaptationConditionQuery,
  normalizeAdaptationCondition,
  type ThemeAdaptationCondition,
} from './adaptationConditions';
import {defineTheme, generateAdaptationCSS} from './index';

const POINTS = DEFAULT_WIDTH_BREAKPOINTS;

function mediaPreludes(css: string): string[] {
  return [...css.matchAll(/@media ([^{]+) \{/g)].map(match => match[1]);
}

describe('shared axis vocabulary', () => {
  it('exposes the theme axes and the component subset', () => {
    expect(THEME_ADAPTATION_AXES).toEqual([
      'width',
      'pointer',
      'contrast',
      'motion',
    ]);
    expect(COMPONENT_ADAPTATION_AXES).toEqual(['width', 'pointer']);
    expect(WIDTH_BREAKPOINT_NAMES).toEqual(['sm', 'md', 'lg', 'xl', '2xl']);
  });
});

describe('normalizeAdaptationCondition', () => {
  it('keeps only defined fields and clones the input', () => {
    const input = {width: {from: 'md' as const}, pointer: undefined};
    const condition = normalizeAdaptationCondition(input, 'when');

    expect(condition).toEqual({width: {from: 'md'}});
    expect(condition.width).not.toBe(input.width);
  });

  it('names the caller path in every diagnostic', () => {
    expect(() =>
      normalizeAdaptationCondition(null, '<Selector adaptations>'),
    ).toThrow('<Selector adaptations> must be an object.');
    expect(() =>
      normalizeAdaptationCondition({}, 'theme.rules[2].when'),
    ).toThrow('theme.rules[2].when must contain at least one condition.');
    expect(() =>
      normalizeAdaptationCondition({width: {}}, 'theme.rules[2].when'),
    ).toThrow(
      'theme.rules[2].when.width must contain `from`, `below`, or both.',
    );
    expect(() =>
      normalizeAdaptationCondition({width: {from: 'xs'}}, 'p.when'),
    ).toThrow('p.when.width.from must be one of sm, md, lg, xl, 2xl.');
  });

  it('restricts the axis set to what the caller admits', () => {
    const themeCondition = {contrast: 'more' as const};
    expect(normalizeAdaptationCondition(themeCondition, 'theme.when')).toEqual(
      themeCondition,
    );

    expect(() =>
      normalizeAdaptationCondition(
        themeCondition,
        '<Selector adaptations>.rules[0].when',
        COMPONENT_ADAPTATION_AXES,
      ),
    ).toThrow(
      '<Selector adaptations>.rules[0].when.contrast is not supported.',
    );
    expect(() =>
      normalizeAdaptationCondition(
        {motion: 'reduce'},
        'p.when',
        COMPONENT_ADAPTATION_AXES,
      ),
    ).toThrow('p.when.motion is not supported.');
  });

  it('rejects unknown axes and malformed values for every caller', () => {
    expect(() => normalizeAdaptationCondition({hover: true}, 'p.when')).toThrow(
      'p.when.hover is not supported.',
    );
    expect(() =>
      normalizeAdaptationCondition({pointer: 'any'}, 'p.when'),
    ).toThrow("p.when.pointer must be 'coarse' or 'fine'.");
    expect(() =>
      normalizeAdaptationCondition({width: {size: 'md'}}, 'p.when'),
    ).toThrow('p.when.width.size is not supported.');
  });
});

describe('compileAdaptationConditionQuery', () => {
  it('lowers inclusive from and exclusive below edges', () => {
    expect(
      compileAdaptationConditionQuery({width: {below: 'md'}}, POINTS, 'p'),
    ).toBe('(width < 768px)');
    expect(
      compileAdaptationConditionQuery({width: {from: 'lg'}}, POINTS, 'p'),
    ).toBe('(width >= 1024px)');
    expect(
      compileAdaptationConditionQuery(
        {width: {from: 'lg', below: 'xl'}},
        POINTS,
        'p',
      ),
    ).toBe('(width >= 1024px) and (width < 1280px)');
  });

  it('ANDs axes in one stable order', () => {
    const condition: ThemeAdaptationCondition = {
      motion: 'reduce',
      pointer: 'coarse',
      width: {from: 'md', below: 'xl'},
      contrast: 'more',
    };

    expect(compileAdaptationConditionQuery(condition, POINTS, 'p')).toBe(
      '(width >= 768px) and (width < 1280px) and (pointer: coarse) and (prefers-contrast: more) and (prefers-reduced-motion: reduce)',
    );
  });

  it('resolves named points against the supplied map', () => {
    expect(
      compileAdaptationConditionQuery(
        {width: {below: 'md'}},
        {
          ...POINTS,
          md: 900,
        },
        'p',
      ),
    ).toBe('(width < 900px)');
  });

  it('rejects a range that does not resolve to from < below', () => {
    expect(() =>
      compileAdaptationConditionQuery(
        {width: {from: 'lg', below: 'md'}},
        POINTS,
        '<Selector adaptations>.rules[0].when',
      ),
    ).toThrow(
      '<Selector adaptations>.rules[0].when.width must resolve to `from < below`; lg is 1024px and md is 768px.',
    );
  });

  it('rejects an equal-edge range once a theme moves a point', () => {
    expect(() =>
      compileAdaptationConditionQuery(
        {width: {from: 'md', below: 'lg'}},
        {...POINTS, lg: 768},
        'p.when',
      ),
    ).toThrow('p.when.width must resolve to `from < below`');
  });

  it('rejects a condition with no concrete part', () => {
    expect(() => compileAdaptationConditionQuery({}, POINTS, 'p.when')).toThrow(
      'p.when must contain at least one concrete condition.',
    );
  });
});

describe('theme and component queries cannot diverge', () => {
  it('compiles the same string the theme CSS compiler emits', () => {
    const theme = defineTheme({
      name: 'shared-grammar-parity',
      adaptations: {
        widthBreakpoints: {md: 800},
        rules: [
          {
            when: {width: {below: 'md'}, pointer: 'coarse'},
            value: {tokens: {'--spacing-4': '12px'}},
          },
          {
            when: {width: {from: 'md', below: 'xl'}},
            value: {tokens: {'--spacing-4': '20px'}},
          },
        ],
      },
    });

    const points = theme.__adaptations.widthBreakpoints;
    const compiled = theme.__adaptations.rules.map(rule =>
      compileAdaptationConditionQuery(rule.when, points, 'p.when'),
    );

    expect(compiled).toEqual([
      '(width < 800px) and (pointer: coarse)',
      '(width >= 800px) and (width < 1280px)',
    ]);
    expect(mediaPreludes(generateAdaptationCSS(theme).component)).toEqual(
      compiled,
    );
  });
});
