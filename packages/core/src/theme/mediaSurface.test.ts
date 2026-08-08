// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {
  defineTheme,
  generateMediaSurfaceCSS,
  generateThemeCSS,
} from './defineTheme';
import {mediaSurfaceComponents, getMediaSurface} from './mediaSurfaceRegistry';

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
  it('emits explicit inverted blocks for the default (all-inverted) path', () => {
    const theme = defineTheme({name: 'default-path'});
    const css = generateMediaSurfaceCSS(theme);
    // Content wrappers (not roots) flip, keyed on the scope root's data-theme.
    expect(css).toContain(
      '.astryx-toast:not([data-type="error"]) .astryx-toast-content',
    );
    expect(css).toContain('.astryx-tooltip .astryx-tooltip-content');
    // Ambient light → on-dark tokens; ambient dark → on-light tokens.
    expect(css).toContain(':scope[data-theme="light"]');
    expect(css).toContain(':scope[data-theme="dark"]');
    expect(css).toContain('--color-text-primary: var(--color-on-dark)');
    expect(css).toContain('--color-text-primary: var(--color-on-light)');
    // System mode via prefers-color-scheme.
    expect(css).toContain('@media (prefers-color-scheme: light)');
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    // Error toast is always dark.
    expect(css).toContain(
      '.astryx-toast[data-type="error"] .astryx-toast-content',
    );
    // Scoped to the theme.
    expect(css).toContain('@scope ([data-astryx-theme="default-path"])');
  });

  it('reflects a custom onDark/onLight token 1:1 on the toast content', () => {
    const theme = defineTheme({
      name: 'custom-media',
      onDark: {tokens: {'--color-accent': '#90CAF9'}},
      onLight: {tokens: {'--color-accent': '#01579B'}},
    });
    const css = generateMediaSurfaceCSS(theme);
    expect(css).toContain('--color-accent: #90CAF9');
    expect(css).toContain('--color-accent: #01579B');
  });

  it('opts a component out: emits nothing for it (theme owns the surface)', () => {
    const theme = defineTheme({name: 'optout', surfaces: {toast: 'normal'}});
    const css = generateMediaSurfaceCSS(theme);
    // No toast rules at all — not the info flip, not the error-always-dark
    // block, not a background. The theme controls the toast surface via its
    // own components.toast override, which the generator must not compete with.
    expect(css).not.toContain('.astryx-toast');
    // Tooltip (still inverted) keeps its content flip.
    expect(css).toContain('.astryx-tooltip .astryx-tooltip-content');
    expect(css).toContain('@scope ([data-astryx-theme="optout"])');
  });

  it('opts tooltip out: emits nothing for tooltip, toast still inverts', () => {
    const theme = defineTheme({name: 'ttopt', surfaces: {tooltip: 'normal'}});
    const css = generateMediaSurfaceCSS(theme);
    expect(css).not.toContain('.astryx-tooltip');
    // Toast (still inverted) keeps its content flip + error block.
    expect(css).toContain(
      '.astryx-toast:not([data-type="error"]) .astryx-toast-content',
    );
    expect(css).toContain(
      '.astryx-toast[data-type="error"] .astryx-toast-content',
    );
  });

  it('is included in the full theme CSS output', () => {
    const theme = defineTheme({name: 'full'});
    const {component} = generateThemeCSS(theme);
    expect(component).toContain(
      '.astryx-toast:not([data-type="error"]) .astryx-toast-content',
    );
  });
});
