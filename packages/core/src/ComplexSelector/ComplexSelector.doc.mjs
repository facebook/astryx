// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ComplexSelector',
  displayName: 'Complex Selector',
  group: 'Selector',
  category: 'Data Input',
  keywords: [
    'selector',
    'picker',
    'popover',
    'dialog',
    'custom',
    'rich',
    'matrix',
    'grid',
  ],
  theming: {
    targets: [
      {className: 'astryx-complex-selector', visualProps: ['size', 'status']},
      {
        className: 'astryx-complex-selector-indicator-icon',
        states: ['state'],
      },
    ],
  },
  components: [
    {
      name: 'ComplexSelector',
      displayName: 'Complex Selector',
      description:
        'A field and dialog-popover shell for custom selector content.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Label text for accessibility and the field label.',
          required: true,
        },
        {
          name: 'value',
          type: 'Value',
          description: 'Current controlled value.',
          required: true,
        },
        {
          name: 'onChange',
          type: '(value: Value) => void',
          description: 'Called when custom content commits a new value.',
        },
        {
          name: 'changeAction',
          type: '(value: Value) => void | Promise<void>',
          description:
            'Async action after onChange. ComplexSelector exposes optimistic value and busy state while pending.',
        },
        {
          name: 'children',
          type: '(value: Value, onChange: (value: Value) => void, close: () => void, state: ComplexSelectorRenderState) => ReactNode',
          description:
            'Custom dialog content. Receives positional value, onChange, close, and state helpers.',
          required: true,
        },
        {
          name: 'triggerLabel',
          type: 'ReactNode',
          description: 'Label/content shown in the closed trigger.',
        },
        {
          name: 'placeholder',
          type: 'ReactNode',
          description: 'Placeholder shown when triggerLabel is omitted.',
          default: "'Select…'",
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description: 'Visually hides the label while keeping it accessible.',
        },
        {
          name: 'description',
          type: 'string',
          description: 'Helper text displayed below the label.',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description: 'Marks the field as optional.',
        },
        {
          name: 'isRequired',
          type: 'boolean',
          description: 'Marks the field as required.',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Disables the selector.',
        },
        {
          name: 'isLoading',
          type: 'boolean',
          description: 'Shows loading state on the trigger.',
        },
        {
          name: 'status',
          type: "{type: 'warning' | 'error' | 'success', message?: string}",
          description: 'Validation status.',
        },
        {
          name: 'statusVariant',
          type: "'attached' | 'detached' | 'tooltip'",
          description:
            'How the status message is placed relative to the input. attached overlaps directly below the bordered input; detached floats below with a gap. Use tooltip for compact layouts — the status icon becomes a focusable button that reveals the message.',
          default: "'attached'",
        },
        {
          name: 'labelTooltip',
          type: 'string',
          description: 'Tooltip text displayed next to the label.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          description: 'Trigger and field size.',
          default: "'md'",
        },
        {
          name: 'width',
          type: 'SizeValue',
          description: 'Width of the field.',
        },
        {
          name: 'placement',
          type: "'above' | 'below' | 'start' | 'end'",
          description: 'Popup placement.',
          default: "'below'",
        },
        {
          name: 'contentXstyle',
          type: 'StyleXStyles',
          description: 'StyleX styles for the popup content container.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
    },
  ],
  usage: {
    description:
      'Use ComplexSelector when a selection needs richer custom content than a Selector option row. It is intentionally one component: ComplexSelector owns the field, trigger, popover, focus restore, and changeAction flow, while the content render prop owns the selector-specific accessible structure.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Compose the dialog content from the appropriate accessible structure for the job: RadioList for a simple choice, Calendar/date inputs for date picking, TreeList or a searchable list for hierarchy, or a custom grid when two-dimensional arrow navigation is useful.',
      },
      {
        guidance: true,
        description:
          'Use the provided onChange helper from children; it already calls both onChange and changeAction and updates optimistic busy state.',
      },
      {
        guidance: true,
        description:
          'Call close() from custom content when a selection should dismiss the popup. Keep it open for multi-step content or freeform entry flows.',
      },
      {
        guidance: true,
        description:
          'Use Astryx focus hooks for custom content: useGridFocus for two-dimensional grids, useTreeFocus through TreeList for hierarchies, and useListFocus for custom linear collections.',
      },
      {
        guidance: true,
        description:
          'Evaluate custom content against WCAG 2.2: keyboard operation, focus visible/not obscured, names and roles, labels/instructions, target size, and contrast/non-text contrast are especially relevant for selector popovers.',
      },
      {
        guidance: false,
        description:
          'Do not rebuild trigger ARIA, popover focus management, or changeAction handling in product code.',
      },
      {
        guidance: false,
        description:
          'Do not use ComplexSelector for a plain single-column text list; use Selector instead.',
      },
    ],
  },
};

export const docsZh = {
  components: [
    {
      name: 'ComplexSelector',
      displayName: 'Complex Selector',
      description: '用于自定义选择内容的字段与对话框弹层外壳。',
      propDescriptions: {
        label: '无障碍标签文本，同时用作字段标签。',
        value: '当前受控的值。',
        onChange: '自定义内容提交新值时触发的回调。',
        changeAction: 'onChange 之后的异步操作，驱动乐观 UI 与忙碌状态。',
        children:
          '自定义对话框内容的渲染函数，接收 value、onChange、close 和状态辅助参数。',
        triggerLabel: '关闭状态触发器中显示的标签或内容。',
        placeholder: '未提供 triggerLabel 时显示的占位文本。',
        isLabelHidden: '视觉上隐藏标签同时保持其可访问性。',
        description: '标签下方显示的辅助文本。',
        isOptional: '将字段标记为可选。',
        isRequired: '将字段标记为必填。',
        isDisabled: '禁用选择器。',
        isLoading: '在触发器中显示加载状态。',
        status: '带可选消息的验证状态。',
        statusVariant:
          '状态消息的放置方式：attached 直接叠加在输入框下方；detached 作为独立元素浮于下方并留有间距；tooltip 将状态图标变为可聚焦按钮，聚焦或悬停时在工具提示中显示消息。',
        labelTooltip: '标签旁显示的工具提示文本。',
        size: '触发器与字段的尺寸。',
        width: '字段宽度。',
        placement: '弹层位置。',
        contentXstyle: '弹层内容容器的 StyleX 样式。',
        xstyle: '布局自定义的 StyleX 样式，必须是 stylex.create() 值。',
      },
    },
  ],
  usage: {
    description:
      'Use ComplexSelector when a selection needs richer custom content than a Selector option row. It is intentionally one component: ComplexSelector owns the field, trigger, popover, focus restore, and changeAction flow, while the content render prop owns the selector-specific accessible structure.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Compose the dialog content from the appropriate accessible structure for the job: RadioList for a simple choice, Calendar/date inputs for date picking, TreeList or a searchable list for hierarchy, or a custom grid when two-dimensional arrow navigation is useful.',
      },
      {
        guidance: true,
        description:
          'Use the provided onChange helper from children; it already calls both onChange and changeAction and updates optimistic busy state.',
      },
      {
        guidance: true,
        description:
          'Call close() from custom content when a selection should dismiss the popup. Keep it open for multi-step content or freeform entry flows.',
      },
      {
        guidance: true,
        description:
          'Use Astryx focus hooks for custom content: useGridFocus for two-dimensional grids, useTreeFocus through TreeList for hierarchies, and useListFocus for custom linear collections.',
      },
      {
        guidance: true,
        description:
          'Evaluate custom content against WCAG 2.2: keyboard operation, focus visible/not obscured, names and roles, labels/instructions, target size, and contrast/non-text contrast are especially relevant for selector popovers.',
      },
      {
        guidance: false,
        description:
          'Do not rebuild trigger ARIA, popover focus management, or changeAction handling in product code.',
      },
      {
        guidance: false,
        description:
          'Do not use ComplexSelector for a plain single-column text list; use Selector instead.',
      },
    ],
  },
};

export const docsDense = {
  name: 'ComplexSelector',
  displayName: 'Complex Selector',
  group: 'Selector',
  category: 'Data Input',
  description:
    'Field+dialog-popover shell for rich custom selectors. Content gets value/onChange/close/state; content owns semantics. Use focus hooks and evaluate custom content against WCAG 2.2.',
  propDescriptions: {
    label: 'Accessible field label.',
    value: 'Controlled value.',
    onChange: 'Commit value.',
    changeAction: 'Async action after onChange; drives optimistic value/busy.',
    children: 'Render custom dialog content from (value,onChange,close,state).',
    triggerLabel: 'Closed trigger label/content.',
    placement: 'Popup placement.',
    accessibility:
      'Custom content must provide its own accessible structure. Use focus hooks and evaluate against WCAG 2.2.',
  },
};
