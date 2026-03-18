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
        '--font-heading': '"Georgia", serif',
      },
    });
    expect(theme.tokens['--color-accent']).toBe('light-dark(#0077B6, #48CAE4)');
    expect(theme.tokens['--radius-container']).toBe('16px');
    expect(theme.tokens['--font-heading']).toBe('"Georgia", serif');
  });

  it('warns on unknown token names', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    defineTheme({
      name: 'bad',
      tokens: {
        // @ts-expect-error testing unknown token
        '--color-does-not-exist': '#FF0000',
      },
    });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('unknown token "--color-does-not-exist"'),
    );
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
        '--radius-container': '16px',
      },
    });
    const css = generateThemeCSS(theme);
    expect(css).toContain('@scope');
    expect(css).toContain('--color-accent: light-dark(#0077B6, #48CAE4)');
    expect(css).toContain('--radius-container: 16px');
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
      tokens: {'--radius-container': '20px'},
      components: {
        card: {base: {borderWidth: '1px'}},
      },
    });
    const css = generateThemeCSS(theme);
    expect(css).toContain('@scope');
    expect(css).toContain('--radius-container: 20px');
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
    expect(theme.tokens['--heading-4-size']).toBe('0.75rem');
    expect(theme.tokens['--text-body-size']).toBe('0.75rem');
  });

  it('generates all 33 type scale tokens', () => {
    const theme = defineTheme({
      name: 'custom',
      typeScale: {base: 14, ratio: 1.2},
    });
    // 6 heading levels × 3 props + 5 text types × 3 props = 33
    const typeScaleKeys = Object.keys(theme.tokens).filter(
      k => k.startsWith('--heading-') || k.startsWith('--text-'),
    );
    expect(typeScaleKeys).toHaveLength(33);
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
    // Non-overridden typeScale token should still be present
    expect(theme.tokens['--heading-4-size']).toBe('0.875rem');
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
    expect(theme.tokens['--heading-4-size']).toBe('1rem');
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
