// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import {describe, expect, it} from 'vitest';
import {
  SWIFT_IOS_THEME_FILE,
  renderSwiftIOSTheme,
  toFontFamilies,
  toHexColor,
  toPoints,
} from '../../scripts/swift-ios-theme.mjs';

describe('swift-ios default theme', () => {
  it('reads CSS colors and lengths as Swift values', () => {
    expect(toHexColor('#0064E0')).toBe('#0064E0FF');
    expect(toHexColor('#fff')).toBe('#FFFFFFFF');
    expect(toHexColor('rgba(5, 54, 89, 0.1)')).toBe('#0536591A');
    expect(toHexColor('transparent')).toBe('#00000000');
    expect(toHexColor('black')).toBe('#000000FF');
    expect(toHexColor('white')).toBe('#FFFFFFFF');
    expect(toHexColor('light-dark(#000, #fff)')).toBeNull();
    expect(toPoints('0.875rem')).toBe(14);
    expect(toPoints('32px')).toBe(32);
    expect(toPoints('600')).toBe(600);
    expect(toPoints('cubic-bezier(0, 0, 1, 1)')).toBeNull();
  });

  it('reads font stacks as family names, first choice first', async () => {
    expect(
      toFontFamilies('-apple-system, "Segoe UI", \'Inter\', sans-serif'),
    ).toEqual(['-apple-system', 'Segoe UI', 'Inter', 'sans-serif']);
    expect(await renderSwiftIOSTheme()).toContain(
      '"font-family-heading": ["-apple-system",',
    );
  });

  it('keeps every color token, keywords included', async () => {
    expect(await renderSwiftIOSTheme()).toContain(
      '"color-tint-hover": "#000000FF"',
    );
  });

  it('keeps the committed Swift theme in sync with core tokens', async () => {
    expect(
      fs.readFileSync(SWIFT_IOS_THEME_FILE, 'utf8'),
      'DefaultTheme.swift is stale; run pnpm -F @astryxdesign/native generate:swift-ios',
    ).toBe(await renderSwiftIOSTheme());
  });
});
