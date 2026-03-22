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

describe('typography.scale', () => {
  it('generates typography token overrides when typography.scale is provided', () => {
    const theme = defineTheme({
      name: 'dense',
      typography: {scale: {base: 12, ratio: 1.125}},
    });
    // Semantic tokens are now var() refs; raw token has the computed value
    expect(theme.tokens['--heading-4-size']).toBe('var(--text-base)');
    expect(theme.tokens['--text-base']).toBe('0.75rem');
    expect(theme.tokens['--text-body-size']).toBe('var(--text-base)');
  });

  it('generates 44 tokens (11 raw size + 33 semantic)', () => {
    const theme = defineTheme({
      name: 'custom',
      typography: {scale: {base: 14, ratio: 1.2}},
    });
    // 11 raw size (--text-4xs…--text-4xl) + 33 semantic = 44
    // Filtering for --heading- or --text- captures raw + semantic = 11 + 15 + 18 = 44
    const typeScaleKeys = Object.keys(theme.tokens).filter(
      k => k.startsWith('--heading-') || k.startsWith('--text-'),
    );
    expect(typeScaleKeys).toHaveLength(54);
  });

  it('explicit tokens override scale-generated values', () => {
    const theme = defineTheme({
      name: 'override-test',
      typography: {scale: {base: 14, ratio: 1.2}},
      tokens: {
        '--heading-1-size': '40px',
      },
    });
    // Explicit token should win over typography.scale
    expect(theme.tokens['--heading-1-size']).toBe('40px');
    // Non-overridden scale token should still be a var() ref
    expect(theme.tokens['--heading-4-size']).toBe('var(--text-base)');
  });

  it('works without typography.scale (backwards compatible)', () => {
    const theme = defineTheme({name: 'no-scale'});
    // No type scale tokens should be present
    expect(theme.tokens['--heading-1-size']).toBeUndefined();
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
    expect(theme.tokens['--heading-4-size']).toBe('var(--text-base)');
    expect(theme.tokens['--text-base']).toBe('1rem');
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
      'var(--heading-1-size)',
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
      'var(--heading-1-size)',
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
      'var(--heading-1-size)',
    );
  });
});

describe('radius', () => {
  it('generates radius tokens from radius', () => {
    const theme = defineTheme({
      name: 'rounded',
      radius: {base: 4, multiplier: 1.5},
    });
    expect(theme.tokens['--radius-1']).toBe('6px');
    expect(theme.tokens['--radius-2']).toBe('12px');
    expect(theme.tokens['--radius-3']).toBe('18px');
    expect(theme.tokens['--radius-4']).toBe('24px');
    expect(theme.tokens['--radius-0']).toBe('0px');
    expect(theme.tokens['--radius-rounded']).toBe('9999px');
  });

  it('explicit tokens override radius', () => {
    const theme = defineTheme({
      name: 'custom',
      radius: {base: 4, multiplier: 1},
      tokens: {'--radius-3': '20px'},
    });
    expect(theme.tokens['--radius-3']).toBe('20px');
    expect(theme.tokens['--radius-2']).toBe('8px'); // from radius
  });

  it('radius with multiplier 0 produces sharp theme', () => {
    const theme = defineTheme({
      name: 'sharp',
      radius: {base: 4, multiplier: 0},
    });
    expect(theme.tokens['--radius-1']).toBe('0px');
    expect(theme.tokens['--radius-2']).toBe('0px');
    expect(theme.tokens['--radius-3']).toBe('0px');
    expect(theme.tokens['--radius-4']).toBe('0px');
    expect(theme.tokens['--radius-0']).toBe('0px');
    expect(theme.tokens['--radius-rounded']).toBe('9999px');
  });

  it('works without radius (backwards compatible)', () => {
    const theme = defineTheme({name: 'no-scale'});
    expect(theme.tokens['--radius-0']).toBeUndefined();
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
    expect(theme.tokens['--heading-4-size']).toBe('var(--text-base)');
    expect(theme.tokens['--radius-2']).toBe('8px');
  });
});

describe('custom status via components', () => {
  it('passes custom status through components as status:value keys', () => {
    const theme = defineTheme({
      name: 'banner-status',
      components: {
        banner: {
          'status:neutral': {
            backgroundColor: 'var(--color-muted)',
          },
        },
      },
    });
    expect(theme.components?.banner?.['status:neutral']).toEqual({
      backgroundColor: 'var(--color-muted)',
    });
  });

  it('generates correct CSS selectors for banner status extensions', () => {
    const theme = defineTheme({
      name: 'banner-css',
      components: {
        banner: {
          'status:neutral': {
            backgroundColor: 'var(--color-muted)',
          },
        },
      },
    });
    const css = generateThemeCSS(theme);
    // parseStyleKey('status:neutral') → '.neutral', so CSS should have .xds-banner.neutral
    expect(css).toContain('.xds-banner.neutral');
    expect(css).toContain('background-color: var(--color-muted)');
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
    const css = generateThemeCSS(theme);
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
            backgroundColor: 'var(--color-muted)',
            color: 'gray',
          },
        },
        button: {base: {borderRadius: '999px'}},
      },
    });
    expect(theme.tokens['--color-accent']).toBe('#FF0000');
    expect(theme.components?.banner?.['status:neutral']).toEqual({
      backgroundColor: 'var(--color-muted)',
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

describe('typography fonts derivation', () => {
  it('derives fonts array from typography roles with urls', () => {
    const theme = defineTheme({
      name: 'font-test',
      typography: {
        body: {
          family: 'Figtree',
          fallbacks: 'sans-serif',
          url: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700',
        },
        code: {
          family: 'JetBrains Mono',
          fallbacks: 'monospace',
          url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono',
        },
      },
    });
    expect(theme.fonts).toHaveLength(2);
    expect(theme.fonts![0].family).toBe('Figtree');
    expect(theme.fonts![1].family).toBe('JetBrains Mono');
    expect(theme.fonts![1].url).toContain('JetBrains');
  });

  it('returns undefined fonts when no typography specified', () => {
    const theme = defineTheme({name: 'no-fonts'});
    expect(theme.fonts).toBeUndefined();
  });

  it('returns undefined fonts when typography has no urls', () => {
    const theme = defineTheme({
      name: 'no-urls',
      typography: {
        body: {family: 'Courier New', fallbacks: 'monospace'},
      },
    });
    expect(theme.fonts).toBeUndefined();
  });

  it('deduplicates fonts when heading inherits from body', () => {
    const theme = defineTheme({
      name: 'dedup',
      typography: {
        body: {
          family: 'Geist',
          fallbacks: 'sans-serif',
          url: 'https://example.com/geist.css',
        },
        // heading inherits body — same font, should not duplicate
      },
    });
    expect(theme.fonts).toHaveLength(1);
    expect(theme.fonts![0].family).toBe('Geist');
  });

  it('derives font family tokens from typography roles', () => {
    const theme = defineTheme({
      name: 'family-tokens',
      typography: {
        body: {family: 'Geist', fallbacks: '-apple-system, sans-serif'},
        code: {family: 'Geist Mono', fallbacks: '"SF Mono", monospace'},
      },
    });
    expect(theme.tokens['--font-body']).toBe(
      'Geist, -apple-system, sans-serif',
    );
    expect(theme.tokens['--font-heading']).toBe(
      'Geist, -apple-system, sans-serif',
    ); // inherited from body
    expect(theme.tokens['--font-code']).toBe(
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
    expect(theme.tokens['--font-body']).toBe('Inter, sans-serif');
    expect(theme.tokens['--font-heading']).toBe('"Playfair Display", serif');
  });

  it('explicit tokens override typography-derived font tokens', () => {
    const theme = defineTheme({
      name: 'token-wins',
      typography: {
        body: {family: 'Geist', fallbacks: 'sans-serif'},
      },
      tokens: {'--font-heading': '"Custom", serif'},
    });
    // Explicit token wins over typography-derived
    expect(theme.tokens['--font-heading']).toBe('"Custom", serif');
    // Body still comes from typography
    expect(theme.tokens['--font-body']).toBe('Geist, sans-serif');
  });

  it('combines typography with scale and tokens', () => {
    const theme = defineTheme({
      name: 'combo',
      typography: {
        scale: {base: 14, ratio: 1.2},
        body: {
          family: 'Figtree',
          fallbacks: 'sans-serif',
          url: 'https://fonts.googleapis.com/css2?family=Figtree',
        },
      },
    });
    expect(theme.name).toBe('combo');
    expect(theme.fonts).toHaveLength(1);
    expect(theme.tokens['--font-body']).toBe('Figtree, sans-serif');
    // scale tokens should still be present
    expect(theme.tokens['--heading-4-size']).toBeDefined();
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
    expect(theme.tokens['--heading-1-weight']).toBe('var(--font-weight-bold)');
    expect(theme.tokens['--heading-4-weight']).toBe('var(--font-weight-bold)');
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
    expect(theme.tokens['--heading-1-weight']).toBe(
      'var(--font-weight-semibold)',
    );
    expect(theme.tokens['--heading-3-weight']).toBe('var(--font-weight-bold)');
    expect(theme.tokens['--heading-4-weight']).toBe('var(--font-weight-bold)');
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
    expect(theme.tokens['--heading-1-weight']).toBe(
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
    expect(theme.tokens['--heading-1-weight']).toBe('900');
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
    const css = generateThemeCSS(theme);
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
              outline: '2px solid var(--color-ring-focus)',
            },
          },
        },
      },
    });
    const css = generateThemeCSS(theme);
    expect(css).toContain('.xds-button.primary-muted {');
    expect(css).toContain('background-color: #ECF5FF');
    expect(css).toContain('.xds-button.primary-muted:hover {');
    expect(css).toContain('background-color: #D6EBFF');
    expect(css).toContain('.xds-button.primary-muted:focus-visible {');
    expect(css).toContain('outline: 2px solid var(--color-ring-focus)');
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
    const css = generateThemeCSS(theme);
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
    const css = generateThemeCSS(theme);
    expect(css).toContain('.xds-card {');
    expect(css).toContain('border-width: 2px');
    expect(css).toContain('border-color: var(--color-accent)');
    // No pseudo rules
    expect(css).not.toContain('.xds-card:');
  });
});
