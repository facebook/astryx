// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import YAML from 'yaml';

const root = path.resolve(import.meta.dirname, '../..');
const workflowSource = fs.readFileSync(
  path.join(root, '.github/workflows/review-clear.yml'),
  'utf8',
);
const helperSource = fs.readFileSync(
  path.join(root, '.github/scripts/review-signal-decision.cjs'),
  'utf8',
);
const script = YAML.parse(workflowSource).jobs.clear.steps.find(
  step => step.name === 'Reconcile the exact-head code gate',
).with.script;
const execute = new Function(
  'github',
  'context',
  'core',
  'process',
  'Buffer',
  `return (async () => {\n${script}\n})();`,
);

const head1 = '1111111111111111111111111111111111111111';
const head2 = '2222222222222222222222222222222222222222';
const head3 = '3333333333333333333333333333333333333333';
const baseSha = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const workflowSha = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const REPOSITORY = 'facebook/astryx';
const BRANCH = 'feature';
const HELPER = '.github/scripts/review-signal-decision.cjs';
const review = (state, commitId = head2) => ({
  user: {login: 'engineer'},
  state,
  commit_id: commitId,
});
const gateStatus = (state, description, context = 'review-required') => ({
  context,
  creator: {login: 'github-actions[bot]'},
  description,
  state,
});
const pendingGate = gateStatus(
  'pending',
  'Waiting on code review: core runtime change',
);
const clearedGate = gateStatus('success', 'Cleared by code-owner approval.');
const ungatedSuccess = gateStatus('success', 'No code review required.');

/** A pull request as the detail endpoint returns it. */
function pull({
  number = 17,
  headRepo = REPOSITORY,
  headRef = BRANCH,
  headSha = head2,
  baseRef = 'main',
  stack = null,
  labels = ['needs:code-review'],
  reviews = [],
} = {}) {
  return {
    number,
    state: 'open',
    merged_at: null,
    head: {sha: headSha, ref: headRef, repo: {full_name: headRepo}},
    base: {
      sha: baseSha,
      ref: baseRef,
      repo: {full_name: REPOSITORY, default_branch: 'main'},
    },
    stack,
    labels: labels.map(name => ({name})),
    reviews,
  };
}

/** The list endpoints omit stack (and review data is not part of a PR). */
const listed = ({stack: _stack, reviews: _reviews, ...rest}) => rest;

function harness(
  reviews,
  {
    pulls,
    moveAfterFirstRead = false,
    onPullGet,
    statusFailure = false,
    statuses = [pendingGate],
    // Mirrors workflow_run for a review: head_repository always names this
    // repository (even for a fork PR), and pull_requests lists only
    // same-repository PRs.
    runHead = {branch: BRANCH, sha: head2, pullRequests: [{number: 17}]},
    ...single
  } = {},
) {
  const calls = [];
  const byNumber = new Map(
    (pulls ?? [pull({...single, reviews})]).map(candidate => [
      candidate.number,
      structuredClone(candidate),
    ]),
  );
  const reads = new Map();
  const github = {
    paginate: async (method, options) => (await method(options)).data,
    rest: {
      pulls: {
        get: async ({pull_number: number}) => {
          const count = (reads.get(number) ?? 0) + 1;
          reads.set(number, count);
          calls.push(`read:${number}`);
          const current = byNumber.get(number);
          if (moveAfterFirstRead && count > 1) current.head.sha = head3;
          onPullGet?.(number, count, current);
          const {reviews: _reviews, ...detail} = structuredClone(current);
          return {data: detail};
        },
        list: async ({head}) => {
          if (head !== undefined)
            throw new Error('the resolver must not filter by head');
          calls.push('list:open');
          return {
            data: [...byNumber.values()]
              .filter(candidate => candidate.state === 'open')
              .map(listed),
          };
        },
        listReviews: async ({pull_number: number}) => ({
          data: byNumber.get(number).reviews,
        }),
      },
      repos: {
        getContent: async ({ref, path: filePath}) => {
          calls.push(`read:${ref}:${filePath}`);
          return {
            data: {
              type: 'file',
              content: Buffer.from(helperSource).toString('base64'),
            },
          };
        },
        listCommitStatusesForRef: async () => ({data: statuses}),
        // Like GitHub, commit association never lists a fork PR.
        listPullRequestsAssociatedWithCommit: async ({commit_sha: sha}) => ({
          data: [...byNumber.values()]
            .filter(
              candidate =>
                candidate.head.sha === sha &&
                candidate.head.repo.full_name === REPOSITORY,
            )
            .map(listed),
        }),
        createCommitStatus: async input => {
          calls.push({type: 'status-attempt', input});
          if (statusFailure) throw new Error('persistent status failure');
          calls.push({type: 'status', input});
        },
      },
      issues: {
        addLabels: async input => calls.push({type: 'add-label', input}),
        removeLabel: async input => calls.push({type: 'remove-label', input}),
      },
      checks: {
        listForRef: async () => ({data: {check_runs: []}}),
        update: async input => calls.push({type: 'check-update', input}),
      },
    },
  };
  const context = {
    repo: {owner: 'facebook', repo: 'astryx'},
    sha: workflowSha,
    payload: {
      workflow_run: {
        event: 'pull_request_review',
        head_repository: {full_name: REPOSITORY, owner: {login: 'facebook'}},
        head_branch: runHead.branch,
        head_sha: runHead.sha,
        pull_requests: runHead.pullRequests ?? [],
      },
    },
  };
  const core = {
    info: message => calls.push(`info:${message}`),
    warning: message => calls.push(`warning:${message}`),
  };
  const processValue = {env: {ENG_OWNERS: '@engineer'}};
  return {calls, context, core, github, processValue};
}

async function run(h) {
  await execute(h.github, h.context, h.core, h.processValue, Buffer);
}

function mutations(calls) {
  return calls.filter(call =>
    ['add-label', 'remove-label', 'status'].includes(call?.type),
  );
}

describe('review-clear exact-head workflow', () => {
  it('does not let an H1 approval mutate the H2 gate', async () => {
    const h = harness([review('APPROVED', head1)]);

    await run(h);

    expect(mutations(h.calls)).toEqual([]);
  });

  it('loads the decision helper only from the trusted workflow SHA', async () => {
    const h = harness([review('APPROVED')]);

    await run(h);

    expect(h.calls.filter(call => String(call).endsWith(HELPER))).toEqual([
      `read:${workflowSha}:${HELPER}`,
    ]);
  });

  it('does not create a gate for a head that review-signal marked ungated', async () => {
    const h = harness([review('APPROVED')], {
      labels: [],
      statuses: [ungatedSuccess],
    });

    await run(h);

    expect(mutations(h.calls)).toEqual([]);
  });

  it('does not trust an unowned green review-required status', async () => {
    const h = harness([review('CHANGES_REQUESTED')], {
      labels: [],
      statuses: [
        {
          ...clearedGate,
          creator: {login: 'untrusted-user'},
        },
      ],
    });

    await run(h);

    expect(mutations(h.calls)).toEqual([]);
  });

  it('clears an owned gate for an entitled approval on the exact head', async () => {
    const h = harness([review('APPROVED')]);

    await run(h);

    expect(h.calls).toContainEqual(
      expect.objectContaining({type: 'remove-label'}),
    );
    expect(h.calls).toContainEqual({
      type: 'status',
      input: expect.objectContaining({
        sha: head2,
        context: 'review-required',
        state: 'success',
        description: 'Cleared by code-owner approval.',
      }),
    });
  });

  it('restores a previously green owned gate after exact-head changes requested', async () => {
    const h = harness([review('APPROVED'), review('CHANGES_REQUESTED')], {
      labels: [],
      statuses: [clearedGate],
    });

    await run(h);

    const pendingIndex = h.calls.findIndex(
      call => call?.type === 'status' && call.input.state === 'pending',
    );
    const labelIndex = h.calls.findIndex(call => call?.type === 'add-label');
    expect(pendingIndex).toBeGreaterThan(-1);
    expect(labelIndex).toBeGreaterThan(pendingIndex);
    expect(h.calls).toContainEqual({
      type: 'status',
      input: expect.objectContaining({
        sha: head2,
        context: 'review-required',
        state: 'pending',
        description: 'Waiting on code review after approval withdrawal.',
      }),
    });
  });

  it('does not mutate the label when the pending status persistently fails', async () => {
    const h = harness([review('APPROVED'), review('CHANGES_REQUESTED')], {
      labels: [],
      statusFailure: true,
      statuses: [clearedGate],
    });

    await expect(run(h)).rejects.toThrow('persistent status failure');

    expect(h.calls).toContainEqual(
      expect.objectContaining({
        type: 'status-attempt',
        input: expect.objectContaining({state: 'pending'}),
      }),
    );
    expect(h.calls.some(call => call?.type === 'status')).toBe(false);
    expect(h.calls.some(call => call?.type === 'add-label')).toBe(false);
  });

  it('restores a previously green owned gate after exact-head dismissal', async () => {
    const h = harness([review('APPROVED'), review('DISMISSED')], {
      labels: [],
      statuses: [clearedGate],
    });

    await run(h);

    expect(h.calls).toContainEqual(
      expect.objectContaining({type: 'add-label'}),
    );
    expect(h.calls).toContainEqual(
      expect.objectContaining({
        type: 'status',
        input: expect.objectContaining({state: 'pending'}),
      }),
    );
  });

  it.each([
    {
      name: 'approval',
      reviews: [review('APPROVED')],
      options: {moveAfterFirstRead: true},
    },
    {
      name: 'withdrawal',
      reviews: [review('APPROVED'), review('CHANGES_REQUESTED')],
      options: {
        labels: [],
        moveAfterFirstRead: true,
        statuses: [clearedGate],
      },
    },
    {
      name: 'dismissal',
      reviews: [review('APPROVED'), review('DISMISSED')],
      options: {
        labels: [],
        moveAfterFirstRead: true,
        statuses: [clearedGate],
      },
    },
  ])(
    'does not mutate after a moved-head $name race',
    async ({reviews, options}) => {
      const h = harness(reviews, options);

      await run(h);

      expect(mutations(h.calls)).toEqual([]);
    },
  );

  describe('identifying the reviewed pull request', () => {
    // Shapes observed on a real fork PR review: the run names this repository
    // as head_repository, lists no PRs, and commit association is empty.
    const FORK_SHA = 'bdb68723850d7add16d34e04528566402e7632f8';
    const FORK_BRANCH = 'potatowagon/richtext-theme-target';
    const forkRun = {branch: FORK_BRANCH, sha: FORK_SHA, pullRequests: []};
    const forkPull = (reviews, options = {}) =>
      pull({
        number: 6744,
        headRepo: 'potatowagon/astryx',
        headRef: FORK_BRANCH,
        headSha: FORK_SHA,
        reviews,
        ...options,
      });
    const onPr = (calls, number) =>
      mutations(calls).filter(
        call => call.input.issue_number === number || call.input.sha,
      );

    it('clears a fork PR gate on an exact-head approval', async () => {
      const h = harness([], {
        pulls: [forkPull([review('APPROVED', FORK_SHA)])],
        runHead: forkRun,
      });

      await run(h);

      expect(mutations(h.calls)).toEqual([
        {
          type: 'status',
          input: expect.objectContaining({
            sha: FORK_SHA,
            context: 'review-required',
            state: 'success',
            description: 'Cleared by code-owner approval.',
          }),
        },
        {
          type: 'remove-label',
          input: expect.objectContaining({
            issue_number: 6744,
            name: 'needs:code-review',
          }),
        },
      ]);
    });

    it('restores a fork PR gate after exact-head changes requested', async () => {
      const h = harness([], {
        pulls: [
          forkPull(
            [
              review('APPROVED', FORK_SHA),
              review('CHANGES_REQUESTED', FORK_SHA),
            ],
            {labels: []},
          ),
        ],
        runHead: forkRun,
        statuses: [clearedGate],
      });

      await run(h);

      expect(mutations(h.calls)).toEqual([
        {
          type: 'status',
          input: expect.objectContaining({
            sha: FORK_SHA,
            state: 'pending',
            description: 'Waiting on code review after approval withdrawal.',
          }),
        },
        {
          type: 'add-label',
          input: expect.objectContaining({issue_number: 6744}),
        },
      ]);
    });

    it('resolves a fork PR whose branch is named like the default branch', async () => {
      const h = harness([], {
        pulls: [
          pull({
            number: 6748,
            headRepo: 'someone/astryx',
            headRef: 'main',
            headSha: head1,
            reviews: [review('APPROVED', head1)],
          }),
        ],
        runHead: {branch: 'main', sha: head1, pullRequests: []},
      });

      await run(h);

      expect(onPr(h.calls, 6748)).toContainEqual({
        type: 'status',
        input: expect.objectContaining({sha: head1, state: 'success'}),
      });
    });

    it('clears a same-repository PR listed by the run', async () => {
      const h = harness([review('APPROVED')]);

      await run(h);

      expect(mutations(h.calls)).toContainEqual({
        type: 'status',
        input: expect.objectContaining({sha: head2, state: 'success'}),
      });
    });

    it('requires the reviewed branch as well as the commit', async () => {
      // Same commit, but pushed to a differently named branch.
      const h = harness([], {
        pulls: [
          forkPull([review('APPROVED', FORK_SHA)], {headRef: 'another-branch'}),
        ],
        runHead: forkRun,
      });

      await run(h);

      expect(mutations(h.calls)).toEqual([]);
      expect(h.calls).toContain(
        `info:No open PR has head ${FORK_BRANCH}@${FORK_SHA.slice(0, 7)}; the flag job reconciles any newer head.`,
      );
    });

    it('does nothing when no open PR still has the reviewed head', async () => {
      const h = harness([review('APPROVED')], {
        runHead: {branch: BRANCH, sha: head1, pullRequests: [{number: 17}]},
      });

      await run(h);

      expect(mutations(h.calls)).toEqual([]);
    });

    it('never clears when the reviewed head and branch back several open PRs', async () => {
      // An upstream PR and a fork PR on the same commit and branch name.
      const h = harness([], {
        pulls: [
          pull({reviews: [review('APPROVED')]}),
          pull({
            number: 18,
            headRepo: 'someone/astryx',
            baseRef: 'feature/lower',
            reviews: [review('APPROVED')],
          }),
        ],
        statuses: [
          pendingGate,
          gateStatus(
            'pending',
            'Waiting on code review: core change',
            'review-required/stacked-pr-18',
          ),
        ],
      });

      await run(h);

      expect(mutations(h.calls)).toEqual([]);
      expect(h.calls).toContain(
        `warning:Head ${head2.slice(0, 7)} on ${BRANCH} backs open PRs #17, #18; restoring gates only, never clearing.`,
      );
    });

    it('still restores a withdrawn gate when the head backs several PRs', async () => {
      const h = harness([], {
        pulls: [
          pull({
            labels: [],
            reviews: [review('APPROVED'), review('CHANGES_REQUESTED')],
          }),
          pull({number: 18, baseRef: 'feature/lower', labels: []}),
        ],
        statuses: [clearedGate],
      });

      await run(h);

      expect(mutations(h.calls)).toEqual([
        {
          type: 'status',
          input: expect.objectContaining({
            context: 'review-required',
            state: 'pending',
          }),
        },
        {
          type: 'add-label',
          input: expect.objectContaining({issue_number: 17}),
        },
      ]);
    });
  });

  describe('two PRs on different branches sharing a commit', () => {
    // branch-a targets main; branch-b is stacked manually on another branch.
    const pulls = ({
      mainReviews,
      stackedReviews,
      mainLabels,
      stackedLabels,
    }) => [
      pull({
        number: 30,
        headRef: 'branch-a',
        reviews: mainReviews,
        labels: mainLabels,
      }),
      pull({
        number: 31,
        headRef: 'branch-b',
        baseRef: 'feature/lower',
        reviews: stackedReviews,
        labels: stackedLabels,
      }),
    ];
    const statuses = [
      clearedGate,
      gateStatus(
        'pending',
        'Waiting on code review: core change',
        'review-required/stacked-pr-31',
      ),
    ];
    const runFor = (branch, pullRequests) => ({
      branch,
      sha: head2,
      pullRequests,
    });

    it('restores only the main PR for a changes-requested review on its branch', async () => {
      const h = harness([], {
        pulls: pulls({
          mainReviews: [review('APPROVED'), review('CHANGES_REQUESTED')],
          stackedReviews: [review('APPROVED')],
          mainLabels: [],
          stackedLabels: ['needs:code-review'],
        }),
        runHead: runFor('branch-a', [{number: 30}]),
        statuses,
      });

      await run(h);

      expect(mutations(h.calls)).toEqual([
        {
          type: 'status',
          input: expect.objectContaining({
            context: 'review-required',
            state: 'pending',
          }),
        },
        {type: 'add-label', input: expect.objectContaining({issue_number: 30})},
      ]);
    });

    it('clears only the stacked PR scoped gate for an approval on its branch', async () => {
      const h = harness([], {
        pulls: pulls({
          mainReviews: [review('APPROVED'), review('CHANGES_REQUESTED')],
          stackedReviews: [review('APPROVED')],
          mainLabels: [],
          stackedLabels: ['needs:code-review'],
        }),
        runHead: runFor('branch-b', [{number: 31}]),
        statuses,
      });

      await run(h);

      expect(mutations(h.calls)).toEqual([
        {
          type: 'status',
          input: expect.objectContaining({
            context: 'review-required/stacked-pr-31',
            state: 'success',
          }),
        },
        {
          type: 'remove-label',
          input: expect.objectContaining({issue_number: 31}),
        },
      ]);
      // The main PR's required context is not this run's to change.
      expect(
        mutations(h.calls).some(
          call =>
            call.input.context === 'review-required' ||
            call.input.issue_number === 30,
        ),
      ).toBe(false);
    });
  });

  describe('scope of the gate a pull request owns', () => {
    it('clears only the scoped context of a manually stacked PR', async () => {
      const scoped = 'review-required/stacked-pr-17';
      const h = harness([review('APPROVED')], {
        baseRef: 'feature/lower',
        statuses: [
          gateStatus('pending', 'Waiting on code review: core change', scoped),
        ],
      });

      await run(h);

      const writes = mutations(h.calls).filter(call => call.type === 'status');
      expect(writes).toEqual([
        {
          type: 'status',
          input: expect.objectContaining({
            context: scoped,
            state: 'success',
            description: 'Cleared by code-owner approval.',
          }),
        },
      ]);
    });

    it('does not treat the required context as ownership of a stacked gate', async () => {
      const h = harness([review('APPROVED')], {
        baseRef: 'feature/lower',
        labels: [],
        statuses: [pendingGate],
      });

      await run(h);

      expect(mutations(h.calls)).toEqual([]);
    });

    it('clears the required context of a native stack rung on main', async () => {
      const h = harness([review('APPROVED')], {
        baseRef: 'feature/lower',
        stack: {base: {ref: 'main', sha: head3}},
      });

      await run(h);

      expect(mutations(h.calls)).toContainEqual({
        type: 'status',
        input: expect.objectContaining({
          context: 'review-required',
          state: 'success',
        }),
      });
    });

    it('does not clear a required context another governed PR shares', async () => {
      // A fork PR with the same commit is not a candidate for this review run,
      // but it reads the same required context.
      const h = harness([], {
        pulls: [
          pull({reviews: [review('APPROVED')]}),
          pull({number: 18, headRepo: 'someone/astryx', headRef: 'copy'}),
        ],
      });

      await run(h);

      expect(mutations(h.calls)).toEqual([]);
      expect(h.calls).toContain(
        'info:PR #17: head is shared with open PR #18; not clearing review-required.',
      );
    });

    it('re-reads and retries when the base moves before the mutation', async () => {
      const h = harness([review('APPROVED')], {
        onPullGet: (_number, count, current) => {
          if (count === 2) current.base.sha = head3;
        },
      });

      await run(h);

      expect(
        mutations(h.calls).filter(call => call.type === 'status'),
      ).toHaveLength(1);
    });
  });

  it('re-decides from the live PR before every mutation', async () => {
    const h = harness([review('APPROVED')], {
      statuses: [pendingGate],
    });
    h.github.rest.checks.listForRef = async () => ({
      data: {check_runs: [{id: 9, conclusion: 'action_required'}]},
    });

    await run(h);

    let readSinceWrite = false;
    const order = h.calls.filter(
      call =>
        call === 'read:17' ||
        ['add-label', 'remove-label', 'status', 'check-update'].includes(
          call?.type,
        ),
    );
    expect(order.map(call => call?.type ?? call)).toEqual([
      'read:17', // candidate
      'read:17', // reconcile
      'read:17', // re-decide before the status
      'status',
      'read:17', // verify the status; re-decide before the label
      'remove-label',
      'read:17', // re-decide before the check run
      'check-update',
    ]);
    for (const call of order) {
      if (call === 'read:17') readSinceWrite = true;
      else {
        expect(readSinceWrite).toBe(true);
        readSinceWrite = false;
      }
    }
  });

  describe('runs that overlap or finish out of order', () => {
    // Runs never cancel one another. Each case below lands another run's
    // review or flag between this run's decision and its writes.
    const changesRequested = review('CHANGES_REQUESTED');

    it('restores instead of clearing when a changes-requested lands before the write', async () => {
      const h = harness([review('APPROVED')], {
        // Read 3 is the re-decision immediately before the status write.
        onPullGet: (_number, count, current) => {
          if (count === 3) current.reviews.push(changesRequested);
        },
      });

      await run(h);

      expect(mutations(h.calls)).toEqual([
        {
          type: 'status',
          input: expect.objectContaining({
            state: 'pending',
            description: 'Waiting on code review after approval withdrawal.',
          }),
        },
      ]);
      expect(h.calls).toContain(
        'info:PR #17: the gate decision changed from clear to restore while reconciling; reconciling again.',
      );
    });

    it('corrects its own success when a changes-requested lands right after it', async () => {
      const h = harness([review('APPROVED')], {
        // Read 4 verifies the success write.
        onPullGet: (_number, count, current) => {
          if (count === 4) current.reviews.push(changesRequested);
        },
      });

      await run(h);

      const statuses = mutations(h.calls).filter(
        call => call.type === 'status',
      );
      expect(statuses.map(call => call.input.state)).toEqual([
        'success',
        'pending',
      ]);
      // The label was never removed, so the restore leaves it in place.
      expect(
        mutations(h.calls).some(call => call.type === 'remove-label'),
      ).toBe(false);
    });

    it('restores when an older approval run starts after a later changes-requested', async () => {
      const h = harness([review('APPROVED'), changesRequested], {
        labels: [],
        statuses: [clearedGate],
      });

      await run(h);

      expect(mutations(h.calls)).toEqual([
        {type: 'status', input: expect.objectContaining({state: 'pending'})},
        {type: 'add-label', input: expect.objectContaining({issue_number: 17})},
      ]);
    });

    it('does nothing when review-signal marks the head ungated before the write', async () => {
      const h = harness([review('APPROVED')], {
        onPullGet: (_number, count, current) => {
          if (count === 3) current.labels = [];
        },
      });
      h.github.rest.repos.listCommitStatusesForRef = async () => ({
        data:
          h.calls.filter(call => call === 'read:17').length >= 3
            ? [ungatedSuccess]
            : [pendingGate],
      });

      await run(h);

      expect(mutations(h.calls)).toEqual([]);
    });

    it('clears a gate owned only by its label without dropping the label first', async () => {
      // Writing the status first keeps the gate owned while the label goes.
      const h = harness([review('APPROVED')], {statuses: []});

      await run(h);

      expect(mutations(h.calls)).toEqual([
        {
          type: 'status',
          input: expect.objectContaining({
            state: 'success',
            description: 'Cleared by code-owner approval.',
          }),
        },
        {
          type: 'remove-label',
          input: expect.objectContaining({issue_number: 17}),
        },
      ]);
    });
  });
});
