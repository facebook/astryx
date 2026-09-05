// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);

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
      "(github.event_name != 'pull_request_review' || github.event.pull_request.head.repo.full_name == github.repository) && (github.event_name != 'issue_comment' || (github.event.issue.pull_request != null && (startsWith(github.event.comment.body, '/approve-spec') || startsWith(github.event.comment.body, '/revoke-spec'))))",
    );
    expect(workflow).toContain('pull_request_review:');
    expect(workflow).toContain('issue_comment:');
    expect(workflow).toContain('permissions: {}');
    expect(workflow).not.toContain('pull_request_review_target');
    // The filter must admit a command that omits the head SHA so the
    // reconciler can answer it; a trailing space would drop it silently.
    expect(workflow).toContain(
      "startsWith(github.event.comment.body, '/approve-spec')",
    );
    expect(workflow).toContain(
      "startsWith(github.event.comment.body, '/revoke-spec')",
    );
    expect(workflow).not.toContain(
      "startsWith(github.event.comment.body, '/approve-spec ')",
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
    // Only a DESIGNOWNER author self-attests, and only the design group
    // reads that attestation.
    expect(reconciler).toContain('designOwners.includes(actor)');
    expect(reconciler).not.toContain('allOwners.has(actor)');
    expect(reconciler).toContain(
      'readyAttestations,\n        owners: designApprovers',
    );
    expect(reconciler).toContain('isSettled(initialPr)');
    expect(reconciler).toContain('isPublishable(headSha)');
    expect(reconciler).toContain('specDecision.approved');
    expect(reconciler).toContain('designDecision.approved');
    expect(reconciler).toContain('themeDecision.approved');
    expect(reconciler).toContain('context: GATE_STATUS_CONTEXT');
    expect(reconciler).toContain('expectedHeadOid: $oid');
    expect(reconciler).toContain('mergeMethod: SQUASH');
    expect(reconciler).toContain('disablePullRequestAutoMerge');
  });

  it('derives the comment trigger from the parser\u2019s own prefixes', () => {
    const workflow = read('.github/workflows/spec-owner-gate.yml');
    const {OWNER_COMMAND_PREFIXES} = require(
      path.join(root, '.github/scripts/spec-owner-decision.cjs'),
    );

    // Every prefix the parser accepts must appear in the trigger, and the
    // trigger must name no prefix the parser does not accept. A mismatch is
    // the silent failure mode: a comment that parses but never dispatches.
    const triggerPrefixes = [
      ...workflow.matchAll(
        /startsWith\(github\.event\.comment\.body, '([^']+)'\)/g,
      ),
    ].map(match => match[1]);
    expect(new Set(triggerPrefixes)).toEqual(new Set(OWNER_COMMAND_PREFIXES));
    for (const prefix of triggerPrefixes) {
      expect(prefix.trimEnd(), prefix).toBe(prefix);
    }
  });

  it('offers a backfill dispatch that publishes status without landing', () => {
    const workflow = read('.github/workflows/spec-owner-gate.yml');
    const reconciler = read('.github/scripts/spec-owner-reconcile.cjs');

    expect(workflow).toContain('backfill:');
    expect(workflow).toContain('type: boolean');
    expect(reconciler).toContain("context.eventName === 'workflow_dispatch'");
    expect(reconciler).toContain('backfillOnly');
    // The guard must sit after the terminal status and before enablement.
    const publish = reconciler.indexOf(
      "setFinalStatus(initialHead, 'success', successDescription)",
    );
    const guard = reconciler.indexOf('if (backfillOnly) {');
    const enable = reconciler.indexOf('enablePullRequestAutoMerge');
    expect(publish).toBeGreaterThan(-1);
    expect(guard).toBeGreaterThan(publish);
    expect(enable).toBeGreaterThan(guard);
  });

  it('keeps the last read before a terminal write on the live pull request', () => {
    const reconciler = read('.github/scripts/spec-owner-reconcile.cjs');
    const guard = reconciler.slice(
      reconciler.indexOf('async function isLiveHeadWritable('),
      reconciler.indexOf('async function restoreNewerStatus('),
    );

    expect(guard).toContain('isSettled(live)');
    expect(guard).toContain('live.head.sha !== headSha');
    // isPublishable checks run currency first, then delegates the live read,
    // so the freshest fact at the moment of the write is the pull request.
    const publishable = reconciler.slice(
      reconciler.indexOf('async function isPublishable('),
      reconciler.indexOf('async function restoreNewerStatus('),
    );
    expect(publishable.indexOf('await isCurrentRun(headSha)')).toBeLessThan(
      publishable.indexOf('isLiveHeadWritable(headSha)'),
    );
    expect(reconciler).toContain('treat that status as unverified');

    // Every gate-status write goes through a live guard, restores included.
    const restore = reconciler.slice(
      reconciler.indexOf('async function restoreNewerStatus('),
      reconciler.indexOf('async function isCurrentRun('),
    );
    expect(restore).toContain('await isLiveHeadWritable(headSha)');
    expect(restore.indexOf('await isLiveHeadWritable(headSha)')).toBeLessThan(
      restore.indexOf('createStatus('),
    );
  });

  it('reads a ready attestation back only for a current design owner', () => {
    const reconciler = read('.github/scripts/spec-owner-reconcile.cjs');
    const decision = read('.github/scripts/spec-owner-decision.cjs');

    expect(reconciler).toContain('owners: designOwners');
    expect(decision).toContain('!allowed.has(owner)');
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
