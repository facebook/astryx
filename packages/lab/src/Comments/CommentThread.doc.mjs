// Copyright (c) Meta Platforms, Inc. and affiliates.

// @ts-check

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'CommentThread',
  displayName: 'Comment Thread',
  group: 'Comments',
  category: 'Chat',
  keywords: [
    'comment',
    'comment thread',
    'thread',
    'replies',
    'margin comment',
    'annotation',
  ],
  description:
    'One comment thread on its own: its first comment, one level of replies, reactions, edit history, controlled typing and seen metadata, and a reply composer. For a margin comment beside a document, a popover under a highlight, or any surface that shows a single thread.',
  usage: {
    description:
      'A comment thread shows one conversation: its first comment and the replies under it. Use it where a surface shows a single thread, such as a margin card beside a document or a popover opened from a highlight. To show many threads with a composer for new ones, use Comments.',
    anatomy: [
      {
        name: 'Surface',
        required: true,
        description:
          'An outlined Card on a page, or a Section without outer rules inside a card or popover. A press anywhere on it opens the thread; a visually hidden toggle carries its name and focus.',
      },
      {
        name: 'Quoted passage',
        required: false,
        description:
          'The passage an inline comment discusses, as an italic blockquote ruled in the highlight color, with an Outdated badge once the passage is edited away.',
      },
      {
        name: 'First comment',
        required: true,
        description:
          'Avatar, header (name, time, Edited, Resolved, and the actions shown on hover or focus), Markdown body clamped to three lines until the thread opens, and reactions.',
      },
      {
        name: 'Replies',
        required: false,
        description:
          'One level of replies behind View replies, joined to the first comment by an avatar rail while the thread is open. A host-marked unread reply reveals without selecting the thread, moving focus, or opening the reply composer.',
      },
      {
        name: 'Live state',
        required: false,
        description:
          'Controlled typing state follows the conversation while the thread is open, with its pulsing dots in the avatar column and its label on the comment-text line. Controlled `seenBy` metadata remains available to comment render callbacks but has no default presentation.',
      },
      {
        name: 'Reply composer',
        required: false,
        description:
          'A CommentComposer that opens with the thread, beside the viewer’s avatar.',
      },
    ],
    bestPractices: [
      {
        guidance: true,
        description:
          'Inside a card or popover, set `container="card"` and give the card no padding: the thread supplies its own insets and draws no outer rules.',
      },
      {
        guidance: true,
        description:
          'Control `isSelected` when the thread opens from elsewhere, such as its highlight in a document. Controlled selection reveals the body and replies without moving focus or opening the reply composer.',
      },
      {
        guidance: true,
        description:
          'Map your collaboration state to `typingUsers` and `seenBy`, then publish local reply and edit activity with `onComposerDraftChange`. `seenBy` stays hidden unless a comment render callback presents it. The thread never opens a connection or expires participants.',
      },
      {
        guidance: false,
        description:
          'Stack several CommentThreads with a composer to build a discussion. Use Comments, which keeps one thread open at a time and orders threads with activity.',
      },
      {
        guidance: false,
        description:
          'Wrap the thread in your own button or link to open it. The thread is already one toggle; a second control nests interactive elements.',
      },
    ],
  },
  props: [
    {
      name: 'comment',
      type: 'CommentThreadData',
      required: true,
      description:
        'The thread: its first comment, carrying its replies, reactions, optional anchor, transient `typingUsers`, and per-comment `seenBy` metadata. `seenBy` is not rendered by default but remains available to comment render callbacks.',
    },
    {
      name: 'isSelected',
      type: 'boolean',
      description:
        'Whether the thread is open, controlled: body unclamped and replies shown. Omit it to let the thread own selection. Host-controlled selection never moves focus or opens the reply composer; a viewer Reply action does.',
    },
    {
      name: 'onSelectedChange',
      type: '(isSelected: boolean) => void',
      description: 'Called when the viewer opens or closes the thread.',
    },
    {
      name: 'currentUser',
      type: 'CommentUser',
      description: 'The viewer, for own-comment actions and the reply avatar.',
    },
    {
      name: 'mode',
      type: "'interactive' | 'non-editable' | 'read-only'",
      default: "'interactive'",
      description: 'Which actions show, as on Comments.',
    },
    {
      name: 'container',
      type: "'section' | 'card'",
      default: "'section'",
      description:
        'The parent surface: an outlined Card on a page, or a Section without outer rules inside a card or popover.',
    },
    {
      name: 'onSubmit',
      type: '(content: string, parentCommentId?: string) => void | Promise<void>',
      description:
        'Posts a reply, always with the thread’s first comment as the parent. A rejected Promise restores the draft and shows an error with Retry.',
    },
    {
      name: 'onComposerDraftChange',
      type: '(value: string, context: CommentComposerContext) => void',
      description:
        'Reports internally owned reply and edit drafts, including seeds and an empty value after submit, cancel, or a target switch. Route updates by `context` and own transport timing in your app.',
    },
    {
      name: 'onSaveEdit',
      type: '(commentId: string, content: string) => void | Promise<void>',
      description:
        'Adds Edit to the viewer’s own comments and saves the new Markdown.',
    },
    {
      name: 'onDelete',
      type: '(commentId: string) => void | Promise<void>',
      description:
        'Adds Delete to the viewer’s own comments, confirmed in a dialog first.',
    },
    {
      name: 'onReact',
      type: '(commentId: string, reactionKey: string, option?: CommentReactionOption) => void | Promise<void>',
      description: 'Toggles the viewer’s reaction by its stable key.',
    },
    {
      name: 'onRetryComment',
      type: '(commentId: string) => void | Promise<void>',
      description: 'Adds Retry to a comment whose `status` is `error`.',
    },
    {
      name: 'onResolveThread',
      type: '(commentId: string) => void | Promise<void>',
      description: 'Adds Mark as resolved to an open thread.',
    },
    {
      name: 'onReopenThread',
      type: '(commentId: string) => void | Promise<void>',
      description: 'Adds Reopen to a resolved thread.',
    },
    {
      name: 'loadVersions',
      type: '(commentId: string) => Promise<readonly CommentVersion[]>',
      description: 'Loads a comment’s edit history, newest first.',
    },
    {
      name: 'onUploadImages',
      type: '(files: readonly File[], context: CommentComposerContext) => CommentUploadedImage[] | Promise<CommentUploadedImage[]>',
      description:
        'Uploads images attached, pasted, or dropped in the reply composer and appends them as Markdown images.',
    },
    {
      name: 'isSubmitting',
      type: 'boolean',
      default: 'false',
      description: 'Host-controlled pending state for the reply composer.',
    },
    {
      name: 'composerPlaceholder',
      type: 'string',
      description:
        'Placeholder of the reply composer. Defaults to the localized "Reply to <name>…".',
    },
    {
      name: 'highlightColor',
      type: "'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'",
      default: "'yellow'",
      description:
        'The palette color your app highlights the thread’s passage in.',
    },
    {
      name: 'reactionOptions',
      type: 'readonly CommentReactionOption[]',
      default: 'DEFAULT_COMMENT_REACTIONS',
      description: 'The reactions Add reaction offers.',
    },
    {
      name: 'agentCommands',
      type: 'readonly CommentAgentCommand[]',
      description: 'Agents a reply can address with a `/` command.',
    },
    {
      name: 'composerTriggers',
      type: 'readonly ChatComposerTrigger[]',
      description:
        'Typeahead triggers for the reply composer, such as an `@` people search.',
    },
    {
      name: 'markdownPlugins',
      type: 'readonly MarkdownPluginEntry[]',
      description: 'Block Markdown plugins for comment bodies.',
    },
    {
      name: 'markdownInlinePlugins',
      type: 'readonly MarkdownInlinePlugin[]',
      description:
        'Inline Markdown plugins for comment bodies, such as mentions.',
    },
    {
      name: 'getReplyMention',
      type: '(author: CommentUser) => string | undefined',
      description: 'Seeds a reply to a reply with a mention of its author.',
    },
    {
      name: 'hasEmojiPicker',
      type: 'boolean',
      default: 'true',
      description: 'Whether the reply composer offers the emoji picker.',
    },
    {
      name: 'renderAnchor',
      type: '(comment: CommentThreadData, defaultAnchor: ReactNode) => ReactNode',
      description: 'Replaces the thread’s quoted passage.',
    },
    {
      name: 'renderBody',
      type: '(comment: CommentData) => ReactNode',
      description: 'Replaces a comment’s Markdown body.',
    },
    {
      name: 'renderVersionBody',
      type: '(version: CommentVersion) => ReactNode',
      description: 'Replaces the body of a version in the edit history.',
    },
    {
      name: 'renderAdditionalActions',
      type: '(comment: CommentData) => ReactNode',
      description: 'Adds product actions to a comment’s header.',
    },
    {
      name: 'renderComposer',
      type: '(props: CommentComposerRenderProps) => ReactNode',
      description:
        'Replaces the reply composer’s input while the thread keeps its draft and state.',
    },
  ],
  examples: [
    {
      label: 'Margin comment',
      code: `import {Card} from '@astryxdesign/core/Card';
import {CommentThread} from '@astryxdesign/lab';

<Card padding={0} width={320}>
  <CommentThread
    comment={{
      id: 'margin',
      author: {id: 'maya', name: 'Maya Chen'},
      body: 'Should this say three days? The dry run adds one.',
      createdAt: '2026-09-30T19:00:00Z',
      anchor: {quote: 'The final cohort completes rollout in two days.'},
    }}
    currentUser={{id: 'avery', name: 'Avery Kim'}}
    container="card"
    onSubmit={(body, parentId) => postReply(parentId, body)}
  />
</Card>`,
    },
  ],
};
