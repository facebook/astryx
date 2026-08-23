// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {CircularProgress} from './CircularProgress';

describe('CircularProgress', () => {
  it('renders with default props', () => {
    render(<CircularProgress value={50} label="Progress" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('uses role="progressbar" (not "meter") for determinate progress', () => {
    // progressbar covers both determinate and indeterminate progress of a
    // task; meter describes a static measurement within a known range.
    // Matches core ProgressBar so both progress primitives announce alike.
    render(<CircularProgress value={50} label="Progress" />);
    expect(screen.queryByRole('meter')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders an empty determinate ring when value is omitted', () => {
    // Parity with core ProgressBar: value defaults to 0 and indeterminate
    // mode is opt-in via isIndeterminate, never implied by an omitted value.
    render(<CircularProgress label="Progress" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders label as visually hidden by default', () => {
    render(<CircularProgress value={50} label="Upload progress" />);
    expect(screen.getByText('Upload progress')).toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-labelledby');
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
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-labelledby');
  });

  it('links the label to the progressbar via aria-labelledby', () => {
    render(<CircularProgress value={50} label="Upload progress" />);
    const label = screen.getByText('Upload progress');
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-labelledby')).toBe(label.id);
  });

  it('respects custom max', () => {
    render(<CircularProgress value={3} max={10} label="Steps" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '3');
    expect(progressbar).toHaveAttribute('aria-valuemax', '10');
  });

  it('clamps value to [0, max]', () => {
    const {rerender} = render(
      <CircularProgress value={150} max={100} label="Over" />,
    );
    let progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');

    rerender(<CircularProgress value={-10} max={100} label="Under" />);
    progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });

  it('sets aria-valuetext from formatValueLabel', () => {
    render(<CircularProgress value={50} label="Progress" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuetext', '50%');
  });

  it('shows the formatted value in the ring center when hasValueLabel', () => {
    render(<CircularProgress value={75} label="Progress" hasValueLabel />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('uses custom formatValueLabel', () => {
    render(
      <CircularProgress
        value={3}
        max={10}
        label="Steps"
        hasValueLabel
        formatValueLabel={(value, max) => `${value} of ${max}`}
      />,
    );
    expect(screen.getByText('3 of 10')).toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuetext', '3 of 10');
  });

  it('lets children take precedence over the value label', () => {
    render(
      <CircularProgress value={75} label="Progress" hasValueLabel>
        Almost there
      </CircularProgress>,
    );
    expect(screen.getByText('Almost there')).toBeInTheDocument();
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
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
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      unmount();
    }
  });

  it('renders with all size options', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    for (const size of sizes) {
      const {unmount} = render(
        <CircularProgress value={50} label={size} size={size} />,
      );
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      unmount();
    }
  });

  it('sets ring geometry from size', () => {
    const {container} = render(
      <CircularProgress value={50} size="md" label="Progress" />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '48');
    expect(svg).toHaveAttribute('height', '48');
    expect(svg).toHaveAttribute('viewBox', '0 0 48 48');
    // radius = (diameter - strokeWidth) / 2 = (48 - 4) / 2
    for (const circle of container.querySelectorAll('circle')) {
      expect(circle).toHaveAttribute('r', '22');
      expect(circle).toHaveAttribute('stroke-width', '4');
    }
  });

  it('computes stroke-dashoffset from value', () => {
    const {container} = render(
      <CircularProgress value={25} max={100} size="md" label="Progress" />,
    );
    // circumference = 2π * 22 ≈ 138.23; offset = circumference * (1 - 0.25)
    const fill = container.querySelector('.astryx-circular-progress-fill');
    expect(fill).not.toBeNull();
    expect(
      parseFloat(fill!.getAttribute('stroke-dasharray') ?? ''),
    ).toBeCloseTo(138.23, 1);
    expect(
      parseFloat(fill!.getAttribute('stroke-dashoffset') ?? ''),
    ).toBeCloseTo(103.67, 1);
  });

  it('handles zero max gracefully', () => {
    render(<CircularProgress value={0} max={0} label="Empty" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '0');
  });

  it('treats a NaN value as empty progress instead of leaking "NaN"', () => {
    render(
      <CircularProgress value={NaN} label="Broken upload" hasValueLabel />,
    );
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });

  it('treats a NaN max as an empty range instead of leaking "NaN"', () => {
    render(
      <CircularProgress value={50} max={NaN} label="Broken" hasValueLabel />,
    );
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '0');
  });

  it('does not render NaN in the value label when max is zero', () => {
    render(<CircularProgress value={5} max={0} label="Empty" hasValueLabel />);
    const progressbar = screen.getByRole('progressbar');
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
    expect(progressbar.getAttribute('aria-valuetext') ?? '').not.toMatch(
      /NaN|Infinity/,
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  describe('disabled state', () => {
    it('swaps the fill to the disabled variant', () => {
      const {container} = render(
        <CircularProgress value={50} label="Canceled" isDisabled />,
      );
      const fill = container.querySelector('.astryx-circular-progress-fill');
      expect(fill).toHaveAttribute('data-variant', 'disabled');
      // The root keeps the original variant for theme targeting.
      const root = container.querySelector('.astryx-circular-progress');
      expect(root).toHaveAttribute('data-variant', 'accent');
    });

    it('still renders label and value label when disabled', () => {
      render(
        <CircularProgress
          value={50}
          label="Canceled"
          isDisabled
          hasValueLabel
          isLabelHidden={false}
        />,
      );
      expect(screen.getByText('Canceled')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('indeterminate mode', () => {
    it('renders indeterminate when isIndeterminate is true', () => {
      render(<CircularProgress isIndeterminate value={50} label="Loading" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
      expect(progressbar).not.toHaveAttribute('aria-valuenow');
      expect(progressbar).not.toHaveAttribute('aria-valuemin');
      expect(progressbar).not.toHaveAttribute('aria-valuemax');
    });

    it('does not set aria-valuetext when indeterminate', () => {
      render(<CircularProgress isIndeterminate label="Loading" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).not.toHaveAttribute('aria-valuetext');
    });

    it('is labelled via aria-labelledby when indeterminate', () => {
      render(<CircularProgress isIndeterminate label="Loading data" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-labelledby');
    });

    it('suppresses the value label when indeterminate', () => {
      render(
        <CircularProgress
          isIndeterminate
          value={50}
          label="Loading"
          hasValueLabel
        />,
      );
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
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
          <CircularProgress
            isIndeterminate
            label={variant}
            variant={variant}
          />,
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        unmount();
      }
    });

    it('renders with all sizes in indeterminate mode', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      for (const size of sizes) {
        const {unmount} = render(
          <CircularProgress isIndeterminate label={size} size={size} />,
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        unmount();
      }
    });

    it('renders children alongside indeterminate animation', () => {
      render(
        <CircularProgress isIndeterminate label="Loading">
          ...
        </CircularProgress>,
      );
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });
});
