// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration components are found by the names their docs document;
 * every doc that works today reads exactly as before.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  discoverIntegrationComponents,
  discoverValidIntegrationComponents,
  findIntegrationComponent,
  findIntegrationComponentDoc,
  findIntegrationComponentSource,
  unscopedComponentOwners,
} from './component-discovery.mjs';

/** @type {string} the integration's components root */
let root;

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-export-names-'));
});

afterEach(() => {
  fs.rmSync(root, {recursive: true, force: true});
});

/**
 * Write a component doc, and its same-stem source when given.
 * @param {string} file path under the root, without extension
 * @param {{name: string, source?: string, form?: 'default' | 'docs', suffix?: string, extra?: string}} options
 *   `name` is written as a JavaScript expression
 */
function writeComponent(
  file,
  {name, source, form = 'default', suffix = '.doc.mjs', extra = ''},
) {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), {recursive: true});
  const doc = `{\n  type: 'component',\n  name: ${name},\n  usage: {description: 'A component.'},\n  props: [],${extra}\n}`;
  fs.writeFileSync(
    `${target}${suffix}`,
    form === 'default'
      ? `export default ${doc};\n`
      : `export const docs = ${doc};\n`,
  );
  if (source != null) fs.writeFileSync(`${target}.tsx`, source);
}

const integration = () => ({name: '@acme/widgets', components: root});

/** @returns {string[]} */
const names = () =>
  discoverIntegrationComponents(integration())
    .map(record => record.name)
    .sort();

describe('integration components whose doc names another export of its file', () => {
  it('records a doc beside a kebab-case file under the export its doc names', async () => {
    writeComponent('artifact-viewer', {
      name: "'AcmeArtifactViewer'",
      source: 'export function AcmeArtifactViewer() { return null; }\n',
    });

    const [record] = discoverIntegrationComponents(integration());
    expect(record).toMatchObject({
      name: 'AcmeArtifactViewer',
      package: '@acme/widgets',
      docPath: path.join(root, 'artifact-viewer.doc.mjs'),
      sourcePath: path.join(root, 'artifact-viewer.tsx'),
    });
    expect(
      (await discoverValidIntegrationComponents(integration())).components,
    ).toEqual([expect.objectContaining({name: 'AcmeArtifactViewer'})]);
    expect(
      findIntegrationComponentDoc(integration(), 'AcmeArtifactViewer'),
    ).toBe(record.docPath);
    expect(findIntegrationComponentDoc(integration(), 'artifact-viewer')).toBe(
      record.docPath,
    );
    expect(
      findIntegrationComponentSource(integration(), 'AcmeArtifactViewer'),
    ).toBe(record.sourcePath);
  });

  it('leaves a name to Core or a file-named component over one a doc records', () => {
    const core = {package: '@astryxdesign/core', hold: 'core'};
    const fileNamed = {package: '@beta/kit', hold: 'file'};
    const documented = {package: '@acme/widgets', hold: 'doc'};
    expect(unscopedComponentOwners([documented, fileNamed])).toEqual([
      fileNamed,
    ]);
    expect(unscopedComponentOwners([core, documented])).toEqual([core]);
    expect(unscopedComponentOwners([documented])).toEqual([documented]);

    // Badge.doc.mjs records AcmeBadge, so the doc holds both names only
    // because it documents them; Panel.doc.mjs names an export another file
    // has, so it keeps its file name.
    writeComponent('Badge', {
      name: "'AcmeBadge'",
      source: 'export function AcmeBadge() { return null; }\n',
    });
    writeComponent('Panel', {
      name: "'AcmeChip'",
      source: 'export function AcmeChip() { return null; }\n',
    });
    writeComponent('AcmeChip', {
      name: "'AcmeChip'",
      source: 'export function AcmeChip() { return null; }\n',
    });
    const hold = (/** @type {string} */ name) =>
      findIntegrationComponent(integration(), name)?.hold;
    expect(hold('AcmeBadge')).toBe('doc');
    expect(hold('Badge')).toBe('doc');
    expect(hold('Panel')).toBe('file');
    expect(hold('AcmeChip')).toBe('file');
  });

  it('takes no name a hidden doc or a replacement in the package claims', () => {
    // A hidden doc is still the file named AcmeCarousel: its name stays its own.
    writeComponent('AcmeCarousel', {
      name: "'AcmeCarousel'",
      extra: '\n  hidden: true,',
      source: 'export function AcmeCarousel() { return null; }\n',
    });
    writeComponent('gallery/Slides', {
      name: "'AcmeCarousel'",
      source: 'export function AcmeCarousel() { return null; }\n',
    });
    // A doc in the package replaces Carousel, so that name answers with it.
    writeComponent('Pager', {
      name: "'AcmePager'",
      extra: "\n  replaces: 'Carousel',",
      source: 'export function AcmePager() { return null; }\n',
    });
    writeComponent('Kit', {
      name: "'Carousel'",
      source: 'export function Carousel() { return null; }\n',
    });

    expect(names()).toEqual(['AcmePager', 'Kit', 'Slides']);
    expect(findIntegrationComponentDoc(integration(), 'AcmeCarousel')).toBe(
      path.join(root, 'AcmeCarousel.doc.mjs'),
    );
    expect(findIntegrationComponentDoc(integration(), 'Carousel')).toBeNull();
  });

  it('settles a name two docs document by path, the same in every locale', () => {
    // By UTF-16 code unit `B/` sorts before `a/`; a locale's collation puts
    // `a/` first.
    for (const [file, stem] of [
      ['a/Alpha', 'Alpha'],
      ['B/Beta', 'Beta'],
    ]) {
      writeComponent(file, {
        name: "'Twin'",
        source: `export function Twin() { return null; }\n// ${stem}\n`,
      });
    }

    expect(names()).toEqual(['Alpha', 'Twin']);
    expect(findIntegrationComponentDoc(integration(), 'Twin')).toBe(
      path.join(root, 'B', 'Beta.doc.mjs'),
    );
  });

  it('reads a name a spread can override, and reports an unreadable doc under its file name', async () => {
    fs.writeFileSync(
      path.join(root, 'Based.doc.mjs'),
      "const base = {\n  name: 'Based',\n  type: 'component',\n  usage: {description: 'x'},\n  props: [],\n};\nexport default {...base, name: 'AcmeBased'};\n",
    );
    fs.writeFileSync(
      path.join(root, 'Based.tsx'),
      'export function AcmeBased() { return null; }\n',
    );
    writeComponent('Throws', {
      name: "'AcmeThrows'",
      source: 'export function AcmeThrows() { return null; }\n',
    });
    const throws = path.join(root, 'Throws.doc.mjs');
    fs.writeFileSync(
      throws,
      `throw new Error('boom');\n${fs.readFileSync(throws, 'utf-8')}`,
    );

    expect(names()).toEqual(['AcmeBased', 'AcmeThrows']);
    const {errors} = await discoverValidIntegrationComponents(integration());
    expect(errors).toEqual([
      {
        name: 'Throws',
        message: 'Component "Throws" has invalid metadata: boom',
      },
    ]);
  });

  it('reads a legacy export, a .doc.ts doc and a re-exported component the same way', () => {
    writeComponent('Slides', {
      name: "'AcmeCarousel'",
      form: 'docs',
      source: "export {AcmeCarousel} from './carousel/impl';\n",
    });
    fs.mkdirSync(path.join(root, 'carousel'));
    fs.writeFileSync(
      path.join(root, 'carousel', 'impl.tsx'),
      'export function AcmeCarousel() { return null; }\n',
    );
    writeComponent('Pager', {
      name: "'AcmePager'",
      suffix: '.doc.ts',
      source: 'export const AcmePager = () => null;\n',
    });

    expect(names()).toEqual(['AcmeCarousel', 'AcmePager']);
  });

  it('keeps the file name for every doc that reads as before', async () => {
    // Named after its file.
    writeComponent('AcmeBadge', {
      name: "'AcmeBadge'",
      source: 'export function AcmeBadge() { return null; }\n',
    });
    // The file exports its own name, so that name stays.
    writeComponent('Chip', {
      name: "'AcmeChip'",
      source:
        'export function Chip() { return null; }\nexport function AcmeChip() { return null; }\n',
    });
    // The doc names an export the file does not have.
    writeComponent('Menu', {
      name: "'AcmeMenu'",
      source: 'export function Dropdown() { return null; }\n',
    });
    // A type is not a runtime export.
    writeComponent('Shape', {
      name: "'AcmeShape'",
      source: 'export type AcmeShape = {id: string};\n',
    });
    // A name the doc computes is not read.
    writeComponent('Tile', {
      name: "`${'Acme'}Tile`",
      source: 'export function AcmeTile() { return null; }\n',
    });
    // Another file already has the name.
    writeComponent('Panel', {
      name: "'AcmeBadge'",
      source: 'export function AcmeBadge() { return null; }\n',
    });
    // No source beside it.
    writeComponent('Orphan', {name: "'AcmeOrphan'"});

    expect(names()).toEqual([
      'AcmeBadge',
      'Chip',
      'Menu',
      'Orphan',
      'Panel',
      'Shape',
      'Tile',
    ]);
    for (const name of [
      'AcmeChip',
      'AcmeMenu',
      'AcmeShape',
      'AcmeTile',
      'AcmeOrphan',
    ]) {
      expect(findIntegrationComponentDoc(integration(), name)).toBeNull();
    }
    expect(
      (await discoverValidIntegrationComponents(integration())).errors,
    ).toEqual([
      {
        name: 'Orphan',
        message:
          'Component "Orphan" is missing its same-stem source file Orphan.tsx.',
      },
    ]);
  });

  it('still leaves a hidden doc out', () => {
    writeComponent('Slides', {
      name: "'AcmeCarousel'",
      extra: '\n  hidden: true,',
      source: 'export function AcmeCarousel() { return null; }\n',
    });

    expect(names()).toEqual([]);
  });
});
