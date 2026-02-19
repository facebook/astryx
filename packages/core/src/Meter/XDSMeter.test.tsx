import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSMeter} from './XDSMeter';

describe('XDSMeter', () => {
  it('renders with default props', () => {
    render(<XDSMeter value={50} label="Progress" />);
    const meter = screen.getByRole('meter');
    expect(meter).toBeInTheDocument();
    expect(meter).toHaveAttribute('aria-valuenow', '50');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders visible label by default', () => {
    render(<XDSMeter value={50} label="Storage used" />);
    expect(screen.getByText('Storage used')).toBeInTheDocument();
  });

  it('hides label visually when isLabelHidden is true', () => {
    render(<XDSMeter value={50} label="Hidden label" isLabelHidden />);
    // Label should still be in the DOM for a11y
    const label = screen.getByText('Hidden label');
    expect(label).toBeInTheDocument();
    // The meter should still be labelled
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-labelledby');
  });

  it('shows value label when hasValueLabel is true', () => {
    render(<XDSMeter value={75} label="Upload" hasValueLabel />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('uses custom formatValueLabel', () => {
    render(
      <XDSMeter
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
    render(<XDSMeter value={50} label="Progress" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuetext', '50%');
  });

  it('respects custom max', () => {
    render(<XDSMeter value={3} max={10} label="Steps" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '3');
    expect(meter).toHaveAttribute('aria-valuemax', '10');
  });

  it('clamps value to [0, max]', () => {
    const {rerender} = render(<XDSMeter value={150} max={100} label="Over" />);
    let meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '100');

    rerender(<XDSMeter value={-10} max={100} label="Under" />);
    meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '0');
  });

  it('forwards ref to outer container', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<XDSMeter ref={ref} value={50} label="Test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes data-testid', () => {
    render(<XDSMeter value={50} label="Test" data-testid="my-meter" />);
    expect(screen.getByTestId('my-meter')).toBeInTheDocument();
  });

  it('renders with all variant options', () => {
    const variants = ['accent', 'positive', 'warning', 'negative'] as const;
    for (const variant of variants) {
      const {unmount} = render(
        <XDSMeter value={50} label={variant} variant={variant} />,
      );
      expect(screen.getByRole('meter')).toBeInTheDocument();
      unmount();
    }
  });

  it('renders with all size options', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    for (const size of sizes) {
      const {unmount} = render(
        <XDSMeter value={50} label={size} size={size} />,
      );
      expect(screen.getByRole('meter')).toBeInTheDocument();
      unmount();
    }
  });

  it('shows value label with hidden label', () => {
    render(<XDSMeter value={60} label="Hidden" isLabelHidden hasValueLabel />);
    expect(screen.getByText('60%')).toBeInTheDocument();
    // Label is still in DOM for a11y
    expect(screen.getByText('Hidden')).toBeInTheDocument();
  });

  it('handles zero max gracefully', () => {
    render(<XDSMeter value={0} max={0} label="Empty" />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '0');
  });
});
