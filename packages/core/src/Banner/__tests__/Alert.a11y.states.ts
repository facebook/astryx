// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Alert.a11y.states.ts
 * @input Uses StatusMessageStateFacts from the shared accessibility contract
 * @output The AST-021 inventory for Banner states that explicitly request urgent alert semantics
 * @position Data-only binding inventory shared by jsdom, Storybook, and Chromium
 */

import type {StatusMessageStateFacts} from '@astryxdesign/a11y-spec';

type AlertFacts = Extract<StatusMessageStateFacts, {kind: 'live-region'}>;

export interface BannerAlertBindingDefinition {
  readonly id: string;
  readonly binding: 'Banner urgent alert';
  readonly summary: string;
  readonly facts: AlertFacts;
  readonly status: 'warning' | 'error';
  readonly dismissible: boolean;
  readonly storyId: string;
}

function alertFacts(initialMessage: string, replacement: string): AlertFacts {
  return {
    kind: 'live-region',
    role: 'alert',
    politeness: 'assertive',
    messageSource: 'text',
    initialMessage,
    message: initialMessage,
    replacement,
    semanticTransitions: ['replace'],
  };
}

export type BannerAlertStateId =
  'banner-error-alert-mounted' | 'banner-warning-alert-dismissible';

export const BANNER_ALERT_BINDING_STATES: ReadonlyArray<
  BannerAlertBindingDefinition & {readonly id: BannerAlertStateId}
> = [
  {
    id: 'banner-error-alert-mounted',
    binding: 'Banner urgent alert',
    summary:
      'an explicitly urgent error banner remains an assertive alert when its message is replaced',
    facts: alertFacts('Upload failed', 'Connection failed'),
    status: 'error',
    dismissible: false,
    storyId: 'a11y-alert-pattern--banner-error-alert-mounted',
  },
  {
    id: 'banner-warning-alert-dismissible',
    binding: 'Banner urgent alert',
    summary:
      'an explicitly urgent dismissible warning remains an assertive alert when its message is replaced',
    facts: alertFacts('Session expires soon', 'Session has expired'),
    status: 'warning',
    dismissible: true,
    storyId: 'a11y-alert-pattern--banner-warning-alert-dismissible',
  },
];

export type BannerAlertBindingState = BannerAlertBindingDefinition & {
  readonly id: BannerAlertStateId;
};

export const BANNER_ALERT_EXCLUSIONS = [
  {
    owner: 'component:Banner',
    part: 'non-alert and status-to-role selection',
    reason:
      'This binding starts after Banner has resolved the public role to alert. Its non-alert states and status-to-role selection remain component-owned.',
  },
  {
    owner: 'Button, Disclosure, and Banner',
    part: 'disclosure and action controls',
    reason:
      'Buttons, disclosure state, callback effects, and dismissal focus handoff keep their own component contracts and tests.',
  },
  {
    owner: 'spec:AST-009',
    part: 'spoken announcement output and timing',
    reason:
      'This binding proves DOM, Chromium accessibility-tree, and browser focus outcomes only; real assistive technology owns speech and timing claims.',
  },
] as const;
