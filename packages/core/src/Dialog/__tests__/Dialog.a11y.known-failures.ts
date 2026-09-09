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
    expectation: 'modal-dialog.focus.enters-after-modal',
    binding: 'Dialog',
    state: 'conditional-content-focus-restoration',
    evidenceLayer: 'real-browser',
    failureEquals:
      "focus entered the dialog before it reached the browser's native modal state",
    standardsReference:
      'Astryx component:Dialog FR1 — native Dialog must become visibly modal before Dialog applies its component-owned initial-focus request.',
    userImpact:
      'When focus-requesting content mounts only while opening, focus enters the task before the browser has established the modal boundary that blocks the page behind it.',
    reason:
      'This migration records the existing focus-order violation without changing the overlapping Dialog implementation path.',
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
