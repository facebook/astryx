// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file workflow-relevance.test.mjs
 * @input .github/workflow-relevance.json and every workflow in .github/workflows
 * @output Node contracts that every workflow declares why it runs as a positive
 *   allowlist, that none runs on everything not excluded, and that every
 *   required context reports on every pull request
 * @position Contract for spec:AST-030 FR14
 */

import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

const root = path.resolve(import.meta.dirname, '../..');
const workflowDir = path.join(root, '.github/workflows');
const registry = JSON.parse(
  fs.readFileSync(path.join(root, '.github/workflow-relevance.json'), 'utf8'),
);

const workflowFiles = fs
  .readdirSync(workflowDir)
  .filter(name => /\.ya?ml$/.test(name))
  .sort();

const source = name => fs.readFileSync(path.join(workflowDir, name), 'utf8');
const parsed = name => yaml.parse(source(name));

/** The workflow's triggers as an object, whatever form `on:` takes. */
function triggersOf(name) {
  const workflow = parsed(name);
  // YAML 1.1 readers turn a bare `on` key into `true`.
  const on = workflow.on ?? workflow[true];
  if (typeof on === 'string') return {[on]: null};
  if (Array.isArray(on)) return Object.fromEntries(on.map(key => [key, null]));
  return on ?? {};
}

/** Triggers that fire on a code change, and so need a path allowlist. */
const CODE_TRIGGERS = ['push', 'pull_request', 'pull_request_target'];
/** Events about reviews, comments, checks and deployments, never a code path. */
const REVIEW_EVENTS = new Set([
  'pull_request_target',
  'pull_request_review',
  'issue_comment',
  'workflow_run',
  'deployment_status',
  'repository_dispatch',
  'workflow_dispatch',
]);

const KINDS = new Set([
  'paths',
  'change-scope',
  'landed-commit',
  'review-event',
  'schedule',
  'manual',
]);

describe('every workflow declares why it runs (spec:AST-030 FR14)', () => {
  it('has exactly one registry entry per workflow file', () => {
    expect(Object.keys(registry.workflows).sort()).toEqual(workflowFiles);
  });

  it.each(workflowFiles)('%s names a known kind and a reason', name => {
    const entry = registry.workflows[name];
    expect(KINDS.has(entry.kind), `${name}: unknown kind ${entry.kind}`).toBe(
      true,
    );
    expect(entry.reason?.length ?? 0, `${name}: give a reason`).toBeGreaterThan(
      10,
    );
  });

  it.each(workflowFiles)(
    '%s never runs on everything that is not excluded (no paths-ignore)',
    name => {
      for (const [event, config] of Object.entries(triggersOf(name))) {
        expect(
          config?.['paths-ignore'],
          `${name} ${event}: list the paths that make it relevant instead`,
        ).toBeUndefined();
      }
      // A denylist written in any other form (a comment-free scan).
      expect(source(name)).not.toMatch(/^\s*paths-ignore\s*:/m);
    },
  );

  it.each(workflowFiles)('%s holds to its kind', name => {
    const {kind} = registry.workflows[name];
    const triggers = triggersOf(name);
    const events = Object.keys(triggers);

    switch (kind) {
      case 'paths': {
        const code = events.filter(event => CODE_TRIGGERS.includes(event));
        expect(
          code.length,
          `${name}: a paths workflow needs a code trigger`,
        ).toBeGreaterThan(0);
        for (const event of code) {
          const paths = triggers[event]?.paths;
          expect(
            Array.isArray(paths) && paths.length > 0,
            `${name} ${event}: list the paths that make it relevant`,
          ).toBe(true);
          for (const glob of paths) {
            expect(glob, `${name}: "${glob}" matches every path`).not.toMatch(
              /^\*\*(?:\/\*)?$/,
            );
            expect(
              glob.startsWith('!'),
              `${name}: "${glob}" is an exclusion`,
            ).toBe(false);
          }
        }
        // A merge-group entry cannot filter by path and keeps running.
        for (const event of events) {
          expect(
            [...CODE_TRIGGERS, 'merge_group', 'workflow_dispatch'],
            `${name}: ${event} has no path filter`,
          ).toContain(event);
        }
        break;
      }
      case 'change-scope': {
        // Required contexts report on every pull request; the trusted
        // classifier, loaded from the base, picks the work inside them.
        expect(events).toContain('pull_request');
        expect(triggers.pull_request?.paths).toBeUndefined();
        expect(source(name)).toContain(
          'git show "origin/${{ github.base_ref }}:.github/scripts/change-scope.cjs"',
        );
        break;
      }
      case 'landed-commit': {
        expect(events).toContain('push');
        expect(triggers.push?.branches).toEqual(['main']);
        for (const event of events) {
          expect(['push', 'workflow_dispatch'], `${name}: ${event}`).toContain(
            event,
          );
        }
        break;
      }
      case 'review-event': {
        for (const event of events) {
          expect(
            REVIEW_EVENTS.has(event),
            `${name}: ${event} is a code trigger`,
          ).toBe(true);
        }
        break;
      }
      case 'schedule': {
        expect(events).toContain('schedule');
        for (const event of events) {
          expect(
            ['schedule', 'workflow_dispatch'],
            `${name}: ${event}`,
          ).toContain(event);
        }
        break;
      }
      case 'manual': {
        expect(events).toEqual(['workflow_dispatch']);
        break;
      }
    }
  });
});

describe('every required context reports on every pull request', () => {
  it.each(Object.entries(registry.requiredContexts))(
    '%s comes from a workflow no path filter can skip',
    (context, {workflow, job, status}) => {
      const entry = registry.workflows[workflow];
      expect(entry, `${context}: ${workflow} is not registered`).toBeDefined();
      // A path-filtered workflow never starts, so its context would never
      // report and the pull request would wait forever.
      expect(['change-scope', 'review-event']).toContain(entry.kind);
      if (job != null) {
        expect(
          Object.keys(parsed(workflow).jobs),
          `${context}: ${workflow} has no ${job} job`,
        ).toContain(job);
      } else {
        expect(status).toBe(true);
      }
    },
  );

  it('keeps every path-filtered workflow out of the required set', () => {
    const required = new Set(
      Object.values(registry.requiredContexts).map(({workflow}) => workflow),
    );
    for (const [name, {kind}] of Object.entries(registry.workflows)) {
      if (kind === 'paths') {
        expect(
          required.has(name),
          `${name} is required but path-filtered`,
        ).toBe(false);
      }
    }
  });
});
