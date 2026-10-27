// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ProgressBar.reduced-motion.source-build.test.mjs
 * @input Uses Babel, the core StyleX build config, and the ProgressBar source
 * @output Verifies the shipped determinate fill under reduced motion: it never
 *   grows or shrinks (design:reduced-motion DR1); with a mouse it changes at
 *   once (DR3); on a touch screen the value-keyed fill fades in at its new
 *   length, opacity only, in 200 ms (DR2)
 * @position Regression test for the compiled CSS of the ProgressBar fill;
 *   jsdom evaluates no media queries or animations
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

const REDUCED = '@media(prefers-reduced-motion:reduce){';
const REDUCED_COARSE =
  '@media(prefers-reduced-motion:reduce)and(pointer:coarse){';

describe('the determinate fill under reduced motion', () => {
  it('still transitions its width otherwise', async () => {
    expect(await compiledRules()).toContainEqual(
      expect.stringContaining('transition-property:width'),
    );
  });

  it('never grows or shrinks: its width transition takes no time (DR1, DR3)', async () => {
    const reduced = (await compiledRules()).filter(rule =>
      rule.startsWith(REDUCED),
    );
    expect(reduced).toContainEqual(
      expect.stringContaining('transition-duration:0s'),
    );
  });

  it('on a touch screen hands the change to the keyed fill, which fades in, opacity only, in 200 ms (DR2)', async () => {
    const rules = await compiledRules();
    const coarse = rules.filter(rule => rule.startsWith(REDUCED_COARSE));
    // The transitioning fill steps aside and the keyed one shows.
    expect(coarse).toContainEqual(expect.stringContaining('display:none'));
    expect(coarse).toContainEqual(expect.stringContaining('display:block'));
    // Its fade: an opacity-only keyframe, 200 ms, easeInOut.
    const fadeIn = rules.find(rule =>
      /^@keyframes[\w-]+\{from\{opacity:0;?\}to\{opacity:1;?\}\}$/.test(rule),
    );
    expect(fadeIn).toBeDefined();
    const name = fadeIn.match(/^@keyframes([\w-]+)\{/)[1];
    expect(rules).toContainEqual(
      expect.stringContaining(`animation-name:${name}`),
    );
    expect(rules).toContainEqual(
      expect.stringMatching(/animation-duration:(\.2s|200ms)/),
    );
    expect(rules).toContainEqual(
      expect.stringMatching(
        /animation-timing-function:cubic-bezier\(0?\.42,0,0?\.58,1\)/,
      ),
    );
  });
});
