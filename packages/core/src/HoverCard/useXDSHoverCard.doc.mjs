// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useXDSHoverCard',
  displayName: 'useXDSHoverCard',
  group: 'HoverCard',
  keywords: ['hovercard', 'hover', 'preview', 'card', 'tooltip', 'popup', 'floating', 'anchor'],
  params: [
    {name: 'placement', type: "'above' | 'below' | 'start' | 'end'", description: 'Position relative to the trigger.', default: "'above'"},
    {name: 'alignment', type: "'start' | 'center' | 'end'", description: 'Alignment along the placement axis.', default: "'center'"},
    {name: 'delay', type: 'number', description: 'Delay before showing the hover card on hover, in milliseconds.', default: '300'},
    {name: 'hideDelay', type: 'number', description: 'Delay before hiding after mouse or focus leaves, in milliseconds.', default: '200'},
    {name: 'focusTrigger', type: "'auto' | 'always' | 'never'", description: 'When focus should open the hover card. auto only attaches focus listeners to naturally focusable elements.', default: "'auto'"},
    {name: 'isEnabled', type: 'boolean', description: 'Whether hover and focus triggers are enabled.', default: 'true'},
    {name: 'isOpen', type: 'boolean', description: 'Controlled open state. true force-shows, false force-hides, undefined lets hover/focus manage visibility.'},
    {name: 'isDefaultOpen', type: 'boolean', description: 'Whether the hover card should be shown on mount.', default: 'false'},
    {name: 'onShow', type: '() => void', description: 'Callback fired when the hover card becomes visible.'},
    {name: 'onHide', type: '() => void', description: 'Callback fired when the hover card is hidden.'},
  ],
  returns: [
    {name: 'ref', type: 'RefCallback<HTMLElement>', description: 'Combined ref that sets both position and interaction on the same trigger element.'},
    {name: 'positionRef', type: 'RefCallback<HTMLElement>', description: 'Ref for the positioning anchor element. Use when position and interaction live on different elements.'},
    {name: 'interactionRef', type: 'RefCallback<HTMLElement>', description: 'Ref for the hover/focus interaction element. Use with positionRef for split trigger patterns.'},
    {name: 'anchorId', type: 'string', description: 'CSS anchor name for advanced positioning cases.'},
    {name: 'describedBy', type: 'string', description: 'ID to compose into aria-describedby on the trigger.'},
    {name: 'renderHoverCard', type: '(children: ReactNode, props?: ContextRenderProps) => ReactNode', description: 'Render function for the anchor-positioned hover card content.'},
    {name: 'show', type: '() => void', description: 'Imperatively show the hover card immediately.'},
    {name: 'hide', type: '() => void', description: 'Imperatively hide the hover card immediately.'},
  ],
  usage: {
    description: 'Headless hook for hover-triggered floating cards. Builds on useXDSLayer with hover/focus intent detection, configurable delays, safe hover behavior, and accessible aria-describedby linking. Use for rich previews on hover when you need full control over the trigger or rendered content.',
    bestPractices: [
      {guidance: true, description: 'Use for rich content previews such as user profiles, entity summaries, and link previews.'},
      {guidance: true, description: 'Prefer the XDSHoverCard component for standard trigger-content pairs; use the hook for custom trigger patterns.'},
      {guidance: false, description: 'Use for simple text hints: use XDSTooltip or useXDSTooltip instead.'},
    ],
  },
  relatedComponents: ['HoverCard', 'Tooltip', 'Popover'],
  relatedHooks: ['useXDSLayer', 'useXDSTooltip', 'useXDSPopover'],
  importPath: '@xds/core/HoverCard',
  category: 'interaction',
};

/** @type {import('../docs-types').HookTranslationDoc} */
export const docsDense = {
  description: 'Headless hover-triggered floating cards. Builds on useXDSLayer w/ hover/focus intent, delays, safe hover behavior, aria-describedby. Use for rich previews when trigger/content rendering needs full control.',
  paramDescriptions: {
    placement: 'position relative to trigger.',
    alignment: 'alignment along placement axis.',
    delay: 'show delay in ms.',
    hideDelay: 'hide delay after mouse/focus leave in ms.',
    focusTrigger: 'when focus opens hover card; auto = naturally focusable elements only.',
    isEnabled: 'whether hover/focus triggers are enabled.',
    isOpen: 'controlled open state: true force-show, false force-hide, undefined unmanaged.',
    isDefaultOpen: 'show on mount.',
    onShow: 'fires when hover card becomes visible.',
    onHide: 'fires when hover card hides.',
  },
  returnDescriptions: {
    ref: 'combined position + interaction ref.',
    positionRef: 'position anchor ref.',
    interactionRef: 'hover/focus interaction ref.',
    anchorId: 'CSS anchor name.',
    describedBy: 'ID for aria-describedby.',
    renderHoverCard: 'renders anchor-positioned hover card content.',
    show: 'show immediately.',
    hide: 'hide immediately.',
  },
  usage: {
    description: 'Headless hover-triggered floating cards. Builds on useXDSLayer w/ hover/focus intent, delays, safe hover behavior, aria-describedby. Use for rich previews when trigger/content rendering needs full control.',
    bestPractices: [
      {guidance: true, description: 'Use for rich previews: profiles, entity summaries, link previews.'},
      {guidance: true, description: 'Prefer XDSHoverCard for standard trigger-content pairs; use hook for custom trigger patterns.'},
      {guidance: false, description: 'Use for simple text hints: use XDSTooltip / useXDSTooltip instead.'},
    ],
  },
};
