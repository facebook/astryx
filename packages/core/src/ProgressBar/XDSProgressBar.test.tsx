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
    // Label should still be in the DOM for a11y
    const label = screen.getByText('Hidden label');
    expect(label).toBeInTheDocument();
    // The meter should still be labelled
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
    const variants = ['accent', 'positive', 'warning', 'negative'] as const;
    for (const variant of variants) {
      const {unmount} = render(
        <XDSProgressBar value={50} label={variant} variant={variant} />,
      );
      expect(screen.getByRole('meter')).toBeInTheDocument();
      unmount();
    }
  });

  it('renders with all size options', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    for (const size of sizes) {
      const {unmount} = render(
        <XDSProgressBar value={50} label={size} size={size} />,
      );
      expect(screen.getByRole('meter')).toBeInTheDocument();
      unmount();
    }
  });

  it('shows value label with hidden label', () => {
    render(
      <XDSProgressBar value={60} label="Hidden" isLabelHidden hasValueLabel />,
    );
    expect(screen.getByText('60%')).toBeInTheDocument();
    // Label is still in DOM for a11y
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
      const variants = ['accent', 'positive', 'warning', 'negative'] as const;
      for (const variant of variants) {
        const {unmount} = render(
          <XDSProgressBar isIndeterminate label={variant} variant={variant} />,
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        unmount();
      }
    });
  });
});
