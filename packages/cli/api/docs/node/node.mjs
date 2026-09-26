// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs.node leaf — one namespace or typed doc in the docs tree.
 *
 * @input A route the docs tree resolves: a namespace such as `cli/api`, or a
 *   typed doc such as `cli/api/functions/search`, plus {cwd}.
 * @output { type: 'docs.node', data: DocsNode } — the node's identity, title
 *   and summary, the namespaces above it, and either its slots with their
 *   children (a namespace) or its content (a typed doc). A namespace never
 *   lists its grandchildren, so a reader goes down one level at a time.
 *   Matches `astryx --json docs <route>`.
 * @position Leaf under api/docs, beside the topic leaves. A guide the tree
 *   places is a topic: the detail leaf reads it by its route.
 */

import {
  cliDocIndex,
  cliDocSection,
} from '../../../foundation/discovery/cli-self-docs.mjs';
import {resolveDocsArgument, unknownTopicError} from '../_adapter.mjs';

/**
 * @typedef {import('../../../foundation/doc-compiler/tree.mjs').DocsTree} DocsTree
 * @typedef {import('../../../foundation/doc-compiler/tree.mjs').TreeNode} TreeNode
 */

/** @type {WeakMap<DocsTree, ReturnType<typeof cliDocIndex>>} */
const indexes = new WeakMap();

/**
 * Cross-links for typed docs: each doc's route, found by its kind and name.
 * @param {DocsTree} tree
 */
function indexFor(tree) {
  let index = indexes.get(tree);
  if (!index) {
    /** @type {Map<string, string>} */
    const routes = new Map();
    const docs = [];
    for (const node of tree.nodes.values()) {
      routes.set(`${node.kind}\u0000${node.name}`, node.route);
      if (node.ref?.selfDoc) docs.push(node.ref.selfDoc);
    }
    index = cliDocIndex(
      docs,
      (kind, name) => routes.get(`${kind}\u0000${name}`) ?? null,
    );
    indexes.set(tree, index);
  }
  return index;
}

/**
 * The docs.node view of one tree node.
 * @param {DocsTree} tree
 * @param {TreeNode} node
 * @returns {import('../docs.type.mjs').DocsNode}
 */
export function nodeView(tree, node) {
  return {
    id: node.id,
    route: node.route,
    kind: node.kind,
    package: node.provider,
    title: node.title,
    summary: node.summary,
    breadcrumb: tree
      .ancestors(node)
      .map(ancestor => ({route: ancestor.route, title: ancestor.title})),
    slots: node.slots
      .filter(slot => slot.children.length > 0)
      .map(slot => ({
        name: slot.name,
        title: slot.title,
        children: slot.children.map(route => {
          const child = /** @type {TreeNode} */ (tree.get(route));
          return {
            route: child.route,
            name: child.route.slice(child.route.lastIndexOf('/') + 1),
            kind: child.kind,
            title: child.title,
            summary: child.summary,
          };
        }),
      })),
    content: node.ref?.selfDoc
      ? cliDocSection(node.ref.selfDoc, indexFor(tree)).content
      : [],
  };
}

/**
 * @param {string} route
 * @param {{cwd?: string}} [options]
 * @returns {Promise<import('../docs.type.mjs').DocsNodeResponse>}
 */
export async function node(route, options = {}) {
  const found = await resolveDocsArgument(route, options);
  if (found.kind !== 'node')
    throw await unknownTopicError(route, found.catalog);
  return {type: 'docs.node', data: nodeView(found.tree, found.node)};
}
