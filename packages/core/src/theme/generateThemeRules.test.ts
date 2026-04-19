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
    expect(scopeRule).toContain('--font-size-base: 0.875rem');
    expect(scopeRule).toContain('--font-size-2xl: 1.5rem');
    // Semantic tokens are var() refs
    expect(scopeRule).toContain('--text-heading-1-size: var(--font-size-2xl)');
    expect(scopeRule).toContain('--text-heading-4-size: var(--font-size-base)');
    expect(scopeRule).toContain('--text-body-size: var(--font-size-base)');
    expect(scopeRule).toContain('--text-supporting-size: var(--font-size-sm)');
  });

  it('emits raw size tokens in rem', () => {
    const scopeRule = rules.find(r => r.includes(':scope'))!;
    // Raw tokens (--font-size-4xs through --font-size-4xl) should be in rem
    const rawSizeTokens = [
      '--font-size-4xs',
      '--font-size-3xs',
      '--font-size-2xs',
      '--font-size-xs',
      '--font-size-sm',
      '--font-size-base',
      '--font-size-lg',
      '--font-size-xl',
      '--font-size-2xl',
      '--font-size-3xl',
      '--font-size-4xl',
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
      /--(?:text-heading-\d|text-(?:body|large|label|code|supporting))-size: [^;]+/g,
    );
    expect(semanticSizeTokens).not.toBeNull();
    semanticSizeTokens!.forEach(m => {
      expect(m).toContain('var(--font-size-');
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
      expect(rule).toContain(`var(--text-heading-${level}-size)`);
      expect(rule).toContain(`var(--text-heading-${level}-weight)`);
      expect(rule).toContain(`var(--text-heading-${level}-leading)`);
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
      r => r.trimStart().startsWith(':where(h1)') || r.includes(':where(h1)'),
    );
    expect(h1Rule).toBeDefined();
    // Prose rules use val() helper which resolves to the token value (now a var ref)
    expect(h1Rule).toContain('var(--font-size-2xl)');
    expect(h1Rule).toContain('var(--font-weight-semibold)');
  });

  it('includes prose p rule with computed values', () => {
    const pRule = rules.find(
      r => r.trimStart().startsWith(':where(p)') || r.includes(':where(p)'),
    );
    expect(pRule).toBeDefined();
    expect(pRule).toContain('var(--font-size-base)');
    expect(pRule).toContain('var(--color-text-primary)');
  });

  it('includes prose small, code, hr rules', () => {
    expect(rules.some(r => r.includes(':where(small)'))).toBe(true);
    expect(rules.some(r => r.includes(':where(code, pre)'))).toBe(true);
    expect(rules.some(r => r.includes(':where(hr)'))).toBe(true);
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

  it('generateThemeCSS returns prose and component blocks with @scope', () => {
    const {prose, component} = generateThemeCSS(theme);
    const combined = prose + component;
    expect(combined).toContain('@scope ([data-xds-theme="default"])');
    expect(combined).toContain('to ([data-xds-theme])');
    // Every rule from generateThemeRules should appear in one of the blocks
    for (const rule of rules) {
      expect(combined).toContain(rule);
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
    expect(scopeRule).toContain(
      '--text-heading-3-weight: var(--font-weight-bold)',
    );
    // Other levels keep default
    expect(scopeRule).toContain(
      '--text-heading-1-weight: var(--font-weight-semibold)',
    );
  });

  it('reflects weight override in prose h3', () => {
    const h3Rule = rules.find(
      r => r.trimStart().startsWith(':where(h3)') || r.includes(':where(h3)'),
    );
    expect(h3Rule).toBeDefined();
    expect(h3Rule).toContain('var(--font-weight-bold)');
  });
});


// =============================================================================
// Derived var expansion
// =============================================================================

describe('derived var expansion', () => {
  it('emits borderRadius AND internal var for card', () => {
    const theme = defineTheme({
      name: 'test-derived',
      components: {
        card: {
          base: {borderRadius: '32px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const cardRule = rules.find(r => r.includes('.xds-card'));
    expect(cardRule).toBeDefined();
    expect(cardRule).toContain('border-radius: 32px');
    expect(cardRule).toContain('--card-radius: 32px');
  });

  it('emits borderRadius AND internal var for dropdown-menu', () => {
    const theme = defineTheme({
      name: 'test-derived-dropdown',
      components: {
        'dropdown-menu': {
          base: {borderRadius: '16px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.xds-dropdown-menu'));
    expect(rule).toBeDefined();
    expect(rule).toContain('border-radius: 16px');
    expect(rule).toContain('--dropdown-radius: 16px');
  });

  it('emits padding AND internal var for dropdown-menu', () => {
    const theme = defineTheme({
      name: 'test-derived-dropdown-pad',
      components: {
        'dropdown-menu': {
          base: {padding: '8px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.xds-dropdown-menu'));
    expect(rule).toBeDefined();
    expect(rule).toContain('--dropdown-padding: 8px');
  });

  it('emits internal vars for chat composer', () => {
    const theme = defineTheme({
      name: 'test-derived-chat',
      components: {
        chat: {
          base: {borderRadius: '24px', padding: '12px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.xds-chat'));
    expect(rule).toBeDefined();
    expect(rule).toContain('--composer-radius: 24px');
    expect(rule).toContain('--composer-padding: 12px');
  });

  it('emits internal var for button borderRadius', () => {
    const theme = defineTheme({
      name: 'test-derived-button',
      components: {
        button: {
          base: {borderRadius: '8px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.xds-button'));
    expect(rule).toBeDefined();
    expect(rule).toContain('border-radius: 8px');
    expect(rule).toContain('--button-radius: 8px');
  });

  it('does not emit derived vars for components without registry entries', () => {
    const theme = defineTheme({
      name: 'test-no-derived',
      components: {
        badge: {
          base: {borderRadius: '99px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.xds-badge'));
    expect(rule).toBeDefined();
    expect(rule).toContain('border-radius: 99px');
    // No internal var — badge has no derived registry entry
    expect(rule).not.toContain('--');
  });

  it('container expansion still works for card padding', () => {
    const theme = defineTheme({
      name: 'test-container',
      components: {
        card: {
          base: {padding: '20px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.xds-card'));
    expect(rule).toBeDefined();
    // Container expansion emits --xds-card-padding token
    expect(rule).toContain('--xds-card-padding: 20px');
  });

  it('handles variant-specific derived vars', () => {
    const theme = defineTheme({
      name: 'test-variant-derived',
      components: {
        card: {
          'variant:muted': {borderRadius: '16px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.xds-card.muted'));
    expect(rule).toBeDefined();
    expect(rule).toContain('border-radius: 16px');
    expect(rule).toContain('--card-radius: 16px');
  });
});


describe('brutalist-style derived expansion', () => {
  it('button borderRadius emits --button-radius for pill shape', () => {
    const theme = defineTheme({
      name: 'test-brutalist',
      radius: {base: 4, multiplier: 0},
      components: {
        button: {
          base: {borderRadius: '9999px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.xds-button'));
    expect(rule).toContain('border-radius: 9999px');
    expect(rule).toContain('--button-radius: 9999px');
  });

  it('card padding emits container tokens via derived expansion', () => {
    const theme = defineTheme({
      name: 'test-brutalist-card',
      components: {
        card: {
          base: {padding: '24px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.xds-card'));
    expect(rule).toBeDefined();
    expect(rule).toContain('--xds-card-padding: 24px');
  });

  it('dropdown-menu borderRadius + padding emit both derived vars', () => {
    const theme = defineTheme({
      name: 'test-brutalist-dropdown',
      components: {
        'dropdown-menu': {
          base: {borderRadius: '0px', padding: '4px'},
        },
      },
    });
    const rules = generateThemeRules(theme);
    const rule = rules.find(r => r.includes('.xds-dropdown-menu'));
    expect(rule).toBeDefined();
    expect(rule).toContain('border-radius: 0px');
    expect(rule).toContain('--dropdown-radius: 0px');
    expect(rule).toContain('--dropdown-padding: 4px');
  });
});
