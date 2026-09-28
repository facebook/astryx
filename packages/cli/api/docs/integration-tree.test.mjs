// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration docs in the docs tree (spec:AST-046, spec:AST-047): an
 * integration's namespace docs and placed guides join the CLI's tree with the
 * same moves, links, search, and doctor checks, named by its provider id.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {docs} from './docs.mjs';
import {loadDocsCatalog} from './_adapter.mjs';
import {search} from '../search/search.mjs';
import {checkDocsTree} from '../doctor/doctor.mjs';
import {integrationDocConflicts} from '../integration/authoring-checks.mjs';

const SLOW = 60_000;

/** @type {string} */
let tmpDir;

const NAMESPACE = {
  type: 'namespace',
  name: 'acme',
  title: 'Acme',
  summary: 'Everything about the Acme kit.',
  slots: {guides: {title: 'Guides', accepts: {kinds: ['generic']}}},
};

/**
 * A guide placed in the acme namespace.
 * @param {string} name
 * @param {object} [fields]
 */
function guide(name, fields = {}) {
  return {
    type: 'generic',
    name,
    title: `Acme ${name}`,
    description: `How to ${name} the Acme kit.`,
    placement: {parent: 'namespace:acme', slot: 'guides'},
    sections: [
      {title: 'Overview', content: [{type: 'prose', text: `Do ${name}.`}]},
    ],
    ...fields,
  };
}

/** The docs of a small integration: a namespace, two guides, and a topic. */
function kit() {
  return {
    'acme.doc.mjs': NAMESPACE,
    'setup.doc.mjs': guide('setup', {
      placement: {parent: 'namespace:acme', slot: 'guides', order: 1},
      sections: [
        {
          title: 'Install',
          content: [
            {
              type: 'prose',
              text: 'Frobnicate the kit, then check it with {@link @astryxdesign/cli:command:doctor}.',
            },
            {type: 'prose', text: 'Next: {@link generic:deploy}.'},
          ],
        },
        {
          title: 'Configure',
          content: [{type: 'prose', text: 'Add it to astryx.config.'}],
        },
      ],
    }),
    'deploy.doc.mjs': guide('deploy', {
      placement: {parent: 'namespace:acme', slot: 'guides', order: 2},
    }),
    'notes.doc.mjs': {
      type: 'generic',
      name: 'acme-notes',
      title: 'Acme notes',
      description: 'Notes about the kit.',
      sections: [
        {
          title: 'Start',
          content: [{type: 'prose', text: 'Start at {@link generic:setup}.'}],
        },
      ],
    },
  };
}

/** A guide whose only link names no doc. */
const broken = () =>
  guide('broken', {
    sections: [
      {
        title: 'Overview',
        content: [{type: 'prose', text: 'See {@link generic:nope}.'}],
      },
    ],
  });

/**
 * A consumer project that configures `@acme/kit`, whose manifest names a
 * provider id that differs from its package name.
 * @param {Record<string, object>} files
 */
function scaffold(files) {
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'consumer'}),
  );
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.config.mjs'),
    "export default {integrations: ['@acme/kit']};\n",
  );
  const pkgDir = path.join(tmpDir, 'node_modules', '@acme', 'kit');
  fs.mkdirSync(path.join(pkgDir, 'docs'), {recursive: true});
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({name: '@acme/kit', version: '1.0.0'}),
  );
  fs.writeFileSync(
    path.join(pkgDir, 'astryx.integration.mjs'),
    "export default {docs: './docs', providerId: '@acme/tree-provider'};\n",
  );
  for (const [file, doc] of Object.entries(files)) {
    fs.writeFileSync(
      path.join(pkgDir, 'docs', file),
      `export const docs = ${JSON.stringify(doc, null, 2)};\n`,
    );
  }
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(
    path.join(process.cwd(), '.astryx-integration-tree-test-'),
  );
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('integration docs in the docs tree', () => {
  it('lists an integration namespace beside the CLI, named by its provider id', async () => {
    scaffold(kit());
    const listed = await docs(undefined, undefined, {cwd: tmpDir});
    expect(listed.data).toContainEqual({
      topic: 'acme',
      description: 'Everything about the Acme kit.',
      package: '@acme/kit',
      kind: 'namespace',
    });
    const top = await docs('acme', undefined, {cwd: tmpDir});
    expect(top.type).toBe('docs.node');
    expect(top.data).toMatchObject({
      id: 'astryx:artifact:v1/%40acme%2Ftree-provider/namespace/acme',
      package: '@acme/kit',
      links: {up: 'astryx docs'},
    });
    expect(
      top.data.slots[0].children.map((/** @type {any} */ c) => c.route),
    ).toEqual(['acme/setup', 'acme/deploy']);
  }, SLOW);

  it('reads a placed guide one level at a time, with its links resolved', async () => {
    scaffold(kit());
    const index = await docs('acme/setup', undefined, {cwd: tmpDir, index: true});
    expect(index.type).toBe('docs.index');
    expect(index.data.links.up).toBe('astryx docs acme');
    const install = await docs('acme/setup', 'install', {cwd: tmpDir});
    const [prose, next] = install.data.content;
    expect(prose.text).toBe(
      'Frobnicate the kit, then check it with `astryx docs cli/commands/doctor`.',
    );
    expect(next.text).toBe('Next: `astryx docs acme/deploy`.');
    const notes = await docs('acme-notes', undefined, {cwd: tmpDir});
    expect(notes.data.sections[0].content[0].text).toBe(
      'Start at `astryx docs acme/setup`.',
    );
  }, SLOW);

  it('finds a section of the guide by search, with its package and parent', async () => {
    scaffold(kit());
    const {data} = await search('frobnicate', {cwd: tmpDir, type: 'doc'});
    expect(data.results[0]).toMatchObject({
      name: 'acme/setup',
      section: 'install',
      command: 'astryx docs acme/setup install',
      parent: 'astryx docs acme/setup --index',
      package: '@acme/kit',
    });
  }, SLOW);

  it('passes doctor, and warns on a link that names no doc', async () => {
    scaffold(kit());
    const ok = await checkDocsTree({
      docsCatalog: await loadDocsCatalog(tmpDir),
    });
    expect(ok).toMatchObject({id: 'docs-tree', status: 'pass'});
    scaffold({...kit(), 'broken.doc.mjs': broken()});
    const bad = await checkDocsTree({
      docsCatalog: await loadDocsCatalog(tmpDir),
    });
    expect(bad.status).toBe('warn');
    expect(bad.message).toContain('acme/broken');
    expect(bad.message).toContain('"generic:nope" names no doc');
  }, SLOW);

  it('runs the same checks inside the package: doctor integration docs', async () => {
    scaffold({...kit(), 'broken.doc.mjs': broken()});
    const result = await integrationDocConflicts('@acme/kit', {cwd: tmpDir});
    expect(result.data.issues).toContainEqual(
      expect.objectContaining({
        code: 'invalid_doc_graph',
        severity: 'warning',
        message: expect.stringContaining('"generic:nope" names no doc'),
      }),
    );
  }, SLOW);

  it("resolves an extension's links against the extension's provider, not the base topic's", async () => {
    scaffold({
      ...kit(),
      'integrations.doc.mjs': guide('integrations'),
      'theme-acme.doc.mjs': {
        type: 'generic',
        name: 'theme-acme',
        title: 'Acme theming',
        description: 'Acme notes on theming.',
        extends: 'theme',
        sections: [
          {
            title: 'Acme theming notes',
            content: [
              {
                type: 'prose',
                text: 'See {@link generic:integrations}, and {@link @astryxdesign/cli:generic:tokens} for the tokens.',
              },
            ],
          },
        ],
      },
    });
    const {data} = await docs('theme', 'acme-theming-notes', {cwd: tmpDir});
    // `generic:integrations` is the extension's own guide, never the CLI's
    // `cli/integrations`; a provider-qualified link reaches the CLI's topic.
    expect(data.content[0].text).toBe(
      'See `astryx docs acme/integrations`, and `astryx docs tokens` for the tokens.',
    );
    // The CLI's own sections of the topic still resolve against the CLI.
    const full = await docs('theme', undefined, {cwd: tmpDir});
    expect(JSON.stringify(full.data)).not.toContain('{@link');
  }, SLOW);

  it("warns, in the project and in the package, on an extension link that names no doc of its provider", async () => {
    scaffold({
      ...kit(),
      'theme-acme.doc.mjs': {
        type: 'generic',
        name: 'theme-acme',
        title: 'Acme theming',
        description: 'Acme notes on theming.',
        extends: 'theme',
        sections: [
          {
            title: 'Acme theming notes',
            content: [{type: 'prose', text: 'See {@link generic:tokens}.'}],
          },
        ],
      },
    });
    const check = await checkDocsTree({
      docsCatalog: await loadDocsCatalog(tmpDir),
    });
    expect(check.status).toBe('warn');
    expect(check.message).toContain('"generic:tokens" names no doc');
    const result = await integrationDocConflicts('@acme/kit', {cwd: tmpDir});
    expect(result.data.issues).toContainEqual(
      expect.objectContaining({
        code: 'invalid_doc_graph',
        message: expect.stringContaining('"generic:tokens" names no doc'),
      }),
    );
  }, SLOW);

  it('keeps the CLI route when an integration claims it, and names the claim', async () => {
    scaffold({'cli.doc.mjs': {...NAMESPACE, name: 'cli', title: 'Not the CLI'}});
    const top = await docs('cli', undefined, {cwd: tmpDir});
    expect(top.data.package).toBe('@astryxdesign/cli');
    const check = await checkDocsTree({
      docsCatalog: await loadDocsCatalog(tmpDir),
    });
    expect(check.status).toBe('warn');
    expect(check.message).toContain('both have the route "cli"');
  }, SLOW);
});
