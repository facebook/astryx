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

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Drag-to-resize hook for layout regions; single/multi-region w/ snap points, collapsible panels, localStorage persistence + cascade resize ordering.',
  usage: {
    bestPractices: [
      { guidance: true, description: 'Use w/ XDSLayout or XDSAppShell sidebar for resizable nav panels.' },
      { guidance: true, description: 'Set autoSaveId to persist user-chosen sizes across reloads.' },
      { guidance: false, description: 'Set minSizePx too small — content becomes unreadable; prefer collapsible for panels that can hide entirely.' },
    ],
  },
  paramDescriptions: {
    defaultSize: 'Initial size in px or percentage string (e.g. "20%").',
    minSizePx: 'Min size in px.',
    maxSizePx: 'Max size in px.',
    collapsible: 'Dragging below collapsed threshold collapses region to zero.',
    snaps: 'Px values to snap to during drag.',
    autoSaveId: 'localStorage key for size persistence across sessions.',
  },
  returnDescriptions: {
    size: 'Current size in px.',
    isCollapsed: 'Region currently collapsed.',
    collapse: 'Programmatically collapse region.',
    expand: 'Expand from collapsed state.',
    resize: 'Resize to specific px value.',
    props: 'Spread on resizable component or pass to XDSResizeHandle.',
  },
};
