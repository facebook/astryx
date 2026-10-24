// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file indicatorPressLayer.ts
 * @input Uses the injected-rule readers of pressState.ts
 * @output Exports readIndicatorPressLayer: what the layer over a checkbox box
 *   or a radio circle (its owner's `::after`) does for a touch press that an
 *   ancestor carrying `scopeClass` holds
 * @position Shared test helper for CheckboxInput, CheckboxList and RadioList
 *   tests
 *
 * The layer paints the press itself: the pressed token at full strength as
 * its image on the on and fading arms, and a release of its own opacity on
 * the fading arm, on the press's clock. jsdom runs no animation, so a test
 * reads the rules the StyleX dev runtime injected for the layer's element,
 * keyed on the ancestor marker the press comes from.
 *
 * SYNC: When modified, update this header.
 */

import {durationToMs, rulesWithSelector} from './pressState';

const ON_ARM = '[data-astryx-press="on"]';
const FADING_ARM = '[data-astryx-press="fading"]';
const PRESSED_TOKEN = '--color-overlay-pressed';

export interface IndicatorPressLayer {
  /** The pressed token is the layer's image while the press is on. */
  readonly paintsOn: boolean;
  /** ...and through the release. */
  readonly paintsFading: boolean;
  /** The release runs an animation of the layer (not of a strength). */
  readonly releases: boolean;
  /** The release's durations, ms: its clock, then any Reduce Motion cap. */
  readonly releaseMs: number[];
  /** The release fills both ways, so it holds its ends. */
  readonly fillsBoth: boolean;
}

const selectorOf = (rule: string) => rule.slice(0, rule.indexOf('{'));

export function readIndicatorPressLayer(
  el: Element,
  scopeClass: string,
): IndicatorPressLayer {
  const layer = (arm: string) =>
    rulesWithSelector(el, arm).filter(rule => {
      const selector = selectorOf(rule);
      return (
        selector.includes('::after') && selector.includes(`.${scopeClass}`)
      );
    });
  const on = layer(ON_ARM);
  const fading = layer(FADING_ARM);
  const paints = (rules: string[]) =>
    rules.some(rule =>
      new RegExp(`background-image:[^;}]*${PRESSED_TOKEN}`).test(rule),
    );
  return {
    paintsOn: paints(on),
    paintsFading: paints(fading),
    releases: fading.some(rule => /animation-name:\s*(?!none)/.test(rule)),
    releaseMs: fading.flatMap(rule => {
      const match = /animation-duration:\s*([^;}]+)/.exec(rule);
      return match == null ? [] : [durationToMs(match[1])];
    }),
    fillsBoth: fading.some(rule => /animation-fill-mode:\s*both/.test(rule)),
  };
}
