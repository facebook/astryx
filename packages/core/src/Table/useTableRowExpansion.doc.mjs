// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'useTableRowExpansion',
  subComponentOf: 'Table',
  displayName: 'useTableRowExpansion',
  description:
    'Hook that returns a TablePlugin implementing expandable rows with inherited columns. Child rows use the same columns as their parents, indented by depth. Clicking the chevron (or right-click context menu) toggles expansion. Pair with useTableRowExpansionState, which flattens the tree and derives this config (expand/collapse handlers + expand-all state) from a single expandedKeys set.',
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
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Returns a TablePlugin for expandable rows w/ inherited columns. Child rows reuse parent columns, indented by depth. Chevron click (or right-click menu) toggles expansion. Pair w/ useTableRowExpansionState, which flattens the tree + derives this config from one expandedKeys set.',
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
