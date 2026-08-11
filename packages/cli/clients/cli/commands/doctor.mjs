// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx doctor` command — diagnose a project + environment and report
 * PASS / WARN / FAIL for each check with an actionable fix.
 *
 * Designed to be usable both by humans (clean monochrome checklist) and by
 * AI agents / CI (`--json`). Exit code is the contract: 0 when there are no
 * FAILs (warnings are fine), 1 when any check FAILs — so `astryx doctor` works
 * as a CI gate.
 */

import {runChecks} from '../../../api/doctor/doctor.mjs';
import {jsonOut} from '../../../foundation/response/json.mjs';
import {emit, section, records, text} from '../formatters/index.mjs';
import {defineCommand} from '../lib/define-command.mjs';
import {doc as doctorCommand} from './doctor.doc.mjs';
import {doc as doctorFn} from '../../../api/doctor/doctor.doc.mjs';

/** Status -> ASCII token (plain, matching the rest of the CLI). */
const STATUS = {
  pass: '[ok]',
  warn: '[warn]',
  fail: '[fail]',
  info: '[info]',
};

/** @param {string} status */
function statusToken(status) {
  return STATUS[/** @type {keyof typeof STATUS} */ (status)] ?? status;
}

/**
 * Render the report as a human-readable checklist. Each check is a record whose
 * fields mirror the JSON (status/label/message/fix); the status glyph is an
 * ASCII token so the output is byte-deterministic in any terminal.
 * @param {import('../../../api/doctor/doctor.mjs').DoctorReport} report
 */
function printHuman(report) {
  const {pass, warn, fail, info} = report.summary;
  const closing =
    fail > 0
      ? 'Some checks failed. Address the items marked [fail] above.'
      : warn > 0
        ? 'No failures — but review the [warn] warnings above when you can.'
        : 'All checks passed. Your XDS setup looks healthy.';

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
 * Register the `astryx doctor` command.
 * @param {import('commander').Command} program
 */
export function registerDoctor(program) {
  defineCommand(program, doctorCommand, {
    fn: doctorFn,
    action: async () => {
      const json = program.opts().json || false;
      const report = await runChecks();
      const hasFailure = report.summary.fail > 0;

      if (json) {
        jsonOut({type: 'doctor', data: report});
      } else {
        printHuman(report);
      }

      // Exit code is the contract: any FAIL → exit 1. Warnings never fail.
      if (hasFailure) {
        process.exitCode = 1;
      }
    },
  }).addHelpText(
    'after',
    '\nExit code:\n' +
      '  0  no failures (warnings are allowed) — safe as a CI gate\n' +
      '  1  one or more checks failed\n',
  );
}
