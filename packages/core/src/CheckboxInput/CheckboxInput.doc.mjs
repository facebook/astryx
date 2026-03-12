/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'CheckboxInput',
  description: 'A checkbox input component for toggling boolean values.',
  features: [
    'Accessible — always includes a label (can be visually hidden)',
    'Indeterminate state — supports indeterminate state for "select all" patterns',
    'Descriptions — optional description text below the label',
    'Custom styling — uses StyleX with XDS design tokens',
    'Disabled state — full support for disabled state styling',
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Label text for the checkbox (always rendered for accessibility).',
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
      name: 'value',
      type: "boolean | 'indeterminate'",
      description:
        'Whether the checkbox is checked, unchecked, or indeterminate.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(checked: boolean, e: ChangeEvent) => void',
      description: 'Callback fired when the checkbox state changes.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the checkbox is disabled.',
      default: 'false',
    },
  ],
  examples: [
    {
      label: 'Basic',
      code: `<XDSCheckboxInput
  label="Accept terms and conditions"
  value={accepted}
  onChange={setAccepted}
/>`,
    },
    {
      label: 'With description',
      code: `<XDSCheckboxInput
  label="Subscribe to newsletter"
  description="Receive weekly updates about new features"
  value={subscribed}
  onChange={setSubscribed}
/>`,
    },
    {
      label: 'Indeterminate state',
      code: `<XDSCheckboxInput
  label="Select all items"
  value="indeterminate"
  onChange={setSelectAll}
/>`,
    },
    {
      label: 'Hidden label',
      code: `<XDSCheckboxInput
  label="Select row"
  isLabelHidden
  value={selected}
  onChange={setSelected}
/>`,
    },
    {
      label: 'Disabled',
      code: `<XDSCheckboxInput
  label="Premium feature"
  description="Upgrade to enable this option"
  value={false}
  onChange={() => {}}
  isDisabled
/>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-checkbox-input', visualProps: ['size']},
    ],
  },
  notes: [
    'Uses a hidden native <input type="checkbox"> for accessibility with a custom visual checkbox overlay.',
    'The visual checkbox responds to hover, focus, and checked states via sibling selectors in CSS.',
    'Label is clickable and properly associated with the input via htmlFor/id.',
    'Focus outline uses the standard XDS focus outline token.',
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'CheckboxInput',
  description: '复选框输入组件，用于切换布尔值。',
  features: [
    '无障碍——始终包含标签（可视觉隐藏）',
    '不确定状态——支持"全选"模式的不确定状态',
    '描述——标签下方可选的描述文本',
    '自定义样式——使用 StyleX 和 XDS 设计令牌',
    '禁用状态——完整支持禁用状态样式',
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description:
        '复选框的标签文本（始终为无障碍性而渲染）。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '是否视觉隐藏标签。',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: '显示在标签下方的描述文本。',
    },
    {
      name: 'value',
      type: "boolean | 'indeterminate'",
      description:
        '复选框是否为选中、未选中或不确定状态。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(checked: boolean, e: ChangeEvent) => void',
      description: '复选框状态变更时触发的回调。',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '复选框是否禁用。',
      default: 'false',
    },
  ],
  examples: [
    {
      label: '基础用法',
      code: `<XDSCheckboxInput
  label="Accept terms and conditions"
  value={accepted}
  onChange={setAccepted}
/>`,
    },
    {
      label: '带描述',
      code: `<XDSCheckboxInput
  label="Subscribe to newsletter"
  description="Receive weekly updates about new features"
  value={subscribed}
  onChange={setSubscribed}
/>`,
    },
    {
      label: '不确定状态',
      code: `<XDSCheckboxInput
  label="Select all items"
  value="indeterminate"
  onChange={setSelectAll}
/>`,
    },
    {
      label: '隐藏标签',
      code: `<XDSCheckboxInput
  label="Select row"
  isLabelHidden
  value={selected}
  onChange={setSelected}
/>`,
    },
    {
      label: '禁用状态',
      code: `<XDSCheckboxInput
  label="Premium feature"
  description="Upgrade to enable this option"
  value={false}
  onChange={() => {}}
  isDisabled
/>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-checkbox-input', visualProps: ['size']},
    ],
  },
  notes: [
    '使用隐藏的原生 <input type="checkbox"> 确保无障碍性，并覆盖自定义视觉复选框。',
    '视觉复选框通过 CSS 兄弟选择器响应悬停、焦点和选中状态。',
    '标签可点击，并通过 htmlFor/id 与输入框正确关联。',
    '焦点轮廓使用标准的 XDS 焦点轮廓令牌。',
  ],
};
