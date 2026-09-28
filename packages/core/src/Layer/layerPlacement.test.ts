// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerPlacement.test.ts
 * @input Uses vitest, layerPlacement helpers
 * @output Tests for the anchor-positioning probe and the measured placement math
 * @position Testing; validates layerPlacement.ts
 *
 * SYNC: When layerPlacement.ts changes, update tests accordingly
 */

import {afterEach, describe, expect, it, vi} from 'vitest';
import {
  layerPlacementPathFor,
  readLayerPositioningSupport,
  resolveMeasuredPlacement,
  type MeasuredPlacementInput,
} from './layerPlacement';

describe('readLayerPositioningSupport', () => {
  const originalCSS = globalThis.CSS;

  afterEach(() => {
    globalThis.CSS = originalCSS;
  });

  it('reports the primary path where there is no CSS object to ask', () => {
    // @ts-expect-error -- simulating a server / emulator without `CSS`.
    delete globalThis.CSS;
    expect(readLayerPositioningSupport()).toEqual({
      positionArea: true,
      positionTryFallbacks: true,
    });
  });

  it('asks for the values useLayer emits', () => {
    const supports = vi.fn((property: string) => property === 'position-area');
    globalThis.CSS = {supports} as unknown as typeof CSS;
    expect(readLayerPositioningSupport()).toEqual({
      positionArea: true,
      positionTryFallbacks: false,
    });
    expect(supports).toHaveBeenCalledWith(
      'position-area',
      'self-block-start span-self-inline-end',
    );
    expect(supports).toHaveBeenCalledWith(
      'position-try-fallbacks',
      'flip-block',
    );
  });
});

describe('layerPlacementPathFor', () => {
  it('takes the anchor path only with both halves', () => {
    expect(
      layerPlacementPathFor({positionArea: true, positionTryFallbacks: true}),
    ).toBe('anchor');
  });

  it('keeps the side in CSS and measures only the flip without position-try-fallbacks', () => {
    expect(
      layerPlacementPathFor({positionArea: true, positionTryFallbacks: false}),
    ).toBe('anchor-flip');
  });

  it('measures everything without position-area', () => {
    expect(
      layerPlacementPathFor({positionArea: false, positionTryFallbacks: true}),
    ).toBe('measured');
    expect(
      layerPlacementPathFor({positionArea: false, positionTryFallbacks: false}),
    ).toBe('measured');
  });
});

describe('resolveMeasuredPlacement', () => {
  // A 100x40 anchor in the middle of a 800x600 viewport, a 200x120 layer.
  const base: MeasuredPlacementInput = {
    anchorRect: {top: 300, left: 350, width: 100, height: 40},
    layerSize: {width: 200, height: 120},
    viewport: {width: 800, height: 600},
    placement: 'below',
    alignment: 'center',
    gutter: 16,
  };

  describe('side', () => {
    it('opens below when there is room', () => {
      expect(resolveMeasuredPlacement(base)).toMatchObject({
        side: 'below',
        top: 340,
      });
    });

    it('opens above when there is room', () => {
      expect(
        resolveMeasuredPlacement({...base, placement: 'above'}),
      ).toMatchObject({side: 'above', top: 180});
    });

    it('flips below to above when the room below is short (flip-block)', () => {
      const anchorRect = {top: 500, left: 350, width: 100, height: 40};
      // 600 - 16 - 540 = 44px below, 120 needed.
      expect(resolveMeasuredPlacement({...base, anchorRect})).toMatchObject({
        side: 'above',
        top: 380,
      });
    });

    it('flips above to below when the room above is short', () => {
      const anchorRect = {top: 40, left: 350, width: 100, height: 40};
      expect(
        resolveMeasuredPlacement({...base, anchorRect, placement: 'above'}),
      ).toMatchObject({side: 'below', top: 80});
    });

    it('flips start to end and end to start along the inline axis (flip-inline)', () => {
      const anchorRect = {top: 300, left: 20, width: 100, height: 40};
      expect(
        resolveMeasuredPlacement({...base, anchorRect, placement: 'start'}),
      ).toMatchObject({side: 'end', left: 120});
      const nearRight = {top: 300, left: 680, width: 100, height: 40};
      expect(
        resolveMeasuredPlacement({
          ...base,
          anchorRect: nearRight,
          placement: 'end',
        }),
      ).toMatchObject({side: 'start', left: 480});
    });

    it('takes the roomier side when neither side fits', () => {
      // 100px above (gutter excluded 84), 600-16-180=404 below... make both short:
      const tall = {...base, layerSize: {width: 200, height: 500}};
      const anchorRect = {top: 200, left: 350, width: 100, height: 40};
      // above: 184, below: 344 -> below is roomier
      expect(
        resolveMeasuredPlacement({...tall, anchorRect, placement: 'above'}),
      ).toMatchObject({side: 'below'});
      // Requested below with more room below stays below.
      expect(
        resolveMeasuredPlacement({...tall, anchorRect, placement: 'below'}),
      ).toMatchObject({side: 'below'});
    });
  });

  describe('alignment', () => {
    it('lines up start edges', () => {
      expect(
        resolveMeasuredPlacement({...base, alignment: 'start'}),
      ).toMatchObject({left: 350});
    });

    it('lines up end edges', () => {
      expect(
        resolveMeasuredPlacement({...base, alignment: 'end'}),
      ).toMatchObject({left: 250});
    });

    it('centers', () => {
      expect(resolveMeasuredPlacement(base)).toMatchObject({left: 300});
    });

    it('mirrors start and end in RTL for a block placement', () => {
      expect(
        resolveMeasuredPlacement({
          ...base,
          alignment: 'start',
          direction: 'rtl',
        }),
      ).toMatchObject({left: 250});
      expect(
        resolveMeasuredPlacement({...base, alignment: 'end', direction: 'rtl'}),
      ).toMatchObject({left: 350});
    });

    it('aligns along the block axis for an inline placement', () => {
      const end = resolveMeasuredPlacement({
        ...base,
        placement: 'end',
        alignment: 'start',
      });
      expect(end).toMatchObject({side: 'end', left: 450, top: 300});
      expect(
        resolveMeasuredPlacement({
          ...base,
          placement: 'end',
          alignment: 'end',
        }),
      ).toMatchObject({top: 220});
      expect(
        resolveMeasuredPlacement({...base, placement: 'end'}),
      ).toMatchObject({top: 260});
    });

    it('puts start on the right in RTL for an inline placement', () => {
      expect(
        resolveMeasuredPlacement({
          ...base,
          placement: 'start',
          direction: 'rtl',
        }),
      ).toMatchObject({side: 'start', left: 450});
    });
  });

  describe('viewport clamp', () => {
    it('keeps the layer inside the inline gutter', () => {
      const anchorRect = {top: 300, left: 4, width: 40, height: 40};
      expect(
        resolveMeasuredPlacement({...base, anchorRect, alignment: 'start'}),
      ).toMatchObject({left: 16});
      const farRight = {top: 300, left: 760, width: 40, height: 40};
      expect(
        resolveMeasuredPlacement({
          ...base,
          anchorRect: farRight,
          alignment: 'start',
        }),
      ).toMatchObject({left: 584});
    });

    it('keeps the layer inside the block gutter after a flip', () => {
      const anchorRect = {top: 560, left: 350, width: 100, height: 40};
      // Above: 560 - 120 = 440, within the gutter.
      expect(resolveMeasuredPlacement({...base, anchorRect})).toMatchObject({
        side: 'above',
        top: 440,
      });
    });

    it('honours a gutter per edge', () => {
      const anchorRect = {top: 300, left: 4, width: 40, height: 40};
      expect(
        resolveMeasuredPlacement({
          ...base,
          anchorRect,
          alignment: 'start',
          gutter: {top: 0, right: 0, bottom: 0, left: 40},
        }),
      ).toMatchObject({left: 40});
    });

    it('sits at the gutter when the layer is larger than the viewport', () => {
      expect(
        resolveMeasuredPlacement({
          ...base,
          layerSize: {width: 1000, height: 1000},
        }),
      ).toMatchObject({top: 16, left: 16});
    });

    it('returns whole pixels', () => {
      const result = resolveMeasuredPlacement({
        ...base,
        anchorRect: {top: 300.4, left: 350.6, width: 100, height: 40},
      });
      expect(Number.isInteger(result.top)).toBe(true);
      expect(Number.isInteger(result.left)).toBe(true);
    });
  });
});
