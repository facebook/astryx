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
import {configure} from '@testing-library/react';

// Text queries (getByText/findByText/…) target VISIBLE text. Astryx's
// `useAnnounce` renders a visually-hidden aria-live region
// (`data-astryx-live-region`) that MIRRORS visible labels for screen readers —
// used by ~17 components (Calendar, Pagination, Typeahead, Switch, …). So a bare
// `getByText('January 2026')` can match BOTH the label and its announcement, and
// whether both are present is timing-dependent (the region updates on an effect
// after interaction). That makes such assertions liable to flaky "found multiple
// elements" failures under load. Ignore live regions in text matching (tests
// that assert an announcement query the region directly, e.g. by role="status").
// Keeps the jsdom defaults (script, style).
configure({defaultIgnore: 'script, style, [data-astryx-live-region]'});

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
