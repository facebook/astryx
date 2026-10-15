// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'DiffViewer',
  displayName: 'Diff Viewer',
  group: 'DiffViewer',
  category: 'Content',
  keywords: [
    'diff',
    'patch',
    'code review',
    'changes',
    'split',
    'unified',
    'side by side',
    'compare',
  ],

  theming: {
    targets: [
      {className: 'astryx-diff-viewer', visualProps: ['viewMode']},
      {className: 'astryx-diff-viewer-header'},
      {className: 'astryx-diff-viewer-path'},
    ],
  },

  usage: {
    description:
      'Read-only, syntax-highlighted diff of one file for code review surfaces. Renders a file header (path, Added/Deleted/Renamed token, +/− line counts, a headerEnd slot, and an optional disclosure) over the file\'s hunks in unified or split (side-by-side) view. Rows use the same syntax-theme diff slots as CodeBlock with isDiff, so one syntax theme styles both. renderLineAnnotation adds a full-width row under any line (for review comments) and onLineNumberClick turns line numbers into buttons. Build the file model with parseUnifiedDiff(patch), which returns one file per file in a git or diff -u patch. Each changed line carries a visually hidden "Added"/"Removed" label, so the change reads without colour. In right-to-left pages the hunk area stays left-to-right, like a code editor, while the file header and annotation rows follow the page. Rows are plain DOM with no virtualization: collapse or window very large files.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Render one DiffViewer per file and lay out the list yourself; parseUnifiedDiff(patch).map(file => <DiffViewer key={file.newPath ?? file.oldPath} file={file} />) is the multi-file case.',
      },
      {
        guidance: true,
        description:
          'Anchor review comments with the DiffViewerLineRef side + lineNumber pair: it is the same in unified and split view.',
      },
      {
        guidance: true,
        description:
          'Put file-level actions such as a "Viewed" checkbox in headerEnd, and drive isCollapsed from the same state if viewed files should fold away.',
      },
      {
        guidance: false,
        description:
          'Use DiffViewer for a short diff inside prose or a chat message; a CodeBlock with isDiff (or a ```diff fence in Markdown) is the lighter fit there.',
      },
    ],
  },

  examples: [
    {
      label: 'Unified diff from a patch',
      code: `const [file] = parseUnifiedDiff(patch);

<DiffViewer file={file} />`,
    },
    {
      label: 'Split view',
      code: '<DiffViewer file={file} viewMode="split" />',
    },
    {
      label: 'Review comments',
      code: `<DiffViewer
  file={file}
  onLineNumberClick={(ref) => startComment(ref.side, ref.lineNumber)}
  renderLineAnnotation={(ref) => {
    const thread = threads.get(\`\${ref.side}:\${ref.lineNumber}\`);
    return thread ? <CommentThread thread={thread} /> : null;
  }}
/>`,
    },
  ],

  props: [
    {
      name: 'file',
      type: 'DiffViewerFile',
      description:
        'The file to render: paths, status, binary flag, and hunks of numbered lines. Build it with parseUnifiedDiff.',
      required: true,
    },
    {
      name: 'viewMode',
      type: "'unified' | 'split'",
      description:
        "'unified' shows one column with removed lines above their replacements; 'split' shows the old file on the left and the new file on the right, pairing each removed line with the added line that replaced it.",
      default: "'unified'",
    },
    {
      name: 'language',
      type: 'string',
      description:
        'Syntax-highlighting language. Defaults to one inferred from the file extension; unknown extensions render as plain text.',
    },
    {
      name: 'hasLineNumbers',
      type: 'boolean',
      description: 'Show the old and new line-number gutters.',
      default: 'true',
    },
    {
      name: 'isWrapped',
      type: 'boolean',
      description: 'Wrap long lines instead of scrolling them horizontally.',
      default: 'false',
    },
    {
      name: 'isCollapsible',
      type: 'boolean',
      description:
        'Make the file header a disclosure that hides and shows the hunks. Applies when the file has a path to name the control.',
      default: 'true',
    },
    {
      name: 'isCollapsed',
      type: 'boolean',
      description: 'Controlled collapsed state. Pair with onCollapsedChange.',
    },
    {
      name: 'defaultIsCollapsed',
      type: 'boolean',
      description: 'Initial collapsed state when uncontrolled.',
      default: 'false',
    },
    {
      name: 'onCollapsedChange',
      type: '(isCollapsed: boolean) => void',
      description:
        'Called with the next collapsed state when the header is toggled.',
    },
    {
      name: 'headerEnd',
      type: 'ReactNode',
      description:
        'Content at the end of the file header, such as a "Viewed" checkbox or a file actions menu.',
    },
    {
      name: 'renderLineAnnotation',
      type: '(ref: DiffViewerLineRef) => ReactNode',
      description:
        "Render content in a full-width row under a line, such as review comments; return null for lines with nothing to show. In split view the row sits under the line's own side.",
    },
    {
      name: 'onLineNumberClick',
      type: '(ref: DiffViewerLineRef, event: MouseEvent<HTMLButtonElement>) => void',
      description:
        "Makes each line's number a button, for example to start a comment on that line. The button is the number the line is anchored to: the original number of a removed line, and the changed-file number of an added or unchanged line (an unchanged line's original number stays plain text). Each line number is its own Tab stop.",
    },
    {
      name: 'maxHeight',
      type: 'number | string',
      description: 'Maximum height of the hunk area before it scrolls.',
    },
    {
      name: 'syntaxTheme',
      type: 'SyntaxThemeDefinition',
      description:
        'Per-instance syntax theme, as on CodeBlock. Without it the nearest SyntaxTheme or the theme syntax colors apply.',
    },
    {
      name: 'ref',
      type: 'Ref<HTMLDivElement>',
      description: 'Ref forwarded to the root element.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization.',
    },
  ],
};
