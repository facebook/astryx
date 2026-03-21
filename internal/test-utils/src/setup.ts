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

// Polyfill for Popover API (not supported in jsdom)
// Dispatches toggle events like real browsers so useXDSLayer's
// handleToggle can update state and fire callbacks.
if (typeof HTMLElement.prototype.showPopover === 'undefined') {
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    const event = new Event('toggle', {bubbles: false});
    (event as unknown as ToggleEvent).newState = 'open';
    (event as unknown as ToggleEvent).oldState = 'closed';
    this.dispatchEvent(event);
  };
  HTMLElement.prototype.hidePopover = function (this: HTMLElement) {
    const event = new Event('toggle', {bubbles: false});
    (event as unknown as ToggleEvent).newState = 'closed';
    (event as unknown as ToggleEvent).oldState = 'open';
    this.dispatchEvent(event);
  };
  HTMLElement.prototype.togglePopover = function (this: HTMLElement) {
    return false;
  };
}
