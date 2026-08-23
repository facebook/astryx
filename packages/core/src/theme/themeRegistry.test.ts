// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, beforeEach} from 'vitest';
import {defineTheme} from './defineTheme';
import {
  getRegisteredTheme,
  getRegisteredThemes,
  registerTheme,
  resetThemes,
} from './themeRegistry';

describe('themeRegistry', () => {
  beforeEach(() => {
    resetThemes();
  });

  it('registers and resolves themes by name', () => {
    const theme = defineTheme({
      name: 'brand',
      tokens: {'--color-accent': '#123456'},
    });

    expect(getRegisteredTheme('brand')).toBe(theme);
  });

  it('returns null for empty or unknown names', () => {
    expect(getRegisteredTheme(null)).toBeNull();
    expect(getRegisteredTheme('')).toBeNull();
    expect(getRegisteredTheme('missing')).toBeNull();
  });

  it('replaces an existing theme with the same name', () => {
    const first = defineTheme({name: 'brand'});
    const second = defineTheme({
      name: 'brand',
      tokens: {'--color-accent': '#654321'},
    });

    expect(getRegisteredTheme('brand')).not.toBe(first);
    expect(getRegisteredTheme('brand')).toBe(second);
  });

  it('returns a defensive snapshot of registered themes', () => {
    const theme = defineTheme({name: 'brand'});
    const snapshot = getRegisteredThemes();

    expect(snapshot.get('brand')).toBe(theme);
    expect(snapshot).not.toBe(getRegisteredThemes());
  });

  it('allows explicit registration of built theme objects', () => {
    const theme = defineTheme({name: 'built'});
    resetThemes();

    registerTheme(theme);

    expect(getRegisteredTheme('built')).toBe(theme);
  });
});
