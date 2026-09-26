// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for weekly RTL coverage-gap reporting.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {afterEach, describe, expect, it} from 'vitest';

const SCRIPT = path.resolve('.github/scripts/weekly-rtl-summary.js');
const dirs = [];

afterEach(() => {
  for (const dir of dirs.splice(0)) {
    fs.rmSync(dir, {recursive: true, force: true});
  }
});

function runSummary(report) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtl-weekly-summary-'));
  dirs.push(dir);
  const reportPath = path.join(dir, 'report.json');
  const summaryPath = path.join(dir, 'summary.md');
  const outputPath = path.join(dir, 'output.txt');
  fs.writeFileSync(reportPath, JSON.stringify(report));
  const result = spawnSync(
    process.execPath,
    [
      SCRIPT,
      '--report',
      reportPath,
      '--audit-outcome',
      'success',
      '--summary-output',
      summaryPath,
      '--github-output',
      outputPath,
    ],
    {encoding: 'utf8'},
  );
  return {
    ...result,
    summary: fs.readFileSync(summaryPath, 'utf8'),
    output: fs.readFileSync(outputPath, 'utf8'),
  };
}

function baseReport(coverage) {
  return {
    generatedAt: '2026-08-23T00:00:00.000Z',
    autoDiscovery: {total: 1, pass: 0, fail: 0, na: 1, results: []},
    positionalMirror: {total: 1, pass: 0, fail: 0, na: 1, results: []},
    directionalDecorations: {total: 1, pass: 0, fail: 0, na: 1, results: []},
    curated: {results: []},
    coverage,
  };
}

describe('weekly RTL coverage reporting', () => {
  it('treats an unexplained all-N/A component as a finding', () => {
    const result = runSummary(
      baseReport({
        enforced: true,
        total: 1,
        measured: 0,
        verifiedNa: 0,
        gaps: 1,
        staleVerifiedNa: 0,
        results: [
          {
            component: 'core/Button',
            status: 'coverage-gap',
            note: 'all dimensions are N-A and no verified-N/A reason is recorded',
          },
        ],
      }),
    );
    expect(result.status).toBe(0);
    expect(result.output).toContain('status=findings');
    expect(result.output).toContain('coverage_gaps=1');
    expect(result.summary).toContain('RTL coverage gaps');
    expect(result.summary).toContain('| core/Button |');
    expect(result.summary).not.toContain('RTL-ready across the full library');
  });

  it('allows a component with a recorded verified-N/A reason', () => {
    const result = runSummary(
      baseReport({
        enforced: true,
        total: 1,
        measured: 0,
        verifiedNa: 1,
        gaps: 0,
        staleVerifiedNa: 0,
        results: [
          {
            component: 'core/Text',
            status: 'verified-na',
            reason: 'No direction-sensitive visual or behavior.',
          },
        ],
      }),
    );
    expect(result.status).toBe(0);
    expect(result.output).toContain('status=clean');
    expect(result.output).toContain('verified_na=1');
    expect(result.summary).toContain('0 coverage gap');
  });
});
