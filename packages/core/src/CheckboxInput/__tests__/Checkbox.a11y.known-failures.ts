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
    expectation: 'checkbox.state.pointer-round-trip',
    binding: 'SelectableCard',
    state: 'card-unchecked',
    evidenceLayer: 'real-browser',
    failureIncludes: 'a pointer could not reach this control within 2000ms',
    userImpact:
      'A speech-input user or assistive technology that activates the exposed checkbox object cannot check the card, even though clicking the visible card surface works.',
    issue: 'https://github.com/facebook/astryx/issues/6155',
    reason:
      'SelectableCard splits pointer handling onto the card while role, name, and state live on a clipped 1×1 checkbox. The migration records the exact unchecked-state failure without changing the component.',
  },
  {
    expectation: 'checkbox.state.survives-an-aborted-press',
    binding: 'SelectableCard',
    state: 'card-unchecked',
    evidenceLayer: 'real-browser',
    failureIncludes: 'a pointer press cannot land on this control',
    userImpact:
      'Pointer cancellation cannot be demonstrated on the unchecked role-bearing control because a pointer press cannot land on it at all.',
    issue: 'https://github.com/facebook/astryx/issues/6155',
    reason:
      'This is a separate outcome from activation: each known failure names one expectation, and a future fix has to prove both ordinary activation and cancellation.',
  },
  {
    expectation: 'checkbox.state.pointer-round-trip',
    binding: 'SelectableCard',
    state: 'card-checked',
    evidenceLayer: 'real-browser',
    failureIncludes: 'a pointer could not reach this control within 2000ms',
    userImpact:
      'The same inaccessible activation target prevents assistive tooling from unchecking an already selected card.',
    issue: 'https://github.com/facebook/astryx/issues/6155',
    reason:
      'The checked state is recorded separately so the unchecked result cannot mask a one-direction-only repair.',
  },
  {
    expectation: 'checkbox.state.survives-an-aborted-press',
    binding: 'SelectableCard',
    state: 'card-checked',
    evidenceLayer: 'real-browser',
    failureIncludes: 'a pointer press cannot land on this control',
    userImpact:
      'Pointer cancellation is likewise unobservable on the checked role-bearing control because the pointer cannot land there.',
    issue: 'https://github.com/facebook/astryx/issues/6155',
    reason:
      'The checked-state cancellation path is its own exact gate and cannot be hidden by the unchecked-state record.',
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
