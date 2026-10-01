// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Checkbox.a11y.known-failures.ts
 * @input Uses KnownFailure from @astryxdesign/a11y-spec
 * @output CHECKBOX_KNOWN_FAILURES — exact, runnable existing gaps discovered by
 *   the Checkbox pattern migration.
 * @position Exact public-safe known-failure records under AST-021 FR8–FR10;
 *   operational gap ownership stays outside public source.
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

export const CHECKBOX_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  {
    expectation: 'checkbox.readonly.declared',
    binding: 'CheckboxInput',
    state: 'input-handlerless-read-only',
    evidenceLayer: 'dom',
    failureEquals:
      'this state is read-only, but the checkbox does not declare aria-readonly="true"',
    standardsReference: 'WCAG 2.2 4.1.2 Name, Role, Value (Level A)',
    userImpact:
      'The browser exposes a controlled handlerless checkbox without a read-only declaration, so accessibility consumers cannot distinguish its static value from an editable setting.',
    reason:
      'CheckboxInput makes both onChange and changeAction optional. With neither handler, the controlled value cannot persist a user change, but the component does not declare the resulting read-only state.',
  },
  {
    expectation: 'checkbox.readonly.declared',
    binding: 'CheckboxListItem',
    state: 'list-item-handlerless-read-only',
    evidenceLayer: 'dom',
    failureEquals:
      'this state is read-only, but the checkbox does not declare aria-readonly="true"',
    standardsReference: 'WCAG 2.2 4.1.2 Name, Role, Value (Level A)',
    userImpact:
      'The browser exposes a handlerless inert checkbox without a read-only declaration, so accessibility consumers cannot distinguish it from an editable control.',
    reason:
      'The public standalone API permits an item with isChecked and no onCheck. The row is inert, but CheckboxInput does not receive isReadOnly.',
  },
  {
    expectation: 'checkbox.disabled.exposed',
    binding: 'DropdownMenuCheckboxItem',
    state: 'menu-item-handlerless-inert',
    evidenceLayer: 'accessibility-tree',
    failureEquals:
      'the binding declares this state unavailable, but the browser reports the checkbox as available, so the user is invited to change something that will not change',
    standardsReference: 'WCAG 2.2 4.1.2 Name, Role, Value (Level A)',
    userImpact:
      'The menu item looks available to accessibility consumers, but activation cannot change its controlled value because it has no handler.',
    reason:
      'DropdownMenuCheckboxItem makes onChange optional. Without it, the controlled value cannot persist a user change, but the role-bearing item remains exposed as available.',
  },
  {
    expectation: 'checkbox.focus.declared-inoperable-reachable',
    binding: 'SelectableCard',
    state: 'card-disabled',
    evidenceLayer: 'real-browser',
    failureEquals:
      '10 presses of Tab from the start of the document never reached the checkbox, so a keyboard user cannot get to this setting',
    standardsReference:
      'Astryx spec:AST-021 FR7 (preserve existing documented behavior); SelectableCard isDisabled public prop contract',
    userImpact:
      'A keyboard user cannot tab to the disabled card to discover that the option exists and is unavailable, despite the public prop contract promising continued focusability.',
    reason:
      'SelectableCard documents a focusable aria-disabled state, but the implementation applies native disabled to its checkbox and removes it from the tab sequence. This advisory migration check records that public-contract mismatch without presenting disabled focusability as a WCAG requirement.',
  },
];
