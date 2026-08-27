// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: rename authoring doc field types to explicit, domain-prefixed
 * names.
 *
 * v0.3.0 gives the doc vocabulary names that say where each type belongs, so the
 * public surface reads clearly. Vague field names (`PropDoc`, `DerivedVar`,
 * `ContentBlock`, `TranslationDoc`, …) become `Component*` / `Reference*`. The
 * authorable entry types (`ComponentDoc`, `HookDoc`, `ReferenceDoc`,
 * `TemplateDoc`) and the hook/reference-prefixed names are unchanged.
 *
 * This rewrites references imported from the authoring surfaces
 * (`@astryxdesign/cli/authoring` + the legacy subpaths, and `@astryxdesign/core`
 * which re-exported them): the import/export specifier, every reference to the
 * renamed local binding, and JSDoc `@type {import('…').OldName}` comments. Run
 * AFTER `migrate-authoring-imports` (which collapses the sources), though it is
 * safe standalone.
 */

export const meta = {
  title: 'Rename authoring doc field types to explicit domain-prefixed names',
  description:
    'Renames the doc field types (PropDoc, ThemingTarget, ComponentVar, ' +
    'DerivedVar, ElementDescriptor, GroupDoc, TranslationDoc, ExampleDoc, ' +
    'AnatomyElement, BestPractice, PlaygroundConfig, ContentBlock, ' +
    'TokenPreviewType) to their Component*/Reference* equivalents in imports, ' +
    'type references, and JSDoc import() type refs. The authorable entry types ' +
    '(ComponentDoc/HookDoc/ReferenceDoc/TemplateDoc) are unchanged.',
  pr: '#4612',
  fileExtensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],
};

/**
 * old identifier -> new identifier.
 * @type {Record<string, string>}
 */
const RENAMES = {
  PropDoc: 'ComponentPropDoc',
  ExampleDoc: 'ComponentExampleDoc',
  AnatomyElement: 'ComponentAnatomyElement',
  BestPractice: 'ComponentBestPractice',
  PlaygroundConfig: 'ComponentPlaygroundConfig',
  ThemingTarget: 'ComponentThemingTarget',
  ComponentVar: 'ComponentThemingVar',
  DerivedVar: 'ComponentThemingDerivedVar',
  ElementDescriptor: 'ComponentSlotElement',
  GroupDoc: 'ComponentGroupDoc',
  TranslationDoc: 'ComponentTranslationDoc',
  ContentBlock: 'ReferenceContentBlock',
  TokenPreviewType: 'ReferenceTokenPreviewType',
  BaseDoc: 'ComponentBaseDoc',
};

/** Sources that (re-)exported these names. */
const AUTHORING_SOURCES = new Set([
  '@astryxdesign/cli/authoring',
  '@astryxdesign/cli/doc',
  '@astryxdesign/cli/template',
  '@astryxdesign/cli/integration',
  '@astryxdesign/cli/codemod',
  '@astryxdesign/core',
  '@astryxdesign/core/authoring',
]);

/** JSDoc `import('<authoring source>').` prefix, for `@type` comment refs. */
const JSDOC_SOURCE =
  "@astryxdesign/(?:cli/(?:authoring|doc|template|integration|codemod)|core(?:/authoring)?)";

/**
 * @param {any} node a StringLiteral/Literal source node (or null)
 * @returns {boolean}
 */
function isAuthoringSource(node) {
  return !!node && typeof node.value === 'string' && AUTHORING_SOURCES.has(node.value);
}

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let changed = false;

  /** local binding name -> new name (for unaliased imports we also rename refs). */
  const renamedLocals = new Map();

  /** @param {any[] | undefined} specifiers */
  const renameSpecifiers = specifiers => {
    for (const spec of specifiers ?? []) {
      if (spec.type === 'ImportSpecifier') {
        // `imported` is the name from the source; `local` is the binding.
        const oldName = spec.imported && spec.imported.name;
        const next = oldName ? RENAMES[oldName] : undefined;
        if (!next) continue;
        spec.imported.name = next;
        // No `as` alias -> the local reference name changes too.
        if (spec.local && spec.local.name === oldName) {
          spec.local.name = next;
          renamedLocals.set(oldName, next);
        }
        changed = true;
      } else if (spec.type === 'ExportSpecifier') {
        // `local` is the name from the source; `exported` is what re-exports.
        const oldName = spec.local && spec.local.name;
        const next = oldName ? RENAMES[oldName] : undefined;
        if (!next) continue;
        spec.local.name = next;
        if (spec.exported && spec.exported.name === oldName) {
          spec.exported.name = next;
        }
        changed = true;
      }
    }
  };

  root.find(j.ImportDeclaration).forEach((/** @type {any} */ path) => {
    if (isAuthoringSource(path.node.source)) renameSpecifiers(path.node.specifiers);
  });
  root.find(j.ExportNamedDeclaration).forEach((/** @type {any} */ path) => {
    if (path.node.source && isAuthoringSource(path.node.source)) {
      renameSpecifiers(path.node.specifiers);
    }
  });

  // Rename references to the renamed bindings (type positions), skipping the
  // specifiers we already handled and non-reference identifier slots.
  if (renamedLocals.size > 0) {
    root.find(j.Identifier).forEach((/** @type {any} */ path) => {
      const next = renamedLocals.get(path.node.name);
      if (!next) return;
      const parent = path.parent.node;
      if (
        parent.type === 'ImportSpecifier' ||
        parent.type === 'ExportSpecifier' ||
        (parent.type === 'MemberExpression' &&
          parent.property === path.node &&
          !parent.computed) ||
        (parent.type === 'TSQualifiedName' && parent.right === path.node) ||
        ((parent.type === 'ObjectProperty' || parent.type === 'Property') &&
          parent.key === path.node &&
          !parent.computed) ||
        (parent.type === 'TSPropertySignature' && parent.key === path.node)
      ) {
        return;
      }
      path.node.name = next;
      changed = true;
    });
  }

  let out = changed ? root.toSource({quote: 'single'}) : file.source;

  // JSDoc `@type {import('@astryxdesign/…').OldName}` refs live in comment text,
  // not the AST, so rewrite them on the source string.
  const beforeJsdoc = out;
  for (const [oldName, newName] of Object.entries(RENAMES)) {
    const re = new RegExp(
      `(import\\(['"]${JSDOC_SOURCE}['"]\\)\\.)${oldName}\\b`,
      'g',
    );
    out = out.replace(re, `$1${newName}`);
  }
  if (out !== beforeJsdoc) changed = true;

  return changed ? out : undefined;
}
