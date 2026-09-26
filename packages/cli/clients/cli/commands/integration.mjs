// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file CLI bindings for integration authoring and package verification. */

import {integrationAdd} from '../../../api/integration/add-contribution.mjs';
import {integrationPackCheck} from '../../../api/integration/pack-check.mjs';
import {jsonOut} from '../../../foundation/response/json.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {NO_RESULT_SET} from '../../../foundation/debug/index.mjs';
import {emit, list, section, text} from '../formatters/index.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {defineCommand} from '../lib/define-command.mjs';
import {doc as integrationGroup} from './integration.doc.mjs';
import {doc as integrationAddCommand} from './integration-add.doc.mjs';
import {doc as integrationPackCommand} from './integration-pack.doc.mjs';
import {doc as integrationAddFn} from '../../../api/integration/integrationAdd.doc.mjs';
import {doc as integrationPackCheckFn} from '../../../api/integration/integrationPackCheck.doc.mjs';

/**
 * @param {import('commander').Command} command
 * @param {string} label
 * @param {unknown} options
 * @param {import('commander').Command} invoked
 */
function showGroupOrUnknown(command, label, options, invoked) {
  const extras = invoked?.args ?? [];
  if (extras.length > 0) {
    return cliError(`unknown subcommand '${label} ${String(extras[0])}'`, {
      suggestions: (command.commands ?? []).map(child => ({
        name: child.name(),
        reason: 'available subcommand',
      })),
      code: ERROR_CODES.ERR_UNKNOWN_SUBCOMMAND,
    });
  }
  command.outputHelp();
  return NO_RESULT_SET;
}

/** @param {import('commander').Command} program */
export function registerIntegration(program) {
  /** @type {import('commander').Command} */
  let integration;
  integration = defineCommand(program, integrationGroup, {
    action: (options, command) =>
      showGroupOrUnknown(integration, 'integration', options, command),
  });

  defineCommand(integration, integrationAddCommand, {
    fn: integrationAddFn,
    action: async (kind, name, options) => {
      const json = program.opts().json || false;
      let result;
      try {
        result = await integrationAdd(kind, name, {
          cwd: process.cwd(),
          dryRun: options.dryRun,
          templateType: options.type,
          replaces: options.replaces,
          extends: options.extends,
          to: options.to,
        });
      } catch (error) {
        const err =
          /** @type {import('../../../api/error.mjs').AstryxError} */ (error);
        return cliError(err.message, {
          suggestions: err.suggestions ?? [],
          code: err.code,
        });
      }

      if (json) {
        jsonOut(result);
        return NO_RESULT_SET;
      }

      const {root, manifest, files, written, dryRun} = result.data;
      const state = dryRun ? 'plan' : written ? 'ok' : 'unchanged';
      const blocks = [
        section(
          dryRun
            ? `${kind} contribution plan`
            : written
              ? `${kind} contribution added`
              : `${kind} contribution unchanged`,
        ),
        text(`[${state}] ${result.data.name}`),
      ];
      if (root != null) {
        blocks.push(
          text(
            `${root.created ? 'Declare' : 'Use'} ${kind} root ${root.path} in ${manifest}.`,
          ),
        );
      } else {
        blocks.push(text(`Update ${manifest}.`));
      }
      if (files.length > 0) blocks.push(list(files));
      emit(...blocks);
      return NO_RESULT_SET;
    },
  });

  defineCommand(integration, integrationPackCommand, {
    fn: integrationPackCheckFn,
    action: async options => {
      if (!options.check) {
        return cliError('Pass --check to verify the integration tarball.', {
          code: ERROR_CODES.ERR_INVALID_ARGUMENT,
        });
      }

      const result = await integrationPackCheck({cwd: process.cwd()});
      if (program.opts().json) {
        jsonOut(result);
      } else {
        const {name, version, packable, tarball, inventory, issues} =
          result.data;
        const identity = [name, version].filter(Boolean).join('@');
        const blocks = [
          section(
            packable
              ? 'Integration package ready'
              : 'Integration package check failed',
          ),
          text(
            `${packable ? '[ok]' : '[fail]'} ${identity || 'local package'}`,
          ),
        ];
        if (tarball != null) {
          blocks.push(
            text(
              `${tarball.fileCount} packed files; ${inventory.packedFiles}/${inventory.expectedFiles} required files present.`,
            ),
          );
        }
        if (issues.length > 0) {
          blocks.push(
            list(
              issues.map(
                issue =>
                  `[${issue.severity === 'error' ? 'fail' : 'warn'}] ${issue.message}`,
              ),
            ),
          );
        }
        emit(...blocks);
      }
      if (!result.data.packable) process.exitCode = 1;
      return NO_RESULT_SET;
    },
  });
}
