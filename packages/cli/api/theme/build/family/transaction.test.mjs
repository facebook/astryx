// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file transaction.test.mjs
 * @input Complete in-memory family generations and injected failure boundaries
 * @output Atomic current-pointer publication, recovery, and manifest-bounded cleanup
 * @position Focused AST-034 FR13–FR15 filesystem contract tests
 */

import {createHash} from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {
  checkFamilyGeneration,
  publishFamilyGeneration,
} from './transaction.mjs';

const digest = value =>
  `sha256-${createHash('sha256').update(value).digest('hex')}`;

function generation(key, id, cssValue, extraOwned = {}) {
  const files = new Map([
    [`${key}.css`, `:root{--ink:${cssValue}}\n`],
    [`${key}.js`, `export const theme=${JSON.stringify(cssValue)};\n`],
    [`${key}.d.ts`, 'export declare const theme: string;\n'],
    ['receipts/build.json', `${JSON.stringify({members: ['ocean']})}\n`],
    ...Object.entries(extraOwned),
  ]);
  const owned = [...files]
    .map(([file, content]) => ({path: file, digest: digest(content)}))
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  const manifestPath = `${key}.manifest.json`;
  files.set(
    manifestPath,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        artifactKey: key,
        generationId: id,
        artifacts: {
          css: `${key}.css`,
          js: `${key}.js`,
          dts: `${key}.d.ts`,
          manifest: manifestPath,
        },
        owned,
      },
      null,
      2,
    )}\n`,
  );
  return {generationId: id, files, manifestPath};
}

let root;
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-family-transaction-'));
});
afterEach(() => {
  fs.rmSync(root, {recursive: true, force: true});
});

describe('family generation transaction', () => {
  it('publishes one immutable generation and atomically advances current', () => {
    const first = generation('family', 'gen-first', 'red');
    publishFamilyGeneration({root, artifactKey: 'family', ...first});

    expect(fs.lstatSync(path.join(root, 'current')).isSymbolicLink()).toBe(true);
    expect(fs.readlinkSync(path.join(root, 'current'))).toBe(
      'generations/gen-first',
    );
    expect(
      fs.readFileSync(path.join(root, 'current', 'family.css'), 'utf8'),
    ).toContain('red');

    const unowned = path.join(root, 'generations', 'unowned', 'keep.txt');
    fs.mkdirSync(path.dirname(unowned), {recursive: true});
    fs.writeFileSync(unowned, 'keep');

    const second = generation('family', 'gen-second', 'blue');
    publishFamilyGeneration({root, artifactKey: 'family', ...second});

    expect(fs.readlinkSync(path.join(root, 'current'))).toBe(
      'generations/gen-second',
    );
    expect(fs.existsSync(path.join(root, 'generations', 'gen-first'))).toBe(
      false,
    );
    expect(fs.readFileSync(unowned, 'utf8')).toBe('keep');
  });

  it('rolls back a journaled generation that never became current', () => {
    const first = generation('family', 'gen-first', 'red');
    publishFamilyGeneration({root, artifactKey: 'family', ...first});
    const second = generation('family', 'gen-second', 'blue');

    expect(() =>
      publishFamilyGeneration({
        root,
        artifactKey: 'family',
        ...second,
        hooks: {afterJournal: () => { throw new Error('fault after journal'); }},
      }),
    ).toThrow(/fault after journal/);

    const checked = checkFamilyGeneration({
      root,
      artifactKey: 'family',
      expectedGeneration: first,
    });
    expect(checked.upToDate).toBe(true);
    expect(fs.readlinkSync(path.join(root, 'current'))).toBe(
      'generations/gen-first',
    );
    expect(fs.existsSync(path.join(root, 'generations', 'gen-second'))).toBe(
      false,
    );
    expect(fs.existsSync(path.join(root, '.journal.json'))).toBe(false);
  });

  it('finishes a committed generation after a crash following pointer replacement', () => {
    const first = generation('family', 'gen-first', 'red');
    publishFamilyGeneration({root, artifactKey: 'family', ...first});
    const second = generation('family', 'gen-second', 'blue');

    expect(() =>
      publishFamilyGeneration({
        root,
        artifactKey: 'family',
        ...second,
        hooks: {afterPointer: () => { throw new Error('fault after pointer'); }},
      }),
    ).toThrow(/fault after pointer/);

    const checked = checkFamilyGeneration({
      root,
      artifactKey: 'family',
      expectedGeneration: second,
    });
    expect(checked.upToDate).toBe(true);
    expect(fs.readlinkSync(path.join(root, 'current'))).toBe(
      'generations/gen-second',
    );
    expect(fs.existsSync(path.join(root, 'generations', 'gen-first'))).toBe(
      false,
    );
    expect(fs.existsSync(path.join(root, '.journal.json'))).toBe(false);
  });

  it('reports missing, outdated, and formerly owned extra files without publishing', () => {
    const first = generation('family', 'gen-first', 'red', {
      'receipts/old-member.json': '{}\n',
    });
    publishFamilyGeneration({root, artifactKey: 'family', ...first});

    const expected = generation('family', 'gen-second', 'blue');
    fs.rmSync(path.join(root, 'current', 'family.d.ts'));
    fs.writeFileSync(path.join(root, 'current', 'family.css'), 'tampered');

    const result = checkFamilyGeneration({
      root,
      artifactKey: 'family',
      expectedGeneration: expected,
    });

    expect(result.upToDate).toBe(false);
    expect(result.stale).toEqual(
      expect.arrayContaining([
        expect.objectContaining({path: 'family.d.ts', reason: 'missing'}),
        expect.objectContaining({path: 'family.css', reason: 'outdated'}),
        expect.objectContaining({
          path: 'receipts/old-member.json',
          reason: 'outdated',
        }),
      ]),
    );
    expect(fs.readlinkSync(path.join(root, 'current'))).toBe(
      'generations/gen-first',
    );
    expect(fs.existsSync(path.join(root, 'generations', 'gen-second'))).toBe(
      false,
    );
  });

  it('reclaims a lock whose owning process no longer exists', () => {
    fs.symlinkSync(
      Buffer.from(
        JSON.stringify({hostname: os.hostname(), pid: 2147483647}),
      ).toString('base64url'),
      path.join(root, '.lock'),
    );

    const next = generation('family', 'gen-next', 'green');
    expect(() =>
      publishFamilyGeneration({root, artifactKey: 'family', ...next}),
    ).not.toThrow();
  });
});
