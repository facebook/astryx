// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Runner commands in docs: an Astryx command written with a package runner in
 * front. Docs write the bare `astryx <command>` and the CLI shows it with the
 * reader's runner, so a written runner is wrong for every reader on another
 * package manager.
 *
 * - A download runner (`npx`, `pnpm dlx`, `yarn dlx`, `bunx`, `bun x`,
 *   `npm exec`) with the unscoped name `astryx`, with or without an
 *   `@<version>` after it, always counts, even with nothing after it: it
 *   fetches an unrelated package of that name.
 * - A project runner (`pnpm exec`, `pnpm`, `yarn`) counts when one of the
 *   CLI's commands follows on the same line (`pnpm exec astryx docs`). Named
 *   alone, or before a word that is not a command (`yarn astryx runs the
 *   copy…`), it is left alone.
 * - A runner and what follows it are read within one line; flags between a
 *   download runner and the name are read past.
 * - The scoped package (`npx @astryxdesign/cli init`) never counts: it is the
 *   one form that runs before the CLI is installed, for install steps.
 * - Other tools' commands (`npx prettier`) never count.
 */

import fs from 'node:fs';

import {loadTopicModule} from './docs-discovery.mjs';
import {
  commandTokensIn,
  tokenForCommand,
  unknownTokensIn,
} from '../doc-compiler/doc-syntax.mjs';

/**
 * @param {string} file
 * @returns {Promise<any>} the doc, or null for one that does not load (the
 *   load problem is reported elsewhere)
 */
async function loadQuietly(file) {
  try {
    return await loadTopicModule(file);
  } catch {
    return null;
  }
}

const DOWNLOAD_RUNNERS = [
  'pnpm dlx',
  'yarn dlx',
  'npm exec --',
  'npm exec',
  'npx',
  'bunx',
  'bun x',
];
const PROJECT_RUNNERS = ['pnpm exec', 'pnpm', 'yarn'];

/**
 * The CLI's top-level commands, the words that make a project runner's
 * `astryx <word>` a command; runner-commands.test.mjs keeps the list equal to
 * the command docs.
 */
export const CLI_COMMANDS = Object.freeze([
  'blog',
  'build',
  'component',
  'discover',
  'docs',
  'doctor',
  'gap-report',
  'help',
  'hook',
  'init',
  'integration',
  'manifest',
  'postinstall',
  'search',
  'swizzle',
  'template',
  'theme',
  'upgrade',
]);

/** Blanks within one line. */
const BLANK = '[ \\t]+';

/** @param {readonly string[]} words */
const alternatives = words =>
  words.map(each => each.replace(/ /g, BLANK)).join('|');

/** After `astryx`: the name ends here (a sentence's period may follow). */
const NAME_END = '(?![\\w@/-]|\\.\\w)';

const DOWNLOAD_COMMAND = new RegExp(
  `(?<![\\w@/.-])(?:${alternatives(DOWNLOAD_RUNNERS)})(?:${BLANK}--?[a-z][\\w-]*)*${BLANK}astryx(?:@[\\w^~-]+(?:\\.[\\w^~-]+)*)?${NAME_END}(?:${BLANK}(${alternatives(CLI_COMMANDS)})(?![\\w-]))?`,
  'g',
);
const PROJECT_COMMAND = new RegExp(
  `(?<![\\w@/.-])(?:${alternatives(PROJECT_RUNNERS)})${BLANK}astryx${BLANK}(${alternatives(CLI_COMMANDS)})(?![\\w-])`,
  'g',
);

/**
 * Each runner command in a text, as written, with the bare command to write
 * instead, in order.
 *
 * @param {string} text
 * @returns {{written: string, bare: string, download: boolean}[]}
 */
export function runnerCommandsIn(text) {
  const found = [
    ...[...String(text).matchAll(DOWNLOAD_COMMAND)].map(match => ({
      match,
      download: true,
    })),
    ...[...String(text).matchAll(PROJECT_COMMAND)].map(match => ({
      match,
      download: false,
    })),
  ];
  /** @type {{at: number, written: string, bare: string, download: boolean}[]} */
  const unique = [];
  for (const {match, download} of found) {
    if (unique.some(each => each.at === match.index)) continue;
    unique.push({
      at: match.index,
      written: match[0],
      bare: match[1] ? `astryx ${match[1]}` : 'astryx',
      download,
    });
  }
  return unique
    .sort((a, b) => a.at - b.at)
    .map(({written, bare, download}) => ({written, bare, download}));
}

/**
 * Every string in a doc, with the title of the section it is in. Code counts:
 * most commands sit in code blocks.
 *
 * @param {unknown} doc
 * @returns {{text: string, section: string | null, lang: string | null}[]}
 */
function allStrings(doc) {
  /** @type {{text: string, section: string | null, lang: string | null}[]} */
  const strings = [];
  // A doc that refers back to itself is walked once.
  const visited = new WeakSet();
  /**
   * @param {unknown} value
   * @param {string | null} section
   * @param {string | null} lang the code block's language when `value` is
   *   its code; null for text
   */
  const walk = (value, section, lang = null) => {
    if (typeof value === 'string') {
      strings.push({text: value, section, lang});
    } else if (value != null && typeof value === 'object') {
      if (visited.has(value)) return;
      visited.add(value);
      if (Array.isArray(value)) {
        for (const item of value) walk(item, section);
        return;
      }
      const record = /** @type {Record<string, unknown>} */ (value);
      for (const [key, field] of Object.entries(record)) {
        if (key === 'sections' && Array.isArray(field)) {
          for (const each of field) {
            walk(each, typeof each?.title === 'string' ? each.title : section);
          }
        } else if (key === 'code' && typeof field === 'string') {
          walk(
            field,
            section,
            typeof record.lang === 'string' ? record.lang : '',
          );
        } else {
          walk(field, section);
        }
      }
    }
  };
  walk(doc, null);
  return strings;
}

/**
 * Where a file next holds the text, at or after a cursor (a 0-based line and
 * column), else the first place it holds it, else null. A doc's strings are
 * read in file order, so moving the cursor past each match puts a command the
 * topic writes twice on its own line.
 *
 * @param {string[]} lines
 * @param {string} written
 * @param {{line: number, column: number}} cursor
 * @returns {{line: number, column: number} | null}
 */
function locate(lines, written, cursor) {
  for (let at = cursor.line; at < lines.length; at++) {
    const column = lines[at].indexOf(
      written,
      at === cursor.line ? cursor.column : 0,
    );
    if (column >= 0) return {line: at, column};
  }
  const first = lines.findIndex(line => line.includes(written));
  return first < 0
    ? null
    : {line: first, column: lines[first].indexOf(written)};
}

/**
 * A command a topic writes that the doc syntax writes another way: with a
 * runner in front (`runner_command`), a package-manager command written for
 * one package manager (`package_manager_command`), a bare Astryx command
 * (`plain_command`), or a doc token that does not parse (`doc_token`).
 *
 * @typedef {object} RunnerCommand
 * @property {string} code
 * @property {string} topic
 * @property {string | null} section the title of the section it is in
 * @property {string} file the doc file
 * @property {number | null} line the file line that holds it, when found
 * @property {string} command the command as written
 * @property {string} message what to write instead
 */

/** Code-block languages whose lines are shell commands. */
const SHELL_LANGS = new Set(['', 'bash', 'sh', 'shell', 'zsh', 'console']);

/** Package-manager binaries a written command may start with. */
const PM_START = /^(?:npm|npx|pnpm|yarn|bun|bunx)[ \t]+\S/;

/** A bare Astryx command: `astryx` and one of the CLI's commands. */
const PLAIN_START = new RegExp(
  `^astryx${BLANK}(?:${alternatives(CLI_COMMANDS)})(?![\\w-])`,
);

/**
 * The commands a code span or a shell line holds, each as written: split at
 * `&&`, `||`, `;` and `|`, without a leading `$ ` or a trailing comment. A
 * line with a quote holds one command, its first: a quoted value can hold
 * `&&` that is not the shell's.
 * @param {string} line
 * @returns {string[]}
 */
function commandsOf(line) {
  const body = line.replace(/^\s*\$\s+/, '').replace(/\s+#\s.*$/, '');
  const parts = /["']/.test(body) ? [body] : body.split(/&&|\|\||;|\|/);
  return parts.map(each => each.trim()).filter(Boolean);
}

/**
 * The doc-syntax findings in one string of a doc, in order: runner commands,
 * package-manager commands, bare Astryx commands and tokens that do not
 * parse, each with what to write instead.
 * @param {string} text
 * @param {string | null} lang the code block's language; null for text
 * @returns {{at: number, written: string, code: string, fix: string}[]}
 */
export function docCommandsIn(text, lang) {
  /** @type {{at: number, written: string, code: string, fix: string}[]} */
  const found = [];
  const source = String(text);
  for (const each of runnerCommandsIn(source)) {
    found.push({
      at: source.indexOf(each.written),
      written: each.written,
      code: 'runner_command',
      fix:
        `Write \`${each.bare}\`, or the token \`{@command ${each.bare.slice('astryx '.length) || '…'}}\`; the CLI shows it with your project's runner` +
        (each.download
          ? ', and a download runner with the bare name fetches an unrelated package called astryx.'
          : '.'),
    });
  }
  // The commands a reader runs: code spans in text, lines in a shell block.
  /** @type {{at: number, command: string}[]} */
  const commands = [];
  if (lang == null) {
    for (const match of source.matchAll(/`([^`\n]+)`/g)) {
      for (const command of commandsOf(match[1])) {
        commands.push({at: /** @type {number} */ (match.index), command});
      }
    }
  } else if (SHELL_LANGS.has(lang.toLowerCase())) {
    let offset = 0;
    for (const line of source.split('\n')) {
      for (const command of commandsOf(line)) {
        commands.push({at: offset, command});
      }
      offset += line.length + 1;
    }
  }
  for (const {at, command} of commands) {
    if (found.some(each => command.includes(each.written))) continue;
    if (PM_START.test(command)) {
      const token = tokenForCommand(command);
      if (token == null || token.startsWith('{@command')) continue;
      found.push({
        at,
        written: command,
        code: 'package_manager_command',
        fix: token.startsWith('{@pm-only')
          ? `Only ${command.split(/\s+/)[0]} runs this; write \`${token}\` with the reason readers see, or the \`{@pm …}\` step every package manager runs`
          : `Write \`${token}\`; the CLI shows it in your reader's package manager`,
      });
    } else if (PLAIN_START.test(command)) {
      found.push({
        at,
        written: command,
        code: 'plain_command',
        fix: `Write \`{@command ${command.slice('astryx'.length).trim()}}\`; the CLI shows it with your reader's runner and checks that the command exists`,
      });
    }
  }
  for (const {token, step} of commandTokensIn(source)) {
    if ('error' in step) {
      found.push({
        at: source.indexOf(token),
        written: token,
        code: 'doc_token',
        fix: step.error,
      });
    }
  }
  for (const token of unknownTokensIn(source)) {
    found.push({
      at: source.indexOf(token),
      written: token,
      code: 'doc_token',
      fix: 'Doc tokens are `{@link}`, `{@command}`, `{@pm}` and `{@pm-only}`; write `{@@…}` to show a token as written',
    });
  }
  return found.sort((a, b) => a.at - b.at);
}

/**
 * The doc-syntax findings in a package's topics, each placed on the file line
 * that holds it.
 *
 * @param {{records: {name: string, path: string}[], guides?: {name: string, ref?: {topicFile?: string}}[]}} discovered
 *   the package's docs, as discoverIntegrationDocs returns them
 * @returns {Promise<RunnerCommand[]>}
 */
export async function findDocCommands(discovered) {
  const topics = [
    ...discovered.records.map(record => ({
      name: record.name,
      file: record.path,
    })),
    ...(discovered.guides ?? []).map(guide => ({
      name: guide.name,
      file: guide.ref?.topicFile,
    })),
  ];
  /** @type {RunnerCommand[]} */
  const found = [];
  for (const {name, file} of topics) {
    const doc = file ? await loadQuietly(file) : null;
    if (!doc || !file) continue;
    /** @type {string[]} */
    let lines = [];
    try {
      lines = fs.readFileSync(file, 'utf8').split('\n');
    } catch {
      // The doc loaded, so only the line number is lost.
    }
    let cursor = {line: 0, column: 0};
    for (const {text, section, lang} of allStrings(doc)) {
      const commands = docCommandsIn(text, lang);
      if (commands.length === 0) continue;
      // A one-line string's own literal places it, wherever the walk reached
      // it (a section in a constant above the doc object, say); else the
      // cursor search, in file order.
      const forms = [`'${text}'`, `"${text}"`, JSON.stringify(text)];
      const holds = (/** @type {string} */ line) =>
        forms.some(form => line.includes(form));
      // On the cursor's own line, only a copy at or after the cursor counts:
      // the copy just matched still sits before it.
      const after = text.includes('\n')
        ? -1
        : lines.findIndex((line, at) =>
            at > cursor.line
              ? holds(line)
              : at === cursor.line &&
                forms.some(form => line.indexOf(form, cursor.column) >= 0),
          );
      const literal =
        after >= 0 || text.includes('\n') ? after : lines.findIndex(holds);
      const column = after >= 0 && after === cursor.line ? cursor.column : 0;
      let from = literal >= 0 ? {line: literal, column} : cursor;
      for (const {written, code, fix} of commands) {
        const place = locate(lines, written, from);
        if (place) {
          from = {line: place.line, column: place.column + written.length};
          if (
            place.line > cursor.line ||
            (place.line === cursor.line && place.column >= cursor.column)
          ) {
            cursor = from;
          }
        }
        const line = place ? place.line + 1 : null;
        const where = section ? ` (section "${section}")` : '';
        found.push({
          code,
          topic: name,
          section,
          file,
          line,
          command: written,
          message: `"${name}"${where} writes \`${written}\`${line == null ? '' : ` (line ${line})`}. ${fix}`,
        });
      }
    }
  }
  return found;
}

/**
 * Runner commands in a package's topics: the `runner_command` findings of
 * {@link findDocCommands}.
 *
 * @param {Parameters<typeof findDocCommands>[0]} discovered
 * @returns {Promise<RunnerCommand[]>}
 */
export async function findRunnerCommands(discovered) {
  return (await findDocCommands(discovered)).filter(
    each => each.code === 'runner_command',
  );
}
