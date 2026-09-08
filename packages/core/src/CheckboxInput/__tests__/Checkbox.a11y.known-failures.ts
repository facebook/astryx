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
];
