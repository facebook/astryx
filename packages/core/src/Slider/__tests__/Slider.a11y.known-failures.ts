// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Slider.a11y.known-failures.ts
 * @input The exact slider-contract failures the shipped Slider produces today
 * @output SLIDER_KNOWN_FAILURES — records both lanes reconcile against, so a fix shows up as an unexpected pass and any other failure stays a failure
 * @position Known-failure ledger for the Slider binding
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

export const SLIDER_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  {
    expectation: 'slider.keys.arrows-step',
    binding: 'Slider',
    state: 'horizontal-rtl',
    evidenceLayer: 'real-browser',
    failureEquals:
      'ArrowLeft (inline forward) left aria-valuenow at 39, not 41',
    standardsReference:
      'APG Slider keyboard interaction (reversing the direction to match the visual layout); Astryx component:Slider AR1 — on a horizontal right-to-left track ArrowLeft increases and ArrowRight decreases',
    userImpact:
      'On a right-to-left page a keyboard user presses the arrow that points the way the thumb travels on screen and the value moves the other way.',
    reason:
      'This test-only binding records the gap; the fix ships as its own spec-backed patch (red-armed RTL keyboard test).',
  },
  {
    expectation: 'slider.keys.home-end',
    binding: 'Slider',
    state: 'step-three',
    evidenceLayer: 'real-browser',
    failureEquals: 'End left aria-valuenow at 99, not 100',
    standardsReference:
      'APG Slider keyboard interaction — End sets the slider to the last allowed value in its range; Astryx component:Slider AR1 (End moves to max)',
    userImpact:
      'With a step that does not divide the range, End stops one step short of the maximum while ArrowRight and PageUp can still reach it.',
    reason:
      'This test-only binding records the gap named in the Slider record; the endpoint fix is its own change.',
  },
];
