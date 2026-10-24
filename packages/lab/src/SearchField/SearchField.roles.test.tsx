// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SearchField.roles.test.tsx
 * @input vitest, Testing Library, SearchField, searchFieldModel and the
 *   motion foundation (its `useAnimator` wrapped to record what is played)
 * @output Proofs that the activation reads its clock and curve as motion
 *   roles under the field's theme: a theme's `--motion-search-activation-ms`
 *   and `--motion-search-activation-curve` time the activation the field
 *   plays, and without a theme it keeps UIKit's 383 ms ease-in-ease-out; the
 *   activation waits for a presented frame; a mouse plays none (any finger,
 *   iOS or Android, plays it)
 * @position Testing; validates SearchField.tsx and searchFieldModel.ts with a
 *   stubbed computed style (as core's resolveMotion.test.ts does)
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, render, screen} from '@testing-library/react';
import {uikit} from '@astryxdesign/core/motion/experimental';
import type * as Motion from '@astryxdesign/core/motion/experimental';
import {SearchField} from './SearchField';
import {activationTiming} from './searchFieldModel';

const played = vi.hoisted(() => [] as Array<Record<string, number>>);

// Records the length of every curve the field plays; the animator still
// plays them.
vi.mock('@astryxdesign/core/motion/experimental', async importOriginal => {
  const actual = await importOriginal<typeof Motion>();
  const wrapped = new WeakSet<object>();
  return {
    ...actual,
    useAnimator: (...args: Parameters<typeof actual.useAnimator>) => {
      const result = actual.useAnimator(...args);
      const {animator} = result;
      if (!wrapped.has(animator)) {
        wrapped.add(animator);
        const play = animator.play.bind(animator);
        animator.play = (curves, options) => {
          played.push(
            Object.fromEntries(
              Object.entries(curves).map(([key, curve]) => [
                key,
                curve?.duration ?? 0,
              ]),
            ),
          );
          return play(curves, options);
        };
      }
      return result;
    },
  };
});

/** Theme variables by scope element, as the stubbed computed style reports. */
let variables: Map<Element, Record<string, string>>;

/** Frames the test delivers: the activation starts on a presented one. */
let frameCallbacks: Map<number, FrameRequestCallback>;
let frameTime = 0;
function deliverFrames(count: number) {
  for (let k = 0; k < count; k++) {
    frameTime += 16.7;
    const waiting = [...frameCallbacks.values()];
    frameCallbacks.clear();
    act(() => {
      for (const callback of waiting) {
        callback(frameTime);
      }
    });
  }
}

beforeEach(() => {
  played.length = 0;
  variables = new Map();
  frameCallbacks = new Map();
  frameTime = performance.now();
  let nextFrame = 1;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
    const id = nextFrame++;
    frameCallbacks.set(id, callback);
    return id;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => {
    frameCallbacks.delete(id);
  });
  vi.spyOn(window, 'getComputedStyle').mockImplementation(
    (element: Element) =>
      ({
        direction: 'ltr',
        getPropertyValue: (name: string) =>
          variables.get(element)?.[name] ?? '',
      }) as unknown as CSSStyleDeclaration,
  );
  // Under a finger (a coarse primary pointer), so the field plays UIKit's
  // activation.
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('pointer: coarse'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

/** A theme scope with the given motion role values. */
function themed(values: Record<string, string>) {
  const scope = document.createElement('div');
  scope.setAttribute('data-astryx-theme', 'test');
  document.body.append(scope);
  variables.set(scope, values);
  return scope;
}

describe('SearchField motion roles', () => {
  it('reads the clock and curve from the field’s theme, or the table’s', () => {
    const scope = themed({
      '--motion-search-activation-ms': '600ms',
      '--motion-search-activation-curve': 'cubic-bezier(0, 0, 1, 1)',
    });
    const child = document.createElement('div');
    scope.append(child);
    const timing = activationTiming(child);
    expect(timing.seconds).toBeCloseTo(0.6, 6);
    // The theme's linear curve.
    expect(timing.ease(0.25)).toBeCloseTo(0.25, 3);

    const unthemed = document.createElement('div');
    document.body.append(unthemed);
    const table = activationTiming(unthemed);
    expect(table.seconds).toBeCloseTo(uikit.search.activationMs / 1000, 6);
    // UIKit's ease-in-ease-out, slow at the start.
    expect(table.ease(0.25)).toBeLessThan(0.2);
  });

  it('times the activation it plays by the theme’s --motion-search-activation-ms', () => {
    const scope = themed({'--motion-search-activation-ms': '600ms'});
    render(<SearchField label="Search" />, {container: scope});
    const input = screen.getByRole('searchbox');
    act(() => input.focus());
    // Nothing plays until the page has presented a frame (two at cadence).
    expect(played).toEqual([]);
    deliverFrames(2);
    expect(played.length).toBeGreaterThan(0);
    for (const curves of played) {
      for (const duration of Object.values(curves)) {
        expect(duration).toBeCloseTo(0.6, 6);
      }
    }
  });

  it('keeps UIKit’s 383 ms activation without a theme', () => {
    render(<SearchField label="Search" />);
    act(() => screen.getByRole('searchbox').focus());
    deliverFrames(2);
    expect(played.length).toBeGreaterThan(0);
    for (const curves of played) {
      for (const duration of Object.values(curves)) {
        expect(duration).toBeCloseTo(uikit.search.activationMs / 1000, 6);
      }
    }
  });

  it('plays no activation under a mouse: the parts take their places at once', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    themed({'--motion-search-activation-ms': '600ms'});
    render(<SearchField label="Search" />);
    act(() => screen.getByRole('searchbox').focus());
    deliverFrames(3);
    expect(played).toEqual([]);
  });
});
