// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The upgrade.run receipt keeps codemod outcomes apart from failures:
 * a core codemod that throws `ManualMigrationRequired` adds to
 * `manualActions` and leaves the run complete; `RegenerationRequired` adds to
 * `regenerate` and leaves it incomplete; any other throw is still an error and
 * wins `errorCode`. Core codemods come from a stubbed registry so the receipt
 * contract is tested apart from any one shipped codemod.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  ManualMigrationRequired,
  RegenerationRequired,
} from '../../../assets/codemods/outcome.mjs';

vi.mock('../../../assets/codemods/registry.mjs', async importOriginal => {
  const actual = /** @type {Record<string, unknown>} */ (
    await importOriginal()
  );
  return {
    ...actual,
    getTransformsBetween: async () => [
      {
        version: '0.2.0',
        transforms: [
          {
            name: 'report-raw',
            meta: {title: 'Report raw tokens', fileExtensions: ['.ts']},
            /** @param {{source: string}} file */
            transform(file) {
              if (file.source.includes('RAW')) {
                throw new ManualMigrationRequired('Read it through dataVars.', {
                  line: 2,
                });
              }
              if (file.source.includes('STALE')) {
                throw new RegenerationRequired('Out of date.', {
                  commands: ['gen theme'],
                });
              }
              return undefined;
            },
          },
          {
            name: 'rename-foo',
            meta: {title: 'Rename foo', fileExtensions: ['.ts']},
            /** @param {{source: string}} file */
            transform: file => file.source.replace(/foo/g, 'bar'),
          },
          {
            name: 'fail-on-boom',
            meta: {title: 'Fail on boom', fileExtensions: ['.ts']},
            /** @param {{source: string}} file */
            transform(file) {
              if (file.source.includes('boom')) throw new Error('codemod boom');
              return undefined;
            },
          },
        ],
      },
    ],
  };
});

const {upgrade} = await import('../upgrade.mjs');
const {logger} = await import('../../logger.mjs');

let dir;

/** @param {string} rel @param {string} body */
function write(rel, body) {
  fs.mkdirSync(path.dirname(path.join(dir, rel)), {recursive: true});
  fs.writeFileSync(path.join(dir, rel), body);
}

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'upg-outcomes-'));
  write(
    'package.json',
    JSON.stringify({name: 'x', dependencies: {'@astryxdesign/core': '0.2.0'}}),
  );
  write(
    'node_modules/@astryxdesign/core/package.json',
    JSON.stringify({name: '@astryxdesign/core', version: '0.2.0'}),
  );
  write('src/index.ts', 'const foo = 1;\n');
  write('src/chart.ts', "const a = 1;\nconst b = 'RAW';\n");
});

afterEach(() => {
  logger.setSilent(true);
  vi.restoreAllMocks();
  fs.rmSync(dir, {recursive: true, force: true});
});

const APPLY = {from: '0.1.0', apply: true, path: 'src'};

describe('manual migrations in the upgrade receipt', () => {
  it('are listed, never errors, and leave the run complete', async () => {
    const result = await upgrade(APPLY, {cwd: dir});

    expect(result.type).toBe('upgrade.run');
    expect(result.data).toMatchObject({
      complete: true,
      errors: [],
      regenerate: [],
      modifiedFiles: ['src/index.ts'],
      manualActions: [
        {
          file: 'src/chart.ts',
          line: 2,
          codemod: 'core:report-raw',
          message: 'Read it through dataVars.',
        },
      ],
    });
    expect(result.data).not.toHaveProperty('errorCode');
    expect(fs.readFileSync(path.join(dir, 'src/chart.ts'), 'utf8')).toContain(
      'RAW',
    );
  });

  it('are printed after the run, and the last line says how many remain', async () => {
    logger.setSilent(false);
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const out = vi.spyOn(console, 'log').mockImplementation(() => {});

    await upgrade(APPLY, {cwd: dir});

    const stderr = err.mock.calls.map(c => c.join(' ')).join('\n');
    const stdout = out.mock.calls.map(c => c.join(' ')).join('\n');
    expect(stderr).toContain(
      '1 place needs a manual migration that upgrade cannot make:',
    );
    expect(stderr).toContain(
      '  src/chart.ts:2 — Read it through dataVars. (core:report-raw)',
    );
    expect(stdout).toContain(
      'Upgrade complete; 1 manual migration listed above',
    );
    expect(stderr).not.toMatch(/ERR_CODEMOD_FAILED/);
  });
});

describe('regeneration in the upgrade receipt', () => {
  it('keeps the run incomplete with ERR_CODEMOD_PROTECTED and the command', async () => {
    write('src/theme.ts', '// STALE\n');

    const result = await upgrade(APPLY, {cwd: dir});

    expect(result.data).toMatchObject({
      complete: false,
      errorCode: 'ERR_CODEMOD_PROTECTED',
      errors: [],
      protectedFiles: [],
      regenerate: [
        {
          file: 'src/theme.ts',
          codemods: ['core:report-raw'],
          commands: ['gen theme'],
          messages: ['Out of date.'],
        },
      ],
      manualActions: [expect.objectContaining({file: 'src/chart.ts'})],
    });
  });
  it('lists a reported file the project protects in protectedFiles too, with its declaration', async () => {
    write('src/theme.ts', '// @generated\n// STALE\n');

    const result = await upgrade(APPLY, {cwd: dir});

    expect(result.data).toMatchObject({
      complete: false,
      errorCode: 'ERR_CODEMOD_PROTECTED',
      protectedFiles: [
        {
          file: 'src/theme.ts',
          codemods: ['core:report-raw'],
          reasons: ['generated'],
          declarations: [expect.stringContaining('@generated')],
          commands: ['gen theme'],
        },
      ],
      regenerate: [
        expect.objectContaining({
          file: 'src/theme.ts',
          commands: ['gen theme'],
        }),
      ],
    });
  });

  it('does not say the code is up to date when the only findings are outcomes', async () => {
    fs.rmSync(path.join(dir, 'src/index.ts'));
    write('src/theme.ts', '// STALE\n');
    logger.setSilent(false);
    const out = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await upgrade(APPLY, {cwd: dir});

    const stdout = out.mock.calls.map(c => c.join(' ')).join('\n');
    expect(result.data.filesChanged).toBe(0);
    expect(stdout).not.toMatch(/No changes needed/);
    expect(stdout).toMatch(/Upgrade incomplete/);
  });
});

describe('a failure beside outcomes', () => {
  /** @param {Promise<unknown>} promise */
  async function rejection(promise) {
    try {
      await promise;
    } catch (err) {
      return /** @type {any} */ (err);
    }
    throw new Error('expected upgrade() to reject');
  }

  it('still rejects with ERR_CODEMOD_FAILED, and its receipt keeps the manual actions', async () => {
    write('src/broken.ts', 'const boom = 1;\n');

    const err = await rejection(upgrade(APPLY, {cwd: dir}));

    expect(err.code).toBe('ERR_CODEMOD_FAILED');
    expect(err.receipt).toMatchObject({
      complete: false,
      errorCode: 'ERR_CODEMOD_FAILED',
      errors: [
        {
          file: 'src/broken.ts',
          codemod: 'core:fail-on-boom',
          error: 'codemod boom',
        },
      ],
      manualActions: [expect.objectContaining({file: 'src/chart.ts', line: 2})],
      regenerate: [],
      modifiedFiles: ['src/index.ts'],
    });
  });

  it('is the same in a dry run, which writes nothing', async () => {
    write('src/broken.ts', 'const boom = 1;\n');

    const err = await rejection(upgrade({...APPLY, apply: false}, {cwd: dir}));

    expect(err.code).toBe('ERR_CODEMOD_FAILED');
    expect(err.receipt.manualActions).toEqual([
      expect.objectContaining({file: 'src/chart.ts', line: 2}),
    ]);
    expect(fs.readFileSync(path.join(dir, 'src/index.ts'), 'utf8')).toBe(
      'const foo = 1;\n',
    );
  });

  it('with a file to regenerate, returns the incomplete receipt as for a protected file', async () => {
    write('src/theme.ts', '// STALE\n');
    write('src/broken.ts', 'const boom = 1;\n');

    const result = await upgrade(APPLY, {cwd: dir});

    expect(result.data).toMatchObject({
      complete: false,
      errorCode: 'ERR_CODEMOD_PROTECTED',
      errors: [expect.objectContaining({file: 'src/broken.ts'})],
      manualActions: [expect.objectContaining({file: 'src/chart.ts'})],
      regenerate: [expect.objectContaining({file: 'src/theme.ts'})],
      modifiedFiles: ['src/index.ts'],
    });
  });
});
