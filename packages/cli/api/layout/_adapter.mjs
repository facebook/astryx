// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared analysis layer for the `layout` command's expand/check leaves.
 *
 * Loads the block catalog (template blocks + app-registered components), builds
 * the branch registry, and parses+validates a layout expression into a doc +
 * issues. Both the expand and check leaves sit on `analyze`; neither parses or
 * validates directly. (The grammar leaf needs none of this — it only reads the
 * registry alias table.)
 *
 * @input  expression string (+ options)
 * @output analyze() -> {doc, registry, blocks, errors, warnings}; formatIssue()
 * @position api — shared core over lib/xle; leaves in expand/ + check/ project it
 */

import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../lib/error-codes.mjs';
import {parse, XLEParseError} from '../../lib/xle/parse.mjs';
import {validate} from '../../lib/xle/validate.mjs';
import {buildRegistry} from '../../lib/xle/registry.mjs';
import {discoverTemplates} from '../template/template.mjs';
import {Project} from '../../lib/project.mjs';

/**
 * @typedef {object} LayoutBlock
 * @property {string} dirName
 * @property {string} name
 * @property {'template'|'component'} kind
 * @property {string} [type]
 * @property {string} [description]
 * @property {string} [category]
 * @property {string} [importPath]
 * @property {string} [filePath]
 * @property {boolean} [isDefault]
 */

/**
 * The catalog a `{hint}` can resolve to: template blocks (spliced inline) plus
 * any app-registered local components from astryx.config.mjs
 * `experimental.xle.components` (imported by name). App components are how XLE
 * reaches domain pieces — the KpiCard/chart/drawer set that the
 * @astryxdesign/core registry can't see.
 *
 * @param {string} cwd
 * @returns {Promise<LayoutBlock[]>}
 */
async function loadBlocks(cwd) {
  /** @type {LayoutBlock[]} */
  const blocks = [];
  try {
    const all = await discoverTemplates(cwd);
    for (const t of all) if (t.type === 'block') blocks.push({...t, kind: 'template'});
  } catch {
    // discovery is best-effort
  }
  try {
    const project = await Project.load(cwd);
    /** @type {Record<string, {from?: string, description?: string, default?: boolean}>} */
    const components = project.config.experimental?.xle?.components ?? {};
    for (const [name, spec] of Object.entries(components)) {
      const importPath = spec.from;
      if (!importPath) continue;
      blocks.push({
        type: 'block',
        kind: 'component',
        dirName: name,
        name,
        description: spec.description ?? '',
        category: 'app',
        importPath,
        isDefault: Boolean(spec.default),
      });
    }
  } catch {
    // config is optional
  }
  return blocks;
}

/** @param {import('../../lib/xle/xle-ast').RawIssue} issue */
export function formatIssue(issue) {
  const where = issue.line != null ? `line ${issue.line}: ` : '';
  return `${where}${issue.message}`;
}

/**
 * Parse + validate, throwing structured XDSErrors on failure.
 * Returns {doc, registry, blocks, warnings}.
 *
 * @param {string} expression
 * @param {{form?: 'compact'|'outline'|'auto', loose?: boolean, cwd?: string}} [options]
 */
export async function analyze(expression, {form = 'auto', loose = false, cwd = process.cwd()} = {}) {
  const registry = /** @type {import('../../lib/xle/xle-ast').Registry} */ (
    /** @type {unknown} */ (await buildRegistry({cwd}))
  );
  const blocks = await loadBlocks(cwd);

  /** @type {import('../../lib/xle/xle-ast').XLEDoc} */
  let doc;
  try {
    doc = parse(expression, {form});
  } catch (e) {
    if (e instanceof XLEParseError) {
      throw new AstryxError(
        `Layout expression syntax error at line ${e.line}, col ${e.col}: ${e.message}`,
        undefined,
        ERROR_CODES.ERR_LAYOUT_PARSE,
      );
    }
    throw e;
  }

  const {errors, warnings} = validate(doc, registry, blocks, {loose});
  return {doc, registry, blocks, errors, warnings};
}
