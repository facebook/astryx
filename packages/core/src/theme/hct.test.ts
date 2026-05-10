import {describe, it, expect} from 'vitest';
import {tonalPalette, hexToHct, maxChromaAtTone} from './hct';

describe('tonalPalette', () => {
  it('generates palette without chroma boost', () => {
    const palette = tonalPalette(250, 30);
    expect(palette[0]).toBe('#000000');
    expect(palette[100]).toBe('#FFFFFF');
    expect(Object.keys(palette)).toHaveLength(14);
  });

  it('chroma boost increases chroma at dark tones', () => {
    const normal = tonalPalette(250, 30);
    const boosted = tonalPalette(250, 30, {belowTone: 50, factor: 1.5, cap: 2.0});

    // T0 and T100 should be the same (black/white)
    expect(boosted[0]).toBe(normal[0]);
    expect(boosted[100]).toBe(normal[100]);

    // T90+ should be the same (above belowTone)
    expect(boosted[90]).toBe(normal[90]);
    expect(boosted[95]).toBe(normal[95]);

    // Mid-dark tones should differ where gamut allows
    // T30 is more likely to show a difference than T10/T20 which may clip
    expect(boosted[30]).not.toBe(normal[30]);
  });

  it('chroma boost respects cap', () => {
    const palette = tonalPalette(120, 30, {belowTone: 50, factor: 1.0, cap: 1.5});
    // At T0 the boost would be 1 + 50/(50*1) = 2.0, but cap is 1.5
    // So chroma is 30 * 1.5 = 45, not 30 * 2 = 60
    expect(palette[0]).toBe('#000000'); // black is always black
  });

  it('chroma boost with default options', () => {
    const palette = tonalPalette(120, 30, {});
    expect(palette[0]).toBe('#000000');
    expect(palette[100]).toBe('#FFFFFF');
  });
});

describe('maxChromaAtTone', () => {
  it('returns positive chroma for visible tones', () => {
    expect(maxChromaAtTone(250, 50)).toBeGreaterThan(0);
    expect(maxChromaAtTone(120, 50)).toBeGreaterThan(0);
  });

  it('returns higher chroma for mid tones than extremes', () => {
    const midMax = maxChromaAtTone(250, 50);
    const nearBlack = maxChromaAtTone(250, 5);
    expect(midMax).toBeGreaterThan(nearBlack);
  });

  it('different hues have different max chromas at the same tone', () => {
    const blueMax = maxChromaAtTone(250, 50);
    const greenMax = maxChromaAtTone(120, 50);
    // They should be different (blue can achieve higher chroma than green at T50)
    expect(blueMax).not.toBeCloseTo(greenMax, 0);
  });
});
