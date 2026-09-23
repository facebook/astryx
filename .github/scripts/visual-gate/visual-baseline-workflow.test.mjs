// Copyright (c) Meta Platforms, Inc. and affiliates.

// Exercise the dispatch shell, including the interval that used to reject a
// browser-refresh verdict before the publisher could validate its capture.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {parse} from 'yaml';

const workflow = parse(
  fs.readFileSync(
    new URL('../../workflows/visual-baseline.yml', import.meta.url),
    'utf8',
  ),
);
const steps = workflow.jobs.promote.steps;
let root;
let env;
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'visual-baseline-workflow-'));
  const bin = path.join(root, 'bin');
  fs.mkdirSync(bin);
  fs.writeFileSync(
    path.join(bin, 'gh'),
    '#!/bin/sh\nprintf "%s" "$RUN_JSON"\n',
    {mode: 0o755},
  );
  // Publication is covered against a local Git remote in the publisher tests.
  fs.writeFileSync(path.join(bin, 'node'), '#!/bin/sh\nexit 0\n', {
    mode: 0o755,
  });
  env = {
    ...process.env,
    PATH: `${bin}:${process.env.PATH}`,
    RUN_ID: '123',
    GITHUB_REPOSITORY: 'facebook/astryx',
  };
});
afterEach(() => fs.rmSync(root, {recursive: true, force: true}));

function run(script) {
  return spawnSync('bash', ['-e', '-c', script], {
    cwd: root,
    env,
    encoding: 'utf8',
  });
}

describe('Visual Baseline dispatch', () => {
  it.each([
    ['completed release', {}, true],
    ['failed terminal release', {conclusion: 'failure'}, true],
    ['wrong workflow', {path: '.github/workflows/ci.yml'}, false],
    ['wrong branch', {head_branch: 'feature'}, false],
    ['unfinished run', {status: 'in_progress'}, false],
    ['missing workflow', {path: null}, false],
  ])('validates the source run: %s', (_label, overrides, allowed) => {
    env.RUN_JSON = JSON.stringify({
      path: '.github/workflows/release-gate.yml',
      head_branch: 'main',
      status: 'completed',
      ...overrides,
    });
    const result = run(
      steps.find(step => step.name === 'Verify the source run').run,
    );
    expect(result.status === 0, result.stderr).toBe(allowed);
  });

  it('lets the publisher validate a failed browser-refresh capture inside its publication turn', () => {
    fs.mkdirSync(path.join(root, '.visual-run'));
    fs.writeFileSync(
      path.join(root, '.visual-run/verdict.json'),
      JSON.stringify({status: 'failed'}),
    );
    const download = steps.findIndex(
      step => step.name === 'Download the capture being promoted',
    );
    const promote = steps.findIndex(
      step => step.name === 'Promote and publish the baseline',
    );
    expect(download).toBeGreaterThan(-1);
    expect(promote).toBeGreaterThan(download);
    const beforePromotion = steps
      .slice(download + 1, promote)
      .map(step => step.run)
      .filter(Boolean);
    expect(beforePromotion.join('\n')).toContain(
      'gh-pages-publisher.mjs wait --scope visual-gate/baseline',
    );
    const result = run(beforePromotion.join('\n'));
    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(steps[promote].run).toContain(
      'gh-pages-publisher.mjs visual-baseline-manual',
    );
    expect(
      steps.find(step => step.name === 'Release the baseline publication turn')
        .if,
    ).toBe('always()');
  });
});
