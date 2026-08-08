// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file RichTextEditor.tsx
 * @input Uses React, useId, Lexical (lexical + @lexical/react), Field,
 *   VisuallyHidden, design tokens
 * @output Exports RichTextEditor component, RichTextEditorProps, RichTextEditorStatus,
 *   RichTextEditorStatusType, RichTextEditorSize
 * @position Experimental (lab) implementation; consumed by RichTextEditor/index.ts and
 *   re-exported from @astryxdesign/lab. Tested by RichTextEditor.test.tsx.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/RichTextEditor/RichTextEditor.doc.mjs (props table, features, implementation notes)
 * - /packages/lab/src/RichTextEditor/RichTextEditor.test.tsx (tests for new/changed behavior)
 * - /packages/lab/src/RichTextEditor/index.ts (exports if types change)
 * - /packages/lab/src/index.ts (barrel re-export)
 * - /apps/storybook/stories/RichTextEditor.stories.tsx (storybook stories)
 *
 * NOTE: This is an EXPERIMENTAL component in @astryxdesign/lab (published only under
 * the `@canary` dist-tag, never as stable `latest`). It is the initial landing for the
 * OSS Lexical editor RFC; the goal is graduation to @astryxdesign/core after the
 * Component Specification Protocol. `lexical` and `@lexical/*` are OPTIONAL peer
 * dependencies — install them to use this component.
 */

import {
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  forwardRef,
  type ReactNode,
  type Ref,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {sharedEditorTheme} from './editorTheme';
import {
  Field,
  inputWrapperStyles,
  inputStatusBorderStyles,
  inputStatusHoverShadowStyles,
  inputStatusFocusWithinStyles,
} from '@astryxdesign/core/Field';
import type {BaseProps} from '@astryxdesign/core';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';
import type {SizeValue} from '@astryxdesign/core/utils';
import {useSize} from '@astryxdesign/core/SizeContext';
import {themeProps} from '@astryxdesign/core/utils';

import {
  LexicalComposer,
  type InitialConfigType,
} from '@lexical/react/LexicalComposer';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {LinkPlugin} from '@lexical/react/LexicalLinkPlugin';
import {TabIndentationPlugin} from '@lexical/react/LexicalTabIndentationPlugin';
import {MarkdownShortcutPlugin} from '@lexical/react/LexicalMarkdownShortcutPlugin';
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';
import {
  TRANSFORMERS,
  $convertToMarkdownString,
  type Transformer,
} from '@lexical/markdown';
export type {Transformer} from '@lexical/markdown';
import {$generateHtmlFromNodes} from '@lexical/html';
import {DEFAULT_NODES} from './editorNodes';
import {
  BLUR_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_DOWN_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  mergeRegister,
  type EditorState,
  type Klass,
  type LexicalEditor,
  type LexicalNode,
  type EditorThemeClasses,
} from 'lexical';

/**
 * Serialized state for an empty editor: a root containing a single empty
 * paragraph. Used by the imperative `clear()` handle.
 *
 * We deliberately reset the editor via `editor.setEditorState(...)` rather than
 * an `editor.update(() => { $getRoot()... })` callback, because `$getRoot` /
 * `$createParagraphNode` are *runtime value* imports from the top-level
 * `lexical` package. In the sandbox's Next build a top-level `lexical` value
 * import forces Babel to transpile lexical's raw `src/*.ts` (which uses
 * `declare` class fields) and fails the build. `parseEditorState` /
 * `setEditorState` are methods on the editor instance, so no top-level
 * `lexical` value import is needed. Setting a fresh state still notifies update
 * listeners, so `onChange` fires.
 */
const EMPTY_EDITOR_STATE_JSON = JSON.stringify({
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
});

const styles = stylex.create({
  wrapper: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingBlock: spacingVars['--spacing-1'],
    minHeight: 'auto',
  },
  contentEditable: {
    display: 'block',
    width: '100%',
    minHeight: '4.5rem',
    borderWidth: 0,
    borderStyle: 'none',
    padding: 0,
    outline: 'none',
    fontFamily: typographyVars['--font-family-body'],
    fontSize: {
      default: typeScaleVars['--text-body-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--text-body-size']})`,
    },
    lineHeight: typeScaleVars['--text-body-leading'],
    color: colorVars['--color-text-primary'],
  },
  placeholder: {
    position: 'absolute',
    top: spacingVars['--spacing-1'],
    insetInlineStart: 0,
    pointerEvents: 'none',
    userSelect: 'none',
    color: colorVars['--color-text-secondary'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
  editorRoot: {
    position: 'relative',
    width: '100%',
  },
  disabled: {
    cursor: 'not-allowed',
  },
  counter: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: spacingVars['--spacing-1'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    color: colorVars['--color-text-secondary'],
  },
  counterError: {
    color: colorVars['--color-error'],
  },
});

const sizeStyles = stylex.create({
  sm: {},
  md: {},
  lg: {
    paddingBlock: spacingVars['--spacing-2'],
  },
});

/**
 * Default screen-reader hint advertising the Tab escape. Overridable (or
 * suppressible) via the `tabEscapeHint` prop for localization.
 */
const DEFAULT_TAB_ESCAPE_HINT =
  'Press Escape then Tab to move focus out of the editor.';

/**
 * Fraction of `maxLength` at which the character counter begins announcing
 * remaining/over-limit characters to screen readers. Matches TextArea.
 */
const COUNTER_WARNING_THRESHOLD = 0.8;

export type RichTextEditorStatusType = 'warning' | 'error' | 'success';

export type RichTextEditorSize = 'sm' | 'md' | 'lg';

export interface RichTextEditorStatus {
  /** The type of status to display. */
  type: RichTextEditorStatusType;
  /** Optional message to display below the editor. */
  message?: string;
}

/**
 * Imperative handle exposed via `ref`. Lets callers focus, clear, and read the
 * editor without wiring a custom plugin. Available after mount.
 */
export interface RichTextEditorRef {
  /**
   * Move focus into the editor's editable surface. No-op when the editor is
   * read-only or disabled.
   */
  focus: () => void;
  /**
   * Remove all content, resetting the editor to a single empty paragraph.
   * No-op when the editor is read-only or disabled.
   */
  clear: () => void;
  /** Read the current `EditorState`. Serialize with `.toJSON()` to persist. */
  getEditorState: () => EditorState;
  /**
   * Serialize the current content to a Markdown string, using the same
   * `transformers` the editor is configured with (so custom transformers
   * layered in via the `transformers` prop are honored). Equivalent to
   * `$convertToMarkdownString` run in a read context.
   */
  getMarkdown: () => string;
  /**
   * Serialize the current content to an HTML string via
   * `$generateHtmlFromNodes`. Requires a DOM (available in the browser and in
   * jsdom-based tests). Useful for copy/paste, email, or non-Lexical consumers.
   */
  getHTML: () => string;
  /**
   * Access the underlying `LexicalEditor` instance for advanced use cases
   * (custom commands, listeners, node transforms).
   */
  getEditor: () => LexicalEditor;
}

export interface RichTextEditorProps extends Omit<
  BaseProps,
  'onChange' | 'defaultValue'
> {
  /** Label text for the editor (always rendered for accessibility). */
  label: string;
  /**
   * Whether to visually hide the label (still accessible to screen readers).
   * @default false
   */
  isLabelHidden?: boolean;
  /** Description text displayed between the label and editor. */
  description?: string;
  /**
   * Whether the field is optional. Mutually exclusive with isRequired.
   * @default false
   */
  isOptional?: boolean;
  /**
   * Whether the field is required. Mutually exclusive with isOptional.
   * @default false
   */
  isRequired?: boolean;
  /**
   * Initial serialized editor state (a JSON string produced by
   * `JSON.stringify(editorState.toJSON())`), used to seed the editor on mount.
   * The editor is uncontrolled: this is read once.
   */
  defaultValue?: string;
  /**
   * Callback fired when the editor content changes. Receives the current
   * `EditorState` and the `LexicalEditor` instance. Serialize with
   * `editorState.toJSON()` for persistence.
   */
  onChange?: (editorState: EditorState, editor: LexicalEditor) => void;
  /** Placeholder text shown when the editor is empty. */
  placeholder?: string;
  /**
   * Whether the editor is read-only (non-editable).
   * @default false
   */
  isReadOnly?: boolean;
  /**
   * Whether the editor is disabled (non-editable, dimmed).
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Status indicator. When set, displays a colored border. If message is
   * provided, displays a message box below the editor.
   */
  status?: RichTextEditorStatus;
  /**
   * Width of the field. Numbers are treated as pixels, strings are used as-is
   * (e.g. `'100%'`).
   */
  width?: SizeValue;
  /** Tooltip text to display in an info icon at the end of the label. */
  labelTooltip?: string;
  /**
   * The size of the editor, affecting internal padding.
   * @default 'md'
   */
  size?: RichTextEditorSize;
  /**
   * Additional Lexical nodes to register beyond the default OSS set
   * (Heading, Quote, List, Link, Code). Use this extension point to plug in
   * custom nodes (e.g. mentions, images) without forking the editor.
   */
  nodes?: ReadonlyArray<Klass<LexicalNode>>;
  /**
   * Additional Lexical plugins to render inside the composer. Use this to
   * compose extra behaviour (toolbars, mentions, autolink, etc.) on top of the
   * base editor. Plugins receive the editor via `useLexicalComposerContext()`.
   */
  plugins?: ReactNode;
  /**
   * Whether to enable Markdown shortcut typing (e.g. `# ` for a heading,
   * `- ` for a list). Uses the `transformers` prop (defaults to the standard
   * `@lexical/markdown` transformers).
   * @default true
   */
  hasMarkdownShortcuts?: boolean;
  /**
   * Markdown transformers — the single source of truth for markdown behaviour.
   * Defaults to the standard `@lexical/markdown` `TRANSFORMERS`.
   *
   * The same array drives all three markdown operations in Lexical (see the
   * lexical-playground reference, where one `PLAYGROUND_TRANSFORMERS` array
   * feeds each):
   *  - shortcut typing        — `registerMarkdownShortcuts` (wired here today)
   *  - markdown -> state       — `$convertFromMarkdownString` (future import API)
   *  - state -> markdown       — `$convertToMarkdownString` (future `getMarkdown`)
   *
   * Pass a custom array to support additional node types (e.g. custom
   * transformers layered in via the `nodes` extension point) consistently
   * across all three. Shortcut typing is only applied when
   * `hasMarkdownShortcuts` is true; the array is still the intended input for
   * the serialization APIs added in later phases.
   */
  transformers?: ReadonlyArray<Transformer>;
  /** Whether to automatically focus the editor on mount. @default false */
  hasAutoFocus?: boolean;
  /**
   * Screen-reader hint describing how to move focus out of the editor, since
   * Tab is bound to indentation (press Escape, then Tab). Rendered visually
   * hidden and referenced from the editor's `aria-describedby`. Override it
   * to localize the text, or pass an empty string to omit the hint entirely
   * (e.g. when the host app provides its own instructions).
   * @default 'Press Escape then Tab to move focus out of the editor.'
   */
  tabEscapeHint?: string;
  /**
   * Maximum number of characters. When set, a character counter
   * (current/max) is displayed below the editor. Like TextArea, this does
   * NOT enforce the limit natively — the counter shows error styling when the
   * plain-text length exceeds the limit. Count is the editor's plain-text
   * content length.
   */
  maxLength?: number;
  /**
   * The Lexical composer namespace, used for editor identity.
   * @default 'astryx-editor'
   */
  namespace?: string;
}

/**
 * A WYSIWYG rich-text editor built on Lexical, styled with Astryx design
 * tokens. Experimental — ships from `@astryxdesign/lab` (canary). `lexical` and
 * `@lexical/*` are optional peer dependencies — install them to use this
 * component.
 *
 * The editor is intentionally minimal and extensible: pass `nodes` and
 * `plugins` to layer richer behaviour (toolbars, mentions, hover cards) on top
 * without forking.
 *
 * The forwarded `RichTextEditorRef` exposes imperative `focus()` and `clear()`
 * methods for callers that manage the editor from outside.
 *
 * @example
 * ```
 * import {RichTextEditor, type RichTextEditorRef} from '@astryxdesign/lab';
 * const ref = useRef<RichTextEditorRef>(null);
 * <RichTextEditor
 *   ref={ref}
 *   label="Notes"
 *   placeholder="Write something..."
 *   onChange={state => save(JSON.stringify(state.toJSON()))}
 * />
 * ```
 */
export const RichTextEditor = forwardRef<
  RichTextEditorRef,
  RichTextEditorProps
>(function RichTextEditor(
  {
    label,
    isLabelHidden = false,
    description,
    isOptional = false,
    isRequired = false,
    defaultValue,
    onChange,
    placeholder,
    isReadOnly = false,
    isDisabled = false,
    status,
    width,
    labelTooltip,
    size: sizeProp,
    nodes,
    plugins,
    hasMarkdownShortcuts = true,
    transformers = TRANSFORMERS,
    hasAutoFocus = false,
    tabEscapeHint = DEFAULT_TAB_ESCAPE_HINT,
    maxLength,
    namespace = 'astryx-editor',
    xstyle,
    className,
    style,
    ...rest
  }: RichTextEditorProps,
  ref: Ref<RichTextEditorRef>,
) {
  const size = useSize(sizeProp, 'md');
  const id = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const placeholderID = useId();
  const counterID = useId();
  const tabEscapeHintID = useId();

  // Plain-text character count, tracked from inside the composer via
  // CharCountPlugin. Only used when maxLength is set.
  const [charCount, setCharCount] = useState(0);

  // Theme is stable per render; build once.
  const themeRef = useRef<EditorThemeClasses | null>(null);
  if (themeRef.current === null) {
    themeRef.current = sharedEditorTheme();
  }

  const editable = !isReadOnly && !isDisabled;

  // Stabilize the transformers array so MarkdownShortcutPlugin doesn't
  // re-register on every render. `[...transformers]` would allocate a new
  // array each time; memoize on the prop identity instead. (React Compiler
  // isn't running the transform in this repo, so this isn't auto-memoized.)
  const markdownTransformers = useMemo(() => [...transformers], [transformers]);

  const initialConfig: InitialConfigType = {
    namespace,
    theme: themeRef.current,
    editable,
    editorState: defaultValue ?? undefined,
    nodes: nodes ? [...DEFAULT_NODES, ...nodes] : [...DEFAULT_NODES],
    onError(error: Error) {
      // Surface errors to the host app rather than swallowing them.
      throw error;
    },
  };

  const hasTabEscapeHint = editable && tabEscapeHint !== '';

  const ariaDescribedBy =
    [
      description ? descriptionID : null,
      status?.message ? statusMessageID : null,
      placeholder ? placeholderID : null,
      maxLength != null ? counterID : null,
      hasTabEscapeHint ? tabEscapeHintID : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <Field
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={id}
      descriptionID={description ? descriptionID : undefined}
      isOptional={isOptional}
      isRequired={isRequired}
      isDisabled={isDisabled}
      status={
        status
          ? {
              type: status.type,
              message: status.message,
              messageID: status.message ? statusMessageID : undefined,
            }
          : undefined
      }
      labelTooltip={labelTooltip}
      width={width}>
      <div
        {...themeProps('rich-text-editor', {
          size,
          status: status?.type ?? null,
        })}
        {...stylex.props(
          inputWrapperStyles.base,
          styles.wrapper,
          sizeStyles[size],
          (isDisabled || isReadOnly) && inputWrapperStyles.disabled,
          isDisabled && styles.disabled,
          status && inputStatusBorderStyles[status.type],
          status && inputStatusHoverShadowStyles[status.type],
          status && inputStatusFocusWithinStyles[status.type],
          xstyle,
        )}
        className={className}
        style={style}>
        <LexicalComposer initialConfig={initialConfig}>
          <div {...stylex.props(styles.editorRoot)}>
            <RichTextPlugin
              contentEditable={
                <EditorContentEditable
                  ariaLabel={isLabelHidden ? label : undefined}
                  ariaLabelledBy={isLabelHidden ? undefined : id}
                  ariaDescribedBy={ariaDescribedBy}
                  ariaRequired={isRequired && !isOptional}
                  ariaInvalid={status?.type === 'error'}
                  placeholderText={placeholder}
                  placeholderID={placeholderID}
                  rest={rest}
                />
              }
              placeholder={null}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ListPlugin />
            <LinkPlugin />
            <TabIndentationPlugin />
            <TabFocusEscapePlugin />
            {hasMarkdownShortcuts && (
              <MarkdownShortcutPlugin transformers={markdownTransformers} />
            )}
            {hasAutoFocus && <AutoFocusOnMount />}
            {onChange && (
              <OnChangePlugin
                onChange={onChange}
                ignoreHistoryMergeTagChange
                ignoreSelectionChange
              />
            )}
            {plugins}
            <EditorRefBridge
              editorRef={ref}
              editable={editable}
              transformers={markdownTransformers}
            />
            {maxLength != null && (
              <CharCountPlugin onCountChange={setCharCount} />
            )}
          </div>
        </LexicalComposer>
        {hasTabEscapeHint && (
          <VisuallyHidden id={tabEscapeHintID}>{tabEscapeHint}</VisuallyHidden>
        )}
      </div>
      {maxLength != null && (
        <div
          id={counterID}
          {...stylex.props(
            styles.counter,
            charCount > maxLength && styles.counterError,
          )}>
          {charCount}/{maxLength}
          <VisuallyHidden aria-live="polite">
            {charCount >= maxLength * COUNTER_WARNING_THRESHOLD
              ? charCount > maxLength
                ? `${charCount - maxLength} characters over limit`
                : `${maxLength - charCount} characters remaining`
              : ''}
          </VisuallyHidden>
        </div>
      )}
    </Field>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

/**
 * Keys that must not cancel an armed Tab escape: Escape (arming again),
 * Tab (the escape itself) and bare modifier presses — the Shift keydown that
 * precedes Shift+Tab must not disarm, or Escape → Shift+Tab could never
 * escape backwards.
 */
const ESCAPE_REARM_EXEMPT_KEYS = new Set([
  'Escape',
  'Tab',
  'Shift',
  'Control',
  'Alt',
  'Meta',
]);

/**
 * WCAG 2.1.2 (No Keyboard Trap) escape for TabIndentationPlugin.
 *
 * TabIndentationPlugin rebinds Tab to indent/outdent, which would otherwise
 * trap keyboard focus inside the editor. This plugin restores an exit: after
 * Escape is pressed, the next Tab (or Shift+Tab) performs native focus
 * movement instead of indenting; pressing any other non-modifier key — or
 * leaving the editor — re-arms indentation.
 *
 * Mechanics: TabIndentationPlugin handles KEY_TAB_COMMAND at
 * COMMAND_PRIORITY_EDITOR (0), the lowest priority, and Lexical runs command
 * listeners from the highest priority down, stopping at the first one that
 * returns true. Registering at COMMAND_PRIORITY_LOW (1) therefore runs first;
 * when the escape is armed we return true WITHOUT calling
 * `event.preventDefault()`, so the indentation handler never sees the event
 * and the browser performs its default Tab focus navigation.
 */
function TabFocusEscapePlugin(): null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    let escapeArmed = false;
    return mergeRegister(
      editor.registerCommand<KeyboardEvent>(
        KEY_ESCAPE_COMMAND,
        () => {
          escapeArmed = true;
          // Consumed: this supersedes @lexical/rich-text's default Escape
          // handler (COMMAND_PRIORITY_EDITOR), which blurs the editor and
          // drops focus on the document body — disorienting, and it would
          // immediately disarm via BLUR_COMMAND below. Consumer plugins that
          // handle Escape (e.g. to close a popover) register at a higher
          // priority and still run first.
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_TAB_COMMAND,
        () => {
          if (!escapeArmed) {
            return false;
          }
          escapeArmed = false;
          // Consume the command (blocks indentation) but leave the event's
          // default alone so focus moves natively.
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_DOWN_COMMAND,
        event => {
          if (escapeArmed && !ESCAPE_REARM_EXEMPT_KEYS.has(event.key)) {
            escapeArmed = false;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        () => {
          escapeArmed = false;
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor]);
  return null;
}

/**
 * Focuses the editor on mount. Split into its own plugin so it runs inside the
 * composer context.
 */
function AutoFocusOnMount(): null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.focus();
  }, [editor]);
  return null;
}

/**
 * Wires the imperative `RichTextEditorRef` handle. Split into its own plugin so
 * it runs inside the composer context and can reach the `LexicalEditor` via
 * `useLexicalComposerContext()`. Renders nothing.
 *
 * `focus()` and `clear()` are gated on `editable` so a read-only or disabled
 * editor cannot be mutated or focused through the imperative handle — matching
 * the behaviour of the editable surface itself.
 */
function EditorRefBridge({
  editorRef,
  editable,
  transformers,
}: {
  editorRef: Ref<RichTextEditorRef>;
  editable: boolean;
  transformers: Array<Transformer>;
}): null {
  const [editor] = useLexicalComposerContext();
  useImperativeHandle(
    editorRef,
    () => ({
      focus: () => {
        if (!editable) {
          return;
        }
        editor.focus();
      },
      clear: () => {
        if (!editable) {
          return;
        }
        // Reset to a single empty paragraph via a fresh EditorState. Uses the
        // editor instance's own parse/set methods so we avoid a top-level
        // `lexical` value import (see EMPTY_EDITOR_STATE_JSON). This still
        // notifies update listeners, so `onChange` fires.
        editor.setEditorState(editor.parseEditorState(EMPTY_EDITOR_STATE_JSON));
      },
      getEditorState: () => editor.getEditorState(),
      getMarkdown: () =>
        // $convertToMarkdownString must run inside a read context. Honors the
        // same transformers the editor uses for shortcuts, so custom
        // transformers round-trip to Markdown. `@lexical/markdown` is a
        // subpackage (built dist) — safe, unlike a top-level `lexical` import.
        editor
          .getEditorState()
          .read(() => $convertToMarkdownString(transformers)),
      getHTML: () =>
        // $generateHtmlFromNodes serializes the whole document (null selection)
        // to HTML; must run in a read context and requires a DOM.
        // `@lexical/html` is a subpackage (built dist) — safe.
        editor.getEditorState().read(() => $generateHtmlFromNodes(editor, null)),
      getEditor: () => editor,
    }),
    [editor, editable, transformers],
  );
  return null;
}

/**
 * Tracks the editor's plain-text length and reports it to the host component.
 * Split into its own plugin so it runs inside the composer context and can
 * read the editor state via `useLexicalComposerContext()`. Renders nothing.
 */
function CharCountPlugin({
  onCountChange,
}: {
  onCountChange: (count: number) => void;
}): null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    // Report the initial count (e.g. seeded via defaultValue) from the mounted
    // root element's text, then track changes via registerTextContentListener,
    // which hands us the plain-text content directly.
    //
    // We deliberately avoid importing `$getRoot` from the top-level `lexical`
    // package: that is a *runtime value* import, and in the sandbox's Next
    // build it forces Babel to transpile lexical's raw `src/*.ts` (which uses
    // `declare` class fields) and fails. Both APIs used here are methods on the
    // editor instance, so no top-level `lexical` value import is needed.
    onCountChange(editor.getRootElement()?.textContent?.length ?? 0);
    return editor.registerTextContentListener((textContent) => {
      onCountChange(textContent.length);
    });
  }, [editor, onCountChange]);
  return null;
}

/**
 * Renders the Lexical ContentEditable. Split out so the placeholder
 * discriminated union (`placeholder` + `aria-placeholder` present together, or
 * neither) is satisfied by two concrete branches rather than a spread.
 */
function EditorContentEditable({
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  ariaRequired,
  ariaInvalid,
  placeholderText,
  placeholderID,
  rest,
}: {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  ariaRequired: boolean;
  ariaInvalid: boolean;
  placeholderText?: string;
  placeholderID: string;
  rest: Record<string, unknown>;
}) {
  const shared = {
    role: 'textbox' as const,
    'aria-multiline': 'true' as const,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-required': ariaRequired ? ('true' as const) : undefined,
    'aria-invalid': ariaInvalid ? ('true' as const) : undefined,
    ...stylex.props(styles.contentEditable),
    ...rest,
  };
  if (placeholderText) {
    return (
      <ContentEditable
        {...shared}
        aria-placeholder={placeholderText}
        placeholder={() => (
          <div
            id={placeholderID}
            aria-hidden="true"
            {...stylex.props(styles.placeholder)}>
            {placeholderText}
          </div>
        )}
      />
    );
  }
  return <ContentEditable {...shared} />;
}
