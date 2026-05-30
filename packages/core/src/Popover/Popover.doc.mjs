// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Popover',
  displayName: 'Popover',
  group: 'Popover',
  category: 'Communications',
  keywords: ["popover","popup","dropdown","tooltip","overlay","flyout","callout","popper","anchor","floating","bubble"],
  components: [
    {
      name: 'XDSPopover',
      displayName: 'Popover',
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
          slotElements: [{__element: 'XDSText', props: {type: 'body'}, children: 'Content text'}],
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
          name: 'hasAutoFocus',
          type: 'boolean',
          description: 'Whether to auto-focus the first focusable element when the popover opens. Set to false for inline showcases or documentation previews.',
          default: 'true',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],
    },
  ],
  playground: {
    defaults: {
      content: {__element: 'XDSText', props: {type: 'body'}, children: 'Popover content goes here.'},
      children: {__element: 'XDSButton', props: {label: 'Open popover', variant: 'secondary'}},
    },
  },
  theming: {
    targets: [
      {className: 'xds-popover'},
    ],
    vars: [
      {name: '--_popover-radius', description: 'Border radius of the popover', default: 'var(--radius-element)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_popover-radius']},
    ],
  },
  usage: {
    description:
      'A click-triggered overlay anchored to a button or trigger element. Use it for secondary actions, inline confirmations, or supplementary information that does not warrant a full dialog. For hover previews use HoverCard, for brief helper text use Tooltip.',
    bestPractices: [
      { guidance: true, description: 'Keep popover content focused on a single task or piece of information.' },
      { guidance: true, description: 'Provide a clear way to close — either by clicking outside or with an explicit close button.' },
      { guidance: false, description: 'Nest popovers inside other popovers — it creates confusing focus and navigation.' },
      { guidance: false, description: 'Use a popover for content that requires heavy user input — use a Dialog instead.' },
      { guidance: false, description: 'Put too much content in a popover — if it needs scrolling, use a Dialog instead.' },
    ],
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
  displayName: 'Popover',
  components: [
    {
      name: 'XDSPopover',
      displayName: 'Popover',
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
        {
          name: 'hasAutoFocus',
          type: 'boolean',
          description: '弹出框打开时是否自动聚焦第一个可聚焦元素。内联展示或文档预览设为 false。',
          default: 'true',
        },
      ],
    },
  ],
  theming: {
    targets: [
      {className: 'xds-popover'},
    ],
    vars: [
      {name: '--_popover-radius', description: 'Border radius of the popover', default: 'var(--radius-element)', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_popover-radius']},
    ],
  },
  usage: {
    description:
      'A click-triggered overlay anchored to a button or trigger element. Use it for secondary actions, inline confirmations, or supplementary information that does not warrant a full dialog. For hover previews use HoverCard, for brief helper text use Tooltip.',
    bestPractices: [
      { guidance: true, description: 'Keep popover content focused on a single task or piece of information.' },
      { guidance: true, description: 'Provide a clear way to close — either by clicking outside or with an explicit close button.' },
      { guidance: false, description: 'Nest popovers inside other popovers — it creates confusing focus and navigation.' },
      { guidance: false, description: 'Use a popover for content that requires heavy user input — use a Dialog instead.' },
      { guidance: false, description: 'Put too much content in a popover — if it needs scrolling, use a Dialog instead.' },
    ],
    anatomy: [
      {name: 'Header', required: true, description: 'Contains the title, optional subheader, and close button.'},
      {name: 'Body', required: true, description: 'Main content area of the popover.'},
      {name: 'Trigger Element', required: true, description: 'The button or link that toggles the popover open.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Click-triggered popover displaying interactive content anchored to trigger element; implements button+dialog ARIA pattern.',
  usage: {
    description:
      'A click-triggered overlay anchored to a button or trigger element. Use it for secondary actions, inline confirmations, or supplementary information that does not warrant a full dialog. For hover previews use HoverCard, for brief helper text use Tooltip.',
    bestPractices: [
      { guidance: true, description: 'Keep popover content focused on a single task or piece of information.' },
      { guidance: true, description: 'Provide a clear way to close — either by clicking outside or with an explicit close button.' },
      { guidance: false, description: 'Nest popovers inside other popovers — it creates confusing focus and navigation.' },
      { guidance: false, description: 'Use a popover for content that requires heavy user input — use a Dialog instead.' },
      { guidance: false, description: 'Put too much content in a popover — if it needs scrolling, use a Dialog instead.' },
    ],
    anatomy: [
      {name: 'Header', required: true, description: 'Contains the title, optional subheader, and close button.'},
      {name: 'Body', required: true, description: 'Main content area of the popover.'},
      {name: 'Trigger Element', required: true, description: 'The button or link that toggles the popover open.'},
    ],
  },
  components: [
    {
      name: 'XDSPopover',
      displayName: 'Popover',
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
        hasAutoFocus: 'Auto-focus first element on open; false for showcases.',
      },
    },
  ],
};
