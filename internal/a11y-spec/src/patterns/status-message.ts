// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file status-message.ts
 * @input Uses the shared accessibility contract vocabulary
 * @output STATUS_MESSAGE_PATTERN and the facts a binding declares for one status surface
 * @position Reusable WCAG 2.2 status-message contract
 */

import {
  definePattern,
  type PatternContract,
  type WcagCriterion,
  type WebStandardRequirement,
} from '../contract';

const UNDERSTANDING = 'https://www.w3.org/WAI/WCAG22/Understanding';
const ARIA = 'https://www.w3.org/TR/wai-aria-1.2';

const WCAG_4_1_3: WcagCriterion = {
  standard: 'wcag',
  id: '4.1.3',
  name: 'Status Messages',
  level: 'AA',
  url: `${UNDERSTANDING}/status-messages.html`,
};

const ARIA_STATUS: WebStandardRequirement = {
  standard: 'web-standard',
  specification: 'WAI-ARIA 1.2 status role',
  requirement:
    'A status is a type of live region whose content is advisory information for the user but is not important enough to justify an alert.',
  url: `${ARIA}/#status`,
};

const ARIA_ALERT: WebStandardRequirement = {
  standard: 'web-standard',
  specification: 'WAI-ARIA 1.2 alert role',
  requirement:
    'Alerts are assertive live regions, which means they cause immediate notification for assistive technology users.',
  url: `${ARIA}/#alert`,
};

export interface StatusMessageStateFacts {
  readonly kind: 'live-region' | 'progressbar';
  readonly politeness: 'polite' | 'assertive' | null;
}

const LIVE_REGION = {
  condition: 'this binding uses a live region to expose the status message',
  test: (facts: StatusMessageStateFacts) => facts.kind === 'live-region',
};

export const STATUS_MESSAGE_PATTERN: PatternContract<StatusMessageStateFacts> =
  definePattern<StatusMessageStateFacts>({
    pattern: 'status-message',
    url: `${UNDERSTANDING}/status-messages.html`,
    scope:
      'One status update that is programmatically exposed without moving focus; announcement output remains real-AT evidence.',
    expectations: [
      {
        id: 'status-message.channel.exposed',
        outcome:
          'The browser exposes the status through the intended polite or assertive live channel.',
        sources: [WCAG_4_1_3, ARIA_STATUS, ARIA_ALERT],
        covers: ['4.1.3-status-messages'],
        appliesWhen: LIVE_REGION,
        evidenceLayer: 'accessibility-tree',
        enforcement: 'required',
        run: async ({subject, facts}) => {
          const {live} = await subject.computed();
          if (live !== facts.politeness) {
            throw new Error(
              live == null
                ? `the browser exposes no live channel for this ${facts.politeness} status message, so assistive technology has no programmatic status update to present without moving focus`
                : `the browser exposes this status message through the ${live} channel, not the intended ${facts.politeness} channel`,
            );
          }
        },
      },
    ],
    exemptions: {},
  });
