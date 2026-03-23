/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Selector',
  description:
    'Dropdown selector for choosing from a list of options. Follows XDS input conventions with label, status, and field props.',
  features: [
    'Supports string items (auto-converted to {value, label}), object items with optional icon and disabled state, dividers, and labeled sections',
    'Custom item rendering via children render prop and XDSSelectorItem helper',
    'Integrates with XDS field conventions: label, description, isRequired, isOptional, isLabelHidden, status',
    'Size variants: sm, md, lg',
    'Full keyboard navigation with typeahead support',
    'Accessible — role="combobox" trigger, role="listbox" dropdown, role="group" for sections, aria-activedescendant for focus',
  ],
  keyboard:
    '↑↓ navigate, Enter/Space select, Escape close, Home/End jump, A-Z typeahead.',
  accessibility: [
    'Uses role="combobox" on the trigger button.',
    'Dropdown uses role="listbox".',
    'Section groups use role="group".',
    'aria-activedescendant tracks the focused option.',
  ],
  theming: {
    targets: [
      {className: 'xds-selector', visualProps: ['size', 'status']},
      {className: 'xds-selector-option'},
    ],
  },
  examples: [
    {
      label: 'Basic',
      code: `<XDSSelector
  label="Fruit"
  options={['Apple', 'Banana', 'Orange']}
  value={value}
  onChange={setValue}
/>`,
    },
    {
      label: 'With object items (icon, disabled)',
      code: `<XDSSelector
  label="Settings"
  options={[
    {value: 'profile', label: 'Profile', icon: UserIcon},
    {value: 'settings', label: 'Settings', icon: CogIcon, disabled: true},
  ]}
  value={value}
  onChange={setValue}
/>`,
    },
    {
      label: 'Sections',
      code: `<XDSSelector
  label="Fruit"
  options={[
    {value: 'apple', label: 'Apple'},
    {type: 'section', title: 'Citrus', items: [
      {value: 'orange', label: 'Orange'},
    ]},
  ]}
  value={value}
  onChange={setValue}
/>`,
    },
    {
      label: 'Custom rendering with XDSSelectorItem',
      code: `<XDSSelector label="User" options={users} value={value} onChange={setValue}>
  {user => (
    <XDSSelectorItem
      icon={UserIcon}
      label={user.label}
      description={user.email}
    />
  )}
</XDSSelector>`,
    },
    {
      label: 'With status and field props',
      code: `<XDSSelector
  label="Fruit"
  isRequired
  status={{type: 'error', message: 'Required'}}
  options={['Apple', 'Banana']}
  value={value}
  onChange={setValue}
/>`,
    },
  ],
  components: [
    {
      name: 'XDSSelector',
      description: 'Dropdown selector for choosing from a list of options.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Label text for accessibility.',
          required: true,
        },
        {
          name: 'options',
          type: 'XDSSelectorOption[]',
          description:
            'Array of items — strings, objects with value/label/icon/disabled, dividers ({type: "divider"}), or sections ({type: "section", title, items}).',
          required: true,
        },
        {
          name: 'value',
          type: 'string',
          description: 'Currently selected value.',
        },
        {
          name: 'onChange',
          type: '(value: string) => void',
          description: 'Callback fired when the selection changes.',
        },
        {
          name: 'placeholder',
          type: 'string',
          description: 'Placeholder text shown when no value is selected.',
          default: "'Select...'",
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          description: 'Size variant for the selector.',
          default: "'md'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Disables the selector.',
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
          name: 'status',
          type: "{type: 'error' | 'warning' | 'success', message?: string}",
          description: 'Validation status with an optional message.',
        },
        {
          name: 'children',
          type: '(item: XDSSelectorItemData) => ReactNode',
          description: 'Custom render function for each item in the dropdown.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: `<XDSSelector
  label="Fruit"
  options={['Apple', 'Banana', 'Orange']}
  value={value}
  onChange={setValue}
/>`,
        },
        {
          label: 'With object items',
          code: `<XDSSelector
  label="Settings"
  options={[
    {value: 'profile', label: 'Profile', icon: UserIcon},
    {value: 'settings', label: 'Settings', icon: CogIcon, disabled: true},
  ]}
  value={value}
  onChange={setValue}
/>`,
        },
      ],
    },
    {
      name: 'XDSSelectorItem',
      description:
        'Helper component for custom item rendering inside an XDSSelector children render prop.',
      props: [
        {
          name: 'label',
          type: 'ReactNode',
          description: 'Primary label text for the item.',
          required: true,
        },
        {
          name: 'icon',
          type: 'XDSIconType',
          description: 'Icon displayed before the label.',
        },
        {
          name: 'description',
          type: 'ReactNode',
          description: 'Secondary description text displayed below the label.',
        },
      ],
      examples: [
        {
          label: 'Custom item rendering',
          code: `<XDSSelector label="User" options={users} value={value} onChange={setValue}>
  {user => (
    <XDSSelectorItem
      icon={UserIcon}
      label={user.label}
      description={user.email}
    />
  )}
</XDSSelector>`,
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Selector',
  description:
    '用于从选项列表中进行选择的下拉选择器。遵循 XDS 输入规范，支持标签、状态和字段属性。',
  features: [
    '支持字符串选项（自动转换为 {value, label}）、带可选图标和禁用状态的对象选项、分隔线和带标签的分组',
    '通过 children 渲染函数和 XDSSelectorItem 辅助组件实现自定义选项渲染',
    '集成 XDS 字段规范：label、description、isRequired、isOptional、isLabelHidden、status',
    '尺寸变体：sm、md、lg',
    '完整的键盘导航，支持输入快速定位',
    '无障碍 - 触发器使用 role="combobox"，下拉菜单使用 role="listbox"，分组使用 role="group"，焦点追踪使用 aria-activedescendant',
  ],
  keyboard:
    '↑↓ 导航，Enter/Space 选择，Escape 关闭，Home/End 跳转，A-Z 输入快速定位。',
  accessibility: [
    '触发按钮使用 role="combobox"。',
    '下拉菜单使用 role="listbox"。',
    '分组使用 role="group"。',
    'aria-activedescendant 追踪当前聚焦的选项。',
  ],
  theming: {
    targets: [
      {className: 'xds-selector', visualProps: ['size', 'status']},
      {className: 'xds-selector-option'},
    ],
  },
  examples: [
    {
      label: '基础用法',
      code: `<XDSSelector
  label="Fruit"
  options={['Apple', 'Banana', 'Orange']}
  value={value}
  onChange={setValue}
/>`,
    },
    {
      label: '对象选项（图标、禁用）',
      code: `<XDSSelector
  label="Settings"
  options={[
    {value: 'profile', label: 'Profile', icon: UserIcon},
    {value: 'settings', label: 'Settings', icon: CogIcon, disabled: true},
  ]}
  value={value}
  onChange={setValue}
/>`,
    },
    {
      label: '分组',
      code: `<XDSSelector
  label="Fruit"
  options={[
    {value: 'apple', label: 'Apple'},
    {type: 'section', title: 'Citrus', items: [
      {value: 'orange', label: 'Orange'},
    ]},
  ]}
  value={value}
  onChange={setValue}
/>`,
    },
    {
      label: '使用 XDSSelectorItem 自定义渲染',
      code: `<XDSSelector label="User" options={users} value={value} onChange={setValue}>
  {user => (
    <XDSSelectorItem
      icon={UserIcon}
      label={user.label}
      description={user.email}
    />
  )}
</XDSSelector>`,
    },
    {
      label: '带状态和字段属性',
      code: `<XDSSelector
  label="Fruit"
  isRequired
  status={{type: 'error', message: 'Required'}}
  options={['Apple', 'Banana']}
  value={value}
  onChange={setValue}
/>`,
    },
  ],
  components: [
    {
      name: 'XDSSelector',
      description: '用于从选项列表中进行选择的下拉选择器。',
      props: [
        {
          name: 'label',
          type: 'string',
          description: '无障碍标签文本。',
          required: true,
        },
        {
          name: 'options',
          type: 'XDSSelectorOption[]',
          description:
            '选项数组 - 字符串、带 value/label/icon/disabled 的对象、分隔线（{type: "divider"}）或分组（{type: "section", title, items}）。',
          required: true,
        },
        {
          name: 'value',
          type: 'string',
          description: '当前选中的值。',
        },
        {
          name: 'onChange',
          type: '(value: string) => void',
          description: '选择变更时触发的回调函数。',
        },
        {
          name: 'placeholder',
          type: 'string',
          description: '未选择值时显示的占位文本。',
          default: "'Select...'",
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          description: '选择器的尺寸变体。',
          default: "'md'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '禁用选择器。',
        },
        {
          name: 'isLabelHidden',
          type: 'boolean',
          description: '视觉上隐藏标签，同时保持无障碍可访问性。',
        },
        {
          name: 'description',
          type: 'string',
          description: '显示在标签下方的辅助文本。',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description: '将字段标记为可选。',
        },
        {
          name: 'isRequired',
          type: 'boolean',
          description: '将字段标记为必填。',
        },
        {
          name: 'status',
          type: "{type: 'error' | 'warning' | 'success', message?: string}",
          description: '验证状态，附带可选消息。',
        },
        {
          name: 'children',
          type: '(item: XDSSelectorItemData) => ReactNode',
          description: '下拉菜单中每个选项的自定义渲染函数。',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            '用于布局自定义的 StyleX 样式（边距、定位、尺寸）。必须是 stylex.create() 的值，而非内联样式对象如 style={{}}。',
        },
      ],
      examples: [
        {
          label: '基础用法',
          code: `<XDSSelector
  label="Fruit"
  options={['Apple', 'Banana', 'Orange']}
  value={value}
  onChange={setValue}
/>`,
        },
        {
          label: '对象选项',
          code: `<XDSSelector
  label="Settings"
  options={[
    {value: 'profile', label: 'Profile', icon: UserIcon},
    {value: 'settings', label: 'Settings', icon: CogIcon, disabled: true},
  ]}
  value={value}
  onChange={setValue}
/>`,
        },
      ],
    },
    {
      name: 'XDSSelectorItem',
      description:
        '用于在 XDSSelector 的 children 渲染函数中自定义选项渲染的辅助组件。',
      props: [
        {
          name: 'label',
          type: 'ReactNode',
          description: '选项的主标签文本。',
          required: true,
        },
        {
          name: 'icon',
          type: 'XDSIconType',
          description: '显示在标签前的图标。',
        },
        {
          name: 'description',
          type: 'ReactNode',
          description: '显示在标签下方的次要描述文本。',
        },
      ],
      examples: [
        {
          label: '自定义选项渲染',
          code: `<XDSSelector label="User" options={users} value={value} onChange={setValue}>
  {user => (
    <XDSSelectorItem
      icon={UserIcon}
      label={user.label}
      description={user.email}
    />
  )}
</XDSSelector>`,
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Dropdown selector for choosing from list of options. Follows XDS input conventions w/ label, status, field props.',
  features: [
    'Supports string items (auto-converted to {value, label}), object items w/ optional icon + disabled state, dividers, labeled sections',
    'Custom item rendering via children render prop + XDSSelectorItem helper',
    'Integrates w/ XDS field conventions: label, description, isRequired, isOptional, isLabelHidden, status',
    'Size variants: sm, md, lg',
    'Full keyboard navigation w/ typeahead support',
    'Accessible; role="combobox" trigger, role="listbox" dropdown, role="group" for sections, aria-activedescendant for focus',
  ],
  keyboard:
    '\u2191\u2193 navigate, Enter/Space select, Escape close, Home/End jump, A-Z typeahead.',
  accessibility: [
    'Uses role="combobox" on trigger button.',
    'Dropdown uses role="listbox".',
    'Section groups use role="group".',
    'aria-activedescendant tracks focused option.',
  ],
  components: [
    {
      name: 'XDSSelector',
      description: 'Dropdown selector for choosing from list of options.',
      propDescriptions: {
        label: 'Label text for accessibility.',
        options: 'Array of items; strings, objects w/ value/label/icon/disabled, dividers ({type: "divider"}), sections ({type: "section", title, items}).',
        value: 'Currently selected value.',
        onChange: 'Callback fired when selection changes.',
        placeholder: 'Placeholder text when no value selected.',
        size: 'Size variant for selector.',
        isDisabled: 'Disables selector.',
        isLabelHidden: 'Visually hides label while keeping accessible.',
        description: 'Helper text below label.',
        isOptional: 'Marks field optional.',
        isRequired: 'Marks field required.',
        status: 'Validation status w/ optional message.',
        children: 'Custom render function for each dropdown item.',
        xstyle: 'StyleX styles for layout customization. Must be stylex.create() value.',
      },
    },
    {
      name: 'XDSSelectorItem',
      description:
        'Helper component for custom item rendering inside XDSSelector children render prop.',
      propDescriptions: {
        label: 'Primary label text for item.',
        icon: 'Icon displayed before label.',
        description: 'Secondary description text below label.',
      },
    },
  ],
};
