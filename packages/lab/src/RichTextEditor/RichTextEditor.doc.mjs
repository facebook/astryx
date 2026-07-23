// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'RichTextEditor',
  displayName: 'Rich Text Editor',
  category: 'Data Input',
  keywords: [
    'richtext',
    'rich text',
    'wysiwyg',
    'editor',
    'lexical',
    'formatting',
    'contenteditable',
    'prose',
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Label text for the editor. Always rendered for accessibility.',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Visually hide the label (still accessible to screen readers).',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description text displayed between the label and editor.',
    },
    {
      name: 'defaultValue',
      type: 'string',
      description:
        'Initial serialized editor state (JSON string from editorState.toJSON()). Read once on mount — the editor is uncontrolled.',
    },
    {
      name: 'onChange',
      type: '(editorState: EditorState, editor: LexicalEditor) => void',
      description:
        'Fired when content changes. Serialize with editorState.toJSON() for persistence.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text shown when the editor is empty.',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description: 'Whether the editor is read-only (non-editable).',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the editor is disabled (non-editable, dimmed).',
      default: 'false',
    },
    {
      name: 'status',
      type: '{ type: "warning" | "error" | "success"; message?: string }',
      description:
        'Status indicator. Shows a colored border and an optional message below the editor.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'The size of the editor, affecting internal padding.',
      default: "'md'",
    },
    {
      name: 'nodes',
      type: 'ReadonlyArray<Klass<LexicalNode>>',
      description:
        'Additional Lexical nodes to register beyond the default OSS set (Heading, Quote, List, Link, Code). Extension point for custom nodes (mentions, images) without forking.',
    },
    {
      name: 'plugins',
      type: 'ReactNode',
      description:
        'Additional Lexical plugins rendered inside the composer. Compose toolbars, mentions, autolink, etc. on top of the base editor.',
    },
    {
      name: 'hasMarkdownShortcuts',
      type: 'boolean',
      description:
        'Enable Markdown shortcut typing (e.g. "# " for a heading). Uses default @lexical/markdown transformers.',
      default: 'true',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Automatically focus the editor on mount.',
      default: 'false',
    },
    {
      name: 'width',
      type: 'number | string',
      description:
        'Width of the field. Numbers are pixels, strings used as-is (e.g. "100%").',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization. Must be a stylex.create() value, not an inline style object.',
    },
  ],
  theming: {
    targets: [{className: 'astryx-rich-text-editor', visualProps: []}],
  },
  usage: {
    description:
      'A WYSIWYG rich-text editor built on Lexical, styled with Astryx design tokens. Experimental component in @astryxdesign/lab (canary). lexical and @lexical/* are optional peer dependencies. The editor is deliberately minimal and extensible: pass nodes and plugins to layer richer behaviour (toolbars, mentions, hover cards) on top without forking. Use RichTextView to render serialized content read-only.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Install lexical and @lexical/react (optional peers) before importing from @astryxdesign/lab.',
      },
      {
        guidance: true,
        description:
          'Persist content by serializing editorState.toJSON() in onChange; rehydrate via defaultValue / RichTextView value.',
      },
      {
        guidance: true,
        description:
          'Register custom node types via the nodes prop on BOTH the editor and the RichTextView so serialized content round-trips.',
      },
      {
        guidance: false,
        description:
          'Use for single-line input or plain text; use TextInput or TextArea for those.',
      },
    ],
  },
};
