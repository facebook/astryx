// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Spinner.test.tsx
 * @input Uses vitest, @testing-library/react, Spinner component
 * @output Unit tests for Spinner component behavior
 * @position Testing; validates Spinner.tsx implementation
 *
 * SYNC: When Spinner.tsx changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Spinner} from './Spinner';

describe('Spinner', () => {
  it('renders with default props', () => {
    render(<Spinner data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders with size sm', () => {
    render(<Spinner size="sm" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders with size md', () => {
    render(<Spinner size="md" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders with size lg', () => {
    render(<Spinner size="lg" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders with shade default', () => {
    render(<Spinner shade="default" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders with shade onMedia', () => {
    render(<Spinner shade="onMedia" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders with shade inherit', () => {
    render(<Spinner shade="inherit" data-testid="spinner" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('data-shade', 'inherit');
  });

  it('has role="status"', () => {
    render(<Spinner data-testid="spinner" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-label="Loading" by default', () => {
    render(<Spinner data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toHaveAttribute(
      'aria-label',
      'Loading',
    );
  });

  it('names the status element from the visible string label', () => {
    render(<Spinner label="Fetching data" data-testid="spinner" />);
    expect(screen.getByRole('status')).toHaveAccessibleName('Fetching data');
  });

  it('does not duplicate a visible string label as aria-label', () => {
    render(<Spinner label="Fetching data" data-testid="spinner" />);
    const status = screen.getByRole('status');
    expect(status).not.toHaveAttribute('aria-label');
    expect(status).toHaveAttribute('aria-labelledby');
  });

  it('uses explicit aria-label over string label', () => {
    render(
      <Spinner
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
    render(<Spinner label="Loading..." data-testid="spinner" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders ReactNode label', () => {
    render(
      <Spinner
        label={<span data-testid="custom-label">Custom content</span>}
        aria-label="Loading"
        data-testid="spinner"
      />,
    );
    expect(screen.getByTestId('custom-label')).toBeInTheDocument();
  });

  it('defaults aria-label to "Loading" for ReactNode label without explicit aria-label', () => {
    render(<Spinner label={<span>Rich content</span>} data-testid="spinner" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });

  it('accepts data-testid', () => {
    render(<Spinner data-testid="my-spinner" />);
    expect(screen.getByTestId('my-spinner')).toBeInTheDocument();
  });

  it('renders as an inline element (span)', () => {
    render(<Spinner data-testid="spinner" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner.tagName.toLowerCase()).toBe('span');
  });

  describe('themeable geometry', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;

    for (const size of sizes) {
      it(`exposes the spinner theme target with the ${size} size variant`, () => {
        render(<Spinner size={size} data-testid="spinner" />);
        const spinner = screen.getByTestId('spinner');
        // The theme target rides the painting element and carries the size as
        // both a variant class and data attribute, so a theme can redefine
        // what this named size resolves to via `.astryx-spinner.<size>`.
        expect(spinner.className).toContain('astryx-spinner');
        expect(spinner.className).toContain(size);
        expect(spinner).toHaveAttribute('data-size', size);
      });
    }

    it('applies a distinct geometry-var class per size variant', () => {
      // The per-size StyleX class is what carries the default
      // --_spinner-diameter / --_spinner-rail-width for each named size, so
      // distinct sizes must resolve to distinct classes (otherwise every size
      // would draw the same ring).
      const classNames = new Set<string>();
      for (const size of sizes) {
        const {unmount} = render(<Spinner size={size} data-testid="spinner" />);
        classNames.add(screen.getByTestId('spinner').className);
        unmount();
      }
      expect(classNames.size).toBe(sizes.length);
    });

    it('keeps the theme target on the wrapping element when labeled', () => {
      // With a label the target moves to the wrapping div so the geometry vars
      // set there cascade into the inner canvas span.
      render(<Spinner size="xl" label="Loading" data-testid="spinner" />);
      const root = screen.getByTestId('spinner');
      expect(root.className).toContain('astryx-spinner');
      expect(root).toHaveAttribute('data-size', 'xl');
      expect(root.querySelector('canvas')).not.toBeNull();
    });
  });
});
