// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file upgrade.list leaf — the available codemods, nothing run.
 *
 * Projects the registry walk (`_adapter.collectAllCodemods`) into the public
 * list entries (name/title/version/optional) and emits the human listing
 * through the shared `logger`. No cwd, no version detection, no side effects.
 */

import {collectAllCodemods} from '../_adapter.mjs';
import {logger} from '../../logger.mjs';

/**
 * List every available codemod (oldest→newest).
 * @returns {Promise<import('../upgrade.type.mjs').UpgradeListResponse>}
 */
export async function list() {
  const codemods = await collectAllCodemods();
  logger.log('Available codemods:');
  for (const {name, title, pr, optional} of codemods) {
    logger.log(`  ${name} — ${title}${optional ? ' (optional)' : ''} (${pr})`);
  }
  logger.log('Done\n');
  return {
    type: 'upgrade.list',
    data: codemods.map(({name, title, version, optional}) => ({name, title, version, optional})),
  };
}
