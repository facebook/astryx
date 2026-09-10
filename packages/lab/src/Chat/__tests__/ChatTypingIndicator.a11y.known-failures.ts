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
    standardsReference:
      'WCAG 2.2 Technique ARIA22 (advisory reliability evidence)',
    userImpact:
      'This mounted state does not provide ARIA22’s recommended empty-before-update lifecycle; whether assistive technology misses the typing update requires real-AT evidence.',
    reason:
      'This advisory technique mismatch is recorded without a speech claim; remediation requires a separate owner decision and real assistive-technology evidence.',
  },
];
