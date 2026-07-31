// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {
  ChatSpeechButton,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageMetadata,
  useChatSpeech,
} from '@astryxdesign/core/Chat';
import type {UseChatSpeechReturn} from '@astryxdesign/core/Chat';

// =============================================================================
// Mock speech values for non-interactive stories
// =============================================================================

const idleSpeech: UseChatSpeechReturn = {
  isSupported: true,
  isSpeaking: false,
  isPaused: false,
  voices: [],
  speak: () => {},
  stop: () => {},
  pause: () => {},
  resume: () => {},
};

const speakingSpeech: UseChatSpeechReturn = {
  ...idleSpeech,
  isSpeaking: true,
};

const unsupportedSpeech: UseChatSpeechReturn = {
  ...idleSpeech,
  isSupported: false,
};

const SAMPLE =
  'Astryx is a design system for building internal tools and products.';

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof ChatSpeechButton> = {
  title: 'Core/ChatSpeech',
  component: ChatSpeechButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div style={{width: 600, padding: 40}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatSpeechButton>;

// =============================================================================
// Stories
// =============================================================================

/** Idle state — speaker icon, ready to read a message aloud */
export const Idle: Story = {
  render: () => <ChatSpeechButton speech={idleSpeech} text={SAMPLE} />,
};

/** Speaking state — animated sound-wave bars; click to stop */
export const Speaking: Story = {
  render: () => <ChatSpeechButton speech={speakingSpeech} text={SAMPLE} />,
};

/** Unsupported browser — button hidden by default */
export const Unsupported: Story = {
  render: () => (
    <div>
      <p style={{marginBottom: 8}}>
        Button is hidden when unsupported (nothing below):
      </p>
      <ChatSpeechButton speech={unsupportedSpeech} text={SAMPLE} />
    </div>
  ),
};

/** Unsupported browser — button visible when isHiddenWhenUnsupported is false */
export const UnsupportedVisible: Story = {
  render: () => (
    <ChatSpeechButton
      speech={unsupportedSpeech}
      text={SAMPLE}
      isHiddenWhenUnsupported={false}
    />
  ),
};

/** Speech button in the footer of an assistant message */
export const InMessageFooter: Story = {
  render: () => (
    <ChatMessage sender="assistant">
      <ChatMessageBubble>{SAMPLE}</ChatMessageBubble>
      <ChatMessageMetadata
        timestamp="2:14 PM"
        footer={
          <ChatSpeechButton speech={idleSpeech} text={SAMPLE} size="sm" />
        }
      />
    </ChatMessage>
  ),
};

/**
 * Interactive demo with real SpeechSynthesis.
 *
 * Click the speaker button to hear the message read aloud. Click again to stop.
 */
export const Interactive: Story = {
  render: () => {
    const speech = useChatSpeech();
    const text =
      'Hello! This message is being read aloud using the browser speech synthesis API. Click the button again to stop.';

    return (
      <ChatMessage sender="assistant">
        <ChatMessageBubble>{text}</ChatMessageBubble>
        <ChatMessageMetadata
          timestamp="now"
          footer={<ChatSpeechButton speech={speech} text={text} size="sm" />}
        />
        {!speech.isSupported && (
          <p style={{marginTop: 8, color: 'red'}}>
            SpeechSynthesis is not supported in this browser.
          </p>
        )}
      </ChatMessage>
    );
  },
};
