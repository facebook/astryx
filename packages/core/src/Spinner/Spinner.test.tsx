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
import {InternationalizationProvider} from '../i18n';
import {defineTheme} from '../theme/defineTheme';
import {generateThemeCSS} from '../theme/generateThemeRules';
import {progress} from '../motion/uikit';

/** sm/md/lg/xl, as Spinner.tsx defines them. */
const SIZES = {
  sm: {diameter: 10, border: 2},
  md: {diameter: 14, border: 3},
  lg: {diameter: 18, border: 3},
  xl: {diameter: 28, border: 4},
} as const;

const ring = (testId = 'spinner') =>
  screen.getByTestId(testId).querySelector('svg') as SVGSVGElement;

/** The track's svg and the arc's svg, in that order. */
const rings = (testId = 'spinner') => [
  // The track's svg is a child of the box, the arc's sits in the rotor; the
  // touch glyph's spokes are a level deeper.
  ...screen
    .getByTestId(testId)
    .querySelectorAll(':scope > svg, :scope > span > svg'),
];

/** The box that turns: the arc's svg sits inside it, the track's does not. */
const rotor = (testId = 'spinner') =>
  rings(testId)[1].parentElement as HTMLSpanElement;

const circles = (testId = 'spinner') => {
  const [track, arc] = [
    ...screen.getByTestId(testId).querySelectorAll('circle'),
  ];
  return {track, arc};
};

/** Every rule StyleX injected, as text (jsdom computes no animations). */
function injectedCss(): string {
  let out = '';
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        out += rule.cssText + '\n';
      }
    } catch {
      // ignore cross-origin sheets
    }
  }
  return (
    out +
    Array.from(document.querySelectorAll('style'))
      .map(s => s.textContent || '')
      .join('\n')
  );
}

/** The declarations the element's atomic classes carry, as `prop: value`. */
function declarationsOf(el: Element, css = injectedCss()): string[] {
  const out: string[] = [];
  for (const cls of Array.from(el.classList)) {
    const re = new RegExp(`\\.${cls}\\b[^{]*\\{([^}]*)\\}`, 'g');
    for (const match of css.matchAll(re)) {
      out.push(
        ...match[1]
          .split(';')
          .map(d => d.trim())
          .filter(Boolean),
      );
    }
  }
  return out;
}

/**
 * The declarations the element's classes carry in rules at the top level
 * (`media` null) or inside `@media <media>`, as `prop: value`.
 */
function rulesOf(el: Element, media: string | null): string[] {
  const out: string[] = [];
  const visit = (rules: CSSRuleList, inMedia: string | null) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) {
        visit(rule.cssRules, rule.conditionText ?? rule.media.mediaText);
      } else if (rule instanceof CSSStyleRule && inMedia === media) {
        if (
          Array.from(el.classList).some(c =>
            rule.selectorText.includes(`.${c}`),
          )
        ) {
          for (let i = 0; i < rule.style.length; i += 1) {
            const prop = rule.style[i];
            out.push(`${prop}: ${rule.style.getPropertyValue(prop)}`);
          }
        }
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules, null);
    } catch {
      // ignore cross-origin sheets
    }
  }
  return out;
}

/** UIKit's activity indicator: the glyph and its eight spokes. */
const glyph = (testId = 'spinner') => {
  const root = screen.getByTestId(testId);
  const element = root.lastElementChild as HTMLSpanElement;
  return {element, spokes: [...element.children] as HTMLSpanElement[]};
};

/** The named animation's opacity keyframes as [offset 0..1, opacity], in order. */
function opacityKeyframes(name: string): [number, number][] {
  const css = injectedCss();
  // jsdom lowercases an animation-name it parses, not the @keyframes name.
  const start = css.search(new RegExp(`@keyframes ${name}\\b`, 'i'));
  expect(start).toBeGreaterThanOrEqual(0);
  let depth = 0;
  let end = css.length;
  for (let i = css.indexOf('{', start); i < css.length; i += 1) {
    if (css[i] === '{') {
      depth += 1;
    }
    if (css[i] === '}' && --depth === 0) {
      end = i + 1;
      break;
    }
  }
  return Array.from(
    css
      .slice(start, end)
      .matchAll(/(from|to|[\d.]+%)\s*\{\s*opacity:\s*([\d.]+)/g),
    m => {
      const at =
        m[1] === 'from' ? 0 : m[1] === 'to' ? 100 : Number.parseFloat(m[1]);
      return [at / 100, Number(m[2])] as [number, number];
    },
  ).sort((a, b) => a[0] - b[0]);
}

/** Opacity at progress x through one cycle, linear between keyframes. */
function opacityAt(frames: [number, number][], x: number): number {
  for (let i = 1; i < frames.length; i += 1) {
    const [x0, y0] = frames[i - 1];
    const [x1, y1] = frames[i];
    if (x <= x1) {
      return x1 === x0 ? y1 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return frames[frames.length - 1][1];
}

const valueOf = (declarations: string[], prop: string) =>
  declarations
    .filter(d => d.startsWith(`${prop}:`))
    .map(d => d.slice(prop.length + 1).trim());

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

  it('localizes the default assistive label through the i18n catalog', () => {
    render(
      <InternationalizationProvider
        locale="fr"
        overrides={{fr: {'@astryx.spinner.loading': 'Chargement'}}}>
        <Spinner data-testid="spinner" />
      </InternationalizationProvider>,
    );
    expect(screen.getByTestId('spinner')).toHaveAttribute(
      'aria-label',
      'Chargement',
    );
  });

  it('keeps an explicit aria-label over the localized default', () => {
    render(
      <InternationalizationProvider
        locale="fr"
        overrides={{fr: {'@astryx.spinner.loading': 'Chargement'}}}>
        <Spinner aria-label="Veuillez patienter" data-testid="spinner" />
      </InternationalizationProvider>,
    );
    expect(screen.getByTestId('spinner')).toHaveAttribute(
      'aria-label',
      'Veuillez patienter',
    );
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

  // The box has always been sized by an inline width/height written after the
  // caller's `style`, so the component's own size wins over a `style={{width}}`
  // passed in. Making the geometry themeable changed what that value is made
  // of — a composed var rather than a number — and deliberately not where it is
  // written: moving the sizing into a rule would have handed a caller's inline
  // width a precedence over the box it has never had. This pins the precedence
  // itself, which is the part a consumer could be depending on.
  describe('box sizing', () => {
    it.each(Object.entries(SIZES))(
      'falls back to the %s frame where no stylesheet has declared the var',
      (size, {diameter, border}) => {
        render(
          <Spinner size={size as keyof typeof SIZES} data-testid="spinner" />,
        );
        const box = screen.getByTestId('spinner');
        const expected = `var(--_spinner-box-size, ${diameter + border * 2}px)`;
        expect(box.style.width).toBe(expected);
        expect(box.style.height).toBe(expected);
      },
    );

    it('keeps its own size over a width the caller passes in style', () => {
      render(
        <Spinner
          size="xl"
          style={{width: 999, height: 999, opacity: 0.5}}
          data-testid="spinner"
        />,
      );
      const box = screen.getByTestId('spinner');
      expect(box.style.width).toBe('var(--_spinner-box-size, 36px)');
      expect(box.style.height).toBe('var(--_spinner-box-size, 36px)');
      // Everything else the caller passed still applies — only the two
      // properties the box owns are taken back.
      expect(box.style.opacity).toBe('0.5');
    });
  });

  // The themed geometry resolves in the cascade — jsdom implements no layout
  // and no custom-property registration, so no test here can reach what a
  // theme actually draws; that is verified in a browser and the numbers are in
  // the PR. What IS a contract a unit test can hold is the routing: a theme
  // writes an override against the documented key, and it has to come out on
  // the selector the component reads from.
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
      ).toContain(
        '.astryx-spinner[data-size="xl"] {\n    --spinner-diameter: 2.5rem;',
      );
    });

    it('scopes a themed color to that shade variant', () => {
      expect(
        cssFor({
          spinner: {'shade:subtle': {'--spinner-track-color': 'transparent'}},
        }),
      ).toContain(
        '.astryx-spinner[data-shade="subtle"] {\n    --spinner-track-color: transparent;',
      );
    });

    it('lets the base target set a value for every size and shade', () => {
      expect(
        cssFor({spinner: {base: {'--spinner-color': 'var(--color-brand)'}}}),
      ).toContain(
        '.astryx-spinner {\n    --spinner-color: var(--color-brand);',
      );
    });

    it('scopes a themed arc fraction to that size variant (#5819)', () => {
      expect(
        cssFor({spinner: {'size:xl': {'--spinner-arc-fraction': '0.75'}}}),
      ).toContain(
        '.astryx-spinner[data-size="xl"] {\n    --spinner-arc-fraction: 0.75;',
      );
    });
  });
});

describe('Spinner ring', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('draws the ring in SVG', () => {
    render(<Spinner data-testid="spinner" />);
    // The track and the arc each have their own svg: the track stays put and
    // the arc's svg sits in the rotor that turns.
    const [trackSvg, arcSvg] = rings();
    expect(trackSvg.querySelectorAll('circle')).toHaveLength(1);
    expect(arcSvg.querySelectorAll('circle')).toHaveLength(1);
    expect(trackSvg.parentElement).toBe(screen.getByTestId('spinner'));
    expect(rotor().parentElement).toBe(screen.getByTestId('spinner'));
    expect(screen.getByTestId('spinner').querySelector('canvas')).toBeNull();
  });

  it.each(Object.entries(SIZES))(
    'sizes the %s ring from its size token',
    (size, {diameter, border}) => {
      render(
        <Spinner size={size as keyof typeof SIZES} data-testid="spinner" />,
      );
      // No viewBox: one user unit is one px, so the attributes below mean px.
      // They are the no-stylesheet fallback; CSS sizes the frame from the box.
      const frame = diameter + border * 2;
      for (const svg of rings()) {
        expect(svg.getAttribute('viewBox')).toBeNull();
        expect(Number(svg.getAttribute('width'))).toBe(frame);
        expect(Number(svg.getAttribute('height'))).toBe(frame);
      }
      for (const c of [circles().track, circles().arc]) {
        expect(c.getAttribute('cx')).toBe('50%');
        expect(c.getAttribute('cy')).toBe('50%');
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

  // The regression this file could not have caught: #5214 made the RING
  // themeable and left the frame at the size's own constant, so a themed
  // diameter left the svg larger than the box it sits in. The overflowing grid
  // item then aligned to start rather than centre — measured in Chromium at
  // 1.5 to 3.3px off across the four sizes. Nothing asserted the two agreed,
  // because nothing tied them.
  it('sizes the frame from CSS, not from the size constant', () => {
    render(<Spinner data-testid="spinner" />);
    // No viewBox, and the circles centre on the box rather than on a centre
    // in user units — together that is what lets CSS size the frame from
    // `--_spinner-box-size`, the same composed var the span is sized from, so
    // a themed diameter moves both. The px attributes remain as the
    // no-stylesheet fallback and CSS outranks them whenever one is present.
    for (const svg of rings()) {
      expect(svg.getAttribute('viewBox')).toBeNull();
    }
    for (const c of [circles().track, circles().arc]) {
      expect(c.getAttribute('cx')).toBe('50%');
      expect(c.getAttribute('cy')).toBe('50%');
    }
  });

  it('starts the arc at twelve o’clock', () => {
    render(<Spinner data-testid="spinner" />);
    // A CSS rotation about the shape's own box, not an SVG transform about a
    // centre in user units — the centre is `50%`, so there is no user-unit
    // number to name, and the offset has to survive a themed diameter.
    expect(circles().arc.getAttribute('transform')).toBeNull();
  });

  // The authored dash is the size's own absolute pattern, and stays that way:
  // it is what a render with no stylesheet draws, and it is byte-for-byte the
  // pattern this component drew before the geometry became themeable. Scaling
  // with a themed diameter is the rule's job — it composes the same two
  // lengths out of the resolved diameter — and deliberately not `pathLength`'s,
  // which rescales against the path length the UA measures on its own
  // approximation of the circle and shortens the default arc by 0.64%.
  it.each(Object.entries(SIZES))(
    'leaves the %s arc its own absolute dash, with no pathLength',
    (size, {diameter}) => {
      render(
        <Spinner size={size as keyof typeof SIZES} data-testid="spinner" />,
      );
      const {track, arc} = circles();
      const [on, off] = dashOf(arc);
      expect(on + off).toBeCloseTo(Math.PI * diameter, 6);
      expect(arc.getAttribute('pathLength')).toBeNull();
      // The track is a full ring, so it needs neither.
      expect(track.getAttribute('pathLength')).toBeNull();
    },
  );

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
    expect(HTMLElement.prototype).not.toHaveProperty('getAnimations');
    const raf = vi.spyOn(window, 'requestAnimationFrame');
    render(<Spinner data-testid="spinner" />);
    expect(ring()).not.toBeNull();
    expect(raf).not.toHaveBeenCalled();
  });

  // The ring turns on the compositor: only the rotor moves, and only by
  // `transform`, a property the browser animates without the main thread.
  // A `stroke-dashoffset` (or any other paint) animation would repaint the arc
  // on the main thread every frame and stop for as long as a script runs —
  // the browser proof (Spinner.interaction.browser.spec.ts) holds the frames.
  it('turns the arc by rotating the rotor, with nothing else animated', () => {
    render(<Spinner data-testid="spinner" />);
    const css = injectedCss();
    const rotorDecls = declarationsOf(rotor(), css);
    const name = rotorDecls
      .find(d => d.startsWith('animation-name:'))
      ?.slice('animation-name:'.length)
      .trim();
    expect(name).toBeTruthy();
    expect(rotorDecls).toContain('animation-timing-function: linear');
    expect(rotorDecls).toContain('animation-iteration-count: infinite');
    // Its keyframes turn it once, by transform and nothing else. (jsdom's
    // CSSOM lowercases the name in the rule but not in the at-rule.)
    const keyframes = new RegExp(
      `@keyframes ${name}\\s*\\{([\\s\\S]*?\\})\\s*\\}`,
      'i',
    ).exec(css)?.[1];
    expect(keyframes).toMatch(/rotate\(0deg\)/);
    expect(keyframes).toMatch(/rotate\(360deg\)/);
    expect(keyframes).not.toMatch(/stroke|width|height|top|left/);
    // Its own compositing layer from the first frame.
    expect(rotorDecls).toContain('will-change: transform');
    // Nothing else in the spinner animates: not the arc, not the track.
    for (const el of [
      ...screen.getByTestId('spinner').querySelectorAll('svg, circle'),
    ]) {
      expect(
        declarationsOf(el, css).some(d => d.startsWith('animation-name:')),
      ).toBe(false);
    }
    expect(css).not.toMatch(/@keyframes[^{]*\{[^}]*stroke-dashoffset/);
  });

  it('keeps the track out of the rotor', () => {
    render(<Spinner data-testid="spinner" />);
    expect(rotor().contains(circles().arc)).toBe(true);
    expect(rotor().contains(circles().track)).toBe(false);
    expect(rotor().getAttribute('aria-hidden')).toBe('true');
  });

  it('pins every ring to the timeline origin in a single frame', () => {
    const animations: {startTime: number | null}[] = [];
    const getAnimations = vi.fn(function (this: HTMLElement) {
      const a = {startTime: null as number | null};
      animations.push(a);
      return [a];
    });
    Object.defineProperty(HTMLElement.prototype, 'getAnimations', {
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
            <Spinner key={i} data-testid={`spinner-${i}`} />
          ))}
        </>,
      );
      // One frame for five spinners: the reads are batched, so no mount
      // re-forces what the previous mount invalidated.
      expect(raf).toHaveBeenCalledTimes(1);
      frames.forEach(cb => cb(0));
      expect(animations).toHaveLength(5);
      expect(animations.every(a => a.startTime === 0)).toBe(true);
      // The rotation lives on the rotor itself, the element the ref sits on.
      expect(getAnimations.mock.contexts).toEqual(
        Array.from({length: 5}, (_, i) => rotor(`spinner-${i}`)),
      );
      // The pin runs on the branch the other shade cases cannot reach, so the
      // no-read assertion is made here too.
      expect(
        computed.mock.calls.filter(
          ([el]) => el instanceof Element && container.contains(el),
        ),
      ).toEqual([]);
    } finally {
      // @ts-expect-error — removing the stub restores jsdom's real surface
      delete HTMLElement.prototype.getAnimations;
    }
  });
});

describe("Spinner under a finger: UIKit's activity indicator", () => {
  const indicator = progress.activityIndicator;
  // UIKit's spoke alphas include its color's own alpha; the glyph draws the
  // shade's color at the same relative weights.
  const weight = (frame: number) =>
    indicator.spokeAlphas[Math.min(frame, indicator.spokeAlphas.length - 1)] /
    indicator.colorAlpha;
  const frameMs = indicator.cycleMs / indicator.framesPerCycle;

  it("draws the glyph in the ring's place when the primary pointer is coarse", () => {
    render(<Spinner data-testid="spinner" />);
    const {element, spokes} = glyph();
    expect(element).toHaveAttribute('aria-hidden', 'true');
    expect(spokes).toHaveLength(indicator.spokeCount);
    // The resolver's touch query, spelled exactly as TOUCH_QUERY.
    expect(valueOf(rulesOf(element, null), 'display')).toEqual(['none']);
    expect(valueOf(rulesOf(element, '(pointer: coarse)'), 'display')).toEqual([
      'block',
    ]);
    for (const part of [rings()[0], rotor()]) {
      expect(valueOf(rulesOf(part, null), 'display')).toEqual(['block']);
      expect(valueOf(rulesOf(part, '(pointer: coarse)'), 'display')).toEqual([
        'none',
      ]);
    }
  });

  it("steps every spoke through UIKit's alphas, one frame every 50 ms", () => {
    render(<Spinner data-testid="spinner" />);
    const [spoke] = glyph().spokes;
    const declarations = rulesOf(spoke, null);
    const toMs = (value: string) =>
      Number.parseFloat(value) * (value.endsWith('ms') ? 1 : 1000);
    expect(valueOf(declarations, 'animation-duration').map(toMs)).toEqual([
      indicator.cycleMs,
    ]);
    expect(valueOf(declarations, 'animation-timing-function')).toEqual([
      'linear',
    ]);
    expect(valueOf(declarations, 'animation-iteration-count')).toEqual([
      'infinite',
    ]);
    expect(valueOf(declarations, 'will-change')).toEqual(['opacity']);
    const [name] = valueOf(declarations, 'animation-name');
    const frames = opacityKeyframes(name);
    // Each of the 16 frames holds one value from its start to its end.
    for (let frame = 0; frame < indicator.framesPerCycle; frame += 1) {
      for (const within of [0.02, 0.5, 0.98]) {
        const x = (frame + within) / indicator.framesPerCycle;
        expect(opacityAt(frames, x), `frame ${frame}`).toBeCloseTo(
          weight(frame),
          3,
        );
      }
    }
    // …and changes in 0.01% of the cycle, never through steps(), which
    // WebKit runs on the main thread.
    for (let i = 1; i < frames.length; i += 1) {
      if (frames[i][1] !== frames[i - 1][1]) {
        expect(frames[i][0] - frames[i - 1][0]).toBeCloseTo(0.0001, 6);
      }
    }
    // A spoke's resting opacity is the trail's last value.
    expect(valueOf(declarations, 'opacity')).toEqual([String(weight(99))]);
  });

  it("starts the head at 9 o'clock and moves it one spoke clockwise every two frames", () => {
    render(<Spinner data-testid="spinner" />);
    const {spokes} = glyph();
    spokes.forEach((spoke, index) => {
      const declarations = rulesOf(spoke, null);
      // Spoke `index` is drawn index × 45° clockwise from 12 o'clock, about
      // the centre of UIKit's frame; its layer itself never turns.
      const svg = spoke.querySelector('svg') as SVGSVGElement;
      const center = indicator.medium.glyphCenterPt;
      expect(svg.querySelector('rect')?.getAttribute('transform')).toBe(
        `rotate(${(index * 360) / indicator.spokeCount} ${center} ${center})`,
      );
      expect(valueOf(declarations, 'transform')).toEqual([]);
      // The head reaches it this many frames into the cycle…
      const reached =
        indicator.framesPerSpoke *
        ((index - indicator.headSpokeAtStart + indicator.spokeCount) %
          indicator.spokeCount);
      // …so at the first frame it is that many frames before its own start.
      const [delay] = valueOf(declarations, 'animation-delay');
      const startFrame =
        ((-Number.parseFloat(delay) / frameMs) % indicator.framesPerCycle) + 0;
      expect(startFrame).toBe(
        (indicator.framesPerCycle - reached) % indicator.framesPerCycle,
      );
      expect(Number.parseFloat(delay)).toBeLessThanOrEqual(0);
    });
  });

  it('keeps its pace under reduced motion and needs no phase pin, as UIKit does', () => {
    render(<Spinner data-testid="spinner" />);
    const [spoke] = glyph().spokes;
    expect(
      rulesOf(spoke, '(prefers-reduced-motion: reduce)').filter(d =>
        d.startsWith('animation'),
      ),
    ).toEqual([]);
    expect(indicator.unchangedByReduceMotionOrRtl).toBe(true);
    expect(indicator.startsAtFirstFrame).toBe(true);
  });

  it("draws UIKit's medium and large spokes, scaled to the box", () => {
    for (const [size, style] of [
      ['sm', indicator.medium],
      ['md', indicator.medium],
      ['lg', indicator.medium],
      ['xl', indicator.large],
    ] as const) {
      const {unmount} = render(
        <Spinner size={size} data-testid={`spinner-${size}`} />,
      );
      const {spokes} = glyph(`spinner-${size}`);
      for (const spoke of spokes) {
        // Each spoke's layer covers the box…
        const layer = rulesOf(spoke, null);
        expect(valueOf(layer, 'top')).toEqual(['0px']);
        expect(valueOf(layer, 'width')).toEqual(['var(--_spinner-box-size)']);
        // …and draws one capsule in UIKit's points, scaled to the box.
        const svg = spoke.querySelector('svg') as SVGSVGElement;
        expect(svg.getAttribute('viewBox')).toBe(
          `0 0 ${style.sizePt} ${style.sizePt}`,
        );
        expect(valueOf(rulesOf(svg, null), 'width')).toEqual([
          'var(--_spinner-box-size)',
        ]);
        const rect = svg.querySelector('rect') as SVGRectElement;
        const attr = (name: string) => Number(rect.getAttribute(name));
        const center = style.glyphCenterPt;
        expect(attr('width'), size).toBeCloseTo(style.spokeWidthPt, 6);
        expect(attr('rx'), size).toBeCloseTo(style.spokeWidthPt / 2, 6);
        expect(attr('x'), size).toBeCloseTo(center - style.spokeWidthPt / 2, 6);
        // From the inner radius to the outer one, at 12 o'clock.
        expect(attr('y'), size).toBeCloseTo(
          center - style.spokeOuterRadiusPt,
          6,
        );
        expect(attr('y') + attr('height'), size).toBeCloseTo(
          center - style.spokeInnerRadiusPt,
          6,
        );
      }
      unmount();
    }
  });
});

describe('geometry var registration', () => {
  /** The shape `registerSpinnerVars` passes; jsdom implements no real one. */
  type Descriptor = {
    name: string;
    syntax: string;
    inherits: boolean;
    initialValue: string;
  };
  const stubRegisterProperty = (fn: (d: Descriptor) => void) => {
    (
      CSS as unknown as {registerProperty: (d: Descriptor) => void}
    ).registerProperty = fn;
  };

  afterEach(() => {
    delete (CSS as unknown as {registerProperty?: unknown}).registerProperty;
    vi.resetModules();
  });

  it('registers when the module is imported, not when a spinner mounts', async () => {
    // Registering an inherited property with an `initial-value` invalidates
    // style for the whole document. A spinner mounts onto a page that has
    // already rendered, so paying it there is paying it on the full tree —
    // measured at 29ms against 12ms on an 11k-element page. At import the page
    // is whatever has rendered so far, which for a bundle in the head is
    // nothing. This pins the timing: it fails if the call moves back into a
    // ref callback, an effect, or the component body.
    const registerProperty = vi.fn<(d: Descriptor) => void>();
    stubRegisterProperty(registerProperty);

    vi.resetModules();
    await import('./Spinner');

    expect(registerProperty.mock.calls.map(([d]) => d.name)).toEqual([
      '--_spinner-ring-diameter',
      '--_spinner-ring-stroke',
    ]);
    // Both are `<length>` with an initial value, which is what makes a themed
    // `0` mean `0px` inside the `calc()` rather than poisoning it.
    for (const [descriptor] of registerProperty.mock.calls) {
      expect(descriptor.syntax).toBe('<length>');
      expect(descriptor.inherits).toBe(true);
      expect(descriptor.initialValue).toBe('0px');
    }
  });

  it('survives a second evaluation, and does not need the DOM', async () => {
    // Two copies of the package on one page, or a fast-refresh re-evaluation:
    // registerProperty throws on a duplicate rather than replacing, and the
    // existing registration is this same one.
    const registerProperty = vi.fn<(d: Descriptor) => void>(() => {
      throw new Error('InvalidModificationError');
    });
    stubRegisterProperty(registerProperty);

    vi.resetModules();
    await expect(import('./Spinner')).resolves.toBeDefined();
    expect(registerProperty).toHaveBeenCalledTimes(2);
  });
});
