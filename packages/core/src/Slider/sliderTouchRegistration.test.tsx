// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sliderTouchRegistration.test.tsx
 * @input Slider under a coarse primary pointer; the motion role registry
 * @output Checks that importing Slider registers no motion role, and that its
 *   touch module registers the slider table's roles once it attaches
 * @position Test for the motion registry rule (#8076): a table registers
 *   nothing on import, and the touch code that animates with it calls its
 *   register function before the first animation. Its own file, so no other
 *   case has registered the table first.
 */

import {act, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {listMotionRoles} from '../motion/roles';
import {Slider} from './Slider';

const sliderRoles = () =>
  listMotionRoles()
    .map(role => role.id)
    .filter(id => id.startsWith('slider.'))
    .sort();

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Slider’s motion roles', () => {
  it('are not registered by importing Slider, and are once its touch presentation attaches', async () => {
    expect(sliderRoles()).toEqual([]);
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
    render(<Slider label="Brightness" value={50} onChange={() => {}} />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(
      screen.getByRole('slider').querySelector('[data-slider-hit]'),
    ).not.toBeNull();
    expect(sliderRoles()).toEqual([
      'slider.dropSpring',
      'slider.liftSpring',
      'slider.releaseSpring',
    ]);
  });
});
