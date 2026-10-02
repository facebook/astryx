// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the docs command.
 *
 * Dispatcher + barrel. `docs()` routes by argument shape into one of six
 * { type, data } envelopes:
 *
 *   docs()                                  -> list    -> docs.list
 *   docs(topic)                             -> detail  -> docs.detail
 *   docs(topic, undefined, {index: true})   -> index   -> docs.index
 *   docs(topic, section)                    -> section -> docs.detail.section
 *   docs(route)                             -> node    -> docs.node
 *   docs(namespace, undefined,
 *     {flatten: true})                      -> tree    -> docs.tree
 *
 * A topic read returns the whole doc, as it always has; `index` returns its
 * sections, so a reader can open one by its key (spec:AST-047). The CLI's text
 * view lists the sections by default. A route names a node
 * of the docs tree (spec:AST-046): a namespace lists its children, a guide the
 * tree places reads like any topic, and a typed doc prints its content. The
 * leaves
 * live in list/, index/, detail/, detail/section/, and node/; the discovery,
 * overlay loading, and resolution they share sit in _adapter.mjs.
 */

import {list} from './list/list.mjs';
import {index} from './index/index.mjs';
import {detail} from './detail/detail.mjs';
import {section as sectionLeaf} from './detail/section/section.mjs';
import {node as nodeLeaf, nodeView, treeView} from './node/node.mjs';
import {resolveDocsArgument, unknownTopicError} from './_adapter.mjs';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';

export {list, index, detail, sectionLeaf as section, nodeLeaf as node};

/**
 * @param {string} message
 * @returns {AstryxError}
 */
function invalidFlatten(message) {
  return new AstryxError(
    message,
    undefined,
    ERROR_CODES.ERR_INVALID_ARGUMENT,
  );
}

/**
 * @param {string} [topic]
 * @param {string} [section]
 * @param {object} [options]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @param {boolean} [options.index] return the topic's section index instead of
 *   the whole doc
 * @param {boolean} [options.flatten] return a namespace and every descendant
 *   with each guide or typed doc's full body
 * @param {string} [options.cwd]
 * @returns {Promise<
 *   import('./docs.type.mjs').DocsListResponse |
 *   import('./docs.type.mjs').DocsIndexResponse |
 *   import('./docs.type.mjs').DocsDetailResponse |
 *   import('./docs.type.mjs').DocsDetailSectionResponse |
 *   import('./docs.type.mjs').DocsNodeResponse |
 *   import('./docs.type.mjs').DocsTreeResponse
 * >}
 */
export async function docs(topic, section, options = {}) {
  if (options.flatten && (!topic || section != null || options.index)) {
    throw invalidFlatten(
      'Flattening compiles one namespace subtree and requires a namespace route with no section or index.',
    );
  }
  if (!topic) return list(options);
  const found = await resolveDocsArgument(topic, options);
  if (options.flatten && found.kind === 'unknown') {
    throw await unknownTopicError(topic, found.catalog);
  }
  if (found.kind === 'node') {
    if (options.flatten) {
      if (found.node.kind !== 'namespace') {
        throw invalidFlatten(
          `"${found.node.route}" is a ${found.node.kind} doc, not a namespace. Flattening only compiles namespace routes.`,
        );
      }
      return {
        type: 'docs.tree',
        data: await treeView(found.catalog, found.tree, found.node, options),
      };
    }
    // A namespace or a typed doc has no sections: it is one read. `--index`
    // asks for what the node read already is.
    if (section) {
      throw new AstryxError(
        `"${found.node.route}" has no sections. ${
          found.node.kind === 'namespace'
            ? 'Open one of its children instead.'
            : `Read it whole: astryx docs ${found.node.route}.`
        }`,
        found.node.kind === 'namespace'
          ? found.node.slots.flatMap(slot =>
              slot.children.map(route => ({
                name: route,
                reason: found.tree.get(route)?.summary ?? '',
              })),
            )
          : [{name: found.node.route, reason: found.node.summary}],
        ERROR_CODES.ERR_UNKNOWN_SECTION,
      );
    }
    return {
      type: 'docs.node',
      data: await nodeView(found.catalog, found.tree, found.node),
    };
  }
  if (options.flatten) {
    throw invalidFlatten(
      `"${String(topic)}" is a topic, not a namespace. Flattening only compiles namespace routes.`,
    );
  }
  if (section) return sectionLeaf(topic, section, options);
  if (options.index) return index(topic, options);
  return detail(topic, options);
}
