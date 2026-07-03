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

import {jsonOut, humanLog} from '../lib/json.mjs';
import {
  validateLocalIntegration,
  validateInstalledIntegration,
  summarizeIssues,
} from '../api/validate-integration.mjs';

/**
 * Render a validation result for humans.
 * @param {import('../api/validate-integration.mjs').ValidateResult} result
 */
function printHuman(result) {
  const label =
    result.version != null
      ? `${result.name}@${result.version}`
      : result.name;
  humanLog(`Validating integration: ${label}`);

  if (result.issues.length === 0) {
    humanLog('\n\u2713 No issues found.');
    return;
  }

  humanLog('');
  for (const issue of result.issues) {
    humanLog(`  ${issue.severity} ${issue.code}: ${issue.message}`);
  }

  const {errors, warnings} = summarizeIssues(result.issues);
  humanLog(
    `\n${result.issues.length} issue(s): ${errors} error(s), ${warnings} warning(s)`,
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
  program
    .command('validate-integration [package]')
    .description(
      'Validate an Astryx integration package (manifest + contributions)',
    )
    .addHelpText(
      'after',
      '\nWith no argument, validates the integration package rooted at the\n' +
        'current directory. Pass a package name to validate an installed\n' +
        'integration resolved from ./node_modules.\n\n' +
        'Exit code:\n' +
        '  0  no error issues (warnings are allowed) — safe as a CI gate\n' +
        '  1  one or more error issues\n',
    )
    .action(async pkg => {
      const json = program.opts().json || false;

      const result = pkg
        ? await validateInstalledIntegration(pkg)
        : await validateLocalIntegration();

      // No-arg + no local manifest: guidance, not an error.
      if (!result.found) {
        if (json) {
          jsonOut('integration.validate', {
            name: null,
            version: null,
            issues: [],
          });
        } else {
          humanLog(NO_MANIFEST_GUIDANCE);
        }
        return;
      }

      if (json) {
        jsonOut('integration.validate', {
          name: result.name ?? null,
          version: result.version ?? null,
          issues: result.issues,
        });
      } else {
        printHuman(result);
      }

      const {errors} = summarizeIssues(result.issues);
      if (errors > 0) {
        process.exitCode = 1;
      }
    });
}
