// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the unified `search` command + its programmatic API.
 *
 * Two layers:
 *   1. API-level (direct import of api/search.mjs) — ranking, cross-domain
 *      results, --type/--limit, typo tolerance, empty results, envelope shape.
 *   2. CLI-level (spawned subprocess) — exit codes and the --json contract,
 *      which only fire through a real Commander .parse() against argv.
 */

import {describe, it, expect} from 'vitest';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {search, scoreCandidate, SEARCH_DOMAINS} from '../../../api/search/search.mjs';
import {runCli} from '../../../test-utils/run-cli.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Run against the monorepo root so @astryxdesign/core is discoverable.
const REPO_ROOT = path.resolve(__dirname, '../../../../..');
const OPTS = {cwd: REPO_ROOT};

// The API-level search walks the source tree and imports every `.doc.mjs` to
// build its index; that takes several seconds and gets slower under the
// full-suite parallel load — enough to cross the default 5s per-test limit.
// The CLI-level cases spawn a subprocess (its own 30s cap) but still run under
// the vitest per-test timeout. Give both the same generous scan budget.
const SCAN_TIMEOUT = 30_000;

describe('search() API — ranking', () => {
  it('ranks an exact component name match first', async () => {
    const {data} = await search('button', OPTS);
    expect(data.results.length).toBeGreaterThan(0);
    const top = data.results[0];
    expect(top.domain).toBe('component');
    expect(top.name).toBe('Button');
    expect(top.score).toBe(100);
    expect(top.command).toBe('astryx component Button');
  });

  it('returns components/hooks tagged with a matching keyword', async () => {
    const {data} = await search('button', OPTS);
    // IconButton carries the "button" keyword; should be present and scored
    // on a keyword (not name) signal.
    const iconButton = data.results.find(r => r.name === 'IconButton');
    expect(iconButton).toBeTruthy();
    expect(iconButton.domain).toBe('component');
    expect(iconButton.score).toBeGreaterThanOrEqual(70);
    expect(iconButton.reason.toLowerCase()).toContain('keyword');
  });
}, SCAN_TIMEOUT);

describe('search() API — cross-domain', () => {
  it('returns results from more than one domain for a broad query', async () => {
    const {data} = await search('color', OPTS);
    const domains = new Set(data.results.map(r => r.domain));
    // "color" is a doc topic AND appears across components.
    expect(domains.has('doc')).toBe(true);
    expect(domains.size).toBeGreaterThan(1);
    // The doc topic should carry a follow-up `astryx docs` command.
    const docHit = data.results.find(r => r.domain === 'doc');
    expect(docHit.command.startsWith('astryx docs ')).toBe(true);
  });

  it('every result is tagged with a known domain and a command', async () => {
    const {data} = await search('button', OPTS);
    for (const r of data.results) {
      expect(SEARCH_DOMAINS).toContain(r.domain);
      expect(typeof r.command).toBe('string');
      expect(r.command.length).toBeGreaterThan(0);
    }
  });
}, SCAN_TIMEOUT);

describe('search() API — filters', () => {
  it('--type component returns only components', async () => {
    const {data} = await search('modal', {...OPTS, type: 'component'});
    expect(data.results.length).toBeGreaterThan(0);
    for (const r of data.results) {
      expect(r.domain).toBe('component');
    }
  });

  it('--type doc returns only docs', async () => {
    const {data} = await search('color', {...OPTS, type: 'doc'});
    for (const r of data.results) {
      expect(r.domain).toBe('doc');
    }
  });

  it('respects --limit', async () => {
    const {data} = await search('button', {...OPTS, limit: 3});
    expect(data.results.length).toBeLessThanOrEqual(3);
  });

  it('rejects an unknown --type', async () => {
    await expect(search('x', {...OPTS, type: 'bogus'})).rejects.toThrow(/Unknown --type/);
  });
}, SCAN_TIMEOUT);

describe('search() API — fuzzy / typo tolerance', () => {
  it('finds Button for the typo "buton"', async () => {
    const {data} = await search('buton', OPTS);
    const button = data.results.find(r => r.name === 'Button');
    expect(button).toBeTruthy();
    expect(button.domain).toBe('component');
  });
}, SCAN_TIMEOUT);

describe('search() API — empty + envelope', () => {
  it('returns an empty result set (not an error) for a no-match query', async () => {
    const {type, data} = await search('zzqqxx_definitely_no_match', OPTS);
    expect(type).toBe('search');
    expect(data.results).toEqual([]);
    expect(data.query).toBe('zzqqxx_definitely_no_match');
  });

  it('throws when the query is empty', async () => {
    await expect(search('', OPTS)).rejects.toThrow(/query is required/);
  });

  it('returns the correct envelope shape', async () => {
    const result = await search('button', OPTS);
    expect(result.type).toBe('search');
    expect(result.data).toHaveProperty('query');
    expect(Array.isArray(result.data.results)).toBe(true);
    const top = result.data.results[0];
    expect(top).toHaveProperty('domain');
    expect(top).toHaveProperty('name');
    expect(top).toHaveProperty('score');
    expect(top).toHaveProperty('description');
    expect(top).toHaveProperty('command');
  });
}, SCAN_TIMEOUT);

describe('scoreCandidate()', () => {
  it('scores an exact name match at 100', () => {
    expect(scoreCandidate('button', {name: 'button'}).score).toBe(100);
  });

  it('scores an exact keyword above a description mention', () => {
    const kw = scoreCandidate('toggle', {name: 'Switch', keywords: ['toggle']});
    const desc = scoreCandidate('toggle', {name: 'Switch', description: 'A toggle control'});
    expect(kw.score).toBeGreaterThan(desc.score);
  });

  it('returns null when nothing matches', () => {
    expect(scoreCandidate('zzzz', {name: 'Button', keywords: ['cta']})).toBeNull();
  });
});

describe('search CLI — exit codes + JSON contract', () => {
  it('exits 0 for a successful search', async () => {
    const r = await runCli(['search', 'button'], REPO_ROOT);
    expect(r.status).toBe(0);
  });

  it('exits 0 for a no-match query (valid empty result, not failure)', async () => {
    const r = await runCli(['search', 'zzqqxx_no_match'], REPO_ROOT);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('No results');
  });

  it('exits 1 for an invalid --type', async () => {
    const r = await runCli(['search', 'x', '--type', 'bogus'], REPO_ROOT);
    expect(r.status).toBe(1);
  });

  it('exits 1 for an invalid --limit', async () => {
    const r = await runCli(['search', 'x', '--limit', '0'], REPO_ROOT);
    expect(r.status).toBe(1);
  });

  it('emits a valid --json envelope', async () => {
    const r = await runCli(['--json', 'search', 'button'], REPO_ROOT);
    expect(r.status).toBe(0);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.apiVersion).toBe(1);
    expect(parsed.type).toBe('search');
    expect(parsed.data.query).toBe('button');
    expect(Array.isArray(parsed.data.results)).toBe(true);
    expect(parsed.data.results[0].name).toBe('Button');
  });

  it('emits a valid --json envelope with empty results for no match', async () => {
    const r = await runCli(['--json', 'search', 'zzqqxx_no_match'], REPO_ROOT);
    expect(r.status).toBe(0);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.type).toBe('search');
    expect(parsed.data.results).toEqual([]);
  });

  it('renders each result as a greppable key: value record', async () => {
    const r = await runCli(['search', 'button'], REPO_ROOT);
    expect(r.stdout).toContain('astryx component Button');
    // Fields mirror the JSON object and are line-greppable.
    expect(r.stdout).toMatch(/^name:\s+Button$/m);
    expect(r.stdout).toMatch(/^domain:\s+component$/m);
    expect(r.stdout).toContain('description:');
  });

  it('--verbose exits 0 and prints import/match detail', async () => {
    // Regression: the boolean verbose flag was named --detail, which collided
    // with the value-taking global `--detail <level>` — a bare `search
    // --detail` errored "argument missing" and the verbose output was
    // unreachable. It is now `--verbose`.
    const r = await runCli(['search', 'button', '--verbose'], REPO_ROOT);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('import:');
    // Ranking detail: pre-formatter this was a single `match: <reason> (score N)`
    // line; it's now separate `score:` / `reason:` record fields mirroring --json.
    expect(r.stdout).toContain('score:');
    expect(r.stdout).toContain('reason:');
  });
}, SCAN_TIMEOUT);
