// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Comments barrel export
 * @input Imports CommentThread, CommentComposer, and their public types
 * @output Exports the standalone Lab comment thread and composer surfaces
 * @position Comments-family entry point; re-exported by packages/lab/src/index.ts
 */

export {CommentThread} from './CommentThread';
export type {CommentThreadProps} from './CommentThread';
export {CommentComposer} from './CommentComposer';
export type {CommentComposerProps} from './CommentComposer';
export {COMMENT_ICON_KEYS} from './icons';
export {DEFAULT_COMMENT_REACTIONS} from './types';
export type {
  CommentAgentCommand,
  CommentAnchor,
  CommentComposerContext,
  CommentComposerRenderProps,
  CommentData,
  CommentStatus,
  CommentHighlightColor,
  CommentImageUploader,
  CommentMode,
  CommentProgress,
  CommentReaction,
  CommentReactionOption,
  CommentThreadData,
  CommentThreadSharedProps,
  CommentUploadedImage,
  CommentUser,
  CommentVersion,
} from './types';
