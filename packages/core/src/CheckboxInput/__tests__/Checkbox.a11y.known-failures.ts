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
    expectation: 'checkbox.description.resolvable',
    binding: 'CheckboxListItem',
    state: 'list-item-described',
    evidenceLayer: 'dom',
    failureEquals:
      'the binding renders supporting text for this state, but the checkbox has no aria-describedby, so the text is never attached to the control',
    standardsReference: 'WCAG 2.2 1.3.1 Info and Relationships (Level A)',
    userImpact:
      'The browser accessibility node exposes no separate description for the visible supporting text, so downstream accessibility consumers cannot distinguish it as the choice explanation.',
    reason:
      'CheckboxListItem renders its description in the ListItem row but does not pass or reference that content from the nested CheckboxInput. The migration records the gap without changing component behavior.',
  },
  {
    expectation: 'checkbox.description.exposed',
    binding: 'CheckboxListItem',
    state: 'list-item-described',
    evidenceLayer: 'accessibility-tree',
    failureEquals:
      'the binding expects the description "Receive notifications by email", but the browser computes no accessible description',
    standardsReference: 'WCAG 2.2 4.1.2 Name, Role, Value (Level A)',
    userImpact:
      'The browser computes no distinct description for the visible explanation; this records browser exposure only, not what any assistive technology announces.',
    reason:
      'This is the accessibility-tree face of the missing relationship recorded above. It is separate because each known failure names exactly one expectation and layer.',
  },
  {
    expectation: 'checkbox.name.matches-visible-label',
    binding: 'CheckboxListItem',
    state: 'list-item-rich-label-missing-name',
    evidenceLayer: 'accessibility-tree',
    failureEquals:
      'the visible label reads "Pro plan" but the browser computes the accessible name as "Checkbox", so speaking the visible label does not reach this control',
    standardsReference: 'WCAG 2.2 2.5.3 Label in Name (Level A)',
    userImpact:
      'The browser exposes every rich-label item without an aria-label under the generic name "Checkbox", so speech input cannot address the item by the visible words.',
    reason:
      'The public API permits a ReactNode label without an equivalent plain-text name. The migration records that supported branch without changing the component API.',
  },
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
