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
 *   only the node global setup rebuilds a stale one, before the workers fork,
 *   and only once every run that started before it has ended. Each checkout
 *   has its own lock and its own run leases. Every file Core's build scripts
 *   write output with, and every local file those load, is a source.
 * @position Unit test of packages/cli/clients/cli/commands/ensure-core-built.mjs
 */

import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterEach, describe, expect, it} from 'vitest';
import {
  CORE_BUILD_MARKER,
  CORE_GENERATED,
  CORE_SOURCES,
  coreBuildIsStale,
  coreBuildLockDir,
  coreRunLeaseDir,
  earlierLiveRuns,
  ensureBuiltOnce,
  ensureCoreBuiltAt,
  registerTestRun,
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

describe('the build marker', () => {
  it("is the output Core's build writes last, after the modules and their declarations", () => {
    const {scripts} = JSON.parse(
      fs.readFileSync(
        path.join(REPO_ROOT, 'packages/core/package.json'),
        'utf8',
      ),
    );
    const steps = scripts.build.split('&&').map(step => step.trim());
    const at = name => steps.findIndex(step => step.includes(name));
    expect(path.relative(REPO_ROOT, CORE_BUILD_MARKER)).toBe(
      'packages/core/dist/astryx.css',
    );
    expect(at('build:css')).toBeGreaterThan(at('build:esm'));
    expect(at('build:css')).toBeGreaterThan(at('tsc '));
    expect(at('build:css')).toBeGreaterThan(at('add-declaration-extensions'));
    expect(scripts['build:css']).toContain('build-css.mjs');
    expect(
      fs.readFileSync(path.join(REPO_ROOT, 'scripts/build-css.mjs'), 'utf8'),
    ).toContain("outFile: 'astryx.css'");
  });

  it('rebuilds a build that stopped before its marker, even when its modules are newer than every source', () => {
    // A rebuild interrupted after Babel wrote dist/theme/index.js, before the
    // declarations and the stylesheet: the marker is missing.
    const {write, roots} = tree();
    write('dist/theme/index.js', 'export {};', 3000);
    let builds = 0;
    ensureCoreBuiltAt({
      entry: path.join(dir, 'dist/astryx.css'),
      roots,
      build: () => {
        builds++;
      },
      lockDir: path.join(dir, 'lock'),
    });
    expect(builds).toBe(1);
  });
});

describe("Core's build inputs", () => {
  it("cover every script and config file Core's build scripts write output with, and every local file those load", () => {
    const coreDir = path.join(REPO_ROOT, 'packages/core');
    const {scripts} = JSON.parse(
      fs.readFileSync(path.join(coreDir, 'package.json'), 'utf8'),
    );
    const inputs = new Set();
    for (const [name, command] of Object.entries(scripts)) {
      if (!/^build(:|$)/.test(name)) continue;
      for (const [, file] of command.matchAll(/\bnode\s+(\S+\.m?js)/g)) {
        // Checks read the build; they write nothing it depends on.
        if (!/\/(check-|clean-dist)/.test(file)) inputs.add(file);
      }
      for (const [, file] of command.matchAll(
        /--(?:config-file|project)\s+(\S+)/g,
      )) {
        inputs.add(file);
      }
    }
    const covered = file =>
      CORE_SOURCES.some(root => {
        const relative = path.relative(root, file);
        return (
          relative === '' ||
          (!relative.startsWith('..') && !path.isAbsolute(relative))
        );
      });
    // Follow what those files load: a config's local plugins and presets, and
    // a script's relative imports, transitively.
    const resolveLocal = (from, specifier) => {
      const base = path.resolve(path.dirname(from), specifier);
      return ['', '.mjs', '.js', '.cjs', '.json']
        .map(ext => base + ext)
        .find(
          candidate =>
            fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
        );
    };
    const queue = [...inputs].map(file => path.resolve(coreDir, file));
    const seen = new Set();
    while (queue.length > 0) {
      const file = queue.pop();
      if (seen.has(file) || !fs.existsSync(file)) continue;
      seen.add(file);
      const text = fs.readFileSync(file, 'utf8');
      const local = [];
      if (file.endsWith('.json')) {
        const config = JSON.parse(text);
        for (const entry of [
          ...(config.plugins ?? []),
          ...(config.presets ?? []),
        ]) {
          const name = Array.isArray(entry) ? entry[0] : entry;
          if (typeof name === 'string' && /^\.\.?\//.test(name))
            local.push(name);
        }
        if (
          typeof config.extends === 'string' &&
          /^\.\.?\//.test(config.extends)
        ) {
          local.push(config.extends);
        }
      } else {
        for (const [, specifier] of text.matchAll(
          /(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)['"](\.\.?\/[^'"]+)['"]/g,
        )) {
          local.push(specifier);
        }
      }
      for (const specifier of local) {
        const target = resolveLocal(file, specifier);
        if (target) queue.push(target);
      }
    }
    const missing = [...seen]
      .filter(file => !covered(file))
      .map(file => path.relative(REPO_ROOT, file));
    expect(inputs.size).toBeGreaterThan(3);
    expect(seen.size).toBeGreaterThan(inputs.size);
    expect(missing).toEqual([]);
  });
});

describe('run leases', () => {
  /** A stale build (a source newer than it) and a lease directory. */
  function staleTree() {
    const built = tree();
    fs.utimesSync(built.source, 3000, 3000);
    return {...built, leaseDir: path.join(dir, 'runs')};
  }

  it('make a stale rebuild wait until a run that started before it has ended', () => {
    const {entry, roots, leaseDir} = staleTree();
    registerTestRun({leaseDir, pid: 101, now: 1});
    registerTestRun({leaseDir, pid: process.pid, now: 2});
    const ends = Date.now() + 300;
    let builtAt = 0;
    ensureCoreBuiltAt({
      entry,
      roots,
      build: () => {
        builtAt = Date.now();
      },
      lockDir: path.join(dir, 'lock'),
      rebuildStale: true,
      runLeaseDir: leaseDir,
      isAlive: pid => pid === 101 && Date.now() < ends,
      pollMs: 20,
    });
    expect(builtAt).toBeGreaterThanOrEqual(ends);
  });

  it('let a run that started later wait instead, so two runs never wait for each other', () => {
    const {entry, roots, leaseDir} = staleTree();
    registerTestRun({leaseDir, pid: process.pid, now: 1});
    registerTestRun({leaseDir, pid: 202, now: 2});
    expect(earlierLiveRuns(leaseDir, {isAlive: () => true})).toEqual([]);
    expect(earlierLiveRuns(leaseDir, {pid: 202, isAlive: () => true})).toEqual([
      process.pid,
    ]);
    let builds = 0;
    ensureCoreBuiltAt({
      entry,
      roots,
      build: () => {
        builds++;
      },
      lockDir: path.join(dir, 'lock'),
      rebuildStale: true,
      runLeaseDir: leaseDir,
      isAlive: () => true,
    });
    expect(builds).toBe(1);
  });

  it('drop the lease of a run whose process is gone', () => {
    const {leaseDir} = staleTree();
    registerTestRun({leaseDir, pid: 303, now: 1});
    registerTestRun({leaseDir, pid: process.pid, now: 2});
    expect(earlierLiveRuns(leaseDir, {isAlive: () => false})).toEqual([]);
    expect(fs.readdirSync(leaseDir)).toEqual([String(process.pid)]);
  });

  it("end with the run: the teardown removes this run's lease", () => {
    const {leaseDir} = staleTree();
    const end = registerTestRun({leaseDir});
    expect(fs.readdirSync(leaseDir)).toEqual([String(process.pid)]);
    end();
    expect(fs.readdirSync(leaseDir)).toEqual([]);
  });

  it('are held by the node global setup for its whole run, beside its own lock', () => {
    const setup = fs.readFileSync(
      path.join(REPO_ROOT, 'vitest.global-setup.node.mjs'),
      'utf8',
    );
    expect(setup).toMatch(
      /const endRun = registerTestRun\(\);[\s\S]*ensureCoreBuilt\(\{rebuildStale: true\}\)[\s\S]*return endRun;/,
    );
    expect(path.dirname(coreRunLeaseDir(REPO_ROOT))).toBe(
      path.dirname(coreBuildLockDir(REPO_ROOT)),
    );
    expect(coreRunLeaseDir(REPO_ROOT)).not.toBe(coreBuildLockDir(REPO_ROOT));
  });
});
