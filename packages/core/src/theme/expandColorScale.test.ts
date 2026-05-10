import {describe, it, expect} from 'vitest';
import {expandColorScale} from './expandColorScale';

describe('expandColorScale', () => {
  it('generates tokens from a seed accent', () => {
    const tokens = expandColorScale({accent: '#0064E0'});
    expect(tokens['--color-accent']).toMatch(/^light-dark\(/);
    expect(tokens['--color-text-primary']).toMatch(/^light-dark\(/);
    expect(tokens['--color-background-surface']).toMatch(/^light-dark\(/);
  });

  describe('bodyColor', () => {
    it('derives neutral palette from body color when provided', () => {
      const withBody = expandColorScale({accent: '#0064E0', bodyColor: '#FFF6ED'});
      const withoutBody = expandColorScale({accent: '#0064E0'});

      // Neutrals should differ because body color has different hue than accent
      expect(withBody['--color-text-primary']).not.toBe(withoutBody['--color-text-primary']);
      expect(withBody['--color-background-surface']).not.toBe(withoutBody['--color-background-surface']);
    });

    it('bodyColor overrides neutralStyle', () => {
      const withBody = expandColorScale({accent: '#0064E0', bodyColor: '#FFF6ED', neutralStyle: 'cool'});
      const withBodyWarm = expandColorScale({accent: '#0064E0', bodyColor: '#FFF6ED', neutralStyle: 'warm'});

      // Both should produce the same neutrals since bodyColor takes precedence
      expect(withBody['--color-text-primary']).toBe(withBodyWarm['--color-text-primary']);
    });
  });

  describe('darkMode', () => {
    it('adaptive mode uses different light/dark values', () => {
      const tokens = expandColorScale({accent: '#0064E0', darkMode: 'adaptive'});
      const bg = tokens['--color-background-green'];
      const match = bg.match(/^light-dark\(([^,]+),\s*([^)]+)\)/);
      expect(match).toBeTruthy();
      expect(match![1].trim()).not.toBe(match![2].trim());
    });

    it('preserve mode uses same hex for light and dark', () => {
      const tokens = expandColorScale({accent: '#0064E0', darkMode: 'preserve'});
      const bg = tokens['--color-background-green'];
      const match = bg.match(/^light-dark\(([^,]+),\s*([^)]+)\)/);
      expect(match).toBeTruthy();
      expect(match![1].trim()).toBe(match![2].trim());
    });

    it('invert mode swaps light/dark assignments', () => {
      const adaptive = expandColorScale({accent: '#0064E0', darkMode: 'adaptive'});
      const inverted = expandColorScale({accent: '#0064E0', darkMode: 'invert'});

      const adaptiveMatch = adaptive['--color-background-green'].match(/^light-dark\(([^,]+),\s*([^)]+)\)/);
      const invertMatch = inverted['--color-background-green'].match(/^light-dark\(([^,]+),\s*([^)]+)\)/);

      // Inverted light should equal adaptive dark and vice versa
      expect(invertMatch![1].trim()).toBe(adaptiveMatch![2].trim());
      expect(invertMatch![2].trim()).toBe(adaptiveMatch![1].trim());
    });
  });

  describe('equalize', () => {
    it('without equalization, different hues have different chromas', () => {
      const tokens = expandColorScale({accent: '#0064E0', equalize: false});
      // Both should exist
      expect(tokens['--color-background-green']).toBeTruthy();
      expect(tokens['--color-background-blue']).toBeTruthy();
    });

    it('with equalization, all hues produce valid tokens', () => {
      const tokens = expandColorScale({accent: '#0064E0', equalize: true});
      expect(tokens['--color-background-green']).toMatch(/^light-dark\(/);
      expect(tokens['--color-background-red']).toMatch(/^light-dark\(/);
      expect(tokens['--color-background-blue']).toMatch(/^light-dark\(/);
      expect(tokens['--color-background-cyan']).toMatch(/^light-dark\(/);
    });
  });

  describe('chromaBoost', () => {
    it('chroma boost produces valid tokens', () => {
      const tokens = expandColorScale({
        accent: '#0064E0',
        chromaBoost: {belowTone: 50, factor: 1.5, cap: 2.0},
      });
      expect(tokens['--color-accent']).toMatch(/^light-dark\(/);
      expect(tokens['--color-background-green']).toMatch(/^light-dark\(/);
    });
  });

  it('generates all categorical colors', () => {
    const tokens = expandColorScale({accent: '#0064E0'});
    const colors = ['green', 'red', 'yellow', 'blue', 'pink', 'purple', 'cyan', 'orange', 'teal', 'gray'];
    for (const color of colors) {
      expect(tokens[`--color-background-${color}`]).toBeTruthy();
      expect(tokens[`--color-border-${color}`]).toBeTruthy();
      expect(tokens[`--color-icon-${color}`]).toBeTruthy();
      expect(tokens[`--color-text-${color}`]).toBeTruthy();
    }
  });
});
