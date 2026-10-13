// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The active package set: an internal, programmatic seam that lets the
 * unchanged CLI keep the caller's project as its working directory while
 * resolving Core and integration packages from a separate package root.
 *
 * A host that serves the CLI without an install in the caller's project
 * (a hosted runtime) keeps a set of installed packages somewhere else: a
 * directory whose `node_modules` holds `@astryxdesign/cli`,
 * `@astryxdesign/core`, and the integrations the host approves. The host
 * plans the set for one invocation (see package-set.mjs), scopes it here, and
 * runs the CLI as usual. Async-local scope keeps overlapping invocations from
 * seeing or restoring each other's sets. Nothing about the command line changes:
 * there is no flag and no environment variable, because the seam is reachable
 * only from code running in the same process before the CLI starts.
 *
 * While a set is active:
 *
 *   - Project files are still the project's. The config, local themes, the
 *     package being authored, and every file a command writes are resolved
 *     from the working directory exactly as without a set.
 *   - A package the project installed still wins. The set is consulted only
 *     after the project's own `node_modules` chain misses, so it fills gaps
 *     and never overrides an install.
 *   - Enumeration stays declaration-driven. Autolink reads the project's
 *     declared dependencies plus the set's own `declarations` (the approved
 *     hosted integration list when there is no project); it never walks the
 *     root's `node_modules`.
 *   - `handlers` replaces a named export of one integration served from the
 *     package set (today: `discover`) with a function the host supplies. A
 *     project-installed integration always keeps its own export. The
 *     integration keeps its name, so every result still names the package it
 *     came from.
 *
 * Only the set's own Core and its `declarations` resolve through the root: a
 * name the plan did not admit (a config entry outside the approved list, a
 * project dependency the plan did not match) never does, so the root serves
 * nothing the plan does not record.
 *
 * With no active set, every resolver behaves exactly as it does without this
 * module.
 *
 * @position foundation/runtime — read by foundation/fs/paths,
 *   foundation/integrations/{integrations,autolink}; scoped by a host through
 *   package-set.mjs or {@link withPackageSet}.
 */

import {AsyncLocalStorage} from 'node:async_hooks';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * How the active set was chosen. `hosted`: no project pins any Astryx
 * package, so the newest hosted set serves the run. `matched`: the project
 * pins versions it has not installed, and this root carries exactly those.
 * `project`: the project installed every package it pins; the root is null
 * and nothing falls through.
 * @typedef {'hosted' | 'matched' | 'project'} PackageSetMode
 */

/**
 * Handlers a host supplies in place of an integration's own named exports,
 * keyed by the integration's package name.
 * @typedef {Record<string, {discover?: import('../../authoring/discover/type').DiscoverSource}>} PackageSetHandlers
 */

/**
 * @typedef {object} PackageSetInput
 * @property {PackageSetMode} mode
 * @property {string | null} root directory whose `node_modules` holds the set
 * @property {readonly string[]} [declarations] package names enumeration may
 *   reach through the root, in order: the approved hosted integration list in
 *   `hosted` mode, the project's declared Astryx packages in `matched` mode
 * @property {PackageSetHandlers} [handlers]
 * @property {readonly PackageProvenance[]} [packages] where each package in
 *   the set resolves from, for the host to report
 */

/**
 * @typedef {object} PackageProvenance
 * @property {string} name
 * @property {string | null} version
 * @property {'project' | 'package-set'} source
 * @property {string | null} dir
 */

/**
 * @typedef {object} ActivePackageSet
 * @property {PackageSetMode} mode
 * @property {string | null} root
 * @property {readonly string[]} declarations
 * @property {Readonly<PackageSetHandlers>} handlers
 * @property {readonly PackageProvenance[]} packages
 */

/** @type {AsyncLocalStorage<ActivePackageSet | null>} */
const invocationSet = new AsyncLocalStorage();

/** @type {ActivePackageSet | null} Test/legacy process fallback. */
let processSet = null;

/** The one package every set may serve without declaring it. */
const CORE_PACKAGE = '@astryxdesign/core';

/**
 * Is `name` a bare npm package name: one segment, or `@scope/name`, with no
 * path segments? Resolution joins it under `node_modules`, so anything else
 * could reach outside it.
 * @param {unknown} name
 * @returns {name is string}
 */
export function isBarePackageName(name) {
  if (typeof name !== 'string' || name.length === 0) return false;
  if (path.isAbsolute(name) || name.includes('\\')) return false;
  const segments = name.split('/');
  if (segments.length === 1) {
    return segments[0] !== '.' && segments[0] !== '..' && !name.startsWith('@');
  }
  if (segments.length !== 2 || !segments[0].startsWith('@')) return false;
  return (
    segments[0].length > 1 &&
    segments[1] !== '' &&
    segments[1] !== '.' &&
    segments[1] !== '..'
  );
}

/**
 * Validate, normalize, and freeze one package set.
 * @param {PackageSetInput} input
 * @returns {ActivePackageSet}
 */
function createPackageSet(input) {
  if (input == null || typeof input !== 'object') {
    throw new TypeError('activatePackageSet: expected a package set object');
  }
  const {mode} = input;
  if (mode !== 'hosted' && mode !== 'matched' && mode !== 'project') {
    throw new TypeError(
      `activatePackageSet: mode must be "hosted", "matched" or "project", got ${JSON.stringify(mode)}`,
    );
  }
  /** @type {string | null} */
  let root = null;
  if (input.root != null) {
    if (typeof input.root !== 'string' || !path.isAbsolute(input.root)) {
      throw new TypeError('activatePackageSet: root must be an absolute path');
    }
    if (!fs.existsSync(path.join(input.root, 'node_modules'))) {
      throw new Error(
        `activatePackageSet: ${input.root} has no node_modules directory`,
      );
    }
    root = path.resolve(input.root);
  }
  if (mode !== 'project' && root == null) {
    throw new TypeError(`activatePackageSet: a ${mode} set needs a root`);
  }
  const declarations = [...new Set(input.declarations ?? [])].filter(
    isBarePackageName,
  );
  /** @type {PackageSetHandlers} */
  const handlers = Object.create(null);
  for (const [name, entry] of Object.entries(input.handlers ?? {})) {
    if (!isBarePackageName(name) || entry == null) continue;
    handlers[name] = Object.freeze({...entry});
  }
  return Object.freeze({
    mode,
    root,
    declarations: Object.freeze(declarations),
    handlers: Object.freeze(handlers),
    packages: Object.freeze([...(input.packages ?? [])]),
  });
}

/**
 * Make a package set the process fallback, for low-level tests and legacy
 * callers. Hosted invocations use {@link withPackageSet} instead.
 *
 * @param {PackageSetInput} input
 * @returns {() => void} deactivates this set (a no-op once another set
 *   replaced it)
 */
export function activatePackageSet(input) {
  const set = createPackageSet(input);
  processSet = set;
  return () => {
    if (processSet === set) processSet = null;
  };
}

/** Clear the process-fallback package set. */
export function deactivatePackageSet() {
  processSet = null;
}

/**
 * The current invocation's package plan, the process fallback, or null when no
 * host plan is active. A `project` plan has a null root but keeps the verified
 * project package provenance available to Core lookup.
 * @returns {ActivePackageSet | null}
 */
export function activePackageSet() {
  const scoped = invocationSet.getStore();
  return scoped === undefined ? processSet : scoped;
}

/**
 * Run `fn` with `input` scoped to this asynchronous invocation. Overlapping
 * calls keep independent sets.
 * @template T
 * @param {PackageSetInput} input
 * @param {() => Promise<T> | T} fn
 * @returns {Promise<T>}
 */
export async function withPackageSet(input, fn) {
  const set = createPackageSet(input);
  return invocationSet.run(set, fn);
}

/**
 * Run `fn` with no package set in this asynchronous invocation, without
 * changing any overlapping invocation or the process fallback.
 * @template T
 * @param {() => Promise<T> | T} fn
 * @returns {Promise<T>}
 */
export async function withoutPackageSet(fn) {
  return invocationSet.run(null, fn);
}

/**
 * The directory of `name` inside the active set's root, when the set admits
 * the name (its Core, or one of its `declarations`) and the root carries it.
 * Null with no active set, with a `project` set, for a name that is not a
 * bare package name, for a name the set does not admit, or when the root does
 * not carry the package.
 *
 * Callers consult this only AFTER the project's own resolution missed, so an
 * installed package always wins.
 *
 * @param {string} name
 * @returns {string | null}
 */
export function resolveFromPackageSet(name) {
  const active = activePackageSet();
  if (active?.root == null || !isBarePackageName(name)) return null;
  if (name !== CORE_PACKAGE && !active.declarations.includes(name)) {
    return null;
  }
  const dir = path.join(active.root, 'node_modules', ...name.split('/'));
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'),
    );
    return pkg?.name === name ? dir : null;
  } catch {
    return null;
  }
}

/**
 * Package names that enumeration (autolink, legacy external packages) reaches
 * through the active set in addition to the project's own declarations.
 * Empty with no active set.
 * @returns {readonly string[]}
 */
export function packageSetDeclarations() {
  const active = activePackageSet();
  return active?.root == null ? [] : active.declarations;
}

/**
 * The host-supplied replacement for one named export of an integration, or
 * undefined when the host supplied none.
 * @param {string} packageName the integration's package name
 * @param {'discover'} exportName
 * @returns {unknown}
 */
export function packageSetHandler(packageName, exportName) {
  const active = activePackageSet();
  if (
    active == null ||
    !active.packages.some(
      entry => entry.source === 'package-set' && entry.name === packageName,
    )
  ) {
    return undefined;
  }
  const entry = active.handlers[packageName];
  return entry == null ? undefined : entry[exportName];
}
