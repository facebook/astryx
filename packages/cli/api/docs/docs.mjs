// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the docs command.
 *
 * Dispatcher + barrel. `docs()` routes by argument shape into one of five
 * leaves, each projecting into a single { type, data } envelope:
 *
 *   docs()                                -> list    -> docs.list
 *   docs(topic)                           -> detail  -> docs.detail
 *   docs(topic, undefined, {index: true}) -> index   -> docs.index
 *   docs(topic, section)                  -> section -> docs.detail.section
 *   docs(route)                           -> node    -> docs.node
 *
 * A topic read returns the whole doc, as it always has. The index is how a
 * reader works progressively instead: list the topic's sections, then read one
 * by its key. A route names a node of the docs tree (spec:AST-044): a
 * namespace lists its children one level at a time, and a typed doc prints its
 * content. A guide the tree places is a topic, read by its route. The leaves
 * live in list/, index/, detail/, detail/section/, and node/; the discovery,
 * overlay loading, and resolution they share sit in _adapter.mjs.
 */

import {list} from './list/list.mjs';
import {index} from './index/index.mjs';
import {detail} from './detail/detail.mjs';
import {section as sectionLeaf} from './detail/section/section.mjs';
import {node as nodeLeaf, nodeView} from './node/node.mjs';
import {resolveDocsArgument} from './_adapter.mjs';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';

export {list, index, detail, sectionLeaf as section, nodeLeaf as node};

/**
 * @param {string} [topic]
 * @param {string} [section]
 * @param {object} [options]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @param {boolean} [options.index] return the topic's section index instead of
 *   the whole doc
 * @param {string} [options.cwd]
 * @returns {Promise<
 *   import('./docs.type.mjs').DocsListResponse |
 *   import('./docs.type.mjs').DocsIndexResponse |
 *   import('./docs.type.mjs').DocsDetailResponse |
 *   import('./docs.type.mjs').DocsDetailSectionResponse |
 *   import('./docs.type.mjs').DocsNodeResponse
 * >}
 */
export async function docs(topic, section, options = {}) {
  if (!topic) return list(options);
  const found = await resolveDocsArgument(topic, options);
  if (found.kind === 'node') {
    // A namespace or a typed doc has no sections: it is one read. `--index`
    // asks for what the node read already is.
    if (section) {
      throw new AstryxError(
        `"${found.node.route}" has no sections. ${
          found.node.kind === 'namespace'
            ? 'Open one of its children instead.'
            : 'Read it whole.'
        }`,
        found.node.slots.flatMap(slot =>
          slot.children.map(route => ({
            name: route,
            reason: found.tree.get(route)?.summary ?? '',
          })),
        ),
        ERROR_CODES.ERR_UNKNOWN_SECTION,
      );
    }
    return {type: 'docs.node', data: nodeView(found.tree, found.node)};
  }
  if (section) return sectionLeaf(topic, section, options);
  if (options.index) return index(topic, options);
  return detail(topic, options);
}
