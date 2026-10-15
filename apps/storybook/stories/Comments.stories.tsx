// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {VStack} from '@astryxdesign/core/Layout';
import {
  CommentThread,
  type CommentThreadData,
  type CommentUser,
} from '@astryxdesign/lab';
import CommentComposerShowcase from '../../../packages/lab/blocks/CommentComposerShowcase';
import CommentThreadInPopover from '../../../packages/lab/blocks/CommentThreadInPopover';
import CommentThreadShowcase from '../../../packages/lab/blocks/CommentThreadShowcase';

const meta: Meta = {
  title: 'Lab/Comments',
  tags: ['autodocs'],
  parameters: {layout: 'centered'},
};

export default meta;
type Story = StoryObj;

const VIEWER: CommentUser = {id: 'avery', name: 'Avery Kim'};
const MAYA: CommentUser = {id: 'maya', name: 'Maya Chen'};
const JORDAN: CommentUser = {id: 'jordan', name: 'Jordan Lee'};
const SAM: CommentUser = {id: 'sam', name: 'Sam Rivera'};

const THREAD: CommentThreadData = {
  id: 'root',
  author: MAYA,
  body: 'The rollout plan is ready for review.',
  createdAt: '2026-09-30T19:00:00Z',
  reactions: [
    {
      key: 'like',
      label: '👍',
      count: 2,
      reactedByViewer: true,
      actors: [VIEWER, MAYA],
    },
  ],
  replies: [
    {
      id: 'reply',
      author: VIEWER,
      body: 'Looks good to me.',
      createdAt: '2026-09-30T19:10:00Z',
    },
  ],
};

/** A controlled standalone composer that posts into a short list. */
export const Composer: Story = {
  render: () => <CommentComposerShowcase />,
};

/** One thread on its own: a margin comment beside a document. */
export const MarginComment: Story = {
  render: () => <CommentThreadShowcase />,
};

/**
 * A thread in a Popover that owns its dismissal: with an unsaved reply, the
 * first press outside or Escape shakes the thread and keeps the draft.
 */
export const InPopover: Story = {
  render: () => <CommentThreadInPopover />,
};

/** A host-opened thread reveals its body and replies without moving focus. */
export const OpenThread: Story = {
  render: () => (
    <VStack width={480}>
      <CommentThread
        comment={THREAD}
        currentUser={VIEWER}
        isSelected
        onSubmit={() => {}}
        onReact={() => {}}
      />
    </VStack>
  ),
};

/** Controlled typing plus hidden seen metadata, ready for a transport adapter. */
export const LiveState: Story = {
  render: () => (
    <VStack width={480}>
      <CommentThread
        comment={{
          ...THREAD,
          typingUsers: [JORDAN, SAM],
          seenBy: [JORDAN, SAM],
          replies: [
            {
              id: 'live-reply',
              author: VIEWER,
              body: 'The review notes are incorporated.',
              createdAt: '2026-09-30T19:10:00Z',
              seenBy: [MAYA, JORDAN, SAM],
            },
          ],
        }}
        currentUser={VIEWER}
        isSelected
        onSubmit={() => {}}
      />
    </VStack>
  ),
};
