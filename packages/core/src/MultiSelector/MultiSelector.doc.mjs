/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'MultiSelector',
  description:
    'Multi-select dropdown with checkboxes for choosing multiple items from a list. For small, finite sets like column toggles or filter facets — not a replacement for XDSTokenizer.',
  showcase: {
    aspectRatio: 4 / 3,
    code: '<XDSMultiSelector label="Tags" items={[]} />',
  },
  keywords: ['multiselect', 'checkbox', 'dropdown', 'multi', 'picker', 'checklist', 'facet', 'filter', 'select'],
  features: [
    'Checkbox-based multi-select — dropdown stays open on toggle',
    'Supports string items, object items with optional icon and disabled state, dividers, and labeled sections',
    'Optional select-all with indeterminate state',
    'Optional search filtering',
    'Three trigger display modes: count, labels, badges',
    'Integrates with XDS field conventions: label, description, isRequired, isOptional, isLabelHidden, status',
    'Size variants: sm, md, lg',
    'Full keyboard navigation with typeahead support',
    'Accessible — role="combobox" trigger, role="listbox" with aria-multiselectable, real checkbox inputs',
  ],
  keyboard:
    '↑↓ navigate, Enter/Space toggle, Escape close, Home/End jump, A-Z typeahead (when search not shown).',
  accessibility: [
    'Uses role="combobox" on the trigger button.',
    'Dropdown listbox uses aria-multiselectable="true".',
    'Each option uses role="option" with aria-selected.',
    'Real XDSCheckboxInput for each item — no fake checkboxes.',
    'Select-all checkbox rendered outside role="listbox".',
    'Search input uses role="searchbox" with aria-controls.',
  ],
  theming: {
    targets: [
      {className: 'xds-multi-selector', visualProps: ['size', 'status']},
    ],
  },
  components: [
    {
      name: 'XDSMultiSelector',
      description:
        'Multi-select dropdown with checkboxes for choosing multiple items.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Label text for accessibility.',
          required: true,
        },
        {
          name: 'options',
          type: 'XDSMultiSelectorOptionType[]',
          description:
            'Array of items — strings, objects with value/label/icon/disabled, dividers, or sections.',
          required: true,
        },
        {
          name: 'value',
          type: 'string[]',
          description: 'Currently selected values.',
          required: true,
        },
        {
          name: 'onChange',
          type: '(value: string[]) => void',
          description: 'Callback fired when the selection changes.',
          required: true,
        },
        {
          name: 'onChangeAction',
          type: '(value: string[]) => void | Promise<void>',
          description: 'Async action on change. Fires after onChange.',
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
          name: 'triggerDisplay',
          type: "'count' | 'labels' | 'badges'",
          description: 'How to display selected items in the trigger.',
          default: "'count'",
        },
        {
          name: 'maxBadges',
          type: 'number',
          description:
            'Maximum badges to show before "+N". Only for triggerDisplay="badges".',
          default: '3',
        },
        {
          name: 'hasSelectAll',
          type: 'boolean',
          description: 'Whether to show a select-all checkbox.',
        },
        {
          name: 'selectAllLabel',
          type: 'string',
          description: 'Label for the select-all checkbox.',
          default: "'Select all'",
        },
        {
          name: 'hasSearch',
          type: 'boolean',
          description: 'Whether to show a search input for filtering options.',
        },
        {
          name: 'searchPlaceholder',
          type: 'string',
          description: 'Placeholder text for the search input.',
          default: "'Search...'",
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
          name: 'isLoading',
          type: 'boolean',
          description: 'Shows a loading spinner in the trigger.',
        },
        {
          name: 'status',
          type: "{type: 'error' | 'warning' | 'success', message?: string}",
          description: 'Validation status with an optional message.',
        },
        {
          name: 'children',
          type: '(option: XDSMultiSelectorOptionData) => ReactNode',
          description: 'Custom render function for each option in the dropdown.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],    },
  ],
  usage: {
    summary: 'Multi-select dropdown with checkboxes for choosing multiple items from a list.',
    content: `## When to use

- Users need to select multiple values from a dropdown list.
- For small, finite sets of options use CheckboxList instead.`,
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  description: '带复选框的多选下拉框，用于从列表中选择多项。适用于列切换或筛选条件等小型有限集合，不适用于替代 XDSTokenizer。',
  features: [
    '基于复选框的多选——切换时下拉框保持打开',
    '支持字符串项、带可选图标和禁用状态的对象项、分隔线和标签分组',
    '可选全选，带不确定状态',
    '可选搜索过滤',
    '三种触发显示模式：计数、标签、徽章',
    '集成 XDS 字段规范：label、description、isRequired、isOptional、isLabelHidden、status',
    '尺寸变体：sm、md、lg',
    '完整键盘导航，支持预输入',
    '无障碍访问——role="combobox" 触发器，带 aria-multiselectable 的 role="listbox"，真实复选框输入',
  ],
  keyboard: '↑↓ 导航，Enter/空格切换，Escape 关闭，Home/End 跳转，A-Z 预输入（不显示搜索时）。',
  accessibility: [
    '触发按钮使用 role="combobox"。',
    '下拉列表框使用 aria-multiselectable="true"。',
    '每个选项使用带 aria-selected 的 role="option"。',
    '每项使用真实的 XDSCheckboxInput——无假复选框。',
    '全选复选框渲染在 role="listbox" 之外。',
    '搜索输入使用带 aria-controls 的 role="searchbox"。',
  ],
  components: [
    {
      name: 'XDSMultiSelector',
      description: '带复选框的多选下拉框，用于从列表中选择多项。',
      propDescriptions: {
        label: '无障碍标签文本。',
        options: '项目数组——字符串、带 value/label/icon/disabled 的对象、分隔线或分组。',
        value: '当前选中的值。',
        onChange: '选择变化时触发的回调。',
        onChangeAction: '变化时的异步操作，在 onChange 之后触发。',
        placeholder: '未选择值时显示的占位文本。',
        size: '选择器的尺寸变体。',
        triggerDisplay: '在触发器中显示选中项的方式。',
        maxBadges: '显示"+N"之前的最大徽章数。仅适用于 triggerDisplay="badges"。',
        hasSelectAll: '是否显示全选复选框。',
        selectAllLabel: '全选复选框的标签。',
        hasSearch: '是否显示用于过滤选项的搜索输入。',
        searchPlaceholder: '搜索输入的占位文本。',
        isDisabled: '禁用选择器。',
        isLabelHidden: '视觉上隐藏标签同时保持其可访问性。',
        description: '标签下方显示的辅助文本。',
        isOptional: '将字段标记为可选。',
        isRequired: '将字段标记为必填。',
        isLoading: '在触发器中显示加载旋转器。',
        status: '带可选消息的验证状态。',
        children: '每个选项的自定义渲染函数。',
        xstyle: '布局自定义的 StyleX 样式，必须是 stylex.create() 值。',
      },
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'checkbox multi-select dropdown for finite sets like column toggles or filter facets',
  features: [
    'checkbox multi-select; dropdown stays open on toggle',
    'strings, objects w/ icon+disabled, dividers, sections',
    'optional select-all w/ indeterminate state',
    'optional search filtering',
    'trigger modes: count, labels, badges',
    'XDS field: label, description, isRequired, isOptional, isLabelHidden, status',
    'sizes: sm, md, lg',
    'full keyboard nav w/ typeahead',
    'a11y: role="combobox" trigger, listbox w/ aria-multiselectable, real checkboxes',
  ],
  keyboard: '↑↓ nav, Enter/Space toggle, Escape close, Home/End jump, A-Z typeahead (no search).',
  accessibility: [
    'role="combobox" on trigger.',
    'aria-multiselectable="true" on listbox.',
    'role="option" w/ aria-selected per option.',
    'real XDSCheckboxInput per item.',
    'select-all outside role="listbox".',
    'role="searchbox" w/ aria-controls on search.',
  ],
  components: [
    {
      name: 'XDSMultiSelector',
      description: 'checkbox multi-select dropdown',
      propDescriptions: {
        label: 'a11y label',
        options: 'items: strings, objects w/ value/label/icon/disabled, dividers, sections',
        value: 'selected values',
        onChange: 'callback on selection change',
        onChangeAction: 'async; fires after onChange',
        placeholder: 'text when nothing selected',
        size: 'size variant',
        triggerDisplay: 'how to show selected in trigger',
        maxBadges: 'max badges before "+N"; badges mode only',
        hasSelectAll: 'show select-all checkbox',
        selectAllLabel: 'select-all label',
        hasSearch: 'show search input',
        searchPlaceholder: 'search placeholder',
        isDisabled: 'disables selector',
        isLabelHidden: 'visually hides label',
        description: 'helper text below label',
        isOptional: 'marks optional',
        isRequired: 'marks required',
        isLoading: 'spinner in trigger',
        status: 'validation status w/ optional message',
        children: 'custom render fn per option',
        xstyle: 'StyleX layout styles; stylex.create() only',
      },
    },
  ],
};
