// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Contract: every workflow job runs on a free GitHub-hosted runner.
 * @input Every workflow under .github/workflows
 * @output Each job's runner labels against the free standard set
 * @position Node contract for the repository's Actions spend
 *
 * This repository is public, so GitHub's standard hosted runners cost nothing:
 * `ubuntu-latest` has the same four vCPUs and 16 GB as the paid
 * `4-core-ubuntu`, and `ubuntu-24.04-arm` has four vCPUs. Paid larger-runner
 * labels billed every minute and exhausted the yearly Actions budget, so a job
 * may use one only with a measured need recorded in PAID_ALLOWED below.
 */

import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

const dir = path.resolve(import.meta.dirname, '../workflows');
const workflows = fs
  .readdirSync(dir)
  .filter(name => name.endsWith('.yml') || name.endsWith('.yaml'))
  .map(name => [
    name,
    yaml.parse(fs.readFileSync(path.join(dir, name), 'utf8')),
  ]);

/** Standard hosted runners: free on a public repository. */
const FREE = new Set([
  'ubuntu-latest',
  'ubuntu-slim',
  'ubuntu-24.04',
  'ubuntu-22.04',
  'ubuntu-24.04-arm',
  'ubuntu-22.04-arm',
  'macos-latest',
  'macos-15',
  'macos-14',
  'windows-latest',
]);

/**
 * `workflow/job` → why that job needs a paid runner (a measured wall-time or
 * memory need). Empty: no job has one.
 */
const PAID_ALLOWED = {};

/** Every runner label a job can resolve to, matrix values included. */
function labelsOf(job) {
  const runsOn = job['runs-on'];
  if (runsOn == null) return [];
  const values = [runsOn].flat().map(String);
  const labels = [];
  for (const value of values) {
    const matrix = /\$\{\{\s*matrix\.([a-zA-Z0-9_-]+)\s*\}\}/.exec(value);
    if (matrix) {
      labels.push(
        ...[job.strategy?.matrix?.[matrix[1]] ?? []].flat().map(String),
      );
    } else if (value.includes('${{')) {
      labels.push(
        ...[...value.matchAll(/'([^']+)'/g)]
          .map(m => m[1])
          .filter(l => l !== 'true' && l !== 'false'),
      );
    } else {
      labels.push(value);
    }
  }
  return labels;
}

describe('runner labels', () => {
  it('finds runner labels to check', () => {
    const all = workflows.flatMap(([, wf]) =>
      Object.values(wf.jobs ?? {}).flatMap(labelsOf),
    );
    expect(all.length).toBeGreaterThan(30);
  });

  it.each(workflows)(
    '%s runs every job on a free standard runner',
    (name, wf) => {
      for (const [id, job] of Object.entries(wf.jobs ?? {})) {
        if (job.uses) continue; // a reusable workflow call names no runner
        for (const label of labelsOf(job)) {
          const key = `${name}/${id}`;
          if (key in PAID_ALLOWED) continue;
          expect(FREE.has(label), `${key} runs on ${label}`).toBe(true);
        }
      }
    },
  );
});
