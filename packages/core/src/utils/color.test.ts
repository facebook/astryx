// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {parseHex, parseRgb, parseColor, formatHex, formatColor} from './color';

describe('parseHex', () => {
  it('parses #rrggbb', () => {
    expect(parseHex('#0064E0')).toEqual({r: 0, g: 100, b: 224, a: 1});
  });

  it('parses without a leading #', () => {
    expect(parseHex('0064E0')).toEqual({r: 0, g: 100, b: 224, a: 1});
  });

  it('expands #rgb shorthand', () => {
    expect(parseHex('#abc')).toEqual({r: 0xaa, g: 0xbb, b: 0xcc, a: 1});
  });

  it('parses #rrggbbaa alpha', () => {
    expect(parseHex('#00000080')).toEqual({r: 0, g: 0, b: 0, a: 128 / 255});
  });

  it('expands #rgba shorthand alpha', () => {
    expect(parseHex('#f008')).toEqual({
      r: 0xff,
      g: 0,
      b: 0,
      a: 0x88 / 255,
    });
  });

  it('returns null for non-hex input', () => {
    expect(parseHex('rgb(0,0,0)')).toBeNull();
    expect(parseHex('#12')).toBeNull();
    expect(parseHex('#zzzzzz')).toBeNull();
    // @ts-expect-error runtime guard for non-string input
    expect(parseHex(null)).toBeNull();
  });
});

describe('parseRgb', () => {
  it('parses comma-separated rgb()', () => {
    expect(parseRgb('rgb(0, 100, 224)')).toEqual({
      r: 0,
      g: 100,
      b: 224,
      a: 1,
    });
  });

  it('parses rgba() with alpha', () => {
    expect(parseRgb('rgba(0, 0, 0, 0.5)')).toEqual({r: 0, g: 0, b: 0, a: 0.5});
  });

  it('parses space-separated with slash alpha', () => {
    expect(parseRgb('rgb(0 100 224 / 0.25)')).toEqual({
      r: 0,
      g: 100,
      b: 224,
      a: 0.25,
    });
  });

  it('parses percentage channels', () => {
    expect(parseRgb('rgb(100%, 0%, 0%)')).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 1,
    });
  });

  it('clamps alpha and channels into range', () => {
    expect(parseRgb('rgba(300, -20, 10, 2)')).toEqual({
      r: 255,
      g: 0,
      b: 10,
      a: 1,
    });
  });

  it('returns null when it cannot parse', () => {
    expect(parseRgb('rgb(0, 0)')).toBeNull();
    expect(parseRgb('#000000')).toBeNull();
  });
});

describe('parseColor', () => {
  it('routes hex and rgb strings to the right parser', () => {
    expect(parseColor('#FFFFFF')).toEqual({r: 255, g: 255, b: 255, a: 1});
    expect(parseColor('rgb(1, 2, 3)')).toEqual({r: 1, g: 2, b: 3, a: 1});
  });

  it('resolves the named colors used in token expressions', () => {
    expect(parseColor('transparent')).toEqual({r: 0, g: 0, b: 0, a: 0});
    expect(parseColor('BLACK')).toEqual({r: 0, g: 0, b: 0, a: 1});
    expect(parseColor('white')).toEqual({r: 255, g: 255, b: 255, a: 1});
  });

  it('returns null for unsupported colors so callers can preserve them', () => {
    expect(parseColor('var(--color-accent)')).toBeNull();
    expect(parseColor('oklch(0.5 0.1 200)')).toBeNull();
    expect(parseColor('rebeccapurple')).toBeNull();
  });
});

describe('formatHex', () => {
  it('formats channels as uppercase #RRGGBB', () => {
    expect(formatHex(0, 100, 224)).toBe('#0064E0');
  });

  it('rounds and clamps out-of-range channels', () => {
    expect(formatHex(-5, 300, 127.6)).toBe('#00FF80');
  });
});

describe('formatColor', () => {
  it('formats opaque colors as hex', () => {
    expect(formatColor({r: 0, g: 100, b: 224, a: 1})).toBe('#0064E0');
  });

  it('formats translucent colors as rgba()', () => {
    expect(formatColor({r: 0, g: 100, b: 224, a: 0.2})).toBe(
      'rgba(0, 100, 224, 0.2)',
    );
  });

  it('round-trips through parseColor', () => {
    const parsed = parseColor('rgba(10, 20, 30, 0.5)');
    expect(parsed).not.toBeNull();
    expect(formatColor(parsed!)).toBe('rgba(10, 20, 30, 0.5)');
  });
});
