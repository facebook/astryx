// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pressLayer.test.ts
 * @input vitest, the UIKit constants table (motion/uikit/list.ts), the press
 *   layer styles and the rows that compose them (Item, TreeList)
 * @output Holds the layer's build-time clock to the constants table, and
 *   asserts what a row ships for the touch press: the pressed token on a
 *   `::before` shown at once on the on arm, an opacity release on the fading
 *   arm on the cell clock, and none of the overlay's own main-thread release
 * @position Unit test beside utils/pressLayer.stylex.ts; the real-engine
 *   proofs (compositor, busy main thread, curve) are in
 *   List/__tests__/ListRowPress.interaction.browser.spec.ts
 */

import {createElement} from 'react';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {list} from '../motion/uikit/list';
import {Item} from '../Item';
import {TreeList} from '../TreeList';
import {durationToMs, rulesDeclaredFor} from '../__tests__/pressState';
import {PRESS_FADE_MS} from './pressGesture';
import {pressLayerConsts} from './pressLayer.stylex';

const ON = '[data-astryx-press="on"]';
const FADING = '[data-astryx-press="fading"]';

const selectorOf = (rule: string) => rule.slice(0, rule.indexOf('{'));
const layerRules = (el: Element, arm: string) =>
  rulesDeclaredFor(el).filter(rule => {
    const selector = selectorOf(rule);
    return selector.includes('::before') && selector.includes(arm);
  });
const hostRules = (el: Element, arm: string) =>
  rulesDeclaredFor(el).filter(rule => {
    const selector = selectorOf(rule);
    return !selector.includes('::before') && selector.includes(arm);
  });

/** Declarations of `property` in the element's rules, by value. */
const values = (rules: string[], property: string) =>
  rules.flatMap(rule => {
    const match = rule.match(
      new RegExp(`(?:^|[;{\\s])${property}:\\s*([^;}]+)`),
    );
    return match == null ? [] : [match[1].trim()];
  });

describe('press layer clock', () => {
  it('is the constants table’s cell release, mirrored for the stylesheet', () => {
    expect(pressLayerConsts.cellReleaseMs).toBe(list.highlight.releaseMs);
    expect(pressLayerConsts.cellReleaseEase).toBe(
      `cubic-bezier(${list.highlight.releaseCurve.join(', ')})`,
    );
  });

  it('runs on the clock the controller removes the attribute on', () => {
    expect(pressLayerConsts.cellReleaseMs).toBe(PRESS_FADE_MS);
  });
});

describe.each([
  [
    'Item',
    () => {
      render(
        createElement(Item, {
          label: 'Row',
          onClick: () => {},
          'data-testid': 'row',
        }),
      );
      return screen.getByTestId('row');
    },
  ],
  [
    'TreeList row',
    () => {
      render(
        createElement(TreeList, {
          items: [{id: 'a', label: 'Row', onClick: () => {}}],
        }),
      );
      // The row box: the element the controller writes the press on.
      return screen
        .getByRole('treeitem')
        .querySelector('[data-astryx-pressable]') as HTMLElement;
    },
  ],
])('%s paints the touch press on a compositor layer', (_, mount) => {
  it('shows the pressed token on its ::before at once while the press is on', () => {
    const row = mount();
    expect(row).toHaveAttribute('data-astryx-pressable');
    const all = rulesDeclaredFor(row).filter(rule =>
      selectorOf(rule).includes('::before'),
    );
    expect(values(all, 'background-color')).toEqual(
      expect.arrayContaining([
        expect.stringContaining('--color-overlay-pressed'),
      ]),
    );
    expect(values(all, 'opacity')).toContain('0');
    const on = layerRules(row, ON);
    expect(values(on, 'opacity')).toEqual(['1']);
    // The onset is instant: nothing animates on the on arm.
    expect(values(on, 'animation-name')).toEqual([]);
  });

  it('releases with an opacity animation on the cell clock and curve', () => {
    const row = mount();
    const fading = layerRules(row, FADING);
    expect(values(fading, 'animation-name')).toHaveLength(1);
    expect(values(fading, 'animation-duration').map(durationToMs)).toEqual([
      list.highlight.releaseMs,
    ]);
    // StyleX writes the curve minified (`cubic-bezier(0,0,.2,1)`): compare
    // the control points.
    const points = (css: string) =>
      (css.match(/-?\d*\.?\d+/g) ?? []).map(Number);
    expect(values(fading, 'animation-timing-function').map(points)).toEqual([
      [...list.highlight.releaseCurve],
    ]);
    expect(values(fading, 'animation-fill-mode')).toEqual(['both']);
  });

  it('turns the overlay’s own touch paint off: no release on the row itself', () => {
    const row = mount();
    expect(values(hostRules(row, FADING), 'animation-name')).toEqual([]);
    expect(values(rulesDeclaredFor(row), '--_press-paint')).toEqual([
      'transparent',
    ]);
  });
});

it('a row without an action paints no press layer', () => {
  render(createElement(Item, {label: 'Static', 'data-testid': 'row'}));
  const row = screen.getByTestId('row');
  expect(row).not.toHaveAttribute('data-astryx-pressable');
  expect(layerRules(row, ON)).toEqual([]);
});
