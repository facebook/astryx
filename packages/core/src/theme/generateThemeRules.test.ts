/**
 * @file generateThemeRules.test.ts
 * Tests that generateThemeRules produces correct, consistent CSS rules
 * for both runtime and build paths.
 */

import {describe, it, expect} from 'vitest';
import {defineTheme, generateThemeCSS, generateThemeRules} from './index';

const defaultInput = {
  name: 'default',
  typography: {scale: {base: 14, ratio: 1.2}},
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
    rules.forEach(r => expect(typeof r).toBe('string'));
  });

  // --- Token block ---

  it('includes :scope token block with type scale tokens', () => {
    const scopeRule = rules.find(r => r.includes(':scope'));
    expect(scopeRule).toBeDefined();
    // Raw size tokens are rem values
    expect(scopeRule).toContain('--text-base: 0.875rem');
    expect(scopeRule).toContain('--text-2xl: 1.5rem');
    // Semantic tokens are var() refs
    expect(scopeRule).toContain('--heading-1-size: var(--text-2xl)');
    expect(scopeRule).toContain('--heading-4-size: var(--text-base)');
    expect(scopeRule).toContain('--text-body-size: var(--text-base)');
    expect(scopeRule).toContain('--text-supporting-size: var(--text-sm)');
  });

  it('emits raw size tokens in rem', () => {
    const scopeRule = rules.find(r => r.includes(':scope'))!;
    // Raw tokens (--text-4xs through --text-4xl) should be in rem
    const rawSizeTokens = [
      '--text-4xs',
      '--text-3xs',
      '--text-2xs',
      '--text-xsm',
      '--text-sm',
      '--text-base',
      '--text-lg',
      '--text-xl',
      '--text-2xl',
      '--text-3xl',
      '--text-4xl',
    ];
    for (const token of rawSizeTokens) {
      const match = scopeRule.match(new RegExp(`${token}: ([^;]+)`));
      expect(match).not.toBeNull();
      expect(match![1]).toMatch(/rem$/);
    }
  });

  it('emits semantic size tokens as var() refs', () => {
    const scopeRule = rules.find(r => r.includes(':scope'))!;
    const semanticSizeTokens = scopeRule.match(
      /--(?:heading-\d|text-(?:body|large|label|code|supporting))-size: [^;]+/g,
    );
    expect(semanticSizeTokens).not.toBeNull();
    semanticSizeTokens!.forEach(m => {
      expect(m).toContain('var(--text-');
    });
  });

  it('emits line heights as unitless ratios', () => {
    const scopeRule = rules.find(r => r.includes(':scope'))!;
    const leadingMatches = scopeRule.match(
      /--(?:heading|text)-\w+-leading: [^;]+/g,
    );
    expect(leadingMatches).not.toBeNull();
    leadingMatches!.forEach(m => {
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
      const rule = rules.find(r => r.includes(`.xds-heading.level-${level}`));
      expect(rule).toBeDefined();
      expect(rule).toContain('font-family');
      expect(rule).toContain(`var(--heading-${level}-size)`);
      expect(rule).toContain(`var(--heading-${level}-weight)`);
      expect(rule).toContain(`var(--heading-${level}-leading)`);
    }
  });

  it('includes .xds-text.* rules for all 5 types', () => {
    for (const type of ['body', 'large', 'label', 'code', 'supporting']) {
      const rule = rules.find(r => r.includes(`.xds-text.${type}`));
      expect(rule).toBeDefined();
      expect(rule).toContain(`var(--text-${type}-size)`);
    }
  });

  it('includes explicit component overrides', () => {
    const buttonRule = rules.find(r => r.includes('.xds-button.secondary'));
    expect(buttonRule).toBeDefined();
    expect(buttonRule).toContain('light-dark(rgba(5, 54, 89, 0.1)');
  });

  // --- Prose rules ---

  it('includes prose heading rules with computed values', () => {
    const h1Rule = rules.find(
      r => r.trimStart().startsWith('h1 {') || r.includes('\n  h1 {'),
    );
    expect(h1Rule).toBeDefined();
    // Prose rules use val() helper which resolves to the token value (now a var ref)
    expect(h1Rule).toContain('var(--text-2xl)');
    expect(h1Rule).toContain('var(--font-weight-semibold)');
  });

  it('includes prose p rule with computed values', () => {
    const pRule = rules.find(
      r => r.trimStart().startsWith('p {') || r.includes('\n  p {'),
    );
    expect(pRule).toBeDefined();
    expect(pRule).toContain('var(--text-base)');
    expect(pRule).toContain('var(--color-text-primary)');
  });

  it('includes prose small, code, hr rules', () => {
    expect(rules.some(r => r.includes('small {'))).toBe(true);
    expect(rules.some(r => r.includes('code, pre {'))).toBe(true);
    expect(rules.some(r => r.includes('hr {'))).toBe(true);
  });

  // --- Prop-level color overrides ---

  it('includes color prop overrides for text and heading', () => {
    expect(rules.some(r => r.includes('.xds-text.primary'))).toBe(true);
    expect(rules.some(r => r.includes('.xds-text.secondary'))).toBe(true);
    expect(rules.some(r => r.includes('.xds-heading.primary'))).toBe(true);
    expect(rules.some(r => r.includes('.xds-heading.disabled'))).toBe(true);
    expect(rules.some(r => r.includes('.xds-text.active'))).toBe(true);
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
    typography: {
      scale: {base: 14, ratio: 1.2},
      heading: {weights: {3: 'bold'}},
    },
    tokens: {},
    components: {},
  });
  const rules = generateThemeRules(theme);

  it('reflects weight override in tokens', () => {
    const scopeRule = rules.find(r => r.includes(':scope'))!;
    expect(scopeRule).toContain('--heading-3-weight: var(--font-weight-bold)');
    // Other levels keep default
    expect(scopeRule).toContain(
      '--heading-1-weight: var(--font-weight-semibold)',
    );
  });

  it('reflects weight override in prose h3', () => {
    const h3Rule = rules.find(
      r => r.trimStart().startsWith('h3 {') || r.includes('\n  h3 {'),
    );
    expect(h3Rule).toBeDefined();
    expect(h3Rule).toContain('var(--font-weight-bold)');
  });
});
