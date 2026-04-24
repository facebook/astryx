/** @type {import('../docs-types').ComponentDoc} */
export const docs = {
  name: 'Resizable',
  description:
    'Hook-based resizable panel system. useResizable() manages size state; ' +
    'XDSResizeHandle provides the interactive separator. Pass resize props ' +
    'to existing layout components via their `resizable` prop.',

  features: [
    'Hook-first architecture — no wrapper components, works with existing XDS layout',
    'Pill-grip handle: invisible at rest, 0.6 on hover, 1.0 during drag',
    'Full keyboard support: Arrow keys, Shift+Arrow, Home/End, Enter to collapse',
    'WAI-ARIA Window Splitter pattern (role=separator)',
    'Collapsible panels with snap points',
    'localStorage persistence via autoSaveId',
    'RTL-aware drag direction',
    'Single-region and multi-region (coordinated) modes',
    'shrinkOrder for cascading resize priority',
  ],

  components: [
    {
      name: 'useResizable',
      description:
        'Hook that manages resize state for one or more panel regions. Returns size, ' +
        'isCollapsed, collapse/expand/resize methods, and props to pass to handles.',
      props: [
        {
          name: 'defaultSize',
          type: "number | string",
          description: 'Initial size in pixels or percentage string.',
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
          description: 'Pixel threshold that triggers collapse during drag.',
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
          description: 'Cascade priority — lower number shrinks first.',
        },
        {
          name: 'autoSaveId',
          type: 'string',
          description: 'Key for persisting sizes to localStorage.',
        },
      ],
      examples: [
        {
          label: 'Single region',
          code: `const sidebar = useResizable({ defaultSize: 250, minSizePx: 200 });`,
        },
        {
          label: 'Multi-region',
          code: `const { sidebar, content } = useResizable({
  direction: 'horizontal',
  regions: {
    sidebar: { defaultSize: '20%', minSizePx: 200 },
    content: { minSizePx: 400 },
  },
});`,
        },
      ],
    },
    {
      name: 'XDSResizeHandle',
      description:
        'Draggable separator between panels. Pill-grip design: invisible at rest, ' +
        'visible on hover, fully opaque during drag. Keyboard-accessible.',
      props: [
        {
          name: 'direction',
          type: "'horizontal' | 'vertical'",
          description: 'Layout direction — determines cursor and pill orientation.',
          default: "'horizontal'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether the handle is interactive.',
          default: 'false',
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
          description: 'Resize props from useResizable — connects handle to panel.',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Custom handle content. Default renders pill indicator.',
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: '<XDSResizeHandle direction="horizontal" resizable={sidebar.props} />',
        },
        {
          label: 'Vertical',
          code: '<XDSResizeHandle direction="vertical" resizable={bottom.props} />',
        },
      ],
    },
  ],

  theming: {
    targets: [{className: 'xds-resize-handle', visualProps: ['direction']}],
    vars: [
      {name: '--resize-handle-width', description: 'Visual width of pill', default: '3px'},
      {name: '--resize-handle-height', description: 'Height of pill', default: '32px'},
      {name: '--resize-handle-hit-area', description: 'Clickable area width', default: '16px'},
    ],
  },

  accessibility: [
    'Handle uses role="separator" per WAI-ARIA Window Splitter pattern.',
    'Arrow keys resize in 10px steps; Shift+Arrow for 50px steps.',
    'Home/End jump to min/max size.',
    'Enter toggles collapse on collapsible panels.',
    'Double-click toggles collapse.',
    'aria-valuenow/min/max reflect panel size.',
    'RTL-aware: drag direction inverts in RTL layouts.',
  ],

  keyboard:
    'ArrowLeft/Right: resize horizontal; ArrowUp/Down: resize vertical; ' +
    'Shift+Arrow: large step; Home: min; End: max; Enter: toggle collapse',

  notes: [
    'Uses hook-first architecture — no wrapper DOM. Pass resizable.props to existing components.',
    'Pill indicator uses opacity transitions: 0 (idle) → 0.6 (hover) → 1.0 (active).',
    'Handle hit area (16px) is larger than visual pill (3px) for accessibility.',
  ],
};
