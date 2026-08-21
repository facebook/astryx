// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useContrastMode.dom.test.tsx
 * @input React tree rendered in jsdom
 * @output Coverage for the hook's DOM-facing behavior
 * @position Companion to useContrastMode.test.ts, which covers the pure decision
 *
 * Named `.dom.test.tsx` rather than `.test.tsx`: a sibling `.test.ts` of the
 * same basename collides in the TypeScript project service, and type-aware
 * lint then cannot resolve either file.
 *
 * jsdom applies no stylesheet and resolves no custom properties, so these
 * tests cover what the hook does with an unreadable DOM — it must leave the
 * caller on its static fallback rather than "measuring" black on white.
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {useRef} from 'react';
import {useContrastMode} from './useContrastMode';
import {MediaTheme} from '../theme/MediaTheme';

function Surface({background}: {background?: string}) {
  const ref = useRef<HTMLDivElement>(null);
  const contrast = useContrastMode(ref, 'dark');
  return (
    <div ref={ref} style={background ? {background} : undefined}>
      <MediaTheme mode={contrast?.mode ?? 'dark'}>
        <span data-testid="child">content</span>
      </MediaTheme>
    </div>
  );
}

const mediaOf = () =>
  screen
    .getByTestId('child')
    .parentElement?.getAttribute('data-astryx-media') ?? 'off';

describe('useContrastMode', () => {
  it('leaves the requested mode alone when no opaque backdrop can be found', () => {
    render(<Surface />);
    expect(mediaOf()).toBe('dark');
  });

  it('renders the child inside a MediaTheme element either way', () => {
    render(<Surface background="rgb(10, 19, 23)" />);
    expect(screen.getByTestId('child').parentElement?.tagName).toBe('DIV');
  });

  it('leaves no probe element behind after measuring', () => {
    const {container} = render(<Surface background="rgb(10, 19, 23)" />);
    expect(
      container.querySelectorAll('span[style*="display: none"]'),
    ).toHaveLength(0);
  });
});
