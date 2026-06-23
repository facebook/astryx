// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'MultiSelector',
  displayName: 'Multi Selector',
  group: 'Selector',
  category: 'Data Input',
  keywords: [
    'multiselect',
    'checkbox',
    'dropdown',
    'multi',
    'picker',
    'checklist',
    'facet',
    'filter',
    'select',
  ],
  theming: {
    targets: [
      {className: 'astryx-multi-selector', visualProps: ['size', 'status']},
    ],
  },
  components: [
    {
      name: 'MultiSelector',
      displayName: 'Multi Selector',
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
          type: 'MultiSelectorOptionType[]',
          description:
            'Array of items: strings, objects with value/label/icon/disabled, dividers, or sections.',
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
          name: 'changeAction',
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
          name: 'renderOption',
          type: '(option: MultiSelectorOptionData) => ReactNode',
          description:
            'Custom render function for each selectable option in the dropdown. Not called for dividers, sections, or the select-all row.',
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
      'A checkbox dropdown for selecting multiple values from a list. Selected items can display as a count, labels, or badges. Use it for filtering or when presenting a finite set of options where multiple choices are needed.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use for a moderate, finite set of options where multiple choices are needed.',
      },
      {
        guidance: true,
        description:
          'Enable search filtering when the list exceeds ~15 options.',
      },
      {
        guidance: true,
        description:
          'Use renderOption for custom option rows; the checkbox affordance remains owned by MultiSelector.',
      },
      {
        guidance: true,
        description:
          'Enable select-all when most users will want all or nearly all options selected.',
      },
      {
        guidance: false,
        description: 'Use for single-value selection; use Selector instead.',
      },
      {
        guidance: false,
        description: 'Show more than ~20 options without enabling search.',
      },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  components: [
    {
      name: 'MultiSelector',
      displayName: 'Multi Selector',
      description: '带复选框的多选下拉框，用于从列表中选择多项。',
      propDescriptions: {
        label: '无障碍标签文本。',
        options:
          '项目数组——字符串、带 value/label/icon/disabled 的对象、分隔线或分组。',
        value: '当前选中的值。',
        onChange: '选择变化时触发的回调。',
        changeAction: '变化时的异步操作，在 onChange 之后触发。',
        placeholder: '未选择值时显示的占位文本。',
        size: '选择器的尺寸变体。',
        triggerDisplay: '在触发器中显示选中项的方式。',
        maxBadges:
          '显示"+N"之前的最大徽章数。仅适用于 triggerDisplay="badges"。',
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
        renderOption:
          '每个可选选项的自定义渲染函数。不会用于分隔线、分组或全选行。',
        xstyle: '布局自定义的 StyleX 样式，必须是 stylex.create() 值。',
      },
    },
  ],
  usage: {
    description:
      'A checkbox dropdown for selecting multiple values from a list. Selected items can display as a count, labels, or badges. Use it for filtering or when presenting a finite set of options where multiple choices are needed.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use for a moderate, finite set of options where multiple choices are needed.',
      },
      {
        guidance: true,
        description:
          'Enable search filtering when the list exceeds ~15 options.',
      },
      {
        guidance: true,
        description:
          'Use renderOption for custom option rows; the checkbox affordance remains owned by MultiSelector.',
      },
      {
        guidance: true,
        description:
          'Enable select-all when most users will want all or nearly all options selected.',
      },
      {
        guidance: false,
        description: 'Use for single-value selection; use Selector instead.',
      },
      {
        guidance: false,
        description: 'Show more than ~20 options without enabling search.',
      },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'checkbox multi-select dropdown for finite sets like column toggles or filter facets',
  usage: {
    description:
      'A checkbox dropdown for selecting multiple values from a list. Selected items can display as a count, labels, or badges. Use it for filtering or when presenting a finite set of options where multiple choices are needed.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use for a moderate, finite set of options where multiple choices are needed.',
      },
      {
        guidance: true,
        description:
          'Enable search filtering when the list exceeds ~15 options.',
      },
      {
        guidance: true,
        description:
          'renderOption for custom rows; checkbox affordance stays owned by MultiSelector.',
      },
      {
        guidance: true,
        description:
          'Enable select-all when most users will want all or nearly all options selected.',
      },
      {
        guidance: false,
        description: 'Use for single-value selection; use Selector instead.',
      },
      {
        guidance: false,
        description: 'Show more than ~20 options without enabling search.',
      },
    ],
  },
  components: [
    {
      name: 'MultiSelector',
      displayName: 'Multi Selector',
      description: 'checkbox multi-select dropdown',
      propDescriptions: {
        label: 'a11y label',
        options:
          'items: strings, objects w/ value/label/icon/disabled, dividers, sections',
        value: 'selected values',
        onChange: 'callback on selection change',
        changeAction: 'async; fires after onChange',
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
        renderOption:
          'custom render fn per selectable option; not dividers/sections/select-all',
        xstyle: 'StyleX layout styles; stylex.create() only',
      },
    },
  ],
};
