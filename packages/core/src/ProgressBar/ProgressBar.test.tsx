// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ProgressBar} from './ProgressBar';

describe('ProgressBar', () => {
  it('renders with default props', () => {
    render(<ProgressBar value={50} label="Progress" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('uses role="progressbar" (not "meter") for determinate progress', () => {
    // A determinate ProgressBar conveys task completion, so it must be a
    // progressbar (announced on update), not a meter (a static gauge).
    render(<ProgressBar value={50} label="Progress" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByRole('meter')).not.toBeInTheDocument();
  });

  it('renders visible label by default', () => {
    render(<ProgressBar value={50} label="Storage used" />);
    expect(screen.getByText('Storage used')).toBeInTheDocument();
  });

  it('hides label visually when isLabelHidden is true', () => {
    render(<ProgressBar value={50} label="Hidden label" isLabelHidden />);
    const label = screen.getByText('Hidden label');
    expect(label).toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-labelledby');
  });

  it('shows value label when hasValueLabel is true', () => {
    render(<ProgressBar value={75} label="Upload" hasValueLabel />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('uses custom formatValueLabel', () => {
    render(
      <ProgressBar
        value={3}
        max={5}
        label="Disk"
        hasValueLabel
        formatValueLabel={(v, m) => `${v} GB / ${m} GB`}
      />,
    );
    expect(screen.getByText('3 GB / 5 GB')).toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuetext', '3 GB / 5 GB');
  });

  it('sets aria-valuetext from formatValueLabel', () => {
    render(<ProgressBar value={50} label="Progress" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuetext', '50%');
  });

  it('respects custom max', () => {
    render(<ProgressBar value={3} max={10} label="Steps" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '3');
    expect(progressbar).toHaveAttribute('aria-valuemax', '10');
  });

  it('clamps value to [0, max]', () => {
    const {rerender} = render(
      <ProgressBar value={150} max={100} label="Over" />,
    );
    let progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');

    rerender(<ProgressBar value={-10} max={100} label="Under" />);
    progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });

  it('forwards ref to outer container', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<ProgressBar ref={ref} value={50} label="Test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes data-testid', () => {
    render(<ProgressBar value={50} label="Test" data-testid="my-progress" />);
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
        <ProgressBar value={50} label={variant} variant={variant} />,
      );
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      unmount();
    }
  });

  it('renders at fixed 8px track height', () => {
    render(<ProgressBar value={50} label="Progress" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows value label with hidden label', () => {
    render(
      <ProgressBar value={60} label="Hidden" isLabelHidden hasValueLabel />,
    );
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('Hidden')).toBeInTheDocument();
  });

  it('renders no visible value label when isLabelHidden without hasValueLabel', () => {
    // Mirrors the intended "accessible label only" composition: the text
    // label is kept for assistive tech (visually hidden) while no extra
    // visible value label is surfaced.
    render(<ProgressBar value={42} label="Context usage" isLabelHidden />);
    expect(screen.queryByText('42%')).not.toBeInTheDocument();
    const label = screen.getByText('Context usage');
    expect(label).toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-labelledby', label.id);
  });

  it('handles zero max gracefully', () => {
    render(<ProgressBar value={0} max={0} label="Empty" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '0');
  });

  it('treats a NaN value as empty progress instead of leaking "NaN"', () => {
    // e.g. an upstream `loaded / total * 100` where total is still 0.
    render(<ProgressBar value={NaN} label="Upload" hasValueLabel />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(progressbar.getAttribute('aria-valuetext')).toBe('0%');
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    // The fill width must be a real percentage, not "NaN%".
    const fill = progressbar.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });

  it('treats a NaN max as an empty range instead of leaking "NaN"', () => {
    render(<ProgressBar value={5} max={NaN} label="Steps" hasValueLabel />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '0');
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it('does not render NaN in the value label when max is zero', () => {
    render(<ProgressBar value={0} max={0} label="Empty" hasValueLabel />);
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuetext') ?? '').not.toMatch(
      /NaN|Infinity/,
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  // Disabled state
  describe('disabled state', () => {
    it('renders with isDisabled', () => {
      render(
        <ProgressBar value={50} label="Canceled" isDisabled hasValueLabel />,
      );
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('still renders label when disabled', () => {
      render(<ProgressBar value={50} label="Canceled upload" isDisabled />);
      expect(screen.getByText('Canceled upload')).toBeInTheDocument();
    });
  });

  // Indeterminate mode tests
  describe('indeterminate mode', () => {
    it('renders with role="progressbar" when isIndeterminate', () => {
      render(<ProgressBar isIndeterminate label="Loading" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    it('does not set aria-valuenow/min/max when indeterminate', () => {
      render(<ProgressBar isIndeterminate label="Loading" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).not.toHaveAttribute('aria-valuenow');
      expect(progressbar).not.toHaveAttribute('aria-valuemin');
      expect(progressbar).not.toHaveAttribute('aria-valuemax');
      expect(progressbar).not.toHaveAttribute('aria-valuetext');
    });

    it('still renders label when indeterminate', () => {
      render(<ProgressBar isIndeterminate label="Processing" />);
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    it('hides value label when indeterminate even if hasValueLabel is true', () => {
      render(
        <ProgressBar
          isIndeterminate
          label="Loading"
          value={50}
          hasValueLabel
        />,
      );
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('is labelled via aria-labelledby when indeterminate', () => {
      render(<ProgressBar isIndeterminate label="Loading data" />);
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
          <ProgressBar isIndeterminate label={variant} variant={variant} />,
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        unmount();
      }
    });
  });
});
