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

  it('keeps comment authorization read-only until the shared lock is held', () => {
    const value = workflow('visual-acceptance.yml');
    const initialize = value.slice(
      value.indexOf('  initialize:'),
      value.indexOf('  authorize:'),
    );
    const authorize = value.slice(
      value.indexOf('  authorize:'),
      value.indexOf('  accept:'),
    );
    const authorizeCheckout = authorize.slice(
      authorize.indexOf('      - name: Checkout trusted default-branch code'),
      authorize.indexOf('      - name: Authorize and resolve the decision'),
    );
    const accept = value.slice(value.indexOf('  accept:'));

    expect(initialize).toContain(
      'group: visual-acceptance-head-${{ github.event.pull_request.head.repo.id }}-${{ github.event.pull_request.head.ref }}',
    );
    expect(initialize).toContain('cancel-in-progress: true');
    expect(initialize).toContain('pull-requests: read');
    expect(initialize).not.toContain('pull-requests: write');
    expect(initialize).not.toContain('issues: write');
    expect(initialize).not.toContain('removeLabel');
    expect(initialize).toContain(
      "state: scope.hasStableVisual ? 'pending' : 'success'",
    );
    expect(initialize).toContain("'No stable visual scope.'");
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
        'node .github/scripts/visual-gate/visual-acceptance.mjs accept',
      ),
    );
  });

  it('uses the same head identity for post-merge promotion', () => {
    const value = workflow('visual-acceptance-promote.yml');

    expect(value).toContain(
      'group: visual-acceptance-head-${{ github.event.pull_request.head.repo.id }}-${{ github.event.pull_request.head.ref }}',
    );
    expect(value).not.toContain('visual-acceptance-pr-');
  });
});
