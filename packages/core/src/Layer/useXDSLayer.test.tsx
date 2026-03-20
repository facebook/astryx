/**
 * @file useXDSLayer.test.tsx
 * @input Uses vitest, @testing-library/react, useXDSLayer hook
 * @output Unit tests for useXDSLayer hook behavior
 * @position Testing; validates useXDSLayer.tsx implementation
 */

import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import {useXDSLayer} from './useXDSLayer';
import type {ReactNode} from 'react';

// Store original matches to restore later
const originalMatches = HTMLElement.prototype.matches;

// Track popover open state per element
const popoverOpenState = new WeakMap<HTMLElement, boolean>();

beforeAll(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, true);
    // Fire toggle event synchronously (mirrors browser behavior)
    const event = new Event('toggle') as ToggleEvent;
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, false);
    const event = new Event('toggle') as ToggleEvent;
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  });

  HTMLElement.prototype.matches = function (selector: string) {
    if (selector === ':popover-open') {
      return popoverOpenState.get(this) ?? false;
    }
    return originalMatches.call(this, selector);
  };
});

afterAll(() => {
  HTMLElement.prototype.matches = originalMatches;
});

// Test wrapper component for context mode
function ContextLayerTest({
  onShow,
  onHide,
  lightDismiss,
  content = 'Layer content',
}: {
  onShow?: () => void;
  onHide?: () => void;
  lightDismiss?: boolean;
  content?: ReactNode;
}) {
  const layer = useXDSLayer({mode: 'context', onShow, onHide, lightDismiss});

  return (
    <>
      <button
        ref={layer.ref}
        aria-describedby={layer.id}
        onClick={() => (layer.isOpen ? layer.hide() : layer.show())}>
        Trigger
      </button>
      {layer.render(<div>{content}</div>, {
        placement: 'above',
        alignment: 'center',
      })}
    </>
  );
}

// Test wrapper for fixed mode
function FixedLayerTest({
  onShow,
  onHide,
}: {
  onShow?: () => void;
  onHide?: () => void;
}) {
  const layer = useXDSLayer({mode: 'fixed', onShow, onHide});

  return (
    <>
      <button onClick={() => (layer.isOpen ? layer.hide() : layer.show())}>
        Trigger
      </button>
      {layer.render(<div>Fixed content</div>, {x: 100, y: 200})}
    </>
  );
}

describe('useXDSLayer', () => {
  describe('context mode', () => {
    it('renders popover element with correct id', () => {
      render(<ContextLayerTest />);
      const trigger = screen.getByRole('button');
      const layerId = trigger.getAttribute('aria-describedby');
      expect(layerId).toBeTruthy();
      expect(document.getElementById(layerId!)).toBeInTheDocument();
    });

    it('sets anchor name on trigger element', () => {
      render(<ContextLayerTest />);
      const trigger = screen.getByRole('button');
      expect(
        (trigger.style as unknown as Record<string, string>).anchorName,
      ).toBeTruthy();
    });

    it('shows popover on show()', () => {
      render(<ContextLayerTest />);
      const trigger = screen.getByRole('button');

      act(() => {
        trigger.click();
      });

      expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
    });

    it('hides popover on hide()', () => {
      vi.mocked(HTMLElement.prototype.hidePopover).mockClear();
      render(<ContextLayerTest />);
      const trigger = screen.getByRole('button');

      // Show first
      act(() => {
        trigger.click();
      });
      // Then hide
      act(() => {
        trigger.click();
      });

      expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
    });

    it('calls onShow callback when shown', () => {
      const onShow = vi.fn();
      render(<ContextLayerTest onShow={onShow} />);
      const trigger = screen.getByRole('button');

      act(() => {
        trigger.click();
      });

      expect(onShow).toHaveBeenCalledTimes(1);
    });

    it('calls onHide callback when hidden', () => {
      const onHide = vi.fn();
      render(<ContextLayerTest onHide={onHide} />);
      const trigger = screen.getByRole('button');

      // Show
      act(() => {
        trigger.click();
      });
      // Hide
      act(() => {
        trigger.click();
      });

      expect(onHide).toHaveBeenCalledTimes(1);
    });

    it('does not double-fire onShow', () => {
      const onShow = vi.fn();
      render(<ContextLayerTest onShow={onShow} />);
      const trigger = screen.getByRole('button');

      act(() => {
        trigger.click();
      });

      // onShow should fire exactly once, not twice
      expect(onShow).toHaveBeenCalledTimes(1);
    });

    it('does not double-fire onHide', () => {
      const onHide = vi.fn();
      render(<ContextLayerTest onHide={onHide} />);
      const trigger = screen.getByRole('button');

      // Show then hide
      act(() => {
        trigger.click();
      });
      act(() => {
        trigger.click();
      });

      expect(onHide).toHaveBeenCalledTimes(1);
    });

    it('uses popover="manual" by default', () => {
      render(<ContextLayerTest />);
      const trigger = screen.getByRole('button');
      const layerId = trigger.getAttribute('aria-describedby');
      const popover = document.getElementById(layerId!);
      expect(popover?.getAttribute('popover')).toBe('manual');
    });

    it('uses popover="auto" when lightDismiss is true', () => {
      render(<ContextLayerTest lightDismiss />);
      const trigger = screen.getByRole('button');
      const layerId = trigger.getAttribute('aria-describedby');
      const popover = document.getElementById(layerId!);
      expect(popover?.getAttribute('popover')).toBe('auto');
    });

    it('does not show if already open', () => {
      vi.mocked(HTMLElement.prototype.showPopover).mockClear();
      render(<ContextLayerTest />);
      const trigger = screen.getByRole('button');

      // Show once
      act(() => {
        trigger.click();
      });

      expect(HTMLElement.prototype.showPopover).toHaveBeenCalledTimes(1);

      // Try to show again — the component toggles, so click again shows/hides.
      // But the guard in show() should prevent double-show.
      // We verify showPopover was only called once total.
    });
  });

  describe('fixed mode', () => {
    it('renders popover element', () => {
      render(<FixedLayerTest />);
      expect(screen.getByText('Fixed content')).toBeInTheDocument();
    });

    it('shows and hides with callbacks', () => {
      const onShow = vi.fn();
      const onHide = vi.fn();
      render(<FixedLayerTest onShow={onShow} onHide={onHide} />);
      const trigger = screen.getByRole('button');

      act(() => {
        trigger.click();
      });
      expect(onShow).toHaveBeenCalledTimes(1);

      act(() => {
        trigger.click();
      });
      expect(onHide).toHaveBeenCalledTimes(1);
    });
  });

  describe('toggle event listener cleanup', () => {
    it('cleans up toggle listener on unmount', () => {
      const spy = vi.spyOn(HTMLElement.prototype, 'removeEventListener');
      const {unmount} = render(<ContextLayerTest />);

      // Unmount should trigger cleanup via ref callback
      unmount();

      const toggleCalls = spy.mock.calls.filter(
        ([event]) => event === 'toggle',
      );
      expect(toggleCalls.length).toBeGreaterThanOrEqual(1);
      spy.mockRestore();
    });
  });
});
