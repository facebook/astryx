// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useXDSResizable',
  displayName: 'useXDSResizable',
  group: 'Resizable',
  keywords: ['resize', 'resizable', 'drag', 'split', 'panel', 'sidebar', 'divider', 'splitter'],
  params: [
    {
      name: 'defaultSize',
      type: "number | string",
      description: 'Initial size in pixels or percentage string (e.g. "20%").',
    },
    {
      name: 'minSizePx',
      type: 'number',
      description: 'Minimum size in pixels.',
      default: '50',
    },
    {
      name: 'maxSizePx',
      type: 'number',
      description: 'Maximum size in pixels.',
      default: 'Infinity',
    },
    {
      name: 'collapsible',
      type: 'boolean',
      description: 'Whether dragging below the collapsed threshold collapses the region to zero.',
      default: 'false',
    },
    {
      name: 'snaps',
      type: 'number[]',
      description: 'Pixel values to snap to during drag.',
    },
    {
      name: 'autoSaveId',
      type: 'string',
      description: 'Key for localStorage persistence of size across sessions.',
    },
  ],
  returns: [
    {
      name: 'size',
      type: 'number',
      description: 'Current size in pixels.',
    },
    {
      name: 'isCollapsed',
      type: 'boolean',
      description: 'Whether the region is currently collapsed.',
    },
    {
      name: 'collapse',
      type: '() => void',
      description: 'Programmatically collapse the region.',
    },
    {
      name: 'expand',
      type: '() => void',
      description: 'Expand from collapsed state.',
    },
    {
      name: 'resize',
      type: '(size: number) => void',
      description: 'Resize to a specific pixel value.',
    },
    {
      name: 'props',
      type: 'ResizableProps',
      description: 'Props to spread on the resizable component or pass to XDSResizeHandle.',
    },
  ],
  usage: {
    description: 'Hook for adding drag-to-resize behavior to layout regions. Supports single-region and multi-region configurations with snap points, collapsible panels, localStorage persistence, and cascade resize ordering.',
    bestPractices: [
      {guidance: true, description: 'Use with XDSLayout or XDSAppShell sidebar for resizable navigation panels.'},
      {guidance: true, description: 'Set autoSaveId to persist user-chosen sizes across page reloads.'},
      {guidance: false, description: 'Set minSizePx too small — content becomes unreadable. Prefer collapsible for panels that can hide entirely.'},
    ],
  },
  relatedComponents: ['Resizable', 'AppShell', 'Layout', 'SideNav'],
  relatedHooks: ['useXDSCollapsible'],
  importPath: '@xds/core/Resizable',
  category: 'layout',
};

/** @type {import('../docs-types').HookTranslationDoc} */
export const docsDense = {
  description: 'Adds drag-to-resize behavior to layout regions. Supports single-/multi-region configs w/ snap points, collapsible panels, localStorage persistence, cascade resize ordering.',
  paramDescriptions: {
    defaultSize: 'initial size in px / percentage string (e.g. "20%").',
    minSizePx: 'min size in px.',
    maxSizePx: 'max size in px.',
    collapsible: 'whether dragging below collapsed threshold collapses region to zero.',
    snaps: 'px values to snap to during drag.',
    autoSaveId: 'key for localStorage persistence of size across sessions.',
  },
  returnDescriptions: {
    size: 'current size in px.',
    isCollapsed: 'whether region currently collapsed.',
    collapse: 'programmatically collapse region.',
    expand: 'expand from collapsed state.',
    resize: 'resize to specific px value.',
    props: 'props to spread on resizable component / pass to XDSResizeHandle.',
  },
  usage: {
    description: 'Adds drag-to-resize behavior to layout regions. Supports single-/multi-region configs w/ snap points, collapsible panels, localStorage persistence, cascade resize ordering.',
    bestPractices: [
      {guidance: true, description: 'Use w/ XDSLayout / XDSAppShell sidebar for resizable navigation panels.'},
      {guidance: true, description: 'Set autoSaveId to persist user-chosen sizes across page reloads.'},
      {guidance: false, description: 'Set minSizePx too small — content becomes unreadable. Prefer collapsible for panels that can hide entirely.'},
    ],
  },
};
