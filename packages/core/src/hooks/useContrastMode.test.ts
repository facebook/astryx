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
const FLOOR = 3;

describe('decideContrastMode', () => {
  it('hands back the requested mode when it works', () => {
    const result = decideContrastMode(
      'dark',
      rgb('#171717'),
      rgb('#0A1317'),
      onColors,
      FLOOR,
    );
    expect(result.mode).toBe('dark');
    expect(result.isCorrected).toBe(false);
  });

  // The bug this hook exists for: a theme whose "inverted" background is not
  // inverted, where a static mode="dark" paints white on pale grey.
  it('escapes a request that is unreadable on the painted surface', () => {
    const result = decideContrastMode(
      'dark',
      rgb('#171717'),
      rgb('#E4E6EB'),
      onColors,
      FLOOR,
    );
    expect(result.isCorrected).toBe(true);
    expect(result.requestedRatio).toBeLessThan(FLOOR);
    expect(result.resolvedRatio).toBeGreaterThanOrEqual(FLOOR);
  });

  it('prefers the opposite side over dropping media entirely', () => {
    // The component asked for media treatment; the usual bug is that it named
    // the wrong side, not that it wanted none.
    const result = decideContrastMode(
      'dark',
      rgb('#171717'),
      rgb('#E4E6EB'),
      onColors,
      FLOOR,
    );
    expect(result.mode).toBe('light');
  });

  it('falls back to off when neither media side clears but ambient does', () => {
    // Mid-grey surface: both on-colors are marginal, the theme's own text is
    // tuned for it.
    const result = decideContrastMode(
      'dark',
      rgb('#FFFFFF'),
      rgb('#767676'),
      {dark: rgb('#8A8A8A'), light: rgb('#6E6E6E')},
      FLOOR,
    );
    expect(result.mode).toBe('off');
  });

  it('leaves the request alone when nothing clears the floor', () => {
    const result = decideContrastMode(
      'dark',
      rgb('#7A7A7A'),
      rgb('#767676'),
      {dark: rgb('#8A8A8A'), light: rgb('#6E6E6E')},
      FLOOR,
    );
    expect(result.mode).toBe('dark');
    expect(result.isCorrected).toBe(false);
  });

  // Deliberately NOT corrected: the guard catches bugs, it does not enforce
  // contrast. This pairing would have been "corrected" under a WCAG-AAA bar.
  it('leaves a low-but-legible pairing alone', () => {
    const result = decideContrastMode(
      'dark',
      rgb('#FAFAFA'),
      rgb('#E3193B'),
      onColors,
      FLOOR,
    );
    expect(result.mode).toBe('dark');
    expect(result.isCorrected).toBe(false);
    expect(result.resolvedRatio).toBeLessThan(7);
    expect(result.resolvedRatio).toBeGreaterThanOrEqual(FLOOR);
  });

  it('composites a translucent foreground before judging it', () => {
    // 6%-alpha white over a pale surface is invisible; only compositing
    // reveals that, since the raw token would score 21:1 against it.
    const result = decideContrastMode(
      'dark',
      rgb('#171717'),
      rgb('#E4E6EB'),
      {dark: rgb('rgba(255, 255, 255, 0.06)'), light: rgb('#000000')},
      FLOOR,
    );
    expect(result.isCorrected).toBe(true);
    expect(result.requestedRatio).toBeLessThan(1.2);
  });

  it('passes the request through when the on-color is unreadable', () => {
    const result = decideContrastMode(
      'dark',
      rgb('#171717'),
      rgb('#E4E6EB'),
      {dark: null, light: null},
      FLOOR,
    );
    expect(result.mode).toBe('dark');
    expect(result.isCorrected).toBe(false);
  });

  it('reports both ratios so a caller can explain the decision', () => {
    const result = decideContrastMode(
      'dark',
      rgb('#171717'),
      rgb('#E4E6EB'),
      onColors,
      FLOOR,
    );
    expect(result.requestedRatio).toBeCloseTo(1.25, 1);
    expect(result.ambientRatio).toBeCloseTo(14.36, 1);
  });
});
