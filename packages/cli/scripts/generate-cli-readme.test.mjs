// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the README generator, on small fixture docs rather than the
 * real README: adding, renaming and removing a command, a function, an enum
 * member and a schema field each changes the README the same way every time;
 * text outside the markers survives byte for byte; the drift check fails and
 * names the command that fixes it.
 *
 * @input Fixture CLI packages written to a temp directory: CommandDocs,
 *   FunctionDocs and the modules that export them, EnumDocs, SchemaDocs, and
 *   stand-ins for `astryx manifest` and `astryx docs <topic> --index`.
 * @output Assertions on each generated section and on the text around it.
 * @position packages/cli/scripts — unit tests for generate-cli-readme.mjs;
 *   test/readme-gen.test.mjs checks the real README.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import prettier from 'prettier';
import {afterAll, describe, expect, it} from 'vitest';
import {
  REGENERATE,
  SECTIONS,
  assertHookStable,
  generateReadme,
  loadDocFiles,
  loadExports,
  loadSources,
  runCli,
  sourceComment,
  spliceSections,
} from './generate-cli-readme.mjs';

/** @type {string[]} */
const tmpRoots = [];
afterAll(() => {
  for (const root of tmpRoots) fs.rmSync(root, {recursive: true, force: true});
});

/** Write `files` (relative path -> content) under a fresh directory. */
function writeTree(/** @type {Record<string, string>} */ files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-readme-'));
  tmpRoots.push(root);
  for (const [rel, content] of Object.entries(files)) {
    const file = path.join(root, rel);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, content);
  }
  return root;
}

const docModule = (/** @type {any} */ doc) =>
  `export const doc = ${JSON.stringify(doc, null, 2)};\n`;

const enumDoc = (/** @type {string} */ name, /** @type {any[]} */ members) => ({
  type: 'enum',
  name,
  displayName: name,
  description: `The ${name}.`,
  members,
});

const schemaDoc = (
  /** @type {string} */ name,
  /** @type {string[]} */ fields,
) => ({
  type: 'schema',
  name,
  displayName: name,
  description: `The ${name} file.`,
  fields: fields.map(field => ({
    name: field,
    type: 'string',
    description: `The ${field}.`,
  })),
});

/** A command doc with an option that inherits its text, defaults, and examples. */
const alphaCommand = {
  type: 'command',
  name: 'alpha',
  displayName: 'astryx alpha',
  summary: 'Do the alpha thing',
  fn: 'alpha',
  args: [{name: 'thing', param: 'thing', required: false}],
  options: [
    {flag: '--fast', description: 'Go fast'},
    {flag: '--limit <n>', param: 'options.limit'},
    {flag: '--out <dir>', description: 'Output directory', default: './out'},
    {flag: '--dry', description: 'Dry run', default: false},
    {flag: '--tag <name...>', description: 'Tags', default: []},
    {flag: '--pick <a...>', description: 'Picks', default: ['x', 'y']},
  ],
  examples: [
    {label: 'Run it', cli: 'astryx alpha'},
    {cli: 'astryx alpha --fast'},
  ],
};

const alphaFunction = {
  type: 'function',
  kind: 'api',
  name: 'alpha',
  displayName: 'alpha()',
  summary: 'The alpha function.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'alpha(thing?: string, options?: AlphaOptions): Promise<AlphaResponse>',
  params: [
    {name: 'thing', type: 'string', description: 'The thing.'},
    {name: 'options.limit', type: 'number', description: 'Max results.'},
  ],
  returns: [{type: 'alpha', description: 'The alpha.'}],
  command: 'alpha',
};

/**
 * A fixture CLI package on disk. Its `@astryxdesign/cli/api` and
 * `@astryxdesign/cli/json` entries export the documented functions, or
 * `exported` for the api entry. `functionPaths` moves a FunctionDoc.
 * @param {{
 *   commands?: any[],
 *   functions?: any[],
 *   exported?: string[],
 *   functionPaths?: Record<string, string>,
 *   errorCodes?: any[],
 *   responseTypes?: any[],
 *   config?: any,
 *   integration?: any,
 *   extra?: Record<string, string>,
 * }} spec
 */
function fixtureCli(spec) {
  const functions = spec.functions ?? [];
  const onPath = (/** @type {string} */ importPath) =>
    functions.filter(f => f.importPath === importPath).map(f => f.name);
  const moduleOf = (/** @type {string[]} */ names) =>
    names.map(name => `export async function ${name}() {}\n`).join('');
  /** @type {Record<string, string>} */
  const files = {
    'package.json': JSON.stringify({
      name: '@astryxdesign/cli',
      exports: {
        './api': {import: './api/index.mjs'},
        './json': {import: './api/json.mjs'},
      },
    }),
    'api/index.mjs': moduleOf(spec.exported ?? onPath('@astryxdesign/cli/api')),
    'api/json.mjs': moduleOf(onPath('@astryxdesign/cli/json')),
    'foundation/response/error-codes.doc.mjs': docModule(
      enumDoc('error-codes', spec.errorCodes ?? []),
    ),
    'foundation/response/response-types.doc.mjs': docModule(
      enumDoc('response-types', spec.responseTypes ?? []),
    ),
    'authoring/config/config.doc.mjs': docModule(
      spec.config ?? schemaDoc('config', ['integrations']),
    ),
    'authoring/integration/integration.doc.mjs': docModule(
      spec.integration ?? schemaDoc('integration', ['components']),
    ),
    // The commands directory exists even when a fixture documents none.
    'clients/cli/commands/.keep': '',
    ...spec.extra,
  };
  for (const command of spec.commands ?? []) {
    files[`clients/cli/commands/${command.name.split(' ').join('-')}.doc.mjs`] =
      docModule(command);
  }
  for (const fn of functions) {
    const file =
      spec.functionPaths?.[fn.name] ?? `api/${fn.name}/${fn.name}.doc.mjs`;
    files[file] = docModule(fn);
  }
  return writeTree(files);
}

/**
 * Load a fixture CLI's sources, standing in for the live CLI: the manifest
 * lists `live` (every documented command by default), and `docsSections` is
 * what `astryx docs <topic> --index` would list.
 * @param {string} root
 * @param {{live?: string[], docsSections?: Record<string, string[]>}} [stubs]
 */
async function sourcesOf(root, stubs = {}) {
  const docsSections = stubs.docsSections ?? {
    authoring: ['integration', 'config'],
    'cli-integrations': ['how-it-works'],
  };
  /** @type {string[] | undefined} */
  let live = stubs.live;
  if (live == null) {
    const commands = await loadDocFiles(
      path.join(root, 'clients/cli/commands'),
    );
    live = commands.map(c => c.name);
  }
  const liveNames = live;
  return loadSources({
    cliRoot: root,
    runCliJson: () => ({
      commands: liveNames.map(name => ({name, description: `${name}.`})),
    }),
    docsIndex: topic => docsSections[topic] ?? [],
  });
}

/** A README holding just the named sections, each with its source comment. */
function readmeWith(/** @type {string[]} */ names) {
  return names
    .map(name => {
      const section = SECTIONS.find(s => s.name === name);
      if (section == null) throw new Error(`no section ${name}`);
      return `## ${name}\n\n<!-- BEGIN GENERATED: ${name} -->\n<!-- END GENERATED: ${name} -->\n${sourceComment(section.source)}\n`;
    })
    .join('\n');
}

/**
 * Generate the named sections from a fixture CLI.
 * @param {string} root
 * @param {string[]} names
 * @param {{live?: string[], docsSections?: Record<string, string[]>}} [stubs]
 */
async function generate(root, names, stubs) {
  return generateReadme(readmeWith(names), await sourcesOf(root, stubs), {
    sections: SECTIONS.filter(s => names.includes(s.name)),
  });
}

/** The text between a section's markers, without the blank lines around it. */
function bodyOf(/** @type {string} */ readme, /** @type {string} */ name) {
  const start = readme.indexOf(`<!-- BEGIN GENERATED: ${name} -->`);
  const end = readme.indexOf(`<!-- END GENERATED: ${name} -->`);
  if (start < 0 || end < 0) throw new Error(`no ${name} section`);
  return readme
    .slice(start + `<!-- BEGIN GENERATED: ${name} -->`.length, end)
    .trim();
}

/** The README with every section body removed. */
function outsideOf(/** @type {string} */ readme) {
  return readme.replace(
    /(<!-- BEGIN GENERATED: (\S+) -->)[\s\S]*?(<!-- END GENERATED: \2 -->)/g,
    '$1$3',
  );
}

describe('text outside the markers', () => {
  const sections = [
    {
      name: 'alpha',
      source: 'the alpha source',
      render: () => '|x|y|\n|-|-|\n|1|2|',
    },
    {name: 'beta', source: 'the beta source', render: () => '* one\n* two'},
  ];
  // Prose prettier would rewrite: trailing spaces, `*` bullets, an unaligned
  // table, tabs, runs of blank lines, and no newline at the end.
  const readme =
    '# Title   \n\n*  star bullet\n*  another\n\n|a|b|\n|-|-|\n|1|2|\n\n\n\nSome   prose\twith tabs.\n\n' +
    '<!-- BEGIN GENERATED: alpha -->\nstale\n<!-- END GENERATED: alpha -->\n' +
    `${sourceComment('the alpha source')}\n\nMiddle   text  \n\n` +
    '<!-- BEGIN GENERATED: beta -->\n\nold\n\n<!-- END GENERATED: beta -->\n' +
    `${sourceComment('the beta source')}\nTrailing text, no newline at end`;

  it('is kept byte for byte while the sections are rewritten', async () => {
    const {content} = await generateReadme(readme, /** @type {any} */ ({}), {
      sections,
    });
    expect(outsideOf(content)).toBe(outsideOf(readme));
    expect(bodyOf(content, 'alpha')).toBe(
      '| x   | y   |\n| --- | --- |\n| 1   | 2   |',
    );
    expect(bodyOf(content, 'beta')).toBe('- one\n- two');
    // Formatting the whole file would have rewritten that prose.
    expect(
      outsideOf(await prettier.format(content, {parser: 'markdown'})),
    ).not.toBe(outsideOf(readme));
  });

  it('writes an empty section as one blank line between its markers', async () => {
    const {content} = await generateReadme(readme, /** @type {any} */ ({}), {
      sections: [sections[0], {...sections[1], render: () => ''}],
    });
    expect(content).toContain(
      '<!-- BEGIN GENERATED: beta -->\n\n<!-- END GENERATED: beta -->',
    );
    expect(outsideOf(content)).toBe(outsideOf(readme));
  });
});

describe('the commit hook', () => {
  it('leaves blocks formatted on their own as they are', async () => {
    await expect(
      assertHookStable([
        {name: 'a', text: '| x   | y   |\n| --- | --- |\n| 1   | 2   |'},
        {name: 'b', text: ''},
        {name: 'c', text: '- one\n- two'},
      ]),
    ).resolves.toBeUndefined();
  });

  it('would rewrite a block laid out differently from the whole-file pass', async () => {
    await expect(
      assertHookStable([
        {name: 'a', text: '- one'},
        {name: 'b', text: '|x|y|\n|-|-|\n|1|2|'},
      ]),
    ).rejects.toThrow(
      'Prettier lays out "b" differently inside the README than alone, so the commit hook would change it.',
    );
  });

  it('is checked before the README is written', async () => {
    const readme = `<!-- BEGIN GENERATED: b -->\n<!-- END GENERATED: b -->\n${sourceComment('b')}\n`;
    const sections = [{name: 'b', source: 'b', render: () => '|x|y|\n|-|-|'}];
    await expect(
      generateReadme(readme, /** @type {any} */ ({}), {
        sections,
        format: async markdown => markdown,
      }),
    ).rejects.toThrow('Prettier lays out "b" differently');
  });
});

describe('markers', () => {
  const block = {name: 'alpha', source: 'the alpha source', text: 'new'};
  const section = (
    /** @type {string} */ name,
    comment = sourceComment('the alpha source'),
  ) =>
    `<!-- BEGIN GENERATED: ${name} -->\nold\n<!-- END GENERATED: ${name} -->\n${comment}\n`;

  it('need the source comment on the line after END', () => {
    expect(spliceSections(section('alpha'), [block])).toContain('\n\nnew\n\n');
    expect(() => spliceSections(section('alpha', ''), [block])).toThrow(
      `README section "alpha" must be followed, on the next line, by:\n${sourceComment('the alpha source')}`,
    );
    expect(() =>
      spliceSections(section('alpha', sourceComment('an old source')), [block]),
    ).toThrow(/must be followed/);
  });

  it('must name a section the generator writes', () => {
    expect(() =>
      spliceSections(section('alpha') + section('ghost'), [block]),
    ).toThrow('README has a "ghost" section this generator does not write');
  });

  it('must be present for every section the generator writes', () => {
    expect(() => spliceSections('# nothing here\n', [block])).toThrow(
      'README markers for "alpha" not found.',
    );
  });

  it('may not repeat a section', () => {
    expect(() =>
      spliceSections(section('alpha') + section('alpha'), [block]),
    ).toThrow('README has two "alpha" sections.');
  });

  it('must pair up', () => {
    const nested =
      '<!-- BEGIN GENERATED: alpha -->\n<!-- BEGIN GENERATED: beta -->\n<!-- END GENERATED: beta -->\n<!-- END GENERATED: alpha -->\n';
    expect(() => spliceSections(nested, [block])).toThrow(/do not pair up/);
    const crossed =
      '<!-- BEGIN GENERATED: alpha -->\n<!-- END GENERATED: beta -->\n';
    expect(() => spliceSections(crossed, [block])).toThrow(/do not pair up/);
    const open = '<!-- BEGIN GENERATED: alpha -->\n';
    expect(() => spliceSections(open, [block])).toThrow(/do not pair up/);
    const twoEnds =
      '<!-- END GENERATED: alpha -->\nold\n<!-- END GENERATED: alpha -->\n';
    expect(() => spliceSections(twoEnds, [block])).toThrow(/do not pair up/);
    const twoBegins =
      '<!-- BEGIN GENERATED: alpha -->\nold\n<!-- BEGIN GENERATED: alpha -->\n';
    expect(() => spliceSections(twoBegins, [block])).toThrow(/do not pair up/);
  });
});

describe('commands', () => {
  const beta = {
    type: 'command',
    name: 'beta',
    displayName: 'astryx beta',
    summary: 'Do the beta thing',
    examples: [{label: 'Beta', cli: 'astryx beta'}],
  };
  const names = ['commands', 'command-reference'];

  it('render usage, options, defaults and examples from the CommandDoc', async () => {
    const root = fixtureCli({
      commands: [alphaCommand],
      functions: [alphaFunction],
    });
    const {content, warnings} = await generate(root, names);
    expect(warnings).toEqual([]);
    expect(bodyOf(content, 'command-reference')).toBe(
      [
        '### `astryx alpha [thing]`',
        '',
        'Do the alpha thing',
        '',
        '- `--fast`: Go fast',
        // No text of its own, so the FunctionDoc param's, as `--help` shows.
        '- `--limit <n>`: Max results.',
        '- `--out <dir>`: Output directory (default: `./out`)',
        '- `--dry`: Dry run',
        '- `--tag <name...>`: Tags',
        '- `--pick <a...>`: Picks (default: `x y`)',
        '',
        '```bash',
        '# Run it',
        'astryx alpha',
        'astryx alpha --fast',
        '```',
      ].join('\n'),
    );
    expect(bodyOf(content, 'commands')).toContain('| `alpha` | alpha.      |');
  });

  it('are added, renamed and removed with their CommandDocs', async () => {
    const base = await generate(fixtureCli({commands: [alphaCommand]}), names);
    const alphaText = bodyOf(base.content, 'command-reference');

    const added = await generate(
      fixtureCli({commands: [alphaCommand, beta]}),
      names,
    );
    const reference = bodyOf(added.content, 'command-reference');
    expect(reference).toBe(
      `${alphaText}\n\n### \`astryx beta\`\n\nDo the beta thing\n\n\`\`\`bash\n# Beta\nastryx beta\n\`\`\``,
    );
    expect(bodyOf(added.content, 'commands')).toContain('`beta`');

    const renamed = await generate(
      fixtureCli({commands: [{...alphaCommand, name: 'gamma'}]}),
      names,
    );
    const renamedText = bodyOf(renamed.content, 'command-reference');
    expect(renamedText).toContain('### `astryx gamma [thing]`');
    expect(renamedText).not.toContain('astryx alpha [thing]');
    expect(bodyOf(renamed.content, 'commands')).not.toContain('`alpha`');

    const removed = await generate(fixtureCli({commands: [beta]}), names);
    expect(bodyOf(removed.content, 'command-reference')).not.toContain('alpha');
    expect(bodyOf(removed.content, 'commands')).not.toContain('alpha');
  });

  it('follow option and example changes', async () => {
    const changed = {
      ...alphaCommand,
      options: [
        {flag: '--quick', description: 'Go fast'},
        {
          flag: '--out <dir>',
          description: 'Output directory',
          default: './out',
        },
        {flag: '--new', description: 'Something new'},
      ],
      examples: [{label: 'Run it quickly', cli: 'astryx alpha --quick'}],
    };
    const {content} = await generate(fixtureCli({commands: [changed]}), [
      'command-reference',
    ]);
    const text = bodyOf(content, 'command-reference');
    expect(text).toContain('- `--quick`: Go fast\n- `--out <dir>`');
    expect(text).toContain('- `--new`: Something new');
    expect(text).not.toContain('--fast');
    expect(text).not.toContain('--limit');
    expect(text).toContain('# Run it quickly\nastryx alpha --quick\n```');
    expect(text).not.toContain('# Run it\n');
  });

  it('put a group before its subcommands', async () => {
    const group = {
      type: 'command',
      name: 'grp',
      displayName: 'astryx grp',
      summary: 'A group',
      subcommands: ['sub'],
    };
    const sub = {
      type: 'command',
      name: 'grp sub',
      displayName: 'astryx grp sub',
      summary: 'A subcommand',
      args: [{name: 'files', required: true, variadic: true}],
    };
    // grp-sub.doc.mjs sorts before grp.doc.mjs on disk.
    const {content} = await generate(fixtureCli({commands: [group, sub]}), [
      'command-reference',
    ]);
    expect(bodyOf(content, 'command-reference')).toBe(
      '### `astryx grp`\n\nA group\n\n### `astryx grp sub <files...>`\n\nA subcommand',
    );
  });

  it('fail when a live command has no CommandDoc', async () => {
    const root = fixtureCli({commands: [alphaCommand]});
    await expect(
      generate(root, ['command-reference'], {live: ['alpha', 'beta']}),
    ).rejects.toThrow(
      'No CommandDoc under clients/cli/commands for: `astryx beta`.',
    );
  });

  it('leave out, with a warning, a CommandDoc for no live command', async () => {
    const root = fixtureCli({commands: [alphaCommand, beta]});
    const {content, warnings} = await generate(root, ['command-reference'], {
      live: ['beta'],
    });
    expect(bodyOf(content, 'command-reference')).not.toContain('alpha');
    expect(warnings).toEqual([
      'command-reference: `astryx alpha` is not a command; its CommandDoc is left out.',
    ]);
  });

  it('are read from CommandDocs only, skipping fixture directories', async () => {
    const root = fixtureCli({
      commands: [alphaCommand],
      extra: {
        'clients/cli/commands/codes.doc.mjs': docModule(enumDoc('codes', [])),
        'clients/cli/commands/__fixtures__/ghost.doc.mjs': docModule({
          ...beta,
          name: 'ghost',
        }),
      },
    });
    const sources = await sourcesOf(root, {live: ['alpha']});
    expect(sources.commandDocs.map(d => d.name)).toEqual(['alpha']);
  });

  it('name the CommandDoc a section needs when it is missing', async () => {
    await expect(
      generate(fixtureCli({commands: [alphaCommand]}), ['search-options']),
    ).rejects.toThrow('No CommandDoc for `astryx search`.');
  });

  it('list the doctor integration checks in the order the group gives', async () => {
    const check = (/** @type {string} */ name, /** @type {string} */ when) => ({
      type: 'command',
      name: `doctor integration ${name}`,
      displayName: `astryx doctor integration ${name}`,
      summary: `Check ${name}`,
      args: [{name: 'package', required: false}],
      exitCodes: [
        {code: 0, when: 'fine'},
        {code: 1, when},
      ],
    });
    const group = {
      type: 'command',
      name: 'doctor integration',
      displayName: 'astryx doctor integration',
      summary: 'Checks',
      subcommands: ['validate', 'docs'],
    };
    const root = fixtureCli({
      commands: [
        group,
        check('docs', 'a docs overlap is accidental'),
        check('validate', 'an issue is an error'),
      ],
    });
    const {content} = await generate(root, ['doctor-integration']);
    expect(bodyOf(content, 'doctor-integration').split('\n').slice(2)).toEqual([
      '| `doctor integration validate [package]` | Check validate | an issue is an error         |',
      '| `doctor integration docs [package]`     | Check docs     | a docs overlap is accidental |',
    ]);
  });
});

describe('API functions', () => {
  const beta = {
    ...alphaFunction,
    name: 'beta',
    displayName: 'beta()',
    summary: 'The beta function.',
    signature: 'beta(): BetaResponse',
    command: undefined,
  };
  const alphaLine =
    '- `alpha(thing?: string, options?: AlphaOptions): Promise<AlphaResponse>`: The alpha function. CLI: `astryx alpha`.';

  it('are added, renamed and removed with their FunctionDocs', async () => {
    const base = await generate(fixtureCli({functions: [alphaFunction]}), [
      'api-functions',
    ]);
    expect(bodyOf(base.content, 'api-functions')).toBe(
      `#### \`@astryxdesign/cli/api\`\n\n${alphaLine}`,
    );

    const added = await generate(
      fixtureCli({functions: [beta, alphaFunction]}),
      ['api-functions'],
    );
    expect(bodyOf(added.content, 'api-functions')).toBe(
      `#### \`@astryxdesign/cli/api\`\n\n${alphaLine}\n- \`beta(): BetaResponse\`: The beta function.`,
    );

    const renamed = await generate(
      fixtureCli({
        functions: [
          {
            ...alphaFunction,
            name: 'gamma',
            signature: 'gamma(): GammaResponse',
          },
        ],
      }),
      ['api-functions'],
    );
    const renamedText = bodyOf(renamed.content, 'api-functions');
    expect(renamedText).toContain(
      '- `gamma(): GammaResponse`: The alpha function.',
    );
    expect(renamedText).not.toContain('alpha(');

    const removed = await generate(fixtureCli({functions: [beta]}), [
      'api-functions',
    ]);
    expect(bodyOf(removed.content, 'api-functions')).not.toContain('alpha');
  });

  it('follow a signature change', async () => {
    const {content} = await generate(
      fixtureCli({
        functions: [
          {...alphaFunction, signature: 'alpha(thing: string): AlphaResponse'},
        ],
      }),
      ['api-functions'],
    );
    expect(bodyOf(content, 'api-functions')).toContain(
      '- `alpha(thing: string): AlphaResponse`: The alpha function.',
    );
  });

  it('are listed by name, wherever their docs live', async () => {
    const zeta = {...beta, name: 'zeta', signature: 'zeta(): ZetaResponse'};
    const root = fixtureCli({
      functions: [zeta, alphaFunction],
      functionPaths: {zeta: 'api/aaa/zeta.doc.mjs'},
    });
    const lines = bodyOf(
      (await generate(root, ['api-functions'])).content,
      'api-functions',
    ).split('\n');
    expect(lines.slice(2).map(line => line.slice(0, 8))).toEqual([
      '- `alpha',
      '- `zeta(',
    ]);
  });

  it('are grouped by import path, in order', async () => {
    const root = fixtureCli({
      functions: [
        {...alphaFunction, importPath: '@astryxdesign/cli/json'},
        beta,
      ],
    });
    const text = bodyOf(
      (await generate(root, ['api-functions'])).content,
      'api-functions',
    );
    expect(text).toBe(
      `#### \`@astryxdesign/cli/api\`\n\n- \`beta(): BetaResponse\`: The beta function.\n\n#### \`@astryxdesign/cli/json\`\n\n${alphaLine}`,
    );
  });

  it('fail when an exported function has no FunctionDoc', async () => {
    const root = fixtureCli({
      functions: [alphaFunction],
      exported: ['alpha', 'beta'],
    });
    await expect(generate(root, ['api-functions'])).rejects.toThrow(
      '@astryxdesign/cli/api exports functions with no FunctionDoc under api/: beta.',
    );
  });

  it('leave out, with a warning, a FunctionDoc the import path does not export', async () => {
    const root = fixtureCli({
      functions: [alphaFunction, beta],
      exported: ['alpha'],
    });
    const {content, warnings} = await generate(root, ['api-functions']);
    expect(bodyOf(content, 'api-functions')).not.toContain('beta');
    expect(warnings).toEqual([
      'api-functions: beta() is documented as part of @astryxdesign/cli/api, which does not export it; left out.',
    ]);
  });

  it('count functions only, not classes or values', async () => {
    const root = writeTree({
      'package.json': JSON.stringify({
        name: '@astryxdesign/cli',
        exports: {'./api': {import: './api/index.mjs'}, './json': './json.mjs'},
      }),
      'api/index.mjs':
        'export function plain() {}\nexport async function later() {}\nexport const arrow = () => {};\n' +
        'export class Failure extends Error {}\nexport const logger = {info() {}};\nexport const limit = 3;\n',
      'json.mjs': 'export function parse() {}\n',
    });
    expect(
      await loadExports(root, [
        '@astryxdesign/cli/api',
        '@astryxdesign/cli/json',
        '@astryxdesign/cli/missing',
        '@other/pkg',
        undefined,
      ]),
    ).toEqual({
      '@astryxdesign/cli/api': ['arrow', 'later', 'plain'],
      '@astryxdesign/cli/json': ['parse'],
      '@astryxdesign/cli/missing': [],
      '@other/pkg': [],
    });
  });
});

describe('enum members', () => {
  const codes = (/** @type {string[]} */ values) =>
    values.map(value => ({value, description: `${value} happened.`}));
  const rows = async (/** @type {string[]} */ values) =>
    bodyOf(
      (await generate(fixtureCli({errorCodes: codes(values)}), ['error-codes']))
        .content,
      'error-codes',
    )
      .split('\n')
      .slice(2)
      .map(row => row.split('|')[1].trim());

  it('are added, renamed and removed with the EnumDoc', async () => {
    expect(await rows(['ERR_A', 'ERR_B'])).toEqual(['`ERR_A`', '`ERR_B`']);
    expect(await rows(['ERR_A', 'ERR_B', 'ERR_C'])).toEqual([
      '`ERR_A`',
      '`ERR_B`',
      '`ERR_C`',
    ]);
    expect(await rows(['ERR_Z', 'ERR_B'])).toEqual(['`ERR_Z`', '`ERR_B`']);
    expect(await rows(['ERR_A'])).toEqual(['`ERR_A`']);
  });
});

describe('schema fields', () => {
  const pointer = async (
    /** @type {any} */ config,
    /** @type {Record<string, string[]>} */ docsSections = {
      authoring: ['config', 'settings'],
    },
  ) =>
    bodyOf(
      (await generate(fixtureCli({config}), ['config-fields'], {docsSections}))
        .content,
      'config-fields',
    );

  it('are added, renamed and removed with the SchemaDoc', async () => {
    expect(
      await pointer(schemaDoc('config', ['integrations', 'issuesUrl'])),
    ).toBe(
      "Fields: `integrations`, `issuesUrl`. Run `astryx docs authoring config` for each field's type and description.",
    );
    expect(
      await pointer(
        schemaDoc('config', ['integrations', 'issuesUrl', 'debug']),
      ),
    ).toContain('Fields: `integrations`, `issuesUrl`, `debug`.');
    expect(
      await pointer(schemaDoc('config', ['integrations', 'issueUrl'])),
    ).toContain('Fields: `integrations`, `issueUrl`.');
    expect(await pointer(schemaDoc('config', ['issuesUrl']))).toContain(
      'Fields: `issuesUrl`.',
    );
  });

  it('point at the section the SchemaDoc is served as', async () => {
    expect(await pointer(schemaDoc('settings', ['integrations']))).toContain(
      'Run `astryx docs authoring settings`',
    );
    await expect(
      pointer(schemaDoc('settings', ['integrations']), {authoring: ['config']}),
    ).rejects.toThrow('`astryx docs authoring` has no section "settings".');
  });

  it('never point at a docs section the CLI does not serve', async () => {
    const root = fixtureCli({});
    const {content} = await generate(root, ['integration-how-it-works']);
    expect(bodyOf(content, 'integration-how-it-works')).toBe(
      'Read it with `astryx docs cli-integrations how-it-works`.',
    );
    await expect(
      generate(root, ['integration-how-it-works'], {
        docsSections: {'cli-integrations': ['overview']},
      }),
    ).rejects.toThrow(
      '`astryx docs cli-integrations` has no section "how-it-works".',
    );
  });
});

describe('the command line', () => {
  /** A fixture every section can render from. */
  const fullCli = (/** @type {string} */ searchLimitText) =>
    fixtureCli({
      commands: [
        {
          type: 'command',
          name: 'search',
          displayName: 'astryx search',
          summary: 'Search',
          args: [{name: 'query', required: true}],
          options: [{flag: '--limit <n>', description: searchLimitText}],
        },
        {
          type: 'command',
          name: 'doctor integration',
          displayName: 'astryx doctor integration',
          summary: 'Checks',
          subcommands: ['validate'],
        },
        {
          type: 'command',
          name: 'doctor integration validate',
          displayName: 'astryx doctor integration validate',
          summary: 'Validate',
          exitCodes: [{code: 1, when: 'an issue is an error'}],
        },
      ],
      functions: [alphaFunction],
      errorCodes: [{value: 'ERR_A', description: 'A.'}],
      responseTypes: [{value: 'search', description: 'Results.'}],
    });
  const readme = `# CLI\n\nHand-written   intro.\n\n${readmeWith(SECTIONS.map(s => s.name))}\nHand-written outro.`;

  /** Run the command line against a README file, collecting its output. */
  async function run(
    /** @type {string[]} */ argv,
    /** @type {string} */ readmePath,
    /** @type {string} */ root,
  ) {
    /** @type {string[]} */
    const log = [];
    /** @type {string[]} */
    const error = [];
    const code = await runCli(argv, {
      readmePath,
      load: () => sourcesOf(root),
      log: message => log.push(message),
      error: message => error.push(message),
    });
    return {code, log: log.join('\n'), error: error.join('\n')};
  }

  it('writes the README, then --check passes', async () => {
    const root = fullCli('Max results');
    const readmePath = path.join(writeTree({'README.md': readme}), 'README.md');
    expect((await run([], readmePath, root)).code).toBe(0);
    const written = fs.readFileSync(readmePath, 'utf8');
    expect(bodyOf(written, 'search-options')).toBe(
      '- `--limit <n>`: Max results',
    );
    expect(outsideOf(written)).toBe(outsideOf(readme));
    const checked = await run(['--check'], readmePath, root);
    expect(checked).toMatchObject({
      code: 0,
      log: 'README generated sections are in sync.',
    });
  });

  it('--check fails on drift, names the section and the fix, and writes nothing', async () => {
    const readmePath = path.join(writeTree({'README.md': readme}), 'README.md');
    await run([], readmePath, fullCli('Max results'));
    const before = fs.readFileSync(readmePath, 'utf8');

    const checked = await run(['--check'], readmePath, fullCli('Most results'));
    expect(checked.code).toBe(1);
    expect(checked.error).toBe(
      `README generated sections are out of date: search-options, command-reference.\nRun: ${REGENERATE}`,
    );
    expect(fs.readFileSync(readmePath, 'utf8')).toBe(before);
  });
});
