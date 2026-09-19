// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file spacingUsage.mjs
 * @input packages/core/src component sources (TypeScript AST)
 * @output A map of spacing token -> which components it moves
 * @position Build-time data extraction; shared by
 *   scripts/generate-spacing-usage.mjs and src/__tests__/spacing-usage.test.ts
 *
 * ## Why this is derived and not hand-written
 *
 * The Theme Editor needs to tell an author what changing `--spacing-4`
 * actually does (issue #808). The obvious implementation is a curated
 * token -> component table, but this repo has already learned that lesson:
 * packages/core/src/theme/themingTargets.test.ts exists because a
 * hand-authored component/token map drifted from the source twice (#3652,
 * #3680). So the map is read out of the component sources instead, the same
 * way scripts/generate-token-docs.mjs reads tokens.stylex.ts.
 *
 * ## The distinction that makes the answer useful
 *
 * A naive "which files mention this token" grep reports that `Layout` uses
 * all fifteen rungs and that `--spacing-2` is used by 59 component
 * directories — true, and useless. The reason is that components exposing a
 * numeric `gap`/`padding` prop enumerate the whole scale in one
 * `stylex.create` call, keyed by the prop value:
 *
 *   const gapStyles = stylex.create({
 *     2: {columnGap: spacingVars['--spacing-2']},   // reachable via gap={2}
 *   });
 *
 * That is *reach*, not default usage. So each reference is classified:
 *
 * - `components` — the token is in a fixed style. Change it and this
 *   component moves, with no props involved.
 * - `viaProps` — the token is one rung of a prop-keyed scale. Change it and
 *   this component moves only where that prop value is actually passed.
 *
 * The discriminator is exact rather than heuristic: scale rungs are keyed by
 * numeric literals (`0`, `0.5`, `2`), fixed styles by names (`base`, `sm`).
 *
 * ## Scope and assumed conventions
 *
 * Only packages/core/src is scanned: the Theme Editor's component gallery is
 * core, and packages/lab is experimental by definition. The import graph
 * assumes core's own conventions — named imports/exports only. Namespace
 * imports (`import * as`) and `export *` barrels are not followed; core has
 * none for style modules, and the inverse-grep test in
 * src/__tests__/spacing-usage.test.ts fails loudly if a component's refs stop
 * being attributed through a shape this module cannot see.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import ts from 'typescript';

/** The identifier components import from theme/tokens.stylex. */
const SPACING_VARS = 'spacingVars';

/** Files that describe or exercise components rather than styling them. */
const SKIP_FILE = /\.(test|test-violations|stories|doc|bench)\.[cm]?[jt]sx?$/;

/** Directories under packages/core/src that hold no component styling. */
const SKIP_DIR = new Set(['__snapshots__', '__tests__', 'node_modules']);

/**
 * A style-name key that names a spacing step is a rung of a prop-keyed scale.
 * Two spellings are in use, and both mean the same thing:
 *   `2:` / `0.5:`            keyed by SpacingStep    (Stack, Grid, padding.stylex)
 *   `spacing2:` / `spacing0_5:` keyed by SpacingToken (container.stylex)
 */
const SCALE_KEY = /^(\d+(\.\d+)?|spacing\d+(_\d+)?)$/;

/** A spacing token name, exactly — `--spacing-4`, `--spacing-0-5`. */
const TOKEN_NAME = /^--spacing-\d+(-\d+)?$/;

/**
 * @typedef {object} SpacingRef
 * @property {string} token     e.g. '--spacing-4'
 * @property {string} property  the CSS property it is assigned to
 * @property {boolean} scale    true when reachable only via a numeric prop
 * @property {string} [ownerVar] slug after `--astryx-`, when the value flows
 *   through a public component custom property (e.g. 'card-padding')
 */

/**
 * Read the static name of an object-literal key.
 *
 * @returns {string | undefined} undefined for computed keys.
 */
function keyName(node) {
  const name = node.name;
  if (!name) return undefined;
  if (ts.isIdentifier(name) || ts.isNumericLiteral(name)) return name.text;
  if (ts.isStringLiteral(name)) return name.text;
  return undefined;
}

/** True for `spacingVars['--spacing-4']`. */
function spacingTokenOf(node) {
  if (!ts.isElementAccessExpression(node)) return undefined;
  if (!ts.isIdentifier(node.expression)) return undefined;
  if (node.expression.text !== SPACING_VARS) return undefined;
  const arg = node.argumentExpression;
  if (arg && ts.isStringLiteral(arg)) return arg.text;
  return undefined;
}

/**
 * First `--astryx-<slug>` mentioned in a template literal's static text.
 * `--astryx-` is the public component custom-property namespace, so the slug
 * names the component that owns the declaration (see core naming.ts).
 */
function ownerVarOf(text) {
  const match = text.match(/--astryx-([a-z0-9-]+)/);
  return match ? match[1] : undefined;
}

/**
 * Resolve the spacing tokens an expression evaluates to, following module-local
 * const aliases and the chained `var(--astryx-*, ${fallback})` template
 * literals that Card, Section and Dialog use for their default padding.
 *
 * @param {ts.Expression} node
 * @param {Map<string, {tokens: Set<string>, ownerVar?: string}>} aliases
 * @returns {{tokens: Set<string>, ownerVar?: string}}
 */
function resolve(node, aliases) {
  const direct = spacingTokenOf(node);
  if (direct) return {tokens: new Set([direct])};

  // A bare token name as a value is an indirection: Toolbar and Grid map a
  // SpacingStep prop to a token name, then index spacingVars with it.
  if (ts.isStringLiteral(node) && TOKEN_NAME.test(node.text)) {
    return {tokens: new Set([node.text])};
  }

  if (ts.isIdentifier(node)) {
    return aliases.get(node.text) ?? {tokens: new Set()};
  }

  if (ts.isTemplateExpression(node)) {
    const tokens = new Set();
    // The nearest enclosing var() name wins, so an outer
    // `var(--astryx-card-padding-inline, ...)` keeps naming Card even when its
    // fallback chain already carried an owner.
    let ownerVar = ownerVarOf(node.head.text);
    for (const span of node.templateSpans) {
      const inner = resolve(span.expression, aliases);
      for (const token of inner.tokens) tokens.add(token);
      ownerVar ??= inner.ownerVar;
      ownerVar ??= ownerVarOf(span.literal.text);
    }
    return {tokens, ownerVar};
  }

  if (ts.isNoSubstitutionTemplateLiteral(node)) {
    return {tokens: new Set(), ownerVar: ownerVarOf(node.text)};
  }

  if (ts.isParenthesizedExpression(node))
    return resolve(node.expression, aliases);
  if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node)) {
    return resolve(node.expression, aliases);
  }

  return {tokens: new Set()};
}

/**
 * Collect spacing references anywhere beneath a declaration, tracking the
 * object-literal keys enclosing each one.
 *
 * A reference only counts as usage when it sits inside an object literal —
 * that is, when it is actually assigned to something. This is what keeps a
 * bare `const SP4 = spacingVars['--spacing-4'];` from reading as usage of the
 * file that merely defines the alias, while still crediting every place the
 * alias is later applied.
 *
 * Walking every object literal rather than only `stylex.create` arguments
 * matters, because spacing reaches the DOM through several shapes:
 * `stylex.create`, `stylex.keyframes`, plain size maps
 * (`{sm: …, md: …}` in Toolbar), and values built inside component bodies
 * (TreeList's branch offsets).
 *
 * @param {ts.Node} node
 * @param {string[]} keys enclosing object keys, outermost first
 * @param {Map<string, {tokens: Set<string>, ownerVar?: string}>} aliases
 * @param {SpacingRef[]} out
 */
function collectRefs(node, keys, aliases, out) {
  if (ts.isObjectLiteralExpression(node)) {
    for (const prop of node.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const key = keyName(prop);
        collectRefs(
          prop.initializer,
          key === undefined ? keys : [...keys, key],
          aliases,
          out,
        );
        continue;
      }
      if (ts.isSpreadAssignment(prop)) {
        collectRefs(prop.expression, keys, aliases, out);
      }
    }
    return;
  }

  if (keys.length > 0) {
    const {tokens, ownerVar} = resolve(node, aliases);
    if (tokens.size > 0) {
      // No CSS property name or condition key can match SCALE_KEY, so testing
      // the whole stack is equivalent to testing the style-name level.
      const scale = keys.some(key => SCALE_KEY.test(key));
      const property = keys[keys.length - 1];
      for (const token of tokens) {
        out.push(
          ownerVar
            ? {token, property, scale, ownerVar}
            : {token, property, scale},
        );
      }
      return;
    }
  }

  node.forEachChild(child => collectRefs(child, keys, aliases, out));
}

/**
 * Analyze one source file for spacing token usage and module wiring.
 *
 * @param {string} sourceText
 * @param {string} fileName  used only to pick the TS/TSX parser
 * @returns {{
 *   exports: Map<string, SpacingRef[]>,
 *   local: SpacingRef[],
 *   imports: Array<{from: string, names: string[]}>,
 *   reexports: Array<{from: string, names: string[]}>,
 * }}
 */
export function analyzeSource(sourceText, fileName) {
  const source = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ false,
    fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  /** @type {Map<string, {tokens: Set<string>, ownerVar?: string}>} */
  const aliases = new Map();
  /** @type {Map<string, SpacingRef[]>} */
  const exports = new Map();
  /** @type {SpacingRef[]} */
  const local = [];
  const imports = [];
  const reexports = [];

  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement)) {
      const clause = statement.importClause;
      if (!clause || clause.isTypeOnly) continue;
      const bindings = clause.namedBindings;
      if (!bindings || !ts.isNamedImports(bindings)) continue;
      // The source-side name (`shared` in `import {shared as mine}`), because
      // the export lookup that follows the graph runs on it.
      const names = bindings.elements
        .filter(el => !el.isTypeOnly)
        .map(el => el.propertyName?.text ?? el.name.text);
      if (names.length === 0) continue;
      imports.push({from: statement.moduleSpecifier.text, names});
      continue;
    }

    if (ts.isExportDeclaration(statement)) {
      if (statement.isTypeOnly || !statement.moduleSpecifier) continue;
      const clause = statement.exportClause;
      if (!clause || !ts.isNamedExports(clause)) continue;
      // `export {innerStyles as outerStyles}`: consumers ask for the exported
      // name, the next hop must be looked up by the source name.
      const elements = clause.elements.filter(el => !el.isTypeOnly);
      const names = elements.map(el => el.name.text);
      if (names.length === 0) continue;
      const sources = elements.map(el => el.propertyName?.text ?? el.name.text);
      reexports.push({from: statement.moduleSpecifier.text, names, sources});
      continue;
    }

    if (!ts.isVariableStatement(statement)) continue;

    // Record module-level aliases in declaration order, so a chain like
    // `SP4` -> `cardShorthand` -> `cardInline` resolves as it is built.
    for (const declaration of statement.declarationList.declarations) {
      const value = declaration.initializer;
      if (!value || !ts.isIdentifier(declaration.name)) continue;
      if (ts.isObjectLiteralExpression(value) || ts.isCallExpression(value)) {
        continue;
      }
      const resolved = resolve(value, aliases);
      if (resolved.tokens.size > 0 || resolved.ownerVar) {
        aliases.set(declaration.name.text, resolved);
      }
    }
  }

  // Second pass, once every alias is known: collect the actual usage.
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) {
      collectRefs(statement, [], aliases, local);
      continue;
    }
    const isExported = Boolean(
      statement.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword),
    );
    for (const declaration of statement.declarationList.declarations) {
      const value = declaration.initializer;
      if (!value) continue;
      /** @type {SpacingRef[]} */
      const refs = [];
      collectRefs(value, [], aliases, refs);
      if (refs.length === 0) continue;
      if (isExported && ts.isIdentifier(declaration.name)) {
        exports.set(declaration.name.text, refs);
      } else {
        local.push(...refs);
      }
    }
  }

  return {exports, local, imports, reexports};
}

/** Recursively list source files under a directory. */
function listSources(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.isDirectory()) {
      if (SKIP_DIR.has(entry.name)) continue;
      listSources(path.join(dir, entry.name), acc);
      continue;
    }
    if (!/\.tsx?$/.test(entry.name)) continue;
    if (SKIP_FILE.test(entry.name)) continue;
    acc.push(path.join(dir, entry.name));
  }
  return acc;
}

/**
 * The component a file belongs to: the top-level directory under
 * packages/core/src, when that directory is a component (PascalCase). A file
 * sitting at the root itself (BaseProps.ts) belongs to no component.
 *
 * @returns {string | undefined}
 */
function componentOf(relativePath) {
  const parts = relativePath.split(path.sep);
  if (parts.length < 2) return undefined;
  return /^[A-Z]/.test(parts[0]) ? parts[0] : undefined;
}

/** Resolve a relative module specifier to a file in the index. */
function resolveModule(fromFile, specifier, byPath) {
  if (!specifier.startsWith('.')) return undefined;
  const base = path.resolve(path.dirname(fromFile), specifier);
  for (const candidate of [
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
  ]) {
    if (byPath.has(candidate)) return candidate;
  }
  return undefined;
}

/**
 * Find the refs for an exported binding, following re-export chains (the
 * shape Field/index.ts uses for inputWrapperStyles) — cycle-safe, and by
 * source-side name across renaming hops.
 */
function exportedRefs(file, name, byPath, seen = new Set()) {
  if (seen.has(`${file}#${name}`)) return undefined;
  seen.add(`${file}#${name}`);
  const analysis = byPath.get(file);
  if (!analysis) return undefined;
  const direct = analysis.exports.get(name);
  if (direct) return direct;
  for (const reexport of analysis.reexports) {
    const index = reexport.names.indexOf(name);
    if (index === -1) continue;
    const target = resolveModule(file, reexport.from, byPath);
    if (!target) continue;
    const refs = exportedRefs(target, reexport.sources[index], byPath, seen);
    if (refs) return refs;
  }
  return undefined;
}

/**
 * Derive the spacing token -> component usage map from component source.
 *
 * @param {string} coreSrcDir absolute path to packages/core/src
 * @returns {Record<string, {components: string[], viaProps: string[]}>}
 */
export function deriveSpacingUsage(coreSrcDir) {
  // Absolute, because module resolution below compares against path.resolve
  // output. A relative dir would make every import lookup miss and silently
  // under-report instead of failing.
  const root = path.resolve(coreSrcDir);
  const files = listSources(root);
  /** @type {Map<string, ReturnType<typeof analyzeSource>>} */
  const byPath = new Map();
  for (const file of files) {
    byPath.set(file, analyzeSource(fs.readFileSync(file, 'utf-8'), file));
  }

  const componentNames = new Set(
    files.map(file => componentOf(path.relative(root, file))).filter(Boolean),
  );

  /** Longest component whose kebab-case name prefixes an `--astryx-` slug. */
  const ownerToComponent = new Map();
  function resolveOwner(slug) {
    if (ownerToComponent.has(slug)) return ownerToComponent.get(slug);
    let best;
    for (const name of componentNames) {
      const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      if (slug !== kebab && !slug.startsWith(`${kebab}-`)) continue;
      if (!best || kebab.length > best.length) best = kebab;
    }
    const component = best
      ? [...componentNames].find(
          name =>
            name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase() === best,
        )
      : undefined;
    ownerToComponent.set(slug, component);
    return component;
  }

  /** @type {Map<string, {components: Set<string>, viaProps: Set<string>}>} */
  const usage = new Map();
  function record(token, component, scale) {
    if (!component) return;
    let entry = usage.get(token);
    if (!entry) {
      entry = {components: new Set(), viaProps: new Set()};
      usage.set(token, entry);
    }
    (scale ? entry.viaProps : entry.components).add(component);
  }

  /** Record refs against a component, unless an ownerVar names its owner. */
  function recordAll(refs, own) {
    for (const ref of refs) {
      const owner = ref.ownerVar ? resolveOwner(ref.ownerVar) : undefined;
      record(ref.token, owner ?? own, ref.scale);
    }
  }

  for (const file of files) {
    const analysis = byPath.get(file);
    const own = componentOf(path.relative(root, file));

    // Module-local styles can only affect the file that declares them, except
    // where the value flows through a public `--astryx-<component>-*` property,
    // which names its owner outright (see core naming.ts).
    recordAll(analysis.local, own);

    // Exported style objects belong to whoever applies them.
    for (const {from, names} of analysis.imports) {
      const target = resolveModule(file, from, byPath);
      if (!target) continue;
      // A module outside every component directory (hooks/) cannot
      // self-credit its local styles, yet its markup renders inside whatever
      // mounts it — so those refs flow to the importer.
      if (!componentOf(path.relative(root, target))) {
        recordAll(byPath.get(target).local, own);
      }
      for (const name of names) {
        const refs = exportedRefs(target, name, byPath);
        if (!refs) continue;
        recordAll(refs, own);
      }
    }
  }

  /** @type {Record<string, {components: string[], viaProps: string[]}>} */
  const result = {};
  for (const [token, entry] of [...usage].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const components = [...entry.components].sort();
    // A component already moved by a fixed style is not conditionally affected.
    const viaProps = [...entry.viaProps]
      .filter(name => !entry.components.has(name))
      .sort();
    result[token] = {components, viaProps};
  }
  return result;
}

const MODULE_HEADER = `// Copyright (c) Meta Platforms, Inc. and affiliates.

// @generated by scripts/generate-spacing-usage.mjs — do not edit manually

/**
 * Which components a spacing token moves.
 *
 * - \`components\` — the token is used in a fixed style. Changing it moves
 *   these components with no props involved.
 * - \`viaProps\` — the token is one rung of a prop-keyed scale (Stack's
 *   \`gap\`, Card's \`padding\`). Changing it moves these components only where
 *   that prop value is actually passed.
 */
export interface SpacingUsage {
  components: string[];
  viaProps: string[];
}`;

/**
 * Render the generated TypeScript module for a derived usage map.
 *
 * Refuses an empty map: the generator must fail the build loudly rather than
 * ship a valid but blank module — the silent-under-report failure mode this
 * feature exists to prevent.
 *
 * @param {Record<string, {components: string[], viaProps: string[]}>} usage
 * @returns {string}
 */
export function renderSpacingUsageModule(usage) {
  const entries = Object.entries(usage);
  if (entries.length === 0) {
    throw new Error(
      'deriveSpacingUsage found no spacing usage — refusing to render an ' +
        'empty map; the derivation or its source dir is broken',
    );
  }
  const list = names =>
    names.length === 0 ? '[]' : `[${names.map(n => `'${n}'`).join(', ')}]`;
  const body = entries
    .map(([token, {components, viaProps}]) =>
      [
        `  '${token}': {`,
        `    components: ${list(components)},`,
        `    viaProps: ${list(viaProps)},`,
        `  },`,
      ].join('\n'),
    )
    .join('\n');
  return [
    MODULE_HEADER,
    '',
    'export const spacingUsage: Record<string, SpacingUsage> = {',
    body,
    '};',
    '',
  ].join('\n');
}
