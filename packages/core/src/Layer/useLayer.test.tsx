// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useLayer.test.tsx
 * @input Uses vitest, @testing-library/react, useLayer hook
 * @output Unit tests for useLayer show/hide behavior and feature-detection guards
 * @position Testing; validates useLayer.tsx implementation
 *
 * SYNC: When useLayer.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, afterEach} from 'vitest';
import {render, act} from '@testing-library/react';
import {useLayer} from './useLayer';

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
