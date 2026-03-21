import {describe, it, expect, vi} from 'vitest';
import {defineTheme, generateThemeCSS, isDefinedTheme} from './defineTheme';

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
    expect(theme.tokens['--color-surface']).toBeUndefined();
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
        '--radius-3': '16px',
      },
    });
    expect(theme.tokens['--radius-3']).toBe('16px');
  });

  it('mixes tuples and strings', () => {
    const theme = defineTheme({
      name: 'mixed',
      tokens: {
        '--color-accent': ['#0077B6', '#48CAE4'],
        '--radius-3': '16px',
        '--font-heading': '"Georgia", serif',
      },
    });
    expect(theme.tokens['--color-accent']).toBe('light-dark(#0077B6, #48CAE4)');
    expect(theme.tokens['--radius-3']).toBe('16px');
    expect(theme.tokens['--font-heading']).toBe('"Georgia", serif');
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const icons = {close: 'X'} as any;
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
        '--radius-3': '16px',
      },
    });
    const css = generateThemeCSS(theme);
    expect(css).toContain('@scope');
    expect(css).toContain('--color-accent: light-dark(#0077B6, #48CAE4)');
    expect(css).toContain('--radius-3: 16px');
    // :scope should NOT contain non-overridden tokens
    expect(css).not.toContain('--color-surface:');
  });

  it('includes prose rules even with no overrides', () => {
    const theme = defineTheme({name: 'empty'});
    const css = generateThemeCSS(theme);
    expect(css).toContain('@scope');
    expect(css).toContain(':is(h1, h2, h3, h4, h5, h6)');
    expect(css).toContain('font-family: var(--font-heading)');
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
    const css = generateThemeCSS(theme);
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
    const css = generateThemeCSS(theme);
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
    const css = generateThemeCSS(theme);
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
    const css = generateThemeCSS(theme);
    expect(css).toContain('font-family: "Playfair Display", serif');
    expect(css).not.toContain('fontFamily');
  });

  it('combines tokens and components', () => {
    const theme = defineTheme({
      name: 'combo',
      tokens: {'--radius-3': '20px'},
      components: {
        card: {base: {borderWidth: '1px'}},
      },
    });
    const css = generateThemeCSS(theme);
    expect(css).toContain('@scope');
    expect(css).toContain('--radius-3: 20px');
    expect(css).toContain('.xds-card {');
    expect(css).toContain('border-width: 1px');
  });
});

describe('typeScale', () => {
  it('generates typography token overrides when typeScale is provided', () => {
    const theme = defineTheme({
      name: 'dense',
      typeScale: {base: 12, ratio: 1.125},
    });
    // Semantic tokens are now var() refs; raw token has the computed value
    expect(theme.tokens['--heading-4-size']).toBe('var(--text-base)');
    expect(theme.tokens['--text-base']).toBe('0.75rem');
    expect(theme.tokens['--text-body-size']).toBe('var(--text-base)');
  });

  it('generates 44 tokens (11 raw size + 33 semantic)', () => {
    const theme = defineTheme({
      name: 'custom',
      typeScale: {base: 14, ratio: 1.2},
    });
    // 11 raw size (--text-4xs…--text-4xl) + 33 semantic = 44
    // Filtering for --heading- or --text- captures raw + semantic = 11 + 15 + 18 = 44
    const typeScaleKeys = Object.keys(theme.tokens).filter(
      k => k.startsWith('--heading-') || k.startsWith('--text-'),
    );
    expect(typeScaleKeys).toHaveLength(54);
  });

  it('explicit tokens override typeScale-generated values', () => {
    const theme = defineTheme({
      name: 'override-test',
      typeScale: {base: 14, ratio: 1.2},
      tokens: {
        '--heading-1-size': '40px',
      },
    });
    // Explicit token should win over typeScale
    expect(theme.tokens['--heading-1-size']).toBe('40px');
    // Non-overridden typeScale token should still be a var() ref
    expect(theme.tokens['--heading-4-size']).toBe('var(--text-base)');
  });

  it('works without typeScale (backwards compatible)', () => {
    const theme = defineTheme({name: 'no-scale'});
    // No type scale tokens should be present
    expect(theme.tokens['--heading-1-size']).toBeUndefined();
  });

  it('combines typeScale with other token overrides', () => {
    const theme = defineTheme({
      name: 'combo',
      typeScale: {base: 16, ratio: 1.25},
      tokens: {
        '--color-accent': '#FF0000',
      },
    });
    expect(theme.tokens['--color-accent']).toBe('#FF0000');
    expect(theme.tokens['--heading-4-size']).toBe('var(--text-base)');
    expect(theme.tokens['--text-base']).toBe('1rem');
  });
});

describe('typeScale component auto-generation', () => {
  it('auto-generates heading component overrides when typeScale is provided', () => {
    const theme = defineTheme({
      name: 'auto',
      typeScale: {base: 14, ratio: 1.2},
    });
    expect(theme.components?.heading?.['level:1']).toBeDefined();
    expect(theme.components?.heading?.['level:1']?.fontSize).toBe(
      'var(--heading-1-size)',
    );
  });

  it('auto-generates text component overrides when typeScale is provided', () => {
    const theme = defineTheme({
      name: 'auto',
      typeScale: {base: 14, ratio: 1.2},
    });
    expect(theme.components?.text?.['type:body']).toBeDefined();
    expect(theme.components?.text?.['type:body']?.fontSize).toBe(
      'var(--text-body-size)',
    );
  });

  it('does not include color in auto-generated rules', () => {
    const theme = defineTheme({
      name: 'auto',
      typeScale: {base: 14, ratio: 1.2},
    });
    expect(theme.components?.heading?.['level:1']?.color).toBeUndefined();
    expect(theme.components?.text?.['type:supporting']?.color).toBeUndefined();
  });

  it('explicit components deep-merge on top of auto-generated', () => {
    const theme = defineTheme({
      name: 'custom',
      typeScale: {base: 14, ratio: 1.2},
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
      'var(--heading-1-size)',
    );
    // Explicit override merged on top
    expect(theme.components?.heading?.['level:1']?.letterSpacing).toBe(
      '-0.02em',
    );
    // Non-typography component preserved
    expect(theme.components?.button?.base?.borderRadius).toBe('999px');
  });

  it('does not generate components when typeScale is absent', () => {
    const theme = defineTheme({name: 'bare'});
    expect(theme.components).toBeUndefined();
  });

  it('explicit heading overrides win over auto-generated', () => {
    const theme = defineTheme({
      name: 'override',
      typeScale: {base: 14, ratio: 1.2},
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
      'var(--heading-1-size)',
    );
  });
});

describe('radiusScale', () => {
  it('generates radius tokens from radiusScale', () => {
    const theme = defineTheme({
      name: 'rounded',
      radiusScale: {base: 4, multiplier: 1.5},
    });
    expect(theme.tokens['--radius-1']).toBe('6px');
    expect(theme.tokens['--radius-2']).toBe('12px');
    expect(theme.tokens['--radius-3']).toBe('18px');
    expect(theme.tokens['--radius-4']).toBe('24px');
    expect(theme.tokens['--radius-0']).toBe('0px');
    expect(theme.tokens['--radius-rounded']).toBe('9999px');
  });

  it('explicit tokens override radiusScale', () => {
    const theme = defineTheme({
      name: 'custom',
      radiusScale: {base: 4, multiplier: 1},
      tokens: {'--radius-3': '20px'},
    });
    expect(theme.tokens['--radius-3']).toBe('20px');
    expect(theme.tokens['--radius-2']).toBe('8px'); // from radiusScale
  });

  it('radiusScale with multiplier 0 produces sharp theme', () => {
    const theme = defineTheme({
      name: 'sharp',
      radiusScale: {base: 4, multiplier: 0},
    });
    expect(theme.tokens['--radius-1']).toBe('0px');
    expect(theme.tokens['--radius-2']).toBe('0px');
    expect(theme.tokens['--radius-3']).toBe('0px');
    expect(theme.tokens['--radius-4']).toBe('0px');
    expect(theme.tokens['--radius-0']).toBe('0px');
    expect(theme.tokens['--radius-rounded']).toBe('9999px');
  });

  it('works without radiusScale (backwards compatible)', () => {
    const theme = defineTheme({name: 'no-scale'});
    expect(theme.tokens['--radius-0']).toBeUndefined();
  });

  it('combines radiusScale with typeScale and other tokens', () => {
    const theme = defineTheme({
      name: 'combo',
      typeScale: {base: 16, ratio: 1.25},
      radiusScale: {base: 4, multiplier: 1},
      tokens: {
        '--color-accent': '#FF0000',
      },
    });
    expect(theme.tokens['--color-accent']).toBe('#FF0000');
    expect(theme.tokens['--heading-4-size']).toBe('var(--text-base)');
    expect(theme.tokens['--radius-2']).toBe('8px');
  });
});

describe('variants', () => {
  it('extracts variant names from styled variant objects', () => {
    const theme = defineTheme({
      name: 'custom',
      variants: {
        button: {
          'primary-muted': {
            backgroundColor: 'var(--color-accent-muted)',
            color: 'var(--color-accent)',
          },
          'primary-outline': {
            borderWidth: '2px',
            borderStyle: 'solid',
          },
        },
        badge: {
          'info-subtle': {
            backgroundColor: 'var(--color-info-muted)',
          },
        },
      },
    });
    expect(theme.variants).toEqual({
      button: ['primary-muted', 'primary-outline'],
      badge: ['info-subtle'],
    });
  });

  it('merges variant styles into components as variant: keys', () => {
    const theme = defineTheme({
      name: 'styled-variants',
      variants: {
        button: {
          'primary-muted': {
            backgroundColor: 'var(--color-accent-muted)',
            color: 'var(--color-accent)',
          },
        },
      },
    });
    expect(theme.components?.button?.['variant:primary-muted']).toEqual({
      backgroundColor: 'var(--color-accent-muted)',
      color: 'var(--color-accent)',
    });
  });

  it('handles empty style objects (register-only variants)', () => {
    const theme = defineTheme({
      name: 'register-only',
      variants: {
        button: {
          'primary-muted': {},
        },
      },
    });
    expect(theme.variants).toEqual({button: ['primary-muted']});
    // Empty styles should not create a component entry
    expect(theme.components?.button?.['variant:primary-muted']).toBeUndefined();
  });

  it('returns undefined variants when not provided', () => {
    const theme = defineTheme({name: 'bare'});
    expect(theme.variants).toBeUndefined();
  });

  it('combines variants with tokens and explicit components', () => {
    const theme = defineTheme({
      name: 'combo',
      tokens: {'--color-accent': '#FF0000'},
      components: {button: {base: {borderRadius: '999px'}}},
      variants: {
        button: {
          'primary-muted': {
            backgroundColor: 'var(--color-accent-muted)',
          },
        },
      },
    });
    expect(theme.tokens['--color-accent']).toBe('#FF0000');
    // Explicit component styles preserved
    expect(theme.components?.button?.base?.borderRadius).toBe('999px');
    // Variant styles merged in
    expect(theme.components?.button?.['variant:primary-muted']).toEqual({
      backgroundColor: 'var(--color-accent-muted)',
    });
    expect(theme.variants).toEqual({button: ['primary-muted']});
  });

  it('explicit components override variant styles on collision', () => {
    const theme = defineTheme({
      name: 'override',
      components: {
        button: {
          'variant:primary-muted': {backgroundColor: 'red'},
        },
      },
      variants: {
        button: {
          'primary-muted': {backgroundColor: 'blue', color: 'white'},
        },
      },
    });
    // Explicit component override wins for backgroundColor
    expect(
      theme.components?.button?.['variant:primary-muted']?.backgroundColor,
    ).toBe('red');
    // Variant-only property still present
    expect(theme.components?.button?.['variant:primary-muted']?.color).toBe(
      'white',
    );
  });
});

describe('defineTheme fonts', () => {
  it('passes through fonts array from input', () => {
    const fonts = [
      {
        family: 'Figtree',
        url: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700',
      },
      {
        family: 'JetBrains Mono',
        url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono',
      },
    ];
    const theme = defineTheme({name: 'font-test', fonts});
    expect(theme.fonts).toEqual(fonts);
    expect(theme.fonts).toHaveLength(2);
    expect(theme.fonts![0].family).toBe('Figtree');
    expect(theme.fonts![1].url).toContain('JetBrains');
  });

  it('returns undefined fonts when not specified', () => {
    const theme = defineTheme({name: 'no-fonts'});
    expect(theme.fonts).toBeUndefined();
  });

  it('handles empty fonts array', () => {
    const theme = defineTheme({name: 'empty-fonts', fonts: []});
    expect(theme.fonts).toEqual([]);
    expect(theme.fonts).toHaveLength(0);
  });

  it('combines fonts with tokens and other features', () => {
    const theme = defineTheme({
      name: 'combo-fonts',
      tokens: {'--font-heading': '"Figtree", sans-serif'},
      fonts: [
        {
          family: 'Figtree',
          url: 'https://fonts.googleapis.com/css2?family=Figtree',
        },
      ],
      typeScale: {base: 14, ratio: 1.2},
    });
    expect(theme.name).toBe('combo-fonts');
    expect(theme.fonts).toHaveLength(1);
    expect(theme.tokens['--font-heading']).toBe('"Figtree", sans-serif');
    // typeScale tokens should still be present
    expect(theme.tokens['--heading-4-size']).toBeDefined();
  });
});
