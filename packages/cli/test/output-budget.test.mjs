// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Default output budget: every command's default text output, on golden
 *   inputs, fits the budget of its result kind (spec:AST-069).
 *
 * @input Core's own catalog read from a fresh consumer project, plus theme and
 *   integration-package fixtures for the commands that need input files.
 * @output A failure for any default run whose output, standard output and
 *   standard error together, exceeds its kind's budget; for a known exception
 *   that grows past its recorded size or fits its budget; and for a CLI command
 *   that no case covers.
 * @position Runs the real CLI in process through runCli, so it sees exactly
 *   what an agent running the binary sees.
 *
 * A default that does not fit its budget gets under it the ways spec:AST-069
 * FR4 lists: a list pages, a read prints one level with a pointer to the rest,
 * a report prints one line per item, an error names the closest few choices.
 * When a change brings a known exception under budget, delete its entry in
 * KNOWN_OVER_BUDGET in the same change.
 */

import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT} from '../foundation/fs/paths.mjs';
import {runCli} from '../test-utils/run-cli.mjs';

const REPO_ROOT = path.resolve(CLI_ROOT, '..', '..');

/** Bytes each result kind may print by default (spec:AST-069 FR2). */
const BUDGET = {
  read: 16 * 1024,
  list: 12 * 1024,
  report: 4 * 1024,
  error: 2 * 1024,
};

/**
 * @typedef {object} BudgetCase
 * @property {keyof typeof BUDGET} kind
 * @property {string[]} args argv after `astryx`
 * @property {'project' | 'init' | 'themes' | 'writes' | 'package'} [where]
 *   which fixture the run starts in (default: project)
 * @property {number} [artifacts] named artifacts in a batch read (default 1)
 */

/** @type {BudgetCase[]} */
const CASES = [
  // Reads: one artifact or one docs-tree node.
  {kind: 'read', args: ['component', 'Button']},
  {kind: 'read', args: ['component', 'Text']},
  {kind: 'read', args: ['component', 'Table']},
  {kind: 'read', args: ['component', 'Selector']},
  {kind: 'read', args: ['component', 'Button', 'Text'], artifacts: 2},
  {kind: 'read', args: ['component', 'Button', '--props']},
  {kind: 'read', args: ['component', 'Button', '--blocks']},
  {kind: 'read', args: ['docs', 'tokens']},
  {kind: 'read', args: ['docs', 'principles']},
  {kind: 'read', args: ['docs', 'author-a-theme']},
  {kind: 'read', args: ['docs', 'styling']},
  {kind: 'read', args: ['docs', 'tokens', 'spacing']},
  {kind: 'read', args: ['docs', 'cli']},
  {kind: 'read', args: ['docs', 'cli/commands/build']},
  {kind: 'read', args: ['hook', 'useToast']},
  {kind: 'read', args: ['hook', 'useListFocus']},
  {kind: 'read', args: ['template', 'dashboard', '--skeleton']},
  {kind: 'read', args: ['build']},
  {kind: 'read', args: ['build', 'settings page']},
  {kind: 'read', args: ['build', 'analytics dashboard with charts']},
  {kind: 'read', args: ['build', 'login form']},
  {kind: 'read', args: ['layout', 'grammar']},

  // Lists: artifacts or choices to pick from.
  {kind: 'list', args: ['component']},
  {kind: 'list', args: ['component', '--list']},
  {kind: 'list', args: ['component', '--category', 'Layout']},
  {kind: 'list', args: ['docs']},
  {kind: 'list', args: ['docs', 'unorganized']},
  {kind: 'list', args: ['template', '--list']},
  {kind: 'list', args: ['template', '--list', '--type', 'page']},
  {kind: 'list', args: ['hook']},
  {kind: 'list', args: ['hook', '--list']},
  {kind: 'list', args: ['search', 'button']},
  {kind: 'list', args: ['search', 'date picker']},
  {kind: 'list', args: ['search', 'dark mode']},
  {kind: 'list', args: ['search', 'spacing']},
  {kind: 'list', args: ['swizzle', '--list']},
  {kind: 'list', args: ['discover']},
  {kind: 'list', args: ['discover', 'table']},
  {kind: 'list', args: ['theme', 'list']},
  {kind: 'list', args: ['theme', 'targets']},
  {kind: 'list', args: ['upgrade', '--list']},
  {kind: 'list', args: ['gap-report', '--list-categories']},
  {kind: 'list', args: ['help']},
  {kind: 'list', args: ['manifest']},

  // Reports: what a run did or checked.
  {kind: 'report', args: ['doctor']},
  {kind: 'report', args: ['upgrade', '--from', '0.5.0']},
  {kind: 'report', args: ['init'], where: 'init'},
  {kind: 'report', args: ['theme', 'build', 'ocean.mjs'], where: 'themes'},
  {
    kind: 'report',
    args: ['theme', 'build', 'butter/butterTheme.ts'],
    where: 'themes',
  },
  {
    kind: 'report',
    args: ['theme', 'build', '--check', 'ocean.mjs'],
    where: 'themes',
  },
  // The batch's argv is filled in from the fixture's 15 files.
  {kind: 'report', args: ['theme', 'build', '<15 themes>'], where: 'themes'},
  {
    kind: 'report',
    args: [
      'theme',
      'build',
      '--family',
      '<family>',
      '--family-key',
      'ocean-family',
    ],
    where: 'themes',
  },
  {
    kind: 'report',
    args: ['template', 'login', 'src/login.tsx'],
    where: 'writes',
  },
  {kind: 'report', args: ['swizzle', 'Button'], where: 'writes'},
  {kind: 'report', args: ['theme', 'template'], where: 'writes'},
  {kind: 'report', args: ['theme', 'add', 'stone'], where: 'writes'},
  {kind: 'report', args: ['theme', 'eject', 'matcha'], where: 'writes'},
  {
    kind: 'report',
    args: ['integration', 'add', 'doc', 'intro'],
    where: 'package',
  },
  {
    kind: 'report',
    args: ['integration', 'add', 'component', 'Fancy'],
    where: 'package',
  },
  {
    kind: 'report',
    args: ['doctor', 'integration', 'validate'],
    where: 'package',
  },
  {kind: 'report', args: ['doctor', 'integration', 'docs'], where: 'package'},
  {
    kind: 'report',
    args: ['doctor', 'integration', 'components'],
    where: 'package',
  },
  {
    kind: 'report',
    args: ['doctor', 'integration', 'templates'],
    where: 'package',
  },

  // Errors: a name the catalog does not have.
  {kind: 'error', args: ['component', 'Nope']},
  {kind: 'error', args: ['docs', 'nope']},
  {kind: 'error', args: ['hook', 'useNope']},
  {kind: 'error', args: ['template', 'Nope']},
];

/**
 * Verbatim output is the artifact itself and prints whole (spec:AST-069 FR3).
 * These run only to prove the golden input still exists.
 * @type {{args: string[], where?: BudgetCase['where']}[]}
 */
const VERBATIM = [
  {args: ['component', 'Button', '--source']},
  {args: ['component', 'Button', '--showcase']},
  {args: ['template', 'dashboard']},
  {
    args: ['theme', 'palette', 'generate', 'palette.config.json'],
    where: 'writes',
  },
];

/**
 * Commands no case runs, each with its reason. Anything else in the manifest
 * must have a case.
 */
const NOT_COVERED = {
  blog: 'reads a remote feed',
  'integration verify': 'packs the package with npm',
  'integration pack': 'deprecated name of integration verify',
  'layout check': 'deprecated (DEP-0006), removed in a scheduled minor',
  'layout expand': 'deprecated (DEP-0006), removed in a scheduled minor',
  'theme use': 'needs a built theme package',
  'theme remove': 'needs a built theme package',
};

/**
 * Defaults over budget on the golden inputs when this test was added: the
 * measured size, rounded up to the next KiB. The test fails when one grows
 * past its size and when one fits its budget, so the change that fixes a
 * command also deletes its entry.
 * @type {Record<string, number>}
 */
const KNOWN_OVER_BUDGET = {
  'template --list': 147 * 1024,
  'template --list --type page': 17 * 1024,
  'theme targets': 24 * 1024,
  'template Nope': 29 * 1024,
};

/** @param {string[]} args */
const label = args => args.join(' ');

let project = '';
let initProject = '';
let writes = '';
let pkg = '';
let themes = '';
/** @type {string[]} */
let batch = [];
/** @type {string[]} */
let family = [];

/**
 * A consumer project inside the repo, so Core resolves to this checkout.
 * @param {string} prefix
 * @param {Record<string, string>} [links] extra node_modules links, name -> repo path
 */
function consumer(prefix, links = {}) {
  const dir = fs.mkdtempSync(path.join(REPO_ROOT, prefix));
  const all = {
    '@astryxdesign/core': 'packages/core',
    '@astryxdesign/cli': 'packages/cli',
    ...links,
  };
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({
      name: 'budget-consumer',
      version: '1.0.0',
      type: 'module',
      dependencies: Object.fromEntries(Object.keys(all).map(n => [n, '*'])),
    }),
  );
  for (const [name, rel] of Object.entries(all)) {
    const link = path.join(dir, 'node_modules', name);
    fs.mkdirSync(path.dirname(link), {recursive: true});
    fs.symlinkSync(path.join(REPO_ROOT, rel), link);
  }
  fs.mkdirSync(path.join(dir, 'src'));
  return dir;
}

/** @param {string} name @param {string} body */
const themeSource = (name, body) =>
  `import {defineTheme} from '@astryxdesign/core/theme';\n${body}\nexport const ${name} = defineTheme(${name}Spec);\n`;

beforeAll(() => {
  project = consumer('.astryx-budget-');
  initProject = consumer('.astryx-budget-init-');
  writes = consumer('.astryx-budget-writes-');
  fs.copyFileSync(
    path.join(REPO_ROOT, 'packages/themes/neutral/palette.config.json'),
    path.join(writes, 'palette.config.json'),
  );

  pkg = fs.mkdtempSync(path.join(REPO_ROOT, '.astryx-budget-pkg-'));
  fs.writeFileSync(
    path.join(pkg, 'package.json'),
    JSON.stringify({name: '@acme/kit', version: '1.0.0', type: 'module'}),
  );

  // Under the CLI package so the sources resolve `@astryxdesign/core/theme`.
  themes = fs.mkdtempSync(path.join(CLI_ROOT, '.astryx-budget-themes-'));
  fs.writeFileSync(path.join(themes, 'package.json'), '{"type":"module"}\n');
  const write = (/** @type {string} */ file, /** @type {string} */ text) =>
    fs.writeFileSync(path.join(themes, file), text);
  write(
    'ocean.mjs',
    themeSource(
      'oceanTheme',
      `const oceanThemeSpec = {name: 'ocean', tokens: {'--color-background-body': '#ffffff', '--color-text-primary': '#0a0a0a'}, components: {button: {base: {'--_button-radius': '2px'}}}};`,
    ),
  );
  family = ['ocean.mjs'];
  for (const name of ['calm', 'dim', 'bright', 'mono']) {
    const id = `ocean${name[0].toUpperCase()}${name.slice(1)}Theme`;
    write(
      `ocean-${name}.mjs`,
      themeSource(
        id,
        `import {oceanTheme} from './ocean.mjs';\nconst ${id}Spec = {name: 'ocean-${name}', extends: oceanTheme, tokens: {'--color-text-primary': '#333333'}};`,
      ),
    );
    family.push(`ocean-${name}.mjs`);
  }
  batch = [];
  for (let i = 1; i <= 15; i++) {
    const name = `t${String(i).padStart(2, '0')}`;
    const hex = (i * 16).toString(16).padStart(2, '0');
    write(
      `${name}.mjs`,
      themeSource(
        `${name}Theme`,
        `const ${name}ThemeSpec = {name: '${name}', tokens: {'--color-background-body': '#${hex}${hex}${hex}'}};`,
      ),
    );
    batch.push(`${name}.mjs`);
  }
  fs.cpSync(
    path.join(REPO_ROOT, 'packages/themes/butter/src'),
    path.join(themes, 'butter'),
    {recursive: true},
  );
});

afterAll(() => {
  for (const dir of [project, initProject, writes, pkg, themes]) {
    if (dir) fs.rmSync(dir, {recursive: true, force: true});
  }
});

/** @param {BudgetCase['where']} where */
function cwdFor(where) {
  return {project, init: initProject, themes, writes, package: pkg}[
    where ?? 'project'
  ];
}

/** @param {string[]} args */
function expand(args) {
  return args.flatMap(a =>
    a === '<15 themes>' ? batch : a === '<family>' ? family : [a],
  );
}

describe('default output budget (spec:AST-069)', () => {
  it.each(CASES.map(c => [label(c.args), c]))(
    '%s',
    async (_name, /** @type {BudgetCase} */ c) => {
      const result = await runCli(expand(c.args), cwdFor(c.where));
      expect(result.status, result.stderr).toBe(c.kind === 'error' ? 1 : 0);

      const bytes = Buffer.byteLength(result.stdout + result.stderr, 'utf8');
      const budget = BUDGET[c.kind] * (c.artifacts ?? 1);
      const known = KNOWN_OVER_BUDGET[label(c.args)];
      if (known === undefined) {
        expect(
          bytes,
          `\`astryx ${label(c.args)}\` printed ${bytes} bytes; ${c.kind === 'error' ? 'an' : 'a'} ${c.kind} may print ${budget} by default. Bring it under budget (spec:AST-069 FR4).`,
        ).toBeLessThanOrEqual(budget);
      } else {
        expect(
          bytes,
          `\`astryx ${label(c.args)}\` fits its ${c.kind} budget (${bytes} of ${budget} bytes): delete its KNOWN_OVER_BUDGET entry.`,
        ).toBeGreaterThan(budget);
        expect(
          bytes,
          `\`astryx ${label(c.args)}\` is over budget and grew to ${bytes} bytes, past its recorded ${known}. Bring it under budget (spec:AST-069 FR4) instead of growing it.`,
        ).toBeLessThanOrEqual(known);
      }
    },
    60_000,
  );

  it.each(VERBATIM.map(v => [label(v.args), v]))(
    'verbatim: %s',
    async (_name, v) => {
      const result = await runCli(v.args, cwdFor(v.where));
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout.length).toBeGreaterThan(0);
    },
    60_000,
  );

  it('lists every known exception as a case', () => {
    const labels = new Set(CASES.map(c => label(c.args)));
    for (const key of Object.keys(KNOWN_OVER_BUDGET)) {
      expect(
        labels,
        `KNOWN_OVER_BUDGET names "${key}", which no case runs`,
      ).toContain(key);
    }
  });

  it('covers every command in the manifest', async () => {
    const result = await runCli(['--json', 'manifest'], project);
    /** @type {{name: string, subcommands?: any[]}[]} */
    const commands = JSON.parse(result.stdout).data.commands;
    /** @type {string[]} */
    const leaves = [];
    const walk = (/** @type {any[]} */ list) => {
      for (const command of list) {
        if (command.subcommands?.length) walk(command.subcommands);
        else leaves.push(command.name);
      }
    };
    walk(commands);

    const runs = [...CASES, ...VERBATIM].map(c => label(c.args));
    const uncovered = leaves.filter(
      name =>
        !(name in NOT_COVERED) &&
        !runs.some(run => run === name || run.startsWith(`${name} `)),
    );
    expect(uncovered, 'commands with no budget case').toEqual([]);
    for (const name of Object.keys(NOT_COVERED)) {
      expect(
        leaves,
        `NOT_COVERED names "${name}", which is not a command`,
      ).toContain(name);
    }
  });
});
