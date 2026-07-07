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
 * Harness that owns the trigger element. Direction is set on the trigger
 * itself (inline style or dir attribute) because jsdom's getComputedStyle
 * does not inherit direction from ancestors — descendants of a dir="rtl"
 * wrapper report an empty string, which would silently exercise the LTR
 * path and make wrapper-based RTL tests vacuous.
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
  describe('LTR (unchanged behavior)', () => {
    it.each([
      ['below', 'start', 'position-area: bottom span-right'],
      ['below', 'end', 'position-area: bottom span-left'],
      ['above', 'start', 'position-area: top span-right'],
      ['start', 'start', 'position-area: left span-bottom'],
      ['end', 'start', 'position-area: right span-bottom'],
    ] as const)(
      'placement=%s alignment=%s emits %s with no justify-self',
      async (placement, alignment, expected) => {
        const style = await openAndGetStyle(
          <Harness placement={placement} alignment={alignment} />,
        );
        expect(style).toContain(expected);
        expect(style).not.toContain('justify-self');
      },
    );

    it('placement=below alignment=center emits bare bottom area', async () => {
      const style = await openAndGetStyle(
        <Harness placement="below" alignment="center" />,
      );
      expect(style).toMatch(/position-area: bottom(;|$)/);
      expect(style).not.toContain('justify-self');
    });
  });

  describe('RTL via CSS direction property on the trigger (#3389 repro)', () => {
    const rtl = {direction: 'rtl'} as const;

    it.each([
      // [placement, alignment, expected area, expected justify-self]
      ['below', 'start', 'position-area: bottom span-left', 'right'],
      ['below', 'end', 'position-area: bottom span-right', 'left'],
      ['above', 'start', 'position-area: top span-left', 'right'],
      // Side placements mirror their column; justify-self hugs the anchor.
      ['start', 'start', 'position-area: right span-bottom', 'left'],
      ['end', 'start', 'position-area: left span-bottom', 'right'],
    ] as const)(
      'placement=%s alignment=%s mirrors to %s with justify-self %s',
      async (placement, alignment, expectedArea, expectedJustify) => {
        const style = await openAndGetStyle(
          <Harness
            placement={placement}
            alignment={alignment}
            triggerStyle={rtl}
          />,
        );
        expect(style).toContain(expectedArea);
        expect(style).toContain(`justify-self: ${expectedJustify}`);
      },
    );

    it('center alignment stays symmetric with no justify-self', async () => {
      const style = await openAndGetStyle(
        <Harness placement="below" alignment="center" triggerStyle={rtl} />,
      );
      expect(style).toMatch(/position-area: bottom(;|$)/);
      expect(style).not.toContain('justify-self');
    });

    it('keeps position-try fallbacks intact', async () => {
      const style = await openAndGetStyle(
        <Harness placement="below" alignment="start" triggerStyle={rtl} />,
      );
      expect(style).toContain(
        'position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline',
      );
    });
  });

  describe('RTL via dir attribute on the trigger', () => {
    it('mirrors the same as the CSS property', async () => {
      const style = await openAndGetStyle(
        <Harness placement="below" alignment="start" triggerDir="rtl" />,
      );
      expect(style).toContain('position-area: bottom span-left');
      expect(style).toContain('justify-self: right');
    });
  });

  describe("positioning='custom' (consumer-authored position styles)", () => {
    // Consumers like Carousel and Tokenizer keep useLayer's popover behavior
    // and anchor wiring but position the layer themselves. The opt-out must
    // suppress every placement-derived style — position-area, the try
    // fallbacks, and the RTL justify-self — so those consumers never need to
    // know which properties the hook would have emitted.
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
      expect(style).not.toContain('justify-self');
    });

    it('ignores placement and alignment when positioning is custom, even in RTL', async () => {
      // placement/alignment are documented as ignored under custom. Derived
      // output would be position-area "bottom span-left" with justify-self
      // "right" under RTL; none of it may appear.
      const style = await openAndGetStyle(
        <CustomHarness
          triggerStyle={{direction: 'rtl'}}
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
      expect(style).not.toContain('position-area: bottom');
      expect(style).not.toContain('justify-self');
      expect(style).not.toContain('position-try-fallbacks');
    });

    it('emits only the anchor wiring when custom positioning passes no style at all', async () => {
      // The strongest suppression probe: with no consumer style in the merge
      // (Tokenizer's insets-only shape reduces to this in jsdom), nothing can
      // clobber a leaked derived value — any position-area, justify-self, or
      // try-fallbacks in the output is a genuine leak.
      const style = await openAndGetStyle(
        <CustomHarness
          triggerStyle={{direction: 'rtl'}}
          renderProps={{positioning: 'custom'}}
        />,
      );
      expect(style).toContain('position-anchor');
      expect(style).not.toContain('position-area');
      expect(style).not.toContain('justify-self');
      expect(style).not.toContain('position-try-fallbacks');
    });
  });

  describe('synchronous style application before showPopover()', () => {
    // setIsRtl only schedules a re-render; showPopover() promotes the
    // popover to the top layer immediately. Without a synchronous style
    // application the first open paints — and any @starting-style entry
    // animation starts — with the previous render's mapping. These tests
    // capture the style attribute at the exact moment showPopover() runs.
    function captureStyleAtShow() {
      const stylesAtShow: string[] = [];
      const original = HTMLElement.prototype.showPopover;
      const spy = vi
        .spyOn(HTMLElement.prototype, 'showPopover')
        .mockImplementation(function (this: HTMLElement) {
          stylesAtShow.push(this.getAttribute('style') ?? '');
          return original.call(this);
        });
      return {stylesAtShow, spy};
    }

    it('first RTL open: mirrored styles are committed before showPopover()', async () => {
      const {stylesAtShow, spy} = captureStyleAtShow();
      try {
        const user = userEvent.setup();
        const {getByRole} = render(
          <Harness
            placement="below"
            alignment="start"
            triggerStyle={{direction: 'rtl'}}
          />,
        );
        await user.click(getByRole('button', {name: 'trigger'}));

        expect(stylesAtShow).toHaveLength(1);
        expect(stylesAtShow[0]).toContain('position-area: bottom span-left');
        expect(stylesAtShow[0]).toContain('justify-self: right');
      } finally {
        spy.mockRestore();
      }
    });

    it('reopen after an rtl→ltr flip: stale RTL styles are cleared before showPopover()', async () => {
      const {stylesAtShow, spy} = captureStyleAtShow();
      try {
        const user = userEvent.setup();
        const {getByRole, rerender} = render(
          <Harness
            placement="below"
            alignment="start"
            triggerStyle={{direction: 'rtl'}}
          />,
        );
        const trigger = getByRole('button', {name: 'trigger'});
        await user.click(trigger); // open in RTL
        await user.click(trigger); // close

        rerender(
          <Harness
            placement="below"
            alignment="start"
            triggerStyle={{direction: 'ltr'}}
          />,
        );
        await user.click(trigger); // reopen in LTR

        expect(stylesAtShow).toHaveLength(2);
        expect(stylesAtShow[1]).toContain('position-area: bottom span-right');
        expect(stylesAtShow[1]).not.toContain('justify-self');
      } finally {
        spy.mockRestore();
      }
    });

    it('respects the explicit-undefined nulling idiom in consumer style', async () => {
      // Spread semantics: an own key with an explicit `undefined` value wins
      // the render merge and React emits nothing — the suppression idiom
      // consumers used before positioning:'custom' existed (and still
      // type-legal for external consumers). show()'s synchronous application
      // must honor key PRESENCE, not value: writing the derived styles here
      // would stick forever, because React's style diff (undefined ===
      // undefined) never emits a clearing write.
      const {stylesAtShow, spy} = captureStyleAtShow();
      try {
        function NullingHarness() {
          const layer = useLayer({mode: 'context'});
          return (
            <>
              <button
                type="button"
                ref={layer.ref}
                style={{direction: 'rtl'}}
                onClick={layer.isOpen ? layer.hide : layer.show}>
                trigger
              </button>
              {layer.render(<span>content</span>, {
                placement: 'below',
                alignment: 'start',
                style: {
                  positionArea: undefined,
                  justifySelf: undefined,
                  top: 'anchor(top)',
                },
              })}
            </>
          );
        }

        const user = userEvent.setup();
        const {container, getByRole} = render(<NullingHarness />);
        await user.click(getByRole('button', {name: 'trigger'}));

        expect(stylesAtShow[0]).not.toContain('position-area:');
        expect(stylesAtShow[0]).not.toContain('justify-self');
        const finalStyle =
          container.querySelector('[popover]')?.getAttribute('style') ?? '';
        expect(finalStyle).not.toContain('position-area:');
        expect(finalStyle).not.toContain('justify-self');
        // (No positive assertion on `top: anchor(top)` — jsdom's cssstyle
        // rejects anchor() values for known properties, so it never reaches
        // the style attribute here; the two suppressions above are the
        // regression under test.)
      } finally {
        spy.mockRestore();
      }
    });

    it('never clobbers consumer style overrides of the derived properties', async () => {
      // Documented merge order: consumer `style` wins over derived styles.
      // The synchronous application must leave consumer-authored values
      // alone — both at showPopover() time and after the post-open render.
      const {stylesAtShow, spy} = captureStyleAtShow();
      try {
        function OverrideHarness() {
          const layer = useLayer({mode: 'context'});
          return (
            <>
              <button
                type="button"
                ref={layer.ref}
                style={{direction: 'rtl'}}
                onClick={layer.isOpen ? layer.hide : layer.show}>
                trigger
              </button>
              {layer.render(<span>content</span>, {
                placement: 'below',
                alignment: 'start',
                style: {positionArea: 'center', justifySelf: 'center'},
              })}
            </>
          );
        }

        const user = userEvent.setup();
        const {container, getByRole} = render(<OverrideHarness />);
        await user.click(getByRole('button', {name: 'trigger'}));

        expect(stylesAtShow[0]).toContain('position-area: center');
        expect(stylesAtShow[0]).toContain('justify-self: center');
        const finalStyle =
          container.querySelector('[popover]')?.getAttribute('style') ?? '';
        expect(finalStyle).toContain('position-area: center');
        expect(finalStyle).toContain('justify-self: center');
        expect(finalStyle).not.toContain('justify-self: right');
      } finally {
        spy.mockRestore();
      }
    });
  });

  it('resolves direction at show time, not at initial render', async () => {
    const user = userEvent.setup();
    const {container, getByRole} = render(
      <Harness
        placement="below"
        alignment="start"
        triggerStyle={{direction: 'rtl'}}
      />,
    );

    // Closed: initial render emits the LTR mapping (direction not yet read).
    const popover = container.querySelector('[popover]');
    expect(popover?.getAttribute('style')).toContain(
      'position-area: bottom span-right',
    );

    await user.click(getByRole('button', {name: 'trigger'}));
    expect(popover?.getAttribute('style')).toContain(
      'position-area: bottom span-left',
    );
  });

  // ─── Edge cases ──────────────────────────────────────────────

  describe('RTL edge cases', () => {
    it('re-resolves direction on every open (rtl → ltr → rtl)', async () => {
      const user = userEvent.setup();
      const {container, getByRole, rerender} = render(
        <Harness
          placement="below"
          alignment="start"
          triggerStyle={{direction: 'rtl'}}
        />,
      );
      const popover = container.querySelector('[popover]');
      const trigger = getByRole('button', {name: 'trigger'});

      await user.click(trigger); // open in RTL
      expect(popover?.getAttribute('style')).toContain(
        'position-area: bottom span-left',
      );
      await user.click(trigger); // close

      // Direction flips while closed — e.g. an app-level locale switch.
      rerender(
        <Harness
          placement="below"
          alignment="start"
          triggerStyle={{direction: 'ltr'}}
        />,
      );
      await user.click(trigger); // reopen in LTR
      const style = popover?.getAttribute('style') ?? '';
      expect(style).toContain('position-area: bottom span-right');
      expect(style).not.toContain('justify-self');

      await user.click(trigger); // close
      rerender(
        <Harness
          placement="below"
          alignment="start"
          triggerStyle={{direction: 'rtl'}}
        />,
      );
      await user.click(trigger); // and back to RTL
      expect(popover?.getAttribute('style')).toContain(
        'position-area: bottom span-left',
      );
    });

    it.each([
      // Side placements with the remaining alignments: the vertical span is
      // direction-neutral; the column and justify-self mirror.
      ['start', 'end', 'position-area: right span-top', 'left'],
      ['end', 'end', 'position-area: left span-top', 'right'],
      ['start', 'center', 'position-area: right center', 'left'],
      ['end', 'center', 'position-area: left center', 'right'],
    ] as const)(
      'RTL placement=%s alignment=%s emits %s with justify-self %s',
      async (placement, alignment, expectedArea, expectedJustify) => {
        const style = await openAndGetStyle(
          <Harness
            placement={placement}
            alignment={alignment}
            triggerStyle={{direction: 'rtl'}}
          />,
        );
        expect(style).toContain(expectedArea);
        expect(style).toContain(`justify-self: ${expectedJustify}`);
      },
    );

    it('falls back to LTR when the trigger direction is indeterminate', async () => {
      // jsdom returns '' for descendants of a direction:rtl ancestor (no
      // inheritance in its getComputedStyle). Indeterminate must mean LTR,
      // never a crash — real browsers always resolve to 'ltr' or 'rtl'.
      const user = userEvent.setup();
      const {container, getByRole} = render(
        <div style={{direction: 'rtl'}}>
          <Harness placement="below" alignment="start" />
        </div>,
      );

      await user.click(getByRole('button', {name: 'trigger'}));
      const style =
        container.querySelector('[popover]')?.getAttribute('style') ?? '';
      expect(style).toContain('position-area: bottom span-right');
      expect(style).not.toContain('justify-self');
    });

    it('opens safely when no trigger ref was ever attached', async () => {
      // Consumers can call show() before (or without) wiring layer.ref.
      // Direction must fall back to LTR without touching a null ref.
      function NoRefHarness() {
        const layer = useLayer({mode: 'context'});
        return (
          <>
            <button type="button" onClick={layer.show}>
              opener
            </button>
            {layer.render(<span>content</span>, {
              placement: 'below',
              alignment: 'start',
            })}
          </>
        );
      }

      const user = userEvent.setup();
      const {container, getByRole} = render(<NoRefHarness />);
      await user.click(getByRole('button', {name: 'opener'}));

      const style =
        container.querySelector('[popover]')?.getAttribute('style') ?? '';
      expect(style).toContain('position-area: bottom span-right');
      expect(style).not.toContain('justify-self');
    });

    it('fixed mode never emits RTL styles, even inside an RTL ancestor', async () => {
      function FixedHarness() {
        const layer = useLayer({mode: 'fixed'});
        return (
          <div dir="rtl">
            <button type="button" dir="rtl" onClick={layer.show}>
              opener
            </button>
            {layer.render(<span>content</span>, {x: 10, y: 20})}
          </div>
        );
      }

      const user = userEvent.setup();
      const {container, getByRole} = render(<FixedHarness />);
      await user.click(getByRole('button', {name: 'opener'}));

      const style =
        container.querySelector('[popover]')?.getAttribute('style') ?? '';
      expect(style).not.toContain('justify-self');
      expect(style).not.toContain('position-area');
    });
  });
});
