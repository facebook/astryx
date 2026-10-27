// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ensure-core-built.test.mjs
 * @input coreBuildIsStale over temporary trees; ensureBuiltOnce with a
 *   temporary lock directory; the repository's .gitignore
 * @output A core build counts as current only when it is newer than every
 *   source file: a missing entry, a source or package.json changed after it,
 *   are stale; node_modules, dist and generated output are not sources, and
 *   Core's translations are. A caller waiting on another's build returns only
 *   once that build released the lock. A suite builds only a missing Core;
 *   only the node global setup rebuilds a stale one, before the workers fork.
 *   Each checkout has its own lock.
 * @position Unit test of packages/cli/clients/cli/commands/ensure-core-built.mjs
 */

import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterEach, describe, expect, it} from 'vitest';
import {
  CORE_GENERATED,
  CORE_SOURCES,
  coreBuildIsStale,
  coreBuildLockDir,
  ensureBuiltOnce,
  ensureCoreBuiltAt,
} from '../packages/cli/clients/cli/commands/ensure-core-built.mjs';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

let dir;
afterEach(() => {
  if (dir) fs.rmSync(dir, {recursive: true, force: true});
  dir = undefined;
});

/** A core-shaped tree: sources at t = 1000 s, the built entry at t = 2000 s. */
function tree() {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-core-build-stale-'));
  const write = (relative, content, seconds) => {
    const file = path.join(dir, relative);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, content);
    fs.utimesSync(file, seconds, seconds);
    return file;
  };
  const source = write('src/theme/index.ts', 'export {};', 1000);
  const pkg = write('package.json', '{}', 1000);
  const entry = write('dist/theme/index.js', 'export {};', 2000);
  return {
    write,
    source,
    entry,
    roots: [path.join(dir, 'src'), pkg],
  };
}

describe('coreBuildIsStale', () => {
  it('is stale with no build', () => {
    const {entry, roots} = tree();
    fs.rmSync(entry);
    expect(coreBuildIsStale(entry, roots)).toBe(true);
  });

  it('is current when the build is newer than every source', () => {
    const {entry, roots} = tree();
    expect(coreBuildIsStale(entry, roots)).toBe(false);
  });

  it('is stale when a source changed after the build, as a checkout does', () => {
    const {entry, roots, source} = tree();
    fs.utimesSync(source, 3000, 3000);
    expect(coreBuildIsStale(entry, roots)).toBe(true);
  });

  it('is stale when a new source appeared after the build', () => {
    const {entry, roots, write} = tree();
    write('src/theme/adaptations.ts', 'export {};', 3000);
    expect(coreBuildIsStale(entry, roots)).toBe(true);
  });

  it('is stale when package.json changed after the build', () => {
    const {entry, roots} = tree();
    fs.utimesSync(roots[1], 3000, 3000);
    expect(coreBuildIsStale(entry, roots)).toBe(true);
  });

  it('skips node_modules and dist under a source root', () => {
    const {entry, roots, write} = tree();
    write('src/node_modules/x/index.js', 'x', 3000);
    write('src/dist/x.js', 'x', 3000);
    expect(coreBuildIsStale(entry, roots)).toBe(false);
  });

  it('skips generated output, which the test setup rewrites after a build', () => {
    const {entry, roots, write} = tree();
    write('src/i18n/generated-locales/en.generated.ts', 'x', 3000);
    write('locales/pseudo.json', '{}', 3000);
    write('locales/en.json', '{}', 1000);
    const generated = [
      path.join(dir, 'src/i18n/generated-locales'),
      path.join(dir, 'locales/pseudo.json'),
    ];
    const withLocales = [...roots, path.join(dir, 'locales')];
    expect(coreBuildIsStale(entry, withLocales, generated)).toBe(false);
    // The translations they come from are sources.
    fs.utimesSync(path.join(dir, 'locales/en.json'), 3000, 3000);
    expect(coreBuildIsStale(entry, withLocales, generated)).toBe(true);
  });
});

describe("Core's sources", () => {
  it('include its translations, and skip exactly the git-ignored output under them', () => {
    const core = path.join(REPO_ROOT, 'packages/core');
    expect(CORE_SOURCES).toContain(path.join(core, 'locales'));
    // Every git-ignored path under a source root is generated output.
    const ignored = fs
      .readFileSync(path.join(REPO_ROOT, '.gitignore'), 'utf8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('packages/core/'))
      .map(line => path.join(REPO_ROOT, line.replace(/\/$/u, '')))
      .filter(p => CORE_SOURCES.some(root => p.startsWith(root + path.sep)));
    expect(ignored.length).toBeGreaterThan(0);
    expect([...CORE_GENERATED].sort()).toEqual([...ignored].sort());
  });
});

describe('ensureBuiltOnce', () => {
  /** A lock directory another process holds and releases after `ms`. */
  function heldFor(ms) {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-core-build-lock-'));
    const lockDir = path.join(dir, 'lock');
    fs.mkdirSync(lockDir);
    const child = spawn(
      process.execPath,
      [
        '-e',
        `setTimeout(() => require('node:fs').rmSync(${JSON.stringify(lockDir)}, {recursive: true, force: true}), ${ms})`,
      ],
      {stdio: 'ignore'},
    );
    return {lockDir, child};
  }

  it('waits for the lock to be released before reading a build another caller is writing', async () => {
    const {lockDir, child} = heldFor(400);
    const exited = new Promise(resolve => child.on('exit', resolve));
    let builds = 0;
    const start = Date.now();
    // The entry already reads as current while the holder still writes the
    // rest of the build.
    ensureBuiltOnce({
      isBuilt: () => true,
      build: () => {
        builds += 1;
      },
      lockDir,
      pollMs: 20,
    });
    const waited = Date.now() - start;
    await exited;
    expect(builds).toBe(0);
    expect(waited).toBeGreaterThanOrEqual(350);
  });

  it('returns at once when the build is current and nobody holds the lock', () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-core-build-lock-'));
    let builds = 0;
    const start = Date.now();
    ensureBuiltOnce({
      isBuilt: () => true,
      build: () => {
        builds += 1;
      },
      lockDir: path.join(dir, 'lock'),
    });
    expect(builds).toBe(0);
    expect(Date.now() - start).toBeLessThan(200);
  });

  it('builds once under the lock when the build is stale, then releases it', () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-core-build-lock-'));
    const lockDir = path.join(dir, 'lock');
    let built = false;
    let heldDuringBuild = false;
    ensureBuiltOnce({
      isBuilt: () => built,
      build: () => {
        heldDuringBuild = fs.existsSync(lockDir);
        built = true;
      },
      lockDir,
    });
    expect(built).toBe(true);
    expect(heldDuringBuild).toBe(true);
    expect(fs.existsSync(lockDir)).toBe(false);
  });
});

describe('ensureCoreBuiltAt', () => {
  it('builds a missing Core', () => {
    const {entry, roots} = tree();
    fs.rmSync(entry);
    let builds = 0;
    ensureCoreBuiltAt({
      entry,
      roots,
      build: () => {
        builds++;
      },
      lockDir: path.join(dir, 'lock'),
    });
    expect(builds).toBe(1);
  });

  it('leaves a present build alone in a suite, even when a source changed after it', () => {
    // A Core edit while the suites run must not rebuild under them: the
    // build deletes dist first, and suites still reading it fail.
    const {source, entry, roots} = tree();
    fs.utimesSync(source, 3000, 3000);
    expect(coreBuildIsStale(entry, roots)).toBe(true);
    let builds = 0;
    ensureCoreBuiltAt({
      entry,
      roots,
      build: () => {
        builds++;
      },
      lockDir: path.join(dir, 'lock'),
    });
    expect(builds).toBe(0);
  });

  it('rebuilds a build older than a source when asked, as the global setup does', () => {
    const {source, entry, roots} = tree();
    fs.utimesSync(source, 3000, 3000);
    let builds = 0;
    ensureCoreBuiltAt({
      entry,
      roots,
      build: () => {
        builds++;
      },
      lockDir: path.join(dir, 'lock'),
      rebuildStale: true,
    });
    expect(builds).toBe(1);
  });

  it('is asked to rebuild a stale Core only by the node global setup', () => {
    const setup = fs.readFileSync(
      path.join(REPO_ROOT, 'vitest.global-setup.node.mjs'),
      'utf8',
    );
    expect(setup).toContain('ensureCoreBuilt({rebuildStale: true})');
    const suites = [];
    const walk = current => {
      for (const entry of fs.readdirSync(current, {withFileTypes: true})) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules') walk(full);
        } else if (
          entry.name.endsWith('.test.mjs') &&
          /ensureCoreBuilt\([^)]*rebuildStale/.test(
            fs.readFileSync(full, 'utf8'),
          )
        ) {
          suites.push(path.relative(REPO_ROOT, full));
        }
      }
    };
    walk(path.join(REPO_ROOT, 'packages/cli'));
    expect(suites).toEqual([]);
  });
});

describe('coreBuildLockDir', () => {
  it('gives each checkout its own lock', () => {
    expect(coreBuildLockDir('/work/a')).not.toBe(coreBuildLockDir('/work/b'));
    expect(coreBuildLockDir('/work/a')).toBe(coreBuildLockDir('/work/a/'));
    expect(path.dirname(coreBuildLockDir('/work/a'))).toBe(os.tmpdir());
  });

  it("does not keep a checkout with a current build waiting on another checkout's build", () => {
    const {entry, roots} = tree();
    const other = coreBuildLockDir(path.join(dir, 'other-checkout'));
    fs.mkdirSync(other);
    try {
      const started = Date.now();
      ensureCoreBuiltAt({
        entry,
        roots,
        build: () => {
          throw new Error('a current build is not rebuilt');
        },
        lockDir: coreBuildLockDir(dir),
        staleLockMs: 5000,
        pollMs: 50,
      });
      expect(Date.now() - started).toBeLessThan(1000);
    } finally {
      fs.rmSync(other, {recursive: true, force: true});
    }
  });
});
