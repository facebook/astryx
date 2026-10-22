// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {
  fileFilter,
  legWall,
  listedFiles,
  partitionFiles,
  recordDurations,
} from './a11y-contract-shard.mjs';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

describe('a11y contract shards', () => {
  const recorded = {
    'packages/a.spec.ts': 300,
    'packages/b.spec.ts': 280,
    'packages/c.spec.ts': 40,
    'packages/d.spec.ts': 30,
    'packages/e.spec.ts': 20,
    'internal/f.spec.ts': 1,
  };
  const files = [...Object.keys(recorded), 'packages/new.spec.ts'].sort();

  it('assigns every file to exactly one leg, including unrecorded files', () => {
    const legs = partitionFiles(files, 3, recorded);
    expect(legs.flat().sort()).toEqual(files);
    expect(new Set(legs.flat()).size).toBe(files.length);
    for (const leg of legs) expect(leg).toEqual([...leg].sort());
  });

  it('keeps the two heaviest files apart', () => {
    const legs = partitionFiles(files, 3, recorded);
    const leg = file => legs.findIndex(items => items.includes(file));
    expect(leg('packages/a.spec.ts')).not.toBe(leg('packages/b.spec.ts'));
  });

  it('beats a count-based path-order split on the recorded suite', () => {
    const {seconds} = JSON.parse(
      fs.readFileSync(
        path.join(ROOT, '.github/a11y-contract-durations.json'),
        'utf8',
      ),
    );
    const all = Object.keys(seconds).sort();
    const at = file => seconds[file];
    const balanced = Math.max(
      ...partitionFiles(all, 3, seconds).map(leg => legWall(leg, at)),
    );
    const naive = Math.max(
      ...[0, 1, 2].map(index =>
        legWall(
          all.slice((index * all.length) / 3, ((index + 1) * all.length) / 3),
          at,
        ),
      ),
    );
    expect(balanced).toBeLessThan(naive);
  });

  it('simulates path-order workers', () => {
    expect(
      legWall(['b', 'a', 'c'], file => ({a: 5, b: 1, c: 1})[file], 2),
    ).toBe(5);
  });

  it('lists the files of a Playwright JSON listing', () => {
    expect(
      listedFiles({
        suites: [
          {
            file: 'x.spec.ts',
            specs: [{file: 'x.spec.ts'}],
            suites: [{specs: [{file: 'x.spec.ts'}]}],
          },
          {file: 'a.spec.ts', specs: [{file: 'a.spec.ts'}]},
        ],
      }),
    ).toEqual(['a.spec.ts', 'x.spec.ts']);
  });

  it('builds a filter that matches only that path', () => {
    const filter = new RegExp(
      fileFilter(
        'packages/core/src/Button/__tests__/Button.a11y.chromium.spec.ts',
      ),
    );
    expect(
      filter.test(
        '/repo/packages/core/src/Button/__tests__/Button.a11y.chromium.spec.ts',
      ),
    ).toBe(true);
    expect(
      filter.test(
        '/repo/packages/core/src/IconButton/__tests__/IconButton.a11y.chromium.spec.ts',
      ),
    ).toBe(false);
    expect(
      filter.test(
        '/repo/xpackages/core/src/Button/__tests__/Button.a11y.chromium.spec.ts',
      ),
    ).toBe(false);
  });

  it('records seconds per file from list-reporter lines', () => {
    expect(
      recordDurations(
        [
          '  ✓  1 [chromium] › packages/a.spec.ts:10:1 › one (1.5s)',
          '  ✓  2 [chromium] › packages/a.spec.ts:20:1 › two (500ms)',
          '  ✘  3 [chromium] › packages/b.spec.ts:5:1 › three (1.2m)',
          'unrelated line',
        ].join('\n'),
      ),
    ).toEqual({'packages/a.spec.ts': 2, 'packages/b.spec.ts': 72});
  });
});
