// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */
export const docs = {
  name: 'Resizable',
  displayName: 'Resizable',
  group: 'Resizable',
  category: 'Layout',
  keywords: [
    'resize',
    'resizable',
    'split',
    'splitter',
    'panel',
    'drag',
    'separator',
    'divider',
    'handle',
    'grip',
  ],
  usage: {
    description:
      'Hook-based resizable panel system. useXDSResizable() manages size state ' +
      'and XDSResizeHandle provides the interactive pill-grip separator. ' +
      'Pass resize props to existing layout components via their resizable prop.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use useXDSResizable() with existing XDS layout components. ' +
          'Pass the returned props to the resizable prop on XDSLayoutPanel or XDSSideNav.',
      },
      {
        guidance: true,
        description:
          'Provide an accessible label on each XDSResizeHandle when multiple ' +
          'handles exist (e.g. "Resize sidebar", "Resize terminal").',
      },
      {
        guidance: false,
        description:
          'Wrap panels in extra container components for resize. The hook-first ' +
          'architecture avoids extra DOM — use it directly on existing components.',
      },
    ],
  },
  theming: {
    targets: [
      {className: 'xds-resize-handle', visualProps: ['direction']},
      {className: 'xds-resize-handle-pill'},
    ],
  },
  components: [
    {
      name: 'useXDSResizable',
      displayName: 'useXDSResizable',
      description:
        'Hook that manages resize state for one or more panel regions. ' +
        'Returns size, isCollapsed, collapse/expand/resize methods, and props to pass to handles.',
      props: [
        {
          name: 'defaultSize',
          type: 'number | string',
          description:
            'Initial size in pixels or percentage string (e.g. "20%").',
          default: '250',
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
          description: 'Whether the region can collapse to size 0.',
          default: 'false',
        },
        {
          name: 'collapsedSize',
          type: 'number',
          description:
            'Pixel threshold that triggers collapse during drag.',
          default: '40',
        },
        {
          name: 'snaps',
          type: 'number[]',
          description: 'Pixel values to snap to during resize.',
        },
        {
          name: 'shrinkOrder',
          type: 'number',
          description:
            'Cascade priority — lower number shrinks first.',
        },
        {
          name: 'autoSaveId',
          type: 'string',
          description: 'Key for persisting sizes to localStorage.',
        },
      ],
    },
    {
      name: 'XDSResizeHandle',
      displayName: 'Resize Handle',
      description:
        'Draggable separator between panels. Pill-grip design: invisible at rest, ' +
        'visible on hover (0.6 opacity), fully opaque during drag (1.0). Keyboard-accessible.',
      props: [
        {
          name: 'direction',
          type: "'horizontal' | 'vertical'",
          description:
            'Layout direction — determines cursor and indicator orientation.',
          default: "'horizontal'",
        },
        {
          name: 'isReversed',
          type: 'boolean',
          description:
            'Reverse drag direction. Use when the handle controls a panel on the end/right/bottom side.',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether the handle is interactive.',
          default: 'false',
        },
        {
          name: 'hasDivider',
          type: 'boolean',
          description:
            'Show a full-length 1px divider line through the handle. Use when adjacent panels share the same background.',
          default: 'false',
        },
        {
          name: 'isAlwaysVisible',
          type: 'boolean',
          description:
            'Show the pill grip at rest instead of only on hover. Use when discoverability is important.',
          default: 'false',
        },
        {
          name: 'pillPlacement',
          type: "'start' | 'end' | 'center' | 'auto'",
          description:
            'Which side of the divider the pill sits on. ' +
            'auto = content side (derived from isReversed), flips when collapsed. ' +
            'start = left/top, end = right/bottom, center = centered on divider.',
          default: "'auto'",
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the separator.',
          default: "'Resize handle'",
        },
        {
          name: 'resizable',
          type: 'ResizableProps',
          description:
            'Resize props from useXDSResizable — connects handle to panel.',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Custom handle content. Overrides the default pill + divider.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Hook-based resizable panel system; useXDSResizable() manages size state + XDSResizeHandle provides pill-grip separator. Pass resize props to layout components via resizable prop.',
  usage: {
    bestPractices: [
      {
        guidance: true,
        description:
          'Use useXDSResizable() w/ existing XDS layout components; pass returned props to resizable prop on XDSLayoutPanel/XDSSideNav.',
      },
      {
        guidance: true,
        description:
          'Provide accessible label on each XDSResizeHandle when multiple handles exist (e.g. "Resize sidebar", "Resize terminal").',
      },
      {
        guidance: false,
        description:
          'Wrap panels in extra containers for resize; hook-first architecture avoids extra DOM — use directly on existing components.',
      },
    ],
  },
  components: [
    {
      name: 'useXDSResizable',
      description:
        'Manages resize state for panel regions; returns size, isCollapsed, collapse/expand/resize methods + props to pass to handles.',
      propDescriptions: {
        defaultSize: 'Initial size in px or percentage string (e.g. "20%")',
        minSizePx: 'Min size in px',
        maxSizePx: 'Max size in px',
        collapsible: 'Region can collapse to size 0',
        collapsedSize: 'Px threshold triggering collapse during drag',
        snaps: 'Px values to snap to during resize',
        shrinkOrder: 'Cascade priority; lower number shrinks first',
        autoSaveId: 'Key for persisting sizes to localStorage',
      },
    },
    {
      name: 'XDSResizeHandle',
      description:
        'Draggable separator between panels; pill-grip: invisible at rest, visible on hover (0.6 opacity), fully opaque during drag (1.0); keyboard-accessible.',
      propDescriptions: {
        direction: 'Layout direction; determines cursor + indicator orientation',
        isReversed:
          'Reverse drag direction; use when handle controls panel on end/right/bottom side',
        isDisabled: 'Disables handle interaction',
        hasDivider:
          'Show full-length 1px divider line; use when adjacent panels share same background',
        isAlwaysVisible:
          'Show pill grip at rest instead of only on hover; use when discoverability matters',
        pillPlacement:
          'Side of divider pill sits on; auto = content side (from isReversed), flips when collapsed; start = left/top, end = right/bottom, center = centered on divider',
        label: 'Accessible label for separator',
        resizable:
          'Resize props from useXDSResizable; connects handle to panel **(required)**',
      },
    },
  ],
};
