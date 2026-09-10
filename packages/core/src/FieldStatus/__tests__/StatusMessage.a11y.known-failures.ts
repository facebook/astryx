// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file StatusMessage.a11y.known-failures.ts
 * @input Uses the exact known-failure vocabulary from the shared runner
 * @output Public-safe records for existing Core status-message failures
 * @position Migration debt only; operational ownership is maintained outside this public repository
 */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

const STANDARD = 'WCAG 2.2 4.1.3 Status Messages (AA)';

function remediationReason(issue: number): string {
  return `Existing behavior is recorded in https://github.com/facebook/astryx/issues/${issue}; remediation belongs in a separate focused change.`;
}

function bornWithText(
  binding: string,
  state: string,
  message: string,
  userImpact: string,
  issue: number,
): KnownFailure {
  return {
    expectation: 'status-message.region.precedes-content',
    binding,
    state,
    evidenceLayer: 'dom',
    failureEquals: `the status region already contains ${JSON.stringify(message)} at the pre-update boundary, so it was mounted with its message instead of receiving the status as a later change`,
    standardsReference: STANDARD,
    userImpact,
    reason: remediationReason(issue),
  };
}

function bornWithName(
  binding: string,
  state: string,
  name: string,
  userImpact: string,
  issue: number,
): KnownFailure {
  return {
    expectation: 'status-message.region.precedes-named-message',
    binding,
    state,
    evidenceLayer: 'accessibility-tree',
    failureEquals: `the named status region already has the accessible name ${JSON.stringify(name)} at the pre-update boundary, so it was mounted with its message instead of receiving the status as a later change`,
    standardsReference: STANDARD,
    userImpact,
    reason: remediationReason(issue),
  };
}

export const CORE_STATUS_MESSAGE_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  bornWithText(
    'Toast card',
    'toast-info-card-mounted',
    'Changes saved',
    'A screen reader can miss the visible info toast because its live region and text enter the document together; the separate announcement channel still exposes the dispatch.',
    6210,
  ),
  bornWithText(
    'Toast card',
    'toast-error-card-mounted',
    'Upload failed',
    'The visible error card creates a second live region with content already present, so announcement ownership is duplicated even though the persistent assertive channel exposes the dispatch.',
    6210,
  ),
  bornWithName(
    'Spinner',
    'spinner-default-label-mounted',
    'Loading',
    'A screen reader can miss the loading update when a spinner is conditionally mounted with its default status name.',
    6211,
  ),
  bornWithName(
    'Spinner',
    'spinner-visible-label-mounted',
    'Fetching data',
    'A screen reader can miss the loading update when a visibly labelled spinner and its status name enter the document together.',
    6211,
  ),
  bornWithText(
    'ChatSystemMessage',
    'chat-system-status-mounted',
    'Conversation started',
    'A screen reader can miss a newly appended chat status because the live region is created together with its message.',
    6213,
  ),
];
