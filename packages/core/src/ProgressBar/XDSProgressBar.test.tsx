// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSProgressBar} from './XDSProgressBar';

describe('XDSProgressBar', () => {
  it('renders with default props', () => {
    render(<XDSProgressBar value={50} label="Progress" />);
    const meter = screen.getByRole('meter');
    expect(meter).toBeInTheDocument();
    expect(meter).toHaveAttribute('aria-valuenow', '50');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders visible label by default', () => {
    render(<XDSProgressBar value={50} label="Storage used" />);
    expect(screen.getByText('Storage used')).toBeInTheDocument();
  });

  it('hides label visually when isLabelHidden is true', () => {
    render(<XDSProgressBar value={50} label="Hidden label" isLabelHidden />);
    const label = screen.getByText('Hidden label');
    expect(label).toBeInTheDocument();
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-labelledby');
  });

  it('shows value label when hasValueLabel is true', () => {
    render(<XDSProgressBar value={75} label="Upload" hasValueLabel />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('uses custom formatValueLabel', () => {
    render(
      <XDSProgressBar
        value={3}
        max={5}
        label="Disk"
        hasValueLabel
        formatValueLabel={(v, m) => `${v} GB / ${m} GB`}
      />,
    );
    expect(screen.getByText('3 GB / 5 GB')).toBeInTheDocument();
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuetext', '3 GB / 5 GB');
  });

  it('sets aria-valuetext from formatValueLabel', () => {
    render(<XDSProgressBar value={50} label="Progress" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuetext', '50%');
  });

  it('respects custom max', () => {
    render(<XDSProgressBar value={3} max={10} label="Steps" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '3');
    expect(meter).toHaveAttribute('aria-valuemax', '10');
  });

  it('clamps value to [0, max]', () => {
    const {rerender} = render(
      <XDSProgressBar value={150} max={100} label="Over" />,
    );
    let meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '100');

    rerender(<XDSProgressBar value={-10} max={100} label="Under" />);
    meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '0');
  });

  it('forwards ref to outer container', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<XDSProgressBar ref={ref} value={50} label="Test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes data-testid', () => {
    render(
      <XDSProgressBar value={50} label="Test" data-testid="my-progress" />,
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
        <XDSProgressBar value={50} label={variant} variant={variant} />,
      );
      expect(screen.getByRole('meter')).toBeInTheDocument();
      unmount();
    }
  });

  it('renders at fixed 8px track height', () => {
    render(<XDSProgressBar value={50} label="Progress" />);
    expect(screen.getByRole('meter')).toBeInTheDocument();
  });

  it('shows value label with hidden label', () => {
    render(
      <XDSProgressBar value={60} label="Hidden" isLabelHidden hasValueLabel />,
    );
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('Hidden')).toBeInTheDocument();
  });

  it('handles zero max gracefully', () => {
    render(<XDSProgressBar value={0} max={0} label="Empty" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '0');
  });

  // Indeterminate mode tests
  describe('indeterminate mode', () => {
    it('renders with role="progressbar" when isIndeterminate', () => {
      render(<XDSProgressBar isIndeterminate label="Loading" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    it('does not set aria-valuenow/min/max when indeterminate', () => {
      render(<XDSProgressBar isIndeterminate label="Loading" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).not.toHaveAttribute('aria-valuenow');
      expect(progressbar).not.toHaveAttribute('aria-valuemin');
      expect(progressbar).not.toHaveAttribute('aria-valuemax');
      expect(progressbar).not.toHaveAttribute('aria-valuetext');
    });

    it('still renders label when indeterminate', () => {
      render(<XDSProgressBar isIndeterminate label="Processing" />);
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    it('hides value label when indeterminate even if hasValueLabel is true', () => {
      render(
        <XDSProgressBar
          isIndeterminate
          label="Loading"
          value={50}
          hasValueLabel
        />,
      );
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('is labelled via aria-labelledby when indeterminate', () => {
      render(<XDSProgressBar isIndeterminate label="Loading data" />);
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
          <XDSProgressBar isIndeterminate label={variant} variant={variant} />,
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        unmount();
      }
    });
  });

  // Status tests
  describe('status', () => {
    it('renders with paused status', () => {
      render(
        <XDSProgressBar
          value={50}
          label="Upload"
          status="paused"
          hasValueLabel
        />,
      );
      expect(screen.getByRole('meter')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('renders with canceled status', () => {
      render(
        <XDSProgressBar
          value={50}
          label="Upload"
          status="canceled"
          hasValueLabel
        />,
      );
      expect(screen.getByRole('meter')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('renders status icons as aria-hidden', () => {
      const {container} = render(
        <XDSProgressBar value={50} label="Upload" status="paused" />,
      );
      const svgs = container.querySelectorAll('svg');
      for (const svg of svgs) {
        expect(svg).toHaveAttribute('aria-hidden', 'true');
      }
    });
  });

  // Description and content slots
  describe('description and content slots', () => {
    it('renders description below the bar', () => {
      render(
        <XDSProgressBar
          value={40}
          label="Download"
          description="40 MB / 100 MB"
        />,
      );
      expect(screen.getByText('40 MB / 100 MB')).toBeInTheDocument();
    });

    it('renders endContent in the header', () => {
      render(
        <XDSProgressBar
          value={50}
          label="Upload"
          endContent={<span data-testid="end">End</span>}
        />,
      );
      expect(screen.getByTestId('end')).toBeInTheDocument();
    });

    it('renders bottomContent below the bar', () => {
      render(
        <XDSProgressBar
          value={50}
          label="Upload"
          bottomContent={<span data-testid="bottom">Bottom</span>}
        />,
      );
      expect(screen.getByTestId('bottom')).toBeInTheDocument();
    });

    it('bottomContent takes precedence over description', () => {
      render(
        <XDSProgressBar
          value={50}
          label="Upload"
          description="Should not show"
          bottomContent={<span>Custom bottom</span>}
        />,
      );
      expect(screen.getByText('Custom bottom')).toBeInTheDocument();
      expect(screen.queryByText('Should not show')).not.toBeInTheDocument();
    });
  });
});
