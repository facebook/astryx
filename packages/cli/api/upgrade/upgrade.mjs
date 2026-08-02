// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file upgrade API — dispatcher + barrel over the upgrade leaves.
 *
 * `upgrade(options)` runs codemods that migrate source from a previous Astryx
 * version to the currently installed one, and refreshes the managed agent-docs
 * block. It is the single entry the CLI calls; it validates the invocation and
 * routes to one leaf, each of which returns its `{type, data}` envelope:
 *   - `list`   (api/upgrade/list)   → upgrade.list   — available codemods, no run
 *   - `run`    (api/upgrade/run)    → upgrade.run    — the terminal run receipt,
 *       plus the up_to_date / no_codemods / config_fixable short-circuits it
 *       delegates to the `status` leaf → upgrade.status
 *
 * Shared version-detection + codemod selection/execution I/O lives in
 * `_adapter.mjs` (the leaves project its results). Errors throw AstryxError
 * (stable code). Human progress is emitted through the shared `logger`
 * (silent by default), so the CLI keeps its exact output and a programmatic
 * caller stays quiet.
 */

import {list} from './list/list.mjs';
import {run} from './run/run.mjs';
import {isValidSemver} from '../../foundation/env/semver.mjs';
import {getCliInvocation} from '../../foundation/env/package-manager.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';
import {AstryxError} from '../error.mjs';
import {logger} from '../logger.mjs';


/**
 * @typedef {import('./upgrade.type.mjs').UpgradeOptions} UpgradeOptions
 */

/**
 * Run the upgrade pipeline. Validates the invocation, then dispatches to the
 * list/status/run leaves. Returns the leaf's receipt; throws AstryxError on
 * failure. Progress is emitted through the shared `logger` (silent by default).
 *
 * @param {UpgradeOptions} [options]
 * @param {{cwd?: string}} [ctx]
 * @returns {Promise<import('./upgrade.type.mjs').UpgradeListResponse | import('./upgrade.type.mjs').UpgradeStatusResponse | import('./upgrade.type.mjs').UpgradeRunResponse>}
 */
export async function upgrade(options = {}, {cwd = process.cwd()} = {}) {
  logger.log('\nUpgrade');

  if (!options.list && !options.from) {
    const msg = `Missing required --from. Install the target version first, then run \`${getCliInvocation()} upgrade --from <old-version>\`.`;
    logger.error(msg);
    logger.log('Aborted\n');
    throw new AstryxError(msg, undefined, ERROR_CODES.ERR_INVALID_ARGUMENT);
  }

  if (!options.list && !isValidSemver(options.from)) {
    const msg = `Invalid --from value: "${options.from}". Expected a semver string like 0.0.5.`;
    logger.error(msg);
    logger.log('Aborted\n');
    throw new AstryxError(msg, undefined, ERROR_CODES.ERR_INVALID_VERSION);
  }

  if (options.list) {
    return list();
  }

  return run(options, {cwd});
}
