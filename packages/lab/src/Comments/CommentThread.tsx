// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file CommentThread.tsx
 * @input Uses React, StyleX, the Comments family's controller and CommentRow
 * @output Exports CommentThread and CommentThreadProps
 * @position One comment thread on its own: its first comment, one level of
 *   replies, reactions, actions, and the reply composer. For a margin comment
 *   beside a document, a popover under a highlight, or any surface that shows
 *   a single thread; Comments renders many with a composer for new ones.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Comments/index.ts (exports)
 * - /packages/lab/src/Comments/CommentThread.doc.mjs
 */

import {useCallback, useMemo, useRef, type Ref} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {VStack} from '@astryxdesign/core/Layout';
import {mergeProps, themeProps} from '@astryxdesign/core/utils';
import {CommentRow} from './CommentRow';
import {
  CommentsContextProvider,
  useCommentsController,
} from './CommentsContext';
import type {CommentThreadData, CommentThreadSharedProps} from './types';

export interface CommentThreadProps
  extends
    CommentThreadSharedProps,
    Omit<
      BaseProps<HTMLElement>,
      keyof CommentThreadSharedProps | 'onChange' | 'onSubmit'
    > {
  /** Ref forwarded to the root element. */
  ref?: Ref<HTMLElement>;
  /** The thread: its first comment, which carries its replies. */
  comment: CommentThreadData;
  /**
   * Whether the thread is open: its body unclamped and its replies shown. Omit
   * it to let the thread own selection; set it to open a thread from elsewhere,
   * such as its highlight in a document. Host selection does not move focus or
   * open the reply composer; a viewer Reply action does.
   */
  isSelected?: boolean;
  /** Called when the viewer opens or closes the thread. */
  onSelectedChange?: (isSelected: boolean) => void;
}

/**
 * One comment thread: its first comment, one level of replies, reactions,
 * edit history, and a reply composer. Controlled: the host owns the data and
 * every mutation; the thread owns presentation, selection, and focus.
 *
 * @example
 * ```
 * <CommentThread
 *   comment={thread}
 *   currentUser={viewer}
 *   container="card"
 *   onSubmit={(body, parentId) => postReply(parentId, body)}
 *   onReact={toggleReaction}
 * />
 * ```
 */
export function CommentThread({
  comment,
  isSelected,
  onSelectedChange,
  currentUser,
  mode,
  container,
  composerPlaceholder,
  highlightColor,
  reactionOptions,
  agentCommands,
  composerTriggers,
  markdownPlugins,
  markdownInlinePlugins,
  getReplyMention,
  hasEmojiPicker,
  isSubmitting,
  onComposerDraftChange,
  onSubmit,
  onSaveEdit,
  onDelete,
  onReact,
  onRetryComment,
  onResolveThread,
  onReopenThread,
  loadVersions,
  onUploadImages,
  renderAnchor,
  renderBody,
  renderVersionBody,
  renderAdditionalActions,
  renderComposer,
  ref,
  xstyle,
  className,
  style,
  ...rest
}: CommentThreadProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const setRootRef = useCallback(
    (element: HTMLElement | null) => {
      rootRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref != null) {
        ref.current = element;
      }
    },
    [ref],
  );
  const roots = useMemo(() => [comment], [comment]);
  const {value, dialogs} = useCommentsController({
    currentUser,
    mode,
    container,
    composerPlaceholder,
    highlightColor,
    reactionOptions,
    agentCommands,
    composerTriggers,
    markdownPlugins,
    markdownInlinePlugins,
    getReplyMention,
    hasEmojiPicker,
    isSubmitting,
    onComposerDraftChange,
    onSubmit,
    onSaveEdit,
    onDelete,
    onReact,
    onRetryComment,
    onResolveThread,
    onReopenThread,
    loadVersions,
    onUploadImages,
    renderAnchor,
    renderBody,
    renderVersionBody,
    renderAdditionalActions,
    renderComposer,
    selectedThreadId:
      isSelected === undefined ? undefined : isSelected ? comment.id : null,
    onSelectedThreadChange: threadId =>
      onSelectedChange?.(threadId === comment.id),
    roots,
    rootRef,
  });

  return (
    <CommentsContextProvider value={value}>
      <VStack
        ref={setRootRef}
        tabIndex={-1}
        width="100%"
        {...rest}
        {...mergeProps(
          themeProps('comment-thread', {container: container ?? 'section'}),
          stylex.props(xstyle),
          className,
          style,
        )}>
        {/* A lone thread on a card parent sits inside the host's border, so
            it draws no rules of its own. */}
        <CommentRow
          comment={comment}
          depth={0}
          threadId={comment.id}
          dividers={[]}
        />
        {dialogs}
      </VStack>
    </CommentsContextProvider>
  );
}

CommentThread.displayName = 'CommentThread';
