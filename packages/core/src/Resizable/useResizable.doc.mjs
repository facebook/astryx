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
        'Initial size: a number of pixels, an exact "Npx" string, or an exact "N%" string from 0% to 100%. A percentage resolves ONCE into pixels — against the container when containerRef is supplied, against the viewport otherwise — and does not track its basis afterwards.',
      default: '250',
    },
    {
      name: 'minSize',
      type: 'ResizableSize',
      description:
        'Minimum size. A number of pixels, an exact "Npx", an exact "N%" from 0% to 100%, or min()/max() over those — for example "max(40%, 333px)", a floor that is 40% of the container but never below 333px. Terms are compared as resolved pixels, so which one wins changes with the container: above a 832.5px container 40% wins, below it the 333px floor does. Anything basis-dependent re-resolves when the container resizes and clamps the current pixel size.',
      default: '50',
    },
    {
      name: 'maxSize',
      type: 'ResizableSize',
      description:
        'Maximum size, in the same vocabulary as minSize — for example "min(400px, 10%)", a cap of 400px until 10% of the container is tighter. Re-resolves when its basis changes and clamps the current pixel size.',
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
        'Deprecated. Use minSize, which also accepts a percentage. Supplying both is a type error; if untyped code supplies both, minSize wins.',
    },
    {
      name: 'maxSizePx',
      type: 'number',
      description:
        'Deprecated. Use maxSize, which also accepts a percentage. Explicit Infinity remains valid.',
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
          'Set autoSaveId to persist user-chosen sizes across page reloads.',
      },
      {
        guidance: true,
        description:
          'Give a bound that must stay usable on small containers a pixel floor with min()/max(): minSize: "max(40%, 333px)" with containerRef stays proportional while there is room and stops at 333px once there is not. The inverse caps growth: maxSize: "min(400px, 10%)".',
      },
      {
        guidance: false,
        description:
          'Write a percentage ceiling in CSS (max-width) instead of maxSize. CSS clamps what is painted but not the hook state, so the handle announces a width the panel does not have.',
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
    defaultSize: 'initial size: px number, "Npx", or "N%" of the basis.',
    minSize: 'min size: px number, "Npx", or "N%" of the basis.',
    maxSize: 'max size: px number, "Npx", or "N%" of the basis.',
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
          'Set autoSaveId to persist user-chosen sizes across page reloads.',
      },
      {
        guidance: false,
        description:
          'Set minSize too small; content becomes unreadable. Prefer collapsible for panels that can hide entirely.',
      },
    ],
  },
};
