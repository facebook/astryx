/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useXDSTooltip',
  keywords: ['tooltip', 'hint', 'label', 'hover', 'info', 'title', 'floating'],
  params: [
    {
      name: 'content',
      type: 'ReactNode',
      description: 'Text or content to display in the tooltip.',
      required: true,
    },
    {
      name: 'placement',
      type: 'LayerPlacement',
      description: 'Position relative to the trigger.',
      default: "'above'",
    },
    {
      name: 'alignment',
      type: 'LayerAlignment',
      description: 'Alignment along the placement axis.',
      default: "'center'",
    },
    {
      name: 'delayMs',
      type: 'number',
      description: 'Delay before showing the tooltip on hover.',
      default: '300',
    },
  ],
  returns: [
    {
      name: 'triggerProps',
      type: 'object',
      description: 'Props to spread on the trigger element (ref, aria-describedby, event handlers).',
    },
    {
      name: 'layerNode',
      type: 'ReactNode',
      description: 'The tooltip layer to render (include in JSX output).',
    },
  ],
  usage: {
    description: 'Headless hook for hover/focus-triggered tooltips. Builds on useXDSLayer with hover intent, delay, and accessible aria-describedby linking. Use for custom trigger elements that need tooltip behavior.',
    bestPractices: [
      {guidance: true, description: 'Use for brief text labels that describe a UI element — icon buttons, truncated text, abbreviations.'},
      {guidance: true, description: 'Prefer the XDSTooltip component for standard wrapping — use the hook when the trigger is not a simple child.'},
      {guidance: false, description: 'Put interactive content (links, buttons) inside tooltips — use Popover or HoverCard instead.'},
    ],
  },
  relatedComponents: ['Tooltip', 'HoverCard', 'Popover'],
  relatedHooks: ['useXDSLayer', 'useXDSHoverCard', 'useXDSPopover'],
  importPath: '@xds/core/Tooltip',
  category: 'interaction',
};
