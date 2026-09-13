// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MediaTheme.dom.test.tsx
 * @input MediaTheme rendered in jsdom
 * @output Coverage for mode="auto" and mode="off" DOM behavior
 * @position Companion to useAutoMediaMode.test.ts, which covers the pure pick
 *
 * jsdom applies no stylesheet and resolves no custom properties, so auto
 * cannot measure here — which makes this the right place to pin the fallback
 * behavior that an unmeasurable surface depends on.
 *
 * Named `.dom.test.tsx` rather than `.test.tsx`: a sibling `.test.ts` of the
 * same basename collides in the TypeScript project service, and type-aware
 * lint then cannot resolve either file.
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MediaTheme} from './MediaTheme';
import type {MediaThemeMode} from './MediaTheme';

function renderMode(mode: MediaThemeMode, fallback?: 'dark' | 'light') {
  render(
    <div style={{background: 'rgb(10, 19, 23)'}}>
      <MediaTheme mode={mode} fallback={fallback}>
        <span data-testid="child">content</span>
      </MediaTheme>
    </div>,
  );
  return screen.getByTestId('child').parentElement;
}

describe('MediaTheme', () => {
  it.each(['dark', 'light'] as const)('applies mode=%s verbatim', mode => {
    expect(renderMode(mode)?.getAttribute('data-astryx-media')).toBe(mode);
  });

  it('renders no media attribute for mode="off"', () => {
    const wrapper = renderMode('off');
    expect(wrapper?.hasAttribute('data-astryx-media')).toBe(false);
  });

  it('still renders its element for mode="off" so children never remount', () => {
    expect(renderMode('off')?.tagName).toBe('DIV');
  });

  it('falls back to dark for an unmeasurable auto surface', () => {
    expect(renderMode('auto')?.getAttribute('data-astryx-media')).toBe('dark');
  });

  it('honors an explicit fallback', () => {
    expect(renderMode('auto', 'light')?.getAttribute('data-astryx-media')).toBe(
      'light',
    );
  });

  it('ignores fallback when the mode is explicit', () => {
    expect(renderMode('dark', 'light')?.getAttribute('data-astryx-media')).toBe(
      'dark',
    );
  });

  it('leaves no probe element behind', () => {
    const {container} = render(
      <div style={{background: 'rgb(10, 19, 23)'}}>
        <MediaTheme mode="auto">
          <span>content</span>
        </MediaTheme>
      </div>,
    );
    expect(container.querySelectorAll('span')).toHaveLength(1);
  });

  // Regression: an earlier revision keyed the measurement to a dependency
  // array, so a surface whose color changed by prop kept a stale mode until
  // something unrelated re-ran the effect.
  it('re-measures when the surface changes without the theme changing', () => {
    function Harness({background}: {background: string}) {
      return (
        <div style={{background}}>
          <MediaTheme mode="auto" fallback="dark">
            <span data-testid="child">content</span>
          </MediaTheme>
        </div>
      );
    }
    // jsdom resolves no custom properties, so the measured pick is always the
    // fallback; what this pins is that the effect RUNS again — a stale
    // implementation skips it entirely.
    const {rerender} = render(<Harness background="rgb(10, 19, 23)" />);
    const first = screen.getByTestId('child').parentElement;
    rerender(<Harness background="rgb(255, 255, 255)" />);
    expect(screen.getByTestId('child').parentElement).toBe(first);
    expect(first?.getAttribute('data-astryx-media')).toBe('dark');
  });
});
