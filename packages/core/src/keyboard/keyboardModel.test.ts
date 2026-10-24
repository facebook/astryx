// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file keyboardModel.test.ts
 * @input vitest, createKeyboardModel, the keyboard spring
 * @output Tests the keyboard layout guide's core: a show dated back to the
 *   keyboard's start, a hide predicted from the blur and confirmed late, the
 *   zero-duration change, focus that comes back, verification of a wrong
 *   prediction, and continuity when one transition interrupts another
 * @position Unit tests for keyboard/keyboardModel.ts
 */

import {describe, expect, it} from 'vitest';
import {createKeyboardModel} from './keyboardModel';
import {keyboard, springs, timing} from '../motion/uikit';
import {naturalFrequency, toSpring} from '../motion/spring';

const OMEGA = naturalFrequency(toSpring(springs.keyboard));
// Fraction of the travel left `ms` into the critically damped keyboard spring.
const remaining = (ms: number) =>
  (1 + (OMEGA * ms) / 1000) * Math.exp((-OMEGA * ms) / 1000);
const INSET = 337;
const LAG = keyboard.showReportLagMs;
const DURATION = timing.keyboardNotificationMs;

describe('createKeyboardModel', () => {
  it('starts at rest at the initial inset', () => {
    const model = createKeyboardModel(0);
    expect(model.inset).toBe(0);
    expect(model.presentation(1000)).toBe(0);
    expect(model.transition.animated).toBe(false);
  });

  it('dates a show back to when the keyboard started to rise', () => {
    const model = createKeyboardModel(0);
    const show = model.report(INSET, 1000);
    expect(show).toMatchObject({
      kind: 'show',
      from: 0,
      to: INSET,
      start: 1000 - LAG,
      velocity: 0,
      animated: true,
      predicted: false,
    });
    expect(model.inset).toBe(INSET);
    expect(model.presentation(1000 - LAG)).toBe(0);
    // At the report the keyboard is already part-way up its spring.
    expect(model.presentation(1000)).toBeCloseTo(
      INSET * (1 - remaining(LAG)),
      6,
    );
    expect(model.presentation(1000 - LAG + DURATION)).toBeGreaterThan(
      INSET - 1,
    );
    expect(model.velocity(1000)).toBeGreaterThan(0);
  });

  it('dates a show back to the last frame before a report a busy main thread held back', () => {
    const model = createKeyboardModel(0);
    // The page rendered nothing between 960 and the report at 1000.
    expect(model.report(INSET, 1000, 960)?.start).toBe(960);
  });

  it('never dates a held-back show further than the longest lag measured', () => {
    const model = createKeyboardModel(0);
    expect(model.report(INSET, 1000, 700)?.start).toBe(
      1000 - keyboard.showReportLagMaxMs,
    );
  });

  it('keeps the usual lag when the page rendered a frame since', () => {
    const model = createKeyboardModel(0);
    expect(model.report(INSET, 1000, 995)?.start).toBe(1000 - LAG);
  });

  it('ignores a report that changes nothing, and an unknown inset', () => {
    const model = createKeyboardModel(0);
    model.report(INSET, 1000);
    expect(model.report(INSET, 1400)).toBeNull();
    expect(model.report(null, 1500)).toBeNull();
    expect(model.inset).toBe(INSET);
  });

  it('starts a hide at the blur and takes the late report as confirmation', () => {
    const model = createKeyboardModel(0);
    model.report(INSET, 1000);
    const hide = model.blurred(3000);
    expect(hide).toMatchObject({
      kind: 'hide',
      from: INSET,
      to: 0,
      start: 3000 + keyboard.hideAfterBlurMs,
      animated: true,
      predicted: true,
    });
    // Nothing moves before the keyboard does.
    expect(model.presentation(3010)).toBe(INSET);
    expect(
      model.presentation(3000 + keyboard.hideAfterBlurMs + DURATION),
    ).toBeLessThan(1);
    // Safari's resize lands once the keyboard is down.
    expect(model.report(0, 3450)).toBeNull();
    expect(model.transition.predicted).toBe(false);
  });

  it('ignores a blur while no keyboard is up', () => {
    const model = createKeyboardModel(0);
    expect(model.blurred(500)).toBeNull();
  });

  it('jumps when another keyboard replaces the one that is up', () => {
    const model = createKeyboardModel(0);
    model.report(INSET, 1000);
    const change = model.report(310, 2000);
    expect(change).toMatchObject({
      kind: 'change',
      from: INSET,
      to: 310,
      start: 2000,
      animated: false,
    });
    expect(model.presentation(1999)).toBe(INSET);
    expect(model.presentation(2000.1)).toBe(310);
  });

  it('lands a show still under way at a corrected end without restarting it', () => {
    const model = createKeyboardModel(0);
    model.report(INSET, 1000);
    const corrected = model.report(360, 1100);
    expect(corrected).toMatchObject({
      kind: 'show',
      from: 0,
      to: 360,
      start: 1000 - LAG,
    });
    expect(model.presentation(1000 - LAG + DURATION)).toBeGreaterThan(359);
  });

  it('follows a hide nobody predicted from the moment it is reported', () => {
    const model = createKeyboardModel(0);
    model.report(INSET, 1000);
    const hide = model.report(0, 5000);
    expect(hide).toMatchObject({
      kind: 'hide',
      from: INSET,
      to: 0,
      start: 5000,
      predicted: false,
    });
  });

  it('keeps the keyboard when focus returns before the predicted hide starts', () => {
    const model = createKeyboardModel(0);
    model.report(INSET, 1000);
    model.blurred(3000);
    const back = model.focused(3005);
    expect(back).toMatchObject({kind: 'show', to: INSET, predicted: true});
    for (const t of [3005, 3022, 3100, 3500]) {
      expect(model.presentation(t)).toBeCloseTo(INSET, 6);
    }
  });

  it('turns a hide under way back when focus returns, without a jump', () => {
    const model = createKeyboardModel(0);
    model.report(INSET, 1000);
    model.blurred(3000);
    const before = model.presentation(3100);
    const back = model.focused(3100);
    expect(back?.from).toBeCloseTo(before, 6);
    expect(back?.velocity).toBeLessThan(0);
    expect(model.presentation(3100 + DURATION)).toBeGreaterThan(INSET - 2);
  });

  it('moves to what the viewport says when a prediction proves wrong', () => {
    const model = createKeyboardModel(0);
    model.report(INSET, 1000);
    model.blurred(3000);
    // Too early to judge.
    expect(model.verify(INSET, 3100)).toBeNull();
    const fix = model.verify(
      INSET,
      3000 + keyboard.hideAfterBlurMs + DURATION + 150,
    );
    expect(fix).toMatchObject({kind: 'show', to: INSET, predicted: false});
  });

  it('confirms a prediction the viewport agrees with', () => {
    const model = createKeyboardModel(0);
    model.report(INSET, 1000);
    model.blurred(3000);
    expect(model.verify(0, 3600)).toBeNull();
    expect(model.transition.predicted).toBe(false);
  });

  it('keeps the presented inset continuous when a show interrupts a hide', () => {
    const model = createKeyboardModel(0);
    model.report(INSET, 1000);
    model.blurred(3000);
    const mid = 3000 + keyboard.hideAfterBlurMs + 120;
    const at = model.presentation(mid);
    const v = model.velocity(mid);
    // The next field reports its keyboard; the show is dated back LAG ms.
    const show = model.report(INSET, mid + LAG);
    expect(show?.start).toBe(mid);
    expect(show?.from).toBeCloseTo(at, 6);
    expect(show?.velocity).toBeCloseTo(v, 6);
  });

  it('never dates a transition before the one it interrupts', () => {
    const model = createKeyboardModel(0);
    model.report(INSET, 1000);
    model.blurred(3000);
    const show = model.report(INSET, 3000);
    expect(show?.start).toBe(3000 + keyboard.hideAfterBlurMs);
  });
});
