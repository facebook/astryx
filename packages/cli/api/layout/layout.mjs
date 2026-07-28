// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the layout command (XLE/XLO).
 *
 * `astryx layout` turns token-compressed layout expressions into validated
 * XDS TSX. Two input surfaces — compact (Emmet-derived XLE) and outline
 * (indentation-based XLO) — share one AST, one validator, and one
 * expander. See the research: pastes P2376666892 (spec) and P2376717669
 * (outline surface).
 *
 * @input  expression string (+ options)
 * @output {type, data} envelopes: layout.expand / layout.check / layout.grammar
 * @position api — pure orchestration over lib/xle; command wrapper in commands/layout.mjs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../lib/error-codes.mjs';
import {assertWithin, isFilePathArg, PathSafetyError} from '../../utils/path-safety.mjs';
import {parse, detectForm, XLEParseError} from '../../lib/xle/parse.mjs';
import {validate} from '../../lib/xle/validate.mjs';
import {expand} from '../../lib/xle/expand.mjs';
import {toCompact, toOutline} from '../../lib/xle/print.mjs';
import {buildRegistry, ALIAS_TABLE} from '../../lib/xle/registry.mjs';
import {discoverTemplates, stripTemplateAssetRefs} from '../template/template.mjs';
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

/** @param {string} name */
const normKey = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Collect the block names referenced by {hints} anywhere in the doc.
 * @param {import('../../lib/xle/xle-ast').XLEDoc} doc
 */
function collectHintNames(doc) {
  /** @type {Set<string>} */
  const names = new Set();
  /** @param {import('../../lib/xle/xle-ast').XLEItem} node */
  const visitNode = (node) => {
    if (!node || node.kind === 'group') {
      (node?.children || []).forEach(visit);
      return;
    }
    if (node.hint?.block) names.add(node.hint.block.name);
    for (const slot of node.slots || []) {
      const value = slot.value;
      if (value && typeof value === 'object' && 'hint' in value && value.hint?.block) {
        names.add(value.hint.block.name);
      }
      if (value && typeof value === 'object' && 'subexpr' in value) {
        (value.subexpr || []).forEach(visit);
      }
    }
    (node.children || []).forEach(visit);
  };
  /** @param {import('../../lib/xle/xle-ast').XLEItem} item */
  const visit = (item) => (item?.kind === 'group' ? item.children.forEach(visit) : visitNode(item));
  doc.roots.forEach(visit);
  doc.overlays.forEach(visit);
  return names;
}

/**
 * Build the blockModules map expand() needs: import-mode for app components,
 * splice-mode (reading + asset-stripping the block source) for template blocks.
 * Only blocks actually referenced are read.
 *
 * @param {import('../../lib/xle/xle-ast').XLEDoc} doc
 * @param {LayoutBlock[]} blocks
 * @returns {Map<string, import('../../lib/xle/xle-ast').BlockModule>}
 */
function buildBlockModules(doc, blocks) {
  const referenced = collectHintNames(doc);
  if (referenced.size === 0) return new Map();
  const byKey = new Map(blocks.map(b => [normKey(b.dirName), b]));
  /** @type {Map<string, import('../../lib/xle/xle-ast').BlockModule>} */
  const modules = new Map();
  for (const name of referenced) {
    const block = byKey.get(normKey(name));
    if (!block) continue;
    if (block.kind === 'component') {
      modules.set(name, /** @type {import('../../lib/xle/xle-ast').BlockModule} */ (/** @type {unknown} */ ({mode: 'import', componentName: block.name, importPath: block.importPath, isDefault: block.isDefault})));
    } else if (block.filePath && fs.existsSync(block.filePath)) {
      modules.set(name, /** @type {import('../../lib/xle/xle-ast').BlockModule} */ ({mode: 'splice', componentName: block.dirName, source: stripTemplateAssetRefs(fs.readFileSync(block.filePath, 'utf-8'))}));
    }
  }
  return modules;
}

/** @param {import('../../lib/xle/xle-ast').RawIssue} issue */
function formatIssue(issue) {
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
async function analyze(expression, {form = 'auto', loose = false, cwd = process.cwd()} = {}) {
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

/**
 * `astryx layout expand "<expr>" [path]`
 *
 * @param {string} expression
 * @param {object} [options]
 * @param {string} [options.targetPath] - write TSX here (validated against cwd)
 * @param {'compact'|'outline'|'auto'} [options.form]
 * @param {boolean} [options.loose] - downgrade unknown {hints} to TODO warnings
 * @param {string} [options.name] - generated component name
 * @param {string} [options.cwd]
 */
export async function layoutExpand(expression, options = {}) {
  const {targetPath, form = 'auto', loose = false, name, cwd = process.cwd()} = options;
  const {doc, registry, blocks, errors, warnings} = await analyze(expression, {form, loose, cwd});

  if (errors.length > 0) {
    throw new AstryxError(
      `Layout expression is invalid:\n` + errors.map(e => `  - ${formatIssue(e)}`).join('\n'),
      errors.flatMap(e => (e.suggestions || []).map(s => ({name: s, reason: 'did you mean this?'}))),
      ERROR_CODES.ERR_LAYOUT_INVALID,
    );
  }

  const componentName = name || 'GeneratedLayout';
  if (!/^[A-Z][A-Za-z0-9]*$/.test(componentName)) {
    throw new AstryxError(
      `--name must be a PascalCase component name, got '${componentName}'`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  const blockModules = buildBlockModules(doc, blocks);
  const result = expand(doc, registry, {componentName, blockModules});

  let written = null;
  if (targetPath) {
    let resolved;
    try {
      resolved = assertWithin(targetPath, cwd, {label: 'layout target path'});
    } catch (err) {
      if (err instanceof PathSafetyError) {
        throw new AstryxError(err.message, undefined, ERROR_CODES.ERR_PATH_TRAVERSAL);
      }
      throw err;
    }
    const filePath = isFilePathArg(targetPath)
      ? resolved
      : path.join(resolved, `${componentName}.tsx`);
    fs.mkdirSync(path.dirname(filePath), {recursive: true});
    fs.writeFileSync(filePath, result.code);
    written = path.relative(cwd, filePath);
  }

  return {
    type: 'layout.expand',
    data: {
      form: form === 'auto' ? detectForm(expression) : form,
      code: result.code,
      componentsUsed: result.componentsUsed,
      states: result.states,
      todos: result.todos,
      blocksReferenced: [...blockModules.entries()].map(([name, m]) => ({name, mode: m.mode})),
      warnings: warnings.map(formatIssue),
      written,
    },
  };
}

/**
 * `astryx layout check "<expr>" [--form compact|outline]`
 * Validates without expanding; echoes both canonical surfaces.
 *
 * @param {string} expression
 * @param {{form?: 'compact'|'outline'|'auto', loose?: boolean, cwd?: string}} [options]
 */
export async function layoutCheck(expression, options = {}) {
  const {form = 'auto', loose = false, cwd = process.cwd()} = options;
  const {doc, errors, warnings} = await analyze(expression, {form, loose, cwd});

  return {
    type: 'layout.check',
    data: {
      valid: errors.length === 0,
      form: doc.form,
      errors: errors.map(e => ({...e, formatted: formatIssue(e)})),
      warnings: warnings.map(formatIssue),
      compact: toCompact(doc),
      outline: toOutline(doc),
    },
  };
}

/**
 * `astryx layout grammar` — the agent cheatsheet, with the alias table
 * generated from this branch's registry (never hand-maintained).
 *
 * @param {{cwd?: string}} [options]
 */
export async function layoutGrammar(options = {}) {
  const {cwd = process.cwd()} = options;
  const registry = await buildRegistry({cwd});

  /** @type {string[]} */
  const aliasLines = [];
  /** @type {Map<string, string[]>} */
  const byTarget = new Map();
  for (const [alias, target] of registry.aliases) {
    if (!byTarget.has(target)) byTarget.set(target, []);
    byTarget.get(target)?.push(alias);
  }
  for (const [target, aliases] of [...byTarget.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    aliasLines.push(`${aliases.join('/')}=${target}`);
  }

  const text = `XLE/XLO — XDS layout expressions (branch-generated; aliases reflect this install)

WORKFLOW
  astryx layout check "<expr>"           validate; echoes canonical compact + outline forms
  astryx layout expand "<expr>" [path]   emit validated TSX (path optional; --name <Pascal>)
  Errors carry line/col + suggestions. Fix and resubmit; nothing is guessed.

TWO SURFACES, ONE LANGUAGE (autodetected; --form to force)
  compact: A[cp6 @topNav=TN] > L > LC > S[p6] > (C{card-callout}*4) + T
  outline: indentation = nesting · same-indent = siblings · "repeat N:" block = (...)*N
           slot lines:  topNav: TN     (or a block:  topNav:\\n    TN ...)

NODE ANATOMY   Name#id.enum"payload"[attrs]{hint}*N > children
  .enum        unique enum value of any prop:  Bd.success  Tx.lg  B.primary
  "payload"    primary text prop (label/title/heading) or text child:  TI"Email"  B"Save"
  {hint}       kebab-case template/component reference (see TEMPLATE REFERENCING) — NEVER text
  *N / xN      repeat (use $ for the counter:  Tk"item-$"*3)
  trailing !   initial selection for scaffolded state:  Tab"Overview"!

ATTRS [...] (outline: bare tokens after the name, no brackets)
  fused        p6 g4 c4 w240 h2 cp2 mw960 rg2 cg2  (per-component: padding lives on Card/Section/AppShell.cp — p6 on AppShell/Layout/VStack errors with a correction)
  key=value    t=email href='/x' c{min:340} dv=[top,bottom] — keys validated per component
  flags        req opt dis striped hover divider … (isX/hasX props) · negate: !scroll
  align        j= main axis, a= cross axis — expander picks hAlign/vAlign per stack direction
  slots        @slotName=Node | @slotName=(sub > expr) | @slotName='text' | @slotName=#id
  trigger      opens=#id  (a plain attr, no @ — binds an onClick that opens the overlay)
  fill         on a stack child → wraps in <StackItem size="fill">

TEMPLATE REFERENCING  ({hint} pulls in real content — this is how XLE reaches past the @astryxdesign/core shell)
  C{card-callout}              splice a template block (astryx template --list --type block):
                              the block is co-defined once in the file, referenced, imports merged
  {kpi-card}                   standalone reference (no wrapper element) — place a component directly
  {kpi-card}*4                 repeat a reference; the definition/import is emitted once
  app components               register local ones in astryx.config.mjs to import them by name:
                                 export default {experimental: {xle: {components: {KpiCard: {from: '@/components/KpiCard'}}}}}
                               then {kpi-card} → import {KpiCard} + <KpiCard /> (kebab ↔ Pascal)

STRUCTURE THE EXPANDER HANDLES
  Layout > LH + LC + LF + LP   children auto-route into header/content/footer/start slots
  T > (TR>THC*4) + (TR>TC*4)*6 rows partition into TableHeader/TableBody automatically
  TabList/inputs               required value+onChange scaffold typed useState automatically
  overlays                     compact: tree ;; Dlg#confirm[...] · outline: overlays: section
                               trigger: B"Delete"[opens=#confirm]

ALIASES (full component names always valid; XDS prefix optional)
  ${aliasLines.join('  ')}
`;

  return {type: 'layout.grammar', data: {text, aliases: Object.fromEntries(registry.aliases)}};
}

export {ALIAS_TABLE};
