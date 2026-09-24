// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the CLI docs reader. Every command, API function, schema, and
 * enum doc this package ships is readable in the topic its namespace names.
 * Each way one can fail to be is reported: no namespace, a namespace no topic
 * reads, a clash with the authoring topic's list, a doc that does not load, and
 * two `cli` sections with one key.
 *
 * @input This package's own docs, and fixture doc trees written under the
 *   working directory.
 * @output Assertions on the audit, the `cli` topic, and reads through `docs()`.
 * @position packages/cli/foundation/discovery — tests for cli-self-docs.mjs.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {afterAll, describe, expect, it} from 'vitest';
import {
  CLI_DOC_NAMESPACES,
  auditCliSelfDocs,
  buildCliReferenceDoc,
  cliSectionKey,
  discoverCliSelfDocSources,
  keySegment,
} from './cli-self-docs.mjs';

const SLOW = 60_000;

/** @type {string[]} */
const tmpRoots = [];
afterAll(() => {
  for (const root of tmpRoots) fs.rmSync(root, {recursive: true, force: true});
});

/** Write `files` (relative path -> content) under a fresh directory. */
function writeTree(/** @type {Record<string, string>} */ files) {
  const root = fs.mkdtempSync(path.join(process.cwd(), '.astryx-cli-docs-'));
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

const command = (/** @type {string} */ name, extra = {}) => ({
  type: 'command',
  name,
  displayName: `astryx ${name}`,
  namespace: 'cli/commands',
  summary: `Do ${name}`,
  ...extra,
});

const fn = (/** @type {string} */ name, extra = {}) => ({
  type: 'function',
  kind: 'api',
  name,
  displayName: `${name}()`,
  namespace: 'cli/api',
  summary: `The ${name} function.`,
  importPath: '@astryxdesign/cli/api',
  params: [],
  returns: [{type: name, description: 'The result.'}],
  ...extra,
});

const enumDoc = (/** @type {string} */ name, extra = {}) => ({
  type: 'enum',
  name,
  displayName: name,
  namespace: 'cli/api',
  description: `The ${name}.`,
  members: [{value: 'A', description: 'The a.'}],
  ...extra,
});

const schema = (/** @type {string} */ name, extra = {}) => ({
  type: 'schema',
  name,
  displayName: name,
  namespace: 'authoring',
  description: `The ${name} file.`,
  fields: [{name: 'x', type: 'string', description: 'The x.'}],
  ...extra,
});

/** Audit a fixture tree with nothing in the authoring topic's list. */
const audit = (/** @type {string} */ root, authoringSources = []) =>
  auditCliSelfDocs({root, authoringSources});

describe('the CLI docs this package ships', () => {
  it(
    'are not all readable yet: 41 have no namespace and 42 name one no topic reads',
    async () => {
      const result = await auditCliSelfDocs();
      expect(result.missing).toHaveLength(41);
      expect(result.missing.every(source => source.startsWith('api/'))).toBe(true);
      expect(result.unknown).toHaveLength(42);
      expect(new Set(result.unknown.map(entry => entry.namespace))).toEqual(
        new Set(['cli']),
      );
      expect(result.failed).toEqual([]);
    },
    SLOW,
  );
});

describe('auditCliSelfDocs', () => {
  it('reports a doc with no namespace, and one no topic reads', async () => {
    const root = writeTree({
      'api/alpha/alpha.doc.mjs': docModule(fn('alpha', {namespace: undefined})),
      'clients/cli/commands/beta.doc.mjs': docModule(
        command('beta', {namespace: 'cli'}),
      ),
      'api/gamma/gamma.doc.mjs': docModule(fn('gamma')),
    });
    const result = await audit(root);
    expect(result.missing).toEqual(['api/alpha/alpha.doc.mjs']);
    expect(result.unknown).toEqual([
      {source: 'clients/cli/commands/beta.doc.mjs', namespace: 'cli'},
    ]);
    expect(result.sections).toBe(1);
  });

  it('holds the authoring namespace to the authoring topic list', async () => {
    const root = writeTree({
      'authoring/x/x.doc.mjs': docModule(schema('x')),
      'authoring/y/y.doc.mjs': docModule(schema('y', {namespace: 'cli/api'})),
      'authoring/z/z.doc.mjs': docModule(schema('z')),
    });
    const result = await audit(root, ['y/y.doc.mjs', 'z/z.doc.mjs']);
    expect(result.misfiled.map(entry => entry.message)).toEqual([
      'authoring/x/x.doc.mjs has namespace "authoring", but `astryx docs authoring` does not list it',
      'authoring/y/y.doc.mjs is read in `astryx docs authoring`, but its namespace is "cli/api"',
    ]);
    expect(result.authoring).toBe(1);
  });

  it('reports a doc that fails to load, and skips fixture directories', async () => {
    const root = writeTree({
      'api/bad/bad.doc.mjs': 'throw new Error("boom");\n',
      'api/__fixtures__/ghost.doc.mjs': docModule(fn('ghost')),
      'foundation/.hidden/hidden.doc.mjs': docModule(fn('hidden')),
      'foundation/codes.doc.mjs': docModule(enumDoc('codes')),
    });
    expect(discoverCliSelfDocSources(root)).toEqual([
      'api/bad/bad.doc.mjs',
      'foundation/codes.doc.mjs',
    ]);
    const result = await audit(root);
    expect(result.failed).toEqual([
      expect.objectContaining({
        source: 'api/bad/bad.doc.mjs',
        error: expect.stringContaining('boom'),
      }),
    ]);
    expect(result.sections).toBe(1);
  });

  it('reports two cli sections that share a key', async () => {
    const root = writeTree({
      'api/a/fooBar.doc.mjs': docModule(fn('fooBar')),
      'api/b/foo_bar.doc.mjs': docModule(fn('foo_bar')),
    });
    const result = await audit(root);
    expect(result.keyProblems).toHaveLength(1);
    expect(result.keyProblems[0]).toContain('api-foo-bar');
  });
});

describe('buildCliReferenceDoc', () => {
  it('keeps a command and the function it runs apart, and links them', () => {
    const topic = buildCliReferenceDoc([
      fn('docs', {command: 'docs'}),
      command('docs', {fn: 'docs'}),
    ]);
    expect(topic.sections.map(s => s.id)).toEqual([
      'commands-docs',
      'api-docs',
    ]);
    expect(JSON.stringify(topic.sections[0].content)).toContain(
      'It runs `docs()` from `@astryxdesign/cli/api`. Read it with `astryx docs cli api-docs`.',
    );
    expect(JSON.stringify(topic.sections[1].content)).toContain(
      '`astryx docs` runs it. Read it with `astryx docs cli commands-docs`.',
    );
  });

  it('renders a command: usage, arguments, options, examples, exit codes, subcommands', () => {
    const topic = buildCliReferenceDoc([
      command('grp', {subcommands: ['sub', 'gone']}),
      command('grp sub', {
        description: 'The long form.',
        fn: 'grpSub',
        args: [
          {name: 'files', required: true, variadic: true, description: 'Files.'},
        ],
        options: [
          {flag: '--fast', description: 'Go fast'},
          {
            flag: '--mode <m>',
            description: 'Mode',
            choices: ['a', 'b'],
            default: 'a',
          },
          {flag: '--limit <n>', param: 'options.limit'},
          {flag: '--dry', description: 'Dry run.', default: false},
        ],
        examples: [
          {label: 'Run it', cli: 'astryx grp sub x'},
          {cli: 'astryx grp sub y'},
        ],
        exitCodes: [{code: 1, when: 'it fails'}],
      }),
      fn('grpSub', {
        params: [{name: 'options.limit', type: 'number', description: 'Max.'}],
      }),
    ]);
    const [group, sub] = topic.sections;
    expect(group.content).toContainEqual({
      type: 'list',
      style: 'unordered',
      items: ['`astryx grp sub`: `astryx docs cli commands-grp-sub`'],
    });
    expect(sub).toMatchObject({id: 'commands-grp-sub', title: 'astryx grp sub'});
    expect(sub.content).toEqual([
      {type: 'prose', text: 'Do grp sub'},
      {type: 'prose', text: 'The long form.'},
      {type: 'code', lang: 'bash', code: 'astryx grp sub <files...>'},
      {
        type: 'table',
        headers: ['Argument', 'Description'],
        rows: [['`files`', 'Files.']],
      },
      {
        type: 'table',
        headers: ['Option', 'Description'],
        rows: [
          ['`--fast`', 'Go fast'],
          ['`--mode <m>`', 'Mode. One of: `a`, `b`. Default: `a`.'],
          ['`--limit <n>`', 'Max.'],
          ['`--dry`', 'Dry run.'],
        ],
      },
      {
        type: 'code',
        lang: 'bash',
        code: '# Run it\nastryx grp sub x\nastryx grp sub y',
      },
      {
        type: 'table',
        headers: ['Exit code', 'When'],
        rows: [['1', 'it fails']],
      },
      {
        type: 'prose',
        text: 'It runs `grpSub()` from `@astryxdesign/cli/api`. Read it with `astryx docs cli api-grp-sub`.',
      },
    ]);
  });

  it('renders an API function and an enum', () => {
    const topic = buildCliReferenceDoc([
      fn('alpha', {
        description: 'Longer.',
        signature: 'alpha(x: string): Promise<Alpha>',
        params: [{name: 'x', type: 'string', description: 'The x.'}],
        throws: [{code: 'ERR_X', when: 'x is bad'}],
        examples: [{label: 'Call it', code: "await alpha('x');"}],
      }),
      enumDoc('codes', {
        members: [
          {value: 'A', description: 'The a.'},
          {value: 'B', description: 'The b.', deprecated: 'Use A.'},
        ],
      }),
    ]);
    expect(topic.sections[0].content).toEqual([
      {type: 'prose', text: 'The alpha function.'},
      {type: 'prose', text: 'Longer.'},
      {type: 'code', lang: 'ts', code: 'alpha(x: string): Promise<Alpha>'},
      {type: 'prose', text: 'Import it from `@astryxdesign/cli/api`.'},
      {
        type: 'table',
        headers: ['Parameter', 'Type', 'Description'],
        rows: [['`x`', '`string`', 'The x.']],
      },
      {
        type: 'table',
        headers: ['Returns', 'Description'],
        rows: [['`alpha`', 'The result.']],
      },
      {
        type: 'table',
        headers: ['Throws', 'When'],
        rows: [['`ERR_X`', 'x is bad']],
      },
      {type: 'code', lang: 'ts', label: 'Call it', code: "await alpha('x');"},
    ]);
    expect(topic.sections[1]).toEqual({
      id: 'api-codes',
      title: 'codes',
      content: [
        {type: 'prose', text: 'The codes.'},
        {
          type: 'table',
          headers: ['Value', 'Meaning'],
          rows: [
            ['`A`', 'The a.'],
            ['`B`', 'The b. Deprecated: Use A.'],
          ],
        },
      ],
    });
  });

  it('orders commands, then functions, schemas, and enums, and leaves other namespaces out', () => {
    const topic = buildCliReferenceDoc([
      enumDoc('codes'),
      schema('output', {namespace: 'cli/api'}),
      fn('beta'),
      schema('config'),
      command('zed'),
      fn('alpha'),
      command('abc'),
      fn('gone', {namespace: 'somewhere'}),
    ]);
    expect(topic.sections.map(s => s.id)).toEqual([
      'commands-abc',
      'commands-zed',
      'api-alpha',
      'api-beta',
      'api-output',
      'api-codes',
    ]);
  });
});

describe('section keys', () => {
  it('join lowercase words with hyphens, whatever the name looks like', () => {
    expect(keySegment('integrationPackCheck')).toBe('integration-pack-check');
    expect(keySegment('doctor integration validate')).toBe(
      'doctor-integration-validate',
    );
    expect(keySegment('error-codes')).toBe('error-codes');
    expect(keySegment('isError')).toBe('is-error');
  });

  it('come from the namespace a doc declares, and only a cli one', () => {
    expect(cliSectionKey(fn('search'))).toBe('api-search');
    expect(cliSectionKey(command('theme add'))).toBe('commands-theme-add');
    expect(cliSectionKey(schema('config'))).toBeNull();
    expect(cliSectionKey(fn('x', {namespace: 'cli'}))).toBeNull();
    expect(Object.keys(CLI_DOC_NAMESPACES)).toEqual([
      'cli/commands',
      'cli/api',
      'authoring',
    ]);
  });
});
