/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'RadioList',
  description:
    'A radio group component for single-value selection from a list of options.',
  features: [
    'Accessible — uses native <input type="radio"> with proper role="radiogroup" and ARIA attributes',
    'Orientation — supports vertical and horizontal layouts',
    'Sizes — sm (18px radio, 20px wrapper) and md (22px radio, 24px wrapper)',
    'Descriptions — optional description text per item',
    'Custom content — startContent and endContent slots on each item',
    'Disabled state — supports disabling the entire group or individual items',
    'Field integration — uses XDSField for label, description, required/optional, and status messaging',
  ],
  examples: [
    {
      label: 'Basic',
      code: `<XDSRadioList
  label="Notification preference"
  value={selected}
  onChange={setSelected}
>
  <XDSRadioListItem label="Email" value="email" />
  <XDSRadioListItem label="SMS" value="sms" />
  <XDSRadioListItem label="Push" value="push" />
</XDSRadioList>`,
    },
    {
      label: 'With descriptions',
      code: `<XDSRadioList
  label="Plan"
  value={plan}
  onChange={setPlan}
>
  <XDSRadioListItem
    label="Free"
    value="free"
    description="Basic features, limited usage"
  />
  <XDSRadioListItem
    label="Pro"
    value="pro"
    description="All features, unlimited usage"
  />
</XDSRadioList>`,
    },
    {
      label: 'Horizontal layout',
      code: `<XDSRadioList
  label="Size"
  value={size}
  onChange={setSize}
  orientation="horizontal"
>
  <XDSRadioListItem label="Small" value="sm" />
  <XDSRadioListItem label="Medium" value="md" />
  <XDSRadioListItem label="Large" value="lg" />
</XDSRadioList>`,
    },
    {
      label: 'With status',
      code: `<XDSRadioList
  label="Required choice"
  value={choice}
  onChange={setChoice}
  isRequired
  status={{ type: 'error', message: 'Please select an option' }}
>
  <XDSRadioListItem label="Option A" value="a" />
  <XDSRadioListItem label="Option B" value="b" />
</XDSRadioList>`,
    },
    {
      label: 'Disabled group',
      code: `<XDSRadioList
  label="Locked selection"
  value="locked"
  onChange={() => {}}
  isDisabled
>
  <XDSRadioListItem label="Locked" value="locked" />
  <XDSRadioListItem label="Unavailable" value="unavailable" />
</XDSRadioList>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-radio-list', visualProps: ['orientation', 'size']},
      {className: 'xds-radio-list-item'},
      {className: 'xds-radio', visualProps: ['size'], states: ['checked', 'disabled']},
      {className: 'xds-radio-dot', visualProps: ['size']},
    ],
  },
  notes: [
    'XDSRadioList creates a RadioListContext that provides name, value, onChange, isDisabled, isRequired, size, and status to child items',
    'XDSRadioListItem must be used within an XDSRadioList — throws if context is missing',
    'Uses a hidden native <input type="radio"> with a custom visual overlay for consistent styling',
    'Focus outline uses the standard XDS focus outline token with 2px offset',
    'Hover states use color-mix() for consistent overlay tinting',
    'Size variants match CheckboxInput dimensions for visual consistency',
  ],
  components: [
    {
      name: 'XDSRadioList',
      description:
        'Radio group container with field integration for label, description, and status.',
      examples: [
        {
          label: 'Basic',
          code: `<XDSRadioList label="Notification preference" value={selected} onChange={setSelected}>
  <XDSRadioListItem label="Email" value="email" />
  <XDSRadioListItem label="SMS" value="sms" />
</XDSRadioList>`,
        },
      ],
      props: [
        {
          name: 'label',
          type: 'string',
          description:
            'Label text for the radio group (always rendered for accessibility).',
          required: true,
        },
        {
          name: 'value',
          type: 'string',
          description: 'The currently selected value.',
          required: true,
        },
        {
          name: 'onChange',
          type: '(value: string) => void',
          description: 'Callback fired when the selected value changes.',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'XDSRadioListItem elements.',
          required: true,
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description: 'Whether to visually hide the label.',
          default: 'false',
        },
        {
          name: 'description',
          type: 'string',
          description: 'Description text displayed below the label.',
        },
        {
          name: 'orientation',
          type: "'vertical' | 'horizontal'",
          description: 'Layout direction of the radio items.',
          default: "'vertical'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether all radio items are disabled.',
          default: 'false',
        },
        {
          name: 'isRequired',
          type: 'boolean',
          description: 'Whether the radio group is required.',
          default: 'false',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description:
            'Whether the field is optional (mutually exclusive with isRequired).',
          default: 'false',
        },
        {
          name: 'status',
          type: 'XDSInputStatus',
          description: 'Status indicator ({ type, message }).',
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          description: 'Size of the radio controls.',
          default: "'md'",
        },
        {
          name: 'labelTooltip',
          type: 'string',
          description: 'Tooltip text for an info icon next to the label.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],
    },
    {
      name: 'XDSRadioListItem',
      description:
        'Individual radio item with label, description, and content slots.',
      examples: [
        {
          label: 'With description',
          code: `<XDSRadioListItem
  label="Pro"
  value="pro"
  description="All features, unlimited usage"
/>`,
        },
      ],
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Label text for the radio item.',
          required: true,
        },
        {
          name: 'value',
          type: 'string',
          description: 'Value of this radio item.',
          required: true,
        },
        {
          name: 'description',
          type: 'string',
          description: 'Description text displayed below the label.',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether this individual radio item is disabled.',
          default: 'false',
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description: 'Content to render before the radio circle.',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: 'Content to render after the label.',
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'RadioList',
  description:
    '用于从选项列表中进行单值选择的单选按钮组组件。',
  features: [
    '无障碍 - 使用原生 <input type="radio">，配合正确的 role="radiogroup" 和 ARIA 属性',
    '方向 - 支持垂直和水平布局',
    '尺寸 - sm（18px 单选按钮，20px 容器）和 md（22px 单选按钮，24px 容器）',
    '描述 - 每个选项可选的描述文本',
    '自定义内容 - 每个选项上的 startContent 和 endContent 插槽',
    '禁用状态 - 支持禁用整个组或单个选项',
    '字段集成 - 使用 XDSField 提供标签、描述、必填/可选和状态消息',
  ],
  examples: [
    {
      label: '基础用法',
      code: `<XDSRadioList
  label="Notification preference"
  value={selected}
  onChange={setSelected}
>
  <XDSRadioListItem label="Email" value="email" />
  <XDSRadioListItem label="SMS" value="sms" />
  <XDSRadioListItem label="Push" value="push" />
</XDSRadioList>`,
    },
    {
      label: '带描述',
      code: `<XDSRadioList
  label="Plan"
  value={plan}
  onChange={setPlan}
>
  <XDSRadioListItem
    label="Free"
    value="free"
    description="Basic features, limited usage"
  />
  <XDSRadioListItem
    label="Pro"
    value="pro"
    description="All features, unlimited usage"
  />
</XDSRadioList>`,
    },
    {
      label: '水平布局',
      code: `<XDSRadioList
  label="Size"
  value={size}
  onChange={setSize}
  orientation="horizontal"
>
  <XDSRadioListItem label="Small" value="sm" />
  <XDSRadioListItem label="Medium" value="md" />
  <XDSRadioListItem label="Large" value="lg" />
</XDSRadioList>`,
    },
    {
      label: '带状态',
      code: `<XDSRadioList
  label="Required choice"
  value={choice}
  onChange={setChoice}
  isRequired
  status={{ type: 'error', message: 'Please select an option' }}
>
  <XDSRadioListItem label="Option A" value="a" />
  <XDSRadioListItem label="Option B" value="b" />
</XDSRadioList>`,
    },
    {
      label: '禁用组',
      code: `<XDSRadioList
  label="Locked selection"
  value="locked"
  onChange={() => {}}
  isDisabled
>
  <XDSRadioListItem label="Locked" value="locked" />
  <XDSRadioListItem label="Unavailable" value="unavailable" />
</XDSRadioList>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-radio-list', visualProps: ['orientation', 'size']},
      {className: 'xds-radio-list-item'},
      {className: 'xds-radio', visualProps: ['size'], states: ['checked', 'disabled']},
      {className: 'xds-radio-dot', visualProps: ['size']},
    ],
  },
  notes: [
    'XDSRadioList 创建一个 RadioListContext，向子项提供 name、value、onChange、isDisabled、isRequired、size 和 status',
    'XDSRadioListItem 必须在 XDSRadioList 内部使用——如果缺少上下文会抛出错误',
    '使用隐藏的原生 <input type="radio"> 配合自定义视觉覆盖层以保持样式一致性',
    '焦点轮廓使用标准 XDS 焦点轮廓令牌，偏移量为 2px',
    '悬停状态使用 color-mix() 实现一致的覆盖层着色',
    '尺寸变体与 CheckboxInput 的尺寸匹配，保持视觉一致性',
  ],
  components: [
    {
      name: 'XDSRadioList',
      description:
        '单选按钮组容器，集成字段功能，支持标签、描述和状态。',
      examples: [
        {
          label: '基础用法',
          code: `<XDSRadioList label="Notification preference" value={selected} onChange={setSelected}>
  <XDSRadioListItem label="Email" value="email" />
  <XDSRadioListItem label="SMS" value="sms" />
</XDSRadioList>`,
        },
      ],
      props: [
        {
          name: 'label',
          type: 'string',
          description:
            '单选按钮组的标签文本（始终渲染以确保无障碍可访问性）。',
          required: true,
        },
        {
          name: 'value',
          type: 'string',
          description: '当前选中的值。',
          required: true,
        },
        {
          name: 'onChange',
          type: '(value: string) => void',
          description: '选中值变更时触发的回调函数。',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'XDSRadioListItem 元素。',
          required: true,
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description: '是否在视觉上隐藏标签。',
          default: 'false',
        },
        {
          name: 'description',
          type: 'string',
          description: '显示在标签下方的描述文本。',
        },
        {
          name: 'orientation',
          type: "'vertical' | 'horizontal'",
          description: '单选选项的布局方向。',
          default: "'vertical'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '是否禁用所有单选选项。',
          default: 'false',
        },
        {
          name: 'isRequired',
          type: 'boolean',
          description: '单选按钮组是否为必填。',
          default: 'false',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description:
            '字段是否为可选（与 isRequired 互斥）。',
          default: 'false',
        },
        {
          name: 'status',
          type: 'XDSInputStatus',
          description: '状态指示器（{ type, message }）。',
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          description: '单选控件的尺寸。',
          default: "'md'",
        },
        {
          name: 'labelTooltip',
          type: 'string',
          description: '标签旁信息图标的提示文本。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
        },
      ],
    },
    {
      name: 'XDSRadioListItem',
      description:
        '单个单选选项，包含标签、描述和内容插槽。',
      examples: [
        {
          label: '带描述',
          code: `<XDSRadioListItem
  label="Pro"
  value="pro"
  description="All features, unlimited usage"
/>`,
        },
      ],
      props: [
        {
          name: 'label',
          type: 'string',
          description: '单选选项的标签文本。',
          required: true,
        },
        {
          name: 'value',
          type: 'string',
          description: '此单选选项的值。',
          required: true,
        },
        {
          name: 'description',
          type: 'string',
          description: '显示在标签下方的描述文本。',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '是否禁用此单个单选选项。',
          default: 'false',
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description: '在单选圆圈前渲染的内容。',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: '在标签后渲染的内容。',
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Radio group component for single-value selection from list of options.',
  features: [
    'Accessible; uses native <input type="radio"> w/ proper role="radiogroup" + ARIA attributes',
    'Orientation; supports vertical + horizontal layouts',
    'Sizes; sm (18px radio, 20px wrapper) + md (22px radio, 24px wrapper)',
    'Descriptions; optional description text per item',
    'Custom content; startContent + endContent slots on each item',
    'Disabled state; supports disabling entire group or individual items',
    'Field integration; uses XDSField for label, description, required/optional, status messaging',
  ],
  notes: [
    'XDSRadioList creates RadioListContext providing name, value, onChange, isDisabled, isRequired, size, status to child items',
    'XDSRadioListItem must be within XDSRadioList; throws if context missing',
    'Uses hidden native <input type="radio"> w/ custom visual overlay for consistent styling',
    'Focus outline uses standard XDS focus outline token w/ 2px offset',
    'Hover states use color-mix() for consistent overlay tinting',
    'Size variants match CheckboxInput dimensions for visual consistency',
  ],
  components: [
    {
      name: 'XDSRadioList',
      description:
        'Radio group container w/ field integration for label, description, status.',
      propDescriptions: {
        label: 'Label text for radio group (always rendered for accessibility).',
        value: 'Currently selected value.',
        onChange: 'Callback fired when selected value changes.',
        children: 'XDSRadioListItem elements.',
        isLabelHidden: 'Whether to visually hide label.',
        description: 'Description text below label.',
        orientation: 'Layout direction of radio items.',
        isDisabled: 'Whether all radio items disabled.',
        isRequired: 'Whether radio group required.',
        isOptional: 'Whether field optional (mutually exclusive w/ isRequired).',
        status: 'Status indicator ({ type, message }).',
        size: 'Size of radio controls.',
        labelTooltip: 'Tooltip text for info icon next to label.',
        xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
      },
    },
    {
      name: 'XDSRadioListItem',
      description:
        'Individual radio item w/ label, description, content slots.',
      propDescriptions: {
        label: 'Label text for radio item.',
        value: 'Value of this radio item.',
        description: 'Description text below label.',
        isDisabled: 'Whether this individual radio item disabled.',
        startContent: 'Content rendered before radio circle.',
        endContent: 'Content rendered after label.',
      },
    },
  ],
};
