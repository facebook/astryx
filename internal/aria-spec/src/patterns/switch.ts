// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file switch.ts
 * @input Uses ../types (PatternContract, ExpectationPriority, SpecCriterion,
 *   specLabel, AriaHarness)
 * @output switchContract — the WAI-ARIA APG "switch" pattern encoded as a
 *   reusable conformance contract, every expectation traced to a WCAG SC or APG
 *   clause
 * @position First authored pattern; the reference other patterns are modeled on.
 *   Demonstrates the spec-traceability convention: each `description` is prefixed
 *   with specLabel(primary criterion) so the WCAG/APG number is in the test name.
 *
 * APG source: https://www.w3.org/WAI/ARIA/apg/patterns/switch/
 *
 * SYNC: When the AriaHarness interface changes, update the expectation bodies
 */

import {
  ExpectationPriority,
  specLabel,
  type AriaHarness,
  type Expectation,
  type PatternContract,
  type SpecCriterion,
} from '../types';

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/switch/';

// --- Normative criteria this pattern traces to -----------------------------
const WCAG_412_NAME_ROLE_VALUE: SpecCriterion = {
  spec: 'wcag',
  id: '4.1.2',
  name: 'Name, Role, Value',
  level: 'A',
  url: 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html',
};
const WCAG_211_KEYBOARD: SpecCriterion = {
  spec: 'wcag',
  id: '2.1.1',
  name: 'Keyboard',
  level: 'A',
  url: 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html',
};
const APG_SWITCH_ROLES: SpecCriterion = {
  spec: 'apg',
  id: 'switch-roles-states-props',
  name: 'Switch roles, states, and properties',
  url: `${APG}#wai-ariaroles,states,andproperties`,
};
const APG_SWITCH_1: SpecCriterion = {
  spec: 'apg',
  id: 'switch-1',
  name: 'Space toggles the switch',
  url: `${APG}#keyboardinteraction`,
};

/**
 * Build an Expectation with the spec-citation prefixed onto its description
 * (the test name), keeping the convention DRY. `body` is the human-readable
 * clause of the description after the prefix.
 */
function expectation(args: {
  id: string;
  body: string;
  priority: ExpectationPriority;
  criteria: readonly [SpecCriterion, ...SpecCriterion[]];
  run: Expectation['run'];
}): Expectation {
  return {
    id: args.id,
    description: `${specLabel(args.criteria[0])}: ${args.body}`,
    priority: args.priority,
    criteria: args.criteria,
    run: args.run,
  };
}

/** Resolve the single switch under test. Native input[role=switch] or [role=switch]. */
function getSwitch(h: AriaHarness) {
  return h.getByRole('switch');
}

export const switchContract: PatternContract = {
  pattern: 'switch',
  apg: APG,
  expectations: [
    expectation({
      id: 'switch-role',
      body: 'exposes role="switch" (native checkbox promoted, or ARIA)',
      priority: ExpectationPriority.BLOCKER,
      criteria: [WCAG_412_NAME_ROLE_VALUE, APG_SWITCH_ROLES],
      run: h => {
        const el = getSwitch(h);
        if (
          el.tagName() === 'INPUT' &&
          el.getAttribute('type') !== 'checkbox'
        ) {
          throw new Error(
            `native switch input must be type="checkbox", got ${String(el.getAttribute('type'))}`,
          );
        }
      },
    }),
    expectation({
      id: 'switch-aria-checked',
      body: 'communicates on/off state via aria-checked or native checked',
      priority: ExpectationPriority.BLOCKER,
      criteria: [WCAG_412_NAME_ROLE_VALUE, APG_SWITCH_ROLES],
      run: h => {
        const el = getSwitch(h);
        const hasNativeState = el.tagName() === 'INPUT';
        if (!hasNativeState && !el.hasAttribute('aria-checked')) {
          throw new Error(
            'non-native switch must set aria-checked to convey state',
          );
        }
        if (el.isChecked()) {
          throw new Error('expected switch to start in the off state');
        }
      },
    }),
    expectation({
      id: 'switch-labelled',
      body: 'has a non-empty accessible name',
      priority: ExpectationPriority.BLOCKER,
      criteria: [WCAG_412_NAME_ROLE_VALUE, APG_SWITCH_ROLES],
      run: async h => {
        const name = await getSwitch(h).accessibleName();
        if (name.trim() === '') {
          throw new Error('switch has no accessible name');
        }
      },
    }),
    expectation({
      id: 'switch-disabled-state',
      body: 'when disabled, exposes the disabled state to assistive tech',
      priority: ExpectationPriority.MAJOR,
      criteria: [WCAG_412_NAME_ROLE_VALUE],
      run: h => {
        // Only meaningful for a disabled binding; enabled bindings list this in
        // expectedFailures. A disabled switch must expose it via native
        // `disabled` or `aria-disabled` (the latter keeps it focus-discoverable).
        const el = getSwitch(h);
        const nativeDisabled =
          el.tagName() === 'INPUT' && el.getAttribute('disabled') !== null;
        if (!nativeDisabled && el.getAttribute('aria-disabled') !== 'true') {
          throw new Error(
            'disabled switch must set native disabled or aria-disabled="true"',
          );
        }
      },
    }),
    expectation({
      id: 'switch-disabled-not-activatable',
      body: 'when disabled, does not change state on activation',
      priority: ExpectationPriority.MAJOR,
      criteria: [APG_SWITCH_1, WCAG_412_NAME_ROLE_VALUE],
      run: async h => {
        // aria-disabled does NOT natively block activation, so a switch that
        // stays focusable via aria-disabled (e.g. to surface a disabledMessage)
        // must guard its own change handler. Only meaningful for a disabled
        // binding; enabled bindings list this in expectedFailures.
        const el = getSwitch(h);
        if (!el.isDisabled()) {
          throw new Error('binding is not disabled; activation guard N/A');
        }
        const start = el.isChecked();
        await h.click(el);
        if (getSwitch(h).isChecked() !== start) {
          throw new Error('disabled switch changed state on activation');
        }
      },
    }),
    expectation({
      id: 'switch-1',
      body: 'Space toggles the switch on when focused',
      priority: ExpectationPriority.BLOCKER,
      criteria: [APG_SWITCH_1, WCAG_211_KEYBOARD],
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
    }),
    expectation({
      id: 'switch-click-toggles',
      body: 'clicking the switch toggles its state',
      priority: ExpectationPriority.BLOCKER,
      criteria: [WCAG_211_KEYBOARD, APG_SWITCH_1],
      run: async h => {
        const el = getSwitch(h);
        await h.click(el);
        if (!getSwitch(h).isChecked()) {
          throw new Error('click did not toggle the switch on');
        }
      },
    }),
    expectation({
      id: 'switch-focusable',
      body: 'is reachable in the tab sequence (focusable)',
      priority: ExpectationPriority.MAJOR,
      criteria: [WCAG_211_KEYBOARD, APG_SWITCH_1],
      run: async h => {
        const el = getSwitch(h);
        await h.focus(el);
        if (!getSwitch(h).isFocused()) {
          throw new Error('switch did not receive focus');
        }
      },
    }),
    expectation({
      id: 'switch-optionally-described',
      body: 'if descriptive text exists, it is linked via aria-describedby',
      priority: ExpectationPriority.MINOR,
      criteria: [WCAG_412_NAME_ROLE_VALUE],
      run: h => {
        const el = getSwitch(h);
        if (!el.hasAttribute('aria-describedby')) {
          throw new Error('no aria-describedby present');
        }
      },
    }),
    expectation({
      id: 'switch-aria-snapshot',
      body: 'accessibility tree exposes a switch node (browser tier)',
      priority: ExpectationPriority.MAJOR,
      criteria: [WCAG_412_NAME_ROLE_VALUE, APG_SWITCH_ROLES],
      run: async h => {
        const snap = await h.ariaSnapshot();
        if (snap === '__jsdom_no_aria_tree__') {
          throw new Error('aria snapshot unavailable in jsdom tier');
        }
        if (!/switch/i.test(snap)) {
          throw new Error('accessibility tree does not expose a switch node');
        }
      },
    }),
  ],
};

/**
 * Checklist rows deliberately NOT encoded as runtime expectations for the switch
 * pattern, and why (the "encode or excuse" principle). Reviewed against the
 * spec-test authoring checklist in the aria-spec README.
 *
 * - Announcements (row 6): the switch itself announces state via aria-checked;
 *   it owns no async live region beyond the busy indicator, which is a Spinner
 *   concern, not the switch pattern. N/A.
 * - Reduced motion (row 7): the thumb transition is guarded by
 *   `prefers-reduced-motion` in Switch.tsx. This is a CSS/visual fact, verified
 *   in the browser tier (screenshot job), not a DOM assertion. Excused here.
 * - Forced colors (row 8) + Contrast (row 9): CSS-engine facts — browser-tier /
 *   axe territory, not encodable as a jsdom DOM check. Excused from this contract.
 * - Target size (row 10): the control is 40×24px; the 24px height meets the
 *   minimum but width-only checks need layout, so this is a browser-tier check.
 * - i18n (row 11): NOT runtime-testable via this suite. The only AT-facing string
 *   is the busy indicator's "Loading" text, which should route through
 *   useTranslator(). Enforced by the @astryx/no-hardcoded-i18n-string eslint rule,
 *   not by a contract expectation. (Tracked: Switch hardcodes "Loading".)
 */
export const switchExemptions = [
  'announcements',
  'reduced-motion',
  'forced-colors',
  'contrast',
  'target-size',
  'i18n',
] as const;
