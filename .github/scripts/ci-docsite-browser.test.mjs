// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ci-docsite-browser.test.mjs
 * @input The docsite jobs in the PR CI workflow
 * @output Fail-closed coverage for AST-030's existing docsite-test owner
 * @position Workflow contract: browser failures cannot leave docsite-test green.
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

const root = path.resolve(import.meta.dirname, '../..');
const {jobs} = yaml.parse(
  fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8'),
);
const owner = jobs['docsite-test'];
const browser = jobs['docsite-browser'];
const guard = owner.steps.find(
  step => step.name === 'Require successful docsite browser contract',
);
const ACTIVE =
  "needs.check-scope.outputs.spec_only != 'true' && needs.check-scope.outputs.tooling_only != 'true'";

describe('docsite browser required-check projection', () => {
  it('joins the existing required context and uses the same surface route', () => {
    expect(owner.needs).toEqual(['check-scope', 'docsite-browser']);
    expect(owner.if).toBe(
      "${{ github.event_name != 'workflow_dispatch' && always() && !cancelled() }}",
    );
    expect(browser.needs).toEqual(['check-scope']);
    expect(browser.if).toBe(
      `github.event_name != 'workflow_dispatch' && ${ACTIVE}`,
    );
    expect(guard.if).toBe(ACTIVE);
    expect(
      owner.steps.find(step => step.name === 'Generate and test docsite data')
        .if,
    ).toBe(ACTIVE);
    expect(guard.env).toEqual({
      DOCSITE_BROWSER_RESULT: '${{ needs.docsite-browser.result }}',
    });
    expect(owner['continue-on-error']).toBeUndefined();
    expect(browser['continue-on-error']).toBeUndefined();
    expect(guard['continue-on-error']).toBeUndefined();
    const run = browser.steps.find(
      step => step.name === 'Run docsite browser contracts',
    );
    expect(run.run).toBe('pnpm test:docsite-browser');
    expect(run['continue-on-error']).toBeUndefined();
  });

  it.each(['success', 'failure', 'cancelled', 'skipped', ''])(
    'fails closed for browser result %j',
    result => {
      const check = spawnSync('sh', ['-e', '-c', guard.run], {
        env: {...process.env, DOCSITE_BROWSER_RESULT: result},
      });
      expect(check.status === 0).toBe(result === 'success');
    },
  );
});
