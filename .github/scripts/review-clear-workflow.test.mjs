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
const review = (state, commitId = head2) => ({
  user: {login: 'engineer'},
  state,
  commit_id: commitId,
});
const gateStatus = (state, description) => ({
  context: 'review-required',
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

function harness(
  reviews,
  {
    labels = ['needs:code-review'],
    moveAfterFirstRead = false,
    statusFailure = false,
    statuses = [pendingGate],
  } = {},
) {
  const calls = [];
  let pullReads = 0;
  const full = {
    number: 17,
    head: {sha: head2},
    base: {sha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'},
    labels: labels.map(name => ({name})),
  };
  const methods = {
    listCommitStatusesForRef: async () => ({data: statuses}),
    listReviews: async () => ({data: reviews}),
  };
  const github = {
    paginate: async (method, options) => (await method(options)).data,
    rest: {
      pulls: {
        get: async () => {
          pullReads += 1;
          return {
            data:
              moveAfterFirstRead && pullReads > 1
                ? {...full, head: {sha: head3}}
                : full,
          };
        },
        list: async () => ({data: []}),
        listReviews: methods.listReviews,
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
        listCommitStatusesForRef: methods.listCommitStatusesForRef,
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
    payload: {
      workflow_run: {
        pull_requests: [{number: 17}],
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
    expect(h.calls).toContain(
      'read:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:.github/scripts/review-signal-decision.cjs',
    );
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
    expect(h.calls).toContainEqual(
      expect.objectContaining({type: 'add-label'}),
    );
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
});
