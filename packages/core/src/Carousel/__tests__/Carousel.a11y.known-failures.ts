// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Carousel.a11y.known-failures.ts
 * @input The exact carousel-contract failures the shipped Carousel produces today
 * @output CAROUSEL_KNOWN_FAILURES — records both lanes reconcile against, so a fix shows up as an unexpected pass and any other failure stays a failure
 * @position Known-failure ledger for the Carousel binding
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

export const CAROUSEL_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  {
    expectation: 'carousel.scroller.role-and-name',
    binding: 'Carousel',
    state: 'scroller-keyboard',
    evidenceLayer: 'accessibility-tree',
    failureEquals:
      'the browser exposes the focusable scroll container with no role',
    standardsReference:
      'WCAG 2.2 4.1.2 Name, Role, Value; Astryx spec:AST-025 FR12 — a viewport that takes keyboard scrolling must provide an appropriate role and accessible name',
    userImpact:
      'A keyboard user who tabs onto the scroll container hears nothing about where they are or what the arrow keys will do; the named region around it is the only clue.',
    reason:
      'This test-only binding records the gap; naming the scroll container is a Carousel markup change that ships as its own spec-backed fix.',
  },
];
