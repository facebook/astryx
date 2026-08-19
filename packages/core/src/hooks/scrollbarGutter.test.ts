// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file scrollbarGutter.test.ts
 * @input Uses vitest and a stubbed viewport (window.innerWidth vs
 *   documentElement.clientWidth)
 * @output Unit tests for measure/reserve/releaseScrollbarGutter
 * @position Testing; validates scrollbarGutter.ts implementation
 *
 * SYNC: When scrollbarGutter.ts changes, update tests to match new behavior
 */

import {afterEach, describe, expect, it} from 'vitest';
import {
  SCROLLBAR_GUTTER_VAR,
  measureScrollbarGutter,
  releaseScrollbarGutter,
  reserveScrollbarGutter,
} from './scrollbarGutter';

/**
 * jsdom does no layout, so `documentElement.clientWidth` is 0 there. Stub the
 * pair the measurement reads: a 15px classic scrollbar is `innerWidth` 1024
 * against a 1009px layout viewport.
 */
function stubViewport({
  innerWidth,
  clientWidth,
}: {
  innerWidth: number;
  clientWidth: number;
}) {
  Object.defineProperty(window, 'innerWidth', {
    value: innerWidth,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(document.documentElement, 'clientWidth', {
    value: clientWidth,
    configurable: true,
  });
}

describe('scrollbarGutter', () => {
  afterEach(() => {
    document.body.style.cssText = '';
    document.documentElement.style.cssText = '';
    // @ts-expect-error -- drop the stubs so jsdom's own values come back
    delete document.documentElement.clientWidth;
  });

  describe('measureScrollbarGutter', () => {
    it('measures a classic scrollbar as the gap between the window and the layout viewport', () => {
      stubViewport({innerWidth: 1024, clientWidth: 1009});
      expect(measureScrollbarGutter()).toBe(15);
    });

    it('measures 0 for overlay scrollbars, which take no layout space', () => {
      stubViewport({innerWidth: 1024, clientWidth: 1024});
      expect(measureScrollbarGutter()).toBe(0);
    });

    it('measures 0 when there is no layout to measure', () => {
      stubViewport({innerWidth: 1024, clientWidth: 0});
      expect(measureScrollbarGutter()).toBe(0);
    });
  });

  describe('reserveScrollbarGutter', () => {
    it('reserves the scrollbar width as padding and publishes it as a custom property', () => {
      stubViewport({innerWidth: 1024, clientWidth: 1009});

      const snapshot = reserveScrollbarGutter(document.body);

      expect(document.body.style.paddingRight).toBe('15px');
      expect(
        document.documentElement.style.getPropertyValue(SCROLLBAR_GUTTER_VAR),
      ).toBe('15px');

      releaseScrollbarGutter(document.body, snapshot);

      expect(document.body.style.paddingRight).toBe('');
      expect(
        document.documentElement.style.getPropertyValue(SCROLLBAR_GUTTER_VAR),
      ).toBe('');
    });

    it("adds to the page's own padding instead of replacing it", () => {
      stubViewport({innerWidth: 1024, clientWidth: 1009});
      document.body.style.paddingRight = '24px';

      const snapshot = reserveScrollbarGutter(document.body);

      expect(document.body.style.paddingRight).toBe('39px');

      releaseScrollbarGutter(document.body, snapshot);

      expect(document.body.style.paddingRight).toBe('24px');
    });

    it('leaves the element alone when the scrollbar takes no space', () => {
      stubViewport({innerWidth: 1024, clientWidth: 1024});

      const snapshot = reserveScrollbarGutter(document.body);

      expect(document.body.style.paddingRight).toBe('');
      expect(
        document.documentElement.style.getPropertyValue(SCROLLBAR_GUTTER_VAR),
      ).toBe('');

      releaseScrollbarGutter(document.body, snapshot);

      expect(document.body.style.paddingRight).toBe('');
    });

    it('keeps the outer reservation intact when a nested lock releases', () => {
      stubViewport({innerWidth: 1024, clientWidth: 1009});

      const outer = reserveScrollbarGutter(document.body);
      // The scrollbar is already hidden by the time an overlay opens on top of
      // another one, so the inner lock measures nothing to reserve.
      stubViewport({innerWidth: 1024, clientWidth: 1024});
      const inner = reserveScrollbarGutter(document.body);

      releaseScrollbarGutter(document.body, inner);

      expect(document.body.style.paddingRight).toBe('15px');
      expect(
        document.documentElement.style.getPropertyValue(SCROLLBAR_GUTTER_VAR),
      ).toBe('15px');

      releaseScrollbarGutter(document.body, outer);

      expect(document.body.style.paddingRight).toBe('');
    });
  });
});
