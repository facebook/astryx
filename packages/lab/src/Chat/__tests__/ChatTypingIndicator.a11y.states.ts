// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChatTypingIndicator.a11y.states.ts
 * @input Uses StatusMessageStateFacts from the shared accessibility contract
 * @output The AST-021 inventory for ChatTypingIndicator status states and exclusions
 * @position Data-only binding inventory shared by jsdom, Storybook, and Chromium
 */

import type {StatusMessageStateFacts} from '@astryxdesign/a11y-spec';

export type ChatTypingStatusStateId =
  'chat-typing-empty-to-message' | 'chat-typing-name-mounted';

export interface ChatTypingStatusBindingDefinition {
  readonly id: ChatTypingStatusStateId;
  readonly binding: 'ChatTypingIndicator';
  readonly summary: string;
  readonly facts: StatusMessageStateFacts;
  readonly subjectSelector: string;
  readonly storyId: string;
}

const LIFECYCLE_FACTS: StatusMessageStateFacts = {
  kind: 'live-region',
  role: 'status',
  politeness: 'polite',
  messageSource: 'text',
  initialMessage: '',
  message: 'Ana is typing…',
  replacement: 'Ana and Ben are typing…',
  semanticTransitions: ['show', 'replace', 'clear'],
  focusTransition: 'show',
  canClear: true,
  canRepeat: false,
};

export const CHAT_TYPING_STATUS_BINDING_STATES: ReadonlyArray<ChatTypingStatusBindingDefinition> =
  [
    {
      id: 'chat-typing-empty-to-message',
      binding: 'ChatTypingIndicator',
      summary:
        'the mounted empty indicator receives one name, replaces it with two, then clears',
      facts: LIFECYCLE_FACTS,
      subjectSelector: '.astryx-chat-typing-indicator',
      storyId: 'a11y-status-message-pattern--chat-typing-empty-to-message',
    },
    {
      id: 'chat-typing-name-mounted',
      binding: 'ChatTypingIndicator',
      summary: 'the documented named indicator is mounted with its status text',
      facts: {
        ...LIFECYCLE_FACTS,
        initialMessage: 'Ana is typing…',
        semanticTransitions: ['replace'],
        focusTransition: 'replace',
        canClear: false,
      },
      subjectSelector: '.astryx-chat-typing-indicator',
      storyId: 'a11y-status-message-pattern--chat-typing-name-mounted',
    },
  ];

export type ChatTypingStatusBindingState = ChatTypingStatusBindingDefinition;

export const CHAT_TYPING_STATUS_EXCLUSIONS = [
  {
    owner: 'ChatTypingIndicator',
    part: 'omitted names',
    reason:
      'Omitted names and an empty names array render the same empty persistent status state, so one binding row covers both inputs.',
  },
  {
    owner: 'ChatTypingIndicator and theme',
    part: 'typing-dot animation and reduced motion',
    reason:
      'The dots are decorative and aria-hidden; their paint and reduced-motion behavior stay in component and visual evidence.',
  },
  {
    owner: 'ChatMessageList',
    part: 'transcript log announcements',
    reason:
      'The parent role=log owns sequential message updates and stream batching, which are distinct from this one atomic typing status.',
  },
] as const;
