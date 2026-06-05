// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useXDSHoverCard',
  displayName: 'useXDSHoverCard',
  group: 'HoverCard',
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

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Headless hook for hover-triggered floating cards; builds on useXDSLayer w/ hover/focus intent detection, delay + safe triangle hover zones. Use for rich previews on hover w/o building interaction logic.',
  usage: {
    bestPractices: [
      {guidance: true, description: 'Use for rich content previews (user profiles, link previews) benefiting from hover interaction.'},
      {guidance: true, description: 'Prefer XDSHoverCard for standard cases — use hook when you need full control over rendering.'},
      {guidance: false, description: 'Use for simple text hints — use XDSTooltip or useXDSTooltip instead.'},
    ],
  },
  propDescriptions: {
    content: 'Hover card content **(required)**; can be render function receiving layer props.',
    placement: 'Position relative to trigger.',
    alignment: 'Alignment along placement axis.',
    delayMs: 'Delay before showing hover card on hover.',
    onShow: 'Callback fired when hover card becomes visible.',
    onHide: 'Callback fired when hover card is hidden.',
  },
  returnDescriptions: {
    triggerProps: 'Props to spread on trigger element (ref, event handlers).',
    layerNode: 'Hover card layer to render (include in JSX output).',
  },
};
