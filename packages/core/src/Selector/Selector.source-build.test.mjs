// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Selector.source-build.test.mjs
 * @input Uses Babel, next/babel, the StyleX compiler, Selector source, and
 *   Selector motion source
 * @output Verifies raw Selector and motion source survive a consumer's Babel pipeline
 * @position Regression test for Selector source-build compatibility
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {transformAsync} from '@babel/core';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import {describe, expect, it} from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const SELECTOR_SOURCE = path.join(__dirname, 'Selector.tsx');
const SELECTOR_MOTION_SOURCE = path.join(__dirname, 'selectorMotion.stylex.ts');

const EXPECTED_PADDING_DECLARATIONS = [
  'padding-block:calc((var(--size-element-sm) - var(--spacing-5) - 2 * var(--border-width)) / 2)',
  'padding-block:calc((var(--size-element-md) - var(--spacing-5) - 2 * var(--border-width)) / 2)',
  'padding-block:calc((var(--size-element-lg) - var(--spacing-5) - 2 * var(--border-width)) / 2)',
];

describe('Selector source-build compatibility (#5464)', () => {
  it('compiles after next/babel lowers module-scope arrows', async () => {
    const source = await fs.readFile(SELECTOR_SOURCE, 'utf8');
    const result = await transformAsync(source, {
      babelrc: false,
      caller: {
        name: 'selector-source-build-test',
        isDev: false,
        isServer: false,
        supportsStaticESM: false,
      },
      configFile: false,
      envName: 'production',
      filename: SELECTOR_SOURCE,
      presets: ['next/babel'],
      plugins: [
        [
          stylexBabelPlugin,
          {
            dev: false,
            runtimeInjection: false,
            genConditionalClasses: true,
            treeshakeCompensation: true,
            unstable_moduleResolution: {
              type: 'commonJS',
              rootDir: ROOT,
            },
          },
        ],
      ],
    });

    const declarations = (result?.metadata?.stylex ?? [])
      .map(([, rule]) => rule.ltr.match(/^\.[^{]+\{(.+)\}$/)?.[1])
      .filter(declaration => declaration?.startsWith('padding-block:calc'));

    expect(declarations).toEqual(EXPECTED_PADDING_DECLARATIONS);
  });

  it('emits interruptible open/close and reduced-motion rules', async () => {
    const source = await fs.readFile(SELECTOR_MOTION_SOURCE, 'utf8');
    const result = await transformAsync(source, {
      babelrc: false,
      caller: {
        name: 'selector-motion-source-build-test',
        isDev: false,
        isServer: false,
        supportsStaticESM: false,
      },
      configFile: false,
      envName: 'production',
      filename: SELECTOR_MOTION_SOURCE,
      presets: ['next/babel'],
      plugins: [
        [
          stylexBabelPlugin,
          {
            dev: false,
            runtimeInjection: false,
            genConditionalClasses: true,
            treeshakeCompensation: true,
            unstable_moduleResolution: {
              type: 'commonJS',
              rootDir: ROOT,
            },
          },
        ],
      ],
    });

    const rules = (result?.metadata?.stylex ?? []).map(([, rule]) => rule.ltr);
    expect(rules.some(rule => rule.includes('@starting-style'))).toBe(true);
    expect(
      rules.some(rule => rule.includes('transition-behavior:allow-discrete')),
    ).toBe(true);
    expect(
      rules.some(rule =>
        rule.includes('@media (prefers-reduced-motion: reduce)'),
      ),
    ).toBe(true);
  });
});
