// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {afterAll, describe, expect, it} from 'vitest';
import {loadCliSelfDocs} from '../discovery/cli-self-docs.mjs';
import {cliDocSection} from '../discovery/cli-self-docs.mjs';
import {defineDispatcher, defineSearcher} from './areas.mjs';
import {nodeDoc} from './node-docs.mjs';

const searcher = defineSearcher({
  id: 'main',
  area: 'demo',
  summary: 'Finds names that contain the query.',
  handles: [{input: {query: 'card'}, expect: {results: ['Card']}}],
  declines: [{input: {query: ''}, note: 'an empty query'}],
  weights: 'main.weights.json',
  tests: 'main.test.mjs',
  run: () => null,
});

const dispatcher = defineDispatcher({
  id: 'root',
  area: 'demo',
  summary: 'Sends identifiers to exact lookup.',
  handles: [{input: {query: 'Card'}, expect: {ids: ['main']}}],
  declines: [{input: {query: 'card'}, note: 'not an identifier'}],
  weights: null,
  tests: 'root.test.mjs',
  children: ['main'],
  floor: 0.5,
  fallback: 'main',
  route: () => ({ids: ['main'], confidence: 1}),
});

describe('nodeDoc', () => {
  it('renders a searcher from its descriptor alone', () => {
    const doc = nodeDoc(searcher);
    expect(doc).toMatchObject({
      type: 'generic',
      name: 'demo-main',
      namespace: 'cli/areas',
      summary: 'Finds names that contain the query.',
    });
    const text = JSON.stringify(doc.notes);
    expect(text).toContain('main.weights.json');
    expect(text).toContain('an empty query');
    expect(text).toContain('{\\"results\\":[\\"Card\\"]}');
  });

  it('adds a dispatcher its routes, floor, and fallback', () => {
    const rows = nodeDoc(dispatcher).notes[0].rows;
    expect(rows).toEqual(
      expect.arrayContaining([
        ['Routes to', 'main'],
        ['Floor', '0.5'],
        ['Fallback', 'main'],
        ['Weights', 'none'],
      ]),
    );
  });
});

describe('node docs in the CLI docs', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'area-docs-'));
  afterAll(() => fs.rmSync(root, {recursive: true, force: true}));
  const kit = pathToFileURL(
    path.join(path.dirname(fileURLToPath(import.meta.url)), 'areas.mjs'),
  ).href;
  fs.mkdirSync(path.join(root, 'api/demo/nodes'), {recursive: true});
  fs.writeFileSync(
    path.join(root, 'api/demo/nodes/main.mjs'),
    `import {defineSearcher} from '${kit}';
export const node = defineSearcher({
  id: 'main', area: 'demo', summary: 'Finds names.',
  handles: [{input: 'a', expect: {names: ['a']}}],
  declines: [{input: '', note: 'empty'}],
  weights: null, tests: 'main.test.mjs', run: q => (q ? {names: [q]} : null),
});
`,
  );
  fs.writeFileSync(
    path.join(root, 'api/demo/nodes/index.mjs'),
    "export {node as main} from './main.mjs';\n",
  );

  it('loads each node of each area as a cli/areas doc that renders', async () => {
    const {loaded, failed} = await loadCliSelfDocs([], root);
    expect(failed).toEqual([]);
    expect(
      loaded.map(({source, doc}) => [source, doc.name, doc.namespace]),
    ).toEqual([['api/demo/nodes/main.mjs', 'demo-main', 'cli/areas']]);
    const section = cliDocSection(loaded[0].doc, /** @type {any} */ ({}));
    expect(section.id).toBe('demo-main');
    expect(section.content[0]).toEqual({
      type: 'prose',
      text: 'Finds names. A searcher in the demo area.',
    });
  });
});
