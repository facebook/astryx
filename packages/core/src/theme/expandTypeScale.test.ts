/**
 * @file expandTypeScale.test.ts
 * Tests for the type scale computation function.
 */

import {describe, it, expect} from 'vitest';
import {expandTypeScale, generateTypeScaleComponents} from './expandTypeScale';

describe('expandTypeScale', () => {
  describe('default scale (base=14, ratio=1.2)', () => {
    const tokens = expandTypeScale({base: 14, ratio: 1.2});

    it('generates 33 tokens', () => {
      expect(Object.keys(tokens)).toHaveLength(33);
    });

    it('anchors h4 to base size', () => {
      expect(tokens['--heading-4-size']).toBe('0.875rem');
    });

    it('computes heading sizes from geometric progression', () => {
      // h1 = 14 × 1.2³ ≈ 24.19 → 1.5rem
      expect(tokens['--heading-1-size']).toBe('1.5rem');
      // h2 = 14 × 1.2² ≈ 20.16 → 1.25rem
      expect(tokens['--heading-2-size']).toBe('1.25rem');
      // h3 = 14 × 1.2¹ ≈ 16.8 → 1.0625rem
      expect(tokens['--heading-3-size']).toBe('1.0625rem');
      // h5 = 14 × 1.2⁻¹ ≈ 11.67 → 0.75rem
      expect(tokens['--heading-5-size']).toBe('0.75rem');
      // h6 = 14 × 1.2⁻² ≈ 9.72 → 0.625rem
      expect(tokens['--heading-6-size']).toBe('0.625rem');
    });

    it('computes body text at base size', () => {
      expect(tokens['--text-body-size']).toBe('0.875rem');
      expect(tokens['--text-label-size']).toBe('0.875rem');
      expect(tokens['--text-code-size']).toBe('0.875rem');
    });

    it('computes large text one step up', () => {
      // 14 × 1.2¹ ≈ 16.8 → 1.0625rem
      expect(tokens['--text-large-size']).toBe('1.0625rem');
    });

    it('computes supporting text one step down', () => {
      // 14 × 1.2⁻¹ ≈ 11.67 → 0.75rem
      expect(tokens['--text-supporting-size']).toBe('0.75rem');
    });

    it('emits unitless line-height ratios', () => {
      // Line heights should be unitless numbers, not px values
      for (const [key, value] of Object.entries(tokens)) {
        if (key.endsWith('-leading')) {
          expect(value).not.toContain('px');
          const num = parseFloat(value);
          expect(num).toBeGreaterThan(1);
          expect(num).toBeLessThan(2);
        }
      }
    });

    it('snaps line heights to 4px grid', () => {
      // Each leading ratio × font size should be divisible by 4
      for (const [key, value] of Object.entries(tokens)) {
        if (key.endsWith('-leading')) {
          const sizeKey = key.replace('-leading', '-size');
          const fontSize = Math.round(parseFloat(tokens[sizeKey]) * 16);
          const ratio = parseFloat(value);
          const computedLh = Math.round(fontSize * ratio);
          expect(computedLh % 4).toBe(0);
        }
      }
    });

    it('ensures computed line height is at least fontSize + 4', () => {
      for (const [key, value] of Object.entries(tokens)) {
        if (key.endsWith('-leading')) {
          const sizeKey = key.replace('-leading', '-size');
          const fontSize = Math.round(parseFloat(tokens[sizeKey]) * 16);
          const ratio = parseFloat(value);
          const computedLh = Math.round(fontSize * ratio);
          expect(computedLh).toBeGreaterThanOrEqual(fontSize + 4);
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
      expect(tokens['--heading-4-size']).toBe('0.75rem');
    });

    it('produces smaller heading sizes', () => {
      // h1 = 12 × 1.125³ ≈ 17.09 → 1.0625rem
      expect(tokens['--heading-1-size']).toBe('1.0625rem');
      // h2 = 12 × 1.125² ≈ 15.19 → 0.9375rem
      expect(tokens['--heading-2-size']).toBe('0.9375rem');
    });

    it('keeps body at base', () => {
      expect(tokens['--text-body-size']).toBe('0.75rem');
    });
  });

  describe('airy scale (base=16, ratio=1.25)', () => {
    const tokens = expandTypeScale({base: 16, ratio: 1.25});

    it('anchors h4 to base 16px', () => {
      expect(tokens['--heading-4-size']).toBe('1rem');
    });

    it('produces larger heading sizes', () => {
      // h1 = 16 × 1.25³ ≈ 31.25 → 1.9375rem
      expect(tokens['--heading-1-size']).toBe('1.9375rem');
      // h2 = 16 × 1.25² = 25 → 1.5625rem
      expect(tokens['--heading-2-size']).toBe('1.5625rem');
    });

    it('keeps body at base', () => {
      expect(tokens['--text-body-size']).toBe('1rem');
    });
  });

  describe('weight overrides', () => {
    it('applies heading weight overrides', () => {
      const tokens = expandTypeScale({
        base: 14,
        ratio: 1.2,
        weights: {
          heading: {1: 'var(--font-weight-bold)', 3: 'var(--font-weight-bold)'},
        },
      });
      expect(tokens['--heading-1-weight']).toBe('var(--font-weight-bold)');
      expect(tokens['--heading-2-weight']).toBe('var(--font-weight-semibold)');
      expect(tokens['--heading-3-weight']).toBe('var(--font-weight-bold)');
    });

    it('applies text weight overrides', () => {
      const tokens = expandTypeScale({
        base: 14,
        ratio: 1.2,
        weights: {
          text: {large: 'var(--font-weight-normal)'},
        },
      });
      expect(tokens['--text-large-weight']).toBe('var(--font-weight-normal)');
      expect(tokens['--text-body-weight']).toBe('var(--font-weight-normal)');
    });

    it('applies both heading and text weight overrides', () => {
      const tokens = expandTypeScale({
        base: 14,
        ratio: 1.2,
        weights: {
          heading: {1: '700'},
          text: {body: '500'},
        },
      });
      expect(tokens['--heading-1-weight']).toBe('700');
      expect(tokens['--text-body-weight']).toBe('500');
    });

    it('uses defaults for unspecified weights', () => {
      const tokens = expandTypeScale({
        base: 14,
        ratio: 1.2,
        weights: {heading: {1: '700'}},
      });
      // Only h1 is overridden, rest use defaults
      expect(tokens['--heading-2-weight']).toBe('var(--font-weight-semibold)');
      expect(tokens['--text-body-weight']).toBe('var(--font-weight-normal)');
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

describe('generateTypeScaleComponents', () => {
  it('generates heading and text component keys', () => {
    const components = generateTypeScaleComponents({base: 14, ratio: 1.2});
    expect(components).toHaveProperty('heading');
    expect(components).toHaveProperty('text');
  });

  it('generates rules for all 6 heading levels', () => {
    const components = generateTypeScaleComponents({base: 14, ratio: 1.2});
    for (let level = 1; level <= 6; level++) {
      expect(components.heading).toHaveProperty(`level:${level}`);
    }
  });

  it('generates rules for all 5 text types', () => {
    const components = generateTypeScaleComponents({base: 14, ratio: 1.2});
    for (const type of ['body', 'large', 'label', 'code', 'supporting']) {
      expect(components.text).toHaveProperty(`type:${type}`);
    }
  });

  it('heading rules include fontFamily, fontSize, fontWeight, lineHeight', () => {
    const components = generateTypeScaleComponents({base: 14, ratio: 1.2});
    const h1 = components.heading['level:1'];
    expect(h1.fontFamily).toBe('var(--font-heading)');
    expect(h1.fontSize).toBe('var(--heading-1-size)');
    expect(h1.fontWeight).toBe('var(--heading-1-weight)');
    expect(h1.lineHeight).toBe('var(--heading-1-leading)');
  });

  it('text rules include fontFamily, fontSize, fontWeight, lineHeight', () => {
    const components = generateTypeScaleComponents({base: 14, ratio: 1.2});
    const body = components.text['type:body'];
    expect(body.fontFamily).toBe('var(--font-body)');
    expect(body.fontSize).toBe('var(--text-body-size)');
    expect(body.fontWeight).toBe('var(--text-body-weight)');
    expect(body.lineHeight).toBe('var(--text-body-leading)');
  });

  it('code text uses font-code family', () => {
    const components = generateTypeScaleComponents({base: 14, ratio: 1.2});
    expect(components.text['type:code'].fontFamily).toBe('var(--font-code)');
  });

  it('does NOT include color (handled by component internals)', () => {
    const components = generateTypeScaleComponents({base: 14, ratio: 1.2});
    expect(components.heading['level:1'].color).toBeUndefined();
    expect(components.text['type:body'].color).toBeUndefined();
    expect(components.text['type:supporting'].color).toBeUndefined();
  });
});
