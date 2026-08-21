// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {pickMediaMode} from './useAutoMediaMode';
import {parseColor} from '../utils/color';

const rgb = (value: string) => {
  const parsed = parseColor(value);
  if (parsed === null) {
    throw new Error(`bad test color ${value}`);
  }
  return parsed;
};

const onDark = rgb('#FFFFFF');
const onLight = rgb('#171717');

describe('pickMediaMode', () => {
  it('picks dark for a dark surface', () => {
    expect(pickMediaMode(rgb('#0A1317'), onDark, onLight)).toBe('dark');
  });

  it('picks light for a light surface', () => {
    expect(pickMediaMode(rgb('#FFFFFF'), onDark, onLight)).toBe('light');
  });

  // The bug this exists for: a theme whose "inverted" background is a pale
  // grey, where a hardcoded mode="dark" paints white text at 1.25:1.
  it('picks light for a surface a theme merely calls inverted', () => {
    expect(pickMediaMode(rgb('#E4E6EB'), onDark, onLight)).toBe('light');
  });

  it('picks dark for a saturated surface where white reads better', () => {
    expect(pickMediaMode(rgb('#AA071E'), onDark, onLight)).toBe('dark');
  });

  it('still picks a side when both on-colors are marginal', () => {
    // Neither is comfortable on mid-grey (4.54 vs 3.95); this is a relative
    // choice, not a contrast target, so it returns the better one rather
    // than giving up.
    expect(pickMediaMode(rgb('#767676'), onDark, onLight)).toBe('dark');
  });

  it('respects a theme that overrides its on-colors', () => {
    // A theme whose on-dark is not white: the decision follows the theme's
    // own values, not an assumption about them.
    expect(pickMediaMode(rgb('#0A1317'), rgb('#101010'), rgb('#F0F0F0'))).toBe(
      'light',
    );
  });

  it('composites a translucent on-color before judging it', () => {
    // Raw white would score 4.54 on this surface and win; composited at 10%
    // alpha it is 1.21 and loses to the 3.95 of on-light.
    expect(
      pickMediaMode(rgb('#767676'), rgb('rgba(255,255,255,0.10)'), onLight),
    ).toBe('light');
  });

  it('gives up when an on-color is unreadable', () => {
    expect(pickMediaMode(rgb('#0A1317'), null, onLight)).toBeNull();
    expect(pickMediaMode(rgb('#0A1317'), onDark, null)).toBeNull();
  });
});
