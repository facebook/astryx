// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file shadcn-registry-ci.test.mjs
 * @description Pins the required full-catalog ShadCN compatibility gate.
 * @input The PR CI workflow, docsite manifest, and catalog verifier source.
 * @output Mutation-sensitive assertions for generation, release gating, stock
 *   client installation, compilation, and the historical required join.
 * @position Workflow contract for spec:AST-026/DEC-7.
 */

import fs from 'node:fs';
import path from 'node:path';

import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

const root = path.resolve(import.meta.dirname, '../..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const ci = yaml.parse(read('.github/workflows/ci.yml'));
const job = ci.jobs['registry-contract'];
const SPEC_FALSE = "needs.check-scope.outputs.spec_only != 'true'";

function step(name) {
  return job.steps.find(candidate => candidate.name === name);
}

function runLines() {
  return job.steps
    .map(candidate => candidate.run)
    .filter(Boolean)
    .join('\n');
}

describe('ShadCN registry CI contract', () => {
  it('runs as a bounded fail-closed gate and feeds the required test context', () => {
    expect(job.needs).toEqual(['check-scope']);
    expect(job.if).toContain('always()');
    expect(job['runs-on']).toBe('4-core-ubuntu');
    expect(job['timeout-minutes']).toBe(20);
    expect(step('Require successful scope classification').run).toContain(
      'refusing to skip required work',
    );

    expect(ci.jobs.test.needs).toContain('registry-contract');
    const join = ci.jobs.test.steps
      .map(candidate => candidate.run ?? '')
      .join('\n');
    expect(join).toContain('needs.registry-contract.result');
    expect(join).toContain('needs.registry-contract.result }}" = "success"');
  });

  it('runs every material step except on the trusted spec-only lane', () => {
    for (const candidate of job.steps) {
      if (
        candidate.name === 'Require successful scope classification' ||
        candidate.name === 'Skip registry work for spec-only changes'
      ) {
        continue;
      }
      if (candidate.run || candidate.uses) {
        expect(candidate.if, candidate.name ?? candidate.uses).toContain(
          SPEC_FALSE,
        );
      }
    }
  });

  it('proves production exclusion before generating the canary catalog', () => {
    const production = step('Verify production excludes compatibility output');
    expect(production.run).toBe(
      'node internal/shadcn-registry/verify-production-gate.mjs',
    );
    expect(production.env).toBeUndefined();
    const generateData = read('apps/docsite/scripts/generate-data.mjs');
    expect(generateData).toContain('generateShadcnRegistryForTarget({');
    expect(generateData).not.toMatch(/\bgenerateShadcnRegistry\(\{/);

    const preview = step('Generate and validate the complete preview registry');
    expect(preview.env.DOCSITE_TARGET).toBe('canary');
    expect(preview.run).toContain('generate-data.mjs');
  });

  it('keeps the soak rollout out of public CLI discovery', () => {
    const docsDirectory = path.join(root, 'packages/cli/assets/docs');
    expect(fs.readdirSync(docsDirectory)).not.toContain(
      'shadcn-compatibility.doc.mjs',
    );
    expect(fs.readdirSync(docsDirectory)).toContain(
      'shadcn-compatibility.doc.draft.mjs',
    );
    expect(read('packages/cli/api/upgrade/upgrade.doc.mjs')).not.toMatch(
      /shadcn/i,
    );
  });

  it('builds every workspace package before exercising local package exports', () => {
    expect(step('Build registry package exports').run).toBe('pnpm build');
  });

  it('uses the complete clean-consumer verifier and an exact ShadCN pin', () => {
    expect(step('Install and build every registry item').run).toBe(
      'node internal/shadcn-registry/verify-full-catalog.mjs',
    );
    const manifest = JSON.parse(read('apps/docsite/package.json'));
    expect(manifest.devDependencies.shadcn).toMatch(/^\d+\.\d+\.\d+$/);

    const verifier = read('internal/shadcn-registry/verify-full-catalog.mjs');
    for (const invariant of [
      "'add', ...itemPaths",
      "'--silent'",
      'expectedInstalledFile(file, tsx)',
      'for (const tsx of [true, false])',
      'did not install declared dependency',
      'alias route',
      'duplicate item name',
      'must contain one source, one receipt, and a declaration only for precompiled JavaScript',
      'lacks its exact JavaScript install variant',
      'precompiled declaration type-check exited',
      'parseRegistryReceipt',
      'verifyPrecompiledTypeDeclarations(project, catalog.items)',
      'compileSources(project, sources)',
    ]) {
      expect(verifier).toContain(invariant);
    }
    expect(runLines()).toContain('verify-full-catalog.mjs');
  });
});
