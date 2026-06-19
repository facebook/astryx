// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useXDSTooltip',
  displayName: 'useXDSTooltip',
  group: 'Tooltip',
  keywords: ['tooltip', 'hint', 'label', 'hover', 'info', 'title', 'floating'],
  params: [
    {name: 'placement', type: "'above' | 'below' | 'start' | 'end'", description: 'Position relative to the trigger.', default: "'above'"},
    {name: 'alignment', type: "'start' | 'center' | 'end'", description: 'Alignment along the placement axis.', default: "'center'"},
    {name: 'delay', type: 'number', description: 'Delay before showing on hover, in milliseconds.', default: '200'},
    {name: 'hideDelay', type: 'number', description: 'Delay before hiding after mouse or focus leaves, in milliseconds.', default: '0'},
    {name: 'focusTrigger', type: "'auto' | 'always' | 'never'", description: 'When focus should open the tooltip. auto only attaches focus listeners to naturally focusable elements.', default: "'auto'"},
    {name: 'isEnabled', type: 'boolean', description: 'Whether hover and focus triggers are enabled.', default: 'true'},
    {name: 'isOpen', type: 'boolean', description: 'Controlled open state. true force-shows, false force-hides, undefined lets hover/focus manage visibility.'},
    {name: 'isDefaultOpen', type: 'boolean', description: 'Whether the tooltip should be shown on mount.', default: 'false'},
    {name: 'onShow', type: '() => void', description: 'Callback fired when the tooltip becomes visible.'},
    {name: 'onHide', type: '() => void', description: 'Callback fired when the tooltip is hidden.'},
  ],
  returns: [
    {name: 'ref', type: 'RefCallback<HTMLElement>', description: 'Combined ref that sets both position and interaction on the same trigger element.'},
    {name: 'positionRef', type: 'RefCallback<HTMLElement>', description: 'Ref for the positioning anchor element.'},
    {name: 'interactionRef', type: 'RefCallback<HTMLElement>', description: 'Ref for the hover/focus interaction element.'},
    {name: 'anchorId', type: 'string', description: 'CSS anchor name for advanced positioning cases.'},
    {name: 'describedBy', type: 'string', description: 'ID to compose into aria-describedby on the trigger.'},
    {name: 'renderTooltip', type: '(children: ReactNode, props?: ContextRenderProps) => ReactNode', description: 'Render function for the anchor-positioned tooltip content.'},
  ],
  usage: {
    description: 'Headless hook for hover/focus-triggered tooltips. Builds on useXDSLayer with hover intent, keyboard focus handling, and accessible aria-describedby linking. Use for custom trigger elements that need tooltip behavior without the wrapper component.',
    bestPractices: [
      {guidance: true, description: 'Use for brief text labels that describe icon buttons, truncated text, abbreviations, or compact controls.'},
      {guidance: true, description: 'Prefer the XDSTooltip component for standard wrapping; use the hook when the trigger is not a simple child.'},
      {guidance: false, description: 'Put interactive content inside tooltips: use Popover or HoverCard instead.'},
    ],
  },
  relatedComponents: ['Tooltip', 'HoverCard', 'Popover'],
  relatedHooks: ['useXDSLayer', 'useXDSHoverCard', 'useXDSPopover'],
  importPath: '@xds/core/Tooltip',
  category: 'interaction',
};

/** @type {import('../docs-types').HookTranslationDoc} */
export const docsDense = {
  description: 'Headless hover/focus tooltip hook. Builds on useXDSLayer w/ hover intent, keyboard focus handling, aria-describedby. Use for custom triggers without wrapper component.',
  paramDescriptions: {
    placement: 'position relative to trigger.',
    alignment: 'alignment along placement axis.',
    delay: 'show delay in ms.',
    hideDelay: 'hide delay after mouse/focus leave in ms.',
    focusTrigger: 'when focus opens tooltip; auto = naturally focusable elements only.',
    isEnabled: 'whether hover/focus triggers are enabled.',
    isOpen: 'controlled open state: true force-show, false force-hide, undefined unmanaged.',
    isDefaultOpen: 'show on mount.',
    onShow: 'fires when tooltip becomes visible.',
    onHide: 'fires when tooltip hides.',
  },
  returnDescriptions: {
    ref: 'combined position + interaction ref.',
    positionRef: 'position anchor ref.',
    interactionRef: 'hover/focus interaction ref.',
    anchorId: 'CSS anchor name.',
    describedBy: 'ID for aria-describedby.',
    renderTooltip: 'renders anchor-positioned tooltip content.',
  },
  usage: {
    description: 'Headless hover/focus tooltip hook. Builds on useXDSLayer w/ hover intent, keyboard focus handling, aria-describedby. Use for custom triggers without wrapper component.',
    bestPractices: [
      {guidance: true, description: 'Use for brief text labels describing icon buttons, truncated text, abbreviations, compact controls.'},
      {guidance: true, description: 'Prefer XDSTooltip for standard wrapping; use hook when trigger is not simple child.'},
      {guidance: false, description: 'Put interactive content in tooltips: use Popover / HoverCard instead.'},
    ],
  },
};
