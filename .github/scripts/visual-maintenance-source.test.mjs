// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CI maintenance source-boundary contracts.
 * @input Independent GitHub response and canonical capture fixtures
 * @output Refusals for foreign, stale, incomplete, or wrongly routed evidence
 * @position Node tests for the publication-only baseline maintenance boundary
 */

import {createHash} from 'node:crypto';

import {describe, expect, it, vi} from 'vitest';

import {
  resolveVisualMaintenanceSource,
  validateVisualMaintenanceCapture,
} from './visual-maintenance-source.mjs';

const SHA = 'a'.repeat(40);
const KEY = 'core-button--default__neutral-light';

function sourceFixture() {
  const workflow = {id: 17, path: '.github/workflows/ci.yml'};
  const run = {
    id: 101,
    run_attempt: 2,
    workflow_id: 17,
    path: '.github/workflows/ci.yml',
    repository: {id: 9, full_name: 'facebook/astryx'},
    head_repository: {id: 9, full_name: 'facebook/astryx'},
    head_branch: 'main',
    head_sha: SHA,
    event: 'workflow_dispatch',
    status: 'completed',
    conclusion: 'success',
  };
  const comparison = {status: 'ahead'};
  const jobs = [
    {
      name: 'Stable visual regression',
      status: 'completed',
      conclusion: 'success',
      steps: [
        {name: 'Validate canonical baseline capture', conclusion: 'success'},
      ],
    },
  ];
  const artifacts = [
    {
      id: 901,
      name: 'visual-baseline-capture-101-2',
      expired: false,
      workflow_run: {
        id: 101,
        repository_id: 9,
        head_repository_id: 9,
        head_branch: 'main',
        head_sha: SHA,
      },
    },
  ];
  const actions = {
    getWorkflow: vi.fn(async () => ({data: workflow})),
    getWorkflowRunAttempt: vi.fn(async () => ({data: run})),
    listJobsForWorkflowRunAttempt: vi.fn(),
    listWorkflowRunArtifacts: vi.fn(),
  };
  const github = {
    rest: {
      actions,
      repos: {
        compareCommitsWithBasehead: vi.fn(async () => ({data: comparison})),
      },
    },
    paginate: vi.fn(async method => {
      if (method === actions.listJobsForWorkflowRunAttempt) return jobs;
      if (method === actions.listWorkflowRunArtifacts) return artifacts;
      throw new Error('Unexpected pagination endpoint');
    }),
  };
  return {workflow, run, comparison, jobs, artifacts, github};
}

const resolve = fixture =>
  resolveVisualMaintenanceSource({
    github: fixture.github,
    owner: 'facebook',
    repo: 'astryx',
    runId: '101',
    runAttempt: '2',
  });

function captureFixture() {
  const keys = [KEY];
  const context = {
    sha: SHA,
    ref: 'refs/heads/main',
    runId: '101',
    runAttempt: '2',
    releasePlan: {
      version: 1,
      lane: 'stable-release',
      authority: 'report-removals',
      keys,
      digest: createHash('sha256').update(JSON.stringify(keys)).digest('hex'),
    },
  };
  return {
    manifest: {
      context,
      shots: {[KEY]: {stableVisual: true, stableThemeVisual: true}},
    },
    verdict: {context: structuredClone(context), status: 'changed'},
    sha: SHA,
    runId: 101,
    runAttempt: 2,
  };
}

describe('CI-owned baseline maintenance source', () => {
  it('resolves the reviewed attempt and exact artifact, not the latest named run', async () => {
    const fx = sourceFixture();
    expect(await resolve(fx)).toEqual({
      artifactId: 901,
      runId: 101,
      runAttempt: 2,
      sha: SHA,
    });
    expect(fx.github.rest.actions.getWorkflow).toHaveBeenCalledWith({
      owner: 'facebook',
      repo: 'astryx',
      workflow_id: 'ci.yml',
    });
    expect(fx.github.rest.actions.getWorkflowRunAttempt).toHaveBeenCalledWith({
      owner: 'facebook',
      repo: 'astryx',
      run_id: 101,
      attempt_number: 2,
    });
    expect(fx.github.paginate).toHaveBeenCalledWith(
      fx.github.rest.actions.listJobsForWorkflowRunAttempt,
      {
        owner: 'facebook',
        repo: 'astryx',
        run_id: 101,
        attempt_number: 2,
        per_page: 100,
      },
    );
  });

  it('allows an explicit complete capture whose comparison failed during browser refresh', async () => {
    const fx = sourceFixture();
    fx.run.conclusion = 'failure';
    fx.jobs[0].conclusion = 'failure';
    expect(await resolve(fx)).toMatchObject({artifactId: 901});
    const capture = captureFixture();
    capture.verdict.status = 'failed';
    capture.verdict.failures = [{key: 'baseline', error: 'browser differs'}];
    expect(() => validateVisualMaintenanceCapture(capture)).not.toThrow();
  });

  it.each([
    [
      'foreign workflow',
      fx => {
        fx.run.workflow_id = 18;
      },
    ],
    [
      'renamed workflow path',
      fx => {
        fx.workflow.path = '.github/workflows/other.yml';
      },
    ],
    [
      'wrong run',
      fx => {
        fx.run.id = 102;
      },
    ],
    [
      'wrong attempt',
      fx => {
        fx.run.run_attempt = 1;
      },
    ],
    [
      'foreign repository',
      fx => {
        fx.run.repository.full_name = 'other/astryx';
      },
    ],
    [
      'fork head',
      fx => {
        fx.run.head_repository.full_name = 'fork/astryx';
      },
    ],
    [
      'mismatched repository id',
      fx => {
        fx.run.head_repository.id = 10;
      },
    ],
    [
      'PR source',
      fx => {
        fx.run.event = 'pull_request';
      },
    ],
    [
      'non-main dispatch',
      fx => {
        fx.run.head_branch = 'feature';
      },
    ],
    [
      'unfinished source',
      fx => {
        fx.run.status = 'in_progress';
      },
    ],
    [
      'canceled source',
      fx => {
        fx.run.conclusion = 'cancelled';
      },
    ],
    [
      'unreachable commit',
      fx => {
        fx.comparison.status = 'diverged';
      },
    ],
    [
      'wrong visual job',
      fx => {
        fx.jobs[0].name = 'Other capture';
      },
    ],
    [
      'promote-only source',
      fx => {
        fx.jobs[0].steps = [];
      },
    ],
    [
      'failed capture validation',
      fx => {
        fx.jobs[0].steps[0].conclusion = 'failure';
      },
    ],
    [
      'artifact from previous attempt',
      fx => {
        fx.artifacts[0].name = 'visual-baseline-capture-101-1';
      },
    ],
    [
      'expired artifact',
      fx => {
        fx.artifacts[0].expired = true;
      },
    ],
    [
      'artifact from foreign run',
      fx => {
        fx.artifacts[0].workflow_run.id = 102;
      },
    ],
    [
      'artifact from foreign repo',
      fx => {
        fx.artifacts[0].workflow_run.repository_id = 10;
      },
    ],
    [
      'artifact from foreign head',
      fx => {
        fx.artifacts[0].workflow_run.head_sha = 'b'.repeat(40);
      },
    ],
    [
      'missing artifact',
      fx => {
        fx.artifacts.length = 0;
      },
    ],
    [
      'ambiguous artifact',
      fx => {
        fx.artifacts.push(structuredClone(fx.artifacts[0]));
      },
    ],
  ])('refuses %s before downloading bytes', async (_label, mutate) => {
    const fx = sourceFixture();
    mutate(fx);
    await expect(resolve(fx)).rejects.toThrow(/refused/);
  });

  it.each(['', '0', '-1', '1.2', '1/2', '9007199254740992'])(
    'rejects invalid source id %j',
    async runId => {
      const fx = sourceFixture();
      await expect(
        resolveVisualMaintenanceSource({
          github: fx.github,
          owner: 'facebook',
          repo: 'astryx',
          runId,
          runAttempt: 2,
        }),
      ).rejects.toThrow(/run id is invalid/);
      expect(fx.github.rest.actions.getWorkflow).not.toHaveBeenCalled();
    },
  );
});

describe('downloaded canonical capture identity', () => {
  it('accepts the full canonical source without changing the baseline or verdict', () => {
    const fx = captureFixture();
    const before = structuredClone(fx);
    validateVisualMaintenanceCapture(fx);
    expect(fx).toEqual(before);
  });

  it.each([
    [
      'wrong captured commit',
      fx => {
        fx.manifest.context.sha = 'b'.repeat(40);
      },
    ],
    [
      'wrong captured ref',
      fx => {
        fx.manifest.context.ref = 'refs/heads/feature';
      },
    ],
    [
      'wrong captured run',
      fx => {
        fx.manifest.context.runId = '102';
      },
    ],
    [
      'wrong captured attempt',
      fx => {
        fx.manifest.context.runAttempt = '1';
      },
    ],
    [
      'missing captured shot',
      fx => {
        fx.manifest.shots = {};
      },
    ],
    [
      'scoped PR capture',
      fx => {
        delete fx.manifest.context.releasePlan;
      },
    ],
    [
      'mismatched plan digest',
      fx => {
        fx.manifest.context.releasePlan.digest = 'invalid';
      },
    ],
    [
      'mismatched verdict identity',
      fx => {
        fx.verdict.context.sha = 'b'.repeat(40);
      },
    ],
    [
      'mismatched verdict plan',
      fx => {
        fx.verdict.context.releasePlan.keys = [];
      },
    ],
    [
      'skipped capture',
      fx => {
        fx.verdict.status = 'skipped';
      },
    ],
  ])('refuses %s', (_label, mutate) => {
    const fx = captureFixture();
    mutate(fx);
    expect(() => validateVisualMaintenanceCapture(fx)).toThrow();
  });
});
