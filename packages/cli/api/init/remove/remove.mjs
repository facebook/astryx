// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file init.remove leaf — the `--remove-agents` path behind `astryx init`.
 *
 * `remove(ctx)` deletes the managed agent-docs block from every agent-doc file
 * and returns an `init.remove` receipt. The removal engine lives in
 * lib/agent-docs; this leaf only wires the cwd.
 *
 * Note: removeAgentDocs() still logs its own per-file lines via humanLog
 * (shared lib behavior) — so a programmatic remove is not perfectly silent yet.
 * Threading a logger through agent-docs is a separate cleanup.
 */

import {removeAgentDocs} from '../../../foundation/agent-docs/agent-docs.mjs';
import {logger} from '../../logger.mjs';

/**
 * Remove the managed agent-docs block and return an `init.remove` receipt.
 * Progress is emitted through the shared `logger` (silent by default).
 *
 * @param {{cwd?: string}} [ctx]
 * @returns {Promise<import('../init.type.mjs').InitRemoveResponse>}
 */
export async function remove({cwd = process.cwd()} = {}) {
  // A clean project has no managed block, and removing from it is a no-op. The
  // receipt used to be the literal {removed: true} either way, so a caller
  // could not tell "removed it" from "there was nothing there".
  const removedFrom = removeAgentDocs(cwd);
  const removed = removedFrom.length > 0;
  logger.log(
    removed
      ? '[ok] AI agent docs removed.'
      : '[ok] Nothing to remove: no Astryx agent-docs block was found.',
  );
  return {type: 'init.remove', data: {removed}};
}
