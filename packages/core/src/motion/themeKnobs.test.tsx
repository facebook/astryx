// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file themeKnobs.test.tsx
 * @input vitest (jsdom), React Testing Library, Theme and defineTheme, the
 *   springs and timing tables, resolveMotion, the motion animator and
 *   reducedMotionFade
 * @output Checks `spec:AST-108` FR3, FR4, FR5 and FR6 on the animator side,
 *   through a rendered Theme: a role's spring and duration follow the knobs
 *   of the theme the element is in (tempo scales the duration; character
 *   moves the bounce by the role's weight, never for an exit), a nested theme
 *   that sets no knob plays Astryx's own motion, finger-following motion
 *   never follows the knobs, a duration scale alone leaves the springs alone,
 *   Astryx's own knobs give the table value itself, and a theme that reduces
 *   motion for everyone counts as the person's Reduce Motion setting
 * @position Testing; validates themeKnobs.ts and resolveMotion.ts against
 *   the attributes Theme.tsx writes
 */

import {cleanup, render} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {defineTheme, type DefineThemeInput} from '../theme/defineTheme';
import {Theme} from '../theme/Theme';
import {createAnimator} from './animator';
import {reducedMotionFade} from './reducedMotion';
import {
  CHARACTER_BOUNCE_STEP,
  resolveMotion,
  resolveSettleMs,
} from './resolveMotion';
import {
  durationBounceOf,
  settlingDuration,
  toSpring,
  type SpringDescription,
} from './spring';
import {themeMotionKnobs, themeReducesMotion} from './themeKnobs';
import {registerSpringsTable, springs} from './uikit/springs';
import {registerTimingTable, timing} from './uikit/timing';

const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  registerSpringsTable();
  registerTimingTable();
  // No Reduce Motion setting, a fine pointer.
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
});

afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
});

/** An element rendered inside a Theme whose motion is `motion`. */
function inTheme(name: string, motion?: DefineThemeInput['motion']) {
  const {getByTestId} = render(
    <Theme theme={defineTheme({name, motion})}>
      <div data-testid="moving" />
    </Theme>,
  );
  return getByTestId('moving');
}

const shape = (spring: SpringDescription) => durationBounceOf(toSpring(spring));

describe('the knobs of the theme an element is in (FR6)', () => {
  it('are Astryx\u2019s own outside a theme and in a theme that sets none', () => {
    const loose = document.createElement('div');
    document.body.append(loose);
    expect(themeMotionKnobs(loose)).toEqual({
      tempo: 1,
      tempoIsSet: false,
      character: 'standard',
    });
    expect(themeMotionKnobs(null).tempo).toBe(1);
    expect(themeMotionKnobs(inTheme('KnobPlain'))).toEqual({
      tempo: 1,
      tempoIsSet: false,
      character: 'standard',
    });
    loose.remove();
  });

  it('are the nearest theme\u2019s, and a nested theme that sets none plays Astryx\u2019s own', () => {
    const {getByTestId} = render(
      <Theme theme={defineTheme({name: 'KnobOuter', motion: {tempo: 0.8}})}>
        <div data-testid="outer" />
        <Theme
          theme={defineTheme({
            name: 'KnobInner',
            motion: {character: 'expressive'},
          })}>
          <div data-testid="inner" />
          <Theme theme={defineTheme({name: 'KnobInnermost'})}>
            <div data-testid="innermost" />
          </Theme>
        </Theme>
      </Theme>,
    );
    expect(themeMotionKnobs(getByTestId('outer'))).toMatchObject({
      tempo: 0.8,
      tempoIsSet: true,
    });
    expect(themeMotionKnobs(getByTestId('inner'))).toEqual({
      tempo: 1,
      tempoIsSet: false,
      character: 'expressive',
    });
    expect(themeMotionKnobs(getByTestId('innermost')).character).toBe(
      'standard',
    );
  });

  it('say a theme reduces motion for everyone from its root mark', () => {
    expect(
      themeReducesMotion(inTheme('Still', {reducedMotion: 'always'})),
    ).toBe(true);
    cleanup();
    expect(themeReducesMotion(inTheme('Moving', {tempo: 1.2}))).toBe(false);
  });
});

describe('a role at the theme\u2019s knobs (FR3, FR4, FR5)', () => {
  it('is the table value itself at Astryx\u2019s own knobs', () => {
    const element = inTheme('Plain');
    expect(resolveMotion(element, springs.stateChange)).toBe(
      springs.stateChange,
    );
    expect(resolveMotion(element, timing, 'stateChangeMs')).toBe(
      timing.stateChangeMs,
    );
  });

  it('tempo scales a spring\u2019s duration and a role\u2019s duration', () => {
    const element = inTheme('Slow', {tempo: 1.5});
    const base = shape(springs.stateChange);
    const slowed = shape(resolveMotion(element, springs.stateChange));
    expect(slowed.duration).toBeCloseTo(base.duration * 1.5, 6);
    expect(slowed.bounce).toBeCloseTo(base.bounce, 6);
    expect(resolveMotion(element, timing, 'stateChangeMs')).toBeCloseTo(
      timing.stateChangeMs * 1.5,
      6,
    );
  });

  it('character moves the bounce by the role\u2019s weight, and never an exit\u2019s', () => {
    const lively = inTheme('Lively', {character: 'expressive'});
    const bounce = (element: Element, spring: SpringDescription) =>
      shape(resolveMotion(element, spring)).bounce - shape(spring).bounce;
    // An entrance (weight 1), a state change (0.5), an exit (0).
    expect(bounce(lively, springs.menuOpen)).toBeCloseTo(
      CHARACTER_BOUNCE_STEP,
      6,
    );
    expect(bounce(lively, springs.stateChange)).toBeCloseTo(
      CHARACTER_BOUNCE_STEP / 2,
      6,
    );
    expect(bounce(lively, springs.menuClose)).toBeCloseTo(0, 6);
    cleanup();
    const crisp = inTheme('Crisp', {character: 'crisp'});
    expect(bounce(crisp, springs.stateChange)).toBeCloseTo(
      -CHARACTER_BOUNCE_STEP / 2,
      6,
    );
    expect(bounce(crisp, springs.menuClose)).toBeCloseTo(0, 6);
  });

  it('finger-following motion never follows the knobs', () => {
    const element = inTheme('Everything', {
      tempo: 1.5,
      character: 'expressive',
    });
    expect(resolveMotion(element, springs.fingerTracking)).toBe(
      springs.fingerTracking,
    );
  });

  it('a duration scale alone leaves the springs at tempo 1', () => {
    const element = inTheme('Scaled', {fast: 100, medium: 250, ratio: 0.75});
    expect(resolveMotion(element, springs.stateChange)).toBe(
      springs.stateChange,
    );
  });

  it('is the same object each time for the same knobs', () => {
    const element = inTheme('Stable', {tempo: 1.2});
    expect(resolveMotion(element, springs.settle)).toBe(
      resolveMotion(element, springs.settle),
    );
  });
});

describe('a theme that reduces motion for everyone (FR6)', () => {
  it('counts as the Reduce Motion setting for the animator and the fade', () => {
    const still = inTheme('StillAnimator', {reducedMotion: 'always'});
    // A fine pointer: reduced motion lands at once.
    expect(createAnimator(still).reducedMotion()).toBe('instant');
    expect(reducedMotionFade(still)).toEqual({duration: 0, easing: 'linear'});
    cleanup();
    const moving = inTheme('MovingAnimator');
    expect(createAnimator(moving).reducedMotion()).toBe('off');
    expect(reducedMotionFade(moving)).toBeNull();
  });
});

describe('a CSS part timed from its spring (FR4a)', () => {
  const settleMs = (spring: SpringDescription) =>
    settlingDuration(toSpring(spring)) * 1000;

  it('lasts the role’s settling duration at Astryx’s own knobs', () => {
    const element = inTheme('PlainClock');
    expect(resolveSettleMs(element, springs.settle)).toBeCloseTo(
      settleMs(springs.settle),
      6,
    );
    // SwiftUI's smooth spring (0.5 s, no bounce) settles in about 0.6 s.
    expect(resolveSettleMs(element, springs.settle)).toBeGreaterThan(400);
    expect(resolveSettleMs(element, springs.settle)).toBeLessThan(900);
  });

  it('follows the theme’s tempo and character with the spring it plays with', () => {
    const plain = resolveSettleMs(inTheme('PlainPair'), springs.settle);
    cleanup();
    const slow = inTheme('SlowPair', {tempo: 1.5});
    expect(resolveSettleMs(slow, springs.settle)).toBeCloseTo(plain * 1.5, 6);
    cleanup();
    const lively = inTheme('LivelyPair', {character: 'expressive'});
    const livelySpring = resolveMotion(lively, springs.settle);
    expect(livelySpring).not.toBe(springs.settle);
    expect(resolveSettleMs(lively, springs.settle)).toBeCloseTo(
      settleMs(livelySpring),
      6,
    );
  });

  it('stays fixed for finger-following motion, and plays a spring that is no role as given', () => {
    const slow = inTheme('SlowFixed', {tempo: 1.5});
    expect(resolveSettleMs(slow, springs.fingerTracking)).toBeCloseTo(
      settleMs(springs.fingerTracking),
      6,
    );
    const inline = {response: 0.4, dampingRatio: 0.9};
    expect(resolveSettleMs(slow, inline)).toBeCloseTo(settleMs(inline), 6);
  });
});
