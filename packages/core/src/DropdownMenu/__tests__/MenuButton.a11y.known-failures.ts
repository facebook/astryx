// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MenuButton.a11y.known-failures.ts
 * @input The exact menu-button contract failures the shipped triggers produce today
 * @output MENU_BUTTON_KNOWN_FAILURES — records both lanes reconcile against, so a fix shows up as an unexpected pass and any other failure stays a failure
 * @position Known-failure ledger for the DropdownMenu/MoreMenu menu-button binding
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

const ABORTED_PRESS_STANDARD =
  'WCAG 2.2 2.5.2 Pointer Cancellation — a single-pointer function does not complete on the down-event unless the up-event reverses it or it can be aborted';
const ABORTED_PRESS_REASON =
  "The anchored trigger opens on press-down by module:DropdownMenu/useMenuPress FR8 and DEC-4, which are still proposed (that record's OQ1). This test-only binding records the shipped behavior; the press model's owner decision either makes it conformant or brings the fix.";

export const MENU_BUTTON_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  {
    expectation: 'menu-button.control.survives-an-aborted-press',
    binding: 'DropdownMenu.trigger',
    state: 'dropdown-button-closed',
    evidenceLayer: 'real-browser',
    failureEquals:
      'releasing the press away from the control left aria-expanded true instead of false',
    standardsReference: ABORTED_PRESS_STANDARD,
    userImpact:
      'A mouse user who presses the Actions button and slides off before releasing, to cancel, still gets the menu: it opens on press-down and stays open.',
    reason: ABORTED_PRESS_REASON,
  },
  {
    expectation: 'menu-button.control.survives-an-aborted-press',
    binding: 'DropdownMenu.trigger',
    state: 'dropdown-render-trigger-closed',
    evidenceLayer: 'real-browser',
    failureEquals:
      'releasing the press away from the control left aria-expanded true instead of false',
    standardsReference: ABORTED_PRESS_STANDARD,
    userImpact:
      'A mouse user who presses a caller-rendered trigger and slides off before releasing, to cancel, still gets the menu: it opens on press-down and stays open.',
    reason: ABORTED_PRESS_REASON,
  },
  {
    expectation: 'menu-button.control.survives-an-aborted-press',
    binding: 'DropdownMenu.trigger',
    state: 'more-menu-closed',
    evidenceLayer: 'real-browser',
    failureEquals:
      'releasing the press away from the control left aria-expanded true instead of false',
    standardsReference: ABORTED_PRESS_STANDARD,
    userImpact:
      'A mouse user who presses the MoreMenu button and slides off before releasing, to cancel, still gets the menu: it opens on press-down and stays open.',
    reason: ABORTED_PRESS_REASON,
  },
];
