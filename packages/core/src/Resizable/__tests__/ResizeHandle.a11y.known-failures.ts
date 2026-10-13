// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ResizeHandle.a11y.known-failures.ts
 * @input The exact window-splitter failures the shipped ResizeHandle and SideNav produce today
 * @output RESIZE_HANDLE_KNOWN_FAILURES — records both lanes reconcile against, so a fix shows up as an unexpected pass and any other failure stays a failure
 * @position Known-failure ledger for the ResizeHandle binding
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

const RESTORE_REFERENCE =
  'APG Window Splitter keyboard interaction — Enter on a collapsed pane restores the splitter to its previous position; Astryx component:Resizable AR1 (Enter collapses and restores)';

export const RESIZE_HANDLE_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  {
    expectation: 'windowsplitter.separator.maximum',
    binding: 'ResizeHandle',
    state: 'bare-unbounded',
    evidenceLayer: 'dom',
    failureEquals: 'the splitter exposes no aria-valuemax',
    standardsReference:
      'WAI-ARIA separator (focusable): aria-valuemax; APG Window Splitter states and properties; Astryx component:Resizable AR1 names the missing maximum on an unbounded Handle as a gap',
    userImpact:
      'A screen-reader user on a handle whose region sets no maximum hears a value and a minimum but no maximum, so the range sounds open-ended and End does nothing.',
    reason:
      'This test-only binding records the gap; the fix ships as its own spec-backed patch that reports the measured basis.',
  },
  {
    expectation: 'windowsplitter.keys.enter-collapses-and-restores',
    binding: 'ResizeHandle',
    state: 'bare-collapsible',
    evidenceLayer: 'real-browser',
    failureEquals: 'Enter (restore) left aria-valuenow at 100, not 200',
    standardsReference: RESTORE_REFERENCE,
    userImpact:
      'A keyboard user who collapses a pane with Enter and presses Enter again gets it back at its minimum size, not the size they had.',
    reason:
      'This test-only binding records the gap; the fix ships as its own spec-backed patch.',
  },
  {
    expectation: 'windowsplitter.keys.enter-collapses-and-restores',
    binding: 'ResizeHandle',
    state: 'sidenav-resizable',
    evidenceLayer: 'real-browser',
    failureEquals: 'Enter (restore) left aria-valuenow at 180, not 260',
    standardsReference: RESTORE_REFERENCE,
    userImpact:
      'A keyboard user who collapses the sidebar with Enter and presses Enter again gets it back at its minimum width, not the width they had.',
    reason:
      'Same shipped handle behaviour as the bare collapsible state; the same patch fixes both.',
  },
  {
    expectation: 'windowsplitter.separator.controls-pane',
    binding: 'ResizeHandle',
    state: 'sidenav-resizable',
    evidenceLayer: 'dom',
    failureEquals: 'the splitter carries no aria-controls',
    standardsReference:
      'APG Window Splitter states and properties — the separator has aria-controls referring to the primary pane; Astryx component:Resizable AR1 names the missing aria-controls as a gap',
    userImpact:
      'Assistive technology cannot relate the sidebar handle to the sidebar it resizes.',
    reason:
      'This test-only binding records the gap; SideNav wires aria-controls to its nav in its own spec-backed patch.',
  },
];
