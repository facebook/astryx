// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MenuButton.a11y.known-failures.ts
 * @input The exact menu-button contract failures the shipped triggers produce today
 * @output MENU_BUTTON_KNOWN_FAILURES — records both lanes reconcile against, so a fix shows up as an unexpected pass and any other failure stays a failure
 * @position Known-failure ledger for the DropdownMenu/MoreMenu menu-button binding
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

export const MENU_BUTTON_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  {
    expectation: 'menu-button.control.unavailable-stays-closed',
    binding: 'DropdownMenu.trigger',
    state: 'more-menu-disabled',
    evidenceLayer: 'real-browser',
    failureEquals: 'an unavailable control opened its menu on ArrowDown',
    standardsReference:
      'WCAG 2.2 4.1.2 Name, Role, Value; APG Menu Button — a control that says aria-disabled must not open its menu; Astryx spec:AST-021 FR4',
    userImpact:
      'A keyboard user on a disabled MoreMenu hears it is unavailable, yet ArrowDown (and ArrowUp) opens the menu: Button suppresses Enter and Space for an aria-disabled control but lets the arrow keys through to the DropdownMenu open handler.',
    reason:
      'This test-only binding records the gap; the fix is a DropdownMenu change that ships as its own spec-backed patch.',
  },
];
