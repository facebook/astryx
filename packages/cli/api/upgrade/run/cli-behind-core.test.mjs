// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Core codemods ship inside the CLI, so a CLI older than the installed
 * Core has none for the releases after its own version. Every result past the
 * up-to-date exit says so in `cliBehindCore`, with the same upgrade pinned to
 * the CLI release that matches the Core; a CLI that covers the range returns
 * what it always did. The pinned command changes to the folder the run used
 * and names the directory it scanned as an absolute path, so a POSIX shell
 * runs it there, with every argument unchanged, wherever it is pasted.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {execFileSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {upgrade} from '../upgrade.mjs';
import {CLI_ROOT} from '../../../foundation/fs/paths.mjs';
import {
  commandInFolder,
  getDlxPrefix,
  quoteCommandArgument,
} from '../../../foundation/env/package-manager.mjs';

const SLOW = 30_000;

const CLI_VERSION = JSON.parse(
  fs.readFileSync(path.join(CLI_ROOT, 'package.json'), 'utf8'),
).version;
const [MAJOR, MINOR] = CLI_VERSION.split('.').map(Number);
/** A Core release after this CLI: it has no codemods for it. */
const NEWER_CORE = `${MAJOR}.${MINOR + 1}.0`;

/** A source file a 0.7.0 codemod rewrites (`emptySearchResultsText`). */
const TYPEAHEAD_SOURCE =
  "import {Typeahead} from '@astryxdesign/core';\n" +
  'export const x = <Typeahead emptySearchResultsText="None" />;\n';

let dir;

/** @param {string} version @param {string} [packageName] */
function installCore(version, packageName = '@astryxdesign/core') {
  const core = path.join(dir, 'node_modules', ...packageName.split('/'));
  fs.mkdirSync(core, {recursive: true});
  fs.writeFileSync(
    path.join(core, 'package.json'),
    JSON.stringify({name: packageName, version}),
  );
}

/** @param {string} rel @param {string} body */
function write(rel, body) {
  const file = path.join(dir, rel);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, body);
}

/**
 * The pinned command for this project, as the CLI prints it.
 * @param {...string} args the arguments after `upgrade`
 */
function pinned(...args) {
  return commandInFolder(
    dir,
    [
      getDlxPrefix(dir),
      `@astryxdesign/cli@${NEWER_CORE}`,
      'upgrade',
      ...args.map(arg => quoteCommandArgument(arg)),
    ].join(' '),
  );
}

/**
 * Stand-ins for the package runners: each prints the folder it runs in and the
 * arguments the shell passed.
 */
const RUNNERS = ['npx', 'pnpm', 'yarn', 'bunx']
  .map(
    name =>
      `${name}() { "$0" -e 'process.stdout.write(JSON.stringify({cwd: process.cwd(), argv: process.argv.slice(1)}))' -- "$@"; }`,
  )
  .join('; ');

/**
 * What a POSIX shell runs for `command` pasted in `cwd`: the folder the
 * package runner ran in, and its arguments from the pinned CLI package on.
 * @param {string} command
 * @param {string} cwd the folder the command is pasted in
 * @returns {{cwd: string, args: string[]}}
 */
function runInShell(command, cwd) {
  const ran = JSON.parse(
    execFileSync(
      '/bin/sh',
      ['-c', `${RUNNERS}; ${command}`, process.execPath],
      {
        cwd,
        encoding: 'utf8',
      },
    ),
  );
  return {
    cwd: ran.cwd,
    args: ran.argv.slice(ran.argv.indexOf(`@astryxdesign/cli@${NEWER_CORE}`)),
  };
}

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'upg-cli-behind-'));
  write('package.json', JSON.stringify({name: 'consumer', version: '1.0.0'}));
  write('src/index.tsx', TYPEAHEAD_SOURCE);
});

afterEach(() => fs.rmSync(dir, {recursive: true, force: true}));

describe('a CLI older than the installed Core', {timeout: SLOW}, () => {
  // The defect: the range past this CLI has no codemods here, so the run
  // reported `no_codemods` (and "already up to date") and exited 0, while the
  // project still needed the newer releases' migrations.
  it('marks a range this CLI has no codemods for, and names the CLI that does', async () => {
    installCore(NEWER_CORE);

    const res = await upgrade({from: CLI_VERSION, apply: true}, {cwd: dir});

    expect(res.type).toBe('upgrade.status');
    expect(res.data.status).toBe('no_codemods');
    expect(res.data.cliBehindCore).toEqual({
      cliVersion: CLI_VERSION,
      command: pinned(
        '--from',
        CLI_VERSION,
        '--path',
        path.join(dir, 'src'),
        '--apply',
      ),
    });
  });

  it('runs the codemods it has for a range it covers only in part, and marks the rest', async () => {
    installCore(NEWER_CORE);

    const res = await upgrade({from: '0.6.8', apply: true}, {cwd: dir});

    expect(res.type).toBe('upgrade.run');
    expect(res.data.codemods).toBeGreaterThan(0);
    expect(fs.readFileSync(path.join(dir, 'src/index.tsx'), 'utf8')).toContain(
      'emptySearchText="None"',
    );
    expect(res.data.cliBehindCore).toEqual({
      cliVersion: CLI_VERSION,
      command: pinned(
        '--from',
        '0.6.8',
        '--path',
        path.join(dir, 'src'),
        '--apply',
      ),
    });
  });

  it('repeats the invocation in the pinned command', async () => {
    installCore(NEWER_CORE);
    write('my src/index.tsx', TYPEAHEAD_SOURCE);

    const res = await upgrade(
      {
        from: CLI_VERSION,
        path: 'my src',
        codemod: 'only-this',
        skipCodemod: ['first', 'second'],
        force: true,
      },
      {cwd: dir},
    );

    expect(res.data.cliBehindCore?.command).toBe(
      pinned(
        '--from',
        CLI_VERSION,
        '--path',
        path.join(dir, 'my src'),
        '--codemod',
        'only-this',
        '--skip-codemod',
        'first',
        '--skip-codemod',
        'second',
        '--force',
      ),
    );
  });

  // Where an upgrade runs decides what it finds: the installed Core is read
  // from that folder, and --path must stay inside it. The command printed
  // without a folder failed when pasted anywhere else: ERR_PATH_TRAVERSAL from
  // a subfolder, ERR_VERSION_DETECT from a parent. A package runner can also
  // move the run: Yarn 1 runs `yarn astryx` at the project root.
  it('changes to the folder the run used and names the directory it scanned as an absolute path', async () => {
    installCore(NEWER_CORE);
    write('app/index.tsx', TYPEAHEAD_SOURCE);
    const project = fs.realpathSync(dir);

    for (const [given, scanned] of [
      [undefined, path.join(dir, 'src')],
      ['.', dir],
      ['app', path.join(dir, 'app')],
      ['./app/', path.join(dir, 'app')],
    ]) {
      const res = await upgrade(
        {from: CLI_VERSION, ...(given ? {path: given} : {})},
        {cwd: dir},
      );
      const command = /** @type {string} */ (res.data.cliBehindCore?.command);

      expect(command).toBe(pinned('--from', CLI_VERSION, '--path', scanned));
      if (process.platform !== 'win32') {
        for (const pastedIn of [
          path.join(dir, 'app'),
          path.dirname(dir),
          path.parse(dir).root,
        ]) {
          const ran = runInShell(command, pastedIn);
          expect(ran.cwd).toBe(project);
          expect(ran.args[ran.args.indexOf('--path') + 1]).toBe(scanned);
        }
      }
    }
  });

  it.skipIf(process.platform === 'win32')(
    'quotes the command so a POSIX shell enters the folder and passes every argument unchanged',
    async () => {
      fs.rmSync(dir, {recursive: true, force: true});
      dir = fs.mkdtempSync(
        path.join(os.tmpdir(), 'upg cost $5 `date` \'one\' "two" !x -'),
      );
      write(
        'package.json',
        JSON.stringify({name: 'consumer', version: '1.0.0'}),
      );
      write('src/index.tsx', TYPEAHEAD_SOURCE);
      installCore(NEWER_CORE);

      const res = await upgrade(
        {
          from: CLI_VERSION,
          skipCodemod: ["it's", 'a$b c'],
          apply: true,
        },
        {cwd: dir},
      );

      const ran = runInShell(
        /** @type {string} */ (res.data.cliBehindCore?.command),
        path.dirname(dir),
      );

      expect(ran.cwd).toBe(fs.realpathSync(dir));
      expect(ran.args).toEqual([
        `@astryxdesign/cli@${NEWER_CORE}`,
        'upgrade',
        '--from',
        CLI_VERSION,
        '--path',
        path.join(dir, 'src'),
        '--skip-codemod',
        "it's",
        '--skip-codemod',
        'a$b c',
        '--apply',
      ]);
    },
  );
});

describe('a CLI that covers the range', {timeout: SLOW}, () => {
  it('adds nothing when the installed Core is this CLI release', async () => {
    installCore(CLI_VERSION);

    const res = await upgrade({from: '0.6.8'}, {cwd: dir});

    expect(res.type).toBe('upgrade.run');
    expect('cliBehindCore' in res.data).toBe(false);
  });

  it('adds nothing when --from is already the installed Core', async () => {
    installCore(NEWER_CORE);

    const res = await upgrade({from: NEWER_CORE}, {cwd: dir});

    expect(res.data.status).toBe('up_to_date');
    expect('cliBehindCore' in res.data).toBe(false);

    const forced = await upgrade({from: NEWER_CORE, force: true}, {cwd: dir});

    expect(forced.data.status).toBe('no_codemods');
    expect('cliBehindCore' in forced.data).toBe(false);
  });

  it('adds nothing for legacy @xds/core, which shares no version with a CLI release', async () => {
    installCore(NEWER_CORE, '@xds/core');

    const res = await upgrade({from: CLI_VERSION}, {cwd: dir});

    expect(res.data.status).toBe('no_codemods');
    expect('cliBehindCore' in res.data).toBe(false);
  });
});
