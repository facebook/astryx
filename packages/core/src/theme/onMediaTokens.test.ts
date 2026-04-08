import {describe, it, expect} from 'vitest';
import {defineTheme, generateThemeRules} from './defineTheme';
import {
  defaultOnDarkTokens,
  defaultOnLightTokens,
  resolveOnMedia,
} from './onMediaTokens';

describe('onMediaTokens', () => {
  describe('defaultOnDarkTokens', () => {
    it('provides text primary as on-dark color', () => {
      expect(defaultOnDarkTokens['--color-text-primary']).toBe(
        'var(--color-on-dark)',
      );
    });

    it('provides white-tinted overlay hover', () => {
      expect(defaultOnDarkTokens['--color-overlay-hover']).toContain('white');
    });

    it('provides white-tinted border', () => {
      expect(defaultOnDarkTokens['--color-border']).toContain('white');
    });
  });

  describe('defaultOnLightTokens', () => {
    it('provides text primary as on-light color', () => {
      expect(defaultOnLightTokens['--color-text-primary']).toBe(
        'var(--color-on-light)',
      );
    });

    it('provides black-tinted overlay hover', () => {
      expect(defaultOnLightTokens['--color-overlay-hover']).toContain('black');
    });
  });

  describe('resolveOnMedia', () => {
    it('returns defaults when no user overrides', () => {
      const result = resolveOnMedia('dark');
      expect(result.tokens).toEqual(defaultOnDarkTokens);
      expect(result.components).toBeUndefined();
    });

    it('merges user token overrides with defaults', () => {
      const result = resolveOnMedia('dark', {
        tokens: {'--color-accent': '#90CAF9'},
      });
      expect(result.tokens['--color-accent']).toBe('#90CAF9');
      expect(result.tokens['--color-text-primary']).toBe(
        'var(--color-on-dark)',
      );
    });

    it('resolves [light, dark] tuple tokens', () => {
      const result = resolveOnMedia('dark', {
        tokens: {'--color-accent': ['#AAA', '#BBB']},
      });
      expect(result.tokens['--color-accent']).toBe('light-dark(#AAA, #BBB)');
    });

    it('passes through component overrides', () => {
      const components = {
        button: {
          'variant:ghost': {borderWidth: '1px'},
        },
      };
      const result = resolveOnMedia('dark', {components});
      expect(result.components).toBe(components);
    });

    it('returns light defaults for surface=light', () => {
      const result = resolveOnMedia('light');
      expect(result.tokens).toEqual(defaultOnLightTokens);
    });
  });
});

describe('defineTheme with onDark/onLight', () => {
  it('stores resolved onDark on the theme', () => {
    const theme = defineTheme({
      name: 'test',
      onDark: {
        tokens: {'--color-accent': '#90CAF9'},
      },
    });
    expect(theme.__onDark).toBeDefined();
    expect(theme.__onDark!.tokens['--color-accent']).toBe('#90CAF9');
    expect(theme.__onDark!.tokens['--color-text-primary']).toBe(
      'var(--color-on-dark)',
    );
  });

  it('stores resolved onLight on the theme', () => {
    const theme = defineTheme({
      name: 'test',
      onLight: {
        tokens: {'--color-accent': '#333'},
      },
    });
    expect(theme.__onLight).toBeDefined();
    expect(theme.__onLight!.tokens['--color-accent']).toBe('#333');
  });

  it('generates defaults even without explicit onDark/onLight', () => {
    const theme = defineTheme({name: 'test'});
    expect(theme.__onDark).toBeDefined();
    expect(theme.__onLight).toBeDefined();
    expect(theme.__onDark!.tokens['--color-text-primary']).toBe(
      'var(--color-on-dark)',
    );
    expect(theme.__onLight!.tokens['--color-text-primary']).toBe(
      'var(--color-on-light)',
    );
  });

  it('stores component overrides on onDark', () => {
    const theme = defineTheme({
      name: 'test',
      onDark: {
        components: {
          button: {'variant:ghost': {borderWidth: '1px'}},
        },
      },
    });
    expect(theme.__onDark!.components).toBeDefined();
    expect(theme.__onDark!.components!.button['variant:ghost']).toEqual({
      borderWidth: '1px',
    });
  });
});

describe('generateThemeRules with onMedia', () => {
  it('emits [data-xds-media="dark"] token rules', () => {
    const theme = defineTheme({name: 'test'});
    const rules = generateThemeRules(theme);
    const darkRule = rules.find(r => r.includes('[data-xds-media="dark"]'));
    expect(darkRule).toBeDefined();
    expect(darkRule).toContain('--color-text-primary');
    expect(darkRule).toContain('var(--color-on-dark)');
  });

  it('emits [data-xds-media="light"] token rules', () => {
    const theme = defineTheme({name: 'test'});
    const rules = generateThemeRules(theme);
    const lightRule = rules.find(r => r.includes('[data-xds-media="light"]'));
    expect(lightRule).toBeDefined();
    expect(lightRule).toContain('--color-text-primary');
    expect(lightRule).toContain('var(--color-on-light)');
  });

  it('emits component override rules inside on-media selectors', () => {
    const theme = defineTheme({
      name: 'test',
      onDark: {
        components: {
          button: {
            'variant:ghost': {
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'rgba(255,255,255,0.3)',
            },
          },
        },
      },
    });
    const rules = generateThemeRules(theme);
    const compRule = rules.find(
      r => r.includes('[data-xds-media="dark"]') && r.includes('.xds-button'),
    );
    expect(compRule).toBeDefined();
    expect(compRule).toContain('border-width: 1px');
    expect(compRule).toContain('border-style: solid');
  });

  it('emits pseudo-class rules for on-media component overrides', () => {
    const theme = defineTheme({
      name: 'test',
      onDark: {
        components: {
          button: {
            base: {
              color: 'white',
              ':hover': {color: 'rgba(255,255,255,0.8)'},
            },
          },
        },
      },
    });
    const rules = generateThemeRules(theme);
    const hoverRule = rules.find(
      r =>
        r.includes('[data-xds-media="dark"]') &&
        r.includes('.xds-button') &&
        r.includes(':hover'),
    );
    expect(hoverRule).toBeDefined();
    expect(hoverRule).toContain('color: rgba(255,255,255,0.8)');
  });
});
