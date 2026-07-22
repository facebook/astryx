// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Icon.test.tsx
 * @input Uses vitest, @testing-library/react, Icon component
 * @output Unit tests for Icon component behavior
 * @position Testing; validates Icon.tsx implementation
 *
 * SYNC: When Icon.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {TestIcon} from '../__tests__/TestIcon';
import {Icon} from './Icon';

describe('Icon', () => {
  it('renders the icon component', () => {
    render(<Icon icon={TestIcon} data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders as an SVG element', () => {
    render(<Icon icon={TestIcon} data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon.tagName.toLowerCase()).toBe('svg');
  });

  it('applies aria-hidden by default', () => {
    render(<Icon icon={TestIcon} data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders with different color variants', () => {
    const {rerender} = render(
      <Icon icon={TestIcon} color="primary" data-testid="icon" />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<Icon icon={TestIcon} color="secondary" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<Icon icon={TestIcon} color="accent" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<Icon icon={TestIcon} color="success" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<Icon icon={TestIcon} color="error" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<Icon icon={TestIcon} color="warning" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<Icon icon={TestIcon} color="inherit" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders with non-semantic color variants', () => {
    const nonSemanticColors = [
      'blue',
      'red',
      'green',
      'gray',
      'cyan',
      'teal',
      'yellow',
      'orange',
      'pink',
      'purple',
    ] as const;
    const {rerender} = render(
      <Icon icon={TestIcon} color={nonSemanticColors[0]} data-testid="icon" />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    for (const c of nonSemanticColors.slice(1)) {
      rerender(<Icon icon={TestIcon} color={c} data-testid="icon" />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    }
  });

  it('renders with different size variants', () => {
    const {rerender} = render(
      <Icon icon={TestIcon} size="xsm" data-testid="icon" />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<Icon icon={TestIcon} size="sm" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<Icon icon={TestIcon} size="md" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();

    rerender(<Icon icon={TestIcon} size="lg" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('sizes component-mode icons in rem so they scale with root font-size', () => {
    const sizes = {
      xsm: '0.75rem',
      sm: '1rem',
      md: '1.25rem',
      lg: '1.5rem',
    } as const;
    for (const [size, expected] of Object.entries(sizes)) {
      const {unmount} = render(
        <Icon
          icon={TestIcon}
          size={size as keyof typeof sizes}
          data-testid="icon"
        />,
      );
      const style = getComputedStyle(screen.getByTestId('icon'));
      expect(style.width).toBe(expected);
      expect(style.height).toBe(expected);
      unmount();
    }
  });

  it('sizes registry (string-mode) icons in rem, including fontSize', () => {
    const sizes = {
      xsm: '0.75rem',
      sm: '1rem',
      md: '1.25rem',
      lg: '1.5rem',
    } as const;
    for (const [size, expected] of Object.entries(sizes)) {
      const {unmount} = render(
        <Icon
          icon="check"
          size={size as keyof typeof sizes}
          data-testid="icon"
        />,
      );
      const style = getComputedStyle(screen.getByTestId('icon'));
      expect(style.width).toBe(expected);
      expect(style.height).toBe(expected);
      // fontSize is expressed in rem so 1em-based registry icons scale too.
      expect(style.fontSize).toBe(expected);
      unmount();
    }
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Icon icon={TestIcon} ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(SVGSVGElement));
  });

  it('passes additional SVG props', () => {
    render(
      <Icon icon={TestIcon} data-testid="icon" role="img" aria-label="Home" />,
    );
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('role', 'img');
    expect(icon).toHaveAttribute('aria-label', 'Home');
  });

  it('uses default color and size when not specified', () => {
    render(<Icon icon={TestIcon} data-testid="icon" />);
    // The component should render without errors with defaults
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('applies aria-hidden by default in string (registry) mode', () => {
    render(<Icon icon="check" data-testid="icon" />);
    expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('lets a string-mode icon be made meaningful by overriding aria-hidden', () => {
    render(
      <Icon
        icon="check"
        data-testid="icon"
        role="img"
        aria-label="Done"
        aria-hidden={false}
      />,
    );
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('role', 'img');
    expect(icon).toHaveAttribute('aria-label', 'Done');
    expect(icon).toHaveAttribute('aria-hidden', 'false');
  });
});
