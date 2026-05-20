// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSCircularProgress} from './XDSCircularProgress';

describe('XDSCircularProgress', () => {
  it('renders with default props', () => {
    render(<XDSCircularProgress value={50} label="Progress" />);
    const meter = screen.getByRole('meter');
    expect(meter).toBeInTheDocument();
    expect(meter).toHaveAttribute('aria-valuenow', '50');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders label as visually hidden by default', () => {
    render(<XDSCircularProgress value={50} label="Upload progress" />);
    expect(screen.getByText('Upload progress')).toBeInTheDocument();
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-labelledby');
  });

  it('shows label visually when isLabelHidden is false', () => {
    render(
      <XDSCircularProgress
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
    render(<XDSCircularProgress value={3} max={10} label="Steps" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '3');
    expect(meter).toHaveAttribute('aria-valuemax', '10');
  });

  it('clamps value to [0, max]', () => {
    const {rerender} = render(
      <XDSCircularProgress value={150} max={100} label="Over" />,
    );
    let meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '100');

    rerender(<XDSCircularProgress value={-10} max={100} label="Under" />);
    meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders children in the center', () => {
    render(
      <XDSCircularProgress value={75} label="Progress">
        75%
      </XDSCircularProgress>,
    );
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('forwards ref to outer container', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<XDSCircularProgress ref={ref} value={50} label="Test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes data-testid', () => {
    render(
      <XDSCircularProgress value={50} label="Test" data-testid="my-progress" />,
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
        <XDSCircularProgress value={50} label={variant} variant={variant} />,
      );
      expect(screen.getByRole('meter')).toBeInTheDocument();
      unmount();
    }
  });

  it('renders with all size options', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    for (const size of sizes) {
      const {unmount} = render(
        <XDSCircularProgress value={50} label={size} size={size} />,
      );
      expect(screen.getByRole('meter')).toBeInTheDocument();
      unmount();
    }
  });

  it('handles zero max gracefully', () => {
    render(<XDSCircularProgress value={0} max={0} label="Empty" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '0');
  });

  describe('indeterminate mode', () => {
    it('renders indeterminate when value is omitted', () => {
      render(<XDSCircularProgress label="Loading" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    it('does not set aria-valuenow/min/max when indeterminate', () => {
      render(<XDSCircularProgress label="Loading" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).not.toHaveAttribute('aria-valuenow');
      expect(progressbar).not.toHaveAttribute('aria-valuemin');
      expect(progressbar).not.toHaveAttribute('aria-valuemax');
    });

    it('is labelled via aria-labelledby when indeterminate', () => {
      render(<XDSCircularProgress label="Loading data" />);
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
          <XDSCircularProgress label={variant} variant={variant} />,
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        unmount();
      }
    });

    it('renders children alongside indeterminate animation', () => {
      render(<XDSCircularProgress label="Loading">...</XDSCircularProgress>);
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });
});
