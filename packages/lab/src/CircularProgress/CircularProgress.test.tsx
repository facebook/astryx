// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {CircularProgress} from './CircularProgress';

describe('CircularProgress', () => {
  it('renders with default props', () => {
    render(<CircularProgress value={50} label="Progress" />);
    const meter = screen.getByRole('meter');
    expect(meter).toBeInTheDocument();
    expect(meter).toHaveAttribute('aria-valuenow', '50');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders label as visually hidden by default', () => {
    render(<CircularProgress value={50} label="Upload progress" />);
    expect(screen.getByText('Upload progress')).toBeInTheDocument();
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-labelledby');
  });

  it('shows label visually when isLabelHidden is false', () => {
    render(
      <CircularProgress
        value={50}
        label="Upload progress"
        isLabelHidden={false}
      />,
    );
    const label = screen.getByText('Upload progress');
    expect(label).toBeInTheDocument();
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-labelledby');
  });

  it('respects custom max', () => {
    render(<CircularProgress value={3} max={10} label="Steps" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '3');
    expect(meter).toHaveAttribute('aria-valuemax', '10');
  });

  it('clamps value to [0, max]', () => {
    const {rerender} = render(
      <CircularProgress value={150} max={100} label="Over" />,
    );
    let meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '100');

    rerender(<CircularProgress value={-10} max={100} label="Under" />);
    meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders children in the center', () => {
    render(
      <CircularProgress value={75} label="Progress">
        75%
      </CircularProgress>,
    );
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('forwards ref to outer container', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<CircularProgress ref={ref} value={50} label="Test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes data-testid', () => {
    render(
      <CircularProgress value={50} label="Test" data-testid="my-progress" />,
    );
    expect(screen.getByTestId('my-progress')).toBeInTheDocument();
  });

  it('renders with all variant options', () => {
    const variants = [
      'accent',
      'success',
      'warning',
      'error',
      'neutral',
    ] as const;
    for (const variant of variants) {
      const {unmount} = render(
        <CircularProgress value={50} label={variant} variant={variant} />,
      );
      expect(screen.getByRole('meter')).toBeInTheDocument();
      unmount();
    }
  });

  it('renders with all size options', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    for (const size of sizes) {
      const {unmount} = render(
        <CircularProgress value={50} label={size} size={size} />,
      );
      expect(screen.getByRole('meter')).toBeInTheDocument();
      unmount();
    }
  });

  it('handles zero max gracefully', () => {
    render(<CircularProgress value={0} max={0} label="Empty" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '0');
  });

  describe('indeterminate mode', () => {
    it('renders indeterminate when value is omitted', () => {
      render(<CircularProgress label="Loading" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    it('does not set aria-valuenow/min/max when indeterminate', () => {
      render(<CircularProgress label="Loading" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).not.toHaveAttribute('aria-valuenow');
      expect(progressbar).not.toHaveAttribute('aria-valuemin');
      expect(progressbar).not.toHaveAttribute('aria-valuemax');
    });

    it('is labelled via aria-labelledby when indeterminate', () => {
      render(<CircularProgress label="Loading data" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-labelledby');
    });

    it('renders with all variants in indeterminate mode', () => {
      const variants = [
        'accent',
        'success',
        'warning',
        'error',
        'neutral',
      ] as const;
      for (const variant of variants) {
        const {unmount} = render(
          <CircularProgress label={variant} variant={variant} />,
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        unmount();
      }
    });

    it('renders children alongside indeterminate animation', () => {
      render(<CircularProgress label="Loading">...</CircularProgress>);
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });
});
