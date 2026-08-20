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

  // The ring is painted on a canvas, which jsdom does not implement (no 2d
  // context, no layout, no CSS.registerProperty). What jsdom CAN see is the
  // wiring these tests are about: which element declares each public var, and
  // which default each named size and shade resolves to. The drawn result is
  // covered in a browser — see the PR's Chromium run.
  describe('themeable geometry and color', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;
    const shades = ['default', 'onMedia', 'subtle', 'inherit'] as const;

    const parts = (container: HTMLElement) => {
      const canvas = container.querySelector('canvas') as HTMLCanvasElement;
      return {canvas, box: canvas.parentElement as HTMLElement};
    };

    it.each([
      ['sm', '10px', '2px'],
      ['md', '14px', '3px'],
      ['lg', '18px', '3px'],
      ['xl', '28px', '4px'],
    ])(
      'resolves size %s to a %s ring with a %s rail',
      (size, diameter, rail) => {
        // These are the values a theme overrides. If a size stopped declaring
        // them the ring would fall back to the built-in constant and a themed
        // size would silently do nothing.
        const {container} = render(
          <Spinner size={size as (typeof sizes)[number]} />,
        );
        const {box} = parts(container);
        const style = getComputedStyle(box);
        expect(style.getPropertyValue('--spinner-diameter')).toBe(diameter);
        expect(style.getPropertyValue('--spinner-rail-width')).toBe(rail);
      },
    );

    it('sizes the box from the same vars the ring is drawn from', () => {
      // The box being CSS-derived from the vars is what keeps it in step with
      // the ring, and is what the ResizeObserver watches to catch a themed
      // value changing after mount.
      const {container} = render(<Spinner />);
      expect(getComputedStyle(parts(container).box).width).toBe(
        'calc(var(--spinner-diameter) + var(--spinner-rail-width) * 2)',
      );
    });

    it.each([
      ['default', 'var(--color-accent)', 'var(--color-track)'],
      ['subtle', 'var(--color-text-secondary)', 'var(--color-track)'],
      ['onMedia', 'var(--color-on-dark)', 'var(--color-on-dark)'],
      ['inherit', 'currentColor', 'currentColor'],
    ])('resolves shade %s to %s over %s', (shade, arc, track) => {
      // Each color rides a real `color` property — the canvas for the arc, the
      // box for the track — so the browser resolves var()/color-mix()/
      // currentColor before the canvas is asked to stroke with it. The theme
      // var is the override and the shade's token is the fallback.
      const {container} = render(
        <Spinner shade={shade as (typeof shades)[number]} />,
      );
      const {canvas, box} = parts(container);
      expect(getComputedStyle(canvas).color).toBe(
        `var(--spinner-color,${arc})`,
      );
      expect(getComputedStyle(box).color).toBe(
        `var(--spinner-track-color,${track})`,
      );
    });

    it('keeps every public var free of the private prefix', () => {
      // `astryx theme build` REFUSES a theme that sets a `--_*` var, so a
      // themeable var has to be public to be reachable at all. This is the
      // cheap half of that guard; build.public-component-vars.test.mjs runs
      // the real validator over the documented snippet.
      const {container} = render(<Spinner size="xl" />);
      const {canvas, box} = parts(container);
      const declared = [
        getComputedStyle(box).cssText,
        getComputedStyle(canvas).cssText,
        getComputedStyle(box).color,
        getComputedStyle(canvas).color,
      ].join(' ');
      expect(declared).not.toContain('--_spinner');
    });

    it('moves the geometry vars to the wrapper when labeled, keeping the colors inside', () => {
      // With a label the theme target is the wrapping div, so the geometry
      // defaults go there for a themed value to override; the two color
      // channels stay on the box and canvas, which is what the draw reads.
      render(
        <Spinner
          size="xl"
          shade="subtle"
          label="Loading"
          data-testid="spinner"
        />,
      );
      const root = screen.getByTestId('spinner');
      expect(root.className).toContain('astryx-spinner');
      expect(
        getComputedStyle(root).getPropertyValue('--spinner-diameter'),
      ).toBe('28px');

      const canvas = root.querySelector('canvas') as HTMLCanvasElement;
      expect(getComputedStyle(canvas).color).toBe(
        'var(--spinner-color,var(--color-text-secondary))',
      );
      expect(getComputedStyle(canvas.parentElement as HTMLElement).color).toBe(
        'var(--spinner-track-color,var(--color-track))',
      );
    });

    it.each(sizes)(
      'carries the size variant on the theme target (%s)',
      size => {
        render(<Spinner size={size} data-testid="spinner" />);
        const spinner = screen.getByTestId('spinner');
        expect(spinner.className).toContain('astryx-spinner');
        expect(spinner).toHaveAttribute('data-size', size);
      },
    );

    it.each(shades)(
      'carries the shade variant on the theme target (%s)',
      shade => {
        render(<Spinner shade={shade} data-testid="spinner" />);
        expect(screen.getByTestId('spinner')).toHaveAttribute(
          'data-shade',
          shade,
        );
      },
    );
  });

  describe('a theme reaches the spinner through the public vars', () => {
    // jsdom cannot resolve the cascade, so the generated CSS is the proof that
    // a theme's override lands on the target the component reads from.
    const cssFor = (
      components: Parameters<typeof defineTheme>[0]['components'],
    ) => {
      const {prose, component} = generateThemeCSS(
        defineTheme({name: 'spinner-theming-test', components}),
      );
      return [prose, component].filter(Boolean).join('\n\n');
    };

    it('routes a themed size onto the size variant', () => {
      const css = cssFor({
        spinner: {
          'size:xl': {
            '--spinner-diameter': '2.5rem',
            '--spinner-rail-width': '0.375rem',
          },
        },
      });
      expect(css).toContain('--spinner-diameter: 2.5rem');
      expect(css).toContain('--spinner-rail-width: 0.375rem');
    });

    it('routes a themed color onto the shade variant', () => {
      const css = cssFor({
        spinner: {
          'shade:subtle': {'--spinner-track-color': 'transparent'},
          base: {'--spinner-color': 'var(--color-brand)'},
        },
      });
      expect(css).toContain('--spinner-track-color: transparent');
      expect(css).toContain('--spinner-color: var(--color-brand)');
    });
  });
});
