// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file init.remove leaf — the `--remove-agents` path behind `astryx init`.
 *
 * `remove(ctx)` deletes the managed agent-docs block from every agent-doc file
 * and returns an `init.remove` receipt. The removal engine lives in
 * lib/agent-docs; this leaf only wires the cwd + the injected logger.
 *
 * Note: removeAgentDocs() still logs its own per-file lines via humanLog
 * (shared lib behavior) — so a programmatic remove is not perfectly silent yet.
 * Threading a logger through agent-docs is a separate cleanup.
 */

import {removeAgentDocs} from '../../../lib/agent-docs/agent-docs.mjs';
import {noopInitLogger} from '../_adapter.mjs';

/**
 * Remove the managed agent-docs block and return an `init.remove` receipt.
 * Progress is emitted through `logger` (silent by default).
 *
 * @param {{cwd?: string, logger?: import('../_adapter.mjs').InitLogger}} [ctx]
 * @returns {Promise<import('../../../types/init').InitRemoveResponse>}
 */
export async function remove({cwd = process.cwd(), logger = noopInitLogger} = {}) {
  removeAgentDocs(cwd);
  logger.log('✓ AI agent docs removed.');
  return {type: 'init.remove', data: {removed: true}};
}
