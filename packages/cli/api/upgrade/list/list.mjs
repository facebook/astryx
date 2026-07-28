// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file upgrade.list leaf — the available codemods, nothing run.
 *
 * Projects the registry walk (`_adapter.collectAllCodemods`) into the public
 * list entries (name/title/version/optional) and emits the human listing
 * through the injected `logger`. No cwd, no version detection, no side effects.
 */

import {collectAllCodemods} from '../_adapter.mjs';
import {noopLogger} from '../../../lib/term-log.mjs';

/**
 * List every available codemod (oldest→newest).
 * @param {{logger?: import('../../../lib/term-log.mjs').CliLogger}} [ctx]
 * @returns {Promise<import('../../../types/upgrade').UpgradeListResponse>}
 */
export async function list({logger = noopLogger} = {}) {
  const codemods = await collectAllCodemods();
  logger.step('Available codemods:');
  for (const {name, title, pr, optional} of codemods) {
    logger.info(`  ${name} — ${title}${optional ? ' (optional)' : ''} (${pr})`);
  }
  logger.outro('Done');
  return {
    type: 'upgrade.list',
    data: codemods.map(({name, title, version, optional}) => ({name, title, version, optional})),
  };
}
