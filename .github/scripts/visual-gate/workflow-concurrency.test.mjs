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
    const accept = value.slice(value.indexOf('  accept:'));

    expect(initialize).toContain(
      'group: visual-acceptance-head-${{ github.event.pull_request.head.repo.id }}-${{ github.event.pull_request.head.ref }}',
    );
    expect(initialize).toContain('cancel-in-progress: true');
    expect(authorize).not.toContain(': write');
    expect(authorize).not.toContain('actions/checkout');
    expect(authorize).not.toContain('issues.createComment');
    expect(authorize).not.toContain('createCommitStatus');
    expect(accept).toContain('needs: authorize');
    expect(accept).toContain(
      'group: visual-acceptance-head-${{ needs.authorize.outputs.head_repo_id }}-${{ needs.authorize.outputs.head_ref }}',
    );
    expect(accept).toContain('cancel-in-progress: false');
  });

  it('uses the same head identity for post-merge promotion', () => {
    const value = workflow('visual-acceptance-promote.yml');

    expect(value).toContain(
      'group: visual-acceptance-head-${{ github.event.pull_request.head.repo.id }}-${{ github.event.pull_request.head.ref }}',
    );
    expect(value).not.toContain('visual-acceptance-pr-');
  });
});
