// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ProgressBar.reduced-motion.source-build.test.mjs
 * @input Uses Babel, the core StyleX build config, and the ProgressBar source
 * @output Verifies the shipped determinate fill jumps to a new value under
 *   reduced motion: its width transition takes no time (design:reduced-motion
 *   DR1 forbids a resize)
 * @position Regression test for the compiled CSS of the ProgressBar fill;
 *   jsdom evaluates no media queries or transitions
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {transformAsync} from '@babel/core';
import {describe, expect, it} from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = path.resolve(__dirname, '../..');
const SOURCE = path.join(__dirname, 'ProgressBar.tsx');

async function compiledRules() {
  const result = await transformAsync(await fs.readFile(SOURCE, 'utf8'), {
    babelrc: false,
    configFile: path.join(CORE_ROOT, 'babel.config.json'),
    filename: SOURCE,
  });
  return (result?.metadata?.stylex ?? []).map(([, rule]) =>
    rule.ltr.replace(/\s/g, ''),
  );
}

describe('the determinate fill under reduced motion', () => {
  it('still transitions its width otherwise', async () => {
    expect(await compiledRules()).toContainEqual(
      expect.stringContaining('transition-property:width'),
    );
  });

  it('jumps: its transition takes no time (DR1)', async () => {
    const reduced = (await compiledRules()).filter(rule =>
      rule.startsWith('@media(prefers-reduced-motion:reduce){'),
    );
    expect(reduced).toContainEqual(
      expect.stringContaining('transition-duration:0s'),
    );
  });
});
