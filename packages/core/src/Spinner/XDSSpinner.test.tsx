/**
 * @file XDSSpinner.test.tsx
 * @input Uses vitest, @testing-library/react, XDSSpinner component
 * @output Unit tests for XDSSpinner component behavior
 * @position Testing; validates XDSSpinner.tsx implementation
 *
 * SYNC: When XDSSpinner.tsx changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSSpinner} from './XDSSpinner';

describe('XDSSpinner', () => {
  it('renders with default props', () => {
    render(<XDSSpinner data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders with size sm', () => {
    render(<XDSSpinner size="sm" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders with size md', () => {
    render(<XDSSpinner size="md" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders with size lg', () => {
    render(<XDSSpinner size="lg" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders with shade default', () => {
    render(<XDSSpinner shade="default" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders with shade onMedia', () => {
    render(<XDSSpinner shade="onMedia" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('has role="status"', () => {
    render(<XDSSpinner data-testid="spinner" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-label="Loading"', () => {
    render(<XDSSpinner data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toHaveAttribute(
      'aria-label',
      'Loading',
    );
  });

  it('accepts data-testid', () => {
    render(<XDSSpinner data-testid="my-spinner" />);
    expect(screen.getByTestId('my-spinner')).toBeInTheDocument();
  });

  it('renders as an inline element (span)', () => {
    render(<XDSSpinner data-testid="spinner" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner.tagName.toLowerCase()).toBe('span');
  });
});
