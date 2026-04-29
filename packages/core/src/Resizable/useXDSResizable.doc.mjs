/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useXDSResizable',
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
