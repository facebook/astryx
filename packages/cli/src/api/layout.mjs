// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the layout command (XLE/XLO).
 *
 * `xds layout` turns token-compressed layout expressions into validated
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
import {XDSError} from './error.mjs';
import {ERROR_CODES} from '../lib/error-codes.mjs';
import {assertWithin, isFilePathArg, PathSafetyError} from '../utils/path-safety.mjs';
import {parse, detectForm, XLEParseError} from '../lib/xle/parse.mjs';
import {validate} from '../lib/xle/validate.mjs';
import {expand} from '../lib/xle/expand.mjs';
import {toCompact, toOutline} from '../lib/xle/print.mjs';
import {buildRegistry, ALIAS_TABLE} from '../lib/xle/registry.mjs';
import {discoverTemplates} from './template.mjs';

async function loadBlocks(cwd) {
  try {
    const all = await discoverTemplates(cwd);
    return all.filter(t => t.type === 'block');
  } catch {
    return [];
  }
}

function formatIssue(issue) {
  const where = issue.line != null ? `line ${issue.line}: ` : '';
  return `${where}${issue.message}`;
}

/**
 * Parse + validate, throwing structured XDSErrors on failure.
 * Returns {doc, registry, blocks, warnings}.
 */
async function analyze(expression, {form = 'auto', loose = false, cwd = process.cwd()} = {}) {
  const registry = await buildRegistry({cwd});
  const blocks = await loadBlocks(cwd);

  let doc;
  try {
    doc = parse(expression, {form});
  } catch (e) {
    if (e instanceof XLEParseError) {
      throw new XDSError(
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
 * `xds layout expand "<expr>" [path]`
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
  const {doc, registry, errors, warnings} = await analyze(expression, {form, loose, cwd});

  if (errors.length > 0) {
    throw new XDSError(
      `Layout expression is invalid:\n` + errors.map(e => `  - ${formatIssue(e)}`).join('\n'),
      errors.flatMap(e => (e.suggestions || []).map(s => ({name: s, reason: 'did you mean this?'}))),
      ERROR_CODES.ERR_LAYOUT_INVALID,
    );
  }

  const componentName = name || 'GeneratedLayout';
  if (!/^[A-Z][A-Za-z0-9]*$/.test(componentName)) {
    throw new XDSError(
      `--name must be a PascalCase component name, got '${componentName}'`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  const result = expand(doc, registry, {componentName});

  let written = null;
  if (targetPath) {
    let resolved;
    try {
      resolved = assertWithin(targetPath, cwd, {label: 'layout target path'});
    } catch (err) {
      if (err instanceof PathSafetyError) {
        throw new XDSError(err.message, undefined, ERROR_CODES.ERR_PATH_TRAVERSAL);
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
      warnings: warnings.map(formatIssue),
      written,
    },
  };
}

/**
 * `xds layout check "<expr>" [--form compact|outline]`
 * Validates without expanding; echoes both canonical surfaces.
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
 * `xds layout grammar` — the agent cheatsheet, with the alias table
 * generated from this branch's registry (never hand-maintained).
 */
export async function layoutGrammar(options = {}) {
  const {cwd = process.cwd()} = options;
  const registry = await buildRegistry({cwd});

  const aliasLines = [];
  const byTarget = new Map();
  for (const [alias, target] of registry.aliases) {
    if (!byTarget.has(target)) byTarget.set(target, []);
    byTarget.get(target).push(alias);
  }
  for (const [target, aliases] of [...byTarget.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    aliasLines.push(`${aliases.join('/')}=${target}`);
  }

  const text = `XLE/XLO — XDS layout expressions (branch-generated; aliases reflect this install)

WORKFLOW
  xds layout check "<expr>"           validate; echoes canonical compact + outline forms
  xds layout expand "<expr>" [path]   emit validated TSX (path optional; --name <Pascal>)
  Errors carry line/col + suggestions. Fix and resubmit; nothing is guessed.

TWO SURFACES, ONE LANGUAGE (autodetected; --form to force)
  compact: A[@topNav=TN] > LC[p6] > (C{card-callout}*4) + T
  outline: indentation = nesting · same-indent = siblings · "repeat N:" block = (...)*N
           slot lines:  topNav: TN     (or a block:  topNav:\\n    TN ...)

NODE ANATOMY   Name#id.enum"payload"[attrs]{hint}*N > children
  .enum        unique enum value of any prop:  Bd.success  Tx.lg  B.primary
  "payload"    primary text prop (label/title/heading) or text child:  TI"Email"  B"Save"
  {hint}       kebab-case block reference (xds template --list --type block) — NEVER text
  *N / xN      repeat (use $ for the counter:  Tk"item-$"*3)
  trailing !   initial selection for scaffolded state:  Tab"Overview"!

ATTRS [...] (outline: bare tokens after the name, no brackets)
  fused        p6 g4 c4 w240 h2 cp2 mw960 rg2 cg2  (per-component: p6 on AppShell errors → cp6)
  key=value    t=email href='/x' c{min:340} dv=[top,bottom] — keys validated per component
  flags        req opt dis striped hover divider … (isX/hasX props) · negate: !scroll
  align        j= main axis, a= cross axis — expander picks hAlign/vAlign per stack direction
  slots        @slotName=Node | @slotName=(sub > expr) | @slotName='text' | @opens=#id
  fill         on a stack child → wraps in <StackItem size="fill">

STRUCTURE THE EXPANDER HANDLES
  Layout > LH + LC + LF + LP   children auto-route into header/content/footer/start slots
  T > (TR>THC*4) + (TR>TC*4)*6 rows partition into TableHeader/TableBody automatically
  TabList/inputs               required value+onChange scaffold typed useState automatically
  overlays                     compact: tree ;; Dlg#confirm[...] · outline: overlays: section
                               trigger: B"Delete"[@opens=#confirm]

ALIASES (full component names always valid; XDS prefix optional)
  ${aliasLines.join('  ')}
`;

  return {type: 'layout.grammar', data: {text, aliases: Object.fromEntries(registry.aliases)}};
}

export {ALIAS_TABLE};
