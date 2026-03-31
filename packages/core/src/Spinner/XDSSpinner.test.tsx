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

  it('has aria-label="Loading" by default', () => {
    render(<XDSSpinner data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toHaveAttribute(
      'aria-label',
      'Loading',
    );
  });

  it('uses string label as aria-label automatically', () => {
    render(<XDSSpinner label="Fetching data" data-testid="spinner" />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Fetching data',
    );
  });

  it('uses explicit aria-label over string label', () => {
    render(
      <XDSSpinner
        label="Loading..."
        aria-label="Please wait"
        data-testid="spinner"
      />,
    );
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Please wait',
    );
  });

  it('renders label content below the spinner', () => {
    render(<XDSSpinner label="Loading..." data-testid="spinner" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders ReactNode label', () => {
    render(
      <XDSSpinner
        label={<span data-testid="custom-label">Custom content</span>}
        aria-label="Loading"
        data-testid="spinner"
      />,
    );
    expect(screen.getByTestId('custom-label')).toBeInTheDocument();
  });

  it('defaults aria-label to "Loading" for ReactNode label without explicit aria-label', () => {
    render(
      <XDSSpinner label={<span>Rich content</span>} data-testid="spinner" />,
    );
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
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
