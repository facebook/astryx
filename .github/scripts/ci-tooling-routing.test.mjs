// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ci-tooling-routing.test.mjs
 * @description Pins the first positive CI surface lane: admitted score-ledger
 *   tooling runs Node and lint owners while unrelated UI/browser/build work skips.
 * @input CI and lint workflow YAML.
 * @output Mutation-sensitive assertions for trusted classification, owned work,
 *   fail-closed fallbacks, and historical join jobs.
 * @position Workflow contract for spec:AST-030's first implementation slice.
 */

import fs from 'node:fs';
import path from 'node:path';

import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

const root = path.resolve(import.meta.dirname, '../..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const load = relative => yaml.parse(read(relative));
const ci = load('.github/workflows/ci.yml');
const lint = load('.github/workflows/lint.yml');
const TOOLING_FALSE = "needs.check-scope.outputs.tooling_only != 'true'";
const TOOLING_TRUE = "needs.check-scope.outputs.tooling_only == 'true'";

function step(job, name) {
  return job.steps.find(candidate => candidate.name === name);
}

describe('Node-tooling CI routing', () => {
  it('publishes the tooling output from the trusted-base classifier', () => {
    const source = read('.github/workflows/ci.yml');
    expect(ci.jobs['check-scope'].outputs.tooling_only).toContain(
      'steps.scope.outputs.tooling_only',
    );
    expect(source).toContain(
      'git show "origin/${{ github.base_ref }}:.github/scripts/change-scope.cjs"',
    );
    expect(source).toContain(
      'git show "origin/${{ github.base_ref }}:.github/scripts/knowledge-paths.cjs"',
    );
    expect(source).toContain(
      'git show "origin/${{ github.base_ref }}:scripts/component-packages.cjs"',
    );
  });

  it('grants no specialized lane without a merge base or trusted dependency', () => {
    for (const workflow of [
      '.github/workflows/ci.yml',
      '.github/workflows/lint.yml',
    ]) {
      const source = read(workflow);
      expect(source).toContain(
        'docsite_only=false\\nspec_only=false\\ntooling_only=false',
      );
      expect(source).not.toContain('NON_DOCSITE=');
    }
  });

  it('runs the Node project and required lint owners for tooling', () => {
    const nodeSuite = ci.jobs['test-node'].steps.find(candidate =>
      candidate.run?.includes('--project node'),
    );
    expect(nodeSuite.if).not.toContain('tooling_only');
    expect(
      ci.jobs['test-node'].steps.find(candidate =>
        candidate.uses?.includes('.github/actions/setup'),
      ).if,
    ).not.toContain('tooling_only');

    for (const name of ['Check repository guardrails', 'Run ESLint']) {
      expect(step(lint.jobs.lint, name).if).not.toContain('tooling_only');
    }
  });

  it('skips the UI project and component/browser owners for tooling', () => {
    const uiSuite = ci.jobs['test-ui'].steps.find(candidate =>
      candidate.run?.includes('--project ui'),
    );
    expect(uiSuite.if).toContain(TOOLING_FALSE);
    expect(ci.jobs['check-components'].if).toContain(TOOLING_FALSE);
    expect(ci.jobs['theme-layers'].if).toContain(TOOLING_FALSE);
    expect(ci.jobs['fixture-contrast'].if).toContain(TOOLING_FALSE);
  });

  it('keeps required build and docsite contexts green without their heavy work', () => {
    expect(
      step(ci.jobs['docsite-test'], 'Skip docsite work for Node tooling').if,
    ).toContain(TOOLING_TRUE);
    for (const name of [
      'Build core package',
      'Build canary component packages',
      'Generate and test docsite data',
    ]) {
      expect(step(ci.jobs['docsite-test'], name).if).toContain(TOOLING_FALSE);
    }

    expect(ci.jobs['build-sandbox'].if).toContain(TOOLING_FALSE);
    for (const candidate of ci.jobs['build-storybook'].steps) {
      if (
        candidate.name === 'Require successful scope classification' ||
        candidate.name === 'Skip heavy work for a specialized lane'
      ) {
        continue;
      }
      if (candidate.run || candidate.uses) {
        expect(candidate.if, candidate.name ?? candidate.run).toContain(
          TOOLING_FALSE,
        );
      }
    }
  });

  it('preserves the historical joins and fails them on owned-lane failure', () => {
    expect(ci.jobs.test.needs).toEqual(['test-ui', 'test-node']);
    expect(ci.jobs.build.needs).toEqual(['build-storybook', 'build-sandbox']);
    const testJoin = step(ci.jobs.test, 'Assert both test lanes succeeded').run;
    expect(testJoin).toContain('needs.test-node.result');
    expect(testJoin).toContain('needs.test-ui.result');
    const buildJoin = step(
      ci.jobs.build,
      'Assert parallel builds succeeded',
    ).run;
    expect(buildJoin).toContain('needs.build-storybook.result');
    expect(buildJoin).toContain('needs.build-sandbox.result');
  });
});
