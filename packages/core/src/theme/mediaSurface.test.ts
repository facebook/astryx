// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {
  defineTheme,
  generateMediaSurfaceCSS,
  generateThemeCSS,
} from './defineTheme';
import {
  mediaSurfaceRegistry,
  mediaSurfaceComponents,
  getMediaSurface,
} from './mediaSurfaceRegistry';

describe('mediaSurfaceRegistry', () => {
  it('registers toast and tooltip as inverted-capable', () => {
    expect(mediaSurfaceComponents()).toContain('toast');
    expect(mediaSurfaceComponents()).toContain('tooltip');
  });

  it('marks toast error as always-dark', () => {
    expect(getMediaSurface('toast')?.alwaysDarkVariant).toBe('error');
  });

  it('tooltip has no always-dark variant', () => {
    expect(getMediaSurface('tooltip')?.alwaysDarkVariant).toBeUndefined();
  });
});

describe('defineTheme surfaces', () => {
  it('defaults every registered component to inverted', () => {
    const theme = defineTheme({name: 't1'});
    for (const c of mediaSurfaceComponents()) {
      expect(theme.__surfaces?.[c]).toBe('inverted');
    }
  });

  it('applies a normal opt-out from surfaces input', () => {
    const theme = defineTheme({name: 't2', surfaces: {toast: 'normal'}});
    expect(theme.__surfaces?.toast).toBe('normal');
    expect(theme.__surfaces?.tooltip).toBe('inverted');
  });

  it('inherits surfaces from an extended base theme', () => {
    const base = defineTheme({name: 'base', surfaces: {toast: 'normal'}});
    const child = defineTheme({name: 'child', extends: base});
    expect(child.__surfaces?.toast).toBe('normal');
  });

  it('child surfaces override the base', () => {
    const base = defineTheme({name: 'base2', surfaces: {toast: 'normal'}});
    const child = defineTheme({
      name: 'child2',
      extends: base,
      surfaces: {toast: 'inverted'},
    });
    expect(child.__surfaces?.toast).toBe('inverted');
  });
});

describe('generateMediaSurfaceCSS', () => {
  it('emits NOTHING on the default (all-inverted) path', () => {
    const theme = defineTheme({name: 'default-path'});
    expect(generateMediaSurfaceCSS(theme)).toBe('');
  });

  it('emits a normal-surface opt-out block for toast', () => {
    const theme = defineTheme({name: 'optout', surfaces: {toast: 'normal'}});
    const css = generateMediaSurfaceCSS(theme);
    // Root (non-error) gets the normal background
    expect(css).toContain('.astryx-toast:not([data-type="error"])');
    expect(css).toContain(
      `background: ${mediaSurfaceRegistry.toast.normalBackground}`,
    );
    // Content wrapper resets the inherited flip properties
    expect(css).toContain('color-scheme: inherit;');
    expect(css).toContain('--color-text-primary: inherit;');
    // Scoped to the theme
    expect(css).toContain('@scope ([data-astryx-theme="optout"])');
  });

  it('scopes tooltip opt-out to the whole component (no error variant)', () => {
    const theme = defineTheme({name: 'ttopt', surfaces: {tooltip: 'normal'}});
    const css = generateMediaSurfaceCSS(theme);
    expect(css).toContain('.astryx-tooltip {');
    expect(css).not.toContain('.astryx-tooltip:not(');
  });

  it('the default theme CSS output contains no media-surface opt-out', () => {
    const theme = defineTheme({name: 'clean'});
    const {component} = generateThemeCSS(theme);
    expect(component).not.toContain('color-scheme: inherit');
  });
});
