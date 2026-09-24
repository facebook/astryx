// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file readDocView and the loaders built on it: every component and hook read
 *   is the authored doc, compiled losslessly, and each reader keeps its own
 *   strictness.
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Project} from '../config/project.mjs';
import {CLI_ROOT} from '../fs/paths.mjs';
import {loadComponentDoc, loadDocs} from '../discovery/component-loader.mjs';
import {compileDocFile, readDocView} from './read.mjs';
import {collectDocInputs} from './inputs.mjs';

const REPO_ROOT = path.resolve(CLI_ROOT, '..', '..');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-doc-read-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

/**
 * @param {string} name
 * @param {string} text
 */
function write(name, text) {
  const file = path.join(tmpDir, name);
  fs.writeFileSync(file, text);
  return file;
}

/** Drop what JSON drops, keep key order: the compiled form of a value. */
const asJson = (/** @type {unknown} */ value) =>
  JSON.parse(JSON.stringify(value));

describe('component and hook reads over what this repo ships', () => {
  it('are the authored docs, compiled without loss', async () => {
    const dir = fs.mkdtempSync(path.join(REPO_ROOT, '.astryx-doc-read-'));
    try {
      fs.writeFileSync(path.join(dir, 'package.json'), '{"name":"consumer"}');
      const {inputs} = await collectDocInputs(await Project.load(dir));
      const docs = inputs.filter(
        input => input.root === 'components' || input.root === 'hooks',
      );
      expect(docs.length).toBeGreaterThan(200);
      for (const input of docs) {
        const mod = await import(pathToFileURL(input.file).href);
        const authored = mod.default ?? mod.docs;
        const root = /** @type {'components' | 'hooks'} */ (input.root);
        // Byte-for-byte what JSON output has always printed for the doc.
        expect(JSON.stringify(await loadDocs(input.file, {root}))).toBe(
          JSON.stringify(authored),
        );
        // A checked load passes every shipped doc.
        await expect(loadComponentDoc(input.file, {root})).resolves.toEqual(
          asJson(authored),
        );
      }
    } finally {
      fs.rmSync(dir, {recursive: true, force: true});
    }
  }, 180_000);
});

describe('readDocView', () => {
  const card =
    "export default {type: 'component', name: 'Card', displayName: 'Card', usage: {description: 'A card.'}, props: []};\n";

  it('hands every reader its own copy of a frozen node', async () => {
    const file = write('Card.doc.mjs', card);
    const first = await loadDocs(file);
    first.name = 'Changed';
    first.props.push({name: 'x'});
    expect((await loadDocs(file)).name).toBe('Card');
    const {node} = await compileDocFile(file, {root: 'components'});
    expect(Object.isFrozen(node)).toBe(true);
    expect(Object.isFrozen(node?.doc.props)).toBe(true);
  });

  it("keeps each reader's strictness for a doc that fails its parser", async () => {
    const file = write(
      'Bad.doc.mjs',
      "export default {type: 'component', name: 'Bad'};\n",
    );
    await expect(loadDocs(file)).resolves.toEqual({
      type: 'component',
      name: 'Bad',
    });
    await expect(loadComponentDoc(file)).rejects.toThrow(`${file} is invalid`);
  });

  it('passes on what a file throws when it is imported, unchanged', async () => {
    const file = write('Throws.doc.mjs', "throw new RangeError('no way');\n");
    for (const read of [loadDocs, loadComponentDoc]) {
      await expect(read(file)).rejects.toThrow(RangeError);
      await expect(read(file)).rejects.toThrow('no way');
    }
  });

  it("reads a file with no doc as undefined, or as its parser's error when checked", async () => {
    const file = write('Empty.doc.mjs', 'export const unrelated = 1;\n');
    await expect(loadDocs(file)).resolves.toBeUndefined();
    await expect(loadComponentDoc(file)).rejects.toThrow(`${file} is invalid`);
  });

  it('applies the translation a module exports for the reading language', async () => {
    const file = write(
      'Card.doc.mjs',
      card + "export const docsZh = {usage: {description: '卡片。'}};\n",
    );
    expect((await loadDocs(file, {zh: true})).usage.description).toBe('卡片。');
    expect((await loadDocs(file, {lang: 'zh'})).usage.description).toBe(
      '卡片。',
    );
    expect((await loadDocs(file)).usage.description).toBe('A card.');
    expect((await loadDocs(file, {dense: true})).usage.description).toBe(
      'A card.',
    );
  });

  it('reads a narrower set of exports when a reader always has', async () => {
    const file = write(
      'Both.doc.mjs',
      card +
        "export const docs = {name: 'Legacy', description: 'Old.', props: []};\n",
    );
    expect((await readDocView(file, {root: 'components'})).name).toBe('Card');
    expect(
      (await readDocView(file, {root: 'components', exports: ['docs']})).name,
    ).toBe('Legacy');
  });

  it('compiles an edited file again', async () => {
    const file = write('Card.doc.mjs', card);
    const before = await compileDocFile(file, {root: 'components'});
    // A new version on disk is a new key, even if the module cache is stale.
    fs.utimesSync(file, new Date(), new Date(Date.now() + 60_000));
    const after = await compileDocFile(file, {root: 'components'});
    expect(after).not.toBe(before);
    expect(await compileDocFile(file, {root: 'components'})).toBe(after);
  });
});
