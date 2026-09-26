// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file editorNodes.ts
 * @input Imports the default Lexical node classes registered by the editor.
 * @output Exports DEFAULT_NODES — the base OSS node set.
 * @position Shared by RichTextEditor.tsx (editor config) and
 *   markdownSerializers.ts (headless conversion), so both register the same
 *   nodes and Markdown round-trips consistently.
 *
 * SYNC: When the default node set changes, both consumers pick it up here.
 */

import {ListNode, ListItemNode} from '@lexical/list';
import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import {LinkNode, AutoLinkNode} from '@lexical/link';
import {CodeNode, CodeHighlightNode} from '@lexical/code';
import type {Klass, LexicalNode} from 'lexical';

/**
 * The default OSS node set registered with the editor: headings, quotes,
 * lists, links, and code. Extend via the `nodes` prop / option rather than
 * editing this list.
 */
export const DEFAULT_NODES: ReadonlyArray<Klass<LexicalNode>> = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  AutoLinkNode,
  CodeNode,
  CodeHighlightNode,
];
