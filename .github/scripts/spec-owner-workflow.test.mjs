// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {describe, expect, it} from 'vitest';

const root = path.resolve(import.meta.dirname, '../..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

describe('spec-only workflow contract', () => {
  it('keeps classification in one tested helper', () => {
    for (const workflow of [
      '.github/workflows/ci.yml',
      '.github/workflows/lint.yml',
      '.github/workflows/pr-comment.yml',
    ]) {
      expect(read(workflow), workflow).toContain(
        '.github/scripts/change-scope.cjs',
      );
    }
    expect(read('.github/scripts/spec-owner-reconcile.cjs')).toContain(
      "require('./change-scope.cjs')",
    );
  });

  it('packages every dependency for trusted-base isolated classification', () => {
    for (const workflow of [
      '.github/workflows/ci.yml',
      '.github/workflows/lint.yml',
    ]) {
      const source = read(workflow);
      expect(source, workflow).toContain(
        'git show "origin/${{ github.base_ref }}:.github/scripts/change-scope.cjs"',
      );
      expect(source, workflow).toContain(
        'git show "origin/${{ github.base_ref }}:.github/scripts/knowledge-paths.cjs"',
      );
      expect(source, workflow).toContain(
        'CLASSIFIER_DIR="$RUNNER_TEMP/change-scope"',
      );
    }

    const isolated = fs.mkdtempSync(
      path.join(os.tmpdir(), 'astryx-change-scope-'),
    );
    try {
      for (const file of ['change-scope.cjs', 'knowledge-paths.cjs']) {
        fs.copyFileSync(
          path.join(root, '.github/scripts', file),
          path.join(isolated, file),
        );
      }
      const output = path.join(isolated, 'github-output');
      const result = spawnSync(
        process.execPath,
        [path.join(isolated, 'change-scope.cjs'), '--github-output'],
        {
          encoding: 'utf8',
          env: {...process.env, GITHUB_OUTPUT: output},
          input:
            'A\tpackages/core/src/Table/plugins/rowStatus/useTableRowStatus.spec.md\n',
        },
      );
      expect(result.status, result.stderr).toBe(0);
      expect(fs.readFileSync(output, 'utf8')).toBe(
        'spec_only=true\ndocsite_only=false\n',
      );

      fs.rmSync(path.join(isolated, 'knowledge-paths.cjs'));
      const missingDependency = spawnSync(
        process.execPath,
        [path.join(isolated, 'change-scope.cjs')],
        {
          encoding: 'utf8',
          input: 'A\tpackages/core/src/Button/Button.spec.md\n',
        },
      );
      expect(missingDependency.status).not.toBe(0);
      expect(missingDependency.stderr).toContain('knowledge-paths.cjs');
    } finally {
      fs.rmSync(isolated, {recursive: true, force: true});
    }
  });

  it('keeps required CI names green while skipping heavy work', () => {
    const ci = read('.github/workflows/ci.yml');
    expect(ci).toContain(
      'git show "origin/${{ github.base_ref }}:.github/scripts/change-scope.cjs"',
    );
    expect(ci).toContain('spec_only: ${{ steps.scope.outputs.spec_only }}');
    expect(ci).toContain('node scripts/check-knowledge.mjs');
    expect(ci).toContain("needs.check-scope.outputs.spec_only != 'true'");
    expect(ci).toContain('build:');
    expect(ci).toContain('docsite-test:');
    expect(ci).toContain('test:');

    const lint = read('.github/workflows/lint.yml');
    expect(lint).toContain("steps.scope.outputs.spec_only == 'true'");
    expect(lint).toContain('node scripts/check-knowledge.mjs');
  });

  it('sets up dependencies before spec validation and skips heavy spec-only work', () => {
    const ci = read('.github/workflows/ci.yml');
    const jobStart = ci.indexOf('  docsite-test:');
    const jobEnd = ci.indexOf('\n  check-components:', jobStart);
    const docsiteJob = ci.slice(jobStart, jobEnd);

    const checkout = docsiteJob.indexOf('- uses: actions/checkout@v7');
    const setup = docsiteJob.indexOf('- uses: ./.github/actions/setup');
    const validate = docsiteJob.indexOf('- name: Validate spec records');
    const build = docsiteJob.indexOf('- name: Build core package');
    const generate = docsiteJob.indexOf(
      '- name: Generate and test docsite data',
    );

    expect(checkout).toBeGreaterThanOrEqual(0);
    expect(setup).toBeGreaterThan(checkout);
    expect(validate).toBeGreaterThan(setup);
    expect(build).toBeGreaterThan(validate);
    expect(generate).toBeGreaterThan(build);
    expect(docsiteJob.slice(setup, validate)).not.toContain('\n        if:');
    expect(docsiteJob.slice(build, generate)).toContain(
      "if: needs.check-scope.outputs.spec_only != 'true'",
    );
    expect(docsiteJob.slice(generate)).toContain(
      "if: needs.check-scope.outputs.spec_only != 'true'",
    );
  });

  it('fails closed when file APIs are truncated or scope classification fails', () => {
    const ci = read('.github/workflows/ci.yml');
    expect(ci).toContain('if: ${{ always() && !cancelled() }}');
    expect(ci).toContain("if: needs.check-scope.result != 'success'");

    const reviewSignal = read('.github/workflows/review-signal.yml');
    expect(reviewSignal).toContain('allFiles.length !== pr.changed_files');

    const prComment = read('.github/workflows/pr-comment.yml');
    expect(prComment).toContain('files.length !== pr.changed_files');
  });

  it('runs the tested exact-head reconciler from the trusted default branch', () => {
    const workflow = read('.github/workflows/spec-owner-gate.yml');
    const reconciler = read('.github/scripts/spec-owner-reconcile.cjs');
    expect(workflow).toContain(
      'ref: ${{ github.event.repository.default_branch }}',
    );
    expect(workflow).toContain(
      'reconcileSpecOwnerGate({github, context, core})',
    );
    expect(workflow).not.toContain('concurrency:');
    const reconcileCondition = workflow
      .slice(
        workflow.indexOf('    if: >-', workflow.indexOf('  reconcile:')),
        workflow.indexOf('    runs-on:', workflow.indexOf('  reconcile:')),
      )
      .replace(/^    if: >-\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();
    expect(reconcileCondition).toBe(
      "(github.event_name != 'pull_request_review' || github.event.pull_request.head.repo.full_name == github.repository) && (github.event_name != 'issue_comment' || (github.event.issue.pull_request != null && (startsWith(github.event.comment.body, '/approve-spec ') || startsWith(github.event.comment.body, '/revoke-spec '))))",
    );
    expect(workflow).toContain('pull_request_review:');
    expect(workflow).toContain('issue_comment:');
    expect(workflow).toContain('permissions: {}');
    expect(workflow).not.toContain('pull_request_review_target');
    expect(workflow).toContain(
      "startsWith(github.event.comment.body, '/approve-spec ')",
    );
    expect(workflow).toContain(
      "startsWith(github.event.comment.body, '/revoke-spec ')",
    );
    expect(reconciler).toContain('expectedCount: after.changed_files');
    expect(reconciler).toContain('scope.touchesKnowledgeRecords');
    expect(reconciler).toContain('scope.touchesDesignAssets');
    expect(reconciler).toContain('requiredApprovalGroups(records');
    expect(reconciler).toContain("'.github/DESIGNOWNERS'");
    expect(reconciler).toContain("'.github/ENGOWNERS'");
    expect(reconciler).toContain(
      '...new Set([...engineeringOwners, ...designOwners])',
    );
    expect(reconciler).not.toContain(
      '...new Set([...specOwners, ...engineeringOwners, ...designOwners])',
    );
    expect(reconciler).toContain('specDecision.approved');
    expect(reconciler).toContain('designDecision.approved');
    expect(reconciler).toContain('themeDecision.approved');
    expect(reconciler).toContain('context: GATE_STATUS_CONTEXT');
    expect(reconciler).toContain('expectedHeadOid: $oid');
    expect(reconciler).toContain('mergeMethod: SQUASH');
    expect(reconciler).toContain('disablePullRequestAutoMerge');
  });

  it('does not run the privileged visual-report path for spec-only PRs', () => {
    const workflow = read('.github/workflows/pr-comment.yml');
    expect(workflow).toContain("needs.resolve.outputs.spec_only != 'true'");
    expect(workflow).toContain("needs.resolve.outputs.spec_only == 'true'");
    expect(workflow).toContain(
      "context: 'visual-acceptance', state: 'success'",
    );
  });
});
