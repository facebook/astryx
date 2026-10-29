// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Visual, accessibility and RTL run on main, not on pull request updates.
 * @input CI and Main workflows, dependency fixtures and a mocked GitHub API
 * @output Routing for the heavy owners, the required joins, and Main's
 *   release-check dispatch
 * @position Node contracts for AST-030 FR12 and DEC-7
 */

import fs from 'node:fs';
import {describe, expect, it} from 'vitest';
import yaml from 'yaml';
import {ungated} from './ci-pr-gate.mjs';

const read = name =>
  yaml.parse(
    fs.readFileSync(new URL(`../workflows/${name}`, import.meta.url), 'utf8'),
  );
const ci = read('ci.yml');
const heavy = read('main-heavy-lanes.yml');
const main = read('deploy.yml');

const LABEL = 'ci:heavy-lanes';
const HEAVY = [
  'pr-a11y-guards',
  'pr-a11y-specs',
  'pr-a11y',
  'visual-scout',
  'pr-visual',
  'pr-rtl-shard',
  'pr-rtl-merge',
  'pr-rtl',
];
const fullOutputs = {
  docsite_only: 'false',
  spec_only: 'false',
  tooling_only: 'false',
  has_components: 'true',
  has_rtl_components: 'true',
  has_rtl_harness: 'true',
  force_full_component_audits: 'true',
  has_stable_visual: 'true',
  broad_stable_visual: 'true',
};

function needsOf(job) {
  const names = job.needs == null ? [] : [job.needs].flat();
  return Object.fromEntries(
    names.map(name => [
      name,
      {
        result: name === 'maintenance-request' ? 'skipped' : 'success',
        outputs: {...fullOutputs},
      },
    ]),
  );
}

/** Evaluates a job's `if:` the way Actions does, for one event. */
function runs(job, {event, operation = '', labels = []}) {
  const needs = needsOf(job);
  // The pull-request gate in front is ci-pr-gate.test.mjs's to prove.
  const expression = ungated(job.if ?? 'true')
    .replace(/needs\.([a-z][a-z0-9-]*)/g, 'needs["$1"]')
    .replace(
      /contains\(github\.event\.pull_request\.labels\.\*\.name, '([^']+)'\)/g,
      "(github.event.pull_request?.labels ?? []).some(label => label.name === '$1')",
    );
  return Function(
    'github',
    'inputs',
    'needs',
    'always',
    'cancelled',
    'startsWith',
    `return Boolean(${expression});`,
  )(
    {
      event_name: event,
      base_ref: event === 'pull_request' ? 'main' : '',
      event: {pull_request: {labels: labels.map(name => ({name}))}},
    },
    {operation, 'release-branch': 'main'},
    needs,
    () => true,
    () => false,
    (value, prefix) => String(value ?? '').startsWith(prefix),
  );
}

describe('visual, accessibility and RTL owners', () => {
  it.each(HEAVY)('%s does not run on a pull request update', name => {
    expect(runs(ci.jobs[name], {event: 'pull_request'})).toBe(false);
    expect(
      runs(ci.jobs[name], {event: 'pull_request', labels: ['other']}),
    ).toBe(false);
  });

  it.each(HEAVY)('%s runs on a pull request labelled ci:heavy-lanes', name => {
    expect(runs(ci.jobs[name], {event: 'pull_request', labels: [LABEL]})).toBe(
      true,
    );
  });

  it.each(HEAVY)('%s runs for release-check', name => {
    expect(
      runs(ci.jobs[name], {
        event: 'workflow_dispatch',
        operation: 'release-check',
      }),
    ).toBe(true);
  });

  it('leaves the required joins without a heavy owner, so they still report on every pull request', () => {
    for (const join of ['test', 'build', 'docsite-test']) {
      const needs = [ci.jobs[join].needs].flat();
      for (const heavy of HEAVY) {
        expect(needs, `${join} needs ${heavy}`).not.toContain(heavy);
      }
      expect(runs(ci.jobs[join], {event: 'pull_request'}), join).toBe(true);
    }
  });

  it('adds no label trigger: a label takes effect on the next push or reopen', () => {
    expect(ci.on.pull_request.types).not.toContain('labeled');
  });
});

describe('the release-check on every push to main', () => {
  const job = heavy.jobs['release-check'];
  const script = job.steps[0].with.script;

  it('runs on a push to main and may dispatch workflows', () => {
    expect(heavy.on).toEqual({push: {branches: ['main']}});
    expect(job.permissions).toEqual({actions: 'write', contents: 'read'});
    expect(job.steps[0].env.SHA).toBe('${{ github.sha }}');
  });

  it('throttles: one check runs, the newest push waits, and a running check is never cancelled', () => {
    // One group per workflow and ref: GitHub keeps one running and one
    // pending run in it, and a newer push replaces the pending one, so a
    // burst of merges is checked once, at its newest commit.
    expect(heavy.concurrency).toEqual({
      group: '${{ github.workflow }}-${{ github.ref }}',
      'cancel-in-progress': false,
    });
  });

  it("leaves Main's fast checks running for every push, outside that group", () => {
    expect(main.concurrency.group).not.toBe(heavy.concurrency.group);
    expect(Object.keys(main.jobs)).not.toContain('release-check');
    expect(JSON.stringify(main)).not.toContain('createWorkflowDispatch');
  });

  /** Runs the step's script against a fake GitHub API. */
  async function run({tips, dispatchedSha, conclusion = 'success'}) {
    const calls = {dispatch: [], notices: []};
    let tipCalls = 0;
    let polls = 0;
    const github = {
      rest: {
        repos: {
          getBranch: async () => ({
            data: {commit: {sha: tips[Math.min(tipCalls++, tips.length - 1)]}},
          }),
        },
        actions: {
          createWorkflowDispatch: async args => calls.dispatch.push(args),
          listWorkflowRuns: async () => ({
            data: {
              workflow_runs:
                dispatchedSha == null
                  ? []
                  : [
                      {
                        id: 7,
                        head_sha: dispatchedSha,
                        status: 'queued',
                        html_url: 'run',
                      },
                    ],
            },
          }),
          getWorkflowRun: async () => ({
            data: {
              id: 7,
              head_sha: dispatchedSha,
              status: polls++ < 1 ? 'in_progress' : 'completed',
              conclusion,
              html_url: 'run',
            },
          }),
        },
      },
    };
    const core = {
      notice: message => calls.notices.push(message),
      info: () => {},
    };
    const realTimeout = globalThis.setTimeout;
    globalThis.setTimeout = fn => realTimeout(fn, 0);
    try {
      const body = new Function(
        'github',
        'context',
        'core',
        'process',
        `return (async () => {${script}})();`,
      );
      await body(github, {repo: {owner: 'meta', repo: 'astryx'}}, core, {
        env: {SHA: 'a'.repeat(40)},
      });
      return calls;
    } finally {
      globalThis.setTimeout = realTimeout;
    }
  }

  const sha = 'a'.repeat(40);
  const newer = 'b'.repeat(40);

  it('dispatches release-check on main for the exact pushed commit and passes when it passes', async () => {
    const calls = await run({tips: [sha], dispatchedSha: sha});
    expect(calls.dispatch).toEqual([
      {
        owner: 'meta',
        repo: 'astryx',
        workflow_id: 'ci.yml',
        ref: 'main',
        inputs: {
          operation: 'release-check',
          'release-branch': 'main',
          'expected-head': sha,
        },
      },
    ]);
  });

  it('fails when the release-check does not succeed', async () => {
    await expect(
      run({tips: [sha], dispatchedSha: sha, conclusion: 'failure'}),
    ).rejects.toThrow(/release-check failure/);
  });

  it('leaves a commit main has moved past to the newer push', async () => {
    const calls = await run({tips: [newer]});
    expect(calls.dispatch).toEqual([]);
    expect(calls.notices[0]).toMatch(/newer push/);
  });

  it('leaves the check to the newer push when main moves during the dispatch', async () => {
    const calls = await run({tips: [sha, newer], dispatchedSha: newer});
    expect(calls.dispatch).toHaveLength(1);
    expect(calls.notices[0]).toMatch(/during the dispatch/);
  });
});
