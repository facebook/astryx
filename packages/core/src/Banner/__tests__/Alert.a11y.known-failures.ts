// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Alert.a11y.known-failures.ts
 * @input Uses KnownFailure from @astryxdesign/a11y-spec
 * @output Exact public-safe baseline failures for Banner's urgent alert binding
 * @position Shared by the jsdom and Chromium bindings. These records preserve
 *   current behavior during test migration; they do not approve remediation.
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

export const BANNER_ALERT_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  {
    expectation: 'status-message.message.text-exposed',
    binding: 'Banner urgent alert',
    state: 'banner-warning-alert-dismissible',
    evidenceLayer: 'accessibility-tree',
    failureEquals:
      'the live region contains "Session expires soonDismiss" at the pre-update boundary, not the complete authored message "Session expires soon"',
    standardsReference:
      'WCAG 2.2 4.1.3 Status Messages (AA); WAI-ARIA 1.2 alert role — the alert region carries the complete authored message, and its implicit aria-atomic=true presents the whole region.',
    userImpact:
      'When a dismissible Banner explicitly requests role="alert", its Dismiss control sits inside the alert region, so the alert content people using assistive technology receive is the warning followed by the control label rather than the warning alone.',
    reason:
      'The explicit role lands on the whole Banner under component:Banner FR8 and DEC-2. Moving it to the message or keeping controls outside the region changes Banner behavior and needs an owner decision, so this migration records the existing exposure.',
  },
];
