// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Test helpers for answer-picking areas: run code with the
 * network, DNS, and subprocesses stubbed out; pin the size of answers; run a
 * node's examples.
 * @input an area, its catalog and weights, or a function to run
 * @output assertion failures
 * @position foundation; every area's node tests import it
 */

import {createRequire, syncBuiltinESMExports} from 'node:module';
import {runArea} from './areas.mjs';

/**
 * @template Request, Answer, Catalog
 * @typedef {import('./areas.type.mjs').Area<Request, Answer, Catalog>} Area
 */
/** @typedef {import('./areas.type.mjs').Json} Json */

const require = createRequire(import.meta.url);

/** The module functions a node must never reach. */
const OFFLINE_STUBS = /** @type {const} */ ([
  ['http', ['request', 'get']],
  ['https', ['request', 'get']],
  ['net', ['connect', 'createConnection']],
  ['tls', ['connect']],
  ['dns', ['lookup', 'resolve', 'resolve4', 'resolve6']],
  [
    'child_process',
    [
      'spawn',
      'spawnSync',
      'exec',
      'execSync',
      'execFile',
      'execFileSync',
      'fork',
    ],
  ],
]);

/**
 * Runs `fn` with fetch, HTTP, HTTPS, TLS, raw sockets, DNS, and subprocesses
 * stubbed to record and throw, and fails when anything reached them, even
 * when `fn` caught the error.
 * @template T
 * @param {() => T | Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function assertOffline(fn) {
  /** @type {string[]} */
  const touched = [];
  /** @type {(() => void)[]} */
  const restores = [];
  /** @param {any} target @param {string} key @param {string} label */
  const stub = (target, key, label) => {
    const original = target[key];
    target[key] = () => {
      touched.push(label);
      throw new Error(`offline: ${label} was called`);
    };
    restores.push(() => {
      target[key] = original;
    });
  };
  if (typeof globalThis.fetch === 'function')
    stub(globalThis, 'fetch', 'fetch');
  for (const [name, keys] of OFFLINE_STUBS) {
    const mod = require(`node:${name}`);
    for (const key of keys) stub(mod, key, `${name}.${key}`);
  }
  // ES module imports of the built-ins see the stubs too.
  syncBuiltinESMExports();
  try {
    const result = await fn();
    if (touched.length > 0) {
      throw new Error(`offline: reached ${[...new Set(touched)].join(', ')}`);
    }
    return result;
  } finally {
    for (const restore of restores.reverse()) restore();
    syncBuiltinESMExports();
  }
}

/**
 * Fails when a case's answer, serialized as JSON, is longer than its
 * `maxBytes`.
 * @template Request, Answer
 * @param {(request: Request) => Answer | null | Promise<Answer | null>} run
 * @param {readonly {input: Request, maxBytes: number}[]} cases
 * @returns {Promise<void>}
 */
export async function pinOutputBytes(run, cases) {
  /** @type {string[]} */
  const over = [];
  for (const {input, maxBytes} of cases) {
    const bytes = Buffer.byteLength(JSON.stringify(await run(input)), 'utf8');
    if (bytes > maxBytes) {
      over.push(`${JSON.stringify(input)}: ${bytes} bytes > ${maxBytes}`);
    }
  }
  if (over.length > 0) {
    throw new Error(`answers grew:\n  ${over.join('\n  ')}`);
  }
}

/**
 * Whether `actual` holds everything `expected` states: objects by key,
 * arrays by their first items, everything else by equality.
 * @param {unknown} actual
 * @param {unknown} expected
 * @returns {boolean}
 */
export function partialMatch(actual, expected) {
  if (Array.isArray(expected)) {
    return (
      Array.isArray(actual) &&
      expected.length <= actual.length &&
      expected.every((item, i) => partialMatch(actual[i], item))
    );
  }
  if (expected !== null && typeof expected === 'object') {
    if (actual === null || typeof actual !== 'object') return false;
    const record = /** @type {Record<string, unknown>} */ (actual);
    return Object.entries(expected).every(([key, value]) =>
      partialMatch(record[key], value),
    );
  }
  return Object.is(actual, expected);
}

/**
 * Runs a node's examples through the area as it ships: a
 * searcher's handled examples must give their output and its declined ones
 * null; a dispatcher's handled examples must route as stated at or above its
 * floor, and its declined ones below it. Runs offline.
 * @template Request, Answer, Catalog
 * @param {Area<Request, Answer, Catalog>} area
 * @param {string} nodeId
 * @param {{catalog: Catalog, weights: Readonly<Record<string, Json>>}} options
 * @returns {Promise<void>}
 */
export async function checkExamples(area, nodeId, options) {
  const node = area.nodes.get(nodeId);
  if (!node) throw new Error(`area "${area.area}": no node "${nodeId}"`);
  /** @type {string[]} */
  const failures = [];
  await assertOffline(async () => {
    for (const example of node.handles) {
      const got = await outputOf(area, nodeId, example.input, options);
      if (got === null || !partialMatch(got, example.expect)) {
        failures.push(
          `handles ${JSON.stringify(example.input)}: got ${JSON.stringify(got)}`,
        );
      }
    }
    for (const example of node.declines) {
      const got = await outputOf(area, nodeId, example.input, options);
      if (got !== null) {
        failures.push(
          `declines ${JSON.stringify(example.input)} (${example.note}): got ${JSON.stringify(got)}`,
        );
      }
    }
  });
  if (failures.length > 0) {
    throw new Error(
      `${area.area}/${nodeId} examples:\n  ${failures.join('\n  ')}`,
    );
  }
}

/**
 * A searcher's answer, or a dispatcher's route when it is at or above its
 * floor (null below it), after the area's preparation step.
 * @template Request, Answer, Catalog
 * @param {Area<Request, Answer, Catalog>} area
 * @param {string} nodeId
 * @param {Request} input
 * @param {{catalog: Catalog, weights: Readonly<Record<string, Json>>}} options
 * @returns {Promise<unknown>}
 */
async function outputOf(area, nodeId, input, options) {
  const node = /** @type {NonNullable<ReturnType<typeof area.nodes.get>>} */ (
    area.nodes.get(nodeId)
  );
  if (node.kind === 'searcher') {
    return runArea(area, input, {...options, start: nodeId});
  }
  /** @type {import('./areas.type.mjs').Route | null} */
  let route = null;
  await runArea(area, input, {
    ...options,
    start: nodeId,
    tuning: {
      onTrace: event => {
        if (event.nodeId === nodeId && event.depth === 0) {
          route = event.route ?? null;
        }
      },
    },
  });
  const routed = /** @type {import('./areas.type.mjs').Route | null} */ (route);
  return routed && routed.confidence >= node.floor ? routed : null;
}
