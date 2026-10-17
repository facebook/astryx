// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, afterEach} from 'vitest';
import {spawn} from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  cachedRelease,
  forgetVerifiedReleases,
  ensureRelease,
  isInReleaseCache,
  releasesDir,
  resolvePublishedVersion,
  runNpm,
  tryLock,
} from './cache.mjs';
import {
  cleanupFixtures,
  installCore,
  installStandInCli,
  seedRelease,
  tempDir,
  writeJson,
} from '../../test-utils/release-fixtures.mjs';

afterEach(cleanupFixtures);

/**
 * A stand-in for npm: `install` lays down stand-in CLI and Core packages of
 * the requested version (or fails the way `outcome` says), and records each
 * call.
 * @param {{outcome?: 'ok' | 'offline' | 'missing' | 'wrong-version', engines?: string}} [options]
 */
function fakeNpm(options = {}) {
  const {outcome = 'ok', engines} = options;
  /** @type {string[][]} */
  const calls = [];
  /** @type {import('./cache.mjs').runNpm} */
  const run = (args, opts = {}) => {
    calls.push(args);
    if (outcome === 'offline') {
      return {
        status: 1,
        stdout: '',
        stderr: 'npm error code ENOTFOUND\nnpm error network request failed',
      };
    }
    if (outcome === 'missing') {
      return {
        status: 1,
        stdout: '',
        stderr:
          'npm error code ETARGET\nnpm error notarget No matching version',
      };
    }
    const spec = args.find(a => a.startsWith('@astryxdesign/cli@')) ?? '';
    const version = spec.split('@').pop() ?? '';
    const cwd = /** @type {string} */ (opts.cwd);
    const cli = installStandInCli(
      cwd,
      outcome === 'wrong-version' ? '0.0.1' : version,
    );
    if (engines) {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(cli, 'package.json'), 'utf-8'),
      );
      writeJson(path.join(cli, 'package.json'), {
        ...pkg,
        engines: {node: engines},
      });
    }
    installCore(cwd, version);
    return {status: 0, stdout: '', stderr: ''};
  };
  return {run, calls};
}

describe('ensureRelease', () => {
  it('installs, verifies, and keeps a release, then reuses it', () => {
    const cacheDir = tempDir('cache');
    const npm = fakeNpm();
    const release = ensureRelease('0.6.8', {cacheDir, run: npm.run});
    expect('bin' in release && release.version).toBe('0.6.8');
    expect(npm.calls[0]).toEqual(
      expect.arrayContaining([
        'install',
        '--ignore-scripts',
        '--prefer-offline',
        '@astryxdesign/cli@0.6.8',
        '@astryxdesign/core@0.6.8',
      ]),
    );
    expect(cachedRelease('0.6.8', cacheDir)?.coreDir).toBe(
      path.join(
        releasesDir(cacheDir),
        '0.6.8',
        'node_modules',
        '@astryxdesign',
        'core',
      ),
    );
    ensureRelease('0.6.8', {cacheDir, run: npm.run});
    expect(npm.calls).toHaveLength(1);
    expect(
      fs.readdirSync(releasesDir(cacheDir)).filter(n => n.startsWith('.')),
    ).toEqual([]);
  });

  it('says why a release is unavailable and keeps nothing', () => {
    const cases = /** @type {const} */ ([
      ['offline', /could not be reached/],
      ['missing', /does not have it/],
      ['wrong-version', /another version/],
    ]);
    for (const [outcome, reason] of cases) {
      const cacheDir = tempDir('cache');
      const result = ensureRelease('0.6.8', {
        cacheDir,
        run: fakeNpm({outcome}).run,
      });
      expect('reason' in result && result.reason).toMatch(reason);
      expect(cachedRelease('0.6.8', cacheDir)).toBeNull();
    }
  });

  it("refuses a release this computer's Node cannot run", () => {
    const cacheDir = tempDir('cache');
    const result = ensureRelease('0.9.0', {
      cacheDir,
      run: fakeNpm({engines: '>=99.0.0'}).run,
    });
    expect('reason' in result && result.reason).toMatch(
      /needs Node >=99\.0\.0/,
    );
  });

  it('refuses a version that is not a release version', () => {
    const result = ensureRelease('../../etc', {
      cacheDir: tempDir('cache'),
      run: fakeNpm().run,
    });
    expect('reason' in result && result.reason).toMatch(
      /not a release version/,
    );
  });

  it('waits for another run installing the same release', () => {
    const cacheDir = tempDir('cache');
    fs.mkdirSync(path.join(releasesDir(cacheDir), '.lock-0.6.8'), {
      recursive: true,
    });
    const result = ensureRelease('0.6.8', {
      cacheDir,
      run: fakeNpm().run,
      waitMs: 300,
    });
    expect('reason' in result && result.reason).toMatch(/still installing/);
  });
});

describe('cachedRelease', () => {
  it('counts a release only once it is verified', () => {
    const cacheDir = tempDir('cache');
    const dir = seedRelease(cacheDir, '0.7.1');
    expect(cachedRelease('0.7.1', cacheDir)).not.toBeNull();
    fs.rmSync(path.join(dir, 'release.json'));
    forgetVerifiedReleases();
    expect(cachedRelease('0.7.1', cacheDir)).toBeNull();
  });

  it('knows a folder inside the cache', () => {
    const cacheDir = tempDir('cache');
    const dir = seedRelease(cacheDir, '0.7.1');
    expect(isInReleaseCache(dir, cacheDir)).toBe(true);
    expect(isInReleaseCache(tempDir(), cacheDir)).toBe(false);
  });
});

describe('resolvePublishedVersion', () => {
  it('takes the newest version npm reports for a range', () => {
    /** @type {import('./cache.mjs').runNpm} */
    const run = args => {
      expect(args).toEqual([
        'view',
        '@astryxdesign/core@^0.6.0',
        'version',
        '--json',
        '--fetch-retries=1',
        '--fetch-timeout=30000',
      ]);
      return {status: 0, stdout: '["0.6.3","0.6.8"]', stderr: ''};
    };
    expect(resolvePublishedVersion('@astryxdesign/core', '^0.6.0', {run})).toBe(
      '0.6.8',
    );
  });

  it('is null when npm fails or answers nothing usable', () => {
    expect(
      resolvePublishedVersion('@astryxdesign/cli', 'latest', {
        run: () => ({status: 1, stdout: '', stderr: ''}),
      }),
    ).toBeNull();
    expect(
      resolvePublishedVersion('@astryxdesign/cli', 'latest', {
        run: () => ({status: 0, stdout: '""', stderr: ''}),
      }),
    ).toBeNull();
  });
});

describe('tryLock', () => {
  it('takes a free lock once, keeps a live holder, and reclaims a stale one', () => {
    const dir = path.join(tempDir('lock'), '.lock-x');
    expect(tryLock(dir)).toBe(true);
    expect(tryLock(dir)).toBe(false);
    // A live holder on this computer keeps its lock, however long it takes.
    const slow = new Date(Date.now() - 25 * 60_000);
    fs.utimesSync(dir, slow, slow);
    expect(tryLock(dir)).toBe(false);
    // Past the hard bound, even a live holder's lock is reclaimed.
    const old = new Date(Date.now() - 31 * 60_000);
    fs.utimesSync(dir, old, old);
    expect(tryLock(dir)).toBe(true);
  });

  it('reclaims a lock with no owner record after a few seconds', () => {
    const dir = path.join(tempDir('lock'), '.lock-y');
    fs.mkdirSync(dir, {recursive: true});
    expect(tryLock(dir)).toBe(false);
    const old = new Date(Date.now() - 11_000);
    fs.utimesSync(dir, old, old);
    expect(tryLock(dir)).toBe(true);
  });
});

describe('a slow install', () => {
  it('ends in a timeout reason, never a stopped run, when npm hits the time limit', () => {
    const cacheDir = tempDir('cache');
    /** @type {import('./cache.mjs').runNpm} */
    const run = () => ({
      status: null,
      signal: 'SIGTERM',
      stdout: '',
      stderr: '',
      error: Object.assign(new Error('spawnSync npm ETIMEDOUT'), {
        code: 'ETIMEDOUT',
      }),
    });
    const result = ensureRelease('0.6.8', {cacheDir, run});
    expect('reason' in result && result.reason).toMatch(
      /did not finish within 15 minutes/,
    );
    expect('signal' in result && result.signal).toBeFalsy();
  });

  it('tells the caller once when it installs and once when it waits', () => {
    const cacheDir = tempDir('cache');
    /** @type {string[]} */
    const events = [];
    ensureRelease('0.6.8', {
      cacheDir,
      run: fakeNpm().run,
      onProgress: (e, v) => events.push(`${e} ${v}`),
    });
    expect(events).toEqual(['install 0.6.8']);
    const other = tempDir('cache');
    const lock = path.join(releasesDir(other), '.lock-0.6.8');
    fs.mkdirSync(lock, {recursive: true});
    fs.writeFileSync(
      path.join(lock, 'owner.json'),
      JSON.stringify({pid: process.pid, host: os.hostname()}),
    );
    events.length = 0;
    ensureRelease('0.6.8', {
      cacheDir: other,
      run: fakeNpm().run,
      waitMs: 500,
      onProgress: (e, v) => events.push(`${e} ${v}`),
    });
    expect(events).toEqual(['wait 0.6.8']);
  });
});

describe('a damaged library file', () => {
  it('is caught by the size record and replaced', () => {
    const cacheDir = tempDir('cache');
    const npm = fakeNpm();
    ensureRelease('0.6.8', {cacheDir, run: npm.run});
    const cli = path.join(
      releasesDir(cacheDir),
      '0.6.8',
      'node_modules',
      '@astryxdesign',
      'cli',
    );
    fs.writeFileSync(path.join(cli, 'extra-module.mjs'), 'export {};\n');
    forgetVerifiedReleases();
    expect(cachedRelease('0.6.8', cacheDir)).toBeNull();
    expect('bin' in ensureRelease('0.6.8', {cacheDir, run: npm.run})).toBe(
      true,
    );
    expect(npm.calls).toHaveLength(2);
  });
});

describe('stopped and damaged installs heal', () => {
  it('takes over a lock whose holder has gone, and clears its scratch folder', () => {
    const cacheDir = tempDir('cache');
    const root = releasesDir(cacheDir);
    const lock = path.join(root, '.lock-0.6.8');
    fs.mkdirSync(lock, {recursive: true});
    // A process id no run has: the holder was killed.
    fs.writeFileSync(
      path.join(lock, 'owner.json'),
      JSON.stringify({pid: 2 ** 22 + 7, host: os.hostname()}),
    );
    fs.mkdirSync(path.join(root, '.tmp-0.6.8-999-abc'), {recursive: true});
    const started = Date.now();
    const result = ensureRelease('0.6.8', {
      cacheDir,
      run: fakeNpm().run,
      waitMs: 60_000,
    });
    expect('bin' in result).toBe(true);
    expect(Date.now() - started).toBeLessThan(10_000);
    expect(fs.readdirSync(root).filter(n => n.startsWith('.'))).toEqual([]);
  });

  it('waits for a holder that is still running', () => {
    const cacheDir = tempDir('cache');
    const lock = path.join(releasesDir(cacheDir), '.lock-0.6.8');
    fs.mkdirSync(lock, {recursive: true});
    fs.writeFileSync(
      path.join(lock, 'owner.json'),
      JSON.stringify({pid: process.pid, host: os.hostname()}),
    );
    const result = ensureRelease('0.6.8', {
      cacheDir,
      run: fakeNpm().run,
      waitMs: 300,
    });
    expect('reason' in result && result.reason).toMatch(/still installing/);
  });

  it('replaces a release whose marker, Core, or entry file is damaged', () => {
    /** @type {Array<(dir: string) => void>} */
    const damage = [
      dir =>
        fs.writeFileSync(path.join(dir, 'release.json'), '{"version": "0.6'),
      dir =>
        fs.rmSync(path.join(dir, 'node_modules', '@astryxdesign', 'core'), {
          recursive: true,
        }),
      dir =>
        fs.writeFileSync(
          path.join(dir, 'node_modules', '@astryxdesign', 'cli', 'bin.cjs'),
          '#!/usr/bin/env node\n',
        ),
    ];
    for (const harm of damage) {
      const cacheDir = tempDir('cache');
      const npm = fakeNpm();
      const first = ensureRelease('0.6.8', {cacheDir, run: npm.run});
      expect('bin' in first).toBe(true);
      harm(path.join(releasesDir(cacheDir), '0.6.8'));
      forgetVerifiedReleases();
      expect(cachedRelease('0.6.8', cacheDir)).toBeNull();
      const healed = ensureRelease('0.6.8', {cacheDir, run: npm.run});
      expect('bin' in healed && healed.version).toBe('0.6.8');
      expect(npm.calls).toHaveLength(2);
      expect(cachedRelease('0.6.8', cacheDir)).not.toBeNull();
    }
  });

  it('says the cache cannot be written instead of throwing', () => {
    const parent = tempDir('ro');
    const cacheDir = path.join(parent, 'cache');
    // A file where the cache folder should be: no folder can be made there.
    fs.writeFileSync(cacheDir, '');
    const result = ensureRelease('0.6.8', {cacheDir, run: fakeNpm().run});
    expect('reason' in result && result.reason).toMatch(/cannot be written/);
  });
});

describe('runNpm time limit', () => {
  it('ends a package manager that ignores SIGTERM, leaving no process behind', () => {
    const marker = tempDir('npm-pid');
    const pidFile = path.join(marker, 'pid');
    const result = runNpm([], {
      timeoutMs: 500,
      npm: {
        command: process.execPath,
        prefix: [
          '-e',
          `require('node:fs').writeFileSync(${JSON.stringify(pidFile)}, String(process.pid)); process.on('SIGTERM', () => {}); setTimeout(() => {}, 60000);`,
        ],
        shell: false,
      },
    });
    expect(/** @type {any} */ (result.error)?.code).toBe('ETIMEDOUT');
    const pid = Number(fs.readFileSync(pidFile, 'utf-8'));
    expect(() => process.kill(pid, 0)).toThrow();
  });
});

describe('no install outlives its run', () => {
  /** @param {number} pid */
  const alive = pid => {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  };
  /** @param {() => boolean} done @param {number} ms */
  const waitFor = async (done, ms) => {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      if (done()) return true;
      await new Promise(r => setTimeout(r, 100));
    }
    return done();
  };

  it('ends npm when the run that started it is killed outright', async () => {
    const dir = tempDir('orphan');
    const pidFile = path.join(dir, 'npm-pid');
    const cacheModule = new URL('./cache.mjs', import.meta.url).href;
    const sleeper = `require('node:fs').writeFileSync(${JSON.stringify(pidFile)}, String(process.pid)); setTimeout(() => {}, 120000);`;
    const script = `import(${JSON.stringify(cacheModule)}).then(m => m.runNpm([], {timeoutMs: 120000, npm: {command: process.execPath, prefix: ['-e', ${JSON.stringify(sleeper)}], shell: false}}));`;
    const cli = spawn(process.execPath, ['-e', script], {stdio: 'ignore'});
    expect(await waitFor(() => fs.existsSync(pidFile), 10_000)).toBe(true);
    const npmPid = Number(fs.readFileSync(pidFile, 'utf-8'));
    expect(alive(npmPid)).toBe(true);
    cli.kill('SIGKILL');
    expect(await waitFor(() => !alive(npmPid), 5_000)).toBe(true);
  }, 30_000);

  it('ends npm, which ignores Ctrl-C, when the run gets Ctrl-C', async () => {
    const dir = tempDir('ctrlc');
    const pidFile = path.join(dir, 'npm-pid');
    const cacheModule = new URL('./cache.mjs', import.meta.url).href;
    const sleeper = `require('node:fs').writeFileSync(${JSON.stringify(pidFile)}, String(process.pid)); process.on('SIGINT', () => {}); setTimeout(() => {}, 120000);`;
    const script = `import(${JSON.stringify(cacheModule)}).then(m => m.runNpm([], {timeoutMs: 120000, npm: {command: process.execPath, prefix: ['-e', ${JSON.stringify(sleeper)}], shell: false}}));`;
    // Its own group, as a terminal's foreground job: Ctrl-C reaches the group.
    const cli = spawn(process.execPath, ['-e', script], {
      stdio: 'ignore',
      detached: true,
    });
    expect(await waitFor(() => fs.existsSync(pidFile), 10_000)).toBe(true);
    const npmPid = Number(fs.readFileSync(pidFile, 'utf-8'));
    const exited = new Promise(resolve => cli.on('exit', resolve));
    process.kill(-(/** @type {number} */ (cli.pid)), 'SIGINT');
    expect(await waitFor(() => !alive(npmPid), 5_000)).toBe(true);
    await exited;
  }, 30_000);

  it("a run that takes over a dead run's lock ends the install it recorded", async () => {
    const cacheDir = tempDir('cache');
    const lock = path.join(releasesDir(cacheDir), '.lock-0.6.8');
    fs.mkdirSync(lock, {recursive: true});
    // An install left running by a run that was killed: its own group, and
    // `npm` in its command line.
    const leftover = spawn(
      process.execPath,
      ['-e', 'setTimeout(() => {}, 120000)', 'npm-install'],
      {
        detached: true,
        stdio: 'ignore',
      },
    );
    leftover.unref();
    fs.writeFileSync(
      path.join(lock, 'owner.json'),
      JSON.stringify({pid: 2 ** 22 + 7, host: os.hostname()}),
    );
    fs.writeFileSync(path.join(lock, 'npm.pid'), String(leftover.pid));
    expect(alive(/** @type {number} */ (leftover.pid))).toBe(true);
    const result = ensureRelease('0.6.8', {cacheDir, run: fakeNpm().run});
    expect('bin' in result).toBe(true);
    expect(
      await waitFor(() => !alive(/** @type {number} */ (leftover.pid)), 5_000),
    ).toBe(true);
  }, 30_000);
});
