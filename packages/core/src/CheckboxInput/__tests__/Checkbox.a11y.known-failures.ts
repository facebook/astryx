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
const MENU_CHECKBOX_DESCRIPTION_ISSUE =
  'https://github.com/facebook/astryx/issues/6159';

export const CHECKBOX_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  {
    expectation: 'checkbox.description.resolvable',
    binding: 'CheckboxListItem',
    state: 'list-item-described',
    evidenceLayer: 'dom',
    failureIncludes: 'has no aria-describedby',
    userImpact:
      'A screen-reader user reaches the checkbox without the visible supporting text that explains the choice.',
    issue: CHECKBOX_LIST_DESCRIPTION_ISSUE,
    reason:
      'CheckboxListItem renders its description in the ListItem row but does not pass or reference that content from the nested CheckboxInput. The migration records the gap without changing component behavior.',
  },
  {
    expectation: 'checkbox.description.exposed',
    binding: 'CheckboxListItem',
    state: 'list-item-described',
    evidenceLayer: 'accessibility-tree',
    failureIncludes: 'computes no accessible description',
    userImpact:
      'The same visible explanation is absent from the browser accessibility node, so assistive technology cannot present it with the checkbox.',
    issue: CHECKBOX_LIST_DESCRIPTION_ISSUE,
    reason:
      'This is the accessibility-tree face of the missing relationship recorded above. It is separate because each known failure names exactly one expectation and layer.',
  },
  {
    expectation: 'checkbox.description.resolvable',
    binding: 'DropdownMenuCheckboxItem',
    state: 'menu-item-described',
    evidenceLayer: 'dom',
    failureIncludes: 'has no aria-describedby',
    userImpact:
      'A screen-reader user reaches the checkable menu item without the visible secondary text that explains the choice.',
    issue: MENU_CHECKBOX_DESCRIPTION_ISSUE,
    reason:
      'DropdownMenuCheckboxItem renders secondary text in the row without relating it to the role-bearing menuitemcheckbox. The migration records the gap without changing behavior.',
  },
  {
    expectation: 'checkbox.description.exposed',
    binding: 'DropdownMenuCheckboxItem',
    state: 'menu-item-described',
    evidenceLayer: 'accessibility-tree',
    failureIncludes: 'computes no accessible description',
    userImpact:
      'The visible secondary text is absent from the computed accessibility description of the checkable menu item.',
    issue: MENU_CHECKBOX_DESCRIPTION_ISSUE,
    reason:
      'This records the accessibility-tree outcome separately from the missing DOM relationship so one future fix must satisfy both exact gates.',
  },

  {
    expectation: 'checkbox.focus.reachable-and-escapable',
    binding: 'SelectableCard',
    state: 'card-disabled',
    evidenceLayer: 'real-browser',
    failureIncludes: 'never reached the checkbox',
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
    failureIncludes: 'the checkbox did not take focus',
    userImpact:
      'The disabled card is inert, but its documented focusable-disabled state cannot be verified because the role-bearing checkbox refuses focus.',
    issue: 'https://github.com/facebook/astryx/issues/6156',
    reason:
      'This is the inertness-side result of the same native-disabled mismatch and stays separate from tab reachability under AST-021 FR8.',
  },
];
