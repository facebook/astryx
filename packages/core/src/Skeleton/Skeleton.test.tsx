// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Skeleton} from './Skeleton';
import {getForcedColorsRules} from '../__tests__/forcedColors';

describe('Skeleton', () => {
  it('renders a placeholder element', () => {
    render(<Skeleton width={200} height={20} data-testid="sk" />);
    expect(screen.getByTestId('sk')).toBeInTheDocument();
  });

  it('is hidden from assistive tech by default (complex-20)', () => {
    render(<Skeleton width={200} height={20} data-testid="sk" />);
    expect(screen.getByTestId('sk')).toHaveAttribute('aria-hidden', 'true');
  });

  it('allows the aria-hidden default to be overridden', () => {
    render(
      <Skeleton width={200} height={20} data-testid="sk" aria-hidden={false} />,
    );
    // Consumer opt-out: not hidden when explicitly set false.
    expect(screen.getByTestId('sk')).toHaveAttribute('aria-hidden', 'false');
  });
});

// jsdom cannot emulate forced-colors rendering, so these assert that the
// compiled output includes the forced-colors rules; visual behavior needs
// manual verification under Windows High Contrast.
describe('forced colors (WCAG 1.4.11)', () => {
  it('compiles forced-colors overrides so the placeholder stays visible under Windows High Contrast', () => {
    render(<Skeleton width={200} height={20} data-testid="sk" />);
    const css = getForcedColorsRules();
    // The painted fill is stripped to Canvas (invisible); GrayText is a
    // system color, so it survives forcing.
    expect(css).toContain('background-color: graytext;');
    // The resting 0.25 opacity is lifted so the static placeholder reads.
    expect(css).toContain('opacity: 1;');
  });
});
