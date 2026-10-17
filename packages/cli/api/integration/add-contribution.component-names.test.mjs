// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {integrationAdd, integrationAddComponent} from './add-contribution.mjs';
import {discoverIntegrationComponents} from '../../foundation/discovery/component-discovery.mjs';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-add-component-'));
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    `${JSON.stringify({name: '@acme/widgets', version: '1.0.0', files: ['dist']}, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(tmpDir, 'astryx.integration.mjs'),
    "export default {\n  components: './components',\n};\n",
  );
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

/** @param {string} relativeDoc */
function writeAuthoredComponent(relativeDoc) {
  const doc = path.join(tmpDir, relativeDoc);
  fs.mkdirSync(path.dirname(doc), {recursive: true});
  fs.writeFileSync(
    doc,
    "export default {\n  type: 'component',\n  name: 'AcmeWidget',\n  description: 'The authored AcmeWidget.',\n  props: [],\n};\n",
  );
  fs.writeFileSync(
    doc.replace(/\.doc\.(?:ts|mjs|js)$/u, '.tsx'),
    'export function AcmeWidget() {\n  return <div>Authored</div>;\n}\n',
  );
}

/** Every file under the package, with its bytes. */
function snapshot() {
  /** @type {Record<string, string>} */
  const files = {};
  /** @param {string} dir */
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else files[path.relative(tmpDir, full)] = fs.readFileSync(full, 'utf-8');
    }
  };
  walk(tmpDir);
  return files;
}

describe('integrationAddComponent name collisions', () => {
  it('refuses a name a nested component doc already defines', async () => {
    writeAuthoredComponent('components/AcmeWidget/AcmeWidget.doc.mjs');
    const before = snapshot();

    await expect(
      integrationAddComponent('AcmeWidget', {cwd: tmpDir}),
    ).rejects.toMatchObject({
      code: 'ERR_FILE_EXISTS',
      message: expect.stringContaining(
        'components/AcmeWidget/AcmeWidget.doc.mjs',
      ),
    });
    expect(snapshot()).toEqual(before);
    expect(
      discoverIntegrationComponents({
        name: '@acme/widgets',
        components: path.join(tmpDir, 'components'),
      }).map(component => path.relative(tmpDir, component.docPath)),
    ).toEqual([path.join('components', 'AcmeWidget', 'AcmeWidget.doc.mjs')]);
  });

  it('refuses the same collision under --dry-run', async () => {
    writeAuthoredComponent('components/widgets/AcmeWidget.doc.mjs');

    await expect(
      integrationAdd('component', 'AcmeWidget', {cwd: tmpDir, dryRun: true}),
    ).rejects.toMatchObject({code: 'ERR_FILE_EXISTS'});
  });

  it('refuses a same-stem doc with another extension in the root', async () => {
    fs.mkdirSync(path.join(tmpDir, 'components'));
    fs.writeFileSync(
      path.join(tmpDir, 'components', 'AcmeWidget.doc.ts'),
      "export default {type: 'component', name: 'AcmeWidget', props: []};\n",
    );
    const before = snapshot();

    await expect(
      integrationAddComponent('AcmeWidget', {cwd: tmpDir}),
    ).rejects.toMatchObject({code: 'ERR_FILE_EXISTS'});
    expect(snapshot()).toEqual(before);
  });

  it('still adds a component whose name is free', async () => {
    writeAuthoredComponent('components/AcmeWidget/AcmeWidget.doc.mjs');

    const result = await integrationAddComponent('AcmeBadge', {cwd: tmpDir});

    expect(result.data.files).toEqual([
      'components/AcmeBadge.doc.mjs',
      'components/AcmeBadge.tsx',
      'package.json',
    ]);
    expect(
      discoverIntegrationComponents({
        name: '@acme/widgets',
        components: path.join(tmpDir, 'components'),
      })
        .map(component => component.name)
        .sort(),
    ).toEqual(['AcmeBadge', 'AcmeWidget']);
  });
});
