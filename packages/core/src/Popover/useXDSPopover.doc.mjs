// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useXDSPopover',
  displayName: 'useXDSPopover',
  group: 'Popover',
  keywords: ['popover', 'popup', 'dropdown', 'floating', 'anchor', 'dialog', 'overlay', 'flyout'],
  params: [
    {name: 'onShow', type: '() => void', description: 'Callback fired when the popover becomes visible.'},
    {name: 'onHide', type: '() => void', description: 'Callback fired when the popover is hidden. Use this to return focus to the trigger when needed.'},
    {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles applied to the popover content wrapper, after the default surface styles.'},
    {name: 'hasLightDismiss', type: 'boolean', description: 'Whether clicking outside dismisses the popover.', default: 'true'},
    {name: 'hasAutoFocus', type: 'boolean', description: 'Whether to automatically focus the first focusable element when opened.', default: 'true'},
    {name: 'hasCloseButton', type: 'boolean', description: 'Whether to include a hidden close button that appears for keyboard users.', default: 'true'},
    {name: 'closeButtonLabel', type: 'string', description: 'Accessible label for the hidden close button.', default: "'Close popover'"},
    {name: 'dialogLabel', type: 'string', description: 'Accessible label for the popover dialog. Provide one when there is no visible title.'},
    {name: 'hasSurface', type: 'boolean', description: 'Whether to apply the default popover surface background, radius, and shadow.', default: 'true'},
  ],
  returns: [
    {name: 'triggerRef', type: '(el: HTMLElement | null) => void', description: 'Ref callback to attach to the trigger element for CSS anchor positioning.'},
    {name: 'contentRef', type: 'RefObject<HTMLDivElement | null>', description: 'Ref for the popover content container used by focus trapping.'},
    {name: 'anchorId', type: 'string', description: 'CSS anchor name for advanced positioning cases.'},
    {name: 'show', type: '(options?: {skipAutoFocus?: boolean}) => void', description: 'Imperatively show the popover. skipAutoFocus preserves current focus for input-triggered popovers.'},
    {name: 'hide', type: '() => void', description: 'Imperatively hide the popover.'},
    {name: 'toggle', type: '() => void', description: 'Toggle the popover open or closed.'},
    {name: 'isOpen', type: 'boolean', description: 'Whether the popover is currently open.'},
    {name: 'id', type: 'string', description: 'Unique ID for aria-describedby or aria-controls.'},
    {name: 'render', type: '(children: ReactNode, props?: ContextRenderProps) => ReactNode', description: 'Render function for anchor-positioned popover content. Pass placement and alignment here.'},
    {name: 'triggerProps', type: '{aria-haspopup: "dialog"; aria-expanded: boolean; aria-controls: string}', description: 'ARIA attributes to spread onto the trigger element.'},
  ],
  usage: {
    description: 'Headless hook for click-triggered popovers with focus trapping. Combines useXDSLayer with useFocusTrap, auto-focus, light dismiss, Escape handling, and an optional hidden close button for accessible dialog-like popover behavior. Use for custom interactive floating content that needs keyboard navigation.',
    bestPractices: [
      {guidance: true, description: 'Use for interactive content such as menus, pickers, forms, and command panels that need focus management.'},
      {guidance: true, description: 'Prefer the XDSPopover component for standard trigger-content pairs; use the hook for custom trigger patterns.'},
      {guidance: false, description: 'Use for non-interactive hover previews: use useXDSHoverCard or useXDSTooltip instead.'},
    ],
  },
  relatedComponents: ['Popover', 'DropdownMenu', 'HoverCard'],
  relatedHooks: ['useXDSLayer', 'useFocusTrap', 'useXDSHoverCard', 'useXDSTooltip'],
  importPath: '@xds/core/Popover',
  category: 'interaction',
};

/** @type {import('../docs-types').HookTranslationDoc} */
export const docsDense = {
  description: 'Headless click-triggered popovers w/ focus trap, auto-focus, light dismiss, Escape, optional hidden close button. Use for custom interactive floating content needing keyboard nav.',
  paramDescriptions: {
    onShow: 'fires when popover becomes visible.',
    onHide: 'fires when popover hides; use to return focus when needed.',
    xstyle: 'StyleX styles for content wrapper, after default surface.',
    hasLightDismiss: 'whether outside click dismisses popover.',
    hasAutoFocus: 'whether first focusable element receives focus on open.',
    hasCloseButton: 'whether hidden keyboard close button is included.',
    closeButtonLabel: 'label for hidden close button.',
    dialogLabel: 'accessible label for popover dialog.',
    hasSurface: 'apply default surface background/radius/shadow.',
  },
  returnDescriptions: {
    triggerRef: 'trigger ref for CSS anchor positioning.',
    contentRef: 'content container ref for focus trap.',
    anchorId: 'CSS anchor name.',
    show: 'show popover; skipAutoFocus preserves current focus.',
    hide: 'hide popover.',
    toggle: 'toggle open/closed.',
    isOpen: 'whether currently open.',
    id: 'unique ARIA id.',
    render: 'renders anchor-positioned popover content.',
    triggerProps: 'ARIA attrs for trigger.',
  },
  usage: {
    description: 'Headless click-triggered popovers w/ focus trap, auto-focus, light dismiss, Escape, optional hidden close button. Use for custom interactive floating content needing keyboard nav.',
    bestPractices: [
      {guidance: true, description: 'Use for menus, pickers, forms, command panels needing focus management.'},
      {guidance: true, description: 'Prefer XDSPopover for standard trigger-content pairs; use hook for custom trigger patterns.'},
      {guidance: false, description: 'Use for non-interactive hover previews: use useXDSHoverCard / useXDSTooltip instead.'},
    ],
  },
};
