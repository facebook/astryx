// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Pull-request CI runs only for a ready pull request from a member, or
 * one a maintainer labelled `ci:run` (spec:AST-030 FR17).
 */

import fs from 'node:fs';
import path from 'node:path';

import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

import {PR_CI_GATE} from './ci-pr-gate.mjs';

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

/** Evaluates the gate as Actions would, for one event. */
function allows({
  event = 'pull_request',
  action = 'synchronize',
  draft = false,
  association = 'MEMBER',
  labels = [],
  label,
}) {
  const github = {
    event_name: event,
    event: {
      action,
      label: label && {name: label},
      pull_request:
        event === 'pull_request'
          ? {
              draft,
              author_association: association,
              labels: labels.map(name => ({name})),
            }
          : null,
    },
  };
  const js = PR_CI_GATE.replace(
    /\.labels\.\*\.name/g,
    '.labels.map(l => l.name)',
  );
  return Function(
    'github',
    'contains',
    'fromJSON',
    `return Boolean(${js});`,
  )(github, (list, item) => list.includes(item), JSON.parse);
}

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
    '%s starts on ready and on a label, and gates every job that can start',
    (name, value) => {
      expect((value.on ?? value[true]).pull_request.types).toEqual([
        'opened',
        'synchronize',
        'reopened',
        'ready_for_review',
        'labeled',
      ]);
      for (const [id, job] of Object.entries(value.jobs)) {
        const condition = String(job.if ?? '');
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
        expect(condition.replace(/^\$\{\{\s*/, ''), `${name}/${id}`).toMatch(
          new RegExp(`^${PR_CI_GATE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
        );
      }
      expect(value.concurrency.group, name).toContain(
        "github.event.action == 'labeled' && github.event.label.name != 'ci:run'",
      );
    },
  );

  it('runs a member pull request and a labelled outside one; never a draft', () => {
    expect(allows({})).toBe(true);
    expect(allows({association: 'COLLABORATOR'})).toBe(true);
    expect(allows({association: 'CONTRIBUTOR'})).toBe(false);
    expect(allows({association: 'FIRST_TIME_CONTRIBUTOR'})).toBe(false);
    expect(allows({association: 'CONTRIBUTOR', labels: ['ci:run']})).toBe(true);
    expect(allows({draft: true})).toBe(false);
    expect(
      allows({draft: true, association: 'CONTRIBUTOR', labels: ['ci:run']}),
    ).toBe(false);
  });

  it('starts a full run when a draft is marked ready or labelled ci:run, and for no other label', () => {
    expect(allows({action: 'ready_for_review'})).toBe(true);
    expect(
      allows({
        action: 'labeled',
        label: 'ci:run',
        association: 'CONTRIBUTOR',
        labels: ['ci:run'],
      }),
    ).toBe(true);
    expect(allows({action: 'labeled', label: 'needs:spec-owner-review'})).toBe(
      false,
    );
  });

  it('passes every event that is not a pull request', () => {
    for (const event of ['push', 'merge_group', 'workflow_dispatch']) {
      expect(allows({event}), event).toBe(true);
    }
  });
});
