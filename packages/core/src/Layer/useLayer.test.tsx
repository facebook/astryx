// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useLayer.test.tsx
 * @input Uses vitest, @testing-library/react, useLayer hook
 * @output Tests for useLayer show/hide feature-detection guards and context-mode positioning
 * @position Testing; validates useLayer.tsx implementation
 *
 * SYNC: When useLayer.tsx changes, update tests accordingly
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import {
  render,
  renderHook,
  act,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as stylex from '@stylexjs/stylex';
import {
  useKeepLayerOpenProps,
  useLayer,
  useLayerInternal,
  getPositionTryFallbacks,
  getSelfAlignment,
} from './useLayer';
import {typeScaleVars} from '../theme/tokens.stylex';
import type {
  LayerPlacement,
  LayerAlignment,
  ContextRenderProps,
  ContextLayerReturn,
  FixedLayerReturn,
} from './useLayer';

function mockCSSStyleDeclaration(
  styles: Partial<CSSStyleDeclaration>,
): CSSStyleDeclaration {
  return styles as CSSStyleDeclaration;
}

/**
 * Minimal harness that exposes the imperative show/hide callbacks and renders
 * the layer element so tests can assert on visibility.
 */
function LayerHarness({
  onReady,
}: {
  onReady: (api: {show: () => void; hide: () => void}) => void;
}) {
  const layer = useLayer({mode: 'fixed'});
  onReady({show: layer.show, hide: layer.hide});
  return <>{layer.render(<span>Layer content</span>, {x: 0, y: 0})}</>;
}

/**
 * Context-mode harness: renders a trigger plus the layer so tests can assert
 * on the anchor-positioning styles applied to the popover element.
 */
function ContextLayerHarness({
  placement,
  alignment,
}: {
  placement?: LayerPlacement;
  alignment?: LayerAlignment;
}) {
  const layer = useLayer({mode: 'context'});
  return (
    <>
      <button type="button" ref={layer.ref} onClick={layer.show}>
        Trigger
      </button>
      {layer.render(<span>Layer content</span>, {placement, alignment})}
    </>
  );
}

function ContextHostingHarness({
  unsafe,
  themeColor,
  direction,
  writingMode,
}: {
  unsafe?: boolean;
  themeColor?: string;
  direction?: React.CSSProperties['direction'];
  writingMode?: React.CSSProperties['writingMode'];
}) {
  const layer = useLayer({mode: 'context', lazyMount: true});
  const contents = (
    <>
      <button type="button" ref={layer.ref} onClick={layer.show}>
        Trigger
      </button>
      {layer.render(<button type="button">Layer action</button>)}
      <button type="button">Following control</button>
    </>
  );

  const hostStyle = {
    ...(themeColor ? {'--test-layer-color': themeColor} : {}),
    direction,
    writingMode,
  } as React.CSSProperties;

  return (
    <div data-testid="host" style={hostStyle}>
      {unsafe ? <p>{contents}</p> : contents}
    </div>
  );
}

function RelocatingContextHostingHarness({unsafe}: {unsafe: boolean}) {
  const layer = useLayer({mode: 'context'});
  const renderedLayer = layer.render(<span>Layer content</span>);

  return unsafe ? (
    <div data-testid="unsafe-host">
      <p>{renderedLayer}</p>
    </div>
  ) : (
    <section data-testid="render-position">{renderedLayer}</section>
  );
}

function RelocatingOpenContextHostingHarness({
  unsafe,
  onShow,
}: {
  unsafe: boolean;
  onShow?: () => void;
}) {
  const layer = useLayer({mode: 'context', lazyMount: true, onShow});
  const renderedLayer = layer.render(
    <button type="button">Layer action</button>,
  );

  return (
    <>
      <button type="button" ref={layer.ref} onClick={layer.show}>
        Trigger
      </button>
      {unsafe ? (
        <div data-testid="unsafe-host">
          <p>{renderedLayer}</p>
        </div>
      ) : (
        <section data-testid="safe-host">{renderedLayer}</section>
      )}
    </>
  );
}

describe('useLayer identity', () => {
  it('keeps the context ref and API object stable across rerenders', () => {
    const {result, rerender} = renderHook(() => useLayer({mode: 'context'}));
    const first = result.current;

    rerender();

    expect(result.current.ref).toBe(first.ref);
    expect(result.current).toBe(first);
  });

  it('keeps the context ref stable when callbacks change', () => {
    const firstOnShow = vi.fn();
    const secondOnShow = vi.fn();
    const {result, rerender} = renderHook(
      ({onShow}: {onShow: () => void}) => useLayer({mode: 'context', onShow}),
      {initialProps: {onShow: firstOnShow}},
    );
    const first = result.current;
    const firstRef = result.current.ref;

    rerender({onShow: secondOnShow});

    expect(result.current).not.toBe(first);
    expect(result.current.ref).toBe(firstRef);
  });

  it('keeps the fixed API object stable across rerenders', () => {
    const {result, rerender} = renderHook(() => useLayer({mode: 'fixed'}));
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});

describe('getPositionTryFallbacks (issue #3671, spec:AST-059 FR4)', () => {
  const RULE = /^--[\w-]+$/;
  const split = (list: string) => list.split(', ');
  const alignTactic = (placement: LayerPlacement) =>
    placement === 'above' || placement === 'below'
      ? 'flip-inline'
      : 'flip-block';

  it('leads with the placement-axis flip as a named option, then the alignment-axis tactic alone and composed', () => {
    for (const placement of ['above', 'below', 'start', 'end'] as const) {
      for (const alignment of ['start', 'center', 'end'] as const) {
        const [flip, tactic, both] = split(
          getPositionTryFallbacks(placement, alignment),
        );
        expect(flip).toMatch(RULE);
        expect(tactic).toBe(alignTactic(placement));
        expect(both).toBe(`${flip} ${alignTactic(placement)}`);
      }
    }
  });

  it('appends four slide options for centered layers and none for aligned ones, then one span option last', () => {
    for (const placement of ['above', 'below', 'start', 'end'] as const) {
      for (const alignment of ['start', 'center', 'end'] as const) {
        const items = split(getPositionTryFallbacks(placement, alignment));
        expect(items.length).toBe(alignment === 'center' ? 8 : 4);
        for (const item of items.slice(3)) {
          expect(item).toMatch(RULE);
        }
        expect(new Set(items).size).toBe(items.length);
      }
    }
  });

  it('gives each placement/alignment pair its own flip option and shares slide and span options where the geometry is the same', () => {
    const flipOf = (p: LayerPlacement, a: LayerAlignment) =>
      split(getPositionTryFallbacks(p, a))[0];
    // Twelve distinct flips: the option carries the full position-area.
    const flips = new Set<string>();
    for (const placement of ['above', 'below', 'start', 'end'] as const) {
      for (const alignment of ['start', 'center', 'end'] as const) {
        flips.add(flipOf(placement, alignment));
      }
    }
    expect(flips.size).toBe(12);
    // Above and below centered layers slide through the same four span
    // options, same side first.
    const above = split(getPositionTryFallbacks('above', 'center')).slice(3, 7);
    const below = split(getPositionTryFallbacks('below', 'center')).slice(3, 7);
    expect(below).toEqual([...above.slice(2), ...above.slice(0, 2)]);
    const start = split(getPositionTryFallbacks('start', 'center')).slice(3, 7);
    const end = split(getPositionTryFallbacks('end', 'center')).slice(3, 7);
    expect(end).toEqual([...start.slice(2), ...start.slice(0, 2)]);
  });

  it('defaults to above/center when called without arguments (matches renderContext defaults)', () => {
    expect(getPositionTryFallbacks()).toBe(
      getPositionTryFallbacks('above', 'center'),
    );
    expect(getPositionTryFallbacks(undefined, undefined)).toBe(
      getPositionTryFallbacks('above', 'center'),
    );
  });

  it('updates the fallback list when placement/alignment props change on re-render', async () => {
    const user = userEvent.setup();
    const {container, rerender} = render(
      <ContextLayerHarness placement="above" alignment="center" />,
    );
    await user.click(container.querySelector('button')!);
    const layerEl = container.querySelector('[popover]') as HTMLElement;
    expect(layerEl.style.positionTryFallbacks).toBe(
      getPositionTryFallbacks('above', 'center'),
    );

    rerender(<ContextLayerHarness placement="above" alignment="start" />);
    expect(layerEl.style.positionTryFallbacks).toBe(
      getPositionTryFallbacks('above', 'start'),
    );

    rerender(<ContextLayerHarness placement="start" alignment="center" />);
    expect(layerEl.style.positionTryFallbacks).toBe(
      getPositionTryFallbacks('start', 'center'),
    );
  });

  it('does not apply anchor fallbacks in fixed mode (manual coordinates)', () => {
    function FixedHarness() {
      const layer = useLayer({mode: 'fixed'});
      return <>{layer.render(<span>Fixed content</span>, {x: 10, y: 20})}</>;
    }
    const {container} = render(<FixedHarness />);
    const layerEl = container.querySelector('[popover]') as HTMLElement;
    expect(layerEl.style.positionTryFallbacks ?? '').toBeFalsy();
    expect(layerEl.style.left).toBe('10px');
    expect(layerEl.style.top).toBe('20px');
  });

  it('applies the default (above/center) fallback list to the rendered popover', async () => {
    const user = userEvent.setup();
    const {container} = render(<ContextLayerHarness />);
    await user.click(container.querySelector('button')!);
    const layerEl = container.querySelector('[popover]') as HTMLElement;
    expect(layerEl).not.toBeNull();
    expect(layerEl.style.positionTryFallbacks).toBe(
      getPositionTryFallbacks('above', 'center'),
    );
  });
});

describe('viewport inset (spec:AST-059)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('caps every anchor-mode layer on the placement axis and keeps the far-edge gutter of its alignment axis (FR1, FR3)', async () => {
    const user = userEvent.setup();
    const cases: [LayerPlacement, LayerAlignment, string[], string[]][] = [
      [
        'below',
        'start',
        ['insetBelow', 'gutterInlineEnd'],
        ['gutterInlineStart', 'insetAbove'],
      ],
      [
        'below',
        'end',
        ['insetBelow', 'gutterInlineStart'],
        ['gutterInlineEnd'],
      ],
      [
        'above',
        'center',
        ['insetAbove', 'gutterInlineStart', 'gutterInlineEnd'],
        ['insetBelow'],
      ],
      [
        'end',
        'start',
        ['insetEnd', 'gutterBlockEnd'],
        ['gutterBlockStart', 'insetStart'],
      ],
      ['start', 'end', ['insetStart', 'gutterBlockStart'], ['gutterBlockEnd']],
      ['end', 'center', ['insetEnd', 'gutterBlockStart', 'gutterBlockEnd'], []],
    ];
    for (const [placement, alignment, present, absent] of cases) {
      const {container, unmount} = render(
        <ContextLayerHarness placement={placement} alignment={alignment} />,
      );
      await user.click(container.querySelector('button')!);
      const layerEl = container.querySelector('[popover]') as HTMLElement;
      expect(layerEl.className).toContain('useLayer__styles.viewportFit');
      for (const key of present) {
        expect(layerEl.className).toContain(`useLayer__styles.${key}`);
      }
      for (const key of absent) {
        expect(layerEl.className).not.toContain(`useLayer__styles.${key}`);
      }
      // The gutter never caps the layer box's inline size: an auto-width
      // layer shrinks to the room beside its trigger on its own, and a cap on
      // the box keeps the browser from choosing a flip.
      expect(layerEl.className).not.toMatch(/useLayer__styles\.maxInline/);
      unmount();
    }
  });

  it('leaves custom and fixed positioning without the viewport fit (INV3)', () => {
    function CustomHarness() {
      const layer = useLayer({mode: 'context'});
      return (
        <>
          <button type="button" ref={layer.ref} onClick={layer.show}>
            Trigger
          </button>
          {layer.render(<span>Custom</span>, {positioning: 'custom'})}
        </>
      );
    }
    const {container} = render(<CustomHarness />);
    fireEvent.click(container.querySelector('button')!);
    const layerEl = container.querySelector('[popover]') as HTMLElement;
    expect(layerEl.className).not.toContain('useLayer__styles.viewportFit');
    expect(layerEl.className).not.toMatch(/useLayer__styles\.gutter/);
  });

  it('pins an aligned layer unsafe toward its anchor only while the anchor is out of view (FR4, FR5)', () => {
    expect(getSelfAlignment('below', 'start', true)).toEqual({});
    expect(getSelfAlignment('below', 'start', false)).toEqual({
      justifySelf: 'unsafe self-start',
    });
    expect(getSelfAlignment('above', 'end', false)).toEqual({
      justifySelf: 'unsafe self-end',
    });
    expect(getSelfAlignment('end', 'start', false)).toEqual({
      alignSelf: 'unsafe self-start',
    });
    expect(getSelfAlignment('start', 'end', false)).toEqual({
      alignSelf: 'unsafe self-end',
    });
    // Centered layers slide through their span fallbacks and never pin.
    expect(getSelfAlignment('below', 'center', false)).toEqual({});
  });

  it('withdraws the slide when the observed anchor leaves the viewport and restores it when it returns (FR5)', async () => {
    let notify!: IntersectionObserverCallback;
    const observed: Element[] = [];
    const disconnect = vi.fn();
    class Observer {
      constructor(callback: IntersectionObserverCallback) {
        notify = callback;
      }
      observe(target: Element) {
        observed.push(target);
      }
      unobserve() {}
      disconnect = disconnect;
      takeRecords() {
        return [];
      }
    }
    vi.stubGlobal('IntersectionObserver', Observer);

    const user = userEvent.setup();
    const {container} = render(
      <ContextLayerHarness placement="below" alignment="start" />,
    );
    const trigger = container.querySelector('button')!;
    await user.click(trigger);
    const layerEl = container.querySelector('[popover]') as HTMLElement;
    expect(observed).toEqual([trigger]);
    expect(layerEl.style.justifySelf).toBe('');

    act(() => {
      notify(
        [{isIntersecting: false} as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(layerEl.style.justifySelf).toBe('unsafe self-start');
    // The fallback list stays; only the slide is withdrawn.
    expect(layerEl.style.positionTryFallbacks).toBe(
      getPositionTryFallbacks('below', 'start'),
    );

    act(() => {
      notify(
        [{isIntersecting: true} as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(layerEl.style.justifySelf).toBe('');
  });
});

describe('useLayer', () => {
  const originalShowPopover = HTMLElement.prototype.showPopover;
  const originalHidePopover = HTMLElement.prototype.hidePopover;

  afterEach(() => {
    // Restore whatever the environment originally provided.
    if (originalShowPopover === undefined) {
      // @ts-expect-error - deleting to simulate original absence
      delete HTMLElement.prototype.showPopover;
    } else {
      HTMLElement.prototype.showPopover = originalShowPopover;
    }
    if (originalHidePopover === undefined) {
      // @ts-expect-error - deleting to simulate original absence
      delete HTMLElement.prototype.hidePopover;
    } else {
      HTMLElement.prototype.hidePopover = originalHidePopover;
    }
  });

  describe('context hosting', () => {
    it('keeps closed content mounted by default for existing consumers', () => {
      const {container} = render(<ContextLayerHarness />);

      expect(container.querySelector('template')).not.toBeNull();
      expect(container.querySelector('[popover]')).not.toBeNull();
      expect(container).toHaveTextContent('Layer content');
    });

    it('renders only an inert marker until show is requested', () => {
      const {container} = render(<ContextHostingHarness />);

      const sentinel = container.querySelector('template');
      expect(sentinel).not.toBeNull();
      expect(sentinel).not.toHaveAttribute('id');
      expect(container.querySelector('[popover]')).toBeNull();
      expect(container).not.toHaveTextContent('Layer action');
    });

    it('keeps the final layer inline when the JSX position is safe', async () => {
      HTMLElement.prototype.showPopover = vi.fn();
      const user = userEvent.setup();
      const {container, getByRole} = render(<ContextHostingHarness />);

      await user.click(getByRole('button', {name: 'Trigger'}));

      const layer = container.querySelector('[popover]');
      const following = getByRole('button', {name: 'Following control'});
      expect(layer?.parentElement).toBe(container.firstElementChild);
      expect(layer?.nextElementSibling).toBe(following);
      expect(container.querySelector('template')).not.toBeNull();
    });

    it('portals out of an unsafe parent and preserves its logical writing context', async () => {
      const getComputedStyleSpy = vi
        .spyOn(window, 'getComputedStyle')
        .mockImplementation(() =>
          mockCSSStyleDeclaration({
            getPropertyValue: () => '',
            direction: 'rtl',
            writingMode: 'vertical-rl',
          }),
        );
      const showSpy = vi.fn();
      HTMLElement.prototype.showPopover = showSpy;
      const user = userEvent.setup();

      try {
        const {container, getByRole} = render(<ContextHostingHarness unsafe />);
        const trigger = getByRole('button', {name: 'Trigger'});

        await user.click(trigger);

        const host = container.querySelector('[data-testid="host"]');
        const paragraph = container.querySelector('p');
        const layer = container.querySelector('[popover]') as HTMLElement;
        expect(layer.parentElement).toBe(host);
        expect(paragraph?.contains(layer)).toBe(false);
        expect(layer).toHaveStyle({
          direction: 'rtl',
          writingMode: 'vertical-rl',
        });
        expect(showSpy).toHaveBeenCalledWith({source: trigger});
      } finally {
        getComputedStyleSpy.mockRestore();
      }
    });

    it('inherits custom properties from the corrective host without freezing an inline snapshot', async () => {
      const originalGetComputedStyle = window.getComputedStyle.bind(window);
      const getComputedStyleSpy = vi
        .spyOn(window, 'getComputedStyle')
        .mockImplementation(element => {
          if (element.tagName.toLowerCase() !== 'template') {
            return originalGetComputedStyle(element);
          }
          return mockCSSStyleDeclaration({
            length: 1,
            item: () => '--test-layer-color',
            getPropertyValue: property =>
              property === '--test-layer-color' ? 'rgb(1, 2, 3)' : '',
            direction: 'ltr',
            writingMode: 'horizontal-tb',
          });
        });
      HTMLElement.prototype.showPopover = vi.fn();
      const user = userEvent.setup();
      try {
        const {container, getByRole, rerender} = render(
          <ContextHostingHarness unsafe themeColor="rgb(1, 2, 3)" />,
        );

        await user.click(getByRole('button', {name: 'Trigger'}));

        let host = container.querySelector(
          '[data-testid="host"]',
        ) as HTMLElement;
        let layer = container.querySelector('[popover]') as HTMLElement;
        expect(layer.parentElement).toBe(host);
        expect(layer.style.getPropertyValue('--test-layer-color')).toBe('');
        expect(host.style.getPropertyValue('--test-layer-color')).toBe(
          'rgb(1, 2, 3)',
        );

        rerender(<ContextHostingHarness unsafe themeColor="rgb(4, 5, 6)" />);

        host = container.querySelector('[data-testid="host"]') as HTMLElement;
        layer = container.querySelector('[popover]') as HTMLElement;
        expect(layer.parentElement).toBe(host);
        expect(layer.style.getPropertyValue('--test-layer-color')).toBe('');
        expect(host.style.getPropertyValue('--test-layer-color')).toBe(
          'rgb(4, 5, 6)',
        );
      } finally {
        getComputedStyleSpy.mockRestore();
      }
    });

    it('keeps a shared writing context inheriting live from the corrective host', async () => {
      const getComputedStyleSpy = vi
        .spyOn(window, 'getComputedStyle')
        .mockImplementation(element => {
          const htmlElement = element as HTMLElement;
          const host = htmlElement.matches('[data-testid="host"]')
            ? htmlElement
            : htmlElement.closest<HTMLElement>('[data-testid="host"]');
          return mockCSSStyleDeclaration({
            getPropertyValue: () => '',
            direction: host?.style.direction || 'ltr',
            writingMode: host?.style.writingMode || 'horizontal-tb',
          });
        });
      HTMLElement.prototype.showPopover = vi.fn();
      const user = userEvent.setup();

      try {
        const {container, getByRole, rerender} = render(
          <ContextHostingHarness
            unsafe
            direction="rtl"
            writingMode="vertical-rl"
          />,
        );

        await user.click(getByRole('button', {name: 'Trigger'}));

        let layer = container.querySelector('[popover]') as HTMLElement;
        expect(layer.style.direction).toBe('');
        expect(layer.style.writingMode).toBe('');
        expect(window.getComputedStyle(layer).direction).toBe('rtl');

        rerender(
          <ContextHostingHarness
            unsafe
            direction="ltr"
            writingMode="horizontal-tb"
          />,
        );

        layer = container.querySelector('[popover]') as HTMLElement;
        expect(layer.style.direction).toBe('');
        expect(layer.style.writingMode).toBe('');
        expect(window.getComputedStyle(layer).direction).toBe('ltr');
      } finally {
        getComputedStyleSpy.mockRestore();
      }
    });

    it('re-resolves the host when a persistent render call moves', () => {
      const {container, rerender} = render(
        <RelocatingContextHostingHarness unsafe />,
      );

      const host = container.querySelector('[data-testid="unsafe-host"]');
      const paragraph = container.querySelector('p');
      let layer = container.querySelector('[popover]');
      expect(layer?.parentElement).toBe(host);
      expect(paragraph?.contains(layer)).toBe(false);

      rerender(<RelocatingContextHostingHarness unsafe={false} />);

      const section = container.querySelector('section');
      layer = container.querySelector('[popover]');
      expect(layer?.parentElement).toBe(section);
      expect(section?.querySelector('template')).not.toBeNull();
    });

    it('reopens an open lazy layer after its render call moves', async () => {
      const showSpy = vi.fn(function (this: HTMLElement) {
        if (!this.isConnected) {
          throw new Error('showPopover called on a detached layer');
        }
        this.dataset.open = 'true';
      });
      const onShow = vi.fn();
      HTMLElement.prototype.showPopover = showSpy;
      const {container, getByRole, rerender} = render(
        <RelocatingOpenContextHostingHarness unsafe onShow={onShow} />,
      );

      fireEvent.click(getByRole('button', {name: 'Trigger'}));

      await waitFor(() => {
        expect(container.querySelector('[popover]')).toHaveAttribute(
          'data-open',
          'true',
        );
      });

      rerender(
        <RelocatingOpenContextHostingHarness unsafe={false} onShow={onShow} />,
      );

      await waitFor(() => {
        const layer = container.querySelector('[popover]');
        expect(layer?.parentElement).toBe(
          container.querySelector('[data-testid="safe-host"]'),
        );
        expect(layer).toHaveAttribute('data-open', 'true');
      });
      expect(showSpy).toHaveBeenCalledTimes(2);
      expect(onShow).toHaveBeenCalledOnce();
    });
  });

  describe('when the Popover API is supported', () => {
    it('calls showPopover/hidePopover on show/hide', () => {
      const showSpy = vi.fn();
      const hideSpy = vi.fn();
      HTMLElement.prototype.showPopover = showSpy;
      HTMLElement.prototype.hidePopover = hideSpy;

      let api: {show: () => void; hide: () => void} = {
        show: () => {},
        hide: () => {},
      };
      render(<LayerHarness onReady={a => (api = a)} />);

      act(() => api.show());
      expect(showSpy).toHaveBeenCalledTimes(1);

      act(() => api.hide());
      expect(hideSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the Popover API is unsupported (Safari <17 / Firefox <125)', () => {
    it('show() does not throw when showPopover is undefined and the layer becomes visible', () => {
      // Simulate a browser without the Popover API (finding infra-4).
      // @ts-expect-error - simulate missing API
      delete HTMLElement.prototype.showPopover;
      // @ts-expect-error - simulate missing API
      delete HTMLElement.prototype.hidePopover;

      let api: {show: () => void; hide: () => void} = {
        show: () => {},
        hide: () => {},
      };
      const {container} = render(<LayerHarness onReady={a => (api = a)} />);

      const layerEl = container.querySelector('[popover]') as HTMLElement;
      expect(layerEl).not.toBeNull();

      expect(() => act(() => api.show())).not.toThrow();
      // Falls back to plain visibility so the layer is still usable.
      expect(layerEl.style.display).toBe('block');
    });

    it('hide() does not throw when hidePopover is undefined and the layer is hidden', () => {
      // @ts-expect-error - simulate missing API
      delete HTMLElement.prototype.showPopover;
      // @ts-expect-error - simulate missing API
      delete HTMLElement.prototype.hidePopover;

      let api: {show: () => void; hide: () => void} = {
        show: () => {},
        hide: () => {},
      };
      const {container} = render(<LayerHarness onReady={a => (api = a)} />);
      const layerEl = container.querySelector('[popover]') as HTMLElement;

      act(() => api.show());
      expect(() => act(() => api.hide())).not.toThrow();
      expect(layerEl.style.display).toBe('none');
    });
  });
});

/**
 * Harness that owns the trigger element.
 */
function Harness({
  placement,
  alignment,
  triggerStyle,
  triggerDir,
}: {
  placement: LayerPlacement;
  alignment: LayerAlignment;
  triggerStyle?: React.CSSProperties;
  triggerDir?: string;
}) {
  const layer = useLayer({mode: 'context'});
  return (
    <>
      <button
        type="button"
        ref={layer.ref}
        dir={triggerDir}
        style={triggerStyle}
        onClick={layer.isOpen ? layer.hide : layer.show}>
        trigger
      </button>
      {layer.render(<span>content</span>, {placement, alignment})}
    </>
  );
}

async function openAndGetStyle(ui: React.ReactElement): Promise<string> {
  const user = userEvent.setup();
  const {container, getByRole} = render(ui);
  await user.click(getByRole('button', {name: 'trigger'}));
  const popover = container.querySelector('[popover]');
  return popover?.getAttribute('style') ?? '';
}

describe('typography baseline', () => {
  const overrideStyles = stylex.create({
    supporting: {fontSize: typeScaleVars['--text-supporting-size']},
  });

  function TypographyHarness({
    ambientFontSize,
    xstyle,
  }: {
    ambientFontSize: string;
    xstyle?: ContextRenderProps['xstyle'];
  }) {
    const layer = useLayer({mode: 'context'});
    return (
      <div style={{fontSize: ambientFontSize, lineHeight: '3'}}>
        <button type="button" ref={layer.ref} onClick={layer.show}>
          trigger
        </button>
        {layer.render(<span>content</span>, {xstyle})}
      </div>
    );
  }

  async function openAndGetType(ui: React.ReactElement) {
    const user = userEvent.setup();
    const {container, getByRole} = render(ui);
    await user.click(getByRole('button', {name: 'trigger'}));
    const el = container.querySelector('[popover]') as HTMLElement;
    const computed = window.getComputedStyle(el);
    return {fontSize: computed.fontSize, lineHeight: computed.lineHeight};
  }

  // jsdom resolves no var() indirection, so the token reference is what the
  // assertion can see — the point is that a declaration exists at all, since
  // an absent one is exactly what let the ambient size through.
  it.each(['13px', '20px'])(
    'takes the body role rather than the surrounding %s',
    async ambientFontSize => {
      expect(
        await openAndGetType(
          <TypographyHarness ambientFontSize={ambientFontSize} />,
        ),
      ).toEqual({
        fontSize: 'var(--text-body-size)',
        lineHeight: 'var(--text-body-leading)',
      });
    },
  );

  it('still lets a consumer xstyle set its own size', async () => {
    const {fontSize} = await openAndGetType(
      <TypographyHarness
        ambientFontSize="13px"
        xstyle={overrideStyles.supporting}
      />,
    );
    expect(fontSize).toBe('var(--text-supporting-size)');
  });
});

describe('useLayer context positioning', () => {
  // The mapping uses the self-* logical keyword family, so the emitted
  // string is direction-independent by construction: the browser resolves
  // the inline axis against the popover's own inherited direction, and RTL
  // mirrors with no JS. jsdom has no layout engine, so these tests can only
  // assert the emitted string — the actual RTL geometry is covered by the
  // RTL Storybook story (and was verified against the full 12-cell matrix
  // in a real browser).
  describe('self-* position-area mapping', () => {
    it.each([
      // [placement, alignment, expected position-area]
      ['above', 'start', 'self-block-start span-self-inline-end'],
      ['above', 'center', 'self-block-start'],
      ['above', 'end', 'self-block-start span-self-inline-start'],
      ['below', 'start', 'self-block-end span-self-inline-end'],
      ['below', 'center', 'self-block-end'],
      ['below', 'end', 'self-block-end span-self-inline-start'],
      ['start', 'start', 'self-inline-start span-self-block-end'],
      ['start', 'center', 'self-inline-start'],
      ['start', 'end', 'self-inline-start span-self-block-start'],
      ['end', 'start', 'self-inline-end span-self-block-end'],
      ['end', 'center', 'self-inline-end'],
      ['end', 'end', 'self-inline-end span-self-block-start'],
    ] as const)(
      'placement=%s alignment=%s emits position-area %s',
      async (placement, alignment, expectedArea) => {
        const style = await openAndGetStyle(
          <Harness placement={placement} alignment={alignment} />,
        );
        expect(style).toMatch(
          new RegExp(`position-area: ${expectedArea}(;|$)`),
        );
        expect(style).not.toContain('justify-self');
      },
    );

    it('emits the same string regardless of trigger direction', async () => {
      const user = userEvent.setup();
      const first = render(<Harness placement="below" alignment="start" />);
      await user.click(first.getByRole('button', {name: 'trigger'}));
      const ltr =
        first.container.querySelector('[popover]')?.getAttribute('style') ?? '';
      first.unmount();

      const second = render(
        <Harness
          placement="below"
          alignment="start"
          triggerDir="rtl"
          triggerStyle={{direction: 'rtl'}}
        />,
      );
      await user.click(second.getByRole('button', {name: 'trigger'}));
      const rtl =
        second.container.querySelector('[popover]')?.getAttribute('style') ??
        '';
      // The unique position-anchor id differs per render; the placement
      // mapping must not.
      const positionArea = (s: string) => s.match(/position-area:[^;]*/)?.[0];
      expect(positionArea(rtl)).toBeDefined();
      expect(positionArea(rtl)).toBe(positionArea(ltr));
    });

    it('keeps position-try fallbacks intact', async () => {
      const style = await openAndGetStyle(
        <Harness placement="below" alignment="start" />,
      );
      expect(style).toContain(
        `position-try-fallbacks: ${getPositionTryFallbacks('below', 'start')}`,
      );
    });
  });

  describe("positioning='custom' (consumer-authored position styles)", () => {
    // Consumers like Carousel and Tokenizer keep useLayer's popover behavior
    // and anchor wiring but position the layer themselves. The opt-out must
    // suppress every placement-derived style — position-area and the try
    // fallbacks — so those consumers never need to know which properties
    // the hook would have emitted.
    function CustomHarness({
      triggerStyle,
      renderProps,
    }: {
      triggerStyle?: React.CSSProperties;
      renderProps: ContextRenderProps;
    }) {
      const layer = useLayer({mode: 'context'});
      return (
        <>
          <button
            type="button"
            ref={layer.ref}
            style={triggerStyle}
            onClick={layer.isOpen ? layer.hide : layer.show}>
            trigger
          </button>
          {layer.render(<span>content</span>, renderProps)}
        </>
      );
    }

    it('keeps the anchor wiring but derives no placement styles', async () => {
      const style = await openAndGetStyle(
        <CustomHarness
          renderProps={{
            positioning: 'custom',
            style: {positionArea: 'center'},
          }}
        />,
      );
      expect(style).toContain('position-anchor');
      // The consumer-authored area is the only one present…
      expect(style).toContain('position-area: center');
      // …and no placement-derived styles leak through.
      expect(style).not.toContain('position-try-fallbacks');
    });

    it('ignores placement and alignment when positioning is custom', async () => {
      // placement/alignment are documented as ignored under custom. Derived
      // output would be position-area "self-block-end span-self-inline-end";
      // none of it may appear.
      const style = await openAndGetStyle(
        <CustomHarness
          renderProps={{
            positioning: 'custom',
            placement: 'below',
            alignment: 'start',
            style: {positionArea: 'center'},
          }}
        />,
      );
      expect(style).toContain('position-anchor');
      expect(style).toContain('position-area: center');
      expect(style).not.toContain('self-block');
      expect(style).not.toContain('position-try-fallbacks');
    });

    it('emits only the anchor wiring when custom positioning passes no style at all', async () => {
      // The strongest suppression probe: with no consumer style in the merge
      // (Tokenizer's insets-only shape reduces to this in jsdom), nothing can
      // clobber a leaked derived value — any position-area or try-fallbacks
      // in the output is a genuine leak.
      const style = await openAndGetStyle(
        <CustomHarness renderProps={{positioning: 'custom'}} />,
      );
      expect(style).toContain('position-anchor');
      expect(style).not.toContain('position-area');
      expect(style).not.toContain('position-try-fallbacks');
    });
  });

  describe('offset', () => {
    function OffsetHarness({
      placement,
      offset,
      positioning,
    }: {
      placement?: LayerPlacement;
      offset?: number | string;
      positioning?: 'anchor' | 'custom';
    }) {
      const layer = useLayer({mode: 'context'});
      return (
        <>
          <button type="button" ref={layer.ref} onClick={layer.show}>
            trigger
          </button>
          {layer.render(<span>content</span>, {
            placement,
            offset,
            positioning,
          })}
        </>
      );
    }

    // Debug-mode StyleX variable names for the dynamic offset style, as in
    // Grid.test.tsx. jsdom resolves neither the var indirection nor logical
    // margin properties, so the declarations themselves are the assertion.
    async function openAndGetOffsets(ui: React.ReactElement) {
      const user = userEvent.setup();
      const {container, getByRole} = render(ui);
      await user.click(getByRole('button', {name: 'trigger'}));
      const el = container.querySelector('[popover]') as HTMLElement;
      const read = (prop: string) => el.style.getPropertyValue(`--x-${prop}`);
      return {
        blockStart: read('marginBlockStart'),
        blockEnd: read('marginBlockEnd'),
        inlineStart: read('marginInlineStart'),
        inlineEnd: read('marginInlineEnd'),
      };
    }

    const NONE = {blockStart: '', blockEnd: '', inlineStart: '', inlineEnd: ''};

    it('is flush by default', async () => {
      expect(
        await openAndGetOffsets(<OffsetHarness placement="below" />),
      ).toEqual(NONE);
    });

    // Both edges of the axis, so the gap survives a position-try-fallbacks
    // flip to the opposite side (#4803).
    it('clears both block edges for a block placement', async () => {
      expect(
        await openAndGetOffsets(<OffsetHarness placement="above" offset={8} />),
      ).toEqual({...NONE, blockStart: '8px', blockEnd: '8px'});
    });

    it('clears both inline edges for an inline placement', async () => {
      expect(
        await openAndGetOffsets(<OffsetHarness placement="end" offset={8} />),
      ).toEqual({...NONE, inlineStart: '8px', inlineEnd: '8px'});
    });

    it('takes a CSS length string', async () => {
      expect(
        await openAndGetOffsets(
          <OffsetHarness placement="below" offset="var(--spacing-1)" />,
        ),
      ).toEqual({
        ...NONE,
        blockStart: 'var(--spacing-1)',
        blockEnd: 'var(--spacing-1)',
      });
    });

    it('is ignored under custom positioning, which owns its own insets', async () => {
      expect(
        await openAndGetOffsets(
          <OffsetHarness placement="below" offset={8} positioning="custom" />,
        ),
      ).toEqual(NONE);
    });
  });

  it('fixed mode emits no anchor-positioning styles', async () => {
    function FixedHarness() {
      const layer = useLayer({mode: 'fixed'});
      return (
        <>
          <button type="button" onClick={layer.show}>
            opener
          </button>
          {layer.render(<span>content</span>, {x: 10, y: 20})}
        </>
      );
    }

    const user = userEvent.setup();
    const {container, getByRole} = render(<FixedHarness />);
    await user.click(getByRole('button', {name: 'opener'}));

    const style =
      container.querySelector('[popover]')?.getAttribute('style') ?? '';
    expect(style).not.toContain('position-area');
    expect(style).not.toContain('position-anchor');
  });
});

describe('useLayer public return types', () => {
  it('keeps dismissal helpers internal', () => {
    const contextHasKeepOpenProps: 'keepOpenProps' extends keyof ContextLayerReturn
      ? true
      : false = false;
    const fixedHasKeepOpenProps: 'keepOpenProps' extends keyof FixedLayerReturn
      ? true
      : false = false;
    const contextHasGuard: 'wasJustDismissed' extends keyof ContextLayerReturn
      ? true
      : false = false;
    const fixedHasGuard: 'wasJustDismissed' extends keyof FixedLayerReturn
      ? true
      : false = false;

    expect(contextHasKeepOpenProps).toBe(false);
    expect(fixedHasKeepOpenProps).toBe(false);
    expect(contextHasGuard).toBe(false);
    expect(fixedHasGuard).toBe(false);
  });
});

describe('internal keep-open props (controls on the trigger, #5004)', () => {
  function ClearableTriggerHarness() {
    const layer = useLayer({mode: 'context'});
    const keepOpenProps = useKeepLayerOpenProps(layer.id, layer.isOpen);
    return (
      <>
        <button type="button" ref={layer.ref} onClick={layer.show}>
          Trigger
        </button>
        <button type="button" {...keepOpenProps}>
          Clear
        </button>
        {layer.render(<span>Layer content</span>, {placement: 'below'})}
      </>
    );
  }

  it('names the control an invoker for the duration of the press', async () => {
    const user = userEvent.setup();
    const {container, getByRole} = render(<ClearableTriggerHarness />);
    const clear = getByRole('button', {name: 'Clear'});

    await user.click(getByRole('button', {name: 'Trigger'}));
    const popover = container.querySelector('[popover]') as HTMLElement;

    await user.pointer({keys: '[MouseLeft>]', target: clear});
    expect(clear.getAttribute('popovertarget')).toBe(popover.id);

    await user.pointer({keys: '[/MouseLeft]', target: clear});
    expect(clear).not.toHaveAttribute('popovertarget');
  });

  it('takes the invoker off when the press ends in pointercancel', async () => {
    const user = userEvent.setup();
    const {container, getByRole} = render(<ClearableTriggerHarness />);
    const clear = getByRole('button', {name: 'Clear'});

    await user.click(getByRole('button', {name: 'Trigger'}));
    const popover = container.querySelector('[popover]') as HTMLElement;

    await user.pointer({keys: '[MouseLeft>]', target: clear});
    expect(clear.getAttribute('popovertarget')).toBe(popover.id);

    // A touch the browser claims — for a scroll, for the platform's long-press
    // menu — ends here, and no pointerup ever arrives.
    await act(async () => {
      document.dispatchEvent(new Event('pointercancel'));
      await new Promise(resolve => {
        window.setTimeout(resolve, 0);
      });
    });

    expect(clear).not.toHaveAttribute('popovertarget');
  });

  it('leaves the control alone while the layer is closed', async () => {
    const user = userEvent.setup();
    const {getByRole} = render(<ClearableTriggerHarness />);
    const clear = getByRole('button', {name: 'Clear'});

    await user.click(clear);

    expect(clear).not.toHaveAttribute('popovertarget');
  });

  it("cancels the invoker's own toggle so the press cannot close the layer", async () => {
    const user = userEvent.setup();
    const {container, getByRole} = render(<ClearableTriggerHarness />);
    await user.click(getByRole('button', {name: 'Trigger'}));
    const popover = container.querySelector('[popover]') as HTMLElement;
    const clear = getByRole('button', {name: 'Clear'});

    const click = new MouseEvent('click', {bubbles: true, cancelable: true});
    await act(async () => {
      clear.setAttribute('popovertarget', popover.id);
      clear.dispatchEvent(click);
    });

    expect(click.defaultPrevented).toBe(true);
    expect(clear).not.toHaveAttribute('popovertarget');
  });
});

describe('wasJustDismissed (light dismiss vs. the trigger click, #5004)', () => {
  function GuardedTriggerHarness() {
    const layer = useLayerInternal({mode: 'context'});
    return (
      <>
        <button
          type="button"
          ref={layer.ref}
          onClick={() => {
            if (layer.wasJustDismissed()) {
              return;
            }
            if (layer.isOpen) {
              layer.hide();
            } else {
              layer.show();
            }
          }}>
          Trigger
        </button>
        <span data-testid="state">{layer.isOpen ? 'open' : 'closed'}</span>
        {layer.render(<span>Layer content</span>, {placement: 'below'})}
      </>
    );
  }

  /**
   * The browser closing the layer itself: it hides the element and queues a
   * `toggle` event, which is what reaches React — before the click, on the
   * engines that lose the race.
   */
  function lightDismiss(container: HTMLElement) {
    const popover = container.querySelector('[popover]') as HTMLElement;
    act(() => {
      popover.dispatchEvent(
        Object.assign(new Event('toggle'), {
          oldState: 'open',
          newState: 'closed',
        }),
      );
    });
  }

  it('absorbs the trigger click that follows a light dismiss', async () => {
    const user = userEvent.setup();
    const {container, getByRole, getByTestId} = render(
      <GuardedTriggerHarness />,
    );
    const trigger = getByRole('button', {name: 'Trigger'});

    await user.click(trigger);
    expect(getByTestId('state')).toHaveTextContent('open');

    // The next press reaches the browser dismissal before its click.
    fireEvent.pointerDown(trigger);
    lightDismiss(container);
    fireEvent.click(trigger);

    expect(getByTestId('state')).toHaveTextContent('closed');
  });

  it('acts on a deliberate second press', async () => {
    const user = userEvent.setup();
    const {container, getByRole, getByTestId} = render(
      <GuardedTriggerHarness />,
    );
    const trigger = getByRole('button', {name: 'Trigger'});

    await user.click(trigger);
    fireEvent.pointerDown(trigger);
    lightDismiss(container);
    fireEvent.click(trigger);
    // A press of its own — a new gesture, however soon it lands.
    await user.click(trigger);

    expect(getByTestId('state')).toHaveTextContent('open');
  });

  it('leaves a programmatic hide unguarded', async () => {
    const user = userEvent.setup();
    const {getByRole, getByTestId} = render(<GuardedTriggerHarness />);
    const trigger = getByRole('button', {name: 'Trigger'});

    // Three presses with no browser-initiated close between them.
    await user.click(trigger);
    await user.click(trigger);
    await user.click(trigger);

    expect(getByTestId('state')).toHaveTextContent('open');
  });

  it('acts on a synthesized click after a stopped click-first dismissal', async () => {
    const user = userEvent.setup();
    const {container, getByRole, getByTestId} = render(
      <GuardedTriggerHarness />,
    );
    const trigger = getByRole('button', {name: 'Trigger'});

    await user.click(trigger);
    fireEvent.pointerDown(document.body);
    document.body.addEventListener('click', event => event.stopPropagation(), {
      once: true,
    });
    fireEvent.click(document.body);
    lightDismiss(container);
    expect(getByTestId('state')).toHaveTextContent('closed');

    // Chromium delivers the dismissing click before the queued toggle. A later
    // bare click is a new activation even though it has no pointerdown.
    act(() => {
      trigger.click();
    });

    expect(getByTestId('state')).toHaveTextContent('open');
  });

  /** A trigger that calls show()/hide() directly, checking nothing. */
  function PlainTriggerHarness() {
    const layer = useLayerInternal({mode: 'context'});
    return (
      <>
        <button
          type="button"
          ref={layer.ref}
          onClick={() => (layer.isOpen ? layer.hide() : layer.show())}>
          Trigger
        </button>
        <span data-testid="state">{layer.isOpen ? 'open' : 'closed'}</span>
        {layer.render(<span>Layer content</span>, {placement: 'below'})}
      </>
    );
  }

  it('absorbs the click for a trigger that never calls wasJustDismissed', async () => {
    const user = userEvent.setup();
    const {container, getByRole, getByTestId} = render(<PlainTriggerHarness />);
    const trigger = getByRole('button', {name: 'Trigger'});

    await user.click(trigger);
    expect(getByTestId('state')).toHaveTextContent('open');

    fireEvent.pointerDown(trigger);
    lightDismiss(container);
    fireEvent.click(trigger);

    expect(getByTestId('state')).toHaveTextContent('closed');
  });
});
