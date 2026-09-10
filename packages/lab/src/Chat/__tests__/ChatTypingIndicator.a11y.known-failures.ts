// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Public-safe known failure for the existing named-on-mount typing state. */

import type {KnownFailure} from '@astryxdesign/a11y-spec';

export const CHAT_TYPING_STATUS_KNOWN_FAILURES: ReadonlyArray<KnownFailure> = [
  {
    expectation: 'status-message.region.precedes-content',
    binding: 'ChatTypingIndicator',
    state: 'chat-typing-name-mounted',
    evidenceLayer: 'dom',
    failureEquals:
      'the status region already contains "Ana is typing…" at the pre-update boundary, so it was mounted with its message instead of receiving the status as a later change',
    standardsReference: 'WCAG 2.2 4.1.3 Status Messages (AA)',
    userImpact:
      'A screen reader can miss a typing update when the indicator is conditionally mounted with its message already present.',
    reason:
      'Existing behavior is recorded in https://github.com/facebook/astryx/issues/6212; remediation belongs in a separate focused change.',
  },
];
