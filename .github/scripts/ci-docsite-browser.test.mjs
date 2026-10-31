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
import {PR_REPORT_GATE, gated, ungated} from './ci-pr-gate.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const {jobs} = yaml.parse(
  fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8'),
);
const owner = jobs['docsite-test'];
const browser = jobs['docsite-browser'];
const data = jobs['docsite-data'];
const guard = owner.steps.find(
  step => step.name === 'Require successful docsite browser contract',
);
const dataGuard = owner.steps.find(
  step => step.name === 'Require successful docsite data generation and tests',
);
const ACTIVE =
  "steps.scope.outputs.spec_only != 'true' && steps.scope.outputs.tooling_only != 'true'";

describe('docsite browser required-check projection', () => {
  it('joins the existing required context and uses the same surface route', () => {
    expect(owner.needs).toEqual(['docsite-browser', 'docsite-data']);
    expect(owner.if).toBe(
      gated(
        "${{ github.event_name != 'workflow_dispatch' && !startsWith(github.base_ref, 'release/v') && always() && !cancelled() }}",
        PR_REPORT_GATE,
      ),
    );
    // Each owner decides its own scope and gates every later step on it.
    for (const job of [browser, data]) {
      expect(job.needs).toBeUndefined();
      expect(ungated(job.if)).toBe("github.event_name != 'workflow_dispatch'");
      const scopeAt = job.steps.findIndex(step => step.id === 'scope');
      expect(scopeAt).toBe(1);
      // Exact conditions: an extra skip on any step (for example a
      // docsite-only one) fails here. Only the evidence upload also runs
      // after a failed step.
      for (const step of job.steps.slice(scopeAt + 1)) {
        const expected = step.name?.startsWith('Upload ')
          ? `always() && ${ACTIVE}`
          : ACTIVE;
        expect(step.if, step.name ?? step.uses).toBe(expected);
      }
    }
    expect(guard.if).toBe(ACTIVE);
    expect(dataGuard.if).toBe(ACTIVE);
    expect(
      data.steps.find(step => step.name === 'Generate and test docsite data')
        .if,
    ).toBe(ACTIVE);
    expect(guard.env).toEqual({
      DOCSITE_BROWSER_RESULT: '${{ needs.docsite-browser.result }}',
    });
    expect(dataGuard.env).toEqual({
      DOCSITE_DATA_RESULT: '${{ needs.docsite-data.result }}',
    });
    expect(owner['continue-on-error']).toBeUndefined();
    expect(browser['continue-on-error']).toBeUndefined();
    expect(data['continue-on-error']).toBeUndefined();
    expect(guard['continue-on-error']).toBeUndefined();
    expect(dataGuard['continue-on-error']).toBeUndefined();
    const run = browser.steps.find(
      step => step.name === 'Run docsite browser contracts',
    );
    expect(run.run).toBe('pnpm test:docsite-browser');
    expect(run['continue-on-error']).toBeUndefined();
  });

  it('uploads the explicit browser output directory and fails if evidence is missing', () => {
    const configPath = path.join(root, 'apps/docsite/playwright.config.ts');
    const config = fs.readFileSync(configPath, 'utf8');
    const outputDir = config.match(/outputDir:\s*'([^']+)'/)?.[1];
    expect(outputDir).toBe('../../test-results/docsite');
    const upload = browser.steps.find(
      step => step.name === 'Upload docsite browser evidence',
    );
    expect(upload.if).toBe(`always() && ${ACTIVE}`);
    expect(upload.with['if-no-files-found']).toBe('error');
    expect(path.resolve(root, upload.with.path)).toBe(
      path.resolve(path.dirname(configPath), outputDir),
    );
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

  it.each(['success', 'failure', 'cancelled', 'skipped', ''])(
    'fails closed for docsite data result %j',
    result => {
      const check = spawnSync('sh', ['-e', '-c', dataGuard.run], {
        env: {...process.env, DOCSITE_DATA_RESULT: result},
      });
      expect(check.status === 0).toBe(result === 'success');
    },
  );
});
