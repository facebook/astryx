// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file contrast.test.ts
 * @input All shipped theme definitions (+ core defaults) and the contrast contract
 * @output CI failure whenever a theme's real fg/bg pairing drops below WCAG 2.1 AA
 * @position Cross-theme accessibility gate; the automated check requested in issue #3654
 *
 * Resolves every theme with resolveThemeTokens() in both modes, alpha-composites
 * each contract pair's background stack, and asserts the WCAG 2.1 contrast
 * ratio meets the pair's threshold (4.5:1 text, 3:1 non-text UI).
 *
 * Run `CONTRAST_REPORT=1 pnpm vitest run internal/theme-contrast` for a full
 * audit table (including diagnostic pairs that are not yet part of the
 * contract) instead of pass/fail assertions.
 */

import {describe, expect, it} from 'vitest';

import {resolveThemeTokens} from '@astryxdesign/core/theme';
import type {DefinedTheme} from '@astryxdesign/core/theme';

import {butterTheme} from '../../packages/themes/butter/src/source';
import {chocolateTheme} from '../../packages/themes/chocolate/src/source';
import {gothicTheme} from '../../packages/themes/gothic/src/source';
import {matchaTheme} from '../../packages/themes/matcha/src/source';
import {neutralTheme} from '../../packages/themes/neutral/src/source';
import {stoneTheme} from '../../packages/themes/stone/src/source';
import {y2kTheme} from '../../packages/themes/y2k/src/source';

import {CONTRAST_CONTRACT, type ContrastPair} from './contract';
import {effectivePairs} from './effective';
import {contrastRatio, flattenBackground, resolveColor, toHex} from './wcag';

const THEMES: ReadonlyArray<{name: string; theme: DefinedTheme | null}> = [
  {name: 'default', theme: null},
  {name: 'butter', theme: butterTheme},
  {name: 'chocolate', theme: chocolateTheme},
  {name: 'gothic', theme: gothicTheme},
  {name: 'matcha', theme: matchaTheme},
  {name: 'neutral', theme: neutralTheme},
  {name: 'stone', theme: stoneTheme},
  {name: 'y2k', theme: y2kTheme},
];

const MODES = ['light', 'dark'] as const;

type CheckResult = {
  pair: ContrastPair;
  ratio: number;
  fgHex: string;
  bgHex: string;
};

type Skip = {pair: ContrastPair; reason: string};

function runContract(
  tokens: Record<string, string>,
  pairs: readonly ContrastPair[],
  mode: (typeof MODES)[number],
): {failures: CheckResult[]; skips: Skip[]; checked: number} {
  const failures: CheckResult[] = [];
  const skips: Skip[] = [];
  let checked = 0;

  for (const pair of pairs) {
    if (pair.modes && !pair.modes.includes(mode as never)) {
      continue;
    }

    const scoped = pair.rebind ? {...tokens, ...pair.rebind} : tokens;
    const bg = flattenBackground(scoped, pair.bg, mode);
    if (bg === null) {
      skips.push({
        pair,
        reason: `unresolvable bg stack [${pair.bg.join(' < ')}]`,
      });
      continue;
    }
    const fgRaw = resolveColor(scoped, pair.fg, mode);
    if (fgRaw === null) {
      skips.push({pair, reason: `unresolvable fg ${pair.fg}`});
      continue;
    }
    const fg =
      fgRaw.a < 1
        ? {...flattenBackground(scoped, [...pair.bg, pair.fg], mode)!, a: 1}
        : fgRaw;

    checked += 1;
    const ratio = contrastRatio(fg, bg);
    if (ratio < pair.min) {
      failures.push({pair, ratio, fgHex: toHex(fg), bgHex: toHex(bg)});
    }
  }

  return {failures, skips, checked};
}

function formatFailure({pair, ratio, fgHex, bgHex}: CheckResult): string {
  return (
    `${pair.fg} (${fgHex}) on [${pair.bg.join(' < ')}] (${bgHex}): ` +
    `${ratio.toFixed(2)}:1 < ${pair.min}:1 (SC ${pair.criterion}) — ${pair.context}`
  );
}

const REPORT_MODE = process.env.CONTRAST_REPORT === '1';

describe('theme contrast contract (WCAG 2.1 AA)', () => {
  for (const {name, theme} of THEMES) {
    for (const mode of MODES) {
      it(`${name} / ${mode}`, () => {
        const tokens = resolveThemeTokens(theme, {mode});
        const {failures, skips, checked} = runContract(
          tokens,
          [...CONTRAST_CONTRACT, ...effectivePairs(theme)],
          mode,
        );

        expect(checked).toBeGreaterThan(0);

        if (REPORT_MODE) {
          const lines: string[] = [];
          lines.push(
            `=== ${name} / ${mode}: ${failures.length} failures, ${skips.length} skips, ${checked} checked ===`,
          );
          for (const failure of failures.sort((a, b) => a.ratio - b.ratio)) {
            lines.push(`  FAIL ${formatFailure(failure)}`);
          }
          for (const skip of skips) {
            lines.push(`  SKIP ${skip.pair.fg}: ${skip.reason}`);
          }

          console.log(lines.join('\n'));
          return;
        }

        expect(
          skips.map(skip => `${skip.pair.fg}: ${skip.reason}`),
          'every contract pair must resolve to a measurable color',
        ).toEqual([]);
        expect(
          failures.map(formatFailure),
          'WCAG 2.1 AA contrast failures — see internal/theme-contrast/contract.ts',
        ).toEqual([]);
      });
    }
  }
});
