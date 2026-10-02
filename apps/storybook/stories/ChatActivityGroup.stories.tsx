// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
} from '@astryxdesign/core/Chat';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Markdown} from '@astryxdesign/core/Markdown';
import {ChatActivityGroup, type ChatActivityItem} from '@astryxdesign/lab';

const mixedItems: ChatActivityItem[] = [
  {
    kind: 'reasoning',
    content:
      'The button label is hardcoded. I will read the file, then patch it.',
    label: 'Thinking',
    duration: '2.1s',
  },
  {
    kind: 'tool',
    name: 'readFile',
    status: 'complete',
    target: 'Button.tsx',
    duration: '120ms',
  },
  {
    kind: 'tool',
    name: 'editFile',
    status: 'complete',
    target: 'Button.tsx',
    duration: '340ms',
    additions: 4,
    deletions: 1,
    resultDetail: <pre>{`@@ -12,7 +12,7 @@\n-  Submit\n+  Save changes`}</pre>,
  },
];

const meta: Meta<typeof ChatActivityGroup> = {
  title: 'Lab/ChatActivityGroup',
  component: ChatActivityGroup,
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
type Story = StoryObj<typeof meta>;

export const CollapsedMixed: Story = {
  args: {
    items: [
      ...mixedItems.slice(0, 2),
      {kind: 'tool', name: 'editFile', status: 'running', target: 'Button.tsx'},
    ],
  },
};

export const ExpandedMixed: Story = {
  args: {
    items: mixedItems,
    defaultIsExpanded: true,
  },
};

export const LatestReasoningStreaming: Story = {
  args: {
    items: [
      {
        kind: 'tool',
        name: 'searchCode',
        status: 'complete',
        target: 'ChatToolCalls',
      },
      {
        kind: 'reasoning',
        content: 'The search hit the group header, not the row renderer.',
        label: 'Thinking',
        isStreaming: true,
      },
    ],
  },
};

export const LatestToolError: Story = {
  args: {
    items: [
      {
        kind: 'reasoning',
        content: 'Trying the test command next.',
        duration: '1s',
      },
      {
        kind: 'tool',
        name: 'bash',
        status: 'error',
        target: 'pnpm test',
        errorMessage: 'Command exited with code 1',
      },
    ],
  },
};

export const InMessage: Story = {
  render: () => (
    <ChatMessageList>
      <ChatMessage sender="user">
        <ChatMessageBubble>Rename the submit button.</ChatMessageBubble>
      </ChatMessage>
      <ChatMessage sender="assistant" avatar={<Avatar name="AI" size="md" />}>
        <ChatActivityGroup items={mixedItems} />
        <Markdown density="compact">
          {`Renamed the label to **Save changes**.`}
        </Markdown>
      </ChatMessage>
    </ChatMessageList>
  ),
};
