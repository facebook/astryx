// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx validate-integration` command — validate ONE integration
 * package's manifest and contributions and report findings using the
 * AstryxIntegrationIssue model.
 *
 *   astryx validate-integration            validate the local package (cwd)
 *   astryx validate-integration <pkg>      validate an installed package
 *
 * Exit code is the contract: 0 when there are no severity:'error' issues
 * (warnings are fine), 1 when any error issue is present — so it works as a CI
 * gate. The no-arg + no-local-manifest case prints guidance and exits 0 (not
 * an integration package is not a failure).
 */

import {jsonOut} from '../../../foundation/response/json.mjs';
import {emit, section, text, records} from '../formatters/index.mjs';
import {defineCommand} from '../lib/define-command.mjs';
import {
  validateIntegration,
  summarizeIssues,
} from '../../../api/integration/validate-integration.mjs';
import {doc as validateIntegrationCommand} from './validate-integration.doc.mjs';
import {doc as validateIntegrationFn} from '../../../api/integration/validateIntegration.doc.mjs';

/**
 * Render a validation result for humans.
 * @param {import('../../../api/integration/validate-integration.type.mjs').ValidateIntegrationResponse['data']} data
 */
function printHuman(data) {
  const label =
    data.version != null ? `${data.name}@${data.version}` : data.name;

  if (data.issues.length === 0) {
    emit(
      section(`Validating integration: ${label}`),
      text('[ok] No issues found.'),
    );
    return;
  }

  // The issue list is a projection of the JSON: one record per issue, fields
  // mirroring the JSON keys (severity/code/message).
  const {errors, warnings} = summarizeIssues(data.issues);
  emit(
    section(`Validating integration: ${label}`),
    records(data.issues, {fields: ['severity', 'code', 'message']}),
    text(
      `${data.issues.length} issue(s): ${errors} error(s), ${warnings} warning(s)`,
    ),
  );
}

const NO_MANIFEST_GUIDANCE =
  'No astryx.integration.* found next to package.json. ' +
  'To validate an installed integration: astryx validate-integration <package>';

/**
 * Register the `astryx validate-integration` command.
 * @param {import('commander').Command} program
 */
export function registerValidateIntegration(program) {
  defineCommand(program, validateIntegrationCommand, {
    fn: validateIntegrationFn,
    action: async pkg => {
      const json = program.opts().json || false;

      const result = await validateIntegration(pkg);

      if (json) {
        jsonOut(result);
      } else if (result.data.name === null) {
        // No-arg + no local manifest: guidance, not an error.
        emit(text(NO_MANIFEST_GUIDANCE));
      } else {
        printHuman(result.data);
      }

      const {errors} = summarizeIssues(result.data.issues);
      if (errors > 0) {
        process.exitCode = 1;
      }
    },
  }).addHelpText(
    'after',
    '\nWith no argument, validates the integration package rooted at the\n' +
      'current directory. Pass a package name to validate an installed\n' +
      'integration resolved from ./node_modules.\n\n' +
      'Exit code:\n' +
      '  0  no error issues (warnings are allowed) — safe as a CI gate\n' +
      '  1  one or more error issues\n',
  );
}
