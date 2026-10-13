// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RichTextEditor.playground.tsx
 * @input Uses RichTextEditor with its toolbar, autolink plugin, Markdown
 *   serializers and plugin adapter; the Storybook demo Markdown plugins; the
 *   Markdown parity fixture; Lexical's table and horizontal-rule commands; and
 *   Astryx primitives for the settings, actions, and output panels.
 * @output `RichTextEditorPlayground`: ONE editor with every RichText feature
 *   switchable around it, and the live Markdown, HTML, editor-state, node-tree
 *   and RichTextView readouts of that same editor beside it.
 * @position Storybook-only sandbox for the Lab/RichTextEditor Playground story
 *   — the Astryx counterpart of playground.lexical.dev. Every other story
 *   mounts its own editor to show one feature; this one exists so features can
 *   be combined on a single document and watched for interactions (a toolbar
 *   format inside a table cell, a Markdown shortcut inside a code block, an
 *   autolinked URL exported back to Markdown).
 *
 * Stable hooks for browser tests: `data-playground` (the sandbox),
 * `data-playground-editor` (the one editor's frame),
 * `data-playground-settings` (the settings panel),
 * `data-playground-output="markdown | html | json | tree | view"` (the active
 * readout), and `data-playground-stats` (the live content counters).
 */

import {useCallback, useEffect, useId, useMemo, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Heading} from '@astryxdesign/core/Heading';
import {HStack} from '@astryxdesign/core/HStack';
import {Kbd} from '@astryxdesign/core/Kbd';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Text} from '@astryxdesign/core/Text';
import {TextArea} from '@astryxdesign/core/TextArea';
import {VStack} from '@astryxdesign/core/VStack';
import {
  colorVars,
  radiusVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {
  createRichTextExtension,
  editorStateJSONToMarkdown,
  markdownToEditorStateJSON,
  RichTextEditor,
  RichTextEditorAutoLinkPlugin,
  RichTextEditorToolbar,
  RichTextExtensionError,
  RichTextView,
  type RichTextEditorRef,
  type RichTextEditorSize,
  type RichTextEditorStatusType,
  type RichTextMarkdownExtension,
  type Transformer,
} from '@astryxdesign/richtext';
import {
  BOLD_STAR,
  INLINE_CODE,
  ITALIC_UNDERSCORE,
  UNORDERED_LIST,
} from '@lexical/markdown';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {INSERT_HORIZONTAL_RULE_COMMAND} from '@lexical/extension';
import {INSERT_TABLE_COMMAND} from '@lexical/table';
import {$getSelection, $isRangeSelection, type EditorState} from 'lexical';
import {markdownDemoPlugins} from './Markdown.demoPlugins';
import {MARKDOWN_PARITY_SOURCE} from './RichTextEditor.markdownParityFixture';

/* ------------------------------------------------------------------ *
 * Markdown plugins
 * ------------------------------------------------------------------ */

interface AdoptedPlugins {
  /** The demo plugins RichText can draw. */
  readonly extensions: ReadonlyArray<RichTextMarkdownExtension>;
  /** The ones it refused, with the reason, so the panel can say so. */
  readonly refused: ReadonlyArray<{plugin: string; reason: string}>;
}

/**
 * Adopt the Storybook demo Markdown plugins for RichText. The TODO plugin
 * declares a transform, which RichText refuses by design (spec:AST-064 FR4):
 * the playground shows that refusal rather than hiding it, because a reader
 * pasting a plugin in needs to know which kinds the editor can draw.
 */
const DEMO_PLUGINS: AdoptedPlugins = markdownDemoPlugins.reduce<{
  extensions: RichTextMarkdownExtension[];
  refused: Array<{plugin: string; reason: string}>;
}>(
  (adopted, plugin) => {
    try {
      adopted.extensions.push(createRichTextExtension(plugin));
    } catch (error) {
      adopted.refused.push({
        plugin:
          error instanceof RichTextExtensionError ? error.plugin : 'unknown',
        reason: error instanceof Error ? error.message : String(error),
      });
    }
    return adopted;
  },
  {extensions: [], refused: []},
);

/**
 * A deliberately small transformer set, so the restricted-Markdown switch
 * shows what narrowing `transformers` does to BOTH shortcut typing and the
 * Markdown export of the same document.
 */
const RESTRICTED_TRANSFORMERS: ReadonlyArray<Transformer> = [
  BOLD_STAR,
  ITALIC_UNDERSCORE,
  INLINE_CODE,
  UNORDERED_LIST,
];

/* ------------------------------------------------------------------ *
 * Documents
 * ------------------------------------------------------------------ */

const PLUGIN_DOCUMENT = [
  '# Markdown plugins',
  '',
  'Ping @{ada} and @{grace} before the review; the TODO below belongs to the',
  'plugin RichText refuses, so it stays plain text here.',
  '',
  ':::note',
  'A callout block, drawn by the demo callout plugin.',
  ':::',
  '',
  'TODO: hand over the runbook.',
  '',
].join('\n');

const INTERACTION_DOCUMENT = [
  '# Feature interactions',
  '',
  'Each block below is here to be combined with another one.',
  '',
  '| Feature | Try | Watch |',
  '| :--- | :--- | :--- |',
  '| Toolbar in a cell | **bold** a word in this cell | the cell keeps its column |',
  '| Link in a list | Cmd/Ctrl+K on a list item | the item keeps its marker |',
  '',
  '- [ ] A task item with `inline code` and a https://astryx.dev URL',
  '- [x] A done item holding **bold** and *italic* text',
  '',
  '> A quote that holds a [link](https://astryx.dev) and a line break  ',
  '> continuing on the next line.',
  '',
  '```ts',
  "// Markdown shortcuts are inert inside a code block: type '# ' here.",
  'export const retries = (attempt: number): number => 2 ** attempt;',
  '```',
  '',
  '---',
  '',
  'Last paragraph, for pressing Enter against the end of the document.',
  '',
].join('\n');

const DOCUMENTS = {
  'kitchen-sink': {
    label: 'Kitchen sink (every Markdown block)',
    source: MARKDOWN_PARITY_SOURCE,
  },
  interactions: {
    label: 'Feature interactions',
    source: INTERACTION_DOCUMENT,
  },
  plugins: {label: 'Markdown plugins', source: PLUGIN_DOCUMENT},
  empty: {label: 'Empty document', source: ''},
} as const;

type DocumentKey = keyof typeof DOCUMENTS;

/* ------------------------------------------------------------------ *
 * Styles
 * ------------------------------------------------------------------ */

const styles = stylex.create({
  playground: {
    display: 'grid',
    gap: spacingVars['--spacing-4'],
    alignContent: 'start',
  },
  columns: {
    display: 'grid',
    gap: spacingVars['--spacing-4'],
    alignItems: 'start',
    gridTemplateColumns: {
      default: 'minmax(0, 1fr)',
      '@media (min-width: 1100px)': 'minmax(0, 2fr) minmax(280px, 1fr)',
    },
  },
  panel: {
    display: 'grid',
    gap: spacingVars['--spacing-3'],
    alignContent: 'start',
    padding: spacingVars['--spacing-3'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-container'],
    backgroundColor: colorVars['--color-background-surface'],
  },
  group: {
    display: 'grid',
    gap: spacingVars['--spacing-2'],
    alignContent: 'start',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-2'],
  },
  // The panel is the scroll container AND the tab stop: a scrollable region
  // has to be reachable from the keyboard, and the tabs pattern already gives
  // this element focus.
  panelScroller: {
    maxHeight: '28rem',
    overflow: 'auto',
    borderRadius: radiusVars['--radius-container'],
  },
  output: {
    margin: 0,
    padding: spacingVars['--spacing-3'],
    borderRadius: radiusVars['--radius-container'],
    backgroundColor: colorVars['--color-background-muted'],
    color: colorVars['--color-text-primary'],
    fontFamily: typographyVars['--font-family-code'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  viewSurface: {
    padding: spacingVars['--spacing-3'],
    borderRadius: radiusVars['--radius-container'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
  },
  stats: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-3'],
  },
  shortcutRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
  },
});

/* ------------------------------------------------------------------ *
 * Insert controls (the toolbar's endContent slot)
 * ------------------------------------------------------------------ */

/**
 * The playground's counterpart of the Lexical playground's Insert menu, built
 * on the toolbar's public `endContent` slot: it reaches the editor through
 * `useLexicalComposerContext()`, like any consumer-authored control would.
 */
function InsertControls() {
  const [editor] = useLexicalComposerContext();
  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        label="Table"
        tooltip="Insert a 3×3 table with a header row"
        onClick={() =>
          editor.dispatchCommand(INSERT_TABLE_COMMAND, {
            columns: '3',
            rows: '3',
            includeHeaders: true,
          })
        }
      />
      <Button
        size="sm"
        variant="ghost"
        label="Rule"
        tooltip="Insert a horizontal rule"
        onClick={() =>
          editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)
        }
      />
      <Button
        size="sm"
        variant="ghost"
        label="Mention"
        tooltip="Insert the demo mention plugin's syntax at the caret"
        onClick={() =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertText('@{ada}');
            }
          })
        }
      />
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Node tree readout
 * ------------------------------------------------------------------ */

interface SerializedNodeLike {
  readonly type?: string;
  readonly children?: ReadonlyArray<SerializedNodeLike>;
  readonly text?: string;
  readonly format?: number | string;
  readonly tag?: string;
  readonly listType?: string;
  readonly language?: string;
  readonly url?: string;
  readonly checked?: boolean;
}

const TEXT_FORMATS: ReadonlyArray<readonly [number, string]> = [
  [1, 'bold'],
  [2, 'italic'],
  [4, 'strikethrough'],
  [8, 'underline'],
  [16, 'code'],
  [32, 'subscript'],
  [64, 'superscript'],
  [128, 'highlight'],
];

function describeNode(node: SerializedNodeLike): string {
  const parts: string[] = [node.type ?? 'unknown'];
  if (node.tag != null) {
    parts.push(`tag=${node.tag}`);
  }
  if (node.listType != null) {
    parts.push(`list=${node.listType}`);
  }
  if (node.language != null) {
    parts.push(`lang=${node.language}`);
  }
  if (node.url != null) {
    parts.push(`url=${node.url}`);
  }
  if (node.checked != null) {
    parts.push(node.checked ? 'checked' : 'unchecked');
  }
  if (typeof node.format === 'number' && node.format > 0) {
    const flags = TEXT_FORMATS.filter(
      ([bit]) => ((node.format as number) & bit) !== 0,
    ).map(([, name]) => name);
    if (flags.length > 0) {
      parts.push(flags.join('+'));
    }
  } else if (typeof node.format === 'string' && node.format !== '') {
    parts.push(`align=${node.format}`);
  }
  if (node.text != null) {
    parts.push(JSON.stringify(node.text));
  }
  return parts.join(' ');
}

/** The serialized state as an indented node tree, like Lexical's TreeView. */
function toNodeTree(stateJSON: string): string {
  let root: SerializedNodeLike;
  try {
    root = (JSON.parse(stateJSON) as {root: SerializedNodeLike}).root;
  } catch (error) {
    return `(unparseable editor state: ${String(error)})`;
  }
  const lines: string[] = [];
  const walk = (node: SerializedNodeLike, depth: number) => {
    lines.push(`${'  '.repeat(depth)}${describeNode(node)}`);
    for (const child of node.children ?? []) {
      walk(child, depth + 1);
    }
  };
  walk(root, 0);
  return lines.join('\n');
}

interface ContentStats {
  readonly characters: number;
  readonly words: number;
  readonly nodes: number;
  readonly blocks: number;
}

function toStats(stateJSON: string): ContentStats {
  let root: SerializedNodeLike;
  try {
    root = (JSON.parse(stateJSON) as {root: SerializedNodeLike}).root;
  } catch {
    return {characters: 0, words: 0, nodes: 0, blocks: 0};
  }
  let characters = 0;
  let nodes = 0;
  const words: string[] = [];
  const walk = (node: SerializedNodeLike) => {
    nodes += 1;
    if (node.text != null) {
      characters += node.text.length;
      words.push(node.text);
    }
    for (const child of node.children ?? []) {
      walk(child);
    }
  };
  walk(root);
  return {
    characters,
    words: words
      .join(' ')
      .split(/\s+/)
      .filter(word => /[\p{L}\p{N}]/u.test(word)).length,
    // The root is the document, not a node in it.
    nodes: nodes - 1,
    blocks: root.children?.length ?? 0,
  };
}

/* ------------------------------------------------------------------ *
 * Playground
 * ------------------------------------------------------------------ */

type OutputTab = 'markdown' | 'html' | 'json' | 'tree' | 'view';

const OUTPUT_TABS: ReadonlyArray<{value: OutputTab; label: string}> = [
  {value: 'markdown', label: 'Markdown'},
  {value: 'html', label: 'HTML'},
  {value: 'json', label: 'Editor state'},
  {value: 'tree', label: 'Node tree'},
  {value: 'view', label: 'RichTextView'},
];

const SHORTCUTS: ReadonlyArray<{keys: string; action: string}> = [
  {keys: 'mod+b', action: 'Bold'},
  {keys: 'mod+i', action: 'Italic'},
  {keys: 'mod+u', action: 'Underline'},
  {keys: 'mod+k', action: 'Insert or edit a link'},
  {keys: 'mod+z', action: 'Undo'},
  {keys: 'mod+shift+z', action: 'Redo'},
  {keys: 'mod+enter', action: 'Check the task item holding the caret'},
  {keys: 'tab', action: 'Indent (Escape, then Tab, leaves the editor)'},
];

export function RichTextEditorPlayground() {
  // One editor. Everything on this page reads or drives that instance.
  const editorRef = useRef<RichTextEditorRef>(null);

  // Features
  const [hasToolbar, setHasToolbar] = useState(true);
  const [hasInsertControls, setHasInsertControls] = useState(true);
  const [hasLink, setHasLink] = useState(true);
  const [linkOpensInNewTab, setLinkOpensInNewTab] = useState(true);
  const [hasAutoLink, setHasAutoLink] = useState(true);
  const [hasMarkdownShortcuts, setHasMarkdownShortcuts] = useState(true);
  const [hasMarkdownPlugins, setHasMarkdownPlugins] = useState(true);
  const [isRestricted, setIsRestricted] = useState(false);

  // Field
  const [size, setSize] = useState<RichTextEditorSize>('md');
  const [toolbarSize, setToolbarSize] = useState<'sm' | 'md' | 'lg'>('sm');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isRequired, setIsRequired] = useState(false);
  const [isOptional, setIsOptional] = useState(false);
  const [hasAutoFocus, setHasAutoFocus] = useState(false);
  const [isLabelHidden, setIsLabelHidden] = useState(false);
  const [hasDescription, setHasDescription] = useState(true);
  const [hasCharacterLimit, setHasCharacterLimit] = useState(false);
  const [statusType, setStatusType] = useState<RichTextEditorStatusType | ''>(
    '',
  );
  const [statusVariant, setStatusVariant] = useState<
    'attached' | 'detached' | 'tooltip'
  >('attached');

  // Content
  const [documentKey, setDocumentKey] = useState<DocumentKey>('kitchen-sink');
  const [draft, setDraft] = useState<string>(DOCUMENTS['kitchen-sink'].source);
  const [tab, setTab] = useState<OutputTab>('markdown');
  const outputID = useId();

  const extensions = hasMarkdownPlugins ? DEMO_PLUGINS.extensions : undefined;
  const transformers = isRestricted ? RESTRICTED_TRANSFORMERS : undefined;

  const serializerOptions = useMemo(
    () => ({
      ...(extensions ? {extensions} : {}),
      ...(transformers ? {transformers} : {}),
    }),
    [extensions, transformers],
  );

  // `defaultValue` is read once per mount, so loading a document — or changing
  // an option the editor only reads at construction — remounts the editor with
  // a fresh seed. Everything else below is a live prop change on the editor
  // that is already mounted.
  const [seed, setSeed] = useState<string>(() =>
    markdownToEditorStateJSON(DOCUMENTS['kitchen-sink'].source, {
      extensions: DEMO_PLUGINS.extensions,
    }),
  );
  const [mountKey, setMountKey] = useState(0);
  const [stateJSON, setStateJSON] = useState<string>(seed);

  const reseed = useCallback((markdown: string, options: object) => {
    const value = markdownToEditorStateJSON(markdown, options);
    setSeed(value);
    setStateJSON(value);
    setMountKey(key => key + 1);
  }, []);

  /**
   * Rebuild the editor around an option it only reads at construction
   * (`hasAutoFocus`), keeping the content exactly as it stands: the current
   * state becomes the new seed, so nothing round-trips through Markdown.
   */
  const remount = useCallback(() => {
    setSeed(stateJSON);
    setMountKey(key => key + 1);
  }, [stateJSON]);

  const loadDocument = useCallback(
    (key: DocumentKey) => {
      setDocumentKey(key);
      setDraft(DOCUMENTS[key].source);
      reseed(DOCUMENTS[key].source, serializerOptions);
    },
    [reseed, serializerOptions],
  );

  // Toggling the Markdown plugins changes what the SOURCE means, so the
  // current content is exported and read back under the new plugin set: with
  // them, `@{ada}` is one atomic node; without them, it is the text you see.
  const toggleMarkdownPlugins = useCallback(
    (next: boolean) => {
      const markdown =
        editorRef.current?.getMarkdown() ??
        editorStateJSONToMarkdown(stateJSON, serializerOptions);
      setHasMarkdownPlugins(next);
      reseed(markdown, {
        ...(next ? {extensions: DEMO_PLUGINS.extensions} : {}),
        ...(transformers ? {transformers} : {}),
      });
    },
    [reseed, serializerOptions, stateJSON, transformers],
  );

  const handleChange = useCallback((editorState: EditorState) => {
    setStateJSON(JSON.stringify(editorState.toJSON()));
  }, []);

  const markdown = useMemo(() => {
    if (tab !== 'markdown') {
      return '';
    }
    try {
      return editorStateJSONToMarkdown(stateJSON, serializerOptions);
    } catch (error) {
      return `(export failed: ${String(error)})`;
    }
  }, [serializerOptions, stateJSON, tab]);

  // HTML comes from the mounted editor ($generateHtmlFromNodes needs a DOM),
  // so it is read after the state that produced it has rendered.
  const [html, setHtml] = useState('');
  useEffect(() => {
    if (tab !== 'html') {
      return;
    }
    setHtml(editorRef.current?.getHTML() ?? '');
  }, [stateJSON, tab, mountKey]);

  const tree = useMemo(
    () => (tab === 'tree' ? toNodeTree(stateJSON) : ''),
    [stateJSON, tab],
  );
  const stats = useMemo(() => toStats(stateJSON), [stateJSON]);

  const status =
    statusType === ''
      ? undefined
      : {
          type: statusType,
          message:
            statusType === 'error'
              ? 'This field is required.'
              : statusType === 'warning'
                ? 'Review this content before saving.'
                : 'Saved.',
        };

  return (
    <div data-playground="" {...stylex.props(styles.playground)}>
      <Banner
        status="info"
        title="RichTextEditor playground"
        description="One editor, every feature. Switch features on the right and watch them meet on the same document; the panel below reads that editor's Markdown, HTML, state, node tree, and read-only render."
      />

      <div {...stylex.props(styles.columns)}>
        {/* ---------------------------------------------------------- */}
        {/* The one editor                                              */}
        {/* ---------------------------------------------------------- */}
        <VStack gap={3}>
          <div data-playground-editor="">
            <RichTextEditor
              key={mountKey}
              ref={editorRef}
              label="Playground"
              isLabelHidden={isLabelHidden}
              description={
                hasDescription
                  ? 'Bold, italic, lists, task lists, quotes, links, code blocks and tables.'
                  : undefined
              }
              placeholder="Write something, or load a document below…"
              defaultValue={seed}
              onChange={handleChange}
              size={size}
              minHeight="12rem"
              isReadOnly={isReadOnly}
              isDisabled={isDisabled}
              isRequired={isRequired}
              isOptional={isOptional}
              hasAutoFocus={hasAutoFocus}
              status={status}
              statusVariant={statusVariant}
              maxLength={hasCharacterLimit ? 500 : undefined}
              hasMarkdownShortcuts={hasMarkdownShortcuts}
              {...(transformers ? {transformers} : {})}
              {...(extensions ? {markdownExtensions: extensions} : {})}
              toolbar={
                hasToolbar ? (
                  <RichTextEditorToolbar
                    size={toolbarSize}
                    hasLink={hasLink}
                    linkOpensInNewTab={linkOpensInNewTab}
                    endContent={hasInsertControls ? <InsertControls /> : null}
                  />
                ) : undefined
              }
              plugins={hasAutoLink ? <RichTextEditorAutoLinkPlugin /> : null}
            />
          </div>

          <div data-playground-stats="" {...stylex.props(styles.stats)}>
            <Text type="supporting">{stats.characters} characters</Text>
            <Text type="supporting">{stats.words} words</Text>
            <Text type="supporting">{stats.blocks} top-level blocks</Text>
            <Text type="supporting">{stats.nodes} nodes</Text>
          </div>

          <div {...stylex.props(styles.actions)}>
            <Button
              size="sm"
              label="Focus"
              onClick={() => editorRef.current?.focus()}
            />
            <Button
              size="sm"
              label="Clear"
              onClick={() => editorRef.current?.clear()}
            />
            <Button
              size="sm"
              label="Reload document"
              onClick={() => reseed(draft, serializerOptions)}
            />
            <Button
              size="sm"
              label="Markdown → import box"
              tooltip="Export what the editor holds now into the import box, to re-import it"
              onClick={() =>
                setDraft(
                  editorRef.current?.getMarkdown() ??
                    editorStateJSONToMarkdown(stateJSON, serializerOptions),
                )
              }
            />
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Output panel                                                */}
          {/* ---------------------------------------------------------- */}
          <div {...stylex.props(styles.panel)}>
            <TabList
              value={tab}
              onChange={value => setTab(value as OutputTab)}
              role="tablist"
              size="sm"
              hasDivider>
              {OUTPUT_TABS.map(({value, label}) => (
                <Tab
                  key={value}
                  value={value}
                  label={label}
                  panelId={`${outputID}-${value}`}
                />
              ))}
            </TabList>
            <div
              id={`${outputID}-${tab}`}
              role="tabpanel"
              tabIndex={0}
              aria-label={`${OUTPUT_TABS.find(t => t.value === tab)?.label} output`}
              data-playground-output={tab}
              {...stylex.props(styles.panelScroller)}>
              {tab === 'view' ? (
                <div {...stylex.props(styles.viewSurface)}>
                  <RichTextView
                    value={stateJSON}
                    {...(extensions ? {markdownExtensions: extensions} : {})}
                  />
                </div>
              ) : (
                <pre {...stylex.props(styles.output)}>
                  {tab === 'markdown'
                    ? markdown
                    : tab === 'html'
                      ? html
                      : tab === 'tree'
                        ? tree
                        : stateJSON}
                </pre>
              )}
            </div>
          </div>
        </VStack>

        {/* ---------------------------------------------------------- */}
        {/* Settings                                                    */}
        {/* ---------------------------------------------------------- */}
        <div data-playground-settings="" {...stylex.props(styles.panel)}>
          <Heading level={3}>Plugins</Heading>
          <div {...stylex.props(styles.group)}>
            <Switch
              size="sm"
              label="Toolbar"
              description="RichTextEditorToolbar in the editor's toolbar slot"
              value={hasToolbar}
              onChange={setHasToolbar}
            />
            <Switch
              size="sm"
              label="Insert controls"
              description="Table, rule and mention, in the toolbar's endContent slot"
              value={hasInsertControls}
              onChange={setHasInsertControls}
              isDisabled={!hasToolbar}
              disabledMessage="Turn the toolbar on to reach its endContent slot."
            />
            <Switch
              size="sm"
              label="Link button"
              value={hasLink}
              onChange={setHasLink}
              isDisabled={!hasToolbar}
              disabledMessage="The link button lives in the toolbar."
            />
            <Switch
              size="sm"
              label="Links open in a new tab"
              value={linkOpensInNewTab}
              onChange={setLinkOpensInNewTab}
              isDisabled={!hasToolbar || !hasLink}
              disabledMessage="Turn the toolbar's link button on first."
            />
            <Switch
              size="sm"
              label="Autolink"
              description="RichTextEditorAutoLinkPlugin: typed and pasted URLs"
              value={hasAutoLink}
              onChange={setHasAutoLink}
            />
            <Switch
              size="sm"
              label="Markdown shortcuts"
              description="Typing '# ', '- ', '- [ ] ', '> ', '```' and '|'"
              value={hasMarkdownShortcuts}
              onChange={setHasMarkdownShortcuts}
            />
            <Switch
              size="sm"
              label="Markdown plugins"
              description="The demo mention and callout plugins, adopted with createRichTextExtension"
              value={hasMarkdownPlugins}
              onChange={toggleMarkdownPlugins}
            />
            <Switch
              size="sm"
              label="Restricted transformers"
              description="Only bold, italic, inline code and bullets — in shortcuts AND in the Markdown export"
              value={isRestricted}
              onChange={setIsRestricted}
            />
            {DEMO_PLUGINS.refused.length > 0 && (
              <Text type="supporting">
                Refused by createRichTextExtension:{' '}
                {DEMO_PLUGINS.refused.map(entry => entry.plugin).join(', ')} —
                RichText never runs a plugin's transform, so a transform plugin
                stays on the read-only Markdown surface.
              </Text>
            )}
          </div>

          <Divider />
          <Heading level={3}>Field</Heading>
          <div {...stylex.props(styles.group)}>
            <Selector
              size="sm"
              label="Editor size"
              value={size}
              onChange={value => setSize(value as RichTextEditorSize)}
              options={[
                {value: 'sm', label: 'sm'},
                {value: 'md', label: 'md'},
                {value: 'lg', label: 'lg'},
              ]}
            />
            <Selector
              size="sm"
              label="Toolbar size"
              value={toolbarSize}
              onChange={value => setToolbarSize(value as 'sm' | 'md' | 'lg')}
              isDisabled={!hasToolbar}
              options={[
                {value: 'sm', label: 'sm'},
                {value: 'md', label: 'md'},
                {value: 'lg', label: 'lg'},
              ]}
            />
            <Selector
              size="sm"
              label="Status"
              value={statusType === '' ? 'none' : statusType}
              onChange={value =>
                setStatusType(
                  value === 'none' ? '' : (value as RichTextEditorStatusType),
                )
              }
              options={[
                {value: 'none', label: 'None'},
                {value: 'error', label: 'Error'},
                {value: 'warning', label: 'Warning'},
                {value: 'success', label: 'Success'},
              ]}
            />
            <Selector
              size="sm"
              label="Status placement"
              value={statusVariant}
              onChange={value =>
                setStatusVariant(value as 'attached' | 'detached' | 'tooltip')
              }
              isDisabled={statusType === ''}
              options={[
                {value: 'attached', label: 'attached'},
                {value: 'detached', label: 'detached'},
                {value: 'tooltip', label: 'tooltip'},
              ]}
            />
            <Switch
              size="sm"
              label="Read-only"
              description="Not editable, full opacity, still focusable"
              value={isReadOnly}
              onChange={setIsReadOnly}
            />
            <Switch
              size="sm"
              label="Disabled"
              description="Wins over read-only"
              value={isDisabled}
              onChange={setIsDisabled}
            />
            <Switch
              size="sm"
              label="Required"
              value={isRequired}
              onChange={next => {
                setIsRequired(next);
                if (next) {
                  setIsOptional(false);
                }
              }}
            />
            <Switch
              size="sm"
              label="Optional"
              description="Mutually exclusive with required"
              value={isOptional}
              onChange={next => {
                setIsOptional(next);
                if (next) {
                  setIsRequired(false);
                }
              }}
            />
            <Switch
              size="sm"
              label="Autofocus"
              description="Read at construction, so the editor is rebuilt around the content it holds"
              value={hasAutoFocus}
              onChange={next => {
                setHasAutoFocus(next);
                remount();
              }}
            />
            <Switch
              size="sm"
              label="Hide label"
              value={isLabelHidden}
              onChange={setIsLabelHidden}
            />
            <Switch
              size="sm"
              label="Description"
              value={hasDescription}
              onChange={setHasDescription}
            />
            <Switch
              size="sm"
              label="Character limit (500)"
              value={hasCharacterLimit}
              onChange={setHasCharacterLimit}
            />
          </div>

          <Divider />
          <Heading level={3}>Document</Heading>
          <div {...stylex.props(styles.group)}>
            <Selector
              size="sm"
              label="Load a document"
              value={documentKey}
              onChange={value => loadDocument(value as DocumentKey)}
              options={Object.entries(DOCUMENTS).map(([value, entry]) => ({
                value,
                label: entry.label,
              }))}
            />
            <TextArea
              size="sm"
              label="Markdown in"
              description="markdownToEditorStateJSON(…) seeds the editor"
              rows={8}
              value={draft}
              onChange={setDraft}
            />
            <HStack gap={2}>
              <Button
                size="sm"
                variant="primary"
                label="Load into the editor"
                onClick={() => reseed(draft, serializerOptions)}
              />
            </HStack>
          </div>

          <Divider />
          <Heading level={3}>Shortcuts</Heading>
          <div {...stylex.props(styles.group)}>
            {SHORTCUTS.map(shortcut => (
              <div key={shortcut.keys} {...stylex.props(styles.shortcutRow)}>
                <Text type="supporting">{shortcut.action}</Text>
                <Kbd keys={shortcut.keys} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
