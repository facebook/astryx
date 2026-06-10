// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useXDSTooltip',
  displayName: 'useXDSTooltip',
  group: 'Tooltip',
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

/** @type {import('../docs-types').HookTranslationDoc} */
export const docsDense = {
  description: 'Headless hook for hover/focus-triggered tooltips. Builds on useXDSLayer w/ hover intent, delay, accessible aria-describedby linking. Use for custom trigger elements needing tooltip behavior.',
  paramDescriptions: {
    content: 'text / content for tooltip.',
    placement: 'position relative to trigger.',
    alignment: 'alignment along placement axis.',
    delayMs: 'delay before showing tooltip on hover.',
  },
  returnDescriptions: {
    triggerProps: 'props to spread on trigger element (ref, aria-describedby, event handlers).',
    layerNode: 'tooltip layer to render (include in JSX output).',
  },
  usage: {
    description: 'Headless hook for hover/focus-triggered tooltips. Builds on useXDSLayer w/ hover intent, delay, accessible aria-describedby linking. Use for custom trigger elements needing tooltip behavior.',
    bestPractices: [
      {guidance: true, description: 'Use for brief text labels describing a UI element — icon buttons, truncated text, abbreviations.'},
      {guidance: true, description: 'Prefer XDSTooltip component for standard wrapping — use hook when trigger is not a simple child.'},
      {guidance: false, description: 'Put interactive content (links, buttons) inside tooltips — use Popover / HoverCard instead.'},
    ],
  },
};
