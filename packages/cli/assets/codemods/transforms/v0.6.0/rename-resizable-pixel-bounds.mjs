// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: rename useResizable pixel-bound aliases
 *
 * Numbers already mean pixels in minSize/maxSize. This rewrites inline single-
 * and multi-region configurations while preserving shorthand values and the
 * released conflict rule (the unified property wins when both are present).
 * A spread or computed property can change precedence invisibly, so dynamic
 * objects stay unchanged and receive a manual-migration TODO instead.
 */

export const meta = {
  title: 'Rename useResizable pixel bounds',
  description:
    'Renames deprecated `minSizePx`/`maxSizePx` properties to `minSize`/' +
    '`maxSize` in static inline useResizable configurations and marks ' +
    'objects with spreads or computed properties for manual migration.',
};

const IMPORT_SOURCES = new Set([
  '@astryxdesign/core',
  '@astryxdesign/core/Resizable',
  '@xds/core',
  '@xds/core/Resizable',
]);
const RENAMES = new Map([
  ['minSizePx', 'minSize'],
  ['maxSizePx', 'maxSize'],
]);
const MANUAL_MIGRATION_COMMENT =
  ' TODO(astryx upgrade): This useResizable configuration contains a spread ' +
  'or computed property. Rename minSizePx/maxSizePx to minSize/maxSize ' +
  'manually without changing property precedence. ';

/** @param {any} property */
function staticPropertyName(property) {
  if (property.computed) return null;
  const key = property.key;
  if (key?.type === 'Identifier') return key.name;
  if (key?.type === 'StringLiteral' || key?.type === 'Literal') {
    return key.value;
  }
  return null;
}

/**
 * @param {any} j
 * @param {any} property
 * @param {string} nextName
 */
function renameKey(j, property, nextName) {
  if (property.shorthand) property.shorthand = false;
  if (property.key.type === 'Identifier') {
    property.key = j.identifier(nextName);
  } else {
    property.key.value = nextName;
  }
}

/**
 * @param {any} j
 * @param {any} object
 */
function migrateObject(j, object) {
  const firstOldProperty = object.properties.find(
    (/** @type {any} */ property) => RENAMES.has(staticPropertyName(property)),
  );
  const hasDynamicProperty = object.properties.some(
    (/** @type {any} */ property) =>
      property.computed === true ||
      property.type === 'SpreadElement' ||
      property.type === 'ExperimentalSpreadProperty',
  );
  if (firstOldProperty && hasDynamicProperty) {
    firstOldProperty.comments ??= [];
    if (
      !firstOldProperty.comments.some(
        (/** @type {any} */ comment) =>
          comment.value === MANUAL_MIGRATION_COMMENT,
      )
    ) {
      firstOldProperty.comments.push(
        j.commentBlock(MANUAL_MIGRATION_COMMENT, true, false),
      );
      return true;
    }
    return false;
  }

  let changed = false;
  for (const [oldName, newName] of RENAMES) {
    const hasNew = object.properties.some(
      (/** @type {any} */ property) => staticPropertyName(property) === newName,
    );
    /** @type {any[]} */
    const next = [];
    for (const property of object.properties) {
      if (staticPropertyName(property) !== oldName) {
        next.push(property);
        continue;
      }
      changed = true;
      if (!hasNew) {
        renameKey(j, property, newName);
        next.push(property);
      }
    }
    object.properties = next;
  }
  return changed;
}

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  if (
    !file.source.includes('minSizePx') &&
    !file.source.includes('maxSizePx')
  ) {
    return undefined;
  }

  const j = api.jscodeshift;
  const root = j(file.source);
  /** @type {Map<string, any>} */
  const bindings = new Map();

  root.find(j.ImportDeclaration).forEach((/** @type {any} */ path) => {
    if (!IMPORT_SOURCES.has(path.node.source.value)) return;
    for (const specifier of path.node.specifiers ?? []) {
      if (
        specifier.type === 'ImportSpecifier' &&
        specifier.imported?.name === 'useResizable'
      ) {
        const local = specifier.local?.name ?? 'useResizable';
        bindings.set(local, path.scope.lookup(local) ?? path.scope);
      }
    }
  });
  if (bindings.size === 0) return undefined;

  let changed = false;
  root.find(j.CallExpression).forEach((/** @type {any} */ path) => {
    const callee = path.node.callee;
    if (callee.type !== 'Identifier' || !bindings.has(callee.name)) return;
    if (path.scope.lookup(callee.name) !== bindings.get(callee.name)) return;
    const config = path.node.arguments[0];
    if (config?.type !== 'ObjectExpression') return;

    changed = migrateObject(j, config) || changed;

    const regions = config.properties.find(
      (/** @type {any} */ property) =>
        staticPropertyName(property) === 'regions',
    );
    if (!regions || !('value' in regions)) return;
    const regionsObject = regions.value;
    if (regionsObject?.type !== 'ObjectExpression') return;
    for (const region of regionsObject.properties) {
      if (!('value' in region) || region.value?.type !== 'ObjectExpression') {
        continue;
      }
      changed = migrateObject(j, region.value) || changed;
    }
  });

  return changed ? root.toSource({quote: 'single'}) : undefined;
}
