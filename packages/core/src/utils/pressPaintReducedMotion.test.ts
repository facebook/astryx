// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pressPaintReducedMotion.test.ts
 * @input Uses vitest, Babel with the StyleX plugin, interactionOverlay.stylex.ts
 *   and the Reduce Motion keys
 * @output Checks, in the compiled CSS, the press paint's release under Reduce
 *   Motion: the system's cross-fade on a coarse pointer, nothing on any other
 * @position Regression test for design:reduced-motion DR2 and DR3 on the
 *   shared press paint
 *
 * The release fades the paint's alpha in place, an opacity-only change. Under
 * Reduce Motion with a coarse primary pointer it takes the system cross-fade's
 * duration and curve (reducedMotionFadeConsts); with any other pointer the
 * strength drops to 0 at the lift and no animation runs. Each override must
 * outrank the arm it overrides.
 */

import fs from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {reducedMotionKeys} from '../motion/reducedMotion.stylex';

type Rule = [string, {ltr: string}, number];

const root = path.resolve(__dirname, '../../../..');

// Babel's types are not part of core's typecheck; type the one call used.
const {transformSync} = createRequire(import.meta.url)('@babel/core') as {
  transformSync: (
    code: string,
    options: Record<string, unknown>,
  ) => {metadata?: unknown} | null;
};

function compiledRules(): Rule[] {
  const file = path.resolve(__dirname, 'interactionOverlay.stylex.ts');
  const output = transformSync(fs.readFileSync(file, 'utf8'), {
    filename: file,
    babelrc: false,
    configFile: false,
    parserOpts: {plugins: ['typescript', 'jsx']},
    plugins: [
      [
        '@stylexjs/babel-plugin',
        {
          dev: false,
          runtimeInjection: false,
          genConditionalClasses: true,
          treeshakeCompensation: true,
          unstable_moduleResolution: {type: 'commonJS', rootDir: root},
        },
      ],
    ],
  });
  return (output?.metadata as {stylex?: Rule[]}).stylex ?? [];
}

const FADING = '[data-astryx-press="fading"]';

function rule(rules: Rule[], parts: string[]): Rule | undefined {
  return rules.find(([, {ltr}]) => parts.every(part => ltr.includes(part)));
}

describe('press paint under Reduce Motion', () => {
  const rules = compiledRules();

  it('ends the release at once with a fine pointer (DR3)', () => {
    const instant = reducedMotionKeys.instant;
    const strength = rule(rules, [instant, FADING, '--astryx-press-alpha:0']);
    const animation = rule(rules, [instant, FADING, 'animation-name:none']);
    expect(strength).toBeDefined();
    expect(animation).toBeDefined();
    const fadingStrength = rule(rules, [FADING, '--astryx-press-alpha:1']);
    const fadingAnimation = rules.find(
      ([, {ltr}]) =>
        ltr.includes(FADING) &&
        ltr.includes('animation-name:') &&
        !ltr.includes('animation-name:none'),
    );
    expect(strength![2]).toBeGreaterThan(fadingStrength![2]);
    expect(animation![2]).toBeGreaterThan(fadingAnimation![2]);
  });

  it('cross-fades with the system duration and curve on a coarse pointer (DR2)', () => {
    const fade = reducedMotionKeys.fade;
    const CELL = '[data-astryx-pressable="cell"]';
    const control = (parts: string[]) =>
      rules.find(
        ([, {ltr}]) =>
          !ltr.includes(CELL) && parts.every(part => ltr.includes(part)),
      );
    const duration = control([fade, FADING, 'animation-duration:']);
    const curve = control([fade, FADING, 'animation-timing-function:']);
    expect(duration).toBeDefined();
    expect(curve).toBeDefined();
    // A control's release runs on UIButton's clock; a cell's on the
    // deselect's. The fade outranks both.
    const controlDuration = control([FADING, 'animation-duration:.25s']);
    expect(duration![2]).toBeGreaterThan(controlDuration![2]);
    const cellFade = rule(rules, [fade, FADING, CELL, 'animation-duration:']);
    const cellDuration = rules.find(
      ([, {ltr}]) =>
        !ltr.includes(fade) &&
        [FADING, CELL, 'animation-duration:.2s'].every(part =>
          ltr.includes(part),
        ),
    );
    expect(cellFade![2]).toBeGreaterThan(cellDuration![2]);
    // The fade keeps the animation (no `none` under the coarse key).
    expect(rule(rules, [fade, FADING, 'animation-name:none'])).toBeUndefined();
  });
});
