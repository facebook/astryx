// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file transaction.test.mjs
 * @input Complete in-memory family generations and injected failure boundaries
 * @output Atomic current-pointer publication, recovery, and manifest-bounded cleanup
 * @position Focused AST-034 FR13–FR15 filesystem contract tests
 */

import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {
  checkFamilyGeneration,
  publishFamilyGeneration,
  recoverFamilyOutput,
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

    expect(fs.lstatSync(path.join(root, 'current')).isSymbolicLink()).toBe(
      true,
    );
    expect(fs.readlinkSync(path.join(root, 'current'))).toBe(
      'generations/gen-first',
    );
    expect(
      fs.readFileSync(path.join(root, 'current', 'family.css'), 'utf8'),
    ).toContain('red');

    const unowned = path.join(root, 'generations', 'unowned', 'keep.txt');
    fs.mkdirSync(path.dirname(unowned), {recursive: true});
    fs.writeFileSync(unowned, 'keep');
    const unrelatedEmpty = path.join(
      root,
      'generations',
      'gen-00000000000000000000',
    );
    fs.mkdirSync(unrelatedEmpty);

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

  it('exposes mandatory recovery before later planning or validation', () => {
    const first = generation('family', 'gen-first', 'red');
    publishFamilyGeneration({root, artifactKey: 'family', ...first});
    const second = generation('family', 'gen-second', 'blue');
    expect(() =>
      publishFamilyGeneration({
        root,
        artifactKey: 'family',
        ...second,
        hooks: {
          afterJournal: () => {
            throw new Error('stop before pointer');
          },
        },
      }),
    ).toThrow(/stop before pointer/);

    recoverFamilyOutput({
      root,
      artifactKey: 'family',
      manifestPath: first.manifestPath,
    });
    expect(fs.readlinkSync(path.join(root, 'current'))).toBe(
      'generations/gen-first',
    );
    expect(fs.existsSync(path.join(root, '.journal.json'))).toBe(false);
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
        hooks: {
          afterJournal: () => {
            throw new Error('fault after journal');
          },
        },
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

  it('keeps a rollback journal when the uncommitted ownership proof is missing', () => {
    const first = generation('family', 'gen-first', 'red');
    publishFamilyGeneration({root, artifactKey: 'family', ...first});
    const second = generation('family', 'gen-second', 'blue');
    expect(() =>
      publishFamilyGeneration({
        root,
        artifactKey: 'family',
        ...second,
        hooks: {
          afterJournal: () => {
            throw new Error('stop before pointer');
          },
        },
      }),
    ).toThrow(/stop before pointer/);
    fs.rmSync(
      path.join(root, 'generations', 'gen-second', second.manifestPath),
    );

    expect(() =>
      checkFamilyGeneration({
        root,
        artifactKey: 'family',
        expectedGeneration: first,
      }),
    ).toThrow(/no valid ownership manifest/);
    expect(fs.existsSync(path.join(root, '.journal.json'))).toBe(true);
    expect(
      fs.existsSync(path.join(root, 'generations', 'gen-second', 'family.css')),
    ).toBe(true);
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
        hooks: {
          afterPointer: () => {
            throw new Error('fault after pointer');
          },
        },
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

  it.each(['afterWrite', 'afterStage', 'afterValidate'])(
    'keeps the prior generation active after a fault at %s',
    hook => {
      const first = generation('family', 'gen-first', 'red');
      publishFamilyGeneration({root, artifactKey: 'family', ...first});
      const second = generation('family', 'gen-second', 'blue');
      let fired = false;
      const fail = () => {
        if (fired) return;
        fired = true;
        throw new Error(`fault at ${hook}`);
      };

      expect(() =>
        publishFamilyGeneration({
          root,
          artifactKey: 'family',
          ...second,
          hooks: {[hook]: fail},
        }),
      ).toThrow(`fault at ${hook}`);
      expect(fs.readlinkSync(path.join(root, 'current'))).toBe(
        'generations/gen-first',
      );

      expect(() =>
        publishFamilyGeneration({root, artifactKey: 'family', ...second}),
      ).not.toThrow();
      expect(fs.readlinkSync(path.join(root, 'current'))).toBe(
        'generations/gen-second',
      );
    },
  );

  it('recovers a real process exit after journaling', () => {
    const first = generation('family', 'gen-first', 'red');
    publishFamilyGeneration({root, artifactKey: 'family', ...first});
    const second = generation('family', 'gen-second', 'blue');
    const payload = path.join(root, 'payload.json');
    fs.writeFileSync(
      payload,
      JSON.stringify({
        generationId: second.generationId,
        manifestPath: second.manifestPath,
        files: [...second.files],
      }),
    );
    const runner = path.join(root, 'crash.mjs');
    const transactionURL = pathToFileURL(
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        'transaction.mjs',
      ),
    ).href;
    fs.writeFileSync(
      runner,
      `import fs from 'node:fs';\nimport {publishFamilyGeneration} from ${JSON.stringify(transactionURL)};\nconst input=JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));\npublishFamilyGeneration({root:process.argv[2], artifactKey:'family', generationId:input.generationId, manifestPath:input.manifestPath, files:new Map(input.files), hooks:{afterJournal(){process.exit(37);}}});\n`,
    );

    const exited = spawnSync(process.execPath, [runner, root, payload]);
    expect(exited.status).toBe(37);
    const checked = checkFamilyGeneration({
      root,
      artifactKey: 'family',
      expectedGeneration: first,
    });
    expect(checked.upToDate).toBe(true);
    expect(fs.existsSync(path.join(root, '.journal.json'))).toBe(false);
  });

  it('preserves unmanifested data inside a superseded generation', () => {
    const first = generation('family', 'gen-first', 'red');
    publishFamilyGeneration({root, artifactKey: 'family', ...first});
    const unowned = path.join(
      root,
      'generations',
      'gen-first',
      'user-authored.txt',
    );
    fs.writeFileSync(unowned, 'keep');

    const second = generation('family', 'gen-second', 'blue');
    publishFamilyGeneration({root, artifactKey: 'family', ...second});
    expect(fs.readFileSync(unowned, 'utf8')).toBe('keep');
    expect(
      fs.existsSync(path.join(root, 'generations', 'gen-first', 'family.css')),
    ).toBe(false);
    expect(
      fs.existsSync(
        path.join(root, 'generations', 'gen-first', first.manifestPath),
      ),
    ).toBe(true);

    const third = generation('family', 'gen-third', 'green');
    expect(() =>
      publishFamilyGeneration({root, artifactKey: 'family', ...third}),
    ).not.toThrow();
    expect(fs.readFileSync(unowned, 'utf8')).toBe('keep');
  });

  it('refuses to clear a committed journal when prior ownership proof is missing', () => {
    const first = generation('family', 'gen-first', 'red');
    publishFamilyGeneration({root, artifactKey: 'family', ...first});
    const second = generation('family', 'gen-second', 'blue');
    expect(() =>
      publishFamilyGeneration({
        root,
        artifactKey: 'family',
        ...second,
        hooks: {
          afterPointer: () => {
            throw new Error('stop before cleanup');
          },
        },
      }),
    ).toThrow(/stop before cleanup/);
    fs.rmSync(path.join(root, 'generations', 'gen-first', first.manifestPath));

    expect(() =>
      checkFamilyGeneration({
        root,
        artifactKey: 'family',
        expectedGeneration: second,
      }),
    ).toThrow(/no valid ownership manifest/);
    expect(fs.existsSync(path.join(root, '.journal.json'))).toBe(true);
    expect(
      fs.existsSync(path.join(root, 'generations', 'gen-first', 'family.css')),
    ).toBe(true);
  });

  it('authenticates the prior manifest before committed cleanup', () => {
    const first = generation('family', 'gen-first', 'red');
    publishFamilyGeneration({root, artifactKey: 'family', ...first});
    const second = generation('family', 'gen-second', 'blue');
    expect(() =>
      publishFamilyGeneration({
        root,
        artifactKey: 'family',
        ...second,
        hooks: {
          afterPointer: () => {
            throw new Error('stop before cleanup');
          },
        },
      }),
    ).toThrow(/stop before cleanup/);
    fs.appendFileSync(
      path.join(root, 'generations', 'gen-first', first.manifestPath),
      '\n',
    );

    expect(() =>
      checkFamilyGeneration({
        root,
        artifactKey: 'family',
        expectedGeneration: second,
      }),
    ).toThrow(/Prior family generation does not match its journal/);
    expect(fs.existsSync(path.join(root, '.journal.json'))).toBe(true);
    expect(
      fs.existsSync(path.join(root, 'generations', 'gen-first', 'family.css')),
    ).toBe(true);
  });

  it('never follows a substituted directory while cleaning owned files', () => {
    const first = generation('family', 'gen-first', 'red');
    publishFamilyGeneration({root, artifactKey: 'family', ...first});
    const second = generation('family', 'gen-second', 'blue');
    expect(() =>
      publishFamilyGeneration({
        root,
        artifactKey: 'family',
        ...second,
        hooks: {
          afterPointer: () => {
            throw new Error('stop before cleanup');
          },
        },
      }),
    ).toThrow(/stop before cleanup/);
    const external = path.join(root, 'external-receipts');
    fs.mkdirSync(external);
    fs.writeFileSync(path.join(external, 'build.json'), 'unrelated');
    const receiptDirectory = path.join(
      root,
      'generations',
      'gen-first',
      'receipts',
    );
    fs.rmSync(receiptDirectory, {recursive: true});
    fs.symlinkSync(external, receiptDirectory, 'dir');

    expect(() =>
      checkFamilyGeneration({
        root,
        artifactKey: 'family',
        expectedGeneration: second,
      }),
    ).toThrow(/non-directory parent/);
    expect(fs.readFileSync(path.join(external, 'build.json'), 'utf8')).toBe(
      'unrelated',
    );
    expect(fs.existsSync(path.join(root, '.journal.json'))).toBe(true);
  });

  it('rejects a current pointer whose directory name disagrees with its manifest', () => {
    const expected = generation('family', 'gen-content-addressed', 'red');
    publishFamilyGeneration({root, artifactKey: 'family', ...expected});
    fs.renameSync(
      path.join(root, 'generations', expected.generationId),
      path.join(root, 'generations', 'gen-wrong-name'),
    );
    fs.unlinkSync(path.join(root, 'current'));
    fs.symlinkSync(
      'generations/gen-wrong-name',
      path.join(root, 'current'),
      'dir',
    );

    const checked = checkFamilyGeneration({
      root,
      artifactKey: 'family',
      expectedGeneration: expected,
    });
    expect(checked.upToDate).toBe(false);
    expect(checked.stale.every(item => item.reason === 'missing')).toBe(true);
  });

  it('recovers when a crash leaves an empty superseded directory after manifest removal', () => {
    const first = generation('family', 'gen-first', 'red');
    publishFamilyGeneration({root, artifactKey: 'family', ...first});
    const second = generation('family', 'gen-second', 'blue');
    expect(() =>
      publishFamilyGeneration({
        root,
        artifactKey: 'family',
        ...second,
        hooks: {
          afterPointer: () => {
            throw new Error('stop before cleanup');
          },
        },
      }),
    ).toThrow(/stop before cleanup/);
    const oldDirectory = path.join(root, 'generations', 'gen-first');
    for (const entry of fs.readdirSync(oldDirectory)) {
      fs.rmSync(path.join(oldDirectory, entry), {recursive: true, force: true});
    }

    const checked = checkFamilyGeneration({
      root,
      artifactKey: 'family',
      expectedGeneration: second,
    });
    expect(checked.upToDate).toBe(true);
    expect(fs.existsSync(oldDirectory)).toBe(false);
    expect(fs.existsSync(path.join(root, '.journal.json'))).toBe(false);
  });

  it('finishes cleanup after a fault following the committed pointer', () => {
    const first = generation('family', 'gen-first', 'red');
    publishFamilyGeneration({root, artifactKey: 'family', ...first});
    const second = generation('family', 'gen-second', 'blue');

    expect(() =>
      publishFamilyGeneration({
        root,
        artifactKey: 'family',
        ...second,
        hooks: {
          duringCleanup: () => {
            throw new Error('fault during cleanup');
          },
        },
      }),
    ).toThrow(/fault during cleanup/);
    expect(fs.readlinkSync(path.join(root, 'current'))).toBe(
      'generations/gen-second',
    );

    const checked = checkFamilyGeneration({
      root,
      artifactKey: 'family',
      expectedGeneration: second,
    });
    expect(checked.upToDate).toBe(true);
    expect(fs.existsSync(path.join(root, 'generations', 'gen-first'))).toBe(
      false,
    );
  });

  it('preserves unmanifested transaction-shaped residue without blocking check', () => {
    const first = generation('family', 'gen-first', 'red');
    publishFamilyGeneration({root, artifactKey: 'family', ...first});
    const residue = [
      '.journal-11111111-1111-4111-8111-111111111111.tmp',
      '.current-22222222-2222-4222-8222-222222222222.tmp',
      '.probe-33333333-3333-4333-8333-333333333333',
    ];
    fs.writeFileSync(path.join(root, residue[0]), 'partial');
    fs.symlinkSync('generations/gen-first', path.join(root, residue[1]), 'dir');
    fs.mkdirSync(path.join(root, residue[2]));
    fs.writeFileSync(path.join(root, residue[2], 'partial'), 'probe');

    const checked = checkFamilyGeneration({
      root,
      artifactKey: 'family',
      expectedGeneration: first,
    });
    expect(checked.upToDate).toBe(true);
    for (const name of residue) {
      expect(
        fs.lstatSync(path.join(root, name), {throwIfNoEntry: false}),
      ).toBeDefined();
    }
  });

  it('does not race a concurrent stale-lock reclaimer', () => {
    fs.symlinkSync(
      Buffer.from(
        JSON.stringify({hostname: os.hostname(), pid: process.pid}),
      ).toString('base64url'),
      path.join(root, '.lock-reclaim'),
    );
    const next = generation('family', 'gen-next', 'green');
    expect(() =>
      publishFamilyGeneration({root, artifactKey: 'family', ...next}),
    ).toThrow(/lock recovery is active/);
    expect(fs.existsSync(path.join(root, 'generations', 'gen-next'))).toBe(
      false,
    );
  });

  it('refuses an active same-host lock', () => {
    fs.symlinkSync(
      Buffer.from(
        JSON.stringify({hostname: os.hostname(), pid: process.pid}),
      ).toString('base64url'),
      path.join(root, '.lock'),
    );
    const next = generation('family', 'gen-next', 'green');
    expect(() =>
      publishFamilyGeneration({root, artifactKey: 'family', ...next}),
    ).toThrow(/locked/);
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
