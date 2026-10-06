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
  nodeContent,
  placeLinks,
  resolveDocsArgument,
  unknownTopicError,
} from '../_adapter.mjs';

/**
 * @typedef {import('../../../foundation/doc-compiler/tree.mjs').DocsTree} DocsTree
 * @typedef {import('../../../foundation/doc-compiler/tree.mjs').TreeNode} TreeNode
 */

/**
 * The docs.node view of one tree node.
 * @param {import('../../../foundation/discovery/docs-discovery.mjs').DocsCatalog} catalog
 * @param {DocsTree} tree
 * @param {TreeNode} node
 * @returns {Promise<import('../docs.type.mjs').DocsNode>}
 */
export async function nodeView(catalog, tree, node) {
  const {content} = await nodeContent(catalog, tree, node);
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
            package: child.provider,
          };
        }),
      })),
    content,
    links: nodeLinks(tree, node),
  };
}

/**
 * The moves a node offers (spec:AST-047): up to the level it sits in (the
 * topic list, for a top-level namespace), and across to the nodes before and
 * after it in its parent's slot.
 * @param {DocsTree} tree
 * @param {TreeNode} node
 * @returns {import('../docs.type.mjs').DocsLinks}
 */
function nodeLinks(tree, node) {
  const links = placeLinks(tree, node);
  const related = typedEdges(tree, node).routes;
  if (related.length > 0) {
    links.related = related.map(
      route =>
        /** @type {import('../docs.type.mjs').DocsCommand} */ (
          `astryx docs ${route}`
        ),
    );
  }
  return links;
}

/** @type {WeakMap<DocsTree, Map<string, string>>} */
const routeIndexes = new WeakMap();

/**
 * The route of each node, by its kind and name.
 * @param {DocsTree} tree
 * @returns {Map<string, string>}
 */
function routeIndex(tree) {
  let routes = routeIndexes.get(tree);
  if (!routes) {
    routes = new Map();
    for (const each of tree.nodes.values()) {
      routes.set(`${each.kind}\u0000${each.name}`, each.route);
    }
    routeIndexes.set(tree, routes);
  }
  return routes;
}

/**
 * The kinds of doc each typed field may name. A bare name in one of these
 * fields names a doc of the same provider and one of these kinds, so it is a
 * doc identity (spec:AST-047 FR9).
 */
const EDGE_KINDS = {
  function: {command: ['command'], related: ['function']},
  command: {fn: ['function'], related: ['command']},
};

/**
 * The typed edges a doc declares (spec:AST-047 FR5), resolved to routes: a
 * function doc's `command` and `related`, and a command doc's `fn` and
 * `related`. A bare name resolves among the kinds its field allows; a name
 * that matches docs of more than one allowed kind is an error, never a silent
 * pick. A `command` resolves to the command doc its leading words name, so
 * `integration add theme` (the `integration add` command with its kind
 * argument) opens `integration add`. Every name that resolves to no doc, or to
 * more than one, is returned in `unresolved`; the graph walk test fails on it,
 * so no edge a doc declares can go stale.
 * @param {DocsTree} tree
 * @param {TreeNode} node
 * @returns {{routes: string[], unresolved: string[]}}
 */
export function typedEdges(tree, node) {
  const doc = /** @type {any} */ (node.ref)?.selfDoc;
  /** @type {string[]} */
  const routes = [];
  /** @type {string[]} */
  const unresolved = [];
  const fields = /** @type {Record<string, string[]> | undefined} */ (
    /** @type {any} */ (EDGE_KINDS)[node.kind]
  );
  if (!doc || !fields) return {routes, unresolved};
  const index = routeIndex(tree);
  /** @param {string[]} kinds @param {string} name */
  const among = (kinds, name) =>
    kinds
      .map(kind => index.get(`${kind}\u0000${name}`))
      .filter(route => typeof route === 'string');
  for (const [field, kinds] of Object.entries(fields)) {
    const value = doc[field];
    const names = Array.isArray(value) ? value : value == null ? [] : [value];
    for (const name of names) {
      if (typeof name !== 'string' || name.trim() === '') continue;
      let found = among(kinds, name);
      if (found.length === 0 && field === 'command') {
        const words = name.trim().split(/\s+/);
        for (let n = words.length - 1; n > 0 && found.length === 0; n--) {
          found = among(kinds, words.slice(0, n).join(' '));
        }
      }
      if (found.length === 1) routes.push(/** @type {string} */ (found[0]));
      else if (found.length === 0) {
        unresolved.push(`${field} "${name}" names no ${kinds.join(' or ')} doc`);
      } else {
        unresolved.push(
          `${field} "${name}" names more than one doc (${found.join(', ')})`,
        );
      }
    }
  }
  return {
    routes: [...new Set(routes)].filter(route => route !== node.route),
    unresolved,
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
  return {
    type: 'docs.node',
    data: await nodeView(found.catalog, found.tree, found.node),
  };
}
