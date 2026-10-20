// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The shared kit for answer-picking areas: node
 * definitions, the area registry, the runner, and weights loading. Every area
 * uses this module; none copies it.
 * @input node modules from an area's api/<subject>/nodes/ registry; the
 *   catalog and weights its adapter gathered
 * @output the area's answer, or null; trace events to `tuning.onTrace`
 * @position foundation; the areas under api/<subject>/nodes/ import it
 */

/**
 * @template Request, Catalog, Weights
 * @typedef {import('./areas.type.mjs').DispatcherNode<Request, Catalog, Weights>} DispatcherNode
 */
/**
 * @template Request, Answer, Catalog, Weights
 * @typedef {import('./areas.type.mjs').SearcherNode<Request, Answer, Catalog, Weights>} SearcherNode
 */
/**
 * @template Request, Answer, Catalog
 * @typedef {import('./areas.type.mjs').AreaNode<Request, Answer, Catalog>} AreaNode
 */
/**
 * @template Request, Answer, Catalog
 * @typedef {import('./areas.type.mjs').Area<Request, Answer, Catalog>} Area
 */
/**
 * @template Catalog
 * @typedef {import('./areas.type.mjs').RunOptions<Catalog>} RunOptions
 */
/** @typedef {import('./areas.type.mjs').Route} Route */
/** @typedef {import('./areas.type.mjs').Json} Json */
/** @typedef {import('./areas.type.mjs').TraceEvent} TraceEvent */

const ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

/**
 * Throws unless the fields both kinds share are complete.
 * @param {string} kind
 * @param {any} node
 */
function assertDescriptor(kind, node) {
  const where = `${kind} ${JSON.stringify(node?.id ?? '?')}`;
  if (typeof node?.id !== 'string' || !ID.test(node.id)) {
    throw new Error(`${where}: id must be kebab-case`);
  }
  if (typeof node.area !== 'string' || node.area === '') {
    throw new Error(`${where}: area is required`);
  }
  if (
    typeof node.summary !== 'string' ||
    node.summary.trim() === '' ||
    /\n/.test(node.summary)
  ) {
    throw new Error(`${where}: summary must be one plain line`);
  }
  if (!Array.isArray(node.handles) || node.handles.length === 0) {
    throw new Error(`${where}: needs at least one handled example`);
  }
  if (!Array.isArray(node.declines) || node.declines.length === 0) {
    throw new Error(`${where}: needs at least one not-handled example`);
  }
  for (const example of node.declines) {
    if (typeof example?.note !== 'string' || example.note === '') {
      throw new Error(`${where}: every not-handled example needs a note`);
    }
  }
  if (node.weights !== null && node.weights !== `${node.id}.weights.json`) {
    throw new Error(
      `${where}: weights must be null or "${node.id}.weights.json"`,
    );
  }
  if (node.tests !== `${node.id}.test.mjs`) {
    throw new Error(`${where}: tests must be "${node.id}.test.mjs"`);
  }
}

/**
 * Defines a dispatcher: it routes to its children and never ranks answers.
 * @template Request, Catalog, Weights
 * @param {Omit<DispatcherNode<Request, Catalog, Weights>, 'kind'>} node
 * @returns {DispatcherNode<Request, Catalog, Weights>}
 */
export function defineDispatcher(node) {
  assertDescriptor('dispatcher', node);
  if (!Array.isArray(node.children) || node.children.length === 0) {
    throw new Error(`dispatcher "${node.id}": needs at least one child`);
  }
  if (typeof node.floor !== 'number' || !(node.floor >= 0 && node.floor <= 1)) {
    throw new Error(`dispatcher "${node.id}": floor must be from 0 to 1`);
  }
  if (typeof node.fallback !== 'string' || node.fallback === '') {
    throw new Error(`dispatcher "${node.id}": fallback is required`);
  }
  if (typeof node.route !== 'function') {
    throw new Error(`dispatcher "${node.id}": route must be a function`);
  }
  return Object.freeze({...node, kind: /** @type {const} */ ('dispatcher')});
}

/**
 * Defines a searcher: it answers in the area's shape, or returns null.
 * @template Request, Answer, Catalog, Weights
 * @param {Omit<SearcherNode<Request, Answer, Catalog, Weights>, 'kind'>} node
 * @returns {SearcherNode<Request, Answer, Catalog, Weights>}
 */
export function defineSearcher(node) {
  assertDescriptor('searcher', node);
  if (typeof node.run !== 'function') {
    throw new Error(`searcher "${node.id}": run must be a function`);
  }
  return Object.freeze({...node, kind: /** @type {const} */ ('searcher')});
}

/**
 * Builds an area from its registry. Throws on a duplicate id, a node from
 * another area, a missing root, child, or fallback, a fallback that is not a
 * searcher, or a dispatcher cycle.
 * @template Request, Answer, Catalog
 * @param {{
 *   area: string,
 *   root: string,
 *   nodes: readonly AreaNode<Request, Answer, Catalog>[],
 *   prepare?: (request: Request, catalog: Catalog) => Request | Promise<Request>,
 * }} def
 * @returns {Area<Request, Answer, Catalog>}
 */
export function defineArea(def) {
  /** @type {Map<string, AreaNode<Request, Answer, Catalog>>} */
  const nodes = new Map();
  for (const node of def.nodes) {
    if (node.kind !== 'dispatcher' && node.kind !== 'searcher') {
      throw new Error(`area "${def.area}": unknown node kind`);
    }
    if (node.area !== def.area) {
      throw new Error(
        `area "${def.area}": node "${node.id}" belongs to "${node.area}"`,
      );
    }
    if (nodes.has(node.id)) {
      throw new Error(`area "${def.area}": duplicate node "${node.id}"`);
    }
    nodes.set(node.id, node);
  }
  if (!nodes.has(def.root)) {
    throw new Error(`area "${def.area}": no root node "${def.root}"`);
  }
  for (const node of nodes.values()) {
    if (node.kind !== 'dispatcher') continue;
    for (const id of [...node.children, node.fallback]) {
      if (!nodes.has(id)) {
        throw new Error(
          `area "${def.area}": "${node.id}" names a missing node "${id}"`,
        );
      }
    }
    if (nodes.get(node.fallback)?.kind !== 'searcher') {
      throw new Error(
        `area "${def.area}": "${node.id}" falls back to "${node.fallback}", which is not a searcher`,
      );
    }
  }
  // No dispatcher reaches itself.
  /** @type {Set<string>} */
  const done = new Set();
  /** @param {string} id @param {string[]} path */
  const visit = (id, path) => {
    if (path.includes(id)) {
      throw new Error(
        `area "${def.area}": dispatcher cycle ${[...path, id].join(' -> ')}`,
      );
    }
    if (done.has(id)) return;
    const node = nodes.get(id);
    if (node?.kind === 'dispatcher') {
      for (const child of node.children) visit(child, [...path, id]);
    }
    done.add(id);
  };
  for (const id of nodes.keys()) visit(id, []);
  return Object.freeze({
    area: def.area,
    root: def.root,
    nodes,
    prepare: def.prepare ?? null,
  });
}

/**
 * Runs the area from its root, or from `options.start` to run one node's
 * slice. A dispatcher below its floor runs its fallback;
 * otherwise its routed ids run in order and the first answer wins; when none
 * answers, the fallback runs. Without `options.tuning` the answer is the
 * shipped answer.
 * @template Request, Answer, Catalog
 * @param {Area<Request, Answer, Catalog>} area
 * @param {Request} request
 * @param {RunOptions<Catalog>} options
 * @returns {Promise<Answer | null>}
 */
export async function runArea(area, request, options) {
  const prepared = area.prepare
    ? await area.prepare(request, options.catalog)
    : request;
  const start = options.start ?? area.root;
  if (!area.nodes.has(start)) {
    throw new Error(`area "${area.area}": no node "${start}"`);
  }
  return runNode(area, start, prepared, options, 0, false);
}

/**
 * @template Request, Answer, Catalog
 * @param {Area<Request, Answer, Catalog>} area
 * @param {string} id
 * @param {Request} request
 * @param {RunOptions<Catalog>} options
 * @param {number} depth
 * @param {boolean} fallback
 * @returns {Promise<Answer | null>}
 */
async function runNode(area, id, request, options, depth, fallback) {
  const node = /** @type {AreaNode<Request, Answer, Catalog>} */ (
    area.nodes.get(id)
  );
  const override = options.tuning?.weights;
  /** @type {Json | null} */
  const weights =
    override && Object.hasOwn(override, id)
      ? override[id]
      : Object.hasOwn(options.weights, id)
        ? options.weights[id]
        : null;
  // Each node declared its own weights type; the union erases it to never.
  const ctx =
    /** @type {import('./areas.type.mjs').NodeContext<Catalog, never>} */ (
      /** @type {unknown} */ ({
        area: area.area,
        nodeId: id,
        depth,
        catalog: options.catalog,
        weights,
      })
    );
  /** @param {Omit<TraceEvent, 'area' | 'nodeId' | 'kind' | 'depth' | 'fallback'>} step */
  const trace = step =>
    options.tuning?.onTrace?.({
      area: area.area,
      nodeId: id,
      kind: node.kind,
      depth,
      fallback,
      ...step,
    });

  if (node.kind === 'searcher') {
    const answer = (await node.run(request, ctx)) ?? null;
    trace({answered: answer !== null});
    return answer;
  }

  const route = await node.route(request, ctx);
  for (const routed of route.ids) {
    if (!node.children.includes(routed)) {
      throw new Error(
        `area "${area.area}": "${id}" routed to "${routed}", which is not one of its children`,
      );
    }
  }
  trace({route: {ids: [...route.ids], confidence: route.confidence}});
  if (route.confidence >= node.floor) {
    for (const routed of route.ids) {
      const answer = await runNode(
        area,
        routed,
        request,
        options,
        depth + 1,
        false,
      );
      if (answer !== null) return answer;
    }
  }
  return runNode(area, node.fallback, request, options, depth + 1, true);
}

/**
 * The shipped weights of every node that declares a weights file, read
 * through `read`, which the area's adapter supplies. `read`
 * gets each file name relative to the area's nodes directory.
 * @template Request, Answer, Catalog
 * @param {Area<Request, Answer, Catalog>} area
 * @param {(file: string) => Json} read
 * @returns {Record<string, Json>}
 */
export function loadAreaWeights(area, read) {
  /** @type {Record<string, Json>} */
  const weights = {};
  for (const node of area.nodes.values()) {
    if (node.weights !== null) weights[node.id] = read(node.weights);
  }
  return weights;
}
