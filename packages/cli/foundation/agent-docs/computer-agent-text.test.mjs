// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The computer-level agent text (spec AST-081 FR7, FR8): its rendering
 * from the project block's source, the two files it writes and removes, the
 * files it keeps, the search-path check behind its warning, and the rule that
 * only `init --user` writes it. Every test uses a temporary home folder.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  astryxOnSearchPath,
  computerAgentTextPaths,
  inspectComputerAgentText,
  removeComputerAgentText,
  renderComputerAgentText,
  writeComputerAgentText,
} from './computer-agent-text.mjs';
import {generateCompressedIndex, parseBlockVersion} from './agent-docs.mjs';
import {MARKER_END, MARKER_START} from './agent-doc-state.mjs';
import {runWithCliDoor} from '../env/cli-command.mjs';
import {runCli} from '../../test-utils/run-cli.mjs';
import {parse as parseYaml} from 'yaml';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CLI_ROOT = path.resolve(HERE, '../..');
const CORE_ROOT = path.resolve(CLI_ROOT, '../core');

/** @type {string[]} */
const dirs = [];
/** @param {string} label */
function tmp(label) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `astryx-user-${label}-`));
  dirs.push(dir);
  return dir;
}

let home = '';
beforeEach(() => {
  home = tmp('home');
  vi.stubEnv('HOME', home);
  vi.stubEnv('USERPROFILE', home);
});
afterEach(() => {
  vi.unstubAllEnvs();
  while (dirs.length) {
    fs.rmSync(/** @type {string} */ (dirs.pop()), {
      recursive: true,
      force: true,
    });
  }
});

const SKILLS = [
  path.join('.agents', 'skills', 'astryx', 'SKILL.md'),
  path.join('.claude', 'skills', 'astryx', 'SKILL.md'),
];

describe('generateCompressedIndex scope', () => {
  const integrations = [{package: 'acme-kit', append: ['Use AcmeButton.']}];

  it('computer: no version, no count, no integrations, the CSS line, and the lead line', () => {
    const text = generateCompressedIndex('9.9.9', {
      scope: 'computer',
      invocation: 'astryx',
      stylingSystem: 'stylex',
      agentDocs: integrations,
    });
    expect(text.startsWith(MARKER_START)).toBe(true);
    expect(text.endsWith(MARKER_END)).toBe(true);
    expect(parseBlockVersion(text)).toBeNull();
    expect(text).not.toContain('9.9.9');
    expect(text).not.toMatch(/\d+\+? components/);
    expect(text).not.toContain('INTEGRATIONS');
    expect(text).not.toContain('acme-kit');
    expect(text).toContain('No StyleX/Tailwind compiler here');
    expect(text).not.toContain('xstyle prop / StyleX tokens');
    expect(text.split('\n')[2]).toMatch(
      /^Inside a project with its own Astryx agent docs .*follow those instead: they match that project's release\.$/,
    );
  });

  it('project and computer differ only in the wrapper', () => {
    const project = generateCompressedIndex('1.2.3', {invocation: 'astryx'});
    const computer = generateCompressedIndex(null, {
      scope: 'computer',
      invocation: 'astryx',
    });
    const from = (/** @type {string} */ text) =>
      text.slice(text.indexOf('CLI: run every command'));
    expect(from(computer)).toBe(from(project));
    expect(parseBlockVersion(project)).toBe('1.2.3');
  });
});

describe('renderComputerAgentText', () => {
  it('is a skill named astryx with a when-to-use description, then the computer body', () => {
    const text = renderComputerAgentText({command: 'astryx'});
    const lines = text.split('\n');
    expect(lines[0]).toBe('---');
    expect(lines[1]).toBe('name: astryx');
    expect(lines[2]).toMatch(/^description: .*Use when /);
    expect(lines[3]).toBe('---');
    // Strict YAML: an agent tool with a strict parser drops a skill whose
    // frontmatter does not parse.
    const front = parseYaml(lines.slice(1, 3).join('\n'), {
      strict: true,
      uniqueKeys: true,
    });
    expect(front).toEqual({
      name: 'astryx',
      description: expect.stringContaining('Use when'),
    });
    expect(front.description).toContain(': ');
    expect(text).toContain(
      generateCompressedIndex(null, {scope: 'computer', invocation: 'astryx'}),
    );
    expect(text).toContain('run every command as `astryx <cmd>`');
  });

  it("uses the host's door when one is set", () => {
    const text = runWithCliDoor('acme astryx', () => renderComputerAgentText());
    expect(text).toContain('run every command as `acme astryx <cmd>`');
  });
});

describe('write, refresh, keep, remove', () => {
  it('writes both files, creating their folders, then reports them unchanged', () => {
    const first = writeComputerAgentText({home, command: 'astryx'});
    expect(first).toEqual(
      SKILLS.map(rel => ({path: path.join(home, rel), action: 'written'})),
    );
    for (const rel of SKILLS) {
      expect(fs.readFileSync(path.join(home, rel), 'utf8')).toBe(
        renderComputerAgentText({command: 'astryx'}),
      );
    }
    expect(
      writeComputerAgentText({home, command: 'astryx'}).map(f => f.action),
    ).toEqual(['unchanged', 'unchanged']);
    expect(
      inspectComputerAgentText({home, command: 'astryx'}).map(f => f.state),
    ).toEqual(['current', 'current']);
  });

  it('refreshes an Astryx file whose text differs', () => {
    writeComputerAgentText({home, command: 'astryx'});
    const file = path.join(home, SKILLS[1]);
    fs.writeFileSync(
      file,
      `---\nname: astryx\n---\n${MARKER_START}\nold\n${MARKER_END}\n`,
    );
    expect(
      inspectComputerAgentText({home, command: 'astryx'}).map(f => f.state),
    ).toEqual(['current', 'differs']);
    expect(
      writeComputerAgentText({home, command: 'astryx'}).map(f => f.action),
    ).toEqual(['unchanged', 'written']);
    expect(fs.readFileSync(file, 'utf8')).toBe(
      renderComputerAgentText({command: 'astryx'}),
    );
  });

  it('keeps a file without the Astryx markers, on write and on remove', () => {
    const file = path.join(home, SKILLS[0]);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, '---\nname: astryx\n---\nmy own notes\n');
    expect(
      writeComputerAgentText({home, command: 'astryx'}).map(f => f.action),
    ).toEqual(['kept', 'written']);
    expect(fs.readFileSync(file, 'utf8')).toBe(
      '---\nname: astryx\n---\nmy own notes\n',
    );
    expect(removeComputerAgentText({home}).map(f => f.action)).toEqual([
      'kept',
      'removed',
    ]);
    expect(fs.existsSync(file)).toBe(true);
  });

  it.skipIf(process.platform === 'win32')(
    'never follows a symlinked file, even one that points at an Astryx file',
    () => {
      const elsewhere = path.join(tmp('elsewhere'), 'SKILL.md');
      const ours = renderComputerAgentText({command: 'astryx'}).replace(
        'RULES',
        'OLD',
      );
      fs.writeFileSync(elsewhere, ours);
      const file = path.join(home, SKILLS[1]);
      fs.mkdirSync(path.dirname(file), {recursive: true});
      fs.symlinkSync(elsewhere, file);
      expect(
        writeComputerAgentText({home, command: 'astryx'}).map(f => f.action),
      ).toEqual(['written', 'kept']);
      expect(fs.readFileSync(elsewhere, 'utf8')).toBe(ours);
      expect(removeComputerAgentText({home}).map(f => f.action)).toEqual([
        'removed',
        'kept',
      ]);
      expect(fs.lstatSync(file).isSymbolicLink()).toBe(true);
      expect(fs.readFileSync(elsewhere, 'utf8')).toBe(ours);
    },
  );

  it('removes both files and their emptied folders; then reports them absent', () => {
    writeComputerAgentText({home, command: 'astryx'});
    expect(removeComputerAgentText({home}).map(f => f.action)).toEqual([
      'removed',
      'removed',
    ]);
    for (const rel of SKILLS) {
      expect(fs.existsSync(path.dirname(path.join(home, rel)))).toBe(false);
    }
    expect(removeComputerAgentText({home}).map(f => f.action)).toEqual([
      'absent',
      'absent',
    ]);
  });

  it('keeps a skill folder that holds other files', () => {
    writeComputerAgentText({home, command: 'astryx'});
    const extra = path.join(home, '.claude', 'skills', 'astryx', 'notes.md');
    fs.writeFileSync(extra, 'mine');
    removeComputerAgentText({home});
    expect(fs.readFileSync(extra, 'utf8')).toBe('mine');
  });

  it('names exactly the two files in the home folder', () => {
    expect(computerAgentTextPaths(home)).toEqual(
      SKILLS.map(rel => path.join(home, rel)),
    );
  });
});

describe.skipIf(process.platform === 'win32')('astryxOnSearchPath', () => {
  /** @param {string} file @param {string} content */
  function executable(file, content) {
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, content);
    fs.chmodSync(file, 0o755);
  }

  /** A global prefix with the CLI package linked into its bin folder. */
  function linkedCli() {
    const prefix = tmp('prefix');
    const pkg = path.join(
      prefix,
      'lib',
      'node_modules',
      '@astryxdesign',
      'cli',
    );
    fs.mkdirSync(pkg, {recursive: true});
    fs.writeFileSync(
      path.join(pkg, 'package.json'),
      '{"name":"@astryxdesign/cli","version":"0.0.0"}',
    );
    executable(path.join(pkg, 'bin.mjs'), '#!/usr/bin/env node\n');
    fs.mkdirSync(path.join(prefix, 'bin'));
    fs.symlinkSync(
      path.join(pkg, 'bin.mjs'),
      path.join(prefix, 'bin', 'astryx'),
    );
    return path.join(prefix, 'bin');
  }

  it('finds a linked CLI', () => {
    expect(
      astryxOnSearchPath({searchPath: linkedCli(), platform: 'linux'}),
    ).toBe(true);
  });

  it("finds a package manager's shim that starts the CLI", () => {
    const bin = tmp('shim');
    executable(
      path.join(bin, 'astryx'),
      '#!/bin/sh\nexec node "$basedir/global/5/node_modules/@astryxdesign/cli/clients/cli/bin/astryx.mjs" "$@"\n',
    );
    expect(astryxOnSearchPath({searchPath: bin, platform: 'linux'})).toBe(true);
  });

  it('is false with no astryx, or when the first astryx is another program', () => {
    expect(
      astryxOnSearchPath({searchPath: tmp('empty'), platform: 'linux'}),
    ).toBe(false);
    const other = tmp('other');
    executable(path.join(other, 'astryx'), '#!/bin/sh\necho other\n');
    expect(
      astryxOnSearchPath({
        searchPath: [other, linkedCli()].join(path.delimiter),
        platform: 'linux',
      }),
    ).toBe(false);
  });

  it('skips a file that cannot run', () => {
    const bin = tmp('noexec');
    fs.writeFileSync(path.join(bin, 'astryx'), 'not a program');
    expect(
      astryxOnSearchPath({
        searchPath: [bin, linkedCli()].join(path.delimiter),
        platform: 'linux',
      }),
    ).toBe(true);
  });
});

describe('only `init --user` writes the computer-level text (FR7)', () => {
  /** @returns {string[]} the skill files present in the temp home */
  const present = () =>
    SKILLS.filter(rel => fs.existsSync(path.join(home, rel)));

  /** A project that installs this release's Core. */
  function project() {
    const dir = tmp('project');
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({
        name: 'app',
        private: true,
        dependencies: {'@astryxdesign/core': '*'},
      }),
    );
    fs.mkdirSync(path.join(dir, 'node_modules', '@astryxdesign'), {
      recursive: true,
    });
    fs.symlinkSync(
      CORE_ROOT,
      path.join(dir, 'node_modules', '@astryxdesign', 'core'),
      'dir',
    );
    return dir;
  }

  it('no source outside init --user imports the write or remove functions', () => {
    /** @type {string[]} */
    const importers = [];
    /** @param {string} dir */
    const walk = dir => {
      for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.'))
          continue;
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(file);
        else if (
          /\.m?[jt]s$/.test(entry.name) &&
          !/\.test\.m?[jt]s$/.test(entry.name)
        ) {
          const text = fs.readFileSync(file, 'utf8');
          if (
            /\b(writeComputerAgentText|removeComputerAgentText)\b/.test(text)
          ) {
            importers.push(path.relative(CLI_ROOT, file));
          }
        }
      }
    };
    for (const top of [
      'api',
      'clients',
      'foundation',
      'scripts',
      'authoring',
    ]) {
      walk(path.join(CLI_ROOT, top));
    }
    expect(importers.sort()).toEqual(
      [
        path.join('api', 'init', 'user', 'user.mjs'),
        path.join('foundation', 'agent-docs', 'computer-agent-text.mjs'),
      ].sort(),
    );
  });

  it('install (postinstall), project init, and upgrade write none of it', async () => {
    const dir = project();
    const postinstall = spawnSync(
      process.execPath,
      [path.join(CLI_ROOT, 'scripts', 'postinstall.mjs')],
      {
        env: {...process.env, HOME: home, USERPROFILE: home, INIT_CWD: dir},
        encoding: 'utf8',
      },
    );
    expect(postinstall.status).toBe(0);
    expect((await runCli(['--json', 'init'], dir)).status).toBe(0);
    expect((await runCli(['--json', 'init', '--all'], dir)).status).toBe(0);
    await runCli(['--json', 'upgrade'], dir);
    await runCli(['--json', 'init'], tmp('outside'));
    expect(present()).toEqual([]);
    expect(fs.existsSync(path.join(home, '.agents'))).toBe(false);
    expect(fs.existsSync(path.join(home, '.claude'))).toBe(false);
  }, 60_000);
});
