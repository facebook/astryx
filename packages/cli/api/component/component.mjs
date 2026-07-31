// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the component command — DISPATCHER + BARREL.
 *
 * Returns the same typed envelope { type, data } that `astryx --json component`
 * outputs. `component(name, opts)` parses the (name, options) pair, resolves the
 * subject once via `_adapter`, and routes to the correct leaf
 * (list · detail · detail.props/source/showcase/blocks), returning that leaf's
 * envelope. The CLI command handler is a thin wrapper around this function.
 *
 * Every leaf is also re-exported for direct scripting use.
 */

import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';
import {AstryxError} from '../error.mjs';
import {
  CORE_PACKAGE,
  requireCoreDir,
  loadIntegrationsSafely,
  resolveOwners,
  classifyScope,
  assertUnambiguousOwners,
  resolveLegacyExternalDoc,
  resolveCoreSourcePath,
  resolveUnscopedDoc,
  loadComponentDoc,
  scopeSubComponent,
} from './_adapter.mjs';
import {componentList} from './list/list.mjs';
import {componentDetail} from './detail/detail.mjs';
import {componentDetailProps} from './detail/props/props.mjs';
import {componentDetailSource} from './detail/source/source.mjs';
import {componentDetailShowcase} from './detail/showcase/showcase.mjs';
import {componentDetailBlocks} from './detail/blocks/blocks.mjs';

/**
 * @param {string} [name]
 * @param {object} [options]
 * @param {string} [options.cwd]
 * @param {boolean} [options.list]
 * @param {string} [options.category]
 * @param {string} [options.package] - Scope to a specific external package (e.g. '@acme/xds-widgets')
 * @param {boolean} [options.props]
 * @param {boolean} [options.source]
 * @param {boolean} [options.showcase]
 * @param {boolean} [options.blocks]
 * @param {'full'|'compact'|'brief'} [options.detail] - Defaults to 'full' for a single component, 'brief' for list views (list/category/no name), matching the CLI.
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @returns {Promise<(
 *   import('./component.type.mjs').ComponentListResponse
 *   | import('./component.type.mjs').ComponentDetailResponse
 *   | import('./component.type.mjs').ComponentDetailPropsResponse
 *   | import('./component.type.mjs').ComponentDetailSourceResponse
 *   | import('./component.type.mjs').ComponentDetailShowcaseResponse
 *   | import('./component.type.mjs').ComponentDetailBlocksResponse
 * )>}
 */
export async function component(name, options = {}) {
  const {
    cwd = process.cwd(),
    list = false,
    category,
    package: packageScope,
    props = false,
    source = false,
    showcase = false,
    blocks = false,
    detail: detailOption,
    lang = null,
    zh = false,
    dense = false,
  } = options;

  // Default detail level mirrors the CLI (see commands/component/index.mjs):
  // single-component views default to 'full', list-style views (--list,
  // --category, or no name) default to 'brief' (scannable name lists).
  // Keeping this in sync with the CLI is what the API↔CLI parity test checks.
  const isListView = list || category != null || !name;
  const detail = detailOption ?? (isListView ? 'brief' : 'full');

  const coreDir = requireCoreDir(cwd);

  // A public API caller could pass a non-string category; the list leaf does
  // `category.toLowerCase()`, so guard it up front (same class as the name
  // guard below) instead of throwing a raw TypeError with no `.code`.
  if (category != null && typeof category !== 'string') {
    throw new AstryxError(
      `Unknown category "${String(category)}"`,
      undefined,
      ERROR_CODES.ERR_UNKNOWN_CATEGORY,
    );
  }

  // ── List mode ──────────────────────────────────────────────────
  if (category || list || !name) {
    return componentList(coreDir, {cwd, category, detail, zh, dense, lang});
  }

  // ── Single component ───────────────────────────────────────────
  if (typeof name !== 'string') {
    throw new AstryxError(
      `No component named "${String(name)}"`,
      undefined,
      ERROR_CODES.ERR_UNKNOWN_COMPONENT,
    );
  }

  const dirName = name.replace(/^XDS/, '');
  const docOpts = {zh, dense, lang};

  // Ownership-aware resolution: who provides `dirName` across core + every
  // loaded integration. The scoped/ambiguity/fuzzy resolution below all read
  // this set (built once, in the adapter).
  const loadedIntegrations = await loadIntegrationsSafely(cwd);
  const owners = resolveOwners(coreDir, dirName, loadedIntegrations);

  // ── Scoped to a specific package (--package) ───────────────────
  // Searches that package first — critical for names that exist in both core
  // and an external package (AppShell, Button, SideNav).
  if (packageScope) {
    const scoped = classifyScope(packageScope, {owners, loadedIntegrations, cwd, name});

    if (scoped.kind === 'core' || scoped.kind === 'integration') {
      const owner = scoped.owner;
      if (source) {
        return componentDetailSource(dirName, owner.sourcePath, {
          name,
          notFoundInPackage: scoped.kind === 'integration' ? packageScope : null,
        });
      }
      // showcase/blocks were previously dropped on the scoped path — a
      // `--package ... --showcase`/`--blocks` request silently fell through to
      // component.detail. Route them to the same leaves the no-scope path uses.
      // Core showcases carry no `package` field, so a core scope must NOT pass
      // packageScope (findShowcase filters those out); integrations never carry
      // a showcase, so skip discovery entirely.
      if (showcase) {
        return scoped.kind === 'core'
          ? componentDetailShowcase(dirName, {cwd, name})
          : componentDetailShowcase(dirName, {cwd, name, resolve: false});
      }
      if (blocks) {
        return componentDetailBlocks(dirName);
      }
      const docs = await loadComponentDoc(owner.docPath, docOpts);
      if (props) return componentDetailProps(docs);
      return componentDetail(docs, owner, dirName, coreDir);
    }

    // Legacy `pkg.astryx.docs` external package.
    if (showcase) {
      return componentDetailShowcase(dirName, {cwd, name, packageScope});
    }
    const extDocPath = resolveLegacyExternalDoc(scoped.ext, dirName);
    if (extDocPath) {
      const docs = await loadComponentDoc(extDocPath, docOpts);
      if (props) return componentDetailProps(docs);
      return componentDetail(docs, {package: scoped.ext.name, sourcePath: null}, dirName, coreDir);
    }
    throw new AstryxError(`No component "${name}" in package "${packageScope}"`, undefined, ERROR_CODES.ERR_UNKNOWN_COMPONENT);
  }

  // ── Ambiguity: owned by MORE THAN ONE package, no --package ─────
  assertUnambiguousOwners(owners, dirName);

  // ── Single non-core owner (an integration provides it, core does not) ──
  if (owners.length === 1 && owners[0].package !== CORE_PACKAGE) {
    const owner = owners[0];
    if (source) {
      return componentDetailSource(dirName, owner.sourcePath, {name});
    }
    if (showcase) {
      // Integration components don't carry showcases — fail without scanning.
      return componentDetailShowcase(dirName, {cwd, name, resolve: false});
    }
    const docs = await loadComponentDoc(owner.docPath, docOpts);
    if (props) return componentDetailProps(docs);
    return componentDetail(docs, owner, dirName, coreDir);
  }

  // ── No-scope core path ─────────────────────────────────────────
  // `--source` reads core directly (no external/fuzzy fallback).
  if (source) {
    return componentDetailSource(dirName, resolveCoreSourcePath(coreDir, dirName), {name});
  }
  if (showcase) {
    return componentDetailShowcase(dirName, {cwd, name});
  }

  const resolved = await resolveUnscopedDoc(dirName, {coreDir, cwd, name});
  const docs = await loadComponentDoc(resolved.readmePath, docOpts);

  // ── Blocks mode ──────────────────────────────────────────────
  if (blocks) {
    return componentDetailBlocks(dirName);
  }

  // ── Sub-component scoping ────────────────────────────────────
  // If the user asked for "Code" but the doc is for "CodeBlock" (parent),
  // scope the response to just the matching sub-component.
  const sub = scopeSubComponent(docs, dirName, coreDir);
  if (sub) {
    if (props) return componentDetailProps({props: sub.matchingComponent.props});
    return componentDetail(
      sub.scoped,
      {package: resolved.resolvedOwnerPackage, sourcePath: resolved.resolvedSourcePath},
      dirName,
      coreDir,
    );
  }

  if (props) return componentDetailProps(docs);
  return componentDetail(
    docs,
    {package: resolved.resolvedOwnerPackage, sourcePath: resolved.resolvedSourcePath},
    resolved.resolvedName,
    coreDir,
  );
}
