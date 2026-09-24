// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file compileDocs: every descriptor a project reads compiles to one node or
 *   a diagnostic, and the bundle reads back through its sealed parser.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {Project} from '../config/project.mjs';
import {CLI_ROOT} from '../fs/paths.mjs';
import {compileDocs} from './bundle.mjs';
import {COMPILED_DOC_KINDS} from './compile.mjs';
import {collectDocInputs} from './inputs.mjs';
import {parseCompiledDocsBundle} from './ir.mjs';

const REPO_ROOT = path.resolve(CLI_ROOT, '..', '..');

let tmpDir;

beforeEach(() => {
  // Inside the repo, so the project finds this checkout's Core.
  tmpDir = fs.mkdtempSync(path.join(REPO_ROOT, '.astryx-doc-bundle-'));
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'consumer', version: '1.0.0'}),
  );
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

describe('compileDocs over what this repo ships', () => {
  it('compiles every descriptor, in every language, with nothing to report', async () => {
    const project = await Project.load(tmpDir);
    const {inputs} = await collectDocInputs(project);
    // One node per input, except that a topic and its extensions are one node.
    const expected = inputs.filter(
      input => input.root !== 'docs' || input.role === 'base',
    ).length;
    for (const lang of [null, 'zh', 'dense']) {
      const bundle = await compileDocs(project, {lang});
      expect(bundle.diagnostics).toEqual([]);
      expect(bundle.nodes).toHaveLength(expected);
      expect(new Set(bundle.nodes.map(node => node.kind))).toEqual(
        new Set(COMPILED_DOC_KINDS),
      );
      // Plain JSON that reads back through the sealed parser, as written.
      const copy = JSON.parse(JSON.stringify(bundle));
      expect(parseCompiledDocsBundle(copy)).toEqual(bundle);
    }
  }, 180_000);

  it('is deterministic', async () => {
    const one = await compileDocs(await Project.load(tmpDir));
    const two = await compileDocs(await Project.load(tmpDir));
    expect(JSON.stringify(two)).toBe(JSON.stringify(one));
  }, 120_000);

  it('never carries a machine path', async () => {
    const bundle = await compileDocs(await Project.load(tmpDir));
    const text = JSON.stringify(bundle);
    expect(text.includes(REPO_ROOT)).toBe(false);
    expect(text.includes(tmpDir)).toBe(false);
  }, 120_000);
});

describe('compileDocs over a broken integration', () => {
  /**
   * @param {string} rel
   * @param {string} text
   */
  function write(rel, text) {
    const file = path.join(tmpDir, 'node_modules', '@acme', 'kit', rel);
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, text);
  }

  /** @param {object} fields */
  const topic = fields =>
    `export default ${JSON.stringify({
      type: 'generic',
      title: 'Acme',
      description: 'Acme notes.',
      sections: [{title: 'Acme', content: [{type: 'prose', text: 'Hi.'}]}],
      ...fields,
    })};\n`;

  beforeEach(() => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({
        name: 'consumer',
        version: '1.0.0',
        dependencies: {'@acme/kit': '^1.0.0'},
      }),
    );
    write(
      'package.json',
      JSON.stringify({name: '@acme/kit', version: '1.0.0'}),
    );
    write(
      'astryx.integration.mjs',
      "export default {components: './components', docs: './docs'};\n",
    );
    write(
      'components/AcmeCard.tsx',
      'export function AcmeCard() { return null; }\n',
    );
    write(
      'components/AcmeCard.doc.mjs',
      "export default {type: 'component', name: 'AcmeCard', displayName: 'Acme Card', usage: {description: 'A card.'}, props: []};\n",
    );
    write('docs/acme-guide.doc.mjs', topic({name: 'acme-guide'}));
  });

  it('warns on a token reference that finds nothing, and still compiles the topic', async () => {
    write(
      'docs/acme-guide.doc.mjs',
      topic({
        name: 'acme-guide',
        sections: [
          {
            title: 'Colors',
            content: [
              {type: 'token-ref', topic: 'no-such-topic', section: 'x'},
              {type: 'token-ref', topic: 'tokens', section: 'no-such-section'},
            ],
          },
        ],
      }),
    );
    const bundle = await compileDocs(await Project.load(tmpDir));
    const warnings = bundle.diagnostics.filter(d => d.provider === '@acme/kit');
    expect(warnings.map(d => [d.code, d.severity, d.field])).toEqual([
      ['unresolved_reference', 'warning', 'sections.colors'],
      ['unresolved_reference', 'warning', 'sections.colors'],
    ]);
    expect(
      warnings.every(d => d.source === '@acme/kit/docs/acme-guide.doc.mjs'),
    ).toBe(true);
    expect(bundle.nodes.some(node => node.id === 'acme-guide')).toBe(true);
  });

  it('reports a component doc that fails to load, and compiles the rest', async () => {
    write(
      'components/AcmeCard.doc.mjs',
      "throw new Error('boom');\nexport default {};\n",
    );
    const project = await Project.load(tmpDir);
    const bundle = await compileDocs(project);
    const found = bundle.diagnostics.filter(d => d.provider === '@acme/kit');
    // Discovery lists the doc; compiling it fails at load, and only it.
    expect(found.map(d => [d.code, d.source])).toEqual([
      ['load_failed', '@acme/kit/components/AcmeCard.doc.mjs'],
    ]);
    expect(found[0].message).toMatch(/boom/);
    expect(bundle.nodes.some(node => node.kind === 'reference')).toBe(true);
  });

  it('reports an extension that fails to load against the extension, not its base', async () => {
    write('docs/theme-notes.doc.mjs', "throw new Error('bad extension');\n");
    // Discovery refuses an unloadable topic file, so the catalog never merges
    // it; compile the entry as the catalog would have if it had loaded.
    const project = await Project.load(tmpDir);
    const catalog = await project.docs();
    const theme = /** @type {any} */ (catalog.resolve('theme'));
    theme.extensions.push({
      package: '@acme/kit',
      path: path.join(
        tmpDir,
        'node_modules',
        '@acme',
        'kit',
        'docs',
        'theme-notes.doc.mjs',
      ),
    });
    const bundle = await compileDocs(project);
    const found = bundle.diagnostics.filter(d => d.code === 'load_failed');
    expect(found.map(d => [d.provider, d.source])).toEqual([
      ['@acme/kit', '@acme/kit/docs/theme-notes.doc.mjs'],
    ]);
    // The broken extension withdraws the topic it extends, as a docs read does.
    expect(bundle.nodes.some(node => node.id === 'theme')).toBe(false);
  });
});
