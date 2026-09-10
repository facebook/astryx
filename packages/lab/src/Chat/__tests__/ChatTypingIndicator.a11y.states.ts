// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChatTypingIndicator.a11y.states.ts
 * @input Uses StatusMessageStateFacts from the shared accessibility contract
 * @output The AST-021 inventory for ChatTypingIndicator status states and exclusions
 * @position Data-only binding inventory shared by jsdom, Storybook, and Chromium
 */

import type {StatusMessageStateFacts} from '@astryxdesign/a11y-spec';

export interface ChatTypingStatusBindingDefinition {
  readonly id: string;
  readonly binding: 'ChatTypingIndicator';
  readonly summary: string;
  readonly facts: StatusMessageStateFacts;
  readonly subjectSelector: string;
  readonly storyId: string;
}

const LIFECYCLE_FACTS: StatusMessageStateFacts = {
  kind: 'live-region',
  politeness: 'polite',
  messageSource: 'text',
  message: 'Ana is typing…',
  replacement: 'Ana and Ben are typing…',
  canClear: true,
  canRepeat: false,
};

export const CHAT_TYPING_STATUS_BINDING_STATES = [
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
    facts: {...LIFECYCLE_FACTS, canClear: false},
    subjectSelector: '.astryx-chat-typing-indicator',
    storyId: 'a11y-status-message-pattern--chat-typing-name-mounted',
  },
] as const satisfies ReadonlyArray<ChatTypingStatusBindingDefinition>;

export type ChatTypingStatusBindingState =
  (typeof CHAT_TYPING_STATUS_BINDING_STATES)[number];
export type ChatTypingStatusStateId = ChatTypingStatusBindingState['id'];

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
