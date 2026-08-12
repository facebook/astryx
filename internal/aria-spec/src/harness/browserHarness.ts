// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file browserHarness.ts
 * @input Uses the Vitest Browser Mode page context (@vitest/browser/context) which
 *   exposes a Playwright-backed `page` and `userEvent` running in real Chromium,
 *   plus the `ariaSnapshot` browser command registered in vitest.config.browser.ts
 * @output createBrowserHarness — Tier 2 AriaHarness with the REAL accessibility
 *   tree (Playwright's aria snapshot), real focus/keyboard, and CSS-engine state
 * @position Tier 2 runtime adapter, published as @astryxdesign/aria-spec/browser.
 *   The same pattern contracts run here for the fidelity-critical expectations
 *   jsdom cannot fake (aria tree, inert, top layer, focus-visible). Requires
 *   `@vitest/browser` + `playwright install chromium`.
 *
 * SYNC: Keep the method surface identical to jsdomHarness.ts (both implement
 *   AriaHarness in ../types.ts). If one gains a capability, add it to the other.
 * SYNC: The `ariaSnapshot` command is defined in vitest.config.browser.ts; the
 *   augmentation below and that definition must agree.
 */

// These imports resolve only when @vitest/browser is installed and the `browser`
// vitest project is active. The jsdom tier never imports this file — it is a
// separate package entry point (`@astryxdesign/aria-spec/browser`) precisely so
// importing the contracts never drags Browser Mode into the jsdom run.
import {commands, page, userEvent} from '@vitest/browser/context';
import type {AriaElement, AriaHarness, KeyName} from '../types';

/**
 * The accessibility tree is computed by Playwright in the Node process, so the
 * in-browser harness reaches it through a Vitest browser command rather than a
 * locator method (Vitest's own `Locator` exposes the tree only through the
 * `toMatchAriaSnapshot` matcher, which asserts instead of returning the tree).
 */
declare module 'vitest/internal/browser' {
  interface BrowserCommands {
    ariaSnapshot: (selector: string) => Promise<string>;
  }
}

/** Attribute used to hand the snapshot target to the Playwright-side command. */
const SNAPSHOT_TARGET_ATTR = 'data-aria-spec-snapshot-target';

/**
 * Serialize the real accessibility tree rooted at `target`. Playwright runs in
 * the Node process, so the element is marked in the DOM and addressed by
 * selector across the bridge.
 */
async function ariaSnapshotOf(target: HTMLElement): Promise<string> {
  target.setAttribute(SNAPSHOT_TARGET_ATTR, '');
  try {
    return await commands.ariaSnapshot(`[${SNAPSHOT_TARGET_ATTR}]`);
  } finally {
    target.removeAttribute(SNAPSHOT_TARGET_ATTR);
  }
}

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
    // The accessible name comes from the real accessibility tree rather than a
    // DOM approximation: an element's aria snapshot renders as `- switch "Name"`.
    accessibleName: async () => {
      const snapshot = await ariaSnapshotOf(el);
      return /^\s*-\s+[^"\n]*"([^"]*)"/.exec(snapshot)?.[1]?.trim() ?? '';
    },
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
    // Playwright runs in the Node process, so the target element is marked in the
    // DOM and handed over by selector through the `ariaSnapshot` browser command.
    ariaSnapshot: async el =>
      await ariaSnapshotOf(el ? elementOf(el) : document.body),
  };
}

function elementOf(el: AriaElement): HTMLElement {
  // The browser wrapper closes over its element; expose it for actions.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (el as any).__el ?? (document.activeElement as HTMLElement);
}
