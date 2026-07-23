// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file RichTextView.tsx
 * @input Uses React, Lexical (lexical + @lexical/react), design tokens
 * @output Exports RichTextView component and RichTextViewProps
 * @position Read-only renderer for serialized Lexical editor state; experimental
 *   (lab), re-exported from @astryxdesign/lab
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/RichTextEditor/RichTextView.test.tsx
 * - /packages/lab/src/RichTextEditor/index.ts
 * - /packages/lab/src/index.ts (barrel re-export)
 * - /apps/storybook/stories/RichTextEditor.stories.tsx
 */

import {useRef, useState, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {sharedEditorTheme} from './editorTheme';
import type {BaseProps} from '@astryxdesign/core';

import {
  LexicalComposer,
  type InitialConfigType,
} from '@lexical/react/LexicalComposer';
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
 * A read-only renderer for serialized Lexical content. Renders the same styled
 * output as {@link RichTextEditor} without any editing affordances.
 *
 * @example
 * ```
 * import {RichTextView} from '@astryxdesign/lab';
 *
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
        {...stylex.props(styles.root, xstyle)}
        className={className}
        style={style}
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
      {...stylex.props(styles.root, xstyle)}
      className={className}
      style={style}
      {...rest}>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        {plugins}
      </LexicalComposer>
    </div>
  );
}

RichTextView.displayName = 'RichTextView';
