// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menuSelectionRecognizer.test.ts
 * @input Synthetic touches with explicit timestamps through the gesture
 *   arena harness
 * @output MenuSelectionGestureRecognizer's state machine: a still finger
 *   begins after the content-touch delay; a tap is recognized at the lift; a
 *   finger that travels before the onset fails in a menu that scrolls and
 *   begins at once (from where it landed) in one that fits; once begun it
 *   follows the finger to the lift; it claims the finger only in a menu that
 *   fits; a mouse is not taken
 * @position Unit tests of packages/core/src/hooks/menuSelectionRecognizer.ts
 */

import {describe, expect, it} from 'vitest';
import {createHarness} from '../gestures/__tests__/harness';
import {UIKIT_GESTURES} from '../motion/uikit/gestures';
import {MenuSelectionGestureRecognizer} from './menuSelectionRecognizer';

const ONSET = UIKIT_GESTURES.press.contentTouchDelay.value;
const SLOP = UIKIT_GESTURES.press.slop.value;

function select(scrolls: boolean) {
  return new MenuSelectionGestureRecognizer({
    name: 'select',
    scrolls: () => scrolls,
  });
}

describe('MenuSelectionGestureRecognizer', () => {
  it('reads UIKit\u2019s content-touch delay and press slop', () => {
    const recognizer = select(false);
    expect(recognizer.onsetMs).toBe(ONSET);
    expect(recognizer.slop).toBe(SLOP);
    expect(ONSET).toBe(150);
  });

  it('a still finger begins after the content-touch delay, then follows the finger to the lift', () => {
    const h = createHarness();
    const recognizer = select(true);
    h.finger(1).down(100, 100, 1000, {recognizers: [recognizer]});
    h.advance(1000 + ONSET - 1);
    expect(recognizer.state).toBe('possible');
    h.advance(1000 + ONSET);
    expect(recognizer.state).toBe('began');
    expect(recognizer.landingLocation()).toEqual({x: 100, y: 100});
    h.finger(1).move(100, 160, 1300);
    expect(recognizer.state).toBe('changed');
    h.finger(1).up(1400);
    expect(h.log).toEqual([
      `select:began@${1000 + ONSET}`,
      'select:changed@1300',
      'select:ended@1400',
      'select:possible@1400',
    ]);
  });

  it('a tap is recognized at the lift', () => {
    const h = createHarness();
    const recognizer = select(true);
    h.finger(1).down(100, 100, 1000, {recognizers: [recognizer]});
    h.finger(1).up(1060);
    expect(h.log).toEqual(['select:ended@1060', 'select:possible@1060']);
  });

  it('in a menu that scrolls, a finger that travels before the onset fails: the list scrolls', () => {
    const h = createHarness();
    const recognizer = select(true);
    h.finger(1)
      .down(100, 100, 1000, {recognizers: [recognizer]})
      .move(100, 100 - SLOP - 1, 1050);
    expect(recognizer.state).toBe('failed');
    h.advance(1000 + ONSET + 50);
    h.finger(1).up(1300);
    expect(h.log.filter(entry => entry.includes('began'))).toEqual([]);
  });

  it('in a menu that fits, the row under the finger lights at once, and the press follows the finger from where it landed (spec:AST-094 FR11)', () => {
    const h = createHarness();
    const recognizer = select(false);
    h.finger(1).down(100, 100, 1000, {recognizers: [recognizer]});
    expect(h.log).toEqual(['select:began@1000']);
    h.finger(1).move(100, 100 + SLOP + 1, 1050);
    expect(recognizer.state).toBe('changed');
    expect(recognizer.landingLocation()).toEqual({x: 100, y: 100});
    expect(recognizer.location()).toEqual({x: 100, y: 100 + SLOP + 1});
  });

  it('in a menu that scrolls, a finger within the slop waits for the onset', () => {
    const h = createHarness();
    const recognizer = select(true);
    h.finger(1)
      .down(100, 100, 1000, {recognizers: [recognizer]})
      .move(100, 100 + SLOP - 1, 1050);
    expect(recognizer.state).toBe('possible');
    h.advance(1000 + ONSET);
    expect(recognizer.state).toBe('began');
  });

  it('claims the finger only in a menu that fits', () => {
    expect(select(false).claimsTouches).toBe(true);
    expect(select(true).claimsTouches).toBe(false);
  });

  it('a second finger does not join the press', () => {
    const h = createHarness();
    const recognizer = select(false);
    h.finger(1).down(100, 100, 1000, {recognizers: [recognizer]});
    h.finger(2).down(200, 200, 1010, {recognizers: [recognizer]});
    expect(recognizer.numberOfTouches).toBe(1);
  });

  it('does not take a mouse', () => {
    const recognizer = select(false);
    expect(recognizer.allowedPointerTypes?.has('mouse')).toBe(false);
    expect(recognizer.allowedPointerTypes?.has('touch')).toBe(true);
    expect(recognizer.allowedPointerTypes?.has('pen')).toBe(true);
  });

  it('a second finger that lands off the menu ends the press with nothing acting', () => {
    const h = createHarness();
    const recognizer = select(true);
    h.finger(1).down(100, 100, 1000, {recognizers: [recognizer]});
    h.advance(1000 + ONSET);
    expect(recognizer.state).toBe('began');
    // The second finger lands outside the menu, on nothing of its own.
    h.finger(2).down(400, 600, 1200, {recognizers: []});
    expect(recognizer.state).not.toBe('began');
    expect(h.log).toContain('select:cancelled@1200');
    expect(h.arena.isClaimed(2)).toBe(false);
    h.finger(1).up(1300);
    h.finger(2).up(1300);
    expect(h.log).not.toContain('select:ended@1300');
  });
});
