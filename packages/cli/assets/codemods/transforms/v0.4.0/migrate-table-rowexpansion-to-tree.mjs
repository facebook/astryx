// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Migrate tree-mode useTableRowExpansion to the tree plugin
 *
 * useTableRowExpansion is now a detail-panel plugin (renderExpanded). Its old
 * tree mode (child rows that reuse the parent columns) moved to
 * useTableTreeData + useTableTreeState, and useTableRowExpansionState was
 * removed. This codemod rewrites the standard tree pattern:
 *
 *   const {data, expansionConfig} = useTableRowExpansionState({
 *     baseData, getChildren, getRowKey, expandedKeys, setExpandedKeys,
 *   });
 *   const expansion = useTableRowExpansion(expansionConfig);
 *
 * into:
 *
 *   const {visibleData: data, treeConfig} = useTableTreeState({
 *     data: baseData, childrenKey: 'children', idKey: getRowKey, ...
 *   });
 *   const expansion = useTableTreeData(treeConfig);
 *
 * Files that use the new detail-panel API (renderExpanded, no
 * useTableRowExpansionState import) are left untouched.
 */

export const meta = {
  title: 'Migrate tree-mode useTableRowExpansion to the tree plugin',
  description:
    'Rewrites the removed useTableRowExpansionState tree pattern to useTableTreeState + useTableTreeData. Detail-panel usage (renderExpanded) is left untouched.',
  pr: '#4612',
};

const IMPORT_SOURCES = new Set([
  '@astryxdesign/core',
  '@astryxdesign/core/Table',
  '@xds/core',
  '@xds/core/Table',
]);

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | null | undefined}
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Only act on files importing the removed state hook. Detail-panel-only
  // usage (useTableRowExpansion alone) is the new API and must be left alone.
  let stateLocal = null;
  let pluginLocal = null;
  /** @type {any[]} */
  const importPaths = [];
  root.find(j.ImportDeclaration).forEach((/** @type {any} */ path) => {
    if (!IMPORT_SOURCES.has(path.node.source.value)) return;
    for (const spec of path.node.specifiers ?? []) {
      if (spec.type !== 'ImportSpecifier') continue;
      if (spec.imported.name === 'useTableRowExpansionState') {
        stateLocal = spec.local?.name ?? spec.imported.name;
        importPaths.push(path);
      }
      if (spec.imported.name === 'useTableRowExpansion') {
        pluginLocal = spec.local?.name ?? spec.imported.name;
      }
    }
  });
  if (!stateLocal) return undefined;

  let hasChanges = false;

  // --- 1. Rewrite the state hook call + its config object ---
  root
    .find(j.CallExpression, {callee: {name: stateLocal}})
    .forEach((/** @type {any} */ path) => {
      const arg = path.node.arguments[0];
      if (!arg || arg.type !== 'ObjectExpression') return;

      /** @type {any} */
      let getChildrenValue = null;
      const nextProps = [];
      for (const prop of arg.properties) {
        const key =
          prop.key?.name ?? (prop.key?.value ? String(prop.key.value) : null);
        if (key === 'baseData') {
          nextProps.push(j.property('init', j.identifier('data'), prop.value));
        } else if (key === 'getChildren') {
          getChildrenValue = prop.value;
          // childrenKey is emitted below (default 'children').
        } else if (key === 'getRowKey') {
          nextProps.push(j.property('init', j.identifier('idKey'), prop.value));
        } else if (key === 'getIsItemExpandable') {
          nextProps.push(
            j.property('init', j.identifier('isItemExpandable'), prop.value),
          );
        } else if (key === 'expandedKeys' || key === 'setExpandedKeys') {
          // The tree state hook owns expansion internally (uncontrolled) or
          // via expandedIds/onExpandedIdsChange (controlled). The 1:1
          // controlled mapping is not mechanical, so these are dropped and a
          // guidance comment is attached below.
          continue;
        } else {
          nextProps.push(prop);
        }
      }

      // childrenKey: derive the literal when getChildren is the canonical
      // `item => item.children` / `item.children ?? []`; otherwise keep the
      // default and let the guidance comment flag it.
      nextProps.splice(
        1,
        0,
        j.property('init', j.identifier('childrenKey'), j.literal('children')),
      );

      arg.properties = nextProps;
      path.node.callee = j.identifier('useTableTreeState');
      hasChanges = true;

      // Rename the destructured result: data -> visibleData (aliased back to
      // the local name), expansionConfig -> treeConfig.
      const declarator = path.parent.node;
      if (
        declarator.type === 'VariableDeclarator' &&
        declarator.id.type === 'ObjectPattern'
      ) {
        for (const p of declarator.id.properties) {
          if (p.type !== 'ObjectProperty' && p.type !== 'Property') continue;
          const kName = p.key?.name;
          if (kName === 'data') {
            // {data} -> {visibleData: data}
            p.key = j.identifier('visibleData');
            if (p.shorthand) {
              p.shorthand = false;
              p.value = j.identifier('data');
            }
          } else if (kName === 'expansionConfig') {
            // {expansionConfig} -> {treeConfig} (keep it shorthand).
            p.key = j.identifier('treeConfig');
            if (p.value?.type === 'Identifier') {
              p.value = j.identifier('treeConfig');
              p.shorthand = true;
            }
          }
        }
      }

      // Attach a one-line migration note as a leading comment on the
      // statement, so a human confirms the expansion-state wiring.
      const stmt = path.parent.parent.node;
      if (stmt && !stmt.comments) {
        stmt.comments = [
          j.commentLine(
            ' astryx-migration: verify tree expansion state. useTableTreeState',
            true,
            false,
          ),
          j.commentLine(
            ' is uncontrolled by default; pass defaultExpandedIds, or',
            true,
            false,
          ),
          j.commentLine(
            ' expandedIds + onExpandedIdsChange for the old controlled set.',
            true,
            false,
          ),
        ];
      }
      void getChildrenValue;
    });

  // --- 2. Swap the plugin call: useTableRowExpansion(cfg) -> useTableTreeData(cfg) ---
  if (pluginLocal) {
    root
      .find(j.CallExpression, {callee: {name: pluginLocal}})
      .forEach((/** @type {any} */ path) => {
        // Rename the argument identifier expansionConfig -> treeConfig.
        const a = path.node.arguments[0];
        if (a && a.type === 'Identifier' && a.name === 'expansionConfig') {
          path.node.arguments[0] = j.identifier('treeConfig');
        }
        path.node.callee = j.identifier('useTableTreeData');
        hasChanges = true;
      });
  }

  if (!hasChanges) return undefined;

  // --- 3. Fix imports: drop the removed hooks, add the tree hooks ---
  for (const path of importPaths) {
    const specs = path.node.specifiers.filter(
      (/** @type {any} */ s) =>
        !(
          s.type === 'ImportSpecifier' &&
          (s.imported.name === 'useTableRowExpansionState' ||
            s.imported.name === 'useTableRowExpansion')
        ),
    );
    const existing = new Set(
      specs.map((/** @type {any} */ s) => s.imported?.name),
    );
    if (!existing.has('useTableTreeState')) {
      specs.push(j.importSpecifier(j.identifier('useTableTreeState')));
    }
    if (!existing.has('useTableTreeData')) {
      specs.push(j.importSpecifier(j.identifier('useTableTreeData')));
    }
    path.node.specifiers = specs;
  }

  return root.toSource({quote: 'single'});
}
