// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file A failed upgrade keeps its error contract and adds the receipt: the
 * thrown AstryxError still carries ERR_CODEMOD_FAILED, and its `receipt`
 * names the files the run already changed, from the folder the command ran
 * in. Core codemods come from a stubbed registry so the contract is tested
 * apart from any one shipped codemod.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

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
const {AstryxError} = await import('../../error.mjs');
const {toErrorEnvelope} = await import('../../../foundation/response/json.mjs');
const {isError} = await import('../../json/parse.mjs');

let dir;

/** @param {string} rel @param {string} body */
function write(rel, body) {
  fs.mkdirSync(path.dirname(path.join(dir, rel)), {recursive: true});
  fs.writeFileSync(path.join(dir, rel), body);
}

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'upg-failure-receipt-'));
  write(
    'package.json',
    JSON.stringify({name: 'x', dependencies: {'@astryxdesign/core': '0.2.0'}}),
  );
  write(
    'node_modules/@astryxdesign/core/package.json',
    JSON.stringify({name: '@astryxdesign/core', version: '0.2.0'}),
  );
  write('src/index.ts', 'const foo = 1;\n');
  write('src/broken.ts', 'const boom = 1;\n');
});

afterEach(() => fs.rmSync(dir, {recursive: true, force: true}));

/** @param {Promise<unknown>} promise */
async function rejection(promise) {
  try {
    await promise;
  } catch (err) {
    return /** @type {any} */ (err);
  }
  throw new Error('expected upgrade() to reject');
}

describe('a failed upgrade', () => {
  it('still rejects with ERR_CODEMOD_FAILED, and the error carries the receipt', async () => {
    const err = await rejection(
      upgrade({from: '0.1.0', apply: true, path: 'src'}, {cwd: dir}),
    );

    expect(err).toBeInstanceOf(AstryxError);
    expect(err.code).toBe('ERR_CODEMOD_FAILED');
    expect(err.message).toBe('Upgrade completed with 1 codemod error.');
    expect(err.receipt).toMatchObject({
      complete: false,
      errorCode: 'ERR_CODEMOD_FAILED',
      filesChanged: 1,
      modifiedFiles: ['src/index.ts'],
      errors: [
        {
          file: 'src/broken.ts',
          codemod: 'core:fail-on-boom',
          error: 'codemod boom',
        },
      ],
    });
    expect(fs.readFileSync(path.join(dir, 'src/index.ts'), 'utf8')).toBe(
      'const bar = 1;\n',
    );
  });

  it('names receipt files from the folder the command ran in', async () => {
    const err = await rejection(
      upgrade(
        {from: '0.1.0', apply: true, path: '.'},
        {cwd: path.join(dir, 'src')},
      ),
    );

    expect(err.code).toBe('ERR_CODEMOD_FAILED');
    expect(err.receipt.modifiedFiles).toEqual(['index.ts']);
    expect(err.receipt.errors).toEqual([
      expect.objectContaining({file: 'broken.ts'}),
    ]);
  });

  it('becomes an error envelope that keeps its code and adds the receipt', async () => {
    const err = await rejection(
      upgrade({from: '0.1.0', path: 'src'}, {cwd: dir}),
    );

    const envelope = toErrorEnvelope(err);
    expect(isError(envelope)).toBe(true);
    expect(envelope).toMatchObject({
      apiVersion: 1,
      code: 'ERR_CODEMOD_FAILED',
      error: 'Upgrade completed with 1 codemod error.',
      receipt: {modifiedFiles: ['src/index.ts'], complete: false},
    });
    expect(fs.readFileSync(path.join(dir, 'src/index.ts'), 'utf8')).toBe(
      'const foo = 1;\n',
    );
  });
});

describe('the error envelope', () => {
  it('has no receipt for an error that carries none', () => {
    expect(
      toErrorEnvelope(
        new AstryxError('nope', undefined, 'ERR_INVALID_ARGUMENT'),
      ),
    ).toEqual({apiVersion: 1, error: 'nope', code: 'ERR_INVALID_ARGUMENT'});
  });
});
