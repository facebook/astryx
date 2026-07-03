// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useLayer.test.tsx
 * @input Uses vitest, @testing-library/react
 * @output Test suite for useLayer context-mode positioning
 * @position Tests for useLayer.tsx
 *
 * SYNC: When useLayer.tsx changes, update tests accordingly
 */

import {describe, it, expect} from 'vitest';
import {render} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useLayer} from './useLayer';
import type {LayerPlacement, LayerAlignment} from './useLayer';

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
