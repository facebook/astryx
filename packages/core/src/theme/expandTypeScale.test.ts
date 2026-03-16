/**
 * @file expandTypeScale.test.ts
 * Tests for the type scale computation function.
 */

import {describe, it, expect} from 'vitest';
import {expandTypeScale} from './expandTypeScale';

describe('expandTypeScale', () => {
  describe('default scale (base=14, ratio=1.2)', () => {
    const tokens = expandTypeScale({base: 14, ratio: 1.2});

    it('generates 33 tokens', () => {
      expect(Object.keys(tokens)).toHaveLength(33);
    });

    it('anchors h4 to base size', () => {
      expect(tokens['--heading-4-size']).toBe('14px');
    });

    it('computes heading sizes from geometric progression', () => {
      // h1 = 14 × 1.2³ ≈ 24.19 → 24px
      expect(tokens['--heading-1-size']).toBe('24px');
      // h2 = 14 × 1.2² ≈ 20.16 → 20px
      expect(tokens['--heading-2-size']).toBe('20px');
      // h3 = 14 × 1.2¹ ≈ 16.8 → 17px
      expect(tokens['--heading-3-size']).toBe('17px');
      // h5 = 14 × 1.2⁻¹ ≈ 11.67 → 12px
      expect(tokens['--heading-5-size']).toBe('12px');
      // h6 = 14 × 1.2⁻² ≈ 9.72 → 10px
      expect(tokens['--heading-6-size']).toBe('10px');
    });

    it('computes body text at base size', () => {
      expect(tokens['--text-body-size']).toBe('14px');
      expect(tokens['--text-label-size']).toBe('14px');
      expect(tokens['--text-code-size']).toBe('14px');
    });

    it('computes large text one step up', () => {
      // 14 × 1.2¹ ≈ 16.8 → 17px
      expect(tokens['--text-large-size']).toBe('17px');
    });

    it('computes supporting text one step down', () => {
      // 14 × 1.2⁻¹ ≈ 11.67 → 12px
      expect(tokens['--text-supporting-size']).toBe('12px');
    });

    it('snaps line heights to 4px grid', () => {
      // All line heights should be divisible by 4
      for (const [key, value] of Object.entries(tokens)) {
        if (key.endsWith('-leading')) {
          const px = parseInt(value);
          expect(px % 4).toBe(0);
        }
      }
    });

    it('ensures line height is at least fontSize + 4', () => {
      for (const [key, value] of Object.entries(tokens)) {
        if (key.endsWith('-leading')) {
          const lh = parseInt(value);
          // Find the corresponding size token
          const sizeKey = key.replace('-leading', '-size');
          const fontSize = parseInt(tokens[sizeKey]);
          expect(lh).toBeGreaterThanOrEqual(fontSize + 4);
        }
      }
    });

    it('assigns semibold weight to all headings', () => {
      for (let level = 1; level <= 6; level++) {
        expect(tokens[`--heading-${level}-weight`]).toBe(
          'var(--font-weight-semibold)',
        );
      }
    });

    it('assigns correct weights to text types', () => {
      expect(tokens['--text-body-weight']).toBe('var(--font-weight-normal)');
      expect(tokens['--text-large-weight']).toBe('var(--font-weight-semibold)');
      expect(tokens['--text-label-weight']).toBe('var(--font-weight-medium)');
      expect(tokens['--text-code-weight']).toBe('var(--font-weight-normal)');
      expect(tokens['--text-supporting-weight']).toBe(
        'var(--font-weight-normal)',
      );
    });
  });

  describe('dense scale (base=12, ratio=1.125)', () => {
    const tokens = expandTypeScale({base: 12, ratio: 1.125});

    it('anchors h4 to base 12px', () => {
      expect(tokens['--heading-4-size']).toBe('12px');
    });

    it('produces smaller heading sizes', () => {
      // h1 = 12 × 1.125³ ≈ 17.09 → 17px
      expect(tokens['--heading-1-size']).toBe('17px');
      // h2 = 12 × 1.125² ≈ 15.19 → 15px
      expect(tokens['--heading-2-size']).toBe('15px');
    });

    it('keeps body at base', () => {
      expect(tokens['--text-body-size']).toBe('12px');
    });
  });

  describe('airy scale (base=16, ratio=1.25)', () => {
    const tokens = expandTypeScale({base: 16, ratio: 1.25});

    it('anchors h4 to base 16px', () => {
      expect(tokens['--heading-4-size']).toBe('16px');
    });

    it('produces larger heading sizes', () => {
      // h1 = 16 × 1.25³ ≈ 31.25 → 31px
      expect(tokens['--heading-1-size']).toBe('31px');
      // h2 = 16 × 1.25² = 25 → 25px
      expect(tokens['--heading-2-size']).toBe('25px');
    });

    it('keeps body at base', () => {
      expect(tokens['--text-body-size']).toBe('16px');
    });
  });

  describe('token naming', () => {
    const tokens = expandTypeScale({base: 14, ratio: 1.2});

    it('uses --heading-{level}-{prop} for headings', () => {
      for (let level = 1; level <= 6; level++) {
        expect(tokens).toHaveProperty(`--heading-${level}-size`);
        expect(tokens).toHaveProperty(`--heading-${level}-weight`);
        expect(tokens).toHaveProperty(`--heading-${level}-leading`);
      }
    });

    it('uses --text-{type}-{prop} for text', () => {
      for (const type of ['body', 'large', 'label', 'code', 'supporting']) {
        expect(tokens).toHaveProperty(`--text-${type}-size`);
        expect(tokens).toHaveProperty(`--text-${type}-weight`);
        expect(tokens).toHaveProperty(`--text-${type}-leading`);
      }
    });
  });
});
