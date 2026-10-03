// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Trigger contract for the review gates on stacked pull requests.
 * @input review-signal.yml and spec-owner-gate.yml, evaluated for simulated
 *   pull request events against main and against another pull request's branch.
 * @output Assertions that both gates start for stacked and main-based pull
 *   requests, re-run on base changes, ignore title/body edits, publish only
 *   from the default branch's copy on dispatch, and that only runs which
 *   reconcile can cancel another.
 * @position Node regression coverage for the gate workflows' `on`, `if`, and
 *   `concurrency` blocks; the scripts themselves are covered elsewhere.
 */

import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import YAML from 'yaml';

const root = path.resolve(import.meta.dirname, '../..');
const load = name =>
  YAML.parse(
    fs.readFileSync(path.join(root, '.github/workflows', name), 'utf8'),
  );
const reviewSignal = load('review-signal.yml');
const specOwnerGate = load('spec-owner-gate.yml');
const reviewClear = load('review-clear.yml');

const REPOSITORY = 'facebook/astryx';
const RUN_ID = '987654321';
const STACKED_BASE = 'feature/lower';

// --- A small evaluator for the GitHub Actions expression subset used here. ---

function tokenize(source) {
  const tokens = [];
  let index = 0;
  while (index < source.length) {
    const rest = source.slice(index);
    const space = /^\s+/.exec(rest);
    if (space) {
      index += space[0].length;
      continue;
    }
    const string = /^'((?:[^']|'')*)'/.exec(rest);
    if (string) {
      tokens.push({type: 'value', value: string[1].replace(/''/g, "'")});
      index += string[0].length;
      continue;
    }
    const operator = /^(==|!=|&&|\|\||!|\(|\)|,)/.exec(rest);
    if (operator) {
      tokens.push({type: 'op', value: operator[1]});
      index += operator[1].length;
      continue;
    }
    const word = /^[A-Za-z_][A-Za-z0-9_.-]*/.exec(rest);
    if (word) {
      tokens.push({type: 'word', value: word[0]});
      index += word[0].length;
      continue;
    }
    throw new Error(`Unsupported expression syntax at: ${rest}`);
  }
  return tokens;
}

const truthy = value =>
  value !== null &&
  value !== undefined &&
  value !== false &&
  value !== 0 &&
  value !== '';

function looseEquals(left, right) {
  if (typeof left === 'string' && typeof right === 'string') {
    return left.toLowerCase() === right.toLowerCase();
  }
  return (left ?? null) === (right ?? null);
}

const FUNCTIONS = {
  startsWith: (value, prefix) =>
    String(value ?? '')
      .toLowerCase()
      .startsWith(String(prefix ?? '').toLowerCase()),
  contains: (haystack, needle) =>
    Array.isArray(haystack)
      ? haystack.some(item => looseEquals(item, needle))
      : String(haystack ?? '')
          .toLowerCase()
          .includes(String(needle ?? '').toLowerCase()),
  fromJSON: value => JSON.parse(value),
  format: (template, ...args) =>
    String(template).replace(/\{(\d+)\}/g, (_match, index) =>
      String(args[Number(index)] ?? ''),
    ),
};

function evaluate(source, context) {
  const tokens = tokenize(source);
  let position = 0;
  const peek = () => tokens[position];
  const take = expected => {
    const token = tokens[position++];
    if (expected && token?.value !== expected) {
      throw new Error(`Expected ${expected} in: ${source}`);
    }
    return token;
  };
  function lookup(name) {
    if (name === 'null') return null;
    if (name === 'true') return true;
    if (name === 'false') return false;
    return name
      .split('.')
      .reduce(
        (value, key) => (value == null ? null : (value[key] ?? null)),
        context,
      );
  }
  function primary() {
    const token = take();
    if (token.type === 'value') return token.value;
    if (token.value === '(') {
      const value = or();
      take(')');
      return value;
    }
    if (token.type === 'word' && peek()?.value === '(') {
      take('(');
      const args = [];
      while (peek()?.value !== ')') {
        args.push(or());
        if (peek()?.value === ',') take(',');
      }
      take(')');
      return FUNCTIONS[token.value](...args);
    }
    if (token.type === 'word') return lookup(token.value);
    throw new Error(`Unexpected token ${token.value} in: ${source}`);
  }
  function unary() {
    if (peek()?.value === '!') {
      take('!');
      return !truthy(unary());
    }
    return primary();
  }
  function equality() {
    let left = unary();
    while (peek()?.value === '==' || peek()?.value === '!=') {
      const operator = take().value;
      const equal = looseEquals(left, unary());
      left = operator === '==' ? equal : !equal;
    }
    return left;
  }
  function and() {
    let left = equality();
    while (peek()?.value === '&&') {
      take('&&');
      const right = equality();
      left = truthy(left) ? right : left;
    }
    return left;
  }
  function or() {
    let left = and();
    while (peek()?.value === '||') {
      take('||');
      const right = and();
      left = truthy(left) ? left : right;
    }
    return left;
  }
  const value = or();
  if (position !== tokens.length) {
    throw new Error(`Trailing tokens in: ${source}`);
  }
  return value;
}

const interpolate = (template, context) =>
  template.replace(/\$\{\{([\s\S]*?)\}\}/g, (_match, expression) =>
    String(evaluate(expression, context)),
  );

// --- GitHub's trigger matching for the events the gates subscribe to. ---

const DEFAULT_TYPES = {
  pull_request_target: ['opened', 'synchronize', 'reopened'],
};

function globToRegExp(pattern) {
  const escaped = pattern
    .split('**')
    .map(part =>
      part
        .split('*')
        .map(piece => piece.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
        .join('[^/]*'),
    )
    .join('.*');
  return new RegExp(`^${escaped}$`);
}

function workflowTriggers(workflow, event) {
  const trigger = workflow.on[event.name];
  if (trigger === undefined) return false;
  const config = trigger ?? {};
  const types = config.types ?? DEFAULT_TYPES[event.name];
  if (types && event.action && !types.includes(event.action)) return false;
  if (event.baseRef !== undefined) {
    if (
      config.branches &&
      !config.branches.some(pattern =>
        globToRegExp(pattern).test(event.baseRef),
      )
    ) {
      return false;
    }
    if (
      config['branches-ignore'] &&
      config['branches-ignore'].some(pattern =>
        globToRegExp(pattern).test(event.baseRef),
      )
    ) {
      return false;
    }
  }
  return true;
}

function pullRequestEvent({action, baseRef = 'main', changes, review}) {
  const eventName = review ? 'pull_request_review' : 'pull_request_target';
  const payload = {
    action,
    changes,
    review,
    pull_request: {
      number: 42,
      base: {ref: baseRef, repo: {full_name: REPOSITORY}},
      head: {ref: 'feature/upper', repo: {full_name: REPOSITORY}},
    },
    repository: {full_name: REPOSITORY, default_branch: 'main'},
  };
  return {
    event: {name: eventName, action, baseRef},
    context: {
      github: {
        event_name: eventName,
        event: payload,
        // pull_request_target always runs on the default branch.
        ref: review ? 'refs/pull/42/merge' : 'refs/heads/main',
        repository: REPOSITORY,
        run_id: RUN_ID,
      },
    },
  };
}

function dispatchEvent({pr = '42', ref = 'refs/heads/main'} = {}) {
  return {
    event: {name: 'workflow_dispatch'},
    context: {
      github: {
        event_name: 'workflow_dispatch',
        event: {
          inputs: {pr},
          repository: {full_name: REPOSITORY, default_branch: 'main'},
        },
        ref,
        repository: REPOSITORY,
        run_id: RUN_ID,
      },
    },
  };
}

function workflowRunEvent(
  triggeringEvent,
  {branch = 'feature/upper', sha = 'c'.repeat(40), runId = RUN_ID} = {},
) {
  return {
    event: {name: 'workflow_run', action: 'completed'},
    context: {
      github: {
        event_name: 'workflow_run',
        event: {
          action: 'completed',
          workflow_run: {
            event: triggeringEvent,
            // A fork PR's review run names this repository here.
            head_repository: {full_name: REPOSITORY},
            head_branch: branch,
            head_sha: sha,
          },
        },
        ref: 'refs/heads/main',
        repository: REPOSITORY,
        run_id: runId,
      },
    },
  };
}

function runningJobs(workflow, {event, context}) {
  if (!workflowTriggers(workflow, event)) return [];
  return Object.entries(workflow.jobs)
    .filter(
      ([, job]) => job.if === undefined || truthy(evaluate(job.if, context)),
    )
    .map(([name]) => name);
}

const concurrencyGroup = (workflow, {context}) =>
  interpolate(workflow.concurrency.group, context);

const retarget = from => ({base: {ref: {from}, sha: {from: '0'.repeat(40)}}});

describe('stacked pull request gate triggers', () => {
  it('keeps both gates free of a base-branch filter', () => {
    for (const workflow of [reviewSignal, specOwnerGate]) {
      expect(workflow.on.pull_request_target.branches).toBeUndefined();
      expect(
        workflow.on.pull_request_target['branches-ignore'],
      ).toBeUndefined();
    }
  });

  it.each([
    'opened',
    'synchronize',
    'reopened',
    'ready_for_review',
    'converted_to_draft',
  ])('starts both gates on %s for main-based and stacked PRs', action => {
    for (const baseRef of ['main', STACKED_BASE]) {
      const event = pullRequestEvent({action, baseRef});
      expect(
        runningJobs(reviewSignal, event),
        `${action} on ${baseRef}`,
      ).toEqual(['flag']);
      expect(
        runningJobs(specOwnerGate, event),
        `${action} on ${baseRef}`,
      ).toEqual(['reconcile']);
    }
  });

  it('reconciles the spec gate when auto-merge is enabled on a stacked PR', () => {
    const event = pullRequestEvent({
      action: 'auto_merge_enabled',
      baseRef: STACKED_BASE,
    });
    expect(runningJobs(specOwnerGate, event)).toEqual(['reconcile']);
    expect(runningJobs(reviewSignal, event)).toEqual([]);
  });

  it.each([
    ['onto another PR branch', STACKED_BASE, 'main'],
    ['back to main', 'main', STACKED_BASE],
  ])(
    're-runs both gates when a PR is retargeted %s',
    (_name, baseRef, from) => {
      const event = pullRequestEvent({
        action: 'edited',
        baseRef,
        changes: retarget(from),
      });
      expect(runningJobs(reviewSignal, event)).toEqual(['flag']);
      expect(runningJobs(specOwnerGate, event)).toEqual(['reconcile']);
    },
  );

  it('ignores title and body edits without cancelling an in-flight flag run', () => {
    const edit = pullRequestEvent({
      action: 'edited',
      baseRef: STACKED_BASE,
      changes: {title: {from: 'Old title'}},
    });
    expect(runningJobs(reviewSignal, edit)).toEqual([]);
    expect(runningJobs(specOwnerGate, edit)).toEqual([]);

    const push = pullRequestEvent({
      action: 'synchronize',
      baseRef: STACKED_BASE,
    });
    const baseChange = pullRequestEvent({
      action: 'edited',
      baseRef: 'main',
      changes: retarget(STACKED_BASE),
    });
    expect(concurrencyGroup(reviewSignal, push)).toBe('review-signal-pr-42');
    // A retarget supersedes a run still classifying the old base.
    expect(concurrencyGroup(reviewSignal, baseChange)).toBe(
      'review-signal-pr-42',
    );
    expect(concurrencyGroup(reviewSignal, edit)).toBe(
      `review-signal-run-${RUN_ID}`,
    );
  });

  it('never lets a review event cancel a classification run', () => {
    const approval = pullRequestEvent({
      action: 'submitted',
      baseRef: STACKED_BASE,
      review: {state: 'approved'},
    });
    expect(runningJobs(reviewSignal, approval)).toEqual(['review-anchor']);
    expect(runningJobs(specOwnerGate, approval)).toEqual(['reconcile']);
    // Its own run scope: the anchor completes (review-clear depends on it)
    // and a retarget's classification in the PR group survives it.
    expect(concurrencyGroup(reviewSignal, approval)).toBe(
      `review-signal-run-${RUN_ID}`,
    );
  });

  it('only groups runs that reclassify the pull request', () => {
    // Every member of the PR group runs the flag job on the live PR.
    for (const event of [
      pullRequestEvent({action: 'synchronize', baseRef: STACKED_BASE}),
      pullRequestEvent({
        action: 'edited',
        baseRef: 'main',
        changes: retarget(STACKED_BASE),
      }),
      dispatchEvent(),
    ]) {
      expect(concurrencyGroup(reviewSignal, event)).toBe('review-signal-pr-42');
      expect(runningJobs(reviewSignal, event)).toEqual(['flag']);
    }
    // The backfill-all dispatch is never cancelled by a single-PR run.
    const backfill = dispatchEvent({pr: ''});
    expect(concurrencyGroup(reviewSignal, backfill)).toBe(
      `review-signal-run-${RUN_ID}`,
    );
    expect(runningJobs(reviewSignal, backfill)).toEqual(['flag']);
  });

  it('publishes on dispatch only from the default branch copy', () => {
    const fromBranch = dispatchEvent({ref: 'refs/heads/feature/upper'});
    expect(runningJobs(reviewSignal, fromBranch)).toEqual([]);
    expect(runningJobs(specOwnerGate, fromBranch)).toEqual([]);
    // A skipped dispatch must not cancel a classification either.
    expect(concurrencyGroup(reviewSignal, fromBranch)).toBe(
      `review-signal-run-${RUN_ID}`,
    );

    const fromDefault = dispatchEvent();
    expect(runningJobs(reviewSignal, fromDefault)).toEqual(['flag']);
    expect(runningJobs(specOwnerGate, fromDefault)).toEqual(['reconcile']);
  });

  it('never lets one review-clear run cancel another', () => {
    // GitHub compares concurrency group names case-insensitively, while branch
    // names are case-sensitive, so no branch-derived key can separate exactly
    // the runs that reconcile different pull requests. Every run is its own
    // group instead.
    expect(reviewClear.concurrency['cancel-in-progress']).toBe(false);
    const shared = 'd'.repeat(40);
    const runs = [
      ['pull_request_review', 'branch-a', '1001'],
      ['pull_request_review', 'Branch-A', '1002'],
      ['pull_request_review', 'branch-a', '1003'],
      ['pull_request_review', 'branch-b', '1004'],
      ['pull_request_target', 'branch-a', '1005'],
    ].map(([event, branch, runId]) =>
      workflowRunEvent(event, {branch, sha: shared, runId}),
    );
    const groups = runs.map(event => concurrencyGroup(reviewClear, event));
    expect(groups).toEqual([
      'review-clear-run-1001',
      'review-clear-run-1002',
      'review-clear-run-1003',
      'review-clear-run-1004',
      'review-clear-run-1005',
    ]);
    // Compared the way GitHub compares them.
    expect(new Set(groups.map(group => group.toLowerCase())).size).toBe(
      runs.length,
    );
  });

  it('models why a branch-keyed review-clear group was unsafe', () => {
    // The previous commit-and-branch key put these two runs in one GitHub
    // group although they reconcile pull requests on different branches.
    const previousKey = event => {
      const run = event.context.github.event.workflow_run;
      return `review-clear-sha-${run.head_sha}-${run.head_branch}`.toLowerCase();
    };
    const lower = workflowRunEvent('pull_request_review', {
      branch: 'branch-a',
      runId: '2001',
    });
    const upper = workflowRunEvent('pull_request_review', {
      branch: 'Branch-A',
      runId: '2002',
    });
    expect(previousKey(lower)).toBe(previousKey(upper));
    expect(concurrencyGroup(reviewClear, lower).toLowerCase()).not.toBe(
      concurrencyGroup(reviewClear, upper).toLowerCase(),
    );
  });

  it('keeps skipped review-clear runs from cancelling a reconciliation', () => {
    const afterReview = workflowRunEvent('pull_request_review');
    expect(runningJobs(reviewClear, afterReview)).toEqual(['clear']);
    expect(concurrencyGroup(reviewClear, afterReview)).toBe(
      `review-clear-run-${RUN_ID}`,
    );

    for (const triggeringEvent of [
      'pull_request_target',
      'workflow_dispatch',
    ]) {
      const afterFlag = workflowRunEvent(triggeringEvent);
      expect(runningJobs(reviewClear, afterFlag)).toEqual([]);
      expect(concurrencyGroup(reviewClear, afterFlag)).toBe(
        `review-clear-run-${RUN_ID}`,
      );
    }
  });
});
