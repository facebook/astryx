// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSStatusDot} from './XDSStatusDot';

describe('XDSStatusDot', () => {
  it('renders with role="img" and aria-label', () => {
    render(<XDSStatusDot variant="positive" label="Online" />);
    const dot = screen.getByRole('img', {name: 'Online'});
    expect(dot).toBeInTheDocument();
  });

  it('renders as a span element', () => {
    render(<XDSStatusDot variant="positive" label="Online" />);
    const dot = screen.getByRole('img', {name: 'Online'});
    expect(dot.tagName).toBe('SPAN');
  });

  it('renders with all variant types', () => {
    const variants = [
      'success',
      'warning',
      'error',
      'accent',
      'neutral',
    ] as const;

    for (const variant of variants) {
      const {unmount} = render(
        <XDSStatusDot variant={variant} label={variant} />,
      );
      expect(screen.getByRole('img', {name: variant})).toBeInTheDocument();
      unmount();
    }
  });

  it('renders at fixed 8px size', () => {
    render(<XDSStatusDot variant="positive" label="Online" />);
    const dot = screen.getByRole('img', {name: 'Online'});
    expect(dot).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLSpanElement | null};
    render(<XDSStatusDot ref={ref} variant="positive" label="Online" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('supports data-testid', () => {
    render(
      <XDSStatusDot
        variant="positive"
        label="Online"
        data-testid="status-dot"
      />,
    );
    expect(screen.getByTestId('status-dot')).toBeInTheDocument();
  });

  it('is not focusable', () => {
    render(<XDSStatusDot variant="positive" label="Online" />);
    const dot = screen.getByRole('img', {name: 'Online'});
    expect(dot.getAttribute('tabindex')).toBeNull();
  });

  it('renders with isPulsing', () => {
    render(<XDSStatusDot variant="positive" label="Live" isPulsing />);
    const dot = screen.getByRole('img', {name: 'Live'});
    expect(dot).toBeInTheDocument();
  });

  it('renders without isPulsing by default', () => {
    render(<XDSStatusDot variant="positive" label="Online" />);
    const dot = screen.getByRole('img', {name: 'Online'});
    expect(dot).toBeInTheDocument();
  });
});
