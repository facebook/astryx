// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ci-test-routing.test.mjs
 *
 * The contract between `vitest.config.ts` and the CI jobs that run it, in both
 * workflows that run the suite.
 *
 * This repo has now lost test coverage to routing twice. First a suite
 * belonged to no Vitest project, so `pnpm test` never collected it. Then the
 * single `test` job that ran every project at once was terminated around 20
 * minutes with no summary — `main` was already at ~19m15, so the budget was
 * the defect, not any one test. `deploy.yml`'s push gate carried strictly more
 * than that: the same suite plus a full build plus eight typecheck gates.
 *
 * Both now run the projects as parallel lanes joined by `test`. That only
 * holds if every project has a lane in every workflow: a third project added
 * to the config with no job to run it would be collected by nobody and fail
 * nothing — the first failure again, one level up.
 */

import fs from 'node:fs';
import path from 'node:path';

import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

const root = path.resolve(import.meta.dirname, '../..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

/** The `name:` of every project declared in the root Vitest config. */
function declaredProjects() {
  return [...read('vitest.config.ts').matchAll(/^\s*name:\s*'([^']+)'/gm)].map(
    match => match[1],
  );
}

/**
 * The runner labels this repo is known to have.
 *
 * Deliberately a FIXED list, not one scraped from the workflow under test. A
 * self-derived allowlist is vacuous: a typo'd label appears in the file, so it
 * appears in the set, so it validates itself and the job queues forever
 * against a runner that does not exist. Adding a genuinely new label is a
 * deliberate edit here.
 */
const KNOWN_RUNNERS = new Set([
  '2-core-ubuntu-arm',
  '4-core-ubuntu',
  'ubuntu-slim',
  'ubuntu-latest',
]);

const WORKFLOWS = {
  'ci.yml': {
    lanes: ['test-ui', 'test-node'],
    // A PR that only touches docs skips the suite but must still report.
    scopeConditional: true,
  },
  'deploy.yml': {
    // The push gate also owns the build + typecheck gates, which need each
    // other and so ride one lane of their own.
    lanes: ['test-ui', 'test-node', 'typecheck'],
    scopeConditional: false,
  },
};

function load(file) {
  return yaml.parse(read(`.github/workflows/${file}`));
}

function runLines(job) {
  return (job?.steps ?? [])
    .map(step => step.run)
    .filter(Boolean)
    .join('\n');
}

describe.each(Object.entries(WORKFLOWS))(
  '%s test routing',
  (file, {lanes, scopeConditional}) => {
    const workflow = load(file);

    it('runs every declared Vitest project in some lane', () => {
      const projects = declaredProjects();
      expect(projects.length).toBeGreaterThan(0);

      const commands = lanes
        .map(lane => runLines(workflow.jobs[lane]))
        .join('\n');
      for (const project of projects) {
        expect(commands, `no lane runs --project ${project}`).toContain(
          `--project ${project}`,
        );
      }
    });

    it('assigns each project to exactly one lane', () => {
      for (const project of declaredProjects()) {
        const owners = lanes.filter(lane =>
          runLines(workflow.jobs[lane]).includes(`--project ${project}`),
        );
        expect(
          owners,
          `--project ${project} runs in ${owners.length} lanes`,
        ).toHaveLength(1);
      }
    });

    it('gives no lane the whole suite', () => {
      // A bare `pnpm test` runs every project in one job — the shape that hit
      // the wall.
      for (const lane of lanes) {
        expect(
          runLines(workflow.jobs[lane]),
          `${lane} runs the whole suite`,
        ).not.toMatch(/^\s*pnpm test\s*$/m);
      }
    });

    it('keeps `test` as a job so its context still reports', () => {
      // In ci.yml this is a required status check; in deploy.yml the `deploy`
      // job gates the publish on `needs.test.result`. Renaming it silently
      // breaks whichever one applies.
      expect(workflow.jobs.test).toBeDefined();
      expect(workflow.jobs.test.needs).toEqual(expect.arrayContaining(lanes));
    });

    it('fails the join when any lane fails', () => {
      // `needs` alone does not fail a job whose `if` is `always()`; the join
      // has to assert the results it waited for.
      const join = runLines(workflow.jobs.test);
      for (const lane of lanes) {
        expect(join, `join does not assert ${lane}`).toContain(
          `needs.${lane}.result }}" = "success"`,
        );
      }
    });

    it('runs every lane on a known runner label', () => {
      for (const job of [...lanes, 'test']) {
        const label = workflow.jobs[job]['runs-on'];
        expect(
          KNOWN_RUNNERS.has(label),
          `${job} uses unknown runner label "${label}"`,
        ).toBe(true);
      }
    });

    if (scopeConditional) {
      it('keeps the lightweight-docs skip on every lane', () => {
        for (const lane of lanes) {
          expect(workflow.jobs[lane].if).toContain('always()');
          const steps = workflow.jobs[lane].steps;
          const suite = steps.find(step => step.run?.includes('--project'));
          expect(suite.if, `${lane} suite is unconditional`).toContain(
            "docsite_only != 'true'",
          );
          expect(suite.if, `${lane} suite is unconditional`).toContain(
            "spec_only != 'true'",
          );
          expect(
            steps.some(step =>
              step.run?.includes('refusing to skip required work'),
            ),
            `${lane} does not guard against an unclassified scope`,
          ).toBe(true);
        }
      });
    }
  },
);

describe('deploy.yml push gating', () => {
  const workflow = load('deploy.yml');

  it('still blocks the publish on the join and the build', () => {
    // Splitting the gate must not let a deploy through on a red suite.
    expect(workflow.jobs.deploy.needs).toEqual(
      expect.arrayContaining(['test', 'build']),
    );
    expect(workflow.jobs.deploy.if).toContain("needs.test.result == 'success'");
    expect(workflow.jobs.deploy.if).toContain(
      "needs.build.result == 'success'",
    );
  });

  it('keeps the typecheck gates behind the build they need', () => {
    // `typecheck:strict` resolves the built @astryxdesign/* types, so the
    // build has to precede the gates in the SAME lane.
    const steps = workflow.jobs.typecheck.steps.map(step => step.run ?? '');
    const build = steps.findIndex(step => step.trim() === 'pnpm build');
    const strict = steps.findIndex(step => step.includes('typecheck:strict'));

    expect(build).toBeGreaterThanOrEqual(0);
    expect(strict).toBeGreaterThan(build);
  });

  it('keeps every typecheck gate that guarded main', () => {
    // These exist because a typecheck error can otherwise land on main and
    // break the `build` check on every open PR (#3197).
    const gates = runLines(workflow.jobs.typecheck);
    for (const gate of [
      'scripts/verify-exports.mjs',
      '@astryxdesign/core typecheck:docs',
      '@astryxdesign/lab typecheck:docs',
      '@astryxdesign/charts typecheck:docs',
      '@astryxdesign/cli typecheck:template-docs',
      '@astryxdesign/cli typecheck:strict',
      '@astryxdesign/storybook typecheck',
      '@astryxdesign/core typecheck',
    ]) {
      expect(gates, `lost the ${gate} gate`).toContain(gate);
    }
  });

  it('checks out main on every push-gate lane', () => {
    // A lane that checks out the default ref would gate the wrong commit.
    for (const lane of ['test-ui', 'test-node', 'typecheck']) {
      const checkout = workflow.jobs[lane].steps.find(step =>
        step.uses?.startsWith('actions/checkout'),
      );
      expect(checkout?.with?.ref, `${lane} does not pin main`).toBe('main');
    }
  });
});
