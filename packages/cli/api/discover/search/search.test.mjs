// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for the discover.search leaf. Exact/single matches load
 * a real `.doc.mjs`, so these drive a small temp docs directory.
 */

import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {search} from './search.mjs';
import {AstryxError} from '../../error.mjs';

let docsDir;
let packages;

beforeAll(() => {
  docsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'discover-search-'));
  fs.writeFileSync(
    path.join(docsDir, 'Alpha.doc.mjs'),
    `export const docs = {name: 'Alpha', usage: {description: 'Alpha component'}, props: []};\n`,
  );
  fs.writeFileSync(
    path.join(docsDir, 'AlphaCard.doc.mjs'),
    `export const docs = {name: 'AlphaCard', usage: {description: 'Alpha card'}, props: []};\n`,
  );
  fs.writeFileSync(
    path.join(docsDir, 'Beta.doc.mjs'),
    `export const docs = {name: 'Beta', usage: {description: 'Beta component'}, props: []};\n`,
  );
  packages = [
    {
      name: '@acme/widgets',
      category: '@acme/widgets',
      version: '1.0.0',
      dir: docsDir,
      astryx: {},
      docsDir,
      components: ['Alpha', 'AlphaCard', 'Beta'],
    },
  ];
});

afterAll(() => {
  fs.rmSync(docsDir, {recursive: true, force: true});
});

describe('discover.search leaf', () => {
  it('an exact component name resolves to its docs', async () => {
    const res = await search(packages, 'Alpha', {});
    expect(res.type).toBe('discover.detail.doc');
    expect(res.data.name).toBe('Alpha');
  });

  it('a single substring match resolves to its docs', async () => {
    const res = await search(packages, 'card', {});
    expect(res.type).toBe('discover.detail.doc');
    expect(res.data.name).toBe('AlphaCard');
  });

  it('multiple substring matches return a search response', async () => {
    const res = await search(packages, 'alph', {});
    expect(res).toEqual({
      type: 'discover.search',
      data: {
        query: 'alph',
        matches: [
          {package: '@acme/widgets', component: 'Alpha'},
          {package: '@acme/widgets', component: 'AlphaCard'},
        ],
      },
    });
  });

  it('throws ERR_NOT_FOUND with fuzzy suggestions for a close miss', async () => {
    let err;
    try {
      await search(packages, 'Alfa', {});
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(AstryxError);
    expect(err.code).toBe('ERR_NOT_FOUND');
    expect(err.message).toBe('"Alfa" not found');
    expect(err.suggestions?.[0]).toEqual({
      name: '@acme/widgets/Alpha',
      reason: 'similar name',
    });
  });

  it('throws ERR_NOT_FOUND without suggestions for a far miss', async () => {
    let err;
    try {
      await search(packages, 'zzzzzzz', {});
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(AstryxError);
    expect(err.code).toBe('ERR_NOT_FOUND');
    expect(err.message).toBe('"zzzzzzz" not found in any package');
    expect(err.suggestions).toBeUndefined();
  });
});

describe('discover.search leaf — empty query (parity with api/search)', () => {
  it('throws ERR_INVALID_ARGUMENT for an empty query (does not match everything)', async () => {
    await expect(search(packages, '', {})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
    });
  });

  it('throws ERR_INVALID_ARGUMENT for a whitespace-only query', async () => {
    await expect(search(packages, '   ', {})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
    });
  });
});
