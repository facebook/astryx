// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Checkbox.a11y.known-failures.ts
 * @input Uses KnownFailure from @astryxdesign/a11y-spec
 * @output CHECKBOX_KNOWN_FAILURES — exact, runnable existing gaps discovered by
 *   the Checkbox pattern migration.
 * @position Recorded public debt under AST-021 FR8–FR10, never passing coverage.
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

const CHECKBOX_LIST_DESCRIPTION_ISSUE =
  'https://github.com/facebook/astryx/issues/6154';
const RICH_LABEL_NAME_ISSUE = 'https://github.com/facebook/astryx/issues/6161';
const HANDLERLESS_READONLY_ISSUE =
  'https://github.com/facebook/astryx/issues/6163';

export const CHECKBOX_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  {
    expectation: 'checkbox.description.resolvable',
    binding: 'CheckboxListItem',
    state: 'list-item-described',
    evidenceLayer: 'dom',
    failureEquals:
      'the binding renders supporting text for this state, but the checkbox has no aria-describedby, so the text is never attached to the control',
    userImpact:
      'The browser accessibility node exposes no separate description for the visible supporting text, so downstream accessibility consumers cannot distinguish it as the choice explanation.',
    issue: CHECKBOX_LIST_DESCRIPTION_ISSUE,
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
    userImpact:
      'The browser computes no distinct description for the visible explanation; this records browser exposure only, not what any assistive technology announces.',
    issue: CHECKBOX_LIST_DESCRIPTION_ISSUE,
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
    userImpact:
      'The browser exposes every rich-label item without an aria-label under the generic name "Checkbox", so speech input cannot address the item by the visible words.',
    issue: RICH_LABEL_NAME_ISSUE,
    reason:
      'The public API permits a ReactNode label without an equivalent plain-text name. The migration records that supported branch without changing the component API.',
  },
  {
    expectation: 'checkbox.readonly.declared',
    binding: 'CheckboxListItem',
    state: 'list-item-handlerless-read-only',
    evidenceLayer: 'dom',
    failureEquals:
      'this state is read-only, but the checkbox does not declare aria-readonly="true"',
    userImpact:
      'The browser exposes a handlerless inert checkbox without a read-only declaration, so accessibility consumers cannot distinguish it from an editable control.',
    issue: HANDLERLESS_READONLY_ISSUE,
    reason:
      'The public standalone API permits an item with isChecked and no onCheck. The row is inert, but CheckboxInput does not receive isReadOnly.',
  },

  {
    expectation: 'checkbox.focus.reachable-and-escapable',
    binding: 'SelectableCard',
    state: 'card-disabled',
    evidenceLayer: 'real-browser',
    failureEquals:
      '10 presses of Tab from the start of the document never reached the checkbox, so a keyboard user cannot get to this setting',
    userImpact:
      'A keyboard or screen-reader user cannot tab to the disabled card to discover that the option exists and is unavailable.',
    issue: 'https://github.com/facebook/astryx/issues/6156',
    reason:
      'SelectableCard documents a focusable aria-disabled state, but the implementation applies native disabled to its checkbox and removes it from the tab sequence.',
  },
  {
    expectation: 'checkbox.state.inoperable',
    binding: 'SelectableCard',
    state: 'card-disabled',
    evidenceLayer: 'real-browser',
    failureEquals:
      'this state is meant to stay focusable while it cannot be changed — so the reason or the pending state stays discoverable — but the checkbox did not take focus',
    userImpact:
      'The disabled card is inert, but its documented focusable-disabled state cannot be verified because the role-bearing checkbox refuses focus.',
    issue: 'https://github.com/facebook/astryx/issues/6156',
    reason:
      'This is the inertness-side result of the same native-disabled mismatch and stays separate from tab reachability under AST-021 FR8.',
  },
];
