// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';

const root = path.resolve(import.meta.dirname, '../..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

describe('spec-only workflow contract', () => {
  it('keeps classification in one tested helper', () => {
    for (const workflow of [
      '.github/workflows/ci.yml',
      '.github/workflows/lint.yml',
      '.github/workflows/pr-comment.yml',
      '.github/workflows/spec-owner-gate.yml',
    ]) {
      expect(read(workflow), workflow).toContain(
        '.github/scripts/change-scope.cjs',
      );
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

  it('fails closed when file APIs are truncated or scope classification fails', () => {
    const ci = read('.github/workflows/ci.yml');
    expect(ci).toContain('if: ${{ always() && !cancelled() }}');
    expect(ci).toContain("if: needs.check-scope.result != 'success'");

    const reviewSignal = read('.github/workflows/review-signal.yml');
    expect(reviewSignal).toContain('allFiles.length !== pr.changed_files');

    const prComment = read('.github/workflows/pr-comment.yml');
    expect(prComment).toContain('files.length !== pr.changed_files');
  });

  it('requires approval on the current head before squash auto-merge', () => {
    const workflow = read('.github/workflows/spec-owner-gate.yml');
    expect(workflow).toContain(
      'ref: ${{ github.event.repository.default_branch }}',
    );
    expect(workflow).toContain('expectedCount: pr.changed_files');
    expect(workflow).toContain('scope.touchesKnowledgeRecords');
    expect(workflow).toContain('scope.touchesDesignAssets');
    expect(workflow).toContain('requiredApprovalGroups(records');
    expect(workflow).toContain("'.github/DESIGNOWNERS'");
    expect(workflow).toContain('designApprovers');
    expect(workflow).toContain(
      'specDecision.approved && designDecision.approved',
    );
    expect(workflow).toContain(
      'Draft-only knowledge change; owner approval is not required.',
    );
    expect(workflow).toContain("context: 'spec-owner-approval'");
    expect(workflow).toContain('headSha: pr.head.sha');
    expect(workflow).toContain('expectedHeadOid: $oid');
    expect(workflow).toContain('mergeMethod: SQUASH');
    expect(workflow).toContain('disablePullRequestAutoMerge');
    expect(workflow).toContain('spec-auto-merge');
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
