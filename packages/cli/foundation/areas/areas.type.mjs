// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Types for answer-picking areas: the two node kinds, the
 * one descriptor they share, the per-node context, routes, tuning, and traces.
 * @input none (types only)
 * @output typedefs for foundation/areas/areas.mjs and every area's nodes
 * @position shared kit; every area under api/<subject>/nodes/ uses these
 */

/**
 * The two node kinds. There is no third.
 * @typedef {'dispatcher' | 'searcher'} NodeKind
 */

/**
 * Any JSON value: what weights and tuning overrides are made of.
 * @typedef {string | number | boolean | null | JsonArray | JsonObject} Json
 */
/** @typedef {Json[]} JsonArray */
/** @typedef {{[key: string]: Json}} JsonObject */

/**
 * What a dispatcher returns: the children to try, best first, and how sure it
 * is, from 0 to 1.
 * @typedef {object} Route
 * @property {readonly string[]} ids
 * @property {number} confidence
 */

/**
 * The context every node gets: a per-node view with the same shape at every
 * depth. `weights` is this node's weights: the tuning override for this node
 * when one is given, else its shipped weights, else null.
 * @template Catalog, Weights
 * @typedef {object} NodeContext
 * @property {string} area The area's name, e.g. 'search'.
 * @property {string} nodeId The id of the node being called.
 * @property {number} depth Dispatcher depth: 0 for the area's root.
 * @property {Catalog} catalog Everything the area's adapter gathered before the tree ran. Read it; never change it.
 * @property {Weights | null} weights This node's weights.
 */

/**
 * A handled example: this input gives this output. `expect` is a partial
 * match: it pins only the fields it states, and an array pins its first items.
 * @template Request
 * @typedef {object} HandledExample
 * @property {Request} input
 * @property {unknown} expect
 * @property {string} [note]
 */

/**
 * A not-handled example: the node declines this input. A searcher returns
 * null; a dispatcher routes below its floor.
 * @template Request
 * @typedef {object} DeclinedExample
 * @property {Request} input
 * @property {string} note
 */

/**
 * The one descriptor both kinds share.
 * @template Request
 * @typedef {object} NodeDescriptor
 * @property {string} id Unique within the area; kebab-case; also the node's file stem, `nodes/<id>.mjs`.
 * @property {string} area The area the node belongs to.
 * @property {string} summary One plain line: what the node answers.
 * @property {readonly HandledExample<Request>[]} handles At least one.
 * @property {readonly DeclinedExample<Request>[]} declines At least one.
 * @property {string | null} weights The weights file beside the node (`<id>.weights.json`), or null.
 * @property {string} tests The test file beside the node (`<id>.test.mjs`).
 */

/**
 * Routes and never ranks. It names only ids from
 * `children`; below `floor` the runner calls `fallback`, the area's main
 * searcher.
 * @template Request, Catalog, Weights
 * @typedef {NodeDescriptor<Request> & {
 *   kind: 'dispatcher',
 *   children: readonly string[],
 *   floor: number,
 *   fallback: string,
 *   route: (request: Request, ctx: NodeContext<Catalog, Weights>) => Route | Promise<Route>,
 * }} DispatcherNode
 */

/**
 * Answers in the area's existing answer shape, or returns null to decline.
 * Local, deterministic, plain code: no network, model, subprocess, or file access.
 * @template Request, Answer, Catalog, Weights
 * @typedef {NodeDescriptor<Request> & {
 *   kind: 'searcher',
 *   run: (request: Request, ctx: NodeContext<Catalog, Weights>) => Answer | null | Promise<Answer | null>,
 * }} SearcherNode
 */

/**
 * Every node an area holds: the discriminated union of the two kinds. Each
 * node types its own weights; `never` here accepts every node's weights type
 * while letting no caller pass a value the node did not declare.
 * @template Request, Answer, Catalog
 * @typedef {DispatcherNode<Request, Catalog, never> | SearcherNode<Request, Answer, Catalog, never>} AreaNode
 */

/**
 * An area: its name, its root node, its nodes by id, and an optional
 * per-request preparation run once before the root.
 * @template Request, Answer, Catalog
 * @typedef {object} Area
 * @property {string} area
 * @property {string} root
 * @property {ReadonlyMap<string, AreaNode<Request, Answer, Catalog>>} nodes
 * @property {((request: Request, catalog: Catalog) => Request | Promise<Request>) | null} prepare
 */

/**
 * One step the runner took. Delivered only to `tuning.onTrace`; never part of
 * an answer.
 * @typedef {object} TraceEvent
 * @property {string} area
 * @property {string} nodeId
 * @property {NodeKind} kind
 * @property {number} depth
 * @property {Route} [route] A dispatcher's route.
 * @property {boolean} [answered] Whether a searcher answered.
 * @property {boolean} fallback Whether this step ran as a fallback.
 */

/**
 * The tuning option every area's API function accepts.
 * Without it the answer is the shipped answer, byte for byte.
 * @typedef {object} AreaTuning
 * @property {Readonly<Record<string, Json>>} [weights] Weights that replace a node's shipped weights for this call, by node id.
 * @property {(event: TraceEvent) => void} [onTrace] Called once for every node step, in order.
 */

/**
 * @template Catalog
 * @typedef {object} RunOptions
 * @property {Catalog} catalog What the area's adapter gathered.
 * @property {Readonly<Record<string, Json>>} weights Shipped weights by node id (see loadAreaWeights).
 * @property {AreaTuning} [tuning]
 * @property {string} [start] Start at this node instead of the root, to run one node's slice.
 */

export {};
