// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {StatusDot} from './StatusDot';

describe('StatusDot', () => {
  it('renders with role="img" and aria-label', () => {
    render(<StatusDot variant="success" label="Online" />);
    const dot = screen.getByRole('img', {name: 'Online'});
    expect(dot).toBeInTheDocument();
  });

  it('renders as a span element', () => {
    render(<StatusDot variant="success" label="Online" />);
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
        <StatusDot variant={variant} label={variant} />,
      );
      expect(screen.getByRole('img', {name: variant})).toBeInTheDocument();
      unmount();
    }
  });

  it('renders at fixed 8px size', () => {
    render(<StatusDot variant="success" label="Online" />);
    const dot = screen.getByRole('img', {name: 'Online'});
    expect(dot).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = {current: null as HTMLSpanElement | null};
    render(<StatusDot ref={ref} variant="success" label="Online" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('supports data-testid', () => {
    render(
      <StatusDot
        variant="success"
        label="Online"
        data-testid="status-dot"
      />,
    );
    expect(screen.getByTestId('status-dot')).toBeInTheDocument();
  });

  it('is not focusable', () => {
    render(<StatusDot variant="success" label="Online" />);
    const dot = screen.getByRole('img', {name: 'Online'});
    expect(dot.getAttribute('tabindex')).toBeNull();
  });

  it('renders with isPulsing', () => {
    render(<StatusDot variant="success" label="Live" isPulsing />);
    const dot = screen.getByRole('img', {name: 'Live'});
    expect(dot).toBeInTheDocument();
  });

  it('renders without isPulsing by default', () => {
    render(<StatusDot variant="success" label="Online" />);
    const dot = screen.getByRole('img', {name: 'Online'});
    expect(dot).toBeInTheDocument();
  });

  it('renders with tooltip', () => {
    render(<StatusDot variant="success" label="Online" tooltip="Online" />);
    const dot = screen.getByRole('img', {name: 'Online'});
    expect(dot).toBeInTheDocument();
  });
});
