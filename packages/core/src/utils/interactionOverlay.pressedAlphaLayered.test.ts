// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file interactionOverlay.pressedAlphaLayered.test.ts
 * @input vitest and the shared press styles (`interactionOverlayStyles`)
 * @output Asserts that `pressedAlphaLayered` carries `pressedAlpha`'s
 *   strength and paint, keeps its release with any pointer but a coarse
 *   primary one, and drops only the strength's own release under a coarse
 *   primary pointer, where a descendant's compositor layer fades instead
 * @position Unit test beside utils/interactionOverlay.stylex.ts
 */

import {createElement} from 'react';
import {render, screen} from '@testing-library/react';
import * as stylex from '@stylexjs/stylex';
import {describe, expect, it} from 'vitest';
import {rulesDeclaredFor} from '../__tests__/pressState';
import {interactionOverlayStyles} from './interactionOverlay.stylex';

const FADING = '[data-astryx-press="fading"]';
/** Rules under a coarse primary pointer, Reduce Motion's arms left out. */
const UNDER_COARSE = {
  insideMedia: /\(pointer: coarse\)/,
  outsideMedia: /prefers-reduced-motion/,
};
/** Rules for any other pointer, Reduce Motion's arms left out. */
const UNDER_FINE = {outsideMedia: /prefers-reduced-motion|\(pointer: coarse\)/};

const selectorOf = (rule: string) => rule.slice(0, rule.indexOf('{'));
const fadingOnHost = (rules: string[]) =>
  rules.filter(
    rule =>
      selectorOf(rule).includes(FADING) && !selectorOf(rule).includes('::'),
  );
const valuesOf = (rules: string[], property: string) =>
  rules
    .flatMap(rule => {
      const match = rule.match(new RegExp(`${property}:\\s*([^;}]+)`));
      return match == null ? [] : [match[1].trim()];
    })
    .sort();

function renderOwners(): {alpha: HTMLElement; layered: HTMLElement} {
  render(
    createElement(
      'div',
      null,
      createElement('div', {
        'data-testid': 'alpha',
        ...stylex.props(interactionOverlayStyles.pressedAlpha),
      }),
      createElement('div', {
        'data-testid': 'layered',
        ...stylex.props(interactionOverlayStyles.pressedAlphaLayered),
      }),
    ),
  );
  return {
    alpha: screen.getByTestId('alpha'),
    layered: screen.getByTestId('layered'),
  };
}

describe('interactionOverlayStyles.pressedAlphaLayered', () => {
  it('declares pressedAlpha’s strength and paint for the descendant’s layer', () => {
    const {alpha, layered} = renderOwners();
    const strengthAndPaint = (el: HTMLElement) =>
      rulesDeclaredFor(el)
        .filter(rule => /--astryx-press-alpha|--_press-paint/.test(rule))
        .sort();
    expect(strengthAndPaint(alpha).length).toBeGreaterThan(0);
    expect(strengthAndPaint(layered)).toEqual(strengthAndPaint(alpha));
  });

  it('with any pointer but a coarse primary one, keeps pressedAlpha’s release (the desktop rule)', () => {
    const {alpha, layered} = renderOwners();
    const release = (el: HTMLElement) =>
      fadingOnHost(rulesDeclaredFor(el, UNDER_FINE));
    expect(valuesOf(release(alpha), 'animation-name')).not.toEqual([]);
    for (const property of [
      'animation-name',
      'animation-duration',
      'animation-timing-function',
    ]) {
      expect(valuesOf(release(layered), property)).toEqual(
        valuesOf(release(alpha), property),
      );
    }
  });

  it('under a coarse primary pointer, drops the strength’s own release on the fading arm', () => {
    const {alpha, layered} = renderOwners();
    const names = (el: HTMLElement) =>
      valuesOf(
        fadingOnHost(rulesDeclaredFor(el, UNDER_COARSE)),
        'animation-name',
      );
    // pressedAlpha keeps the strength's release there; the layered owner
    // holds the strength so the descendant's layer is the one fade.
    expect(names(alpha)).not.toContain('none');
    expect(names(layered)).toEqual(['none']);
  });
});
