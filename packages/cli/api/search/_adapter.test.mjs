// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for search's adapter: a long-running caller reuses the gathered
 * candidates while their inputs are unchanged (gatherCandidatesReused), and
 * gathers again when an input changes, for another folder or `type`, or once
 * the reuse window passes.
 */

import {describe, it, expect, vi} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {gatherCandidates, gatherCandidatesReused} from './_adapter.mjs';

const SLOW = 60_000;

/** A folder with only a package.json: a docs search there reads the CLI's docs. */
function scratchProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-gather-reuse-'));
  fs.writeFileSync(path.join(dir, 'package.json'), '{"name":"app"}');
  return dir;
}

describe('gatherCandidatesReused', () => {
  it(
    'reuses the gathered candidates while the inputs are unchanged',
    async () => {
      const cwd = scratchProject();
      const first = await gatherCandidatesReused({cwd, type: 'doc'});
      const second = await gatherCandidatesReused({cwd, type: 'doc'});
      expect(second).toBe(first);
      expect(first.all.length).toBeGreaterThan(0);
      // The same candidates a fresh gather finds.
      expect(JSON.parse(JSON.stringify(first))).toEqual(
        JSON.parse(JSON.stringify(await gatherCandidates({cwd, type: 'doc'}))),
      );
    },
    SLOW,
  );

  it(
    'gathers again when an input file changes',
    async () => {
      const cwd = scratchProject();
      const first = await gatherCandidatesReused({cwd, type: 'doc'});
      const later = new Date(Date.now() + 5_000);
      fs.utimesSync(path.join(cwd, 'package.json'), later, later);
      expect(await gatherCandidatesReused({cwd, type: 'doc'})).not.toBe(first);
      fs.writeFileSync(
        path.join(cwd, 'astryx.config.mjs'),
        'export default {};\n',
      );
      const third = await gatherCandidatesReused({cwd, type: 'doc'});
      expect(third).not.toBe(first);
      expect(await gatherCandidatesReused({cwd, type: 'doc'})).toBe(third);
    },
    SLOW,
  );

  it(
    'keeps one entry per folder and type',
    async () => {
      const cwd = scratchProject();
      const docs = await gatherCandidatesReused({cwd, type: 'doc'});
      const themes = await gatherCandidatesReused({cwd, type: 'theme'});
      expect(themes).not.toBe(docs);
      expect(themes.all.every(c => c.domain === 'theme')).toBe(true);
      expect(
        await gatherCandidatesReused({cwd: scratchProject(), type: 'doc'}),
      ).not.toBe(docs);
    },
    SLOW,
  );

  it(
    'gathers again once the reuse window passes',
    async () => {
      const cwd = scratchProject();
      const first = await gatherCandidatesReused({cwd, type: 'doc'});
      const now = Date.now();
      const clock = vi.spyOn(Date, 'now').mockReturnValue(now + 6 * 60_000);
      try {
        expect(await gatherCandidatesReused({cwd, type: 'doc'})).not.toBe(
          first,
        );
      } finally {
        clock.mockRestore();
      }
    },
    SLOW,
  );
});
