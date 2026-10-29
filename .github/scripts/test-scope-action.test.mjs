// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Behavior of the per-job scope step (.github/actions/test-scope).
 *
 * Every job that owns tests decides its own scope with this step; there is no
 * separate scope job. These cases run the action's real script, as
 * actions/github-script runs it, against a stubbed GitHub API that serves the
 * repository's real classifier files as the base's trusted policy. Anything
 * the step cannot decide must put everything in scope (spec:AST-030 FR3, FR4).
 */

import fs from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';

import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

const root = path.resolve(import.meta.dirname, '../..');
const action = yaml.parse(
  fs.readFileSync(
    path.join(root, '.github/actions/test-scope/action.yml'),
    'utf8',
  ),
);
const scriptStep = action.runs.steps.find(step =>
  step.uses?.startsWith('actions/github-script@'),
);
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
const requireFromHere = createRequire(import.meta.url);

const BASE_SHA = 'b'.repeat(40);
const HEAD_SHA = 'h'.repeat(40);
const INTERACTION_PATHS =
  '^(internal/interaction-harness/|internal/a11y-spec/|playwright\\.interaction\\.config\\.ts$|packages/[^/]+/src/|packages/themes/[^/]+/src/|apps/storybook/|\\.github/workflows/ci\\.yml$|package\\.json$|pnpm-lock\\.yaml$|\\.github/actions/test-scope/)';
const CLASSIFIER_FILES = new Set([
  '.github/scripts/change-scope.cjs',
  '.github/scripts/knowledge-paths.cjs',
  'scripts/component-packages.cjs',
]);
const AUDIT_FILE = '.github/scripts/component-audit-scope.cjs';

function pullRequestContext(baseRef = 'main', pr = {}) {
  return {
    eventName: 'pull_request',
    repo: {owner: 'o', repo: 'r'},
    payload: {
      pull_request: {
        number: 7,
        base: {ref: baseRef, sha: BASE_SHA},
        head: {sha: HEAD_SHA, ref: 'fix/a'},
        user: {login: 'author'},
        draft: false,
        ...pr,
      },
    },
  };
}

/**
 * Runs the action script. `files` is GitHub's file list (or an Error to
 * throw); `headFiles` are the paths present at the PR head; `missingBase`
 * removes classifier files from the base.
 */
async function decide({
  context = pullRequestContext(),
  files = [],
  inputs = {},
  headFiles = [],
  missingBase = [],
  open = [],
  runs = [],
  attempt = '1',
} = {}) {
  const outputs = {};
  const messages = {info: [], warning: [], notice: [], failed: []};
  const contentCalls = [];
  const core = {
    setOutput: (key, value) => {
      outputs[key] = value;
    },
    info: message => messages.info.push(message),
    warning: message => messages.warning.push(message),
    notice: message => messages.notice.push(message),
    setFailed: message => messages.failed.push(message),
  };
  const notFound = () => Object.assign(new Error('Not Found'), {status: 404});
  const github = {
    // The author's open non-draft PRs, oldest first, and today's ci.yml runs.
    graphql: async () => {
      if (open instanceof Error) throw open;
      return {search: {nodes: open}};
    },
    paginate: async () => {
      if (files instanceof Error) throw files;
      return files;
    },
    rest: {
      pulls: {listFiles: () => {}},
      // A run whose heavy job ran its suite has a successful marker step.
      actions: {
        listWorkflowRuns: async ({branch}) => ({
          data: {workflow_runs: runs.filter(run => run.head_branch === branch)},
        }),
        // A CI run has more jobs than the API's default page of 30.
        listJobsForWorkflowRun: async ({run_id, per_page = 30}) => {
          if (per_page < 100) throw new Error('read one default page of jobs');
          return {
            data: {
              jobs: [
                {
                  steps:
                    runs.find(run => run.id === run_id).heavy === false
                      ? []
                      : [{name: 'Heavy suite runs', conclusion: 'success'}],
                },
              ],
            },
          };
        },
      },
      repos: {
        getContent: async ({path: file, ref}) => {
          contentCalls.push({file, ref});
          if (
            ref === BASE_SHA &&
            (CLASSIFIER_FILES.has(file) || file === AUDIT_FILE)
          ) {
            if (missingBase.includes(file)) throw notFound();
            return {
              data: {
                content: fs
                  .readFileSync(path.join(root, file))
                  .toString('base64'),
              },
            };
          }
          if (ref === HEAD_SHA && headFiles.includes(file)) {
            return {data: {content: ''}};
          }
          throw notFound();
        },
      },
    },
  };
  const env = {
    SCOPE_PATHS: inputs.paths ?? '',
    SCOPE_OUTSIDE_PR: inputs['outside-pull-request'] ?? 'run',
    SCOPE_HEAD_FILE: inputs['requires-head-file'] ?? '',
    SCOPE_HEAVY: inputs.heavy ?? 'false',
    GITHUB_RUN_ATTEMPT: attempt,
    SCOPE_COMPONENT_AUDIT: inputs['component-audit'] ?? 'false',
  };
  const saved = {...process.env};
  Object.assign(process.env, env);
  try {
    await new AsyncFunction(
      'require',
      'github',
      'context',
      'core',
      scriptStep.with.script,
    )(requireFromHere, github, context, core);
  } finally {
    for (const key of Object.keys(env)) {
      if (key in saved) process.env[key] = saved[key];
      else delete process.env[key];
    }
  }
  return {outputs, messages, contentCalls};
}

const changed = (...names) =>
  names.map(filename => ({filename, status: 'modified'}));

describe('per-job scope step', () => {
  it('is one github-script step that retries server errors', () => {
    expect(action.runs.using).toBe('composite');
    expect(scriptStep.with.retries).toBeGreaterThanOrEqual(1);
    expect(Object.keys(action.outputs).sort()).toEqual(
      [
        'applies',
        'changed_files',
        'decided',
        'docsite_only',
        'force_full_component_audits',
        'full_suite',
        'has_components',
        'has_rtl_components',
        'has_rtl_harness',
        'release_bump',
        'spec_only',
        'tooling_only',
        'touches',
      ].sort(),
    );
  });

  it('puts everything in scope outside a pull request', async () => {
    const context = {eventName: 'merge_group', repo: {owner: 'o', repo: 'r'}};
    const {outputs} = await decide({context});
    expect(outputs).toMatchObject({
      spec_only: 'false',
      docsite_only: 'false',
      tooling_only: 'false',
      full_suite: 'true',
      applies: 'true',
    });
    const skipped = await decide({
      context,
      inputs: {'outside-pull-request': 'skip'},
    });
    expect(skipped.outputs.applies).toBe('false');
  });

  it('marks a release-branch pull request as the generated version bump', async () => {
    const {outputs} = await decide({
      context: pullRequestContext('release/v1.2.3'),
    });
    expect(outputs).toMatchObject({
      release_bump: 'true',
      spec_only: 'true',
      tooling_only: 'true',
      applies: 'false',
    });
  });

  it('classifies the PR file list with the classifier read from the base commit', async () => {
    const {outputs, contentCalls} = await decide({
      files: changed('packages/core/src/Button/Button.tsx'),
      inputs: {paths: INTERACTION_PATHS},
    });
    expect(outputs).toMatchObject({
      spec_only: 'false',
      docsite_only: 'false',
      tooling_only: 'false',
      release_bump: 'false',
      touches: 'true',
      applies: 'true',
    });
    expect(
      contentCalls.filter(call => CLASSIFIER_FILES.has(call.file)),
    ).toEqual([...CLASSIFIER_FILES].map(file => ({file, ref: BASE_SHA})));
  });

  it('does not apply when no changed path is in the declared scope', async () => {
    const {outputs} = await decide({
      files: changed('packages/cli/assets/codemods/registry.json'),
      inputs: {paths: INTERACTION_PATHS},
    });
    expect(outputs).toMatchObject({touches: 'false', applies: 'false'});
  });

  it('matches the old name of a rename', async () => {
    const {outputs} = await decide({
      files: [
        {
          filename: 'packages/cli/assets/moved.ts',
          previous_filename: 'internal/interaction-harness/moved.ts',
          status: 'renamed',
        },
      ],
      inputs: {paths: INTERACTION_PATHS},
    });
    expect(outputs.touches).toBe('true');
  });

  it('does not apply on a specialized lane even when a path matches', async () => {
    const {outputs} = await decide({
      files: changed('docs/specs/AST-030/spec.md'),
    });
    expect(outputs).toMatchObject({spec_only: 'true', applies: 'false'});
  });

  it('fails when the trusted classifier rejects the change', async () => {
    const {messages} = await decide({
      files: [
        ...changed('docs/specs/AST-030/spec.md'),
        {filename: '.changeset/new-thing.md', status: 'added'},
      ],
    });
    expect(messages.failed).toHaveLength(1);
  });

  it.each([
    ['the file list cannot be read', {files: new Error('502 Bad Gateway')}],
    [
      'GitHub truncates the file list',
      {
        files: Array.from({length: 3000}, (_, i) => ({
          filename: `docs/specs/AST-${i}/spec.md`,
          status: 'modified',
        })),
      },
    ],
    ['GitHub lists no changed files', {files: []}],
    [
      'a classifier file is missing at the base',
      {
        files: changed('docs/specs/AST-030/spec.md'),
        missingBase: ['scripts/component-packages.cjs'],
      },
    ],
  ])('puts everything in scope when %s', async (_, options) => {
    const {outputs, messages} = await decide({
      ...options,
      inputs: {paths: INTERACTION_PATHS},
    });
    expect(outputs).toMatchObject({
      spec_only: 'false',
      docsite_only: 'false',
      tooling_only: 'false',
      full_suite: 'true',
      touches: 'true',
      applies: 'true',
    });
    expect(messages.warning).toHaveLength(1);
    expect(outputs.decided).toBe('false');
  });

  it('reports a decided scope when the classifier ran', async () => {
    const {outputs} = await decide({
      files: changed('docs/specs/AST-030/spec.md'),
    });
    expect(outputs.decided).toBe('true');
  });

  describe('requires-head-file', () => {
    const inputs = {
      paths: INTERACTION_PATHS,
      'requires-head-file': 'playwright.interaction.config.ts',
    };

    it('does not apply, with a notice, to a head cut before the file existed', async () => {
      const {outputs, messages} = await decide({
        files: changed('packages/core/src/Button/Button.tsx'),
        inputs,
      });
      expect(outputs.applies).toBe('false');
      expect(messages.notice).toHaveLength(1);
    });

    it('applies when the head has the file', async () => {
      const {outputs} = await decide({
        files: changed('packages/core/src/Button/Button.tsx'),
        headFiles: ['playwright.interaction.config.ts'],
        inputs,
      });
      expect(outputs.applies).toBe('true');
    });

    it('still applies to a pull request that deletes the file, so the check fails', async () => {
      const {outputs} = await decide({
        files: [
          {filename: 'playwright.interaction.config.ts', status: 'removed'},
        ],
        inputs,
      });
      expect(outputs.applies).toBe('true');
    });
  });

  describe('per-author caps on heavy suites (spec:AST-030 FR16)', () => {
    const files = changed('packages/build/src/index.ts');
    const heavy = {heavy: 'true'};
    const pulls = (...refs) =>
      refs.map((headRefName, i) => ({number: i + 1, headRefName}));
    const me = {number: 7, headRefName: 'fix/a'};
    let nextRun = 100;
    const runsOn = (count, head_branch = 'fix/a', run = {}) =>
      Array.from({length: count}, () => ({id: nextRun++, head_branch, ...run}));

    it('runs only the fast checks on a draft', async () => {
      const context = pullRequestContext('main', {draft: true});
      const fast = await decide({context, files});
      expect(fast.outputs.applies).toBe('true');
      const {outputs, messages} = await decide({context, files, inputs: heavy});
      expect(outputs.applies).toBe('false');
      expect(messages.notice).toEqual([
        'Skipped: draft PR, heavy suites run when ready.',
      ]);
    });

    it("fails a heavy job behind the author's 3 oldest PRs", async () => {
      const open = [...pulls('a', 'b', 'c'), {number: 7, headRefName: 'fix/a'}];
      const {messages} = await decide({files, inputs: heavy, open});
      expect(messages.failed).toEqual([
        'Queued behind your 3 oldest PRs: runs on a push once it is among them, or at the pre-merge re-run.',
      ]);
      const third = await decide({files, inputs: heavy, open: open.slice(1)});
      expect(third.outputs.applies).toBe('true');
      // The search holds at most the author's 100 oldest; a newer pull
      // request missing from it is still behind them.
      const many = pulls(...Array.from({length: 100}, (_, i) => `fix/${i}`));
      const late = await decide({
        context: pullRequestContext('main', {number: 300}),
        files,
        inputs: heavy,
        open: many,
      });
      expect(late.messages.failed).toHaveLength(1);
    });

    it("fails a heavy job past the author's 12 heavy runs today", async () => {
      const capped = await decide({
        files,
        inputs: heavy,
        open: [me],
        runs: runsOn(12),
      });
      expect(capped.messages.failed).toEqual([
        'Daily heavy-run cap reached, runs tomorrow or at pre-merge.',
      ]);
      // Cancelled runs, runs whose heavy suites never ran (a draft, a queued
      // PR) and runs on other branches are not heavy runs.
      const light = await decide({
        files,
        inputs: heavy,
        open: [me],
        runs: [
          ...runsOn(11),
          ...runsOn(5, 'fix/a', {conclusion: 'cancelled'}),
          ...runsOn(5, 'fix/a', {heavy: false}),
          ...runsOn(5, 'fix/old-merged'),
        ],
      });
      expect(light.outputs.applies).toBe('true');
    });

    it('counts each agent lane of the shared login as an author, with a backstop', async () => {
      const context = pullRequestContext('main', {
        user: {login: 'cixzhang'},
        head: {sha: HEAD_SHA, ref: 'lane4/x'},
      });
      const mine = {number: 7, headRefName: 'lane4/x'};
      const others = await decide({
        context,
        files,
        inputs: heavy,
        open: [...pulls('lane1/a', 'lane2/b', 'lane3/c', 'lane0/d'), mine],
        runs: [...runsOn(30, 'lane1/a'), ...runsOn(2, 'lane4/x')],
      });
      expect(others.outputs.applies).toBe('true');
      const backstop = await decide({
        context,
        files,
        inputs: heavy,
        open: [
          ...pulls('lane1/a', 'lane2/b', 'lane3/c', 'lane0/d', 'ci/e'),
          mine,
        ],
      });
      expect(backstop.messages.failed).toEqual([
        'Queued behind your 3 oldest PRs: runs on a push once it is among them, or at the pre-merge re-run.',
      ]);
      // The login as a whole stops at forty heavy runs a day.
      const lanes = [...pulls('lane1/a', 'lane2/b'), mine];
      const loginCap = await decide({
        context,
        files,
        inputs: heavy,
        open: lanes,
        runs: [...runsOn(38, 'lane1/a'), ...runsOn(2, 'lane4/x')],
      });
      expect(loginCap.messages.failed).toEqual([
        'Daily heavy-run cap reached, runs tomorrow or at pre-merge.',
      ]);
      const underLoginCap = await decide({
        context,
        files,
        inputs: heavy,
        open: lanes,
        runs: [...runsOn(37, 'lane1/a'), ...runsOn(2, 'lane4/x')],
      });
      expect(underLoginCap.outputs.applies).toBe('true');
    });

    it('exempts bots and does not count the run deciding', async () => {
      const bot = await decide({
        context: pullRequestContext('main', {user: {login: 'dependabot[bot]'}}),
        files,
        inputs: heavy,
        open: [...pulls('a', 'b', 'c'), me],
      });
      expect(bot.outputs.applies).toBe('true');
      const context = {...pullRequestContext(), runId: 900};
      const self = await decide({
        context,
        files,
        inputs: heavy,
        open: [me],
        runs: [...runsOn(11), {id: 900, head_branch: 'fix/a'}],
      });
      expect(self.outputs.applies).toBe('true');
    });

    it('exempts the pre-merge re-run and runs the suite when the lookup fails', async () => {
      const rerun = await decide({
        files,
        inputs: heavy,
        open: [me],
        runs: runsOn(20),
        attempt: '2',
      });
      expect(rerun.outputs.applies).toBe('true');
      const failed = await decide({
        files,
        inputs: heavy,
        open: new Error('rate limited'),
      });
      expect(failed.outputs.applies).toBe('true');
      expect(failed.messages.warning[0]).toContain('running the heavy suites');
    });
  });

  it('marks the heavy jobs, each with the step the daily cap counts', () => {
    const ci = yaml.parse(
      fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8'),
    );
    const heavyJobs = Object.entries(ci.jobs).filter(([, job]) =>
      job.steps?.some(
        step =>
          step.uses?.includes('test-scope') && step.with?.heavy === 'true',
      ),
    );
    expect(heavyJobs.map(([id]) => id).sort()).toEqual([
      'pr-interaction',
      'test-build',
    ]);
    for (const [id, job] of heavyJobs) {
      const scope = job.steps.findIndex(step =>
        step.uses?.includes('test-scope'),
      );
      expect(job.steps[scope + 1], id).toMatchObject({
        name: 'Heavy suite runs',
        if: `steps.${job.steps[scope].id}.outputs.applies == 'true'`,
      });
    }
  });
  describe('component-audit', () => {
    const inputs = {'component-audit': 'true'};

    it('runs every audit in full outside a pull request', async () => {
      const {outputs} = await decide({
        context: {
          eventName: 'workflow_dispatch',
          repo: {owner: 'o', repo: 'r'},
        },
        inputs,
      });
      expect(outputs).toMatchObject({
        has_components: 'true',
        has_rtl_components: 'true',
        has_rtl_harness: 'true',
        force_full_component_audits: 'true',
      });
    });

    it('classifies a component change with the base classifier and lists its files', async () => {
      const {outputs, contentCalls} = await decide({
        files: changed('packages/core/src/Button/Button.tsx'),
        inputs,
      });
      expect(outputs).toMatchObject({
        has_components: 'true',
        has_rtl_components: 'true',
        force_full_component_audits: 'false',
        changed_files: 'packages/core/src/Button/Button.tsx',
      });
      expect(contentCalls).toContainEqual({file: AUDIT_FILE, ref: BASE_SHA});
    });

    it('applies no audit to a release-branch pull request', async () => {
      const {outputs} = await decide({
        context: pullRequestContext('release/v1.2.3'),
        inputs,
      });
      expect(outputs).toMatchObject({
        has_components: 'false',
        has_rtl_components: 'false',
        has_rtl_harness: 'false',
        force_full_component_audits: 'false',
      });
    });

    it('applies no audit on a specialized lane', async () => {
      const {outputs} = await decide({
        files: changed('docs/specs/AST-030/spec.md'),
        inputs,
      });
      expect(outputs).toMatchObject({
        has_components: 'false',
        has_rtl_components: 'false',
        has_rtl_harness: 'false',
        force_full_component_audits: 'false',
      });
    });

    it('runs every audit in full when the base lacks the audit classifier', async () => {
      const {outputs, messages} = await decide({
        files: changed('packages/core/src/Button/Button.tsx'),
        inputs,
        missingBase: [AUDIT_FILE],
      });
      expect(outputs.force_full_component_audits).toBe('true');
      expect(messages.warning).toHaveLength(1);
    });
  });
});
