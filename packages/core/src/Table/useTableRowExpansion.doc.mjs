// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableRowExpansion',
  subComponentOf: 'Table',
  displayName: 'useTableRowExpansion',
  description:
    'Deprecated: use useTableTreeData + useTableTreeState instead. Hook that returns a TablePlugin implementing expandable rows with inherited columns. Child rows use the same columns as their parents, indented by depth. Clicking the chevron (or right-click context menu) toggles expansion. Pair with useTableRowExpansionState, which flattens the tree and derives this config (expand/collapse handlers + expand-all state) from a single expandedKeys set. Converging with useTableTreeData: new tree tables should prefer useTableTreeData + useTableTreeState, which cover the same affordances with a cycle guard and fine-grained re-render. See the migration example below.',
  props: [
    {
      name: 'expandedKeys',
      type: 'Set<string>',
      description: 'Set of currently-expanded row keys.',
      required: true,
    },
    {
      name: 'onToggle',
      type: '(key: string) => void',
      description: 'Called when a row expansion is toggled.',
      required: true,
    },
    {
      name: 'getRowKey',
      type: '(item: T) => string',
      description: 'Derive a stable unique key from a row item.',
      required: true,
    },
    {
      name: 'getChildren',
      type: '(item: T) => T[]',
      description: 'Return the children of a row (determines expandability).',
      required: true,
    },
    {
      name: 'getDepth',
      type: '(item: T) => number',
      description: 'Return the depth of a row in the hierarchy (0 = top-level). Used for indentation.',
    },
    {
      name: 'getIsItemExpandable',
      type: '(item: T) => boolean',
      description: 'Control which rows are expandable. Defaults to checking getChildren length.',
    },
    {
      name: 'hasRowClickExpansion',
      type: 'boolean',
      description: 'When true, clicking anywhere on the row toggles expansion.',
      default: 'false',
    },
    {
      name: 'isAllExpanded',
      type: "boolean | 'indeterminate'",
      description: 'State of the expand-all toggle in the header. Enables the header toggle button.',
    },
    {
      name: 'onToggleExpandAll',
      type: '(expand: boolean) => void',
      description: 'Callback when the expand-all header toggle is clicked.',
    },
  ],
  examples: [
    {
      label: 'Migrating to useTableTreeData + useTableTreeState',
      code: `// useTableRowExpansion and useTableTreeData are converging onto one tree
// plugin. useTableTreeData is the destination: it adds a cycle guard,
// per-row fine-grained re-render, and imperative row ARIA, and now covers
// the same affordances (expand-all header control, whole-row click).

// BEFORE: useTableRowExpansion + useTableRowExpansionState
const [expandedKeys, setExpandedKeys] = useState(new Set(['root']));
const {data, expansionConfig} = useTableRowExpansionState({
  baseData: tree,
  getChildren: item => item.children ?? [],
  getRowKey: item => item.id,
  expandedKeys,
  setExpandedKeys,
});
const expansion = useTableRowExpansion(expansionConfig);
<Table data={data} columns={columns} idKey="id" plugins={{expansion}} />;

// AFTER: useTableTreeState + useTableTreeData
const {visibleData, treeConfig} = useTableTreeState({
  data: tree,                   // nested data, not a flat array
  idKey: 'id',                  // or a function: idKey={item => item.id}
  childrenKey: 'children',      // replaces getChildren (default 'children')
  defaultExpandedIds: ['root'], // uncontrolled; or expandedIds + onExpandedIdsChange
});
const tree = useTableTreeData({
  ...treeConfig,
  hasExpandAllControl: true,    // was isAllExpanded + onToggleExpandAll
  hasRowClickExpansion: true,   // same prop name
});
<Table data={visibleData} columns={columns} idKey="id" plugins={{tree}} />;`,
    },
    {
      label: 'Config mapping',
      code: `// useTableRowExpansion(State)         ->  useTableTreeState / useTableTreeData

// baseData: T[] (nested)              ->  data: T[]                (useTableTreeState)
// getChildren: item => item.children  ->  childrenKey: 'children'  (property name)
// getRowKey: item => item.id          ->  idKey: 'id' | (item => item.id)
// getIsItemExpandable                 ->  isItemExpandable         (same shape)
// expandedKeys + setExpandedKeys      ->  defaultExpandedIds       (uncontrolled), or
//                                         expandedIds + onExpandedIdsChange (controlled)
// getDepth                            ->  removed; depth derives from nesting
// isAllExpanded + onToggleExpandAll   ->  hasExpandAllControl      (state is computed)
// hasRowClickExpansion                ->  hasRowClickExpansion     (unchanged)

// Rendering: useTableRowExpansion prepends a dedicated expander column;
// useTableTreeData decorates the tree column in place (configurable via
// treeColumnKey). Keyboard and AT users toggle via the chevron in both.`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'Deprecated: use useTableTreeData + useTableTreeState instead. Returns a TablePlugin for expandable rows w/ inherited columns. Child rows reuse parent columns, indented by depth. Chevron click (or right-click menu) toggles expansion. Pair w/ useTableRowExpansionState, which flattens the tree + derives this config from one expandedKeys set.',
  propDescriptions: {
    expandedKeys: 'Set of currently-expanded row keys.',
    onToggle: 'Called when a row expansion is toggled.',
    getRowKey: 'Derive a stable unique key from a row item.',
    getChildren: 'Return children of a row; determines expandability.',
    getDepth: 'Return depth of a row (0 = top-level). Used for indentation.',
    getIsItemExpandable: 'Control which rows are expandable. Defaults to checking getChildren length.',
    hasRowClickExpansion: 'If true, clicking anywhere on the row toggles expansion. Default false.',
    isAllExpanded: 'State of the expand-all header toggle. Enables the header toggle button.',
    onToggleExpandAll: 'Callback when the expand-all header toggle is clicked.',
  },
};
