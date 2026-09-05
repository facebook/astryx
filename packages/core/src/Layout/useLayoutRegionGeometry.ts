// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useLayoutRegionGeometry.ts
 * @input Layout height mode, content width, and rendered region DOM markers
 * @output Stable refs plus synchronized region height and scroll geometry
 * @position Internal Layout hook. This is the single source of truth for
 *   rendered region geometry across direct JSX, RSC/Flight, and transparent
 *   wrappers.
 */

import {useRef, useState} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import type {SizeValue} from '../utils/types';

interface DetectedRegion {
  usesMiddleScroll: boolean;
  label?: string;
}

interface DetectedRegions {
  start: DetectedRegion;
  content: DetectedRegion;
  end: DetectedRegion;
}

const EMPTY_REGIONS: DetectedRegions = {
  start: {
    usesMiddleScroll: false,
  },
  content: {
    usesMiddleScroll: false,
  },
  end: {
    usesMiddleScroll: false,
  },
};

function sameDetectedRegion(a: DetectedRegion, b: DetectedRegion): boolean {
  return a.usesMiddleScroll === b.usesMiddleScroll && a.label === b.label;
}

function sameDetectedRegions(a: DetectedRegions, b: DetectedRegions): boolean {
  return (
    sameDetectedRegion(a.start, b.start) &&
    sameDetectedRegion(a.content, b.content) &&
    sameDetectedRegion(a.end, b.end)
  );
}

function detectDomRegions(
  elements: Element[],
  expectedRegion: 'content' | 'panel',
): DetectedRegion {
  const regions = elements.filter(
    element => element.getAttribute('data-layout-region') === expectedRegion,
  );
  const autoRegions = regions.filter(
    element => element.getAttribute('data-layout-height') === 'auto',
  );
  return {
    // A slot is one region. Multiple top-level region roots must agree before
    // the slot opts into natural-height middle scrolling.
    usesMiddleScroll:
      regions.length > 0 && autoRegions.length === regions.length,
    label:
      autoRegions
        .map(element => element.getAttribute('aria-label'))
        .find((label): label is string => label != null) ?? undefined,
  };
}

/**
 * Full-width scroll alignment requires subtracting contentWidth in CSS.
 * Intrinsic sizing keywords cannot participate in that arithmetic, so they
 * preserve the constrained-row behavior.
 */
export function supportsFullWidthScrollport(
  width: SizeValue | undefined,
): boolean {
  if (width == null || typeof width === 'number') {
    return true;
  }

  const value = width.trim().toLowerCase();
  return (
    value === '0' ||
    /^-?(?:\d+(?:\.\d+)?|\.\d+)(?:[a-z]+|%)$/.test(value) ||
    /^(?:calc|min|max|clamp)\(/.test(value)
  );
}

export function useLayoutRegionGeometry({
  contentWidth,
  isFill,
}: {
  contentWidth: SizeValue | undefined;
  isFill: boolean;
}) {
  const middleRef = useRef<HTMLDivElement>(null);

  const layoutInnerRef = useRef<HTMLDivElement>(null);

  const ownedRegionElementsRef = useRef<Set<Element>>(new Set());

  const [detectedRegions, setDetectedRegions] =
    useState<DetectedRegions>(EMPTY_REGIONS);

  useIsomorphicLayoutEffect(() => {
    if (!isFill) {
      for (const element of ownedRegionElementsRef.current) {
        element.removeAttribute('data-layout-scroll-state');
        if (element instanceof HTMLElement) {
          element.style.removeProperty('--layout-aligned-content-width');
        }
      }
      ownedRegionElementsRef.current.clear();
      return;
    }
    const middle = middleRef.current;
    const layoutInner = layoutInnerRef.current;
    if (middle == null || layoutInner == null) {
      return;
    }

    const synchronizeRegionOwnership = () => {
      const row =
        middle.querySelector(':scope > [data-layout-middle-row]') ?? middle;
      const startLane = row.querySelector(':scope > [data-layout-start-lane]');
      const contentLane = row.querySelector(
        ':scope > [data-layout-content-lane]',
      );
      const endLane = row.querySelector(':scope > [data-layout-end-lane]');
      const headerLane = layoutInner.querySelector(
        ':scope > [data-layout-header-lane]',
      );
      const footerLane = layoutInner.querySelector(
        ':scope > [data-layout-footer-lane]',
      );
      if (contentLane == null) {
        return;
      }
      const findRegions = (container: Element | null, region: string) =>
        Array.from(container?.children ?? []).filter(
          element => element.getAttribute('data-layout-region') === region,
        );
      const headerRegions = findRegions(headerLane, 'header');
      const startRegions = findRegions(startLane, 'panel');
      const contentRegions = findRegions(contentLane, 'content');
      const endRegions = findRegions(endLane, 'panel');
      const footerRegions = findRegions(footerLane, 'footer');
      const next: DetectedRegions = {
        start: detectDomRegions(startRegions, 'panel'),
        content: detectDomRegions(contentRegions, 'content'),
        end: detectDomRegions(endRegions, 'panel'),
      };
      const nextHasMiddleScroll =
        next.start.usesMiddleScroll ||
        next.content.usesMiddleScroll ||
        next.end.usesMiddleScroll;
      const nextHasExpandedMiddleScroll =
        nextHasMiddleScroll && supportsFullWidthScrollport(contentWidth);

      for (const element of ownedRegionElementsRef.current) {
        element.removeAttribute('data-layout-scroll-state');
        if (element instanceof HTMLElement) {
          element.style.removeProperty('--layout-aligned-content-width');
        }
      }
      const nextOwnedRegionElements = new Set<Element>();
      const setOwnedRegionState = (element: Element, state: string) => {
        element.setAttribute('data-layout-scroll-state', state);
        nextOwnedRegionElements.add(element);
      };
      const setMiddleState = (detected: DetectedRegion, regions: Element[]) => {
        if (detected.usesMiddleScroll) {
          for (const region of regions) {
            setOwnedRegionState(region, 'middle');
          }
        }
      };
      setMiddleState(next.start, startRegions);
      setMiddleState(next.content, contentRegions);
      setMiddleState(next.end, endRegions);

      if (nextHasMiddleScroll) {
        for (const region of [...headerRegions, ...footerRegions]) {
          setOwnedRegionState(region, 'aligned');
          if (!nextHasExpandedMiddleScroll && region instanceof HTMLElement) {
            region.style.setProperty(
              '--layout-aligned-content-width',
              `${middle.clientWidth}px`,
            );
          }
        }
      }
      ownedRegionElementsRef.current = nextOwnedRegionElements;
      // eslint-disable-next-line @eslint-react/set-state-in-effect
      setDetectedRegions(current =>
        sameDetectedRegions(current, next) ? current : next,
      );

      mutationObserver.disconnect();
      for (const lane of [
        headerLane,
        startLane,
        contentLane,
        endLane,
        footerLane,
      ]) {
        if (lane != null) {
          mutationObserver.observe(lane, {childList: true});
        }
      }
      for (const region of [
        ...headerRegions,
        ...startRegions,
        ...contentRegions,
        ...endRegions,
        ...footerRegions,
      ]) {
        mutationObserver.observe(region, {
          attributes: true,
          attributeFilter: [
            'aria-label',
            'data-layout-region',
            'data-layout-height',
          ],
        });
      }
    };

    // Observe only slot roots and region height attributes—not the Layout subtree.

    const mutationObserver = new MutationObserver(synchronizeRegionOwnership);
    synchronizeRegionOwnership();
    return () => mutationObserver.disconnect();
  }, [isFill, contentWidth]);

  const startUsesMiddleScroll = detectedRegions.start.usesMiddleScroll;
  const contentUsesMiddleScroll = detectedRegions.content.usesMiddleScroll;
  const endUsesMiddleScroll = detectedRegions.end.usesMiddleScroll;
  const hasMiddleScroll =
    isFill &&
    (startUsesMiddleScroll || contentUsesMiddleScroll || endUsesMiddleScroll);
  const hasExpandedMiddleScroll =
    hasMiddleScroll && supportsFullWidthScrollport(contentWidth);

  useIsomorphicLayoutEffect(() => {
    const middle = middleRef.current;
    const layoutInner = layoutInnerRef.current;
    if (middle == null || layoutInner == null) {
      return;
    }
    const getAlignedBars = () =>
      Array.from(
        layoutInner.querySelectorAll(
          ':scope > [data-layout-header-lane] > [data-layout-region="header"], :scope > [data-layout-footer-lane] > [data-layout-region="footer"]',
        ),
      ).filter(
        (element): element is HTMLElement => element instanceof HTMLElement,
      );
    const updateScrollGeometry = () => {
      const alignedBars = getAlignedBars();
      if (!hasMiddleScroll) {
        layoutInner.style.setProperty('--layout-scroll-gutter-inline', '0px');
        layoutInner.style.setProperty('--layout-middle-client-height', '100%');
        for (const bar of alignedBars) {
          bar.style.removeProperty('--layout-aligned-content-width');
        }
        return;
      }
      const gutter = Math.max(0, (middle.offsetWidth - middle.clientWidth) / 2);
      layoutInner.style.setProperty(
        '--layout-scroll-gutter-inline',
        `${gutter}px`,
      );
      layoutInner.style.setProperty(
        '--layout-middle-client-height',
        hasExpandedMiddleScroll ? `${middle.clientHeight}px` : '100%',
      );
      for (const bar of alignedBars) {
        if (hasExpandedMiddleScroll) {
          bar.style.removeProperty('--layout-aligned-content-width');
        } else {
          bar.style.setProperty(
            '--layout-aligned-content-width',
            `${middle.clientWidth}px`,
          );
        }
      }
    };

    updateScrollGeometry();
    if (!hasMiddleScroll || typeof ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver(updateScrollGeometry);
    resizeObserver.observe(middle);
    return () => resizeObserver.disconnect();
  }, [hasExpandedMiddleScroll, hasMiddleScroll]);

  return {
    contentUsesMiddleScroll,
    detectedRegions,
    endUsesMiddleScroll,
    hasExpandedMiddleScroll,
    hasMiddleScroll,
    layoutInnerRef,
    middleRef,
    startUsesMiddleScroll,
  };
}
