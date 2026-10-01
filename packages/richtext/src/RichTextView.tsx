// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file RichTextView.tsx
 * @input Uses React, Lexical (lexical + @lexical/react, composed through
 *   LexicalExtensionComposer), design tokens
 * @output Exports RichTextView component and RichTextViewProps
 * @position Read-only renderer for serialized Lexical editor state; experimental
 *   (richtext), exported from @astryxdesign/richtext
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/richtext/src/RichTextView.test.tsx
 * - /packages/richtext/src/index.ts
 * - /apps/storybook/stories/RichTextEditor.stories.tsx
 */

import {useEffect, useRef, useState, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {sharedEditorTheme} from './editorTheme';
import type {BaseProps} from '@astryxdesign/core';

import {LexicalExtensionComposer} from '@lexical/react/LexicalExtensionComposer';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {ListNode, ListItemNode} from '@lexical/list';
import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import {LinkNode, AutoLinkNode} from '@lexical/link';
import {CodeNode, CodeHighlightNode} from '@lexical/code';
import type {
  AnyLexicalExtension,
  Klass,
  LexicalNode,
  EditorThemeClasses,
} from 'lexical';
import {defineExtension} from 'lexical';

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
   * Called when `value` cannot be parsed/rendered (e.g. malformed JSON, or
   * state authored with node types not registered via `nodes`). A read-only
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
}

/**
 * Keeps the rendered content in sync with the `value` prop after mount.
 *
 * The editor's initial state is seeded once, when the composer mounts, so a
 * plain `<RichTextView value={changingValue} />` would freeze at its first
 * value — the content would never update when `value` changed. This plugin runs
 * inside the composer context and re-applies `value` whenever it changes, so the
 * read-only view stays reactive (e.g. previewing content edited elsewhere).
 *
 * The initial `value` is already applied via the extension's
 * `$initialEditorState`, so we skip the first run to avoid a redundant re-parse
 * on mount.
 *
 * This mirrors the canonical Lexical pattern for applying externally-sourced
 * serialized state after mount: the Lexical Playground's ActionsPlugin does the
 * same `editor.setEditorState(editor.parseEditorState(...))` from inside a
 * plugin (see facebook/lexical
 * packages/lexical-playground/src/plugins/ActionsPlugin/index.tsx). It is
 * necessary because the composer builds the editor once and reads the initial
 * state exactly once at that point, so a changed prop cannot re-seed the editor
 * on its own. A read-only view has no history, so we skip the Playground's
 * accompanying CLEAR_HISTORY_COMMAND.
 *
 * `parseEditorState` / `setEditorState` are methods on the editor instance, so
 * this plugin needs no module-level Lexical imports of its own.
 */
function SyncValuePlugin({value}: {value: string}): null {
  const [editor] = useLexicalComposerContext();
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
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
export function RichTextView({
  value,
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
  const themeRef = useRef<EditorThemeClasses | null>(null);
  if (themeRef.current === null) {
    themeRef.current = sharedEditorTheme();
  }

  // Built on first render (and again after an error, below) rather than per
  // render: LexicalExtensionComposer re-creates the editor whenever the
  // extension's identity changes, and `value` updates are applied in place by
  // SyncValuePlugin instead.
  const extensionRef = useRef<AnyLexicalExtension | null>(null);

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
  // JSON would otherwise throw synchronously while the composer builds the
  // editor and escape any error boundary, taking down the host on the render
  // path.
  if (!hasError) {
    try {
      JSON.parse(value);
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  if (hasError) {
    // The composer subtree is unmounted while the fallback renders. Drop the
    // extension so that recovering from the error builds a fresh one, seeded
    // with the corrected `value`.
    extensionRef.current = null;
    return (
      <div
        {...stylex.props(styles.root, xstyle)}
        className={className}
        style={style}
        {...rest}>
        {errorFallback}
      </div>
    );
  }

  if (extensionRef.current === null) {
    extensionRef.current = defineExtension({
      name: '@astryxdesign/richtext/RichTextView',
      namespace,
      theme: themeRef.current,
      editable: false,
      nodes: nodes ? [...DEFAULT_NODES, ...nodes] : [...DEFAULT_NODES],
      $initialEditorState: value,
      // A read-only view renders persisted content; a bad node/schema should not
      // crash the host. Surface it via onParseError + fallback instead of re-throwing.
      onError: handleError,
    });
  }

  return (
    <div
      {...stylex.props(styles.root, xstyle)}
      className={className}
      style={style}
      {...rest}>
      <LexicalExtensionComposer
        extension={extensionRef.current}
        contentEditable={null}>
        <SyncValuePlugin value={value} />
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        {plugins}
      </LexicalExtensionComposer>
    </div>
  );
}

RichTextView.displayName = 'RichTextView';
