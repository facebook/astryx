// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Experimental isolation (spec:AST-017 FR27, spec:AST-084 FR0): in a
 *   project with no icon set installed and no `experimental.iconSet`, every
 *   stable command answers exactly as it does without icon sets.
 *
 *   The goldens under `__golden__/no-icon-set/` were written by the CLI
 *   without the icon-set feature, so a byte that an experimental surface adds
 *   to search, a template copy, doctor's doc counts, or an integration's
 *   verify report fails here. Help, the
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
import * as os from 'node:os';
import * as path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {CLI_ROOT} from '../foundation/fs/paths.mjs';
import {writeIconSetProject} from '../test-utils/icon-set-fixture.mjs';

const REPO_ROOT = path.resolve(CLI_ROOT, '..', '..');
// Goldens come from the CLI without the feature: point these at a checkout of
// main to rewrite them (`GOLDEN_CLI_BIN=<main>/packages/cli/clients/cli/bin/
// astryx.mjs GOLDEN_CLI_ROOT=<main>/packages/cli vitest run -u` on this file).
const CLI_BIN =
  process.env.GOLDEN_CLI_BIN ??
  path.join(CLI_ROOT, 'clients', 'cli', 'bin', 'astryx.mjs');
const GOLDEN_REPO = process.env.GOLDEN_CLI_ROOT
  ? path.resolve(process.env.GOLDEN_CLI_ROOT, '..', '..')
  : REPO_ROOT;
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
    text
      .split(cwd)
      .join('<project>')
      .split(REPO_ROOT)
      .join('<repo>')
      .split(GOLDEN_REPO)
      .join('<repo>');
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
    // The Node version is the machine's, not the project's.
    if (check.id === 'node-version') {
      summary[/** @type {keyof typeof summary} */ (check.status)] += 1;
      return {
        ...check,
        message: check.message.replace(/v\d+\.\d+\.\d+/, 'v<node>'),
      };
    }
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
  // Every stable docs topic, against the CLI without the feature: the
  // listing, each topic's sections, and a digest of each topic's JSON.
  it('every stable docs topic: the listing, its sections, and its JSON', async () => {
    const list = JSON.parse(astryx(['docs', '--json']).stdout);
    /** @type {Record<string, {sections: string[], digest?: string}>} */
    const topics = {};
    for (const {topic} of list.data) {
      const out = astryx(['docs', topic, '--json']).stdout;
      const doc = JSON.parse(out).data;
      topics[topic] = {
        sections: (doc.sections ?? []).map(
          (/** @type {any} */ section) =>
            `${section.id ?? section.key}: ${section.title}`,
        ),
        digest: createHash('sha256').update(out).digest('hex'),
      };
    }
    await expect(
      `${JSON.stringify({list: list.data, topics}, null, 2)}\n`,
    ).toMatchFileSnapshot(path.join(GOLDEN, 'docs-topics.json'));
  }, 120_000);

  // Words an icon, an icon definition, or the icon-set docs would answer.
  // Every stable node of the docs tree outside `cli`, the same way: each
  // namespace's children and each guide's sections, and a digest of each
  // read. The field reference gains the stable `stability` field of every
  // doc kind, so it is compared by sections.
  it('every stable docs tree node: its children or sections, and its JSON', async () => {
    const root = process.env.GOLDEN_CLI_ROOT ?? CLI_ROOT;
    const {docs} = await import(
      pathToFileURL(path.join(root, 'api', 'docs', 'docs.mjs')).href
    );
    // The `cli` namespace is FR0's own case: its listing gains the
    // experimental group, and the experimental commands and API functions
    // document themselves on its routes, each marked experimental. Every
    // other namespace answers exactly as it does without the feature.
    const experimental = (/** @type {string} */ route) =>
      route === 'cli' || route.startsWith('cli/');
    /** @param {any} value */
    const clean = value =>
      JSON.stringify(value)
        .split(project)
        .join('<project>')
        .split(path.resolve(root, '..', '..'))
        .join('<repo>');
    const list = await docs(undefined, undefined, {cwd: project});
    const queue = (list.meta?.namespaces ?? []).map(
      (/** @type {any} */ entry) => entry.topic,
    );
    /** @type {Record<string, any>} */
    const nodes = {};
    while (queue.length > 0) {
      const route = queue.shift();
      if (route in nodes || experimental(route)) continue;
      const res = await docs(route, undefined, {cwd: project});
      if (res.type === 'docs.node') {
        for (const slot of res.data.slots) {
          slot.children = slot.children.filter(
            (/** @type {any} */ child) => !experimental(child.route),
          );
          for (const child of slot.children) queue.push(child.route);
        }
      }
      nodes[route] = {
        type: res.type,
        ...(res.type === 'docs.node'
          ? {
              children: res.data.slots.flatMap((/** @type {any} */ slot) =>
                slot.children.map((/** @type {any} */ c) => c.route),
              ),
            }
          : {
              sections: (res.data.sections ?? []).map(
                (/** @type {any} */ section) =>
                  `${section.id ?? section.key}: ${section.title}`,
              ),
            }),
        ...(route === 'authoring/field-reference'
          ? {}
          : {digest: createHash('sha256').update(clean(res)).digest('hex')}),
      };
    }
    const sorted = Object.fromEntries(
      Object.keys(nodes)
        .sort()
        .map(route => [route, nodes[route]]),
    );
    await expect(`${JSON.stringify(sorted, null, 2)}\n`).toMatchFileSnapshot(
      path.join(GOLDEN, 'docs-tree.json'),
    );
  }, 120_000);

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

describe('an integration package without experimental.iconSets', () => {
  /** @type {string} */
  let pkg;
  beforeAll(() => {
    // Outside the repo, so this CLI answers, as the CLI without icon sets
    // that wrote the golden did.
    pkg = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-no-icon-sets-pkg-'));
    fs.writeFileSync(
      path.join(pkg, 'package.json'),
      `${JSON.stringify({
        name: '@acme/widgets',
        version: '1.0.0',
        files: ['astryx.integration.mjs', 'docs'],
        exports: {'./package.json': './package.json'},
      })}\n`,
    );
    fs.writeFileSync(
      path.join(pkg, 'astryx.integration.mjs'),
      "export default {\n  docs: './docs'\n};\n",
    );
    fs.mkdirSync(path.join(pkg, 'docs'));
    fs.writeFileSync(
      path.join(pkg, 'docs', 'local-guide.doc.mjs'),
      `/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export default {
  type: 'generic',
  name: 'local-guide',
  title: 'Local Guide',
  description: 'Local Guide documentation.',
  sections: [
    {
      title: 'Overview',
      content: [{type: 'prose', text: 'Local Guide documentation.'}],
    },
  ],
};
`,
    );
  });
  afterAll(() => {
    fs.rmSync(pkg, {recursive: true, force: true});
  });

  // The golden was written by the CLI without icon sets; only the gzip size
  // of the tarball, which depends on the machine's zlib, is a placeholder.
  it('integration verify --json answers as it does without icon sets: no iconSets identities', async () => {
    const res = astryx(['integration', 'verify', '--json'], pkg);
    expect(res.status).toBe(0);
    const body = JSON.parse(res.stdout);
    expect(body.data.contributions.local).not.toHaveProperty('iconSets');
    expect(body.data.contributions.packed).not.toHaveProperty('iconSets');
    await expect(
      res.stdout.replace(/("size": )\d+/u, '$1"<gzip>"'),
    ).toMatchFileSnapshot(path.join(GOLDEN, 'integration-verify.json'));
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

  // A source that lists a malformed icon-set entry: without the opt-in its
  // fields are unknown and the entry is an unknown kind, so the source still
  // counts and discover answers as the CLI without icon sets does.
  it('a malformed icon-set entry in a source does not fail it', async () => {
    const cwd = writeIconSetProject(path.join(root, 'malformed-source'), {
      packages: [],
    });
    fs.writeFileSync(
      path.join(cwd, 'astryx.config.mjs'),
      `export default {
  discover: async () => ({
    schemaVersion: 1,
    source: {name: 'acme', generatedAt: '2026-01-01T00:00:00.000Z', complete: true},
    packages: [{
      package: '@acme/glyphs',
      integration: '@acme/glyphs',
      aliases: [],
      latest: '1.0.0',
      versions: [{version: '1.0.0', publishedAt: '2026-01-01T00:00:00.000Z', prerelease: false, status: 'published'}],
      contributions: [
        {kind: 'theme', name: 'glyph-theme', definitions: [7]},
        {kind: 'icon-set', name: 'outline', iconCount: -1, definitions: 'nope'},
      ],
    }],
  }),
};
`,
    );
    fs.mkdirSync(path.join(cwd, 'node_modules', '.bin'), {recursive: true});
    fs.writeFileSync(path.join(cwd, 'node_modules', '.bin', 'astryx'), '');
    const res = astryx(['discover', '--json'], cwd);
    expect(res.status).toBe(0);
    await expect(res.stdout).toMatchFileSnapshot(
      path.join(GOLDEN, 'discover-malformed-icon-set-source.json'),
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
