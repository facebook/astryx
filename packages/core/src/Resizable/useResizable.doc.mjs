// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  name: 'useResizable',
  displayName: 'useResizable',
  group: 'Resizable',
  keywords: [
    'resize',
    'resizable',
    'drag',
    'split',
    'panel',
    'sidebar',
    'divider',
    'splitter',
  ],
  params: [
    {
      name: 'defaultSize',
      type: 'number | string',
      description:
        'Initial size. Runtime accepts a non-negative pixel number, exact "Npx", exact "N%" from 0% to 100%, or the same recursive CSS min()/max() grammar as the bounds. For example, defaultSize: "max(40%, 333px)" chooses 40% of the initial basis with a 333px floor, resolves ONCE into pixels against containerRef or the viewport, and does not follow later basis changes. The public type remains the released number | string for compatibility; runtime validation is authoritative, and unsupported strings keep the 250px fallback plus a development warning.',
      default: '250',
    },
    {
      name: 'minSize',
      type: 'ResizableConstraintValue',
      description:
        'Minimum size: a non-negative pixel number, exact "Npx", exact "N%" from 0% to 100%, or a recursive CSS min()/max() expression nested up to eight levels. Percentage leaves re-resolve when their basis changes and clamp the current pixel size. Other CSS functions, arithmetic, variables, and units are invalid.',
      default: '50',
    },
    {
      name: 'maxSize',
      type: 'ResizableConstraintValue',
      description:
        'Maximum size: a non-negative pixel number, exact "Npx", exact "N%" from 0% to 100%, or a recursive CSS min()/max() expression nested up to eight levels. Percentage leaves re-resolve when their basis changes and clamp the current pixel size. Other CSS functions, arithmetic, variables, and units are invalid.',
      default: 'Infinity',
    },
    {
      name: 'containerRef',
      type: 'RefObject<HTMLElement | null>',
      description:
        'The element a percentage is a share of. Caller-owned: the hook never infers one. Omitted, percentages use the viewport, which is the released behaviour. The ref may point at a different element over time — the basis follows it. Until that element is actually laid out (not yet mounted, display:none, detached) percentages use a temporary 1200px basis rather than its zero measurement, and nothing is persisted from it.',
    },
    {
      name: 'direction',
      type: "'horizontal' | 'vertical'",
      description:
        "Which axis this region resizes along. Selects the container's inline or block content-box size as the percentage basis, and must match the direction given to ResizeHandle.",
      default: "'horizontal'",
    },
    {
      name: 'minSizePx',
      type: 'number',
      description:
        'Deprecated. Use minSize, which also accepts percentage and CSS min()/max() constraints. Supplying both is a type error; if untyped code supplies both, minSize wins.',
    },
    {
      name: 'maxSizePx',
      type: 'number',
      description:
        'Deprecated. Use maxSize, which also accepts percentage and CSS min()/max() constraints. Explicit Infinity remains valid.',
    },
    {
      name: 'collapsible',
      type: 'boolean',
      description:
        'Whether dragging below the collapsed threshold collapses the region to zero.',
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
      description:
        'Key for localStorage persistence of size and collapse state across sessions.',
    },
    {
      name: 'defaultIsCollapsed',
      type: 'boolean',
      description:
        'Initial collapse state (uncontrolled). A persisted entry wins over it.',
      default: 'false',
    },
    {
      name: 'isCollapsed',
      type: 'boolean',
      description:
        'Controlled collapse state. collapse(), expand() and a drag past the threshold then report through onCollapseChange instead of changing state internally.',
    },
    {
      name: 'onCollapseChange',
      type: '(isCollapsed: boolean) => void',
      description:
        'Called once per collapse state change, via drag or programmatically.',
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
      description:
        'Props to spread on the resizable component or pass to ResizeHandle.',
    },
  ],
  usage: {
    description:
      'Hook for adding drag-to-resize behavior to layout regions. Supports single-region and multi-region configurations with snap points, collapsible panels, localStorage persistence, and cascade resize ordering.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use with Layout or AppShell sidebar for resizable navigation panels.',
      },
      {
        guidance: true,
        description:
          "Use defaultSize: 'max(40%, 333px)' to choose an initial pixel size from the first measurable basis. It does not rescale when the basis later changes.",
      },
      {
        guidance: true,
        description:
          "Use minSize: 'max(40%, 333px)' for a persistent fluid floor, or maxSize: 'min(400px, 10%)' for a persistent fluid ceiling. Percentage leaves in bounds re-resolve when their basis changes.",
      },
      {
        guidance: true,
        description:
          'Set autoSaveId to persist user-chosen sizes across page reloads.',
      },
      {
        guidance: false,
        description:
          'Configure a minimum that can resolve above its maximum. If they conflict, the maximum wins deterministically.',
      },
      {
        guidance: false,
        description:
          'Set minSize too small; content becomes unreadable. Prefer collapsible for panels that can hide entirely.',
      },
    ],
  },
  relatedComponents: ['Resizable', 'AppShell', 'Layout', 'SideNav'],
  relatedHooks: ['useCollapsible'],
  importPath: '@astryxdesign/core/Resizable',
  category: 'layout',
};

/** @type {import('@astryxdesign/cli/authoring').HookTranslationDoc} */
export const docsDense = {
  description:
    'Adds drag-to-resize behavior to layout regions. Supports single-/multi-region configs w/ snap points, collapsible panels, localStorage persistence, cascade resize ordering.',
  paramDescriptions: {
    defaultSize:
      'initial px number, "Npx", "N%", or nested CSS min()/max(); resolves once.',
    minSize:
      'min constraint: px number, "Npx", "N%", or nested CSS min()/max().',
    maxSize:
      'max constraint: px number, "Npx", "N%", or nested CSS min()/max().',
    containerRef: 'the element a percentage is a share of.',
    direction: 'which axis to resize along.',
    collapsible:
      'whether dragging below collapsed threshold collapses region to zero.',
    snaps: 'px values to snap to during drag.',
    autoSaveId:
      'key for localStorage persistence of size + collapse state across sessions.',
    defaultIsCollapsed:
      'initial collapse state (uncontrolled); persisted entry wins.',
    isCollapsed:
      'controlled collapse state; collapse()/expand()/drag report instead of mutating.',
    onCollapseChange: 'called once per collapse state change.',
  },
  returnDescriptions: {
    size: 'current size in px.',
    isCollapsed: 'whether region currently collapsed.',
    collapse: 'programmatically collapse region.',
    expand: 'expand from collapsed state.',
    resize: 'resize to specific px value.',
    props: 'props to spread on resizable component / pass to ResizeHandle.',
  },
  usage: {
    description:
      'Adds drag-to-resize behavior to layout regions. Supports single-/multi-region configs w/ snap points, collapsible panels, localStorage persistence, cascade resize ordering.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use w/ Layout / AppShell sidebar for resizable navigation panels.',
      },
      {
        guidance: true,
        description:
          "Use defaultSize: 'max(40%, 333px)' for a one-time initial choice; use minSize with the same expression for a persistent floor.",
      },
      {
        guidance: true,
        description:
          "Use minSize: 'max(40%, 333px)' for a fluid floor, or maxSize: 'min(400px, 10%)' for a fluid ceiling.",
      },
      {
        guidance: true,
        description:
          'Set autoSaveId to persist user-chosen sizes across page reloads.',
      },
      {
        guidance: false,
        description:
          'Configure min > max. Maximum wins deterministically when resolved bounds conflict.',
      },
      {
        guidance: false,
        description:
          'Set minSize too small; content becomes unreadable. Prefer collapsible for panels that can hide entirely.',
      },
    ],
  },
};
