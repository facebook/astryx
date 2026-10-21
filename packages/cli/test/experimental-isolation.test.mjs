// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Experimental isolation (spec:AST-017 FR27, spec:AST-084 FR0): in a
 *   project with no icon set installed and no `experimental.iconSet`, every
 *   stable command answers exactly as it does without icon sets.
 *
 *   The goldens under `__golden__/no-icon-set/` were written by the CLI
 *   without the icon-set feature, so a byte that an experimental surface adds
 *   to search, a template copy, or doctor's doc counts fails here. Help, the
 *   manifest, and the `astryx docs cli` listing gain only the experimental
 *   group or namespace, the one marked entry point FR27 allows.
 *
 * Update after an intended change to stable output: `vitest run -u` on this
 * file, then review the diff of `__golden__/no-icon-set/`; a diff that names
 * an icon set, an icon definition, or `experimental` is the leak this test
 * exists to catch.
 */

import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT} from '../foundation/fs/paths.mjs';
import {writeIconSetProject} from '../test-utils/icon-set-fixture.mjs';

const REPO_ROOT = path.resolve(CLI_ROOT, '..', '..');
const CLI_BIN = path.join(CLI_ROOT, 'clients', 'cli', 'bin', 'astryx.mjs');
const GOLDEN = path.join(CLI_ROOT, 'test', '__golden__', 'no-icon-set');

/** @type {string} */
let project;

/**
 * Run the CLI in the project; machine paths become placeholders.
 * @param {string[]} args
 */
function astryx(args, cwd = project) {
  const result = spawnSync(process.execPath, [CLI_BIN, ...args], {
    cwd,
    encoding: 'utf8',
    env: {...process.env, NO_COLOR: '1', FORCE_COLOR: '0', COLUMNS: '100'},
  });
  /** @param {string} text */
  const clean = text =>
    text.split(cwd).join('<project>').split(REPO_ROOT).join('<repo>');
  return {
    status: result.status,
    stdout: clean(result.stdout),
    stderr: clean(result.stderr),
  };
}

/** Doctor checks that read the computer, not the project. */
const COMPUTER_CHECKS = new Set([
  'newest-release',
  'cli-on-path',
  'computer-integrations',
]);

/**
 * A doctor JSON report with the computer's checks reduced to their ids, and
 * the summary counting only the project's: those checks answer from this
 * machine's cache and search path, which no golden can hold.
 * @param {string} stdout
 */
function withoutComputerChecks(stdout) {
  const report = JSON.parse(stdout);
  const summary = {pass: 0, warn: 0, fail: 0, info: 0};
  report.data.checks = report.data.checks.map((/** @type {any} */ check) => {
    if (COMPUTER_CHECKS.has(check.id)) return {id: check.id};
    summary[/** @type {keyof typeof summary} */ (check.status)] += 1;
    return check;
  });
  report.data.summary = summary;
  return `${JSON.stringify(report, null, 2)}\n`;
}

beforeAll(() => {
  // Inside the repo, so the project finds this checkout's Core.
  project = fs.mkdtempSync(path.join(REPO_ROOT, '.astryx-no-icon-set-'));
  fs.writeFileSync(
    path.join(project, 'package.json'),
    JSON.stringify({name: 'no-icon-set', version: '1.0.0'}),
  );
  fs.mkdirSync(path.join(project, 'node_modules', '.bin'), {recursive: true});
  fs.writeFileSync(path.join(project, 'node_modules', '.bin', 'astryx'), '');
});

afterAll(() => {
  fs.rmSync(project, {recursive: true, force: true});
});

describe('with no icon set, stable output is unchanged', () => {
  // Words an icon, an icon definition, or the icon-set docs would answer.
  it.each(['delete', 'close', 'icon', 'trash can', 'search'])(
    'search %s, text and JSON',
    async query => {
      const slug = query.replace(/\s+/g, '-');
      const json = astryx(['search', ...query.split(' '), '--json']);
      expect(json.status).toBe(0);
      await expect(json.stdout).toMatchFileSnapshot(
        path.join(GOLDEN, `search-${slug}.json`),
      );
      const text = astryx(['search', ...query.split(' ')]);
      await expect(text.stdout).toMatchFileSnapshot(
        path.join(GOLDEN, `search-${slug}.txt`),
      );
    },
  );

  it('search --type icon is an unknown type, offering only the stable domains', async () => {
    const res = astryx(['search', 'trash', '--type', 'icon', '--json']);
    expect(res.status).toBe(1);
    const body = JSON.parse(res.stdout);
    expect(body.code).toBe('ERR_INVALID_ARGUMENT');
    expect(body.suggestions.map((/** @type {any} */ s) => s.name)).toEqual([
      'component',
      'hook',
      'doc',
      'template',
      'theme',
    ]);
  });

  it('a template that declares icons prints and copies as it always has', async () => {
    const shown = astryx(['template', 'settings-dialog', '--json']);
    expect(shown.status).toBe(0);
    expect(JSON.parse(shown.stdout).data).not.toHaveProperty('icons');
    await expect(shown.stdout).toMatchFileSnapshot(
      path.join(GOLDEN, 'template-show.json'),
    );

    const copied = astryx([
      'template',
      'settings-dialog',
      'out/json',
      '--json',
    ]);
    expect(copied.status).toBe(0);
    expect(JSON.parse(copied.stdout).data).not.toHaveProperty('icons');
    await expect(copied.stdout).toMatchFileSnapshot(
      path.join(GOLDEN, 'template-copy.json'),
    );

    const text = astryx(['template', 'settings-dialog', 'out/text']);
    expect(text.status).toBe(0);
    expect(`${text.stdout}${text.stderr}`).not.toContain('icons:');
    await expect(text.stdout).toMatchFileSnapshot(
      path.join(GOLDEN, 'template-copy.txt'),
    );
    // The written file is the template's source with its own icons.
    expect(
      fs.readFileSync(path.join(project, 'out/json/page.tsx'), 'utf-8'),
    ).toBe(fs.readFileSync(path.join(project, 'out/text/page.tsx'), 'utf-8'));
  });

  it('help gains only the experimental group', () => {
    const help = astryx(['help']).stdout;
    const lines = help
      .split('\n')
      .filter(line => /experimental|\bicon\b/i.test(line));
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatch(/^\s+experimental\s+\[experimental\] /);
  });

  it('doctor has no icon-sets check, and its doc counts leave experimental docs out', async () => {
    const res = astryx(['doctor', '--json']);
    const checks = JSON.parse(res.stdout).data.checks;
    expect(
      checks.map((/** @type {{id: string}} */ check) => check.id),
    ).not.toContain('icon-sets');
    const counts = checks
      .filter((/** @type {{id: string}} */ check) =>
        [
          'authoring-docs',
          'cli-docs',
          'docs-tree',
          'docs-progressive-disclosure',
        ].includes(check.id),
      )
      .map(
        (/** @type {{id: string, message: string}} */ check) =>
          `${check.id}: ${check.message}`,
      )
      .join('\n');
    await expect(`${counts}\n`).toMatchFileSnapshot(
      path.join(GOLDEN, 'doctor-doc-counts.txt'),
    );
  });

  it('no stable command family gains an icon-set subcommand or kind', () => {
    const manifest = JSON.parse(astryx(['manifest', '--json']).stdout);
    /** @type {string[]} */
    const names = [];
    /** @param {any[]} commands */
    const walk = commands => {
      for (const command of commands ?? []) {
        names.push(command.name);
        walk(command.subcommands);
      }
    };
    walk(manifest.data?.commands ?? manifest.commands);
    const iconCommands = names.filter(name => /\bicon\b/.test(name));
    expect(iconCommands.length).toBeGreaterThan(0);
    for (const name of iconCommands) {
      expect(name.startsWith('experimental ')).toBe(true);
    }
    const res = astryx(['integration', 'add', 'icon-set', 'outline', '--json']);
    expect(res.status).toBe(1);
    expect(JSON.parse(res.stdout).code).toBe('ERR_INVALID_ARGUMENT');
  });
});

describe('with an icon set installed and configured, search is unchanged', () => {
  /** @type {string} */
  let root;
  /** @type {string} */
  let withSet;
  beforeAll(() => {
    root = fs.mkdtempSync(path.join(REPO_ROOT, '.astryx-icon-set-search-'));
    withSet = writeIconSetProject(root, {
      config: {experimental: {iconSet: 'glyphs'}},
    });
    fs.mkdirSync(path.join(withSet, 'node_modules', '.bin'), {recursive: true});
    fs.writeFileSync(path.join(withSet, 'node_modules', '.bin', 'astryx'), '');
  });
  afterAll(() => {
    fs.rmSync(root, {recursive: true, force: true});
  });

  it('the set is loaded', () => {
    const list = JSON.parse(
      astryx(['experimental', 'icon', '--list', '--json'], withSet).stdout,
    );
    expect(list.data.projectSet).toBe('@acme/glyphs/glyphs');
  });

  // Icon words: icon lookup by meaning is only `astryx experimental icon`;
  // `astryx search` joins it only at promotion (spec:AST-084 FR11).
  it.each(['delete', 'close', 'trash can'])(
    'search %s equals the output without icon sets, text and JSON',
    async query => {
      const slug = query.replace(/\s+/g, '-');
      const json = astryx(['search', ...query.split(' '), '--json'], withSet);
      expect(json.status).toBe(0);
      await expect(json.stdout).toMatchFileSnapshot(
        path.join(GOLDEN, `search-${slug}.json`),
      );
      const text = astryx(['search', ...query.split(' ')], withSet);
      await expect(text.stdout).toMatchFileSnapshot(
        path.join(GOLDEN, `search-${slug}.txt`),
      );
    },
  );

  it('search --type icon stays an unknown type', () => {
    const res = astryx(
      ['search', 'trash', '--type', 'icon', '--json'],
      withSet,
    );
    expect(res.status).toBe(1);
    expect(JSON.parse(res.stdout).code).toBe('ERR_INVALID_ARGUMENT');
  });
});

describe('with icon sets installed but no experimental.iconSet, stable output is unchanged', () => {
  /** @type {string} */
  let root;
  beforeAll(() => {
    root = fs.mkdtempSync(path.join(REPO_ROOT, '.astryx-icon-set-no-opt-in-'));
  });
  afterAll(() => {
    fs.rmSync(root, {recursive: true, force: true});
  });

  /**
   * A project that loads an icon-set package, its set valid or not.
   * @param {string} name
   * @param {unknown} [data] the set's data file; omit for a valid one
   */
  function installed(name, data) {
    const dir = writeIconSetProject(path.join(root, name), {
      packages: [data === undefined ? {} : {data}],
      config: {integrations: ['@acme/glyphs']},
    });
    fs.mkdirSync(path.join(dir, 'node_modules', '.bin'), {recursive: true});
    fs.writeFileSync(path.join(dir, 'node_modules', '.bin', 'astryx'), '');
    return dir;
  }

  // The goldens were written by the CLI without icon sets, in the same
  // project with the package's manifest emptied: that CLI warns about the
  // manifest key `experimental` it does not know, which is the one line no
  // CLI with this feature can print.
  it('discover lists no icon set, and --type icon-set is an unknown type', async () => {
    const cwd = installed('discover');
    await expect(
      astryx(['discover', '--json'], cwd).stdout,
    ).toMatchFileSnapshot(path.join(GOLDEN, 'discover.json'));
    const typed = astryx(['discover', '--type', 'icon-set', '--json'], cwd);
    expect(typed.status).toBe(1);
    await expect(typed.stdout).toMatchFileSnapshot(
      path.join(GOLDEN, 'discover-type-icon-set.json'),
    );
    const unknown = astryx(['discover', '--type', 'bogus', '--json'], cwd);
    await expect(unknown.stdout).toMatchFileSnapshot(
      path.join(GOLDEN, 'discover-type-bogus.json'),
    );
  });

  it('doctor reports nothing about an invalid installed set', async () => {
    const cwd = installed('doctor', '{nope');
    const res = astryx(['doctor', '--json'], cwd);
    expect(res.stdout).not.toMatch(/icon/i);
    await expect(withoutComputerChecks(res.stdout)).toMatchFileSnapshot(
      path.join(GOLDEN, 'doctor-installed-set.json'),
    );
  });
});
