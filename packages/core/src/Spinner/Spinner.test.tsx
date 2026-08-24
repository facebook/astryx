// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Spinner.test.tsx
 * @input Uses vitest, @testing-library/react, Spinner component
 * @output Unit tests for Spinner component behavior
 * @position Testing; validates Spinner.tsx implementation
 *
 * SYNC: When Spinner.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Spinner} from './Spinner';

/** sm/md/lg/xl, as Spinner.tsx defines them. */
const SIZES = {
  sm: {diameter: 10, border: 2},
  md: {diameter: 14, border: 3},
  lg: {diameter: 18, border: 3},
  xl: {diameter: 28, border: 4},
} as const;

const ring = (testId = 'spinner') =>
  screen.getByTestId(testId).querySelector('svg') as SVGSVGElement;

const circles = (testId = 'spinner') => {
  const [track, arc] = [...ring(testId).querySelectorAll('circle')];
  return {track, arc};
};

const dashOf = (el: SVGCircleElement) =>
  (el.getAttribute('stroke-dasharray') ?? '').split(/[\s,]+/).map(Number);

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
});

describe('Spinner ring', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('draws the ring in SVG', () => {
    render(<Spinner data-testid="spinner" />);
    const svg = ring();
    expect(svg).not.toBeNull();
    expect(svg.querySelectorAll('circle')).toHaveLength(2);
    expect(screen.getByTestId('spinner').querySelector('canvas')).toBeNull();
  });

  it.each(Object.entries(SIZES))(
    'sizes the %s ring from its size token',
    (size, {diameter, border}) => {
      render(
        <Spinner size={size as keyof typeof SIZES} data-testid="spinner" />,
      );
      const frame = diameter + border * 2;
      const svg = ring();
      expect(svg.getAttribute('viewBox')).toBe(`0 0 ${frame} ${frame}`);
      for (const c of [circles().track, circles().arc]) {
        expect(Number(c.getAttribute('cx'))).toBe(frame / 2);
        expect(Number(c.getAttribute('cy'))).toBe(frame / 2);
        expect(Number(c.getAttribute('r'))).toBe(diameter / 2);
        expect(Number(c.getAttribute('stroke-width'))).toBe(border);
      }
    },
  );

  // The canvas ring swept 135deg, not the 270deg its SPREAD comment claimed.
  it.each(Object.entries(SIZES))(
    'sweeps 135 degrees at %s',
    (size, {diameter}) => {
      render(
        <Spinner size={size as keyof typeof SIZES} data-testid="spinner" />,
      );
      const {track, arc} = circles();
      const [on, off] = dashOf(arc);
      expect(on + off).toBeCloseTo(Math.PI * diameter, 6);
      expect((on / (on + off)) * 360).toBeCloseTo(135, 6);
      expect(track.getAttribute('stroke-dasharray')).toBeNull();
    },
  );

  it('starts the arc at twelve o’clock', () => {
    render(<Spinner data-testid="spinner" />);
    const frame = SIZES.md.diameter + SIZES.md.border * 2;
    expect(circles().arc.getAttribute('transform')).toBe(
      `rotate(-90 ${frame / 2} ${frame / 2})`,
    );
  });

  // The whole point of the SVG ring: the colours come off the cascade, so
  // nothing has to resolve them in JS. A read reaching the paint path again
  // fails here.
  it.each(['default', 'subtle', 'onMedia', 'inherit'] as const)(
    'reads no computed style to paint the %s shade',
    shade => {
      const spy = vi.spyOn(window, 'getComputedStyle');
      render(<Spinner shade={shade} data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      const onSpinner = spy.mock.calls.filter(
        ([el]) => el instanceof Element && spinner.contains(el),
      );
      expect(onSpinner).toEqual([]);
    },
  );

  it('schedules no frame where the Web Animations API is absent', () => {
    expect(SVGElement.prototype).not.toHaveProperty('getAnimations');
    const raf = vi.spyOn(window, 'requestAnimationFrame');
    render(<Spinner data-testid="spinner" />);
    expect(ring()).not.toBeNull();
    expect(raf).not.toHaveBeenCalled();
  });

  it('pins every ring to the timeline origin in a single frame', () => {
    const animations: {startTime: number | null}[] = [];
    const getAnimations = vi.fn(function (this: SVGElement) {
      const a = {startTime: null as number | null};
      animations.push(a);
      return [a];
    });
    Object.defineProperty(SVGElement.prototype, 'getAnimations', {
      value: getAnimations,
      configurable: true,
      writable: true,
    });
    const frames: FrameRequestCallback[] = [];
    const raf = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(cb => {
        frames.push(cb);
        return frames.length;
      });
    const computed = vi.spyOn(window, 'getComputedStyle');

    try {
      const {container} = render(
        <>
          {Array.from({length: 5}, (_, i) => (
            <Spinner key={i} />
          ))}
        </>,
      );
      // One frame for five spinners: the reads are batched, so no mount
      // re-forces what the previous mount invalidated.
      expect(raf).toHaveBeenCalledTimes(1);
      frames.forEach(cb => cb(0));
      expect(animations).toHaveLength(5);
      expect(animations.every(a => a.startTime === 0)).toBe(true);
      // The pin runs on the branch the other shade cases cannot reach, so the
      // no-read assertion is made here too.
      expect(
        computed.mock.calls.filter(
          ([el]) => el instanceof Element && container.contains(el),
        ),
      ).toEqual([]);
    } finally {
      // @ts-expect-error — removing the stub restores jsdom's real surface
      delete SVGElement.prototype.getAnimations;
    }
  });
});
