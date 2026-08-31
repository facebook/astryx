// Copyright (c) Meta Platforms, Inc. and affiliates.

/* global Buffer */

import {createRequire} from 'node:module';
import path from 'node:path';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {canonicalRunUrl} = require('./spec-owner-decision.cjs');
const {
  isCommandComment,
  reconcileSpecOwnerGate,
} = require('./spec-owner-reconcile.cjs');

const head = 'abcdef1234567890abcdef1234567890abcdef12';
const nextHead = '1111111111111111111111111111111111111111';
const repository = 'facebook/astryx';
const workspace = path.resolve(import.meta.dirname, '../..');
const env = {
  SPEC_OWNERS: 'cixzhang,imdreamrunner',
  REVIEW_LABEL: 'needs:spec-owner-review',
  AUTO_MERGE_LABEL: 'spec-auto-merge',
};

function context({
  runId,
  eventName = 'pull_request_target',
  action = 'ready_for_review',
  actor = 'cixzhang',
  author = 'cixzhang',
  headSha = head,
  comment,
  review,
}) {
  return {
    actor,
    eventName,
    runId,
    runAttempt: 1,
    repo: {owner: 'facebook', repo: 'astryx'},
    payload: {
      action,
      issue: eventName === 'issue_comment' ? {number: 17} : undefined,
      comment,
      review,
      pull_request:
        eventName === 'issue_comment'
          ? undefined
          : {
              number: 17,
              updated_at: '2026-08-30T10:00:00Z',
              user: {login: author},
              head: {sha: headSha},
            },
    },
  };
}

function trustedStatus({
  runId,
  statusContext = 'spec-owner-approval',
  state = 'pending',
  description = 'Reconciling.',
  sha = head,
}) {
  return {
    sha,
    context: statusContext,
    state,
    description,
    target_url: canonicalRunUrl(repository, String(runId), '1'),
    creator: {login: 'github-actions[bot]'},
    created_at: '2026-08-30T10:00:00Z',
    updated_at: '2026-08-30T10:00:00Z',
  };
}

function createHarness({
  author = 'cixzhang',
  statuses = [],
  comments = [],
  reviews = [],
  timeline = [],
  labels = [],
  autoMerge = null,
  onPullGet,
  onEnableAutoMerge,
} = {}) {
  const state = {
    pullGets: 0,
    statuses: [...statuses],
    comments: [...comments],
    reviews: [...reviews],
    timeline: [...timeline],
    calls: [],
    labels: new Set(labels),
    knownLabels: new Set(labels),
    pr: {
      number: 17,
      node_id: 'PR_node',
      user: {login: author},
      head: {sha: head, repo: {full_name: repository}},
      base: {
        sha: '2222222222222222222222222222222222222222',
        repo: {full_name: repository},
      },
      changed_files: 1,
      labels: [],
      auto_merge: autoMerge,
      draft: false,
    },
  };

  function syncLabels() {
    state.pr.labels = [...state.labels].map(name => ({name}));
  }
  syncLabels();

  const methods = {
    getPull: async () => {
      state.pullGets += 1;
      onPullGet?.(state.pullGets, state);
      syncLabels();
      return {data: state.pr};
    },
    listFiles: async () => ({
      data: [
        {
          filename: 'docs/specs/owner-ready/spec.md',
          status: 'added',
        },
      ],
    }),
    listReviews: async () => ({data: state.reviews}),
    listComments: async () => ({data: state.comments}),
    listTimeline: async () => ({data: state.timeline}),
    listStatuses: async ({ref}) => ({
      data: state.statuses.filter(status => status.sha === ref),
    }),
  };

  const github = {
    paginate: async (method, options) => (await method(options)).data,
    rest: {
      pulls: {
        get: methods.getPull,
        listFiles: methods.listFiles,
        listReviews: methods.listReviews,
      },
      issues: {
        listComments: methods.listComments,
        listEventsForTimeline: methods.listTimeline,
        getLabel: async ({name}) => {
          if (!state.knownLabels.has(name)) {
            const error = new Error('Not found');
            error.status = 404;
            throw error;
          }
          return {data: {name}};
        },
        createLabel: async ({name}) => {
          state.knownLabels.add(name);
          state.calls.push(`create-label:${name}`);
        },
        addLabels: async ({labels: added}) => {
          for (const name of added) state.labels.add(name);
          syncLabels();
          state.calls.push(`add-label:${added.join(',')}`);
        },
        removeLabel: async ({name}) => {
          if (!state.labels.delete(name)) {
            const error = new Error('Not found');
            error.status = 404;
            throw error;
          }
          syncLabels();
          state.calls.push(`remove-label:${name}`);
        },
      },
      repos: {
        listCommitStatusesForRef: methods.listStatuses,
        createCommitStatus: async input => {
          const status = {
            ...input,
            creator: {login: 'github-actions[bot]'},
            created_at: '2026-08-30T10:00:30Z',
            updated_at: '2026-08-30T10:00:30Z',
          };
          state.statuses.unshift(status);
          state.calls.push(`status:${input.context}:${input.state}`);
          return {data: status};
        },
        getContent: async ({ref}) => ({
          data: {
            content: Buffer.from(
              ref === state.pr.head.sha
                ? 'kind: architecture\nauthority: current\n'
                : '',
            ).toString('base64'),
          },
        }),
      },
    },
    graphql: async query => {
      if (query.includes('enablePullRequestAutoMerge')) {
        onEnableAutoMerge?.(state);
        state.pr.auto_merge = {merge_method: 'squash'};
        state.calls.push('enable-auto-merge');
      } else if (query.includes('disablePullRequestAutoMerge')) {
        state.pr.auto_merge = null;
        state.calls.push('disable-auto-merge');
      }
      return {};
    },
  };
  const core = {
    info: message => state.calls.push(`info:${message}`),
    warning: message => state.calls.push(`warning:${message}`),
  };
  return {github, core, state};
}

async function run(harness, runContext, options = {}) {
  await reconcileSpecOwnerGate({
    github: harness.github,
    context: runContext,
    core: harness.core,
    workspace,
    env,
    ...options,
  });
}

function latestGateStatus(state) {
  return state.statuses.find(
    status => status.context === 'spec-owner-approval',
  );
}

describe('spec owner workflow reconciliation', () => {
  it('treats an eligible owner-author ready event as exact-head approval', async () => {
    const harness = createHarness();

    await run(harness, context({runId: 100n}));

    expect(
      harness.state.statuses.some(
        status => status.context === 'spec-owner-ready/cixzhang',
      ),
    ).toBe(true);
    expect(latestGateStatus(harness.state).state).toBe('success');
    expect(harness.state.calls).toContain('enable-auto-merge');
  });

  it('does not attest ready_for_review by a non-owner author', async () => {
    const harness = createHarness({author: 'contributor'});

    await run(
      harness,
      context({runId: 100n, actor: 'contributor', author: 'contributor'}),
    );

    expect(
      harness.state.statuses.some(status =>
        status.context.startsWith('spec-owner-ready/'),
      ),
    ).toBe(false);
    expect(latestGateStatus(harness.state).state).toBe('pending');
    expect(harness.state.calls).not.toContain('enable-auto-merge');
  });

  it('abandons the old event when the live head changes', async () => {
    const harness = createHarness({
      onPullGet: (count, state) => {
        if (count === 2) state.pr.head.sha = nextHead;
      },
    });

    await run(harness, context({runId: 100n}));

    expect(harness.state.calls).not.toContain('enable-auto-merge');
    expect(
      harness.state.statuses.filter(
        status =>
          status.context === 'spec-owner-approval' && status.sha === head,
      ),
    ).toHaveLength(1);
  });

  it('disables gate-owned auto-merge before reconciling a later revoke', async () => {
    const harness = createHarness();
    await run(harness, context({runId: 100n}));
    harness.state.comments.push({
      user: {login: 'cixzhang'},
      body: `/revoke-spec ${head}`,
      created_at: '2026-08-30T10:01:00Z',
    });

    const beforeRevokeRun = harness.state.calls.length;
    await run(
      harness,
      context({
        runId: 101n,
        eventName: 'issue_comment',
        comment: harness.state.comments[0],
      }),
    );

    const secondPending = harness.state.calls.findIndex(
      (call, index) =>
        index >= beforeRevokeRun &&
        call === 'status:spec-owner-approval:pending',
    );
    const disabled = harness.state.calls.lastIndexOf('disable-auto-merge');
    expect(disabled).toBeGreaterThan(secondPending);
    expect(harness.state.pr.auto_merge).toBe(null);
    expect(latestGateStatus(harness.state).state).toBe('pending');
  });

  it('undoes its own enable when a revoke supersedes it after the ownership label is removed', async () => {
    const harness = createHarness({
      onEnableAutoMerge: state => {
        state.statuses.unshift(trustedStatus({runId: 101n}));
        state.labels.delete('spec-auto-merge');
        state.pr.labels = [];
        state.calls.push('interleaved-revoke');
      },
    });

    await run(harness, context({runId: 100n}));

    expect(harness.state.calls).toEqual(
      expect.arrayContaining([
        'interleaved-revoke',
        'enable-auto-merge',
        'disable-auto-merge',
      ]),
    );
    expect(harness.state.calls.indexOf('interleaved-revoke')).toBeLessThan(
      harness.state.calls.indexOf('enable-auto-merge'),
    );
    expect(harness.state.calls.indexOf('enable-auto-merge')).toBeLessThan(
      harness.state.calls.indexOf('disable-auto-merge'),
    );
    expect(harness.state.labels.has('spec-auto-merge')).toBe(false);
    expect(harness.state.pr.auto_merge).toBe(null);
  });

  it('uses dismissal ordering and immediately disables owned auto-merge', async () => {
    const ready = trustedStatus({
      runId: 90n,
      statusContext: 'spec-owner-ready/cixzhang',
      state: 'success',
      description: 'Owner ready at 2026-08-30T10:01:00.000Z.',
    });
    const review = {
      id: 17,
      user: {login: 'cixzhang'},
      state: 'DISMISSED',
      commit_id: head,
      submitted_at: '2026-08-30T09:00:00Z',
      updated_at: '2026-08-30T10:02:00Z',
    };
    const harness = createHarness({
      statuses: [ready],
      reviews: [review],
      timeline: [
        {
          event: 'review_dismissed',
          created_at: '2026-08-30T10:02:00Z',
          dismissed_review: {review_id: 17},
        },
      ],
      labels: ['spec-auto-merge'],
      autoMerge: {merge_method: 'squash'},
    });

    await run(
      harness,
      context({
        runId: 100n,
        eventName: 'pull_request_review',
        action: 'dismissed',
        review,
      }),
    );

    expect(harness.state.pr.auto_merge).toBe(null);
    expect(latestGateStatus(harness.state).state).toBe('pending');
  });

  it('yields to a newer run id instead of applying stale approval', async () => {
    const harness = createHarness({
      statuses: [trustedStatus({runId: 101n, state: 'success'})],
    });

    await run(harness, context({runId: 100n}));

    expect(harness.state.calls).not.toContain('enable-auto-merge');
    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'success',
      target_url: canonicalRunUrl(repository, '101', '1'),
    });
    expect(
      harness.state.calls.some(call => call.includes('yielded to newer run')),
    ).toBe(true);
  });

  it('accepts a pull number resolved by a trusted workflow-run companion', async () => {
    const harness = createHarness({author: 'contributor'});
    const relayContext = context({runId: 100n, eventName: 'workflow_run'});
    delete relayContext.payload.pull_request;

    await run(harness, relayContext, {pullNumber: 17});

    expect(harness.state.pullGets).toBeGreaterThan(0);
    expect(latestGateStatus(harness.state).state).toBe('pending');
  });

  it('rejects valid-shaped non-owner commands before API work', async () => {
    const harness = createHarness();
    const comment = {
      user: {login: 'contributor'},
      body: `/approve-spec ${head}`,
      created_at: '2026-08-30T10:00:00Z',
    };

    await run(
      harness,
      context({
        runId: 100n,
        eventName: 'issue_comment',
        actor: 'contributor',
        comment,
      }),
    );

    expect(harness.state.pullGets).toBe(0);
    expect(harness.state.statuses).toEqual([]);
  });

  it('rejects non-owner reviews before API work', async () => {
    const harness = createHarness();
    const review = {
      user: {login: 'contributor'},
      state: 'APPROVED',
      commit_id: head,
      submitted_at: '2026-08-30T10:00:00Z',
    };

    await run(
      harness,
      context({
        runId: 100n,
        eventName: 'pull_request_review',
        action: 'submitted',
        actor: 'contributor',
        review,
      }),
    );

    expect(harness.state.pullGets).toBe(0);
    expect(harness.state.statuses).toEqual([]);
  });

  it('rejects ordinary comments before any API work', async () => {
    const harness = createHarness();
    const ordinaryComment = {
      user: {login: 'contributor'},
      body: 'Looks good to me',
    };

    expect(isCommandComment('issue_comment', {comment: ordinaryComment})).toBe(
      false,
    );
    await run(
      harness,
      context({
        runId: 100n,
        eventName: 'issue_comment',
        comment: ordinaryComment,
      }),
    );
    expect(harness.state.pullGets).toBe(0);
  });
});
