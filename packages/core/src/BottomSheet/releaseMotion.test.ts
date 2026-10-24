// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file releaseMotion.test.ts
 * @input vitest, jsdom, readReleaseMotion and themeCurve
 * @output Which timing a sheet's release runs on: UIKit's under a finger,
 *   the stylesheet's transform transition under a mouse (lists, keywords,
 *   transitions turned off, unreadable values); the theme curve's values
 * @position Testing; validates releaseMotion.ts
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {readReleaseMotion, themeCurve} from './releaseMotion';

function pointer(coarse: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: coarse && query.includes('pointer: coarse'),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

function sheet(style: Partial<CSSStyleDeclaration>): HTMLElement {
  const element = document.createElement('div');
  Object.assign(element.style, style);
  return element;
}

beforeEach(() => pointer(false));
afterEach(() => vi.unstubAllGlobals());

describe('readReleaseMotion', () => {
  it('runs on UIKit springs under a finger', () => {
    pointer(true);
    expect(
      readReleaseMotion(
        sheet({transitionProperty: 'transform', transitionDuration: '410ms'}),
      ),
    ).toEqual({kind: 'uikit'});
  });

  it('reads the transform transition under a mouse, from a list', () => {
    const motion = readReleaseMotion(
      sheet({
        transitionProperty: 'opacity, transform',
        transitionDuration: '0.2s, 0.41s',
        transitionDelay: '0s, 0s',
        transitionTimingFunction: 'linear, cubic-bezier(0.24, 1, 0.4, 1)',
      }),
    );
    expect(motion.kind).toBe('theme');
    if (motion.kind === 'theme') {
      expect(motion.durationMs).toBeCloseTo(410, 6);
      expect(motion.easing(0.5)).toBeGreaterThan(0.9); // a fast-out curve
    }
  });

  it('understands the CSS keywords', () => {
    const motion = readReleaseMotion(
      sheet({
        transitionProperty: 'all',
        transitionDuration: '300ms',
        transitionTimingFunction: 'ease-in',
      }),
    );
    expect(motion.kind === 'theme' && motion.easing(0.5)).toBeCloseTo(0.315, 2);
  });

  it('does not animate when transitions are off', () => {
    const motion = readReleaseMotion(sheet({transitionProperty: 'none'}));
    expect(motion).toMatchObject({kind: 'theme', durationMs: 0});
    const notTransform = readReleaseMotion(
      sheet({transitionProperty: 'opacity', transitionDuration: '1s'}),
    );
    expect(notTransform).toMatchObject({kind: 'theme', durationMs: 0});
  });

  it('falls back to UIKit when the timing cannot be read', () => {
    expect(
      readReleaseMotion(
        sheet({
          transitionProperty: 'transform',
          transitionDuration: '410ms',
          transitionTimingFunction: 'steps(4, end)',
        }),
      ),
    ).toEqual({kind: 'uikit'});
    expect(readReleaseMotion(null)).toEqual({kind: 'uikit'});
  });
});

describe('themeCurve', () => {
  it('eases from one value to another over the duration', () => {
    const curve = themeCurve(10, 110, {
      durationMs: 400,
      easing: progress => progress * progress,
    });
    expect(curve.duration).toBe(0.4);
    expect(curve.at(0)).toBe(10);
    expect(curve.at(0.2)).toBeCloseTo(35, 9);
    expect(curve.at(0.4)).toBe(110);
    expect(curve.at(1)).toBe(110);
    // d/dt of 10 + 100 (t / 0.4)² at 0.2 s: 2 × 100 × 0.2 / 0.16 = 250.
    expect(curve.velocity(0.2)).toBeCloseTo(250, 0);
  });

  it('jumps when the duration is zero', () => {
    const curve = themeCurve(10, 110, {durationMs: 0, easing: p => p});
    expect(curve.at(0)).toBe(110);
    expect(curve.velocity(0)).toBe(0);
  });
});
