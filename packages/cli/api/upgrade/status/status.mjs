// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file upgrade.status leaf — the short-circuit results of the upgrade pipeline.
 *
 * Three status variants, each a projection of state the `run` leaf has already
 * resolved (via `_adapter.mjs`) at the point it decides not to run codemods:
 *   - `up_to_date`     — `--from` is >= the installed target and no `--force`.
 *   - `no_codemods`    — no core/integration codemods apply to the range.
 *   - `config_fixable` — DRY-RUN only: the config fails strict validation but a
 *     pending core CONFIG codemod would repair it; preview the fix, don't write.
 *
 * These builders own the exact human progress lines for their path (emitted via
 * the shared `logger`) and return the `upgrade.status` envelope; the caller
 * just returns what they hand back.
 */

import {formatCliCommand} from '../../../foundation/env/package-manager.mjs';
import {logger} from '../../logger.mjs';

/**
 * `--from` is at/after the installed target (and no `--force`): nothing to run.
 * @param {{from: string, to: string, agentDocs: import('../upgrade.type.mjs').AgentDocsSummary}} data
 * @returns {import('../upgrade.type.mjs').UpgradeStatusResponse}
 */
export function statusUpToDate({from, to, agentDocs}) {
  logger.log('✓ Already up to date — no codemods to run.');
  logger.log('Use --force to run codemods anyway.');
  logger.log('Done\n');
  return {type: 'upgrade.status', data: {status: 'up_to_date', from, to, agentDocs}};
}

/**
 * No core or integration codemods apply to the requested version range.
 * @param {{from: string, to: string, agentDocs: import('../upgrade.type.mjs').AgentDocsSummary}} data
 * @returns {import('../upgrade.type.mjs').UpgradeStatusResponse}
 */
export function statusNoCodemods({from, to, agentDocs}) {
  logger.log('✓ No codemods available for this version range.');
  logger.log('Done\n');
  return {type: 'upgrade.status', data: {status: 'no_codemods', from, to, agentDocs}};
}

/**
 * DRY-RUN only: the consumer's astryx.config fails strict validation, but a
 * pending core CONFIG codemod previewed a change that would repair it. Preview
 * the fix + report the exact `--apply` command; integrations are skipped here.
 * @param {{from: string, to: string, configError: string, configCodemods: string[], agentDocs: import('../upgrade.type.mjs').AgentDocsSummary}} data
 * @returns {import('../upgrade.type.mjs').UpgradeStatusResponse}
 */
export function statusConfigFixable({from, to, configError, configCodemods, agentDocs}) {
  const codemodFlags = configCodemods.map(name => `--codemod ${name}`).join(' ');
  const suggestedCommand = `astryx upgrade --from ${from} ${codemodFlags} --apply`;
  const guidance =
    'Your astryx.config currently fails strict validation, but a pending ' +
    'config codemod would repair it. This dry run previewed the fix without ' +
    'writing. Re-run with --apply to apply it, or run just the config codemod(s) ' +
    'now:';
  logger.warn(guidance);
  logger.log(`  ${formatCliCommand(suggestedCommand)}`);
  logger.log('Integrations are skipped in this preview; they will be processed on the --apply run.');
  logger.log('Dry run complete\n');
  return {
    type: 'upgrade.status',
    data: {
      status: 'config_fixable',
      from,
      to,
      configError,
      configCodemods,
      suggestedCommand,
      message: guidance,
      note: 'Integrations are skipped in this preview; they will be processed on the --apply run.',
      agentDocs,
    },
  };
}
