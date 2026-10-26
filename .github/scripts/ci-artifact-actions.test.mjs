// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ci-artifact-actions.test.mjs
 * @input .github/workflows/ci.yml, .github/dependabot.yml, .github/actions
 * @output Proof that every job checking out the pull request head takes the
 *   retried artifact actions from the workflow's own commit before it uses
 *   them, so a head older than the actions keeps its jobs working, and that
 *   Dependabot scans every local composite action for bumps
 * @position Guards the two local composite actions under .github/actions
 *   (upload-artifact, download-artifact) and the jobs that load them
 */

import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

const root = path.resolve(import.meta.dirname, '../..');
const ci = yaml.parse(
  fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8'),
);

const LOCAL_ACTION = /^\.\/\.github\/actions\/(upload|download)-artifact$/;
const LOAD = 'Load the artifact actions from the workflow commit';

describe('the retried artifact actions', () => {
  const headJobs = Object.entries(ci.jobs).filter(([, job]) => {
    const steps = job.steps ?? [];
    const checkout = steps.find(step =>
      /^actions\/checkout@/.test(step.uses ?? ''),
    );
    return (
      steps.some(step => LOCAL_ACTION.test(step.uses ?? '')) &&
      /pull_request\.head\.sha/.test(String(checkout?.with?.ref ?? ''))
    );
  });

  it('load from the workflow commit in every job that checks out the pull request head', () => {
    expect(headJobs.length).toBeGreaterThan(0);
    for (const [id, job] of headJobs) {
      const steps = job.steps;
      const checkout = steps.findIndex(step =>
        /^actions\/checkout@/.test(step.uses ?? ''),
      );
      const load = steps.findIndex(step => step.name === LOAD);
      const firstUse = steps.findIndex(step =>
        LOCAL_ACTION.test(step.uses ?? ''),
      );
      expect(load, id).toBeGreaterThan(checkout);
      expect(load, id).toBeLessThan(firstUse);
      expect(steps[load].env?.WORKFLOW_SHA, id).toBe('${{ github.sha }}');
      expect(steps[load].run, id).toContain(
        'git show "$WORKFLOW_SHA:.github/actions/$action/action.yml"',
      );
    }
  });
});

describe('the local composite actions', () => {
  it('each get Dependabot bump pull requests', () => {
    // Dependabot's "/" covers workflows only: a composite action's pins get
    // bumps only from a directory of their own in the github-actions entry.
    const dependabot = yaml.parse(
      fs.readFileSync(path.join(root, '.github/dependabot.yml'), 'utf8'),
    );
    const entry = dependabot.updates.find(
      update => update['package-ecosystem'] === 'github-actions',
    );
    const actions = fs
      .readdirSync(path.join(root, '.github/actions'), {withFileTypes: true})
      .filter(
        dirent =>
          dirent.isDirectory() &&
          fs.existsSync(
            path.join(root, '.github/actions', dirent.name, 'action.yml'),
          ),
      )
      .map(dirent => `/.github/actions/${dirent.name}`);
    expect(actions.length).toBeGreaterThan(0);
    for (const action of actions) {
      expect(entry.directories, action).toContain(action);
    }
  });
});
