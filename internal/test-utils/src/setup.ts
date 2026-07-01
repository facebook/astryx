// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file setup.ts
 * @input Uses @testing-library/jest-dom/vitest
 * @output Extends Vitest expect with jest-dom matchers (toBeInTheDocument, etc.)
 * @position Test setup; loaded by vitest.config.ts before all tests
 *
 * SYNC: When modified, update this header and /internal/test-utils/src/README.md
 */

/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom/vitest';

// Polyfill for matchMedia (not supported in jsdom)
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => {
    const mql: MediaQueryList = {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
    return mql;
  };
}

// Polyfill for Popover API (not supported in jsdom)
// This prevents errors when testing components that use XDSTooltip
if (typeof HTMLElement.prototype.showPopover === 'undefined') {
  HTMLElement.prototype.showPopover = function () {};
  HTMLElement.prototype.hidePopover = function () {};
  HTMLElement.prototype.togglePopover = function () {
    return false;
  };
}

// Polyfill for matchMedia (not supported in jsdom)
// Used by useMediaQuery → useXDSTheme → useXDSStreamingText
if (typeof window.matchMedia === 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

import {expect} from 'vitest';

let isNormalizing = false;

if (typeof expect !== 'undefined' && expect.addSnapshotSerializer) {
  expect.addSnapshotSerializer({
    serialize(
      val: Element,
      config: object,
      indentation: string,
      depth: number,
      refs: unknown[],
      printer: (
        val: Element,
        config: object,
        indentation: string,
        depth: number,
        refs: unknown[],
      ) => string,
    ) {
      isNormalizing = true;
      try {
        const clone = val.cloneNode(true) as Element;
        if (clone.setAttribute && clone.getAttribute) {
          const styleSrc = clone.getAttribute('data-style-src');
          if (styleSrc) {
            clone.setAttribute('data-style-src', styleSrc.replace(/\\/g, '/'));
          }
          const elements = clone.querySelectorAll('[data-style-src]');
          for (const el of elements) {
            const src = el.getAttribute('data-style-src');
            if (src) {
              el.setAttribute('data-style-src', src.replace(/\\/g, '/'));
            }
          }
        }
        return printer(clone, config, indentation, depth, refs);
      } finally {
        isNormalizing = false;
      }
    },
    test(val: unknown) {
      return (
        !isNormalizing &&
        val != null &&
        typeof val === 'object' &&
        (val as Element).nodeType === 1
      );
    },
  });
}
