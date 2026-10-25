// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {CircularProgress, INDETERMINATE} from './CircularProgress';

/** A CSS cubic-bezier timing function: output progress for an input time. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, u: number) =>
    3 * (1 - u) * (1 - u) * u * a + 3 * (1 - u) * u * u * b + u * u * u;
  return (t: number) => {
    let low = 0;
    let high = 1;
    for (let i = 0; i < 50; i += 1) {
      const mid = (low + high) / 2;
      if (at(x1, x2, mid) < t) {
        low = mid;
      } else {
        high = mid;
      }
    }
    return at(y1, y2, (low + high) / 2);
  };
}

/** The values an element's own class rules set outside any at-rule. */
function topLevelValues(element: Element, property: string): string[] {
  const out: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from(sheet.cssRules)) {
      if (
        rule instanceof CSSStyleRule &&
        Array.from(element.classList).some(c =>
          rule.selectorText.includes(`.${c}`),
        )
      ) {
        const value = rule.style.getPropertyValue(property);
        if (value !== '') {
          out.push(value);
        }
      }
    }
  }
  return out;
}

interface Frame {
  offset: number;
  transform?: number;
  opacity?: number;
  easing?: (t: number) => number;
}

/** A named @keyframes rule's frames, in order. */
function keyframesOf(name: string): Frame[] {
  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from(sheet.cssRules)) {
      // A CSSKeyframesRule (jsdom names no such global; type 7 is its own).
      // jsdom lowercases an animation-name it parses, not the rule's name.
      const keyframes = rule as CSSRule & {
        name?: string;
        cssRules?: CSSRuleList;
      };
      if (
        keyframes.type === 7 &&
        keyframes.name?.toLowerCase() === name.toLowerCase() &&
        keyframes.cssRules
      ) {
        return Array.from(keyframes.cssRules)
          .map(r => {
            const frame = r as CSSKeyframeRule;
            const offset =
              frame.keyText === 'from'
                ? 0
                : frame.keyText === 'to'
                  ? 1
                  : Number.parseFloat(frame.keyText) / 100;
            const transform = frame.style.getPropertyValue('transform');
            const opacity = frame.style.getPropertyValue('opacity');
            const easing = frame.style.getPropertyValue(
              'animation-timing-function',
            );
            const bezier = /cubic-bezier\(([^)]*)\)/.exec(easing);
            return {
              offset,
              transform:
                transform === ''
                  ? undefined
                  : Number(/rotate\(([-\d.]+)deg\)/.exec(transform)?.[1]),
              opacity: opacity === '' ? undefined : Number(opacity),
              easing:
                bezier == null
                  ? undefined
                  : cubicBezier(
                      ...(bezier[1].split(',').map(Number) as [
                        number,
                        number,
                        number,
                        number,
                      ]),
                    ),
            };
          })
          .sort((a, b) => a.offset - b.offset);
      }
    }
  }
  throw new Error(`no @keyframes ${name}`);
}

/** A property's value at `t` through the frames that set it, as CSS plays it. */
function valueAt(
  frames: Frame[],
  property: 'transform' | 'opacity',
  t: number,
): number {
  const set = frames.filter(f => f[property] !== undefined);
  for (let i = 0; i < set.length - 1; i += 1) {
    const from = set[i];
    const to = set[i + 1];
    if (t >= from.offset && t <= to.offset) {
      const local =
        to.offset === from.offset
          ? 1
          : (t - from.offset) / (to.offset - from.offset);
      const progress = from.easing ? from.easing(local) : local;
      const a = from[property] as number;
      const b = to[property] as number;
      return a + (b - a) * progress;
    }
  }
  throw new Error(`no ${property} segment at ${t}`);
}

/** The indeterminate ring's animated layers, from its markup. */
function indeterminateLayers(progressbar: Element) {
  const fill = progressbar.nextElementSibling as Element;
  const spin = fill.firstElementChild as Element;
  const tail = spin.firstElementChild as Element;
  const [rightHalf, leftHalf, , cap] = Array.from(tail.children);
  return {
    spin,
    tail,
    right: rightHalf.firstElementChild as Element,
    left: leftHalf.firstElementChild as Element,
    cap,
  };
}

describe('CircularProgress', () => {
  it('renders with default props', () => {
    render(<CircularProgress value={50} label="Progress" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('uses role="progressbar" (not "meter") for determinate progress', () => {
    // progressbar covers both determinate and indeterminate progress of a
    // task; meter describes a static measurement within a known range.
    // Matches core ProgressBar so both progress primitives announce alike.
    render(<CircularProgress value={50} label="Progress" />);
    expect(screen.queryByRole('meter')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders an empty determinate ring when value is omitted', () => {
    // Parity with core ProgressBar: value defaults to 0 and indeterminate
    // mode is opt-in via isIndeterminate, never implied by an omitted value.
    render(<CircularProgress label="Progress" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders label as visually hidden by default', () => {
    render(<CircularProgress value={50} label="Upload progress" />);
    expect(screen.getByText('Upload progress')).toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-labelledby');
  });

  it('shows label visually when isLabelHidden is false', () => {
    render(
      <CircularProgress
        value={50}
        label="Upload progress"
        isLabelHidden={false}
      />,
    );
    const label = screen.getByText('Upload progress');
    expect(label).toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-labelledby');
  });

  it('links the label to the progressbar via aria-labelledby', () => {
    render(<CircularProgress value={50} label="Upload progress" />);
    const label = screen.getByText('Upload progress');
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-labelledby')).toBe(label.id);
  });

  it('respects custom max', () => {
    render(<CircularProgress value={3} max={10} label="Steps" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '3');
    expect(progressbar).toHaveAttribute('aria-valuemax', '10');
  });

  it('clamps value to [0, max]', () => {
    const {rerender} = render(
      <CircularProgress value={150} max={100} label="Over" />,
    );
    let progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');

    rerender(<CircularProgress value={-10} max={100} label="Under" />);
    progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });

  it('sets aria-valuetext from formatValueLabel', () => {
    render(<CircularProgress value={50} label="Progress" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuetext', '50%');
  });

  it('shows the formatted value in the ring center when hasValueLabel', () => {
    render(<CircularProgress value={75} label="Progress" hasValueLabel />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('uses custom formatValueLabel', () => {
    render(
      <CircularProgress
        value={3}
        max={10}
        label="Steps"
        hasValueLabel
        formatValueLabel={(value, max) => `${value} of ${max}`}
      />,
    );
    expect(screen.getByText('3 of 10')).toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuetext', '3 of 10');
  });

  it('lets children take precedence over the value label', () => {
    render(
      <CircularProgress value={75} label="Progress" hasValueLabel>
        Almost there
      </CircularProgress>,
    );
    expect(screen.getByText('Almost there')).toBeInTheDocument();
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  it('renders children in the center', () => {
    render(
      <CircularProgress value={75} label="Progress">
        75%
      </CircularProgress>,
    );
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('forwards ref to outer container', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<CircularProgress ref={ref} value={50} label="Test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes data-testid', () => {
    render(
      <CircularProgress value={50} label="Test" data-testid="my-progress" />,
    );
    expect(screen.getByTestId('my-progress')).toBeInTheDocument();
  });

  it('renders with all variant options', () => {
    const variants = [
      'accent',
      'success',
      'warning',
      'error',
      'neutral',
    ] as const;
    for (const variant of variants) {
      const {unmount} = render(
        <CircularProgress value={50} label={variant} variant={variant} />,
      );
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      unmount();
    }
  });

  it('renders with all size options', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    for (const size of sizes) {
      const {unmount} = render(
        <CircularProgress value={50} label={size} size={size} />,
      );
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      unmount();
    }
  });

  it('sets ring geometry from size', () => {
    const {container} = render(
      <CircularProgress value={50} size="md" label="Progress" />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '48');
    expect(svg).toHaveAttribute('height', '48');
    expect(svg).toHaveAttribute('viewBox', '0 0 48 48');
    // radius = (diameter - strokeWidth) / 2 = (48 - 4) / 2
    for (const circle of container.querySelectorAll('circle')) {
      expect(circle).toHaveAttribute('r', '22');
      expect(circle).toHaveAttribute('stroke-width', '4');
    }
  });

  it("turns the fill's halves and leading cap from the value", () => {
    const turnsAt = (value: number) => {
      const {container, unmount} = render(
        <CircularProgress value={value} size="md" label="Progress" />,
      );
      const fill = container.querySelector(
        '.astryx-circular-progress-fill',
      ) as HTMLElement;
      const [right, left] = Array.from(
        fill.querySelectorAll<HTMLElement>(':scope > span > span'),
      ).map(layer => `${layer.style.transform} ${layer.style.opacity}`);
      const cap = fill.querySelector<HTMLElement>(':scope > span:last-child');
      const start = fill.querySelector<SVGPathElement>(':scope > svg path');
      const result = {
        right,
        left,
        cap: cap?.style.transform,
        caps: [cap?.style.opacity, start?.style.opacity],
      };
      unmount();
      return result;
    };
    // The right half fills over the first half of the value, the left half
    // over the second; the leading cap turns with the value.
    // A half parked at the edge of its half is hidden (no hairline at 6).
    expect(turnsAt(0)).toEqual({
      right: 'rotate(0deg) 0',
      left: 'rotate(180deg) 0',
      cap: 'rotate(0deg)',
      caps: ['0', '0'],
    });
    expect(turnsAt(25)).toEqual({
      right: 'rotate(90deg) 1',
      left: 'rotate(180deg) 0',
      cap: 'rotate(90deg)',
      caps: ['1', '1'],
    });
    expect(turnsAt(75)).toEqual({
      right: 'rotate(180deg) 1',
      left: 'rotate(270deg) 1',
      cap: 'rotate(270deg)',
      caps: ['1', '1'],
    });
    expect(turnsAt(100)).toEqual({
      right: 'rotate(180deg) 1',
      left: 'rotate(360deg) 1',
      cap: 'rotate(360deg)',
      caps: ['1', '1'],
    });
  });

  it("draws each half as half the ring's stroke, under the fill theming target", () => {
    const {container} = render(
      <CircularProgress value={25} size="md" label="Progress" />,
    );
    const fill = container.querySelector('.astryx-circular-progress-fill');
    expect(fill).not.toBeNull();
    expect(fill).toHaveAttribute('aria-hidden', 'true');
    const halves = fill!.querySelectorAll('circle');
    expect(halves).toHaveLength(2);
    // circumference = 2π * 22 ≈ 138.23: half of it drawn, from 6 o'clock to 12.
    for (const half of halves) {
      const [dash, gap] = (half.getAttribute('stroke-dasharray') ?? '')
        .split(' ')
        .map(Number);
      expect(dash).toBeCloseTo(138.23 / 2, 1);
      expect(gap).toBeCloseTo(138.23, 1);
      expect(half).toHaveAttribute('transform', 'rotate(90 24 24)');
      // The color comes from the target's inherited stroke, never the part.
      expect(half).not.toHaveAttribute('stroke');
    }
  });

  it('animates a value change from where the arc is drawn, each half on time', () => {
    const calls: {keyframes: Keyframe[]; options: KeyframeAnimationOptions}[] =
      [];
    const original = Element.prototype.animate;
    const originalStyle = window.getComputedStyle;
    Element.prototype.animate = function (
      this: Element,
      keyframes: Keyframe[],
      options: KeyframeAnimationOptions,
    ) {
      calls.push({keyframes, options});
      return {
        cancel() {},
        playState: 'running',
        effect: {getComputedTiming: () => ({progress: 0})},
        onfinish: null,
      } as unknown as Animation;
    } as typeof Element.prototype.animate;
    window.getComputedStyle = ((element: Element) => {
      const real = originalStyle(element);
      if (element.classList.contains('astryx-circular-progress-fill')) {
        return {
          ...real,
          transitionDuration: '400ms',
          transitionTimingFunction: 'linear',
        } as CSSStyleDeclaration;
      }
      return real;
    }) as typeof window.getComputedStyle;
    try {
      const {rerender} = render(
        <CircularProgress value={20} size="md" label="Progress" />,
      );
      expect(calls).toHaveLength(0);
      rerender(<CircularProgress value={80} size="md" label="Progress" />);
      expect(calls).toHaveLength(4);
      const [right, left, cap, start] = calls;
      for (const call of calls) {
        expect(call.options.duration).toBe(400);
        expect(call.options.easing).toBe('linear');
      }
      const angle = (frame: Keyframe) =>
        Number(/rotate\(([-\d.]+)deg\)/.exec(String(frame.transform))?.[1]);
      // From 20% (72deg) to 80% (288deg); linear, so the arc crosses 6
      // o'clock half way through.
      expect(angle(cap.keyframes[0])).toBeCloseTo(72, 5);
      expect(angle(cap.keyframes.at(-1)!)).toBeCloseTo(288, 5);
      const crossing = right.keyframes.findIndex(f => angle(f) === 180);
      expect(right.keyframes[crossing].offset).toBeCloseTo(0.5, 5);
      expect(angle(left.keyframes[crossing])).toBe(180);
      expect(
        left.keyframes.slice(0, crossing + 1).every(f => angle(f) === 180),
      ).toBe(true);
      expect(angle(left.keyframes.at(-1)!)).toBeCloseTo(288, 5);
      // Hidden until the arc passes 6 o'clock, then shown at once.
      expect(left.keyframes[crossing].opacity).toBe(0);
      expect(left.keyframes[crossing + 1].opacity).toBe(1);
      expect(
        Number(left.keyframes[crossing + 1].offset) -
          Number(left.keyframes[crossing].offset),
      ).toBeLessThanOrEqual(1e-4);
      expect(start.keyframes.every(f => f.opacity === 1)).toBe(true);
    } finally {
      Element.prototype.animate = original;
      window.getComputedStyle = originalStyle;
    }
  });

  it('steps the left half at once when the arc shrinks through 6 o\u2019clock', () => {
    const calls: Keyframe[][] = [];
    const original = Element.prototype.animate;
    const originalStyle = window.getComputedStyle;
    Element.prototype.animate = function (
      this: Element,
      keyframes: Keyframe[],
    ) {
      calls.push(keyframes);
      return {
        cancel() {},
        playState: 'running',
        effect: {getComputedTiming: () => ({progress: 0})},
        onfinish: null,
      } as unknown as Animation;
    } as typeof Element.prototype.animate;
    window.getComputedStyle = ((element: Element) => {
      const real = originalStyle(element);
      if (element.classList.contains('astryx-circular-progress-fill')) {
        return {
          ...real,
          transitionDuration: '300ms',
          transitionTimingFunction: 'linear',
        } as CSSStyleDeclaration;
      }
      return real;
    }) as typeof window.getComputedStyle;
    try {
      const {rerender} = render(
        <CircularProgress value={80} size="md" label="Progress" />,
      );
      rerender(<CircularProgress value={20} size="md" label="Progress" />);
      const [, left] = calls;
      const angle = (frame: Keyframe) =>
        Number(/rotate\(([-\d.]+)deg\)/.exec(String(frame.transform))?.[1]);
      // Fully shown wherever it still draws part of the arc...
      for (const frame of left) {
        if (angle(frame) > 180) {
          expect(frame.opacity, `at ${frame.offset}`).toBe(1);
        }
      }
      // ...and hidden at once, never faded across a sample interval.
      for (let i = 1; i < left.length; i += 1) {
        if (left[i].opacity !== left[i - 1].opacity) {
          expect(
            Number(left[i].offset) - Number(left[i - 1].offset),
          ).toBeLessThanOrEqual(1e-4);
        }
      }
      expect(left.at(-1)!.opacity).toBe(0);
    } finally {
      Element.prototype.animate = original;
      window.getComputedStyle = originalStyle;
    }
  });

  it('restarts an interrupted eased change from where its arc is drawn', () => {
    const calls: Keyframe[][] = [];
    const original = Element.prototype.animate;
    const originalStyle = window.getComputedStyle;
    // An ease-in curve (t²) evaluated the way the component probes it.
    class EaseInEffect {
      time = 0;
      getComputedTiming() {
        return {progress: this.time * this.time};
      }
    }
    class Probe {
      constructor(private effect: EaseInEffect) {}
      set currentTime(ms: number) {
        this.effect.time = ms / 1000;
      }
    }
    vi.stubGlobal('KeyframeEffect', EaseInEffect);
    vi.stubGlobal('Animation', Probe);
    Element.prototype.animate = function (
      this: Element,
      keyframes: Keyframe[],
    ) {
      calls.push(keyframes);
      // Every running change is half way through its time.
      return {
        cancel() {},
        playState: 'running',
        effect: {getComputedTiming: () => ({progress: 0.5})},
        onfinish: null,
      } as unknown as Animation;
    } as typeof Element.prototype.animate;
    window.getComputedStyle = ((element: Element) => {
      const real = originalStyle(element);
      if (element.classList.contains('astryx-circular-progress-fill')) {
        return {
          ...real,
          transitionDuration: '400ms',
          transitionTimingFunction: 'ease-in',
        } as CSSStyleDeclaration;
      }
      return real;
    }) as typeof window.getComputedStyle;
    try {
      const {rerender} = render(
        <CircularProgress value={0} size="md" label="Progress" />,
      );
      rerender(<CircularProgress value={100} size="md" label="Progress" />);
      calls.length = 0;
      rerender(<CircularProgress value={50} size="md" label="Progress" />);
      const cap = calls[2];
      const angle = (frame: Keyframe) =>
        Number(/rotate\(([-\d.]+)deg\)/.exec(String(frame.transform))?.[1]);
      // Half its time into 0% → 100% on ease-in, the arc is drawn at 25%
      // (90deg), not at the 50% its time fraction would give.
      expect(angle(cap[0])).toBeCloseTo(90, 5);
    } finally {
      Element.prototype.animate = original;
      window.getComputedStyle = originalStyle;
      vi.unstubAllGlobals();
    }
  });

  it('stops a running change when the ring turns indeterminate, and the next value starts from rest', () => {
    const calls: Keyframe[][] = [];
    let cancelled = 0;
    const original = Element.prototype.animate;
    const originalStyle = window.getComputedStyle;
    Element.prototype.animate = function (
      this: Element,
      keyframes: Keyframe[],
    ) {
      calls.push(keyframes);
      // Every change is half way through its time when the next render comes.
      return {
        cancel() {
          cancelled += 1;
        },
        playState: 'running',
        effect: {getComputedTiming: () => ({progress: 0.5})},
        onfinish: null,
      } as unknown as Animation;
    } as typeof Element.prototype.animate;
    window.getComputedStyle = ((element: Element) => {
      const real = originalStyle(element);
      if (element.classList.contains('astryx-circular-progress-fill')) {
        return {
          ...real,
          transitionDuration: '400ms',
          transitionTimingFunction: 'linear',
        } as CSSStyleDeclaration;
      }
      return real;
    }) as typeof window.getComputedStyle;
    try {
      const {rerender} = render(
        <CircularProgress value={0} size="md" label="Progress" />,
      );
      rerender(<CircularProgress value={80} size="md" label="Progress" />);
      expect(calls).toHaveLength(4);
      rerender(
        <CircularProgress
          value={80}
          isIndeterminate
          size="md"
          label="Progress"
        />,
      );
      // The four layers' animations stop with the determinate ring.
      expect(cancelled).toBe(4);
      calls.length = 0;
      rerender(<CircularProgress value={30} size="md" label="Progress" />);
      const cap = calls[2];
      const angle = (frame: Keyframe) =>
        Number(/rotate\(([-\d.]+)deg\)/.exec(String(frame.transform))?.[1]);
      // From 80% at rest (288deg), not from the stopped change's 40%.
      expect(angle(cap[0])).toBeCloseTo(288, 5);
    } finally {
      Element.prototype.animate = original;
      window.getComputedStyle = originalStyle;
    }
  });

  it('releases a running change when it unmounts', () => {
    let cancelled = 0;
    const original = Element.prototype.animate;
    const originalStyle = window.getComputedStyle;
    Element.prototype.animate = function () {
      return {
        cancel() {
          cancelled += 1;
        },
        playState: 'running',
        effect: {getComputedTiming: () => ({progress: 0.5})},
        onfinish: null,
      } as unknown as Animation;
    } as typeof Element.prototype.animate;
    window.getComputedStyle = ((element: Element) => {
      const real = originalStyle(element);
      if (element.classList.contains('astryx-circular-progress-fill')) {
        return {
          ...real,
          transitionDuration: '400ms',
          transitionTimingFunction: 'linear',
        } as CSSStyleDeclaration;
      }
      return real;
    }) as typeof window.getComputedStyle;
    try {
      const {rerender, unmount} = render(
        <CircularProgress value={0} size="md" label="Progress" />,
      );
      rerender(<CircularProgress value={80} size="md" label="Progress" />);
      unmount();
      // The change's cleanup cancels the four layers' animations.
      expect(cancelled).toBe(4);
    } finally {
      Element.prototype.animate = original;
      window.getComputedStyle = originalStyle;
    }
  });

  it('shows a new value at once under reduced motion', () => {
    // The fill's transition-duration is 0 s under both shared reduced-motion
    // queries, a fine pointer's and a coarse pointer's, so a change reads back
    // 0 s and nothing animates. Read from the source: the jsdom StyleX runtime
    // leaves out some of the negated conditions it writes for these keys, and
    // the Chromium test checks what a browser does.
    const source = readFileSync(
      path.resolve(__dirname, 'CircularProgress.tsx'),
      'utf8',
    );
    const block = source.slice(source.indexOf("transitionProperty: 'none',"));
    const duration = block.slice(
      block.indexOf('transitionDuration: {'),
      block.indexOf('},'),
    );
    for (const query of [
      '(prefers-reduced-motion: reduce) and (not (pointer: coarse))',
      '(prefers-reduced-motion: reduce) and (pointer: coarse)',
    ]) {
      const at = duration.indexOf(`'@media ${query}':`);
      expect(at, query).toBeGreaterThanOrEqual(0);
      expect(duration.slice(at).split(',')[0].trim()).toMatch(/'0s'$/);
    }
    expect(duration).not.toContain(
      "'@media (prefers-reduced-motion: reduce)':",
    );
  });

  it('handles zero max gracefully', () => {
    render(<CircularProgress value={0} max={0} label="Empty" />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '0');
  });

  it('treats a NaN value as empty progress instead of leaking "NaN"', () => {
    render(
      <CircularProgress value={NaN} label="Broken upload" hasValueLabel />,
    );
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
  });

  it('treats a NaN max as an empty range instead of leaking "NaN"', () => {
    render(
      <CircularProgress value={50} max={NaN} label="Broken" hasValueLabel />,
    );
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '0');
  });

  it('does not render NaN in the value label when max is zero', () => {
    render(<CircularProgress value={5} max={0} label="Empty" hasValueLabel />);
    const progressbar = screen.getByRole('progressbar');
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
    expect(progressbar.getAttribute('aria-valuetext') ?? '').not.toMatch(
      /NaN|Infinity/,
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  describe('disabled state', () => {
    it('swaps the fill to the disabled variant', () => {
      const {container} = render(
        <CircularProgress value={50} label="Canceled" isDisabled />,
      );
      const fill = container.querySelector('.astryx-circular-progress-fill');
      expect(fill).toHaveAttribute('data-variant', 'disabled');
      // The root keeps the original variant for theme targeting.
      const root = container.querySelector('.astryx-circular-progress');
      expect(root).toHaveAttribute('data-variant', 'accent');
    });

    it('still renders label and value label when disabled', () => {
      render(
        <CircularProgress
          value={50}
          label="Canceled"
          isDisabled
          hasValueLabel
          isLabelHidden={false}
        />,
      );
      expect(screen.getByText('Canceled')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('indeterminate mode', () => {
    it('turns with CSS keyframes, so no script starts its loops', () => {
      let started = 0;
      const original = Element.prototype.animate;
      Element.prototype.animate = function (
        this: Element,
        ...args: Parameters<typeof original>
      ) {
        started += 1;
        return original.apply(this, args);
      } as typeof Element.prototype.animate;
      try {
        const {getByRole} = render(
          <CircularProgress isIndeterminate size="md" label="Loading" />,
        );
        expect(started).toBe(0);
        const layers = indeterminateLayers(getByRole('progressbar'));
        for (const [name, layer] of Object.entries(layers)) {
          expect(topLevelValues(layer, 'animation-name'), name).toHaveLength(1);
          expect(
            topLevelValues(layer, 'animation-iteration-count'),
            name,
          ).toEqual(['infinite']);
        }
      } finally {
        Element.prototype.animate = original;
      }
    });

    it('its keyframes play the breathing cycle exactly, with the left half stepping at half', () => {
      const {getByRole} = render(
        <CircularProgress isIndeterminate size="md" label="Loading" />,
      );
      const layers = indeterminateLayers(getByRole('progressbar'));
      const frames = Object.fromEntries(
        Object.entries(layers).map(([name, layer]) => [
          name,
          keyframesOf(topLevelValues(layer, 'animation-name')[0]),
        ]),
      ) as Record<keyof typeof layers, Frame[]>;
      const {pattern, shortest, longest, midway} = INDETERMINATE;
      const easeInOut = cubicBezier(0.42, 0, 0.58, 1);
      // The cycle as the stroked circle drew it: each half eased in and out.
      const cycle = (t: number) => {
        const first = t < 0.5;
        const e = easeInOut(first ? t / 0.5 : (t - 0.5) / 0.5);
        const dash = first
          ? shortest + (longest - shortest) * e
          : longest + (shortest - longest) * e;
        const start = first ? midway * e : midway + (pattern - midway) * e;
        const arc = (360 * dash) / pattern;
        return {
          spin: 360 * t,
          tail: (360 * start) / pattern,
          cap: arc,
          right: Math.min(Math.max(arc, 0), 180),
          left: Math.min(Math.max(arc, 180), 360),
          leftShown: arc > 180 ? 1 : 0,
        };
      };
      // Where the arc crosses half a turn, rising and falling.
      const crossingsOf = () => {
        const out: number[] = [];
        for (let i = 0; i < 4000; i += 1) {
          let low = i / 4000;
          let high = (i + 1) / 4000;
          const over = (t: number) => cycle(t).cap - 180;
          if (over(low) * over(high) >= 0) {
            continue;
          }
          for (let k = 0; k < 40; k += 1) {
            const mid = (low + high) / 2;
            if (over(low) * over(mid) <= 0) {
              high = mid;
            } else {
              low = mid;
            }
          }
          out.push((low + high) / 2);
        }
        return out;
      };
      const halfway = crossingsOf();
      expect(halfway).toHaveLength(2);
      let worst = 0;
      let crossings = 0;
      for (let i = 0; i <= 2000; i += 1) {
        const t = i / 2000;
        const expected = cycle(t);
        for (const name of ['spin', 'tail', 'cap', 'right', 'left'] as const) {
          worst = Math.max(
            worst,
            Math.abs(valueAt(frames[name], 'transform', t) - expected[name]),
          );
        }
        // The step itself sits within 0.02% after each crossing.
        if (halfway.some(c => t >= c - 1e-6 && t <= c + 2e-4)) {
          continue;
        }
        const shown = valueAt(frames.left, 'opacity', t);
        if (shown !== 0 && shown !== 1) {
          crossings += 1;
        } else {
          expect(shown, `left at ${t}`).toBe(expected.leftShown);
        }
      }
      // Every turn within a hundredth of a degree of the cycle…
      expect(worst).toBeLessThan(0.01);
      // …and the left half never fades: it steps within 0.01% of the cycle.
      expect(crossings).toBe(0);
      const steps = frames.left.filter(f => f.opacity !== undefined);
      for (let i = 1; i < steps.length; i += 1) {
        if (steps[i].opacity !== steps[i - 1].opacity) {
          expect(steps[i].offset - steps[i - 1].offset).toBeLessThanOrEqual(
            1e-4 + 1e-9,
          );
        }
      }
    });

    it('renders indeterminate when isIndeterminate is true', () => {
      render(<CircularProgress isIndeterminate value={50} label="Loading" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
      expect(progressbar).not.toHaveAttribute('aria-valuenow');
      expect(progressbar).not.toHaveAttribute('aria-valuemin');
      expect(progressbar).not.toHaveAttribute('aria-valuemax');
    });

    it('draws the arc from the compositor layers, with no stroke-dash animation', () => {
      const {container} = render(
        <CircularProgress isIndeterminate label="Loading" />,
      );
      const fill = container.querySelector(
        '.astryx-circular-progress-fill',
      ) as HTMLElement;
      expect(fill).toHaveAttribute('aria-hidden', 'true');
      // A spinning layer, the arc's start inside it, and in that the same
      // two half-rings and two caps as the determinate fill.
      const tail = fill.firstElementChild?.firstElementChild as HTMLElement;
      expect(tail.children).toHaveLength(4);
      expect(tail.querySelectorAll('circle')).toHaveLength(2);
      // Without script it rests as a quarter turn.
      expect(
        (tail.children[0].firstElementChild as HTMLElement).style.transform,
      ).toBe('rotate(90deg)');
      const css = Array.from(document.styleSheets)
        .flatMap(sheet => Array.from(sheet.cssRules).map(rule => rule.cssText))
        .join('\n');
      expect(css).not.toMatch(/stroke-dash(array|offset)[^;]*%/);
    });

    it('does not set aria-valuetext when indeterminate', () => {
      render(<CircularProgress isIndeterminate label="Loading" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).not.toHaveAttribute('aria-valuetext');
    });

    it('is labelled via aria-labelledby when indeterminate', () => {
      render(<CircularProgress isIndeterminate label="Loading data" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-labelledby');
    });

    it('suppresses the value label when indeterminate', () => {
      render(
        <CircularProgress
          isIndeterminate
          value={50}
          label="Loading"
          hasValueLabel
        />,
      );
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('renders with all variants in indeterminate mode', () => {
      const variants = [
        'accent',
        'success',
        'warning',
        'error',
        'neutral',
      ] as const;
      for (const variant of variants) {
        const {unmount} = render(
          <CircularProgress
            isIndeterminate
            label={variant}
            variant={variant}
          />,
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        unmount();
      }
    });

    it('renders with all sizes in indeterminate mode', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      for (const size of sizes) {
        const {unmount} = render(
          <CircularProgress isIndeterminate label={size} size={size} />,
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        unmount();
      }
    });

    it('renders children alongside indeterminate animation', () => {
      render(
        <CircularProgress isIndeterminate label="Loading">
          ...
        </CircularProgress>,
      );
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });
});
