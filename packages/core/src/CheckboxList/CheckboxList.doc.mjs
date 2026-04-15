/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'CheckboxList',
  description:
    'A checkbox group component for multi-value selection from a list of options. Supports collection mode (parent-managed state) and standalone mode (per-item state).',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSCheckboxList label="Options" items={[{label: "Option A", value: "a"}]} />',
  },
  keywords: ["checkboxlist","checkbox","checkboxgroup","multichoice","multiselect","checklist"],
  features: [
    'Accessible — uses native <input type="checkbox"> with proper ARIA attributes',
    'Collection mode — parent manages selected values as string[], items derive checked state',
    'Standalone mode — individual items use isChecked/onCheck for independent control',
    'Density — compact, balanced, spacious via XDSList integration',
    'Dividers — optional border dividers between items',
    'Indeterminate — supports three-state checkbox (true, false, indeterminate) in standalone mode',
    'Descriptions — optional secondary text per item',
    'End content — slot for badges, actions, or other content after the label',
    'Disabled state — supports disabling the entire group or individual items',
    'Async actions — onChangeAction with optimistic updates and busy state',
    'Full-row click — clicking anywhere on the row toggles the checkbox',
    'Field integration — uses XDSField for label, description, and status messaging',
  ],
  notes: [
    'XDSCheckboxList composes XDSField (label, description, status) and XDSList (density, dividers)',
    'XDSCheckboxListItem can be used inside XDSCheckboxList (collection mode) or XDSList (standalone mode)',
    'In collection mode, XDSCheckboxListItem requires a `value` prop — throws if missing',
    'Uses XDSCheckboxInput internally with isLabelHidden for the checkbox visual',
    'Full-row click target with guard against interactive endContent children',
    'Async actions use useOptimistic + useTransition for immediate visual feedback',
    'Density maps to checkbox size: compact → sm, balanced/spacious → md',
  ],
  components: [
    {
      name: 'XDSCheckboxList',
      description:
        'Checkbox group container with field integration for label, description, and status.',      props: [
        {
          name: 'label',
          type: 'string',
          description:
            'Label text for the checkbox group (always rendered for accessibility).',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'XDSCheckboxListItem elements.',
          required: true,
        },
        {
          name: 'value',
          type: 'string[]',
          description: 'The currently selected values (collection mode).',
        },
        {
          name: 'onChange',
          type: '(values: string[]) => void',
          description: 'Callback fired when the selected values change.',
        },
        {
          name: 'onChangeAction',
          type: '(values: string[]) => void | Promise<void>',
          description: 'Async action on change with optimistic updates.',
        },
        {
          name: 'isLoading',
          type: 'boolean',
          description: 'External loading state.',
          default: 'false',
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
          name: 'density',
          type: "'compact' | 'balanced' | 'spacious'",
          description: 'Spacing density for list items.',
          default: "'balanced'",
        },
        {
          name: 'hasDividers',
          type: 'boolean',
          description: 'Whether to show dividers between items.',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether all checkbox items are disabled.',
          default: 'false',
        },
        {
          name: 'status',
          type: 'XDSInputStatus',
          description: 'Status indicator ({ type, message }).',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
    },
    {
      name: 'XDSCheckboxListItem',
      description:
        'Individual checkbox item with label, description, and end content slot. Works in collection mode (inside XDSCheckboxList) or standalone mode (inside XDSList).',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Primary text label for the item.',
          required: true,
        },
        {
          name: 'value',
          type: 'string',
          description: 'Identity key (required inside XDSCheckboxList).',
        },
        {
          name: 'description',
          type: 'string',
          description: 'Secondary text below the label.',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: 'Content rendered after the label area.',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Whether this individual item is disabled.',
          default: 'false',
        },
        {
          name: 'isChecked',
          type: "boolean | 'indeterminate'",
          description: 'Direct checked state (standalone mode only).',
        },
        {
          name: 'onCheck',
          type: '(checked: boolean) => void',
          description: 'Direct check handler (standalone mode only).',
        },
      ],
    },
  ],
  usage: {
    summary: 'A checkbox group for multi-value selection from a list of options.',
    content: `## When to use

- Users need to select multiple options from a set.
- All options should be visible at once.

## When NOT to use

- Only one option can be selected (use RadioList instead).
- The option list is very long (consider MultiSelector instead).`,
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'CheckboxList',
  description:
    '用于从选项列表中进行多值选择的复选框组组件。支持集合模式（父组件管理状态）和独立模式（逐项状态）。',
  features: [
    '无障碍 - 使用原生 <input type="checkbox">，配合正确的 ARIA 属性',
    '集合模式 - 父组件将选中值管理为 string[]，子项派生选中状态',
    '独立模式 - 各项使用 isChecked/onCheck 进行独立控制',
    '密度 - 通过 XDSList 集成支持紧凑、平衡、宽敞三种密度',
    '分隔线 - 列表项之间的可选边框分隔线',
    '不确定状态 - 独立模式下支持三态复选框（true、false、indeterminate）',
    '描述 - 每个选项可选的辅助文本',
    '尾部内容 - 标签后的徽章、操作或其他内容插槽',
    '禁用状态 - 支持禁用整个组或单个选项',
    '异步操作 - onChangeAction 配合乐观更新和忙碌状态',
    '全行点击 - 点击行中任意位置均可切换复选框',
    '字段集成 - 使用 XDSField 提供标签、描述和状态消息',
  ],

  notes: [
    'XDSCheckboxList 组合 XDSField（标签、描述、状态）和 XDSList（密度、分隔线）',
    'XDSCheckboxListItem 可在 XDSCheckboxList（集合模式）或 XDSList（独立模式）内使用',
    '在集合模式下，XDSCheckboxListItem 需要 `value` 属性——缺失时会抛出错误',
    '内部使用带 isLabelHidden 的 XDSCheckboxInput 作为复选框视觉元素',
    '全行点击目标，带有对交互式尾部内容子元素的防护',
    '异步操作使用 useOptimistic + useTransition 实现即时视觉反馈',
    '密度映射到复选框尺寸：compact → sm，balanced/spacious → md',
  ],
  components: [
    {
      name: 'XDSCheckboxList',
      description:
        '复选框组容器，集成字段功能，支持标签、描述和状态。',
      props: [
        {
          name: 'label',
          type: 'string',
          description:
            '复选框组的标签文本（始终渲染以确保无障碍可访问性）。',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'XDSCheckboxListItem 元素。',
          required: true,
        },
        {
          name: 'value',
          type: 'string[]',
          description: '当前选中的值（集合模式）。',
        },
        {
          name: 'onChange',
          type: '(values: string[]) => void',
          description: '选中值变更时触发的回调函数。',
        },
        {
          name: 'onChangeAction',
          type: '(values: string[]) => void | Promise<void>',
          description: '变更时的异步操作，配合乐观更新。',
        },
        {
          name: 'isLoading',
          type: 'boolean',
          description: '外部加载状态。',
          default: 'false',
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
          name: 'density',
          type: "'compact' | 'balanced' | 'spacious'",
          description: '列表项的间距密度。',
          default: "'balanced'",
        },
        {
          name: 'hasDividers',
          type: 'boolean',
          description: '是否在选项之间显示分隔线。',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '是否禁用所有复选框选项。',
          default: 'false',
        },
        {
          name: 'status',
          type: 'XDSInputStatus',
          description: '状态指示器（{ type, message }）。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式。必须是 stylex.create() 的值。',
        },
      ],
    },
    {
      name: 'XDSCheckboxListItem',
      description:
        '单个复选框选项，包含标签、描述和尾部内容插槽。可在集合模式或独立模式下使用。',
      props: [
        {
          name: 'label',
          type: 'string',
          description: '选项的主要文本标签。',
          required: true,
        },
        {
          name: 'value',
          type: 'string',
          description: '标识键（在 XDSCheckboxList 内为必填）。',
        },
        {
          name: 'description',
          type: 'string',
          description: '标签下方的辅助文本。',
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: '在标签区域后渲染的内容。',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '是否禁用此单个选项。',
          default: 'false',
        },
        {
          name: 'isChecked',
          type: "boolean | 'indeterminate'",
          description: '直接选中状态（仅独立模式）。',
        },
        {
          name: 'onCheck',
          type: '(checked: boolean) => void',
          description: '直接选中处理器（仅独立模式）。',
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Checkbox group component for multi-value selection. Collection mode (parent state) + standalone mode (per-item state).',
  features: [
    'Accessible; uses native <input type="checkbox"> w/ proper ARIA attributes',
    'Collection mode; parent manages selected values as string[]',
    'Standalone mode; items use isChecked/onCheck independently',
    'Density; compact, balanced, spacious via XDSList',
    'Dividers; optional border dividers between items',
    'Indeterminate; three-state checkbox in standalone mode',
    'End content; slot for badges/actions after label',
    'Disabled state; group-level or individual',
    'Async actions; onChangeAction w/ optimistic updates + busy state',
    'Full-row click; toggles checkbox, guards interactive endContent',
    'Field integration; XDSField for label, description, status',
  ],
  notes: [
    'XDSCheckboxList composes XDSField (label, description, status) + XDSList (density, dividers)',
    'XDSCheckboxListItem works inside XDSCheckboxList (collection) or XDSList (standalone)',
    'Collection mode requires `value` prop on items; throws if missing',
    'Uses XDSCheckboxInput w/ isLabelHidden for checkbox visual',
    'Full-row click target w/ guard against interactive endContent children',
    'Async uses useOptimistic + useTransition for immediate feedback',
    'Density maps to checkbox size: compact → sm, balanced/spacious → md',
  ],
  components: [
    {
      name: 'XDSCheckboxList',
      description:
        'Checkbox group container w/ field integration for label, description, status.',
      propDescriptions: {
        label: 'Label text for checkbox group (always rendered for accessibility).',
        children: 'XDSCheckboxListItem elements.',
        value: 'Currently selected values (collection mode).',
        onChange: 'Callback fired when selected values change.',
        onChangeAction: 'Async action on change w/ optimistic updates.',
        isLoading: 'External loading state.',
        isLabelHidden: 'Whether to visually hide label.',
        description: 'Description text below label.',
        density: 'Spacing density for list items.',
        hasDividers: 'Whether to show dividers between items.',
        isDisabled: 'Whether all checkbox items disabled.',
        status: 'Status indicator ({ type, message }).',
        xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
      },
    },
    {
      name: 'XDSCheckboxListItem',
      description:
        'Individual checkbox item w/ label, description, end content slot.',
      propDescriptions: {
        label: 'Primary text label for item.',
        value: 'Identity key (required inside XDSCheckboxList).',
        description: 'Secondary text below label.',
        endContent: 'Content rendered after label area.',
        isDisabled: 'Whether this individual item disabled.',
        isChecked: 'Direct checked state (standalone mode only).',
        onCheck: 'Direct check handler (standalone mode only).',
      },
    },
  ],
};
