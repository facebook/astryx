// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {decideContrastMode} from './useContrastMode';
import {parseColor} from '../utils/color';

const rgb = (value: string) => {
  const parsed = parseColor(value);
  if (parsed === null) {
    throw new Error(`bad test color ${value}`);
  }
  return parsed;
};

const onColors = {dark: rgb('#FFFFFF'), light: rgb('#000000')};
const AA = 4.5;

describe('decideContrastMode', () => {
  it('stays off when the ambient pairing already has contrast', () => {
    const result = decideContrastMode(
      rgb('#1C2B33'),
      rgb('#FFFFFF'),
      onColors,
      AA,
    );
    expect(result.mode).toBe('off');
    expect(result.resolvedRatio).toBe(result.ambientRatio);
  });

  it('inverts to light text when a dark surface swallows dark text', () => {
    const result = decideContrastMode(
      rgb('#1C2B33'),
      rgb('#0A1317'),
      onColors,
      AA,
    );
    expect(result.mode).toBe('dark');
    expect(result.resolvedRatio).toBeGreaterThan(result.ambientRatio);
  });

  it('inverts to dark text when a light surface swallows light text', () => {
    const result = decideContrastMode(
      rgb('#F5F7FA'),
      rgb('#FFFFFF'),
      onColors,
      AA,
    );
    expect(result.mode).toBe('light');
  });

  // The bug this hook exists for: a theme whose "inverted" background is not
  // actually inverted, where the static rule paints white text on light grey.
  it('does not invert a light surface just because the theme calls it inverted', () => {
    const result = decideContrastMode(
      rgb('#0D131A'),
      rgb('#E4E6EB'),
      onColors,
      AA,
    );
    expect(result.mode).toBe('off');
  });

  it('stays off when neither media foreground would improve things', () => {
    // Black text on mid-grey is already the best of the three; swapping in a
    // media foreground would churn the tree and lower the ratio.
    const result = decideContrastMode(
      rgb('#000000'),
      rgb('#767676'),
      onColors,
      7,
    );
    expect(result.mode).toBe('off');
  });

  it('composites a translucent foreground before judging it', () => {
    const result = decideContrastMode(
      rgb('rgba(0, 0, 0, 0.06)'),
      rgb('#0A1317'),
      onColors,
      AA,
    );
    expect(result.mode).toBe('dark');
  });

  it('falls back to surface luminance when on-colors are unreadable', () => {
    const result = decideContrastMode(
      rgb('#1C2B33'),
      rgb('#0A1317'),
      {dark: null, light: null},
      AA,
    );
    expect(result.mode).toBe('dark');
  });

  it('honors a raised threshold', () => {
    const surface = rgb('#FFFFFF');
    const text = rgb('#767676'); // ~4.54:1 on white
    expect(decideContrastMode(text, surface, onColors, AA).mode).toBe('off');
    expect(decideContrastMode(text, surface, onColors, 7).mode).toBe('light');
  });

  // Why the hook defaults to AAA rather than AA: in dark mode the error
  // surface reads 4.50 against ambient near-white — passing AA, but the
  // surface still wants the on-dark overlays and accent that come with the
  // media context. The AAA bar keeps it inverted, as it is today.
  it('keeps a barely-passing saturated surface inverted at the default bar', () => {
    const errorSurface = rgb('#E3193B');
    const ambient = rgb('#FAFAFA');
    expect(decideContrastMode(ambient, errorSurface, onColors, AA).mode).toBe(
      'off',
    );
    expect(decideContrastMode(ambient, errorSurface, onColors, 7).mode).toBe(
      'dark',
    );
  });
});
