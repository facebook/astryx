import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import React from 'react';
import {useConcentricRadius} from './useConcentricRadius';

// =============================================================================
// Test helpers
// =============================================================================

/**
 * Mock getBoundingClientRect for an element
 */
function mockRect(
  el: HTMLElement,
  rect: {top: number; left: number; width: number; height: number},
) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    top: rect.top,
    left: rect.left,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    width: rect.width,
    height: rect.height,
    x: rect.left,
    y: rect.top,
    toJSON: () => ({}),
  });
}

/**
 * Mock getComputedStyle for border-radius
 */
function mockRadius(el: HTMLElement, radius: string) {
  const original = window.getComputedStyle;
  vi.spyOn(window, 'getComputedStyle').mockImplementation(target => {
    if (target === el) {
      return {
        ...original(el),
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
        borderBottomRightRadius: radius,
        borderBottomLeftRadius: radius,
      } as CSSStyleDeclaration;
    }
    return original(target);
  });
}

// =============================================================================
// Test component
// =============================================================================

function TestComponent({
  reference = 'container' as const,
  containerRadius = '12px',
  containerRect = {top: 0, left: 0, width: 400, height: 300},
  innerRect = {top: 16, left: 16, width: 368, height: 268},
}: {
  reference?: 'container' | 'inner';
  containerRadius?: string;
  containerRect?: {top: number; left: number; width: number; height: number};
  innerRect?: {top: number; left: number; width: number; height: number};
}) {
  const {containerRef, innerRef} = useConcentricRadius({
    reference,
    observe: false,
  });

  // We need to mock after render but the ref callbacks fire during render.
  // Use a wrapper that mocks before assigning refs.
  const containerCb = React.useCallback(
    (el: HTMLElement | null) => {
      if (el) {
        mockRect(el, containerRect);
        if (reference === 'container') {
          mockRadius(el, containerRadius);
        }
      }
      containerRef(el);
    },
    [containerRef, containerRect, containerRadius, reference],
  );

  const innerCb = React.useCallback(
    (el: HTMLElement | null) => {
      if (el) {
        mockRect(el, innerRect);
        if (reference === 'inner') {
          mockRadius(el, containerRadius);
        }
      }
      innerRef(el);
    },
    [innerRef, innerRect, containerRadius, reference],
  );

  return (
    <div ref={containerCb} data-testid="container">
      <div ref={innerCb} data-testid="inner">
        Content
      </div>
    </div>
  );
}

// =============================================================================
// Tests
// =============================================================================

describe('useConcentricRadius', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('reference: container', () => {
    it('computes inner radius from container radius minus gap', () => {
      render(
        <TestComponent
          reference="container"
          containerRadius="12px"
          containerRect={{top: 0, left: 0, width: 400, height: 300}}
          innerRect={{top: 8, left: 8, width: 384, height: 284}}
        />,
      );

      const inner = screen.getByTestId('inner');
      // gap = 8px on each side, container radius = 12px
      // concentric = max(0, 12 - 8) = 4px per corner
      expect(inner.style.borderRadius).toBe('4px 4px 4px 4px');
    });

    it('clamps to 0 when gap exceeds radius', () => {
      render(
        <TestComponent
          reference="container"
          containerRadius="12px"
          containerRect={{top: 0, left: 0, width: 400, height: 300}}
          innerRect={{top: 16, left: 16, width: 368, height: 268}}
        />,
      );

      const inner = screen.getByTestId('inner');
      // gap = 16px, container radius = 12px
      // concentric = max(0, 12 - 16) = 0px
      expect(inner.style.borderRadius).toBe('0px 0px 0px 0px');
    });

    it('handles asymmetric gaps', () => {
      render(
        <TestComponent
          reference="container"
          containerRadius="20px"
          containerRect={{top: 0, left: 0, width: 400, height: 300}}
          innerRect={{top: 4, left: 8, width: 384, height: 280}}
        />,
      );

      const inner = screen.getByTestId('inner');
      // top-left: max(4, 8) = 8 → 20 - 8 = 12
      // top-right: max(4, 8) = 8 → 20 - 8 = 12
      // bottom-right: max(16, 8) = 16 → 20 - 16 = 4
      // bottom-left: max(16, 8) = 16 → 20 - 16 = 4
      expect(inner.style.borderRadius).toBe('12px 12px 4px 4px');
    });

    it('produces full radius when inner is flush (zero gap)', () => {
      render(
        <TestComponent
          reference="container"
          containerRadius="12px"
          containerRect={{top: 0, left: 0, width: 400, height: 300}}
          innerRect={{top: 0, left: 0, width: 400, height: 300}}
        />,
      );

      const inner = screen.getByTestId('inner');
      // gap = 0 → concentric = 12px (same as container)
      expect(inner.style.borderRadius).toBe('12px 12px 12px 12px');
    });
  });

  describe('reference: inner', () => {
    it('computes container radius from inner radius plus gap', () => {
      render(
        <TestComponent
          reference="inner"
          containerRadius="8px"
          containerRect={{top: 0, left: 0, width: 400, height: 300}}
          innerRect={{top: 12, left: 12, width: 376, height: 276}}
        />,
      );

      const container = screen.getByTestId('container');
      // inner radius = 8px, gap = 12px
      // container = 8 + 12 = 20px per corner
      expect(container.style.borderRadius).toBe('20px 20px 20px 20px');
    });
  });
});
