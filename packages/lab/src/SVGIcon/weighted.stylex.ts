// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file weighted.stylex.ts
 * @input The weight probe font (see weightProbe.ts) and an optional `--astryx-icon-weight` override
 * @output Per-layer visibility styles: each drawing is opaque only inside its weight range
 * @position Styles for WeightedSVGIcon
 *
 * Every layer computes the current icon weight itself, so the rules work
 * unchanged inside `<use>` sprite instances, where page selectors cannot
 * reach through the instance boundary but inherited properties do.
 *
 * Current weight, snapped to 300-700:
 * - `--astryx-icon-weight` when an ancestor sets it (explicit override);
 * - otherwise the inherited font weight, read through the probe font
 *   (`1ex / 1em * 1000`), in engines that can divide lengths;
 * - otherwise 400.
 *
 * A layer covering [from, to] is opaque when `from <= weight <= to`:
 * `clamp(0, min(weight - (from - 100), (to + 100) - weight) / 100, 1)`.
 * Weights are multiples of 100, so the result is exactly 0 or 1.
 * The 15 entries below are every contiguous range of the five weights.
 */

import * as stylex from '@stylexjs/stylex';

export const weightRanges = stylex.create({
  r300_300: {
    opacity: {
      default:
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, 400), 100), 700) - 200, 400 - clamp(300, round(var(--astryx-icon-weight, 400), 100), 700)) / 100, 1)',
      '@supports (width: calc(1px * (1ex / 1em)))':
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700) - 200, 400 - clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700)) / 100, 1)',
    },
  },
  r300_400: {
    opacity: {
      default:
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, 400), 100), 700) - 200, 500 - clamp(300, round(var(--astryx-icon-weight, 400), 100), 700)) / 100, 1)',
      '@supports (width: calc(1px * (1ex / 1em)))':
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700) - 200, 500 - clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700)) / 100, 1)',
    },
  },
  r300_500: {
    opacity: {
      default:
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, 400), 100), 700) - 200, 600 - clamp(300, round(var(--astryx-icon-weight, 400), 100), 700)) / 100, 1)',
      '@supports (width: calc(1px * (1ex / 1em)))':
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700) - 200, 600 - clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700)) / 100, 1)',
    },
  },
  r300_600: {
    opacity: {
      default:
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, 400), 100), 700) - 200, 700 - clamp(300, round(var(--astryx-icon-weight, 400), 100), 700)) / 100, 1)',
      '@supports (width: calc(1px * (1ex / 1em)))':
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700) - 200, 700 - clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700)) / 100, 1)',
    },
  },
  r300_700: {
    opacity: {
      default:
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, 400), 100), 700) - 200, 800 - clamp(300, round(var(--astryx-icon-weight, 400), 100), 700)) / 100, 1)',
      '@supports (width: calc(1px * (1ex / 1em)))':
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700) - 200, 800 - clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700)) / 100, 1)',
    },
  },
  r400_400: {
    opacity: {
      default:
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, 400), 100), 700) - 300, 500 - clamp(300, round(var(--astryx-icon-weight, 400), 100), 700)) / 100, 1)',
      '@supports (width: calc(1px * (1ex / 1em)))':
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700) - 300, 500 - clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700)) / 100, 1)',
    },
  },
  r400_500: {
    opacity: {
      default:
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, 400), 100), 700) - 300, 600 - clamp(300, round(var(--astryx-icon-weight, 400), 100), 700)) / 100, 1)',
      '@supports (width: calc(1px * (1ex / 1em)))':
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700) - 300, 600 - clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700)) / 100, 1)',
    },
  },
  r400_600: {
    opacity: {
      default:
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, 400), 100), 700) - 300, 700 - clamp(300, round(var(--astryx-icon-weight, 400), 100), 700)) / 100, 1)',
      '@supports (width: calc(1px * (1ex / 1em)))':
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700) - 300, 700 - clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700)) / 100, 1)',
    },
  },
  r400_700: {
    opacity: {
      default:
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, 400), 100), 700) - 300, 800 - clamp(300, round(var(--astryx-icon-weight, 400), 100), 700)) / 100, 1)',
      '@supports (width: calc(1px * (1ex / 1em)))':
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700) - 300, 800 - clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700)) / 100, 1)',
    },
  },
  r500_500: {
    opacity: {
      default:
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, 400), 100), 700) - 400, 600 - clamp(300, round(var(--astryx-icon-weight, 400), 100), 700)) / 100, 1)',
      '@supports (width: calc(1px * (1ex / 1em)))':
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700) - 400, 600 - clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700)) / 100, 1)',
    },
  },
  r500_600: {
    opacity: {
      default:
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, 400), 100), 700) - 400, 700 - clamp(300, round(var(--astryx-icon-weight, 400), 100), 700)) / 100, 1)',
      '@supports (width: calc(1px * (1ex / 1em)))':
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700) - 400, 700 - clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700)) / 100, 1)',
    },
  },
  r500_700: {
    opacity: {
      default:
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, 400), 100), 700) - 400, 800 - clamp(300, round(var(--astryx-icon-weight, 400), 100), 700)) / 100, 1)',
      '@supports (width: calc(1px * (1ex / 1em)))':
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700) - 400, 800 - clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700)) / 100, 1)',
    },
  },
  r600_600: {
    opacity: {
      default:
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, 400), 100), 700) - 500, 700 - clamp(300, round(var(--astryx-icon-weight, 400), 100), 700)) / 100, 1)',
      '@supports (width: calc(1px * (1ex / 1em)))':
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700) - 500, 700 - clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700)) / 100, 1)',
    },
  },
  r600_700: {
    opacity: {
      default:
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, 400), 100), 700) - 500, 800 - clamp(300, round(var(--astryx-icon-weight, 400), 100), 700)) / 100, 1)',
      '@supports (width: calc(1px * (1ex / 1em)))':
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700) - 500, 800 - clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700)) / 100, 1)',
    },
  },
  r700_700: {
    opacity: {
      default:
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, 400), 100), 700) - 600, 800 - clamp(300, round(var(--astryx-icon-weight, 400), 100), 700)) / 100, 1)',
      '@supports (width: calc(1px * (1ex / 1em)))':
        'clamp(0, min(clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700) - 600, 800 - clamp(300, round(var(--astryx-icon-weight, round(calc(1ex / 1em * 1000), 1)), 100), 700)) / 100, 1)',
    },
  },
});
