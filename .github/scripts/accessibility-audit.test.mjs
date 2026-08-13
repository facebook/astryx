// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file accessibility-audit.test.mjs
 * Pins the --components contract of the a11y audit CLI. The pr-a11y job
 * derives its component list from the PR analysis and passes it as
 * `--components "$COMPONENTS"`; when a core/src change maps to no component
 * (a shared test file, docs-types.ts, …) that list is EMPTY, and the audit
 * must skip and pass rather than fan out into a full-repo audit that fails
 * on violations the PR never touched. An ABSENT --components flag keeps the
 * a11y-weekly contract: audit all stories.
 */

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it, expect} from 'vitest';

const SCRIPTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(SCRIPTS_DIR, 'accessibility-audit.js');
const BASELINE = path.resolve(SCRIPTS_DIR, '..', 'a11y-baseline.json');

/** Run the audit CLI in an empty temp cwd; return {stdout, report}. */
function runAudit(args) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'a11y-audit-'));
  try {
    const stdout = execFileSync(
      process.execPath,
      [SCRIPT, '--output', 'report.json', ...args],
      {cwd: dir, encoding: 'utf8'},
    );
    const report = JSON.parse(
      fs.readFileSync(path.join(dir, 'report.json'), 'utf8'),
    );
    return {stdout, report};
  } finally {
    fs.rmSync(dir, {recursive: true, force: true});
  }
}

describe('accessibility-audit --components contract', () => {
  it('audits nothing and passes when --components is explicitly empty', () => {
    // The exact pr-a11y invocation shape for a PR whose analysis found no
    // new or modified components. execFileSync throws on a non-zero exit,
    // so reaching the assertions proves the gate passed.
    const {stdout, report} = runAudit([
      '--components',
      '',
      '--baseline',
      BASELINE,
      '--fail-on-new',
    ]);
    expect(stdout).toContain('No components to audit');
    expect(report.components).toEqual({});
    expect(report.summary.totalViolations).toBe(0);
  });

  it('still audits all stories when the flag is absent (a11y-weekly)', () => {
    // No storybook build exists in the temp cwd, so the all-stories path
    // reports the missing build instead of skipping — absent ≠ empty.
    const {stdout, report} = runAudit([]);
    expect(stdout).not.toContain('No components to audit');
    expect(stdout).toContain('all affected');
    expect(report.error).toBe('Storybook not built');
  });

  it('proceeds to audit when --components names components', () => {
    const {stdout, report} = runAudit(['--components', 'Text,Heading']);
    expect(stdout).not.toContain('No components to audit');
    expect(stdout).toContain('Text, Heading');
    expect(report.error).toBe('Storybook not built');
  });
});
