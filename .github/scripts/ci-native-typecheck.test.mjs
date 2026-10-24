// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Routing contract for the TypeScript checks of @astryxdesign/native.
 *
 * The native package is outside the root `pnpm build`, and Vitest neither
 * typechecks its source nor loads the declaration file of every platform
 * condition. The `typecheck` job is the only gate over both, so it must run
 * the package's typecheck, its build, and the check of the emitted platform
 * types, in that order.
 */

import fs from 'node:fs';
import path from 'node:path';

import {describe, expect, it} from 'vitest';
import yaml from 'yaml';

const root = path.resolve(import.meta.dirname, '../..');
const ci = yaml.parse(
  fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8'),
);
const native = JSON.parse(
  fs.readFileSync(path.join(root, 'packages/native/package.json'), 'utf8'),
);
const tsconfigTypes = JSON.parse(
  fs.readFileSync(
    path.join(root, 'packages/native/tsconfig.types.json'),
    'utf8',
  ),
);

const NATIVE_COMMANDS = [
  'pnpm -F @astryxdesign/native typecheck',
  'pnpm -F @astryxdesign/native build',
  'pnpm -F @astryxdesign/native typecheck:types',
];

describe('native TypeScript checks', () => {
  it('run in the typecheck job, after the root build, in order', () => {
    const runs = ci.jobs.typecheck.steps.map(step => step.run?.trim() ?? '');
    const indexes = NATIVE_COMMANDS.map(command => runs.indexOf(command));
    for (const [i, index] of indexes.entries()) {
      expect(index, NATIVE_COMMANDS[i]).toBeGreaterThan(
        runs.indexOf('pnpm build'),
      );
    }
    expect([...indexes].sort((a, b) => a - b)).toEqual(indexes);
  });

  it('check every emitted platform declaration file', () => {
    expect(native.scripts['typecheck:types']).toBe(
      'tsc --project tsconfig.types.json',
    );
    expect(native.scripts.build).toContain('generate.mjs --types');
    expect(tsconfigTypes.include).toEqual(['dist/types/*.d.ts']);
    // The root config skips declaration files, which are all this checks.
    expect(tsconfigTypes.compilerOptions.skipLibCheck).toBe(false);
  });
});
