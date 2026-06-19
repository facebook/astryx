// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import type {IconRegistry} from '../Icon/globalIconRegistry';
import {
  defineTheme,
  generateThemeCSS,
  generateThemeCSSFlat,
  isDefinedTheme,
} from './defineTheme';

describe('defineTheme', () => {
  it('creates a theme with name', () => {
    const theme = defineTheme({name: 'test'});
    expect(theme.name).toBe('test');
  });

  it('stores only specified token overrides', () => {
    const theme = defineTheme({
      name: 'custom',
      tokens: {
        '--color-accent': '#FF0000',
      },
    });
    // Override should be present
    expect(theme.tokens['--color-accent']).toBe('#FF0000');
    // Defaults should NOT be in tokens
    expect(theme.tokens['--color-background-surface']).toBeUndefined();
  });

  it('converts [light, dark] tuples to light-dark()', () => {
    const theme = defineTheme({
      name: 'tuple-test',
      tokens: {
        '--color-accent': ['#0077B6', '#48CAE4'],
      },
    });
    expect(theme.tokens['--color-accent']).toBe('light-dark(#0077B6, #48CAE4)');
    expect(theme.tokens['--color-accent']).toBe('light-dark(#0077B6, #48CAE4)');
  });

  it('passes through string values as-is', () => {
    const theme = defineTheme({
      name: 'string-test',
      tokens: {
        '--radius-container': '16px',
      },
    });
    expect(theme.tokens['--radius-container']).toBe('16px');
  });

  it('mixes tuples and strings', () => {
    const theme = defineTheme({
      name: 'mixed',
      tokens: {
        '--color-accent': ['#0077B6', '#48CAE4'],
        '--radius-container': '16px',
        '--font-family-heading': '"Georgia", serif',
      },
    });
    expect(theme.tokens['--color-accent']).toBe('light-dark(#0077B6, #48CAE4)');
    expect(theme.tokens['--radius-container']).toBe('16px');
    expect(theme.tokens['--font-family-heading']).toBe('"Georgia", serif');
  });

  it('accepts unknown token names without warning (types provide guardrails)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const theme = defineTheme({
      name: 'custom',
      tokens: {
        // @ts-expect-error testing unknown token
        '--color-does-not-exist': '#FF0000',
      },
    });
    // No runtime warning — TypeScript catches typos at compile time
    expect(warn).not.toHaveBeenCalled();
    // But the token is still set (themes are just CSS custom properties)
    expect(theme.tokens['--color-does-not-exist']).toBe('#FF0000');
    warn.mockRestore();
  });

  it('includes icons in the theme', () => {
    const icons = {close: 'X'} as Partial<IconRegistry>;
    const theme = defineTheme({name: 'icons', icons});
    expect(theme.icons).toBe(icons);
  });

  it('works with no tokens', () => {
    const theme = defineTheme({name: 'bare'});
    expect(Object.keys(theme.tokens)).toHaveLength(0);
  });
});

describe('generateThemeCSS', () => {
  it('generates CSS with only overrides', () => {
    const theme = defineTheme({
      name: 'ocean',
      tokens: {
        '--color-accent': ['#0077B6', '#48CAE4'],
        '--radius-container': '16px',
      },
    });
    const css = generateThemeCSSFlat(theme);
    expect(css).toContain('@scope');
    expect(css).toContain('--color-accent: light-dark(#0077B6, #48CAE4)');
    expect(css).toContain('--radius-container: 16px');
    // :scope should NOT contain non-overridden tokens
    expect(css).not.toContain('--color-background-surface:');
  });

  it('includes prose rules even with no overrides', () => {
    const theme = defineTheme({name: 'empty'});
    const css = generateThemeCSSFlat(theme);
    expect(css).toContain('@scope');
    expect(css).toContain(':where(h1, h2, h3, h4, h5, h6)');
    expect(css).toContain('font-family: var(--font-family-heading)');
  });

  it('splits prose into reset layer and components into xds-theme', () => {
    const theme = defineTheme({
      name: 'split-test',
      components: {
        button: {'variant:secondary': {backgroundColor: 'red'}},
      },
    });
    const {prose, component} = generateThemeCSS(theme);
    // Prose block should contain element defaults
    expect(prose).toContain(':where(p)');
    expect(prose).toContain(':where(h1, h2, h3, h4, h5, h6)');
    expect(prose).toContain('@scope');
    // Prose should NOT contain component overrides
    expect(prose).not.toContain('.xds-button');
    // Component block should contain overrides
    expect(component).toContain('.xds-button');
    expect(component).toContain('@scope');
    // Component should NOT contain prose element rules
    expect(component).not.toContain(':where(p)');
  });
});

describe('isDefinedTheme', () => {
  it('returns true for defineTheme output', () => {
    const theme = defineTheme({name: 'test'});
    expect(isDefinedTheme(theme)).toBe(true);
  });

  it('returns false for legacy theme objects', () => {
    const legacy = {name: 'old', styles: {}, icons: undefined};
    expect(isDefinedTheme(legacy)).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isDefinedTheme(null)).toBe(false);
    expect(isDefinedTheme(undefined)).toBe(false);
  });
});

describe('component overrides', () => {
  it('passes components through to the theme', () => {
    const theme = defineTheme({
      name: 'styled',
      components: {
        card: {
          base: {borderWidth: '2px', borderColor: 'var(--color-accent)'},
        },
        button: {
          base: {borderRadius: '999px'},
        },
      },
    });
    expect(theme.components?.card?.base).toEqual({
      borderWidth: '2px',
      borderColor: 'var(--color-accent)',
    });
    expect(theme.components?.button?.base).toEqual({borderRadius: '999px'});
  });
});

describe('generateThemeCSS with components', () => {
  it('generates scoped CSS for base component overrides', () => {
    const theme = defineTheme({
      name: 'ocean',
      tokens: {
        '--color-accent': ['#0077B6', '#48CAE4'],
      },
      components: {
        card: {
          base: {borderWidth: '2px', borderColor: 'var(--color-accent)'},
        },
        button: {
          base: {borderRadius: '999px'},
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    expect(css).toContain('.xds-card {');
    expect(css).toContain('border-width: 2px');
    expect(css).toContain('border-color: var(--color-accent)');
    expect(css).toContain('.xds-button {');
    expect(css).toContain('border-radius: 999px');
  });

  it('generates variant selectors from prop:value keys', () => {
    const theme = defineTheme({
      name: 'test',
      components: {
        button: {
          'variant:secondary': {
            backgroundColor: 'rgba(0,0,0,0.06)',
          },
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    expect(css).toContain('.xds-button.secondary');
    expect(css).toContain('background-color: rgba(0,0,0,0.06)');
  });

  it('generates compound selectors from prop:value+prop:value keys', () => {
    const theme = defineTheme({
      name: 'test',
      components: {
        button: {
          'variant:destructive+size:sm': {
            padding: '2px 6px',
          },
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    expect(css).toContain('.xds-button.destructive.sm');
    expect(css).toContain('padding: 2px 6px');
  });

  it('converts camelCase to kebab-case', () => {
    const theme = defineTheme({
      name: 'test',
      components: {
        heading: {
          base: {fontFamily: '"Playfair Display", serif'},
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    expect(css).toContain('font-family: "Playfair Display", serif');
    expect(css).not.toContain('fontFamily');
  });

  it('combines tokens and components', () => {
    const theme = defineTheme({
      name: 'combo',
      tokens: {'--radius-container': '20px'},
      components: {
        card: {base: {borderWidth: '1px'}},
      },
    });
    const css = generateThemeCSSFlat(theme);
    expect(css).toContain('@scope');
    expect(css).toContain('--radius-container: 20px');
    expect(css).toContain('.xds-card {');
    expect(css).toContain('border-width: 1px');
  });
});

describe('typography.scale', () => {
  it('generates typography token overrides when typography.scale is provided', () => {
    const theme = defineTheme({
      name: 'dense',
      typography: {scale: {base: 12, ratio: 1.125}},
    });
    // Semantic tokens are now var() refs; raw token has the computed value
    expect(theme.tokens['--text-heading-4-size']).toBe('var(--font-size-base)');
    expect(theme.tokens['--font-size-base']).toBe('0.75rem');
    expect(theme.tokens['--text-body-size']).toBe('var(--font-size-base)');
  });

  it('generates 44 tokens (11 raw size + 33 semantic)', () => {
    const theme = defineTheme({
      name: 'custom',
      typography: {scale: {base: 14, ratio: 1.2}},
    });
    // 12 raw size (--font-size-4xs…--font-size-5xl) + 18 heading + 24 text = 54
    const typeScaleKeys = Object.keys(theme.tokens).filter(
      k => k.startsWith('--font-size-') || k.startsWith('--text-'),
    );
    expect(typeScaleKeys).toHaveLength(54);
  });

  it('explicit tokens override scale-generated values', () => {
    const theme = defineTheme({
      name: 'override-test',
      typography: {scale: {base: 14, ratio: 1.2}},
      tokens: {
        '--text-heading-1-size': '40px',
      },
    });
    // Explicit token should win over typography.scale
    expect(theme.tokens['--text-heading-1-size']).toBe('40px');
    // Non-overridden scale token should still be a var() ref
    expect(theme.tokens['--text-heading-4-size']).toBe('var(--font-size-base)');
  });

  it('works without typography.scale (backwards compatible)', () => {
    const theme = defineTheme({name: 'no-scale'});
    // No type scale tokens should be present
    expect(theme.tokens['--text-heading-1-size']).toBeUndefined();
  });

  it('combines typography.scale with other token overrides', () => {
    const theme = defineTheme({
      name: 'combo',
      typography: {scale: {base: 16, ratio: 1.25}},
      tokens: {
        '--color-accent': '#FF0000',
      },
    });
    expect(theme.tokens['--color-accent']).toBe('#FF0000');
    expect(theme.tokens['--text-heading-4-size']).toBe('var(--font-size-base)');
    expect(theme.tokens['--font-size-base']).toBe('1rem');
  });
});

describe('typography.scale component auto-generation', () => {
  it('auto-generates heading component overrides when typography.scale is provided', () => {
    const theme = defineTheme({
      name: 'auto',
      typography: {scale: {base: 14, ratio: 1.2}},
    });
    expect(theme.components?.heading?.['level:1']).toBeDefined();
    expect(theme.components?.heading?.['level:1']?.fontSize).toBe(
      'var(--text-heading-1-size)',
    );
  });

  it('auto-generates text component overrides when typography.scale is provided', () => {
    const theme = defineTheme({
      name: 'auto',
      typography: {scale: {base: 14, ratio: 1.2}},
    });
    expect(theme.components?.text?.['type:body']).toBeDefined();
    expect(theme.components?.text?.['type:body']?.fontSize).toBe(
      'var(--text-body-size)',
    );
  });

  it('does not include color in auto-generated rules', () => {
    const theme = defineTheme({
      name: 'auto',
      typography: {scale: {base: 14, ratio: 1.2}},
    });
    expect(theme.components?.heading?.['level:1']?.color).toBeUndefined();
    expect(theme.components?.text?.['type:supporting']?.color).toBeUndefined();
  });

  it('explicit components deep-merge on top of auto-generated', () => {
    const theme = defineTheme({
      name: 'custom',
      typography: {scale: {base: 14, ratio: 1.2}},
      components: {
        heading: {
          'level:1': {letterSpacing: '-0.02em'},
        },
        button: {
          base: {borderRadius: '999px'},
        },
      },
    });
    // Auto-generated heading props still present
    expect(theme.components?.heading?.['level:1']?.fontSize).toBe(
      'var(--text-heading-1-size)',
    );
    // Explicit override merged on top
    expect(theme.components?.heading?.['level:1']?.letterSpacing).toBe(
      '-0.02em',
    );
    // Non-typography component preserved
    expect(theme.components?.button?.base?.borderRadius).toBe('999px');
  });

  it('does not generate components when typography.scale is absent', () => {
    const theme = defineTheme({name: 'bare'});
    expect(theme.components).toBeUndefined();
  });

  it('explicit heading overrides win over auto-generated', () => {
    const theme = defineTheme({
      name: 'override',
      typography: {scale: {base: 14, ratio: 1.2}},
      components: {
        heading: {
          'level:1': {fontFamily: '"Playfair Display", serif'},
        },
      },
    });
    // Explicit fontFamily wins
    expect(theme.components?.heading?.['level:1']?.fontFamily).toBe(
      '"Playfair Display", serif',
    );
    // Auto-generated fontSize still present
    expect(theme.components?.heading?.['level:1']?.fontSize).toBe(
      'var(--text-heading-1-size)',
    );
  });
});

describe('radius', () => {
  it('generates radius tokens from radius', () => {
    const theme = defineTheme({
      name: 'rounded',
      radius: {base: 4, multiplier: 1.5},
    });
    expect(theme.tokens['--radius-inner']).toBe('6px');
    expect(theme.tokens['--radius-element']).toBe('12px');
    expect(theme.tokens['--radius-container']).toBe('18px');
    expect(theme.tokens['--radius-page']).toBe('42px');
    expect(theme.tokens['--radius-none']).toBe('0px');
    expect(theme.tokens['--radius-full']).toBe('9999px');
  });

  it('explicit tokens override radius', () => {
    const theme = defineTheme({
      name: 'custom',
      radius: {base: 4, multiplier: 1},
      tokens: {'--radius-container': '20px'},
    });
    expect(theme.tokens['--radius-container']).toBe('20px');
    expect(theme.tokens['--radius-element']).toBe('8px'); // from radius
  });

  it('radius with multiplier 0 produces sharp theme', () => {
    const theme = defineTheme({
      name: 'sharp',
      radius: {base: 4, multiplier: 0},
    });
    expect(theme.tokens['--radius-inner']).toBe('0px');
    expect(theme.tokens['--radius-element']).toBe('0px');
    expect(theme.tokens['--radius-container']).toBe('0px');
    expect(theme.tokens['--radius-page']).toBe('0px');
    expect(theme.tokens['--radius-none']).toBe('0px');
    expect(theme.tokens['--radius-full']).toBe('9999px');
  });

  it('works without radius (backwards compatible)', () => {
    const theme = defineTheme({name: 'no-scale'});
    expect(theme.tokens['--radius-none']).toBeUndefined();
  });

  it('combines radius with typography.scale and other tokens', () => {
    const theme = defineTheme({
      name: 'combo',
      typography: {scale: {base: 16, ratio: 1.25}},
      radius: {base: 4, multiplier: 1},
      tokens: {
        '--color-accent': '#FF0000',
      },
    });
    expect(theme.tokens['--color-accent']).toBe('#FF0000');
    expect(theme.tokens['--text-heading-4-size']).toBe('var(--font-size-base)');
    expect(theme.tokens['--radius-element']).toBe('8px');
  });
});

describe('custom status via components', () => {
  it('passes custom status through components as status:value keys', () => {
    const theme = defineTheme({
      name: 'banner-status',
      components: {
        banner: {
          'status:neutral': {
            backgroundColor: 'var(--color-background-muted)',
          },
        },
      },
    });
    expect(theme.components?.banner?.['status:neutral']).toEqual({
      backgroundColor: 'var(--color-background-muted)',
    });
  });

  it('generates correct CSS selectors for banner status extensions', () => {
    const theme = defineTheme({
      name: 'banner-css',
      components: {
        banner: {
          'status:neutral': {
            backgroundColor: 'var(--color-background-muted)',
          },
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    // parseStyleKey('status:neutral') → '.neutral', so CSS should have .xds-banner.neutral
    expect(css).toContain('.xds-banner.neutral');
    expect(css).toContain('background-color: var(--color-background-muted)');
  });

  it('custom button variant via components', () => {
    const theme = defineTheme({
      name: 'button-variant',
      components: {
        button: {
          'variant:primary-muted': {
            backgroundColor: '#ECF5FF',
          },
        },
      },
    });
    expect(theme.components?.button?.['variant:primary-muted']).toEqual({
      backgroundColor: '#ECF5FF',
    });
  });

  it('generates correct CSS for custom button variant', () => {
    const theme = defineTheme({
      name: 'button-css',
      components: {
        button: {
          'variant:primary-muted': {
            backgroundColor: '#ECF5FF',
          },
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    expect(css).toContain('.xds-button.primary-muted');
    expect(css).toContain('background-color: #ECF5FF');
  });

  it('combines custom status with base and token overrides', () => {
    const theme = defineTheme({
      name: 'combo',
      tokens: {'--color-accent': '#FF0000'},
      components: {
        banner: {
          'status:neutral': {
            backgroundColor: 'var(--color-background-muted)',
            color: 'gray',
          },
        },
        button: {base: {borderRadius: '999px'}},
      },
    });
    expect(theme.tokens['--color-accent']).toBe('#FF0000');
    expect(theme.components?.banner?.['status:neutral']).toEqual({
      backgroundColor: 'var(--color-background-muted)',
      color: 'gray',
    });
    expect(theme.components?.button?.base?.borderRadius).toBe('999px');
  });

  it('does not have a variants field on the output', () => {
    const theme = defineTheme({
      name: 'no-variants',
      components: {
        banner: {
          'status:neutral': {backgroundColor: 'gray'},
        },
      },
    });
    expect(theme).not.toHaveProperty('variants');
  });
});

describe('typography font family derivation', () => {
  it('derives font family tokens from typography roles', () => {
    const theme = defineTheme({
      name: 'family-tokens',
      typography: {
        body: {family: 'Geist', fallbacks: '-apple-system, sans-serif'},
        code: {family: 'Geist Mono', fallbacks: '"SF Mono", monospace'},
      },
    });
    expect(theme.tokens['--font-family-body']).toBe(
      'Geist, -apple-system, sans-serif',
    );
    expect(theme.tokens['--font-family-heading']).toBe(
      'Geist, -apple-system, sans-serif',
    ); // inherited from body
    expect(theme.tokens['--font-family-code']).toBe(
      '"Geist Mono", "SF Mono", monospace',
    );
  });

  it('heading family overrides body when specified', () => {
    const theme = defineTheme({
      name: 'heading-override',
      typography: {
        body: {family: 'Inter', fallbacks: 'sans-serif'},
        heading: {family: 'Playfair Display', fallbacks: 'serif'},
      },
    });
    expect(theme.tokens['--font-family-body']).toBe('Inter, sans-serif');
    expect(theme.tokens['--font-family-heading']).toBe(
      '"Playfair Display", serif',
    );
  });

  it('explicit tokens override typography-derived font tokens', () => {
    const theme = defineTheme({
      name: 'token-wins',
      typography: {
        body: {family: 'Geist', fallbacks: 'sans-serif'},
      },
      tokens: {'--font-family-heading': '"Custom", serif'},
    });
    // Explicit token wins over typography-derived
    expect(theme.tokens['--font-family-heading']).toBe('"Custom", serif');
    // Body still comes from typography
    expect(theme.tokens['--font-family-body']).toBe('Geist, sans-serif');
  });

  it('combines typography with scale and tokens', () => {
    const theme = defineTheme({
      name: 'combo',
      typography: {
        scale: {base: 14, ratio: 1.2},
        body: {
          family: 'Figtree',
          fallbacks: 'sans-serif',
        },
      },
    });
    expect(theme.name).toBe('combo');
    expect(theme.tokens['--font-family-body']).toBe('Figtree, sans-serif');
    // scale tokens should still be present
    expect(theme.tokens['--text-heading-4-size']).toBeDefined();
  });
});

describe('typography weight derivation', () => {
  it('applies heading weight from typography role', () => {
    const theme = defineTheme({
      name: 'heading-weight',
      typography: {
        scale: {base: 14, ratio: 1.2},
        heading: {weight: 'bold'},
      },
    });
    // All heading levels should get bold weight
    expect(theme.tokens['--text-heading-1-weight']).toBe(
      'var(--font-weight-bold)',
    );
    expect(theme.tokens['--text-heading-4-weight']).toBe(
      'var(--font-weight-bold)',
    );
  });

  it('per-level heading weights override default heading weight', () => {
    const theme = defineTheme({
      name: 'per-level',
      typography: {
        scale: {base: 14, ratio: 1.2},
        heading: {
          weight: 'semibold',
          weights: {3: 'bold', 4: 'bold'},
        },
      },
    });
    expect(theme.tokens['--text-heading-1-weight']).toBe(
      'var(--font-weight-semibold)',
    );
    expect(theme.tokens['--text-heading-3-weight']).toBe(
      'var(--font-weight-bold)',
    );
    expect(theme.tokens['--text-heading-4-weight']).toBe(
      'var(--font-weight-bold)',
    );
  });

  it('body weight flows to text body token', () => {
    const theme = defineTheme({
      name: 'body-weight',
      typography: {
        scale: {base: 14, ratio: 1.2},
        body: {weight: 'medium'},
      },
    });
    expect(theme.tokens['--text-body-weight']).toBe(
      'var(--font-weight-medium)',
    );
  });

  it('code weight flows to text code token', () => {
    const theme = defineTheme({
      name: 'code-weight',
      typography: {
        scale: {base: 14, ratio: 1.2},
        code: {weight: 'medium'},
      },
    });
    expect(theme.tokens['--text-code-weight']).toBe(
      'var(--font-weight-medium)',
    );
  });

  it('named weight maps to var reference', () => {
    const theme = defineTheme({
      name: 'named-weight',
      typography: {
        scale: {base: 14, ratio: 1.2},
        heading: {weight: 'normal'},
      },
    });
    expect(theme.tokens['--text-heading-1-weight']).toBe(
      'var(--font-weight-normal)',
    );
  });

  it('raw CSS weight value passes through', () => {
    const theme = defineTheme({
      name: 'raw-weight',
      typography: {
        scale: {base: 14, ratio: 1.2},
        heading: {weight: '900'},
      },
    });
    expect(theme.tokens['--text-heading-1-weight']).toBe('900');
  });
});

describe('pseudo-class overrides in components', () => {
  it('generates pseudo-class rules from nested objects', () => {
    const theme = defineTheme({
      name: 'pseudo',
      components: {
        radio: {
          base: {
            borderColor: '#8F9296',
            ':hover': {
              borderColor: 'color-mix(in srgb, #8F9296, black 20%)',
            },
          },
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    // Base rule
    expect(css).toContain('.xds-radio {');
    expect(css).toContain('border-color: #8F9296');
    // Pseudo rule — separate selector
    expect(css).toContain('.xds-radio:hover {');
    expect(css).toContain(
      'border-color: color-mix(in srgb, #8F9296, black 20%)',
    );
  });

  it('generates pseudo-class rules on variant selectors', () => {
    const theme = defineTheme({
      name: 'pseudo-variant',
      components: {
        button: {
          'variant:primary-muted': {
            backgroundColor: '#ECF5FF',
            ':hover': {
              backgroundColor: '#D6EBFF',
            },
            ':focus-visible': {
              outline: '2px solid var(--color-accent)',
            },
          },
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    expect(css).toContain('.xds-button.primary-muted {');
    expect(css).toContain('background-color: #ECF5FF');
    expect(css).toContain('.xds-button.primary-muted:hover {');
    expect(css).toContain('background-color: #D6EBFF');
    expect(css).toContain('.xds-button.primary-muted:focus-visible {');
    expect(css).toContain('outline: 2px solid var(--color-accent)');
  });

  it('handles pseudo-only overrides (no base properties)', () => {
    const theme = defineTheme({
      name: 'pseudo-only',
      components: {
        switch: {
          base: {
            ':hover': {
              backgroundColor: 'color-mix(in srgb, #8F9296, black 5%)',
            },
          },
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    // Should NOT emit an empty base rule
    expect(css).not.toMatch(/\.xds-switch\s*\{\s*\}/);
    // Should emit the pseudo rule
    expect(css).toContain('.xds-switch:hover {');
  });

  it('keeps non-pseudo string values as regular properties', () => {
    const theme = defineTheme({
      name: 'mixed',
      components: {
        card: {
          base: {
            borderWidth: '2px',
            borderColor: 'var(--color-accent)',
          },
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    expect(css).toContain('.xds-card {');
    expect(css).toContain('border-width: 2px');
    expect(css).toContain('border-color: var(--color-accent)');
    // No pseudo rules
    expect(css).not.toContain('.xds-card:');
  });
});

describe('container padding mapping', () => {
  it('maps uniform padding to shorthand token on card', () => {
    const theme = defineTheme({
      name: 'test',
      components: {
        card: {
          base: {padding: '20px'},
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    // Should NOT emit raw padding property (only the scoped token)
    expect(css).not.toMatch(/[^-]padding: 20px/);
    // Should emit component-scoped shorthand token
    expect(css).toContain('--astryx-card-padding: 20px');
    // Should NOT emit directional tokens (shorthand covers all sides)
    expect(css).not.toContain('--astryx-card-padding-inline');
    expect(css).not.toContain('--astryx-card-padding-block-start');
  });

  it('maps asymmetric padding to directional tokens', () => {
    const theme = defineTheme({
      name: 'test',
      components: {
        card: {
          base: {padding: '16px 20px'},
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    expect(css).toContain('--astryx-card-padding-inline: 20px');
    expect(css).toContain('--astryx-card-padding-block-start: 16px');
    expect(css).toContain('--astryx-card-padding-block-end: 16px');
    // Should NOT emit shorthand (sides differ)
    expect(css).not.toMatch(/--astryx-card-padding:[^-]/);
  });

  it('maps paddingBlock and paddingInline separately', () => {
    const theme = defineTheme({
      name: 'test',
      components: {
        card: {
          base: {paddingBlock: '24px', paddingInline: '16px'},
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    expect(css).toContain('--astryx-card-padding-inline: 16px');
    expect(css).toContain('--astryx-card-padding-block-start: 24px');
    expect(css).toContain('--astryx-card-padding-block-end: 24px');
  });

  it('works for section and dialog too', () => {
    const theme = defineTheme({
      name: 'test',
      components: {
        section: {
          base: {padding: '12px'},
        },
        dialog: {
          base: {padding: '24px 32px'},
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    // Section — uniform → shorthand
    expect(css).toContain('--astryx-section-padding: 12px');
    // Dialog — asymmetric → directional
    expect(css).toContain('--astryx-dialog-padding-inline: 32px');
    expect(css).toContain('--astryx-dialog-padding-block-start: 24px');
  });

  it('does NOT map padding on non-container components', () => {
    const theme = defineTheme({
      name: 'test',
      components: {
        button: {
          base: {padding: '8px 16px'},
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    // Button is not a container — padding passes through as-is
    expect(css).toContain('padding: 8px 16px');
    expect(css).not.toContain('--xds-button-padding');
  });

  it('preserves non-padding properties alongside padding mapping', () => {
    const theme = defineTheme({
      name: 'test',
      components: {
        card: {
          base: {
            padding: '20px',
            '--_card-radius': '16px',
            backgroundColor: 'white',
          },
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    // Non-padding props pass through
    expect(css).toContain('--_card-radius: 16px');
    expect(css).toContain('background-color: white');
    // Padding is mapped to component-scoped token
    expect(css).toContain('--astryx-card-padding: 20px');
    expect(css).not.toMatch(/[^-]padding: 20px/);
  });

  it('maps 3-value padding shorthand', () => {
    const theme = defineTheme({
      name: 'test',
      components: {
        card: {
          base: {padding: '16px 20px 12px'},
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    expect(css).toContain('--astryx-card-padding-block-start: 16px');
    expect(css).toContain('--astryx-card-padding-block-end: 12px');
    expect(css).toContain('--astryx-card-padding-inline: 20px');
  });

  it('maps paddingBlock shorthand with two values', () => {
    const theme = defineTheme({
      name: 'test',
      components: {
        card: {
          base: {paddingBlock: '16px 24px'},
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    expect(css).toContain('--astryx-card-padding-block-start: 16px');
    expect(css).toContain('--astryx-card-padding-block-end: 24px');
  });

  it('maps paddingInline shorthand with two values', () => {
    const theme = defineTheme({
      name: 'test',
      components: {
        card: {
          base: {paddingInline: '12px 20px'},
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    expect(css).toContain('--astryx-card-padding-inline-start: 12px');
    expect(css).toContain('--astryx-card-padding-inline-end: 20px');
  });

  it('maps paddingBlockStart alone', () => {
    const theme = defineTheme({
      name: 'test',
      components: {
        card: {
          base: {paddingBlockStart: '32px'},
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    expect(css).toContain('--astryx-card-padding-block-start: 32px');
    expect(css).not.toContain('--astryx-card-padding-block-end');
    expect(css).not.toContain('--astryx-card-padding-inline');
  });

  it('maps paddingInlineStart and paddingInlineEnd separately', () => {
    const theme = defineTheme({
      name: 'test',
      components: {
        card: {
          base: {paddingInlineStart: '8px', paddingInlineEnd: '24px'},
        },
      },
    });
    const css = generateThemeCSSFlat(theme);
    expect(css).toContain('--astryx-card-padding-inline-start: 8px');
    expect(css).toContain('--astryx-card-padding-inline-end: 24px');
  });
});

describe('defineTheme extends', () => {
  it('inherits tokens from base theme', () => {
    const base = defineTheme({
      name: 'base',
      tokens: {
        '--color-accent': '#0077B6',
        '--radius-container': '16px',
      },
    });
    const child = defineTheme({
      name: 'child',
      extends: base,
    });
    expect(child.tokens['--color-accent']).toBe('#0077B6');
    expect(child.tokens['--radius-container']).toBe('16px');
  });

  it('overrides base tokens with explicit tokens', () => {
    const base = defineTheme({
      name: 'base',
      tokens: {
        '--color-accent': '#0077B6',
        '--radius-container': '16px',
      },
    });
    const child = defineTheme({
      name: 'child',
      extends: base,
      tokens: {'--color-accent': '#FF0000'},
    });
    expect(child.tokens['--color-accent']).toBe('#FF0000');
    expect(child.tokens['--radius-container']).toBe('16px');
  });

  it('inherits component overrides from base theme', () => {
    const base = defineTheme({
      name: 'base',
      components: {
        button: {
          base: {fontWeight: '600'},
          'variant:secondary': {backgroundColor: 'rgba(0,0,0,0.06)'},
        },
      },
    });
    const child = defineTheme({
      name: 'child',
      extends: base,
    });
    expect(child.components?.button?.base).toEqual({fontWeight: '600'});
    expect(child.components?.button?.['variant:secondary']).toEqual({
      backgroundColor: 'rgba(0,0,0,0.06)',
    });
  });

  it('merges component overrides — child wins', () => {
    const base = defineTheme({
      name: 'base',
      components: {
        button: {
          base: {fontWeight: '600', borderRadius: '4px'},
        },
      },
    });
    const child = defineTheme({
      name: 'child',
      extends: base,
      components: {
        button: {
          base: {fontWeight: '700'},
        },
      },
    });
    expect(child.components?.button?.base).toEqual({
      fontWeight: '700',
      borderRadius: '4px',
    });
  });

  it('merges icons — child overrides base', () => {
    const baseIcons = {close: 'X', menu: 'M'} as Partial<IconRegistry>;
    const childIcons = {close: 'Y'} as Partial<IconRegistry>;
    const base = defineTheme({name: 'base', icons: baseIcons});
    const child = defineTheme({
      name: 'child',
      extends: base,
      icons: childIcons,
    });
    expect(child.icons?.close).toBe('Y');
    expect(child.icons?.menu).toBe('M');
  });

  it('inherits icons when child has none', () => {
    const baseIcons = {close: 'X'} as Partial<IconRegistry>;
    const base = defineTheme({name: 'base', icons: baseIcons});
    const child = defineTheme({name: 'child', extends: base});
    expect(child.icons?.close).toBe('X');
  });

  it('uses child name, not base name', () => {
    const base = defineTheme({name: 'base'});
    const child = defineTheme({name: 'my-brand', extends: base});
    expect(child.name).toBe('my-brand');
  });

  it('inherits font family tokens from base theme', () => {
    const base = defineTheme({
      name: 'base',
      typography: {
        body: {
          family: 'Geist',
          fallbacks: 'sans-serif',
        },
        scale: {base: 14, ratio: 1.2},
      },
    });
    const child = defineTheme({name: 'child', extends: base});
    expect(child.tokens['--font-family-body']).toBe('Geist, sans-serif');
  });

  it('typography in child overrides base typography tokens', () => {
    const base = defineTheme({
      name: 'base',
      typography: {scale: {base: 14, ratio: 1.2}},
    });
    const child = defineTheme({
      name: 'child',
      extends: base,
      typography: {scale: {base: 16, ratio: 1.25}},
    });
    // Child's type scale tokens should differ from base
    expect(child.tokens['--font-size-base']).not.toBe(
      base.tokens['--font-size-base'],
    );
  });
});
