// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `xds doctor` command — diagnose a project + environment and report
 * PASS / WARN / FAIL for each check with an actionable fix.
 *
 * Designed to be usable both by humans (clean monochrome checklist) and by
 * AI agents / CI (`--json`). Exit code is the contract: 0 when there are no
 * FAILs (warnings are fine), 1 when any check FAILs — so `xds doctor` works
 * as a CI gate.
 */

import {runChecks} from '../api/doctor.mjs';
import {jsonOut, humanLog} from '../lib/json.mjs';

/** Status → human glyph (monochrome, matching the rest of the CLI). */
const GLYPH = {
  pass: '\u2713', // ✓
  warn: '\u26a0', // ⚠
  fail: '\u2717', // ✗
  info: '\u2139', // ℹ
};

/**
 * Render the report as a human-readable checklist.
 * @param {import('../api/doctor.mjs').DoctorReport} report
 */
function printHuman(report) {
  humanLog('xds doctor — diagnosing your setup\n');
  for (const check of report.checks) {
    const glyph = GLYPH[check.status] ?? '\u00b7';
    humanLog(`  ${glyph} ${check.label}`);
    humanLog(`      ${check.message}`);
    if (check.fix) {
      humanLog(`      \u2192 fix: ${check.fix}`);
    }
  }

  const {pass, warn, fail, info} = report.summary;
  humanLog('');
  humanLog(
    `Summary: ${pass} passed, ${warn} warning${warn === 1 ? '' : 's'}, ` +
      `${fail} failure${fail === 1 ? '' : 's'}` +
      (info ? `, ${info} info` : ''),
  );
  if (fail > 0) {
    humanLog('\nSome checks failed. Address the items marked \u2717 above.');
  } else if (warn > 0) {
    humanLog('\nNo failures — but review the \u26a0 warnings above when you can.');
  } else {
    humanLog('\nAll checks passed. Your XDS setup looks healthy.');
  }
}

/**
 * Register the `xds doctor` command.
 * @param {import('commander').Command} program
 */
export function registerDoctor(program) {
  program
    .command('doctor')
    .description('Diagnose your XDS setup and report problems with fixes')
    .addHelpText(
      'after',
      '\nExit code:\n' +
        '  0  no failures (warnings are allowed) — safe as a CI gate\n' +
        '  1  one or more checks failed\n',
    )
    .action(async () => {
      const json = program.opts().json || false;
      const report = await runChecks();
      const hasFailure = report.summary.fail > 0;

      if (json) {
        jsonOut('doctor', report);
      } else {
        printHuman(report);
      }

      // Exit code is the contract: any FAIL → exit 1. Warnings never fail.
      if (hasFailure) {
        process.exitCode = 1;
      }
    });
}
