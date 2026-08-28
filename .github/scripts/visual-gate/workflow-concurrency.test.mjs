// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {describe, expect, it} from 'vitest';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const WORKFLOWS = path.join(ROOT, '.github', 'workflows');

function workflow(name) {
  return fs.readFileSync(path.join(WORKFLOWS, name), 'utf8');
}

describe('visual acceptance workflow concurrency', () => {
  it('locks PR report resolution before any mutation', () => {
    const value = workflow('pr-comment.yml');
    const [header, jobs] = value.split('\njobs:\n');

    expect(header).toContain(
      'group: visual-acceptance-head-${{ github.event.workflow_run.head_repository.id }}-${{ github.event.workflow_run.head_branch }}',
    );
    expect(header).toContain(
      "cancel-in-progress: ${{ github.event.action == 'requested' || github.event.action == 'in_progress' }}",
    );
    expect(jobs).not.toContain('visual-acceptance-pr-');
    expect(jobs).not.toContain('    concurrency:');
  });

  it('keeps status initialization out of pull-request checks', () => {
    const acceptance = workflow('visual-acceptance.yml');
    const publisher = workflow('pr-comment.yml');

    expect(acceptance).not.toContain('pull_request_target:');
    expect(acceptance).not.toContain('  initialize:');
    expect(publisher).toContain('types: [requested, in_progress, completed]');
    expect(publisher).toContain(
      'description: `CI run ${run.id}/${run.run_attempt} is producing fresh visual evidence.`',
    );
  });

  it('keeps comment authorization read-only until the shared lock is held', () => {
    const value = workflow('visual-acceptance.yml');
    const authorize = value.slice(
      value.indexOf('  authorize:'),
      value.indexOf('  accept:'),
    );
    const authorizeCheckout = authorize.slice(
      authorize.indexOf('      - name: Checkout trusted default-branch code'),
      authorize.indexOf('      - name: Authorize and resolve the decision'),
    );
    const accept = value.slice(value.indexOf('  accept:'));

    expect(authorize).not.toContain(': write');
    expect(authorize).toContain('actions/checkout@v7');
    expect(authorizeCheckout).not.toContain('ref:');
    expect(authorize).toContain('visualAcceptanceIdentity(response.data)');
    expect(authorize).toContain(
      'isVisualAcceptanceEndpointMaintainer(identity)',
    );
    expect(authorize).toContain(
      "core.setOutput('effective_permission', identity.effectivePermission)",
    );
    expect(authorize).toContain(
      "core.setOutput('role_name', identity.roleName ?? '')",
    );
    expect(authorize).not.toContain('author_association');
    expect(authorize).not.toContain('issues.createComment');
    expect(authorize).not.toContain('createCommitStatus');
    expect(accept).toContain('needs: authorize');
    expect(accept).toContain(
      'EFFECTIVE_PERMISSION: ${{ needs.authorize.outputs.effective_permission }}',
    );
    expect(accept).toContain(
      'ROLE_NAME: ${{ needs.authorize.outputs.role_name }}',
    );
    expect(accept).toContain('--effective-permission "$EFFECTIVE_PERMISSION"');
    expect(accept).toContain('--role-name "$ROLE_NAME"');
    expect(accept).toContain(
      'group: visual-acceptance-head-${{ needs.authorize.outputs.head_repo_id }}-${{ needs.authorize.outputs.head_ref }}',
    );
    expect(accept).toContain('cancel-in-progress: false');
    expect(accept).toContain('pull-requests: write');
    expect(accept).not.toContain('issues: write');
  });

  it('invalidates the advisory label only in the trusted workflow_run publisher', () => {
    const value = workflow('pr-comment.yml');
    const invalidate = value.slice(
      value.indexOf('  invalidate:'),
      value.indexOf('  comment:'),
    );

    expect(invalidate).toContain('pull-requests: write');
    expect(invalidate).toContain('statuses: write');
    expect(invalidate).toContain('createCommitStatus');
    expect(invalidate).toContain('issues.removeLabel');
    expect(invalidate.indexOf('createCommitStatus')).toBeLessThan(
      invalidate.indexOf('issues.removeLabel'),
    );
    const publisher = value.slice(value.indexOf('  comment:'));
    expect(publisher).toContain("if (state.reason === 'accepted')");
    expect(publisher).toContain('issues.addLabels');
    expect(publisher).toContain('issues.removeLabel');
  });

  it('passes source CI identity without overriding reserved GitHub variables', () => {
    const value = workflow('pr-comment.yml');
    const capture = value.slice(
      value.indexOf('      - name: Capture the trusted stable visual scope'),
      value.indexOf('      # The Storybook bundle is untrusted.'),
    );

    expect(capture).toContain(
      'ASTRYX_VISUAL_SHA: ${{ steps.identity.outputs.head_sha }}',
    );
    expect(capture).toContain(
      'ASTRYX_VISUAL_RUN_ID: ${{ steps.identity.outputs.run_id }}',
    );
    expect(capture).toContain(
      'ASTRYX_VISUAL_RUN_ATTEMPT: ${{ steps.identity.outputs.run_attempt }}',
    );
    expect(capture).not.toContain('GITHUB_SHA:');
    expect(capture).not.toContain('GITHUB_RUN_ID:');
    expect(capture).not.toContain('GITHUB_RUN_ATTEMPT:');
  });

  it('defers broad trusted scopes before downloading or capturing Storybook', () => {
    const value = workflow('pr-comment.yml');
    const download = value.slice(
      value.indexOf(
        '      - name: Download Storybook for trusted visual capture',
      ),
      value.indexOf('      - name: Cross-check artifact identity'),
    );
    const capture = value.slice(
      value.indexOf('      - name: Capture the trusted stable visual scope'),
      value.indexOf('      - name: Derive trusted broad visual deferral'),
    );
    const defer = value.slice(
      value.indexOf('      - name: Derive trusted broad visual deferral'),
      value.indexOf('      # The Storybook bundle is untrusted.'),
    );
    const derive = value.slice(
      value.indexOf('      - name: Derive trusted visual evidence and report'),
      value.indexOf('      - name: Resolve trusted visual evidence path'),
    );

    const resolve = value.slice(
      value.indexOf('      - name: Resolve trusted visual evidence path'),
      value.indexOf('      - name: Publish immutable visual evidence'),
    );

    expect(download).toContain("steps.scope.outputs.broad != 'true'");
    expect(capture).toContain("steps.scope.outputs.broad != 'true'");
    expect(defer).toContain("steps.scope.outputs.broad == 'true'");
    expect(defer).toContain('visual-acceptance.mjs trusted-defer');
    expect(defer).toContain('--run-attempt "$RUN_ATTEMPT"');
    expect(defer).not.toContain('playwright');
    expect(defer).not.toContain('gate.mjs capture');
    expect(derive).toContain("steps.scope.outputs.broad != 'true'");
    expect(resolve).toContain('test -f trusted-visual/evidence.json');
    expect(resolve).toContain(
      'path=pr/${PR_NUMBER}/visual/${HEAD_SHA}/${RUN_ID}/${RUN_ATTEMPT}',
    );
  });

  it('uses the documented collaborator permission response shape', () => {
    const value = workflow('visual-acceptance.yml');
    const authorize = value.slice(
      value.indexOf('  authorize:'),
      value.indexOf('  accept:'),
    );

    expect(authorize).toContain('visualAcceptanceIdentity(response.data)');
    expect(authorize).not.toContain('response.data.user.permission');
  });

  it('installs the dependencies used by the acceptance archive script', () => {
    const value = workflow('visual-acceptance.yml');
    const accept = value.slice(value.indexOf('  accept:'));

    expect(accept.indexOf('uses: ./.github/actions/setup')).toBeGreaterThan(-1);
    expect(accept.indexOf('uses: ./.github/actions/setup')).toBeLessThan(
      accept.indexOf(
        'node .github/scripts/gh-pages-publisher.mjs visual-acceptance-record',
      ),
    );
  });

  it('serializes main-lane, recovery, and manual publication without Actions cancellation', () => {
    const value = workflow('visual-acceptance-promote.yml');
    const manual = workflow('visual-baseline.yml');
    const helper = 'node .github/scripts/gh-pages-publisher.mjs';

    expect(value).toContain('workflow_dispatch:');
    expect(value).toContain('currentRef: context.ref');
    expect(value).toContain('resolveMainPromotionCandidates');
    expect(value).toContain('Checkout trusted current main');
    expect(value).toContain('push:');
    expect(value).not.toContain('pull_request_target:');
    expect(value).toContain('Checkout the resolved main result');
    expect(value).not.toContain('allow-unsafe-pr-checkout: true');
    expect(value).toContain('compareCommitsWithBasehead');
    expect(value).toContain('ref: main');
    for (const command of ['enqueue', 'wait', 'release']) {
      expect(
        value.match(
          new RegExp(`${helper} ${command} --scope visual-gate/baseline`, 'g'),
        ),
      ).toHaveLength(1);
      expect(
        manual.match(
          new RegExp(`${helper} ${command} --scope visual-gate/baseline`, 'g'),
        ),
      ).toHaveLength(1);
    }
    expect(value).not.toContain('group: visual-baseline');
    expect(manual).not.toContain('group: visual-baseline');
    expect(value.indexOf('Recapture exactly the accepted shots')).toBeLessThan(
      value.indexOf('Wait for the baseline publication turn'),
    );
    expect(
      value.indexOf('Wait for the baseline publication turn'),
    ).toBeLessThan(value.indexOf('Verify and promote the baseline'));
    expect(value).toContain('visual-baseline-accepted');
    expect(value).toContain('--expected-record-rel "$RECORD_REL"');
    expect(workflow('pr-comment.yml')).toContain(
      'Post-merge promotion does not join this cancellation group',
    );
    expect(
      manual.indexOf('Wait for the baseline publication turn'),
    ).toBeLessThan(manual.indexOf('Promote and publish the baseline'));
    expect(workflow('release-gate.yml')).toContain(
      'node .github/scripts/gh-pages-publisher.mjs release-gate --source report',
    );
    expect(value).toContain('listPullRequestsAssociatedWithCommit');
    expect(value).toContain('sha: process.env.MAIN_SHA');
    expect(value).toContain('target_url: process.env.PR_URL');
    expect(value).toContain("source: 'visual-promotion'");
  });

  it('publishes the stable site and release gate through the shared gh-pages publisher', () => {
    const deploy = workflow('deploy.yml');
    const releaseGate = workflow('release-gate.yml');

    expect(deploy).toContain('Checkout publisher');
    expect(deploy).toContain(
      'node .github/scripts/gh-pages-publisher.mjs stable-site --source staged',
    );
    expect(deploy).not.toContain('/tmp/ghp');
    expect(releaseGate).toContain('Checkout publisher');
    expect(releaseGate).toContain(
      'node .github/scripts/gh-pages-publisher.mjs release-gate --source report',
    );
    const releasePublisher = releaseGate.slice(
      releaseGate.indexOf('  publish:'),
    );
    expect(releasePublisher).not.toContain('release-gate-publish');
    expect(releasePublisher).not.toContain('/tmp/gh-pages');
  });

  it('grants queued gh-pages publishers read access to overlapping workflow runs', () => {
    const deploy = workflow('deploy.yml');
    const deployJob = deploy.slice(
      deploy.indexOf('  deploy:'),
      deploy.indexOf('      - name: Checkout publisher'),
    );
    const releaseGate = workflow('release-gate.yml');
    const publishJob = releaseGate.slice(
      releaseGate.indexOf('  publish:'),
      releaseGate.indexOf('      - name: Checkout publisher'),
    );

    expect(deployJob).toContain('actions: read');
    expect(deployJob).toContain('contents: write');
    expect(deploy).toContain('gh-pages-publisher.mjs stable-site');
    expect(publishJob).toContain('actions: read');
    expect(publishJob).toContain('contents: write');
    expect(releaseGate).toContain('gh-pages-publisher.mjs release-gate');
  });

  it('moves high-conflict visual gh-pages writers behind the shared publisher', () => {
    const comment = workflow('pr-comment.yml');
    const acceptance = workflow('visual-acceptance.yml');
    const promote = workflow('visual-acceptance-promote.yml');
    const manual = workflow('visual-baseline.yml');

    expect(comment).toContain('gh-pages-publisher.mjs immutable-path');
    expect(comment).toContain('--scope pr-visual/evidence');
    expect(comment).not.toContain('Immutable evidence already published');
    expect(acceptance).toContain(
      'gh-pages-publisher.mjs visual-acceptance-record',
    );
    expect(acceptance).not.toContain('DEST="visual-gate/acceptances');
    expect(promote).toContain(
      'gh-pages-publisher.mjs visual-baseline-accepted',
    );
    expect(promote).not.toContain('baseline-publication-lock.mjs');
    expect(manual).toContain('gh-pages-publisher.mjs visual-baseline-manual');
    expect(manual).not.toContain('baseline-publication-lock.mjs');
    expect(manual).not.toContain('git rebase origin/gh-pages');
  });

  it('grants visual publisher jobs read access to overlapping workflow runs', () => {
    const comment = workflow('pr-comment.yml');
    const commentJob = comment.slice(
      comment.indexOf('  comment:'),
      comment.indexOf('      - name: Checkout trusted default-branch code'),
    );
    const acceptance = workflow('visual-acceptance.yml');
    const acceptJob = acceptance.slice(
      acceptance.indexOf('  accept:'),
      acceptance.indexOf(
        '      - name: Reject an invalid visual acceptance request',
      ),
    );
    const promote = workflow('visual-acceptance-promote.yml');
    const promoteJob = promote.slice(
      promote.indexOf('  promote:'),
      promote.indexOf(
        '      - name: Checkout trusted current main',
        promote.indexOf('  promote:'),
      ),
    );
    const manual = workflow('visual-baseline.yml');
    const manualJob = manual.slice(
      manual.indexOf('  promote:'),
      manual.indexOf('      - name: Checkout'),
    );

    for (const job of [commentJob, acceptJob, manualJob]) {
      expect(job).toContain('actions: read');
      expect(job).toContain('contents: write');
    }
    expect(promoteJob).toContain('actions: write');
    expect(promoteJob).toContain('contents: write');
  });

  it('projects validation and publication failures onto main', () => {
    const value = workflow('visual-acceptance-promote.yml');
    const validation = value.slice(
      value.indexOf('      - name: Mark trusted promotion validation failure'),
      value.indexOf('      - name: Confirm trusted active-retry deferral'),
    );
    const failure = value.slice(
      value.indexOf('      - name: Mark trusted main promotion failure'),
    );
    const promoteJob = value.slice(value.indexOf('  promote:'));

    expect(promoteJob).toContain('statuses: write');
    expect(promoteJob).toContain('matrix:');
    expect(promoteJob).toContain('max-parallel: 1');
    expect(validation).toContain('sha: process.env.MAIN_SHA');
    expect(validation).toContain('target_url: process.env.PR_URL');
    expect(validation).toContain('core.setFailed(description)');
    expect(failure).toContain('sha: process.env.MAIN_SHA');
    expect(failure).toContain('target_url: process.env.PR_URL');
    expect(failure).not.toContain('sha: process.env.HEAD_SHA');
    expect(promoteJob).toContain('Confirm trusted active-retry deferral');
    expect(promoteJob).toContain("core.setOutput('deferred', 'true')");
    expect(promoteJob).toContain("steps.defer.outputs.deferred != 'true'");
    expect(value).toContain('resolve-acceptance');
    expect(value).toContain('--expected-record-rel "$RECORD_REL"');
  });

  it('marks success only after publication, release readiness dispatch, and lock release finish', () => {
    const value = workflow('visual-acceptance-promote.yml');
    const gate = value.slice(
      value.indexOf('      - name: Run a fresh release gate'),
      value.indexOf('      - name: Release the baseline publication turn'),
    );
    const release = value.slice(
      value.indexOf('      - name: Release the baseline publication turn'),
      value.indexOf('      - name: Mark trusted main promotion complete'),
    );
    const complete = value.slice(
      value.indexOf('      - name: Mark trusted main promotion complete'),
      value.indexOf('      - name: Mark trusted main promotion failure'),
    );

    expect(value).toContain("publication_confirmed == 'true'");
    expect(value).toContain('visual-baseline-accepted');
    expect(gate).toContain(
      "steps.promote.outputs.publication_confirmed == 'true'",
    );
    expect(gate).toContain("source: 'visual-promotion'");
    expect(gate).toContain('source_pr: process.env.PR_NUMBER');
    expect(gate).toContain('source_main_sha: process.env.MAIN_SHA');
    expect(gate).toContain('fresh release gate dispatch failed');
    expect(release).toContain('if: always()');
    expect(release).toContain('lock release failed');
    expect(complete).toContain("steps.gate.outcome == 'success'");
    expect(complete).toContain("steps.release.outcome == 'success'");
    expect(complete).toContain('sha: process.env.MAIN_SHA');
    expect(complete).toContain("state: 'success'");
  });
});
