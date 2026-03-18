/**
 * @file expandTypeScale.test.ts
 * Tests for the three-layer type scale computation.
 */

import {describe, it, expect} from 'vitest';
import {expandTypeScale, generateTypeScaleComponents} from './expandTypeScale';

describe('expandTypeScale', () => {
  describe('Layer 1: raw size tokens', () => {
    const tokens = expandTypeScale({base: 14, ratio: 1.2});

    it('emits 8 raw size tokens', () => {
      const sizeTokens = [
        '--text-xsm',
        '--text-sm',
        '--text-base',
        '--text-lg',
        '--text-xl',
        '--text-2xl',
        '--text-3xl',
        '--text-4xl',
      ];
      for (const name of sizeTokens) {
        expect(tokens[name]).toBeDefined();
        expect(tokens[name]).toMatch(/^\d+px$/);
      }
    });

    it('anchors --text-base to the base size', () => {
      expect(tokens['--text-base']).toBe('14px');
    });

    it('computes geometric progression', () => {
      // base=14, ratio=1.2
      expect(tokens['--text-xsm']).toBe('10px'); // 14 × 1.2⁻² ≈ 9.72 → 10
      expect(tokens['--text-sm']).toBe('12px'); // 14 × 1.2⁻¹ ≈ 11.67 → 12
      expect(tokens['--text-lg']).toBe('17px'); // 14 × 1.2¹ ≈ 16.8 → 17
      expect(tokens['--text-xl']).toBe('20px'); // 14 × 1.2² ≈ 20.16 → 20
      expect(tokens['--text-2xl']).toBe('24px'); // 14 × 1.2³ ≈ 24.19 → 24
      expect(tokens['--text-3xl']).toBe('29px'); // 14 × 1.2⁴ ≈ 29.03 → 29
      expect(tokens['--text-4xl']).toBe('35px'); // 14 × 1.2⁵ ≈ 34.84 → 35
    });
  });

  describe('Layer 1b: leading tokens', () => {
    const tokens = expandTypeScale({base: 14, ratio: 1.2});

    it('emits 8 leading tokens', () => {
      const leadingTokens = [
        '--leading-tight',
        '--leading-snug',
        '--leading-base',
        '--leading-normal',
        '--leading-relaxed',
        '--leading-2xl',
        '--leading-3xl',
        '--leading-4xl',
      ];
      for (const name of leadingTokens) {
        expect(tokens[name]).toBeDefined();
      }
    });

    it('computes --leading-base as 1.4286 (exact match with legacy)', () => {
      expect(tokens['--leading-base']).toBe('1.4286');
    });

    it('all line heights snap to 4px grid', () => {
      const sizeMap: Record<string, string> = {
        '--leading-tight': '--text-xsm',
        '--leading-snug': '--text-sm',
        '--leading-base': '--text-base',
        '--leading-normal': '--text-lg',
        '--leading-relaxed': '--text-xl',
        '--leading-2xl': '--text-2xl',
        '--leading-3xl': '--text-3xl',
        '--leading-4xl': '--text-4xl',
      };
      for (const [leadToken, sizeToken] of Object.entries(sizeMap)) {
        const fontSize = parseInt(tokens[sizeToken]);
        const ratio = parseFloat(tokens[leadToken]);
        const computedLh = Math.round(fontSize * ratio);
        expect(computedLh % 4).toBe(0);
      }
    });

    it('all line heights are at least fontSize + 4', () => {
      const sizeMap: Record<string, string> = {
        '--leading-tight': '--text-xsm',
        '--leading-snug': '--text-sm',
        '--leading-base': '--text-base',
        '--leading-normal': '--text-lg',
        '--leading-relaxed': '--text-xl',
        '--leading-2xl': '--text-2xl',
        '--leading-3xl': '--text-3xl',
        '--leading-4xl': '--text-4xl',
      };
      for (const [leadToken, sizeToken] of Object.entries(sizeMap)) {
        const fontSize = parseInt(tokens[sizeToken]);
        const ratio = parseFloat(tokens[leadToken]);
        const computedLh = Math.round(fontSize * ratio);
        expect(computedLh).toBeGreaterThanOrEqual(fontSize + 4);
      }
    });

    it('uses tiered target ratio based on font size', () => {
      // < 20px uses 1.5 target → --leading-base (14px) should give 20px
      expect(Math.round(14 * parseFloat(tokens['--leading-base']))).toBe(20);
      // 20-31px uses 1.4 target → --leading-relaxed (20px) should give 28px
      expect(Math.round(20 * parseFloat(tokens['--leading-relaxed']))).toBe(28);
      // ≥ 32px uses 1.25 target → --leading-4xl (35px) should give 44px
      expect(Math.round(35 * parseFloat(tokens['--leading-4xl']))).toBe(44);
    });
  });

  describe('Layer 2: semantic tokens (var refs)', () => {
    const tokens = expandTypeScale({base: 14, ratio: 1.2});

    it('heading sizes are var() references to raw tokens', () => {
      expect(tokens['--heading-1-size']).toBe('var(--text-2xl)');
      expect(tokens['--heading-2-size']).toBe('var(--text-xl)');
      expect(tokens['--heading-3-size']).toBe('var(--text-lg)');
      expect(tokens['--heading-4-size']).toBe('var(--text-base)');
      expect(tokens['--heading-5-size']).toBe('var(--text-sm)');
      expect(tokens['--heading-6-size']).toBe('var(--text-xsm)');
    });

    it('heading leadings are var() references to leading tokens', () => {
      expect(tokens['--heading-1-leading']).toBe('var(--leading-2xl)');
      expect(tokens['--heading-2-leading']).toBe('var(--leading-relaxed)');
      expect(tokens['--heading-3-leading']).toBe('var(--leading-normal)');
      expect(tokens['--heading-4-leading']).toBe('var(--leading-base)');
      expect(tokens['--heading-5-leading']).toBe('var(--leading-snug)');
      expect(tokens['--heading-6-leading']).toBe('var(--leading-tight)');
    });

    it('text type sizes are var() references', () => {
      expect(tokens['--text-body-size']).toBe('var(--text-base)');
      expect(tokens['--text-large-size']).toBe('var(--text-lg)');
      expect(tokens['--text-label-size']).toBe('var(--text-base)');
      expect(tokens['--text-code-size']).toBe('var(--text-base)');
      expect(tokens['--text-supporting-size']).toBe('var(--text-sm)');
    });

    it('text type leadings are var() references', () => {
      expect(tokens['--text-body-leading']).toBe('var(--leading-base)');
      expect(tokens['--text-large-leading']).toBe('var(--leading-normal)');
      expect(tokens['--text-label-leading']).toBe('var(--leading-base)');
      expect(tokens['--text-code-leading']).toBe('var(--leading-base)');
      expect(tokens['--text-supporting-leading']).toBe('var(--leading-snug)');
    });

    it('weight tokens are var() references (unchanged)', () => {
      expect(tokens['--heading-1-weight']).toBe('var(--font-weight-semibold)');
      expect(tokens['--text-body-weight']).toBe('var(--font-weight-normal)');
      expect(tokens['--text-large-weight']).toBe('var(--font-weight-semibold)');
      expect(tokens['--text-label-weight']).toBe('var(--font-weight-medium)');
    });
  });

  describe('total token count', () => {
    const tokens = expandTypeScale({base: 14, ratio: 1.2});

    it('generates 49 tokens (8 size + 8 leading + 33 semantic)', () => {
      expect(Object.keys(tokens)).toHaveLength(49);
    });
  });

  describe('weight overrides', () => {
    it('applies heading weight overrides', () => {
      const tokens = expandTypeScale({
        base: 14,
        ratio: 1.2,
        weights: {heading: {1: 'var(--font-weight-bold)'}},
      });
      expect(tokens['--heading-1-weight']).toBe('var(--font-weight-bold)');
      expect(tokens['--heading-2-weight']).toBe('var(--font-weight-semibold)');
    });

    it('applies text weight overrides', () => {
      const tokens = expandTypeScale({
        base: 14,
        ratio: 1.2,
        weights: {text: {large: 'var(--font-weight-normal)'}},
      });
      expect(tokens['--text-large-weight']).toBe('var(--font-weight-normal)');
      expect(tokens['--text-body-weight']).toBe('var(--font-weight-normal)');
    });
  });

  describe('alternate scales', () => {
    it('dense scale (base=12, ratio=1.125)', () => {
      const tokens = expandTypeScale({base: 12, ratio: 1.125});
      expect(tokens['--text-base']).toBe('12px');
      expect(tokens['--text-lg']).toBe('14px'); // 12 × 1.125 ≈ 13.5 → 14
      expect(tokens['--heading-4-size']).toBe('var(--text-base)');
      expect(tokens['--heading-4-leading']).toBe('var(--leading-base)');
    });

    it('airy scale (base=16, ratio=1.25)', () => {
      const tokens = expandTypeScale({base: 16, ratio: 1.25});
      expect(tokens['--text-base']).toBe('16px');
      expect(tokens['--text-lg']).toBe('20px'); // 16 × 1.25 = 20
      expect(tokens['--text-2xl']).toBe('31px'); // 16 × 1.25³ ≈ 31.25 → 31
      expect(tokens['--heading-1-size']).toBe('var(--text-2xl)');
    });

    it('all scales produce 4px-grid-aligned line heights', () => {
      const scales = [
        {base: 12, ratio: 1.125},
        {base: 14, ratio: 1.2},
        {base: 16, ratio: 1.25},
        {base: 18, ratio: 1.333},
      ];
      const sizeTokens = [
        '--text-xsm',
        '--text-sm',
        '--text-base',
        '--text-lg',
        '--text-xl',
        '--text-2xl',
        '--text-3xl',
        '--text-4xl',
      ];
      const leadTokens = [
        '--leading-tight',
        '--leading-snug',
        '--leading-base',
        '--leading-normal',
        '--leading-relaxed',
        '--leading-2xl',
        '--leading-3xl',
        '--leading-4xl',
      ];
      for (const config of scales) {
        const tokens = expandTypeScale(config);
        for (let i = 0; i < sizeTokens.length; i++) {
          const fontSize = parseInt(tokens[sizeTokens[i]]);
          const ratio = parseFloat(tokens[leadTokens[i]]);
          const lhPx = Math.round(fontSize * ratio);
          expect(lhPx % 4).toBe(0);
          expect(lhPx).toBeGreaterThanOrEqual(fontSize + 4);
        }
      }
    });
  });
});

describe('generateTypeScaleComponents', () => {
  it('generates heading and text component overrides', () => {
    const components = generateTypeScaleComponents({base: 14, ratio: 1.2});
    expect(components.heading).toBeDefined();
    expect(components.text).toBeDefined();
  });

  it('heading overrides reference semantic tokens', () => {
    const components = generateTypeScaleComponents({base: 14, ratio: 1.2});
    expect(components.heading['level:1'].fontSize).toBe(
      'var(--heading-1-size)',
    );
    expect(components.heading['level:1'].lineHeight).toBe(
      'var(--heading-1-leading)',
    );
  });

  it('text overrides reference semantic tokens', () => {
    const components = generateTypeScaleComponents({base: 14, ratio: 1.2});
    expect(components.text['type:body'].fontSize).toBe('var(--text-body-size)');
    expect(components.text['type:body'].lineHeight).toBe(
      'var(--text-body-leading)',
    );
  });
});
