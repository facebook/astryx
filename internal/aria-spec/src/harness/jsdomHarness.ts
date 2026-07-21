// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file jsdomHarness.ts
 * @input Uses @testing-library/react (screen), @testing-library/user-event,
 *   dom-accessibility-api is NOT available so accessible name is approximated
 *   from Testing Library's own name query
 * @output createJsdomHarness — Tier 1 AriaHarness backed by jsdom + Testing Library
 * @position Tier 1 runtime adapter; consumed by runContract in jsdom test files
 *
 * SYNC: When the AriaHarness interface in ../types.ts changes, update this adapter
 *   and browserHarness.ts together
 */

import {screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {AriaElement, AriaHarness, KeyName} from '../types';

const KEY_TO_USER_EVENT: Record<KeyName, string> = {
  Space: '{ }',
  Enter: '{Enter}',
  Tab: '{Tab}',
  ShiftTab: '{Shift>}{Tab}{/Shift}',
  Escape: '{Escape}',
  ArrowUp: '{ArrowUp}',
  ArrowDown: '{ArrowDown}',
  ArrowLeft: '{ArrowLeft}',
  ArrowRight: '{ArrowRight}',
  Home: '{Home}',
  End: '{End}',
};

/** Stashes the live node on the wrapper so click/focus can resolve it back. */
const NODE = Symbol('node');

function wrap(node: HTMLElement): AriaElement {
  const el: AriaElement = {
    async accessibleName() {
      // Testing Library resolves the accessible name when matching by name; here
      // we approximate it from aria-label / linked label / text content, which is
      // sufficient for Tier 1. The browser tier returns the browser-computed name.
      const ariaLabel = node.getAttribute('aria-label');
      if (ariaLabel != null && ariaLabel !== '') {
        return ariaLabel;
      }
      const labelledby = node.getAttribute('aria-labelledby');
      if (labelledby != null) {
        const label = labelledby
          .split(/\s+/)
          .map(id => node.ownerDocument.getElementById(id)?.textContent ?? '')
          .join(' ')
          .trim();
        if (label !== '') {
          return label;
        }
      }
      // Associated <label for> or wrapping label.
      const id = node.getAttribute('id');
      if (id != null) {
        const forLabel = node.ownerDocument.querySelector(`label[for="${id}"]`);
        if (forLabel?.textContent) {
          return forLabel.textContent.trim();
        }
      }
      return (node.textContent ?? '').trim();
    },
    getAttribute: name => node.getAttribute(name),
    hasAttribute: name => node.hasAttribute(name),
    tagName: () => node.tagName,
    isChecked: () =>
      node.getAttribute('aria-checked') === 'true' ||
      (node as HTMLInputElement).checked === true,
    isDisabled: () =>
      node.getAttribute('aria-disabled') === 'true' ||
      (node as HTMLInputElement).disabled === true,
    isFocused: () => node.ownerDocument.activeElement === node,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (el as any)[NODE] = node;
  return el;
}

export function createJsdomHarness(): AriaHarness {
  const user = userEvent.setup();
  return {
    tier: 'jsdom',
    getByRole: (role, options) =>
      wrap(screen.getByRole(role, {...options, hidden: true}) as HTMLElement),
    queryByRole: (role, options) => {
      const el = screen.queryByRole(role, {...options, hidden: true});
      return el ? wrap(el as HTMLElement) : null;
    },
    activeElement: () => {
      const el = document.activeElement;
      return el && el !== document.body ? wrap(el as HTMLElement) : null;
    },
    press: async key => {
      await user.keyboard(KEY_TO_USER_EVENT[key]);
    },
    click: async el => {
      // AriaElement is opaque; re-query the focused/target node via fireEvent on
      // the live active element is not enough, so we resolve through the DOM.
      const node = resolveNode(el);
      await user.click(node);
    },
    focus: async el => {
      const node = resolveNode(el);
      node.focus();
      // Some components attach focus behavior via focus events fireEvent triggers.
      fireEvent.focus(node);
    },
    ariaSnapshot: async () => {
      // Tier 1 cannot produce the real accessibility tree. Return a marker so
      // structural-snapshot expectations are skipped (as expected-failure) in
      // jsdom and only asserted in the browser tier.
      return '__jsdom_no_aria_tree__';
    },
  };
}

/**
 * Our AriaElement wrappers stash the live node under a symbol so click/focus can
 * resolve it back without exposing the node on the public AriaElement shape.
 */
function resolveNode(el: AriaElement): HTMLElement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (el as any)[NODE] as HTMLElement;
}
