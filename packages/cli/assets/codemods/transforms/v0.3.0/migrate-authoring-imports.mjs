// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: repoint authoring imports to `@astryxdesign/cli/authoring`.
 *
 * v0.3.0 consolidates all Astryx authoring — config, integration, codemod, and
 * the doc/template vocabulary — behind a single entrypoint,
 * `@astryxdesign/cli/authoring`, which exposes the TYPES authors write plain
 * objects against and the PARSERS the CLI runs at the load boundary. The old
 * split surfaces are removed:
 *   - `@astryxdesign/cli/{config,doc,integration,template,codemod}` (CLI aliases)
 *   - `@astryxdesign/core/authoring` and `@astryxdesign/core/config` (the doc /
 *     template / integration / config authoring that used to live in core)
 *
 * This transform rewrites the module specifier of every import/export/dynamic-
 * import / TS `import(...)` type that referenced one of those sources so it
 * points at `@astryxdesign/cli/authoring`. It only touches the specifier string;
 * the imported bindings (types) are unchanged. Run AFTER `unwrap-authoring-
 * factories`, which removes the `create*` value imports these sources also
 * carried — so by the time this runs, only type imports remain to repoint.
 *
 * Not handled: authoring type-imports written inside JSDoc comments
 * (`@type {import('@astryxdesign/cli/config').AstryxConfig}`) — those live in
 * comment text, not the AST, and must be repointed by hand. The vast majority of
 * consumers use `import type` / `import`, which this covers.
 */

export const meta = {
  title: 'Repoint authoring imports to @astryxdesign/cli/authoring',
  description:
    'Rewrites imports/exports (incl. dynamic import and TS import-type) from ' +
    'the removed authoring surfaces — @astryxdesign/cli/{config,doc,' +
    'integration,template,codemod} and @astryxdesign/core/{authoring,config} — ' +
    'to the unified @astryxdesign/cli/authoring entrypoint. Bindings are ' +
    'unchanged; only the module specifier moves.',
  pr: '#4612',
  fileExtensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],
};

/** The unified destination for every authoring import. */
const TARGET = '@astryxdesign/cli/authoring';

/** Exact source specifiers that collapse into {@link TARGET}. */
const AUTHORING_SOURCES = new Set([
  '@astryxdesign/cli/config',
  '@astryxdesign/cli/doc',
  '@astryxdesign/cli/integration',
  '@astryxdesign/cli/template',
  '@astryxdesign/cli/codemod',
  '@astryxdesign/core/authoring',
  '@astryxdesign/core/config',
]);

/**
 * Rewrite a source-specifier string node in place if it names an old authoring
 * surface. Returns whether it changed.
 * @param {any} node a StringLiteral/Literal node (or null)
 * @returns {boolean}
 */
function rewriteSource(node) {
  if (!node || typeof node.value !== 'string') return false;
  if (!AUTHORING_SOURCES.has(node.value)) return false;
  if (node.value === TARGET) return false;
  node.value = TARGET;
  return true;
}

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  root.find(j.ImportDeclaration).forEach((/** @type {any} */ path) => {
    hasChanges = rewriteSource(path.node.source) || hasChanges;
  });
  root.find(j.ExportNamedDeclaration).forEach((/** @type {any} */ path) => {
    hasChanges = rewriteSource(path.node.source) || hasChanges;
  });
  root.find(j.ExportAllDeclaration).forEach((/** @type {any} */ path) => {
    hasChanges = rewriteSource(path.node.source) || hasChanges;
  });

  // Dynamic `import('...')` and `require('...')`.
  root.find(j.CallExpression).forEach((/** @type {any} */ path) => {
    const callee = path.node.callee;
    const isDynamicImport = callee.type === 'Import';
    const isRequire = callee.type === 'Identifier' && callee.name === 'require';
    if (!isDynamicImport && !isRequire) return;
    const [arg] = path.node.arguments;
    if (arg && (arg.type === 'StringLiteral' || arg.type === 'Literal')) {
      hasChanges = rewriteSource(arg) || hasChanges;
    }
  });

  // TS `import(...)` type nodes (e.g. `typeof import('@astryxdesign/cli/doc')`),
  // including those nested in generic type-argument positions that ast-types'
  // typed traversal does not descend into — so walk the raw AST.
  const seen = new Set();
  const walkTSImportTypes = (/** @type {any} */ node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const child of node) walkTSImportTypes(child);
      return;
    }
    if (seen.has(node)) return;
    seen.add(node);
    if (node.type === 'TSImportType' && node.argument) {
      hasChanges = rewriteSource(node.argument) || hasChanges;
    }
    for (const key of Object.keys(node)) {
      if (
        key === 'loc' ||
        key === 'start' ||
        key === 'end' ||
        key === 'range' ||
        key === 'comments' ||
        key === 'leadingComments' ||
        key === 'trailingComments' ||
        key === 'tokens'
      ) {
        continue;
      }
      walkTSImportTypes(node[key]);
    }
  };
  walkTSImportTypes(root.get().node);

  return hasChanges ? root.toSource({quote: 'single'}) : undefined;
}
