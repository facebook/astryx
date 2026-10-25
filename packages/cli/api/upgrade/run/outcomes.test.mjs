// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The upgrade.run receipt keeps codemod outcomes apart from failures:
 * a core codemod that throws `ManualMigrationRequired` adds a row to
 * `declinedCandidates` and leaves the run complete; `RegenerationRequired` adds to
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
            name: 'report-legacy',
            meta: {title: 'Report legacy calls', fileExtensions: ['.ts']},
            /** @param {{source: string}} file */
            transform(file) {
              if (file.source.includes('LEGACY')) {
                throw new ManualMigrationRequired('Call the new API.', {
                  line: 3,
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

/** @param {Promise<unknown>} promise */
async function rejection(promise) {
  try {
    await promise;
  } catch (err) {
    return /** @type {any} */ (err);
  }
  throw new Error('expected upgrade() to reject');
}

describe('manual migrations in the upgrade receipt', () => {
  it('are listed, never errors, and leave the run complete', async () => {
    const result = await upgrade(APPLY, {cwd: dir});

    expect(result.type).toBe('upgrade.run');
    expect(result.data).toMatchObject({
      complete: true,
      errors: [],
      regenerate: [],
      modifiedFiles: ['src/index.ts'],
      declinedCandidates: [
        {
          file: 'src/chart.ts',
          location: '2',
          reason:
            'manual migration needed (core:report-raw): Read it through dataVars.',
        },
      ],
    });
    expect(result.data).not.toHaveProperty('errorCode');
    expect(result.data).not.toHaveProperty('manualActions');
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
      '1 file needs a manual migration that upgrade cannot make; review manually:',
    );
    expect(stderr).toContain(
      '  src/chart.ts:2 - manual migration needed (core:report-raw): Read it through dataVars.',
    );
    // Listed with the manual migrations, not as a protected file that does
    // not parse.
    expect(stderr).not.toMatch(/skipped because/);
    expect(stdout).toContain(
      'Upgrade complete; 1 manual migration listed above',
    );
    expect(stderr).not.toMatch(/ERR_CODEMOD_FAILED/);
  });
});

describe('manual migrations beside other declined candidates', () => {
  it('leave out a file the run reports as protected, as every declined candidate does', async () => {
    write('src/chart.ts', "// @generated\nconst a = 1;\nconst b = 'RAW';\n");
    write('src/gen.ts', '// @generated\nconst foo = 2;\n');

    const result = await upgrade(APPLY, {cwd: dir});

    // chart.ts is protected but needs no change, so it stays declined;
    // gen.ts is protected and still needs a change, so it is listed once,
    // under protectedFiles.
    expect(result.data.protectedFiles).toEqual([
      expect.objectContaining({file: 'src/gen.ts'}),
    ]);
    expect(result.data.declinedCandidates).toEqual([
      expect.objectContaining({file: 'src/chart.ts', location: '2'}),
    ]);
  });
});

describe('a protected file with both a manual migration and a regeneration', () => {
  const BOTH = '// @generated\n// STALE\nLEGACY();\n';

  it('is listed once, under protectedFiles, never also declined', async () => {
    write('src/theme.ts', BOTH);
    logger.setSilent(false);
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await upgrade(APPLY, {cwd: dir});

    expect(result.data.errorCode).toBe('ERR_CODEMOD_PROTECTED');
    expect(result.data.protectedFiles).toEqual([
      expect.objectContaining({file: 'src/theme.ts'}),
    ]);
    expect(result.data.regenerate).toEqual([
      expect.objectContaining({file: 'src/theme.ts'}),
    ]);
    expect(result.data.declinedCandidates).toEqual([
      expect.objectContaining({file: 'src/chart.ts'}),
    ]);
    const stderr = err.mock.calls.map(c => c.join(' ')).join('\n');
    expect(stderr).toContain('1 file needs a manual migration');
    expect(stderr).not.toMatch(/src\/theme\.ts:3 - manual migration needed/);
  });

  it('is listed once after a post-codemod hook re-checks it', async () => {
    write('src/theme.ts', BOTH);
    write(
      'astryx.config.mjs',
      `export default {hooks: {postCodemod: [{name: 'mark', buildCommand: () => ({command: process.execPath, args: ['-e', "require('node:fs').writeFileSync('hook-ran', '')"]})}]}};
`,
    );

    const result = await upgrade(APPLY, {cwd: dir});

    // The hook ran, so this receipt comes from the re-check.
    expect(fs.existsSync(path.join(dir, 'hook-ran'))).toBe(true);
    expect(result.data.errorCode).toBe('ERR_CODEMOD_PROTECTED');
    expect(result.data.protectedFiles).toEqual([
      expect.objectContaining({file: 'src/theme.ts'}),
    ]);
    expect(result.data.declinedCandidates).toEqual([
      expect.objectContaining({file: 'src/chart.ts'}),
    ]);
  });
});

describe('regeneration in the upgrade receipt', () => {
  it('reports a file nothing protects as a codemod error, never ERR_CODEMOD_PROTECTED', async () => {
    write('src/theme.ts', '// STALE\n');

    const err = await rejection(upgrade(APPLY, {cwd: dir}));

    // No protected file blocks this change, so ERR_CODEMOD_PROTECTED would
    // misstate it; it keeps the code a failed required change has.
    expect(err.code).toBe('ERR_CODEMOD_FAILED');
    expect(err.receipt).toMatchObject({
      complete: false,
      errorCode: 'ERR_CODEMOD_FAILED',
      protectedFiles: [],
      errors: [
        {
          file: 'src/theme.ts',
          codemod: 'core:report-raw',
          error: 'Out of date.',
        },
      ],
      regenerate: [
        {
          file: 'src/theme.ts',
          codemods: ['core:report-raw'],
          commands: ['gen theme'],
          messages: ['Out of date.'],
        },
      ],
      declinedCandidates: [expect.objectContaining({file: 'src/chart.ts'})],
    });
  });

  it('keeps a file to regenerate in the receipt when astryx.config also fails validation', async () => {
    fs.rmSync(path.join(dir, 'src/index.ts'));
    write('src/theme.ts', '// STALE\n');
    write('astryx.config.mjs', "export default {theme: 'neutral'};\n");

    const err = await rejection(upgrade(APPLY, {cwd: dir}));

    expect(err.code).toBe('ERR_INVALID_ARGUMENT');
    expect(err.receipt).toMatchObject({
      complete: false,
      modifiedFiles: [],
      regenerate: [
        expect.objectContaining({
          file: 'src/theme.ts',
          commands: ['gen theme'],
        }),
      ],
      errors: expect.arrayContaining([
        expect.objectContaining({file: 'src/theme.ts'}),
        expect.objectContaining({codemod: 'config'}),
      ]),
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
    write('src/theme.ts', '// @generated\n// STALE\n');
    logger.setSilent(false);
    const out = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await upgrade(APPLY, {cwd: dir});

    const stdout = out.mock.calls.map(c => c.join(' ')).join('\n');
    expect(result.data.filesChanged).toBe(0);
    expect(stdout).not.toMatch(/No changes needed/);
    expect(stdout).toMatch(/Upgrade incomplete/);
  });

  it('does not say Done when another codemod changed a file and a regeneration is pending', async () => {
    write('src/theme.ts', '// @generated\n// STALE\n');
    logger.setSilent(false);
    const out = vi.spyOn(console, 'log').mockImplementation(() => {});
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await upgrade(APPLY, {cwd: dir});

    const text = [...out.mock.calls, ...err.mock.calls]
      .map(c => c.join(' '))
      .join('\n');
    expect(result.data.modifiedFiles).toEqual(['src/index.ts']);
    expect(text).not.toMatch(/Done!/);
    expect(text).toMatch(
      /Applied 1 owned change across 1 file; generated files to regenerate remain/,
    );
    expect(text).toMatch(/Upgrade incomplete/);
  });
});

describe('a failure beside outcomes', () => {
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
      declinedCandidates: [
        expect.objectContaining({file: 'src/chart.ts', location: '2'}),
      ],
      regenerate: [],
      modifiedFiles: ['src/index.ts'],
    });
  });

  it('is the same in a dry run, which writes nothing', async () => {
    write('src/broken.ts', 'const boom = 1;\n');

    const err = await rejection(upgrade({...APPLY, apply: false}, {cwd: dir}));

    expect(err.code).toBe('ERR_CODEMOD_FAILED');
    expect(err.receipt.declinedCandidates).toEqual([
      expect.objectContaining({file: 'src/chart.ts', location: '2'}),
    ]);
    expect(fs.readFileSync(path.join(dir, 'src/index.ts'), 'utf8')).toBe(
      'const foo = 1;\n',
    );
  });

  it('with a protected file to regenerate, returns the incomplete receipt as for a protected file', async () => {
    write('src/theme.ts', '// @generated\n// STALE\n');
    write('src/broken.ts', 'const boom = 1;\n');

    const result = await upgrade(APPLY, {cwd: dir});

    expect(result.data).toMatchObject({
      complete: false,
      errorCode: 'ERR_CODEMOD_PROTECTED',
      errors: [expect.objectContaining({file: 'src/broken.ts'})],
      declinedCandidates: [expect.objectContaining({file: 'src/chart.ts'})],
      regenerate: [expect.objectContaining({file: 'src/theme.ts'})],
      modifiedFiles: ['src/index.ts'],
    });
  });
});
