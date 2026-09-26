// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Repoint Lab Drawer imports and re-exports to Core
 */

export const meta = {
  title: 'Repoint Lab Drawer imports to Core',
  description:
    'Moves Drawer and DrawerProps imports from @astryxdesign/lab to @astryxdesign/core/Drawer.',
  pr: '#6071',
};

const LAB_ROOT = '@astryxdesign/lab';
const LAB_DRAWER = '@astryxdesign/lab/Drawer';
const CORE_DRAWER = '@astryxdesign/core/Drawer';
const DRAWER_EXPORTS = new Set(['Drawer', 'DrawerProps']);

/**
 * @param {any} identifier
 * @returns {string}
 */
function identifierName(identifier) {
  return identifier?.name ?? identifier?.value ?? '';
}

/** @param {any} specifier */
function isDrawerImportSpecifier(specifier) {
  return (
    specifier.type === 'ImportSpecifier' &&
    DRAWER_EXPORTS.has(identifierName(specifier.imported))
  );
}

/** @param {any} specifier */
function isDrawerExportSpecifier(specifier) {
  return (
    specifier.type === 'ExportSpecifier' &&
    DRAWER_EXPORTS.has(identifierName(specifier.local))
  );
}

/** @param {string} source */
function isLabDrawerSubpath(source) {
  return source === LAB_DRAWER || source.startsWith(`${LAB_DRAWER}/`);
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
    const source = path.node.source.value;
    if (typeof source !== 'string') return;

    if (isLabDrawerSubpath(source)) {
      path.node.source.value = CORE_DRAWER;
      hasChanges = true;
      return;
    }
    if (source !== LAB_ROOT) return;

    const drawerSpecifiers = [];
    const remainingSpecifiers = [];
    for (const specifier of path.node.specifiers ?? []) {
      if (isDrawerImportSpecifier(specifier)) {
        drawerSpecifiers.push(specifier);
      } else {
        remainingSpecifiers.push(specifier);
      }
    }
    if (drawerSpecifiers.length === 0) return;

    if (remainingSpecifiers.length === 0) {
      path.node.source.value = CORE_DRAWER;
    } else {
      path.node.specifiers = remainingSpecifiers;
      const coreImport = j.importDeclaration(
        drawerSpecifiers,
        j.literal(CORE_DRAWER),
      );
      coreImport.importKind = path.node.importKind;
      j(path).insertBefore(coreImport);
    }
    hasChanges = true;
  });

  root.find(j.ExportNamedDeclaration).forEach((/** @type {any} */ path) => {
    const source = path.node.source?.value;
    if (typeof source !== 'string') return;

    if (isLabDrawerSubpath(source)) {
      path.node.source.value = CORE_DRAWER;
      hasChanges = true;
      return;
    }
    if (source !== LAB_ROOT) return;

    const drawerSpecifiers = [];
    const remainingSpecifiers = [];
    for (const specifier of path.node.specifiers ?? []) {
      if (isDrawerExportSpecifier(specifier)) {
        drawerSpecifiers.push(specifier);
      } else {
        remainingSpecifiers.push(specifier);
      }
    }
    if (drawerSpecifiers.length === 0) return;

    if (remainingSpecifiers.length === 0) {
      path.node.source.value = CORE_DRAWER;
    } else {
      path.node.specifiers = remainingSpecifiers;
      const coreExport = j.exportNamedDeclaration(
        null,
        drawerSpecifiers,
        j.literal(CORE_DRAWER),
      );
      coreExport.exportKind = path.node.exportKind;
      j(path).insertBefore(coreExport);
    }
    hasChanges = true;
  });

  root.find(j.ExportAllDeclaration).forEach((/** @type {any} */ path) => {
    const source = path.node.source?.value;
    if (typeof source === 'string' && isLabDrawerSubpath(source)) {
      path.node.source.value = CORE_DRAWER;
      hasChanges = true;
    }
  });

  return hasChanges ? root.toSource({quote: 'single'}) : undefined;
}
