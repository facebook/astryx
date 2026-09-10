// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file StatusMessage.a11y.known-failures.ts
 * @input Uses the exact known-failure vocabulary from the shared runner
 * @output Public-safe records for existing Core status-message failures
 * @position Migration debt only; operational ownership is maintained outside this public repository
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

const STANDARD = 'WCAG 2.2 Technique ARIA22 (advisory reliability evidence)';

const REASON =
  'This advisory technique mismatch is recorded without a speech claim; remediation requires a separate owner decision and real assistive-technology evidence.';

function bornWithText(
  binding: string,
  state: string,
  message: string,
  userImpact: string,
): KnownFailure {
  return {
    expectation: 'status-message.region.precedes-content',
    binding,
    state,
    evidenceLayer: 'dom',
    failureEquals: `the status region already contains ${JSON.stringify(message)} at the pre-update boundary, so it was mounted with its message instead of receiving the status as a later change`,
    standardsReference: STANDARD,
    userImpact,
    reason: REASON,
  };
}

export const CORE_STATUS_MESSAGE_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  bornWithText(
    'Toast card',
    'toast-info-card-mounted',
    'Changes saved',
    'This state does not provide ARIA22’s recommended empty-before-update lifecycle; whether assistive technology misses the visible info toast requires real-AT evidence.',
  ),
  bornWithText(
    'ChatSystemMessage',
    'chat-system-status-mounted',
    'Conversation started',
    'This appended notice does not provide ARIA22’s recommended empty-before-update lifecycle; whether assistive technology misses it requires real-AT evidence.',
  ),
];
