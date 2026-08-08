// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * DOM-free: these run in the `node` Vitest project (see vitest.config.ts), so
 * nothing here may render React or touch `document`.
 */

import {describe, expect, it} from 'vitest';
import {CATEGORICAL_TOKENS, type TokenResolver} from '@astryxdesign/charts';
import {buildVegaLiteConfig, withAstryxConfig} from './vegaLiteConfig';

/** Echoes the token name back, so resolved output is inspectable by name. */
const echo: TokenResolver = name => name;

describe('buildVegaLiteConfig', () => {
  it('draws its categorical range from the shared @astryxdesign/charts token list', () => {
    // Pins the palette to charts' single source of truth: with an echoing
    // resolver the range IS the shared token list, so a re-introduced local
    // copy in this package drifts and fails here.
    const config = buildVegaLiteConfig(echo);
    expect(config.range?.category).toEqual([...CATEGORICAL_TOKENS]);
  });

  it('resolves every categorical slot through the caller token resolver', () => {
    const config = buildVegaLiteConfig(name => `value(${name})`);
    expect(config.range?.category).toEqual(
      CATEGORICAL_TOKENS.map(name => `value(${name})`),
    );
  });
});

describe('withAstryxConfig', () => {
  it('applies the themed config by default when no compile options are given', () => {
    const options = withAstryxConfig(echo);
    expect(options.config).toEqual(buildVegaLiteConfig(echo));
  });

  it('applies the themed config when compile options carry no config', () => {
    const logger = {
      level: () => logger,
      error: () => logger,
      warn: () => logger,
      info: () => logger,
      debug: () => logger,
    };
    const options = withAstryxConfig(echo, {logger});
    expect(options.logger).toBe(logger);
    expect(options.config).toEqual(buildVegaLiteConfig(echo));
  });

  it('lets user config win over the derived theme config', () => {
    const options = withAstryxConfig(echo, {
      config: {background: '#ff0000', axis: {labelFontSize: 99}},
    });
    expect(options.config?.background).toBe('#ff0000');
    expect(options.config?.axis?.labelFontSize).toBe(99);
  });

  it('keeps theme values the user did not override', () => {
    const options = withAstryxConfig(echo, {config: {background: '#ff0000'}});
    // Untouched theme keys survive the merge.
    expect(options.config?.range?.category).toEqual([...CATEGORICAL_TOKENS]);
    expect(options.config?.axis?.labelColor).toBe('--color-text-secondary');
  });
});
