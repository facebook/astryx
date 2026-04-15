/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Popover',
  description:
    'A click-triggered popover for displaying interactive content anchored to a trigger element, implementing the button + dialog ARIA pattern.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSPopover trigger={<button>Open</button>}>Content</XDSPopover>',
  },
  keywords: ["popover","popup","dropdown","tooltip","overlay","flyout","callout","popper","anchor","floating","bubble"],
  features: [
    'CSS Anchor Positioning for automatic placement relative to trigger elements',
    'Popover API for top-layer rendering — no React portals needed',
    'Controlled and uncontrolled modes',
    'Light dismiss support (click outside or Escape to close)',
    'Focus trap inside open popovers',
    'ARIA button + dialog pattern applied automatically to trigger elements',
    'Sibling mode via anchorRef for external trigger elements',
    'Stable anchor wrapper immune to pressed-state transforms',
  ],
  notes: [
    'XDSPopover locates the trigger button inside children by searching for <button> or [role="button"] — the child tree must contain one. It applies click/keydown handlers and aria-haspopup, aria-expanded, aria-controls automatically.',
    'XDSPopover uses an inline-flex anchor wrapper so that pressed-state transforms on the trigger (e.g. :active scale) do not shift the anchor position and cause popover jitter.',
    'In sibling mode (anchorRef prop), XDSPopover attaches to an external ref rather than wrapping children — useful when the trigger and overlay are not parent/child.',
    'LayerPlacement values: above | below | start | end. LayerAlignment values: start | center | end.',
  ],
  accessibility: [
    'Implements the button + dialog ARIA pattern: aria-haspopup, aria-expanded, and aria-controls are set on the trigger button automatically.',
    'Traps focus inside the popover dialog while it is open.',
    'Supports keyboard activation for role="button" elements (Enter and Space) in addition to native <button> click synthesis.',
  ],
  keyboard:
    'Escape closes the popover. Enter/Space open the popover when the trigger has focus. Focus is trapped inside an open popover.',
  components: [
    {
      name: 'XDSPopover',
      description:
        'A click-triggered popover for displaying interactive content anchored to a trigger element.',      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Trigger element. Must contain a <button> or [role="button"] element.',
        },
        {
          name: 'anchorRef',
          type: 'React.RefObject<HTMLElement>',
          description:
            'External ref to use as the popover anchor in sibling mode.',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: 'Content to display inside the popover.',
          required: true,
        },
        {
          name: 'placement',
          type: 'LayerPlacement',
          description: 'Position placement relative to the trigger.',
          default: "'below'",
        },
        {
          name: 'alignment',
          type: 'LayerAlignment',
          description: 'Alignment along the placement axis.',
          default: "'start'",
        },
        {
          name: 'isOpen',
          type: 'boolean',
          description: 'Whether the popover is shown in controlled mode.',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description: 'Callback fired when the popover visibility changes.',
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: 'When false, trigger interactions are ignored.',
          default: 'true',
        },
        {
          name: 'width',
          type: 'number | string',
          description: 'Width of the popover container.',
          default: "'auto'",
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the popover dialog.',
        },
        {
          name: 'hasCloseButton',
          type: 'boolean',
          description: 'Whether to include a hidden close button for accessibility.',
          default: 'true',
        },
        {
          name: 'closeButtonLabel',
          type: 'string',
          description: 'Label for the hidden close button.',
          default: "'Close popover'",
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],
    },
    {
      name: 'useXDSPopover',
      description:
        'Hook for creating popover dialogs with focus trapping. Combines useXDSLayer with useFocusTrap.',
      props: [
        {
          name: 'onShow',
          type: '() => void',
          description: 'Callback fired when popover is shown.',
        },
        {
          name: 'onHide',
          type: '() => void',
          description: 'Callback fired when popover is hidden.',
        },
        {
          name: 'hasLightDismiss',
          type: 'boolean',
          description: 'Whether clicking outside should dismiss the popover.',
          default: 'true',
        },
        {
          name: 'hasAutoFocus',
          type: 'boolean',
          description: 'Whether to auto-focus the first focusable element when opened.',
          default: 'true',
        },
        {
          name: 'hasCloseButton',
          type: 'boolean',
          description: 'Whether to include a hidden close button for accessibility.',
          default: 'true',
        },
        {
          name: 'closeButtonLabel',
          type: 'string',
          description: 'Label for the hidden close button.',
          default: "'Close popover'",
        },
        {
          name: 'dialogLabel',
          type: 'string',
          description: 'Accessible label for the dialog.',
        },
      ],
    },
  ],
  theming: {
    targets: [
      {className: 'xds-popover'},
    ],
    vars: [
      {name: '--popover-radius', description: 'Border radius of the popover', default: 'var(--radius-element)'},
    ],
  },
  usage: {
    summary: 'A floating card toggled open on click for secondary actions or supplementary information.',
    content: `## When to use

- Secondary menu options.
- Customizable settings panels.
- Filtering options.
- Supplementary information that does not warrant a full dialog.

## When NOT to use

- Static content display (use Card instead).
- Hover-triggered previews (use HoverCard instead).
- Brief helper text (use Tooltip instead).
- Complex flows requiring full focus (use Dialog instead).

## Best practices

- Do: Use a clear trigger element such as a button or link.
- Don't: Confuse with Tooltip \u2014 Popovers are click-triggered and contain richer content.
- Include a close button in the header for easy dismissal.`,
    anatomy: [
      {name: 'Header', required: true, description: 'Contains the title, optional subheader, and close button.'},
      {name: 'Body', required: true, description: 'Main content area of the popover.'},
      {name: 'Trigger Element', required: true, description: 'The button or link that toggles the popover open.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Popover',
  description:
    '一个点击触发的弹出框，用于显示锚定到触发元素的交互式内容，实现了按钮 + 对话框的 ARIA 模式。',
  features: [
    '使用 CSS 锚点定位，相对于触发元素自动放置',
    '使用 Popover API 进行顶层渲染——无需 React 传送门',
    '受控和非受控模式',
    '轻量关闭支持（点击外部或按 Escape 关闭）',
    '在打开的弹出框内捕获焦点',
    'ARIA 按钮 + 对话框模式自动应用于触发元素',
    '通过 anchorRef 实现兄弟模式，用于外部触发元素',
    '稳定的锚点包装器，不受按压状态变换的影响',
  ],
  notes: [
    'XDSPopover 通过搜索 <button> 或 [role="button"] 来定位子元素中的触发按钮——子树中必须包含一个。它会自动应用 click/keydown 处理程序以及 aria-haspopup、aria-expanded、aria-controls 属性。',
    'XDSPopover 使用 inline-flex 锚点包装器，以确保触发器上的按压状态变换（如 :active scale）不会偏移锚点位置并导致弹出框抖动。',
    '在兄弟模式下（anchorRef 属性），XDSPopover 附加到外部 ref 而不是包裹子元素——适用于触发器和浮层不是父子关系的情况。',
    'LayerPlacement 值：above | below | start | end。LayerAlignment 值：start | center | end。',
  ],
  accessibility: [
    '实现了按钮 + 对话框的 ARIA 模式：aria-haspopup、aria-expanded 和 aria-controls 会自动设置在触发按钮上。',
    '在弹出框对话框打开时，焦点被捕获在其内部。',
    '支持 role="button" 元素的键盘激活（Enter 和 Space），以及原生 <button> 的点击合成。',
  ],
  keyboard:
    'Escape 关闭弹出框。当触发器获得焦点时，Enter/Space 打开弹出框。焦点被捕获在打开的弹出框内。',
  components: [
    {
      name: 'XDSPopover',
      description:
        '一个点击触发的弹出框，用于显示锚定到触发元素的交互式内容。',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            '触发元素。必须包含一个 <button> 或 [role="button"] 元素。',
        },
        {
          name: 'anchorRef',
          type: 'React.RefObject<HTMLElement>',
          description:
            '在兄弟模式下用作弹出框锚点的外部 ref。',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: '在弹出框内显示的内容。',
          required: true,
        },
        {
          name: 'placement',
          type: 'LayerPlacement',
          description: '相对于触发器的位置放置方式。',
          default: "'below'",
        },
        {
          name: 'alignment',
          type: 'LayerAlignment',
          description: '沿放置轴的对齐方式。',
          default: "'start'",
        },
        {
          name: 'isOpen',
          type: 'boolean',
          description: '在受控模式下弹出框是否显示。',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description: '弹出框可见性变化时触发的回调。',
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: '设为 false 时，忽略触发器交互。',
          default: 'true',
        },
        {
          name: 'width',
          type: 'number | string',
          description: '弹出框容器的宽度。',
          default: "'auto'",
        },
        {
          name: 'label',
          type: 'string',
          description: '弹出框对话框的无障碍标签。',
        },
        {
          name: 'hasCloseButton',
          type: 'boolean',
          description: '是否包含用于无障碍访问的隐藏关闭按钮。',
          default: 'true',
        },
        {
          name: 'closeButtonLabel',
          type: 'string',
          description: '隐藏关闭按钮的标签。',
          default: "'Close popover'",
        },
      ],
    },
    {
      name: 'useXDSPopover',
      description:
        '用于创建带焦点捕获的弹出框对话框的钩子。将 useXDSLayer 与 useFocusTrap 结合使用。',
      props: [
        {
          name: 'onShow',
          type: '() => void',
          description: '弹出框显示时触发的回调。',
        },
        {
          name: 'onHide',
          type: '() => void',
          description: '弹出框隐藏时触发的回调。',
        },
        {
          name: 'hasLightDismiss',
          type: 'boolean',
          description: '点击外部是否应关闭弹出框。',
          default: 'true',
        },
        {
          name: 'hasAutoFocus',
          type: 'boolean',
          description: '打开时是否自动聚焦第一个可聚焦元素。',
          default: 'true',
        },
        {
          name: 'hasCloseButton',
          type: 'boolean',
          description: '是否包含用于无障碍访问的隐藏关闭按钮。',
          default: 'true',
        },
        {
          name: 'closeButtonLabel',
          type: 'string',
          description: '隐藏关闭按钮的标签。',
          default: "'Close popover'",
        },
        {
          name: 'dialogLabel',
          type: 'string',
          description: '对话框的无障碍标签。',
        },
      ],
    },
  ],
  theming: {
    targets: [
      {className: 'xds-popover'},
    ],
    vars: [
      {name: '--popover-radius', description: 'Border radius of the popover', default: 'var(--radius-element)'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Click-triggered popover displaying interactive content anchored to trigger element; implements button+dialog ARIA pattern.',
  features: [
    'CSS Anchor Positioning for auto placement relative to trigger',
    'Popover API for top-layer rendering; no React portals needed',
    'Controlled + uncontrolled modes',
    'Light dismiss support (click outside or Escape to close)',
    'Focus trap inside open popovers',
    'ARIA button+dialog pattern auto-applied to trigger elements',
    'Sibling mode via anchorRef for external trigger elements',
    'Stable anchor wrapper immune to pressed-state transforms',
  ],
  notes: [
    'XDSPopover finds trigger button in children by searching <button> or [role="button"]; child tree must contain one. Applies click/keydown handlers + aria-haspopup, aria-expanded, aria-controls automatically.',
    'Uses inline-flex anchor wrapper so pressed-state transforms (e.g. :active scale) don\'t shift anchor position causing jitter.',
    'Sibling mode (anchorRef prop) attaches to external ref instead of wrapping children; useful when trigger+overlay not parent/child.',
    'LayerPlacement values: above | below | start | end. LayerAlignment values: start | center | end.',
  ],
  accessibility: [
    'Implements button+dialog ARIA pattern: aria-haspopup, aria-expanded, aria-controls set on trigger button automatically.',
    'Traps focus inside popover dialog while open.',
    'Supports keyboard activation for role="button" elements (Enter+Space) plus native <button> click synthesis.',
  ],
  keyboard:
    'Escape closes popover. Enter/Space open popover when trigger focused. Focus trapped inside open popover.',
  components: [
    {
      name: 'XDSPopover',
      description:
        'Click-triggered popover for interactive content anchored to trigger element.',
      propDescriptions: {
        children: 'Trigger element. Must contain <button> or [role="button"] element.',
        anchorRef: 'External ref for popover anchor in sibling mode.',
        content: 'Content displayed inside popover.',
        placement: 'Position relative to trigger.',
        alignment: 'Alignment along placement axis.',
        isOpen: 'Whether popover shown in controlled mode.',
        onOpenChange: 'Callback fired when popover visibility changes.',
        isEnabled: 'When false, trigger interactions ignored.',
        width: 'Popover container width.',
        label: 'Accessible label for popover dialog.',
        hasCloseButton: 'Whether to include hidden close button for accessibility.',
        closeButtonLabel: 'Label for hidden close button.',
      },
    },
    {
      name: 'useXDSPopover',
      description:
        'Hook for popover dialogs w/ focus trapping. Combines useXDSLayer w/ useFocusTrap.',
      propDescriptions: {
        onShow: 'Callback fired when popover shown.',
        onHide: 'Callback fired when popover hidden.',
        hasLightDismiss: 'Whether clicking outside dismisses popover.',
        hasAutoFocus: 'Whether to auto-focus first focusable element when opened.',
        hasCloseButton: 'Whether to include hidden close button for accessibility.',
        closeButtonLabel: 'Label for hidden close button.',
        dialogLabel: 'Accessible label for dialog.',
      },
    },
  ],
};
