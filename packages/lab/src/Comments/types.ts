// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input No runtime dependencies
 * @output Exports the data and callback types owned by CommentComposer
 * @position Type contract for the Lab CommentComposer; later Comments-family
 *   components extend this shared vocabulary
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Comments/index.ts (exports)
 * - /packages/lab/src/Comments/CommentComposer.doc.mjs
 */

/**
 * The passage an inline comment discusses. The host owns anchoring (the text
 * selection, offsets, and re-resolving them after edits); the composer quotes
 * the passage without owning its coordinates.
 */
export interface CommentAnchor {
  /** The selected text, quoted above the composer. */
  quote: string;
  /**
   * `orphaned` when edits removed the passage.
   * @default 'anchored'
   */
  status?: 'anchored' | 'orphaned';
}

/** A palette color the host uses to connect a quoted passage to its highlight. */
export type CommentHighlightColor =
  | 'blue'
  | 'cyan'
  | 'gray'
  | 'green'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal'
  | 'yellow';

/** An image the host's upload flow stored. */
export interface CommentUploadedImage {
  /** URL of the stored image. */
  url: string;
  /** Description used as the image's alt text. */
  alt: string;
}

/** Which comment workflow a composer callback belongs to. */
export type CommentComposerContext =
  | {
      kind: 'comment';
      /** The passage a new inline comment will attach to, when there is one. */
      anchor?: CommentAnchor;
    }
  | {kind: 'edit'; commentId: string}
  | {kind: 'reply'; parentCommentId: string; repliedToCommentId: string};

/** What a `renderComposer` replacement receives. */
export interface CommentComposerRenderProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder: string;
  isSubmitting: boolean;
  error?: string;
  contextLabel?: string;
  context: CommentComposerContext;
  onCancel?: () => void;
}

/** An agent a comment can address with a slash command. */
export interface CommentAgentCommand {
  /** The command after the slash: `ask` for `/ask`. */
  command: string;
  /** The agent's display name. */
  name: string;
  /** What asking it does, shown in the slash-command menu. */
  description: string;
  /** Optional square logo; initials render without one. */
  logoUrl?: string;
}

/** Uploads images and returns their stored URLs and alt text. */
export type CommentImageUploader = (
  files: readonly File[],
  context: CommentComposerContext,
) => readonly CommentUploadedImage[] | Promise<readonly CommentUploadedImage[]>;
