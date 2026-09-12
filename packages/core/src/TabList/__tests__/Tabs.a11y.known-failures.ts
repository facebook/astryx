// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tabs.a11y.known-failures.ts
 * @input Uses KnownFailure from @astryxdesign/a11y-spec
 * @output Exact public-safe Tabs migration failures
 * @position AST-021 debt records; operational ownership remains outside public source.
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

const COMMON = {
  binding: 'Tab',
  state: 'tab-disabled-unselected',
  evidenceLayer: 'real-browser',
  standardsReference:
    'WCAG 2.2 4.1.2 Name, Role, Value; WAI-ARIA 1.2 aria-disabled',
  reason:
    'This migration records the existing behavior without changing the component interaction contract.',
} as const;

export const TABS_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  {
    ...COMMON,
    expectation: 'tabs.tab.unavailable-pointer-inert',
    failureEquals:
      'the tab is reported unavailable, but clicking it selected it',
    userImpact:
      'A pointer user can activate a tab that assistive technology reports as unavailable.',
  },
  {
    ...COMMON,
    expectation: 'tabs.tab.unavailable-enter-inert',
    failureEquals: 'the tab is reported unavailable, but Enter selected it',
    userImpact:
      'A keyboard user can activate a focusable tab with Enter after assistive technology reports it unavailable.',
  },
  {
    ...COMMON,
    expectation: 'tabs.tab.unavailable-space-inert',
    failureEquals: 'the tab is reported unavailable, but Space selected it',
    userImpact:
      'A keyboard user can activate a focusable tab with Space after assistive technology reports it unavailable.',
  },
];
