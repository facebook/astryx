// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Skeleton} from './Skeleton';

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
