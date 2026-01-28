/**
 * @file XDSIcon.test.tsx
 * @input Uses vitest, @testing-library/react, XDSIcon component
 * @output Unit tests for XDSIcon component behavior
 * @position Testing; validates XDSIcon.tsx implementation
 *
 * SYNC: When XDSIcon.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {HomeIcon} from '@heroicons/react/24/outline';
import {XDSIcon} from './XDSIcon';

describe('XDSIcon', () => {
  it('renders the icon component', () => {
    render(<XDSIcon icon={HomeIcon} data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders as an SVG element', () => {
    render(<XDSIcon icon={HomeIcon} data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon.tagName.toLowerCase()).toBe('svg');
  });

  it('applies aria-hidden by default', () => {
    render(<XDSIcon icon={HomeIcon} data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders with different color variants', () => {
    const {rerender} = render(
      <XDSIcon icon={HomeIcon} color="primary" data-testid="icon" />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<XDSIcon icon={HomeIcon} color="secondary" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<XDSIcon icon={HomeIcon} color="accent" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<XDSIcon icon={HomeIcon} color="positive" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<XDSIcon icon={HomeIcon} color="negative" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<XDSIcon icon={HomeIcon} color="warning" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<XDSIcon icon={HomeIcon} color="inherit" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders with different size variants', () => {
    const {rerender} = render(
      <XDSIcon icon={HomeIcon} size="xsm" data-testid="icon" />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<XDSIcon icon={HomeIcon} size="sm" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<XDSIcon icon={HomeIcon} size="md" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<XDSIcon icon={HomeIcon} size="lg" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<XDSIcon icon={HomeIcon} ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(SVGSVGElement));
  });

  it('passes additional SVG props', () => {
    render(
      <XDSIcon
        icon={HomeIcon}
        data-testid="icon"
        role="img"
        aria-label="Home"
      />
    );
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('role', 'img');
    expect(icon).toHaveAttribute('aria-label', 'Home');
  });

  it('uses default color and size when not specified', () => {
    render(<XDSIcon icon={HomeIcon} data-testid="icon" />);
    // The component should render without errors with defaults
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
