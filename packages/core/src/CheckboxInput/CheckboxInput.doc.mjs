/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'CheckboxInput',
  description: 'A checkbox input component for toggling boolean values.',
  features: [
    'Accessible — always includes a label (can be visually hidden)',
    'Indeterminate state — supports indeterminate for "select all" patterns',
    'Descriptions — optional description text below the label',
    'Sizes — sm (compact) and md (default)',
    'Async actions — onChangeAction with optimistic updates and loading spinner',
    'Status messages — error, warning, success validation feedback',
    'Optional/required indicators — label suffix with field state',
    'Label icons — optional icon before label text',
    'Disabled state — full support for disabled state styling',
    'Reduced motion — respects prefers-reduced-motion',
  ],
  props: [
    {
      name: 'ref',
      type: 'React.Ref<HTMLInputElement>',
      description:
        'Ref forwarded to the underlying <input> element.',
    },
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
      description: 'Whether to visually hide the label (still accessible to screen readers).',
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
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the checkbox state changes.',
    },
    {
      name: 'onChangeAction',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void | Promise<void>',
      description:
        'Async action on change. Fires after onChange if not prevented. Shows loading spinner while pending.',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: 'Whether the checkbox is in a loading state. Shows spinner and prevents interaction.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the checkbox is disabled.',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: 'Whether the field is optional. Mutually exclusive with isRequired.',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: 'Whether the checkbox is required. Mutually exclusive with isOptional.',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: 'The size of the checkbox. sm for compact layouts, md for default.',
      default: "'md'",
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the checkbox receives focus.',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: 'Callback fired when the checkbox loses focus.',
    },
    {
      name: 'labelIcon',
      type: 'XDSIconType',
      description: 'Icon to display before the label text.',
    },
    {
      name: 'status',
      type: "{ type: 'error' | 'warning' | 'success', message: string }",
      description:
        'Status indicator. Displays a colored message box below the checkbox and sets aria-invalid for errors.',
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
    {
      label: 'Small size',
      code: `<XDSCheckboxInput
  label="Compact checkbox"
  value={checked}
  onChange={setChecked}
  size="sm"
/>`,
    },
    {
      label: 'With error status',
      code: `<XDSCheckboxInput
  label="Accept terms"
  value={false}
  onChange={setAccepted}
  status={{ type: 'error', message: 'You must accept the terms to continue' }}
/>`,
    },
    {
      label: 'Async action',
      code: `<XDSCheckboxInput
  label="Enable feature"
  value={enabled}
  onChange={setEnabled}
  onChangeAction={async (checked) => {
    await savePreference(checked);
  }}
/>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-checkbox-input', visualProps: ['size']},
      {className: 'xds-checkbox', states: ['checked', 'disabled']},
    ],
  },
  notes: [
    'Uses a hidden native <input type="checkbox"> for accessibility with a custom visual checkbox overlay.',
    'The visual checkbox responds to hover, focus, and checked states via ancestor selectors (stylex.when.ancestor).',
    'Label is clickable and properly associated with the input via htmlFor/id.',
    'Focus outline uses the standard XDS focus ring token.',
    'Interaction is blocked during busy state (loading or pending async action) to prevent double-toggling.',
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
    '尺寸——sm（紧凑）和 md（默认）',
    '异步操作——onChangeAction 带乐观更新和加载旋转器',
    '状态消息——错误、警告、成功验证反馈',
    '可选/必填指示器——带字段状态的标签后缀',
    '标签图标——标签文本前可选图标',
    '禁用状态——完整支持禁用状态样式',
    '减少动画——尊重 prefers-reduced-motion',
  ],
  props: [
    {
      name: 'ref',
      type: 'React.Ref<HTMLInputElement>',
      description: '转发至底层 <input> 元素的 ref。',
    },
    {
      name: 'label',
      type: 'string',
      description: '复选框的标签文本（始终为无障碍性而渲染）。',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: '是否视觉隐藏标签（屏幕阅读器仍可访问）。',
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
      description: '复选框是否为选中、未选中或不确定状态。',
      required: true,
    },
    {
      name: 'onChange',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void',
      description: '复选框状态变更时触发的回调。',
    },
    {
      name: 'onChangeAction',
      type: '(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void | Promise<void>',
      description: '异步变更操作。在 onChange 之后触发（未被阻止时）。等待期间显示加载旋转器。',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: '复选框是否处于加载状态。显示旋转器并阻止交互。',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: '复选框是否禁用。',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: '字段是否可选。与 isRequired 互斥。',
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: '复选框是否必填。与 isOptional 互斥。',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md'",
      description: '复选框尺寸。sm 用于紧凑布局，md 为默认。',
      default: "'md'",
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '复选框获得焦点时触发的回调。',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: '复选框失去焦点时触发的回调。',
    },
    {
      name: 'labelIcon',
      type: 'XDSIconType',
      description: '标签文本前显示的图标。',
    },
    {
      name: 'status',
      type: "{ type: 'error' | 'warning' | 'success', message: string }",
      description: '状态指示器。在复选框下方显示彩色消息框，错误时设置 aria-invalid。',
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
    {
      label: '紧凑尺寸',
      code: `<XDSCheckboxInput
  label="Compact checkbox"
  value={checked}
  onChange={setChecked}
  size="sm"
/>`,
    },
    {
      label: '错误状态',
      code: `<XDSCheckboxInput
  label="Accept terms"
  value={false}
  onChange={setAccepted}
  status={{ type: 'error', message: 'You must accept the terms to continue' }}
/>`,
    },
    {
      label: '异步操作',
      code: `<XDSCheckboxInput
  label="Enable feature"
  value={enabled}
  onChange={setEnabled}
  onChangeAction={async (checked) => {
    await savePreference(checked);
  }}
/>`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-checkbox-input', visualProps: ['size']},
      {className: 'xds-checkbox', states: ['checked', 'disabled']},
    ],
  },
  notes: [
    '使用隐藏的原生 <input type="checkbox"> 确保无障碍性，并覆盖自定义视觉复选框。',
    '视觉复选框通过祖先选择器（stylex.when.ancestor）响应悬停、焦点和选中状态。',
    '标签可点击，并通过 htmlFor/id 与输入框正确关联。',
    '焦点轮廓使用标准的 XDS 焦点环令牌。',
    '忙碌状态（加载中或异步操作等待中）期间阻止交互，防止重复切换。',
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'checkbox for toggling boolean values',
  features: [
    'accessible; always includes label (can be visually hidden)',
    'indeterminate state for "select all" patterns',
    'optional description text below label',
    'sizes: sm (compact), md (default)',
    'async actions w/ onChangeAction, optimistic updates, loading spinner',
    'status messages: error/warning/success validation',
    'optional/required field indicators',
    'label icons',
    'full disabled state styling',
    'respects prefers-reduced-motion',
  ],
  notes: [
    'hidden native <input type="checkbox"> w/ custom visual overlay',
    'visual checkbox responds to hover, focus, checked via ancestor selectors (stylex.when.ancestor)',
    'label clickable + associated via htmlFor/id',
    'focus outline uses XDS focus ring token',
    'interaction blocked during busy state to prevent double-toggling',
  ],
  propDescriptions: {
    ref: 'ref forwarded to underlying <input>',
    label: 'label text; always rendered for a11y',
    isLabelHidden: 'visually hide label (still accessible to screen readers)',
    description: 'text below label',
    value: 'checked, unchecked, or indeterminate',
    onChange: 'callback on state change',
    onChangeAction: 'async action; fires after onChange, shows spinner while pending',
    isLoading: 'shows spinner + prevents interaction',
    isDisabled: 'disable checkbox',
    isOptional: 'mark field as optional (mutually exclusive w/ isRequired)',
    isRequired: 'mark field as required (mutually exclusive w/ isOptional)',
    size: 'sm (compact) or md (default)',
    onFocus: 'callback on focus',
    onBlur: 'callback on blur',
    labelIcon: 'icon before label text',
    status: 'error/warning/success with message; sets aria-invalid on error',
  },
};
