/**
 * @file expandTypeScale.test.ts
 * Tests for the two-layer type scale computation.
 */

import {describe, it, expect} from 'vitest';
import {expandTypeScale, generateTypeScaleComponents} from './expandTypeScale';

describe('expandTypeScale', () => {
  describe('Layer 1: raw size tokens', () => {
    const tokens = expandTypeScale({base: 14, ratio: 1.2});

    it('emits 8 raw size tokens in rem', () => {
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
        expect(tokens[name]).toMatch(/rem$/);
      }
    });

    it('anchors --text-base to the base size', () => {
      expect(tokens['--text-base']).toBe('0.875rem'); // 14/16
    });

    it('computes geometric progression', () => {
      expect(tokens['--text-xsm']).toBe('0.625rem'); // 10/16
      expect(tokens['--text-sm']).toBe('0.75rem'); // 12/16
      expect(tokens['--text-lg']).toBe('1.0625rem'); // 17/16
      expect(tokens['--text-xl']).toBe('1.25rem'); // 20/16
      expect(tokens['--text-2xl']).toBe('1.5rem'); // 24/16
      expect(tokens['--text-3xl']).toBe('1.8125rem'); // 29/16
      expect(tokens['--text-4xl']).toBe('2.1875rem'); // 35/16
    });
  });

  describe('Layer 2: semantic tokens', () => {
    const tokens = expandTypeScale({base: 14, ratio: 1.2});

    it('heading sizes are var() references to raw tokens', () => {
      expect(tokens['--heading-1-size']).toBe('var(--text-2xl)');
      expect(tokens['--heading-2-size']).toBe('var(--text-xl)');
      expect(tokens['--heading-3-size']).toBe('var(--text-lg)');
      expect(tokens['--heading-4-size']).toBe('var(--text-base)');
      expect(tokens['--heading-5-size']).toBe('var(--text-sm)');
      expect(tokens['--heading-6-size']).toBe('var(--text-xsm)');
    });

    it('heading leadings are hardcoded computed values', () => {
      expect(tokens['--heading-1-leading']).toBe('1.3333'); // 24px → 32px
      expect(tokens['--heading-2-leading']).toBe('1.4'); // 20px → 28px
      expect(tokens['--heading-3-leading']).toBe('1.4118'); // 17px → 24px
      expect(tokens['--heading-4-leading']).toBe('1.4286'); // 14px → 20px
      expect(tokens['--heading-5-leading']).toBe('1.6667'); // 12px → 20px
      expect(tokens['--heading-6-leading']).toBe('1.6'); // 10px → 16px
    });

    it('text type sizes are var() references', () => {
      expect(tokens['--text-body-size']).toBe('var(--text-base)');
      expect(tokens['--text-large-size']).toBe('var(--text-lg)');
      expect(tokens['--text-label-size']).toBe('var(--text-base)');
      expect(tokens['--text-code-size']).toBe('var(--text-base)');
      expect(tokens['--text-supporting-size']).toBe('var(--text-sm)');
    });

    it('text type leadings are hardcoded computed values', () => {
      expect(tokens['--text-body-leading']).toBe('1.4286'); // 14px → 20px
      expect(tokens['--text-large-leading']).toBe('1.4118'); // 17px → 24px
      expect(tokens['--text-label-leading']).toBe('1.4286');
      expect(tokens['--text-code-leading']).toBe('1.4286');
      expect(tokens['--text-supporting-leading']).toBe('1.6667'); // 12px → 16px
    });

    it('weight tokens are var() references (unchanged)', () => {
      expect(tokens['--heading-1-weight']).toBe('var(--font-weight-semibold)');
      expect(tokens['--text-body-weight']).toBe('var(--font-weight-normal)');
      expect(tokens['--text-large-weight']).toBe('var(--font-weight-semibold)');
      expect(tokens['--text-label-weight']).toBe('var(--font-weight-medium)');
    });

    it('all line heights snap to 4px grid', () => {
      // Map semantic leading tokens to their font sizes (px)
      const pairs: [string, number][] = [
        ['--heading-1-leading', 24],
        ['--heading-2-leading', 20],
        ['--heading-3-leading', 17],
        ['--heading-4-leading', 14],
        ['--heading-5-leading', 12],
        ['--heading-6-leading', 10],
        ['--text-body-leading', 14],
        ['--text-large-leading', 17],
        ['--text-supporting-leading', 12],
      ];
      for (const [token, fontSize] of pairs) {
        const ratio = parseFloat(tokens[token]);
        const lhPx = Math.round(fontSize * ratio);
        expect(lhPx % 4).toBe(0);
        expect(lhPx).toBeGreaterThanOrEqual(fontSize + 4);
      }
    });

    it('uses tiered target ratio based on font size', () => {
      // < 20px target 1.5: 14px → 20px line
      expect(Math.round(14 * parseFloat(tokens['--heading-4-leading']))).toBe(
        20,
      );
      // 20-31px target 1.4: 20px → 28px line
      expect(Math.round(20 * parseFloat(tokens['--heading-2-leading']))).toBe(
        28,
      );
      // 20-31px target 1.4: 24px → 32px line
      expect(Math.round(24 * parseFloat(tokens['--heading-1-leading']))).toBe(
        32,
      );
    });
  });

  describe('does not touch named leading tokens', () => {
    const tokens = expandTypeScale({base: 14, ratio: 1.2});

    it('does not emit --leading-* tokens', () => {
      const leadingKeys = Object.keys(tokens).filter(k =>
        k.startsWith('--leading-'),
      );
      expect(leadingKeys).toHaveLength(0);
    });
  });

  describe('total token count', () => {
    const tokens = expandTypeScale({base: 14, ratio: 1.2});

    it('generates 41 tokens (8 size + 33 semantic)', () => {
      expect(Object.keys(tokens)).toHaveLength(41);
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
      expect(tokens['--text-base']).toBe('0.75rem'); // 12/16
      expect(tokens['--heading-4-size']).toBe('var(--text-base)');
    });

    it('airy scale (base=16, ratio=1.25)', () => {
      const tokens = expandTypeScale({base: 16, ratio: 1.25});
      expect(tokens['--text-base']).toBe('1rem'); // 16/16
      expect(tokens['--text-lg']).toBe('1.25rem'); // 20/16
      expect(tokens['--heading-1-size']).toBe('var(--text-2xl)');
    });

    it('all scales produce 4px-grid-aligned line heights', () => {
      const scales = [
        {base: 12, ratio: 1.125},
        {base: 14, ratio: 1.2},
        {base: 16, ratio: 1.25},
        {base: 18, ratio: 1.333},
      ];
      for (const config of scales) {
        const tokens = expandTypeScale(config);
        for (let level = 1; level <= 6; level++) {
          const step = {1: 3, 2: 2, 3: 1, 4: 0, 5: -1, 6: -2}[level]!;
          const fontSize = Math.round(
            config.base * Math.pow(config.ratio, step),
          );
          const ratio = parseFloat(tokens[`--heading-${level}-leading`]);
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
