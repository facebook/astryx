// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file nodeViews.ts
 * @input A Lexical node an export reads through a stand-in
 * @output nodeView: a stand-in that delegates every read to the node and holds
 *   the node's fields as its own
 * @position Every stand-in this package hands to Lexical's exporters is made
 *   here (markdownSource.ts, markdownSpaceRuns.ts). Lexical reads a node's
 *   serialized fields as own properties of the instance — `exportJSON` throws
 *   when a declared field is missing from the instance, and a link's title and
 *   address are read the same way — so a stand-in that only inherits them
 *   exports as a node that lost them.
 */

import type {LexicalNode} from 'lexical';

/**
 * A stand-in for `node`: reads not overridden on it reach the node through
 * its prototype, and the node's own fields are the stand-in's own fields, so
 * Lexical's exporters read it as the node itself.
 */
export function nodeView<T extends LexicalNode>(node: T): T {
  const view = Object.create(node) as T;
  // Defined, not assigned: a node's type is read-only, and an assignment
  // through the prototype would throw.
  Object.defineProperties(view, Object.getOwnPropertyDescriptors(node));
  return view;
}
