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
  baseRef = 'main',
  stack = null,
  associatedPulls = [],
  filesForBase,
  onPullGet,
  onCreateStatus,
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
    reads: [],
    // Ordered reads of this pull request and mutations.
    log: [],
    labels: new Set(labels),
    knownLabels: new Set(labels),
    pr: {
      number: 17,
      node_id: 'PR_node',
      state: 'open',
      merged_at: null,
      user: {login: author},
      head: {sha: head, repo: {full_name: headRepository}},
      base: {
        sha: '2222222222222222222222222222222222222222',
        ref: baseRef,
        repo: {full_name: repository, default_branch: 'main'},
      },
      changed_files: files.length,
      labels: [],
      auto_merge: autoMerge,
      draft,
      stack,
    },
    // Other pull requests, keyed by number, for same-head sibling lookups.
    otherPulls: new Map(associatedPulls.map(pull => [pull.number, pull])),
  };

  function syncLabels() {
    state.pr.labels = [...state.labels].map(name => ({name}));
  }
  syncLabels();

  const methods = {
    getPull: async ({pull_number: number} = {}) => {
      if (number !== undefined && number !== state.pr.number) {
        state.reads.push(`pull:${number}`);
        return {data: state.otherPulls.get(number)};
      }
      state.pullGets += 1;
      state.reads.push('pull');
      state.log.push('read:pull');
      onPullGet?.(state.pullGets, state);
      syncLabels();
      // Each read is a fresh object, as from the API; a snapshot never
      // silently tracks later changes.
      return {data: structuredClone(state.pr)};
    },
    listFiles: async () => ({
      data: filesForBase?.[state.pr.base.ref] ?? files,
    }),
    listReviews: async () => ({data: state.reviews}),
    listComments: async () => ({data: state.comments}),
    listTimeline: async () => ({data: state.timeline}),
    listStatuses: async ({ref}) => {
      state.reads.push('statuses');
      return {data: state.statuses.filter(status => status.sha === ref)};
    },
  };

  const github = {
    paginate: async (method, options) => (await method(options)).data,
    rest: {
      pulls: {
        get: methods.getPull,
        // The real list endpoint omits `stack` and `changed_files`.
        list: async () => ({
          data: [state.pr, ...state.otherPulls.values()]
            .filter(pull => pull.state === 'open')
            .map(({stack: _stack, changed_files: _files, ...listed}) => listed),
        }),
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
          state.log.push('write:create-label');
        },
        addLabels: async ({labels: added}) => {
          for (const name of added) state.labels.add(name);
          syncLabels();
          state.calls.push(`add-label:${added.join(',')}`);
          state.log.push('write:add-label');
        },
        removeLabel: async ({name}) => {
          state.log.push('write:remove-label');
          if (!state.labels.delete(name)) {
            const error = new Error('Not found');
            error.status = 404;
            throw error;
          }
          syncLabels();
          state.calls.push(`remove-label:${name}`);
        },
        createComment: async ({body}) => {
          state.comments.push({
            user: {login: 'github-actions[bot]'},
            body,
            created_at: '2026-08-30T10:00:30Z',
          });
          state.calls.push('create-comment');
          state.log.push('write:create-comment');
          return {data: {body}};
        },
      },
      repos: {
        // The real endpoint returns list-shaped pull requests (no `stack`).
        // Like GitHub, commit association never lists a fork pull request.
        listPullRequestsAssociatedWithCommit: async ({commit_sha: sha}) => ({
          data: [state.pr, ...state.otherPulls.values()]
            .filter(
              pull =>
                pull.head.sha === sha &&
                pull.head.repo.full_name === repository,
            )
            .map(({stack: _stack, ...listed}) => listed),
        }),
        listCommitStatusesForRef: methods.listStatuses,
        createCommitStatus: async input => {
          state.log.push(`write:status:${input.context}`);
          onCreateStatus?.(input, state);
          state.reads.push(`status:${input.context}:${input.state}`);
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
      state.log.push('write:graphql');
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
const componentRecord = {
  filename: 'packages/core/src/Button/Button.spec.md',
  status: 'modified',
};
function currentComponentSpec(decision, body = 'Body.') {
  return `---\nkind: component\nauthority: current\n---\n\n## Design relationships\n\n${body}\n\n### Design decisions\n\n<!-- design-decisions:v1 -->\n\n| ID | Decision | Intent or reason | Applies to | Allowed variation |\n| --- | --- | --- | --- | --- |\n| DD1 | ${decision} | Preserve emphasis. | Default state | Theme tokens may vary. |\n\n### Theming anatomy\n`;
}

// Exact-head approval by a real spec owner. The auto-merge mechanics below
// need an approved head; they must not borrow the design self-attestation.
const specOwnerReview = {
  user: {login: 'imdreamrunner'},
  state: 'APPROVED',
  commit_id: head,
  submitted_at: '2026-08-30T09:59:00Z',
};

function createApprovedHarness(options = {}) {
  return createHarness({reviews: [specOwnerReview], ...options});
}

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
  it('never lets an ENGOWNER author self-attest their own head', async () => {
    const harness = createHarness();

    await run(harness, context({runId: 100n}));

    expect(
      harness.state.statuses.some(status =>
        status.context.startsWith('spec-owner-ready/'),
      ),
    ).toBe(false);
    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'pending',
      description: expect.stringContaining('engineering owner'),
    });
    expect(harness.state.calls).not.toContain('enable-auto-merge');
    expect(harness.state.pr.auto_merge).toBe(null);
  });

  it('keeps a DESIGNOWNER ready attestation out of the spec approval group', async () => {
    const harness = createHarness({
      author: 'ernestt',
      headContent: 'kind: architecture\nauthority: current\n',
    });

    await run(
      harness,
      context({runId: 100n, actor: 'ernestt', author: 'ernestt'}),
    );

    // The attestation is published for the design group, and the non-design
    // group still waits for a real exact-head engineering-owner decision.
    expect(hasReadyAttestation(harness.state)).toBe(true);
    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'pending',
      description: expect.stringContaining('engineering owner'),
    });
    expect(harness.state.calls).not.toContain('enable-auto-merge');
  });

  it('clears the gate on an exact-head ENGOWNER review', async () => {
    const harness = createApprovedHarness();

    await run(harness, context({runId: 100n}));

    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'success',
      description: expect.stringContaining('Approved by @imdreamrunner'),
    });
    expect(harness.state.calls).toContain('enable-auto-merge');
  });

  it('accepts every current ENGOWNER for a non-design spec', async () => {
    const review = {
      user: {login: 'josephfarina'},
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
        actor: 'josephfarina',
        review,
      }),
    );

    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'success',
      description: expect.stringContaining('Approved by @josephfarina'),
    });
  });

  it('does not let a DESIGNOWNER approve a non-design spec', async () => {
    const review = {
      user: {login: 'ernestt'},
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
        actor: 'ernestt',
        review,
      }),
    );

    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'pending',
      description: expect.stringContaining('engineering owner'),
    });
    expect(harness.state.calls).not.toContain('enable-auto-merge');
  });

  it('lets a DESIGNOWNER approve a visual spec', async () => {
    const review = {
      user: {login: 'ernestt'},
      state: 'APPROVED',
      commit_id: head,
      submitted_at: '2026-08-30T10:00:00Z',
    };
    const harness = createDesignHarness({
      author: 'outside-contributor',
      reviews: [review],
    });

    await run(
      harness,
      context({
        runId: 100n,
        eventName: 'pull_request_review',
        action: 'submitted',
        actor: 'ernestt',
        author: 'outside-contributor',
        review,
      }),
    );

    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'success',
      description: expect.stringContaining('Approved by @ernestt'),
    });
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

  it('lets a DESIGNOWNER author self-attest an exact DD-only component spec head', async () => {
    const harness = createHarness({
      author: 'ernestt',
      changedFile: componentRecord,
      baseContent: currentComponentSpec('Use a quiet label.'),
      headContent: currentComponentSpec('Keep the label quiet.'),
    });

    await run(
      harness,
      context({runId: 100n, actor: 'ernestt', author: 'ernestt'}),
    );

    expect(hasReadyAttestation(harness.state)).toBe(true);
    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'success',
      description: expect.stringContaining('Approved by @ernestt'),
    });
  });

  it('keeps mixed DD and component-contract edits waiting for engineering', async () => {
    const harness = createHarness({
      author: 'ernestt',
      changedFile: componentRecord,
      baseContent: currentComponentSpec('Use a quiet label.'),
      headContent: currentComponentSpec(
        'Keep the label quiet.',
        'Changed behavioral contract.',
      ),
    });

    await run(
      harness,
      context({runId: 100n, actor: 'ernestt', author: 'ernestt'}),
    );

    expect(hasReadyAttestation(harness.state)).toBe(true);
    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'pending',
      description: expect.stringContaining('engineering owner'),
    });
    expect(harness.state.calls).not.toContain('enable-auto-merge');
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

  it.each([
    'packages/core/src/__tests__/TopLevel.spec.md',
    'packages/core/src/Button/.hidden/Hidden.spec.md',
    'packages/core/src/Button/.Hidden.spec.md',
    'packages/core/src/Button/generated/Generated.spec.md',
  ])('does not owner-gate ignored component spec path %s', async filename => {
    const harness = createHarness({
      changedFile: {filename, status: 'added'},
      headContent: 'kind: module\nauthority: current\n',
    });

    await run(harness, context({runId: 100n, action: 'synchronize'}));

    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'success',
      description: 'No knowledge records changed.',
    });
    expect(harness.state.calls).not.toContain('enable-auto-merge');
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
    const harness = createApprovedHarness({
      onEnableAutoMerge: () => {
        const error = new Error('Resource not accessible by integration');
        error.status = 403;
        throw error;
      },
    });

    await run(harness, context({runId: 100n}));

    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'success',
      description: expect.stringContaining('Approved by @imdreamrunner'),
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
    const harness = createApprovedHarness({
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
    const harness = createApprovedHarness({
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
      '\n      }\n    }\n\n    if (enabledAutoMergeByThisRun)',
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
    const harness = createApprovedHarness();
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
    const harness = createApprovedHarness({
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

  describe('a settled head is never re-decided', () => {
    it('publishes nothing once the pull request has merged', async () => {
      const harness = createApprovedHarness();
      harness.state.pr.merged_at = '2026-08-30T09:58:00Z';
      harness.state.pr.state = 'closed';

      await run(harness, context({runId: 100n}));

      expect(harness.state.statuses).toEqual([]);
      expect(harness.state.calls).toEqual([
        'info:The pull request is already merged or closed; the gate does not rewrite a settled head.',
      ]);
    });

    it('publishes nothing once the pull request has closed unmerged', async () => {
      const harness = createApprovedHarness();
      harness.state.pr.state = 'closed';

      await run(harness, context({runId: 100n}));

      expect(harness.state.statuses).toEqual([]);
      expect(harness.state.calls).not.toContain(
        'status:spec-owner-approval:pending',
      );
    });

    it('does not upgrade a head that merges while the run reconciles', async () => {
      // The incident shape: the owner event arrives, the pull request merges
      // unapproved, and the late run must not write approval onto that head.
      const harness = createApprovedHarness({
        onPullGet: (count, state) => {
          if (count >= 3) {
            state.pr.merged_at = '2026-08-30T10:00:15Z';
            state.pr.state = 'closed';
          }
        },
      });

      await run(harness, context({runId: 100n}));

      expect(
        harness.state.statuses.some(
          status =>
            status.context === 'spec-owner-approval' &&
            status.state === 'success',
        ),
      ).toBe(false);
      expect(harness.state.calls).not.toContain('enable-auto-merge');
      expect(
        harness.state.calls.some(call =>
          call.includes('settled while this run reconciled'),
        ),
      ).toBe(true);
    });

    it('reports a success that raced the merge and stops before auto-merge', async () => {
      // The window between the last read and the write cannot be closed with
      // GitHub's APIs. When it loses, the run must say so and go no further.
      let publishedAt = null;
      const harness = createApprovedHarness({
        onPullGet: (count, state) => {
          if (publishedAt !== null && count > publishedAt) {
            state.pr.merged_at = '2026-08-30T10:00:20Z';
            state.pr.state = 'closed';
          }
        },
        onCreateStatus: (input, state) => {
          if (
            input.context === 'spec-owner-approval' &&
            input.state === 'success'
          ) {
            publishedAt = state.pullGets;
          }
        },
      });

      await run(harness, context({runId: 100n}));

      expect(harness.state.calls).not.toContain('enable-auto-merge');
      expect(harness.state.pr.auto_merge).toBe(null);
      expect(
        harness.state.calls.some(call =>
          call.includes('treat that status as unverified'),
        ),
      ).toBe(true);
    });

    it('reads the live pull request as the last call before publishing', async () => {
      const harness = createApprovedHarness();

      await run(harness, context({runId: 100n}));

      const reads = harness.state.reads;
      const publish = reads.indexOf('status:spec-owner-approval:success');
      expect(publish).toBeGreaterThan(0);
      expect(reads[publish - 1]).toBe('pull');
    });

    it('does not enable auto-merge on a head that settled after the status landed', async () => {
      // Past the terminal write and its verification, the enable path has its
      // own read; that read must also refuse a settled pull request.
      let publishedAt = null;
      const harness = createApprovedHarness({
        onPullGet: (count, state) => {
          if (publishedAt !== null && count >= publishedAt + 2) {
            state.pr.merged_at = '2026-08-30T10:00:25Z';
            state.pr.state = 'closed';
          }
        },
        onCreateStatus: (input, state) => {
          if (
            input.context === 'spec-owner-approval' &&
            input.state === 'success'
          ) {
            publishedAt = state.pullGets;
          }
        },
      });

      await run(harness, context({runId: 100n}));

      expect(latestGateStatus(harness.state).state).toBe('success');
      expect(harness.state.calls).not.toContain('enable-auto-merge');
      expect(harness.state.pr.auto_merge).toBe(null);
    });
  });

  it('ignores a ready marker from a handle that is not a design owner', async () => {
    // Live shape from PR #5543: an engineering owner marked their own PR ready
    // before the design-only rule, leaving a trusted spec-owner-ready status on the
    // head. It must not satisfy the design group it is not a member of.
    const harness = createDesignHarness({
      author: 'imdreamrunner',
      statuses: [
        trustedStatus({
          runId: 90n,
          statusContext: 'spec-owner-ready/imdreamrunner',
          state: 'success',
          description: 'Owner ready at 2026-09-04T05:54:18.000Z.',
        }),
      ],
    });

    await run(
      harness,
      context({
        runId: 100n,
        action: 'synchronize',
        actor: 'imdreamrunner',
        author: 'imdreamrunner',
      }),
    );

    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'pending',
      description: expect.stringContaining('design approver'),
    });
    expect(harness.state.calls).not.toContain('enable-auto-merge');
  });

  it('still honours a ready marker from a current design owner', async () => {
    const harness = createDesignHarness({
      statuses: [
        trustedStatus({
          runId: 90n,
          statusContext: 'spec-owner-ready/ernestt',
          state: 'success',
          description: 'Owner ready at 2026-08-30T09:59:00.000Z.',
        }),
      ],
    });

    await run(
      harness,
      context({
        runId: 100n,
        action: 'synchronize',
        actor: 'ernestt',
        author: 'ernestt',
      }),
    );

    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'success',
      description: expect.stringContaining('@ernestt'),
    });
  });

  it('does not restore a newer run\u2019s status onto a settled head', async () => {
    // Yielding writes too. If the pull request merged while this run worked,
    // the newer run's status is no more publishable than this run's own.
    const harness = createApprovedHarness({
      statuses: [trustedStatus({runId: 101n, state: 'success'})],
      onPullGet: (count, state) => {
        if (count >= 2) {
          state.pr.merged_at = '2026-08-30T10:00:10Z';
          state.pr.state = 'closed';
        }
      },
    });

    await run(harness, context({runId: 100n}));

    expect(
      harness.state.statuses.filter(
        status =>
          status.context === 'spec-owner-approval' &&
          status.target_url === canonicalRunUrl(repository, '101', '1'),
      ),
    ).toHaveLength(1);
    expect(harness.state.calls).not.toContain('enable-auto-merge');
  });

  it('still restores a newer run\u2019s status on a live head', async () => {
    const harness = createApprovedHarness({
      statuses: [trustedStatus({runId: 101n, state: 'success'})],
    });

    await run(harness, context({runId: 100n}));

    expect(latestGateStatus(harness.state)).toMatchObject({
      state: 'success',
      target_url: canonicalRunUrl(repository, '101', '1'),
    });
    expect(
      harness.state.calls.some(call => call.includes('yielded to newer run')),
    ).toBe(true);
  });

  describe('a backfill run publishes status without landing anything', () => {
    function backfillContext(runId) {
      return {
        actor: 'cixzhang',
        eventName: 'workflow_dispatch',
        runId,
        runAttempt: 1,
        repo: {owner: 'facebook', repo: 'astryx'},
        payload: {inputs: {pr: '17', backfill: true}},
      };
    }

    it('publishes the missing status and never enables auto-merge', async () => {
      const harness = createApprovedHarness();

      await run(harness, backfillContext(100n));

      expect(latestGateStatus(harness.state)).toMatchObject({
        state: 'success',
        description: expect.stringContaining('Approved by @imdreamrunner'),
      });
      expect(harness.state.calls).not.toContain('enable-auto-merge');
      expect(harness.state.pr.auto_merge).toBe(null);
      expect(
        harness.state.calls.some(call => call.includes('Backfill run')),
      ).toBe(true);
    });

    it('still enables auto-merge on an ordinary dispatch', async () => {
      const harness = createApprovedHarness();
      const ordinary = backfillContext(100n);
      ordinary.payload.inputs.backfill = false;

      await run(harness, ordinary);

      expect(harness.state.calls).toContain('enable-auto-merge');
    });

    it('treats a string input the same way the form submits it', async () => {
      const harness = createApprovedHarness();
      const stringInput = backfillContext(100n);
      stringInput.payload.inputs.backfill = 'true';

      await run(harness, stringInput);

      expect(harness.state.calls).not.toContain('enable-auto-merge');
    });

    it('still refuses to publish onto an already merged head', async () => {
      const harness = createApprovedHarness();
      harness.state.pr.merged_at = '2026-08-30T09:00:00Z';
      harness.state.pr.state = 'closed';

      await run(harness, backfillContext(100n));

      expect(harness.state.statuses).toEqual([]);
    });
  });

  describe('an owner command that misses the exact head is answered', () => {
    function commandRun(body, harness = createHarness()) {
      const comment = {
        user: {login: 'cixzhang'},
        body,
        created_at: '2026-08-30T10:00:00Z',
      };
      harness.state.comments.push(comment);
      return {
        harness,
        comment,
        promise: run(
          harness,
          context({
            runId: 100n,
            eventName: 'issue_comment',
            action: 'created',
            comment,
          }),
        ),
      };
    }

    it.each([
      ['/approve-spec', 'did not name a commit'],
      ['/approve-spec abc1234', 'full 40-character commit SHA'],
      [`/approve-spec ${nextHead}`, 'is not the current head'],
    ])('answers %s instead of ignoring it', async (body, reason) => {
      const {harness, promise} = commandRun(body);
      await promise;

      const help = harness.state.comments.at(-1);
      expect(harness.state.calls).toContain('create-comment');
      expect(help.body).toContain(`<!-- spec-owner-command-help:${head} -->`);
      expect(help.body).toContain(reason);
      expect(help.body).toContain(`/approve-spec ${head}`);
      expect(latestGateStatus(harness.state).state).toBe('pending');
      expect(harness.state.calls).not.toContain('enable-auto-merge');
    });

    it('names the revoke verb the owner actually used', async () => {
      const {harness, promise} = commandRun('/revoke-spec');
      await promise;

      expect(harness.state.comments.at(-1).body).toContain(
        `/revoke-spec ${head}`,
      );
    });

    it('answers a given head only once', async () => {
      const {harness, promise} = commandRun('/approve-spec');
      await promise;
      const {promise: second} = commandRun('/approve-spec', harness);
      await second;

      expect(
        harness.state.calls.filter(call => call === 'create-comment'),
      ).toHaveLength(1);
    });

    it('stays quiet when the command names the exact head', async () => {
      const {harness, promise} = commandRun(`/approve-spec ${head}`);
      await promise;

      expect(harness.state.calls).not.toContain('create-comment');
      expect(latestGateStatus(harness.state).state).toBe('success');
    });
  });

  describe('pull requests stacked on another branch', () => {
    const lower = 'feature/lower';
    const scopedContext = 'spec-owner-approval/stacked-pr-17';
    const statusesFor = (state, statusContext) =>
      state.statuses.filter(status => status.context === statusContext);
    const latestFor = (state, statusContext) =>
      state.statuses.find(status => status.context === statusContext);
    const sibling = ({number = 18, baseRef = 'main', stack = null} = {}) => ({
      number,
      state: 'open',
      merged_at: null,
      user: {login: 'someone'},
      head: {sha: head, repo: {full_name: repository}},
      base: {
        sha: '3333333333333333333333333333333333333333',
        ref: baseRef,
        repo: {full_name: repository, default_branch: 'main'},
      },
      stack,
    });
    const nativeTrunk = {base: {ref: 'main', sha: '4'.repeat(40)}};

    it('publishes a scoped context and never the required one', async () => {
      const harness = createHarness({baseRef: lower});

      await run(harness, context({runId: 100n}));

      expect(latestFor(harness.state, scopedContext)).toMatchObject({
        state: 'pending',
        description: expect.stringContaining('engineering owner'),
      });
      expect(statusesFor(harness.state, 'spec-owner-approval')).toEqual([]);
      expect(harness.state.labels.has('needs:spec-owner-review')).toBe(true);
    });

    it('does not let an older-head approval clear the scoped context', async () => {
      const harness = createHarness({
        baseRef: lower,
        reviews: [{...specOwnerReview, commit_id: nextHead}],
      });

      await run(harness, context({runId: 100n}));

      expect(latestFor(harness.state, scopedContext).state).toBe('pending');
    });

    it('gives a native stack rung on main the required context', async () => {
      const harness = createApprovedHarness({
        baseRef: lower,
        stack: nativeTrunk,
      });

      await run(harness, context({runId: 100n}));

      expect(latestFor(harness.state, 'spec-owner-approval')).toMatchObject({
        state: 'success',
        description: expect.stringContaining('Approved by @imdreamrunner'),
      });
      expect(statusesFor(harness.state, scopedContext)).toEqual([]);
      // A rung merges through its stack, never through gate auto-merge.
      expect(harness.state.calls).not.toContain('enable-auto-merge');
    });

    it('keeps the bottom rung of a stack out of gate auto-merge', async () => {
      const harness = createApprovedHarness({stack: nativeTrunk});

      await run(harness, context({runId: 100n}));

      expect(latestFor(harness.state, 'spec-owner-approval').state).toBe(
        'success',
      );
      expect(harness.state.calls).not.toContain('enable-auto-merge');
    });

    describe('two pull requests with the same head', () => {
      it('leaves the main pull request required context to its own decision when the other is a manual stack', async () => {
        const harness = createApprovedHarness({
          associatedPulls: [sibling({baseRef: lower})],
        });

        await run(harness, context({runId: 100n}));

        expect(latestFor(harness.state, 'spec-owner-approval')).toMatchObject({
          state: 'success',
          description: expect.stringContaining('Approved by'),
        });
        expect(harness.state.calls).toContain('enable-auto-merge');
      });

      it('never writes the required context from the manual stack', async () => {
        const harness = createApprovedHarness({
          baseRef: lower,
          associatedPulls: [sibling()],
        });

        await run(harness, context({runId: 100n}));

        expect(latestFor(harness.state, scopedContext).state).toBe('success');
        expect(statusesFor(harness.state, 'spec-owner-approval')).toEqual([]);
      });

      it('holds a shared required context pending when both read it', async () => {
        const harness = createApprovedHarness({
          associatedPulls: [sibling({baseRef: lower, stack: nativeTrunk})],
        });

        await run(harness, context({runId: 100n}));

        expect(latestFor(harness.state, 'spec-owner-approval')).toMatchObject({
          state: 'pending',
          description: `Head ${head.slice(0, 7)} is shared with open PR #18; each needs its own head.`,
        });
        expect(harness.state.calls).not.toContain('enable-auto-merge');
      });

      it('scopes a stacked ready attestation so the other pull request never reads it', async () => {
        const stackedReady = createDesignHarness({baseRef: lower});
        await run(
          stackedReady,
          context({runId: 100n, actor: 'ernestt', author: 'ernestt'}),
        );
        expect(
          stackedReady.state.statuses.map(status => status.context),
        ).toContain('spec-owner-ready/stacked-pr-17/ernestt');
        expect(hasReadyAttestation(stackedReady.state)).toBe(false);

        // The main pull request with the same head sees only that scoped marker.
        const mainPull = createDesignHarness({
          statuses: stackedReady.state.statuses.filter(status =>
            status.context.startsWith('spec-owner-ready/'),
          ),
        });
        await run(mainPull, context({runId: 101n, action: 'synchronize'}));
        expect(latestFor(mainPull.state, 'spec-owner-approval').state).toBe(
          'pending',
        );
      });
    });

    it('retires its own pending scoped status after a retarget onto main', async () => {
      const harness = createApprovedHarness({
        statuses: [trustedStatus({runId: 90n, statusContext: scopedContext})],
      });

      await run(harness, context({runId: 100n, action: 'edited'}));

      expect(latestFor(harness.state, scopedContext)).toMatchObject({
        state: 'success',
        description: expect.stringContaining('Superseded'),
      });
      expect(latestFor(harness.state, 'spec-owner-approval').state).toBe(
        'success',
      );
    });

    describe('a pull request that moves while it is reconciled', () => {
      it('starts over when a retarget with an equal file count lands mid-read', async () => {
        // Both bases report one changed file, so only identity notices.
        const harness = createHarness({
          filesForBase: {
            main: [
              {filename: 'docs/specs/owner-ready/spec.md', status: 'added'},
            ],
            [lower]: [{filename: 'README.md', status: 'modified'}],
          },
          onPullGet: (count, state) => {
            if (count === 3) state.pr.base.ref = lower;
          },
        });

        await run(harness, context({runId: 100n}));

        expect(latestFor(harness.state, scopedContext)).toMatchObject({
          state: 'success',
          description: 'No knowledge records changed.',
        });
        // The abandoned main-based attempt never published a decision.
        expect(
          statusesFor(harness.state, 'spec-owner-approval').map(
            status => status.state,
          ),
        ).toEqual(['pending']);
      });

      it('reconciles again when the base SHA moves before the terminal write', async () => {
        const harness = createApprovedHarness({
          onPullGet: (count, state) => {
            if (count === 5) state.pr.base.sha = '5'.repeat(40);
          },
        });

        await run(harness, context({runId: 100n}));

        expect(
          statusesFor(harness.state, 'spec-owner-approval').filter(
            status => status.state === 'success',
          ),
        ).toHaveLength(1);
        expect(
          harness.state.calls.some(call => call.includes('Reconciling again')),
        ).toBe(true);
        expect(harness.state.calls).toContain('enable-auto-merge');
      });

      it('fails without a decision when the base never stops moving', async () => {
        let tick = 0;
        const harness = createApprovedHarness({
          onPullGet: (_count, state) => {
            tick += 1;
            state.pr.base.sha = tick.toString(16).padStart(40, '0');
          },
        });

        await expect(run(harness, context({runId: 100n}))).rejects.toThrow(
          'kept moving',
        );
        expect(
          statusesFor(harness.state, 'spec-owner-approval').every(
            status => status.state === 'pending',
          ),
        ).toBe(true);
        expect(harness.state.calls).not.toContain('enable-auto-merge');
      });

      it('never enables auto-merge after a retarget lands behind the decision', async () => {
        const harness = createApprovedHarness({
          onPullGet: (_count, state) => {
            if (state.calls.includes('status:spec-owner-approval:success')) {
              state.pr.base.ref = lower;
            }
          },
        });

        await run(harness, context({runId: 100n}));

        expect(harness.state.calls).not.toContain('enable-auto-merge');
        expect(harness.state.pr.auto_merge).toBe(null);
        expect(latestFor(harness.state, scopedContext).state).toBe('success');
      });

      it('withdraws its own enable when a retarget races the mutation', async () => {
        const harness = createApprovedHarness({
          onEnableAutoMerge: state => {
            state.pr.base.ref = lower;
          },
        });

        await run(harness, context({runId: 100n}));

        expect(harness.state.calls.indexOf('enable-auto-merge')).toBeLessThan(
          harness.state.calls.lastIndexOf('disable-auto-merge'),
        );
        expect(harness.state.pr.auto_merge).toBe(null);
        expect(harness.state.labels.has('spec-auto-merge')).toBe(false);
      });
    });

    describe('auto-merge', () => {
      it('withdraws gate-owned auto-merge before publishing a stacked approval', async () => {
        const harness = createApprovedHarness({
          baseRef: lower,
          labels: ['spec-auto-merge'],
          autoMerge: {merge_method: 'squash'},
        });

        await run(harness, context({runId: 100n, action: 'edited'}));

        const disabled = harness.state.calls.indexOf('disable-auto-merge');
        const published = harness.state.calls.indexOf(
          `status:${scopedContext}:success`,
        );
        expect(disabled).toBeGreaterThan(-1);
        expect(published).toBeGreaterThan(disabled);
        expect(harness.state.calls).not.toContain('enable-auto-merge');
        expect(harness.state.labels.has('spec-auto-merge')).toBe(false);
      });

      it('withdraws gate-owned auto-merge on a backfill of a stacked pull request', async () => {
        const harness = createApprovedHarness({
          baseRef: lower,
          labels: ['spec-auto-merge'],
          autoMerge: {merge_method: 'squash'},
        });

        await run(harness, {
          actor: 'cixzhang',
          eventName: 'workflow_dispatch',
          runId: 100n,
          runAttempt: 1,
          repo: {owner: 'facebook', repo: 'astryx'},
          payload: {inputs: {pr: '17', backfill: true}},
        });

        expect(harness.state.pr.auto_merge).toBe(null);
        expect(harness.state.labels.has('spec-auto-merge')).toBe(false);
      });

      it('leaves auto-merge a person enabled on a stacked pull request alone', async () => {
        const harness = createApprovedHarness({
          baseRef: lower,
          autoMerge: {merge_method: 'squash'},
        });

        await run(
          harness,
          context({runId: 100n, action: 'auto_merge_enabled'}),
        );

        expect(harness.state.calls).not.toContain('disable-auto-merge');
        expect(harness.state.pr.auto_merge).toEqual({merge_method: 'squash'});
      });
    });
  });

  describe('re-reads the pull request before every mutation', () => {
    // The initial pending marker follows the run's first read directly, and a
    // repository label creation is not a pull request mutation.
    function unguardedWrites(log) {
      const unguarded = [];
      let readSinceWrite = false;
      for (const entry of log) {
        if (entry === 'read:pull') readSinceWrite = true;
        else if (entry.startsWith('write:')) {
          if (entry === 'write:create-label') continue;
          if (!readSinceWrite) unguarded.push(entry);
          readSinceWrite = false;
        }
      }
      return unguarded;
    }

    it.each([
      ['an approved spec-only change', () => createApprovedHarness(), {}],
      [
        'a stacked approval withdrawing gate-owned auto-merge',
        () =>
          createApprovedHarness({
            baseRef: 'feature/lower',
            labels: ['spec-auto-merge'],
            autoMerge: {merge_method: 'squash'},
          }),
        {action: 'edited'},
      ],
      ['a change awaiting owner approval', () => createHarness(), {}],
      [
        'a design owner attesting ready',
        () => createDesignHarness(),
        {actor: 'ernestt', author: 'ernestt'},
      ],
      [
        'an inexact owner command',
        () => createHarness(),
        {
          eventName: 'issue_comment',
          comment: {
            user: {login: 'cixzhang'},
            body: '/approve-spec',
            created_at: '2026-08-30T10:00:00Z',
          },
        },
      ],
    ])('for %s', async (_name, makeHarness, overrides) => {
      const harness = makeHarness();

      await run(harness, context({runId: 100n, ...overrides}));

      expect(harness.state.log.some(entry => entry.startsWith('write:'))).toBe(
        true,
      );
      expect(unguardedWrites(harness.state.log)).toEqual([]);
    });

    it('holds a shared required context pending for a fork pull request on the same head', async () => {
      // Commit association never lists the fork; only the open scan finds it.
      const harness = createApprovedHarness({
        associatedPulls: [
          {
            number: 6744,
            state: 'open',
            merged_at: null,
            user: {login: 'someone'},
            head: {sha: head, repo: {full_name: 'someone/astryx'}},
            base: {
              sha: '3333333333333333333333333333333333333333',
              ref: 'main',
              repo: {full_name: repository, default_branch: 'main'},
            },
            stack: null,
          },
        ],
      });

      await run(harness, context({runId: 100n}));

      expect(latestGateStatus(harness.state)).toMatchObject({
        state: 'pending',
        description: `Head ${head.slice(0, 7)} is shared with open PR #6744; each needs its own head.`,
      });
      expect(harness.state.calls).not.toContain('enable-auto-merge');
    });

    it('stops before a label change when the base moves on its guard read', async () => {
      const harness = createHarness({
        onPullGet: (count, state) => {
          // Reads 1-4 start the attempt and take the snapshot; read 5 guards
          // the first mutation after it.
          if (count === 5) state.pr.base.sha = '6'.repeat(40);
        },
      });

      await run(harness, context({runId: 100n}));

      expect(unguardedWrites(harness.state.log)).toEqual([]);
      expect(
        harness.state.calls.some(call => call.includes('Reconciling again')),
      ).toBe(true);
      expect(latestGateStatus(harness.state)).toMatchObject({
        state: 'pending',
        description: expect.stringContaining('engineering owner'),
      });
    });
  });
});
