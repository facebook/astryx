import {describe, it, expect} from 'vitest';
import {expandColorScale} from './expandColorScale';

describe('expandColorScale', () => {
  it('generates tokens from a seed accent', () => {
    const tokens = expandColorScale({accent: '#0064E0'});
    expect(tokens['--color-accent']).toMatch(/^light-dark\(/);
    expect(tokens['--color-text-primary']).toMatch(/^light-dark\(/);
    expect(tokens['--color-background-surface']).toMatch(/^light-dark\(/);
  });

  describe('body', () => {
    it('derives neutral palette from body color when provided', () => {
      const withBody = expandColorScale({accent: '#0064E0', body: '#FFF6ED'});
      const withoutBody = expandColorScale({accent: '#0064E0'});

      // Neutrals should differ because body color has different hue than accent
      expect(withBody['--color-text-primary']).not.toBe(
        withoutBody['--color-text-primary'],
      );
      expect(withBody['--color-background-surface']).not.toBe(
        withoutBody['--color-background-surface'],
      );
    });

    it('body overrides neutralStyle', () => {
      const withBody = expandColorScale({
        accent: '#0064E0',
        body: '#FFF6ED',
        neutralStyle: 'cool',
      });
      const withBodyWarm = expandColorScale({
        accent: '#0064E0',
        body: '#FFF6ED',
        neutralStyle: 'warm',
      });

      // Both should produce the same neutrals since body takes precedence
      expect(withBody['--color-text-primary']).toBe(
        withBodyWarm['--color-text-primary'],
      );
    });
  });

  describe('contrast', () => {
    it('high contrast shifts text tones', () => {
      const standard = expandColorScale({
        accent: '#0064E0',
        contrast: 'standard',
      });
      const high = expandColorScale({accent: '#0064E0', contrast: 'high'});

      // High contrast should produce different text tokens
      expect(standard['--color-text-primary']).not.toBe(
        high['--color-text-primary'],
      );
    });
  });

  it('generates all categorical colors', () => {
    const tokens = expandColorScale({accent: '#0064E0'});
    const colors = [
      'green',
      'red',
      'yellow',
      'blue',
      'pink',
      'purple',
      'cyan',
      'orange',
      'teal',
      'gray',
    ];
    for (const color of colors) {
      expect(tokens[`--color-background-${color}`]).toBeTruthy();
      expect(tokens[`--color-border-${color}`]).toBeTruthy();
      expect(tokens[`--color-icon-${color}`]).toBeTruthy();
      expect(tokens[`--color-text-${color}`]).toBeTruthy();
    }
  });
});
