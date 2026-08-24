// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file RichTextView.tsx
 * @input Uses React (including a class error boundary), Lexical (lexical +
 *   @lexical/react), mergeProps and warnOnce from core utils, design tokens
 * @output Exports RichTextView component and RichTextViewProps
 * @position Read-only renderer for serialized Lexical editor state; experimental
 *   (richtext), exported from @astryxdesign/richtext
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/richtext/src/RichTextView.test.tsx
 * - /packages/richtext/src/index.ts
 * - /apps/storybook/stories/RichTextEditor.stories.tsx
 */

import {
  Component,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {sharedEditorTheme} from './editorTheme';
import type {BaseProps} from '@astryxdesign/core';
import {mergeProps, warnOnce} from '@astryxdesign/core/utils';

import {
  LexicalComposer,
  type InitialConfigType,
} from '@lexical/react/LexicalComposer';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {ListNode, ListItemNode} from '@lexical/list';
import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import {LinkNode, AutoLinkNode} from '@lexical/link';
import {CodeNode, CodeHighlightNode} from '@lexical/code';
import type {Klass, LexicalNode, EditorThemeClasses} from 'lexical';

const styles = stylex.create({
  root: {
    width: '100%',
  },
});

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

export interface RichTextViewProps extends BaseProps {
  /**
   * Serialized editor state to render (a JSON string produced by
   * `JSON.stringify(editorState.toJSON())`).
   */
  value: string;
  /**
   * Accessible name for the read-only text surface. The view renders a
   * `role="textbox"` element, and a textbox without a name fails
   * axe's `aria-input-field-name`; pass a label describing the content
   * (e.g. "Meeting notes"). A blank or whitespace-only string is treated
   * exactly like omitting the prop — it names nothing, so no `aria-label`
   * is emitted and the dev warning still fires.
   */
  label?: string;
  /**
   * Additional Lexical nodes to register beyond the default OSS set. Must match
   * the nodes used to author `value` so custom node types deserialize.
   */
  nodes?: ReadonlyArray<Klass<LexicalNode>>;
  /**
   * Additional read-only plugins to render inside the composer (e.g. hover
   * cards, decorators).
   */
  plugins?: ReactNode;
  /** The Lexical composer namespace. @default 'astryx-view' */
  namespace?: string;
  /**
   * Called when `value` cannot be parsed/rendered — malformed JSON, valid
   * JSON that is not a usable editor state (`'{}'`, `'null'`), or state
   * authored with node types not registered via `nodes`. A read-only
   * view renders *persisted* content — exactly where stale or foreign-schema
   * state shows up — so by default a parse failure renders `errorFallback`
   * instead of throwing and taking down the host. Provide `onParseError` to log or
   * report it.
   */
  onParseError?: (error: Error) => void;
  /**
   * What to render when `value` fails to parse/render. Defaults to `null`
   * (renders nothing). Pass a node to show a placeholder/empty state.
   * @default null
   */
  errorFallback?: ReactNode;
  /** Ref to the view's root element. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * Keeps the rendered content in sync with the `value` prop after mount.
 *
 * `LexicalComposer`'s `initialConfig.editorState` is only read once on mount, so
 * a plain `<RichTextView value={changingValue} />` would freeze at its first
 * value — the content would never update when `value` changed. This plugin runs
 * inside the composer context and re-applies `value` whenever it changes, so the
 * read-only view stays reactive (e.g. previewing content edited elsewhere).
 *
 * The initial `value` is already applied via `initialConfig.editorState`, so we
 * skip the first run to avoid a redundant re-parse on mount.
 *
 * This mirrors the canonical Lexical pattern for applying externally-sourced
 * serialized state after mount: the Lexical Playground's ActionsPlugin does the
 * same `editor.setEditorState(editor.parseEditorState(...))` from inside a
 * plugin (see facebook/lexical
 * packages/lexical-playground/src/plugins/ActionsPlugin/index.tsx). It is
 * necessary because `LexicalComposer` builds the editor in a `useMemo(..., [])`
 * and reads `initialConfig.editorState` exactly once on init
 * (packages/lexical-react/src/LexicalComposer.tsx), so a changed prop cannot
 * re-seed the editor on its own. A read-only view has no history, so we skip the
 * Playground's accompanying CLEAR_HISTORY_COMMAND.
 *
 * `parseEditorState` / `setEditorState` are methods on the editor instance, so
 * this avoids a top-level `lexical` *value* import (which would force the
 * sandbox's Next build to transpile lexical's raw `src/*.ts` and fail — see the
 * matching note in RichTextEditor.tsx).
 */
function SyncValuePlugin({value}: {value: string}): null {
  const [editor] = useLexicalComposerContext();
  const isFirstRunRef = useRef(true);
  useEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      return;
    }
    editor.setEditorState(editor.parseEditorState(value));
  }, [editor, value]);
  return null;
}

/**
 * A read-only renderer for serialized Lexical content. Renders the same styled
 * output as {@link RichTextEditor} without any editing affordances.
 *
 * @example
 * ```
 * import {RichTextView} from '@astryxdesign/richtext';
 * <RichTextView value={storedEditorStateJSON} />
 * ```
 */
/**
 * Catches a render-phase throw out of {@link LexicalComposer}. Lexical builds
 * and seeds the editor inside a `useMemo` during render, so a `value` that is
 * valid JSON but not a usable editor state — `'{}'`, `'null'`, an unregistered
 * node type directly under `root` — makes Lexical's own `setEditorState`
 * invariant throw from there, past every plugin-level boundary. `onParseError`
 * has already fired by then (Lexical routes the failure through `onError`
 * first), so this boundary only has to swap in the fallback instead of letting
 * the throw take down the host.
 */
class ViewErrorBoundary extends Component<
  {resetKey: string; fallback: ReactNode; children: ReactNode},
  {hasError: boolean; resetKey: string}
> {
  constructor(props: {
    resetKey: string;
    fallback: ReactNode;
    children: ReactNode;
  }) {
    super(props);
    this.state = {hasError: false, resetKey: props.resetKey};
  }

  static getDerivedStateFromError(): {hasError: boolean} {
    return {hasError: true};
  }

  static getDerivedStateFromProps(
    props: {resetKey: string},
    state: {resetKey: string},
  ): {hasError: boolean; resetKey: string} | null {
    // A new `value` earns a fresh attempt, matching the recovery the
    // JSON-parse guard already gives malformed input.
    return props.resetKey === state.resetKey
      ? null
      : {hasError: false, resetKey: props.resetKey};
  }

  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export function RichTextView({
  value,
  label,
  nodes,
  plugins,
  namespace = 'astryx-view',
  onParseError,
  errorFallback = null,
  xstyle,
  className,
  style,
  ...rest
}: RichTextViewProps) {
  // A blank label names nothing: `aria-label=""` resolves to the same empty
  // accessible name as no attribute at all, and role=textbox takes no name
  // from its content. Treat blank exactly like absent — warn, and emit no
  // attribute — so the guard cannot be silenced by an empty string.
  const trimmedLabel = label?.trim();
  if (!trimmedLabel) {
    warnOnce(
      'richtext:view-needs-label',
      'RichTextView',
      'RichTextView renders a keyboard-reachable textbox; pass a non-blank `label` so it has an accessible name (axe aria-input-field-name).',
    );
  }

  const themeRef = useRef<EditorThemeClasses | null>(null);
  if (themeRef.current === null) {
    themeRef.current = sharedEditorTheme();
  }

  const [hasError, setHasError] = useState(false);

  // Reset the error state when the value changes so a corrected value recovers.
  const lastValueRef = useRef(value);
  if (lastValueRef.current !== value && hasError) {
    lastValueRef.current = value;
    setHasError(false);
  } else {
    lastValueRef.current = value;
  }

  const handleError = (error: Error) => {
    onParseError?.(error);
    setHasError(true);
  };

  // Validate `value` parses as JSON before handing it to Lexical. Malformed
  // JSON would otherwise throw synchronously during LexicalComposer init and
  // escape any error boundary, taking down the host on the render path.
  if (!hasError) {
    try {
      JSON.parse(value);
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  if (hasError) {
    return (
      <div
        {...mergeProps(stylex.props(styles.root, xstyle), className, style)}
        {...rest}>
        {errorFallback}
      </div>
    );
  }

  const initialConfig: InitialConfigType = {
    namespace,
    theme: themeRef.current,
    editable: false,
    editorState: value,
    nodes: nodes ? [...DEFAULT_NODES, ...nodes] : [...DEFAULT_NODES],
    // A read-only view renders persisted content; a bad node/schema should not
    // crash the host. Surface it via onParseError + fallback instead of re-throwing.
    onError: handleError,
  };

  return (
    <div
      {...mergeProps(stylex.props(styles.root, xstyle), className, style)}
      {...rest}>
      <ViewErrorBoundary resetKey={value} fallback={errorFallback}>
        <LexicalComposer initialConfig={initialConfig}>
          <SyncValuePlugin value={value} />
          <RichTextPlugin
            contentEditable={
              // A read-only textbox still needs a name and must stay in the
              // tab order so keyboard and screen-reader users can reach and
              // read it.
              <ContentEditable
                ariaLabel={trimmedLabel ? label : undefined}
                ariaMultiline
                tabIndex={0}
              />
            }
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />
          {plugins}
        </LexicalComposer>
      </ViewErrorBoundary>
    </div>
  );
}

RichTextView.displayName = 'RichTextView';
