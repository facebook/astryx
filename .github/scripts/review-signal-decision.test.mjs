// Copyright (c) Meta Platforms, Inc. and affiliates.

import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {
  classifyReviewSignalPaths,
  resolveReviewApprovals,
} = require('./review-signal-decision.cjs');

const head1 = '1111111111111111111111111111111111111111';
const head2 = '2222222222222222222222222222222222222222';
const approval = (login, commitId, state = 'APPROVED') => ({
  user: {login},
  commit_id: commitId,
  state,
});

describe('review-signal exact-head approvals', () => {
  it('does not let an H1 engineering approval clear H2', () => {
    expect(
      resolveReviewApprovals({
        reviews: [approval('engineer', head1)],
        headSha: head2,
        engOwners: ['engineer'],
        designOwners: ['designer'],
      }),
    ).toEqual({
      codeApproved: false,
      codeWithdrawn: false,
      designApproved: false,
    });
  });

  it('does not let an H1 design approval clear H2', () => {
    expect(
      resolveReviewApprovals({
        reviews: [approval('designer', head1)],
        headSha: head2,
        engOwners: ['engineer'],
        designOwners: ['designer'],
      }),
    ).toEqual({
      codeApproved: false,
      codeWithdrawn: false,
      designApproved: false,
    });
  });

  it('accepts only exact-head approvals and honors later exact-head revocation', () => {
    expect(
      resolveReviewApprovals({
        reviews: [
          approval('engineer', head1),
          approval('engineer', head2),
          approval('designer', head2),
        ],
        headSha: head2,
        engOwners: ['engineer'],
        designOwners: ['designer'],
      }),
    ).toEqual({
      codeApproved: true,
      codeWithdrawn: false,
      designApproved: true,
    });

    expect(
      resolveReviewApprovals({
        reviews: [
          approval('engineer', head2),
          approval('engineer', head2, 'CHANGES_REQUESTED'),
          approval('designer', head2),
          approval('designer', head2, 'DISMISSED'),
        ],
        headSha: head2,
        engOwners: ['engineer'],
        designOwners: ['designer'],
      }),
    ).toEqual({
      codeApproved: false,
      codeWithdrawn: true,
      designApproved: false,
    });
  });

  it('keeps an effective exact-head approval when another owner withdraws', () => {
    expect(
      resolveReviewApprovals({
        reviews: [
          approval('engineer-a', head2),
          approval('engineer-b', head2),
          approval('engineer-b', head2, 'CHANGES_REQUESTED'),
        ],
        headSha: head2,
        engOwners: ['engineer-a', 'engineer-b'],
        designOwners: [],
      }),
    ).toEqual({
      codeApproved: true,
      codeWithdrawn: false,
      designApproved: false,
    });
  });

  it.each([
    {
      name: 'Core to lab',
      file: {
        filename: 'packages/lab/src/Button/Button.tsx',
        previous_filename: 'packages/core/src/Button/Button.tsx',
        status: 'renamed',
      },
      expectedPaths: [
        'packages/lab/src/Button/Button.tsx',
        'packages/core/src/Button/Button.tsx',
      ],
    },
    {
      name: 'unsafe to sandbox',
      file: {
        filename: 'apps/sandbox/src/Button.tsx',
        previous_filename: 'packages/build/src/Button.tsx',
        status: 'renamed',
      },
      expectedPaths: [
        'apps/sandbox/src/Button.tsx',
        'packages/build/src/Button.tsx',
      ],
    },
  ])('retains both sides of a $name rename', ({file, expectedPaths}) => {
    expect(classifyReviewSignalPaths([file])).toEqual({
      files: [file],
      hasSafeBoundaryRename: true,
      paths: expectedPaths,
    });
  });

  it('excludes a rename only when both sides are safe', () => {
    const file = {
      filename: 'apps/storybook/stories/Button.stories.tsx',
      previous_filename: 'apps/sandbox/src/Button.tsx',
      status: 'renamed',
    };
    expect(classifyReviewSignalPaths([file])).toEqual({
      files: [],
      hasSafeBoundaryRename: false,
      paths: [],
    });
  });

  it('stays dependency-free for trusted-base loading', () => {
    const source = readFileSync(
      fileURLToPath(new URL('./review-signal-decision.cjs', import.meta.url)),
      'utf8',
    );
    const mod = {exports: {}};
    new Function('module', 'exports', 'require', source)(
      mod,
      mod.exports,
      () => {
        throw new Error('review-signal-decision.cjs must stay dependency-free');
      },
    );
    expect(typeof mod.exports.resolveReviewApprovals).toBe('function');
  });
});
