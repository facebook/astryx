// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {afterEach, describe, expect, it, vi} from 'vitest';

import {
  PR_ANALYSIS_MARKER,
  createPublishedDeploymentResult,
  createUnavailableDeploymentResult,
  reconcilePrComment,
  resolveWorkflowRunPullRequest,
  writeDeploymentResult,
} from './pr-preview.mjs';

const HEAD = 'a'.repeat(40);
const BASE = 'b'.repeat(40);
const PAGES = 'c'.repeat(40);
const INDEX = 'd'.repeat(64);
const roots = [];

function identity(overrides = {}) {
  return {
    prNumber: 5697,
    headSha: HEAD,
    headRef: 'fix-failed-ci-preview-links',
    headRepository: 'cixzhang/astryx',
    headRepositoryId: '321',
    baseRepository: 'facebook/astryx',
    baseSha: BASE,
    sourceRunId: 33321033727,
    sourceRunAttempt: 1,
    sourceConclusion: 'success',
    draft: false,
    ...overrides,
  };
}

function sourceRun(value = identity()) {
  return {
    id: value.sourceRunId,
    run_attempt: value.sourceRunAttempt,
    name: 'CI',
    event: 'pull_request',
    conclusion: value.sourceConclusion,
    head_sha: value.headSha,
    head_branch: value.headRef,
    head_repository: {
      id: Number(value.headRepositoryId),
      full_name: value.headRepository,
      owner: {login: value.headRepository.split('/')[0]},
    },
    pull_requests: [],
  };
}

function pull(value = identity()) {
  return {
    number: value.prNumber,
    state: 'open',
    draft: value.draft,
    head: {
      sha: value.headSha,
      ref: value.headRef,
      repo: {
        id: Number(value.headRepositoryId),
        full_name: value.headRepository,
      },
    },
    base: {
      sha: value.baseSha,
      repo: {full_name: value.baseRepository},
    },
  };
}

function githubFixture({value = identity(), comments = []} = {}) {
  const state = {
    comments: comments.map(comment => ({...comment})),
    created: [],
    updated: [],
    listedIssues: [],
  };
  const github = {
    rest: {
      actions: {
        getWorkflowRun: vi.fn(async () => ({data: sourceRun(value)})),
      },
      pulls: {
        get: vi.fn(async () => ({data: pull(value)})),
        list: vi.fn(async () => ({data: [pull(value)]})),
      },
      issues: {
        listComments: vi.fn(async ({issue_number}) => {
          state.listedIssues.push(issue_number);
          return {data: state.comments};
        }),
        updateComment: vi.fn(async request => {
          state.updated.push(request);
          const comment = state.comments.find(
            item => item.id === request.comment_id,
          );
          if (comment) comment.body = request.body;
          return {data: comment};
        }),
        createComment: vi.fn(async request => {
          state.created.push(request);
          const comment = {
            id: 9000 + state.created.length,
            user: {type: 'Bot'},
            body: request.body,
          };
          state.comments.push(comment);
          return {data: comment};
        }),
      },
    },
    paginate: vi.fn(async (method, request) => (await method(request)).data),
  };
  return {github, state};
}

function fixture(value = identity(), {analysis = true, deployment} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pr-preview-'));
  roots.push(root);
  const paths = {
    analysis: path.join(root, 'analysis.json'),
    metadata: path.join(root, 'pr-meta.json'),
    a11y: path.join(root, 'a11y.json'),
    deployment: path.join(root, 'preview-deployment.json'),
    visual: path.join(root, 'missing-visual.json'),
  };
  if (analysis) {
    fs.writeFileSync(
      paths.analysis,
      JSON.stringify({
        newComponents: [],
        modifiedComponents: ['Card'],
        componentStats: {Card: {package: '@astryxdesign/core'}},
        bundlePackages: [],
        totalBundle: null,
      }),
    );
    fs.writeFileSync(
      paths.metadata,
      JSON.stringify({
        prNumber: value.prNumber,
        shortHash: value.headSha.slice(0, 7),
        headSha: value.headSha,
        headRepository: value.headRepository,
        baseRepository: value.baseRepository,
        runId: value.sourceRunId,
        runAttempt: value.sourceRunAttempt,
      }),
    );
  }
  fs.writeFileSync(
    paths.a11y,
    '{"components":{},"summary":{"componentsAudited":0,"totalViolations":0}}',
  );
  if (deployment) writeDeploymentResult(paths.deployment, deployment);
  return paths;
}

function published(value, available = ['storybook', 'sandbox']) {
  return createPublishedDeploymentResult(value, {
    storybookIndexSha256: available.includes('storybook') ? INDEX : null,
    sandboxIndexSha256: available.includes('sandbox') ? INDEX : null,
    pagesCommit: PAGES,
  });
}

async function reconcile({
  value = identity(),
  deployment,
  analysis = true,
  comments = [],
  githubFixtureValue = value,
  createIfMissing,
  fallbackMessage,
  execute,
} = {}) {
  const paths = fixture(value, {analysis, deployment});
  const {github, state} = githubFixture({
    value: githubFixtureValue,
    comments,
  });
  const core = {info: vi.fn(), warning: vi.fn()};
  const result = await reconcilePrComment({
    github,
    core,
    context: {
      repo: {owner: 'facebook', repo: 'astryx'},
      serverUrl: 'https://github.com',
    },
    expectedIdentity: value,
    analysisPath: paths.analysis,
    metadataPath: paths.metadata,
    a11yPath: paths.a11y,
    deploymentResultPath: paths.deployment,
    visualPath: paths.visual,
    createIfMissing,
    fallbackMessage,
    execute,
  });
  return {result, state, core, github, paths};
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    fs.rmSync(root, {recursive: true, force: true});
  }
});

describe('trusted PR preview identity', () => {
  it('resolves a fork run through the trusted owner and branch fallback', async () => {
    const value = identity();
    const {github} = githubFixture({value});
    const run = sourceRun(value);

    const resolved = await resolveWorkflowRunPullRequest({
      github,
      owner: 'facebook',
      repo: 'astryx',
      run,
    });

    expect(resolved).toMatchObject(value);
    expect(github.rest.pulls.list).toHaveBeenCalledWith({
      owner: 'facebook',
      repo: 'astryx',
      state: 'open',
      head: 'cixzhang:fix-failed-ci-preview-links',
      per_page: 100,
    });
  });

  it.each([
    ['wrong head', {headSha: 'e'.repeat(40)}],
    ['wrong head repository', {headRepository: 'someone/astryx'}],
    ['wrong base repository', {baseRepository: 'someone/astryx'}],
  ])('rejects a candidate with the %s', async (_label, overrides) => {
    const trusted = identity();
    const candidate = identity(overrides);
    const {github} = githubFixture({value: candidate});

    await expect(
      resolveWorkflowRunPullRequest({
        github,
        owner: 'facebook',
        repo: 'astryx',
        run: sourceRun(trusted),
      }),
    ).rejects.toThrow(/expected exactly one current pull request/);
  });

  it('rejects workflow dispatch without a PR-backed CI run', async () => {
    const value = identity();
    const {github} = githubFixture({value});
    const run = {...sourceRun(value), event: 'workflow_dispatch'};

    await expect(
      resolveWorkflowRunPullRequest({
        github,
        owner: 'facebook',
        repo: 'astryx',
        run,
      }),
    ).rejects.toThrow(/expected exactly one current pull request/);
  });
});

describe('PR comment preview reconciliation', () => {
  it.each([
    ['no deployment', undefined, false, false],
    ['Storybook only', published(identity(), ['storybook']), true, false],
    ['Sandbox only', published(identity(), ['sandbox']), false, true],
    [
      'both previews',
      published(identity(), ['storybook', 'sandbox']),
      true,
      true,
    ],
    [
      'deployment failure',
      createUnavailableDeploymentResult(identity(), 'publisher-failed'),
      false,
      false,
    ],
  ])(
    'renders the behavioral availability matrix: %s',
    async (_label, deployment, hasStorybook, hasSandbox) => {
      const {result} = await reconcile({deployment});

      expect(result.body.includes('View Storybook for this PR')).toBe(
        hasStorybook,
      );
      expect(result.body.includes('View Sandbox for this PR')).toBe(hasSandbox);
      expect(result.body.includes('> **Preview availability:**')).toBe(
        !hasStorybook || !hasSandbox,
      );
    },
  );

  it('keeps current trustworthy analysis when source CI fails', async () => {
    const value = identity({sourceConclusion: 'failure'});
    const deployment = createUnavailableDeploymentResult(
      value,
      'source-failed',
    );

    const {result} = await reconcile({value, deployment});

    expect(result.body).toContain('Modified Components');
    expect(result.body).toContain('Card');
    expect(result.body).toContain('CI did not succeed');
    expect(result.body).not.toContain('View Storybook for this PR');
    expect(result.body).not.toContain('View Sandbox for this PR');
  });

  it('replaces a stale linked comment when failed CI has no analysis artifact', async () => {
    const value = identity({sourceConclusion: 'failure'});
    const stale = {
      id: 77,
      user: {type: 'Bot'},
      body: `## PR Analysis Report\n\n### 📚 Storybook Preview\nhttps://facebook.github.io/astryx/pr/5697/\n\n### 🧪 Sandbox Preview\nhttps://facebook.github.io/astryx/pr/5697/sandbox/`,
    };

    const {result, state} = await reconcile({
      value,
      analysis: false,
      comments: [stale],
    });

    expect(result.action).toBe('updated');
    expect(state.created).toHaveLength(0);
    expect(state.updated).toHaveLength(1);
    expect(result.body).toContain(PR_ANALYSIS_MARKER);
    expect(result.body).toContain('concluded failure');
    expect(result.body).not.toContain('/pr/5697/');
  });

  it('reconciles an existing spec-only report without creating a new one', async () => {
    const message =
      'The current change only updates durable specifications. Preview links are not shown.';
    const withoutPrior = await reconcile({
      analysis: false,
      createIfMissing: false,
      fallbackMessage: message,
    });
    expect(withoutPrior.result.action).toBe('none');
    expect(withoutPrior.state.created).toHaveLength(0);
    expect(withoutPrior.state.updated).toHaveLength(0);

    const stale = {
      id: 79,
      user: {type: 'Bot'},
      body: '## PR Analysis Report\nhttps://facebook.github.io/astryx/pr/5697/',
    };
    const withPrior = await reconcile({
      analysis: false,
      comments: [stale],
      createIfMissing: false,
      fallbackMessage: message,
    });
    expect(withPrior.result.action).toBe('updated');
    expect(withPrior.result.body).toContain(message);
    expect(withPrior.result.body).not.toContain('/pr/5697/');
    expect(withPrior.state.created).toHaveLength(0);
    expect(withPrior.state.updated).toHaveLength(1);
  });

  it('falls back to a safe current message when analysis rendering fails', async () => {
    const stale = {
      id: 78,
      user: {type: 'Bot'},
      body: '## PR Analysis Report\nhttps://facebook.github.io/astryx/pr/5697/',
    };

    const {result, core} = await reconcile({
      deployment: published(identity()),
      comments: [stale],
      execute: () => {
        throw new Error('malformed analysis');
      },
    });

    expect(result.body).toContain('trusted analysis is unavailable');
    expect(result.body).not.toContain('/pr/5697/');
    expect(core.warning).toHaveBeenCalledWith(
      expect.stringContaining('Could not render current analysis'),
    );
  });

  it('updates one same-PR comment across repeated source attempts', async () => {
    const first = identity();
    const harness = githubFixture({value: first});
    const firstPaths = fixture(first, {deployment: published(first)});
    const core = {info: vi.fn(), warning: vi.fn()};
    const common = {
      github: harness.github,
      core,
      context: {
        repo: {owner: 'facebook', repo: 'astryx'},
        serverUrl: 'https://github.com',
      },
      visualPath: firstPaths.visual,
    };

    await reconcilePrComment({
      ...common,
      expectedIdentity: first,
      analysisPath: firstPaths.analysis,
      metadataPath: firstPaths.metadata,
      a11yPath: firstPaths.a11y,
      deploymentResultPath: firstPaths.deployment,
    });

    const second = identity({sourceRunAttempt: 2});
    harness.github.rest.actions.getWorkflowRun.mockResolvedValue({
      data: sourceRun(second),
    });
    harness.github.rest.pulls.get.mockResolvedValue({data: pull(second)});
    const secondPaths = fixture(second, {
      deployment: published(second, ['storybook']),
    });
    await reconcilePrComment({
      ...common,
      expectedIdentity: second,
      analysisPath: secondPaths.analysis,
      metadataPath: secondPaths.metadata,
      a11yPath: secondPaths.a11y,
      deploymentResultPath: secondPaths.deployment,
      visualPath: secondPaths.visual,
    });

    expect(harness.state.created).toHaveLength(1);
    expect(harness.state.updated).toHaveLength(1);
    expect(harness.state.comments).toHaveLength(1);
    expect(harness.state.comments[0].body).toContain(
      'View Storybook for this PR',
    );
    expect(harness.state.comments[0].body).not.toContain(
      'View Sandbox for this PR',
    );
    expect(harness.state.listedIssues).toEqual([5697, 5697]);
  });

  it.each([
    ['wrong PR', {prNumber: 9999}],
    ['wrong head', {headSha: 'e'.repeat(40)}],
    ['wrong repository', {headRepository: 'someone/astryx'}],
  ])(
    'fails closed for a deployment result with the %s',
    async (_label, overrides) => {
      const deployment = published(identity(overrides));

      const {result, core} = await reconcile({deployment});

      expect(result.body).not.toContain('View Storybook for this PR');
      expect(result.body).not.toContain('View Sandbox for this PR');
      expect(core.warning).toHaveBeenCalledWith(
        expect.stringContaining('Ignoring untrusted or stale preview result'),
      );
    },
  );

  it('does not mutate any PR after the source identity becomes stale', async () => {
    const expected = identity();
    const current = identity({headSha: 'f'.repeat(40)});
    const paths = fixture(expected, {deployment: published(expected)});
    const {github, state} = githubFixture({value: current});

    await expect(
      reconcilePrComment({
        github,
        core: {info: vi.fn(), warning: vi.fn()},
        context: {
          repo: {owner: 'facebook', repo: 'astryx'},
          serverUrl: 'https://github.com',
        },
        expectedIdentity: expected,
        analysisPath: paths.analysis,
        metadataPath: paths.metadata,
        a11yPath: paths.a11y,
        deploymentResultPath: paths.deployment,
        visualPath: paths.visual,
      }),
    ).rejects.toThrow(/headSha does not match/);
    expect(state.created).toHaveLength(0);
    expect(state.updated).toHaveLength(0);
    expect(state.listedIssues).toHaveLength(0);
  });

  it('does not emit links for dispatch without a PR-backed source run', async () => {
    const value = identity();
    const paths = fixture(value, {deployment: published(value)});
    const {github, state} = githubFixture({value});
    github.rest.actions.getWorkflowRun.mockResolvedValue({
      data: {...sourceRun(value), event: 'workflow_dispatch'},
    });

    await expect(
      reconcilePrComment({
        github,
        core: {info: vi.fn(), warning: vi.fn()},
        context: {
          repo: {owner: 'facebook', repo: 'astryx'},
          serverUrl: 'https://github.com',
        },
        expectedIdentity: value,
        analysisPath: paths.analysis,
        metadataPath: paths.metadata,
        a11yPath: paths.a11y,
        deploymentResultPath: paths.deployment,
        visualPath: paths.visual,
      }),
    ).rejects.toThrow(/not backed by a pull request/);
    expect(state.created).toHaveLength(0);
    expect(state.updated).toHaveLength(0);
  });

  it('renders the current successful path from exact publisher proof', async () => {
    const value = identity();
    const {result, state} = await reconcile({
      value,
      deployment: published(value),
    });

    expect(result.action).toBe('created');
    expect(result.body).toContain(PR_ANALYSIS_MARKER);
    expect(result.body).toContain('https://facebook.github.io/astryx/pr/5697/');
    expect(result.body).toContain(
      'https://facebook.github.io/astryx/pr/5697/sandbox/',
    );
    expect(state.created[0].issue_number).toBe(5697);
    expect(state.listedIssues).toEqual([5697]);
  });
});
