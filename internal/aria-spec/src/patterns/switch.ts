// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file switch.ts
 * @input Uses ../types (PatternContract, ExpectationPriority, AriaHarness)
 * @output switchContract — the WAI-ARIA APG "switch" pattern encoded as a reusable
 *   conformance contract
 * @position First authored pattern; the reference other patterns are modeled on
 *
 * APG source: https://www.w3.org/WAI/ARIA/apg/patterns/switch/
 *
 * SYNC: When the AriaHarness interface changes, update the expectation bodies
 */

import {
  ExpectationPriority,
  type AriaHarness,
  type PatternContract,
} from '../types';

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/switch/';

/** Resolve the single switch under test. Native input[role=switch] or [role=switch]. */
function getSwitch(h: AriaHarness) {
  return h.getByRole('switch');
}

export const switchContract: PatternContract = {
  pattern: 'switch',
  apg: APG,
  expectations: [
    {
      id: 'switch-role',
      description: 'Exposes role="switch" (native checkbox promoted, or ARIA).',
      priority: ExpectationPriority.BLOCKER,
      apg: `${APG}#wai-ariaroles,states,andproperties`,
      run: h => {
        const el = getSwitch(h);
        // A native <input type=checkbox role=switch> is the canonical form; an
        // element with an explicit role="switch" is equally valid.
        const tag = el.tagName();
        if (tag === 'INPUT') {
          expectAttr(el, 'type', 'checkbox');
        }
      },
    },
    {
      id: 'switch-aria-checked',
      description:
        'Communicates on/off state via aria-checked or native checked.',
      priority: ExpectationPriority.BLOCKER,
      apg: `${APG}#wai-ariaroles,states,andproperties`,
      run: h => {
        const el = getSwitch(h);
        // Native checkboxes convey state through the checked property (browsers
        // map it to aria-checked); ARIA switches must set aria-checked explicitly.
        const hasNativeState = el.tagName() === 'INPUT';
        if (!hasNativeState && !el.hasAttribute('aria-checked')) {
          throw new Error(
            'non-native switch must set aria-checked to convey state',
          );
        }
        // Regardless of form, the initial state must be readable as "off".
        if (el.isChecked()) {
          throw new Error('expected switch to start in the off state');
        }
      },
    },
    {
      id: 'switch-labelled',
      description: 'Has a non-empty accessible name.',
      priority: ExpectationPriority.BLOCKER,
      apg: `${APG}#wai-ariaroles,states,andproperties`,
      run: async h => {
        const name = await getSwitch(h).accessibleName();
        if (name.trim() === '') {
          throw new Error('switch has no accessible name');
        }
      },
    },
    {
      id: 'switch-1',
      description:
        'APG switch-1: Space toggles the switch on and off when focused.',
      priority: ExpectationPriority.BLOCKER,
      apg: `${APG}#keyboardinteraction`,
      run: async h => {
        const el = getSwitch(h);
        if (el.isChecked()) {
          throw new Error('expected switch to start off');
        }
        await h.focus(el);
        await h.press('Space');
        if (!getSwitch(h).isChecked()) {
          throw new Error('Space did not toggle the switch on');
        }
      },
    },
    {
      id: 'switch-click-toggles',
      description: 'Clicking the switch toggles its state.',
      priority: ExpectationPriority.BLOCKER,
      apg: `${APG}#keyboardinteraction`,
      run: async h => {
        const el = getSwitch(h);
        await h.click(el);
        if (!getSwitch(h).isChecked()) {
          throw new Error('click did not toggle the switch on');
        }
      },
    },
    {
      id: 'switch-focusable',
      description: 'Switch is reachable in the tab sequence (focusable).',
      priority: ExpectationPriority.MAJOR,
      apg: `${APG}#keyboardinteraction`,
      run: async h => {
        const el = getSwitch(h);
        await h.focus(el);
        if (!getSwitch(h).isFocused()) {
          throw new Error('switch did not receive focus');
        }
      },
    },
    {
      id: 'switch-optionally-described',
      description:
        'If descriptive text exists, it is linked via aria-describedby.',
      priority: ExpectationPriority.MINOR,
      apg: `${APG}#wai-ariaroles,states,andproperties`,
      run: h => {
        const el = getSwitch(h);
        // Only meaningful when the binding renders a description; bindings without
        // one list this in expectedFailures.
        if (!el.hasAttribute('aria-describedby')) {
          throw new Error('no aria-describedby present');
        }
      },
    },
    {
      id: 'switch-aria-snapshot',
      description:
        'Accessibility tree matches the expected switch structure (browser tier).',
      priority: ExpectationPriority.MAJOR,
      apg: `${APG}#accessibilityfeatures`,
      run: async h => {
        const snap = await h.ariaSnapshot();
        // jsdom cannot produce the real tree; it returns a sentinel so this
        // expectation is only truly asserted in the browser tier.
        if (snap === '__jsdom_no_aria_tree__') {
          throw new Error('aria snapshot unavailable in jsdom tier');
        }
        if (!/switch/i.test(snap)) {
          throw new Error('accessibility tree does not expose a switch node');
        }
      },
    },
  ],
};

function expectAttr(
  el: {getAttribute: (n: string) => string | null},
  name: string,
  value: string,
) {
  const actual = el.getAttribute(name);
  if (actual !== value) {
    throw new Error(`expected ${name}="${value}" but got ${String(actual)}`);
  }
}
