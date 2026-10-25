// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touchKeysImport.test.ts
 * @input Uses vitest and core's exported touch keys
 * @output Checks that lab reads core's touch keys through the package
 *   subpath, as the spellings its literal StyleX keys must match
 * @position Test for the `@astryxdesign/core/utils/touchPresentation.stylex`
 *   export
 *
 * A style spells the key literally: an imported key used as a computed
 * StyleX key compiles to a different priority than the literal.
 */

import {touchKeys} from '@astryxdesign/core/utils/touchPresentation.stylex';
import {describe, expect, it} from 'vitest';

describe('core touch keys from lab', () => {
  it('are the literal spellings a lab style matches', () => {
    expect(touchKeys.touch).toBe('@media (pointer: coarse)');
    expect(touchKeys.iosSupports).toBe(
      '@supports (-webkit-touch-callout: none)',
    );
  });
});
