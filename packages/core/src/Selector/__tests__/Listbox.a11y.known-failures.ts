// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Listbox.a11y.known-failures.ts
 * @input Uses KnownFailure from @astryxdesign/a11y-spec
 * @output Exact public-safe Selector and MultiSelector listbox migration failures
 * @position AST-021 debt records; operational ownership remains outside public source.
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

export const LISTBOX_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  {
    expectation: 'listbox.exposure.identity',
    binding: 'Selector.listbox',
    state: 'single-sheet:listbox',
    evidenceLayer: 'accessibility-tree',
    failureEquals: 'the browser exposes the listbox without an accessible name',
    standardsReference: 'WCAG 2.2 4.1.2 Name, Role, Value (Level A)',
    userImpact:
      'An accessibility consumer encounters an unnamed listbox in the bottom-sheet presentation and cannot identify what set of choices it contains.',
    reason:
      'The no-search bottom-sheet presentation renders a visible sheet heading without assigning that heading, or another label, as the listbox accessible name. This migration records the existing behavior without changing the component.',
  },
  {
    expectation: 'listbox.exposure.identity',
    binding: 'MultiSelector.listbox',
    state: 'multiple-sheet:listbox',
    evidenceLayer: 'accessibility-tree',
    failureEquals: 'the browser exposes the listbox without an accessible name',
    standardsReference: 'WCAG 2.2 4.1.2 Name, Role, Value (Level A)',
    userImpact:
      'An accessibility consumer encounters an unnamed multi-select listbox in the bottom-sheet presentation and cannot identify what set of choices it contains.',
    reason:
      'The no-search bottom-sheet presentation renders a visible sheet heading without assigning that heading, or another label, as the listbox accessible name. This migration records the existing behavior without changing the component.',
  },
];
