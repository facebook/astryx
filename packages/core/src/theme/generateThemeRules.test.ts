/**
 * @file generateThemeRules.test.ts
 * Tests that generateThemeRules produces correct, consistent CSS rules
 * for both runtime and build paths.
 */

import {describe, it, expect} from 'vitest';
import {defineTheme, generateThemeCSS, generateThemeRules} from './index';

const defaultInput = {
  name: 'default',
  typeScale: {base: 14, ratio: 1.2} as const,
  tokens: {},
  components: {
    button: {
      'variant:secondary': {
        backgroundColor:
          'light-dark(rgba(5, 54, 89, 0.1), rgba(223, 226, 229, 0.2))',
      },
    },
  },
};

describe('generateThemeRules', () => {
  const theme = defineTheme(defaultInput);
  const rules = generateThemeRules(theme);

  it('produces an array of CSS rule strings', () => {
    expect(Array.isArray(rules)).toBe(true);
    expect(rules.length).toBeGreaterThan(0);
    rules.forEach((r) => expect(typeof r).toBe('string'));
  });

  // --- Token block ---

  it('includes :scope token block with type scale tokens', () => {
    const scopeRule = rules.find((r) => r.includes(':scope'));
    expect(scopeRule).toBeDefined();
    expect(scopeRule).toContain('--heading-1-size: 1.5rem');
    expect(scopeRule).toContain('--heading-4-size: 0.875rem');
    expect(scopeRule).toContain('--text-body-size: 0.875rem');
    expect(scopeRule).toContain('--text-supporting-size: 0.75rem');
  });

  it('emits font sizes in rem', () => {
    const scopeRule = rules.find((r) => r.includes(':scope'))!;
    const sizeMatches = scopeRule.match(/--(?:heading|text)-\w+-size: [^;]+/g);
    expect(sizeMatches).not.toBeNull();
    sizeMatches!.forEach((m) => {
      expect(m).toMatch(/rem$/);
      expect(m).not.toContain('px');
    });
  });

  it('emits line heights as unitless ratios', () => {
    const scopeRule = rules.find((r) => r.includes(':scope'))!;
    const leadingMatches = scopeRule.match(
      /--(?:heading|text)-\w+-leading: [^;]+/g,
    );
    expect(leadingMatches).not.toBeNull();
    leadingMatches!.forEach((m) => {
      expect(m).not.toContain('px');
      expect(m).not.toContain('rem');
      const val = parseFloat(m.split(': ')[1]);
      expect(val).toBeGreaterThan(1);
      expect(val).toBeLessThan(2);
    });
  });

  // --- Component overrides ---

  it('includes .xds-heading.level-* rules for all 6 levels', () => {
    for (let level = 1; level <= 6; level++) {
      const rule = rules.find((r) =>
        r.includes(`.xds-heading.level-${level}`),
      );
      expect(rule).toBeDefined();
      expect(rule).toContain('font-family');
      expect(rule).toContain(`var(--heading-${level}-size)`);
      expect(rule).toContain(`var(--heading-${level}-weight)`);
      expect(rule).toContain(`var(--heading-${level}-leading)`);
    }
  });

  it('includes .xds-text.* rules for all 5 types', () => {
    for (const type of ['body', 'large', 'label', 'code', 'supporting']) {
      const rule = rules.find((r) => r.includes(`.xds-text.${type}`));
      expect(rule).toBeDefined();
      expect(rule).toContain(`var(--text-${type}-size)`);
    }
  });

  it('includes explicit component overrides', () => {
    const buttonRule = rules.find((r) =>
      r.includes('.xds-button.secondary'),
    );
    expect(buttonRule).toBeDefined();
    expect(buttonRule).toContain('light-dark(rgba(5, 54, 89, 0.1)');
  });

  // --- Prose rules ---

  it('includes prose heading rules with computed values', () => {
    const h1Rule = rules.find(
      (r) => r.trimStart().startsWith('h1 {') || r.includes('\n  h1 {'),
    );
    expect(h1Rule).toBeDefined();
    expect(h1Rule).toContain('1.5rem');
    expect(h1Rule).toContain('var(--font-weight-semibold)');
  });

  it('includes prose p rule with computed values', () => {
    const pRule = rules.find(
      (r) => r.trimStart().startsWith('p {') || r.includes('\n  p {'),
    );
    expect(pRule).toBeDefined();
    expect(pRule).toContain('0.875rem');
    expect(pRule).toContain('var(--color-text-primary)');
  });

  it('includes prose small, code, hr rules', () => {
    expect(rules.some((r) => r.includes('small {'))).toBe(true);
    expect(rules.some((r) => r.includes('code, pre {'))).toBe(true);
    expect(rules.some((r) => r.includes('hr {'))).toBe(true);
  });

  // --- Prop-level color overrides ---

  it('includes color prop overrides for text and heading', () => {
    expect(rules.some((r) => r.includes('.xds-text.primary'))).toBe(true);
    expect(rules.some((r) => r.includes('.xds-text.secondary'))).toBe(true);
    expect(rules.some((r) => r.includes('.xds-heading.primary'))).toBe(true);
    expect(rules.some((r) => r.includes('.xds-heading.disabled'))).toBe(true);
    expect(rules.some((r) => r.includes('.xds-text.active'))).toBe(true);
  });

  // --- Consistency ---

  it('generateThemeCSS wraps rules in @scope', () => {
    const css = generateThemeCSS(theme);
    expect(css).toContain('@scope ([data-xds-theme="default"])');
    expect(css).toContain('to ([data-xds-theme])');
    // Every rule from generateThemeRules should appear in generateThemeCSS
    for (const rule of rules) {
      expect(css).toContain(rule);
    }
  });
});

describe('generateThemeRules with weight overrides', () => {
  const theme = defineTheme({
    name: 'custom-weights',
    typeScale: {
      base: 14,
      ratio: 1.2,
      weights: {
        heading: {3: 'var(--font-weight-bold)'},
      },
    },
    tokens: {},
    components: {},
  });
  const rules = generateThemeRules(theme);

  it('reflects weight override in tokens', () => {
    const scopeRule = rules.find((r) => r.includes(':scope'))!;
    expect(scopeRule).toContain(
      '--heading-3-weight: var(--font-weight-bold)',
    );
    // Other levels keep default
    expect(scopeRule).toContain(
      '--heading-1-weight: var(--font-weight-semibold)',
    );
  });

  it('reflects weight override in prose h3', () => {
    const h3Rule = rules.find(
      (r) => r.trimStart().startsWith('h3 {') || r.includes('\n  h3 {'),
    );
    expect(h3Rule).toBeDefined();
    expect(h3Rule).toContain('var(--font-weight-bold)');
  });
});
