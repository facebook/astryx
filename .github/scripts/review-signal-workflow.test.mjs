// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Review signal workflow contracts, including executable helper loading.
 * @input The actual privileged script, trusted helper bytes, and stub GitHub APIs.
 * @output Ref-provenance, fail-closed, and unchanged review-routing assertions.
 * @position Node regression coverage for review-signal.yml.
 */

import {Buffer} from 'node:buffer';
import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it, vi} from 'vitest';
import YAML from 'yaml';

const root = path.resolve(import.meta.dirname, '../..');
const workflow = fs.readFileSync(
  path.join(root, '.github/workflows/review-signal.yml'),
  'utf8',
);
const parsed = YAML.parse(workflow);
const script = parsed.jobs.flag.steps.find(
  step => step.name === 'Detect signals and route',
).with.script;
const HELPER_PATH = '.github/scripts/review-signal-decision.cjs';
const CLASSIFIER_PATH = '.github/scripts/lib/classify-visual.js';
const WORKFLOW_SHA = '1'.repeat(40);
const OLD_BASE = '2'.repeat(40);
const HEAD = '3'.repeat(40);
const LOWER_HEAD = '4'.repeat(40);
const DEFAULT_BRANCH = 'main';
const STACKED_BASE = 'feature/lower';
const NATIVE_TRUNK = {base: {ref: DEFAULT_BRANCH, sha: '5'.repeat(40)}};
const README = [{filename: 'README.md', status: 'modified'}];
// Stands in for a classifier someone pushed to another PR's branch. The gate
// must never execute it.
const UNTRUSTED_CLASSIFIER = [
  'globalThis.__untrustedClassifierRan = true;',
  'module.exports = {',
  "  classifyVisualDiff: () => ({score: 0, bucket: 'none', appearanceOnly: true}),",
  '};',
].join('\n');

const encode = source => Buffer.from(source).toString('base64');
const diffFor = files =>
  files
    .map(
      file =>
        `diff --git a/${file.previous_filename || file.filename} b/${file.filename}\n@@ -1 +1 @@\n-a\n+b\n`,
    )
    .join('');

/** A pull request as the detail endpoint returns it. */
function pull({
  number = 42,
  author = 'contributor',
  baseRef = DEFAULT_BRANCH,
  baseSha = OLD_BASE,
  headSha = HEAD,
  stack = null,
  changedFiles = 1,
  state = 'open',
} = {}) {
  return {
    number,
    node_id: `PR_${number}`,
    state,
    merged_at: null,
    user: {login: author, type: 'User'},
    base: {
      sha: baseSha,
      ref: baseRef,
      repo: {full_name: 'facebook/astryx', default_branch: DEFAULT_BRANCH},
    },
    head: {sha: headSha, ref: 'feature', repo: {full_name: 'facebook/astryx'}},
    changed_files: changedFiles,
    labels: [{name: 'needs:code-review'}, {name: 'community'}],
    auto_merge: null,
    stack,
  };
}

/** The list endpoints omit changed_files and stack. */
const listed = ({changed_files: _files, stack: _stack, ...rest}) => rest;

async function runSignal({
  eventName = 'workflow_dispatch',
  action = 'synchronize',
  changes,
  backfill = false,
  helperMissing = false,
  reviews = [],
  live = pull(),
  others = [],
  onPullGet,
  files,
  filesForBase,
  diff,
  secondFiles,
  statuses = [],
  onReviewsRead,
} = {}) {
  delete globalThis.__untrustedClassifierRan;
  const state = {
    pr: structuredClone(live),
    others: new Map(others.map(other => [other.number, other])),
    pullGets: 0,
    fileReads: 0,
    diffReads: 0,
    reviewReads: 0,
    reviews: structuredClone(reviews),
    // Ordered reads of this PR and mutations, to check every mutation re-reads.
    log: [],
  };
  const filesNow = () => filesForBase?.[state.pr.base.ref] ?? files ?? README;
  const logged = (name, fn) =>
    vi.fn(async (...args) => {
      state.log.push(`write:${name}`);
      return fn(...args);
    });
  const mutations = {
    createCommitStatus: logged('status', async () => {}),
    addLabels: logged('add-label', async () => {}),
    removeLabel: logged('remove-label', async () => {}),
    requestReviewers: logged('request-reviewers', async () => {}),
    updateCheck: logged('update-check', async () => {}),
    graphql: logged('graphql', async () => {}),
  };
  const contentReads = [];
  const getContent = vi.fn(async ({path: filePath, ref}) => {
    contentReads.push(`${ref}:${filePath}`);
    if (filePath === HELPER_PATH) {
      if (ref !== WORKFLOW_SHA || helperMissing) {
        throw Object.assign(new Error('Not Found'), {status: 404});
      }
    } else if (filePath === CLASSIFIER_PATH) {
      if (ref === LOWER_HEAD) {
        return {data: {type: 'file', content: encode(UNTRUSTED_CLASSIFIER)}};
      }
      if (ref !== OLD_BASE && ref !== WORKFLOW_SHA) {
        throw new Error(`Unexpected content read: ${ref}:${filePath}`);
      }
    } else {
      throw new Error(`Unexpected content read: ${ref}:${filePath}`);
    }
    return {
      data: {
        type: 'file',
        content: encode(fs.readFileSync(path.join(root, filePath))),
      },
    };
  });
  const github = {
    paginate: async (method, options) => (await method(options)).data,
    request: async () => {
      state.diffReads += 1;
      const served = typeof diff === 'function' ? diff(state) : diff;
      if (served === 'too-large') {
        throw Object.assign(new Error('diff too large'), {status: 406});
      }
      return {data: served ?? diffFor(filesNow())};
    },
    graphql: mutations.graphql,
    rest: {
      pulls: {
        get: vi.fn(async ({pull_number: number}) => {
          if (number !== state.pr.number) {
            return {data: structuredClone(state.others.get(number))};
          }
          state.pullGets += 1;
          state.log.push('read:pull');
          onPullGet?.(state.pullGets, state);
          // A fresh object per read, as from the API.
          return {data: structuredClone(state.pr)};
        }),
        list: vi.fn(async () => ({
          data: [state.pr, ...state.others.values()].map(listed),
        })),
        listFiles: vi.fn(async () => {
          state.fileReads += 1;
          return {
            data:
              secondFiles && state.fileReads % 2 === 0
                ? secondFiles
                : filesNow(),
          };
        }),
        listReviews: async () => {
          state.reviewReads += 1;
          onReviewsRead?.(state.reviewReads, state);
          return {data: structuredClone(state.reviews)};
        },
        requestReviewers: mutations.requestReviewers,
      },
      repos: {
        getContent,
        createCommitStatus: mutations.createCommitStatus,
        listCommitStatusesForRef: async () => ({data: statuses}),
        // Like GitHub, commit association never lists a fork PR.
        listPullRequestsAssociatedWithCommit: async ({commit_sha: sha}) => ({
          data: [state.pr, ...state.others.values()]
            .filter(
              candidate =>
                candidate.head.sha === sha &&
                candidate.head.repo.full_name === 'facebook/astryx',
            )
            .map(listed),
        }),
      },
      issues: {
        addLabels: mutations.addLabels,
        removeLabel: mutations.removeLabel,
      },
      checks: {
        listForRef: async () => ({data: {check_runs: []}}),
        update: mutations.updateCheck,
      },
    },
  };
  const core = {info: vi.fn(), warning: vi.fn(), setFailed: vi.fn()};
  const execute = new Function(
    'github',
    'context',
    'core',
    'process',
    'Buffer',
    `return (async () => {\n${script}\n})();`,
  );
  await execute(
    github,
    {
      repo: {owner: 'facebook', repo: 'astryx'},
      sha: WORKFLOW_SHA,
      eventName,
      payload:
        eventName === 'workflow_dispatch'
          ? {inputs: {pr: backfill ? '' : '42'}}
          : {action, changes, pull_request: {number: live.number}},
    },
    core,
    {
      env: {
        ...parsed.env,
        ENG_OWNERS: '@engineer',
        DESIGN_OWNERS: '@designer',
      },
    },
    Buffer,
  );
  const untrustedClassifierRan = globalThis.__untrustedClassifierRan === true;
  delete globalThis.__untrustedClassifierRan;
  return {
    github,
    core,
    mutations,
    getContent,
    contentReads,
    state,
    untrustedClassifierRan,
  };
}

const statusWrites = h =>
  h.mutations.createCommitStatus.mock.calls.map(([input]) => input);

function expectTrustedHelperRead(getContent) {
  expect(
    getContent.mock.calls
      .map(([input]) => input)
      .filter(input => input.path === HELPER_PATH),
  ).toEqual([
    {
      owner: 'facebook',
      repo: 'astryx',
      ref: WORKFLOW_SHA,
      path: HELPER_PATH,
    },
  ]);
}

describe('review-signal trusted helper ref', () => {
  it('only runs the helper-loading job in trusted execution contexts', () => {
    expect(parsed.jobs.flag.if.replace(/\s+/g, ' ').trim()).toBe(
      "(github.event_name == 'pull_request_target' && (github.event.action != 'edited' || github.event.changes.base != null)) || (github.event_name == 'workflow_dispatch' && github.ref == format('refs/heads/{0}', github.event.repository.default_branch))",
    );
    expect(
      parsed.jobs.flag.steps.some(step =>
        step.uses?.startsWith('actions/checkout@'),
      ),
    ).toBe(false);
  });

  it.each([
    ['old-base dispatch', {eventName: 'workflow_dispatch'}],
    ['old-base backfill', {eventName: 'workflow_dispatch', backfill: true}],
    [
      'current-base dispatch',
      {eventName: 'workflow_dispatch', live: pull({baseSha: WORKFLOW_SHA})},
    ],
    ['old-base PR event', {eventName: 'pull_request_target'}],
    [
      'current-base PR event',
      {eventName: 'pull_request_target', live: pull({baseSha: WORKFLOW_SHA})},
    ],
  ])(
    'loads the helper from the workflow SHA for %s',
    async (_name, options) => {
      const h = await runSignal(options);
      expectTrustedHelperRead(h.getContent);
      expect(h.core.setFailed).not.toHaveBeenCalled();
      expect(h.core.warning).not.toHaveBeenCalled();
      expect(h.mutations.createCommitStatus).toHaveBeenCalledExactlyOnceWith({
        owner: 'facebook',
        repo: 'astryx',
        sha: HEAD,
        context: 'review-required',
        state: 'pending',
        description: 'Waiting on code review: community contribution',
      });
      if (options.backfill) {
        // The first listing enumerates the backfill; later ones look for
        // other open PRs on the same head.
        expect(h.github.rest.pulls.list.mock.calls[0][0]).toMatchObject({
          state: 'open',
        });
      }
      // Every path classifies the live pull request it re-reads.
      expect(h.github.rest.pulls.get).toHaveBeenCalledWith({
        owner: 'facebook',
        repo: 'astryx',
        pull_number: 42,
      });
    },
  );

  it.each(['workflow_dispatch', 'pull_request_target'])(
    'fails closed if the helper is missing at the workflow SHA for %s',
    async eventName => {
      const h = await runSignal({eventName, helperMissing: true});
      expectTrustedHelperRead(h.getContent);
      expect(h.core.warning).toHaveBeenCalledWith(
        'Failed to flag PR #42: Not Found',
      );
      expect(h.core.setFailed).toHaveBeenCalledExactlyOnceWith(
        'One or more PRs failed to flag; see warnings.',
      );
      expect(h.github.rest.pulls.listFiles).not.toHaveBeenCalled();
      for (const mutation of Object.values(h.mutations)) {
        expect(mutation).not.toHaveBeenCalled();
      }
    },
  );

  it.each([
    [OLD_BASE, 'pending'],
    [HEAD, 'success'],
  ])(
    'keeps approval bound to the current PR head, not the helper ref (%s)',
    async (reviewedSha, state) => {
      const h = await runSignal({
        reviews: [
          {
            user: {login: 'engineer'},
            state: 'APPROVED',
            commit_id: reviewedSha,
          },
        ],
      });
      expectTrustedHelperRead(h.getContent);
      expect(h.core.setFailed).not.toHaveBeenCalled();
      expect(h.mutations.createCommitStatus).toHaveBeenCalledWith(
        expect.objectContaining({sha: HEAD, state}),
      );
    },
  );
});

describe('review-signal appearance-only contract', () => {
  it('keeps the embedded privileged script syntactically valid', () => {
    const parsed = YAML.parse(workflow);
    const script = parsed.jobs.flag.steps.find(
      step => step.name === 'Detect signals and route',
    ).with.script;
    expect(
      () =>
        new Function(
          'github',
          'context',
          'core',
          'process',
          'Buffer',
          `return (async () => {\n${script}\n})();`,
        ),
    ).not.toThrow();
  });

  it('loads the dependency-free classifier and trusted base/head source bytes', () => {
    expect(workflow).not.toContain('ref: pr.base.ref');
    expect(workflow).toContain(
      'const classifierRef = scope.targetsDefaultBranch ? pr.base.sha : context.sha',
    );
    expect(workflow).toContain('ref: classifierRef');
    expect(workflow).toContain(
      "path: '.github/scripts/lib/classify-visual.js'",
    );
    expect(workflow).toContain('pr.base.repo.full_name');
    expect(workflow).toContain('pr.base.sha');
    expect(workflow).toContain('pr.head.repo.full_name');
    expect(workflow).toContain('pr.head.sha');
    expect(workflow).toContain(
      'sources[file.filename] = {base: baseSource, head: headSource}',
    );
    expect(workflow).toContain('if (coreChange || designReasons.length === 0)');
    expect(workflow).toContain(
      "throw new Error('classify-visual.js must stay dependency-free')",
    );
  });

  it('resolves engineering and design approvals only for the current head', () => {
    expect(workflow).toContain(
      "path: '.github/scripts/review-signal-decision.cjs'",
    );
    expect(workflow).toContain('headSha: pr.head.sha');
    expect(workflow).toContain('codeHighRisk && codeApproved');
    expect(workflow).toContain("'Cleared by code-owner approval.'");
    expect(workflow).toContain(
      "throw new Error('review-signal-decision.cjs must stay dependency-free')",
    );
  });

  it('routes safe-space changes using both current and previous paths', () => {
    expect(workflow).toContain(
      'reviewDecision.classifyReviewSignalPaths(allFiles)',
    );
    expect(workflow).toContain('hasSafeBoundaryRename');
    expect(workflow).toContain(
      "codeReasons.push('safe-space boundary rename')",
    );
    expect(workflow).toContain(
      'const isSafeSpace = reviewDecision.isSafeSpace',
    );
    expect(workflow).not.toContain('!isLab(f.filename)');
  });

  it('anchors approval, changes-requested, and dismissal review events', () => {
    expect(workflow).toContain('types: [submitted, dismissed]');
    expect(workflow).toContain(
      'contains(fromJSON(\'["approved","changes_requested","dismissed"]\'), github.event.review.state)',
    );
  });

  it('limits self-service to a DESIGNOWNER with only the proven Core visual reason', () => {
    expect(workflow).toContain(
      'const appearanceOnly = visualClassification?.appearanceOnly === true',
    );
    expect(workflow).toContain(
      "codeReasons.length === 1 && codeReasons[0] === 'core visual change'",
    );
    expect(workflow).toContain(
      'authorIsDesign && appearanceOnly && onlyCoreVisualChange',
    );
    expect(workflow).toContain('!designOwnerAppearanceSelfServe');
  });

  it('keeps contributors and classifier failures on the engineering gate', () => {
    const communityReason = workflow.indexOf(
      "codeReasons.push('community contribution')",
    );
    const narrowReasonCheck = workflow.indexOf(
      "codeReasons.length === 1 && codeReasons[0] === 'core visual change'",
    );
    expect(communityReason).toBeGreaterThan(-1);
    expect(narrowReasonCheck).toBeGreaterThan(communityReason);
    expect(workflow).toContain('let visualClassification = null');
    expect(workflow).toContain(
      'Content-based visual classification failed closed',
    );
  });
});

describe('review-signal scope, identity, and shared heads', () => {
  const classifierReads = h =>
    h.contentReads.filter(read => read.endsWith(`:${CLASSIFIER_PATH}`));
  const SCOPED = 'review-required/stacked-pr-42';
  const stacked = (options = {}) =>
    pull({baseRef: STACKED_BASE, baseSha: LOWER_HEAD, ...options});
  const contexts = h => statusWrites(h).map(write => write.context);

  it.each([
    ['synchronize', {action: 'synchronize'}],
    [
      'base change',
      {action: 'edited', changes: {base: {ref: {from: DEFAULT_BRANCH}}}},
    ],
  ])(
    'gives a manual stack a scoped context on %s, with trusted code only',
    async (_name, event) => {
      const h = await runSignal({
        eventName: 'pull_request_target',
        live: stacked(),
        ...event,
      });

      expectTrustedHelperRead(h.getContent);
      expect(classifierReads(h)).toEqual([
        `${WORKFLOW_SHA}:${CLASSIFIER_PATH}`,
      ]);
      expect(h.untrustedClassifierRan).toBe(false);
      expect(h.core.setFailed).not.toHaveBeenCalled();
      expect(h.core.warning).not.toHaveBeenCalled();
      expect(statusWrites(h)).toEqual([
        {
          owner: 'facebook',
          repo: 'astryx',
          sha: HEAD,
          context: SCOPED,
          state: 'pending',
          description: 'Waiting on code review: community contribution',
        },
      ]);
    },
  );

  it('gives a native stack rung on main the required context', async () => {
    const h = await runSignal({
      eventName: 'pull_request_target',
      live: stacked({stack: NATIVE_TRUNK}),
    });

    // The rung's base is still another PR's branch, so its classifier is not.
    expect(classifierReads(h)).toEqual([`${WORKFLOW_SHA}:${CLASSIFIER_PATH}`]);
    expect(h.untrustedClassifierRan).toBe(false);
    expect(contexts(h)).toEqual(['review-required']);
  });

  it('gives an engineering owner the same self-serve result when stacked', async () => {
    const h = await runSignal({
      eventName: 'pull_request_target',
      live: stacked({author: 'engineer'}),
    });

    expect(statusWrites(h)).toEqual([
      expect.objectContaining({
        context: SCOPED,
        state: 'success',
        description: 'No code review required.',
      }),
    ]);
  });

  it('keeps a main-based PR on its base-commit classifier and required context', async () => {
    const h = await runSignal({eventName: 'pull_request_target'});

    expect(classifierReads(h)).toEqual([`${OLD_BASE}:${CLASSIFIER_PATH}`]);
    expect(statusWrites(h)).toEqual([
      expect.objectContaining({context: 'review-required', state: 'pending'}),
    ]);
  });

  it.each([
    [OLD_BASE, 'pending'],
    [HEAD, 'success'],
  ])(
    'binds stacked approval to the exact current head (%s)',
    async (reviewedSha, state) => {
      const h = await runSignal({
        eventName: 'pull_request_target',
        live: stacked(),
        reviews: [
          {
            user: {login: 'engineer'},
            state: 'APPROVED',
            commit_id: reviewedSha,
          },
        ],
      });

      expect(statusWrites(h)).toEqual([
        expect.objectContaining({context: SCOPED, state}),
      ]);
    },
  );

  describe('two pull requests with the same head', () => {
    it('lets the main PR decide the required context when the other is a manual stack', async () => {
      const h = await runSignal({
        eventName: 'pull_request_target',
        others: [stacked({number: 43})],
      });

      expect(statusWrites(h)).toEqual([
        expect.objectContaining({
          context: 'review-required',
          state: 'pending',
          description: 'Waiting on code review: community contribution',
        }),
      ]);
    });

    it('never writes the required context from the manual stack', async () => {
      const h = await runSignal({
        eventName: 'pull_request_target',
        live: stacked({author: 'engineer'}),
        others: [pull({number: 43})],
      });

      expect(contexts(h)).toEqual([SCOPED]);
    });

    it('holds a shared required context pending when both PRs read it', async () => {
      // An engineering owner's PR would self-serve on its own.
      const h = await runSignal({
        eventName: 'pull_request_target',
        live: pull({author: 'engineer'}),
        others: [stacked({number: 43, stack: NATIVE_TRUNK})],
      });

      expect(statusWrites(h)).toEqual([
        expect.objectContaining({
          context: 'review-required',
          state: 'pending',
          description:
            'Head is shared with open PR #43; each needs its own head.',
        }),
      ]);
    });
  });

  describe('a pull request that moves while it is classified', () => {
    it('reclassifies after a retarget with an equal file count', async () => {
      // Both bases report one file; only the identity re-read notices.
      const h = await runSignal({
        eventName: 'pull_request_target',
        live: pull({author: 'engineer'}),
        filesForBase: {
          [DEFAULT_BRANCH]: README,
          [STACKED_BASE]: [
            {
              filename: 'packages/core/src/Button/Button.tsx',
              status: 'modified',
            },
          ],
        },
        onPullGet: (count, state) => {
          if (count === 2) {
            state.pr.base = {
              ...state.pr.base,
              ref: STACKED_BASE,
              sha: LOWER_HEAD,
            };
          }
        },
      });

      expect(h.core.setFailed).not.toHaveBeenCalled();
      expect(contexts(h)).toEqual([SCOPED]);
      expect(statusWrites(h)[0]).toMatchObject({
        state: 'success',
        description: 'No code review required.',
      });
      expect(h.untrustedClassifierRan).toBe(false);
    });

    it('reclassifies once when the base SHA moves before the write', async () => {
      const h = await runSignal({
        eventName: 'pull_request_target',
        // Read 2 is the re-read immediately before the status write.
        onPullGet: (count, state) => {
          if (count === 2) state.pr.base.sha = WORKFLOW_SHA;
        },
      });

      expect(h.core.setFailed).not.toHaveBeenCalled();
      expect(statusWrites(h)).toEqual([
        expect.objectContaining({context: 'review-required', state: 'pending'}),
      ]);
      expect(h.core.info).toHaveBeenCalledWith(
        'PR #42 moved while it was classified (attempt 1 of 3); reading it again.',
      );
    });

    it('fails without a decision when the PR never stops moving', async () => {
      let tick = 0;
      const h = await runSignal({
        eventName: 'pull_request_target',
        onPullGet: (_count, state) => {
          tick += 1;
          state.pr.head.sha = tick.toString(16).padStart(40, 'a');
        },
      });

      expect(h.core.warning).toHaveBeenCalledWith(
        'Failed to flag PR #42: PR #42 moved while it was classified on every attempt; refusing to publish a decision.',
      );
      expect(h.core.setFailed).toHaveBeenCalledOnce();
      for (const mutation of Object.values(h.mutations)) {
        expect(mutation).not.toHaveBeenCalled();
      }
    });

    it('classifies the live PR, not a payload queued before a retarget', async () => {
      // The reproducer: the event was queued while the PR targeted main with
      // 19 files; by the time the job ran it targeted the lower branch.
      const h = await runSignal({
        eventName: 'pull_request_target',
        live: stacked(),
      });

      expect(h.core.setFailed).not.toHaveBeenCalled();
      expect(h.core.warning).not.toHaveBeenCalled();
      expect(contexts(h)).toEqual([SCOPED]);
    });

    it('still fails closed when the file list is incomplete and the PR is stable', async () => {
      const h = await runSignal({
        eventName: 'pull_request_target',
        live: stacked({changedFiles: 19}),
      });

      expect(h.core.warning).toHaveBeenCalledWith(
        'Failed to flag PR #42: GitHub returned 1 of 19 changed files; refusing to classify an incomplete PR.',
      );
      expect(h.core.setFailed).toHaveBeenCalledExactlyOnceWith(
        'One or more PRs failed to flag; see warnings.',
      );
      for (const mutation of Object.values(h.mutations)) {
        expect(mutation).not.toHaveBeenCalled();
      }
    });

    it('does not flag a PR that closed before it was read', async () => {
      const h = await runSignal({
        eventName: 'pull_request_target',
        live: pull({state: 'closed'}),
      });

      expect(h.core.info).toHaveBeenCalledWith(
        'PR #42 is closed; nothing to flag.',
      );
      for (const mutation of Object.values(h.mutations)) {
        expect(mutation).not.toHaveBeenCalled();
      }
    });
  });

  it('retires its own pending scoped status once main governs the PR', async () => {
    const h = await runSignal({
      eventName: 'pull_request_target',
      action: 'edited',
      changes: {base: {ref: {from: STACKED_BASE}}},
      statuses: [{context: SCOPED, state: 'pending'}],
    });

    expect(statusWrites(h)).toEqual([
      expect.objectContaining({context: 'review-required', state: 'pending'}),
      expect.objectContaining({
        context: SCOPED,
        state: 'success',
        description: 'Superseded: this PR is now gated by review-required.',
      }),
    ]);
  });

  it('re-reads every listed PR before a backfill classifies it', async () => {
    const h = await runSignal({
      backfill: true,
      others: [pull({number: 43, headSha: LOWER_HEAD, author: 'engineer'})],
    });

    expect(h.core.setFailed).not.toHaveBeenCalled();
    expect(h.github.rest.pulls.get).toHaveBeenCalledWith(
      expect.objectContaining({pull_number: 42}),
    );
    expect(h.github.rest.pulls.get).toHaveBeenCalledWith(
      expect.objectContaining({pull_number: 43}),
    );
    expect(statusWrites(h)).toEqual([
      expect.objectContaining({sha: HEAD, state: 'pending'}),
      expect.objectContaining({sha: LOWER_HEAD, state: 'success'}),
    ]);
  });
});

describe('review-signal file list and diff consistency', () => {
  const BUTTON = 'packages/core/src/Button/Button.tsx';
  const buttonDiff = diffFor([{filename: BUTTON}]);

  it.each([
    ['a design owner', 'designer'],
    ['a contributor', 'contributor'],
  ])(
    'never decides for %s when the diff describes other files',
    async (_name, author) => {
      // Equal counts: the list says README.md, the diff says a Core file.
      const h = await runSignal({
        eventName: 'pull_request_target',
        live: pull({author}),
        diff: buttonDiff,
      });

      expect(h.state.diffReads).toBe(3);
      expect(h.core.warning).toHaveBeenCalledWith(
        'Failed to flag PR #42: PR #42 served a diff that does not describe its changed-file list on every attempt; refusing to publish a decision.',
      );
      expect(h.core.setFailed).toHaveBeenCalledOnce();
      for (const mutation of Object.values(h.mutations)) {
        expect(mutation).not.toHaveBeenCalled();
      }
    },
  );

  it('recovers when a later attempt serves a consistent diff', async () => {
    const h = await runSignal({
      eventName: 'pull_request_target',
      live: pull({author: 'designer'}),
      diff: state => (state.diffReads === 1 ? buttonDiff : undefined),
    });

    expect(h.core.setFailed).not.toHaveBeenCalled();
    expect(h.state.diffReads).toBe(2);
    expect(statusWrites(h)).toEqual([
      expect.objectContaining({
        context: 'review-required',
        state: 'success',
        description: 'No code review required.',
      }),
    ]);
  });

  it('accepts renames and deletions whose headers match', async () => {
    const changed = [
      {
        filename: 'docs/new.md',
        previous_filename: 'docs/old.md',
        status: 'renamed',
      },
      {filename: 'docs/gone.md', status: 'removed'},
    ];
    const h = await runSignal({
      eventName: 'pull_request_target',
      live: pull({author: 'engineer', changedFiles: 2}),
      files: changed,
      diff: [
        'diff --git a/docs/old.md b/docs/new.md',
        'similarity index 100%',
        'rename from docs/old.md',
        'rename to docs/new.md',
        'diff --git a/docs/gone.md b/docs/gone.md',
        'deleted file mode 100644',
        '',
      ].join('\n'),
    });

    expect(h.core.setFailed).not.toHaveBeenCalled();
    expect(statusWrites(h)).toEqual([
      expect.objectContaining({state: 'success'}),
    ]);
  });

  it('rejects a rename whose previous path differs from the diff', async () => {
    const h = await runSignal({
      eventName: 'pull_request_target',
      live: pull({author: 'engineer'}),
      files: [
        {
          filename: 'docs/new.md',
          previous_filename: 'docs/old.md',
          status: 'renamed',
        },
      ],
      diff: 'diff --git a/packages/core/src/index.ts b/docs/new.md\n',
    });

    expect(h.core.setFailed).toHaveBeenCalledOnce();
    expect(statusWrites(h)).toEqual([]);
  });

  it('checks the file list against a second read when GitHub refuses the diff', async () => {
    const h = await runSignal({
      eventName: 'pull_request_target',
      live: pull({author: 'engineer'}),
      diff: 'too-large',
    });

    expect(h.core.setFailed).not.toHaveBeenCalled();
    expect(h.state.fileReads).toBe(2);
    expect(statusWrites(h)).toEqual([
      expect.objectContaining({state: 'success'}),
    ]);
  });

  it('never decides when a refused diff leaves two different file lists', async () => {
    const h = await runSignal({
      eventName: 'pull_request_target',
      live: pull({author: 'designer'}),
      diff: 'too-large',
      secondFiles: [{filename: BUTTON, status: 'modified'}],
    });

    expect(h.core.warning).toHaveBeenCalledWith(
      'Failed to flag PR #42: PR #42 served two different changed-file lists on every attempt; refusing to publish a decision.',
    );
    expect(statusWrites(h)).toEqual([]);
  });
});

describe('review-signal re-reads the PR before every mutation', () => {
  const everyWriteFollowsARead = log => {
    let readSinceWrite = false;
    for (const entry of log) {
      if (entry === 'read:pull') readSinceWrite = true;
      else if (entry.startsWith('write:')) {
        if (!readSinceWrite) return false;
        readSinceWrite = false;
      }
    }
    return true;
  };

  it('for labels, reviewer requests, auto-merge, statuses, and check runs', async () => {
    // A contributor's design-affecting Core change with auto-merge on and a
    // stale scoped status exercises every mutation the flag job can make.
    const live = {
      ...pull({author: 'contributor'}),
      labels: [{name: 'needs:design-review'}],
      auto_merge: {merge_method: 'squash'},
    };
    const h = await runSignal({
      eventName: 'pull_request_target',
      live,
      files: [
        {
          filename: 'packages/core/src/Button/Button.stylex.ts',
          status: 'modified',
        },
      ],
      statuses: [{context: 'review-required/stacked-pr-42', state: 'pending'}],
    });

    expect(h.core.setFailed).not.toHaveBeenCalled();
    expect(h.state.log.filter(entry => entry.startsWith('write:'))).toEqual(
      expect.arrayContaining([
        'write:add-label',
        'write:request-reviewers',
        'write:graphql',
        'write:status',
      ]),
    );
    expect(everyWriteFollowsARead(h.state.log)).toBe(true);
  });

  it('drops a decision when the PR moves on the read before its write', async () => {
    const h = await runSignal({
      eventName: 'pull_request_target',
      live: {
        ...pull({author: 'contributor'}),
        auto_merge: {merge_method: 'squash'},
      },
      // Read 3 guards the status write of the first attempt.
      onPullGet: (count, state) => {
        if (count === 3) state.pr.base.sha = WORKFLOW_SHA;
      },
    });

    expect(h.core.setFailed).not.toHaveBeenCalled();
    expect(h.state.log).toEqual([
      'read:pull', // attempt 1
      'read:pull',
      'write:graphql', // disable auto-merge (code review required)
      'read:pull', // moved: the first attempt's status is never written
      'read:pull', // attempt 2
      'read:pull',
      'write:graphql',
      'read:pull',
      'write:status',
    ]);
    expect(statusWrites(h)).toEqual([
      expect.objectContaining({context: 'review-required', state: 'pending'}),
    ]);
  });

  it('finds a fork PR that shares the head, which commit association omits', async () => {
    const fork = {
      ...pull({number: 6744, baseRef: STACKED_BASE, baseSha: LOWER_HEAD}),
      head: {
        sha: HEAD,
        ref: 'someone/branch',
        repo: {full_name: 'someone/astryx'},
      },
      stack: NATIVE_TRUNK,
    };
    const h = await runSignal({
      eventName: 'pull_request_target',
      live: pull({author: 'engineer'}),
      others: [fork],
    });

    expect(statusWrites(h)).toEqual([
      expect.objectContaining({
        context: 'review-required',
        state: 'pending',
        description:
          'Head is shared with open PR #6744; each needs its own head.',
      }),
    ]);
  });
});

describe('review-signal and a review that lands while it classifies', () => {
  const approved = {
    user: {login: 'engineer'},
    state: 'APPROVED',
    commit_id: HEAD,
  };
  const changesRequested = {...approved, state: 'CHANGES_REQUESTED'};

  it('reclassifies instead of clearing when a changes-requested lands before the write', async () => {
    const h = await runSignal({
      eventName: 'pull_request_target',
      reviews: [approved],
      // Read 2 re-checks the approval immediately before the status write.
      onReviewsRead: (count, state) => {
        if (count === 2) state.reviews.push(changesRequested);
      },
    });

    expect(h.core.setFailed).not.toHaveBeenCalled();
    expect(statusWrites(h)).toEqual([
      expect.objectContaining({
        state: 'pending',
        description: 'Waiting on code review: community contribution',
      }),
    ]);
    expect(h.core.info).toHaveBeenCalledWith(
      'PR #42 changed its review state while it was classified (attempt 1 of 3); reading it again.',
    );
  });

  it('corrects its own success when a changes-requested lands right after it', async () => {
    const h = await runSignal({
      eventName: 'pull_request_target',
      reviews: [approved],
      // Read 3 verifies the approval after the status write.
      onReviewsRead: (count, state) => {
        if (count === 3) state.reviews.push(changesRequested);
      },
    });

    expect(h.core.setFailed).not.toHaveBeenCalled();
    expect(
      statusWrites(h).map(write => [write.state, write.description]),
    ).toEqual([
      ['success', 'Cleared by code-owner approval.'],
      ['pending', 'Waiting on code review: community contribution'],
    ]);
  });

  it('does not re-check approvals for a decision that does not rest on them', async () => {
    const h = await runSignal({
      eventName: 'pull_request_target',
      live: pull({author: 'engineer'}),
    });

    expect(statusWrites(h)).toEqual([
      expect.objectContaining({
        state: 'success',
        description: 'No code review required.',
      }),
    ]);
    expect(h.state.reviewReads).toBe(1);
  });
});
