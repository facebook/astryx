// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Regression test for `astryx init` "Next steps" theme guidance.
 *
 * The init command previously steered users toward the slower runtime
 * style-injection path:
 *
 *   import { neutralTheme } from '@astryxdesign/theme-neutral'
 *   <Theme theme={neutralTheme}>...</Theme>
 *
 * ...which contradicted the runtime console warning emitted by core's
 * <Theme> component (packages/core/src/theme/Theme.tsx) recommending the
 * pre-built path, and left users with an unstyled app because the base CSS
 * imports were never mentioned (facebook/astryx#3080).
 *
 * These assertions lock in the corrected guidance: base CSS imports, the
 * pre-built (`/built` + `theme.css`) theme path, and the custom-theme build
 * command.
 */

import {describe, it, expect} from 'vitest';
import {getNextSteps} from './init.mjs';

describe('init Next steps theme guidance', () => {
  const text = getNextSteps('npx').join('\n');

  it('mentions the base CSS imports so the app is not left unstyled', () => {
    expect(text).toContain("'@astryxdesign/core/reset.css'");
    expect(text).toContain("'@astryxdesign/core/astryx.css'");
  });

  it('uses the pre-built theme path matching the runtime recommendation', () => {
    expect(text).toContain("'@astryxdesign/theme-neutral/built'");
    expect(text).toContain("'@astryxdesign/theme-neutral/theme.css'");
  });

  it('mentions building custom themes via `astryx theme build`', () => {
    expect(text).toContain('astryx theme build <file>');
  });

  it('does not steer users to the runtime style-injection import', () => {
    // The bare source import (no `/built`) is the slow runtime-injection path.
    expect(text).not.toContain("from '@astryxdesign/theme-neutral'");
  });
});
