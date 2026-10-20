// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {afterEach, describe, expect, it} from 'vitest';
import {AREA_WEIGHTS_LIMIT, checkAreas} from './check-areas.mjs';

const KIT = pathToFileURL(
  path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../packages/cli/foundation/areas/areas.mjs',
  ),
).href;

/** @type {string[]} */
const roots = [];
afterEach(() => {
  for (const root of roots.splice(0))
    fs.rmSync(root, {recursive: true, force: true});
});

/**
 * A searcher module.
 * @param {string} id
 * @param {{weights?: string | null, extra?: string}} [options]
 */
const searcherSource = (id, {weights = null, extra = ''} = {}) => `${extra}
import {defineSearcher} from '${KIT}';
export const node = defineSearcher({
  id: '${id}',
  area: 'demo',
  summary: 'Finds names.',
  handles: [{input: 'a', expect: {names: ['a']}}],
  declines: [{input: '', note: 'empty'}],
  weights: ${weights === null ? 'null' : `'${weights}'`},
  tests: '${id}.test.mjs',
  run: query => (query ? {names: [query]} : null),
});
`;

const dispatcherSource = (/** @type {string} */ extra = '') => `${extra}
import {defineDispatcher} from '${KIT}';
export const node = defineDispatcher({
  id: 'root',
  area: 'demo',
  summary: 'Sends everything to main.',
  handles: [{input: 'abc', expect: {ids: ['main']}}],
  declines: [{input: '', note: 'empty'}],
  weights: null,
  tests: 'root.test.mjs',
  children: ['main'],
  floor: 0.5,
  fallback: 'main',
  route: () => ({ids: ['main'], confidence: 1}),
});
`;

/**
 * A CLI root holding one area, `api/demo`, built from `files` under
 * `api/demo/` (paths relative to it).
 * @param {Record<string, string | Buffer>} files
 * @param {Record<string, string>} [dependencies]
 */
function fixture(files, dependencies = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'areas-check-'));
  roots.push(root);
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify({dependencies}),
  );
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(root, 'api/demo', rel);
    fs.mkdirSync(path.dirname(full), {recursive: true});
    fs.writeFileSync(full, content);
  }
  return root;
}

const good = () => ({
  'demo.mjs':
    "import {runArea} from '../../kit.mjs';\nexport async function demo(q) {\n  return runArea(area, q, {catalog: null, weights: {}});\n}\n",
  'nodes/index.mjs':
    "export {node as root} from './root.mjs';\nexport {node as main} from './main.mjs';\n",
  'nodes/root.mjs': dispatcherSource(),
  'nodes/root.test.mjs': '',
  'nodes/main.mjs': searcherSource('main', {weights: 'main.weights.json'}),
  'nodes/main.test.mjs': '',
  'nodes/main.weights.json': '{"boost": 1}',
});

describe('checkAreas', () => {
  it('passes a complete area and counts it', async () => {
    const result = await checkAreas({cliRoot: fixture(good())});
    expect(result).toEqual({errors: [], areas: 1, nodes: 2});
  });

  it('passes a CLI with no areas', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'areas-check-'));
    roots.push(root);
    fs.writeFileSync(path.join(root, 'package.json'), '{}');
    expect(await checkAreas({cliRoot: root})).toEqual({
      errors: [],
      areas: 0,
      nodes: 0,
    });
  });

  it('fails a node missing from the registry, and a registry line of another shape', async () => {
    const files = good();
    files['nodes/index.mjs'] =
      "export {node as root} from './root.mjs';\nexport * from './main.mjs';\n";
    const {errors} = await checkAreas({cliRoot: fixture(files)});
    expect(errors.join('\n')).toMatch(/is not a registry line/);
    expect(errors.join('\n')).toMatch(/main.mjs is not listed in index.mjs/);
  });

  it('fails missing tests and a missing weights file', async () => {
    const files = good();
    delete files['nodes/main.test.mjs'];
    delete files['nodes/main.weights.json'];
    const {errors} = await checkAreas({cliRoot: fixture(files)});
    expect(errors.join('\n')).toMatch(
      /names tests main.test.mjs, which does not exist/,
    );
    expect(errors.join('\n')).toMatch(
      /names weights main.weights.json, which does not exist/,
    );
  });

  it('fails an incomplete descriptor through the kit', async () => {
    const files = good();
    files['nodes/main.mjs'] = searcherSource('main').replace(
      "declines: [{input: '', note: 'empty'}]",
      'declines: []',
    );
    const {errors} = await checkAreas({cliRoot: fixture(files)});
    expect(errors.join('\n')).toMatch(/does not load: .*not-handled example/);
  });

  it('fails an area over the weights limit', async () => {
    const files = good();
    files['nodes/main.weights.json'] = Buffer.alloc(AREA_WEIGHTS_LIMIT + 1, 32);
    const {errors} = await checkAreas({cliRoot: fixture(files)});
    expect(errors.join('\n')).toMatch(/bytes of weights; the limit is 1000000/);
  });

  it('fails file, network, subprocess, and adapter imports in a node', async () => {
    const files = good();
    files['nodes/main.mjs'] = searcherSource('main', {
      weights: 'main.weights.json',
      extra:
        "import * as fs from 'node:fs';\nimport 'node:https';\nimport {x} from '../_adapter.mjs';\nconst cp = await import('node:child_process');\n",
    });
    const {errors} = await checkAreas({cliRoot: fixture(files)});
    const text = errors.join('\n');
    for (const spec of [
      'node:fs',
      'node:https',
      '../_adapter.mjs',
      'node:child_process',
    ]) {
      expect(text).toContain(`imports ${spec}`);
    }
  });

  it('fails a dispatcher that imports a node', async () => {
    const files = good();
    files['nodes/root.mjs'] = dispatcherSource(
      "import {node as main} from './main.mjs';",
    );
    const {errors} = await checkAreas({cliRoot: fixture(files)});
    expect(errors.join('\n')).toMatch(
      /dispatcher .*root.mjs imports node main/,
    );
  });

  it('fails a model file in an area and a model runtime among the dependencies', async () => {
    const files = good();
    files['nodes/encoder.onnx'] = 'x';
    const {errors} = await checkAreas({
      cliRoot: fixture(files, {'onnxruntime-web': '1.0.0'}),
    });
    expect(errors.join('\n')).toMatch(/encoder.onnx is a model file/);
    expect(errors.join('\n')).toMatch(/lists onnxruntime-web, a model runtime/);
  });

  it('fails an entry that does more than run the tree', async () => {
    const files = good();
    files['demo.mjs'] =
      'function score(q) {\n  return q.length;\n}\nexport function demo(q) {\n  return score(q);\n}\n';
    const {errors} = await checkAreas({cliRoot: fixture(files)});
    expect(errors.join('\n')).toMatch(/must run its area with runArea/);
    expect(errors.join('\n')).toMatch(
      /defines score; an area entry only gathers and runs the tree/,
    );
  });
});
