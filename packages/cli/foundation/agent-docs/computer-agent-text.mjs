// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The computer-level agent text (spec AST-081 FR8): one skill file,
 * written to the two folders coding agents read skills from in the home
 * folder, so an agent working anywhere on the computer knows how to use
 * Astryx.
 *
 * - `~/.agents/skills/astryx/SKILL.md`
 * - `~/.claude/skills/astryx/SKILL.md`
 *
 * The body comes from the same source as a project's agent-docs block
 * (`generateCompressedIndex`, scope `computer`): no version, no component
 * count, no integrations, and a lead line that defers to a project's own agent
 * docs. It keeps the Astryx markers, which is how a file Astryx wrote is told
 * apart from one a person wrote: a file without them is never changed, and a
 * symlinked file is never followed.
 *
 * Only `astryx init --user` writes or removes these files (FR7). This module
 * is deliberately separate from the project agent-docs root resolution: it
 * names two fixed files in the home folder and nothing else.
 *
 * @input  the home folder, the running release, the host's door (if any)
 * @output the rendered text, its state on disk, and the write/remove receipt rows
 * @position foundation/agent-docs — read by `init --user` and by `doctor`
 *   outside a project.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {cliDoor} from '../env/cli-command.mjs';
import {generateCompressedIndex} from './agent-docs.mjs';
import {MARKER_START, MARKER_END} from './agent-doc-state.mjs';

/** The command the computer-level text uses when no host door is set. */
export const COMPUTER_COMMAND = 'astryx';

/** The install step for the CLI copy the computer-level text relies on. */
export const COMPUTER_INSTALL_STEP = 'npm i -g @astryxdesign/cli';

/** The CLI package whose bin the text's command must reach. */
const CLI_PACKAGE = '@astryxdesign/cli';

/**
 * The skill folders, relative to the home folder, in the order they are
 * written and reported.
 * @type {readonly string[]}
 */
const SKILL_FILES = Object.freeze([
  path.join('.agents', 'skills', 'astryx', 'SKILL.md'),
  path.join('.claude', 'skills', 'astryx', 'SKILL.md'),
]);

/**
 * When an agent should load the skill; the frontmatter `description`.
 */
const SKILL_DESCRIPTION =
  'Build and change UI with the Astryx design system: components, page templates, blocks, themes, and tokens from @astryxdesign packages. ' +
  'Use when a task mentions Astryx or @astryxdesign, or builds UI in a project that uses them.';

/**
 * The absolute paths of the computer-level agent text.
 * @param {string} [home] the home folder; defaults to the current user's
 * @returns {string[]}
 */
/**
 * A home-folder path as a person reads it: `~/.claude/skills/astryx/SKILL.md`.
 * @param {string} file
 * @param {string} [home]
 * @returns {string}
 */
export function displayHomePath(file, home = os.homedir()) {
  const rel = path.relative(home, file);
  return rel && !rel.startsWith('..') && !path.isAbsolute(rel)
    ? `~${path.sep}${rel}`
    : file;
}

/**
 * The computer-level text's files.
 */
export function computerAgentTextPaths(home = os.homedir()) {
  return SKILL_FILES.map(rel => path.join(home, rel));
}

/**
 * The command the computer-level text tells agents to run: the host's door
 * when one started this run, else `astryx`. An integration's `cliCommand`
 * never applies: no project, so no integration, is in scope.
 * @returns {string}
 */
export function computerAgentCommand() {
  return cliDoor() ?? COMPUTER_COMMAND;
}

/**
 * The full skill file this release writes.
 * @param {{command?: string}} [options]
 * @returns {string}
 */
export function renderComputerAgentText({
  command = computerAgentCommand(),
} = {}) {
  const body = generateCompressedIndex(null, {
    scope: 'computer',
    invocation: command,
  });
  return [
    '---',
    'name: astryx',
    // Quoted: the description holds `: `, which strict YAML parsers read as a
    // second mapping, and an agent tool with one drops the whole skill.
    `description: ${JSON.stringify(SKILL_DESCRIPTION)}`,
    '---',
    '',
    body,
    '',
  ].join('\n');
}

/**
 * What is at one path of the computer-level text.
 * - `absent`: nothing there.
 * - `current`: an Astryx file with exactly this release's rendering.
 * - `differs`: an Astryx file (it has the markers) with other content.
 * - `foreign`: a file without the Astryx markers, a symlink, or something
 *   other than a regular file. Never changed.
 * @typedef {'absent' | 'current' | 'differs' | 'foreign'} ComputerAgentTextState
 */

/**
 * @param {string} content
 * @returns {boolean}
 */
function hasMarkers(content) {
  const start = content.indexOf(MARKER_START);
  return start !== -1 && content.indexOf(MARKER_END, start) !== -1;
}

/**
 * The state of one path, read without following a symlinked file.
 * @param {string} file
 * @param {string} expected
 * @returns {ComputerAgentTextState}
 */
function stateOf(file, expected) {
  /** @type {fs.Stats} */
  let stat;
  try {
    stat = fs.lstatSync(file);
  } catch {
    return 'absent';
  }
  if (!stat.isFile()) return 'foreign';
  let content;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch {
    return 'foreign';
  }
  if (!hasMarkers(content)) return 'foreign';
  return content === expected ? 'current' : 'differs';
}

/**
 * Read-only: the state of each file of the computer-level text against this
 * release's rendering.
 * @param {{home?: string, command?: string}} [options]
 * @returns {Array<{path: string, state: ComputerAgentTextState}>}
 */
export function inspectComputerAgentText({home = os.homedir(), command} = {}) {
  const expected = renderComputerAgentText({command});
  return computerAgentTextPaths(home).map(file => ({
    path: file,
    state: stateOf(file, expected),
  }));
}

/**
 * Write `content` to `file` without following a symlink planted at it.
 * @param {string} file
 * @param {string} content
 */
function writeNoFollow(file, content) {
  const flags =
    fs.constants.O_WRONLY |
    fs.constants.O_CREAT |
    fs.constants.O_TRUNC |
    (fs.constants.O_NOFOLLOW ?? 0);
  const fd = fs.openSync(file, flags, 0o644);
  try {
    fs.writeFileSync(fd, content);
  } finally {
    fs.closeSync(fd);
  }
}

/**
 * Write or refresh both files. A file without the Astryx markers, or a
 * symlinked one, is kept as it is. Creates the skill folders it needs.
 * @param {{home?: string, command?: string}} [options]
 * @returns {import('../../api/init/init.type.mjs').InitUserFile[]}
 */
export function writeComputerAgentText({home = os.homedir(), command} = {}) {
  const expected = renderComputerAgentText({command});
  return computerAgentTextPaths(home).map(file => {
    const state = stateOf(file, expected);
    if (state === 'foreign') return {path: file, action: 'kept'};
    if (state === 'current') return {path: file, action: 'unchanged'};
    fs.mkdirSync(path.dirname(file), {recursive: true});
    writeNoFollow(file, expected);
    return {path: file, action: 'written'};
  });
}

/**
 * Remove both files. A file without the Astryx markers, or a symlinked one,
 * is kept. An emptied skill folder is removed with its file.
 * @param {{home?: string}} [options]
 * @returns {import('../../api/init/init.type.mjs').InitUserFile[]}
 */
export function removeComputerAgentText({home = os.homedir()} = {}) {
  return computerAgentTextPaths(home).map(file => {
    const state = stateOf(file, '');
    if (state === 'absent') return {path: file, action: 'absent'};
    if (state === 'foreign') return {path: file, action: 'kept'};
    fs.unlinkSync(file);
    try {
      fs.rmdirSync(path.dirname(file));
    } catch {
      // The folder holds something else; leave it.
    }
    return {path: file, action: 'removed'};
  });
}

/**
 * Whether a package folder is the Astryx CLI.
 * @param {string} dir
 * @returns {boolean}
 */
function isCliPackage(dir) {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(dir, 'package.json'), 'utf8'),
    );
    return pkg?.name === CLI_PACKAGE;
  } catch {
    return false;
  }
}

/** A package manager's shim names the bin it starts by its package path. */
const SHIM_TARGET = /node_modules[\\/]@astryxdesign[\\/]cli[\\/]/u;

/** Shims are small; anything larger is a program, not a shim. */
const MAX_SHIM_BYTES = 64 * 1024;

/**
 * Whether an executable named `astryx` belongs to the Astryx CLI: its real
 * file sits in the CLI package (npm and bun link it), or it is a package
 * manager's shim script that starts the CLI package's bin (npm on Windows,
 * pnpm, yarn).
 * @param {string} file
 * @returns {boolean}
 */
function isAstryxCliBin(file) {
  let real;
  try {
    real = fs.realpathSync(file);
  } catch {
    return false;
  }
  let dir = path.dirname(real);
  for (;;) {
    if (isCliPackage(dir)) return true;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  try {
    if (fs.statSync(real).size > MAX_SHIM_BYTES) return false;
    return SHIM_TARGET.test(fs.readFileSync(real, 'utf8'));
  } catch {
    return false;
  }
}

/**
 * Whether the `astryx` a shell would run from this computer's search path is
 * the Astryx CLI. Reads the operating system's search path (and, on Windows,
 * its executable extensions); the first `astryx` found is the one that runs.
 * @param {{searchPath?: string, platform?: NodeJS.Platform}} [options]
 * @returns {boolean}
 */
export function astryxOnSearchPath({
  searchPath = process.env.PATH ?? '',
  platform = process.platform,
} = {}) {
  const windows = platform === 'win32';
  const names = windows
    ? ['astryx.cmd', 'astryx.exe', 'astryx.ps1', 'astryx']
    : [COMPUTER_COMMAND];
  for (const dir of searchPath.split(path.delimiter)) {
    if (!dir) continue;
    for (const name of names) {
      const file = path.join(dir, name);
      let stat;
      try {
        stat = fs.statSync(file);
      } catch {
        continue;
      }
      if (!stat.isFile()) continue;
      if (!windows) {
        try {
          fs.accessSync(file, fs.constants.X_OK);
        } catch {
          continue;
        }
      }
      return isAstryxCliBin(file);
    }
  }
  return false;
}
