// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useXDSPopover',
  displayName: 'useXDSPopover',
  group: 'Popover',
  keywords: ['popover', 'popup', 'dropdown', 'floating', 'anchor', 'dialog', 'overlay', 'flyout'],
  params: [
    {
      name: 'content',
      type: 'ReactNode | ((props: ContextRenderProps) => ReactNode)',
      description: 'Content to display in the popover. Can be a render function receiving layer props.',
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
      default: "'start'",
    },
    {
      name: 'hasLightDismiss',
      type: 'boolean',
      description: 'Whether clicking outside dismisses the popover.',
      default: 'true',
    },
    {
      name: 'hasSurface',
      type: 'boolean',
      description: 'Whether to apply the default popover surface styles (background, shadow, radius).',
      default: 'true',
    },
    {
      name: 'onShow',
      type: '() => void',
      description: 'Callback fired when the popover becomes visible.',
    },
    {
      name: 'onHide',
      type: '() => void',
      description: 'Callback fired when the popover is hidden.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for the popover surface (margins, sizing). Must be a stylex.create() value — not an inline style object. Note: for styles that interact with :popover-open, pass xstyle via the render() call props instead.',
    },
  ],
  returns: [
    {
      name: 'triggerProps',
      type: 'object',
      description: 'Props to spread on the trigger element (ref, aria-expanded, event handlers).',
    },
    {
      name: 'layerNode',
      type: 'ReactNode',
      description: 'The popover layer to render (include in JSX output).',
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description: 'Whether the popover is currently visible.',
    },
    {
      name: 'show',
      type: '() => void',
      description: 'Imperatively show the popover.',
    },
    {
      name: 'hide',
      type: '() => void',
      description: 'Imperatively hide the popover.',
    },
  ],
  usage: {
    description: 'Headless hook for click-triggered popovers with focus trapping. Combines useXDSLayer with useFocusTrap for dialog-like popover behavior. Use for interactive floating content that needs keyboard navigation.',
    bestPractices: [
      {guidance: true, description: 'Use for interactive content (forms, menus, pickers) that needs focus trapping and light dismiss.'},
      {guidance: true, description: 'Prefer the XDSPopover component for standard trigger-content pairs — use the hook for custom trigger patterns.'},
      {guidance: false, description: 'Use for non-interactive hover previews — use useXDSHoverCard or useXDSTooltip instead.'},
    ],
  },
  relatedComponents: ['Popover', 'DropdownMenu', 'HoverCard'],
  relatedHooks: ['useXDSLayer', 'useFocusTrap', 'useXDSHoverCard', 'useXDSTooltip'],
  importPath: '@xds/core/Popover',
  category: 'interaction',
};

/** @type {import('../docs-types').HookTranslationDoc} */
export const docsDense = {
  description: 'Headless hook for click-triggered popovers w/ focus trapping. Combines useXDSLayer w/ useFocusTrap for dialog-like popover behavior. Use for interactive floating content needing keyboard navigation.',
  paramDescriptions: {
    content: 'content for popover. Can be render function receiving layer props.',
    placement: 'position relative to trigger.',
    alignment: 'alignment along placement axis.',
    hasLightDismiss: 'whether clicking outside dismisses popover.',
    hasSurface: 'whether to apply default popover surface styles (background, shadow, radius).',
    onShow: 'callback fired when popover becomes visible.',
    onHide: 'callback fired when popover hidden.',
    xstyle: 'StyleX styles for popover surface (margins, sizing). Must be stylex.create() value — not inline style object. Note: for styles interacting w/ :popover-open, pass xstyle via render() call props instead.',
  },
  returnDescriptions: {
    triggerProps: 'props to spread on trigger element (ref, aria-expanded, event handlers).',
    layerNode: 'popover layer to render (include in JSX output).',
    isOpen: 'whether popover currently visible.',
    show: 'imperatively show popover.',
    hide: 'imperatively hide popover.',
  },
  usage: {
    description: 'Headless hook for click-triggered popovers w/ focus trapping. Combines useXDSLayer w/ useFocusTrap for dialog-like popover behavior. Use for interactive floating content needing keyboard navigation.',
    bestPractices: [
      {guidance: true, description: 'Use for interactive content (forms, menus, pickers) needing focus trapping + light dismiss.'},
      {guidance: true, description: 'Prefer XDSPopover component for standard trigger-content pairs — use hook for custom trigger patterns.'},
      {guidance: false, description: 'Use for non-interactive hover previews — use useXDSHoverCard / useXDSTooltip instead.'},
    ],
  },
};
