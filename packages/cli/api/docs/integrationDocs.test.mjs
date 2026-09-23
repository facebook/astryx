// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file End-to-end tests for integration-contributed doc topics: a scaffolded
 * consumer project whose configured integration ships a `docs` root, read back
 * through the public surfaces — `docs()`, `search()`, and the agent-docs block.
 *
 * The unit-level rules (what a docs root contributes, what the catalog does
 * with `replaces`/`extends`) are covered in
 * foundation/discovery/docs-discovery.test.mjs. What is pinned here is that a
 * contributed topic is indistinguishable from a built-in one at the surfaces
 * an agent actually reads.
 *
 * Fixtures live under a repo-local temp dir, not /tmp, because Vite refuses to
 * dynamically import a module from outside the project root.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {docs} from './docs.mjs';
import {search} from '../search/search.mjs';
import {loadDocsCatalog, loadReferenceDocs} from './_adapter.mjs';
import {AstryxError} from '../error.mjs';

const SLOW = 30_000;

let tmpDir;

/** A minimal, valid topic. */
function topic(fields) {
  return {
    type: 'generic',
    name: 'deploying',
    title: 'Deploying',
    description: 'How to ship an app built with Acme widgets.',
    category: 'guide',
    sections: [
      {title: 'Overview', content: [{type: 'prose', text: 'Push the button.'}]},
    ],
    ...fields,
  };
}

/**
 * A consumer project that configures one integration, optionally with a docs
 * root holding the given topics.
 * @param {Record<string, object|string>} [topics] file name → doc
 * @param {{config?: string}} [options]
 */
function scaffold(topics, {config} = {}) {
  fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({name: 'consumer'}));
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.config.mjs'),
    config ?? "export default {integrations: ['@acme/widgets']};\n",
  );

  const pkgDir = path.join(tmpDir, 'node_modules', '@acme', 'widgets');
  fs.mkdirSync(pkgDir, {recursive: true});
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({name: '@acme/widgets', version: '1.0.0'}),
  );
  fs.writeFileSync(
    path.join(pkgDir, 'astryx.integration.mjs'),
    `export default ${JSON.stringify(topics ? {docs: './docs'} : {})};\n`,
  );

  if (topics) {
    const docsDir = path.join(pkgDir, 'docs');
    fs.mkdirSync(docsDir, {recursive: true});
    for (const [file, doc] of Object.entries(topics)) {
      fs.writeFileSync(
        path.join(docsDir, file),
        typeof doc === 'string'
          ? doc
          : `export const docs = ${JSON.stringify(doc, null, 2)};\n`,
      );
    }
  }
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-integration-docs-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('integration-contributed topics', () => {
  it('lists and reads like a built-in topic, naming its owner', async () => {
    scaffold({'deploying.doc.mjs': topic()});

    const listed = await docs(undefined, undefined, {cwd: tmpDir});
    const entry = listed.data.find(t => t.topic === 'deploying');
    expect(entry).toMatchObject({
      topic: 'deploying',
      description: 'How to ship an app built with Acme widgets.',
      package: '@acme/widgets',
    });
    // The built-in topics keep their own owner.
    expect(listed.data.find(t => t.topic === 'tokens').package).toBe('@astryxdesign/cli');

    const detail = await docs('deploying', undefined, {cwd: tmpDir});
    expect(detail.type).toBe('docs.detail');
    expect(detail.data.sections[0].content[0].text).toBe('Push the button.');

    const section = await docs('deploying', 'overview', {cwd: tmpDir});
    expect(section.data.title).toBe('Overview');
  }, SLOW);

  it('is invisible to a project that does not configure the integration', async () => {
    scaffold({'deploying.doc.mjs': topic()}, {config: 'export default {};\n'});
    const listed = await docs(undefined, undefined, {cwd: tmpDir});
    expect(listed.data.some(t => t.topic === 'deploying')).toBe(false);
  }, SLOW);

  it('serves the replacement of a built-in topic, and says what it replaced', async () => {
    scaffold({
      'getting-started.doc.mjs': topic({
        name: 'getting-started',
        replaces: 'getting-started',
        title: 'Getting started',
        description: 'Install Acme widgets.',
        sections: [
          {title: 'Install', content: [{type: 'prose', text: 'yarn add @acme/widgets'}]},
        ],
      }),
    });

    const detail = await docs('getting-started', undefined, {cwd: tmpDir});
    expect(detail.data.sections.map(s => s.title)).toEqual(['Install']);
    expect(detail.data.sections[0].content[0].text).toBe('yarn add @acme/widgets');

    const listed = await docs(undefined, undefined, {cwd: tmpDir});
    const entries = listed.data.filter(t => t.topic === 'getting-started');
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      package: '@acme/widgets',
      replaces: 'getting-started',
    });
  }, SLOW);

  it('keeps the replaced name resolving when the replacement renames it', async () => {
    scaffold({
      'setup.doc.mjs': topic({name: 'setup', replaces: 'getting-started'}),
    });
    const byOldName = await docs('getting-started', undefined, {cwd: tmpDir});
    const byNewName = await docs('setup', undefined, {cwd: tmpDir});
    expect(byOldName.data.name).toBe('setup');
    expect(byNewName.data.name).toBe('setup');
  }, SLOW);

  it('merges an extension into the topic it extends', async () => {
    const builtin = await docs('theme');
    const baseSectionTitle = builtin.data.sections[0].title;
    scaffold({
      'theme-internal.doc.mjs': topic({
        name: 'theme-internal',
        extends: 'theme',
        sections: [
          {title: baseSectionTitle, content: [{type: 'prose', text: 'Use the Acme theme.'}]},
          {title: 'Acme themes', content: [{type: 'prose', text: 'Three of them.'}]},
        ],
      }),
    });

    const extended = await docs('theme', undefined, {cwd: tmpDir});
    // The extension is not a topic of its own.
    expect((await docs(undefined, undefined, {cwd: tmpDir})).data.some(
      t => t.topic === 'theme-internal',
    )).toBe(false);
    expect(extended.data.sections[0].content[0].text).toBe('Use the Acme theme.');
    expect(extended.data.sections.at(-1).title).toBe('Acme themes');
    // Everything the extension did not name is still the base doc's.
    expect(extended.data.sections.length).toBe(builtin.data.sections.length + 1);
  }, SLOW);

  it('offers the contributed topics as suggestions on an unknown one', async () => {
    scaffold({'deploying.doc.mjs': topic()});
    await expect(docs('nope-not-a-topic', undefined, {cwd: tmpDir})).rejects.toBeInstanceOf(
      AstryxError,
    );
    try {
      await docs('nope-not-a-topic', undefined, {cwd: tmpDir});
    } catch (err) {
      expect(err.suggestions.map(s => s.name)).toContain('deploying');
    }
  }, SLOW);

  it('indexes a contributed topic in search', async () => {
    scaffold({'deploying.doc.mjs': topic()});
    const {data} = await search('deploying', {cwd: tmpDir, type: 'doc'});
    expect(data.results[0]).toMatchObject({
      domain: 'doc',
      name: 'deploying',
      command: 'astryx docs deploying',
    });
  }, SLOW);

  describe('under ASTRYX_NO_PROJECT_CODE=1', () => {
    afterEach(() => {
      delete process.env.ASTRYX_NO_PROJECT_CODE;
      delete globalThis.__astryxTopicProbe;
    });

    it('keeps the catalog on built-in topics and never reads the config', async () => {
      scaffold({'deploying.doc.mjs': topic()}, {
        config:
          "globalThis.__astryxTopicProbe = true;\nexport default {integrations: ['@acme/widgets']};\n",
      });
      process.env.ASTRYX_NO_PROJECT_CODE = '1';
      const catalog = await loadDocsCatalog(tmpDir);
      expect(catalog.resolve('tokens')).toBeTruthy();
      expect(catalog.resolve('deploying')).toBeUndefined();
      expect(globalThis.__astryxTopicProbe).toBeUndefined();
    }, SLOW);

    it('refuses to load a topic module from outside the CLI, while built-ins still load', async () => {
      // The catalog never holds a project topic under the gate, so the
      // detail loader is exercised directly here.
      scaffold({
        'deploying.doc.mjs': `globalThis.__astryxTopicProbe = true;\nexport const docs = ${JSON.stringify(topic())};\n`,
      });
      const projectTopic = path.join(
        tmpDir, 'node_modules', '@acme', 'widgets', 'docs', 'deploying.doc.mjs',
      );
      process.env.ASTRYX_NO_PROJECT_CODE = '1';
      await expect(loadReferenceDocs(projectTopic)).rejects.toThrow(/ASTRYX_NO_PROJECT_CODE/);
      expect(globalThis.__astryxTopicProbe).toBeUndefined();

      const builtIn = (await loadDocsCatalog(tmpDir)).resolve('tokens');
      const loaded = await loadReferenceDocs(builtIn.path, {lang: 'dense'});
      expect(loaded.name).toBe('tokens');
    }, SLOW);
  });

  it("falls back to the CLI's own topics when the project config is unreadable", async () => {
    scaffold({'deploying.doc.mjs': topic()}, {config: 'export default {integrations: 42};\n'});
    const catalog = await loadDocsCatalog(tmpDir);
    expect(catalog.resolve('tokens')).toBeTruthy();
    expect(catalog.resolve('deploying')).toBeUndefined();
  }, SLOW);
});
