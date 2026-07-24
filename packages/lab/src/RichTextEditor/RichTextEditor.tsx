// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file RichTextEditor.tsx
 * @input Uses React, useId, Lexical (lexical + @lexical/react), Field, design tokens
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

import {useEffect, useId, useRef, type ReactNode} from 'react';
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
import {TRANSFORMERS} from '@lexical/markdown';
import {ListNode, ListItemNode} from '@lexical/list';
import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import {LinkNode, AutoLinkNode} from '@lexical/link';
import {CodeNode, CodeHighlightNode} from '@lexical/code';
import type {
  EditorState,
  Klass,
  LexicalEditor,
  LexicalNode,
  EditorThemeClasses,
} from 'lexical';

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
});

const sizeStyles = stylex.create({
  sm: {},
  md: {},
  lg: {
    paddingBlock: spacingVars['--spacing-2'],
  },
});

/** The default OSS node set registered with the editor. */
const DEFAULT_NODES: ReadonlyArray<Klass<LexicalNode>> = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  AutoLinkNode,
  CodeNode,
  CodeHighlightNode,
];

export type RichTextEditorStatusType = 'warning' | 'error' | 'success';

export type RichTextEditorSize = 'sm' | 'md' | 'lg';

export interface RichTextEditorStatus {
  /** The type of status to display. */
  type: RichTextEditorStatusType;
  /** Optional message to display below the editor. */
  message?: string;
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
   * `- ` for a list). Uses the default `@lexical/markdown` transformers.
   * @default true
   */
  hasMarkdownShortcuts?: boolean;
  /** Whether to automatically focus the editor on mount. @default false */
  hasAutoFocus?: boolean;
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
 * @example
 * ```
 * import {RichTextEditor} from '@astryxdesign/lab';
 *
 * <RichTextEditor
 *   label="Notes"
 *   placeholder="Write something…"
 *   onChange={state => save(JSON.stringify(state.toJSON()))}
 * />
 * ```
 */
export function RichTextEditor({
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
  hasAutoFocus = false,
  namespace = 'astryx-editor',
  xstyle,
  className,
  style,
  ...rest
}: RichTextEditorProps) {
  const size = useSize(sizeProp, 'md');
  const id = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const placeholderID = useId();

  // Theme is stable per render; build once.
  const themeRef = useRef<EditorThemeClasses | null>(null);
  if (themeRef.current === null) {
    themeRef.current = sharedEditorTheme();
  }

  const editable = !isReadOnly && !isDisabled;

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

  const ariaDescribedBy =
    [
      description ? descriptionID : null,
      status?.message ? statusMessageID : null,
      placeholder ? placeholderID : null,
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
            {hasMarkdownShortcuts && (
              <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
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
          </div>
        </LexicalComposer>
      </div>
    </Field>
  );
}

RichTextEditor.displayName = 'RichTextEditor';

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
