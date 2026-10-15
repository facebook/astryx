// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @input A document passage the viewer selects, and controlled comments and
 *   selection
 * @output Inline comments beside a document: quoting the selected passage in
 *   the composer and keeping the open thread in sync with its highlight
 * @position Copyable Lab Comments example
 */

import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {
  Comments,
  type CommentAnchor,
  type CommentThreadData,
  type CommentUser,
} from '@astryxdesign/lab';

const VIEWER: CommentUser = {id: 'avery', name: 'Avery Kim'};
const MAYA: CommentUser = {id: 'maya', name: 'Maya Chen'};

const PASSAGES = [
  'The final cohort completes rollout in two days.',
  'Guardrail metrics are reviewed before each step.',
];

const INITIAL_COMMENTS: readonly CommentThreadData[] = [
  {
    id: 'cohort',
    author: MAYA,
    body: 'Should this say three days? The dry run adds one.',
    createdAt: '2026-09-30T19:00:00Z',
    anchor: {quote: PASSAGES[0]},
  },
];

export default function CommentsInline() {
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [selection, setSelection] = useState<CommentAnchor>();

  const threadFor = (passage: string) =>
    comments.find(comment => comment.anchor?.quote === passage);

  const post = (body: string, parentId?: string) => {
    const comment = {
      id: `comment-${Date.now()}`,
      author: VIEWER,
      body,
      createdAt: new Date().toISOString(),
    };
    setComments(current =>
      parentId == null
        ? [...current, {...comment, anchor: selection}]
        : current.map(root =>
            root.id === parentId
              ? {...root, replies: [...(root.replies ?? []), comment]}
              : root,
          ),
    );
    if (parentId == null) {
      setSelection(undefined);
    }
  };

  return (
    <HStack gap={4} align="start">
      <Card width={280} padding={4}>
        <VStack gap={3}>
          {PASSAGES.map(passage => {
            const thread = threadFor(passage);
            return (
              <VStack key={passage} gap={1} align="start">
                <Text type="body">{passage}</Text>
                {thread != null ? (
                  <Button
                    label="Open comment"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedThreadId(thread.id)}
                  />
                ) : (
                  <Button
                    label="Comment on this"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelection({quote: passage})}
                  />
                )}
              </VStack>
            );
          })}
        </VStack>
      </Card>
      <VStack width={360} height={440}>
        <Comments
          label="Comments"
          comments={comments}
          currentUser={VIEWER}
          density="compact"
          selectedThreadId={selectedThreadId}
          onSelectedThreadChange={setSelectedThreadId}
          composerAnchor={selection}
          onComposerAnchorDismiss={() => setSelection(undefined)}
          onSubmit={post}
        />
      </VStack>
    </HStack>
  );
}
