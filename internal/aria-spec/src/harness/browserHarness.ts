// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file browserHarness.ts
 * @input Uses the Vitest Browser Mode page context (@vitest/browser/context) which
 *   exposes a Playwright-backed `page` and `userEvent` running in real Chromium
 * @output createBrowserHarness — Tier 2 AriaHarness with the REAL accessibility
 *   tree (toMatchAriaSnapshot), real focus/keyboard, and CSS-engine state
 * @position Tier 2 runtime adapter. The same pattern contracts run here for the
 *   fidelity-critical expectations jsdom cannot fake (aria tree, inert, top layer,
 *   focus-visible). Requires `@vitest/browser` + `playwright install chromium`.
 *
 * SYNC: Keep the method surface identical to jsdomHarness.ts (both implement
 *   AriaHarness in ../types.ts). If one gains a capability, add it to the other.
 */

// These imports resolve only when @vitest/browser is installed and the `browser`
// vitest project is active. The jsdom tier never imports this file.
// @ts-expect-error — optional Tier 2 dependency, present only in the browser project
import {page, userEvent} from '@vitest/browser/context';
import type {AriaElement, AriaHarness, KeyName} from '../types';

const KEY_TO_PLAYWRIGHT: Record<KeyName, string> = {
  Space: ' ',
  Enter: 'Enter',
  Tab: 'Tab',
  ShiftTab: 'Shift+Tab',
  Escape: 'Escape',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Home: 'Home',
  End: 'End',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Locator = any; // @vitest/browser Locator, typed loosely to avoid the dep at TS time

function wrap(locator: Locator): AriaElement {
  const el = locator.element() as HTMLElement;
  const wrapped: AriaElement = {
    // Real browser accessible-name computation via the exposed element.
    accessibleName: async () =>
      (el.getAttribute('aria-label') ?? el.textContent ?? '').trim(),
    getAttribute: name => el.getAttribute(name),
    hasAttribute: name => el.hasAttribute(name),
    tagName: () => el.tagName,
    isChecked: () =>
      el.getAttribute('aria-checked') === 'true' ||
      (el as HTMLInputElement).checked === true,
    isDisabled: () =>
      el.getAttribute('aria-disabled') === 'true' ||
      (el as HTMLInputElement).disabled === true,
    isFocused: () => el.ownerDocument.activeElement === el,
  };
  // Stash the live node so click/focus/snapshot actions can resolve it back.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (wrapped as any).__el = el;
  return wrapped;
}

export function createBrowserHarness(): AriaHarness {
  return {
    tier: 'browser',
    getByRole: (role, options) => wrap(page.getByRole(role as string, options)),
    queryByRole: (role, options) => {
      const loc = page.getByRole(role as string, options);
      return loc.query() != null ? wrap(loc) : null;
    },
    activeElement: () => {
      const active = document.activeElement;
      return active && active !== document.body
        ? wrap({element: () => active})
        : null;
    },
    press: async key => {
      await userEvent.keyboard(`{${KEY_TO_PLAYWRIGHT[key]}}`);
    },
    click: async el => {
      await userEvent.click(elementOf(el));
    },
    focus: async el => {
      elementOf(el).focus();
    },
    // The payoff of the browser tier: Playwright's real accessibility-tree
    // snapshot (a stable YAML of roles + names), impossible to produce in jsdom.
    ariaSnapshot: async el => {
      const target = el ? elementOf(el) : document.body;
      // Vitest Browser exposes the Playwright locator ariaSnapshot under the hood.
      return page.elementLocator(target).ariaSnapshot();
    },
  };
}

function elementOf(el: AriaElement): HTMLElement {
  // The browser wrapper closes over its element; expose it for actions.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (el as any).__el ?? (document.activeElement as HTMLElement);
}
