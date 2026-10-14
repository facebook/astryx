// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ResizeHandle.a11y.known-failures.ts
 * @input The exact window-splitter failures the shipped ResizeHandle produces today
 * @output RESIZE_HANDLE_KNOWN_FAILURES — records both lanes reconcile against, so a fix shows up as an unexpected pass and any other failure stays a failure
 * @position Known-failure ledger for the ResizeHandle binding
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

export const RESIZE_HANDLE_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  {
    expectation: 'windowsplitter.keys.arrows-move',
    binding: 'ResizeHandle',
    state: 'bare-start-collapsed',
    evidenceLayer: 'real-browser',
    failureEquals: 'ArrowRight (grow) left aria-valuenow at 100, not 110',
    standardsReference:
      'APG Window Splitter keyboard interaction — the arrow keys move the splitter; Astryx component:Resizable AR1.',
    userImpact:
      'A keyboard user on a pane that starts collapsed presses the grow arrow and nothing happens: a plain step stays below the collapse threshold, so only Shift+Arrow, Home, End, Enter or a double-click reopens it.',
    reason:
      'This test-only binding records the gap; whether a plain arrow should reopen a collapsed pane is a component decision for its own spec-backed patch.',
  },
];
