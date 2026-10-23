// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Overlay.test.tsx
 * @input Uses vitest, @testing-library/react, Overlay + useOverlay + OverlayRegion
 * @output Characterization tests for the Overlay component and useOverlay hook
 * @position Testing; validates the overlay/scrim rendering + touch-toggle contract
 *
 * SYNC: When Overlay.tsx / useOverlay.tsx / OverlayScrim.tsx change,
 * update tests to match new behavior
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {render, screen, renderHook, fireEvent} from '@testing-library/react';
import {createRef, type ReactNode} from 'react';
import {Overlay} from './Overlay';
import {useOverlay} from './useOverlay';
import {OverlayRegion, resolveOverlayRegionAxis} from './OverlayRegion';

/** The scrim is the div carrying data-position (from themeProps). */
function getScrim(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('[data-position]');
  if (!el) {
    throw new Error('scrim element not found');
  }
  return el;
}

/**
 * Force window.matchMedia('(hover: none)') to report a given value so we can
 * exercise the touch vs. pointer branches of useOverlay. Returns a restore fn.
 */
function mockHoverNone(matches: boolean): () => void {
  const original = window.matchMedia;
  window.matchMedia = (query: string) => ({
    matches: query.includes('hover: none') ? matches : false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
  return () => {
    window.matchMedia = original;
  };
}

describe('Overlay', () => {
  describe('rendering & structure', () => {
    it('renders the base children', () => {
      render(
        <Overlay content={<span>badge</span>}>
          <img alt="hero" src="x.jpg" />
        </Overlay>,
      );
      expect(screen.getByAltText('hero')).toBeInTheDocument();
    });

    it('renders the overlay content inside the scrim', () => {
      render(
        <Overlay content={<button type="button">Quick view</button>}>
          <div>base</div>
        </Overlay>,
      );
      expect(
        screen.getByRole('button', {name: 'Quick view'}),
      ).toBeInTheDocument();
    });

    it('renders a root div carrying the astryx-overlay class', () => {
      const {container} = render(
        <Overlay content={<span>c</span>}>
          <div>base</div>
        </Overlay>,
      );
      const root = container.firstElementChild as HTMLElement;
      expect(root.tagName).toBe('DIV');
      expect(root.className).toContain('astryx-overlay');
    });

    it('places the scrim after the base children in DOM order', () => {
      const {container} = render(
        <Overlay content={<span data-testid="ovl">c</span>}>
          <div data-testid="base">base</div>
        </Overlay>,
      );
      const root = container.firstElementChild as HTMLElement;
      const base = screen.getByTestId('base');
      const scrim = getScrim(container);
      // base comes before scrim
      expect(
        base.compareDocumentPosition(scrim) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(root).toContainElement(scrim);
    });

    it('applies the astryx-overlay-scrim class to the scrim', () => {
      const {container} = render(
        <Overlay content={<span>c</span>}>
          <div>b</div>
        </Overlay>,
      );
      expect(getScrim(container).className).toContain('astryx-overlay-scrim');
    });
  });

  describe('position', () => {
    it('defaults data-position to "fill"', () => {
      const {container} = render(
        <Overlay content={<span>c</span>}>
          <div>b</div>
        </Overlay>,
      );
      expect(getScrim(container).getAttribute('data-position')).toBe('fill');
    });

    it.each(['fill', 'bottom', 'top'] as const)(
      'reflects position="%s" as data-position',
      position => {
        const {container} = render(
          <Overlay position={position} content={<span>c</span>}>
            <div>b</div>
          </Overlay>,
        );
        expect(getScrim(container).getAttribute('data-position')).toBe(
          position,
        );
      },
    );
  });

  describe('scrim mode → media theme inversion', () => {
    it('dark scrim (default) wraps content in a dark MediaTheme', () => {
      const {container} = render(
        <Overlay content={<span>c</span>}>
          <div>b</div>
        </Overlay>,
      );
      expect(
        container.querySelector('[data-astryx-media="dark"]'),
      ).toBeInTheDocument();
    });

    it('light scrim wraps content in a light MediaTheme', () => {
      const {container} = render(
        <Overlay scrim="light" content={<span>c</span>}>
          <div>b</div>
        </Overlay>,
      );
      expect(
        container.querySelector('[data-astryx-media="light"]'),
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-astryx-media="dark"]'),
      ).not.toBeInTheDocument();
    });

    it('scrim={false} renders no MediaTheme wrapper', () => {
      const {container} = render(
        <Overlay scrim={false} content={<span>c</span>}>
          <div>b</div>
        </Overlay>,
      );
      expect(
        container.querySelector('[data-astryx-media]'),
      ).not.toBeInTheDocument();
    });
  });

  describe('controlled visibility (isOpen)', () => {
    it('marks the scrim inert when isOpen is false', () => {
      const {container} = render(
        <Overlay isOpen={false} content={<span>c</span>}>
          <div>b</div>
        </Overlay>,
      );
      expect(getScrim(container).hasAttribute('inert')).toBe(true);
    });

    it('does not mark the scrim inert when isOpen is true', () => {
      const {container} = render(
        <Overlay isOpen content={<span>c</span>}>
          <div>b</div>
        </Overlay>,
      );
      expect(getScrim(container).hasAttribute('inert')).toBe(false);
    });

    it('is never inert in uncontrolled (CSS-driven) mode', () => {
      const {container} = render(
        <Overlay showOn="hover" content={<span>c</span>}>
          <div>b</div>
        </Overlay>,
      );
      expect(getScrim(container).hasAttribute('inert')).toBe(false);
    });

    it('toggles inert when the isOpen prop flips', () => {
      const {container, rerender} = render(
        <Overlay isOpen={false} content={<span>c</span>}>
          <div>b</div>
        </Overlay>,
      );
      expect(getScrim(container).hasAttribute('inert')).toBe(true);
      rerender(
        <Overlay isOpen content={<span>c</span>}>
          <div>b</div>
        </Overlay>,
      );
      expect(getScrim(container).hasAttribute('inert')).toBe(false);
    });
  });

  describe('styling & ref', () => {
    it('forwards ref to the root div element', () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <Overlay ref={ref} content={<span>c</span>}>
          <div>b</div>
        </Overlay>,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.className).toContain('astryx-overlay');
    });

    it('merges a caller className onto the root', () => {
      const {container} = render(
        <Overlay className="custom-cls" content={<span>c</span>}>
          <div>b</div>
        </Overlay>,
      );
      const root = container.firstElementChild as HTMLElement;
      expect(root.className).toContain('custom-cls');
      expect(root.className).toContain('astryx-overlay');
    });

    it('merges a caller inline style onto the root', () => {
      const {container} = render(
        <Overlay style={{opacity: 0.5}} content={<span>c</span>}>
          <div>b</div>
        </Overlay>,
      );
      const root = container.firstElementChild as HTMLElement;
      expect(root.style.opacity).toBe('0.5');
    });
  });
});

describe('useOverlay', () => {
  describe('return shape', () => {
    it('exposes containerRef, containerProps, element and renderOverlay', () => {
      const {result} = renderHook(() => useOverlay());
      expect(result.current.containerRef).toHaveProperty('current');
      expect(result.current.containerProps).toBeDefined();
      expect(typeof result.current.renderOverlay).toBe('function');
    });

    it('containerProps.className is a non-empty marker string', () => {
      const {result} = renderHook(() => useOverlay());
      expect(typeof result.current.containerProps.className).toBe('string');
      expect(result.current.containerProps.className?.length).toBeGreaterThan(
        0,
      );
    });

    it('returns element=null when no content is provided', () => {
      const {result} = renderHook(() => useOverlay({showOn: 'hover'}));
      expect(result.current.element).toBeNull();
    });

    it('returns a scrim element when content is provided', () => {
      const {result} = renderHook(() => useOverlay({content: <span>c</span>}));
      expect(result.current.element).not.toBeNull();
    });

    it('renderOverlay(children) produces a renderable scrim', () => {
      const {result} = renderHook(() => useOverlay({showOn: 'hover'}));
      const el = result.current.renderOverlay(<span>on demand</span>);
      const {container} = render(el);
      expect(screen.getByText('on demand')).toBeInTheDocument();
      expect(getScrim(container)).toBeInTheDocument();
    });
  });

  describe('pointer (non-touch) device', () => {
    let restore: () => void;
    beforeEach(() => {
      restore = mockHoverNone(false);
    });
    afterEach(() => restore());

    it('does not attach touch toggle handlers in hover mode', () => {
      const {result} = renderHook(() => useOverlay({showOn: 'hover'}));
      expect(result.current.containerProps.onClick).toBeUndefined();
      expect(result.current.containerProps.onMouseUp).toBeUndefined();
    });
  });

  describe('touch device', () => {
    let restore: () => void;
    beforeEach(() => {
      restore = mockHoverNone(true);
    });
    afterEach(() => restore());

    it('attaches tap-to-toggle handlers in hover mode', () => {
      const {result} = renderHook(() => useOverlay({showOn: 'hover'}));
      expect(typeof result.current.containerProps.onClick).toBe('function');
      expect(typeof result.current.containerProps.onMouseUp).toBe('function');
    });

    it('does NOT attach toggle handlers when showOn="always" (no toggle needed)', () => {
      const {result} = renderHook(() => useOverlay({showOn: 'always'}));
      expect(result.current.containerProps.onClick).toBeUndefined();
      expect(result.current.containerProps.onMouseUp).toBeUndefined();
    });

    it('does NOT attach toggle handlers when showOn="focus"', () => {
      const {result} = renderHook(() => useOverlay({showOn: 'focus'}));
      expect(result.current.containerProps.onClick).toBeUndefined();
    });

    it('a consumer prop isOpen overrides the touch toggle (scrim reflects it)', () => {
      // With isOpen provided, the scrim is controlled regardless of touch.
      const {container} = render(
        <Overlay showOn="hover" isOpen={false} content={<span>c</span>}>
          <div>b</div>
        </Overlay>,
      );
      expect(getScrim(container).hasAttribute('inert')).toBe(true);
    });
  });

  describe('memoization', () => {
    it('returns a stable renderOverlay across re-renders with same options', () => {
      const {result, rerender} = renderHook(
        (props: {showOn: 'hover' | 'always'}) => useOverlay(props),
        {initialProps: {showOn: 'hover'}},
      );
      const first = result.current.renderOverlay;
      rerender({showOn: 'hover'});
      expect(result.current.renderOverlay).toBe(first);
    });

    it('returns a new renderOverlay when options change', () => {
      const {result, rerender} = renderHook(
        (props: {showOn: 'hover' | 'always'}) => useOverlay(props),
        {initialProps: {showOn: 'hover'}},
      );
      const first = result.current.renderOverlay;
      rerender({showOn: 'always'});
      expect(result.current.renderOverlay).not.toBe(first);
    });
  });
});

/**
 * StyleX emits OverlayRegion's open placement as inline custom properties
 * (`--x-left`, `--x-width`, ...) consumed by its atomic classes; jsdom does
 * not resolve them, so placement is read from those properties. Preset and
 * open geometry in a real browser is asserted in the Overlay region story's
 * play function.
 */
function placementOf(region: HTMLElement) {
  const read = (name: string) => region.style.getPropertyValue(`--x-${name}`);
  return {
    left: read('left'),
    top: read('top'),
    width: read('width'),
    height: read('height'),
  };
}

/** Renders regions in a fill Overlay's content, where they are placed. */
function renderInFill(regions: ReactNode) {
  return render(
    <Overlay scrim={false} content={regions}>
      <div />
    </Overlay>,
  );
}

function regionOf(text: string): HTMLElement {
  const region = screen.getByText(text).parentElement;
  if (region === null) {
    throw new Error(`${text} has no region`);
  }
  return region;
}

describe('OverlayRegion', () => {
  describe('open axis resolution (top-left corner)', () => {
    it('starts a sized region at its coordinate when it fits', () => {
      expect(resolveOverlayRegionAxis(0.1, 0.8)).toEqual({
        start: 0.1,
        size: 0.8,
      });
    });

    it('keeps a sized region wholly inside the surface near the far edge', () => {
      expect(resolveOverlayRegionAxis(0.9, 0.3).start).toBeCloseTo(0.7);
      expect(resolveOverlayRegionAxis(1, 0.25).start).toBeCloseTo(0.75);
    });

    it('starts a content-sized region at its coordinate, unshifted', () => {
      expect(resolveOverlayRegionAxis(0.98, undefined)).toEqual({
        start: 0.98,
        size: null,
      });
    });

    it('clamps coordinates and sizes into 0–1', () => {
      expect(resolveOverlayRegionAxis(1.4, undefined).start).toBe(1);
      expect(resolveOverlayRegionAxis(-0.2, 0.3).start).toBe(0);
      expect(resolveOverlayRegionAxis(0.5, 2)).toEqual({start: 0, size: 1});
    });

    it('treats a non-finite coordinate as 0 and a non-finite size as omitted', () => {
      expect(resolveOverlayRegionAxis(Number.NaN, 0.2)).toEqual({
        start: 0,
        size: 0.2,
      });
      expect(resolveOverlayRegionAxis(0.4, Number.POSITIVE_INFINITY)).toEqual({
        start: 0.4,
        size: null,
      });
    });
  });

  describe('rendering', () => {
    it('renders inside the scrim, so it inherits reveal and media theme', () => {
      const {container} = render(
        <Overlay
          scrim={false}
          content={
            <OverlayRegion position="top-start">
              <span>badge</span>
            </OverlayRegion>
          }>
          <div />
        </Overlay>,
      );
      expect(getScrim(container)).toContainElement(screen.getByText('badge'));
    });

    it('renders inside a useOverlay host scrim', () => {
      function Host() {
        const overlay = useOverlay({
          scrim: false,
          content: (
            <OverlayRegion position={{x: 0.3, y: 0.6}}>
              <span>tag</span>
            </OverlayRegion>
          ),
        });
        return <div {...overlay.containerProps}>{overlay.element}</div>;
      }
      const {container} = render(<Host />);
      expect(getScrim(container)).toContainElement(screen.getByText('tag'));
    });

    it('places an open sized region by its top-left corner, in fractions', () => {
      renderInFill(
        <OverlayRegion position={{x: 0.1, y: 0.04, width: 0.8, height: 0.16}}>
          <span>caption</span>
        </OverlayRegion>,
      );
      expect(placementOf(regionOf('caption'))).toEqual({
        left: '10%',
        top: '4%',
        width: '80%',
        height: '16%',
      });
    });

    it('clamps an open sized region inside the surface', () => {
      renderInFill(
        <OverlayRegion position={{x: 0.9, y: 0.95, width: 0.4, height: 0.2}}>
          <span>caption</span>
        </OverlayRegion>,
      );
      expect(placementOf(regionOf('caption'))).toMatchObject({
        left: '60%',
        top: '80%',
      });
    });

    it('fits an open content-sized region to its content from its point', () => {
      renderInFill(
        <OverlayRegion position={{x: 0.25, y: 0.75}}>
          <span>pin</span>
        </OverlayRegion>,
      );
      expect(placementOf(regionOf('pin'))).toEqual({
        left: '25%',
        top: '75%',
        width: 'max-content',
        height: 'auto',
      });
    });

    it('measures open placement from the left edge in right-to-left', () => {
      render(
        <div dir="rtl">
          <Overlay
            scrim={false}
            content={
              <OverlayRegion position={{x: 0.2, y: 0.5, width: 0.2}}>
                <span>tag</span>
              </OverlayRegion>
            }>
            <div />
          </Overlay>
        </div>,
      );
      expect(placementOf(regionOf('tag')).left).toBe('20%');
    });

    it('places presets without open-placement values', () => {
      renderInFill(
        <>
          <OverlayRegion position="top">
            <span>top</span>
          </OverlayRegion>
          <OverlayRegion position="bottom-end">
            <span>corner</span>
          </OverlayRegion>
        </>,
      );
      expect(placementOf(regionOf('top')).left).toBe('');
      expect(placementOf(regionOf('corner')).left).toBe('');
      expect(regionOf('top').className).not.toBe(regionOf('corner').className);
    });

    it('is not placed inside a top or bottom strip, and warns once', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        render(
          <Overlay
            position="bottom"
            content={
              <OverlayRegion position={{x: 0.1, y: 0.1, width: 0.5}}>
                <span>caption</span>
              </OverlayRegion>
            }>
            <div />
          </Overlay>,
        );
        expect(placementOf(regionOf('caption')).left).toBe('');
        expect(warn).toHaveBeenCalledTimes(1);
        expect(String(warn.mock.calls[0][0])).toContain('position="fill"');
      } finally {
        warn.mockRestore();
      }
    });

    it('is not placed outside any Overlay or in its children, and warns', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        render(
          <>
            <OverlayRegion position={{x: 0.4, y: 0.4, width: 0.2}}>
              <span>loose</span>
            </OverlayRegion>
            <Overlay content={<span>overlay content</span>}>
              <OverlayRegion position="center">
                <span>in children</span>
              </OverlayRegion>
            </Overlay>
          </>,
        );
        expect(placementOf(regionOf('loose')).left).toBe('');
        expect(warn).toHaveBeenCalledTimes(2);
      } finally {
        warn.mockRestore();
      }
    });

    it('is not placed in the children of an Overlay nested in fill content', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        renderInFill(
          <Overlay content={<span>inner content</span>}>
            <OverlayRegion position={{x: 0.3, y: 0.3, width: 0.2}}>
              <span>nested child</span>
            </OverlayRegion>
          </Overlay>,
        );
        expect(placementOf(regionOf('nested child')).left).toBe('');
        expect(warn).toHaveBeenCalledTimes(1);
      } finally {
        warn.mockRestore();
      }
    });

    it('does not warn inside a fill overlay', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        render(
          <Overlay
            content={
              <OverlayRegion position="center">
                <span>caption</span>
              </OverlayRegion>
            }>
            <div />
          </Overlay>,
        );
        expect(warn).not.toHaveBeenCalled();
      } finally {
        warn.mockRestore();
      }
    });

    it('adds no role, name, text, or focus stop', () => {
      renderInFill(
        <OverlayRegion position="center">
          <span>caption</span>
        </OverlayRegion>,
      );
      const region = regionOf('caption');
      expect(region.getAttributeNames().sort()).toEqual(['class']);
      expect(region.textContent).toBe('caption');
    });

    it('attaches no pointer or keyboard behavior of its own', () => {
      renderInFill(
        <OverlayRegion position={{x: 0.5, y: 0.5}}>
          <span>caption</span>
        </OverlayRegion>,
      );
      const region = regionOf('caption');
      const before = placementOf(region);
      fireEvent.pointerDown(region, {clientX: 10, clientY: 10});
      fireEvent.pointerMove(region, {clientX: 80, clientY: 80});
      fireEvent.pointerUp(region);
      fireEvent.keyDown(region, {key: 'ArrowRight'});
      expect(placementOf(region)).toEqual(before);
    });

    it('is hidden and inert with closed overlay content', () => {
      const {container} = render(
        <Overlay
          scrim={false}
          isOpen={false}
          content={
            <OverlayRegion position="center">
              <button type="button">Move caption</button>
            </OverlayRegion>
          }>
          <div />
        </Overlay>,
      );
      expect(getScrim(container)).toHaveAttribute('inert');
    });

    it('forwards ref and composes caller styling inputs', () => {
      const ref = createRef<HTMLDivElement>();
      renderInFill(
        <OverlayRegion
          ref={ref}
          position={{x: 0.5, y: 0.5}}
          className="caller"
          style={{outlineWidth: 2}}>
          <span>caption</span>
        </OverlayRegion>,
      );
      expect(ref.current).toBe(regionOf('caption'));
      expect(ref.current).toHaveClass('caller');
      expect(ref.current?.style.outlineWidth).toBe('2px');
      expect(ref.current ? placementOf(ref.current).left : null).toBe('50%');
    });
  });
});
