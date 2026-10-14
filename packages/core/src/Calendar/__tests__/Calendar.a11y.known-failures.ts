// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Calendar.a11y.known-failures.ts
 * @input The exact grid-contract failures the shipped Calendar produces today
 * @output CALENDAR_KNOWN_FAILURES — records both lanes reconcile against, so a fix shows up as an unexpected pass and any other failure stays a failure
 * @position Known-failure ledger for the Calendar binding
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

export const CALENDAR_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  {
    expectation: 'grid.structure.rows-and-cells',
    binding: 'Calendar',
    state: 'single-week-numbers',
    evidenceLayer: 'dom',
    failureEquals:
      '1 row child(ren) are not gridcell, columnheader or rowheader',
    standardsReference:
      'APG Grid, WAI-ARIA roles, states and properties: each row contains gridcell, columnheader or rowheader elements; Astryx component:Calendar FR1 (a valid APG grid).',
    userImpact:
      'With week numbers on, the header row starts with a blank corner cell that has no role, so a screen reader may read it as stray content or miscount the columns of the weekday header row.',
    reason:
      'This test-only binding records the gap; the fix (role="columnheader" on the corner cell) ships as its own spec-backed patch.',
  },
];
