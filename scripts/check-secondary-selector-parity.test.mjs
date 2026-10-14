// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Secondary selector trigger parity guard.
 *
 * AST-079 FR2 (and Selector DD1) require the `secondary` trigger of Selector,
 * MultiSelector, and ComplexSelector to match the active theme's secondary
 * Button. Themes restyle the Button through `components.button`, and that rule
 * reaches only Buttons, so a theme that restyles its secondary Button must give
 * the three selector targets the same `variant:secondary` treatment. A theme
 * that leaves the Button at its default leaves the selectors at theirs.
 *
 * @input The seven first-party theme objects.
 * @output Fails when a selector target's `variant:secondary` differs from the
 *   theme's secondary Button entry.
 * @position Repo-level guard, sibling of the other scripts/check-*.
 */

import {describe, it, expect} from 'vitest';
import {butterTheme} from '../packages/themes/butter/src/butterTheme.ts';
import {chocolateTheme} from '../packages/themes/chocolate/src/chocolateTheme.ts';
import {gothicTheme} from '../packages/themes/gothic/src/gothicTheme.ts';
import {matchaTheme} from '../packages/themes/matcha/src/matchaTheme.ts';
import {neutralTheme} from '../packages/themes/neutral/src/neutralTheme.ts';
import {stoneTheme} from '../packages/themes/stone/src/stoneTheme.ts';
import {y2kTheme} from '../packages/themes/y2k/src/y2kTheme.ts';

const THEMES = {
  butter: butterTheme,
  chocolate: chocolateTheme,
  gothic: gothicTheme,
  matcha: matchaTheme,
  neutral: neutralTheme,
  stone: stoneTheme,
  y2k: y2kTheme,
};

const SELECTOR_TARGETS = ['selector', 'multi-selector', 'complex-selector'];

describe('secondary selector triggers match the secondary Button', () => {
  for (const [name, theme] of Object.entries(THEMES)) {
    const secondaryButton = theme.components?.button?.['variant:secondary'];
    for (const target of SELECTOR_TARGETS) {
      it(`${name}: ${target}`, () => {
        expect(theme.components?.[target]?.['variant:secondary']).toEqual(
          secondaryButton,
        );
      });
    }
  }
});
