// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Colocated tests for the `search` leaf (api/search/search.mjs), run
 * against the real @astryxdesign/core registry. `search` had no api-level tests;
 * this locks the envelope, ranking invariants, the `--type`/limit handling, and
 * the error paths.
 *
 * The API validates its own inputs (not just the CLI): a non-positive/non-integer
 * `limit`, an empty query, and a bad `--type` all throw AstryxError with the
 * ERR_INVALID_ARGUMENT code, so a direct `@astryxdesign/cli/api` caller gets the
 * same contract as `astryx search` on the command line.
 */

import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {search, SEARCH_DOMAINS} from './search.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const cwd = REPO;
const SLOW = 30_000;

describe('search leaf — envelope + ranking', () => {
  it('returns a `search` envelope with query + results', async () => {
    const r = await search('button', {cwd});
    expect(r.type).toBe('search');
    expect(r.data.query).toBe('button');
    expect(Array.isArray(r.data.results)).toBe(true);
    expect(r.data.results.length).toBeGreaterThan(0);
  }, SLOW);

  it('returns an empty result set (not an error) for a no-match query', async () => {
    const r = await search('zzznomatch99', {cwd});
    expect(r.type).toBe('search');
    expect(r.data.results).toEqual([]);
  }, SLOW);

  it('defaults to at most 20 results', async () => {
    const r = await search('button', {cwd});
    expect(r.data.results.length).toBeLessThanOrEqual(20);
  }, SLOW);

  it('caps results to a positive limit', async () => {
    const r = await search('button', {cwd, limit: 2});
    expect(r.data.results.length).toBeLessThanOrEqual(2);
  }, SLOW);
});

describe('search leaf — --type filter', () => {
  it('restricts results to the requested domain', async () => {
    const r = await search('button', {cwd, type: 'component'});
    expect(r.data.results.every(x => x.domain === 'component')).toBe(true);
  }, SLOW);

  it('exposes the valid domain list', () => {
    expect(SEARCH_DOMAINS).toEqual(expect.arrayContaining(['component', 'hook', 'doc', 'template']));
  });
});

describe('search leaf — error paths (pinned)', () => {
  it('throws ERR_INVALID_ARGUMENT when the query is empty/whitespace', async () => {
    await expect(search('   ', {cwd})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
      message: expect.stringMatching(/query is required/i),
    });
  }, SLOW);

  it('throws ERR_INVALID_ARGUMENT for an unknown --type', async () => {
    await expect(
      search('button', {cwd, type: /** @type {any} */ ('bogus')}),
    ).rejects.toMatchObject({code: 'ERR_INVALID_ARGUMENT'});
  }, SLOW);
});

describe('search leaf — limit validation (API matches the CLI contract)', () => {
  it('throws ERR_INVALID_ARGUMENT for a limit of 0 (no longer returns everything)', async () => {
    await expect(search('button', {cwd, limit: 0})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
    });
  }, SLOW);

  it('throws ERR_INVALID_ARGUMENT for a negative limit', async () => {
    await expect(search('button', {cwd, limit: -5})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
    });
  }, SLOW);

  it('throws ERR_INVALID_ARGUMENT for a non-integer limit', async () => {
    await expect(search('button', {cwd, limit: 2.5})).rejects.toMatchObject({
      code: 'ERR_INVALID_ARGUMENT',
    });
  }, SLOW);
});

describe('search leaf — coverage is reported, not just implied', () => {
  it('carries matchedTerms/queryTerms on every result', async () => {
    const r = await search('data table with filters', {cwd});
    expect(r.data.results.length).toBeGreaterThan(0);
    for (const hit of r.data.results) {
      expect(typeof hit.matchedTerms).toBe('number');
      expect(typeof hit.queryTerms).toBe('number');
      expect(hit.queryTerms).toBeGreaterThanOrEqual(1);
      expect(hit.matchedTerms).toBeGreaterThanOrEqual(1);
      expect(hit.matchedTerms).toBeLessThanOrEqual(hit.queryTerms);
    }
  }, SLOW);

  it('reports full coverage for a whole-phrase match', async () => {
    const r = await search('button', {cwd, type: 'component'});
    const exact = r.data.results.find(x => x.name === 'Button');
    expect(exact).toBeDefined();
    expect(exact?.matchedTerms).toBe(exact?.queryTerms);
  }, SLOW);

  it('names the owning package on component results', async () => {
    const r = await search('button', {cwd, type: 'component'});
    const exact = r.data.results.find(x => x.name === 'Button');
    expect(exact?.package).toBe('@astryxdesign/core');
  }, SLOW);
});

describe('search leaf — usage guidance is indexed, below the description tier', () => {
  it('ranks a component on wording that appears only in its best-practice advice', async () => {
    // `Banner` calls itself "a persistent message"; only its guidance names the
    // situations a reader actually asks about. Before guidance was indexed,
    // this query could not reach it.
    const r = await search('maintenance notices', {cwd, type: 'component'});
    expect(r.data.results.some(x => x.name === 'Banner')).toBe(true);
  }, SLOW);

  it('keeps a description hit above a component that only mentions the word in advice', async () => {
    // The two tiers, on real Core data. `CheckboxInput` names notifications in
    // its own description; `Card` only mentions them in best-practice advice.
    // Scored on one tier both sat at 50 and the tie broke alphabetically, so
    // the passing mention won. Now 50 beats 45 on the evidence, not the name.
    const r = await search('notification', {cwd, type: 'component'});
    const rank = (/** @type {string} */ name) => r.data.results.findIndex(x => x.name === name);
    const described = rank('CheckboxInput');
    const advised = rank('Card');
    expect(described).toBeGreaterThanOrEqual(0);
    expect(advised).toBeGreaterThanOrEqual(0);
    expect(described).toBeLessThan(advised);
  }, SLOW);
});

describe('search leaf — integration components are searchable', () => {
  // `search` used to gather components straight off findCoreDir(cwd), so a
  // package listed in astryx.config.mjs was reachable by `component` and
  // `template` and invisible to the one command whose job is finding things.
  // The fixture is a minimal integration: a manifest, a doc, and the same-stem
  // source file Project requires before it will trust the pair.
  const fixture = path.join(os.tmpdir(), `astryx-search-integration-${process.pid}`);
  const pkg = path.join(fixture, 'node_modules/@acme/widgets');

  beforeAll(() => {
    fs.mkdirSync(path.join(pkg, 'src'), {recursive: true});
    fs.writeFileSync(
      path.join(pkg, 'package.json'),
      JSON.stringify({name: '@acme/widgets', version: '1.0.0', type: 'module'}),
    );
    fs.writeFileSync(
      path.join(pkg, 'astryx.integration.mjs'),
      "export default {components: './src'};\n",
    );
    fs.writeFileSync(
      path.join(pkg, 'src/AcmeDiffLink.doc.mjs'),
      `export const docs = {
  name: 'AcmeDiffLink',
  displayName: 'Acme Diff Link',
  import: '@acme/widgets/DiffLink',
  keywords: ['diff', 'revision'],
  usage: {
    description: 'Renders a link to a code review revision.',
    bestPractices: [
      {guidance: true, description: 'Use inside a table of pending code reviews.'},
    ],
  },
};
`,
    );
    fs.writeFileSync(path.join(pkg, 'src/AcmeDiffLink.tsx'), 'export const AcmeDiffLink = () => null;\n');
    fs.writeFileSync(
      path.join(fixture, 'package.json'),
      JSON.stringify({name: 'fixture', private: true, version: '1.0.0', type: 'module'}),
    );
    fs.writeFileSync(path.join(fixture, 'astryx.config.mjs'), "export default {integrations: ['@acme/widgets']};\n");
    // Core has to resolve from the fixture for search to run at all.
    fs.mkdirSync(path.join(fixture, 'node_modules/@astryxdesign'), {recursive: true});
    fs.symlinkSync(
      path.join(REPO, 'packages/core'),
      path.join(fixture, 'node_modules/@astryxdesign/core'),
      'dir',
    );
  });

  afterAll(() => {
    fs.rmSync(fixture, {recursive: true, force: true});
  });

  it('finds a component an integration owns, with its package and import path', async () => {
    const r = await search('diff revision', {cwd: fixture, type: 'component'});
    const hit = r.data.results.find(x => x.name === 'AcmeDiffLink');
    expect(hit).toBeDefined();
    expect(hit?.package).toBe('@acme/widgets');
    expect(hit?.import).toBe('@acme/widgets/DiffLink');
  }, SLOW);

  it('still returns Core components alongside them', async () => {
    const r = await search('diff revision', {cwd: fixture, type: 'component'});
    expect(r.data.results.some(x => x.package === '@astryxdesign/core')).toBe(true);
  }, SLOW);
});
