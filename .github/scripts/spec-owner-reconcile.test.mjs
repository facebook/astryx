// Copyright (c) Meta Platforms, Inc. and affiliates.

/* global Buffer */

import {createRequire} from 'node:module';
import fs from 'node:fs';
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
  headRepository = repository,
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
              head: {
                sha: headSha,
                repo: {full_name: headRepository},
              },
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
  headRepository = repository,
  statuses = [],
  comments = [],
  reviews = [],
  timeline = [],
  labels = [],
  autoMerge = null,
  draft = false,
  onPullGet,
  onEnableAutoMerge,
  changedFile = {
    filename: 'docs/specs/owner-ready/spec.md',
    status: 'added',
  },
  changedFiles,
  headContent = 'kind: architecture\nauthority: current\n',
  baseContent = '',
} = {}) {
  const files = changedFiles ?? [changedFile];
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
      head: {sha: head, repo: {full_name: headRepository}},
      base: {
        sha: '2222222222222222222222222222222222222222',
        repo: {full_name: repository},
      },
      changed_files: files.length,
      labels: [],
      auto_merge: autoMerge,
      draft,
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
    listFiles: async () => ({data: files}),
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
              ref === state.pr.head.sha ? headContent : baseContent,
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

async function run(harness, runContext) {
  await reconcileSpecOwnerGate({
    github: harness.github,
    context: runContext,
    core: harness.core,
    workspace,
    env,
  });
}

function latestGateStatus(state) {
  return state.statuses.find(
    status => status.context === 'spec-owner-approval',
  );
}

const designRecord = {
  filename: 'docs/design/interaction-states.md',
  status: 'added',
};
const currentDesign = 'kind: design\nauthority: current\n';

function createDesignHarness(options = {}) {
  return createHarness({
    author: 'ernestt',
    changedFile: designRecord,
    headContent: currentDesign,
    ...options,
  });
}

function hasReadyAttestation(state, owner = 'ernestt') {
  return state.statuses.some(
    status => status.context === `spec-owner-ready/${owner}`,
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

  it('lets a DESIGNOWNER author self-attest an exact design-record-only head', async () => {
    const harness = createDesignHarness();

    await run(
      harness,
      context({runId: 100n, actor: 'ernestt', author: 'ernestt'}),
    );

    expect(hasReadyAttestation(harness.state)).toBe(true);
    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'success',
      description: expect.stringContaining('Approved by @ernestt'),
    });
    expect(harness.state.calls).toContain('enable-auto-merge');
  });

  it('requires the ready actor to be the PR author', async () => {
    const harness = createDesignHarness();

    await run(
      harness,
      context({runId: 100n, actor: 'rubyycheung', author: 'ernestt'}),
    );

    expect(hasReadyAttestation(harness.state, 'rubyycheung')).toBe(false);
    expect(latestGateStatus(harness.state).state).toBe('pending');
    expect(harness.state.calls).not.toContain('enable-auto-merge');
  });

  it('requires the ready event to identify the exact live head', async () => {
    const harness = createDesignHarness();

    await run(
      harness,
      context({
        runId: 100n,
        actor: 'ernestt',
        author: 'ernestt',
        headSha: nextHead,
      }),
    );

    expect(hasReadyAttestation(harness.state)).toBe(false);
    expect(latestGateStatus(harness.state).state).toBe('pending');
    expect(harness.state.calls).not.toContain('enable-auto-merge');
  });

  it('keeps a DESIGNOWNER ready marker outside the spec-only auto-merge path', async () => {
    const harness = createDesignHarness({
      changedFiles: [
        designRecord,
        {
          filename: 'packages/core/src/Button/Button.tsx',
          status: 'modified',
        },
      ],
    });

    await run(
      harness,
      context({runId: 100n, actor: 'ernestt', author: 'ernestt'}),
    );

    // The exact-head marker is evidence for applicable owner groups, not merge
    // authority. Mixed code/spec scope must stop before auto-merge enablement.
    expect(hasReadyAttestation(harness.state)).toBe(true);
    expect(latestGateStatus(harness.state).state).toBe('success');
    expect(harness.state.calls).not.toContain('enable-auto-merge');
    expect(harness.state.pr.auto_merge).toBe(null);
  });

  it('requires a real ready transition and never auto-merges a draft PR', async () => {
    const readyDraft = createDesignHarness({draft: true});

    await run(
      readyDraft,
      context({runId: 100n, actor: 'ernestt', author: 'ernestt'}),
    );

    expect(hasReadyAttestation(readyDraft.state)).toBe(true);
    expect(readyDraft.state.calls).not.toContain('enable-auto-merge');
    expect(readyDraft.state.pr.auto_merge).toBe(null);

    const synchronizedDraft = createDesignHarness({draft: true});
    await run(
      synchronizedDraft,
      context({
        runId: 101n,
        action: 'synchronize',
        actor: 'ernestt',
        author: 'ernestt',
      }),
    );

    expect(hasReadyAttestation(synchronizedDraft.state)).toBe(false);
    expect(synchronizedDraft.state.calls).not.toContain('enable-auto-merge');
    expect(synchronizedDraft.state.pr.auto_merge).toBe(null);
  });

  it('publishes owner approval and keeps conservative ownership when enablement is rejected', async () => {
    const harness = createHarness({
      onEnableAutoMerge: () => {
        const error = new Error('Resource not accessible by integration');
        error.status = 403;
        throw error;
      },
    });

    await run(harness, context({runId: 100n}));

    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'success',
      description: expect.stringContaining('Approved by @cixzhang'),
    });
    const terminalStatus = harness.state.calls.indexOf(
      'status:spec-owner-approval:success',
    );
    const warning = harness.state.calls.findIndex(call =>
      call.includes('Could not enable auto-merge'),
    );
    expect(terminalStatus).toBeGreaterThan(-1);
    expect(warning).toBeGreaterThan(terminalStatus);
    expect(harness.state.calls).not.toContain('enable-auto-merge');
    expect(harness.state.labels.has('spec-auto-merge')).toBe(true);
    expect(harness.state.calls).not.toContain('remove-label:spec-auto-merge');
    expect(harness.state.calls).not.toContain('disable-auto-merge');
    expect(harness.state.pr.auto_merge).toBe(null);
  });

  it('preserves the marker when an ambiguous enable error follows a successful mutation', async () => {
    const harness = createHarness({
      onEnableAutoMerge: state => {
        state.pr.auto_merge = {merge_method: 'squash'};
        state.calls.push('auto-merge-applied-before-error');
        const error = new Error('The response was lost after the mutation.');
        error.status = 502;
        throw error;
      },
    });

    await run(harness, context({runId: 100n}));

    expect(latestGateStatus(harness.state).state).toBe('success');
    expect(harness.state.pr.auto_merge).toEqual({merge_method: 'squash'});
    expect(harness.state.labels.has('spec-auto-merge')).toBe(true);
    expect(harness.state.calls).not.toContain('remove-label:spec-auto-merge');
    expect(harness.state.calls).not.toContain('disable-auto-merge');
  });

  it('does not let an old failure erase newer same-head auto-merge ownership', async () => {
    const harness = createHarness({
      onEnableAutoMerge: state => {
        // The old run added the marker, then a newer run for the same exact
        // head enabled auto-merge before the old request returned an error.
        state.statuses.unshift(
          trustedStatus({runId: 101n, sha: head, state: 'success'}),
        );
        state.pr.auto_merge = {merge_method: 'squash'};
        state.labels.add('spec-auto-merge');
        state.pr.labels = [{name: 'spec-auto-merge'}];
        state.calls.push('newer-run-enabled-auto-merge');
        const error = new Error('The old enable request was rejected.');
        error.status = 422;
        throw error;
      },
    });

    await run(harness, context({runId: 100n}));

    expect(
      harness.state.statuses.some(
        status =>
          status.sha === head &&
          status.context === 'spec-owner-approval' &&
          status.state === 'success' &&
          status.target_url === canonicalRunUrl(repository, '100', '1'),
      ),
    ).toBe(true);
    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'success',
      target_url: canonicalRunUrl(repository, '101', '1'),
    });
    expect(harness.state.pr.head.sha).toBe(head);
    expect(harness.state.pr.auto_merge).toEqual({merge_method: 'squash'});
    expect(harness.state.labels.has('spec-auto-merge')).toBe(true);
    const oldMarker = harness.state.calls.indexOf('add-label:spec-auto-merge');
    const newerOwner = harness.state.calls.indexOf(
      'newer-run-enabled-auto-merge',
    );
    expect(oldMarker).toBeGreaterThan(-1);
    expect(newerOwner).toBeGreaterThan(oldMarker);
    expect(harness.state.calls).not.toContain('remove-label:spec-auto-merge');
    expect(harness.state.calls).not.toContain('disable-auto-merge');
  });

  it('keeps terminal approval before a non-destructive enable failure path', () => {
    const source = fs.readFileSync(
      path.join(workspace, '.github/scripts/spec-owner-reconcile.cjs'),
      'utf8',
    );
    const specOnlyPath = source.slice(
      source.indexOf('// Owner approval is the gate decision'),
    );
    const terminalStatus = specOnlyPath.indexOf(
      "setFinalStatus(initialHead, 'success', successDescription)",
    );
    const enable = specOnlyPath.indexOf('enablePullRequestAutoMerge');
    const catchStart = specOnlyPath.indexOf('} catch (error) {', enable);
    const catchEnd = specOnlyPath.indexOf(
      '\n    }\n  }\n\n  if (enabledAutoMergeByThisRun)',
      catchStart,
    );
    const catchBlock = specOnlyPath.slice(catchStart, catchEnd);

    expect(terminalStatus).toBeGreaterThan(-1);
    expect(enable).toBeGreaterThan(terminalStatus);
    expect(catchStart).toBeGreaterThan(enable);
    expect(catchEnd).toBeGreaterThan(catchStart);
    expect(catchBlock).toContain(
      'Leave the conservative ownership marker intact.',
    );
    expect(catchBlock).not.toContain('removeLabel');
    expect(catchBlock).not.toContain('disableAutoMerge');
    expect(catchBlock).not.toContain('cleanupFailedAutoMergeEnable');
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

  it('keeps a current theme change pending without exact-head approval', async () => {
    const harness = createHarness({
      changedFile: {
        filename: 'packages/themes/neutral/neutral.spec.md',
        status: 'added',
      },
      headContent: 'kind: theme\nauthority: current\n',
    });

    await run(
      harness,
      context({
        runId: 100n,
        action: 'synchronize',
        actor: 'rubyycheung',
      }),
    );

    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'pending',
      description: expect.stringContaining('theme approver'),
    });
    expect(harness.state.calls).not.toContain('enable-auto-merge');
    expect(harness.state.pr.auto_merge).toBe(null);
  });

  it.each([
    'docs/themes/neutral.md',
    'packages/themes/neutral/Theme.spec.md',
    'packages/themes/neutral/subdir/neutral.spec.md',
  ])(
    'keeps misplaced current theme candidate %s pending and non-merging',
    async filename => {
      const harness = createHarness({
        changedFile: {filename, status: 'added'},
        headContent: 'kind: theme\nauthority: current\n',
      });

      await run(
        harness,
        context({
          runId: 100n,
          action: 'synchronize',
          actor: 'rubyycheung',
        }),
      );

      expect(latestGateStatus(harness.state)).toMatchObject({
        state: 'pending',
        description: expect.stringContaining('theme approver'),
      });
      expect(harness.state.calls).not.toContain('enable-auto-merge');
      expect(
        harness.state.calls.some(call =>
          call.includes('No knowledge records changed'),
        ),
      ).toBe(false);
    },
  );

  it('accepts an exact-head derived theme-owner review for a current theme record', async () => {
    const review = {
      user: {login: 'rubyycheung'},
      state: 'APPROVED',
      commit_id: head,
      submitted_at: '2026-08-30T10:00:00Z',
    };
    const harness = createHarness({
      changedFile: {
        filename: 'packages/themes/neutral/neutral.spec.md',
        status: 'added',
      },
      headContent:
        'kind: theme\nauthority: current\nadditional_owners: [self-declared-owner]\n',
      reviews: [review],
    });

    await run(
      harness,
      context({
        runId: 100n,
        eventName: 'pull_request_review',
        action: 'submitted',
        actor: 'rubyycheung',
        review,
      }),
    );

    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'success',
      description: expect.stringContaining('@rubyycheung'),
    });
    expect(harness.state.calls).toContain('enable-auto-merge');
  });

  it('accepts an exact-head ENGOWNER review for a current theme record', async () => {
    const review = {
      user: {login: 'czarandy'},
      state: 'APPROVED',
      commit_id: head,
      submitted_at: '2026-08-30T10:00:00Z',
    };
    const harness = createHarness({
      changedFile: {
        filename: 'packages/themes/neutral/neutral.spec.md',
        status: 'added',
      },
      headContent: 'kind: theme\nauthority: current\n',
      reviews: [review],
    });

    await run(
      harness,
      context({
        runId: 100n,
        eventName: 'pull_request_review',
        action: 'submitted',
        actor: 'czarandy',
        review,
      }),
    );

    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'success',
      description: expect.stringContaining('@czarandy'),
    });
    expect(harness.state.calls).toContain('enable-auto-merge');
  });

  it('does not authorize a theme record through its self-declared owners', async () => {
    const review = {
      user: {login: 'self-declared-owner'},
      state: 'APPROVED',
      commit_id: head,
      submitted_at: '2026-08-30T10:00:00Z',
    };
    const harness = createHarness({
      changedFile: {
        filename: 'packages/themes/neutral/neutral.spec.md',
        status: 'added',
      },
      headContent:
        'kind: theme\nauthority: current\nadditional_owners: [self-declared-owner]\n',
      reviews: [review],
    });

    await run(
      harness,
      context({
        runId: 100n,
        eventName: 'pull_request_review',
        action: 'submitted',
        actor: 'self-declared-owner',
        review,
      }),
    );

    expect(harness.state.pullGets).toBe(0);
    expect(harness.state.statuses).toEqual([]);
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

  it('skips fork owner reviews before any GitHub API work', async () => {
    const review = {
      user: {login: 'cixzhang'},
      state: 'APPROVED',
      commit_id: head,
      submitted_at: '2026-08-30T10:00:00Z',
    };
    const messages = [];
    const github = new Proxy(
      {},
      {
        get() {
          throw new Error('GitHub API accessed');
        },
      },
    );

    await reconcileSpecOwnerGate({
      github,
      context: context({
        runId: 100n,
        eventName: 'pull_request_review',
        action: 'submitted',
        headRepository: 'contributor/astryx',
        review,
      }),
      core: {info: message => messages.push(message)},
      workspace,
      env,
    });

    expect(messages).toEqual([
      'Skipping fork pull request review; use an exact-head owner command to reconcile.',
    ]);
  });

  it('reconciles same-repository owner reviews automatically', async () => {
    const review = {
      user: {login: 'cixzhang'},
      state: 'APPROVED',
      commit_id: head,
      submitted_at: '2026-08-30T10:00:00Z',
    };
    const harness = createHarness({reviews: [review]});

    await run(
      harness,
      context({
        runId: 100n,
        eventName: 'pull_request_review',
        action: 'submitted',
        review,
      }),
    );

    expect(harness.state.pullGets).toBeGreaterThan(0);
    expect(latestGateStatus(harness.state).state).toBe('success');
    expect(harness.state.calls).toContain('enable-auto-merge');
  });

  it('reconciles an exact-head owner command for a fork current-spec PR', async () => {
    const comment = {
      user: {login: 'cixzhang'},
      body: `/approve-spec ${head}`,
      created_at: '2026-08-30T10:00:00Z',
    };
    const harness = createHarness({
      headRepository: 'contributor/astryx',
      comments: [comment],
    });

    await run(
      harness,
      context({
        runId: 100n,
        eventName: 'issue_comment',
        action: 'created',
        comment,
      }),
    );

    expect(harness.state.pullGets).toBeGreaterThan(0);
    expect(latestGateStatus(harness.state).state).toBe('success');
    expect(harness.state.calls).toContain('enable-auto-merge');
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
