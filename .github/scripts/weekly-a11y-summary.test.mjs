// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {afterEach, describe, expect, it} from 'vitest';

const SCRIPT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'weekly-a11y-summary.js',
);
const roots = [];

afterEach(() => {
  for (const root of roots.splice(0))
    fs.rmSync(root, {recursive: true, force: true});
});

function tempRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'weekly-a11y-summary-'));
  roots.push(root);
  return root;
}

function writeJSON(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function completeReport(overrides = {}) {
  return {
    components: {
      Button: {
        storiesAudited: 1,
        violations: [],
        storyDetails: [
          {id: 'core-button--default', story: 'Default', violations: []},
        ],
      },
      ...overrides.components,
    },
    summary: {
      scope: 'full',
      indexStatus: 'parsed',
      totalViolations: 0,
      componentsAudited: 1,
      expectedStories: 1,
      auditedStories: 1,
      failedStories: 0,
      resultStories: 1,
      uniqueResultStories: 1,
      scanStatus: 'complete',
      ...overrides.summary,
    },
  };
}

function summarize(report) {
  const root = tempRoot();
  writeJSON(path.join(root, 'report.json'), report);
  const output = path.join(root, 'outputs.txt');
  execFileSync(process.execPath, [
    SCRIPT,
    '--report',
    path.join(root, 'report.json'),
    '--audit-outcome',
    'success',
    '--summary-output',
    path.join(root, 'summary.md'),
    '--github-output',
    output,
  ]);
  return {
    output: fs.readFileSync(output, 'utf8'),
    summary: fs.readFileSync(path.join(root, 'summary.md'), 'utf8'),
  };
}

describe('weekly a11y summary completeness', () => {
  it('does not call a partial zero-violation report clean', () => {
    const {output, summary} = summarize(
      completeReport({
        summary: {
          expectedStories: 2,
          auditedStories: 1,
          failedStories: 1,
          resultStories: 1,
          scanStatus: 'incomplete',
        },
        components: {
          Button: {
            storiesAudited: 1,
            storyDetails: [
              {
                id: 'core-button--default',
                story: 'Default',
                error: 'timeout',
                violations: [],
              },
            ],
          },
        },
      }),
    );
    expect(output).toContain('status=crashed');
    expect(summary).toContain('did not complete');
  });

  it('does not call missing, malformed, or empty story indexes clean', () => {
    for (const report of [
      completeReport({summary: {indexStatus: 'missing'}}),
      completeReport({summary: {indexStatus: 'malformed'}}),
      completeReport({
        summary: {
          expectedStories: 0,
          auditedStories: 0,
          resultStories: 0,
          uniqueResultStories: 0,
        },
        components: {},
      }),
    ]) {
      expect(summarize(report).output).toContain('status=crashed');
    }
  });

  it('does not call duplicate or mismatched story results clean', () => {
    expect(
      summarize(
        completeReport({
          summary: {
            expectedStories: 2,
            auditedStories: 2,
            resultStories: 2,
            uniqueResultStories: 1,
          },
          components: {
            Button: {
              storiesAudited: 2,
              storyDetails: [
                {id: 'core-button--default', story: 'Default', violations: []},
                {
                  id: 'core-button--default',
                  story: 'Default duplicate',
                  violations: [],
                },
              ],
            },
          },
        }),
      ).output,
    ).toContain('status=crashed');

    expect(
      summarize(
        completeReport({
          summary: {
            expectedStories: 2,
            auditedStories: 2,
            resultStories: 2,
            uniqueResultStories: 2,
          },
        }),
      ).output,
    ).toContain('status=crashed');
  });

  it('calls a complete zero-violation report clean', () => {
    const {output, summary} = summarize(completeReport());
    expect(output).toContain('status=clean');
    expect(summary).toContain('No accessibility violations detected');
  });
});
