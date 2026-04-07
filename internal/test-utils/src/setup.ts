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
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
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
