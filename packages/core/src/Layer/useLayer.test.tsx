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
import {render, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useLayer} from './useLayer';
import type {
  LayerPlacement,
  LayerAlignment,
  ContextRenderProps,
} from './useLayer';

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
        'position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline',
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
