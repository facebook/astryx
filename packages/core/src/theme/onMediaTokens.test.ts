import {describe, it, expect} from 'vitest';
import {defineTheme, generateOnMediaCSS} from './defineTheme';
import {
  defaultOnDarkTokens,
  defaultOnLightTokens,
  resolveOnMedia,
} from './onMediaTokens';

describe('onMediaTokens', () => {
  describe('defaultOnDarkTokens', () => {
    it('sets color-scheme to dark', () => {
      expect(defaultOnDarkTokens['color-scheme']).toBe('dark');
    });

    it('provides text primary as on-dark color', () => {
      expect(defaultOnDarkTokens['--color-text-primary']).toBe(
        'var(--color-on-dark)',
      );
    });

    it('provides icon primary as on-dark color', () => {
      expect(defaultOnDarkTokens['--color-icon-primary']).toBe(
        'var(--color-on-dark)',
      );
    });

    it('collapses accent to on-dark color', () => {
      expect(defaultOnDarkTokens['--color-accent']).toBe(
        'var(--color-on-dark)',
      );
    });
  });

  describe('defaultOnLightTokens', () => {
    it('sets color-scheme to light', () => {
      expect(defaultOnLightTokens['color-scheme']).toBe('light');
    });

    it('provides text primary as on-light color', () => {
      expect(defaultOnLightTokens['--color-text-primary']).toBe(
        'var(--color-on-light)',
      );
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
    expect(theme.__onDark!.tokens['color-scheme']).toBe('dark');
    expect(theme.__onLight!.tokens['color-scheme']).toBe('light');
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

describe('generateOnMediaCSS', () => {
  it('emits @scope with [data-xds-media] token rules', () => {
    const theme = defineTheme({name: 'test'});
    const css = generateOnMediaCSS(theme);
    expect(css).toContain('@scope ([data-xds-theme="test"])');
    // Same scope boundary as main theme
    expect(css).toContain('to ([data-xds-theme])');
    expect(css).toContain('[data-xds-media="dark"]');
    expect(css).toContain('color-scheme: dark');
    expect(css).toContain('var(--color-on-dark)');
  });

  it('emits light media rules', () => {
    const theme = defineTheme({name: 'test'});
    const css = generateOnMediaCSS(theme);
    expect(css).toContain('[data-xds-media="light"]');
    expect(css).toContain('color-scheme: light');
  });

  it('emits component override rules', () => {
    const theme = defineTheme({
      name: 'test',
      onDark: {
        components: {
          button: {
            'variant:secondary': {
              backgroundColor: 'color-mix(in srgb, white 20%, transparent)',
            },
          },
        },
      },
    });
    const css = generateOnMediaCSS(theme);
    expect(css).toContain('[data-xds-media="dark"] .xds-button.secondary');
    expect(css).toContain('background-color: color-mix(in srgb, white 20%, transparent)');
  });

  it('emits pseudo-class rules for on-media components', () => {
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
    const css = generateOnMediaCSS(theme);
    expect(css).toContain('.xds-button:hover');
    expect(css).toContain('color: rgba(255,255,255,0.8)');
  });
});
