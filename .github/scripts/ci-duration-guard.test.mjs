// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PR CI stays within its 15-minute budget.
 *
 * Every job that can run on a pull request carries a `timeout-minutes` of at
 * most 15 for pull-request events, so a lane that grows past the budget fails
 * where it grew instead of silently stretching every contributor's wait.
 * Release and maintenance dispatches keep longer limits through an expression.
 * The `test` join reports each job's run time and warns past 12 minutes.
 */

import fs from 'node:fs';
import path from 'node:path';

import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

const root = path.resolve(import.meta.dirname, '../..');
const ci = yaml.parse(
  fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8'),
);

const BUDGET = 15;
// macOS Swift builds run on another runner pool with their own variance; the
// job only does work when native Swift changes.
const EXEMPT = new Set(['test-native-swift']);
// Jobs that finish in seconds (scope, joins) need no limit of their own.
const JOINS = new Set([
  'check-scope',
  'check-components',
  'native-swift-scope',
  'release-bump',
  'release-merge-back',
  'docsite-test',
  'test',
  'build',
  'pr-rtl',
  'pr-rtl-merge',
]);

/** The limit a pull-request run gets from a job's `timeout-minutes`. */
function pullRequestLimit(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return undefined;
  const dispatch =
    /^\$\{\{ github\.event_name == 'workflow_dispatch' && (\d+) \|\| (\d+) \}\}$/.exec(
      value,
    );
  return dispatch ? Number(dispatch[2]) : undefined;
}

// A job whose condition requires a dispatch never runs on a pull request.
const runsOnPullRequests = job => {
  const condition = String(job.if ?? '');
  const dispatchOnly =
    condition.includes("github.event_name == 'workflow_dispatch' &&") &&
    !condition.includes('pull_request') &&
    !condition.includes("!= 'workflow_dispatch'");
  return !dispatchOnly;
};

describe('PR CI duration budget', () => {
  const jobs = Object.entries(ci.jobs).filter(
    ([id, job]) => runsOnPullRequests(job) && !EXEMPT.has(id) && !JOINS.has(id),
  );

  it('finds the pull-request work jobs', () => {
    expect(jobs.map(([id]) => id)).toEqual(
      expect.arrayContaining(['test-ui', 'test-node', 'pr-a11y', 'pr-visual']),
    );
  });

  it.each(jobs.map(([id, job]) => [id, job]))(
    '%s stops within the 15-minute budget on a pull request',
    (id, job) => {
      const limit = pullRequestLimit(job['timeout-minutes']);
      expect(limit, `${id} has no pull-request timeout`).toBeDefined();
      expect(limit).toBeLessThanOrEqual(BUDGET);
    },
  );

  it('reports job durations from the test join without gating it', () => {
    const report = ci.jobs.test.steps.find(
      step => step.name === 'Report job durations',
    );
    expect(report.if).toBe('always()');
    expect(report['continue-on-error']).toBe(true);
    expect(ci.jobs.test.permissions.actions).toBe('read');
    expect(report.with.script).toContain('row.minutes > 12');
  });
});
