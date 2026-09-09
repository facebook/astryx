// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Dialog.a11y.known-failures.ts
 * @input Uses KnownFailure from @astryxdesign/a11y-spec
 * @output Exact public-safe baseline failures for Dialog's modal-dialog binding
 * @position Shared by the jsdom and Chromium bindings. These records preserve
 *   current behavior during test migration; they do not approve remediation.
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

export const DIALOG_MODAL_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  {
    expectation: 'modal-dialog.focus.tab-contained',
    binding: 'Dialog',
    state: 'labelled-described-default-title',
    evidenceLayer: 'real-browser',
    failureEquals:
      'Tab from the last control moved focus outside the active modal dialog',
    standardsReference:
      'Astryx architecture:layer-runtime native modal boundary and the adopted APG modal-dialog Tab containment outcome.',
    userImpact:
      'A keyboard user can leave the active modal task through the end of its tab sequence instead of cycling within the task.',
    reason:
      'This migration records the existing containment violation without adding component focus-trap behavior.',
  },
  {
    expectation: 'modal-dialog.focus.restored',
    binding: 'Dialog',
    state: 'conditional-content-focus-restoration',
    evidenceLayer: 'real-browser',
    failureEquals:
      'closing the modal dialog did not return focus to its still-available invoker',
    standardsReference:
      'Astryx component:Dialog FR4 — closing a native Dialog must return focus to its still-connected invoker when it can receive focus.',
    userImpact:
      'When focus-moving content mounts only while the dialog is open, closing can leave the user at the document body instead of the control that opened the task.',
    reason:
      'This migration records the existing restoration violation without changing the overlapping Dialog implementation path.',
  },
];
