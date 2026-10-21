// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Source-level checks that what an integration package tells apps to
 * import is importable, read without a build.
 *
 * @input A package directory and its loaded integration record.
 * @output Notes, listed on validate's result and never counted (they fail
 *   `--strict` from the next minor), for: a component's import (the doc's `import`, or the one
 *   the CLI derives) or a template's public import whose subpath
 *   package.json `exports` does not declare (or that names another package);
 *   a component example that imports an undeclared subpath; a template
 *   source that imports a relative path outside the templates root, or an
 *   undeclared subpath of its own package or of Core. Imports it cannot
 *   judge (Core not installed) are listed in a report.
 * @position foundation/integrations, beside the other on-disk contribution
 *   validators; run by `astryx doctor integration validate` (and so by
 *   `integration check`) through api/integration/validate-integration.mjs.
 *
 * An `exports` target may point at build output that does not exist yet, so
 * only the declared subpath is judged here, never the target file or the
 * names it exports; `integration verify` resolves those from the packed
 * package.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {parse} from '@babel/parser';
import {findProjectCoreDir} from '../fs/paths.mjs';
import {
  discoverIntegrationComponents,
  resolveIntegrationImportPath,
} from '../discovery/component-discovery.mjs';
import {loadComponentDoc} from '../discovery/component-loader.mjs';
import {discoverIntegrationTemplatesForOne} from '../discovery/template-adapter.mjs';
import {
  allTargets,
  importable,
  isRecord,
  subpathDeclaration,
} from './exports-subpaths.mjs';

/**
 * @typedef {import('./issue').AstryxIntegrationIssue} Issue
 */

const CORE = '@astryxdesign/core';
const MODULE_EXTENSIONS = [
  '.tsx',
  '.ts',
  '.mts',
  '.jsx',
  '.mjs',
  '.js',
  '.cjs',
  '.cts',
];

/** @param {string} file */
function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return null;
  }
}

/** @param {string} file */
function isFile(file) {
  try {
    return fs.statSync(file).isFile();
  } catch {
    return false;
  }
}

/** @param {string} from @param {string} to */
function rel(from, to) {
  return path.relative(from, to).split(path.sep).join('/');
}

// ── Import specifiers ───────────────────────────────────────────────

/**
 * Split a bare specifier into its package name and `./`-prefixed subpath.
 * @param {string} specifier
 * @returns {{pkg: string, subpath: string} | null}
 */
export function splitSpecifier(specifier) {
  const m = /^((?:@[^/\s]+\/)?[^/\s]+)(\/.*)?$/.exec(specifier);
  if (!m || specifier.startsWith('.') || specifier.startsWith('/')) return null;
  return {pkg: m[1], subpath: m[2] ? `.${m[2]}` : '.'};
}

/**
 * @typedef {object} ImportBinding
 * @property {string} imported the exported name (`default` for a default import)
 * @property {boolean} typeOnly
 */

/**
 * @typedef {object} ImportStatement
 * @property {string} source
 * @property {ImportBinding[]} names
 * @property {boolean} namespace
 * @property {boolean} [typeOnly] the whole statement is `import type`
 */

const PARSE_PLUGINS = /** @type {any} */ ([
  'jsx',
  'typescript',
  'decorators-legacy',
  'importAttributes',
  'exportDefaultFrom',
]);

/** @param {string} text */
function parseModuleText(text) {
  return parse(text, {
    sourceType: 'module',
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    allowAwaitOutsideFunction: true,
    errorRecovery: true,
    plugins: PARSE_PLUGINS,
  });
}

const IMPORT_RE =
  /(?:^|[;\n])\s*import\s+(type\s+)?([^'";]*?)\s*from\s*['"]([^'"]+)['"]/g;

/**
 * Read the import statements of a module or a snippet: named, default,
 * aliased, namespace and type-only. A snippet that does not parse (an example
 * with elisions, say) falls back to reading `import … from '…'` lines.
 * @param {string} text
 * @returns {ImportStatement[]}
 */
export function readImports(text) {
  /** @type {ImportStatement[]} */
  const out = [];
  let ast;
  try {
    ast = parseModuleText(text);
  } catch {
    // Not a module: read the import lines below.
  }
  if (ast) {
    for (const node of ast.program.body) {
      if (node.type !== 'ImportDeclaration') continue;
      const typeOnly = node.importKind === 'type';
      /** @type {ImportStatement} */
      const statement = {
        source: String(node.source.value),
        names: [],
        namespace: false,
        typeOnly,
      };
      for (const s of node.specifiers ?? []) {
        if (s.type === 'ImportDefaultSpecifier') {
          statement.names.push({imported: 'default', typeOnly});
        } else if (s.type === 'ImportNamespaceSpecifier') {
          statement.namespace = true;
        } else if (s.type === 'ImportSpecifier') {
          const imported =
            s.imported.type === 'Identifier'
              ? s.imported.name
              : String(s.imported.value);
          statement.names.push({
            imported,
            typeOnly: typeOnly || s.importKind === 'type',
          });
        }
      }
      out.push(statement);
    }
    return out;
  }
  for (const m of text.matchAll(IMPORT_RE)) {
    const typeOnly = Boolean(m[1]);
    const clause = m[2].trim();
    /** @type {ImportStatement} */
    const statement = {
      source: m[3],
      names: [],
      namespace: /\*\s*as\s/.test(clause),
      typeOnly,
    };
    const braces = /\{([^}]*)\}/.exec(clause);
    const head = clause
      .replace(/\{[^}]*\}/, '')
      .replace(/\*\s*as\s+[\w$]+/, '');
    const defaultName = /^([\w$]+)/.exec(head.trim());
    if (defaultName) statement.names.push({imported: 'default', typeOnly});
    if (braces) {
      for (const part of braces[1].split(',')) {
        const item = part.trim();
        if (!item) continue;
        const t = /^type\s+/.test(item);
        const name = item
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/)[0]
          .trim();
        if (/^[\w$]+$/.test(name))
          statement.names.push({imported: name, typeOnly: typeOnly || t});
      }
    }
    out.push(statement);
  }
  return out;
}

// ── package.json exports ────────────────────────────────────────────

/** @typedef {import('./exports-subpaths.mjs').SubpathDeclaration} SubpathDeclaration */

/**
 * How a package declares one subpath. A package with no `exports` keeps its
 * legacy deep paths: a subpath that names a file on disk (with or without a
 * module extension, or a folder index) counts as declared.
 * @param {unknown} exportsField
 * @param {string} packageDir
 * @param {string} subpath
 * @returns {SubpathDeclaration}
 */
function declarationIn(exportsField, packageDir, subpath) {
  const declaration = subpathDeclaration(exportsField, subpath);
  if (declaration.state !== 'no_exports') return declaration;
  if (subpath === '.') return {state: 'declared', value: null, wildcard: ''};
  const root = path.resolve(packageDir);
  const base = path.resolve(root, subpath.slice(2));
  if (!base.startsWith(root + path.sep)) return declaration;
  const file = [
    base,
    ...MODULE_EXTENSIONS.map(ext => `${base}${ext}`),
    ...MODULE_EXTENSIONS.map(ext => path.join(base, `index${ext}`)),
  ].find(isFile);
  return file
    ? {state: 'declared', value: `./${rel(root, file)}`, wildcard: ''}
    : declaration;
}

/**
 * A declared subpath of the package whose target is `file`, if any: an exact
 * key, or a wildcard key whose target pattern matches the file.
 * @param {unknown} exportsField
 * @param {string} packageDir
 * @param {string} file
 * @returns {string | null}
 */
function subpathFor(exportsField, packageDir, file) {
  if (!isRecord(exportsField)) return null;
  const wanted = `./${rel(packageDir, file)}`;
  for (const [key, value] of Object.entries(exportsField)) {
    if (!key.startsWith('.') || !importable(value)) continue;
    for (const target of allTargets(value)) {
      if (!key.includes('*')) {
        if (target === wanted) return key;
        continue;
      }
      const star = target.indexOf('*');
      if (star === -1) continue;
      const prefix = target.slice(0, star);
      const suffix = target.slice(star + 1);
      if (
        wanted.startsWith(prefix) &&
        wanted.endsWith(suffix) &&
        wanted.length >= prefix.length + suffix.length
      ) {
        return key.replace(
          '*',
          wanted.slice(prefix.length, wanted.length - suffix.length),
        );
      }
    }
  }
  return null;
}

/**
 * The condition names an export value uses, at any depth, in order.
 * @param {unknown} value
 * @param {string[]} [out]
 * @returns {string[]}
 */
function conditionNames(value, out = []) {
  if (Array.isArray(value)) for (const v of value) conditionNames(v, out);
  else if (isRecord(value)) {
    for (const [key, v] of Object.entries(value)) {
      if (!out.includes(key)) out.push(key);
      conditionNames(v, out);
    }
  }
  return out;
}

/**
 * Why a declared state is not importable, in words.
 * @param {SubpathDeclaration} declaration
 * @param {string} subpath
 */
function whyUndeclared(declaration, subpath) {
  const {state} = declaration;
  switch (state) {
    case 'no_exports':
      return `package.json has no "exports" and no file exists at "${subpath}"`;
    case 'root_only':
      return `package.json "exports" names only the package root, which blocks every subpath`;
    case 'blocked':
      return `package.json "exports" maps "${subpath}" to null`;
    case 'not_importable': {
      const names = conditionNames(declaration.value);
      const listed = names.map(name => `"${name}"`).join(', ');
      return names.length === 0
        ? `package.json "exports" gives "${subpath}" no target an ES module import can load`
        : `package.json "exports" gives "${subpath}" only the ${listed} condition${names.length === 1 ? '' : 's'}, none of which an ES module import loads`;
    }
    default:
      return `package.json "exports" does not declare "${subpath}"`;
  }
}

/**
 * The paste-ready package.json change that declares `subpath` → `target`.
 * @param {unknown} exportsField
 * @param {SubpathDeclaration['state']} state
 * @param {string} subpath
 * @param {string} target `./`-prefixed package-relative file
 */
function exportsFix(exportsField, state, subpath, target) {
  const entry = `${JSON.stringify(subpath)}: ${JSON.stringify(target)}`;
  if (state === 'no_exports') {
    return `point it at a file the package ships, or add "exports": {${entry}} to package.json (an "exports" map makes every path it does not list private, so list "." and the package's other public paths too).`;
  }
  if (state === 'root_only') {
    return `make "exports" a subpath map: {".": ${JSON.stringify(exportsField)}, ${entry}}.`;
  }
  if (state === 'not_importable') {
    return `add an ES module condition to "${subpath}" in package.json "exports", e.g. "default": ${JSON.stringify(target)} (or the built file).`;
  }
  if (state === 'blocked') {
    return `replace the null for "${subpath}" in package.json "exports" with ${JSON.stringify(target)}, or stop advertising it.`;
  }
  return `add ${entry} to package.json "exports" (or the built file it compiles to).`;
}

// ── Listed findings ─────────────────────────────────────────────────

/**
 * A public-import finding as a note on validate's result: listed with its
 * fix inside the message, never counted or failed on. It becomes a failing
 * warning in the next minor release (a new failure code joins only in a
 * minor).
 * @param {string} code
 * @param {string} message
 * @returns {PublicImportNote}
 */
function listed(code, message) {
  return {code, message};
}

// ── Checks ──────────────────────────────────────────────────────────

/**
 * @typedef {object} Context
 * @property {string} packageDir
 * @property {string | null} name the package name; null when package.json has
 *   none, and then no import of the package's own name is judged
 * @property {unknown} exportsField
 * @property {string | null} coreDir
 * @property {any} corePkg
 * @property {PublicImportUnchecked[]} unchecked what could not be judged
 * @property {string[]} files the package.json `files` entries, normalized
 * @property {string[]} roots the integration's contribution roots, absolute
 */

const BUILT_EXTENSION_RE = /\.[cm]?jsx?$/u;

/**
 * Whether an undeclared deep path, in a package with no `exports`, points
 * into build output that is not built yet: its top folder is missing, or is
 * a `files` folder that holds no contribution root. Such an import cannot be
 * judged from source.
 * @param {Context} ctx
 * @param {string} subpath
 * @param {SubpathDeclaration} declaration
 */
function unbuiltOutput(ctx, subpath, declaration) {
  if (declaration.state !== 'no_exports' || subpath === '.') return false;
  const top = subpath.slice(2).split('/')[0];
  if (!top) return false;
  const topDir = path.resolve(ctx.packageDir, top);
  if (!fs.existsSync(topDir)) return true;
  return (
    ctx.files.includes(top) &&
    !ctx.roots.some(
      root => root === topDir || root.startsWith(topDir + path.sep),
    )
  );
}

/**
 * The reason an import into unbuilt output is listed as not checked.
 * @param {string} subpath
 */
function unbuiltReason(subpath) {
  return `package.json has no "exports", and "${subpath}" is build output that is not built yet, so it was not checked`;
}

/**
 * The target a fix maps `subpath` to: the component's source for a source
 * path, never a TypeScript source for a built `.js` path.
 * @param {string} subpath
 * @param {string | null} sourceTarget
 */
function fixTarget(subpath, sourceTarget) {
  if (
    sourceTarget &&
    !(
      BUILT_EXTENSION_RE.test(subpath) && !BUILT_EXTENSION_RE.test(sourceTarget)
    )
  ) {
    return sourceTarget;
  }
  return BUILT_EXTENSION_RE.test(subpath)
    ? `<the built file "${subpath}" names>`
    : `./${subpath.slice(2)}.tsx`;
}

/** @typedef {import('../../api/integration/validate-integration.type.mjs').PublicImportUnchecked} PublicImportUnchecked */
/** @typedef {import('../../api/integration/validate-integration.type.mjs').PublicImportsReport} PublicImportsReport */
/** @typedef {{code: string, message: string}} PublicImportNote */

/**
 * Whether an import of the package's own name names a subpath `exports`
 * declares; the declaration when it does not.
 * @param {Context} ctx
 * @param {ImportStatement} statement
 * @param {string} subpath
 * @returns {SubpathDeclaration | null}
 */
function undeclaredOwnImport(ctx, statement, subpath) {
  const declaration = declarationIn(ctx.exportsField, ctx.packageDir, subpath);
  // `import type` needs only a `types` target: TypeScript reads it, nothing
  // loads it at run time.
  if (
    statement.typeOnly &&
    declaration.state === 'not_importable' &&
    conditionNames(declaration.value).includes('types')
  ) {
    return null;
  }
  return declaration.state === 'declared' ? null : declaration;
}

/**
 * A component doc's import specifier, and every example's imports.
 * @param {Context} ctx
 * @param {any} integration
 * @returns {Promise<PublicImportNote[]>}
 */
async function componentIssues(ctx, integration) {
  /** @type {PublicImportNote[]} */
  const issues = [];
  // Every component check compares imports with the package's own name.
  if (ctx.name == null) return issues;
  let records;
  try {
    records = discoverIntegrationComponents(integration);
  } catch {
    return issues; // an unreadable root is reported by the root validators
  }
  /** @type {Map<string, typeof records>} */
  const byDoc = new Map();
  for (const record of records) {
    const list = byDoc.get(record.docPath) ?? [];
    list.push(record);
    byDoc.set(record.docPath, list);
  }
  for (const [docPath, list] of byDoc) {
    let doc;
    try {
      doc = await loadComponentDoc(docPath);
    } catch {
      continue; // reported by the doc validators
    }
    if (!isRecord(doc)) continue;
    const shownDoc = rel(ctx.packageDir, docPath);
    const record = list[0];
    const source = record.sourcePath;
    const sourceTarget = source ? `./${rel(ctx.packageDir, source)}` : null;
    // The import the doc writes, or the one the CLI derives for it (its
    // folder's subpath when exported, else the package root).
    const authored = typeof doc.import === 'string' ? doc.import : null;
    const specifier =
      authored ??
      resolveIntegrationImportPath(
        {
          exportsMap: /** @type {any} */ (ctx.exportsField) ?? null,
          packageDir: ctx.packageDir,
          docPath,
          packageName: ctx.name,
        },
        record.name,
      );
    const split = splitSpecifier(specifier);
    // The entry that exports this component alone, and the doc import that
    // uses it: never one component's file as the package root or folder.
    const entryKey = sourceTarget
      ? sourceTarget.replace(/\.[cm]?[jt]sx?$/u, '')
      : null;
    const perComponent = entryKey
      ? `add "${entryKey}": "${sourceTarget}" to package.json "exports" and set import: '${ctx.name}${entryKey.slice(1)}' in the doc`
      : null;
    const gives = authored
      ? `gives import "${specifier}"`
      : `has no import, so apps are told to import from "${specifier}"`;
    const declared = source
      ? subpathFor(ctx.exportsField, ctx.packageDir, source)
      : null;
    const suggested =
      declared ??
      (sourceTarget ? sourceTarget.replace(/\.[cm]?[jt]sx?$/u, '') : null);
    if (split && split.pkg !== ctx.name) {
      issues.push(
        listed(
          'component_import_other_package',
          `Component doc "${shownDoc}" ${gives}, which names package "${split.pkg}", not this package "${ctx.name}", so apps are told to import the component from somewhere it is not. Fix: set import: '${ctx.name}${suggested ? suggested.slice(1) : ''}' in the doc.`,
        ),
      );
    } else if (split) {
      const declaration = declarationIn(
        ctx.exportsField,
        ctx.packageDir,
        split.subpath,
      );
      if (unbuiltOutput(ctx, split.subpath, declaration)) {
        ctx.unchecked.push({
          file: shownDoc,
          specifier,
          reason: unbuiltReason(split.subpath),
        });
      } else if (declaration.state !== 'declared') {
        const already =
          declared && declared !== split.subpath
            ? `set import: '${ctx.name}${declared.slice(1)}' (already exported), or `
            : '';
        issues.push(
          listed(
            'component_import_not_exported',
            `Component doc "${shownDoc}" ${gives}, but ${whyUndeclared(declaration, split.subpath)}, so apps cannot import the component from it. Fix: ${already}${split.subpath === '.' && perComponent ? `${perComponent}.` : exportsFix(ctx.exportsField, declaration.state, split.subpath, fixTarget(split.subpath, sourceTarget))}`,
          ),
        );
      }
    }

    /**
     * The `exports` entry an example with an undeclared import needs: its
     * subpath mapped to the file there, or to the component's source when
     * the example imports only components this doc documents, else to the
     * file that exports what it imports.
     * @param {ImportStatement} statement
     * @param {string} subpath
     * @param {SubpathDeclaration} undeclared
     */
    const exampleFix = (statement, subpath, undeclared) => {
      const values = statement.names
        .filter(binding => !binding.typeOnly)
        .map(binding => binding.imported);
      const atSubpath = [
        '',
        ...MODULE_EXTENSIONS,
        ...MODULE_EXTENSIONS.map(ext => `/index${ext}`),
      ]
        .map(ext => path.resolve(ctx.packageDir, `${subpath.slice(2)}${ext}`))
        .find(
          file =>
            file.startsWith(path.resolve(ctx.packageDir) + path.sep) &&
            isFile(file),
        );
      const documented = new Set(list.map(r => r.name));
      const onlyDocumented =
        values.length > 0 && values.every(name => documented.has(name));
      const target = atSubpath
        ? `./${rel(ctx.packageDir, atSubpath)}`
        : onlyDocumented && sourceTarget
          ? fixTarget(subpath, sourceTarget)
          : `<the file that exports ${values.join(', ') || 'them'}>`;
      return exportsFix(ctx.exportsField, undeclared.state, subpath, target);
    };

    const examples = Array.isArray(doc.examples) ? doc.examples : [];
    for (const [index, example] of examples.entries()) {
      if (!isRecord(example) || typeof example.code !== 'string') continue;
      const label =
        typeof example.label === 'string'
          ? `"${example.label}"`
          : `#${index + 1}`;
      for (const statement of readImports(example.code)) {
        const parts = splitSpecifier(statement.source);
        if (!parts || parts.pkg !== ctx.name) continue;
        const undeclared = undeclaredOwnImport(ctx, statement, parts.subpath);
        if (undeclared && unbuiltOutput(ctx, parts.subpath, undeclared)) {
          ctx.unchecked.push({
            file: shownDoc,
            specifier: statement.source,
            reason: `example ${label}: ${unbuiltReason(parts.subpath)}`,
          });
        } else if (undeclared) {
          issues.push(
            listed(
              'example_import_not_exported',
              `Component doc "${shownDoc}" example ${label} imports "${statement.source}", but ${whyUndeclared(undeclared, parts.subpath)}, so the example fails when an app copies it. Fix: ${exampleFix(statement, parts.subpath, undeclared)}`,
            ),
          );
        }
      }
    }
  }
  return issues;
}

/**
 * Template public imports and what each template source imports.
 * @param {Context} ctx
 * @param {any} integration
 * @returns {Promise<PublicImportNote[]>}
 */
async function templateIssues(ctx, integration) {
  /** @type {PublicImportNote[]} */
  const issues = [];
  const root = integration.templates;
  if (!root) return issues;
  let templates;
  try {
    ({templates} = await discoverIntegrationTemplatesForOne(integration));
  } catch {
    return issues;
  }
  for (const template of templates) {
    const id = template.dirName;
    const file = template.filePath;
    const shown = rel(ctx.packageDir, file);
    const sourceTarget = `./${shown}`;
    const subpath = `./${shown.replace(/\.tsx?$/u, '')}`;
    const declaration = declarationIn(
      ctx.exportsField,
      ctx.packageDir,
      subpath,
    );
    if (ctx.name != null && declaration.state !== 'declared') {
      issues.push(
        listed(
          'template_import_not_exported',
          `Template "${id}" has public import "${ctx.name}${subpath.slice(1)}", but ${whyUndeclared(declaration, subpath)}, so it cannot be imported once published. Fix: ${exportsFix(ctx.exportsField, declaration.state, subpath, sourceTarget)}`,
        ),
      );
    }

    let text;
    try {
      text = fs.readFileSync(file, 'utf-8');
    } catch {
      text = '';
    }
    for (const statement of readImports(text)) {
      const spec = statement.source;
      if (spec.startsWith('.')) {
        const target = path.resolve(path.dirname(file), spec);
        if (target !== root && !target.startsWith(root + path.sep)) {
          issues.push(
            listed(
              'template_import_outside_root',
              `Template "${id}" (${shown}) imports "${spec}", a path outside the templates root; \`astryx template\` copies only the template into an app, where that path does not exist. Fix: import it through the package's public name (e.g. '${ctx.name ?? '<package name>'}/…' declared in package.json "exports"), or move the code into the template.`,
            ),
          );
        }
        continue;
      }
      const parts = splitSpecifier(spec);
      if (!parts) continue;
      if (ctx.name != null && parts.pkg === ctx.name) {
        const undeclared = undeclaredOwnImport(ctx, statement, parts.subpath);
        if (undeclared && unbuiltOutput(ctx, parts.subpath, undeclared)) {
          ctx.unchecked.push({
            file: shown,
            specifier: spec,
            reason: unbuiltReason(parts.subpath),
          });
        } else if (undeclared) {
          issues.push(
            listed(
              'template_private_import',
              `Template "${id}" (${shown}) imports "${spec}", but ${whyUndeclared(undeclared, parts.subpath)}, so the template breaks in an app. Fix: import from a subpath package.json "exports" declares, or add one for it.`,
            ),
          );
        }
      } else if (parts.pkg === CORE && !ctx.corePkg) {
        ctx.unchecked.push({
          file: shown,
          specifier: spec,
          reason:
            '@astryxdesign/core is not installed, so Core\'s package.json "exports" could not be read',
        });
      } else if (parts.pkg === CORE && ctx.corePkg && parts.subpath !== '.') {
        const core = declarationIn(
          ctx.corePkg.exports,
          /** @type {string} */ (ctx.coreDir),
          parts.subpath,
        );
        if (core.state !== 'declared') {
          const top = parts.subpath
            .split('/')
            .filter(s => s && s !== '.' && s !== 'src')[0];
          const hint =
            top &&
            subpathDeclaration(ctx.corePkg.exports, `./${top}`).state ===
              'declared'
              ? `'${CORE}/${top}'`
              : `a subpath Core's package.json "exports" declares`;
          issues.push(
            listed(
              'template_private_import',
              `Template "${id}" (${shown}) imports "${spec}", a path Core's package.json "exports" does not declare, so the template breaks in an app. Fix: import from ${hint}.`,
            ),
          );
        }
      }
    }
  }
  return issues;
}

/**
 * Every public-import finding for one package, as notes, and the report of
 * what could not be judged. It returns no issues: the notes are listed
 * only, and fail `--strict` from the next minor release.
 * @param {string} packageDir
 * @param {any} integration the loaded integration record
 * @returns {Promise<{issues: Issue[], notes: PublicImportNote[], report: PublicImportsReport}>}
 *   `issues` is always empty: kept so validate's call site stays one shape
 */
export async function publicImportIssues(packageDir, integration) {
  /** @type {PublicImportsReport} */
  const report = {status: 'checked', findings: [], unchecked: []};
  const pkg = readJson(path.join(packageDir, 'package.json'));
  // What cannot run is listed as not checked, never a skip `--strict` would
  // fail on.
  if (!isRecord(pkg)) {
    report.unchecked.push({
      file: 'package.json',
      specifier: '',
      reason: 'package.json could not be read, so no import was checked',
    });
    return {issues: [], notes: [], report};
  }
  const name =
    typeof pkg.name === 'string' && pkg.name !== '' ? pkg.name : null;
  if (name == null) {
    report.unchecked.push({
      file: 'package.json',
      specifier: '',
      reason:
        'package.json has no "name", so imports of the package\'s own name were not checked; only template imports outside the templates root and of Core were',
    });
  }
  // The Core installed beside the package, which its templates' imports
  // resolve against; never the CLI's own copy, which may be another release.
  // A workspace's own `packages/core` (another package) is not it: then Core
  // counts as not installed and its imports are listed as not checked.
  const foundCore = name === CORE ? packageDir : findProjectCoreDir(packageDir);
  const foundCorePkg = foundCore
    ? readJson(path.join(foundCore, 'package.json'))
    : null;
  const isCore = isRecord(foundCorePkg) && foundCorePkg.name === CORE;
  /** @type {Context} */
  const ctx = {
    packageDir,
    name,
    exportsField: pkg.exports,
    coreDir: isCore ? foundCore : null,
    corePkg: isCore ? foundCorePkg : null,
    unchecked: report.unchecked,
    files: Array.isArray(pkg.files)
      ? pkg.files
          .filter(entry => typeof entry === 'string')
          .map(entry => entry.replace(/^\.\//u, '').replace(/\/+$/u, ''))
      : [],
    roots: [
      integration.components,
      integration.templates,
      integration.docs,
      integration.themes,
      integration.codemods,
    ]
      .filter(root => typeof root === 'string')
      .map(root => path.resolve(root)),
  };
  const notes = [
    ...(await componentIssues(ctx, integration)),
    ...(await templateIssues(ctx, integration)),
  ];
  // Listed only: none is an issue, so none counts or fails a check.
  return {issues: [], notes, report};
}
