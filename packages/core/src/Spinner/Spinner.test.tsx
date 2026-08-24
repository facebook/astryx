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
import {defineTheme} from '../theme/defineTheme';
import {generateThemeCSS} from '../theme/generateThemeRules';

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

  // The ring is painted on a canvas: jsdom implements neither the 2d context
  // nor layout, so no test here can reach what is drawn — that is verified in
  // a browser, and the numbers are in the PR. What IS a contract a unit test
  // can hold is the routing: a theme writes an override against the documented
  // key, and it has to come out on the selector the component reads from.
  // The fallback half of the geometry lives in resolveRingGeometry.test.ts.
  describe('a theme reaches the spinner through its public vars', () => {
    const cssFor = (
      components: Parameters<typeof defineTheme>[0]['components'],
    ) =>
      generateThemeCSS(defineTheme({name: 'spinner-theming', components}))
        .component;

    it('scopes a themed size to that size variant', () => {
      // Asserting the whole rule, not just the declaration: the same var on
      // the bare `.astryx-spinner` would resize every size at once, which is
      // the bug a size-variant key exists to avoid.
      expect(
        cssFor({spinner: {'size:xl': {'--spinner-diameter': '2.5rem'}}}),
      ).toContain('.astryx-spinner.xl {\n    --spinner-diameter: 2.5rem;');
    });

    it('scopes a themed color to that shade variant', () => {
      expect(
        cssFor({
          spinner: {'shade:subtle': {'--spinner-track-color': 'transparent'}},
        }),
      ).toContain(
        '.astryx-spinner.subtle {\n    --spinner-track-color: transparent;',
      );
    });

    it('lets the base target set a value for every size and shade', () => {
      expect(
        cssFor({spinner: {base: {'--spinner-color': 'var(--color-brand)'}}}),
      ).toContain(
        '.astryx-spinner {\n    --spinner-color: var(--color-brand);',
      );
    });
  });
});
