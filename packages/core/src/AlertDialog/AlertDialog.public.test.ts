// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AlertDialog.public.test.ts
 * @input Imports the AlertDialog public barrel
 * @output Locks AlertDialog's public props: the touch presentation adds none
 * @position Compatibility test guarding @astryxdesign/core/AlertDialog
 *
 * The touch presentation changes behavior, not the public contract
 * (`component:AlertDialog`: no public API change). Its way back on a phone is
 * the existing `width` prop (FR9), and nothing else is added for it.
 *
 * The `expectTypeOf` assertions here are enforced by `pnpm -F
 * @astryxdesign/core typecheck`, not by the test run. A failed negative property
 * assertion surfaces as `TS2554: Expected 2 arguments, but got 1`.
 */

import {describe, expectTypeOf, it} from 'vitest';

import type {AlertDialogProps} from './index';

describe('AlertDialog public surface', () => {
  it('adds no prop for the touch presentation', () => {
    expectTypeOf<AlertDialogProps>().not.toHaveProperty('presentation');
  });

  it("keeps a caller's width, the phone width's way back (FR9)", () => {
    expectTypeOf<AlertDialogProps>().toHaveProperty('width');
  });
});
