import {describe, it, expect} from 'vitest';
import {hexToHct, hctToHex, tonalPalette, hexWithAlpha} from './hct';

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

describe('hexToHct / hctToHex roundtrip', () => {
  const cases = [
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#000000',
    '#FFFFFF',
    '#808080',
    '#0064E0',
  ];

  for (const hex of cases) {
    it(`roundtrips ${hex}`, () => {
      const hct = hexToHct(hex);
      const result = hctToHex(hct);
      const [r1, g1, b1] = hexToRgb(hex);
      const [r2, g2, b2] = hexToRgb(result);
      expect(Math.abs(r1 - r2)).toBeLessThanOrEqual(1);
      expect(Math.abs(g1 - g2)).toBeLessThanOrEqual(1);
      expect(Math.abs(b1 - b2)).toBeLessThanOrEqual(1);
    });
  }
});

describe('hexToHct ranges', () => {
  const cases = ['#FF0000', '#00FF00', '#0000FF', '#808080', '#0064E0'];

  for (const hex of cases) {
    it(`${hex} produces valid HCT ranges`, () => {
      const {hue, chroma, tone} = hexToHct(hex);
      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThanOrEqual(360);
      expect(chroma).toBeGreaterThanOrEqual(0);
      expect(tone).toBeGreaterThanOrEqual(0);
      expect(tone).toBeLessThanOrEqual(100);
    });
  }

  it('black has tone ≈ 0', () => {
    const {tone} = hexToHct('#000000');
    expect(tone).toBeCloseTo(0, 0);
  });

  it('white has tone ≈ 100', () => {
    const {tone} = hexToHct('#FFFFFF');
    expect(tone).toBeCloseTo(100, 0);
  });
});

describe('tonalPalette', () => {
  it('produces entries for all standard tones', () => {
    const palette = tonalPalette(220, 48);
    const expectedTones = [
      0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100,
    ];
    for (const tone of expectedTones) {
      expect(palette[tone]).toBeDefined();
      expect(palette[tone]).toMatch(/^#[0-9A-F]{6}$/);
    }
  });
});

describe('hexWithAlpha', () => {
  it('appends correct alpha hex for 1.0', () => {
    expect(hexWithAlpha('#FF0000', 1)).toBe('#FF0000FF');
  });

  it('appends correct alpha hex for 0.5', () => {
    expect(hexWithAlpha('#FF0000', 0.5)).toBe('#FF000080');
  });

  it('appends correct alpha hex for 0', () => {
    expect(hexWithAlpha('#FF0000', 0)).toBe('#FF000000');
  });

  it('appends correct alpha hex for 0.2', () => {
    expect(hexWithAlpha('#ABCDEF', 0.2)).toBe('#ABCDEF33');
  });
});
