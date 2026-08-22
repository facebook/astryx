// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Guards the `CustomTokens` augmentation point — the seam an app uses to
 *   declare a semantic token Astryx does not ship.
 * @input A module augmentation of `@astryxdesign/core/theme`, applied to the
 *   whole typecheck program by virtue of being declared here.
 * @output Vitest failures if the token stops reaching the CSS, plus `tsc`
 *   failures (via `@ts-expect-error`) if the closed union stops being closed.
 *
 * The gap this closes: the runtime always accepted an unknown token — it
 * copies whatever keys `tokens` holds straight into the theme's CSS — while
 * the type rejected it. So a working theme failed typecheck, which is the
 * worst combination: it looks supported right up until `tsc`.
 *
 * Both halves matter here. Widening the union to `string` would fix the error
 * and destroy the typo-catching that is the reason the union is closed, so the
 * undeclared-token assertions below are as much the point as the declared one.
 */

import {describe, it, expect} from 'vitest';
import {defineTheme, generateThemeCSS} from './defineTheme';

declare module '@astryxdesign/core/theme' {
  interface CustomTokens {
    '--color-layer-border': true;
    // Not a CSS custom property name — must not widen the union.
    colorLayerBorder: true;
  }
}

describe('CustomTokens augmentation', () => {
  it('accepts a declared token and carries it into the theme', () => {
    const theme = defineTheme({
      name: 'custom-token',
      tokens: {
        '--color-layer-border': ['hsl(0 0% 88%)', 'hsl(0 0% 26%)'],
      },
    });

    expect(theme.tokens['--color-layer-border']).toBe(
      'light-dark(hsl(0 0% 88%), hsl(0 0% 26%))',
    );
  });

  it('emits the declared token as a CSS custom property', () => {
    const theme = defineTheme({
      name: 'custom-token-css',
      tokens: {'--color-layer-border': '#E0E0E0'},
      components: {
        layer: {base: {borderColor: 'var(--color-layer-border)'}},
      },
    });

    const {component} = generateThemeCSS(theme);
    expect(component).toContain('--color-layer-border: #E0E0E0');
    expect(component).toContain('var(--color-layer-border)');
  });

  it('still rejects an undeclared token name', () => {
    const theme = defineTheme({
      name: 'typo',
      tokens: {
        // @ts-expect-error a token nobody declared is still a compile error
        '--color-layer-bordr': '#E0E0E0',
      },
    });

    // The runtime keeps accepting it — the type is the only guardrail, which
    // is exactly why it has to stay closed.
    expect(theme.tokens['--color-layer-bordr']).toBe('#E0E0E0');
  });

  it('ignores a declared key that is not a CSS custom property', () => {
    defineTheme({
      name: 'bad-key',
      tokens: {
        // @ts-expect-error `colorLayerBorder` is declared but lacks the `--` prefix
        colorLayerBorder: '#E0E0E0',
      },
    });
  });
});
