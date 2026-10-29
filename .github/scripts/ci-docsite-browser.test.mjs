// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ci-docsite-browser.test.mjs
 * @input The docsite-test job in the PR CI workflow
 * @output Fail-closed coverage for AST-030's docsite-test owner: one job
 *   builds the docsite once, and a data-test or browser-contract failure
 *   cannot leave the required context green.
 * @position Workflow contract over .github/workflows/ci.yml
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

const root = path.resolve(import.meta.dirname, '../..');
const {jobs} = yaml.parse(
  fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8'),
);
const owner = jobs['docsite-test'];
const step = name => owner.steps.find(candidate => candidate.name === name);
const ACTIVE =
  "steps.scope.outputs.spec_only != 'true' && steps.scope.outputs.tooling_only != 'true'";

describe('docsite-test', () => {
  it('is one job that builds the docsite once and runs both suites on it', () => {
    expect(jobs['docsite-data']).toBeUndefined();
    expect(jobs['docsite-browser']).toBeUndefined();
    expect(owner.needs).toBeUndefined();
    expect(owner['continue-on-error']).toBeUndefined();
    expect(owner.steps.findIndex(s => s.id === 'scope')).toBe(1);

    const builds = owner.steps.filter(s =>
      /pnpm -F @astryxdesign\/docsite build/.test(s.run ?? ''),
    );
    expect(builds).toHaveLength(1);
    for (const name of [
      'Install Playwright',
      'Build docsite workspace dependencies',
      'Build the docsite',
      'test-docsite (start the data tests)',
      'test-docsite-e2e (browser contracts)',
    ]) {
      expect(step(name).if, name).toBe(ACTIVE);
      expect(step(name)['continue-on-error'], name).toBeUndefined();
    }
    expect(step('test-docsite-e2e (browser contracts)').run).toBe(
      'pnpm test:docsite-browser',
    );
    // The result step reports whenever the data tests started, even after a
    // browser-contract failure.
    expect(step('test-docsite (data test results)').if).toBe(
      "${{ !cancelled() && steps.data.outcome == 'success' }}",
    );
  });

  it.each([
    [0, true],
    [1, false],
  ])('the data-test result step passes only on exit %i', (code, passes) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'docsite-data-'));
    fs.writeFileSync(path.join(dir, 'docsite-data.log'), 'log\n');
    fs.writeFileSync(path.join(dir, 'docsite-data.exit'), `${code}\n`);
    const result = spawnSync(
      'bash',
      ['-e', '-c', step('test-docsite (data test results)').run],
      {cwd: dir},
    );
    fs.rmSync(dir, {recursive: true, force: true});
    expect(result.status === 0).toBe(passes);
  });

  it('uploads the explicit browser output directory and fails if evidence is missing', () => {
    const configPath = path.join(root, 'apps/docsite/playwright.config.ts');
    const config = fs.readFileSync(configPath, 'utf8');
    const outputDir = config.match(/outputDir:\s*'([^']+)'/)?.[1];
    expect(outputDir).toBe('../../test-results/docsite');
    const upload = step('Upload docsite browser evidence');
    expect(upload.if).toBe(`always() && ${ACTIVE}`);
    expect(upload.with['if-no-files-found']).toBe('error');
    expect(path.resolve(root, upload.with.path)).toBe(
      path.resolve(path.dirname(configPath), outputDir),
    );
  });
});
