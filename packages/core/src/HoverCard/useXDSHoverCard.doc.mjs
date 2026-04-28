/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useXDSHoverCard',
  keywords: ['hovercard', 'hover', 'preview', 'card', 'tooltip', 'popup', 'floating', 'anchor'],
  params: [
    {
      name: 'content',
      type: 'ReactNode | ((props: ContextRenderProps) => ReactNode)',
      description: 'Content to display in the hover card. Can be a render function receiving layer props.',
      required: true,
    },
    {
      name: 'placement',
      type: 'LayerPlacement',
      description: 'Position relative to the trigger.',
      default: "'below'",
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
      description: 'Delay before showing the hover card on hover.',
      default: '300',
    },
    {
      name: 'onShow',
      type: '() => void',
      description: 'Callback fired when the hover card becomes visible.',
    },
    {
      name: 'onHide',
      type: '() => void',
      description: 'Callback fired when the hover card is hidden.',
    },
  ],
  returns: [
    {
      name: 'triggerProps',
      type: 'object',
      description: 'Props to spread on the trigger element (ref, event handlers).',
    },
    {
      name: 'layerNode',
      type: 'ReactNode',
      description: 'The hover card layer to render (include in JSX output).',
    },
  ],
  usage: {
    description: 'Headless hook for hover-triggered floating cards. Builds on useXDSLayer with hover/focus intent detection, delay, and safe triangle hover zones. Use for rich previews on hover without building the interaction logic.',
    bestPractices: [
      {guidance: true, description: 'Use for rich content previews (user profiles, link previews) that benefit from hover interaction.'},
      {guidance: true, description: 'Prefer the XDSHoverCard component for standard cases — use the hook when you need full control over rendering.'},
      {guidance: false, description: 'Use for simple text hints — use XDSTooltip or useXDSTooltip instead.'},
    ],
  },
  relatedComponents: ['HoverCard', 'Tooltip', 'Popover'],
  relatedHooks: ['useXDSLayer', 'useXDSTooltip', 'useXDSPopover'],
  importPath: '@xds/core/HoverCard',
  category: 'interaction',
};
