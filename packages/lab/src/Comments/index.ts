// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input CommentComposer implementation and its public data types
 * @output Exports the Lab CommentComposer surface
 * @position CommentComposer entry point; re-exported by packages/lab/src/index.ts
 */

export {CommentComposer} from './CommentComposer';
export type {CommentComposerProps} from './CommentComposer';
export type {
  CommentAgentCommand,
  CommentAnchor,
  CommentComposerContext,
  CommentComposerRenderProps,
  CommentHighlightColor,
  CommentImageUploader,
  CommentUploadedImage,
} from './types';
