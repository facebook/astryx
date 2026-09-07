// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Switch.a11y.states.ts
 * @input Uses SwitchStateFacts from @astryxdesign/a11y-spec and SwitchProps
 * @output SWITCH_BINDING_STATES — every Switch state that can change the shared
 *   switch-pattern outcome, what each declares itself to be, and how each is
 *   mounted in either lane.
 * @position The binding inventory required before any assertion moves
 *   (`docs/specs/AST-021/spec.md` FR2, FR4). Shared by the jsdom and Chromium
 *   bindings so both cover the same states and cannot drift apart.
 *
 * A state earns a row when it can change what the switch pattern promises: a
 * different exposed state, a different operability, a different name source, a
 * different attached description. States that change only appearance — size,
 * label position, label spacing, width, theme — cannot, so they stay in
 * Switch.test.tsx where the component owns them.
 *
 * SYNC: Every row's `storyId` must exist in
 * - /apps/storybook/stories/Switch.stories.tsx
 */

import type {SwitchStateFacts} from '@astryxdesign/a11y-spec';
import type {SwitchProps} from '../Switch';

export interface SwitchBindingState {
  /** Stable state id. Named by known-failure records, so it does not churn. */
  readonly id: string;
  /** What this state is, for the report and the test name. */
  readonly summary: string;
  /** What the state declares itself to be; the contract checks the browser against it. */
  readonly facts: SwitchStateFacts;
  /** Props the jsdom lane renders. The value seeds the controlled state. */
  readonly props: Omit<SwitchProps, 'onChange'>;
  /** The checked-in Storybook story the Chromium lane drives. */
  readonly storyId: string;
}

export const SWITCH_BINDING_STATES: ReadonlyArray<SwitchBindingState> = [
  {
    id: 'off',
    summary: 'the default: a labelled switch that is off and can be turned on',
    storyId: 'core-switch--default',
    props: {label: 'Enable notifications', value: false},
    facts: {
      checked: false,
      operable: true,
      focusable: true,
      disabled: false,
      visibleLabel: 'Enable notifications',
      described: false,
      required: false,
      invalid: false,
      busy: false,
    },
  },
  {
    id: 'on',
    summary: 'a switch whose controlled value is already on',
    storyId: 'core-switch--on',
    props: {label: 'Notifications enabled', value: true},
    facts: {
      checked: true,
      operable: true,
      focusable: true,
      disabled: false,
      visibleLabel: 'Notifications enabled',
      described: false,
      required: false,
      invalid: false,
      busy: false,
    },
  },
  {
    id: 'described',
    summary: 'a switch with supporting text under its label',
    storyId: 'core-switch--with-description',
    props: {
      label: 'Dark mode',
      description: 'Switch to a darker color scheme for reduced eye strain.',
      value: false,
    },
    facts: {
      checked: false,
      operable: true,
      focusable: true,
      disabled: false,
      visibleLabel: 'Dark mode',
      described: true,
      required: false,
      invalid: false,
      busy: false,
    },
  },
  {
    id: 'label-hidden',
    summary:
      'a switch whose label is read by assistive technology but not rendered visibly',
    storyId: 'core-switch--with-hidden-label',
    props: {label: 'Toggle row', isLabelHidden: true, value: false},
    facts: {
      checked: false,
      operable: true,
      focusable: true,
      disabled: false,
      // Nothing is rendered visibly, so WCAG 2.5.3 has nothing to compare against.
      visibleLabel: null,
      described: false,
      required: false,
      invalid: false,
      busy: false,
    },
  },
  {
    id: 'disabled',
    summary: 'a natively disabled switch, out of the tab sequence',
    storyId: 'core-switch--disabled',
    props: {
      label: 'Premium feature',
      description: 'Upgrade to enable this option',
      isDisabled: true,
      value: false,
    },
    facts: {
      checked: false,
      operable: false,
      focusable: false,
      disabled: true,
      visibleLabel: 'Premium feature',
      described: true,
      required: false,
      invalid: false,
      busy: false,
    },
  },
  {
    id: 'focusable-disabled',
    summary:
      'a switch disabled with a reason: still focusable so the reason is discoverable, still not operable',
    storyId: 'core-switch--disabled-with-message',
    props: {
      label: 'Enable notifications',
      isDisabled: true,
      disabledMessage: 'Notifications are turned off org-wide',
      value: false,
    },
    facts: {
      checked: false,
      operable: false,
      focusable: true,
      disabled: true,
      visibleLabel: 'Enable notifications',
      described: true,
      required: false,
      invalid: false,
      busy: false,
    },
  },
  {
    id: 'required',
    summary: 'a switch that has to be on before the form can be submitted',
    storyId: 'core-switch--required',
    props: {
      label: 'Accept terms and conditions',
      isRequired: true,
      value: false,
    },
    facts: {
      checked: false,
      operable: true,
      focusable: true,
      disabled: false,
      visibleLabel: 'Accept terms and conditions',
      described: false,
      required: true,
      invalid: false,
      busy: false,
    },
  },
  {
    id: 'invalid',
    summary: 'a required switch reporting an error, with the message attached',
    storyId: 'core-switch--with-error-status',
    props: {
      label: 'Accept terms and conditions',
      isRequired: true,
      status: {
        type: 'error',
        message: 'You must accept the terms to continue',
      },
      value: false,
    },
    facts: {
      checked: false,
      operable: true,
      focusable: true,
      disabled: false,
      visibleLabel: 'Accept terms and conditions',
      described: true,
      required: true,
      invalid: true,
      busy: false,
    },
  },
  {
    id: 'loading',
    summary:
      'a switch waiting on the change it started: focusable, busy, and not operable until it settles',
    storyId: 'core-switch--loading',
    props: {label: 'Sync photos', isLoading: true, value: false},
    facts: {
      checked: false,
      operable: false,
      focusable: true,
      disabled: false,
      visibleLabel: 'Sync photos',
      described: false,
      required: false,
      invalid: false,
      busy: true,
    },
  },
];
