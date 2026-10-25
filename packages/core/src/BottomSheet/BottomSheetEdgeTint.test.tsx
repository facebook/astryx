// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheetEdgeTint.test.tsx
 * @input Uses vitest, @testing-library/react, BottomSheet, BottomSheetSwitcher
 * @output Tests that every presented sheet carries the iOS Safari bottom edge
 *   tint on its own panel, with no element of its own, and pins the
 *   declarations WebKit's edge sampler reads
 * @position Core testing; validates the sheet panel's `::after` in
 *   BottomSheetPanel.tsx and its two hosts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/BottomSheet/BottomSheetPanel.tsx
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render} from '@testing-library/react';
import {BottomSheet} from './BottomSheet';
import {BottomSheetSwitcher} from './BottomSheetSwitcher';

// jsdom doesn't implement <dialog> open/close or pointer capture; stub them.
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.show = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  );
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    }),
  );
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** The sheet panels in the document: each one draws the tint as its `::after`. */
function panels(): ReadonlyArray<Element> {
  return Array.from(document.querySelectorAll('dialog [tabindex="-1"]')).filter(
    element =>
      element.parentElement?.tagName === 'DIALOG' ||
      element.parentElement?.parentElement?.tagName === 'DIALOG',
  );
}

async function panelSource(): Promise<string> {
  const fs = await import('fs');
  const path = await import('path');
  return fs.readFileSync(
    path.resolve(__dirname, './BottomSheetPanel.tsx'),
    'utf-8',
  );
}

/** The sheet style's body, from `sheet: {` to its closing brace. */
async function sheetSource(): Promise<string> {
  const sheet = (await panelSource()).match(
    /\n {2}sheet: \{([\s\S]*?)\n {2}\},/,
  );
  expect(sheet).not.toBeNull();
  return sheet![1];
}

async function edgeTintSource(): Promise<string> {
  const tint = (await sheetSource()).match(
    /\n {4}'::after': \{([\s\S]*?)\n {4}\},/,
  );
  expect(tint).not.toBeNull();
  return tint![1];
}

/** The tint's declarations with its explanatory comments stripped out. */
async function edgeTintDeclarations(): Promise<string> {
  return (await edgeTintSource())
    .split('\n')
    .filter(line => !line.trim().startsWith('//'))
    .join('\n');
}

describe('BottomSheetEdgeTint', () => {
  it('draws the tint on the sheet panel, with no element of its own', () => {
    render(
      <BottomSheet
        isOpen
        onOpenChange={() => {}}
        hasScrim={false}
        label="Place details">
        Content
      </BottomSheet>,
    );
    expect(document.querySelectorAll('[data-sheet-edge-tint]')).toHaveLength(0);
    expect(document.querySelector('dialog')?.children).toHaveLength(1);
  });

  it('gives a modal sheet the same panel and tint', () => {
    render(
      <BottomSheet isOpen onOpenChange={() => {}} label="Place details">
        Content
      </BottomSheet>,
    );
    expect(document.querySelectorAll('[data-sheet-edge-tint]')).toHaveLength(0);
    expect(document.querySelector('dialog')?.children).toHaveLength(1);
  });

  // Each switcher step owns a dialog whose panel tints it while presented:
  // one at rest, one per presented dialog through a handoff.
  it('gives a modal switcher flow one tinting panel at rest, and one per presented dialog through a handoff', () => {
    const {rerender} = render(
      <BottomSheetSwitcher activeSheet="comment" onActiveSheetChange={() => {}}>
        <BottomSheet sheetId="comment" label="Add a comment">
          Comment
        </BottomSheet>
        <BottomSheet sheetId="confirmation" label="Confirmation">
          Confirmation
        </BottomSheet>
      </BottomSheetSwitcher>,
    );
    const presented = () =>
      Array.from(document.querySelectorAll('dialog'))
        .filter(
          dialog => dialog.firstElementChild?.hasAttribute('hidden') === false,
        )
        .map(dialog => dialog.getAttribute('aria-label'));
    expect(presented()).toEqual(['Add a comment']);
    rerender(
      <BottomSheetSwitcher
        activeSheet="confirmation"
        onActiveSheetChange={() => {}}>
        <BottomSheet sheetId="comment" label="Add a comment">
          Comment
        </BottomSheet>
        <BottomSheet sheetId="confirmation" label="Confirmation">
          Confirmation
        </BottomSheet>
      </BottomSheetSwitcher>,
    );
    expect(presented()).toEqual(['Add a comment', 'Confirmation']);
    expect(document.querySelectorAll('[data-sheet-edge-tint]')).toHaveLength(0);
  });

  it('keeps the tint out of hit testing', async () => {
    expect(await edgeTintSource()).toContain("pointerEvents: 'none'");
  });

  // Every declaration below is load-bearing for a heuristic that lives in
  // WebKit, not in this repo, and none of it is observable in jsdom or in any
  // engine without retractable browser chrome — so it is asserted on the style
  // definition, the way BottomSheetPanel pins its handle gradient.
  describe('the declarations WebKit samples', () => {
    it('is fixed and flush with the bottom edge of the viewport', async () => {
      const tint = await edgeTintSource();
      const sheet = await sheetSource();
      // Only a fixed or sticky box is a candidate, and only a box flush with
      // the edge is the one Safari hit tests. The sheet's transform makes it
      // the fixed strip's containing block, and the sheet ends the overscroll
      // padding below the viewport, so the strip sits that far above the
      // sheet's own bottom edge.
      expect(tint).toContain('content: \'""\'');
      expect(tint).toContain("position: 'fixed'");
      expect(tint).toContain('insetBlockEnd: `${OVERSCROLL_PADDING}px`');
      expect(tint).toContain('insetInline: 0');
      expect(sheet).toContain("default: 'translateY(0)'");
      expect(sheet).toContain('marginBlockEnd: `${-OVERSCROLL_PADDING}px`');
    });

    it('clears the 10px floor below which WebKit ignores the declared colour', async () => {
      const height = (await panelSource()).match(
        /const EDGE_TINT_HEIGHT_PX = (\d+);/,
      );
      expect(height).not.toBeNull();
      expect(Number(height![1])).toBeGreaterThan(10);
      expect(await edgeTintSource()).toContain(
        'height: `${EDGE_TINT_HEIGHT_PX}px`',
      );
    });

    it('declares the sheet surface colour, so the strip matches the sheet', async () => {
      expect(await edgeTintSource()).toContain(
        "backgroundColor: colorVars['--color-background-surface']",
      );
    });

    // visibility: hidden, display: none and a low opacity all disqualify the
    // box from sampling. A mask does not, which is the only reason the strip
    // can be both readable by Safari and invisible to the user.
    it('hides itself with a mask rather than with visibility or opacity', async () => {
      const tint = await edgeTintDeclarations();
      expect(tint).toContain(
        "maskImage: 'linear-gradient(transparent, transparent)'",
      );
      expect(tint).toContain(
        "WebkitMaskImage: 'linear-gradient(transparent, transparent)'",
      );
      expect(tint).not.toContain('visibility');
      expect(tint).not.toContain('opacity');
      expect(tint).not.toContain("display: 'none'");
    });
  });
});
