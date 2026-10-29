// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ci-shared-storybook.test.mjs
 * @input .github/workflows/ci.yml
 * @output Pins CI's build shape on a pull request: no Sandbox build (Vercel
 *   builds the Sandbox preview, and nothing downloaded CI's copy), no GitHub
 *   Pages preview URL, and one Storybook build per run that every
 *   Storybook-consuming job downloads instead of building its own.
 * @position Node test over the workflow source
 */

import fs from 'node:fs';
import path from 'node:path';

import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

const ROOT = path.resolve(import.meta.dirname, '../..');
const source = fs.readFileSync(
  path.join(ROOT, '.github/workflows/ci.yml'),
  'utf8',
);
const ci = yaml.parse(source);
const jobs = Object.entries(ci.jobs);

/** A step builds Storybook when its command runs the Storybook build. */
const BUILDS_STORYBOOK =
  /@astryxdesign\/storybook build|build-packages-and-storybook\.mjs/;

/** Whether a step's own condition keeps it off pull request events. */
function dispatchOnly(step) {
  const condition = String(step.if ?? '');
  return (
    /github\.event_name == 'workflow_dispatch'/.test(condition) &&
    !/pull_request/.test(condition)
  );
}

describe('CI builds on a pull request', () => {
  it('builds no Sandbox and publishes no Pages preview', () => {
    expect(ci.jobs['build-sandbox']).toBeUndefined();
    for (const [name, job] of jobs) {
      for (const step of job.steps ?? []) {
        expect(
          String(step.with?.name ?? ''),
          `${name} uploads a Sandbox artifact`,
        ).not.toMatch(/^sandbox-/);
      }
    }
    expect(source).not.toMatch(/github\.io\/\$\{REPO_NAME\}\/pr\//);
    expect(ci.jobs['build-storybook'].outputs).not.toHaveProperty(
      'sandbox_url',
    );
  });

  it('builds Storybook once, in build-storybook, and every consumer downloads it', () => {
    const builders = jobs.flatMap(([name, job]) =>
      (job.steps ?? [])
        .filter(step => BUILDS_STORYBOOK.test(String(step.run ?? '')))
        .filter(step => !dispatchOnly(step))
        .map(() => name),
    );
    expect(builders).toEqual(['build-storybook']);

    const consumers = jobs.filter(([, job]) =>
      (job.steps ?? []).some(step =>
        /^storybook-/.test(String(step.with?.name ?? '')),
      ),
    );
    // build-storybook uploads; the rest download its one artifact.
    expect(consumers.length).toBeGreaterThan(1);
    for (const [name, job] of consumers) {
      if (name === 'build-storybook') continue;
      expect(job.needs, `${name} needs build-storybook`).toContain(
        'build-storybook',
      );
      for (const step of job.steps.filter(s =>
        /^storybook-/.test(String(s.with?.name ?? '')),
      )) {
        expect(step.uses, `${name} downloads Storybook`).toMatch(
          /^actions\/download-artifact@/,
        );
        expect(step.with.name).toBe(
          'storybook-${{ needs.build-storybook.outputs.short_hash }}',
        );
      }
    }
  });

  it('joins build-storybook and typecheck into the required build context', () => {
    expect(ci.jobs.build.needs).toEqual(['build-storybook', 'typecheck']);
    const run = ci.jobs.build.steps.map(step => step.run ?? '').join('\n');
    expect(run).toContain(
      '[ "${{ needs.build-storybook.result }}" = "success" ] || exit 1',
    );
    expect(run).toContain(
      '[ "${{ needs.typecheck.result }}" = "success" ] || exit 1',
    );
  });
});
