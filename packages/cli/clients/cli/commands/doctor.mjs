// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx doctor` project health and integration-authoring diagnostics.
 * Human output uses plain stable tokens; every leaf also has a typed JSON
 * response. Exit 1 means a check found an error, while warnings remain exit 0.
 */

import {runChecks} from '../../../api/doctor/doctor.mjs';
import {
  integrationComponentConflicts,
  integrationDocConflicts,
  integrationTemplateConflicts,
} from '../../../api/integration/authoring-checks.mjs';
import {
  summarizeIssues,
  validateIntegration,
} from '../../../api/integration/validate-integration.mjs';
import {jsonOut} from '../../../foundation/response/json.mjs';
import {emit, section, records, text} from '../formatters/index.mjs';
import {defineCommand} from '../lib/define-command.mjs';
import {doc as doctorCommand} from './doctor.doc.mjs';
import {doc as doctorIntegrationGroup} from './doctor-integration.doc.mjs';
import {doc as doctorIntegrationValidateCommand} from './doctor-integration-validate.doc.mjs';
import {doc as doctorIntegrationTemplatesCommand} from './doctor-integration-templates.doc.mjs';
import {doc as doctorIntegrationComponentsCommand} from './doctor-integration-components.doc.mjs';
import {doc as doctorIntegrationDocsCommand} from './doctor-integration-docs.doc.mjs';
import {doc as doctorFn} from '../../../api/doctor/doctor.doc.mjs';
import {doc as validateIntegrationFn} from '../../../api/integration/validateIntegration.doc.mjs';
import {doc as integrationTemplateConflictsFn} from '../../../api/integration/integrationTemplateConflicts.doc.mjs';
import {doc as integrationComponentConflictsFn} from '../../../api/integration/integrationComponentConflicts.doc.mjs';
import {doc as integrationDocConflictsFn} from '../../../api/integration/integrationDocConflicts.doc.mjs';
import {NO_RESULT_SET} from '../../../foundation/debug/index.mjs';

const STATUS = {
  pass: '[ok]',
  warn: '[warn]',
  warning: '[warn]',
  fail: '[fail]',
  error: '[fail]',
  info: '[info]',
};

/** @param {string} status */
function statusToken(status) {
  return STATUS[/** @type {keyof typeof STATUS} */ (status)] ?? status;
}

/** @param {{name: string | null, version: string | null}} data */
function integrationLabel(data) {
  return data.version != null ? `${data.name}@${data.version}` : data.name;
}

/**
 * @param {import('../../../api/doctor/doctor.mjs').DoctorReport} report
 */
function printHuman(report) {
  const {pass, warn, fail, info} = report.summary;
  const closing =
    fail > 0
      ? 'Some checks failed. Address the items marked [fail] above.'
      : warn > 0
        ? 'No failures — but review the [warn] warnings above when you can.'
        : 'All checks passed. Your Astryx setup looks healthy.';

  emit(
    section('astryx doctor — diagnosing your setup'),
    records(report.checks, {
      fields: ['status', 'label', 'message', 'fix'],
      labels: {label: 'check'},
      format: {status: statusToken},
    }),
    text(
      `Summary: ${pass} passed, ${warn} warning${warn === 1 ? '' : 's'}, ` +
        `${fail} failure${fail === 1 ? '' : 's'}` +
        (info ? `, ${info} info` : ''),
    ),
    text(closing),
  );
}

/**
 * @param {Array<{code: string, severity: string, message: string}>} issues
 * @returns {import('../formatters/index.mjs').Block[]}
 */
function issueBlocks(issues) {
  if (issues.length === 0) return [];
  return [
    section('Integration issues'),
    records(issues, {
      fields: ['severity', 'code', 'message'],
      format: {severity: statusToken},
    }),
  ];
}

/**
 * @param {import('../../../api/integration/validate-integration.type.mjs').ValidateIntegrationResponse['data']} data
 */
function printIntegrationValidation(data) {
  const {warnings, errors} = summarizeIssues(data.issues);
  emit(
    section(
      `Validating integration: ${integrationLabel(data) ?? '(local package)'}`,
    ),
    ...(data.issues.length > 0
      ? [
          records(data.issues, {
            fields: ['severity', 'code', 'message'],
            format: {severity: statusToken},
          }),
        ]
      : [text('[ok] No integration issues found.')]),
    text(
      `Summary: ${errors} error${errors === 1 ? '' : 's'}, ` +
        `${warnings} warning${warnings === 1 ? '' : 's'}`,
    ),
  );
}

/**
 * @param {import('../../../api/integration/authoring-checks.type.mjs').IntegrationTemplateConflictResponse['data']} data
 */
function printTemplateConflicts(data) {
  const output = [
    section(
      `Checking integration templates: ${integrationLabel(data) ?? '(local package)'}`,
    ),
    ...issueBlocks(data.issues),
  ];
  if (data.conflicts.length === 0) {
    output.push(text('[ok] No template ids conflict with Core.'));
  } else {
    output.push(
      records(data.conflicts, {
        fields: [
          'severity',
          'id',
          'integrationPackage',
          'integrationType',
          'integrationName',
          'message',
          'command',
        ],
        format: {severity: statusToken},
      }),
      text(
        `${data.conflicts.length} Core template conflict(s). ` +
          'Renaming is recommended but optional; keep the package-qualified command if the overlap is intentional.',
      ),
    );
  }
  emit(...output);
}

/**
 * @param {import('../../../api/integration/authoring-checks.type.mjs').IntegrationComponentConflictResponse['data']} data
 */
function printComponentConflicts(data) {
  const replacements = data.replacements ?? [];
  const output = [
    section(
      `Checking integration components: ${integrationLabel(data) ?? '(local package)'}`,
    ),
    ...issueBlocks(data.issues),
  ];
  if (replacements.length > 0) {
    output.push(
      records(
        replacements.map(replacement => ({
          severity: 'info',
          ...replacement,
        })),
        {
          fields: [
            'severity',
            'name',
            'relationship',
            'target',
            'integrationPackage',
            'message',
            'command',
          ],
          format: {severity: statusToken},
        },
      ),
    );
  }
  if (data.conflicts.length === 0 && replacements.length === 0) {
    output.push(text('[ok] No component names overlap with Core.'));
  } else if (data.conflicts.length > 0) {
    output.push(
      records(data.conflicts, {
        fields: [
          'severity',
          'name',
          'relationship',
          'target',
          'integrationPackage',
          'message',
          'command',
        ],
        format: {severity: statusToken},
      }),
    );
  }
  if (data.conflicts.length > 0 || replacements.length > 0) {
    output.push(
      text(
        `${replacements.length} declared replacement(s), ${data.conflicts.length} accidental Core overlap(s). ` +
          'Declared replacements become the unqualified default; accidental overlaps still require --package.',
      ),
    );
  }
  emit(...output);
}

/**
 * @param {import('../../../api/integration/authoring-checks.type.mjs').IntegrationDocConflictResponse['data']} data
 */
function printDocConflicts(data) {
  const output = [
    section(
      `Checking integration docs: ${integrationLabel(data) ?? '(local package)'}`,
    ),
    ...issueBlocks(data.issues),
  ];
  if (data.findings.length === 0) {
    output.push(text('[ok] No doc topics overlap with Core.'));
  } else {
    output.push(
      records(data.findings, {
        fields: ['severity', 'topic', 'relationship', 'coreTopic', 'message'],
        format: {severity: statusToken},
      }),
    );
  }
  emit(...output);
}

/** @param {import('commander').Command} program */
async function runProjectDoctor(program) {
  const report = await runChecks();
  if (program.opts().json) jsonOut({type: 'doctor', data: report});
  else printHuman(report);
  if (report.summary.fail > 0) process.exitCode = 1;
  return NO_RESULT_SET;
}

/**
 * @param {import('commander').Command} program
 * @param {string | undefined} pkg
 */
async function runIntegrationValidation(program, pkg) {
  const result = await validateIntegration(pkg);
  if (program.opts().json) jsonOut(result);
  else if (result.data.name === null) {
    emit(
      text(
        'No astryx.integration.* found next to package.json. ' +
          'To validate an installed integration: astryx doctor integration validate <package>',
      ),
    );
  } else printIntegrationValidation(result.data);
  if (summarizeIssues(result.data.issues).errors > 0) process.exitCode = 1;
  return NO_RESULT_SET;
}

/**
 * @param {import('commander').Command} program
 * @param {string | undefined} pkg
 * @param {'templates' | 'components' | 'docs'} kind
 */
async function runAuthoringCheck(program, pkg, kind) {
  const result =
    kind === 'templates'
      ? await integrationTemplateConflicts(pkg)
      : kind === 'components'
        ? await integrationComponentConflicts(pkg)
        : await integrationDocConflicts(pkg);

  if (program.opts().json) jsonOut(result);
  else if (result.data.name === null) {
    emit(
      text(
        'No astryx.integration.* found next to package.json. ' +
          `To check an installed integration: astryx doctor integration ${kind} <package>`,
      ),
    );
  } else if (kind === 'templates') {
    printTemplateConflicts(
      /** @type {import('../../../api/integration/authoring-checks.type.mjs').IntegrationTemplateConflictResponse['data']} */ (
        result.data
      ),
    );
  } else if (kind === 'components') {
    printComponentConflicts(
      /** @type {import('../../../api/integration/authoring-checks.type.mjs').IntegrationComponentConflictResponse['data']} */ (
        result.data
      ),
    );
  } else {
    printDocConflicts(
      /** @type {import('../../../api/integration/authoring-checks.type.mjs').IntegrationDocConflictResponse['data']} */ (
        result.data
      ),
    );
  }

  const structuralErrors = summarizeIssues(result.data.issues).errors;
  const docErrors =
    result.type === 'integration.doc-conflicts'
      ? result.data.findings.filter(finding => finding.severity === 'error').length
      : 0;
  if (structuralErrors > 0 || docErrors > 0) process.exitCode = 1;
  return NO_RESULT_SET;
}

/**
 * Register `astryx doctor` and its integration-authoring leaves.
 * @param {import('commander').Command} program
 */
export function registerDoctor(program) {
  const doctorCmd = defineCommand(program, doctorCommand, {
    fn: doctorFn,
    action: async () => runProjectDoctor(program),
  });
  doctorCmd.addHelpText(
    'after',
    '\nExit code:\n' +
      '  0  no failures (warnings are allowed) — safe as a CI gate\n' +
      '  1  one or more checks failed\n',
  );

  /** @type {import('commander').Command} */
  let integrationCmd;
  integrationCmd = defineCommand(doctorCmd, doctorIntegrationGroup, {
    action: () => {
      integrationCmd.outputHelp();
      return NO_RESULT_SET;
    },
  });
  defineCommand(integrationCmd, doctorIntegrationValidateCommand, {
    fn: validateIntegrationFn,
    action: async pkg => runIntegrationValidation(program, pkg),
  });
  defineCommand(integrationCmd, doctorIntegrationTemplatesCommand, {
    fn: integrationTemplateConflictsFn,
    action: async pkg => runAuthoringCheck(program, pkg, 'templates'),
  });
  defineCommand(integrationCmd, doctorIntegrationComponentsCommand, {
    fn: integrationComponentConflictsFn,
    action: async pkg => runAuthoringCheck(program, pkg, 'components'),
  });
  defineCommand(integrationCmd, doctorIntegrationDocsCommand, {
    fn: integrationDocConflictsFn,
    action: async pkg => runAuthoringCheck(program, pkg, 'docs'),
  });
}
