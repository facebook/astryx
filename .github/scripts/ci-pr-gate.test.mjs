// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file A pull request runs CI when it is ready and its branch lives in this
 * repository or a maintainer labelled it `ci:run` (spec:AST-030 FR17).
 */

import fs from 'node:fs';
import path from 'node:path';

import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

import {PR_CI_GATE, PR_HELD, PR_REPORT_GATE, ungated} from './ci-pr-gate.mjs';

const dir = path.resolve(import.meta.dirname, '../workflows');
const workflows = fs
  .readdirSync(dir)
  .filter(name => name.endsWith('.yml'))
  .map(name => [
    name,
    yaml.parse(fs.readFileSync(path.join(dir, name), 'utf8')),
  ])
  .filter(([, value]) => {
    const pr = (value.on ?? value[true]).pull_request;
    return (
      pr !== undefined && !(pr?.types ?? []).every(type => type === 'closed')
    );
  });
// The jobs that report a required context (build, test, docsite-test, lint).
const REQUIRED = {
  'ci.yml': ['build', 'docsite-test', 'test'],
  'lint.yml': ['lint'],
};

const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const startsWithGate = gate => new RegExp(`^(\\$\\{\\{ )?${escape(gate)}`);

function pullRequest({draft = false, fork = false, labels = []}) {
  return {
    draft,
    head: {repo: {full_name: fork ? 'someone/astryx' : 'meta/astryx'}},
    labels: labels.map(name => ({name})),
  };
}

/** Evaluates a gate expression as Actions would, for one event. */
function evaluate(expression, {event = 'pull_request', ...pr}) {
  const github = {
    event_name: event,
    repository: 'meta/astryx',
    event: {pull_request: event === 'pull_request' ? pullRequest(pr) : null},
  };
  const js = expression.replace(
    /\.labels\.\*\.name/g,
    '.labels.map(l => l.name)',
  );
  return Function(
    'github',
    'contains',
    `return Boolean(${js});`,
  )(github, (list, item) => list.includes(item));
}

/** Whether a required job's own condition, past its draft skip, starts it with every need skipped. */
function startsWithNeedsSkipped(condition, needs) {
  const expression = ungated(condition)
    .replace(`${PR_REPORT_GATE} && (`, '(')
    .replace(/needs\.([a-z][a-z0-9-]*)/g, 'needs["$1"]');
  return Function(
    'github',
    'needs',
    'always',
    'cancelled',
    'startsWith',
    `return Boolean(${expression});`,
  )(
    {
      event_name: 'pull_request',
      base_ref: 'main',
      event: {pull_request: pullRequest({fork: true})},
    },
    needs,
    () => true,
    () => false,
    (value, prefix) => String(value ?? '').startsWith(prefix),
  );
}

const runs = event => evaluate(PR_CI_GATE, event);
const held = event => evaluate(PR_HELD, event);

describe('pull-request CI gate (spec:AST-030 FR17)', () => {
  it('finds the pull-request workflows', () => {
    expect(workflows.map(([name]) => name).sort()).toEqual([
      'ci.yml',
      'cli-smoke-test.yml',
      'codemod-verify.yml',
      'crowdin-download.yml',
      'internal-registry.yml',
      'lint.yml',
    ]);
  });

  it.each(workflows)(
    '%s starts when a draft is marked ready, never on a label, and gates every job that can start',
    (name, value) => {
      expect((value.on ?? value[true]).pull_request.types).toEqual([
        'opened',
        'synchronize',
        'reopened',
        'ready_for_review',
      ]);
      for (const [id, job] of Object.entries(value.jobs)) {
        const condition = String(job.if ?? '');
        if (REQUIRED[name]?.includes(id)) {
          // Skips only a draft. For an unlabelled fork it starts even when every
          // job it needs skipped, and its first step fails with the reason.
          expect(condition, `${name}/${id}`).toMatch(
            startsWithGate(PR_REPORT_GATE),
          );
          const needs = Object.fromEntries(
            [job.needs ?? []].flat().map(need => [need, {result: 'skipped'}]),
          );
          expect(
            startsWithNeedsSkipped(condition, needs),
            `${name}/${id}`,
          ).toBe(true);
          expect(job.steps[0], `${name}/${id}`).toMatchObject({
            if: `\${{ ${PR_HELD} }}`,
          });
          expect(job.steps[0].run).toContain('exit 1');
          continue;
        }
        // A job that needs others is skipped with them, unless it asks to run
        // anyway; a dispatch-only job never starts on a pull request.
        if (
          job.needs &&
          !/always\(\)|cancelled\(\)|failure\(\)/.test(condition)
        )
          continue;
        if (
          /^(\$\{\{\s*)?(always\(\) && )?github\.event_name == 'workflow_dispatch' &&/.test(
            condition,
          )
        )
          continue;
        expect(condition, `${name}/${id}`).toMatch(startsWithGate(PR_CI_GATE));
      }
    },
  );

  it('runs a pull request from a branch here, or from a fork once labelled; never a draft', () => {
    expect(runs({})).toBe(true);
    expect(runs({fork: true})).toBe(false);
    expect(runs({fork: true, labels: ['ci:run']})).toBe(true);
    expect(runs({fork: true, labels: ['ci:heavy-lanes']})).toBe(false);
    expect(runs({draft: true})).toBe(false);
    expect(runs({draft: true, fork: true, labels: ['ci:run']})).toBe(false);
  });

  it('skips the required checks of a draft and fails those of an unlabelled fork', () => {
    const reports = event => evaluate(PR_REPORT_GATE, event) && !held(event);
    expect(reports({})).toBe(true);
    expect(reports({fork: true, labels: ['ci:run']})).toBe(true);
    expect(evaluate(PR_REPORT_GATE, {fork: true})).toBe(true);
    expect(held({fork: true})).toBe(true);
    expect(evaluate(PR_REPORT_GATE, {draft: true})).toBe(false);
  });

  it('passes every event that is not a pull request', () => {
    for (const event of ['push', 'merge_group', 'workflow_dispatch']) {
      expect(runs({event}), event).toBe(true);
      expect(evaluate(PR_REPORT_GATE, {event}) && !held({event}), event).toBe(
        true,
      );
    }
  });
});
